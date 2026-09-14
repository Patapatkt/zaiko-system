// 入庫時のコンポーネント
type ProductInputValues = {
    shelf: string;
    name: string;
    specification: string;
}

type NewProductRegistrationFormProps = {
    inputValues: ProductInputValues;
    error?: string;
    formAction: (formData: FormData) => void;
    isPending: boolean;
};

export default function NewProductRegistrationForm({
    inputValues,
    error,
    formAction,
    isPending,
}: NewProductRegistrationFormProps) {
    return (
        <>
            <p style={{ color: "blue" }}>
                一致する商品は未登録です。
                入力内容を確認し、新商品なら
                価格と初回入庫数量を入力してください。
            </p>

            <p>棚番：{inputValues.shelf}</p>
            <p> 商品名： {inputValues.name}</p>
            <p>
                商品仕様：
                {inputValues.specification}
            </p>

            {error && (
                <p className="error-message">
                    {error}
                </p>
            )}

            <form
                action={formAction}
                className="form-action"
            >
                <input
                    type="hidden"
                    name="shelf"
                    value={inputValues.shelf}
                />

                <input
                    type="hidden"
                    name="name"
                    value={inputValues.name}
                />

                <input
                    type="hidden"
                    name="specification"
                    value={inputValues.specification}
                />

                <div className="form-group">
                    <label>価格</label>
                    <input
                        type="number"
                        name="price"
                        className="form-input"
                        min={0}
                        step={1}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>
                        初回入庫数量
                    </label>
                    <input
                        type="number"
                        name="stock"
                        className="form-input"
                        min={1}
                        step={1}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className={
                        "button-success"
                    }
                    disabled={isPending}
                >
                    {isPending
                        ? "入庫中..."
                        : "新商品を登録して入庫"}
                </button>
            </form>
        </>
    )
}