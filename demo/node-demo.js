// Import required modules
import express from "express";
import translate from "translate";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create an Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Translate route
app.post("/translate", async (req, res) => {
  const { text, targetLanguage } = req.body;
  if (!text || !targetLanguage) {
    return res.status(400).json({ error: "Text and target language are required" });
  }

  try {
    const translatedText = await translate(text, {from: "da" ,  to: targetLanguage });
    res.json({ translatedText });
  } catch (error) {
    res.status(500).json({ error: "Translation failed" });
  }
});

// Translate route for bulk translation
app.post("/translatebulk", async (req, res) => {
  try {
    // Extract text and targetLanguage pairs from the request body
    const translations = req.body;

    // Check if translations array is provided
    if (!Array.isArray(translations) || translations.length === 0) {
      return res.status(400).json({ error: "Translations array is required" });
    }

    // Perform translations for each text and targetLanguage pair
    const translatedTexts = await Promise.all(translations.map(async ({ text, targetLanguage }) => {
      // Perform translation
      const translatedText = await translate(text,{to: targetLanguage});
      return { originalText: text, translatedText };
    }));

    // Send the translated texts in the response
    res.json({ translatedTexts });
  } catch (error) {
    // Handle any errors that occur during translation
    console.error("Translation failed:", error);
    res.status(500).json({ error: "Translation failed" });
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
