// 入出庫履歴専用のコンポーネント
type HistorySearchValues = {
    date: string;
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
            className="searcharea"
        >
            <div className="form-group">
                <label>日時</label>
                <input
                    name="date"
                    defaultValue={defaultValues.date ?? ""}
                    className="form-input"
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
                <label>商品名</label>
                <input

                    name="name"
                    defaultValue={defaultValues.name ?? ""}
                    className="search-input search-input-wide"
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

            <div className="form-group">
                <label>数量</label>
                <input
                    name="quantity"
                    defaultValue={defaultValues.quantity ?? ""}
                    className="form-input"
                />
            </div>

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