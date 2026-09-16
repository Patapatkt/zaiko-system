//出庫画面
import Link from "next/link";
import PickingForm from "@/components/PickingForm";
import{requireApprovedUser} from "@/utils/auth";

export default async function PickingPage() {
    const user =
        await requireApprovedUser();
    
    return(
        <main className="page-container">
            <h1 className="page-title">
                商品出庫
            </h1>

            <PickingForm
                username={user.username}
            />

            <Link
                 href="/stock-operation"
                className="button button-secondary"
            >
                入出庫操作メニュー
            </Link>
        </main>
    );
}