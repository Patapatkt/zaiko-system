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

// 承認済みユーザーを取得する
export async function requireApprovedUser() {
    const session = await getSession();// 有効かつ承認済みのユーザーのIDを取得

    // ログインしていなければログイン画面へ
    if (!session) {
        redirect("/login");
    }

    // 現在のユーザー情報をDBから取得
    const user = await db.query.users.findFirst({
        where: eq(users.id, session.userId),
    });

    // ユーザーが存在しなければログイン画面へ
    if (!user) {
        redirect("/login");
    }
    return user;
}

// 承認済みユーザーを取得
export async function requirePicker() {
    const user =await requireApprovedUser();
    // ピッキング担当者でなければメニュー画面へ
    if(!user.isPicker){
        redirect("/dashboard");
    }

    return user;
}