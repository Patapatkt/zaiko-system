// 商品一覧の在庫照会
import { db } from "@/db";
import { products, users } from "@/db/schema";
import { deleteProduct } from "@/actions/inventory";
import Link from "next/link";
import { and, eq, like, or } from "drizzle-orm";//⇐andを削除
import { getSession } from "@/actions/auth"
import { redirect } from 'next/navigation';
import SearchForm from "@/components/SearchForm";

export default async function InventoryPage(

    {
        searchParams,
    }: {
        searchParams: Promise<{
            name?: string;
            shelf?: string;
            specification?: string;
            succsess?: string;
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
        succsess,
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

    //検索文字が全て空ならDB検索を行わず、空の配列にする
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

                and(

                    like(
                        products.shelf,
                        `%${trimmedShelf}%`
                    ),
                    like(
                        products.name,
                        `%${trimmedName}%`
                    ),
                    like(
                        products.specification,
                        `%${trimmedSpecification}%`
                    )
                )
            );


    return (

        <main className="page-container">
            <div className="page-header">
                <h1 className="page-title">商品一覧</h1>
            </div>
            {succsess === "created" && (
                <p className="succsess-message">
                    商品登録成功
                </p>
            )}
            <SearchForm
                action="/inventory"
                name={trimmedName}
                shelf={trimmedShelf}
                specification={trimmedSpecification}
            />

            <div className="table-wrapper">
                <table className="common-table">
                    <thead>
                        <tr>
                            <th>商品コード</th>
                            <th>棚番</th>{/*⇐棚番を追加26/8/23 */}
                            <th>商品名</th>
                            <th>仕様</th>
                            <th>在庫</th>
                            <th>操作</th>
                        </tr>
                    </thead>

                    <tbody>
                        {isSearchEmpty ? (
                            <tr>
                                <td

                                    colSpan={6}
                                    className="text-center p-4"
                                >
                                    棚番・商品名・仕様を入力して検索してください
                                </td>
                            </tr>
                        ) :
                            productList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-4">
                                        該当する商品はありません
                                    </td>
                                </tr>
                            ) :
                                (
                                    productList.map((product) => (
                                        <tr key={product.id}>
                                            <td>{product.code}</td>
                                            <td>{product.shelf ?? "未設定"}</td>
                                            <td>{product.name}</td>
                                            <td>{product.specification ?? "未設定"}</td>
                                            <td>{product.stock}</td>
                                            <td>
                                                <div className="action-area">
                                                    <Link
                                                        href={`/inventory/edit/${product.id}`}
                                                        className="edit-link"
                                                    >
                                                        編集
                                                    </Link>
                                                    {isAdmin && (
                                                        <form action={async () => {
                                                            "use server";
                                                            await deleteProduct(product.id);
                                                        }}
                                                            className="inline ml-3"
                                                        >
                                                            <button
                                                                type="submit"
                                                                className="danger-link"
                                                            >
                                                                削除
                                                            </button>
                                                        </form>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                    </tbody>
                </table>
            </div>

            {/* +商品登録追加 */}
            <div className="header-actions">
                <Link href="/inventory/new"
                    className="button button-primary"
                >
                    +商品入庫
                </Link>
                <Link href="/history"
                    className="button button-primary"
                >
                    履歴画面
                </Link>
            </div>

            <Link href="/dashboard"
                className="button button-secondary">
                メニュー
            </Link>

        </main>
    )
}