"use client";

import { useActionState } from "react";//useActionStateをインポート
import type { StockAdjustmentState } from "@/actions/stock";//StockAdjustmentStateをインポート

// 棚卸フォームのコンポーネント
type StockAdjustmentProps = {
    action: (
        previousState: StockAdjustmentState,//前の状態を引数として受け取り、Promiseを返す関数
        formData: FormData
    ) => Promise<StockAdjustmentState>;//Promiseを返す関数の型を定義
};

export default function StockAdjustment({
    action,
}: StockAdjustmentProps) {//StockAdjustmentProps型のactionを受け取る
    // useActionStateフックを使用して、アクションの状態、フォームのアクション、および保留中の状態を取得
    const [state, formAction, isPending] = useActionState(
        action,
        null
    );
    return (
        <section className="stock-adjustment-section">
            <h2 className="section-title">
                棚卸
            </h2>

            <p className="form-help">
                実際に数えた現在庫数を入力してください。
            </p>

            <form
                action={formAction}
                className="stock-form"
            >
                {state?.error && (
                    <p className="error-message" role="alert">
                        {state.error}
                    </p>
                )}
                <div>
                    <label htmlFor="actualStock">
                        実在庫数
                    </label>

                    <input
                        id="actualStock"
                        name="actualStock"
                        type="number"
                        min="0"
                        step="1"
                        required
                        className="border p-2 w-full"
                        placeholder="0以上の整数を入力"
                    />
                </div>

                <div>
                    <label htmlFor="adjustMemo">
                        棚卸理由
                    </label>

                    <select
                        id="adjustMemo"
                        name="memo"
                        required
                        defaultValue=""
                        className="border p-2 w-full rounded"
                    >
                        <option value="" disabled>
                            理由を選択してください
                        </option>

                        <option value="定期棚卸">
                            定期棚卸
                        </option>

                        <option value="棚卸差異">
                            棚卸差異
                        </option>

                        <option value="在庫数再確認">
                            在庫数再確認
                        </option>

                        <option value="その他">
                            その他
                        </option>
                    </select>
                </div>

                <div className="header-actions">
                    <button
                        type="submit"
                        className="button button-primary"
                        disabled={isPending}
                    >
                        {isPending ? "処理中..." : "棚卸を反映"}
                    </button>
                </div>
            </form>
        </section>
    );
}