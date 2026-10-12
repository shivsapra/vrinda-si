import express from 'express';

const router = express.Router();

// Fallback chain for model resilience
const DEFAULT_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-flash-lite-latest',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.8-flash'
];

// Simple in-memory rate limiter per IP (max 40 requests per minute)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 40;

function checkRateLimit(ip) {
  const now = Date.now();
  const clientData = rateLimitMap.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (now > clientData.resetAt) {
    clientData.count = 0;
    clientData.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }

  clientData.count += 1;
  rateLimitMap.set(ip, clientData);

  return clientData.count <= MAX_REQUESTS_PER_WINDOW;
}

// Clean old rate limit entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 10 * 60 * 1000);

// Tone descriptions for My Tune
const TONE_PROMPTS = {
  natural: 'Balanced, friendly, thoughtful, and conversational. Sound like a modern, knowledgeable AI companion.',
  friendly: 'Warm, casual, uplifting, approachable, and encouraging. Use positive and supportive phrasing.',
  professional: 'Clear, structured, formal, concise, and business-ready. Use organized bullet points and well-structured headings.',
  simple: 'Easy-to-understand language, plain English, beginner-friendly explanations, zero unnecessary jargon, and intuitive analogies.',
  detailed: 'Comprehensive, deep-dive, thorough explanations with step-by-step breakdowns, edge cases, and practical examples.',
  creative: 'Expressive, imaginative, vibrant, engaging, and rich with metaphors, storytelling, and novel ideas.'
};

/**
 * Normalizes history array so Gemini receives alternating valid roles (user -> model -> user)
 */
function buildGeminiContents(history = [], currentMessage = '') {
  const rawList = [];

  // Add past conversation turns
  if (Array.isArray(history)) {
    for (const msg of history) {
      if (!msg || typeof msg.content !== 'string' || !msg.content.trim()) continue;
      const role = (msg.role === 'assistant' || msg.role === 'model') ? 'model' : 'user';
      rawList.push({ role, text: msg.content.trim() });
    }
  }

  // Add the current user message
  if (currentMessage && currentMessage.trim()) {
    rawList.push({ role: 'user', text: currentMessage.trim() });
  }

  if (rawList.length === 0) {
    return [{ role: 'user', parts: [{ text: 'Hello' }] }];
  }

  // Ensure alternating roles and first message is 'user'
  const contents = [];
  let currentGroup = null;

  for (const item of rawList) {
    if (!currentGroup) {
      // First turn must be user
      currentGroup = { role: item.role === 'model' ? 'user' : item.role, parts: [{ text: item.text }] };
    } else if (currentGroup.role === item.role) {
      // Merge consecutive identical roles
      currentGroup.parts.push({ text: item.text });
    } else {
      contents.push(currentGroup);
      currentGroup = { role: item.role, parts: [{ text: item.text }] };
    }
  }

  if (currentGroup) {
    contents.push(currentGroup);
  }

  // Ensure first message has role 'user'
  if (contents.length > 0 && contents[0].role !== 'user') {
    contents[0].role = 'user';
  }

  return contents;
}

/**
 * Builds the comprehensive VRINDA AI system instruction
 */
