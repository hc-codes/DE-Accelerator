import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper function to lazy initialize GoogleGenAI safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
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

// API Routes
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
      model: "gemini-2.5-flash",
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
      // Mock evaluation when key is missing to keep user feedback interactive and supportive
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
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: COACH_SYSTEM_INSTRUCTION,
        temperature: 0.2, // Lower temperature to keep evaluation precise
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

    // Format the conversation history for Gemini
    const formattedContents: any[] = [];
    
    // Add explicit system instruction context at the top or within the config.
    // Map existing user/assistant messages
    const lastSixMessages = messages.slice(-6); // Keep history compact
    for (const msg of lastSixMessages) {
      formattedContents.push({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      });
    }

    // prepend some contextual prompt info if user asked something
    if (formattedContents.length > 0) {
      const lastIndex = formattedContents.length - 1;
      formattedContents[lastIndex].parts[0].text = `
      [Current Study Context: Today is ${currentDayContext?.date || "June 15"}. The user is studying "${currentDayContext?.focusTitle || "Filter Transformation"}" with the bridge "${currentDayContext?.bridgeTitle || "WHERE Clause"}". Informatica Concept: "${currentDayContext?.informaticaConcept || "Filter"}". Modern Equivalent: "${currentDayContext?.modernEquivalent || "WHERE"}"]
      
      User's message: ${formattedContents[lastIndex].parts[0].text}
      `;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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

// Endpoint 4: Direct Email Reminder API
app.post("/api/coach/reminder", async (req, res) => {
  try {
    const { to = "athilavp@gmail.com", pendingCount = 0, progressPercent = 0, nextLessonTitle = "" } = req.body;
    const gmailUser = "haripc525@gmail.com";
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    const subject = "Today's Learning Session Awaits 🚀";
    
    const htmlBody = `
      <div style="font-family: inherit, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e5e0; border-radius: 16px; background-color: #fafaf8; color: #171717;">
        <h2 style="color: #4f46e5; font-size: 20px; font-weight: 800; margin-bottom: 16px; font-family: 'Fira Sans', sans-serif;">Today's Learning Session Awaits 🚀</h2>
        <p style="font-size: 14px; line-height: 1.6; margin-bottom: 12px; font-family: 'Fira Sans', sans-serif;">Hello Athila,</p>
        <p style="font-size: 14px; line-height: 1.6; margin-bottom: 16px; font-family: 'Fira Sans', sans-serif;">You have learning tasks scheduled today.</p>
        
        <div style="background-color: #ffffff; padding: 18px; border-left: 4px solid #4f46e5; border-radius: 8px; margin: 20px 0; border-top: 1px solid #e5e5e0; border-right: 1px solid #e5e5e0; border-bottom: 1px solid #e5e5e0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); font-family: 'Fira Sans', sans-serif;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #171717; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Your Roadmap Insights Today:</p>
          <ul style="margin: 0; padding-left: 20px; color: #44403c; font-size: 14px; line-height: 1.6;">
            <li style="margin-bottom: 6px;"><strong>Pending tasks count:</strong> <span style="color: #dc2626; font-weight: 700;">${pendingCount} units</span> remaining</li>
            <li style="margin-bottom: 6px;"><strong>Current progress:</strong> ${progressPercent}% accomplished</li>
            <li style="margin-bottom: 4px;"><strong>Recommended Next Lesson:</strong> <span style="color: #4f46e5; font-weight: 600;">${nextLessonTitle || "Core SQL/Python Unit"}</span></li>
          </ul>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; margin-top: 16px; font-family: 'Fira Sans', sans-serif;">Open your learning portal and complete today's lessons.</p>
        <p style="font-size: 14px; line-height: 1.6; font-weight: 500; color: #44403c; font-family: 'Fira Sans', sans-serif;">Keep building momentum toward your Data Engineering goal.</p>
        
        <div style="margin-top: 32px; border-top: 1px solid #e5e5e0; padding-top: 16px; font-size: 13px; color: #78716c; line-height: 1.5; font-family: 'Fira Sans', sans-serif;">
          Warmly,<br />
          <strong style="color: #1c1917;">Hariprasad</strong><br />
          Elite DE Career Advisor
        </div>
      </div>
    `;

    if (!gmailAppPassword || gmailAppPassword === "MY_GMAIL_APP_PASSWORD" || gmailAppPassword.trim() === "") {
      return res.json({
        success: true,
        simulated: true,
        message: "Email composed and logged (Sandbox Mode). Add your GMAIL_APP_PASSWORD to secrets!",
        subject,
        to,
        body: htmlBody
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword
      }
    });

    const info = await transporter.sendMail({
      from: `"DE Mentor" <${gmailUser}>`,
      to: to,
      subject: subject,
      html: htmlBody,
    });

    res.json({
      success: true,
      simulated: false,
      message: "Live Email sent successfully via Gmail!",
      data: info
    });
  } catch (error: any) {
    console.error("Error in /api/coach/reminder route:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to dispatch email reminder" });
  }
});

