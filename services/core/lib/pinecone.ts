import dotenv from "dotenv";
import { Pinecone } from "@pinecone-database/pinecone";

dotenv.config();

const PINECONE_API_INDEX = process.env.PINECONE_API_INDEX;
if (!PINECONE_API_INDEX) {
  throw new Error("PINECONE_API_INDEX is not defined in the environment variables.");
}

const pinecone = new Pinecone();

export const rbIndex = pinecone.Index(PINECONE_API_INDEX);

export default pinecone;
