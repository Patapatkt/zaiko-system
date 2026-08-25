"use client";

import { updateProduct } from "@/actions/inventory";
import Link from "next/link";
import { useActionState } from "react";
import ProductFormFields from "@/components/ProductFormFields";

type Product = {
    id: number;
    code: string;
    shelf: string | null;
    name: string;
    price: number;
    specification: string | null;
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

            <ProductFormFields
                defaultValues={{
                    code: product.code,
                    shelf: product.shelf ?? "",
                    name: product.name,
                    specification: product.specification ?? "",
                }}
            />
            
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