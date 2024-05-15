const express = require("express");
const translate = require("translate-google-api"); 
const dotenv = require("dotenv");
const cors = require("cors");


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// The `noCors` option is not a valid option for the `cors` middleware. Remove it.
app.use(cors({ origin: true, credentials: true }));

// Configure translate package with options
translate.engine = "google"; // Assuming you're using Google Translate
translate.key = process.env.TRANSLATE_API_KEY; // Make sure to set your API key in the environment variable

app.post("/translate", async (req, res) => {
  const { text, targetLanguage, startLanguage } = req.body;
  if (!text || !targetLanguage) {
    return res.status(400).json({ error: "Text and target language are required" });
  }

  try {
    const translatedText = await translate(text, { from: startLanguage, to: targetLanguage });
    res.json({ translatedText });
  } catch (error) {
    console.error("Translation failed:", error);
    res.status(500).json({ error: "Translation failed" });
  }
});

app.post("/translatebulk", async (req, res) => {
  try {
    const translations = req.body;

    if (!Array.isArray(translations) || translations.length === 0) {
      return res.status(400).json({ error: "Translations array is required" });
    }

    const translatedTexts = await Promise.all(translations.map(async ({ text, targetLanguage }) => {
      const translatedText = await translate(text, { to: targetLanguage });
      return { originalText: text, translatedText };
    }));

    res.json({ translatedTexts });
  } catch (error) {
    console.error("Translation failed:", error);
    res.status(500).json({ error: "Translation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
