import { Router, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { addConversation, updateConversation, demoConversations, demoTasks } from '../data/demoData';

const router = Router();
router.use(authenticate);

// ─── Gemini Integration ────────────────────────────────────────────────────
async function callGemini(prompt: string, language: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return getDemoResponse(prompt, language);
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemContext = `You are FlowBot, the AI assistant for StadiumFlow AI — the official operations platform for FIFA World Cup 2026 at MetroFlow Arena. 
    You help fans, staff, volunteers, and organizers with stadium navigation, crowd management, transportation, accessibility, sustainability, and emergency guidance.
    Always be concise, practical, and friendly. Respond in ${language}.
    For emergencies, ALWAYS advise users to contact official stadium staff or call emergency services (911 in USA). Never present yourself as a replacement for emergency professionals.
    Stadium context: MetroFlow Arena, New York, USA. Capacity: 80,000. Today's match: Brazil vs Argentina. Kickoff: 19:00 EDT.`;

    const result = await model.generateContent(`${systemContext}\n\nUser: ${prompt}`);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return getDemoResponse(prompt, language);
  }
}

// ─── Demo Mode Responses ───────────────────────────────────────────────────
function getDemoResponse(prompt: string, language: string): string {
  const lower = prompt.toLowerCase();
  const lang = language || 'english';

  const responses: Record<string, string[]> = {
    gate: [
      '🗺️ **Gate Directions (DEMO)**: Gate 4 is located on the East side of MetroFlow Arena. From your current position, head straight through the main concourse, turn right at Food Court North, and you\'ll see Gate 4 signage. Estimated walk: 3 minutes.',
      '🚪 Gates A & B are on the North side, Gates C & D on the East. Gate E is the VIP entrance (West), Gate F is Press-only. Gates B and C currently have shortest queues.',
    ],
    restroom: [
      '🚻 **Nearest Restrooms (DEMO)**: The closest accessible restroom is at Level 1, Section B (marked with blue wheelchair symbol). Regular restrooms are every 80m along the main concourse. Restroom Block 1 is 50m to your left.',
    ],
    queue: [
      '⏱️ **Current Queue Times (DEMO)**: Gate A — 25 min (Critical), Gate B — 8 min (Moderate), Gate C — 3 min (Low ✅ Recommended), Gate D — 15 min (High), Gate E — 2 min (VIP only).',
    ],
    seat: [
      '💺 **Route to Seat (DEMO)**: For Section B, Row 12: Enter Gate B → Main Concourse → Turn left at Elevator Block → Level 2 → Section B signs. Total: ~4 minutes. Elevator available for accessibility needs.',
    ],
    medical: [
      '🏥 **First Aid (DEMO)**: First Aid Room 1 is located near Gate C (East side). First Aid Room 2 is near Gate A (North side). Staff are on duty 24/7. For emergencies, please contact a stadium marshal immediately or call 911.',
    ],
    transport: [
      '🚇 **Transport (DEMO)**: Metro Line 1 (Stadium Express) — running every 6 min, Platform 3, no delays. Shuttle Bus A (Airport) — Bay 4, next departure 19:00. Taxi Zone T1 — 8 min wait. Parking Zone A is full; use Zone C.',
    ],
    food: [
      '🌱 **Vegetarian Food (DEMO)**: Food Court North (Level 1) has 3 vegetarian stalls including Indian, Mexican, and Mediterranean options. Food Court South has a dedicated vegan section. All allergen information is displayed at counters.',
    ],
    lost: [
      '👶 **Lost Child (DEMO)**: Please go immediately to the Lost & Found Centre (Level 1, near Gate B) or contact any stadium marshal. They will make a PA announcement and coordinate with all gates. For urgent help, call 911.',
    ],
    suspicious: [
      '🔒 **Reporting Suspicious Behaviour (DEMO)**: Contact the nearest security desk (marked with shield icons on maps) or flag down any security personnel. You can also text our security line. Do not confront the individual. Your safety is the priority.',
    ],
    emergency: [
      '🚨 **Emergency Guidance (DEMO)**: 1. Stay calm. 2. Locate the nearest emergency exit (green signs). 3. Follow staff instructions. 4. Do NOT use elevators during fire. 5. Call 911 for life-threatening emergencies. 6. Report via this app using the Emergency button.',
      '⚠️ **IMPORTANT**: This app does NOT replace emergency services. For any life-threatening situation, call 911 immediately and alert the nearest stadium staff.',
    ],
    translate: [
      `🌐 **Translation (DEMO — ${lang})**: Translation services are being simulated. In live mode, I provide real-time translations in English, Hindi, Tamil, Spanish, French, Arabic, Portuguese, and German using Google Gemini. Please select your language from the top bar.`,
    ],
  };

  // Match intent
  for (const [keyword, reps] of Object.entries(responses)) {
    if (lower.includes(keyword)) {
      return `${reps[Math.floor(Math.random() * reps.length)]}\n\n_⚠️ This is a DEMO response. Connect a real Gemini API key for live AI assistance._`;
    }
  }

  return `👋 **FlowBot (DEMO MODE)**: Thank you for your question: "*${prompt}*"\n\nI can help you with:\n• **Navigation** — gates, seats, restrooms, facilities\n• **Transport** — metro, shuttle, taxi, parking\n• **Emergency** — safety guidance (always call 911 for emergencies)\n• **Food** — vegetarian, vegan, allergen info\n• **Crowd** — queue times, best routes\n• **Translate** — multilingual announcements\n\n_⚠️ Connect a Gemini API key in server/.env for real AI responses._`;
}

