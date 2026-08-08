import { db } from "@/db";
import { products, users } from "@/db/schema";
import { deleteProduct } from "@/actions/inventory";
import Link from "next/link";
import { and, eq, like, or } from "drizzle-orm";
import { getSession } from "@/actions/auth"
import { redirect } from 'next/navigation';

export default async function InventoryPage(

    {
        searchParams,
    }: {
        searchParams: Promise<{
            keyword?: string;
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

    //検索文字を取得し前後の空白を削除
    const { keyword = "" } = await searchParams
    const trimmedKeyword = keyword.trim();

    // 検索文字が数字に変換できるか確認
    const keywordPrice = Number(trimmedKeyword);
    const isPriceSearch =
        trimmedKeyword !== "" && !Number.isNaN(keywordPrice);

    //検索文字が空ならDB検索を行わず、空の配列にする
    const productList =
        trimmedKeyword === ""
            ? []
            : await db
                .select()
                .from(products)
                .where(
                    and(
                        // 取り扱い中の商品だけを対象にする
                        eq(products.isActive, true),
                        isPriceSearch
                            ? or(
                                like(
                                    products.code,
                                    `%${trimmedKeyword}%`
                                ),
                                (
                                    like(
                                        products.name,
                                        `%${trimmedKeyword}%`)
                                ),
                                eq(products.price, keywordPrice)
                            )
                            : or(
                                like(
                                    products.code,
                                    `%${trimmedKeyword}%`
                                ),
                                like(
                                    products.name,
                                    `%${trimmedKeyword}%`
                                )
                            )
                    )
                );


    return (
        <main className="page-container">
            <div className="page-header">
                <h1 className="page-title">商品一覧</h1>


            </div>

            <form
                action="/inventory"
                className="searcharea">
                <input
                    type="text"
                    name="keyword"
                    placeholder="商品コード・商品名・価格で検索"
                    defaultValue={keyword}
                    className="search-input"
                />
                <button
                    type="submit"
                    className="button button-success search-button"
                >
                    検索
                </button>
            </form>

            <div className="table-wrapper">
                <table className="common-table">
                    <thead>
                        <tr>
                            <th>商品コード</th>
                            <th>商品名</th>
                            <th>価格</th>
                            <th>在庫</th>
                            <th>操作</th>
                        </tr>
                    </thead>

                    <tbody>
                        {trimmedKeyword === "" ? (
                            <tr>
                                <td
                             
                             colSpan={5}
                                    className="text-center p-4"
                                >
                                    商品コード・商品名・価格を入力して検索してください
                                </td>
                            </tr>
                        ) :
                            productList.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-4">
                                        該当する商品はありません
                                    </td>
                                </tr>
                            ) :
                                (
                                    productList.map((product) => (
                                        <tr key={product.id}>
                                            <td>{product.code}</td>
                                            <td>{product.name}</td>
                                            <td>{product.price.toLocaleString()}円</td>
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