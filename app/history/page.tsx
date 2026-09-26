//必要ファイル・関数を使えるように読み込み
import { db } from "@/db";//dbを読み込み
import { products, stockHistories } from "@/db/schema";//schemaより
import { and, desc, eq, like, sql } from "drizzle-orm";//desc(降順),eq(=)を使えるようにする
import Link from "next/link";//Linkを使えるようにする
import HistorySearchForm from "@/components/HistorySearchForm";
import { date } from "drizzle-orm/mysql-core";
import HistoryTable from "@/components/HistoryTable";

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
                        ? like(
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
                <HistoryTable histories={histories} isSearchEmpty={isSearchEmpty} />
                <Link
                    href="/dashboard"
                    className="button button-secondary mobile-menu-link"
                >
                    メニュー
                </Link>

            </div>
        </main>
    )
}