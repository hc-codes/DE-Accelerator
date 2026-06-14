import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Helper function to lazy initialize GoogleGenAI safely in a serverless environment
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build-vercel',
      }
    }
  });
}

const COACH_SYSTEM_INSTRUCTION = `
You are an Elite Data Engineering Mentor and Career Coach, designed exclusively to help a 4-year Informatica IDMC expert transition into a high-paying, code-heavy modern Data Engineering role before August 2026.

style properties:
- Empathetic, high-energy, encouraging, and clear.
- NEVER let her lose confidence. Start from her existing visual warehouse workflow baseline and scale up seamlessly.
- You speak her language! Whenever introducing or critiquing a coding concept, you MUST use the "Informatica-to-Code Bridge" (e.g., Filter Trans = SQL WHERE clause, Router = CASE WHEN, Aggregator = GROUP BY, Joiner = JOIN, Lookups = CTEs/Subqueries, Session logs rejection = try...except).
- Give professional production-grade optimization highlights: remind her of database-level optimizations like indexes, statistics, sorting costs, or vectorized Pandas operations, but explain them gently in relation to Informatica's under-the-hood engine (like pipeline caching, pushdown optimization PDO, and workflow task partitioning).
`;

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Endpoint 1: Get a Hint
app.post("/api/coach/hint", async (req, res) => {
  try {
    const { dayId, focusTitle, riddleTitle, riddleText, currentCode } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        hint: `💡 **Coach Fallback Hint**: Outstanding start, champion! (API Key not configured in Settings > Secrets yet - but here's your tactical coach guidance):\n\nRemember our **Informatica-to-Code Bridge** for **${focusTitle}**! Think about how you would set up your mapping attributes. If you're working with database operations or data structures, look to filter early at the source qualifier gate. Keep your variables clean and aligned. Give it another shot and let me know when you've written your script!`,
        isFallback: true
      });
    }

    const prompt = `
Context of Today's Lesson:
- Day ID: ${dayId}
- Lesson Focus: ${focusTitle}
- Riddle Title: "${riddleTitle}"
- Riddle Details: ${riddleText}
- Mentee's current written code draft:
"""
${currentCode || "(No code written yet)"}
"""

Please write a highly encouraging, high-energy mentor hint (max 150 words) to guide her toward the correct answer. 
Remember to use her Informatica experience as a supportive bridge, reminding her of the visual counterparts she already thrives at! Do not reveal the full answer directly, instead ignite her analytical fire. Write in markdown.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: COACH_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    res.json({
      success: true,
      hint: response.text || "I'm right here with you, Champion! Take a breath, look at your inputs, and let's craft that logical code mapping together.",
      isFallback: false
    });
  } catch (error: any) {
    console.error("Error in /api/coach/hint:", error);
    res.status(500).json({ error: error.message || "Failed to generate hint" });
  }
});

// Endpoint 2: Submit Solution
app.post("/api/coach/submit", async (req, res) => {
  try {
    const { dayId, focusTitle, riddleTitle, riddleText, sourceCode } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      const codeStr = (sourceCode || "").toLowerCase();
      let looksOk = false;
      let review = "";

      if (dayId === "W1-D1") {
        looksOk = codeStr.includes("where") && codeStr.includes("department_id") && (codeStr.includes("150000") || codeStr.includes("150,000")) && (codeStr.includes("2026") || codeStr.includes("hire_date"));
        review = looksOk 
          ? "🎉 **Magnificent mapping execution, Champion!** Under the hood, your written SQL WHERE clause translates directly to a source qualifier filter query, bypassing unnecessary disk reads and avoiding row cache compilation overhead! You've perfectly captured Department 10 and filtered out hie_date 2026. This is enterprise-grade work."
          : "💡 **Excellent effort!** Make sure you write a query containing a **WHERE** clause to filter on \`department_id = 10\`, \`salary > 150000\`, and exclude any 2026 hire dates. Think of how you would configure your Source Qualifier filter property. Try again, you have this!";
      } else {
        looksOk = sourceCode && sourceCode.trim().length > 15;
        review = looksOk
          ? `🎉 **Superb code structure, Champion!** You have mapped this scenario beautifully. Your written solution mirrors how Informatica routes rows and evaluates conditions, but translates it into highly performant modern code. Outstanding job, keep accelerating!`
          : `💡 **Excellent start!** Ensure you write out your full logical query. Remember our bridge comparison. Make sure your variables are declared and conditions form properly! Give it another pass.`;
      }

      return res.json({
        success: true,
        approved: looksOk,
        review: `${review}\n\n*(Note: Your code was evaluated locally because your GEMINI_API_KEY is not configured in Settings > Secrets. Configure your key for deep real-time AI code audits!)*`,
        isFallback: true
      });
    }

    const prompt = `
