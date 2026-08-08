import { createProduct } from "@/actions/inventory";
import Link from "next/link";

export default function NewProductPage (){
    return(
        <main className="page-container">
            <h1 className="page-title">
                商品入庫
            </h1>

            <form action={createProduct}className="space-y-4">
                <div>
                    <label>商品コード</label>
                    <input 
                    name="code"
                    className ="border p-2 w-full"
                    required
                    />
                </div>
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
                    入庫
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