// 棚卸フォームのコンポーネント

type StockOperationProps = {
    action: (
        formData: FormData
    ) => void | Promise<void>;
};

export default function StockOperation({
    action,
}: StockOperationProps) {
    return (
        <section className="stock-operation-section">
            <h2 className="section-title">
                入出庫調整
            </h2>

            <form
                action={action}
                className="stock-form"
            >
                <div>
                    <label>調整数量</label>
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
                    >
                        入庫
                    </button>

                    <button
                        type="submit"
                        name="operation"
                        value="OUT"
                        className="button button-danger"
                    >
                        出庫
                    </button>
                </div>
            </form>
        </section>
    );
}