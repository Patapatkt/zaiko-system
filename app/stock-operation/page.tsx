import Link from "next/link";
import { requirePicker } from "@/utils/auth"

export default async function StockOperationPage() {
    await requirePicker();

    return (
        <main className="page-container">
            <div className="stock-operation-actions">
                <h1 className="page-title">
                    入出庫操作
                </h1>

                <div className="product-actions">
                    <Link
                        href="/inventory/new"
                        className="button button-primary"
                    >
                        商品入庫
                    </Link>

                    <Link
                        href="/picking"
                        className="button button-primary"
                    >
                        商品出庫（デモ）
                    </Link>

                    <Link
                        href="/dashboard"
                        className="button button-secondary"
                    >
                        メニュー
                    </Link>
                </div>
            </div>
        </main>
    );
}