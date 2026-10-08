"use client";
// 入出庫履歴テーブルコンポーネント
import { Fragment, useState } from "react";
import type { products, stockHistories } from "@/db/schema";
// 履歴の型定義
type History = Pick<
  typeof stockHistories.$inferSelect,
  "id" | "quantity" | "type" | "memo" | "createdAt"
> & {
  productCode: typeof products.$inferSelect.code;
  productShelf: typeof products.$inferSelect.shelf;
  productName: typeof products.$inferSelect.name;
  productSpecification: typeof products.$inferSelect.specification;
};
// 履歴テーブルのプロパティ型定義
type HistoryTableProps = {
  histories: History[];
  isSearchEmpty: boolean;
};
// 集計用の型定義
type ProductSummary = {
  incoming: number;
  outgoing: number;
  adjustment: number;//棚卸の差分合計
  lastHistoryId: History["id"];
};

// 棚番・商品名・仕様の組み合わせを、集計用のキーにする
function getProductKey(history: History) {
  return JSON.stringify([
    history.productShelf, // 棚番
    history.productName, // 商品名
    history.productSpecification, // 仕様
  ]);
}
// 履歴の区分を日本語に変換する
function getHistoryTypeLabel(type: History["type"]) {
  switch (type) {
    case "IN":
      return "入庫";
    case "OUT":
      return "出庫";
    case "CHECK":
      return "棚卸";
    case "DELETE":
      return "廃却";
    default:
      return "要確認";
  }
}
// 入出庫履歴テーブルコンポーネント
export default function HistoryTable({
  histories,
  isSearchEmpty,
}: HistoryTableProps) {
  const [showSummary, setShowSummary] = useState(false);
  const sortedHistories = [...histories].sort((a, b) => {
    const shelfOrder = (a.productShelf ?? "").localeCompare(
      (b.productShelf ?? ""),
      "ja",
    );
    if (shelfOrder !== 0) {
      return shelfOrder;
    }
    const nameOrder = (a.productName ?? "").localeCompare(
      (b.productName ?? ""),
      "ja",
    );
    if (nameOrder !== 0) return nameOrder;
    // nullと空文字も区別し、同じ仕様を連続させる
    if (a.productSpecification !== b.productSpecification) {
      if (a.productSpecification === null) return -1;
      if (b.productSpecification === null) return 1;

      const specificationOrder =
        (a.productSpecification ?? "").localeCompare(
          (b.productSpecification ?? ""),
          "ja",
        );
      if (specificationOrder !== 0) return specificationOrder;
    }

    const aTime = a.createdAt
      ? new Date(a.createdAt).getTime()
      : 0;
    const bTime = b.createdAt
      ? new Date(b.createdAt).getTime()
      : 0;

    return bTime - aTime || b.id - a.id;
  });

  // 渡された検索結果だけを集計する
  const summaries = new Map<string, ProductSummary>();
  if (showSummary && !isSearchEmpty) {
    for (const history of sortedHistories) {
      const key = getProductKey(history);
      // summary(要約)を定数に格納
      const summary = summaries.get(key) ?? {
        incoming: 0,
        outgoing: 0,
        adjustment: 0,
        lastHistoryId: history.id,
      };
      //入庫(IN)・出庫(OUT)の数量を集計する
      if (history.type === "IN") {
        summary.incoming += history.quantity;
      } else if (history.type === "OUT") {
        // 出庫履歴はマイナスで記録されるため、正の数にする
        summary.outgoing += Math.abs(history.quantity);
      } else if (history.type === "CHECK") {
        // 棚卸の差分を集計する
        summary.adjustment += history.quantity;
      }
      summary.lastHistoryId = history.id;
      summaries.set(key, summary);//最初に出てきた履歴のIDをlastHistoryIdryIdとして保持する
    }
  }

  return (
    <>
      <div className="history-table-controls">
        <h2 className="history-table-title">
          入出庫履歴集計テーブル
        </h2>
        <label className="history-summary-toggle">
          <input
            type="checkbox"
            checked={showSummary}
            onChange={(event) => setShowSummary(event.target.checked)}
          />
          {" "}集計を表示
        </label>

        {showSummary && (
          <p className="history-summary-description">
            検索結果内の入庫・出庫・棚卸差分を集計します。<br />
            期間内増減＝入庫計−出庫計＋棚卸差分。廃却は含みません。
          </p>
        )}
      </div>

      <table className="common-table history-table">
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
              <td colSpan={8} className="history-message-cell">
                検索内容を入力して検索してください
              </td>
            </tr>
          ) : histories.length === 0 ? (
            <tr>
              <td colSpan={8} className="history-message-cell">
                該当する入出庫履歴がありません
              </td>
            </tr>
          ) : (
            sortedHistories.map((history) => {
              const summary = summaries.get(getProductKey(history));

              return (
                <Fragment key={history.id}>
                  <tr>
                    <td>
                      {history.createdAt
                        ? new Date(history.createdAt).toLocaleString(
                          "ja-JP",
                          {
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
                    <td>{history.productCode}</td>
                    <td>{history.productShelf}</td>
                    <td>{history.productName}</td>
                    <td>{history.productSpecification ?? "未設定"}</td>
                    <td>
                      {getHistoryTypeLabel(history.type)}
                    </td>
                    <td>{history.quantity}</td>
                    <td>{history.memo ?? "なし"}</td>
                  </tr>

                  {summary &&
                    summary.lastHistoryId === history.id && (
                      <tr>
                        <td colSpan={5}>
                          {history.productShelf}・{history.productName}・
                          {history.productSpecification ?? "未設定"}
                        </td>
                        <td colSpan={3}>
                          <strong>
                            入庫計＝{summary.incoming}
                            <br />
                            出庫計＝{summary.outgoing}
                            <br />
                            棚卸差分＝{summary.adjustment}
                            <br />
                            期間内増減＝
                            {summary.incoming - summary.outgoing + summary.adjustment}
                          </strong>
                        </td>
                      </tr>
                    )
                  }
                </Fragment>
              );
            })
          )}
        </tbody>
      </table >
    </>
  );
}