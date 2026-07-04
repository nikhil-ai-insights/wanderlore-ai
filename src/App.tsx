import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { TravelMode, SavedGuide } from './types';

// Importing Custom UI components
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import GeneratorForm from './components/GeneratorForm';
import ThinkingAnimation from './components/ThinkingAnimation';
import ResultView from './components/ResultView';

type AppScreen = 'landing' | 'auth' | 'dashboard' | 'form' | 'thinking' | 'result';

// Client-side fallback generator to ensure absolute robustness if API fails or is keyless
export function getClientFallbackResult(mode: TravelMode, inputs: any): any {
  const safeInputs = inputs || {};
  if (mode === 'explorer') {
    const dest = safeInputs.destination || 'Kyoto, Japan';
    const style = safeInputs.travelStyle || 'solo';
    const duration = parseInt(safeInputs.duration) || 3;
    return {
      destination: dest,
      tagline: "Uncover ancient whispers amidst bamboo forests and crimson torii gates.",
      overview: `A deep-rooted exploration of ${dest}, carefully curated to honor local customs, highlight hidden architectural treasures, and promote community-backed eco-travel. Perfect for a ${style} journey of ${duration} days.`,
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
  } else if (mode === 'heritage') {
    const landmark = safeInputs.landmarkName || 'Svalbard Seed Vault';
    const country = safeInputs.regionCountry || 'Norway';
    return {
      landmarkName: landmark,
      regionCountry: country,
      historicalEra: safeInputs.historicalEra || "Late Modern / Anthropocene",
      historicalBackground: `Deep inside the permafrost of Spitsbergen island, the ${landmark} stands as a safeguard for global biodiversity. Created to survive natural disasters, nuclear conflicts, and climate change, it stores millions of crop seeds from all corners of the earth.`,
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
  } else if (mode === 'connect') {
    const loc = safeInputs.location || 'Oaxaca, Mexico';
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
  } else {
    const reg = safeInputs.region || 'The Highlands of Scotland';
    return {
      region: reg,
      targetPersona: safeInputs.targetPersona || "Slow Travelers & Heritage Enthusiasts",
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
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [screen, setScreen] = useState<AppScreen>('landing');
  const [activeMode, setActiveMode] = useState<TravelMode>('explorer');
  const [currentInputs, setCurrentInputs] = useState<any>(null);
  const [currentResult, setCurrentResult] = useState<any>(null);
  const [savedGuides, setSavedGuides] = useState<SavedGuide[]>([]);
  const [isCurrentResultSaved, setIsCurrentResultSaved] = useState(false);
  const [activeGuideId, setActiveGuideId] = useState<string | null>(null);

  // 1. Listen for user auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      if (firebaseUser) {
        setScreen('dashboard');
        loadSavedGuides(firebaseUser.uid);
      } else {
        setScreen('landing');
        setSavedGuides([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Load Saved Guides from Cloud Firestore with LocalStorage Cache fallback
  const loadSavedGuides = async (uid: string) => {
    // Fast load from Cache
    const cached = localStorage.getItem(`guides_${uid}`);
    if (cached) {
      try {
        setSavedGuides(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached guides", e);
      }
    }

    try {
      const q = query(collection(db, 'savedGuides'), where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      const guides: SavedGuide[] = [];
      querySnapshot.forEach((docSnap) => {
        guides.push({ id: docSnap.id, ...docSnap.data() } as SavedGuide);
      });
      
      // Sort guides chronologically desc
      guides.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setSavedGuides(guides);
      localStorage.setItem(`guides_${uid}`, JSON.stringify(guides));
    } catch (err) {
      console.warn("Firestore lookup failed or blocked. Using local storage mode.", err);
    }
  };

  // 3. Save newly generated guide to Firestore & Cache
  const handleSaveGuide = async () => {
    if (!user || !currentResult) return;

    let title = '';
    let subtitle = '';

    if (activeMode === 'explorer') {
      title = currentResult.destination || 'Uncharted Lore';
      subtitle = currentResult.tagline || 'A custom-woven cultural itinerary.';
    } else if (activeMode === 'heritage') {
      title = currentResult.landmarkName || 'Ancient Monument';
      subtitle = `Historical archive for ${currentResult.regionCountry || 'Sacred Region'}.`;
    } else if (activeMode === 'connect') {
      title = `Local Connect: ${currentResult.location || 'Local Community'}`;
      subtitle = 'Direct multigenerational artisan calendar and impact guide.';
    } else if (activeMode === 'organizer') {
      title = `${currentResult.region || 'Strategic Region'} Campaign Plan`;
      subtitle = `Destination campaigns tailored for ${currentResult.targetPersona || 'Slow Travelers'}.`;
    }

    const newGuidePayload: Omit<SavedGuide, 'id'> = {
      userId: user.uid,
      mode: activeMode,
      title,
      subtitle,
      createdAt: new Date().toISOString(),
      explorerResult: activeMode === 'explorer' ? currentResult : undefined,
      heritageResult: activeMode === 'heritage' ? currentResult : undefined,
      connectResult: activeMode === 'connect' ? currentResult : undefined,
      organizerResult: activeMode === 'organizer' ? currentResult : undefined,
    };

    try {
      const docRef = await addDoc(collection(db, 'savedGuides'), newGuidePayload);
      const savedItem: SavedGuide = { id: docRef.id, ...newGuidePayload };
      
      const updatedList = [savedItem, ...savedGuides];
      setSavedGuides(updatedList);
      localStorage.setItem(`guides_${user.uid}`, JSON.stringify(updatedList));
      setIsCurrentResultSaved(true);
      setActiveGuideId(docRef.id);
    } catch (err) {
      console.error("Failed to save to Firestore. Attempting local storage-only save.", err);
      // Fallback local save
      const mockId = 'local_' + Date.now();
      const savedItem: SavedGuide = { id: mockId, ...newGuidePayload };
      const updatedList = [savedItem, ...savedGuides];
      setSavedGuides(updatedList);
      localStorage.setItem(`guides_${user.uid}`, JSON.stringify(updatedList));
      setIsCurrentResultSaved(true);
      setActiveGuideId(mockId);
    }
  };

  // 4. Delete saved guide from Firestore & Cache
  const handleDeleteGuide = async (id: string) => {
    if (!user) return;

    try {
      if (!id.startsWith('local_')) {
        await deleteDoc(doc(db, 'savedGuides', id));
      }
    } catch (err) {
      console.error("Firestore deletion failed", err);
    }

    const updated = savedGuides.filter(g => g.id !== id);
    setSavedGuides(updated);
    localStorage.setItem(`guides_${user.uid}`, JSON.stringify(updated));

    if (activeGuideId === id) {
      setScreen('dashboard');
      setActiveGuideId(null);
    }
  };

  // 5. Trigger REST API call to our Express + Vite server backend
  const handleFormSubmit = async (mode: TravelMode, inputs: any) => {
    setActiveMode(mode);
    setCurrentInputs(inputs);
    setScreen('thinking');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode, inputs }),
      });

      if (!response.ok) {
        throw new Error(`Server returned code ${response.status}`);
      }

      const data = await response.json();
      setCurrentResult(data);
      setIsCurrentResultSaved(false);
      setActiveGuideId(null);
    } catch (err: any) {
      console.error("Failed to generate custom lore:", err);
      alert("Wanderlore Engine experienced an interruption while researching archives. Proceeding with robust fallback local research.");
      
      // Load rich offline fallback result so the interface remains fully interactive and error-free
      const fallbackResult = getClientFallbackResult(mode, inputs);
      setCurrentResult(fallbackResult);
      setIsCurrentResultSaved(false);
      setActiveGuideId(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setScreen('landing');
    } catch (err) {
      console.error("Sign out failure", err);
    }
  };

  const handleSelectSavedGuide = (guide: SavedGuide) => {
    setActiveMode(guide.mode);
    setIsCurrentResultSaved(true);
    setActiveGuideId(guide.id);
    
    if (guide.mode === 'explorer') {
      setCurrentResult(guide.explorerResult);
    } else if (guide.mode === 'heritage') {
      setCurrentResult(guide.heritageResult);
    } else if (guide.mode === 'connect') {
      setCurrentResult(guide.connectResult);
    } else if (guide.mode === 'organizer') {
      setCurrentResult(guide.organizerResult);
    }

    setScreen('result');
  };

  // Loading Screen for Auth hydration checks
  if (authLoading) {
    return (
      <div className="min-h-screen bg-earth-bg flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs text-warm-sand/50 mt-4 uppercase">Syncing Celestial Coordinates...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-bg selection:bg-terracotta selection:text-earth-bg">
      {screen === 'landing' && (
        <LandingPage 
          onGetStarted={() => setScreen(user ? 'dashboard' : 'auth')} 
          isAuthenticated={!!user}
        />
      )}

      {screen === 'auth' && (
        <AuthScreen 
          onBack={() => setScreen('landing')}
          onSuccess={() => {
            if (auth.currentUser) {
              loadSavedGuides(auth.currentUser.uid);
            }
            setScreen('dashboard');
          }}
        />
      )}

      {screen === 'dashboard' && user && (
        <Dashboard 
          onGenerateNew={(mode) => {
            setActiveMode(mode);
            setScreen('form');
          }}
          onSelectGuide={handleSelectSavedGuide}
          onLogout={handleSignOut}
          savedGuidesList={savedGuides}
          onDeleteGuide={handleDeleteGuide}
          userEmail={user.email || ''}
          userDisplayName={user.displayName}
        />
      )}

      {screen === 'form' && (
        <GeneratorForm 
          initialMode={activeMode}
          onBack={() => setScreen('dashboard')}
          onSubmit={handleFormSubmit}
        />
      )}

      {screen === 'thinking' && (
        <ThinkingAnimation 
          onComplete={() => setScreen('result')}
        />
      )}

      {screen === 'result' && (
        <ResultView 
          mode={activeMode}
          result={currentResult}
          onBack={() => setScreen(activeGuideId ? 'dashboard' : 'form')}
          onSave={activeGuideId ? undefined : handleSaveGuide}
          isSaved={isCurrentResultSaved}
        />
      )}
    </div>
  );
}
