// QRコードスキャナーのコンポーネント
"use client";

import { useEffect, useRef, useState } from "react";
import type { Html5Qrcode } from "html5-qrcode";
import type { ScannedProduct } from "@/types/scanned-product";
import { parseProductQr } from "@/utils/parse-product-qr";

type ProductQrScannerProps = {
    onRead: (product: ScannedProduct) => void;
};

const QR_READER_ID = "product-qr-reader";

// カメラを停止してスキャナーを片付ける
async function cleanupScanner(
    scanner: Html5Qrcode
) {
    try {
        await scanner.stop();
    } catch {
        // すでに停止している場合は何もしない
    }
    try {
        scanner.clear();
    } catch {
        // すでに片付けられている場合は何もしない
    }
}

export default function ProductQrScanner({
    onRead,
}: ProductQrScannerProps) {
    const scannerRef =
        useRef<Html5Qrcode | null>(null);

    const isProcessingScanRef =
        useRef(false);

    const [isScanning, setIsScanning] =
        useState(false);
    const [scanError, setScanError] =
        useState("");

    // カメラを停止する
    async function stopScanner() {
        const scanner = scannerRef.current;

        if (!scanner) {
            return;
        }

        scannerRef.current = null;

        await cleanupScanner(scanner);
        setIsScanning(false);
    }

    // QRコードの読取成功後に商品情報へ変換する
    async function handleScanSuccess(
        decodedText: string
    ) {
        if (isProcessingScanRef.current) { // 読取処理中に再度検出された場合は何もしない
            return;
        }

        isProcessingScanRef.current = true;

        try {
            await stopScanner();

            const product =
                parseProductQr(decodedText);

            onRead(product);
        } catch (error) {
            setScanError(
                error instanceof Error
                    ? error.message
                    : "QRコードの読取に失敗しました。"
            );
        } finally {
            isProcessingScanRef.current = false;
        }
    }

    // カメラを起動する
    async function startScanner() {
        setScanError("");
        setIsScanning(true);

        try {
            const { Html5Qrcode } =
                await import("html5-qrcode"); // カメラ起動時にのみhtml5-qrcodeを読み込む

            const scanner =
                new Html5Qrcode(QR_READER_ID);

            scannerRef.current = scanner;

            await scanner.start(
                {
                    facingMode: "environment",// 背面カメラを優先する
                },
                {
                    fps: 10,
                    qrbox: {
                        width: 250,
                        height: 250,
                    },
                },
                (decodedText) => {
                    void handleScanSuccess(
                        decodedText
                    );
                },
                () => {
                    // QRが映っていない間の読取失敗は表示しない
                }
            );
        } catch {
            const scanner = scannerRef.current;
            scannerRef.current = null;
            //起動失敗時、作成済みのスキャナー機能を片付ける 
            if(scanner){
                await cleanupScanner(scanner);
            }
            
            setIsScanning(false);
            setScanError(
                "カメラを起動できませんでした。権限を確認してください。"
            );
        }
    }

    // 画面を離れるときにもカメラを停止する
    useEffect(() => {
        return () => {
            const scanner = scannerRef.current;

            scannerRef.current = null;

            if (scanner) {
                void cleanupScanner(scanner);
            }
        };
    }, []);

    return (
        <section className="qr-scanner">
            <button
                type="button"
                className="button button-success"
                onClick={startScanner}
                disabled={isScanning}
            >
                {isScanning
                    ? "読取中..."
                    : "QRコードを読み取る"}
            </button>

            {isScanning && (
                <button
                    type="button"
                    className="button button-secondary"
                    onClick={stopScanner}
                >
                    カメラを停止
                </button>
            )}

            <div id={QR_READER_ID} />

            {scanError && (
                <p className="error-message">
                    {scanError}
                </p>
            )}
        </section>
    );
}