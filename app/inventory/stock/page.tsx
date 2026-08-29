//在庫メンテナンス検索画面
import { like, and } from "drizzle-orm";
import { requireAdmin } from "@/utils/auth";
import { db } from "@/db";
import { products } from "@/db/schema";
import Link from "next/link";
import SearchForm from "@/components/SearchForm";//コンポーネント追加26/8/26

export default async function StockPage({
    searchParams,//引数設定
}: {
    searchParams: Promise<{
        name?: string;
        shelf?: string;
        specification?: string;
    }>;
}) {
    await requireAdmin();

    const { name = "",
        shelf = "",
        specification = ""
    } = await searchParams;
    const trimmedName = name.trim();
    const trimmedShelf = shelf.trim();
    const trimmedSpecification = specification.trim();
    const isSearchEmpty =
        trimmedName === "" &&
        trimmedShelf === "" &&
        trimmedSpecification === "";

    const productList = isSearchEmpty

        ? []//キーワードがなかったら空配列
        : await db//キーワードがあったら対象情報を取得
            .select()
            .from(products)
            .where
            (
                and(
                    trimmedShelf
                        ? like(products.shelf, `%${trimmedShelf}%`)
                        : undefined,
                    trimmedName
                        ? like(products.name, `%${trimmedName}%`)
                        : undefined,
                    trimmedSpecification
                        ? like(products.specification, `%${trimmedSpecification}%`)
                        : undefined,
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
                name={trimmedName}
                shelf={trimmedShelf}
                specification={trimmedSpecification}
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
                                                {product.shelf ?? "未設定"}
                                            </td>
                                            <td>
                                                {product.name}
                                            </td>
                                            <td>
                                                {product.specification ?? "未設定"}
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