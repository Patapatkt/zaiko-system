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

                <div>
                    <form
                        action={async (formData) => {
                            "use server";
                            await updateProduct(product.id, formData);
                        }}
                    >
                        <div className="form-group">
                            <label>商品コード</label>
                            <input
                                name="code"
                                defaultValue={product.code}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>商品名</label>
                            <input
                                name="name"
                                defaultValue={product.name}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>価格</label>
                            <input
                                type="number"
                                name="price"
                                defaultValue={product.price}
                                className="form-input"
                            />
                        </div>
                        <div className="header-actions">
                            <button type="submit"
                                className="button button-success">
                                更新
                            </button>
                            <Link
                                href="/dashboard"
                                className="button button-secondary"
                            >
                                メニュー
                            </Link>
                        </div>
                    </form>
                </div>

            </div>
        </main>
    )
};