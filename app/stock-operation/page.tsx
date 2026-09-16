import Link from "next/link";
import { requireApprovedUser } from "@/utils/auth";

export default async function StockOperationPage() {
    await requireApprovedUser();

    return (
        <main className="page-container">
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
        </main>
    );
}