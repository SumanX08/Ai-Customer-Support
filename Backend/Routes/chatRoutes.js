import express from "express";
import Chat from "../Models/Chat.js";
import Message from "../Models/Message.js";
import Document from "../Models/Dcoument.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const scoreDoc = (text, query) => {
  let score = 0;
  const words = query.toLowerCase().split(/\s+/);
  const t = (text || "").toLowerCase();

  words.forEach((w) => {
    if (w.length > 2 && t.includes(w)) score++;
  });

  return score;
};

router.post("/", async (req, res) => {
  try {
    const { chatId, message, userId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const trimmedMessage = message.trim();

    let chat;
    if (chatId) {
      chat = await Chat.findById(chatId);
    }
    if (!chat) {
      chat = new Chat({
        userId,
        title: "New Chat",
      });
      await chat.save();
    }

    await Message.create({
      chatId: chat._id,
      senderId: userId,
      text: trimmedMessage,
      role: "user",
    });

    const isGreeting = /^(hi|hello|hey|hola|namaste|yo)\b/i.test(trimmedMessage);
    if (isGreeting) {
      const greetingReply =
        "Hi there! 👋 I’m your AI support assistant. I can help you with questions about your account, pricing, features, and general support. What would you like to know?";

      await Message.create({
        chatId: chat._id,
        senderId: null,
        text: greetingReply,
        role: "assistant",
      });

      return res.json({
        chatId: chat._id,
        answer: greetingReply,
      });
    }

    const docs = await Document.find();

    if (!docs.length) {
      const fallback = "I don’t see any help documents yet, but you can tell me your issue and I’ll still try to help.";
      await Message.create({
        chatId: chat._id,
        senderId: null,
        text: fallback,
        role: "assistant",
      });
      return res.status(200).json({ chatId: chat._id, answer: fallback });
    }

    let scored = docs.map((d) => ({
      title: d.title || d.originalName,
      content: d.content || "",
      score: scoreDoc(d.content || "", trimmedMessage),
    }));

    scored = scored.filter((d) => d.score > 0);

   

    scored.sort((a, b) => b.score - a.score);
    const topDocs = scored.slice(0, 3);

    let context = "";
    if (topDocs.length) {
      context = topDocs
        .map(
          (d, i) => `Document ${i + 1}: ${d.title}\n${d.content}\n`
        )
        .join("\n");
    }

    const MAX_CHARS = 9000;
    if (context.length > MAX_CHARS) {
      context = context.slice(0, MAX_CHARS);
    }

    const prompt = `
You are a helpful, concise customer support assistant.

- Use the "Context" section below when it is relevant to the user's question.
- If context is empty or not helpful, still try to answer based on general reasoning and typical SaaS/product behavior.
- If you genuinely cannot answer, say:
  "I’m not completely sure about that from the current information. You may want to contact human support."
- Keep answers short, clear, and friendly.
- Do NOT say "I don't have the information" just because context is empty.

Context (may be empty):
${context || "[No specific matching document content found for this question]"}

User question:
${trimmedMessage}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    await Message.create({
      chatId: chat._id,
      senderId: null, 
      text: answer,
      role: "assistant",
    });

    res.json({
      chatId: chat._id,
      answer,
    });
  } catch (error) {
  console.error("Error in /api/chat:", error);

  if (error.status === 429) {
    return res.status(503).json({
      success: false,
      message:
        "Our AI provider is currently over its request limit. Please try again later.",
      code: "AI_QUOTA_EXCEEDED",
    });
  }

  res.status(500).json({
    success: false,
    message: "Something went wrong while generating a response.",
  });
}});

router.get("/test", async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Hello");
    res.send(result.response.text());
  } catch (e) {
    console.error(e);
    res.status(500).send("Gemini test failed");
  }
});

export default router;
