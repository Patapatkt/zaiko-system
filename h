[1mdiff --git a/actions/auth.ts b/actions/auth.ts[m
[1mindex 4f86f80..283a471 100644[m
[1m--- a/actions/auth.ts[m
[1m+++ b/actions/auth.ts[m
[36m@@ -13,7 +13,6 @@[m [mimport { cookies } from "next/headers";//cookiesへアクセスできるよう[m
 import { redirect } from "next/navigation";//認証成功画面へアクセスできるようにする[m
 [m
 import bcrypt from "bcryptjs";//ハッシュ化の比較の為にbcryptを使えるようにする[m
[31m-import { error } from "console";[m
 [m
 export async function login([m
     prevState:unknown,[m
[36m@@ -25,6 +24,7 @@[m [mexport async function login([m
     const user = await db.query.users.findFirst({//メールアドレスに一致したユーザーを取得[m
         where: eq(users.email, email),//emailが一致しているユーザーを探す[m
     });[m
[32m+[m
     // メールアドレスが存在しているか確認[m
     if (!user) {[m
         return{[m
[1mdiff --git a/actions/inventory.ts b/actions/inventory.ts[m
[1mindex 466203f..cc0bf71 100644[m
[1m--- a/actions/inventory.ts[m
[1m+++ b/actions/inventory.ts[m
[36m@@ -4,7 +4,7 @@[m [mimport { db } from "@/db";[m
 import { products, stockHistories, productCodeSequence } from "@/db/schema";[m
 import { and, eq, isNull, sql } from "drizzle-orm"[m
 import { redirect } from "next/navigation";[m
[31m-import { requireAdmin } from "@/utils/auth";[m
[32m+[m[32mimport { requireAdmin,requireApprovedUser } from "@/utils/auth";[m
 [m
 type ProductState = {[m
     error: string;[m
[36m@@ -45,7 +45,7 @@[m [mexport async function checkProduct([m
     inputName: string,[m
     inputSpecification: string[m
 ): Promise<ProductCheckResult> {[m
[31m-    await requireAdmin();[m
[32m+[m[32m    await requireApprovedUser();[m
 [m
     const shelf = inputShelf.trim().toUpperCase();[m
     const name = inputName.trim();[m
[36m@@ -138,7 +138,7 @@[m [mexport async function restockProduct([m
     previousState: ProductState,[m
     formData: FormData[m
 ): Promise<ProductState> {[m
[31m-    await requireAdmin();[m
[32m+[m[32m    await requireApprovedUser();//承認済ユーザーか確認[m
 [m
     const productId = Number(formData.get("productId"));[m
     const quantity = Number(formData.get("quantity"));[m
[36m@@ -198,7 +198,7 @@[m [mexport async function createProduct([m
     previousState: ProductState,[m
     formData: FormData[m
 ): Promise<ProductState> {[m
[31m-    await requireAdmin();[m
[32m+[m[32m    await requireApprovedUser();[m
 [m
     const shelf =[m
         (formData.get("shelf") as string)?.trim().toUpperCase();[m
[1mdiff --git a/app/login/page.tsx b/app/login/page.tsx[m
[1mindex 70c0a9c..85f4cff 100644[m
[1m--- a/app/login/page.tsx[m
[1m+++ b/app/login/page.tsx[m
[36m@@ -17,7 +17,6 @@[m [mexport default async function LoginPage() {[m
                 <h1 className='auth-title'>[m
                     ログイン[m
                 </h1>[m
[31m-[m
                 <LoginForm />[m
             </section>[m
         </main>[m
[1mdiff --git a/proxy.ts b/proxy.ts[m
[1mindex aa923d2..4f3349d 100644[m
[1m--- a/proxy.ts[m
[1m+++ b/proxy.ts[m
[36m@@ -2,7 +2,7 @@[m
 import { NextRequest, NextResponse } from "next/server";//2つの関数を使えるようにする[m
 import { decrypt } from "@/lib/jwt";//関数decryptを読み込み[m
 [m
[31m-const PUBLIC_PATHS = ["/login"];//ログイン不要でアクセスできるページ(PUBULIC)を配列に格納[m
[32m+[m[32mconst PUBLIC_PATHS = ["/login", "/register"];//ログイン不要でアクセスできるページ(PUBULIC)を配列に格納[m
 [m
 //proxy関数作成[m
 export async function proxy(request: NextRequest) {[m
[1mdiff --git a/utils/auth.ts b/utils/auth.ts[m
[1mindex 198b581..c4b0af7 100644[m
[1m--- a/utils/auth.ts[m
[1m+++ b/utils/auth.ts[m
[36m@@ -22,5 +22,26 @@[m [mexport async function requireAdmin() {[m
         redirect("/dashboard");[m
     }[m
 [m
[32m+[m[32m    return user;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m// 承認済みユーザーか確認する[m
[32m+[m[32mexport async function requireApprovedUser() {[m
[32m+[m[32m    const session = await getSession();[m
[32m+[m
[32m+[m[32m    // ログインしていなければログイン画面へ[m
[32m+[m[32m    if (!session) {[m
[32m+[m[32m        redirect("/login");[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    // ログイン中のユーザーを取得[m
[32m+[m[32m    const user = await db.query.users.findFirst({[m
[32m+[m[32m        where: eq(users.id, session.userId),[m
[32m+[m[32m    });[m
[32m+[m
[32m+[m[32m    // ユーザーが存在しなければログイン画面へ[m
[32m+[m[32m    if (!user) {[m
[32m+[m[32m        redirect("/login");[m
[32m+[m[32m    }[m
     return user;[m
 }[m
\ No newline at end of file[m
