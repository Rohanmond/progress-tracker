require("dotenv").config({ path: require("node:path").resolve(__dirname, "..", ".env") });

const questions = require("../data/namaste-dsa-questions.json");
const { pool, query, runSqlFile } = require("./db");

async function seed() {
  await runSqlFile(require("node:path").resolve(__dirname, "..", "..", "db", "schema.sql"));

  for (const item of questions) {
    await query(
      `insert into questions (
        id, source, source_order, title, section, pattern, difficulty, duration, url, description
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      on conflict (id) do update set
        source = excluded.source,
        source_order = excluded.source_order,
        title = excluded.title,
        section = excluded.section,
        pattern = excluded.pattern,
        difficulty = excluded.difficulty,
        duration = excluded.duration,
        url = excluded.url,
        description = excluded.description`,
      [
        item.id,
        item.source,
        item.order,
        item.title,
        item.section,
        item.pattern,
        item.difficulty,
        item.duration,
        item.url,
        item.description
      ]
    );
  }

  await runSqlFile(require("node:path").resolve(__dirname, "..", "..", "db", "views.sql"));
  console.log(`Seeded ${questions.length} Namaste DSA questions.`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
