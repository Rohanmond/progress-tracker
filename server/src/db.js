const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined
});

async function query(text, params) {
  return pool.query(text, params);
}

async function runSqlFile(filePath) {
  const sql = fs.readFileSync(filePath, "utf8");
  await query(sql);
}

function rootPath(...segments) {
  return path.resolve(__dirname, "..", "..", ...segments);
}

module.exports = {
  pool,
  query,
  rootPath,
  runSqlFile
};
