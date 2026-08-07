import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";

export default async function HomePage(){
    // Cookieに有効なsession（会員証）があるか確認
    const session = await getSession();

    // 会員証があればダッシュボードへ
    if(session){
        redirect("/dashboard");
    }
    
    redirect("/login")
}