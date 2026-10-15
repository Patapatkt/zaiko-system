// 在庫一覧のバックエンド
import "server-only";//サーバー専用
// 必要なものをimport
import { db } from "@/db";
import { products, users } from "@/db/schema";
import { and, eq, isNull, like } from "drizzle-orm";
import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
// 型定義
type InventorySearchConditions = {
    name?: string;//品物名
    shelf?: string;//棚番
    specification?: string;//仕様
};
// ログイン情報確認の関数作成
export async function getInventoryPageData(
    condition: InventorySearchConditions) {
    // ログイン確認
    const session = await getSession();
    // session情報なければログイン画面に戻る
    if (!session) {
        redirect("/login");
    }
    // ログインユーザーの権限を取得
    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, session.userId),
    });
    if (!currentUser) {
        redirect("/login");
    }
    // role(役割)がadminだったらisAdminに格納
    const isAdmin = currentUser.role === "admin";
    // 検索文字の前後の空白を削除
    const name = (condition.name ?? "").trim();
    const shelf = (condition.shelf ?? "").trim();
    const specification = (condition.specification ?? "").trim();
    // 品物名、棚番、仕様が空だった時の状態を定数に格納
    const isSearchEmpty =
        name === "" &&
        shelf === "" &&
        specification === "";
    // 未検索の場合は空配列。検索時は削除済み商品を除外
    const productList = isSearchEmpty
        ? []
        : await db
            .select()
            .from(products)
            .where(//検索条件の指定
                and(
                    shelf
                        ? like(products.shelf, `%${shelf}%`)
                        : undefined,
                    name
                        ? like(products.name, `%${name}%`)
                        : undefined,
                    specification
                        ? like(products.specification, `%${specification}%`)
                        : undefined,
                    isNull(products.deletedAt)
                )
            )
            .orderBy(products.code);
    return {
        productList,
        isSearchEmpty,
        isAdmin,
        name,
        shelf,
        specification,
    };
}
