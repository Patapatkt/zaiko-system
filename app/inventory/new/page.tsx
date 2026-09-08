"use client"
import { checkProduct, createProduct, restockProduct } from "@/actions/inventory";
import ProductCheckForm from "@/components/ProductCheckForm";
import Link from "next/link";
import { useActionState, useState } from "react";
import ExistingProductRestockForm from "@/components/ExistingProductRestockForm";

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
                    <ExistingProductRestockForm
                        product={checkResult.product}
                        isRestocking={isRestocking}
                        restockAction={restockAction}
                        restockState={restockState}
                    />
                )}
                    {/* {/* //     <p>
                    //         棚番：
                    //         {checkResult.product.shelf ??
                    //             "未設定"}
                    //     </p>

                    //     <p>
                    //         商品名：
                    //         {checkResult.product.name}
                    //     </p>

                    //     <p>
                    //         商品仕様：
                    //         {checkResult.product
                    //             .specification ??
                    //             "未設定"}
                    //     </p>

                    //     <p>
                    //         現在庫：
                    //         {checkResult.product.stock}
                    //     </p>

                    //     {restockState?.error && (
                    //         <p style={{ color: "red" }}>
                    //             {restockState.error}
                    //         </p>
                    //     )}

                    //     <form
                    //         action={restockAction}
                    //         className="space-y-4"
                    //     >
                    //         <input
                    //             type="hidden"
                    //             name="productId"
                    //             value={
                    //                 checkResult.product.id
                    //             }
                    //         />

                    //         <div className="form-group">
                    //             <label>入庫数量</label>
                    //             <input
                    //                 type="number"
                    //                 name="quantity"
                    //                 placeholder="入庫数量を入力"
                    //                 className="form-input"
                    //                 min={1}
                    //                 step={1}
                    //                 required
                    //             />
                                // <p>0以上の数字を入力してください</p>
    // *} */}
                            {/* <button
                                type="submit"
                                className={
                                    "button button-success search-button"
                                }
                                disabled={isRestocking}
                            >
                                {isRestocking
                                    ? "入庫中..."
                                    : "入庫する"}
                            </button> */}
                    
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
                                className="form-action"
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
                                        "button-success"
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
            </div>
        </main>
    );
}