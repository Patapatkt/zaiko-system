"use server";

import { db } from "@/db";
import { products, stockHistories } from "@/db/schema";
import { eq ,sql} from "drizzle-orm"
import { redirect } from "next/navigation";
import { requireAdmin } from "@/utils/auth";

type ProductState = {
    error: string;
} | null;

type ProductCodeCheckResult =
    | {
        status: "found";
        product: {
            id: number;
            code: string;
            shelf: string | null;
            name: string;
            specification: string | null;
            stock: number;
        };
    }
    | {
        status: "notFound";
        code: string;
    }
    | {
        status: "error";
        error: string;
    }
    | {
        status: "deleted";
        error: string;
    }

// 商品コードが登録済みか確認する
export async function checkProductCode(
    inputCode: string
): Promise<ProductCodeCheckResult> {
    await requireAdmin();
    const code = inputCode.trim();
    // 商品コードが未入力の場合
    if (!code) {
        return {
            status: "error",
            error: "商品コードを入力してください。",
        };
    }

    // 商品コードが一致する商品を検索
    const product = await db.query.products.findFirst({
        where: eq(products.code, code),
    });

    // 商品コードが登録されていない場合
    if (!product) {
        return {
            status: "notFound",
            code,
        };
    }

    // 過去に削除された商品だった場合
    if (product.deletedAt) {
        return {
            status: "deleted",
            error:
                "この商品コードは削除済みの商品に使用されています。管理者に確認してください。",
        };
    }
    // 登録済みの商品だった場合
    return {
        status: "found",
        product: {
            id: product.id,
            code: product.code,
            shelf: product.shelf,
            name: product.name,
            specification: product.specification,
            stock: product.stock,
        },
    };
};

// 登録済み商品を入庫する
export async function restockProduct(
    previousState: ProductState,
    formData: FormData
): Promise<ProductState> {
    await requireAdmin();

    const productId = Number(formData.get("productId"));
    const quantity = Number(formData.get("quantity"));

    // 商品IDのガード節
    if (!Number.isInteger(productId) || productId <= 0) {
        return {
            error: "商品情報が正しくありません。商品コードを再確認してください。",
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
            quantity,
            type: "IN",
            memo: "商品補充",
        });
    });

    redirect("/inventory/new?success=restocked");
}

export async function createProduct(
    previousState: ProductState,
    formData: FormData
): Promise<ProductState> {
    await requireAdmin();

    const code =
        (formData.get("code") as string)?.trim();
    const shelf =
        (formData.get("shelf") as string)?.trim();
    const specification =
        (formData.get("specification") as string)?.trim();
    const name =
        (formData.get("name") as string)?.trim();
    const price = Number(formData.get("price"));
    const stock = Number(formData.get("stock"));

    // 商品コードのガード節
    if (!code) {
        return {
            error: "商品コードを入力してください。",
        };
    }

    // 登録処理の直前に商品コードを再確認
    const existingProduct =
        await db.query.products.findFirst({
            where: eq(products.code, code),
        });

    if (existingProduct?.deletedAt) {
        return {
            error:
                "この商品コードは削除済みの商品に使用されています。管理者に確認してください。",
        };
    }

    if (existingProduct) {
        return {
            error:
                "この商品コードは既に登録されています。商品コードを再確認してください。",
        };
    }

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

    const wasCreated =
        await db.transaction(async (tx) => {
            /*
             * 確認後に別ユーザーが同じコードを登録しても、
             * uniqueエラーをそのまま発生させず登録を中止する
             */
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
                .onConflictDoNothing({
                    target: products.code,
                })
                .returning({
                    id: products.id,
                });

            // 同じ商品コードが先に登録された場合
            if (!product) {
                return false;
            }

            // 新商品登録を初回入庫として履歴へ保存
            await tx.insert(stockHistories).values({
                productId: product.id,
                quantity: stock,
                type: "IN",
                memo: "商品登録時の初回在庫",
            });

            return true;
        });

    if (!wasCreated) {
        return {
            error:
                "同じ商品コードが先に登録されました。商品コードをもう一度確認してください。",
        };
    }

    redirect("/inventory/new?success=created");
}

export async function updateProduct(
    id: number,
    previousState: ProductState,
    formData: FormData
) {
    await requireAdmin();
    const code = formData.get("code") as string;
    const shelf =
        (formData.get("shelf") as string)?.trim();
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
            code,
            shelf,
            name,
            specification,
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
    await requireAdmin();
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
    await requireAdmin();
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
    const type =
        difference > 0
            ? "IN"
            : difference < 0
                ? "OUT"
                : "CHECK";

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
                type,
                memo: `変更前:${product.stock}/変更後:${actualStock}/理由:${memo}`
            });
    });

    redirect("/inventory")

}