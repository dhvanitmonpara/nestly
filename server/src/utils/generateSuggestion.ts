import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

async function generateSuggestion(text: string) {
  const prompt = `
You are an assistant that improves chat messages.

Message: "${text}"

Task:
- Suggest exactly 3 clearer, more engaging alternative responses.
- Each response should sound natural, friendly, and conversational.
- Return ONLY a valid JSON string array (string[]). 
- Do not include explanations, extra text, or formatting outside the array.

Example output:
["Sure! I'd love to help you with that.", "Of course, what do you need?", "Happy to assist—what's up?"]
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  let suggestions;
  try {
    if (!response.text) throw new Error("Failed to generate response");
    const cleaned = response.text
      .replace(/```json/i, "") // remove starting ```json (case-insensitive)
      .replace(/```/g, "") // remove any other ```
      .trim();

    suggestions = await JSON.parse(cleaned);

    // Extra validation: ensure it's an array of strings
    if (
      !Array.isArray(suggestions) ||
      !suggestions.every((s) => typeof s === "string")
    ) {
      throw new Error("Invalid format");
    }
  } catch (error) {
    console.error("Invalid model response:", response.text);
  }

  return suggestions;
}

export default generateSuggestion;
