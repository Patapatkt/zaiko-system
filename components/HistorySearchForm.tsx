// 入出庫履歴専用のコンポーネント
type HistorySearchValues = {
    startDate: string;
    endDate:string;
    code: string;
    shelf: string;
    name: string;
    specification: string;
    type: string;
    quantity: string;
    memo: string;
};

type HistorySearchFormProps = {
    action: string;
    defaultValues?: Partial<HistorySearchValues>;
};

export default function HistorySearchForm({
    action,
    defaultValues = {},
}: HistorySearchFormProps) {
    return (
        <form
            action={action}
            className="history-searcharea"
        >
            {/* 1行目：日時 */}
            <div className="history-date-range">
                <div className="form-group">
                    <label htmlFor="startDate">開始日時</label>
                    <input 
                        type="date" 
                        id="startDate"
                        name="startDate"
                        defaultValue={defaultValues.startDate ?? ""}
                        className="form-input"
                    />
                    <p className="form-help">開始日時は過去日を選択してください</p>
                </div>

                <div className="form-group">
                    <label htmlFor="endDate">終了日時</label>
                    <input 
                        type="date" 
                        id="endDate"
                        name="endDate"
                        defaultValue={defaultValues.endDate ?? ""}
                        className="form-input"
                    />
                    <p className="form-help">終了日時は開始日時以降の日付を選択してください</p>
                </div>
            </div>

            {/* 2行目：棚番・商品コード ・商品名・商品仕様*/}
            <div className="form-group">
                <label>棚番</label>
                <input
                    type="text"
                    name="shelf"
                    placeholder="例:A12345"
                    defaultValue={defaultValues.shelf ?? ""}
                    className="form-input"
                    maxLength={6}
                />
                <p className="form-help">6桁の棚番を半角英数字で入力してください</p>
            </div>

            <div className="form-group">
                <label>商品コード</label>
                <input
                    name="code"
                    placeholder="例:A0001"
                    defaultValue={defaultValues.code ?? ""}
                    className="form-input"
                />
                <p className="form-help">商品コードは半角英数字で入力してください</p>
            </div>

            <div className="form-group">
                <label>商品名</label>
                <input

                    name="name"
                    placeholder="例:りんご"
                    defaultValue={defaultValues.name ?? ""}
                    className="form-input"
                />
                <p className="form-help">商品名は全角で入力してください</p>
            </div>

            <div className="form-group">
                <label>商品仕様</label>
                <input
                    name="specification"
                    placeholder="例:国産品"
                    defaultValue={defaultValues.specification ?? ""}
                    className="form-input"
                />
                <p className="form-help">商品仕様は全角で入力してください</p>
            </div>

            {/* 3行目：数量・区分 */}
            <div className="form-group">
                <label>数量</label>
                <input
                    name="quantity"
                    placeholder="例:10"
                    defaultValue={defaultValues.quantity ?? ""}
                    className="form-input"
                />
                <p className="form-help">数量は半角数字で入力してください</p>
            </div>

            <div className="form-group">
                <label>区分</label>
                <select
                    name="type"
                    defaultValue={defaultValues.type ?? ""}
                    className="form-input"
                >
                    <option value="">すべて</option>
                    <option value="IN">入庫</option>
                    <option value="OUT">出庫</option>
                    <option value="CHECK">棚卸</option>
                </select>
                <p className="form-help">区分を選択してください</p>
            </div>

            {/* 5行目：理由 */}
            <div className="form-group">
                <label>理由</label>
                <input
                    name="memo"
                    placeholder="例:商品補充"
                    defaultValue={defaultValues.memo ?? ""}
                    className="form-input form"
                />
                <p className="form-help">理由は全角で入力してください</p>
            </div>

            <button
                type="submit"
                className="button search-button"
            >
                検索
            </button>

        </form>
    );
}