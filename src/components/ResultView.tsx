import { useState } from 'react';
import { motion } from 'motion/react';
import { TravelMode, ExplorerResult, HeritageResult, ConnectResult, OrganizerResult } from '../types';
import { 
  Compass, BookOpen, Users, BarChart3, Save, Share2, FileText, Clipboard, Check, MapPin, 
  Clock, AlertTriangle, ShieldCheck, Heart, Coffee, Leaf, Sparkles, Volume2, Calendar, Info, 
  HelpCircle, ArrowLeft, Printer
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ResultViewProps {
  mode: TravelMode;
  result: ExplorerResult | HeritageResult | ConnectResult | OrganizerResult;
  onBack: () => void;
  onSave?: () => Promise<void>;
  isSaved?: boolean;
}

export default function ResultView({ mode, result, onBack, onSave, isSaved = false }: ResultViewProps) {
  const [copied, setCopied] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activeStoryReveal, setActiveStoryReveal] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState('1x');
  const [isAudioReading, setIsAudioReading] = useState(false);

  const explorer = result as ExplorerResult;
  const heritage = result as HeritageResult;
  const connect = result as ConnectResult;
  const organizer = result as OrganizerResult;

  if (!result) {
    return (
      <div className="min-h-screen bg-earth-bg flex flex-col justify-center items-center text-center p-6 text-warm-cream">
        <AlertTriangle className="w-12 h-12 text-terracotta mb-4 animate-bounce" />
        <h3 className="font-display text-xl font-bold mb-2">Lore Generation Unsuccessful</h3>
        <p className="text-xs text-warm-sand max-w-sm mb-6 leading-relaxed">
          We encountered an issue retrieving the historical data. Please return to the dashboard and try again.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl bg-terracotta text-earth-bg font-mono text-xs font-bold cursor-pointer hover:bg-terracotta/90 transition-all"
        >
          Return to Inputs
        </button>
      </div>
    );
  }

  const handleCopyClipboard = () => {
    let textToCopy = '';
    if (mode === 'explorer') {
      const res = result as ExplorerResult;
      textToCopy = `# ${res.destination}\n*${res.tagline}*\n\n${res.overview}\n\n## Hidden Gems\n` + 
        res.hiddenGems.map(g => `### ${g.name}\n${g.description}\n*Access:* ${g.howToAccess}\n*Tip:* ${g.insiderTip}`).join('\n\n');
    } else if (mode === 'heritage') {
      const res = result as HeritageResult;
      textToCopy = `# ${res.landmarkName} - Heritage Record\n*Era: ${res.historicalEra}*\n\n${res.historicalBackground}\n\n## Historical Story\n${res.immersiveStory}`;
    } else if (mode === 'connect') {
      const res = result as ConnectResult;
      textToCopy = `# Local Connect: ${res.location}\n\n## Community Experiences\n` + 
        res.communityExperiences.map(e => `### ${e.title} by ${e.host}\n${e.description}\nCost: ${e.cost}`).join('\n\n');
    } else if (mode === 'organizer') {
      const res = result as OrganizerResult;
      textToCopy = `# Promotion Strategy: ${res.region}\n\n## Slogan & Positioning\n` + 
        res.positioningIdeas.map(p => `* ${p.angle}: "${p.slogan}"\n${p.description}`).join('\n\n');
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMarkdown = () => {
    let mdContent = '';
    let fileName = 'wanderlore_guide.md';

    if (mode === 'explorer') {
      const r = result as ExplorerResult;
      fileName = `${r.destination.toLowerCase().replace(/[^a-z0-9]/g, '_')}_guide.md`;
      mdContent = `# ${r.destination} - Wanderlore Guide\n**${r.tagline}**\n\n${r.overview}\n\n` +
        `## Authenticity Score: ${r.authenticityScore}/100 | Hidden Gem Score: ${r.hiddenGemScore}/100\n\n` +
        `## 🏛 Iconic Attractions\n` + r.iconicAttractions.map(a => `### ${a.name}\n${a.description}\n*Why Visit:* ${a.whyVisit}`).join('\n\n') + '\n\n' +
        `## 🌿 Hidden Gems (Off-the-beaten-path)\n` + r.hiddenGems.map(g => `### ${g.name}\n${g.description}\n*How to Access:* ${g.howToAccess}\n*Insider Tip:* ${g.insiderTip}`).join('\n\n') + '\n\n' +
        `## 🥘 Traditional Dishes & Gastronomy\n` + r.culinaryHighlights.map(c => `### ${c.dishName}\n${c.description}\n*Where to eat:* ${c.authenticPlaces}`).join('\n\n') + '\n\n' +
        `## 📌 Day-by-Day Storytelling Itinerary\n` + r.suggestedItinerary.map(day => `### Day ${day.day}: ${day.title}\n` + day.activities.map(act => `* **${act.time}** - ${act.title}: ${act.description} (${act.locationName})`).join('\n')).join('\n\n') + '\n\n' +
        `## 📝 Cultural Etiquette & Customs\n` + r.culturalEtiquette.map(e => `* ${e}`).join('\n') + '\n\n' +
        `## 🛡 Safety & Sustainability\n* **Eco-Tip:** ${r.sustainabilityTips.join(', ')}\n* **Safety Advisory:** ${r.safetyAdvisory.join(', ')}`;
    } else if (mode === 'heritage') {
      const r = result as HeritageResult;
      fileName = `${r.landmarkName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_heritage.md`;
      mdContent = `# ${r.landmarkName} (${r.regionCountry}) - Historical Archive\n*Historical Era: ${r.historicalEra}*\n\n` +
        `## Background & Origins\n${r.historicalBackground}\n\n` +
        `## Cultural & Historical Significance\n${r.culturalSignificance}\n\n` +
        `## 🏮 Myths, Legends & Folklore\n` + r.legendsMythsFolklore.map(f => `### ${f.title}\n${f.story}`).join('\n\n') + '\n\n' +
        `## 📜 Immersive Historical Narrative\n${r.immersiveStory}\n\n` +
        `## 🎙 Written Audio Tour Guide Script\n${r.audioGuideScript}\n\n` +
        `## ✨ Fun Facts & Trivia\n` + r.funFacts.map(f => `* ${f}`).join('\n');
    } else if (mode === 'connect') {
      const r = result as ConnectResult;
      fileName = `${r.location.toLowerCase().replace(/[^a-z0-9]/g, '_')}_connect.md`;
      mdContent = `# Local Connect: ${r.location}\n\n` +
        `## 📅 Cultural Events Calendar\n` + r.eventsCalendar.map(e => `### ${e.eventName} (${e.date})\n${e.description}\n*Venue:* ${e.venue}`).join('\n\n') + '\n\n' +
        `## 🧵 Artisan Cooperatives & Craftspeople\n` + r.localArtisans.map(a => `### ${a.name} - ${a.craft}\n${a.description}\n*Location:* ${a.location}`).join('\n\n') + '\n\n' +
        `## 🥘 Artisan-Led Experiences\n` + r.communityExperiences.map(e => `### ${e.title} by ${e.host}\n${e.description}\n*Access:* ${e.howToJoin}\n*Cost:* ${e.cost}`).join('\n\n');
    } else if (mode === 'organizer') {
      const r = result as OrganizerResult;
      fileName = `${r.region.toLowerCase().replace(/[^a-z0-9]/g, '_')}_campaign_plan.md`;
      mdContent = `# ${r.region} Tourism positioning & Campaign\n**Target Persona: ${r.targetPersona}**\n\n` +
        `## 📌 Positioning Themes\n` + r.positioningIdeas.map(i => `### ${i.angle}\n*Slogan:* "${i.slogan}"\n${i.description}`).join('\n\n') + '\n\n' +
        `## 📢 Campaign Campaign Outlines\n` + r.campaignThemes.map(c => `### ${c.title}\n*Concept:* ${c.concept}\n*Channels:* ${c.channels.join(', ')}`).join('\n\n') + '\n\n' +
        `## 📝 Core Story Angles\n` + r.storytellingContentAngles.map(a => `### Hook: "${a.hook}"\n*Format:* ${a.suggestedFormat}\n*Narrative:* ${a.narrativeOutline}`).join('\n\n');
    }

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTriggerSave = async () => {
    if (!onSave) return;
    setSaveLoading(true);
    await onSave();
    setSaveLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // Sound generator simulation
  const toggleAudioScript = () => {
    setIsAudioReading(!isAudioReading);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4" id="results-dashboard-root">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-warm-sand/10 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-warm-sand hover:text-terracotta transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Inputs</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {onSave && (
            <button
              onClick={handleTriggerSave}
              disabled={isSaved || saveLoading}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                isSaved
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
                  : 'border-terracotta/20 bg-earth-card hover:border-terracotta text-terracotta'
              }`}
              id="result-save-btn"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaved ? "Saved to Diary" : saveLoading ? "Saving..." : "Save Guide"}</span>
            </button>
          )}

          <button
            onClick={handleCopyClipboard}
            className="px-4 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 border border-warm-sand/10 bg-earth-card hover:border-warm-sand/30 text-warm-sand transition-all cursor-pointer"
            id="result-copy-btn"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Raw"}</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="px-4 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 border border-warm-sand/10 bg-earth-card hover:border-warm-sand/30 text-warm-sand transition-all cursor-pointer"
            id="result-md-btn"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Markdown</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 border border-warm-sand/10 bg-earth-card hover:border-warm-sand/30 text-warm-sand transition-all cursor-pointer"
            id="result-pdf-btn"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* RENDER DYNAMIC CARD LAYOUT BASED ON ACTIVE MODE */}

      {/* 1. EXPLORER MODE RENDER */}
      {mode === 'explorer' && (
        <div className="space-y-8">
          {/* Main Title Banner */}
          <div className="p-8 sm:p-12 rounded-3xl border border-terracotta/15 bg-gradient-to-br from-earth-card to-earth-bg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 font-mono text-[10px] text-terracotta/25">
              EXPLORER MODE DISCOVERY
            </div>
            <span className="font-mono text-xs text-terracotta uppercase tracking-widest block mb-2">CULTURAL ARCHIVE</span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-gradient mb-3">
              {explorer.destination}
            </h1>
            <p className="font-sans text-lg text-warm-sand/90 font-light italic mb-6">
              "{explorer.tagline}"
            </p>
            <p className="text-warm-sand text-sm font-light leading-relaxed max-w-3xl">
              {explorer.overview}
            </p>

            {/* Score Indicators Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-warm-sand/10">
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-full border border-terracotta/20 flex items-center justify-center font-mono text-base font-bold text-terracotta bg-earth-bg">
                  {explorer.authenticityScore}
                </div>
                <div>
                  <h4 className="font-display text-xs font-semibold">Authenticity Score</h4>
                  <p className="text-[10px] text-warm-sand/50 font-mono">Multigenerational impact</p>
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-full border border-heritage-teal/20 flex items-center justify-center font-mono text-base font-bold text-heritage-teal bg-earth-bg">
                  {explorer.hiddenGemScore}
                </div>
                <div>
                  <h4 className="font-display text-xs font-semibold">Hidden Gem Score</h4>
                  <p className="text-[10px] text-warm-sand/50 font-mono">Off-the-beaten-path density</p>
                </div>
              </div>

              <div className="flex gap-2 items-center col-span-2 sm:col-span-1 text-xs text-warm-sand border-l border-warm-sand/10 pl-0 sm:pl-4">
                <Clock className="w-4 h-4 text-terracotta shrink-0" />
                <div>
                  <span className="block font-mono text-[10px] text-warm-sand/40">BEST TIME TO VISIT</span>
                  <span className="font-semibold text-xs text-warm-cream">{explorer.bestTimeToVisit}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Immersive Story Snapshot Reveal Card (Instagram inspired) */}
          <div className="p-8 rounded-3xl border border-heritage-teal/15 bg-earth-card/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-heritage-teal/40">[AMBIENT TALE]</div>
            <span className="font-mono text-[10px] text-heritage-teal uppercase tracking-widest block mb-2">IMMERSIVE SNAPSHOT</span>
            <h3 className="font-display text-xl font-bold mb-4 text-warm-cream">
              The Spirit of the Locale
            </h3>
            <p className={`text-warm-sand text-sm font-light leading-relaxed transition-all duration-700 ${activeStoryReveal ? '' : 'line-clamp-3'}`}>
              {explorer.narrativeSnapshot}
            </p>
            <button
              onClick={() => setActiveStoryReveal(!activeStoryReveal)}
              className="mt-4 text-xs font-mono text-terracotta font-semibold hover:underline flex items-center gap-1"
            >
              <span>{activeStoryReveal ? "Hide Narrative" : "Reveal Immersive Story"}</span>
            </button>
          </div>

          {/* Grid of Attractions, Gems and culinary details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Iconic Attractions */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl">
              <div className="flex gap-3 items-center mb-6 border-b border-warm-sand/10 pb-4">
                <div className="p-2 rounded-xl bg-terracotta/10 text-terracotta">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-bold">Iconic Cultural Attractions</h3>
              </div>
              <div className="space-y-6">
                {explorer.iconicAttractions.map((item, i) => (
                  <div key={i} className="group">
                    <h4 className="font-display font-semibold text-sm text-terracotta group-hover:underline cursor-pointer">{item.name}</h4>
                    <p className="text-warm-sand text-xs font-light mt-1.5 leading-relaxed">{item.description}</p>
                    <div className="mt-2 text-[10px] font-mono text-warm-sand/50 bg-earth-bg/40 p-2.5 rounded-lg border border-warm-sand/5">
                      <span className="text-terracotta font-semibold">CULTURAL FIT:</span> {item.whyVisit}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hidden Gems (Core Highlight) */}
            <div className="p-6 sm:p-8 rounded-3xl border border-terracotta/20 bg-earth-card/60 relative">
              <div className="absolute top-4 right-4 animate-pulse">
                <Sparkles className="w-4 h-4 text-terracotta" />
              </div>
              <div className="flex gap-3 items-center mb-6 border-b border-warm-sand/10 pb-4">
                <div className="p-2 rounded-xl bg-terracotta/10 text-terracotta">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-gradient">Hidden Gems & Folklore Secrets</h3>
              </div>
              <div className="space-y-6">
                {explorer.hiddenGems.map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-earth-bg/50 border border-warm-sand/5 hover:border-terracotta/30 transition-all">
                    <h4 className="font-display font-semibold text-sm text-warm-cream flex justify-between">
                      <span>{item.name}</span>
                      <span className="font-mono text-[9px] text-terracotta border border-terracotta/20 px-2 py-0.5 rounded-full">HIDDEN GEM</span>
                    </h4>
                    <p className="text-warm-sand text-xs font-light mt-1.5 leading-relaxed">{item.description}</p>
                    <div className="mt-2.5 space-y-1">
                      <p className="text-[10px] text-warm-sand/60 font-sans">
                        <span className="font-mono text-[9px] text-heritage-teal uppercase tracking-wider font-semibold">How to Access:</span> {item.howToAccess}
                      </p>
                      <p className="text-[10px] text-terracotta/80 font-sans italic">
                        <span className="font-mono text-[9px] text-terracotta uppercase tracking-wider font-semibold not-italic">Insider Tip:</span> {item.insiderTip}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Map Visual Pinboard */}
          <div className="p-6 sm:p-8 rounded-3xl bg-earth-card/40 border border-warm-sand/10 relative overflow-hidden">
            <h3 className="font-display text-base font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-terracotta" />
              <span>Interactive Location Pinboard</span>
            </h3>
            {/* Visual simulation of map coordinates */}
            <div className="w-full h-48 bg-earth-bg/80 border border-warm-sand/5 rounded-2xl relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#E8A24B_1px,transparent_1px)] [background-size:16px_16px]" />
              
              {/* Connecting thread line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path d="M 120 80 Q 250 40 380 120 T 680 60" fill="none" stroke="#E8A24B" strokeWidth="1" strokeDasharray="4 4" className="animate-pulse" />
              </svg>

              {/* Mock Pins */}
              <div className="absolute top-[80px] left-[120px] group cursor-pointer flex flex-col items-center">
                <MapPin className="w-5 h-5 text-terracotta animate-bounce" />
                <span className="bg-earth-card text-[9px] font-mono px-2 py-1 rounded-md border border-terracotta/30 shadow-md">Gio-ji Moss Temple</span>
              </div>

              <div className="absolute top-[120px] left-[380px] group cursor-pointer flex flex-col items-center">
                <MapPin className="w-5 h-5 text-heritage-teal animate-bounce" style={{ animationDelay: '1s' }} />
                <span className="bg-earth-card text-[9px] font-mono px-2 py-1 rounded-md border border-heritage-teal/30 shadow-md">Traditional Tofu Dining</span>
              </div>

              <div className="absolute top-[60px] left-[680px] group cursor-pointer flex flex-col items-center">
                <MapPin className="w-5 h-5 text-terracotta animate-bounce" style={{ animationDelay: '2s' }} />
                <span className="bg-earth-card text-[9px] font-mono px-2 py-1 rounded-md border border-terracotta/30 shadow-md">Saga-Arashiyama Trail</span>
              </div>

              <span className="absolute bottom-3 right-3 text-[10px] text-warm-sand/40 font-mono">VISUAL PATHING CO-ORDINATES ACTIVE</span>
            </div>
          </div>

          {/* Itinerary Storytelling */}
          <div className="p-6 sm:p-8 rounded-3xl border border-warm-sand/15 bg-earth-card/20">
            <h3 className="font-display text-2xl font-bold text-gradient mb-6 pb-4 border-b border-warm-sand/10 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-terracotta" />
              <span>Personalized Storytelling Itinerary</span>
            </h3>
            
            <div className="space-y-8">
              {explorer.suggestedItinerary.map((day, i) => (
                <div key={i} className="relative pl-6 sm:pl-8 border-l-2 border-heritage-teal/30 group">
                  {/* Glowing Node indicator */}
                  <div className="absolute -left-2.5 top-1 w-4 h-4 rounded-full bg-earth-bg border-2 border-heritage-teal flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-terracotta group-hover:scale-125 transition-transform" />
                  </div>
                  
                  <span className="font-mono text-xs text-terracotta uppercase tracking-wider block mb-1">DAY {day.day}</span>
                  <h4 className="font-display text-xl font-bold mb-4">{day.title}</h4>
                  
                  <div className="space-y-4">
                    {day.activities.map((act, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-earth-card/40 border border-warm-sand/5 hover:border-heritage-teal/20 transition-all">
                        <div className="flex flex-wrap justify-between items-baseline mb-1">
                          <span className="font-mono text-xs text-heritage-teal font-semibold">{act.time}</span>
                          <span className="text-[10px] text-warm-sand/50 font-sans flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-terracotta" />
                            {act.locationName}
                          </span>
                        </div>
                        <h5 className="font-display font-semibold text-sm text-warm-cream">{act.title}</h5>
                        <p className="text-warm-sand text-xs font-light mt-1.5 leading-relaxed">{act.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gastronomy & local eating */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel">
            <div className="flex gap-3 items-center mb-6 border-b border-warm-sand/10 pb-4">
              <div className="p-2 rounded-xl bg-terracotta/10 text-terracotta">
                <Coffee className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold">Traditional Gastronomy & Dishes</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {explorer.culinaryHighlights.map((dish, i) => (
                <div key={i} className="p-5 rounded-2xl bg-earth-bg/50 border border-warm-sand/5">
                  <h4 className="font-display font-semibold text-sm text-terracotta">{dish.dishName}</h4>
                  <p className="text-warm-sand text-xs font-light mt-1.5 leading-relaxed">{dish.description}</p>
                  <p className="text-[10px] text-warm-sand/60 font-sans mt-3">
                    <span className="font-mono text-[9px] text-heritage-teal uppercase tracking-wider font-semibold block mb-0.5">Where to experience authentically:</span>
                    {dish.authenticPlaces}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Events, Budget and Etiquette Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Local Events */}
            <div className="p-6 rounded-2xl bg-earth-card/40 border border-warm-sand/10">
              <h4 className="font-display font-bold text-sm text-gradient mb-4 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-terracotta" />
                <span>Events Happening</span>
              </h4>
              <div className="space-y-4">
                {explorer.localEvents && explorer.localEvents.map((evt, i) => (
                  <div key={i} className="p-3 rounded-xl bg-earth-bg/50 border border-warm-sand/5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-[9px] text-terracotta">{evt.date}</span>
                      <span className="font-mono text-[8px] bg-heritage-teal/20 text-warm-sand px-1.5 py-0.5 rounded">{evt.type}</span>
                    </div>
                    <h5 className="font-display font-semibold text-xs text-warm-cream">{evt.eventName}</h5>
                    <p className="text-[11px] text-warm-sand font-light mt-1">{evt.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cultural Etiquette */}
            <div className="p-6 rounded-2xl bg-earth-card/40 border border-warm-sand/10">
              <h4 className="font-display font-bold text-sm text-gradient mb-4 uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-terracotta" />
                <span>Local Customs</span>
              </h4>
              <ul className="space-y-3">
                {explorer.culturalEtiquette.map((et: string, i: number) => (
                  <li key={i} className="text-xs text-warm-sand font-light leading-relaxed flex gap-2">
                    <span className="text-terracotta shrink-0">▪</span>
                    <span>{et}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Budget Breakdown */}
            <div className="p-6 rounded-2xl bg-earth-card/40 border border-warm-sand/10">
              <h4 className="font-display font-bold text-sm text-gradient mb-4 uppercase tracking-wider flex items-center gap-2">
                <Coffee className="w-4 h-4 text-terracotta" />
                <span>Travel Budget Plan</span>
              </h4>
              <div className="space-y-3 font-mono text-xs text-warm-sand">
                {explorer.budgetBreakdown.map((b, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-earth-bg/50 border border-warm-sand/5 flex flex-col justify-between">
                    <div className="flex justify-between font-semibold">
                      <span className="text-warm-cream">{b.category}</span>
                      <span className="text-terracotta">{b.cost}</span>
                    </div>
                    <span className="text-[10px] text-warm-sand/50 font-sans mt-0.5">{b.notes}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Safety & Responsible travel notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-display font-bold text-amber-200 mb-1">Safety & Travel Advisory</h5>
                <ul className="list-disc pl-4 space-y-1 text-amber-200/80 font-light">
                  {explorer.safetyAdvisory.map((sa: string, i: number) => <li key={i}>{sa}</li>)}
                </ul>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs flex gap-3">
              <Leaf className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-display font-bold text-emerald-200 mb-1">Sustainability & Responsible Travel</h5>
                <ul className="list-disc pl-4 space-y-1 text-emerald-200/80 font-light">
                  {explorer.sustainabilityTips.map((st: string, i: number) => <li key={i}>{st}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. HERITAGE & STORYTELLING MODE RENDER */}
      {mode === 'heritage' && (
        <div className="space-y-8">
          {/* Main Title Banner */}
          <div className="p-8 sm:p-12 rounded-3xl border border-heritage-teal/15 bg-gradient-to-br from-earth-card to-earth-bg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 font-mono text-[10px] text-heritage-teal/30">
              HERITAGE STORY ARCHIVE
            </div>
            <span className="font-mono text-xs text-heritage-teal uppercase tracking-widest block mb-2">EPIC RECORD</span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-gradient mb-3">
              {heritage.landmarkName}
            </h1>
            <p className="font-sans text-lg text-warm-sand/90 font-light italic mb-6">
              {heritage.regionCountry} • Historical Era: <span className="font-semibold text-warm-cream">{heritage.historicalEra}</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-warm-sand/10">
              <div>
                <h4 className="font-display font-semibold text-xs text-terracotta uppercase tracking-wider mb-2">Historical Background</h4>
                <p className="text-xs text-warm-sand font-light leading-relaxed">{heritage.historicalBackground}</p>
              </div>
              <div>
                <h4 className="font-display font-semibold text-xs text-heritage-teal uppercase tracking-wider mb-2">Cultural Significance</h4>
                <p className="text-xs text-warm-sand font-light leading-relaxed">{heritage.culturalSignificance}</p>
              </div>
            </div>
          </div>

          {/* Immersive Atmospheric Story Narrative Card */}
          <div className="p-8 sm:p-10 rounded-3xl border border-terracotta/20 bg-earth-card relative">
            <span className="font-mono text-[10px] text-terracotta uppercase tracking-widest block mb-4">THE CHRONICLE</span>
            <h3 className="font-display text-2xl font-bold mb-6 text-gradient">
              Legends & Atmospheric Story
            </h3>
            
            {/* Render atmospheric paragraphs nicely */}
            <div className="text-warm-sand text-sm font-light leading-relaxed space-y-4">
              {heritage.immersiveStory.split('\n\n').map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Legends Myths sidebar inside card */}
            {heritage.legendsMythsFolklore && heritage.legendsMythsFolklore.map((myth, i) => (
              <div key={i} className="mt-8 p-6 rounded-2xl bg-earth-bg/50 border border-terracotta/10 relative">
                <div className="absolute top-4 right-4 text-xs font-mono text-terracotta/40">FOLKLORE</div>
                <h4 className="font-display font-semibold text-base text-terracotta mb-2">{myth.title}</h4>
                <p className="text-xs text-warm-sand font-light leading-relaxed">{myth.story}</p>
              </div>
            ))}
          </div>

          {/* Immersive Audio Guide Player Experience */}
          <div className="p-6 sm:p-8 rounded-3xl bg-earth-card/50 border border-warm-sand/10 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-warm-sand/5">
              <div className="flex gap-3 items-center">
                <div className="p-2.5 rounded-xl bg-terracotta/10 text-terracotta">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold">Immersive Written Audio Guide</h3>
                  <p className="text-[10px] text-warm-sand/50 font-mono">Simulated oratory companion</p>
                </div>
              </div>

              {/* simulated media controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleAudioScript}
                  className="px-4 py-1.5 rounded-full bg-terracotta text-earth-bg font-display text-xs font-medium hover:scale-105 transition-all"
                >
                  {isAudioReading ? "PAUSE AUDIO" : "PLAY SOUNDS"}
                </button>
                <select
                  value={audioSpeed}
                  onChange={(e) => setAudioSpeed(e.target.value)}
                  className="bg-earth-bg border border-warm-sand/10 rounded-full px-2.5 py-1 text-[10px] font-mono text-warm-sand cursor-pointer"
                >
                  <option value="1x">1.0x Speed</option>
                  <option value="1.2x">1.2x Speed</option>
                  <option value="1.5x">1.5x Speed</option>
                </select>
              </div>
            </div>

            {/* Simulated waveform */}
            {isAudioReading && (
              <div className="flex items-end gap-1 justify-center h-8 mb-6 animate-pulse">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div 
                     key={i} 
                     className="w-1 bg-terracotta rounded-full" 
                     style={{ 
                       height: `${Math.floor(Math.random() * 24) + 4}px`,
                       animationDelay: `${i * 0.05}s`,
                       animationDuration: '0.8s'
                     }} 
                  />
                ))}
              </div>
            )}

            <div className="p-5 rounded-2xl bg-earth-bg/60 border border-warm-sand/5 font-mono text-xs text-warm-sand leading-relaxed relative">
              <div className="absolute top-2 right-3 font-mono text-[8px] text-warm-sand/30">AUDIO SCRIPT</div>
              {heritage.audioGuideScript}
            </div>
          </div>

          {/* Architectural highlights, Facts & conservation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 sm:p-8 rounded-3xl glass-panel">
              <h4 className="font-display font-bold text-sm text-gradient mb-4 uppercase tracking-wider">Architectural & Artistic Details</h4>
              <ul className="space-y-3">
                {heritage.architecturalHighlights.map((hl: string, i: number) => (
                  <li key={i} className="text-xs text-warm-sand font-light leading-relaxed flex gap-2">
                    <span className="text-heritage-teal shrink-0">✦</span>
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl glass-panel">
              <h4 className="font-display font-bold text-sm text-gradient mb-4 uppercase tracking-wider">Did You Know? (Trivia)</h4>
              <ul className="space-y-3">
                {heritage.funFacts.map((fact: string, i: number) => (
                  <li key={i} className="text-xs text-warm-sand font-light leading-relaxed flex gap-2">
                    <span className="text-terracotta shrink-0">▪</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Conservation status & adjacent sites */}
          <div className="p-6 sm:p-8 rounded-3xl bg-earth-card/35 border border-warm-sand/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div>
                <span className="font-mono text-[9px] text-terracotta uppercase tracking-widest block mb-1">CONSERVATION & PRESERVATION</span>
                <h4 className="font-display font-semibold text-sm mb-2">Heritage Site Integrity</h4>
                <p className="text-xs text-warm-sand font-light leading-relaxed">{heritage.preservationStatus}</p>
              </div>

              <div className="border-t sm:border-t-0 sm:border-l border-warm-sand/10 pt-4 sm:pt-0 pl-0 sm:pl-6 space-y-3">
                <span className="font-mono text-[9px] text-heritage-teal uppercase tracking-widest block mb-1">Nearby Related Heritage Locations</span>
                {heritage.nearbyHeritageSites && heritage.nearbyHeritageSites.map((site, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex justify-between text-warm-cream">
                      <span className="font-semibold">{site.name}</span>
                      <span className="font-mono text-[10px] text-terracotta">{site.distance} away</span>
                    </div>
                    <p className="text-[11px] text-warm-sand/70 font-light mt-0.5">{site.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. LOCAL CONNECT MODE RENDER */}
      {mode === 'connect' && (
        <div className="space-y-8">
          {/* Main Title Banner */}
          <div className="p-8 sm:p-12 rounded-3xl border border-terracotta/15 bg-gradient-to-br from-earth-card to-earth-bg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 font-mono text-[10px] text-terracotta/30">
              LOCAL CONNECT WORKSPACE
            </div>
            <span className="font-mono text-xs text-terracotta uppercase tracking-widest block mb-2">ARTISAN CO-OP</span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-gradient mb-3">
              {connect.location}
            </h1>
            <p className="text-warm-sand text-sm font-light leading-relaxed max-w-3xl">
              Connect directly with multigenerational craft cooperatives, family hosts, and indigenous culinary masters. Bypass commercialized agencies.
            </p>

            <div className="flex gap-6 mt-6 pt-6 border-t border-warm-sand/10 font-mono text-xs text-warm-sand">
              <div className="flex gap-2 items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-terracotta" />
                <span>Community Impact: {connect.communityImpactScore}/100</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-heritage-teal" />
                <span>Uniqueness Factor: {connect.uniquenessScore}/100</span>
              </div>
            </div>
          </div>

          {/* Events Calendar */}
          <div className="p-6 sm:p-8 rounded-3xl border border-warm-sand/15 bg-earth-card/20">
            <h3 className="font-display text-lg font-bold mb-6 flex items-center gap-2 text-gradient">
              <Calendar className="w-4 h-4 text-terracotta" />
              <span>Authentic Cultural Events Calendar</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {connect.eventsCalendar && connect.eventsCalendar.map((evt, i) => (
                <div key={i} className="p-5 rounded-2xl bg-earth-bg/50 border border-warm-sand/5 hover:border-terracotta/30 transition-all">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-mono text-[10px] text-terracotta uppercase tracking-wider">{evt.date}</span>
                    <span className="font-mono text-[9px] text-warm-sand/40">{evt.venue}</span>
                  </div>
                  <h4 className="font-display font-semibold text-sm text-warm-cream">{evt.eventName}</h4>
                  <p className="text-warm-sand text-xs font-light mt-1.5 leading-relaxed">{evt.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Artisans & Handcrafts */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel">
            <h3 className="font-display text-lg font-bold mb-6 pb-4 border-b border-warm-sand/10 flex items-center gap-2">
              <Users className="w-4 h-4 text-terracotta" />
              <span>Meet the Local Artisans & Guilds</span>
            </h3>

            <div className="space-y-6">
              {connect.localArtisans && connect.localArtisans.map((artisan, i) => (
                <div key={i} className="p-4 rounded-xl bg-earth-bg/50 border border-warm-sand/5 flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <h4 className="font-display font-semibold text-sm text-terracotta">{artisan.name}</h4>
                    <span className="font-mono text-[9px] text-heritage-teal uppercase tracking-widest">{artisan.craft}</span>
                    <p className="text-xs text-warm-sand font-light mt-1 leading-relaxed max-w-xl">{artisan.description}</p>
                  </div>
                  <div className="shrink-0 text-right sm:text-right flex items-end sm:items-end justify-start sm:justify-end">
                    <span className="text-[10px] font-mono text-warm-sand/50 bg-earth-bg/80 px-2 py-1 rounded-md border border-warm-sand/5">
                      📍 {artisan.location}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Community-Hosted Experiences */}
          <div className="p-6 sm:p-8 rounded-3xl border border-heritage-teal/15 bg-earth-card/60">
            <h3 className="font-display text-lg font-bold mb-6 flex items-center gap-2 text-gradient">
              <Sparkles className="w-4 h-4 text-terracotta animate-pulse" />
              <span>Artisan-Led Culinary & Cultural Sessions</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {connect.communityExperiences && connect.communityExperiences.map((exp, i) => (
                <div key={i} className="p-5 rounded-2xl bg-earth-bg/40 border border-warm-sand/5">
                  <h4 className="font-display font-semibold text-sm text-warm-cream">{exp.title}</h4>
                  <p className="text-[10px] font-mono text-terracotta uppercase tracking-wider mb-2">HOSTED BY {exp.host}</p>
                  <p className="text-warm-sand text-xs font-light leading-relaxed mb-4">{exp.description}</p>
                  <div className="flex justify-between items-center text-[10px] font-mono text-warm-sand pt-4 border-t border-warm-sand/5">
                    <span>COST: <span className="text-terracotta font-semibold">{exp.cost}</span></span>
                    <span className="text-heritage-teal font-semibold">ACCESS: {exp.howToJoin}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. TOURISM ORGANIZER RENDER */}
      {mode === 'organizer' && (
        <div className="space-y-8">
          {/* Main Title Banner */}
          <div className="p-8 sm:p-12 rounded-3xl border border-heritage-teal/15 bg-gradient-to-br from-earth-card to-earth-bg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 font-mono text-[10px] text-heritage-teal/30">
              ORGANIZER PORTAL ACTIVE
            </div>
            <span className="font-mono text-xs text-heritage-teal uppercase tracking-widest block mb-2">SAAS METRICS</span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-gradient mb-3">
              {organizer.region} Campaign
            </h1>
            <p className="text-warm-sand text-sm font-light leading-relaxed max-w-3xl">
              Strategic campaign outlines designed to appeal directly to <span className="font-semibold text-terracotta">{organizer.targetPersona}</span>.
            </p>

            <div className="mt-6 pt-6 border-t border-warm-sand/10 flex gap-4 font-mono text-xs text-warm-sand">
              <span className="px-3 py-1 bg-terracotta/10 text-terracotta rounded-full border border-terracotta/10">
                Audience Appeal: {organizer.audienceAppealScore}/100
              </span>
            </div>
          </div>

          {/* Positioning Themes */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel">
            <h3 className="font-display text-lg font-bold mb-6 pb-4 border-b border-warm-sand/10">
              Destination positioning & Identity Angles
            </h3>

            <div className="space-y-6">
              {organizer.positioningIdeas && organizer.positioningIdeas.map((idea, i) => (
                <div key={i} className="p-5 rounded-2xl bg-earth-bg/50 border border-warm-sand/5">
                  <h4 className="font-display font-semibold text-base text-terracotta">"{idea.slogan}"</h4>
                  <span className="font-mono text-[9px] text-heritage-teal uppercase tracking-widest">ANGLE: {idea.angle}</span>
                  <p className="text-xs text-warm-sand font-light mt-1.5 leading-relaxed">{idea.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Campaign Themes & Storytelling Content Angles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 sm:p-8 rounded-3xl border border-terracotta/15 bg-earth-card/40">
              <h3 className="font-display text-lg font-bold mb-6">Suggested Campaign Themes</h3>
              <div className="space-y-6">
                {organizer.campaignThemes && organizer.campaignThemes.map((camp, i) => (
                  <div key={i}>
                    <h4 className="font-display font-semibold text-sm text-terracotta">{camp.title}</h4>
                    <p className="text-xs text-warm-sand font-light mt-1 leading-relaxed">{camp.concept}</p>
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {camp.channels.map((chan: string, idx: number) => (
                        <span key={idx} className="font-mono text-[9px] bg-earth-bg border border-warm-sand/5 px-2 py-0.5 rounded text-warm-sand/60">{chan}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl border border-heritage-teal/15 bg-earth-card/40">
              <h3 className="font-display text-lg font-bold mb-6">Strategic Storytelling Angles</h3>
              <div className="space-y-6">
                {organizer.storytellingContentAngles && organizer.storytellingContentAngles.map((angle, i) => (
                  <div key={i} className="p-4 rounded-xl bg-earth-bg/30 border border-warm-sand/5">
                    <h4 className="font-display font-semibold text-sm text-warm-cream">"{angle.hook}"</h4>
                    <span className="font-mono text-[9px] text-heritage-teal uppercase tracking-widest">FORMAT: {angle.suggestedFormat}</span>
                    <p className="text-xs text-warm-sand font-light mt-2 leading-relaxed">{angle.narrativeOutline}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
