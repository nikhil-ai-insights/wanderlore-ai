import { useState } from 'react';
import { motion } from 'motion/react';
import { TravelMode, TravelStyle, GeneratorInputs } from '../types';
import { Compass, BookOpen, Users, BarChart3, HelpCircle, AlertCircle, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

interface GeneratorFormProps {
  initialMode: TravelMode;
  onBack: () => void;
  onSubmit: (mode: TravelMode, inputs: GeneratorInputs) => void;
}

export default function GeneratorForm({ initialMode, onBack, onSubmit }: GeneratorFormProps) {
  const [mode, setMode] = useState<TravelMode>(initialMode);

  // Form states - Explorer Mode
  const [destination, setDestination] = useState('');
  const [travelDates, setTravelDates] = useState('');
  const [duration, setDuration] = useState('3');
  const [interests, setInterests] = useState<string[]>(['food', 'history']);
  const [travelStyle, setTravelStyle] = useState<TravelStyle>('solo');
  const [budgetRange, setBudgetRange] = useState('Moderate');
  const [mobilityNeeds, setMobilityNeeds] = useState('Standard (no custom mobility aids required)');
  const [languagePreference, setLanguagePreference] = useState('English');

  // Form states - Heritage & Storytelling Mode
  const [landmarkName, setLandmarkName] = useState('');
  const [regionCountry, setRegionCountry] = useState('');
  const [historicalEra, setHistoricalEra] = useState('All Eras');
  const [narrativeTone, setNarrativeTone] = useState('folklore');

  // Form states - Local Connect Mode
  const [connectLocation, setConnectLocation] = useState('');
  const [connectDates, setConnectDates] = useState('');
  const [connectInterests, setConnectInterests] = useState<string[]>(['craft', 'food']);
  const [groupSize, setGroupSize] = useState('2');
  const [preferredExperience, setPreferredExperience] = useState('artisan-led');

  // Form states - Tourism Organizer Mode
  const [organizerRegion, setOrganizerRegion] = useState('');
  const [targetPersona, setTargetPersona] = useState('Slow Travelers & Heritage Lovers');
  const [organizerSeason, setOrganizerSeason] = useState('Autumn / Harvest');
  const [culturalTheme, setCulturalTheme] = useState('Culinary Heritage & Crafts');
  const [promotionGoal, setPromotionGoal] = useState('Boost local artisan trade and historical trail footfall');

  const modeOptions: { id: TravelMode; label: string; icon: any; desc: string }[] = [
    { id: 'explorer', label: 'Explorer', icon: Compass, desc: 'Discover hidden gems & itineraries' },
    { id: 'heritage', label: 'Heritage Story', icon: BookOpen, desc: 'Uncover legends & audio guides' },
    { id: 'connect', label: 'Local Connect', icon: Users, desc: 'Meet artisans & local events' },
    { id: 'organizer', label: 'Organizer Pro', icon: BarChart3, desc: 'Develop local campaigns' },
  ];

  const interestOptions = [
    { id: 'nature', label: '☘ Nature & Outdoors' },
    { id: 'food', label: '🥘 Culinary & Gastronomy' },
    { id: 'art', label: '🎨 Art, Architecture & Design' },
    { id: 'history', label: '🏛 History, Temples & Ruins' },
    { id: 'nightlife', label: '🍷 Nightlife & Urban Culture' },
    { id: 'adventure', label: '🏔 Outdoor Adventure & Trekking' },
    { id: 'spirituality', label: '✨ Spiritual & Wellness' },
    { id: 'craft', label: '🧵 Traditional Handcrafts & Looming' }
  ];

  const handleInterestToggle = (id: string, isConnect: boolean = false) => {
    if (isConnect) {
      if (connectInterests.includes(id)) {
        setConnectInterests(connectInterests.filter(item => item !== id));
      } else {
        setConnectInterests([...connectInterests, id]);
      }
    } else {
      if (interests.includes(id)) {
        setInterests(interests.filter(item => item !== id));
      } else {
        setInterests([...interests, id]);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let payload: GeneratorInputs | null = null;

    if (mode === 'explorer') {
      if (!destination.trim()) return;
      payload = {
        destination,
        travelDates,
        duration: parseInt(duration) || 3,
        interests,
        travelStyle,
        budgetRange,
        mobilityNeeds,
        languagePreference
      };
    } else if (mode === 'heritage') {
      if (!landmarkName.trim() || !regionCountry.trim()) return;
      payload = {
        landmarkName,
        regionCountry,
        historicalEra,
        narrativeTone,
        languagePreference
      };
    } else if (mode === 'connect') {
      if (!connectLocation.trim()) return;
      payload = {
        location: connectLocation,
        travelDates: connectDates,
        interests: connectInterests,
        groupSize: parseInt(groupSize) || 2,
        preferredExperience
      };
    } else if (mode === 'organizer') {
      if (!organizerRegion.trim()) return;
      payload = {
        region: organizerRegion,
        targetPersona,
        season: organizerSeason,
        culturalTheme,
        promotionGoal
      };
    }

    if (payload) {
      onSubmit(mode, payload);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-warm-sand hover:text-terracotta transition-colors mb-8 group"
        id="form-back-btn"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Return to Dashboard</span>
      </button>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {modeOptions.map((opt) => {
          const Icon = opt.icon;
          const isActive = mode === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setMode(opt.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between h-32 relative overflow-hidden group ${
                isActive
                  ? 'border-terracotta bg-earth-card shadow-lg shadow-terracotta/5'
                  : 'border-warm-sand/10 bg-earth-card/40 hover:border-warm-sand/30'
              }`}
              id={`tab-select-${opt.id}`}
            >
              <div className="flex justify-between items-start w-full">
                <div className={`p-2.5 rounded-xl border transition-colors ${
                  isActive ? 'bg-terracotta text-earth-bg border-terracotta' : 'bg-earth-bg/60 text-warm-sand border-warm-sand/10 group-hover:text-terracotta'
                }`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeTabBadge"
                    className="w-1.5 h-1.5 rounded-full bg-terracotta"
                  />
                )}
              </div>
              <div>
                <h4 className="font-display font-semibold text-sm leading-tight group-hover:text-terracotta transition-colors">
                  {opt.label}
                </h4>
                <p className="text-[10px] text-warm-sand/60 font-sans mt-0.5 truncate w-full">
                  {opt.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Form container */}
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel p-8 sm:p-10 rounded-3xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Form Header */}
          <div className="border-b border-warm-sand/10 pb-6 mb-6">
            <h3 className="font-display text-2xl font-bold text-gradient">
              {mode === 'explorer' && "Setup Your Cultural Explorer Guide"}
              {mode === 'heritage' && "Weave an Immersive Heritage Story"}
              {mode === 'connect' && "Discover Local Connections & Events"}
              {mode === 'organizer' && "Develop Tourism Campaigns & positioning"}
            </h3>
            <p className="text-xs text-warm-sand font-mono mt-1">
              {mode === 'explorer' && "Deep-dive destination builder: highlights folklore, local foods, and customized day itineraries."}
              {mode === 'heritage' && "Legends, history, architectural highlights, and audio-style narrations of specific heritage sites."}
              {mode === 'connect' && "Local calendar, community impact indices, and artisan-led slow culinary sessions."}
              {mode === 'organizer' && "Tourism board positioning templates, strategic content angles, and appeal indices."}
            </p>
          </div>

          {/* DYNAMIC MODE FIELDS */}

          {/* 1. Explorer Mode Fields */}
          {mode === 'explorer' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">
                  Target Destination / City / Region <span className="text-terracotta">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kyoto, Japan or Oaxaca, Mexico"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 px-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors placeholder:text-warm-sand/30"
                  id="explorer-dest-input"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">
                  Travel Dates (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. July 12 - July 18, 2026"
                  value={travelDates}
                  onChange={(e) => setTravelDates(e.target.value)}
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 px-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors placeholder:text-warm-sand/30"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">
                  Trip Duration (Days)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 px-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors cursor-pointer"
                >
                  <option value="1" className="bg-earth-card">1 Day (Deep Snapshot)</option>
                  <option value="2" className="bg-earth-card">2 Days (Weekend Explorer)</option>
                  <option value="3" className="bg-earth-card">3 Days (Cultural Journey)</option>
                  <option value="4" className="bg-earth-card">4 Days (Folklore Quest)</option>
                  <option value="5" className="bg-earth-card">5 Days (Immersive Walk)</option>
                  <option value="7" className="bg-earth-card">7 Days (Full Wanderlore Trail)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">
                  Travel Style
                </label>
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value as TravelStyle)}
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 px-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors cursor-pointer"
                >
                  <option value="solo" className="bg-earth-card">Solo Backpacking / Slow Traveler</option>
                  <option value="couple" className="bg-earth-card">Romantic / Couple Journey</option>
                  <option value="family" className="bg-earth-card">Family-Friendly Cultural Trek</option>
                  <option value="group" className="bg-earth-card">Social Group / Explorers</option>
                  <option value="budget" className="bg-earth-card">Eco-Budget Preservationist</option>
                  <option value="luxury" className="bg-earth-card">Premium / Heritage Art Lover</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">
                  Estimated Budget Range
                </label>
                <select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 px-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors cursor-pointer"
                >
                  <option value="Eco-Budget" className="bg-earth-card">Eco-Budget (Local Hostels, Street Food)</option>
                  <option value="Moderate" className="bg-earth-card">Moderate (Boutique Inns, Traditional Diners)</option>
                  <option value="Premium" className="bg-earth-card">Premium (Historical Ryokans, Fine Artisan Dining)</option>
                </select>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">
                  Mobility / Accessibility / Dietary Needs
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wheelchair accessible paths, vegetarian food, slow-walking tours"
                  value={mobilityNeeds}
                  onChange={(e) => setMobilityNeeds(e.target.value)}
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 px-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors placeholder:text-warm-sand/30"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">
                  Narrative Output Language
                </label>
                <input
                  type="text"
                  placeholder="e.g. English, Español, 日本語"
                  value={languagePreference}
                  onChange={(e) => setLanguagePreference(e.target.value)}
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 px-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors placeholder:text-warm-sand/30"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">
                  Select Cultural Focus Interests
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {interestOptions.map((opt) => {
                    const isSelected = interests.includes(opt.id);
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => handleInterestToggle(opt.id, false)}
                        className={`p-3 rounded-xl border text-left text-xs font-medium transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-terracotta/15 border-terracotta text-terracotta'
                            : 'bg-earth-bg/40 border-warm-sand/10 hover:border-warm-sand/30 text-warm-sand'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 2. Heritage Mode Fields */}
          {mode === 'heritage' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">
                  Landmark / Monument Name <span className="text-terracotta">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chichen Itza, Al-Khazneh (Petra)"
                  value={landmarkName}
                  onChange={(e) => setLandmarkName(e.target.value)}
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 px-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors placeholder:text-warm-sand/30"
                  id="heritage-landmark-input"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">
                  Region / Country <span className="text-terracotta">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yucatan, Mexico or Ma'an, Jordan"
                  value={regionCountry}
                  onChange={(e) => setRegionCountry(e.target.value)}
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 px-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors placeholder:text-warm-sand/30"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">
                  Historical Era of Interest
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mayan Classic Period, Nabataean Era, 1st Century BC"
                  value={historicalEra}
                  onChange={(e) => setHistoricalEra(e.target.value)}
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 px-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors placeholder:text-warm-sand/30"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">
                  Narrative Tone
                </label>
                <select
                  value={narrativeTone}
                  onChange={(e) => setNarrativeTone(e.target.value)}
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 px-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors cursor-pointer"
                >
                  <option value="folklore" className="bg-earth-card">Folklore-Weaving (Myths, Legends, Spirits)</option>
                  <option value="first-person" className="bg-earth-card">Atmospheric First-Person (A resident or guardian's narrative)</option>
                  <option value="documentary" className="bg-earth-card">Cinematic Documentary (Detailed, educational historical context)</option>
                  <option value="dramatic" className="bg-earth-card">Dramatic Epic (Theatrical battles, kings, and fall of empires)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">
                  Language Preference
                </label>
                <input
                  type="text"
                  placeholder="e.g. English, French, Spanish"
                  value={languagePreference}
                  onChange={(e) => setLanguagePreference(e.target.value)}
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 px-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors placeholder:text-warm-sand/30"
                />
              </div>
            </div>
          )}

          {/* 3. Local Connect Mode Fields */}
          {mode === 'connect' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">
                  Location / City / Community <span className="text-terracotta">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ubud, Bali or Marrakech, Morocco"
                  value={connectLocation}
                  onChange={(e) => setConnectLocation(e.target.value)}
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 px-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors placeholder:text-warm-sand/30"
                  id="connect-location-input"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">
                  Travel Dates (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. March 14 - 21"
                  value={connectDates}
                  onChange={(e) => setConnectDates(e.target.value)}
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 px-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors placeholder:text-warm-sand/30"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">
                  Group / Explorer Size
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={groupSize}
                  onChange={(e) => setGroupSize(e.target.value)}
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 px-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">
                  Preferred Experience Type
                </label>
                <select
                  value={preferredExperience}
                  onChange={(e) => setPreferredExperience(e.target.value)}
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 px-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors cursor-pointer"
                >
                  <option value="artisan-led" className="bg-earth-card">Artisan-Led Handcrafts & Studio Visits</option>
                  <option value="community-hosted" className="bg-earth-card">Community-Hosted Homestays & Hikes</option>
                  <option value="culinary" className="bg-earth-card">Culinary Workshops & Organic Farming</option>
                  <option value="spiritual" className="bg-earth-card">Spiritual Meditations & Temple Rituality</option>
                </select>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">
                  Interest Focus
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {interestOptions.map((opt) => {
                    const isSelected = connectInterests.includes(opt.id);
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => handleInterestToggle(opt.id, true)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-terracotta/15 border-terracotta text-terracotta'
                            : 'bg-earth-bg/40 border-warm-sand/10 hover:border-warm-sand/30 text-warm-sand'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 4. Tourism Organizer Mode Fields */}
          {mode === 'organizer' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">
                  Target Region / Destination <span className="text-terracotta">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scottish Highlands or Transylvania"
                  value={organizerRegion}
                  onChange={(e) => setOrganizerRegion(e.target.value)}
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 px-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors placeholder:text-warm-sand/30"
                  id="organizer-region-input"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">
                  Target Traveler Persona
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gen-Z Backpackers, Slow Eco-Travelers"
                  value={targetPersona}
                  onChange={(e) => setTargetPersona(e.target.value)}
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 px-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors placeholder:text-warm-sand/30"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">
                  Active Season
                </label>
                <input
                  type="text"
                  placeholder="e.g. Winter Snows, Mid-Summer Equinox"
                  value={organizerSeason}
                  onChange={(e) => setOrganizerSeason(e.target.value)}
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 px-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors placeholder:text-warm-sand/30"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">
                  Cultural Theme / Focus
                </label>
                <input
                  type="text"
                  placeholder="e.g. Folklore Castles, Handloom Textiles"
                  value={culturalTheme}
                  onChange={(e) => setCulturalTheme(e.target.value)}
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 px-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors placeholder:text-warm-sand/30"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">
                  Campaign / Promotion Goal
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Boost visitor numbers to forgotten medieval villages, launch a slow food trail map"
                  value={promotionGoal}
                  onChange={(e) => setPromotionGoal(e.target.value)}
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 px-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors placeholder:text-warm-sand/30"
                />
              </div>
            </div>
          )}

          {/* Submit button */}
          <div className="pt-6 border-t border-warm-sand/10 flex justify-end">
            <button
              type="submit"
              className="px-8 py-3.5 rounded-xl font-display font-medium text-earth-bg bg-terracotta hover:bg-terracotta/90 hover:shadow-lg hover:shadow-terracotta/10 transition-all flex items-center gap-2 cursor-pointer"
              id="form-submit-btn"
            >
              <Sparkles className="w-4 h-4" />
              <span>Weave Your Custom Lore</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
