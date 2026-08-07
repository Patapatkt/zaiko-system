import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect:"turso",//SQliteを使う
    schema:"./db/schema.ts",//テーブル定義を書く場所
    out:"./drizzle",//マイグレーションの出力先
    dbCredentials:{
        url: process.env.TURSO_DATABASE_URL ?? "file:./sqlite.db",
        authToken: process.env.TURSO_AUTH_TOKEN,
    }
})