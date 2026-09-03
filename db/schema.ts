// dbのテールブ設定
import {
  sqliteTable,
  integer,
  text,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

//
// User
//
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  username: text("username").notNull(),

  email: text("email").notNull().unique(),

  password: text("password").notNull(),

  role: text("role")
    .$defaultFn(() => "user")
    .notNull(),

  // 管理者による利用承認
    isApproved: integer("is_approved", {
        mode: "boolean",
    })
        .notNull()
        .default(false),

  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),

  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

//
// Product

export const products = sqliteTable("products", {
  id: integer("id")
    .primaryKey({ autoIncrement: true }),
  shelf: text("shelf"),//⇐棚番追加26/8/23
  code: text("code")
    .notNull()
    .unique(),//「この列には同じ値を2つ登録してはいけません」というdbのルール
  name: text("name")
    .notNull(),
  price: integer("price")
    .notNull(),
  specification: text("specification"),
  stock: integer("stock")
    .notNull()
    .default(0),
  // true:取扱中、false:取扱終了⇒一旦、非作動26/8/23
  /*isActive: integer("is_active", {
    mode: "boolean",
  })
    .notNull()
    .default(true),
  */
  deletedAt: text("deleted_at"),

  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),

  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
//
// Stock History 入出庫管理
//
export const stockHistories = sqliteTable("stock_histories", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),

  quantity: integer("quantity").notNull(),

  type: text("type").notNull(),

  memo: text("memo"),

  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const productCodeSequence = sqliteTable(
  "product_code_sequence", 
  {
    id: integer("id").primaryKey(),//採番テーブル自身の行を識別するID
    currentNumber: integer("current_number").notNull(),//商品コードを作るためのカウンター
  }
);