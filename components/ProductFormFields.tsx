type ProductFormValues = {
    shelf: string | null;
    name: string;
    specification: string | null;
};

type ProductFormFieldsProps = {
    defaultValues?: Partial<ProductFormValues>;
};

export default function ProductFormFields({
    defaultValues = {},
}: ProductFormFieldsProps) {
    return (
        <>
            <div className="form-group">
                <label>棚番</label>
                <input
                    type="text"
                    name="shelf"

                    defaultValue={defaultValues.shelf ?? ""}
                    className="form-input"
                    minLength={6}
                    maxLength={6}
                    required
                />
            </div>
            <div className="form-group">
                <label>商品名</label>
                <input

                    name="name"
                    defaultValue={defaultValues.name}
                    className="form-input"
                    required
                />

            </div>

            <div className="form-group">
                <label>商品仕様</label>
                <input
                    name="specification"
                    defaultValue={defaultValues.specification ?? ""}
                    className="form-input"
                    required
                />
            </div>
        </>
    );
}