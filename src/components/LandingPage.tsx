import { motion } from 'motion/react';
import { Compass, BookOpen, Users, BarChart3, ChevronRight, Globe, Shield, Sparkles, Award } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  isAuthenticated: boolean;
}

export default function LandingPage({ onGetStarted, isAuthenticated }: LandingPageProps) {
  const modes = [
    {
      icon: Compass,
      title: "Explorer Mode",
      desc: "Uncover hidden gems, local spots, and customized daily itineraries reflecting your precise travel style and mobility needs.",
      badge: "Most Popular",
      color: "border-terracotta/20 bg-earth-card/40 hover:border-terracotta/50"
    },
    {
      icon: BookOpen,
      title: "Heritage & Storytelling",
      desc: "Travel back in time. Generate cinematic folklore, ancient legends, and written audio-guide scripts of monuments in dramatic, first-person narrative tones.",
      badge: "Deep Culture",
      color: "border-heritage-teal/20 bg-earth-card/40 hover:border-heritage-teal/50"
    },
    {
      icon: Users,
      title: "Local Connect Mode",
      desc: "Skip the tourist traps. Meet authentic multigenerational artisans, explore community-hosted workshops, and experience cultural festivals directly.",
      badge: "Community First",
      color: "border-terracotta/20 bg-earth-card/40 hover:border-terracotta/50"
    },
    {
      icon: BarChart3,
      title: "Tourism Organizer",
      desc: "For local boards, heritage guides, and creators. Design strategic destination campaigns, content angles, and custom itinerary templates.",
      badge: "SaaS Pro",
      color: "border-heritage-teal/20 bg-earth-card/40 hover:border-heritage-teal/50"
    }
  ];

  const faqs = [
    {
      q: "How does Wanderlore AI find its 'Hidden Gems'?",
      a: "Unlike generic travel sites that aggregate mainstream reviews, Wanderlore AI analyzes historical papers, preservation databases, and regional folklore archives to surface spots of high cultural integrity and low tourist congestion."
    },
    {
      q: "Can I use Wanderlore AI offline during my travels?",
      a: "Yes! Every generated guide and storytelling script can be downloaded in high-fidelity Markdown, printed as a travel journal, or exported to PDF so you can access it anywhere without cellular data."
    },
    {
      q: "What makes the storytelling mode 'first-person' or 'folklore'?",
      a: "Our AI engine is trained in historical narratives. Instead of listing dry Wikipedia facts, it weaves historical records into immersive, ambient tales—letting you listen to the landmark speak in the voice of a 15th-century stonemason or a local storyteller."
    }
  ];

  return (
    <div className="min-h-screen bg-earth-bg text-warm-cream selection:bg-terracotta selection:text-earth-bg overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-terracotta/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-terracotta flex items-center justify-center font-display font-bold text-earth-bg">
              W
            </div>
            <span className="font-display font-semibold text-lg tracking-tight">
              Wanderlore <span className="text-terracotta">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onGetStarted}
              className="px-5 py-2 rounded-full font-display text-sm font-medium transition-all duration-300 bg-terracotta text-earth-bg hover:shadow-lg hover:shadow-terracotta/20 hover:-translate-y-0.5 active:translate-y-0"
              id="nav-cta-btn"
            >
              {isAuthenticated ? "Go to Dashboard" : "Start Exploring"}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Ambient background particles */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-terracotta/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-40 left-1/3 w-60 h-60 bg-heritage-teal/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-earth-card/80 border border-terracotta/20 text-xs font-mono text-terracotta mb-6"
        >
          <Sparkles className="w-3 h-3" />
          <span>INTRODUCING WANDERLORE V2.5</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gradient max-w-4xl leading-[1.1] mb-6"
        >
          Discover Places.<br />Live Their Stories.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-base sm:text-xl text-warm-sand max-w-2xl font-light leading-relaxed mb-10"
        >
          Skip the generic lists and crowded tourist traps. Wanderlore AI weaves deep heritage, local legends, community artisans, and custom-tailored itineraries into an immersive, atmospheric travel experience.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button 
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 rounded-full font-display font-medium bg-terracotta text-earth-bg hover:shadow-xl hover:shadow-terracotta/25 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
            id="hero-primary-btn"
          >
            {isAuthenticated ? "Access Your Dashboard" : "Create Your Free Account"}
            <ChevronRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('modes');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-full font-display font-medium border border-warm-sand/20 hover:border-warm-sand/50 hover:bg-earth-card/20 transition-all duration-300 flex items-center justify-center text-warm-sand hover:text-warm-cream"
          >
            Explore Discovery Modes
          </button>
        </motion.div>
      </header>

      {/* Discovery Modes Section */}
      <section id="modes" className="py-24 px-6 bg-earth-card/20 border-y border-terracotta/5 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-gradient mb-4">
              Immersive Architectural Modes
            </h2>
            <p className="text-warm-sand font-light leading-relaxed">
              Tailor-made discovery pipelines designed for independent explorers, storytelling enthusiasts, and local tourism advocates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {modes.map((mode, idx) => {
              const Icon = mode.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className={`p-8 rounded-3xl border transition-all duration-500 cursor-pointer group ${mode.color}`}
                  onClick={onGetStarted}
                  id={`mode-card-${idx}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 rounded-2xl bg-earth-bg/80 border border-terracotta/10 text-terracotta group-hover:bg-terracotta group-hover:text-earth-bg transition-colors duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-xs px-3 py-1 rounded-full bg-heritage-teal/20 text-warm-sand border border-heritage-teal/10">
                      {mode.badge}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-semibold mb-3 group-hover:text-terracotta transition-colors duration-300">
                    {mode.title}
                  </h3>
                  <p className="text-warm-sand text-sm font-light leading-relaxed mb-4">
                    {mode.desc}
                  </p>
                  <div className="inline-flex items-center gap-1 text-xs font-mono text-terracotta group-hover:translate-x-1 transition-transform duration-300">
                    <span>Try Mode</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Narrative Experience Hook (National Geographic feel) */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden border border-terracotta/20 p-8 sm:p-12 bg-gradient-to-br from-earth-card to-earth-bg"
          >
            <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-terracotta/30">
              [LAT 35.0116° N / LON 135.7681° E]
            </div>
            <span className="font-mono text-xs text-terracotta tracking-widest uppercase block mb-3">HERITAGE PRESERVATION</span>
            <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-6">
              "The moss holds the story of three hundred autumns."
            </h3>
            <p className="text-warm-sand font-light leading-relaxed mb-6">
              In Gio-ji Temple, the light filters through tall maples onto a soft, thick velvet. This is not just a green forest floor; it is a living manuscript of the hermitage where 12th-century poet Gio took refuge. 
            </p>
            <div className="p-4 rounded-xl bg-earth-bg/60 border border-heritage-teal/20 font-mono text-xs text-warm-sand leading-relaxed">
              <span className="text-terracotta font-semibold">Wanderlore Audio Script Preview:</span> "Walk slowly here. Let the damp air fill your lungs. Notice how the temple roof is thatched with cypress bark, softening the sound of falling droplets..."
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-8 lg:pl-8"
          >
            <div>
              <h3 className="font-display text-3xl font-bold tracking-tight text-gradient mb-4">
                Designed to deepen relationships with places
              </h3>
              <p className="text-warm-sand font-light leading-relaxed">
                Tourism is broken when it commodifies communities. Wanderlore AI is architected with respect, shifting the narrative back to local artisans, preservationists, and indigenous folklore.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="p-3 rounded-xl bg-earth-card border border-terracotta/10 h-fit text-terracotta">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-semibold mb-1 text-sm">Eco & Responsible</h4>
                  <p className="text-warm-sand text-xs font-light leading-relaxed">Promoting sustainable visitation practices and zero-waste community-hosted lodging suggestions.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 rounded-xl bg-earth-card border border-heritage-teal/10 h-fit text-heritage-teal">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-semibold mb-1 text-sm">Secure & Reliable</h4>
                  <p className="text-warm-sand text-xs font-light leading-relaxed">Powered by Cloud Firestore and secure Firebase Auth to guard your personalized diaries.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 rounded-xl bg-earth-card border border-heritage-teal/10 h-fit text-heritage-teal">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-semibold mb-1 text-sm">Authenticity Engine</h4>
                  <p className="text-warm-sand text-xs font-light leading-relaxed">Calculates an Authenticity and Hidden Gem Score to benchmark custom recommendations.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 rounded-xl bg-earth-card border border-terracotta/10 h-fit text-terracotta">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-semibold mb-1 text-sm">Gemini Powered</h4>
                  <p className="text-warm-sand text-xs font-light leading-relaxed">Harnesses advanced model inference of Google GenAI to synthesize stunning historical texts.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing / Creator Plans Preview */}
      <section className="py-24 px-6 bg-earth-card/10 border-t border-terracotta/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-gradient mb-4">
              Fair, Transparent Pricing
            </h2>
            <p className="text-warm-sand font-light leading-relaxed">
              Explore cultural heritage for free, or unlock our elite SaaS suite for content creators, tour organizers, and deep heritage lovers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 rounded-3xl border border-warm-sand/10 bg-earth-card/30 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-warm-sand tracking-widest block mb-1">STANDARD EXPLORER</span>
                <h3 className="font-display text-2xl font-bold mb-3">Free Explorer</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-display text-4xl font-bold text-gradient">$0</span>
                  <span className="text-warm-sand text-xs font-mono">/ forever</span>
                </div>
                <ul className="space-y-3.5 text-sm text-warm-sand font-light mb-8">
                  <li className="flex items-center gap-2">✔ Unlimited Explorer Mode guides</li>
                  <li className="flex items-center gap-2">✔ Local Connect event calendars</li>
                  <li className="flex items-center gap-2">✔ Standard storytelling tone</li>
                  <li className="flex items-center gap-2">✔ Basic itinerary exports (Clipboard)</li>
                </ul>
              </div>
              <button onClick={onGetStarted} className="w-full py-3 rounded-full font-display text-xs border border-warm-sand/20 hover:border-warm-sand/50 hover:bg-earth-card/40 transition-all duration-300">
                Get Started Free
              </button>
            </div>

            {/* Premium Plan */}
            <div className="p-8 rounded-3xl border border-terracotta bg-earth-card/60 flex flex-col justify-between relative shadow-2xl shadow-terracotta/5 scale-105">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-terracotta text-earth-bg font-mono text-[9px] font-bold tracking-widest">
                RECOMMENDED
              </div>
              <div>
                <span className="font-mono text-xs text-terracotta tracking-widest block mb-1">CULTURAL ENTHUSIAST</span>
                <h3 className="font-display text-2xl font-bold mb-3 text-terracotta">Lore Explorer</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-display text-4xl font-bold text-gradient">$12</span>
                  <span className="text-warm-sand text-xs font-mono">/ month</span>
                </div>
                <ul className="space-y-3.5 text-sm text-warm-sand font-light mb-8">
                  <li className="flex items-center gap-2 text-warm-cream">✔ Deep Heritage Storyteller access</li>
                  <li className="flex items-center gap-2 text-warm-cream">✔ Audio-guide script generation</li>
                  <li className="flex items-center gap-2 text-warm-cream">✔ 4 custom narrative voices</li>
                  <li className="flex items-center gap-2 text-warm-cream">✔ Premium PDF & Markdown exports</li>
                  <li className="flex items-center gap-2 text-warm-cream">✔ Save & bookmark up to 100 guides</li>
                </ul>
              </div>
              <button onClick={onGetStarted} className="w-full py-3 rounded-full font-display text-xs bg-terracotta text-earth-bg font-medium hover:shadow-lg hover:shadow-terracotta/20 hover:-translate-y-0.5 transition-all duration-300">
                Upgrade to Lore
              </button>
            </div>

            {/* Pro SaaS */}
            <div className="p-8 rounded-3xl border border-warm-sand/10 bg-earth-card/30 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-warm-sand tracking-widest block mb-1">TOURISM ORGANIZER</span>
                <h3 className="font-display text-2xl font-bold mb-3">SaaS Strategist</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-display text-4xl font-bold text-gradient">$39</span>
                  <span className="text-warm-sand text-xs font-mono">/ month</span>
                </div>
                <ul className="space-y-3.5 text-sm text-warm-sand font-light mb-8">
                  <li className="flex items-center gap-2">✔ Full Tourism Organizer Suite</li>
                  <li className="flex items-center gap-2">✔ Campaign templates & story angles</li>
                  <li className="flex items-center gap-2">✔ Brand tone customization</li>
                  <li className="flex items-center gap-2">✔ Dynamic API integration access</li>
                  <li className="flex items-center gap-2">✔ Co-branded export layouts</li>
                </ul>
              </div>
              <button onClick={onGetStarted} className="w-full py-3 rounded-full font-display text-xs border border-warm-sand/20 hover:border-warm-sand/50 hover:bg-earth-card/40 transition-all duration-300">
                Unlock Pro Suite
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <h2 className="font-display text-3xl font-bold tracking-tight text-center text-gradient mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-earth-card/30 border border-warm-sand/10">
              <h4 className="font-display font-semibold text-lg text-terracotta mb-2">{faq.q}</h4>
              <p className="text-warm-sand text-sm font-light leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-earth-bg border-t border-terracotta/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-terracotta flex items-center justify-center font-display font-bold text-earth-bg">
              W
            </div>
            <span className="font-display font-semibold text-lg tracking-tight">
              Wanderlore <span className="text-terracotta">AI</span>
            </span>
          </div>
          <p className="text-xs text-warm-sand/50 font-mono">
            &copy; 2026 Wanderlore AI. Discover Places. Live Their Stories. Respect the land and its keepers.
          </p>
        </div>
      </footer>
    </div>
  );
}
