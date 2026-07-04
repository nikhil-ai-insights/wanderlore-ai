export type TravelStyle = 'solo' | 'family' | 'couple' | 'group' | 'budget' | 'luxury';
export type TravelMode = 'explorer' | 'heritage' | 'connect' | 'organizer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  createdAt: string;
  preferences?: {
    defaultLanguage?: string;
    travelStyle?: TravelStyle;
    interests?: string[];
  };
}

// 1. Explorer Mode Output Structure
export interface ExplorerResult {
  destination: string;
  tagline: string;
  overview: string;
  iconicAttractions: {
    name: string;
    description: string;
    whyVisit: string;
  }[];
  hiddenGems: {
    name: string;
    description: string;
    howToAccess: string;
    insiderTip: string;
  }[];
  culinaryHighlights: {
    dishName: string;
    description: string;
    authenticPlaces: string;
  }[];
  culturalEtiquette: string[];
  suggestedItinerary: {
    day: number;
    title: string;
    activities: {
      time: string;
      title: string;
      description: string;
      locationName: string;
    }[];
  }[];
  bestTimeToVisit: string;
  scenicSpots: string[];
  safetyAdvisory: string[];
  sustainabilityTips: string[];
  narrativeSnapshot: string;
  localEvents: {
    eventName: string;
    date: string;
    description: string;
    type: string;
  }[];
  budgetBreakdown: {
    category: string;
    cost: string;
    notes: string;
  }[];
  authenticityScore: number; // 1-100
  hiddenGemScore: number;     // 1-100
}

// 2. Heritage & Storytelling Mode Output Structure
export interface HeritageResult {
  landmarkName: string;
  regionCountry: string;
  historicalEra: string;
  historicalBackground: string;
  culturalSignificance: string;
  legendsMythsFolklore: {
    title: string;
    story: string;
  }[];
  architecturalHighlights: string[];
  immersiveStory: string;
  audioGuideScript: string;
  nearbyHeritageSites: {
    name: string;
    description: string;
    distance: string;
  }[];
  preservationStatus: string;
  bestVisitingTips: string[];
  funFacts: string[];
  storytellingDepthScore: number; // 1-100
}

// 3. Local Connect Mode Output Structure
export interface ConnectResult {
  location: string;
  eventsCalendar: {
    eventName: string;
    date: string;
    description: string;
    venue: string;
  }[];
  communityExperiences: {
    title: string;
    host: string;
    description: string;
    howToJoin: string;
    cost: string;
  }[];
  localArtisans: {
    name: string;
    craft: string;
    description: string;
    location: string;
  }[];
  culinaryExperiences: {
    title: string;
    description: string;
    chefHost: string;
  }[];
  etiquetteTips: string[];
  communityImpactScore: number; // 1-100
  uniquenessScore: number;      // 1-100
}

// 4. Tourism Organizer Mode Output Structure
export interface OrganizerResult {
  region: string;
  targetPersona: string;
  positioningIdeas: {
    angle: string;
    description: string;
    slogan: string;
  }[];
  campaignThemes: {
    title: string;
    concept: string;
    channels: string[];
  }[];
  itineraryTemplates: {
    name: string;
    theme: string;
    duration: string;
    keyHighlights: string[];
  }[];
  storytellingContentAngles: {
    hook: string;
    narrativeOutline: string;
    suggestedFormat: string;
  }[];
  audienceAppealScore: number; // 1-100
}

export interface SavedGuide {
  id: string;
  userId: string;
  mode: TravelMode;
  title: string;
  subtitle: string;
  createdAt: string;
  // Dynamic based on mode
  explorerResult?: ExplorerResult;
  heritageResult?: HeritageResult;
  connectResult?: ConnectResult;
  organizerResult?: OrganizerResult;
}
