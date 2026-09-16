//出庫用バックエンドファイル
"use server";

// 読み込みファイル
import "server-only";
import { db } from "@/db";
import { products } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";//isNull:指定した列の値がnull商品を検索
import { requireApprovedUser } from "@/utils/auth";

//型設定　画面に表示させる商品情報の項目
type PickingProduct = {
    id: number;
    shelf: string | null;
    name: string;
    specification: string | null;
    stock: number;
};


//型設定　出庫商品の項目取得が成功した場合
type PickingCheckResult =
    | {
        status: "found";
        requestedSpecification: string;
        scannedProduct: PickingProduct;
        candidates: PickingProduct[];
    }
    //型設定　出庫対象商品の項目が取得失敗した場合
    | {
        status: "error";
        error: string;
    };

//棚番・商品名を確認し、仕様違いの商品候補を取得する
export async function checkPickingProduct(
    inputShelf: string,
    inputName: string,
    inputRequestedSpecification: string
): Promise<PickingCheckResult> {
    await requireApprovedUser();

    // 入力内容を整える(不要な空白を除去、棚番の大文字化)
    const shelf =
        inputShelf.trim().toUpperCase();
    const name =
        inputName.trim();
    const requestedSpecification =
        inputRequestedSpecification.trim();

    // 棚番のガード節
    if (!shelf || shelf.length !== 6) {
        return {
            status: "error",
            error:
                "棚番を6桁で入力してください。",
        };
    }

    // 商品名のガード節
    if (!name) {
        return {
            status: "error",
            error:
                "商品名を入力してください。",
        };
    }

    // 指定仕様のガード節
    if (!requestedSpecification) {
        return {
            status: "error",
            error:
                "出庫目的（指定仕様）を選択してください。",
        };
    }

    // 削除されていない、同じ商品名の商品をすべて取得
    const candidates =
        await db.query.products.findMany({
            //一致している商品を検索
            where: and(
                eq(products.name, name),
                isNull(products.deletedAt)
            ),
            columns: {//検索結果より見つかった商品から下記項目を取得
                id: true,
                shelf: true,
                name: true,
                specification: true,
                stock: true,
            },
        });

    // 同じ商品名の商品が存在しない場合
    if (candidates.length === 0) {
        return {
            status: "error",
            error:
                "該当する商品が見つかりません。",
        };
    }

    // 読み取った棚番と一致する商品を探す
    const scannedProduct =
        candidates.find(
            (product) =>
                product.shelf === shelf
        );

    // 商品名は存在するが棚番が一致しない場合
    if (!scannedProduct) {
        return {
            status: "error",
            error:
                "読み取った棚番と商品の登録棚番が一致しません。",
        };
    }

    return {//返り値
        status: "found",
        requestedSpecification,//ピッキングリストより指定された仕様
        scannedProduct,// 読み取った棚番と一致する商品
        candidates,// 削除されていない、同じ商品名の仕様候補一覧
    };

}