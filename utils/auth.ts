// 権限管理の追加
import "server-only";//serverだけで起動
//必要な関数などを読み込み
import {db} from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/actions/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
//権限管理の関数を作成
export async function requireAdmin() {
    const session = await getSession();
    //もしログイン情報(session)がなかったらlogin画面へ
    if(!session){
        redirect("/login");
    }
    //ログイン情報(session)のuserIdと一致しているユーザーを取得する
    const user =await db.query.users.findFirst({
        where:eq(users.id,session.userId),
    })
    //もしユーザーが存在しないor役割(role)がadminではなかったらメニュー画面へ
    if(!user||user.role!=="admin"){
        redirect("/dashboard");
    }

    return user;
}