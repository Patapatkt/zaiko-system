"use server";

import { db } from "@/db";
import { products, stockHistories } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm"
import { redirect } from "next/navigation";
import { requireAdmin } from "@/utils/auth";

// state(状態)の型定義
export type updateStockState = {
    error: string;
} | null;

export type StockAdjustmentState = {
    error: string;
} | null;

// 在庫修正時のバックエンド
export async function updateStock(
    id: number,//引数:idは一意の為、商品名を確実に絞り込める
    _previousState: updateStockState,//前回の処理結果(今回は使わないので_をつけている)
    formData: FormData//引数:formDataを型として引数に設定
): Promise<updateStockState> {//Promiseを返す関数の型を定義
    const user =
        await requireAdmin();

    const quantity = Number(formData.get("quantity"));//formDataよりquantity(増減値)を取得
    const operation = formData.get("operation");
    const reason = String(formData.get("reason") ?? "").trim();
    const memo = String(formData.get("memo") ?? "").trim();/// 任意の補足メモを取得
    //returnでエラーを返すことで、フロント側でエラー表示が可能になる
    if (!Number.isFinite(quantity)) {
        return { error: "入出庫数は数値を入力してください" };
    }

    if (!Number.isSafeInteger(quantity)) {
        return { error: "入出庫数は扱える範囲の整数を入力してください" };
    }

    if (quantity <= 0) {
        return { error: "入出庫数は1以上を入力してください" };
    }

    if (operation !== "IN" && operation !== "OUT") {
        return { error: "入庫または出庫を選択してください" };
    }

    const product = await db.query.products.findFirst({//DBからproduct(テーブルを取得)
        where: eq(products.id, id),
    });

    if (!reason) {
        return { error: "在庫数変更理由を選択してください" };
    }

    const historyMemo =
        memo
            ? `${reason}：${memo}`
            : reason;

    if (!product) {
        return { error: "商品が見つかりません" };
    }
    // 廃却済商品は修正できない
    if (product.deletedAt) {
        return { error: "廃却済みの商品です。入出庫はできません" };
    }

    // 入庫ならプラス、出庫ならマイナスに変換
    const stockDifference =
        operation === "IN"
            ? quantity
            : -quantity;

    const newStock = product.stock + stockDifference;

    if(!Number.isSafeInteger(newStock)) {
        return { error: "変更後の在庫数が扱える範囲を超えています" };
    }

    if (
        newStock < 0) {
        return { error: "在庫が不足してしまいます" };
    }
    try {//トランザクション機能による更新(どちらかがダメだと実行されない)
        //在庫修正後の更新
        await db.transaction(async (tx) => {
            const [updatedProduct] = await tx
                .update(products)
                .set({
                    stock: newStock,
                })
                .where(and(
                    eq(products.id, id),//条件１、商品IDが一致している場合
                    isNull(products.deletedAt),//条件２、廃却済みでない場合
                    eq(products.stock, product.stock)//条件３、在庫数が変わっていない場合   
                ))
                .returning({ id: products.id });
            // 既に更新されてた場合のエラー報告(ここで処理を止める)
            if (!updatedProduct) {
                throw new Error(
                    "商品が廃却されたか、在庫数が変更されています。再確認してください。"
                );
            }
                // 入出庫履歴に追記
                await tx.insert(stockHistories).values({
                productId: id,
                userId: user.id,
                quantity: stockDifference,
                type: operation,
                memo: historyMemo,
            })
        })
    } catch (error) {
        console.error(error);
        return { error: "在庫修正に失敗しました。" };
    }
    redirect("/inventory");//結果をredirectでinventoryに表示
}

// 棚卸機能のバックエンド
export async function adjustStock(
    id: number,
    _previousState: StockAdjustmentState,//前回の処理結果(今回は使わないので_をつけている)
    formData: FormData//今回、送信された入力値
): Promise<StockAdjustmentState> {//Promiseを返す関数の型を定義
    const user =
        await requireAdmin();
    const actualStockValue = formData.get("actualStock");
    if (//actualStockValueがstring型でない、または空文字の場合、エラー報告
        typeof actualStockValue !== "string" ||
        actualStockValue.trim() === ""
    ) {
        return { error: "実在庫数を入力してください" };
    }

    const actualStock = Number(actualStockValue);
    const memo = String(formData.get("memo") ?? "").trim();

    //returnでエラーを返すことで、フロント側でエラー表示が可能になる
    if (!Number.isFinite(actualStock)) {
        return { error: "実在庫数は数値を入力してください" };
    }

    if (!Number.isSafeInteger(actualStock)) {
        return { error: "実在庫数は扱える範囲の整数を入力してください" };
    }

    if (actualStock < 0) {
        return { error: "実在庫数にマイナスは入力できません" };
    }

    if (!memo) {
        return { error: "棚卸理由を入力してください" };
    }

    const product = await db.query.products.findFirst({
        where: eq(products.id, id),//DBからidが一致している商品を探す
    });

    if (!product) {
        return { error: "商品が見つかりません。" };
    }

    if (product.deletedAt) {
        return {
            error: "廃却済みの商品です。棚卸はできません。",
        };
    }

    const difference = actualStock - product.stock;//実在庫数と登録在庫の差分
    //トランザクション機能による更新(どちらかがダメだと実行されない)
    //条件１、在庫テーブルの在庫数を棚卸数更新    
    try {
        await db.transaction(async (tx) => {
            const [updatedProduct] = await tx
                .update(products)
                .set({
                    stock: actualStock,
                })
                .where(
                    and(
                        eq(products.id, id),//条件１、商品IDが一致している場合
                        isNull(products.deletedAt),//条件２、廃却済みでない場合
                        eq(products.stock, product.stock),//条件３、在庫数が変わっていない場合
                    )
                )
                .returning({ id: products.id });
            // 既に更新されてた場合のエラー報告(ここで処理を止める)
            if (!updatedProduct) {
                throw new Error(
                    "商品が廃却されたか、在庫数が変更されています。再確認してください。"
                );
            }
            //条件２、入出庫履歴に追記
            await tx
                .insert(stockHistories)
                .values({
                    productId: id,
                    userId: user.id,
                    quantity: difference,
                    type: "CHECK",
                    memo: `変更前:${product.stock}/変更後:${actualStock}/理由:${memo}`,
                });
        });
    } catch (error) {
        console.error(error);
        return { error: "棚卸処理に失敗しました。" };
    }

    redirect("/inventory");

}