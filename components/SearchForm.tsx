// 検索のコンポーネント
// クラスを定義
type SerchFormProps = {
    action: string;
    name?: string;
    shelf?: string;
    specification?: string;
};
// SearchFormコンポーネントを定義
export default function SearchForm({
    action,
    name = "",
    shelf = "",
    specification = "",
}: SerchFormProps) {
    return (
        <form
            action={action}
            className="searcharea"
        >
            <div className="search-field">
                <label>棚番</label>
                <input
                    type="text"
                    name="shelf"
                    placeholder="例:A12345"
                    defaultValue={shelf}
                    className="search-input"
                />
                <p className="form-help">
                    6桁の半角英数字を入力
                </p>
            </div>

            <div className="search-field">
                <label>商品名</label>
                <input
                    type="text"
                    name="name"
                    placeholder="例:りんご"
                    defaultValue={name}
                    className="search-input"
                />
                <p className="form-help">
                    全角で商品名を入力
                </p>
            </div>

            <div className="search-field">
                <label>仕様</label>
                <input
                    type="text"
                    name="specification"
                    placeholder="例:国産品"
                    defaultValue={specification}
                    className="search-input"
                />
                <p className="form-help">
                    全角で仕様を入力
                </p>
            </div>

            <button type="submit"
                className="button button-success search-button"
            >
                検索
            </button>
        </form>
    );
}