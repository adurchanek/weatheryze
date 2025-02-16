import { query } from "../db.js";
import fs from "fs/promises";
import path from "path";

(async () => {
  try {
    const migrationsPath = path.resolve("./db/migrations");

    const migrationFiles = await fs.readdir(migrationsPath);

    for (const file of migrationFiles) {
      if (path.extname(file) === ".sql") {
        console.log(`Running migration: ${file}`);

        const filePath = path.join(migrationsPath, file);
        const sql = await fs.readFile(filePath, "utf-8");

        // Execute the migration
        await query(sql);
        console.log(`Migration completed: ${file}`);
      }
    }
  } catch (err) {
    console.error("Migration failed:", err.message);
  } finally {
    process.exit();
  }
})();
