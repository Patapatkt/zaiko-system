"use client"
import { checkProduct, createProduct, restockProduct } from "@/actions/inventory";
import ProductCheckForm from "@/components/ProductCheckForm";
import Link from "next/link";
import { useActionState, useState } from "react";
import ExistingProductRestockForm from "@/components/ExistingProductRestockForm";
import { ScannedProduct } from "@/types/scanned-product";
import ProductQrScanner from "@/components/ProductQrScanner";
import NewProductRegistrationForm
    from "@/components/NewProductRegistrationForm";

type CheckResult =
    Awaited<ReturnType<typeof checkProduct>>;

export default function NewProductPage() {
    const [state, formAction, isPending] = useActionState(
        createProduct,
        null
    );
    const [
        restockState,
        restockAction,
        isRestocking,
    ] = useActionState(
        restockProduct,
        null
    );

    const [shelf, setShelf] = useState("");
    const [name, setName] = useState("");
    const [specification, setSpecification] = useState("");

    const [checkResult, setCheckResult] =
        useState<CheckResult | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [checkError, setCheckError] = useState("");

    // 入力内容を変更したら、以前の確認結果を消す
    function resetCheckResult() {
        setCheckResult(null);
        setCheckError("");
    }

    // QR結果を入力欄へ反映する
    function handleQrRead(product: ScannedProduct) {
        setShelf(product.shelf);
        setName(product.name);
        setSpecification(product.specification);
        resetCheckResult();
    }


    // 棚番・商品名・仕様を確認する
    async function handleProductCheck() {
        setIsChecking(true);
        setCheckError("");

        try {
            const result = await checkProduct(
                shelf,
                name,
                specification
            );

            setCheckResult(result);
        } catch (error) {
            console.error(
                "商品確認エラー:",
                error
            );

            setCheckError(
                error instanceof Error
                    ? error.message
                    : "商品の確認中にエラーが発生しました。"
            );
        } finally {
            setIsChecking(false);
        }

    }

    return (
        <main className="page-container">
            <h1 className="page-title">
                商品入庫
            </h1>

            <div className="qr-input-area">
                <h2 className="qr-method-title">
                    QRコードを読み取る
                </h2>

                <ProductQrScanner
                    onRead={handleQrRead}
                />

                <p className="qr-form-help">
                    読み取らない場合は、下の入力欄に手動入力
                </p>
            </div>

            <div className="input-method-divider">
                <span>または手入力</span>
            </div>

            <ProductCheckForm
                shelf={shelf}
                setShelf={setShelf}
                name={name}
                setName={setName}
                specification={specification}
                setSpecification={setSpecification}
                resetCheckResult={resetCheckResult}
            />

            <div className="product-actions">
                <button
                    type="button"
                    onClick={handleProductCheck}
                    className={
                        "button button-success"
                    }
                    disabled={isChecking}
                >
                    {isChecking
                        ? "確認中..."
                        : "商品を確認"}
                </button>

                {checkError && (
                    <p className="error-message">
                        {checkError}
                    </p>
                )}

                {checkResult &&
                    (checkResult.status === "error" ||
                        checkResult.status === "deleted") && (
                        <p className="error-message">
                            {checkResult.error}
                        </p>
                    )}

                {checkResult?.status === "found" && (
                    <ExistingProductRestockForm
                        product={checkResult.product}
                        isRestocking={isRestocking}
                        restockAction={restockAction}
                        restockState={restockState}
                    />
                )}

                {checkResult?.status ===
                    "notFound" && (
                        <NewProductRegistrationForm
                            inputValues={checkResult.inputValues}
                            error={state?.error}
                            formAction={formAction}
                            isPending={isPending}
                        />
                    )}

                <Link
                    href="/dashboard"
                    className={
                        "button button-secondary"
                    }
                >
                    メニュー
                </Link>
            </div>
        </main>
    );
}