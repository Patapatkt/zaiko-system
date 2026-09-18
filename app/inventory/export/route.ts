import { getSession } from "@/actions/auth";
import { db } from "@/db";
import { products } from "@/db/schema";
import {and,like} from "drizzle-orm"

function csvCell(value:string | number){
    const text = String(value);

    // 表計算ソフトで数式として実行されないようにする
    const safeText = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;

    return `"${safeText.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
    const session = await getSession();

    if (!session) {
        return new Response("ログインが必要です", { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const name = (searchParams.get("name") ?? "").trim();
    const shelf = (searchParams.get("shelf") ?? "").trim();
    const specification = (searchParams.get("specification") ?? "").trim();

    if (!name && !shelf && !specification) {
        return new Response("検索条件を入力してください", { status: 400 });
    }

    const productList = await db
        .select({
            code: products.code,
            shelf: products.shelf,
            name: products.name,
            specification: products.specification,
            stock: products.stock,
        })
        .from(products)
        .where(
            and(
                shelf ? like(products.shelf, `%${shelf}%`) : undefined,
                name ? like(products.name, `%${name}%`) : undefined,
                specification
                    ? like(products.specification, `%${specification}%`)
                    : undefined,
            )
        );

    const rows = [
        ["商品コード", "棚番", "商品名", "仕様", "在庫"],
        ...productList.map((product) => [
            product.code,
            product.shelf ?? "未設定",
            product.name,
            product.specification ?? "未設定",
            product.stock,
        ]),
    ];

    const csv = rows
        .map((row) => row.map(csvCell).join(","))
        .join("\r\n");

    return new Response(`\uFEFF${csv}`, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="inventory.csv"',
            "Cache-Control": "private, no-store",
        },
    });
}