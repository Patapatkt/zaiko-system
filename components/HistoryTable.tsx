import { products, stockHistories } from "@/db/schema";

type History = Pick<
  typeof stockHistories.$inferSelect,
  "id" | "quantity" | "type" | "memo" | "createdAt"
> & {
  productCode: typeof products.$inferSelect.code;
  productShelf: typeof products.$inferSelect.shelf;
  productName: typeof products.$inferSelect.name;
  productSpecification: typeof products.$inferSelect.specification;
};

type HistoryTableProps = {
  histories: History[];
  isSearchEmpty: boolean;
};

export default function HistoryTable({
  histories,
  isSearchEmpty,
}: HistoryTableProps) {
  return (
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
              <td>{history.productCode}</td>
              <td>{history.productShelf}</td>
              <td>{history.productName}</td>
              <td>{history.productSpecification ?? "未設定"}</td>
              <td>
                {history.type === "IN"
                  ? "入庫"
                  : history.type === "OUT"
                    ? "出庫"
                    : history.type === "CHECK"
                      ? "棚卸"
                      : "要確認"}
              </td>
              <td>{history.quantity}</td>
              <td>{history.memo ?? "なし"}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}