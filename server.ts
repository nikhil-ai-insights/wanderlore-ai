import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Google GenAI client lazily & safely
const apiKey = process.env.GEMINI_API_KEY;
let ai: any = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error('Failed to initialize Gemini API client:', err);
  }
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

// Deep Earthy Fallback Content Creators for seamless offline-first / keyless testing
function getFallbackExplorer(dest: string, style: string, duration: number): any {
  const dName = dest || "Kyoto, Japan";
  return {
    destination: dName,
    tagline: "Uncover ancient whispers amidst bamboo forests and crimson torii gates.",
    overview: `A deep-rooted exploration of ${dName}, carefully curated to honor local customs, highlight hidden architectural treasures, and promote community-backed eco-travel. Perfect for a ${style} journey of ${duration} days.`,
    iconicAttractions: [
      {
        name: "Fushimi Inari-taisha Sanctuary",
        description: "The primary shrine of Inari, located at the base of Inari mountain, featuring thousands of vermilion torii gates winding up the forest trail.",
        whyVisit: "To experience Shinto spiritual architecture and pay respects to the deity of agriculture and business."
      },
      {
        name: "Arashiyama Bamboo Grove",
        description: "A majestic pathway standing between soaring stalks of green bamboo, recognized for its acoustic beauty as wind rustles through the leaves.",
        whyVisit: "The Ministry of the Environment names this one of the '100 Soundscapes of Japan' for its meditative nature."
      }
    ],
    hiddenGems: [
      {
        name: "Gio-ji Temple (The Moss Temple)",
        description: "A small, serene temple hidden deep in Arashiyama, surrounded by a lush forest of velvety moss and tall maples.",
        whyVisit: "It offers absolute silence, a stark contrast to major crowded landmarks, carrying a profound sense of 'Wabi-Sabi' and impermanence.",
        howToAccess: "Take a 20-minute quiet walk north from the main Saga-Arashiyama station path.",
        insiderTip: "Visit during a light rainfall when the green moss glows with intense, ethereal saturation."
      },
      {
        name: "Otagi Nenbutsu-ji Temple",
        description: "A hillside temple famous for its 1,200 stone statues of Rakan (disciples of Buddha), each carved with a unique, whimsical facial expression.",
        whyVisit: "Folk-art preservation that captures authentic local humor, peace, and playful devotion."
      }
    ],
    culinaryHighlights: [
      {
        dishName: "Yudofu (Simmered Silken Tofu)",
        description: "Subtle local tofu cooked in a hot kelp broth, served with fresh ginger, green onions, and savory soy dashi.",
        authenticPlaces: "Okutan Kiyomizu, a traditional restaurant operating for over 350 years."
      },
      {
        dishName: "Matcha Kaiseki Desserts",
        description: "Artisanal stone-ground green tea served with Wagashi (traditional seasonal sugar crafts).",
        authenticPlaces: "Uji Tea Houses along the riverbanks."
      }
    ],
    culturalEtiquette: [
      "Always bow slightly when greeting hosts and temple caretakers.",
      "Remove your shoes before entering temple halls or traditional tatami rooms; slide on provided slippers.",
      "Do not walk and eat at the same time; consume street food standing near the shop front."
    ],
    suggestedItinerary: Array.from({ length: Math.min(duration, 5) }, (_, i) => ({
      day: i + 1,
      title: i === 0 ? "Ancestral Footsteps & Moss Sanctuary" : i === 1 ? "Folklore of the Foothills" : `Cultural Immersion & Artisan Discoveries - Day ${i + 1}`,
      activities: [
        {
          time: "08:30 AM",
          title: "Dawn Sanctuary Walk",
          description: "Stroll through the historical mountain paths before the mid-day arrival of larger groups.",
          locationName: "Gio-ji Moss Garden"
        },
        {
          time: "12:30 PM",
          title: "Artisanal Culinary Gathering",
          description: "Sit on tatami mats and enjoy authentic regional cuisine prepared by local multigenerational families.",
          locationName: "Okutan Kiyomizu"
        },
        {
          time: "03:30 PM",
          title: "Folklore Recital & Tea Ceremony",
          description: "Listen to local storytellers recount ancient myths of spirits and fox messengers over stone-ground tea.",
          locationName: "Traditional Machiya House"
        }
      ]
    })),
    bestTimeToVisit: "Mid-November to early December for the brilliant maple foliage, or early April for the sakura blossoms. Early morning hours are recommended to capture authentic stillness.",
    scenicSpots: [
      "The wooden deck of Kiyomizu-dera during the golden hour sunset.",
      "The narrow, preserved wooden streets of Sannen-zaka looking towards Yasaka Pagoda."
    ],
    safetyAdvisory: [
      "Be careful on narrow stone steps during wet weather.",
      "Respect photography bans in active geisha quarters like Gion to protect community privacy."
    ],
    sustainabilityTips: [
      "Carry a small reusable bag to take all personal refuse back to your accommodation.",
      "Utilize public electric buses or walk to reduce the carbon impact on historical neighborhoods."
    ],
    narrativeSnapshot: "As the morning mist lifts off the Oi River, the sound of wooden sandals clicking against stone echoes softly. Behind a sliding wooden door, a copper kettle hums. This is a place where centuries-old traditions are not performed for audiences, but lived as daily rituals of beauty and respect.",
    localEvents: [
      {
        eventName: "Gion Matsuri Heritage Parade",
        date: "July 17th",
        description: "A spectacular parade featuring massive historical wooden floats decorated with hand-woven tapestries, celebrating community health and purification.",
        type: "Traditional Festival"
      }
    ],
    budgetBreakdown: [
      { category: "Artisanal Dining", cost: "$40 - $70 / day", notes: "Focuses on supporting traditional family restaurants" },
      { category: "Temple & Heritage Access", cost: "$15 / day", notes: "Contributes directly to landmark preservation funds" },
      { category: "Local Transit", cost: "$10 / day", notes: "Using eco-friendly subway passes and walking" }
    ],
    authenticityScore: 94,
    hiddenGemScore: 89
  };
}

