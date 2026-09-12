import type { ScannedProduct } from "@/types/scanned-product";

// QRコードの文字列を商品情報へ変換する
export function parseProductQr(
    decodedText: string
): ScannedProduct {
    let parsedData: unknown;
    try {
        parsedData = JSON.parse(decodedText);
    } catch {
        throw new Error(
            "QRコードの形式が正しくありません"
        );
    }
    if (
        typeof parsedData !== "object" ||
        parsedData === null
    ) {
        throw new Error(
            "QRコードに商品情報がありません"
        );
    }

    const product = parsedData as Record<
        string,
        unknown
    >;

    if (
        typeof product.shelf !== "string" ||
        typeof product.name !== "string" ||
        typeof product.specification !== "string"
    ) {
        throw new Error(
            "QRコードの商品情報が不足しています"
        );
    }

    const shelf = product.shelf
    .trim()
    .toUpperCase();
    const name = product.name.trim();
    const specification = product
    .specification.trim();

    if (!shelf || !name || !specification) {
        throw new Error(
            "QRコードの商品情報が空白です"
        );
    }

    return {
        shelf,
        name,
        specification
    };
}