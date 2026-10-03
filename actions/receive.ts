"use server";
// 入庫処理のバックエンド
import { db } from "@/db";
import { products, stockHistories, productCodeSequence } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm"
import { redirect } from "next/navigation";
import { requireApprovedUser } from "@/utils/auth";

type ProductState = {
    error: string;
} | null;

// 登録済み商品を入庫する
export async function restockProduct(
    previousState: ProductState,
    formData: FormData
): Promise<ProductState> {
    const user =
        await requireApprovedUser();//承認済ユーザーか確認

    const productId = Number(formData.get("productId"));
    const quantity = Number(formData.get("quantity"));

    // 商品IDのガード節
    if (!Number.isInteger(productId) || productId <= 0) {
        return {
            error: "商品情報が正しくありません。商品を再確認してください。",
        };
    }

    // 入庫数量のガード節
    if (!Number.isInteger(quantity) || quantity <= 0) {
        return {
            error: "入庫数量は1以上の整数で入力してください。",
        };
    }

    // 入庫対象の商品を確認
    const product = await db.query.products.findFirst({
        where: eq(products.id, productId),
    });
    if (!product) {
        return {
            error: "入庫対象の商品が見つかりません。",
        };
    }

    if (product.deletedAt) {
        return {
            error: "削除済みの商品には入庫できません。",
        };
    }

    await db.transaction(async (tx) => {
        // 現在庫へ今回の入庫数量を加算
        await tx
            .update(products)
            .set({
                stock: sql`${products.stock} + ${quantity}`,
            })
            .where(eq(products.id, productId));

        // 入出庫履歴へ入庫記録を追加
        await tx.insert(stockHistories).values({
            productId,
            userId: user.id,
            quantity,
            type: "IN",
            memo: "商品補充",
        });
    });

    redirect("/inventory/new?success=restocked");
}

// 新商品を登録して入庫する
export async function createProduct(
    previousState: ProductState,
    formData: FormData
): Promise<ProductState> {
    const user =
        await requireApprovedUser();

    const shelf =
        (formData.get("shelf") as string)?.trim().toUpperCase();
    const specification =
        (formData.get("specification") as string)?.trim();
    const name =
        (formData.get("name") as string)?.trim();
    const price = Number(formData.get("price"));
    const stock = Number(formData.get("stock"));

    // 棚番のガード節
    if (!shelf || shelf.length !== 6) {
        return {
            error:
                "棚番が未入力か桁数が違います。棚番を6桁で入力してください。",
        };
    }

    // 商品名のガード節
    if (!name) {
        return {
            error: "商品名を入力してください。",
        };
    }

    // 仕様のガード節
    if (!specification) {
        return {
            error: "仕様を入力してください。",
        };
    }

    // 価格のガード節
    if (!Number.isInteger(price) || price < 0) {
        return {
            error:
                "価格は0以上の整数で入力してください。",
        };
    }

    // 初回入庫数量のガード節
    if (!Number.isInteger(stock) || stock <= 0) {
        return {
            error:
                "初回入庫数量は1以上の整数で入力してください。",
        };
    }

    // 同じ棚番・商品名・仕様の商品がないか再確認
    const existingProduct =
        await db.query.products.findFirst({
            where: and(
                eq(products.shelf, shelf),
                eq(products.name, name),
                eq(products.specification, specification)
            )
        });

    if (existingProduct) {
        return {
            error: "同じ棚番・商品名・仕様の商品は既に登録されています。もう一度商品を確認してください。",
        };
    }

    await db.transaction(async (tx) => {
        const [productCodeSeq] = await tx
            .update(productCodeSequence)
            .set({
                currentNumber:
                    sql`${productCodeSequence.currentNumber} + 1`,
            })
            .where(
                eq(productCodeSequence.id, 1)
            )
            .returning({
                currentNumber: productCodeSequence.currentNumber,
            });

        if (!productCodeSeq) {
            throw new Error(
                "商品コード採番テーブルの更新に失敗しました。"
            );
        }

        const code =
            `P${String(productCodeSeq.currentNumber)
                .padStart(6, "0")}`;
        // 採番した商品コードで新商品を登録する
        const [product] = await tx
            .insert(products)
            .values({
                code,
                shelf,
                name,
                price,
                stock,
                specification,
            })

            .returning({
                id: products.id,
            });

        // 新商品登録を初回入庫として履歴へ保存
        await tx.insert(stockHistories).values({
            productId: product.id,
            userId: user.id,
            quantity: stock,
            type: "IN",
            memo: "商品登録時の初回在庫",
        });

    });

    redirect("/inventory/new?success=created");
}