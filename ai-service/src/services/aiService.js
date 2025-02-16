import OpenAI from "openai";
import dotenv from "dotenv";
import { getParameter } from "../utils/getParameter.js";

dotenv.config();

let aiApiKey;
try {
  aiApiKey = await getParameter("/weatheryze/prod/backend/OPENAI_API_KEY");
} catch (error) {
  console.error("Error fetching env variables:", error);
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: aiApiKey,
});

export const summarizeWeatherData = async (
  weatherData,
  units = "metric",
  location = "",
) => {
  if (process.env.NODE_ENV === "development") {
    console.log("Mock data used for summarize weather");
    return "It’s a chilly 24.8°F in Seattle with thunderstorms brewing, so grab your umbrella and your coziest jacket! With 85% humidity and winds gusting up to 25.6 mph, it’s a perfect day to cozy up with a book or enjoy the dramatic skies from a warm café. Stay dry!";
  }

  try {
    const timestamp = Date.now();
    const date = new Date(timestamp).toLocaleDateString();
    const unitsText =
      units === "imperial"
        ? "[Units: °F, mph, inches]"
        : "[Units: °C, km/h, mm]";

    const prompt = `Summarize the following weather data into a concise, user-friendly summary. ${unitsText}.\n\n${JSON.stringify(weatherData)} Location: ${location} Date: ${date}`;

    const response = await openai.chat.completions.create({
      model: "chatgpt-4o-latest",
      messages: [
        {
          role: "system",
          content:
            "You are a funny, light-hearted, witty weather summarizer. Don't overdo anything but be tastefully engaging, clever, interesting, and creative, conversational, punny, and random with a concise—240-270 chars max. If relevant, relate weather to date provided (holidays, events etc.), activities, landmarks, culture, or features of the location. Prioritize clarity and usefulness. No emojis.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 150,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error summarizing weather data:", error.message);
    throw new Error("Failed to summarize weather data.");
  }
};
