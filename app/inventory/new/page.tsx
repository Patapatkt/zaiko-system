"use client"
import { createProduct } from "@/actions/inventory";
import Link from "next/link";
import { useActionState, useState } from "react";

export default function NewProductPage (){
    const [state, formAction,isPending] = useActionState(
        createProduct,    
        null
    );

    return(
        <main className="page-container">
            <h1 className="page-title">
                商品入庫
            </h1>

            <form action={formAction}className="space-y-4">
                <div>
                    <label>商品コード</label>
                    <input 
                    name="code"
                    className ="border p-2 w-full"
                    required
                    />
                </div>
                <div>
                    <label>棚番</label>
                    <input 
                    name="shelf"
                    className ="border p-2 w-full"
                    required
                    />
                </div>
                {/* 棚番の桁数が違う場合はエラー表示 */}
                {state?.error && (
                    <div className="text-red-500">
                        {state.error}
                    </div>
                )}
                <div>
                    <label>商品名</label>
                    <input 
                    name="name"
                    className ="border p-2 w-full"
                    required
                    />
                </div>
                <div>
                    <label>価格</label>
                    <input 
                    type="number"
                    name="price"
                    className ="border p-2 w-full"
                    required
                    />
                </div>
                <div>
                    <label>初期在庫</label>
                    <input 
                    type="number"
                    name="stock"
                    className ="border p-2 w-full"
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