"use server";

import { db } from "@/db";
import { products, stockHistories } from "@/db/schema";
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation";
import { requireAdmin } from "@/utils/auth";

type ProductState = {
    error: string;
}|null;

export async function createProduct(
    previousState: ProductState,
    formData: FormData
): Promise<ProductState> {
    const code = formData.get("code") as string;
    const shelf = (formData.get("shelf") as string)?.trim();
    const name = formData.get("name") as string;
    const price = Number(formData.get("price"));
    const stock = Number(formData.get("stock"));

    // 棚番が空白だった場合のガード節追加
    if (!shelf || shelf.length !== 6) {//棚番の桁数が違う場合のエラー処理
        return{
            error: 
            "棚番が未入力か桁数が違います。棚番を正しく設定してください。"
        };
    }

    await db.insert(products).values({
        code,
        shelf,
        name,
        price,
        stock,
    });
    redirect("/inventory");
}

export async function updateProduct(
    id: number,
    previousState: ProductState,
    formData: FormData
) {
    const code = formData.get("code") as string;
    const shelf = formData.get("shelf") as string;
    const name = formData.get("name") as string;
    const price = Number(formData.get("price")) as number;

    if (!shelf || shelf.length !== 6) {
        return {
            error:
                "棚番が未入力か桁数が違います。棚番を6桁で入力してください。",
        };
    }

    await db
        .update(products)
        .set({
            code,
            shelf,
            name,
            price,
        })
        .where(eq(products.id, id));
    redirect("/inventory");
}

export async function deleteProduct(id: number) {

    await requireAdmin();

    await db
        .update(products)
        .set({
            // isActive: false,⇐将来、論理削除を採用する場合はこの行を有効にする26/8/23
            deletedAt: new Date().toISOString(),
        })
        .where(eq(products.id, id));//eqは=の意味
    redirect("/inventory");
}

export async function updateStock(
    id: number,//引数:idは一意の為、商品名を確実に絞り込める
    formData: FormData//引数:formDataを型として引数に設定
) {
    const memo = formData.get("memo") as string;//formDataよりname(商品名)を取得
    const quantity = Number(formData.get("quantity")) as number;//formDataよりquantity(増減値)を取得

    const product = await db.query.products.findFirst({//DBからproduct(テーブルを取得)
        where: eq(products.id, id),
    });


    if (!product) {
        throw Error("商品が見つかりません")
    }

    const type = quantity > 0 ? "IN" : "OUT";
    const newStock = product.stock + quantity;

    if (
        Number.isNaN(quantity)
    ) {
        throw new Error("入出庫数は数値を入力してください")
    }

    if (
        quantity === 0
    ) {
        throw new Error("入出庫数に0は入力できません")
    }

    if (
        newStock < 0) {
        throw new Error("在庫が不足してしまいます")
    }


    await db.transaction(async (tx) => {
        if (newStock < 0) {
            throw new Error("在庫数が不足します。出庫数の確認をお願いします");//ロールバック
        }//エラー節によるはじき出し        
        await tx
            .update(products)
            .set({
                stock: newStock,
            })
            .where(eq(products.id, id));

        await tx.insert(stockHistories).values({
            productId: id,
            quantity,
            type,
            memo,
        })
    })
    redirect("/inventory");//結果をredirectでinventoryに表示
}

export async function adjustStock(
    id: number,
    formatData: FormData
) {
    const actualStock = Number(formatData.get("actualStock"));
    const memo = formatData.get("memo") as string;

    const product = await db.query.products.findFirst({
        where: eq(products.id, id),
    });

    if (!product) {
        throw new Error("商品が見つかりません");
    }

    if (Number.isNaN(actualStock)) {
        throw new Error("実在庫数は数値を入力してください");
    }

    if (actualStock < 0) {
        throw new Error("実在庫数にマイナスは入力できません");
    }

    if (!memo.trim()) {
        throw new Error("棚卸理由を入力してください");
    }

    const difference = actualStock - product.stock;//実在庫数と登録在庫の差分

    if (difference === 0) {
        throw new Error("実在庫数と棚卸数が同じです");
    }

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
                quantity: difference,
                type: "ADJUST",
                memo: `変更前:${product.stock}/変更後:${actualStock}/理由:${memo}`
            });
    });

    redirect("/inventory")

}