//必要ファイル・関数を使えるように読み込み
import { db } from "@/db";//dbを読み込み
import { products, stockHistories } from "@/db/schema";//schemaより
import { and, desc, eq, like, sql } from "drizzle-orm";//desc(降順),eq(=)を使えるようにする
import Link from "next/link";//Linkを使えるようにする
import HistorySearchForm from "@/components/HistorySearchForm";
import { date } from "drizzle-orm/mysql-core";

export default async function HistoryPage({
    searchParams,
}: {
    searchParams: Promise<{
        startDate?: string;
        endDate?: string;
        code?: string;
        shelf?: string;
        name?: string;
        specification?: string;
        type?: string;
        quantity?: string;
        memo?: string;
    }>;
}) {
    //検索文字を取得し前後の空白を削除
    const {
        startDate = "",
        endDate = "",
        code = "",
        shelf = "",
        name = "",
        specification = "",
        type = "",
        quantity = "",
        memo = "",
    } = await searchParams;
    //各検索文字を取得し前後の空白を削除
    const trimmedStartDate = startDate.trim();
    const trimmedEndDate = endDate.trim();
    const trimmedCode = code.trim();
    const trimmedShelf = shelf.trim();//棚番
    const trimmedName = name.trim();//商品名
    const trimmedSpecification = specification.trim();//仕様 
    const trimmedType = type.trim();
    const trimmedQuantity = quantity.trim();
    const trimmedMemo = memo.trim();

    // 全てが空白だった場合を定数に格納
    const isSearchEmpty =
        trimmedStartDate === "" &&
        trimmedEndDate === "" &&
        trimmedCode === "" &&
        trimmedShelf === "" &&
        trimmedName === "" &&
        trimmedSpecification === "" &&
        trimmedType === "" &&
        trimmedQuantity === "" &&
        trimmedMemo === "";
    //検索文字を数値へ変換
    const keywordQuantity =
        trimmedQuantity === ""
            ? null
            : Number(trimmedQuantity);
    const isQuantityValid =
        keywordQuantity === null ||
        !Number.isNaN(keywordQuantity);
    //HistoryPageを設定
    const histories = isSearchEmpty || !isQuantityValid
        ? []
        : await db
            .select({//stockHistories,productsより必要情報を取得
                id: stockHistories.id,
                productCode: products.code,
                productShelf: products.shelf,
                productName: products.name,
                productSpecification: products.specification,
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
                and(
                    trimmedStartDate
                        ? sql`date(${stockHistories.createdAt}) >= ${trimmedStartDate}`
                        : undefined,

                    trimmedEndDate
                        ? sql`date(${stockHistories.createdAt}) <= ${trimmedEndDate}`
                        : undefined,
                    trimmedCode
                        ? like(
                            products.code,
                            `%${trimmedCode}%`
                        )
                        : undefined,
                    trimmedShelf
                        ? eq(
                            products.shelf,
                            `%${trimmedShelf}%`
                        )
                        : undefined,
                    trimmedName
                        ? like(
                            products.name,
                            `%${trimmedName}%`
                        )
                        : undefined,
                    trimmedSpecification
                        ? like(
                            products.specification,
                            `%${trimmedSpecification}%`
                        )
                        : undefined,
                    trimmedType
                        ? eq(
                            stockHistories.type,
                            trimmedType
                        )
                        : undefined,
                    keywordQuantity !== null
                        ? eq(
                            stockHistories.quantity,
                            keywordQuantity
                        )
                        : undefined,
                    trimmedMemo
                        ? like(
                            stockHistories.memo,
                            `%${trimmedMemo}%`
                        )
                        : undefined
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

            <HistorySearchForm
                action="/history"
                defaultValues={{
                    startDate: trimmedStartDate,
                    endDate: trimmedEndDate,
                    code: trimmedCode,
                    shelf: trimmedShelf,
                    name: trimmedName,
                    specification: trimmedSpecification,
                    quantity: trimmedQuantity,
                    type: trimmedType,
                    memo: trimmedMemo,
                }}
            />

            <div className="table-wrapper">
                <table className="common-table">
                    <thead>
                        <tr>
                            <th>日時</th>
                            <th>商品コード</th>
                            <th>棚番</th>
                            <th>商品名</th>
                            <th>商品仕様</th>
                            <th>区分</th>
                            <th>数量</th>
                            <th>理由</th>
                        </tr>
                    </thead>


                    <tbody>

                        {isSearchEmpty ? (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="history-message-cell"
                                >
                                    検索内容を入力して検索してください
                                </td>
                            </tr>
                        ) : histories.length === 0 ? (//履歴がなかったら(0)
                            <tr>
                                <td colSpan={8} className="history-message-cell">
                                    該当する入出庫履歴がありません
                                </td>
                            </tr>
                        ) : (
                            histories.map((history) => (
                                <tr key={history.id}>
                                    <td>
                                        {history.createdAt
                                            ? new Date(history.createdAt).toLocaleString("ja-JP", {
                                                    timeZone: "Asia/Tokyo",
                                                    year: "numeric",
                                                    month: "2-digit",
                                                    day: "2-digit",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    second: "2-digit",
                                                    hour12: false,
                                                })
                                            : "未設定"}
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
                                        {history.productSpecification ?? "未設定"}
                                    </td>
                                    <td>
                                        {history.type === "IN"
                                            ? "入庫"
                                            : history.type === "OUT"
                                                ? "出庫"
                                                : history.type === "CHECK"
                                                    ? "棚卸"
                                                    : "要確認"
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