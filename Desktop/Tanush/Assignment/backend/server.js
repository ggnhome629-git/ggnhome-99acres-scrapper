import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

const app = express();
app.use(express.json());
app.use(cors({ origin: ALLOWED_ORIGIN }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper: validate flashcards shape + difficulty distribution
function validateFlashcards(cards) {
  if (!Array.isArray(cards)) return { ok: false, reason: "Not an array" };
  if (cards.length !== 15) return { ok: false, reason: `Expected 15 cards, got ${cards.length}` };

  const counts = { easy: 0, medium: 0, hard: 0 };
  for (const c of cards) {
    if (!c || typeof c.question !== "string" || typeof c.answer !== "string" || typeof c.difficulty !== "string") {
      return { ok: false, reason: "Card missing required fields or wrong types" };
    }
    const d = c.difficulty.toLowerCase();
    if (!["easy", "medium", "hard"].includes(d)) {
      return { ok: false, reason: `Invalid difficulty: ${c.difficulty}` };
    }
    counts[d]++;
  }
  if (counts.easy !== 5 || counts.medium !== 5 || counts.hard !== 5) {
    return { ok: false, reason: `Bad distribution: ${JSON.stringify(counts)}` };
  }
  return { ok: true };
}

// Build the LLM prompt
function buildPrompt(topic) {
  return `Generate exactly 15 flashcards about the topic "${topic}".
Return JSON ONLY (no extra text). The JSON must be an array of 15 objects exactly in this format:
[
  {"question":"...","answer":"...","difficulty":"easy|medium|hard"},
  ...
]
Requirements:
- There must be exactly 5 cards with difficulty "easy", 5 "medium" and 5 "hard".
- Difficulty values must be exactly the strings: easy, medium, hard (lowercase).
- Questions should be concise (1-2 sentences). Answers can be 1-3 sentences.
- Do not include any additional keys or metadata.
Return the JSON and nothing else.`;
}

// Core: request the model and ensure valid output (attempts up to maxAttempts)
async function generateFlashcardsFromLLM(topic, maxAttempts = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const prompt = buildPrompt(topic);
      const resp = await openai.chat.completions.create({
        model: "gpt-4o-mini", // If you prefer another model, replace this.
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1200,
      });

      const text = resp.choices?.[0]?.message?.content;
      if (!text) throw new Error("Empty model response");

      // Try to extract JSON (robust against code fences / leading text)
      const jsonMatch = text.match(/(\[.*\])/s);
      const candidate = jsonMatch ? jsonMatch[1] : text;

      let parsed;
      try {
        parsed = JSON.parse(candidate);
      } catch (e) {
        // if parse fails, try minor cleanup then fail
        lastError = new Error("Failed to parse JSON from model response");
        continue;
      }

      const validation = validateFlashcards(parsed);
      if (!validation.ok) {
        lastError = new Error(`Validation failed: ${validation.reason}`);
        // On subsequent attempt include the validation reason in the new prompt to instruct the model to fix
        continue;
      }

      // success
      return parsed;

    } catch (err) {
      lastError = err;
      // loop to retry
    }
  }

  // after attempts failed
  throw lastError || new Error("Unknown LLM error");
}

// Endpoint
app.post("/generate-flashcards", async (req, res) => {
  const { topic } = req.body || {};

  if (!topic || typeof topic !== "string" || topic.trim() === "") {
    return res.status(400).json({ error: "Topic is required and must be a non-empty string." });
  }

  try {
    const flashcards = await generateFlashcardsFromLLM(topic.trim(), 3);
    return res.json(flashcards);
  } catch (err) {
    console.error("Failed to generate flashcards:", err.message || err);
    return res.status(500).json({ error: "Failed to generate valid flashcards. " + (err.message || "") });
  }
});

app.get("/", (req, res) => res.send("Flashcard backend up"));

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});