import { config } from "dotenv";
import path from "path";

config({ path: path.join(__dirname, `../../.env.dev`) });

const {
  PORT,
  NODE_ENV,
  DB_HOST,
  DB_USERNAME,
  DB_NAME,
  DB_PORT,
  DB_PASSWORD,
  REFRESH_TOKEN_SECRET,
  JWKS_URI,
  PRIVATE_KEY,
} = process.env;

export const Config = {
  PORT,
  NODE_ENV,
  DB_HOST,
  DB_USERNAME,
  DB_NAME,
  DB_PORT,
  DB_PASSWORD,
  REFRESH_TOKEN_SECRET,
  JWKS_URI,
  PRIVATE_KEY,
};
