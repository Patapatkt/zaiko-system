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
    // 管理者以外はここで処理を止める
    await requireAdmin();
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
            <section className="stock-operation-section">
                <h2 className="section-title">
                    入出庫調整
                </h2>

                <form
                    action={stockAction}
                    className="stock-form"
                >
                    <div>
                        <label>調整数量</label>
                        <input
                            id="quantity"
                            name="quantity"
                            type="number"
                            min="1"
                            step="1"
                            required
                            className="border p-2 w-full"
                            placeholder="1以上の整数を入力"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="memo"
                            className="block font-bold mb-1"
                        >
                            在庫数変更理由
                        </label>

                        <select
                            id="memo"
                            name="reason"
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
                            type="submit"
                            name="operation"
                            value="IN"
                            className="button button-success"
                        >
                            入庫
                        </button>

                        <button
                            type="submit"
                            name="operation"
                            value="OUT"
                            className="button button-danger"
                        >
                            出庫
                        </button>
                    </div>
                </form>
            </section>

            <section className="stock-adjustment-section">
                <h2 className="section-title">
                    棚卸
                </h2>

                <p className="form-help">
                    実際に数えた現在庫数を入力してください。
                </p>

                <form
                    action={adjustAction}
                    className="stock-form"
                >
                    <div>
                        <label htmlFor="actualStock">
                            実在庫数
                        </label>

                        <input
                            id="actualStock"
                            name="actualStock"
                            type="number"
                            min="0"
                            step="1"
                            required
                            className="border p-2 w-full"
                            placeholder="0以上の整数を入力"
                        />
                    </div>

                    <div>
                        <label htmlFor="adjustMemo">
                            棚卸理由
                        </label>

                        <select
                            id="adjustMemo"
                            name="memo"
                            required
                            defaultValue=""
                            className="border p-2 w-full rounded"
                        >
                            <option value="" disabled>
                                理由を選択してください
                            </option>

                            <option value="定期棚卸">
                                定期棚卸
                            </option>

                            <option value="棚卸差異">
                                棚卸差異
                            </option>

                            <option value="在庫数再確認">
                                在庫数再確認
                            </option>

                            <option value="その他">
                                その他
                            </option>
                        </select>
                    </div>

                    <div className="header-actions">
                        <button
                            type="submit"
                            className="button button-primary"
                        >
                            棚卸を反映
                        </button>
                    </div>
                </form>
            </section>


            <Link
                href="/inventory/stock"
                className="button button-secondary"
            >
                メニュー
            </Link>

        </main >

    )
}