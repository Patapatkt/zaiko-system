"use server";
// 商品有無の確認用、バックエンド
import { db } from "@/db";
import { products } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm"
import { requireApprovedUser } from "@/utils/auth";

type ProductCheckResult =
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
        inputValues: {
            shelf: string;
            name: string;
            specification: string;
        };
    }
    | {
        status: "error";
        error: string;
    }
    | {
        status: "deleted";
        error: string;
    };

// 棚番・商品名・仕様が一致する商品を確認する
export async function checkProduct(
    inputShelf: string,
    inputName: string,
    inputSpecification: string
): Promise<ProductCheckResult> {
    await requireApprovedUser();

    const shelf = inputShelf.trim().toUpperCase();
    const name = inputName.trim();
    const specification = inputSpecification.trim();

    // 棚番のガード節
    if (!shelf || shelf.length !== 6) {
        return {
            status: "error",
            error:
                "棚番が未入力か桁数が違います。棚番を6桁で入力してください。",
        };
    }

    // 商品名のガード節
    if (!name) {
        return {
            status: "error",
            error: "商品名を入力してください。",
        };
    }

    // 仕様のガード節
    if (!specification) {
        return {
            status: "error",
            error: "仕様を入力してください。",
        };
    }

    // 削除されていない商品から、3項目が一致する商品を検索
    const product = await db.query.products.findFirst({
        where: and(
            eq(products.shelf, shelf),
            eq(products.name, name),
            eq(products.specification, specification),
            isNull(products.deletedAt)
        ),
    });

    // 登録済みの商品だった場合
    if (product) {
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
    }
    // 同じ3項目の削除済み商品が存在するか確認
    const deletedProduct =
        await db.query.products.findFirst({
            where: and(
                eq(products.shelf, shelf),
                eq(products.name, name),
                eq(
                    products.specification,
                    specification
                )
            ),
        });

    if (deletedProduct?.deletedAt) {
        return {
            status: "deleted",
            error:
                "同じ棚番・商品名・仕様の削除済み商品があります。管理者に確認してください。",
        };
    }

    // 一致する商品が存在しない場合
    return {
        status: "notFound",
        inputValues: {
            shelf,
            name,
            specification,
        },
    };
}