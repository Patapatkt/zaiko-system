"use client"
import { checkProduct, createProduct, restockProduct } from "@/actions/inventory";
import Link from "next/link";
import { useActionState, useState } from "react";

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

    const [checkResult, setCheckResult,] =
        useState<CheckResult | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [checkError, setCheckError] = useState("");

     // 入力内容を変更したら、以前の確認結果を消す
    function resetCheckResult() {
        setCheckResult(null);
        setCheckError("");
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

            <div className="form-group">
                <label>棚番</label>
                <input
                    type="text"
                    value={shelf}
                    onChange={(event) => {
                        setShelf(event.target.value);
                        resetCheckResult();
                    }}
                    className="form-input"
                    minLength={6}
                    maxLength={6}
                    required
                />
            </div>

            <div className="form-group">
                <label>商品名</label>
                <input
                    type="text"
                    value={name}
                    onChange={(event) => {
                        setName(event.target.value);
                        resetCheckResult();
                    }}
                    className="form-input"
                    required
                />
            </div>

            <div className="form-group">
                <label>商品仕様</label>
                <input
                    type="text"
                    value={specification}
                    onChange={(event) => {
                        setSpecification(
                            event.target.value
                        );
                        resetCheckResult();
                    }}
                    className="form-input"
                    required
                />
            </div>

            <button
                type="button"
                onClick={handleProductCheck}
                className={
                    "button button-success search-button"
                }
                disabled={isChecking}
            >
                {isChecking
                    ? "確認中..."
                    : "商品を確認"}
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
                        棚番：
                        {checkResult.product.shelf ??
                            "未設定"}
                    </p>

                    <p>
                        商品名：
                        {checkResult.product.name}
                    </p>

                    <p>
                        商品仕様：
                        {checkResult.product
                            .specification ??
                            "未設定"}
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
                            value={
                                checkResult.product.id
                            }
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
                            className={
                                "button button-success search-button"
                            }
                            disabled={isRestocking}
                        >
                            {isRestocking
                                ? "入庫中..."
                                : "入庫する"}
                        </button>
                    </form>
                </div>
            )}

            {checkResult?.status ===
                "notFound" && (
                <>
                    <p style={{ color: "blue" }}>
                        一致する商品は未登録です。
                        入力内容を確認し、新商品なら
                        価格と初回入庫数量を入力してください。
                    </p>

                    <p>
                        棚番：
                        {
                            checkResult.inputValues
                                .shelf
                        }
                    </p>

                    <p>
                        商品名：
                        {
                            checkResult.inputValues
                                .name
                        }
                    </p>

                    <p>
                        商品仕様：
                        {
                            checkResult.inputValues
                                .specification
                        }
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
                            name="shelf"
                            value={
                                checkResult.inputValues
                                    .shelf
                            }
                        />

                        <input
                            type="hidden"
                            name="name"
                            value={
                                checkResult.inputValues
                                    .name
                            }
                        />

                        <input
                            type="hidden"
                            name="specification"
                            value={
                                checkResult.inputValues
                                    .specification
                            }
                        />

                        <div className="form-group">
                            <label>価格</label>
                            <input
                                type="number"
                                name="price"
                                className="form-input"
                                min={0}
                                step={1}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                初回入庫数量
                            </label>
                            <input
                                type="number"
                                name="stock"
                                className="form-input"
                                min={1}
                                step={1}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={
                                "button button-success search-button"
                            }
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
                className={
                    "button button-secondary"
                }
            >
                メニュー
            </Link>
        </main>
    );
}