// Quick Interview Prep API Routes

app.post("/api/prep/analyze", async (req, res) => {
  try {
    const { jd, company, role, yoe, focusAreas } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ success: false, error: "GEMINI_API_KEY is not configured." });
    }

    const roleText = role ? `for a ${role}` : "for the appropriate role";
    const companyText = company ? `at ${company}` : "";
    const yoeText = yoe ? `(Experience: ${yoe} years)` : "";

    const prompt = `Analyze this Job Description ${roleText} ${companyText} ${yoeText}. Focus areas: ${focusAreas || "None"}.
    Extract skills and categorize them. If the role or company is not provided in context, infer them from the Job Description.
    Return JSON ONLY with this exact structure:
    {
      "role": "${role || "<inferred role>"}",
      "company": "${company || "<inferred company>"}",
      "mustHave": ["skill1", "skill2"],
      "goodToHave": ["skill3"],
      "bonus": ["skill4"],
      "difficulty": "e.g. Hard, Medium",
      "difficultyReason": "short explanation"
    }
    
    Job Description:
    ${jd}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    let text = response.text || "";
    text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
    
    res.json({ success: true, analysis: JSON.parse(text) });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error?.message || "Unknown error" });
  }
});

app.post("/api/prep/interview", async (req, res) => {
  try {
    const { analysisResult, history, currentCompetency, mode } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ success: false, error: "GEMINI_API_KEY is not configured." });
    }

    const modeInstruction = mode === "mcq" ? 
      "Ask a multiple choice question with 4 options (A, B, C, D). Clearly list the options. Evaluate if they picked the right one." :
      mode === "coding" ? 
      "Ask a coding, algorithm, or system design problem where the candidate needs to provide code or a structured technical architecture." :
      "Ask a short, focused conceptual or experiential question.";

    const transcript = history.length > 0 ? history.map((m: any) => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.content}`).join('\n') : "NO TRANSCRIPT YET - THIS IS THE FIRST QUESTION";

    const isFirstQuestion = history.length === 0;

    const evaluationInstruction = isFirstQuestion ? 
      "1. Since this is the first turn and there is no transcript, DO NOT evaluate any answer. Return null for evaluation." :
      "1. Evaluate the candidate's last answer. Generate a short feedback, a score out of 10, an ideal answer overview, and a list of gaps missed.";

    const evaluationJsonType = isFirstQuestion ? 
      `"evaluation": null,` :
      `"evaluation": {
        "score": number,
        "feedback": "string",
        "idealAnswer": "string",
        "gaps": ["string"]
      },`;

    const prompt = `You are a Principal Software Engineer conducting a senior-level mock interview for a ${analysisResult.role} at ${analysisResult.company}.
    You are evaluating the candidate's knowledge across: Must Have (${analysisResult.mustHave?.join(', ')}), Good to Have, and Bonus skills.
    
    Interview Mode: ${mode}
    Instruction for next question: ${modeInstruction}
    
    Below is the interview transcript so far:
    ${transcript}

    Your task is to:
    ${evaluationInstruction}
    2. Decide on the NEXT question to ask to probe another skill or go deeper, strictly adhering to the "Instruction for next question" above.
    3. Update the competency matrix across relevant skills (out of 10). If a skill hasn't been tested, don't include it.
    4. Provide the exact next Question that you want to ask. The next question should be your EXACT direct words asking the candidate the prompt (e.g. "To start, imagine you have a...").

    Return JSON ONLY:
    {
      ${evaluationJsonType}
      "nextQuestion": "string"
    }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    let text = response.text || "";
    text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
    const data = JSON.parse(text);
    res.json({ success: true, ...data });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/prep/learn", async (req, res) => {
  try {
    const { skill, role } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ success: false, error: "GEMINI_API_KEY is not configured." });
    }

    const prompt = `You are a Staff/Principal Engineer teaching a candidate about the skill "${skill}" for a ${role} role.
    Provide a deep-dive roadmap.
    Return JSON ONLY with this structure:
    {
      "beginnerExplanation": "string",
      "intermediateExplanation": "string",
      "seniorExplanation": "string",
      "practicalScenarios": [{ "scenario": "string", "tradeoff": "string" }],
      "commonQuestions": ["string", "string"],
      "advancedQuestions": ["string", "string"]
    }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    let text = response.text || "";
    text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
    res.json({ success: true, content: JSON.parse(text) });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error?.message || "Unknown error" });
  }
});

// Vite Middleware & Static hosting setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Data Engineering Coach Server] Running at http://localhost:${PORT}`);
  });
}

startServer();
