import fs from "fs";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const dbName = process.env.DB_NAME || "free_time_optimizer";
const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  multipleStatements: true,
});

try {
  const sql = fs.readFileSync(new URL("../database/schema.sql", import.meta.url), "utf8");
  await connection.query(sql);
  const [tables] = await connection.query(`SHOW TABLES FROM ${dbName}`);
  console.log("Schema imported successfully.");
  console.log("Tables:", tables.map((table) => Object.values(table)[0]).join(", "));
} finally {
  await connection.end();
}