// ─── Chat Route ────────────────────────────────────────────────────────────
const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().optional(),
  language: z.string().default('english'),
});

router.post('/chat', async (req: AuthRequest, res: Response) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 'Invalid request', 400, parsed.error.errors);

  const { message, conversationId, language } = parsed.data;
  const uid = req.user!.uid;

  try {
    const aiResponse = await callGemini(message, language);
    const timestamp = new Date().toISOString();

    let convId = conversationId;
    if (convId) {
      const conv = demoConversations.find(c => c.id === convId && c.userId === uid);
      if (conv) {
        const msgs = [...conv.messages, { role: 'user' as const, content: message, timestamp }, { role: 'assistant' as const, content: aiResponse, timestamp }];
        updateConversation(convId, msgs);
      }
    } else {
      const conv = addConversation({
        userId: uid, language,
        messages: [{ role: 'user', content: message, timestamp }, { role: 'assistant', content: aiResponse, timestamp }],
        createdAt: timestamp, updatedAt: timestamp,
      });
      convId = conv.id;
    }

    sendSuccess(res, { response: aiResponse, conversationId: convId, language, timestamp, isDemo: !process.env.GEMINI_API_KEY }, 'AI response generated');
  } catch (error) {
    sendError(res, 'AI service temporarily unavailable. Please try again.', 503);
  }
});

// ─── Generate Announcement ────────────────────────────────────────────────
router.post('/generate-announcement', authorize('staff', 'admin'), async (req: AuthRequest, res: Response) => {
  const { purpose, location, tone, languages, urgency } = req.body;

  const prompt = `Generate a stadium announcement for FIFA World Cup 2026.
Purpose: ${purpose}
Location: ${location}
Tone: ${tone}
Urgency: ${urgency}
Languages needed: ${languages?.join(', ')}

Provide:
1. English announcement (2-3 sentences, clear and professional)
2. Short display board version (max 80 characters, ALL CAPS)
3. Audio-friendly version (natural spoken language)
4. Plain language version (simple words, short sentences)
5. Translations in requested languages

Format as JSON with keys: english, displayBoard, audio, plainLanguage, translations (object with language keys)`;

  try {
    const raw = await callGemini(prompt, 'english');

    // Try to parse JSON from Gemini, fallback to demo
    let parsed;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch { parsed = null; }

    if (!parsed) {
      parsed = {
        english: `Attention all visitors: ${purpose} at ${location}. Please follow staff instructions.`,
        displayBoard: `${purpose.toUpperCase()} — ${location.toUpperCase()}`,
        audio: `Attention. ${purpose} at ${location}. Please cooperate with stadium staff. Thank you.`,
        plainLanguage: `Important: ${purpose}. This is at ${location}. Please listen to staff.`,
        translations: {
          hindi: `ध्यान दें: ${purpose} — ${location}`,
          spanish: `Atención: ${purpose} en ${location}`,
          french: `Attention: ${purpose} à ${location}`,
          arabic: `انتباه: ${purpose} في ${location}`,
          tamil: `கவனம்: ${purpose} — ${location}`,
        },
        isDemo: !process.env.GEMINI_API_KEY,
      };
    }

    sendSuccess(res, parsed, 'Announcement generated');
  } catch {
    sendError(res, 'Announcement generation failed', 503);
  }
});

// ─── Generate Task from NL ─────────────────────────────────────────────────
router.post('/generate-task', authorize('staff', 'admin'), async (req: AuthRequest, res: Response) => {
  const { description } = req.body;
  if (!description) return sendError(res, 'Description required', 400);

  const prompt = `Convert this operational request into a structured stadium task for FIFA World Cup 2026:
"${description}"

Provide JSON with: title, priority (low/medium/high/critical), suggestedPersonnel (string), instructions (string), estimatedDuration (number in minutes), zone (string)`;

  try {
    const raw = await callGemini(prompt, 'english');
    let task;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      task = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch { task = null; }

    if (!task) {
      task = {
        title: `Operational task: ${description.slice(0, 50)}`,
        priority: 'medium',
        suggestedPersonnel: '2 volunteers and 1 security staff',
        instructions: description,
        estimatedDuration: 20,
        zone: 'General',
        isDemo: true,
      };
    }

    sendSuccess(res, task, 'Task generated from description');
  } catch {
    sendError(res, 'Task generation failed', 503);
  }
});

// ─── Conversation History ─────────────────────────────────────────────────
router.get('/conversations', (req: AuthRequest, res: Response) => {
  const convs = demoConversations.filter(c => c.userId === req.user?.uid);
  sendSuccess(res, convs, 'Conversations retrieved');
});

export default router;
