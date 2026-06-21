export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  city: string;
  country: string;
  joinedAt: string;
  onboarded: boolean;
  transportHabits: string;
  dietType: string;
  energyUsage: string;
  shoppingHabits: string;
  baselineCarbon: number; // in annual metric tons CO2
  sustainabilityScore: number; // 0 - 100
  xp: number;
  level: "Seed" | "Eco Learner" | "Green Guardian" | "Earth Protector" | "Climate Champion";
  streak: number;
  lastActiveAt: string;
  photoURL?: string | null;
}

export interface ActivityLog {
  activityId: string;
  userId: string;
  inputText: string;
  timestamp: string;
  category: "Transportation" | "Food" | "Energy" | "Shopping" | "Waste";
  description: string;
  emissionKg: number;
  explanation?: string;
  details?: Record<string, any>;
}

export interface SustainabilityFootprint {
  footprintId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  transportation: number;
  food: number;
  energy: number;
  shopping: number;
  waste: number;
  total: number;
}

export interface AIReport {
  reportId: string;
  userId: string;
  type: "weekly" | "monthly";
  createdAt: string;
  periodStart: string;
  periodEnd: string;
  totalEmissions: number;
  carbonSaved: number;
  topSource: string;
  summary: string;
  recommendations: string[];
  reportMarkdown?: string;
  projection?: string;
}

export interface EcoChallenge {
  challengeId: string;
  userId: string;
  title: string;
  description: string;
  points: number;
  category: string;
  completed: boolean;
  activatedAt: string;
  completedAt?: string;
}

export interface UserAchievement {
  achievementId: string;
  userId: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface AIRecommendation {
  recId: string;
  userId: string;
  title: string;
  description: string;
  category: "Transportation" | "Food" | "Energy" | "Shopping" | "Waste";
  potentialSavingsKg: number;
  actionTaken: boolean;
  createdAt: string;
}
