export enum GenerationStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING', // Transforming Albanian to English Prompt
  GENERATING = 'GENERATING', // Creating Image
  GENERATING_VIDEO = 'GENERATING_VIDEO', // Creating Video
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface PromptDetails {
  sceneOverview: string;
  subjectDetails: string;
  environment: string;
  cameraComposition: string;
  lightingAtmosphere: string;
  styleParameters: string;
  finalGenerationPrompt: string;
}

export interface GenerationResult {
  promptData: PromptDetails;
  imageUrls: string[];
}

export enum SubscriptionTier {
  FREE = 'FREE',
  STANDARD = 'STANDARD', // 500 LEK
  PREMIUM = 'PREMIUM'    // 1000 LEK
}

export interface User {
  id: string;
  email: string;
  name: string;
  tier: SubscriptionTier;
  dailyUsage: number;
  lastUsageDate: string; // YYYY-MM-DD
  createdAt: string; // ISO Date String
  lastLoginAt: string; // ISO Date String
}

export const TIER_LIMITS: Record<SubscriptionTier, number> = {
  [SubscriptionTier.FREE]: 1,
  [SubscriptionTier.STANDARD]: 5,
  [SubscriptionTier.PREMIUM]: 15
};

export const TIER_PRICES: Record<SubscriptionTier, number> = {
  [SubscriptionTier.FREE]: 0,
  [SubscriptionTier.STANDARD]: 500,
  [SubscriptionTier.PREMIUM]: 1000
};