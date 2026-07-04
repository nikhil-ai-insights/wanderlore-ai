import { useState } from 'react';
import { motion } from 'motion/react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { Mail, Lock, User, Sparkles, AlertCircle, ArrowLeft, Check } from 'lucide-react';

interface AuthScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot';

export default function AuthScreen({ onBack, onSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const translateError = (code: string) => {
    switch (code) {
      case 'auth/invalid-email':
        return 'The email address is invalid.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please try again.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      case 'auth/missing-password':
        return 'Please enter a password.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onSuccess();
    } catch (err: any) {
      console.error('Firebase Google authentication failure:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Failed to sign in with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (emailStr: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password;

    try {
      if (!validateEmail(cleanEmail)) {
        throw new Error('Please enter a valid email address.');
      }

      if (mode !== 'forgot' && cleanPassword.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        onSuccess();
      } else if (mode === 'signup') {
        const cleanName = name.trim().replace(/<[^>]*>/g, ''); // strip any potential HTML script tags
        if (!cleanName) {
          throw new Error('Please enter your full name.');
        }
        const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        await updateProfile(userCred.user, {
          displayName: cleanName
        });
        onSuccess();
      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, cleanEmail);
        setSuccessMsg('A password reset link has been sent to your email.');
        setTimeout(() => setMode('login'), 4000);
      }
    } catch (err: any) {
      console.error('Firebase authentication failure:', err);
      setError(err.message ? (err.code ? translateError(err.code) : err.message) : 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-earth-bg text-warm-cream flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-terracotta/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-heritage-teal/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-warm-sand hover:text-terracotta transition-colors group"
        id="auth-back-btn"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Home</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 rounded-3xl border border-terracotta/15 bg-earth-card/80 backdrop-blur-md relative shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-terracotta flex items-center justify-center font-display font-bold text-xl text-earth-bg mb-4 shadow-lg shadow-terracotta/10">
            W
          </div>
          <h2 className="font-display text-2xl font-bold text-gradient">
            {mode === 'login' ? 'Welcome Back Traveler' : mode === 'signup' ? 'Begin Your Journey' : 'Reset Your Compass'}
          </h2>
          <p className="text-xs text-warm-sand/80 font-mono mt-1 text-center">
            {mode === 'login' 
              ? 'Access your cultural guides and itineraries' 
              : mode === 'signup' 
                ? 'Join Wanderlore to start generating stories' 
                : 'Enter your email to retrieve your password'}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 mb-6 rounded-xl bg-red-950/40 border border-red-500/20 text-red-200 text-xs flex gap-2 items-center"
            id="auth-error-alert"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 mb-6 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-200 text-xs flex gap-2 items-center"
            id="auth-success-alert"
          >
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-mono text-warm-sand mb-1.5 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-warm-sand/40">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors placeholder:text-warm-sand/30"
                  id="auth-input-name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-warm-sand mb-1.5 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-warm-sand/40">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors placeholder:text-warm-sand/30"
                id="auth-input-email"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-mono text-warm-sand uppercase tracking-wider">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[10px] font-mono text-terracotta/80 hover:text-terracotta transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-warm-sand/40">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-earth-bg/60 border border-warm-sand/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/30 outline-none text-warm-cream transition-colors placeholder:text-warm-sand/30"
                  id="auth-input-password"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-display font-medium text-earth-bg bg-terracotta hover:bg-terracotta/90 hover:shadow-lg hover:shadow-terracotta/10 transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            id="auth-submit-btn"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-earth-bg border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Recovery Link'}
                </span>
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-warm-sand/10"></div>
          <span className="flex-shrink mx-4 text-[10px] font-mono text-warm-sand/40 uppercase tracking-widest">or</span>
          <div className="flex-grow border-t border-warm-sand/10"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 rounded-xl font-display font-medium text-warm-cream border border-warm-sand/20 hover:border-warm-sand/40 bg-earth-bg/40 hover:bg-earth-bg/60 transition-all flex justify-center items-center gap-2.5 cursor-pointer disabled:opacity-50"
          id="auth-google-btn"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span>Sign in with Google</span>
        </button>

        <div className="mt-6 pt-6 border-t border-warm-sand/10 text-center">
          {mode === 'login' ? (
            <p className="text-xs text-warm-sand">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-terracotta font-semibold hover:underline"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p className="text-xs text-warm-sand">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-terracotta font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
