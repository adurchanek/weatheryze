import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
import { getParameter } from "../utils/getParameter.js";

dotenv.config();

let uri;
try {
  uri = await getParameter("/weatheryze/prod/backend/POSTGRES_URI");
} catch (error) {
  console.error("Error fetching env variables:", error);
  process.exit(1);
}

console.log("Connected to postgres!");
const pool = new Pool({
  connectionString: uri,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
});

export const query = (text, params) => pool.query(text, params);
