import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini AI Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Server-side AI processing API endpoint
app.post('/api/ai/process', async (req, res) => {
  try {
    if (!aiClient) {
      return res.status(503).json({
        error: 'Gemini API Key is not configured. Please add GEMINI_API_KEY in Secrets.',
      });
    }

    const { action, text, title, customInstruction, targetLanguage, targetTone } = req.body;

    if (!text && !title && !customInstruction) {
      return res.status(400).json({ error: 'Text content or prompt is required.' });
    }

    let prompt = '';
    let systemInstruction = 'You are an expert AI writing assistant embedded inside NoteForge notepad. Provide concise, helpful, clean output without unnecessary markdown wrapper chatter unless asked.';

    switch (action) {
      case 'summarize':
        prompt = `Summarize the following note into concise bullet points and a 2-sentence key takeaway summary:\n\nTitle: ${title || 'Untitled'}\nContent:\n${text}`;
        break;

      case 'improve':
        prompt = `Improve the clarity, readability, flow, and elegance of this note while maintaining its original core meaning and formatting:\n\n${text}`;
        break;

      case 'fix_grammar':
        prompt = `Fix all spelling, grammar, punctuation, and typographical errors in the following text. Preserve the original formatting:\n\n${text}`;
        break;

      case 'continue':
        prompt = `Continue writing the following note seamlessly in the same voice and style. Provide 2-3 logical next paragraphs or sections:\n\nTitle: ${title || 'Untitled'}\nContent so far:\n${text}`;
        break;

      case 'outline':
        prompt = `Generate a structured hierarchical outline (with H2/H3 headings and bullet points) based on this topic or text:\n\nTitle: ${title || 'Untitled'}\nText:\n${text}`;
        break;

      case 'auto_tag':
        prompt = `Analyze the following note and generate 3 to 6 relevant short single-word tags (all lowercase, no spaces or special characters except hyphens). Return strictly a JSON array of strings, e.g. ["work", "project", "ideas"]:\n\nTitle: ${title || 'Untitled'}\nContent:\n${text}`;
        break;

      case 'translate':
        prompt = `Translate the following text accurately into ${targetLanguage || 'Spanish'}, preserving Markdown structure and formatting:\n\n${text}`;
        break;

      case 'change_tone':
        prompt = `Rewrite the following text in a ${targetTone || 'professional'} tone, preserving Markdown structure:\n\n${text}`;
        break;

      case 'custom':
        prompt = `Instruction: ${customInstruction}\n\nNote Title: ${title || ''}\nNote Content:\n${text}`;
        break;

      default:
        prompt = `Analyze and provide key insights on this note:\n\nTitle: ${title || ''}\nContent:\n${text}`;
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    const resultText = response.text || '';

    // Special handling for auto_tag action to return clean tags
    if (action === 'auto_tag') {
      try {
        const cleaned = resultText.replace(/```json|```/g, '').trim();
        const tags = JSON.parse(cleaned);
        if (Array.isArray(tags)) {
          return res.json({ tags: tags.map(t => String(t).toLowerCase().replace(/[^a-z0-9-]/g, '')) });
        }
      } catch (e) {
        // Fallback simple extraction
        const matches = resultText.match(/[a-zA-Z0-9-]+/g) || [];
        return res.json({ tags: matches.slice(0, 5) });
      }
    }

    return res.json({ result: resultText });
  } catch (error: any) {
    console.error('Gemini API endpoint error:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred while generating AI response.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'custom',
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await vite.transformIndexHtml(url, `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NoteForge - Modern Smart Notepad</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;1,400&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NoteForge server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
