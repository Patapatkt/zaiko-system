"use server";

import { db } from "@/db";
import { products, stockHistories } from "@/db/schema";
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation";
import { requireAdmin } from "@/utils/auth";

// 在庫修正時のバックエンド
export async function updateStock(
    id: number,//引数:idは一意の為、商品名を確実に絞り込める
    formData: FormData//引数:formDataを型として引数に設定
) {
    const user =
        await requireAdmin();

    const quantity = Number(formData.get("quantity"));//formDataよりquantity(増減値)を取得
    const operation = formData.get("operation");
    const reason = String(formData.get("reason") ?? "").trim();
    const memo = String(formData.get("memo") ?? "").trim();//formDataよりname(商品名)を取得

    if (Number.isNaN(quantity)) {
        throw new Error("入出庫数は数値を入力してください");
    }

    if (!Number.isInteger(quantity)) {
        throw new Error("入出庫数は整数を入力してください")
    }

    if (quantity <= 0) {
        throw new Error("入出庫数は1以上を入力してください")
    }

    if (operation !== "IN" && operation !== "OUT") {
        throw new Error("入庫または出庫を選択してください")
    }

    const product = await db.query.products.findFirst({//DBからproduct(テーブルを取得)
        where: eq(products.id, id),
    });

    if (!reason) {
        throw new Error("在庫数変更理由を選択してください")
    }

    const historyMemo =
        memo
            ? `${reason}：${memo}`
            : reason;
            
    if (!product) {
        throw Error("商品が見つかりません")
    }
    // 廃却済商品は修正できない
    if(product.deletedAt){
        throw new Error("廃却済みの商品です。入出庫はできません")
    }

    // 入庫ならプラス、出庫ならマイナスに変換
    const stockDifference =
        operation === "IN"
            ? quantity
            : -quantity;

    const newStock = product.stock + stockDifference;
    if (
        newStock < 0) {
        throw new Error("在庫が不足してしまいます")
    }

    await db.transaction(async (tx) => {
        await tx
            .update(products)
            .set({
                stock: newStock,
            })
            .where(eq(products.id, id));

        await tx.insert(stockHistories).values({
            productId: id,
            userId: user.id,
            quantity: stockDifference,
            type: operation,
            memo: historyMemo,
        })
    })
    redirect("/inventory");//結果をredirectでinventoryに表示
}

// 棚卸機能のバックエンド
export async function adjustStock(
    id: number,
    formData: FormData
) {
    const user =
        await requireAdmin();
    const actualStock = Number(formData.get("actualStock"));
    const memo = String(formData.get("memo") ?? "").trim();
    const product = await db.query.products.findFirst({
        where: eq(products.id, id),
    });

    if (!product) {
        throw new Error("商品が見つかりません");
    }

    // 廃却済商品は棚卸できない
    if(product.deletedAt){
        throw new Error("廃却済みの商品です。棚卸はできません")
    }

    if (Number.isNaN(actualStock)) {
        throw new Error("実在庫数は数値を入力してください");
    }

    if (!Number.isInteger(actualStock)) {
        throw new Error("実在庫数は整数を入力してください");
    }

    if (actualStock < 0) {
        throw new Error("実在庫数にマイナスは入力できません");
    }

    if (!memo.trim()) {
        throw new Error("棚卸理由を入力してください");
    }

    const difference = actualStock - product.stock;//実在庫数と登録在庫の差分
    //トランザクション機能による更新(どちらかがダメだと実行されない)
    //条件１、在庫テーブルの在庫数を棚卸数更新
    await db.transaction(async (tx) => {
        await tx
            .update(products)
            .set({
                stock: actualStock,
            })
            .where(eq(products.id, id));
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

    redirect("/inventory")

}