// 出庫処理画面のコンポート
"use client";

import { useState } from "react";
import { checkPickingProduct } from "@/actions/picking";

type CheckResult =
    Awaited<
        ReturnType<typeof checkPickingProduct>
    >
type PickingFormProps = {
    username: string;
};

export default function PickingForm({
    username,
}: PickingFormProps) {
    // 出庫目的として指定された仕様
    const [requestedSpecification,
        setRequestedSpecification,]
        = useState("");

    // 読み取った棚番
    const [shelf, setShelf] =
        useState("");

    // 読み取った品番（商品名）
    const [name, setName] =
        useState("");

    // 商品確認の結果
    const [checkResult, setCheckResult] =
        useState<CheckResult | null>(null);

    // 商品確認処理中か
    const [isChecking, setIsChecking] =
        useState(false);

    // 予期しないエラー
    const [checkError, setCheckError] =
        useState("");

    // 実際に出庫する商品。未選択ならnull
    const [selectedProductId, setSelectedProductId] =
        useState<number | null>(null);

    function resetCheckResult() {
        setCheckResult(null);
        setSelectedProductId(null);
        setCheckError("");
    }

    async function handleProductCheck() {
        setIsChecking(true);
        setCheckResult(null);
        setSelectedProductId(null);
        setCheckError("");

        try {
            const result =
                await checkPickingProduct(
                    shelf,
                    name,
                    requestedSpecification
                );

            setCheckResult(result);
        } catch (error) {
            console.error(
                "出庫商品の確認エラー:",
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
        <section className="picking-form">
            <p>
                ログインユーザー：
                {username}さん
            </p>

            <div className="product-form">
                <div className="form-group">
                    <label
                        htmlFor="requestedSpecification"
                    >
                        出庫目的（指定仕様）
                    </label>

                    <select
                        id="requestedSpecification"
                        name="requestedSpecification"
                        value={requestedSpecification}
                        onChange={(event) => {
                            setRequestedSpecification(
                                event.target.value
                            );
                            resetCheckResult();
                        }}
                        className="form-input"
                        required
                    >
                        <option value="">
                            選択してください
                        </option>

                        <option value="通常品">
                            通常品
                        </option>

                        <option value="予備用">
                            予備用
                        </option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="pickingShelf">
                        棚番
                    </label>

                    <input
                        id="pickingShelf"
                        type="text"
                        name="shelf"
                        value={shelf}
                        onChange={(event) => {
                            setShelf(
                                event.target.value
                                    .toUpperCase()
                            );
                            resetCheckResult();
                        }}
                        placeholder="6桁の棚番を入力"
                        className="form-input"
                        maxLength={6}
                        required
                    />

                    <p>
                        現在は手入力してください。
                        QR読取は後から追加します。
                    </p>
                </div>

                <div className="form-group">
                    <label htmlFor="pickingName">
                        品番（商品名）
                    </label>

                    <input
                        id="pickingName"
                        type="text"
                        name="name"
                        value={name}
                        onChange={(event) => {
                            setName(
                                event.target.value
                            );
                            resetCheckResult();
                        }}
                        placeholder="品番（商品名）を入力"
                        className="form-input"
                        required
                    />

                    <p>
                        現在は手入力してください。
                        QR読取は後から追加します。
                    </p>

                </div>


                <button
                    type="button"
                    onClick={handleProductCheck}
                    className="button button-success"
                    disabled={isChecking}
                >
                    {isChecking
                        ? "確認中..."
                        : "商品を確認"}
                </button>

                <div className="product-actions">
                    {checkError && (
                        <p className="error-message">
                            {checkError}
                        </p>
                    )}

                    {checkResult?.status === "error" && (
                        <p className="error-message">
                            {checkResult.error}
                        </p>
                    )}

                    {checkResult?.status === "found" && (
                        <div className="picking-result">
                            <p>
                                読み取った商品：
                                {checkResult.scannedProduct.name}
                            </p>

                            <p>
                                読み取った棚番：
                                {checkResult.scannedProduct.shelf}
                            </p>

                            <p>
                                指定仕様：
                                {
                                    checkResult
                                        .requestedSpecification
                                }
                            </p>

                            <h2>実際に出庫する商品を選択</h2>

                            <ul>
                                {checkResult.candidates.map((product) => (
                                    <li key={product.id}>
                                        <label>
                                            <input
                                                type="radio"
                                                name="selectedProductId"
                                                value={product.id}
                                                checked={
                                                    selectedProductId === product.id
                                                }
                                                onChange={() => {
                                                    setSelectedProductId(product.id);
                                                }}
                                            />
                                            {" "}
                                            仕様：
                                            {product.specification ?? "未設定"}
                                            ／棚番：
                                            {product.shelf ?? "未設定"}
                                            ／在庫：
                                            {product.stock}
                                        </label>
                                    </li>
                                ))}
                            </ul>

                            {selectedProductId !== null && (
                                <p>
                                    出庫対象を選択しました。
                                    この段階では在庫は減りません。
                                </p>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
}