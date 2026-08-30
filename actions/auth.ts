"use server";//このファイル内の関数はServer Actionです。

import "server-only";//サーバーだけで閲覧、ブラウザには公開しない

import { db } from "@/db";//db操作用のファイルを読み込み
import { users } from "@/db/schema";//usersテーブルを定義
import { eq } from "drizzle-orm";//drizzleからeq(＝)を呼び出して使えるようにする

import { decrypt, encrypt } from "@/lib/jwt"//jwt.tsのencrypt,decryptの関数を利用できるようにする

import { cookies } from "next/headers";//cookiesへアクセスできるようにする

import { redirect } from "next/navigation";//認証成功画面へアクセスできるようにする

import bcrypt from "bcryptjs";//ハッシュ化の比較の為にbcryptを使えるようにする
import { error } from "console";

export async function login(
    prevState:unknown,
    formData: FormData
) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    // schemaから一致するメールアドレスを探す
    const user = await db.query.users.findFirst({//メールアドレスに一致したユーザーを取得
        where: eq(users.email, email),//emailが一致しているユーザーを探す
    });
    // メールアドレスが存在しているか確認
    if (!user) {
        return{
            error:"入力内容が正しくありません",//ユーザーがいなければ認証失敗
        };
    }

    //入力されたパスワードとDBに保存されたハッシュ済パスワードを比較
    const isMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!isMatch) {//一致していなかったら
        // return null;//認証失敗
        return {
            error: "入力内容が正しくありません"
        }
    }

    // 管理者による利用承認を確認
    if(!user.isApproved){
        return{
            error:"現在、管理者の承認待ちです。",
        }
    }

    // JWT作成　メールアドレス・パスワードが一致していたらJWTを会員証として発行
    const session = await encrypt({
        userId: user.id,
    })
    // JWTをCookieへ保存
    const cookieStore = await cookies();//定数にcookieStoreを設定

    //cookieStoreの保存内容
    cookieStore.set("session", session, {
        httpOnly: true,//javascriptからはCookieは読めないように設定
        secure: process.env.NODE_ENV === "production",//HTTPSの時だけ送信
        sameSite: "lax",//別サイトから勝手にCookieを送られにくくする
        path: "/",//サイト全体でこのCookieを使えるようにする
        maxAge: 60 * 60 * 24 * 7,//有効期限の設定
    });

    //ログイン成功後メニュー画面へ
    redirect("/dashboard")
}

//ログイン中のユーザー情報取得
export async function getSession() {
    const session = (await cookies()).get("session")?.value//cookiesのから"session"を取得、なければ未定義
    // JWTの署名と有効期限を確認
    const payload = await decrypt(session);
    // JWTがない、または無効な場合
    if (
        !payload ||typeof payload.userId !== "number"
    ) {
        return null;
    }
     // JWT内のuserIdに該当する現在のユーザーを取得
    const user = await db.query.users.findFirst({
        where: eq(users.id, payload.userId),
        columns: {
            id: true,
            isApproved: true,
        },
    });

    // ユーザーが削除済み、または管理者未承認の場合
    if (!user || !user.isApproved) {
        return null;
    }

    // 現在も承認されているユーザーだけ認証成功
    return {
        userId: user.id,
    };
}

//deleteSession作成
export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete("session");//cookieStoreに保存している情報をデリート
}

// ログアウト機能
export async function logout() {
    await deleteSession();//deleteSession関数を実行
    redirect("/login");//login画面に戻す
}

//新規登録画面のバックエンド
export async function registerUser(
    prevState: unknown,
    formData: FormData//引数はformatDataより
) {//ユーザーネーム・メール・パスワードを定数に設定
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const existsUser = await db.query.users.findFirst({//dbに保存されているユーザーの
        where: eq(users.email, email),//emailと一致(eq)しているか
    });

    //ユーザーの存在確認
    if (existsUser) {
        return {
            error: "このメールアドレスは既に使用されています"
        }
    }

    const hashedPassword = await bcrypt.hash(
        password,
        10
    );

    //dbにユーザー名,メール,パスワードを追加(insert)
    await db.insert(users).values({
        username,
        email,
        password: hashedPassword,//ハッシュ化されたパスワードでdbに登録
    });

    redirect("/login");
}