function getFallbackHeritage(landmark: string, country: string, tone: string): any {
  const lName = landmark || "Svalbard Seed Vault";
  const region = country || "Norway";
  return {
    landmarkName: lName,
    regionCountry: region,
    historicalEra: "Late Modern / Anthropocene",
    historicalBackground: `Deep inside the permafrost of Spitsbergen island, the ${lName} stands as a safeguard for global biodiversity. Created to survive natural disasters, nuclear conflicts, and climate change, it stores millions of crop seeds from all corners of the earth.`,
    culturalSignificance: "A secular sanctuary representing global unity, agricultural heritage, and long-term human foresight. It is a symbol of peaceful international cooperation, where nations deposit seeds side-by-side regardless of political tensions.",
    legendsMythsFolklore: [
      {
        title: "The Keepers of the Frozen Ark",
        story: "Among the Arctic researchers, whispers exist of the 'Green Ghost of Svalbard'—a personification of the world's extinct flora, said to roam the silent concrete tunnels, blessing the dormant seeds so they retain their vital spark of life for a thousand years."
      }
    ],
    architecturalHighlights: [
      "The striking illuminated entrance installation, 'Perpetual Echo', designed by artist Dyveke Sanne, which sparkles under the northern lights.",
      "The vault rooms carved 120 meters deep into solid sandstone, maintaining a natural frozen temperature even if all cooling equipment fails."
    ],
    immersiveStory: `Imagine standing at the end of the world, where the Arctic wind bites through heavy wool and the sky glows in hues of deep indigo. The concrete portal of the vault cuts through the dark mountainside like a minimalist monument to hope. Inside, the world is silent. No voices, just the low hum of compressors and the visual testimony of crates labeled from North Korea, Syria, the United States, and Colombia. In this icy archive, humanity has locked away its ultimate treasure: the means to rebuild life. It is not gold or manuscripts, but the genetic memory of our soils, waiting under frozen vaults.`,
    audioGuideScript: "[Soft chime sounds] Welcome, traveler, to the absolute peak of the world. Stand before the glowing steel wedge cutting into the grey rock. The light you see is an artistic tribute to the northern lights, calling you to reflect on what we protect for tomorrow. Step forward, minding the icy frost on the threshold, and listen to the silent pact of one hundred nations...",
    nearbyHeritageSites: [
      {
        name: "Historical Coal Mine 3",
        description: "An abandoned industrial heritage mine where visitors can crawl through the low shafts to understand the rugged origins of the Arctic settlement.",
        distance: "12 km"
      }
    ],
    preservationStatus: "Extremely secure. Actively managed by the Nordic Genetic Resource Center and the Norwegian Government, with strict environmental monitoring to protect against melting ice caps.",
    bestVisitingTips: [
      "You cannot enter the seed vault's interior chambers to protect the seeds' biological integrity, but taking a hike to the spectacular entrance portal during the polar night is unforgettable.",
      "Bring professional windproof layers and headlamps if traveling during the winter months."
    ],
    funFacts: [
      "The vault holds over 1 million unique seed samples.",
      "The first withdrawal was made by the International Center for Agricultural Research in the Dry Areas (ICARDA) to replace a seed bank destroyed in Aleppo."
    ],
    storytellingDepthScore: 92
  };
}

