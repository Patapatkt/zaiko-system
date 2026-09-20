// 棚卸フォームのコンポーネント

type StockAdjustmentProps = {
    action: (
        formData: FormData
    ) => void | Promise<void>;
};

export default function StockAdjustment({
    action,
}: StockAdjustmentProps) {
    return (
        <section className="stock-adjustment-section">
            <h2 className="section-title">
                棚卸
            </h2>

            <p className="form-help">
                実際に数えた現在庫数を入力してください。
            </p>

            <form
                action={action}
                className="stock-form"
            >
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
                    >
                        棚卸を反映
                    </button>
                </div>
            </form>
        </section>
    );
}