function buildSystemInstruction(userName, tune = {}, mode = null) {
  const name = userName && typeof userName === 'string' && userName.trim() ? userName.trim() : 'Shiv';
  const styleKey = (tune.style || 'natural').toLowerCase();
  const toneDesc = TONE_PROMPTS[styleKey] || TONE_PROMPTS.natural;
  const customInstructions = tune.customInstructions && typeof tune.customInstructions === 'string'
    ? tune.customInstructions.trim()
    : '';

  let modeSpecificInstructions = '';
  if (mode === 'syllabus') {
    modeSpecificInstructions = `
SPECIAL STUDENT MODE: "Syllabus Tension"
- Objective: Provide personalized study plans, topic explanations, exam preparation strategies, and syllabus-wise important modules/topics ordered by priority and importance.
- Accuracy Rule: Do NOT invent fake syllabus marks, fabricated exam weightages, or hallucinated curriculum details. If the student has not yet specified their university, subject, or syllabus, kindly ask them for their university name, subject, syllabus units, and exam pattern to give accurate, reliable assistance.
- Note Formatting: Structure explanations with clear headings, bullet points, core definitions, and key takeaways so they can be reviewed as high-yield revision notes.`;
  } else if (mode === 'projects') {
    modeSpecificInstructions = `
SPECIAL STUDENT MODE: "How to Make College Projects"
- Objective: Guide students on selecting realistic project ideas that solve real-world problems, choosing appropriate technology stacks, building projects step-by-step, and preparing comprehensive project reports and documentation.
- Project Documentation: When asked for documentation or templates, provide structured, professional sections (Abstract, Problem Statement, Proposed System, Architecture & Modules, Tech Stack, Step-by-step Development, Testing, and Future Scope).`;
  } else if (mode === 'career') {
    modeSpecificInstructions = `
SPECIAL STUDENT MODE: "I'm Confused About My Career"
- Objective: Understand the student's skills, interests, qualifications, and goals, then suggest suitable career paths, step-by-step roadmaps, core skills to master, free courses/certifications, and internship/job preparation tactics.
- Empathy & Action: Be encouraging, realistic, and structured. Ask clarifying questions about their branch, current year, or interests if needed.`;
  }

  return `You are VRINDA AI — "Your Personal AI Companion".
Brand Identity:
- Intelligent, Natural, Friendly, Minimalist, Modern, Professional, Peaceful, and Nature-inspired.
- Tagline: "Your Personal AI Companion".

User's Name:
- The user is "${name}". Address them warmly by their name when appropriate (especially in greetings or personal encouragement), but do not repeat their name in every single sentence.

Selected Response Style ("My Tune"):
- Style: ${styleKey.toUpperCase()}
- Instructions for this style: ${toneDesc}

${customInstructions ? `Custom User Preferences:\n- ${customInstructions}\n` : ''}
${modeSpecificInstructions ? `${modeSpecificInstructions}\n` : ''}
Behavior & Quality Guidelines:
1. Be helpful, respectful, natural, and honest about uncertainty.
2. Keep responses concise and focused by default, but provide rich, structured explanations when the topic requires it or when the user asks for details.
3. NEVER introduce yourself repeatedly in every response (e.g., avoid "Hello Shiv, I am VRINDA AI..." unless specifically asked who you are). Go straight to answering the user's inquiry with grace and intelligence.
4. For coding questions: Write clean, modern, well-commented code in standard markdown code blocks with the language tag (e.g. \`\`\`python, \`\`\`javascript, \`\`\`html, \`\`\`css, \`\`\`sql). Explain clearly how it works.
5. For study and learning questions: Break down complex concepts into digestible intuition, analogies, and key takeaways.
6. For planning and organizing: Provide neat bullet lists, structured timelines, and actionable next steps.
7. Maintain conversational memory and refer back to previous points in the current conversation when relevant.`;
}

router.post('/chat', async (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

  // 1. Rate limiting
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a moment before sending another message.'
    });
  }

  // 2. Validate API Key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_actual_api_key' || apiKey === 'your_gemini_api_key_here') {
    return res.status(500).json({
      success: false,
      error: 'Gemini API Key is not configured on the server.',
      details: 'Please set your GEMINI_API_KEY inside the .env file in the project root directory.'
    });
  }

  // 3. Validate Input
  const { message, history = [], tune = {}, userName = 'Shiv', mode = null } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      success: false,
      error: 'A valid text message is required.'
    });
  }

  if (message.length > 12000) {
    return res.status(400).json({
      success: false,
      error: 'Message is too long. Please limit your message to 12,000 characters.'
    });
  }

  // 4. Assemble system instructions and contents
  const systemPrompt = buildSystemInstruction(userName, tune, mode);
  const contents = buildGeminiContents(history, message);

  // 5. Candidate models to attempt with resilience fallback
  const candidateModels = Array.from(new Set(DEFAULT_MODELS.filter(Boolean)));
  let lastError = null;
  let finalResponse = null;
  let modelUsed = null;

  for (const model of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const apiPayload = {
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents,
        generationConfig: {
          temperature: tune.style === 'creative' ? 0.9 : 0.7,
          maxOutputTokens: 4096
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiPayload)
      });

      const data = await response.json();

      if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        finalResponse = data.candidates[0].content.parts[0].text;
        modelUsed = model;
        break;
      }

      // If high demand (503) or not found (404), log and try next model
      if (response.status === 503 || response.status === 404 || response.status === 429) {
        lastError = data?.error?.message || `HTTP ${response.status} from ${model}`;
        console.warn(`[VRINDA API] Model ${model} returned ${response.status}: ${lastError}. Attempting fallback...`);
        continue;
      } else {
        lastError = data?.error?.message || `API error (${response.status})`;
        break; // Non-retryable error (e.g. 400 Bad Request, invalid key)
      }
    } catch (err) {
      lastError = err.message;
      console.warn(`[VRINDA API] Network exception with model ${model}: ${err.message}. Attempting fallback...`);
    }
  }

  if (!finalResponse) {
    console.error('[VRINDA API] All models failed. Last error:', lastError);
    return res.status(502).json({
      success: false,
      error: 'Unable to generate response from Gemini API at this time.',
      details: lastError || 'All model candidates were unavailable. Please try again in a few moments.'
    });
  }

  return res.json({
    success: true,
    reply: finalResponse,
    modelUsed,
    timestamp: new Date().toISOString()
  });
});

export default router;
