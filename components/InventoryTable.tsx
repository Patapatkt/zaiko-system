// 検索結果の表示、編集・削除ボタンの表示コンポーネント

import Link from "next/link";
import type { products } from "@/db/schema";
import { deleteProduct } from "@/actions/inventory";

// 表の表示に必要な商品情報の型
type InventoryProduct = Pick<
    typeof products.$inferSelect,
    "id" | "code" | "shelf" | "name" | "specification" | "stock"
>;

type InventoryTableProps = {
    productList: InventoryProduct[];
    isSearchEmpty: boolean;
    isAdmin: boolean;
};

// 商品一覧の検索結果を表示する
export default function InventoryTable({
    productList,
    isSearchEmpty,
    isAdmin,
}: InventoryTableProps) {
    return (
        <div className="table-wrapper">
            <table className="common-table">
                <thead>
                    <tr>
                        <th>商品コード</th>
                        <th>棚番</th>
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
                                className="text-aliment-left p-4"
                            >
                                棚番・商品名・仕様を入力して検索してください
                            </td>
                        </tr>
                    ) : productList.length === 0 ? (
                        <tr>
                            <td
                                colSpan={6}
                                className="text-aliment-left p-4"
                            >
                                該当する商品はありません
                            </td>
                        </tr>
                    ) : (
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
                                            <form
                                                action={async () => {
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
    );
}