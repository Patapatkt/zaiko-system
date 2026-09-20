//在庫メンテナンス画面
import { requireAdmin } from "@/utils/auth";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { updateStock, adjustStock } from "@/actions/inventory";
import Link from "next/link";
import StockAdjustment from "@/components/StockAdjustment";
import StockOperation from "@/components/StockOperation";

export default async function StockPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    // 管理者以外はここで処理を止める
    await requireAdmin();
    const { id } = await params;

    const productId = Number(id);

    const product =
        await db.query.products.findFirst({
            where: eq(products.id, productId),
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

            <StockOperation action={stockAction} />

            <StockAdjustment action={adjustAction} />

            <div className="stock-menu-actions">
                <Link
                    href="/inventory/stock"
                    className="button button-secondary"
                >
                    メニュー
                </Link>
            </div>
        </main >

    )
}