//① .env.local を読む
import { config } from "dotenv"
// ② Tursoへ接続する
import { createClient } from "@libsql/client";
// ③ Drizzleに接続を渡す
import { drizzle } from "drizzle-orm/libsql";
// ④ drizzleフォルダのmigration(実行係)を読み込む
import { migrate } from "drizzle-orm/libsql/migrator";

config({ path: ".env.local" });//.env.local を読む

//client(tursoの連絡係)を定数に入れる
const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

// dbを定数化
const db = drizzle(client)

// ⑤ 未適用migrationを実行
async function main() {
    await migrate(db, {
        migrationsFolder: "drizzle",//drizzleフォルダの保存場所を教える
    });
}
main();