import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { TravelMode, SavedGuide, TravelStyle } from '../types';
import { 
  Compass, BookOpen, Users, BarChart3, Plus, Settings, User, LogOut, Trash2, Calendar, 
  MapPin, Sparkles, Award, History, Heart, Check, Save, UserCheck, ShieldCheck
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  onGenerateNew: (mode: TravelMode) => void;
  onSelectGuide: (guide: SavedGuide) => void;
  onLogout: () => void;
  savedGuidesList: SavedGuide[];
  onDeleteGuide: (id: string) => Promise<void>;
  userEmail: string;
  userDisplayName: string | null;
}

export default function Dashboard({ 
  onGenerateNew, 
  onSelectGuide, 
  onLogout, 
  savedGuidesList, 
  onDeleteGuide,
  userEmail,
  userDisplayName
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'guides' | 'profile' | 'settings'>('guides');
  const [defaultLanguage, setDefaultLanguage] = useState('English');
  const [defaultTravelStyle, setDefaultTravelStyle] = useState<TravelStyle>('solo');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Stats calculation
  const totalGuides = savedGuidesList.length;
  const explorerGuides = savedGuidesList.filter(g => g.mode === 'explorer').length;
  const heritageGuides = savedGuidesList.filter(g => g.mode === 'heritage').length;
  const connectGuides = savedGuidesList.filter(g => g.mode === 'connect').length;
  const organizerGuides = savedGuidesList.filter(g => g.mode === 'organizer').length;

  const averageAuthenticity = Math.round(
    savedGuidesList.reduce((acc, curr) => {
      if (curr.explorerResult) return acc + curr.explorerResult.authenticityScore;
      if (curr.heritageResult) return acc + curr.heritageResult.storytellingDepthScore;
      if (curr.connectResult) return acc + curr.connectResult.communityImpactScore;
      return acc + 85; // default fallback
    }, 0) / (totalGuides || 1)
  );

  const savedGemsCount = savedGuidesList.reduce((acc, curr) => {
    if (curr.explorerResult) return acc + (curr.explorerResult.hiddenGems?.length || 0);
    if (curr.heritageResult) return acc + (curr.heritageResult.nearbyHeritageSites?.length || 0);
    if (curr.connectResult) return acc + (curr.connectResult.localArtisans?.length || 0);
    return acc;
  }, 0);

  // Mock data for user's organic travel discovery trend over time
  const discoveryTrendData = [
    { month: 'Feb', guides: 1, gems: 2, impact: 60 },
    { month: 'Mar', guides: 3, gems: 7, impact: 75 },
    { month: 'Apr', guides: totalGuides > 2 ? 4 : 2, gems: savedGemsCount > 4 ? 8 : 4, impact: 82 },
    { month: 'May', guides: totalGuides > 4 ? totalGuides - 1 : 3, gems: savedGemsCount > 6 ? savedGemsCount - 2 : 5, impact: 88 },
    { month: 'Jun', guides: totalGuides, gems: savedGemsCount, impact: averageAuthenticity || 90 },
  ];

  const handleSavePreferences = () => {
    localStorage.setItem(`pref_${userEmail}`, JSON.stringify({ defaultLanguage, defaultTravelStyle }));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  useEffect(() => {
    const cached = localStorage.getItem(`pref_${userEmail}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.defaultLanguage) setDefaultLanguage(parsed.defaultLanguage);
        if (parsed.defaultTravelStyle) setDefaultTravelStyle(parsed.defaultTravelStyle);
      } catch (e) {
        console.error("Failed to parse cached preferences", e);
      }
    }
  }, [userEmail]);

  return (
    <div className="min-h-screen bg-earth-bg text-warm-cream flex flex-col md:flex-row">
      {/* Dynamic Sidebar Container */}
      <aside className="w-full md:w-64 bg-earth-card border-r border-terracotta/10 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Brand area */}
          <div className="p-6 border-b border-terracotta/10 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-terracotta flex items-center justify-center font-display font-bold text-earth-bg">
              W
            </div>
            <span className="font-display font-semibold text-lg tracking-tight">
              Wanderlore <span className="text-terracotta">AI</span>
            </span>
          </div>

          {/* User profile capsule */}
          <div className="p-6 border-b border-terracotta/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-heritage-teal/20 border border-heritage-teal/30 flex items-center justify-center text-heritage-teal font-display font-semibold uppercase">
              {userDisplayName ? userDisplayName[0] : userEmail[0]}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold truncate">{userDisplayName || "Cultural Traveler"}</h4>
              <p className="text-[10px] text-warm-sand/50 font-mono truncate">{userEmail}</p>
            </div>
          </div>

          {/* Sidebar Nav buttons */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveTab('guides')}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono font-medium flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === 'guides' ? 'bg-terracotta text-earth-bg' : 'text-warm-sand hover:bg-earth-bg/40'
              }`}
              id="sidebar-btn-guides"
            >
              <History className="w-4 h-4" />
              <span>Guides & Diary</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono font-medium flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === 'profile' ? 'bg-terracotta text-earth-bg' : 'text-warm-sand hover:bg-earth-bg/40'
              }`}
              id="sidebar-btn-profile"
            >
              <User className="w-4 h-4" />
              <span>Personal Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono font-medium flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === 'settings' ? 'bg-terracotta text-earth-bg' : 'text-warm-sand hover:bg-earth-bg/40'
              }`}
              id="sidebar-btn-settings"
            >
              <Settings className="w-4 h-4" />
              <span>SaaS Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-terracotta/5">
          <button
            onClick={onLogout}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-medium text-red-400 hover:bg-red-950/20 flex items-center gap-3 transition-all cursor-pointer"
            id="sidebar-btn-logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* TAB 1: HISTORIC GUIDES & WORKSPACE */}
        {activeTab === 'guides' && (
          <div className="space-y-8">
            {/* Greeting and Quick Launch */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="font-mono text-xs text-terracotta tracking-widest uppercase block mb-1">DASHBOARD WORKSPACE</span>
                <h1 className="font-display text-3xl font-bold tracking-tight text-gradient">
                  Welcome, {userDisplayName || "Lore Traveler"}
                </h1>
              </div>

              {/* Mode Selection Quick Launch Panel */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onGenerateNew('explorer')}
                  className="px-4 py-2.5 rounded-xl bg-terracotta text-earth-bg text-xs font-mono font-bold flex items-center gap-1.5 hover:shadow-lg hover:shadow-terracotta/10 transition-all cursor-pointer"
                  id="btn-quick-explorer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Explorer Mode</span>
                </button>

                <button
                  onClick={() => onGenerateNew('heritage')}
                  className="px-4 py-2.5 rounded-xl border border-heritage-teal bg-earth-card hover:bg-heritage-teal/10 text-warm-cream text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                  id="btn-quick-heritage"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Heritage Mode</span>
                </button>

                <button
                  onClick={() => onGenerateNew('connect')}
                  className="px-4 py-2.5 rounded-xl border border-warm-sand/20 bg-earth-card hover:border-warm-sand/50 text-warm-cream text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                  id="btn-quick-connect"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Connect Mode</span>
                </button>
              </div>
            </div>

            {/* Platform Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-earth-card border border-warm-sand/10">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono text-warm-sand/50 uppercase tracking-wider block">GUIDES WOVEN</span>
                  <Compass className="w-4 h-4 text-terracotta" />
                </div>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-3xl font-display font-bold text-gradient">{totalGuides}</span>
                  <span className="text-[10px] font-mono text-warm-sand/40">custom diaries</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-earth-card border border-warm-sand/10">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono text-warm-sand/50 uppercase tracking-wider block">SAVED GEMS</span>
                  <MapPin className="w-4 h-4 text-heritage-teal" />
                </div>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-3xl font-display font-bold text-gradient">{savedGemsCount}</span>
                  <span className="text-[10px] font-mono text-warm-sand/40">landmarks</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-earth-card border border-warm-sand/10">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono text-warm-sand/50 uppercase tracking-wider block">AUTHENTICITY INDEX</span>
                  <Award className="w-4 h-4 text-terracotta animate-pulse" />
                </div>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-3xl font-display font-bold text-gradient">{averageAuthenticity}%</span>
                  <span className="text-[10px] font-mono text-warm-sand/40">respect ratio</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-earth-card border border-warm-sand/10">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono text-warm-sand/50 uppercase tracking-wider block">COMMUNITY VALUE</span>
                  <Heart className="w-4 h-4 text-red-400" />
                </div>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-3xl font-display font-bold text-gradient">ECO</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Gold Level</span>
                </div>
              </div>
            </div>

            {/* Travel Analytics Dashboard Graph (using Recharts) */}
            <div className="p-6 rounded-2xl bg-earth-card border border-warm-sand/10">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-display font-bold text-sm">Adventure Milestone Index</h3>
                  <p className="text-[10px] text-warm-sand/50 font-mono">Organic engagement metrics over time</p>
                </div>
                <div className="flex gap-4 font-mono text-[9px] text-warm-sand/60">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-terracotta" /> Guides Created</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-heritage-teal" /> Saved Gems</span>
                </div>
              </div>
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={discoveryTrendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <XAxis dataKey="month" stroke="#FAF6F0" opacity={0.2} style={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }} />
                    <YAxis stroke="#FAF6F0" opacity={0.2} style={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#20241E', border: '1px solid rgba(232, 162, 75, 0.2)', borderRadius: '12px' }} labelStyle={{ color: '#FAF6F0' }} />
                    <Area type="monotone" dataKey="guides" stroke="#E8A24B" fillOpacity={0.1} fill="url(#colorGuides)" />
                    <Area type="monotone" dataKey="gems" stroke="#3E6259" fillOpacity={0.05} fill="url(#colorGems)" />
                    <defs>
                      <linearGradient id="colorGuides" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E8A24B" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#E8A24B" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorGems" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3E6259" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#3E6259" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Saved Guides List Grid */}
            <div>
              <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-terracotta" />
                <span>Your Cultural Diary & Saved Lore</span>
              </h3>

              {savedGuidesList.length === 0 ? (
                <div className="p-12 rounded-3xl border border-dashed border-warm-sand/15 bg-earth-card/25 text-center flex flex-col items-center">
                  <Compass className="w-10 h-10 text-warm-sand/30 mb-3 animate-pulse" />
                  <h4 className="font-display font-semibold text-warm-cream mb-1">Your Travel Archive is Unwritten</h4>
                  <p className="text-xs text-warm-sand/70 max-w-sm leading-relaxed mb-4">
                    Generate your very first guide using Explorer, Heritage, or Local Connect modes. Your discoveries will be preserved here securely.
                  </p>
                  <button
                    onClick={() => onGenerateNew('explorer')}
                    className="px-6 py-2.5 rounded-xl bg-terracotta text-earth-bg text-xs font-mono font-bold hover:shadow-lg transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create My First Lore</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedGuidesList.map((guide) => (
                    <div
                      key={guide.id}
                      className="p-5 rounded-2xl bg-earth-card border border-warm-sand/10 hover:border-terracotta/30 transition-all flex flex-col justify-between group relative h-48"
                    >
                      {/* Delete button absolutely positioned */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Are you sure you want to remove this guide from your diary?")) {
                            onDeleteGuide(guide.id);
                          }
                        }}
                        className="absolute top-4 right-4 p-2 rounded-lg bg-earth-bg/60 text-warm-sand/40 hover:text-red-400 hover:bg-red-950/20 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                        title="Delete Guide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="cursor-pointer" onClick={() => onSelectGuide(guide)} id={`saved-guide-card-${guide.id}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-heritage-teal/20 text-warm-sand border border-heritage-teal/10 uppercase tracking-wider">
                            {guide.mode} Mode
                          </span>
                          <span className="font-mono text-[9px] text-warm-sand/40">
                            {new Date(guide.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-lg text-warm-cream group-hover:text-terracotta transition-colors line-clamp-1 pr-6">
                          {guide.title}
                        </h4>
                        <p className="text-xs text-warm-sand font-light leading-relaxed line-clamp-2 mt-1.5">
                          {guide.subtitle}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-warm-sand/5 text-[10px] font-mono text-warm-sand/60">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-terracotta" />
                          <span>Lore Authenticated</span>
                        </span>
                        <button
                          onClick={() => onSelectGuide(guide)}
                          className="text-terracotta hover:underline text-[10px]"
                        >
                          View Guide →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PROFILE MANAGEMENT */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <span className="font-mono text-xs text-terracotta tracking-widest uppercase block mb-1">CULTURAL PASSPORT</span>
              <h1 className="font-display text-3xl font-bold tracking-tight text-gradient">
                Your Personal Profile
              </h1>
              <p className="text-xs text-warm-sand font-mono mt-1">Manage credentials and local caching profiles.</p>
            </div>

            <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-2xl bg-terracotta flex items-center justify-center font-display font-bold text-3xl text-earth-bg shadow-lg">
                  {userDisplayName ? userDisplayName[0] : userEmail[0]}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">{userDisplayName || "Explorer"}</h3>
                  <span className="font-mono text-xs text-warm-sand/60">Wanderlore Rank: Elite Storyteller</span>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-heritage-teal mt-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Firebase Secure Authenticated Session</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-warm-sand/10 pt-6 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block font-mono text-[10px] text-warm-sand/50 uppercase tracking-wider mb-1">Email Address</span>
                    <span className="font-mono font-medium">{userEmail}</span>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] text-warm-sand/50 uppercase tracking-wider mb-1">Registered Since</span>
                    <span className="font-mono font-medium">July 2026</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-earth-bg/60 border border-warm-sand/5">
                  <h4 className="font-display font-semibold text-xs text-terracotta mb-1 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Lore Integrity Status</span>
                  </h4>
                  <p className="text-[11px] text-warm-sand font-light leading-relaxed">
                    Wanderlore preserves data privacy. Your profile, bookmarks, and generated historical transcripts are stored exclusively in your dedicated, sandboxed Cloud Firestore schema. We do not sell or index your travel destinations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEM PREFERENCES & SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <span className="font-mono text-xs text-terracotta tracking-widest uppercase block mb-1">SYSTEM PREFERENCES</span>
              <h1 className="font-display text-3xl font-bold tracking-tight text-gradient">
                SaaS Preferences
              </h1>
              <p className="text-xs text-warm-sand font-mono mt-1">Configure default presets to streamline future travel generations.</p>
            </div>

            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-200 text-xs flex gap-2 items-center"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Preferences updated and cached successfully!</span>
              </motion.div>
            )}

            <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
              <div>
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">Default Translation Language</label>
                <input
                  type="text"
                  value={defaultLanguage}
                  onChange={(e) => setDefaultLanguage(e.target.value)}
                  placeholder="e.g. English, French, Spanish"
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 px-4 text-sm focus:border-terracotta/50 outline-none text-warm-cream transition-colors"
                  id="settings-lang-input"
                />
                <span className="text-[10px] text-warm-sand/40 font-mono mt-1 block">Wanderlore will prioritize weaving narratives in this language.</span>
              </div>

              <div>
                <label className="block text-xs font-mono text-warm-sand mb-2 uppercase tracking-wider">Preferred Travel Style Preset</label>
                <select
                  value={defaultTravelStyle}
                  onChange={(e) => setDefaultTravelStyle(e.target.value as TravelStyle)}
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 px-4 text-sm focus:border-terracotta/50 outline-none text-warm-cream transition-colors cursor-pointer"
                  id="settings-style-input"
                >
                  <option value="solo" className="bg-earth-card">Solo Slow Explorer</option>
                  <option value="couple" className="bg-earth-card">Couple Atmospheric Expedition</option>
                  <option value="family" className="bg-earth-card">Family Heritage Walk</option>
                  <option value="group" className="bg-earth-card">Social Cultural Gathering</option>
                  <option value="budget" className="bg-earth-card">Eco-Budget Preservationist</option>
                  <option value="luxury" className="bg-earth-card">Premium Fine Art & History Connoisseur</option>
                </select>
              </div>

              <div className="pt-4 border-t border-warm-sand/10 flex justify-end">
                <button
                  onClick={handleSavePreferences}
                  className="px-6 py-2.5 rounded-xl font-display text-xs font-semibold bg-terracotta text-earth-bg hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  id="settings-save-btn"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save System Presets</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
