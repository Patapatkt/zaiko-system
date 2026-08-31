"use client"
import { checkProductCode, createProduct, restockProduct } from "@/actions/inventory";
import Link from "next/link";
import { useActionState, useState } from "react";
import ProductFormFields from "@/components/ProductFormFields";

type CheckResult =
    Awaited<ReturnType<typeof checkProductCode>>;

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
    const [code, setCode] = useState("");
    const [checkResult, setCheckResult] =
        useState<CheckResult | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [checkError, setCheckError] = useState("");

    // 商品コード確認ボタンを押したときの処理
    async function handleCodeCheck() {

        setIsChecking(true);
        setCheckError("");

        try {
            const result = await checkProductCode(code);
            setCheckResult(result);
        } catch (error) {
            console.error("商品コード確認エラー:", error);

            setCheckError(
                error instanceof Error
                    ? error.message
                    : "商品コードの確認中にエラーが発生しました。"
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

            <div className="form-group">
                <label>商品コード</label>
                <input
                    type="text"
                    value={code}
                    onChange={(event) => {
                        setCode(event.target.value);
                        setCheckResult(null);
                    }}
                    className="form-input"
                    required
                />
            </div>

            <button
                type="button"
                onClick={handleCodeCheck}
                className="button button-success search-button"
                disabled={isChecking}
            >
                {isChecking
                    ? "確認中..."
                    : "商品コードを確認"}
            </button>

            {checkError && (
                <p style={{ color: "red" }}>
                    {checkError}
                </p>
            )}

            {checkResult?.status === "error" && (
                <p style={{ color: "red" }}>
                    {checkResult.error}
                </p>
            )}

            {checkResult?.status === "deleted" && (
                <p style={{ color: "red" }}>
                    {checkResult.error}
                </p>
            )}

            {checkResult?.status === "found" && (
                <div>
                    <p style={{ color: "green" }}>
                        登録済みの商品です。
                    </p>

                    <p>
                        商品コード：
                        {checkResult.product.code}
                    </p>
                    <p>
                        棚番：
                        {checkResult.product.shelf ?? "未設定"}
                    </p>
                    <p>
                        商品名：
                        {checkResult.product.name}
                    </p>
                    <p>
                        商品仕様：
                        {checkResult.product.specification ?? "未設定"}
                    </p>
                    <p>
                        現在庫：
                        {checkResult.product.stock}
                    </p>

                    {restockState?.error && (
                        <p style={{ color: "red" }}>
                            {restockState.error}
                        </p>
                    )}

                    <form
                        action={restockAction}
                        className="space-y-4"
                    >
                        <input
                            type="hidden"
                            name="productId"
                            value={checkResult.product.id}
                        />

                        <div className="form-group">
                            <label>入庫数量</label>
                            <input
                                type="number"
                                name="quantity"
                                className="form-input"
                                min={1}
                                step={1}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="button button-success search-button"
                            disabled={isRestocking}
                        >
                            {isRestocking
                                ? "入庫中..."
                                : "入庫する"}
                        </button>
                    </form>
                </div>
            )}

            {checkResult?.status === "notFound" && (
                <>
                    <p style={{ color: "blue" }}>
                        この商品コードは未登録です。
                        入力内容を確認し、新商品なら
                        以下を入力してください。
                    </p>

                    {state?.error && (
                        <p style={{ color: "red" }}>
                            {state.error}
                        </p>
                    )}

                    <form
                        action={formAction}
                        className="space-y-4"
                    >
                        <input
                            type="hidden"
                            name="code"
                            value={checkResult.code}
                        />

                        <ProductFormFields showCode={false} />

                        <div className="form-group">
                            <label>価格</label>
                            <input
                                type="number"
                                name="price"
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>初回入庫数量</label>
                            <input
                                type="number"
                                name="stock"
                                className="form-input"
                                min={1}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="button button-success search-button"
                            disabled={isPending}
                        >
                            {isPending
                                ? "入庫中..."
                                : "新商品を登録して入庫"}
                        </button>

                    </form>
                </>
            )}


            <Link
                href="/dashboard"
                className="button button-secondary"
            >
                メニュー
            </Link>

        </main>
    )
}