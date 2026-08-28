// 検索のコンポーネント
// クラスを定義
type SerchFormProps = {
    action: string;
    keyword: string;
    placeholder: string;
};
// SearchFormコンポーネントを定義
export default function SearchForm({
    action,
    keyword,
    placeholder,
}: SerchFormProps) {
    return (
        <form 
            action={action}  
            className="searcharea"
        >
            <input
                type="text"
                name="keyword"
                placeholder={placeholder}
                defaultValue={keyword}
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