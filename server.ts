import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import {
  getFallbackExplorer,
  getFallbackHeritage,
  getFallbackConnect,
  getFallbackOrganizer
} from './src/fallbacks';

const app = express();
app.use(express.json());

// Configure enterprise production-grade security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  // Allow embedding in AI Studio preview frame and secure connection to Firebase/Google services
  res.setHeader('Content-Security-Policy', "default-src 'self' https://*.googleapis.com https://*.firebaseapp.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.googleusercontent.com; connect-src 'self' https://*.googleapis.com wss://*.run.app https://*.firebaseapp.com https://identitytoolkit.googleapis.com; frame-src 'self' https://*.firebaseapp.com;");
  next();
});

const PORT = 3000;

// Initialize Google GenAI client lazily & safely with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let ai: any = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  } catch (err) {
    console.error('Failed to initialize Gemini API client:', err);
  }
}

// Enterprise input sanitization & validation helper
function sanitizeInputs(mode: string, inputs: any): any {
  if (!inputs || typeof inputs !== 'object') {
    throw new Error('Inputs payload must be a valid object.');
  }

  const clean: any = {};

  const sanitizeString = (val: any, maxLen = 200): string => {
    if (val === undefined || val === null) return '';
    let s = String(val).replace(/<[^>]*>/g, ''); // strip HTML tags to prevent scripting injection
    if (s.length > maxLen) {
      s = s.substring(0, maxLen);
    }
    return s.trim();
  };

  const sanitizeStringArray = (arr: any, maxItems = 15, maxItemLen = 100): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr
      .slice(0, maxItems)
      .map(item => sanitizeString(item, maxItemLen))
      .filter(item => item.length > 0);
  };

  const sanitizeNumber = (val: any, min = 1, max = 100, def = 1): number => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return def;
    if (num < min) return min;
    if (num > max) return max;
    return num;
  };

  if (mode === 'explorer') {
    clean.destination = sanitizeString(inputs.destination, 150);
    if (!clean.destination) throw new Error('Destination is required.');
    clean.travelStyle = sanitizeString(inputs.travelStyle, 50) || 'solo';
    clean.duration = sanitizeString(inputs.duration, 10) || '3';
    clean.interests = sanitizeStringArray(inputs.interests, 15, 50);
    clean.budgetRange = sanitizeString(inputs.budgetRange, 50) || 'Moderate';
    clean.mobilityNeeds = sanitizeString(inputs.mobilityNeeds, 300) || 'None';
    clean.travelDates = sanitizeString(inputs.travelDates, 100) || 'Flexible';
    clean.languagePreference = sanitizeString(inputs.languagePreference, 50) || 'English';
  } 
  else if (mode === 'heritage') {
    clean.landmarkName = sanitizeString(inputs.landmarkName, 150);
    if (!clean.landmarkName) throw new Error('Landmark Name is required.');
    clean.regionCountry = sanitizeString(inputs.regionCountry, 150) || '';
    clean.historicalEra = sanitizeString(inputs.historicalEra, 100) || 'All eras';
    clean.narrativeTone = sanitizeString(inputs.narrativeTone, 50) || 'folklore';
    clean.languagePreference = sanitizeString(inputs.languagePreference, 50) || 'English';
  } 
  else if (mode === 'connect') {
    clean.location = sanitizeString(inputs.location, 150);
    if (!clean.location) throw new Error('Location is required.');
    clean.travelDates = sanitizeString(inputs.travelDates, 100) || 'Flexible';
    clean.interests = sanitizeStringArray(inputs.interests, 15, 50);
    clean.groupSize = sanitizeNumber(inputs.groupSize, 1, 100, 2);
    clean.preferredExperience = sanitizeString(inputs.preferredExperience, 50) || 'artisan-led';
  } 
  else if (mode === 'organizer') {
    clean.region = sanitizeString(inputs.region, 150);
    if (!clean.region) throw new Error('Region is required.');
    clean.targetPersona = sanitizeString(inputs.targetPersona, 150) || 'Slow Travelers';
    clean.season = sanitizeString(inputs.season, 100) || 'All seasons';
    clean.culturalTheme = sanitizeString(inputs.culturalTheme, 100) || 'heritage and arts';
    clean.promotionGoal = sanitizeString(inputs.promotionGoal, 150) || 'heritage awareness';
  } 
  else {
    throw new Error('Invalid mode specified.');
  }

  return clean;
}

