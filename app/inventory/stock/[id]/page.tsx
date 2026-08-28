//在庫メンテナンス画面
import { requireAdmin } from "@/utils/auth";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { updateStock, adjustStock } from "@/actions/inventory";
import Link from "next/link";

export default async function stockPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const product = await db.query.products.findFirst({
        where: eq(products.id, Number(id)),
    });

    const stockAction = updateStock.bind(null, Number(id));
    const adjustAction = adjustStock.bind(null, Number(id));

    if (!product) {
        return <p>商品が見つかりません。</p>
    }

    return (
        <main className="page-container">
            <div className="page-header">
                <h1 className="page-title">
                    在庫メンテナンス
                </h1>
            </div>
            <div className="product-info">
                <p><strong>商品コード:</strong>{product.code}</p>
                <p><strong>商品名:</strong>{product.name}</p>
                <p><strong>現在庫:</strong>{product.stock}</p>
            </div>

            <form
                action={stockAction}
                className="space-y-4">
                <div>
                    <label>調整数量</label>
                    <input
                        name="quantity"
                        type="number"
                        className="border p-2 w-full"
                    />
                </div>
                <div>
                    <label
                        htmlFor="memo"
                        className="block font-bold mb-1"
                    >
                        在庫変更理由
                    </label>

                    <select
                        id="memo"
                        name="memo"
                        className="border p-2 w-full rounded"
                        required
                        defaultValue=""
                    >
                        <option value="" disabled>
                            理由を選択してください
                        </option>

                        <option value="入出庫忘れ">
                            入出庫忘れ
                        </option>

                        <option value="商品破損">
                            商品破損
                        </option>

                        <option value="棚卸差異">
                            棚卸差異
                        </option>

                        <option value="その他">
                            その他
                        </option>

                    </select>
                    <input
                        name="memo"
                        className="form-input"
                        placeholder="補足があれば入力"
                    />
                </div>
                <div className="header-actions">
                    <button
                        className="button button-success search-button"
                    >
                        更新
                    </button>
                </div>
            </form>
        <Link
            href="/inventory/stock"
            className="button button-secondary"
        >
            メニュー
        </Link>

        </main >

    )
}