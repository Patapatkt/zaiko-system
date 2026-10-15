// 商品一覧の在庫照会
import Link from "next/link";
import SearchForm from "@/components/SearchForm";
import InventoryTable from "@/components/InventoryTable";
import { getInventoryPageData } from "@/lib/queries/inventory";
// 型定義
type InventoryPageProps = {
    searchParams: Promise<{
        name?: string;
        shelf?: string;
        specification?: string;
        success?: string;
    }>;
};

export default async function InventoryPage({
    searchParams,
}: InventoryPageProps) {
    const params = await searchParams;

    const {
        productList,
        isSearchEmpty,
        isAdmin,
        name,
        shelf,
        specification,
    } = await getInventoryPageData(params);

    const exportParams = new URLSearchParams({
        name,
        shelf,
        specification,
    });

    return (

        <main className="page-container">
            <div className="page-header">
                <h1 className="page-title">商品一覧</h1>
            </div>
            {params.success === "created" && (
                <p className="success-message">
                    商品登録成功
                </p>
            )}
            <SearchForm
                action="/inventory"
                name={name}
                shelf={shelf}
                specification={specification}
            />

            {!isSearchEmpty && productList.length > 0 && (
                <div className="header-actions">
                    <Link
                        href={`/inventory/export?${exportParams.toString()}`}
                        className="button button-secondary"
                    >
                        検索結果をCSV出力
                    </Link>
                </div>
            )}

            <InventoryTable
                productList={productList}
                isSearchEmpty={isSearchEmpty}
                isAdmin={isAdmin}
            />

            {/* 履歴画面 */}
            <div className="header-actions">
                <Link href="/history"
                    className="button button-primary"
                >
                    履歴画面
                </Link>

                <Link href="/dashboard"
                    className="button button-secondary">
                    メニュー
                </Link>
            </div>
        </main>
    );
}