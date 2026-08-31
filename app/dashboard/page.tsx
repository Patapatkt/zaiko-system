//必要な関数などを読み込み
import Link from "next/link";
import { logout,getSession } from "@/actions/auth";
import { db } from "@/db";
import { users } from "@/db/schema"
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function Home() {
  //ユーザー情報がなかったらログイン画面へ戻す
  const session = await getSession();
  if (!session) {
    redirect("/login")
  }
  //sessionと一致するユーザーをdbから取得
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!user) {
    redirect("/login")
  }
  return (
    <main className="min-h-screen bg-purple-500 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-gray-300 rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            くだものシステム
          </h1>
          <p className="inline-block border-b border-black-300 pb-2">
            {user.username}さん こんにちは！
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/inventory"
            className="bg-blue-500 hover:bg-blue-600 text-2xl text-center font-bold px-4 py-6 rounded"
          >
            商品一覧
          </Link>
          
          <Link
            href="/inventory/new"
            className="bg-blue-500 hover:bg-blue-600 text-2xl text-center font-bold px-4 py-6 rounded"
          >
            商品入庫
          </Link>

          {user.role === "admin" && (
            <Link
              href="/inventory/stock"
              className="bg-blue-500 hover:bg-blue-600 text-2xl text-center font-bold px-4 py-6 rounded-lg"
            >
             商品在庫修正
            </Link>
          )}
          <Link
            href="/history"
            className="bg-blue-500 hover:bg-blue-600 text-2xl text-center font-bold  px-6 py-4 rounded-lg"
          >
            入出庫履歴
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t">
          <form action={logout}>
            <button type="submit"
              className="w-full bg-blue-500 hover:bg-gray-800 text-2xl font-bold px-6 py-3 rounded">
              ログアウト
            </button>
          </form>
        </div>
      </div>

    </main >
  );
}
