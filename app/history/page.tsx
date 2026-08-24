//必要ファイル・関数を使えるように読み込み
import { db } from "@/db";//dbを読み込み
import { products, stockHistories } from "@/db/schema";//schemaより
import { desc, eq, like, or } from "drizzle-orm";//desc(降順),eq(=)を使えるようにする
import Link from "next/link";//Linkを使えるようにする

export default async function HistoryPage({
    searchParams,
}: {
    searchParams: Promise<{
        keyword?: string
    }>;
}) {
    //検索文字を取得し前後の空白を削除
    const { keyword = "" } = await searchParams;
    const trimmedKeyword = keyword.trim();

    //検索文字を数値へ変換
    const keywordQuantity = Number(trimmedKeyword);
    const isQuantitySearch =
        trimmedKeyword !== "" &&//検索欄が空ではなく
        !Number.isNaN(keywordQuantity);//数値に変換できる


    //HistoryPageを設定
    const histories =
        trimmedKeyword === ""
            ? []
            : await db
                .select({//stockHistories,productsより必要情報を取得
                    id: stockHistories.id,
                    productCode: products.code,
                    productShelf: products.shelf,
                    productName: products.name,
                    quantity: stockHistories.quantity,
                    type: stockHistories.type,
                    memo: stockHistories.memo,
                    createdAt: stockHistories.createdAt,
                })
                .from(stockHistories)//stockHistories(入出庫履歴)を基準に
                // stockHistories.productId,products.idが一致している商品を結合
                .innerJoin(//結合させる命令
                    products,
                    eq(stockHistories.productId, products.id)
                )
                .where(
                    isQuantitySearch
                        ? or(
                            like(
                                products.code,
                                `%${trimmedKeyword}%`
                            ),
                            like(
                                products.shelf,
                                `%${trimmedKeyword}%`
                            ),
                            like(
                                products.name,
                                `%${trimmedKeyword}%`
                            ),
                            eq(
                                stockHistories.quantity,
                                keywordQuantity
                            )
                        )
                        : or(
                            like(
                                products.code,
                                `%${trimmedKeyword}%`
                            ),
                            like(
                                products.shelf,
                                `%${trimmedKeyword}%`
                            ),
                            like(
                                products.name,
                                `%${trimmedKeyword}%`
                            )
                        )
                )
                .orderBy(desc(stockHistories.createdAt));//stockHistories(入出庫履歴)よりcreatedAtを降順で表示

    return (//画面を表示
        <main className="page-container">
            <div className="page-header">
                <h1 className="page-title">
                    入出庫履歴
                </h1>
            </div>

            {/* 履歴検索フォーム */}
            <form
                action="/history"
                className="searcharea"

            >
                <input
                    type="text"
                    name="keyword"
                    placeholder="商品名・商品コード・棚番・数量を入力してください"
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
                            <th>日時</th>
                            <th>商品コード</th>
                            <th>棚番</th>
                            <th>商品名</th>
                            <th>種別</th>
                            <th>数量</th>
                            <th>理由</th>
                        </tr>
                    </thead>


                    <tbody>

                        {trimmedKeyword === "" ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="text-center p-4"
                                >
                                    商品名・商品コード・棚番・数量を入力して
                                    検索してください
                                </td>
                            </tr>
                        ) : histories.length === 0 ? (//履歴がなかったら(0)
                            <tr>
                                <td colSpan={7} className="text-center p-4">
                                    該当する入出庫履歴がありません
                                </td>
                            </tr>
                        ) : (
                            histories.map((history) => (
                                <tr key={history.id}>
                                    <td>
                                        {history.createdAt}
                                    </td>
                                    <td>
                                        {history.productCode}
                                    </td>
                                    {/* 棚番を追加 */}
                                    <td>{history.productShelf}</td>
                                    <td>
                                        {history.productName}
                                    </td>
                                    <td>
                                        {history.type === "IN"
                                            ? "入庫"
                                            : history.type === "OUT"
                                                ? "出庫"
                                                :history.type === "CHECK"
                                                ? "確認"
                                                :"要確認"
                                        }
                                    </td>
                                    <td>
                                        {history.quantity}
                                    </td>
                                    <td>
                                        {history.memo ?? "なし"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <Link
                    href="/dashboard"
                    className="button button-secondary"
                >
                    メニュー
                </Link>
            </div>
        </main>
    )
}