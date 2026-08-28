"use client"
import { createProduct } from "@/actions/inventory";
import Link from "next/link";
import { useActionState, useState } from "react";
import ProductFormFields from "@/components/ProductFormFields";

export default function NewProductPage() {
    const [state, formAction, isPending] = useActionState(
        createProduct,
        null
    );

    return (
        <main className="page-container">
            <h1 className="page-title">
                商品入庫
            </h1>
            {state?.error &&(
                 <p style={{ color: "red"}}>
                    {state.error}
                </p>
            )

            }
            <form action={formAction} className="space-y-4">
                <ProductFormFields/>

                <div>
                    <label>価格</label>
                    <input
                        type="number"
                        name="price"
                        className="border p-2 w-full"
                        required
                    />
                </div>
                <div>
                    <label>初期在庫</label>
                    <input
                        type="number"
                        name="stock"
                        className="border p-2 w-full"
                        defaultValue={0}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="button button-success search-button"
                >
                    {isPending ? "入庫中..." : "入庫"}
                </button>
            </form>

            <Link
                href="/dashboard"
                className="button button-secondary"
            >
                メニュー
            </Link>

        </main>
    )
}