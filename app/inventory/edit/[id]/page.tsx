import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { notFound } from "next/navigation";
import { updateProduct } from "@/actions/inventory";
import Link from "next/link";

export default async function EditPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const result = await db
        .select()
        .from(products)
        .where(eq(products.id, Number(id)))
        .limit(1);

    const product = result[0];

    if (!product) {
        notFound();
    }

    return (
        <main className="page-container">
            <div>
                <h1 className="page-title">
                    商品編集
                </h1>
                <div className="header-actions">
                    <button type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded">
                        更新
                    </button>
                    <Link
                        href="/dashboard"
                        className="button button-primary"
                    >
                        メニュー画面へ戻る
                    </Link>
                    <form
                        action={async (formData) => {
                            "use server";
                            await updateProduct(product.id, formData);
                        }}
                    >
                        <div>
                            <label>商品コード</label>
                            <input
                                name="code"
                                defaultValue={product.code}
                            />
                            <label>商品名</label>
                            <input
                                name="name"
                                defaultValue={product.name}
                            />
                            <label>価格</label>
                            <input
                                type="number"
                                name="price"
                                defaultValue={product.price}
                            />
                            <button type="submit"
                                className="button button-primary">
                                更新
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    )
};