function getFallbackConnect(location: string, experience: string): any {
  const loc = location || "Oaxaca, Mexico";
  return {
    location: loc,
    eventsCalendar: [
      {
        eventName: "Guelaguetza Indigenous Gathering",
        date: "Late July",
        description: "An ancient celebration where communities from the eight regions of Oaxaca gather in traditional attire to share dances, music, and gifts of agricultural produce.",
        venue: "Fortín Hill Open-Air Amphitheater"
      },
      {
        eventName: "Night of the Radishes (Noche de Rábanos)",
        date: "December 23rd",
        description: "An annual festival where artisans carve oversized radishes into detailed historical scenes, nativity setups, and folklore legends.",
        venue: "Zócalo Main Square"
      }
    ],
    communityExperiences: [
      {
        title: "Teotitlán del Valle Weaving Workshop",
        host: "The Ruiz Multigenerational Family",
        description: "Learn how Zapotec artisans extract vibrant, natural dyes from cochineal insects, wild pecan leaves, and marigolds, then weave them into woolen tapestries using large wooden pedal looms.",
        howToJoin: "Contact through the community-owned cooperative 'Vida Nueva'.",
        cost: "$45 / person (direct support to family)"
      }
    ],
    localArtisans: [
      {
        name: "Don Manuel & Family",
        craft: "Alebrijes Carving",
        description: "Artisans carving fantastical dream creatures from the soft wood of the copal tree, hand-painted with ancient geometric symbology.",
        location: "San Martín Tilcajete"
      }
    ],
    culinaryExperiences: [
      {
        title: "Pre-Hispanic Mole Mastery Class",
        description: "Spend a morning harvesting native chilies, chocolate, and spices, then grinding them on a volcanic stone metate to make traditional black mole.",
        chefHost: "Maestra Cocinera Traditional Reyna"
      }
    ],
    etiquetteTips: [
      "Always ask for permission before photographing local weavers or children.",
      "Purchase directly from the artisan's workshop and avoid bargaining; the prices reflect weeks of physical labor."
    ],
    communityImpactScore: 97,
    uniquenessScore: 95
  };
}

function getFallbackOrganizer(region: string, targetPersona: string): any {
  const reg = region || "The Highlands of Scotland";
  return {
    region: reg,
    targetPersona: targetPersona || "Slow Travelers & Heritage Enthusiasts",
    positioningIdeas: [
      {
        angle: "Whispers of the Heather",
        description: "Positioning the highlands not as a scenic backdrop for photographs, but as an ancient living library of Gaelic song, stone folklore, and clansman narratives.",
        slogan: "Stop Driving. Start Listening."
      }
    ],
    campaignThemes: [
      {
        title: "The Croft & Loom Trail",
        concept: "A digital campaign mapping active crofts, invite-only tweed weaving workshops, and ancient stone alignments.",
        channels: ["Storyteller Blogs", "Cultural Documentaries on Instagram", "Auditory Travel Podcasts"]
      }
    ],
    itineraryTemplates: [
      {
        name: "The Gaelic Song & Stone Journey",
        theme: "Oratory Traditions & Standing Stones",
        duration: "5 Days",
        keyHighlights: ["Meeting local bards", "Hiking Callanish stone circle at dawn", "Foraging with local herbalists"]
      }
    ],
    storytellingContentAngles: [
      {
        hook: "The thread that outlived kings.",
        narrativeOutline: "Follow the journey of hand-dyed wool from the Outer Hebrides hills, through organic indigo vats, to the rhythmic loom of a master weaver who speaks to the wool in Gaelic.",
        suggestedFormat: "7-minute cinematic short film and immersive photo essay"
      }
    ],
    audienceAppealScore: 88
  };
}

