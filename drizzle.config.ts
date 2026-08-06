import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect:"sqlite",//SQliteを使う
    schema:"./db/schema.ts",//テーブル定義を書く場所
    out:"./drizzle",//マイグレーションの出力先
    dbCredentials:{
        url:"./sqlite.db",//使用するデータベースファイル
    }
})