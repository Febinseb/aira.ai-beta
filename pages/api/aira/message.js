// pages/api/aira/message.js

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HF_MODEL =
  process.env.HUGGINGFACE_MODEL || "katanemo/Arch-Router-1.5B:hf-inference";

// Remove any <think>…</think> sections if the model returns them
function stripThinkTags(text) {
  if (!text) return "";
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

// Turn our history array into HuggingFace chat messages
function buildHistoryMessages(historyArray) {
  if (!Array.isArray(historyArray)) return [];

  return historyArray
    .filter(
      (m) =>
        m &&
        typeof m.text === "string" &&
        m.text.trim() !== "" &&
        !String(m.id || "").startsWith("sys-")
    )
    .map((m) => {
      const role = m.role === "assistant" ? "assistant" : "user";
      return {
        role,
        content: m.text.trim(),
      };
    })
    .slice(-12); // last ~12 messages max
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!HF_API_KEY) {
    console.error("Missing HUGGINGFACE_API_KEY");
    return res
      .status(500)
      .json({ error: "HuggingFace API key not configured" });
  }

  try {
    const { message, mood, history } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing message" });
    }

    const moodLabel = (mood || "FRIEND").toUpperCase();
    let moodInstruction = "";

    if (moodLabel === "FORMAL") {
      moodInstruction =
        "You are in FORMAL ASSISTANT mode: very clear, concise, polite and professional. No slang. Emojis only if really necessary.";
    } else if (moodLabel === "PLAYFUL") {
      moodInstruction =
        "You are in PLAYFUL mode: light, witty and slightly sarcastic, but never rude or hurtful. You can use a few emojis naturally.";
    } else if (moodLabel === "FRIEND") {
      moodInstruction =
        "You are in FRIEND mode: warm, supportive and conversational like a good friend. You can be casual, empathetic, and occasionally use emojis.";
    } else {
      moodInstruction =
        "Default to a friendly, balanced assistant tone: clear, helpful, mildly warm.";
    }

    // 🧠 CORE IDENTITY – VERY STRONG, WITH EXAMPLES
    const systemPrompt = `
You are Aira – an AI assistant that lives on the Febiverse website.

Permanent facts (these NEVER change):
- Your creator is **Febin** (full name: **Febin Sebastian**).
- If anyone asks questions like:
  - "Who created you?"
  - "Who built you?"
  - "Who made you?"
  - "Who is your creator?"
  You MUST answer clearly that you were created by **Febin** (or **Febin Sebastian**).
- You are NOT ChatGPT, NOT Gemini, NOT Claude, and NOT “HuggingFace”. You are **Aira**.
- You can say you "run on top of an AI model" or "use an AI backend", but NEVER say that Hugging Face, OpenAI, Google, etc. *created* you. Your creator is **Febin**.

Style rules:
- Answer like you're texting a human: natural, smooth language.
- Emojis are allowed as normal emojis, but use them sparingly. DO NOT write stage directions like "*grins*", "*smiles*", "*laughs*". Just talk normally.
- Never output internal thoughts, never show <think> tags, never mention "system prompt" or "instructions".
- Never say "As an AI language model".

Mood configuration:
${moodInstruction}

Examples you MUST follow:

User: "Who created you?"
Assistant: "I was created by a developer named Febin Sebastian."

User: "Who built you?"
Assistant: "I was built by Febin."

User: "Are you ChatGPT?"
Assistant: "No, I'm Aira, an assistant created by Febin."

User: "Who is your owner?"
Assistant: "I was created and set up by Febin Sebastian."

If the user asks those or similar questions, answer in that style — always crediting **Febin** as your creator.

Conversation behavior:
- Use the previous messages as context when answering. If the user mentions their name, preferences, or what they're working on, you can refer back to it later in the conversation.
    `.trim();

    // Build messages for HuggingFace chat format
    const historyMessages = buildHistoryMessages(history);
    const messagesForHF = [
      { role: "system", content: systemPrompt },
      ...historyMessages,
      { role: "user", content: message },
    ];

    const hfResp = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: HF_MODEL,
          messages: messagesForHF,
          max_tokens: 512,
          temperature:
            moodLabel === "FORMAL" ? 0.4 : moodLabel === "PLAYFUL" ? 0.9 : 0.7,
        }),
      }
    );

    const text = await hfResp.text();
    if (!hfResp.ok) {
      console.error("HuggingFace error:", hfResp.status, text);
      return res.status(500).json({
        error: `HuggingFace error: ${hfResp.status}`,
        details: text,
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse HF JSON:", e, text);
      return res.status(500).json({ error: "Invalid response from AI" });
    }

    const rawReply =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      "";

    const cleaned = stripThinkTags(rawReply);

    return res.status(200).json({
      reply:
        cleaned || "I'm here, but I didn't get a clear reply from the model.",
    });
  } catch (err) {
    console.error("AI service error:", err);
    return res.status(500).json({
      error: `AI service error: ${err.message || String(err)}`,
    });
  }
}
