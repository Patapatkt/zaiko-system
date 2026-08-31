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
                </div>

                <div className="form-group">
                    <label htmlFor="endtDate">終了日時</label>
                    <input 
                        type="date" 
                        id="endDate"
                        name="endDate"
                        defaultValue={defaultValues.endDate ?? ""}
                        className="form-input"
                    />
                </div>
            </div>

            {/* 2行目：棚番・商品コード ・商品名・商品仕様*/}
            <div className="form-group">
                <label>棚番</label>
                <input
                    type="text"
                    name="shelf"

                    defaultValue={defaultValues.shelf ?? ""}
                    className="form-input"
                    maxLength={6}
                />
            </div>

            <div className="form-group">
                <label>商品コード</label>
                <input
                    name="code"
                    defaultValue={defaultValues.code ?? ""}
                    className="form-input"
                />
            </div>

            <div className="form-group">
                <label>商品名</label>
                <input

                    name="name"
                    defaultValue={defaultValues.name ?? ""}
                    className="search-input"
                />

            </div>

            <div className="form-group">
                <label>商品仕様</label>
                <input
                    name="specification"
                    defaultValue={defaultValues.specification ?? ""}
                    className="form-input"
                />
            </div>

            {/* 3行目：数量・区分 */}
            <div className="form-group">
                <label>数量</label>
                <input
                    name="quantity"
                    defaultValue={defaultValues.quantity ?? ""}
                    className="form-input"
                />
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

            </div>

            {/* 5行目：理由 */}
            <div className="form-group">
                <label>理由</label>
                <input
                    name="memo"
                    defaultValue={defaultValues.memo ?? ""}
                    className="search-input search-input-wide"
                />
            </div>

            <button
                type="submit"
                className="button button-success search-button"
            >
                検索
            </button>

        </form>
    );
}