// REST API endpoint for AI Travel Generation
app.post('/api/generate', async (req, res) => {
  const { mode, inputs } = req.body;

  if (!mode || !inputs) {
    return res.status(400).json({ error: "Missing required 'mode' or 'inputs' payload." });
  }

  console.log(`Received request for mode: ${mode}`);

  // If Gemini API is not setup, return authentic fallback mock instantly
  if (!ai) {
    // Artificial 2-second sleep to simulate high-end "AI thinking" screen
    await new Promise(resolve => setTimeout(resolve, 2200));

    if (mode === 'explorer') {
      return res.json(getFallbackExplorer(inputs.destination, inputs.travelStyle, parseInt(inputs.duration) || 3));
    } else if (mode === 'heritage') {
      return res.json(getFallbackHeritage(inputs.landmarkName, inputs.regionCountry, inputs.narrativeTone));
    } else if (mode === 'connect') {
      return res.json(getFallbackConnect(inputs.location, inputs.preferredExperience));
    } else if (mode === 'organizer') {
      return res.json(getFallbackOrganizer(inputs.region, inputs.targetPersona));
    }
    return res.status(400).json({ error: "Invalid mode specified" });
  }

  // Real Gemini generation logic using @google/genai SDK
  try {
    let prompt = "";
    let systemInstruction = "You are Wanderlore AI, an elite cultural explorer, heritage preservationist, and travel storyteller. Your purpose is to generate authentic, culturally rich, deeply immersive travel guides, folklore, and promotion plans that emphasize hidden gems, local artisans, responsible tourism, and authentic cuisine. Avoid sterile tourist-trap lists. Respond ONLY with valid, raw, unquoted JSON matching the requested TypeScript structure without any Markdown wrappers like ```json or similar formatting.";

    if (mode === 'explorer') {
      prompt = `Generate a high-quality Explorer Mode destination guide for:
Destination: ${inputs.destination}
Travel Dates: ${inputs.travelDates || 'Flexible'}
Trip Duration: ${inputs.duration || '3'} Days
Interests: ${Array.isArray(inputs.interests) ? inputs.interests.join(', ') : 'heritage, architecture, local food'}
Travel Style: ${inputs.travelStyle || 'solo'}
Budget Range: ${inputs.budgetRange || 'Moderate'}
Mobility/Accessibility Needs: ${inputs.mobilityNeeds || 'None'}
Language Preference: ${inputs.languagePreference || 'English'}

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
Landmark/Site Name: ${inputs.landmarkName}
Region/Country: ${inputs.regionCountry}
Historical Era of Interest: ${inputs.historicalEra || 'All eras'}
Narrative Tone: ${inputs.narrativeTone || 'folklore'} (documentary, first-person, folklore, dramatic)
Language Preference: ${inputs.languagePreference || 'English'}

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
Location: ${inputs.location}
Travel Dates: ${inputs.travelDates || 'Flexible'}
Interest Categories: ${Array.isArray(inputs.interests) ? inputs.interests.join(', ') : 'festivals, crafts, spirituality'}
Group Size: ${inputs.groupSize || '2'}
Preferred Experience Type: ${inputs.preferredExperience || 'artisan-led'} (community-hosted, artisan-led, culinary, spiritual)

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
Region/Destination: ${inputs.region}
Target Traveler Persona: ${inputs.targetPersona}
Season: ${inputs.season || 'All seasons'}
Cultural Theme/Focus: ${inputs.culturalTheme || 'heritage and arts'}
Promotion Goal: ${inputs.promotionGoal || 'heritage awareness'}

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
      'gemini-2.5-flash',
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
      const safeInputs = inputs || {};
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
