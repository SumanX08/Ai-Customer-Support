import express from "express";
import Chat from "../Models/Chat.js";
import Message from "../Models/Message.js";
import Document from "../Models/Dcoument.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// simple keyword score
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

    // 1) find or create chat
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

    // 2) save user message
    await Message.create({
      chatId: chat._id,
      senderId: userId,
      text: trimmedMessage,
      role: "user",
    });

    // 2.5) Handle simple greetings WITHOUT RAG / docs
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

    // 3) fetch all documents
    const docs = await Document.find();

    if (!docs.length) {
      // No docs at all, just answer generally
      const fallback = "I don’t see any help documents yet, but you can tell me your issue and I’ll still try to help.";
      await Message.create({
        chatId: chat._id,
        senderId: null,
        text: fallback,
        role: "assistant",
      });
      return res.status(200).json({ chatId: chat._id, answer: fallback });
    }

    // 4) score documents
    let scored = docs.map((d) => ({
      title: d.title || d.originalName,
      content: d.content || "",
      score: scoreDoc(d.content || "", trimmedMessage),
    }));

    // keep only docs with score > 0
    scored = scored.filter((d) => d.score > 0);

    // ❌ don't force all docs when none matched
    // if (!scored.length) { ... }  <-- remove your old fallback here

    // sort and take top 3 (if any)
    scored.sort((a, b) => b.score - a.score);
    const topDocs = scored.slice(0, 3);

    // 5) build context (may be empty)
    let context = "";
    if (topDocs.length) {
      context = topDocs
        .map(
          (d, i) => `Document ${i + 1}: ${d.title}\n${d.content}\n`
        )
        .join("\n");
    }

    // safety: limit context length
    const MAX_CHARS = 9000;
    if (context.length > MAX_CHARS) {
      context = context.slice(0, MAX_CHARS);
    }

    // 6) call Gemini
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

    // 7) save assistant message
    await Message.create({
      chatId: chat._id,
      senderId: null, // or some system id
      text: answer,
      role: "assistant",
    });

    // 8) send response
    res.json({
      chatId: chat._id,
      answer,
    });
  } catch (error) {
    console.log("GEMINI KEY?", process.env.GEMINI_API_KEY);
    console.error("Error in /api/chat:", error?.response?.data || error);
    if(error?.response?.status===429){
      return res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// test route
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
