// 商品一覧の在庫照会
import { db } from "@/db";
import { products, users } from "@/db/schema";
import Link from "next/link";
import { and, eq, isNull, like } from "drizzle-orm";
import { getSession } from "@/actions/auth"
import { redirect } from 'next/navigation';
import SearchForm from "@/components/SearchForm";
import InventoryTable from "@/components/InventoryTable";

export default async function InventoryPage(

    {
        searchParams,
    }: {
        searchParams: Promise<{
            name?: string;
            shelf?: string;
            specification?: string;
            success?: string;
        }>;
    }
) {//ログイン確認
    const session = await getSession()
    if (!session) {//もし未ログインなら
        redirect("/login");//ログインページへ戻る
    }
    // ログインユーザーの権限を取得
    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, session.userId),
    });

    if (!currentUser) {
        redirect("/login");
    }

    const isAdmin = currentUser.role === "admin";

    const { name = "",
        shelf = "",
        specification = "",
        success,
    } = await searchParams

    //各検索文字を取得し前後の空白を削除
    const trimmedName = name.trim();//商品名
    const trimmedShelf = shelf.trim();//棚番
    const trimmedSpecification = specification.trim();//仕様

    // 全てが空白だった場合を定数に格納
    const isSearchEmpty =
        trimmedName === "" &&
        trimmedShelf === "" &&
        trimmedSpecification === "";

    //検索文字が全て空＆削除済商品なら除外し空の配列にする
    const productList = isSearchEmpty
        ? []
        : await db
            .select()
            .from(products)
            .where(
                // and(// 将来、論理削除を採用する場合は
                // productsにisActiveを追加し、ここで取り扱い中の商品だけに絞り込む
                //     // 取り扱い中の商品だけを対象にする
                //     eq(products.isActive, true),//⇐ここが修正が必要

                and(//空白の場合は検索条件から除外
                    trimmedShelf
                        ? like(products.shelf, `%${trimmedShelf}%`)
                        : undefined,
                    trimmedName
                        ? like(products.name, `%${trimmedName}%`)
                        : undefined,
                    trimmedSpecification
                        ? like(products.specification, `%${trimmedSpecification}%`)
                        : undefined,
                    isNull(products.deletedAt)
                )
            )
            .orderBy(products.code);


    const exportParams = new URLSearchParams({
        name: trimmedName,
        shelf: trimmedShelf,
        specification: trimmedSpecification,
    })

    return (

        <main className="page-container">
            <div className="page-header">
                <h1 className="page-title">商品一覧</h1>
            </div>
            {success === "created" && (
                <p className="success-message">
                    商品登録成功
                </p>
            )}
            <SearchForm
                action="/inventory"
                name={trimmedName}
                shelf={trimmedShelf}
                specification={trimmedSpecification}
            />

            {!isSearchEmpty && productList.length > 0 && (
                <div className="header-actions">
                    <Link
                        href={`/inventory/export?${exportParams.toString()}`}
                        className="button button-secondary"
                    >
                        検索結果をCSV出力
                    </Link>
                </div>
            )}

            <InventoryTable
                productList={productList}
                isSearchEmpty={isSearchEmpty}
                isAdmin={isAdmin}
            />

            {/* 履歴画面 */}
            <div className="header-actions">
                <Link href="/history"
                    className="button button-primary"
                >
                    履歴画面
                </Link>

                <Link href="/dashboard"
                    className="button button-secondary">
                    メニュー
                </Link>
            </div>
        </main>
    )
}