import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Compass, Sparkles, Check } from 'lucide-react';

interface ThinkingAnimationProps {
  onComplete?: () => void;
}

export default function ThinkingAnimation({ onComplete }: ThinkingAnimationProps) {
  const [currentStage, setCurrentStage] = useState(0);

  const stages = [
    "Understanding Your Travel Style...",
    "Scanning Hidden Gems & Local Records...",
    "Researching Local Culture & Heritage Archives...",
    "Weaving the Immersive Story...",
    "Checking Local Event Calendars...",
    "Calculating Authenticity & Fit Scores...",
    "Preparing Your Journey..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < stages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [stages.length]);

  useEffect(() => {
    if (currentStage === stages.length - 1) {
      const timer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentStage, stages.length, onComplete]);

  const percentage = Math.round(((currentStage + 1) / stages.length) * 100);

  return (
    <div className="min-h-screen bg-earth-bg text-warm-cream flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-terracotta/5 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-heritage-teal/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg text-center flex flex-col items-center">
        {/* Animated Sacred Compass Logo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 rounded-full border border-terracotta/20 flex items-center justify-center mb-8 relative bg-earth-card/50 shadow-lg"
        >
          <Compass className="w-9 h-9 text-terracotta" />
          <div className="absolute -inset-1 border border-dashed border-heritage-teal/30 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
        </motion.div>

        {/* Title */}
        <div className="flex items-center gap-2 justify-center mb-2">
          <Sparkles className="w-4 h-4 text-terracotta animate-pulse" />
          <span className="font-mono text-xs text-terracotta tracking-widest uppercase">Wanderlore AI Catalyst</span>
        </div>
        <h3 className="font-display text-2xl font-bold tracking-tight mb-8">
          Weaving Your Historical Guide
        </h3>

        {/* Stages Checklist */}
        <div className="w-full bg-earth-card/40 border border-warm-sand/10 rounded-2xl p-6 text-left mb-8 space-y-3 shadow-inner">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStage;
            const isActive = idx === currentStage;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                  isCompleted 
                    ? 'text-heritage-teal font-medium' 
                    : isActive 
                      ? 'text-terracotta font-semibold scale-[1.02]' 
                      : 'text-warm-sand/40 font-light'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] transition-colors ${
                  isCompleted 
                    ? 'bg-heritage-teal/20 border-heritage-teal text-heritage-teal' 
                    : isActive 
                      ? 'bg-terracotta/10 border-terracotta text-terracotta animate-pulse' 
                      : 'bg-transparent border-warm-sand/10 text-warm-sand/30'
                }`}>
                  {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                </div>
                <span>{stage}</span>
              </div>
            );
          })}
        </div>

        {/* Custom Progress Bar */}
        <div className="w-full">
          <div className="flex justify-between items-center text-[10px] font-mono text-warm-sand mb-2">
            <span>PREPARATION PIPELINE</span>
            <span className="text-terracotta font-bold">{percentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-earth-card rounded-full overflow-hidden border border-warm-sand/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-heritage-teal to-terracotta rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
