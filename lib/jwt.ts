import "server-only";//サーバーだけでブラウザには公開厳禁、うっかりミスを防ぐ安全装置
import {SignJWT,jwtVerify}from "jose";//SignJWT,jwtVerifyをjoseより読込み

const secretKey =process.env.SESSION_SECRET;//envに保存している鍵を取得し「秘密鍵」に設定

// エラー節:secretKeyが違っていたらエラーSESSION_SECRETが準備されていません
if(!secretKey){
    throw new Error("SESSION_SECRET is not set")
}

//通訳(endcodeKey)を任命し TextEncoderで人間語をコンピューター言語へ変換
const encodedKey =new TextEncoder().encode(secretKey);

// 会員証を作る関数を定義
export async function encrypt(payload:Record<string,unknown>){
    return await new SignJWT(payload)//会員証の印刷機
    .setProtectedHeader({alg:"HS256"})//署名のルール
    .setIssuedAt()//発行日
    .setExpirationTime("7d")//有効期限
    .sign(encodedKey)//通訳を使いJWTへ署名する
}

// 会員証を確認する関数を定義
export async function decrypt(session?:string) {
    if(!session){//会員証(JWT)がなかったら
        return null;//認証されていない
    }
    // JWTの署名と有効期限を検証
    try{
        const {payload} = await jwtVerify(session,encodedKey,{
        algorithms:["HS256"],
    });

    return payload;// JWTから取り出した情報(userIdなど)を返す
    }catch{
        return null;//確認後、JWTが無効だった
    }
}