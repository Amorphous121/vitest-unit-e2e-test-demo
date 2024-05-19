import mongoose from "mongoose";
import { config } from "dotenv";

config({ path: ".env.test" });

export const connectDatabase = async (dbName) => {
  mongoose.set("strictQuery", true);
  return mongoose.connect(process.env.DB_URL, { dbName });
};



export const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};
