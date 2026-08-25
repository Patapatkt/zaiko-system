import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { notFound } from "next/navigation";
import EditProductForm from "./EditProductForm";

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
                    <EditProductForm 
                        product={{
                            id: product.id,
                            code: product.code,
                            shelf: product.shelf??"",
                            name: product.name,
                            specification: product.specification,
                            price: product.price,
                        }}
                        />
                </div>
            </div>
        </main>
    )
};