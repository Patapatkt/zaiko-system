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
            <input
                type="text"
                name="shelf"
                placeholder={"棚番"}
                defaultValue={shelf}
                className="search-input"
            />

            <input
                type="text"
                name="name"
                placeholder={"商品名"}
                defaultValue={name}
                className="search-input"
            />

            <input
                type="text"
                name="specification"
                placeholder={"仕様"}
                defaultValue={specification}
                className="search-input"
            />


            <button type="submit"
                className="button button-success search-button"
            >
                検索
            </button>
        </form>
    );
}