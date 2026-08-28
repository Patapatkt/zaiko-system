//在庫メンテナンス検索画面
import { or,like } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import Link from "next/link";
import SearchForm from "@/components/SearchForm";//コンポーネント追加26/8/26

export default async function StockPage({
    searchParams,//引数設定
}: {
    searchParams: Promise<{
        keyword?: string;//引数にはキーワード:型は文字列
    }>;
}) {
    const { keyword = "" } = await searchParams;
    const trimmedKeyword = keyword.trim();

    const productList =
        trimmedKeyword === ""
            ? []//キーワードがなかったら空配列
            : await db//キーワードがあったら対象情報を取得
                .select()
                .from(products)
                .where
                (or(
                    like(products.name, `%${trimmedKeyword}%`),
                    like(products.code, `%${trimmedKeyword}%`),
                    like(products.shelf, `%${trimmedKeyword}%`),
                    like(products.specification, `%${trimmedKeyword}%`)
                ))
    ;
    return (
        <main className="page-container">
            <div className="page-header">
                <h1 className="page-title">
                    在庫メンテナンス
                </h1>
            </div>

            <SearchForm
                action="/inventory/stock"
                keyword={keyword}
                placeholder="商品名・商品コード・棚番・仕様を入力"
            />

            {/* 検索結果が見つからなかった時の表示 */}
            <div className="table-wrapper">
                <table className="common-table">
                    <thead>
                        <tr>
                            <th>商品コード</th>
                            <th>棚番</th>{/*⇐棚番を追加 */}
                            <th>商品名</th>
                            <th>商品仕様</th>
                            <th>現在庫</th>
                            <th>操作</th>
                        </tr>
                    </thead>

                    <tbody>
                        {trimmedKeyword === "" ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="text-center p-4"
                                >
                                    商品名を入力して検索してください
                                </td>
                            </tr>
                        ) :
                            productList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center px-4">
                                        該当する商品はありません
                                    </td>
                                </tr>
                            ) :
                                (

                                    productList.map((product) => (
                                        <tr key={product.id}>
                                            <td>
                                                {product.code}
                                            </td>
                                            <td>
                                                {product.shelf}
                                            </td>
                                            <td>
                                                {product.name}
                                            </td>
                                            <td>
                                                {product.specification}
                                            </td>
                                            <td>
                                                {product.stock}
                                            </td>
                                            <td>
                                                <div className="action-area">
                                                    <Link
                                                        href={`/inventory/stock/${product.id}`}
                                                        className="button button-primary"
                                                    >
                                                        在庫修正
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                    </tbody>
                </table>
            </div>
            <Link
                href="/dashboard"
                className="button button-secondary"
            >
                メニュー
            </Link>

        </main >

    )
}