"use client";

import { useActionState } from "react";
import type { updateStockState } from "@/actions/stock";

// 入出庫調整フォームのコンポーネント
type updateStockProps = {
    action: (
        previousState: updateStockState,//前の状態を引数として受け取り、Promiseを返す関数
        formData: FormData
    ) => Promise<updateStockState>;//Promiseを返す関数の型を定義
};

export default function StockOperation({
    action,
}: updateStockProps) {//updateStockProps型のactionを受け取る
    // useActionStateフックを使用して、アクションの状態、フォームのアクション、および保留中の状態を取得
    const [state, formAction, isPending] = useActionState(
        action,
        null
    );
    return (
        <section className="stock-operation-section">
            <h2 className="section-title">
                入出庫調整
            </h2>

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
                    <label htmlFor="quantity">
                        調整数量
                    </label>
                    <input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="1"
                        step="1"
                        required
                        className="border p-2 w-full"
                        placeholder="1以上の整数を入力"
                    />
                </div>

                <div>
                    <label
                        htmlFor="memo"
                        className="block font-bold mb-1"
                    >
                        在庫数変更理由
                    </label>

                    <select
                        id="memo"
                        name="reason"
                        className="border p-2 w-full rounded"
                        required
                        defaultValue=""
                    >
                        <option value="" disabled>
                            理由を選択してください
                        </option>

                        <option value="入出庫忘れ">
                            入出庫忘れ
                        </option>

                        <option value="商品破損">
                            商品破損
                        </option>

                        <option value="棚卸差異">
                            棚卸差異
                        </option>

                        <option value="その他">
                            その他
                        </option>

                    </select>
                    <div className="stock-reason-field">
                        <input
                            name="memo"
                            className="form-input"
                            placeholder="補足があれば入力"
                        />
                    </div>
                </div>

                <div className="header-actions">
                    <button
                        type="submit"
                        name="operation"
                        value="IN"
                        className="button button-success"
                        disabled={isPending}
                    >
                        {isPending ? "処理中..." : "入庫"}
                    </button>

                    <button
                        type="submit"
                        name="operation"
                        value="OUT"
                        className="button button-danger"
                        disabled={isPending}
                    >
                        {isPending ? "処理中..." : "出庫"}
                    </button>
                </div>
            </form>
        </section>
    );
}