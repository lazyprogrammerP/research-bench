import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const OpenAIClient = new OpenAI();

export default OpenAIClient;
