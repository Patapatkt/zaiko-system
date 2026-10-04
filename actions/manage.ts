"use server";
// 商品情報更新・商品削除時のバックエンド
import { db } from "@/db";
import { products, stockHistories } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm"
import { redirect } from "next/navigation";
import { requireAdmin } from "@/utils/auth";

type ProductState = {
    error: string;
} | null;

export async function updateProduct(
    id: number,
    previousState: ProductState,
    formData: FormData
) {
    await requireAdmin();
    const shelf =
        (formData.get("shelf") as string)?.trim().toUpperCase();
    const name = formData.get("name") as string;
    const specification =
        (formData.get("specification") as string)?.trim();

    if (!shelf || shelf.length !== 6) {
        return {
            error:
                "棚番が未入力か桁数が違います。棚番を6桁で入力してください。",
        };
    }

    if (!specification) {
        return {
            error: "仕様が未入力です。仕様を入力してください。",
        };
    }

    await db
        .update(products)
        .set({
            shelf,
            name,
            specification,
        })
        .where(eq(products.id, id))
    redirect("/inventory");
}

// 残っている在庫を全廃却し、商品を論理削除する
export async function deleteProduct(id: number) {
    const user = await requireAdmin(); // 管理者権限を確認する関数を呼び出す

    await db.transaction(async (tx) => {
        // 未削除の商品を取得
        const product = await tx.query.products.findFirst({
            where: and(eq(products.id, id), isNull(products.deletedAt)),
        });

        if (!product) {
            throw new Error("商品が存在しないか、既に削除されています。");
        }

        // 未削除かつ、取得時から在庫が変わっていない商品だけ更新する
        const [deletedProduct] = await tx 
            .update(products)
            .set({
                stock: 0,
                deletedAt: new Date().toISOString(),
            })
            .where( //どの商品を更新してよいか条件指定
                and(
                    eq(products.id, id),//対象のidが一致すること
                    isNull(products.deletedAt),//deletedAtがnullであること(未廃却であること)
                    eq(products.stock, product.stock),//更新する瞬間の数量が取得時の在庫と一致すること
                )
            )
            .returning({ id: products.id });

        if (!deletedProduct) {
            throw new Error(
                "商品が廃却されたか、在庫が変更されています。再確認してください。"
            );
        }
        // 廃却した数量をマイナスで記録
        await tx
            .insert(stockHistories)
            .values({
                productId: product.id,
                userId: user.id,
                quantity: -product.stock,
                type: "DELETE",
                memo: `不用品の全廃却(廃却前在庫: ${product.stock})`,
            });
    });

    redirect("/inventory");
}