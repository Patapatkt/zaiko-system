//在庫メンテナンス検索画面
// 関数やデータなどの呼び出し
import { like, and } from "drizzle-orm";
import { requireAdmin } from "@/utils/auth";
import { db } from "@/db";
import { products } from "@/db/schema";
import Link from "next/link";
import SearchForm from "@/components/SearchForm";//コンポーネント追加26/8/26

// StockPage関数作成
export default async function StockPage({
    searchParams,//URL の検索条件を受け取る引数を設定
}: {
    searchParams: Promise<{// URLの検索条件を受け取る
        name?: string;
        shelf?: string;
        specification?: string;
    }>;
}) {
    await requireAdmin();//requireAdmin関数をutils/auth.tsより呼び出し,権限確認の完了を待つ
    // URLの検索条件が未定義なら空文字を使う
    const { name = "",
        shelf = "",
        specification = ""
    } = await searchParams;
    // キーワードの前後の空白を取り除き定数に設定
    const trimmedName = name.trim();
    const trimmedShelf = shelf.trim();
    const trimmedSpecification = specification.trim();
    //３つの検索条件がすべて空文字か判定する
    const isSearchEmpty =
        trimmedName === "" &&
        trimmedShelf === "" &&
        trimmedSpecification === "";
    // 検索条件が空なら空配列、あれば DB を検索して結果を入れる
    const productList = isSearchEmpty

        ? []//キーワードがなかったら空配列
        : await db//キーワードがあったら対象情報を取得
            .select() // 検索する場合だけ、DBの結果を待つ
            .from(products)//検索対象のテーブルをproductsに指定
            .where
            (   //入力された条件を全て満たす商品を絞り込み
                and(
                    trimmedShelf//棚番あいまい検索
                        ? like(products.shelf, `%${trimmedShelf}%`)
                        : undefined,
                    trimmedName//商品名あいまい検索
                        ? like(products.name, `%${trimmedName}%`)
                        : undefined,
                    trimmedSpecification//仕様あいまい検索
                        ? like(products.specification, `%${trimmedSpecification}%`)
                        : undefined,
                ))
        ;
    return (
        //ページ作成
        <main className="page-container">
            <div className="page-header">
                <h1 className="page-title">
                    在庫メンテナンス
                </h1>
            </div>
            {/* SearchFormコンポーネント呼び出し */}
            <SearchForm
                action="/inventory/stock"
                name={trimmedName}
                shelf={trimmedShelf}
                specification={trimmedSpecification}
            />
           {/* 検索結果の表を表示 */}
            <div className="table-wrapper">
                <table className="common-table">
                    {/* 表示テーブルの見出しを作成 */}
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

                    {/* 入力欄が空文字だった場合の表示 */}
                    <tbody>
                        {isSearchEmpty ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="text-align-left p-4"
                                >
                                    棚番・商品名・仕様を入力して検索してください
                                </td>
                            </tr>
                        ) :
                            //検索結果が見つからなかった時の表示
                            productList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-align-left p-4">
                                        該当する商品はありません
                                    </td>
                                </tr>
                            ) :
                                (
                                    // product(db)より検索結果にヒットした情報をテーブルに表示
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
                className="button button-secondary mobile-menu-link"
            >
                メニュー
            </Link>
        </main >

    )
}