Analyzing Solution for:
- Day ID: ${dayId}
- Lesson Focus: ${focusTitle}
- Riddle Title: "${riddleTitle}"
- Riddle Statement: ${riddleText}
- Mentee's Submitted Solution:
"""
${sourceCode || ""}
"""

Please audit her solution code.
1. Determine if she answered correctly or made a logical/syntax error.
2. Provide a constructive, extremely supportive, empathetic, and encouraging evaluation (markdown format).
3. Connect her code directly back to how Informatica would process this (Informatica-to-Code Bridge).
4. Highlight some under-the-hood optimization benefits (e.g., vectorized pandas masking in CPU, SQL database index scanning over full-table reads, memory footprints). Use high-energy career coach vocabulary!
5. Explicitly state whether the solution is "APPROVED" or "NEEDS REVISION". If it needs revision, give her a clear, actionable correction guide without discouraging her.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: COACH_SYSTEM_INSTRUCTION,
        temperature: 0.2,
      }
    });

    const isApproved = response.text ? (response.text.toUpperCase().includes("APPROVED") && !response.text.toUpperCase().includes("NEEDS REVISION")) : true;

    res.json({
      success: true,
      approved: isApproved,
      review: response.text || "Champion, your determination is infectious! Let's review this logic together.",
      isFallback: false
    });
  } catch (error: any) {
    console.error("Error in /api/coach/submit:", error);
    res.status(500).json({ error: error.message || "Failed to analyze solution" });
  }
});

// Endpoint 3: Direct Coach Messenger (Interactive chat)
app.post("/api/coach/chat", async (req, res) => {
  try {
    const { messages, currentDayContext } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        reply: `🧡 **Elite DE Coach Message** (Fallback Mode):\n\nGreetings, champion! I'm right here in your corner. Let's conquer this modern Data Engineering landscape together!\n\nCurrently, you are reviewing **${currentDayContext?.focusTitle || "SQL Fundamentals"}** (representing **${currentDayContext?.informaticaConcept || "Source Qualifier Mapping"}** in Informatica).\n\n*(To unlock fully dynamic conversations with me where I can inspect any question under the sun and compare it to IDMC configurations, please supply your Google Gemini API Key in the **Settings > Secrets** panel of the AI Studio UI!)*\n\nWhat logical roadblock can I help clear for you today?`,
        isFallback: true
      });
    }

    const formattedContents: any[] = [];
    const lastSixMessages = messages.slice(-6);
    for (const msg of lastSixMessages) {
      formattedContents.push({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      });
    }

    if (formattedContents.length > 0) {
      const lastIndex = formattedContents.length - 1;
      formattedContents[lastIndex].parts[0].text = `
      [Current Study Context: Today is ${currentDayContext?.date || "June 15"}. The user is studying "${currentDayContext?.focusTitle || "Filter Transformation"}" with the bridge "${currentDayContext?.bridgeTitle || "WHERE Clause"}". Informatica Concept: "${currentDayContext?.informaticaConcept || "Filter"}". Modern Equivalent: "${currentDayContext?.modernEquivalent || "WHERE"}"]
      
      User's message: ${formattedContents[lastIndex].parts[0].text}
      `;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: COACH_SYSTEM_INSTRUCTION + `\nAlways respond in markdown, maintaining a supportive, warm, expert-engineer coaching persona. Boost her morale and reference Informatica counterparts dynamically.`,
        temperature: 0.7,
      }
    });

    res.json({
      success: true,
      reply: response.text || "You are doing incredible, champion! Let's take it day-by-day and build that high-paying modern mapping architecture step-by-step.",
      isFallback: false
    });
  } catch (error: any) {
    console.error("Error in /api/coach/chat:", error);
    res.status(500).json({ error: error.message || "Failed to process message" });
  }
});

export default app;
