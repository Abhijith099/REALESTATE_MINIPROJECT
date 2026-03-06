import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const url =
  "https://generativelanguage.googleapis.com/v1/models?key=" +
  process.env.GEMINI_API_KEY;

const run = async () => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error fetching models:", err);
  }
};

run();
