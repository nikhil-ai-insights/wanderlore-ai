import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError } from './firebase';
import { TravelMode, SavedGuide } from './types';

// Importing Custom UI components
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import GeneratorForm from './components/GeneratorForm';
import ThinkingAnimation from './components/ThinkingAnimation';
import ResultView from './components/ResultView';

type AppScreen = 'landing' | 'auth' | 'dashboard' | 'form' | 'thinking' | 'result';

import { getClientFallbackResult } from './fallbacks';
export { getClientFallbackResult };

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
    } catch (err: any) {
      if (err && (err.code === 'permission-denied' || String(err.message || '').includes('permission-denied') || String(err.message || '').includes('permissions'))) {
        handleFirestoreError(err, OperationType.LIST, 'savedGuides');
      }
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
    } catch (err: any) {
      if (err && (err.code === 'permission-denied' || String(err.message || '').includes('permission-denied') || String(err.message || '').includes('permissions'))) {
        handleFirestoreError(err, OperationType.CREATE, 'savedGuides');
      }
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
    } catch (err: any) {
      if (err && (err.code === 'permission-denied' || String(err.message || '').includes('permission-denied') || String(err.message || '').includes('permissions'))) {
        handleFirestoreError(err, OperationType.DELETE, `savedGuides/${id}`);
      }
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
