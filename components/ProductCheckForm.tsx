type ProductCheckFormProps = {
    shelf: string;
    setShelf: (shelf: string) => void;

    name: string;
    setName: (name: string) => void;

    specification: string;
    setSpecification: (specification: string) => void;

    resetCheckResult: () => void;
};

export default function ProductCheckForm({
    shelf,
    setShelf,
    name,
    setName,
    specification,
    setSpecification,
    resetCheckResult,
}: ProductCheckFormProps){
    return (

            <div className="product-form">
                <div className="form-group">
                    <label>棚番</label>
                    <input
                        type="text"
                        value={shelf}
                        onChange={(event) => {
                            setShelf(event.target.value);
                            resetCheckResult();
                        }}
                        placeholder="例: A12345"
                        className="form-input"
                        minLength={6}
                        maxLength={6}
                        required
                    />
                    <p>6文字の棚番を半角英数字で入力してください</p>
                </div>

                <div className="form-group">
                    <label>商品名</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(event) => {
                            setName(event.target.value);
                            resetCheckResult();
                        }}
                        placeholder="例: りんご"
                        className="form-input"
                        required
                    />
                    <p>商品名を全角で入力してください</p>
                </div>

                <div className="form-group">
                    <label>商品仕様</label>
                    <input
                        type="text"
                        value={specification}
                        onChange={(event) => {
                            setSpecification(
                                event.target.value
                            );
                            resetCheckResult();
                        }}
                        placeholder="例: 国産品"
                        className="form-input"
                        required
                    />
                    <p>商品仕様を全角で入力してください</p>
                </div>
            </div>
    );
}
