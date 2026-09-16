"use client"

import { restockProduct } from "@/actions/inventory";
import { checkProduct } from "@/actions/inventory";
import { useActionState } from "react";

type CheckResult =
    Awaited<ReturnType<typeof checkProduct>>;

type FoundResult = Extract<
    CheckResult,
    { status: "found" }
>;

type Product = FoundResult["product"];//FoundResult の中にある product の型を取り出してください

type ExistingProductRestockFormProps = {
    // 親から受け取るものを書く
    product: Product;
};

export default function ExistingProductRestockForm({
    // 受け取る
    product,//どの商品？
}: ExistingProductRestockFormProps) {
    const [
        restockState,
        restockAction,
        isRestocking,
    ] = useActionState(
        restockProduct,
        null
    );  

    return (
        <div className="existing-product-restock">
            <p style={{ color: "green" }}>
                登録済みの商品です。
            </p>

            <p>
                棚番：
                {product.shelf ??
                    "未設定"}
            </p>

            <p>
                商品名：
                {product.name}
            </p>

            <p>
                商品仕様：
                {product
                    .specification ??
                    "未設定"}
            </p>

            <p>
                現在庫：
                {product.stock}
            </p>

            {restockState?.error && (
                <p style={{ color: "red" }}>
                    {restockState.error}
                </p>
            )}

            <form
                action={restockAction}
                className="restock-form"
            >
                <input
                    type="hidden"
                    name="productId"
                    value={
                        product.id
                    }
                />

                <div className="form-group">
                    <label>入庫数量</label>
                    <input
                        type="number"
                        name="quantity"
                        placeholder="入庫数量を入力"
                        className="form-input"
                        min={1}
                        step={1}
                        required
                    />
                    <p>0以上の数字を入力してください</p>
                </div>

                <button
                    type="submit"
                    className="button button-success"
                    disabled={isRestocking}
                >
                    {isRestocking
                        ? "入庫中..."
                        : "入庫する"}
                </button>

            </form>

        </div>
    )
}