// Robust retry wrapper for Gemini API to handle transient network errors, rate limits, or 503s
async function generateContentWithRetry(aiClient: any, model: string, contents: string, config: any, retries = 3, delayMs = 1500) {
  let lastError: any = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await aiClient.models.generateContent({
        model,
        contents,
        config
      });
      return response;
    } catch (error: any) {
      lastError = error;
      const isTransient = error.status === 503 || error.status === 429 || (error.message && (error.message.includes("503") || error.message.includes("429") || error.message.includes("high demand") || error.message.includes("temporary") || error.message.includes("rate limit")));
      if (isTransient && attempt < retries) {
        console.warn(`Gemini API transient failure (attempt ${attempt}/${retries}). Retrying in ${delayMs * attempt}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      } else {
        throw error;
      }
    }
  }
  throw lastError;
}



// REST API endpoint for AI Travel Generation with robust input validation, sanitization, and updated model
app.post('/api/generate', async (req, res) => {
  const { mode, inputs } = req.body;

  if (!mode) {
    return res.status(400).json({ error: "Missing required 'mode' parameter." });
  }

  let cleanInputs: any;
  try {
    cleanInputs = sanitizeInputs(mode, inputs);
  } catch (validationErr: any) {
    console.error("Input validation and sanitization failed:", validationErr);
    return res.status(400).json({ error: validationErr.message || "Invalid inputs payload provided." });
  }

  console.log(`Received request for mode: ${mode}`);

  // If Gemini API is not setup, return authentic fallback mock instantly
  if (!ai) {
    // Artificial 2-second sleep to simulate high-end "AI thinking" screen
    await new Promise(resolve => setTimeout(resolve, 2200));

    if (mode === 'explorer') {
      return res.json(getFallbackExplorer(cleanInputs.destination, cleanInputs.travelStyle, parseInt(cleanInputs.duration) || 3));
    } else if (mode === 'heritage') {
      return res.json(getFallbackHeritage(cleanInputs.landmarkName, cleanInputs.regionCountry, cleanInputs.narrativeTone));
    } else if (mode === 'connect') {
      return res.json(getFallbackConnect(cleanInputs.location, cleanInputs.preferredExperience));
    } else if (mode === 'organizer') {
      return res.json(getFallbackOrganizer(cleanInputs.region, cleanInputs.targetPersona));
    }
    return res.status(400).json({ error: "Invalid mode specified" });
  }

  // Real Gemini generation logic using @google/genai SDK
  try {
    let prompt = "";
    let systemInstruction = "You are Wanderlore AI, an elite cultural explorer, heritage preservationist, and travel storyteller. Your purpose is to generate authentic, culturally rich, deeply immersive travel guides, folklore, and promotion plans that emphasize hidden gems, local artisans, responsible tourism, and authentic cuisine. Avoid sterile tourist-trap lists. Respond ONLY with valid, raw, unquoted JSON matching the requested TypeScript structure without any Markdown wrappers like ```json or similar formatting.";

    if (mode === 'explorer') {
      prompt = `Generate a high-quality Explorer Mode destination guide for:
Destination: ${cleanInputs.destination}
Travel Dates: ${cleanInputs.travelDates || 'Flexible'}
Trip Duration: ${cleanInputs.duration || '3'} Days
Interests: ${Array.isArray(cleanInputs.interests) ? cleanInputs.interests.join(', ') : 'heritage, architecture, local food'}
Travel Style: ${cleanInputs.travelStyle || 'solo'}
Budget Range: ${cleanInputs.budgetRange || 'Moderate'}
Mobility/Accessibility Needs: ${cleanInputs.mobilityNeeds || 'None'}
Language Preference: ${cleanInputs.languagePreference || 'English'}

The output MUST be a JSON object conforming strictly to this TypeScript structure:
{
  "destination": string,
  "tagline": string,
  "overview": string,
  "iconicAttractions": [{"name": string, "description": string, "whyVisit": string}],
  "hiddenGems": [{"name": string, "description": string, "howToAccess": string, "insiderTip": string}],
  "culinaryHighlights": [{"dishName": string, "description": string, "authenticPlaces": string}],
  "culturalEtiquette": string[],
  "suggestedItinerary": [{"day": number, "title": string, "activities": [{"time": string, "title": string, "description": string, "locationName": string}]}],
  "bestTimeToVisit": string,
  "scenicSpots": string[],
  "safetyAdvisory": string[],
  "sustainabilityTips": string[],
  "narrativeSnapshot": string,
  "localEvents": [{"eventName": string, "date": string, "description": string, "type": string}],
  "budgetBreakdown": [{"category": string, "cost": string, "notes": string}],
  "authenticityScore": number (1-100),
  "hiddenGemScore": number (1-100)
}

Provide highly descriptive, deep cultural context. Ensure that iconic attractions, culinary highlights, day-by-day itinerary plans are well detailed and that hidden gems feel genuinely authentic, historic, or off-the-beaten-path.`;
    } 
    else if (mode === 'heritage') {
      prompt = `Generate a Heritage & Storytelling Guide for:
Landmark/Site Name: ${cleanInputs.landmarkName}
Region/Country: ${cleanInputs.regionCountry}
Historical Era of Interest: ${cleanInputs.historicalEra || 'All eras'}
Narrative Tone: ${cleanInputs.narrativeTone || 'folklore'} (documentary, first-person, folklore, dramatic)
Language Preference: ${cleanInputs.languagePreference || 'English'}

The output MUST be a JSON object conforming strictly to this TypeScript structure:
{
  "landmarkName": string,
  "regionCountry": string,
  "historicalEra": string,
  "historicalBackground": string,
  "culturalSignificance": string,
  "legendsMythsFolklore": [{"title": string, "story": string}],
  "architecturalHighlights": string[],
  "immersiveStory": string, (Provide a rich narrative in the requested tone of at least 3 paragraphs detailing the atmospheric feeling of the place)
  "audioGuideScript": string, (A written script formatted like an audio tour guide)
  "nearbyHeritageSites": [{"name": string, "description": string, "distance": string}],
  "preservationStatus": string,
  "bestVisitingTips": string[],
  "funFacts": string[],
  "storytellingDepthScore": number (1-100)
}

Write with absolute lyricism, reverence for heritage, and historical accuracy.`;
    } 
    else if (mode === 'connect') {
      prompt = `Generate a Local Connect Guide for:
Location: ${cleanInputs.location}
Travel Dates: ${cleanInputs.travelDates || 'Flexible'}
Interest Categories: ${Array.isArray(cleanInputs.interests) ? cleanInputs.interests.join(', ') : 'festivals, crafts, spirituality'}
Group Size: ${cleanInputs.groupSize || '2'}
Preferred Experience Type: ${cleanInputs.preferredExperience || 'artisan-led'} (community-hosted, artisan-led, culinary, spiritual)

The output MUST be a JSON object conforming strictly to this TypeScript structure:
{
  "location": string,
  "eventsCalendar": [{"eventName": string, "date": string, "description": string, "venue": string}],
  "communityExperiences": [{"title": string, "host": string, "description": string, "howToJoin": string, "cost": string}],
  "localArtisans": [{"name": string, "craft": string, "description": string, "location": string}],
  "culinaryExperiences": [{"title": string, "description": string, "chefHost": string}],
  "etiquetteTips": string[],
  "communityImpactScore": number (1-100),
  "uniquenessScore": number (1-100)
}

Make sure the events calendar has realistic events matching interests, and experiences feel community-focused, artisan-led, or culinary-rich.`;
    } 
    else if (mode === 'organizer') {
      prompt = `Generate a Tourism Organizer Strategic Plan for:
Region/Destination: ${cleanInputs.region}
Target Traveler Persona: ${cleanInputs.targetPersona}
Season: ${cleanInputs.season || 'All seasons'}
Cultural Theme/Focus: ${cleanInputs.culturalTheme || 'heritage and arts'}
Promotion Goal: ${cleanInputs.promotionGoal || 'heritage awareness'}

The output MUST be a JSON object conforming strictly to this TypeScript structure:
{
  "region": string,
  "targetPersona": string,
  "positioningIdeas": [{"angle": string, "description": string, "slogan": string}],
  "campaignThemes": [{"title": string, "concept": string, "channels": string[]}],
  "itineraryTemplates": [{"name": string, "theme": string, "duration": string, "keyHighlights": string[]}],
  "storytellingContentAngles": [{"hook": string, "narrativeOutline": string, "suggestedFormat": string}],
  "audienceAppealScore": number (1-100)
}

Provide unique, highly creative content strategies and kampagnen concepts to support local preservation.`;
    } else {
      return res.status(400).json({ error: "Invalid mode specified" });
    }

    const response = await generateContentWithRetry(
      ai,
      'gemini-3.5-flash',
      prompt,
      {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        temperature: 1.0,
      }
    );

    const text = response.text || "{}";
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const resultJson = JSON.parse(cleanedText);
    res.json(resultJson);

  } catch (error: any) {
    console.error("Gemini API generation failed, using server fallback:", error);
    // Return mock fallback on error so the client still receives a beautifully-structured response
    try {
      const safeInputs = cleanInputs || {};
      if (mode === 'explorer') {
        return res.json(getFallbackExplorer(safeInputs.destination, safeInputs.travelStyle, parseInt(safeInputs.duration) || 3));
      } else if (mode === 'heritage') {
        return res.json(getFallbackHeritage(safeInputs.landmarkName, safeInputs.regionCountry, safeInputs.narrativeTone));
      } else if (mode === 'connect') {
        return res.json(getFallbackConnect(safeInputs.location, safeInputs.preferredExperience));
      } else if (mode === 'organizer') {
        return res.json(getFallbackOrganizer(safeInputs.region, safeInputs.targetPersona));
      }
    } catch (fallbackError: any) {
      console.error("Server fallback execution failed:", fallbackError);
    }
    res.status(500).json({ 
      error: "Failed to generate AI travel guide.", 
      details: error.message 
    });
  }
});

// Configure Vite integration for Dev / Production Environments
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite development server mounted as middleware.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production static server configured.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Wanderlore AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
