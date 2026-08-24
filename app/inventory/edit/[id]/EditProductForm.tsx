"use client";

import { updateProduct } from "@/actions/inventory";
import Link from "next/link";
import { useActionState } from "react";

type Product = {
    id: number;
    code: string;
    shelf: string;
    name: string;
    price: number;
}

export default function EditProductForm({
    product,
}: {
    product: Product;
}) {
    const updateProductWithId = updateProduct.bind(
        null,
        product.id
    );

    const [state, formAction, isPending] = useActionState(
        updateProductWithId,
        null
    );

    return (
        <form action={formAction}>
            {state?.error && (
                <p className="error-message">
                    {state.error}
                </p>
            )}

            <div className="form-group">
                <label>商品コード</label>
                <input
                    name="code"
                    defaultValue={product.code}
                    className="form-input"
                    required
                />
            </div>

            <div className="form-group">
                <label>棚番</label>
                <input
                    type="text"
                    name="shelf"
                    defaultValue={product.shelf}
                    className="form-input"
                    minLength={6}
                    maxLength={6}
                    required
                />
            </div>

            <div className="form-group">
                <label>商品名</label>
                <input
                    name="name"
                    defaultValue={product.name}
                    className="form-input"
                    required
                />
            </div>

            <div className="form-group">
                <label>価格</label>
                <input
                    type="number"
                    name="price"
                    defaultValue={product.price}
                    className="form-input"
                    required
                />
            </div>

            <div className="header-actions">
                <button
                    type="submit"
                    disabled={isPending}
                    className="button button-success"
                >
                    {isPending ? "更新中..." : "更新"}
                </button>

                <Link
                    href="/dashboard"
                    className="button button-secondary"
                >
                    メニュー
                </Link>
            </div>
        </form>
    );
}