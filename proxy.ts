//ログイン認証の入り口の設定
import { NextRequest, NextResponse } from "next/server";//2つの関数を使えるようにする
import { decrypt } from "@/lib/jwt";//関数decryptを読み込み

const PUBLIC_PATHS = ["/login"];//ログイン不要でアクセスできるページ(PUBULIC)を配列に格納

//proxy関数作成
export async function proxy(request: NextRequest) {
    console.log("PROXY PATH:", request.nextUrl.pathname);

    //以下、定数の設定
    const { pathname } = request.nextUrl;//現在のURLパスを取得

    const cookie = request.cookies.get("session");//Cookieからsessionを取得
    const session = await decrypt(cookie?.value);//decryptを実行(JWTよりログインユーザー名を取得)
    const isAuthenticated = !!session?.userId;//userIdが存在確認(ログイン済か判定)
    const isPublicPath = PUBLIC_PATHS.some(
        (path) => pathname.startsWith(path)
    );

    console.log({
        pathname,
        session,
        isAuthenticated,
        isPublicPath,
    });//アクセス先がログイン不要のページか判定

    //userIdとpathの確認
    if (isAuthenticated && isPublicPath) {//ログイン済ユーザーがログイン不要の画面にアクセスしたら
        return NextResponse.redirect(new URL("/inventory", request.url));//会員ページへ
    }

    if (!isAuthenticated && !isPublicPath) {//ログインしてないユーザーが保護された画面にアクセスしたら
        return NextResponse.redirect(new URL("/login", request.url));//ログインページへ戻る(エラー節)
    }

    return NextResponse.next();

}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}

