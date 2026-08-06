// SQLiteに接続するための窓口」
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "@/db/schema";

const client = createClient({
    url: "file:./sqlite.db",//sqlite.db を使います
});

export const db = drizzle(client,{
    schema,
});