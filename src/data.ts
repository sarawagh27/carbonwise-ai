import { EcoChallenge, UserAchievement } from "./types";

export const DEFAULT_CHALLENGES: Omit<EcoChallenge, "userId" | "activatedAt">[] = [
  {
    challengeId: "challenge_meatless",
    title: "Meat-Free Monday",
    description: "Go full vegetarian or vegan for an entire day to reduce high pasture emissions.",
    points: 150,
    category: "Food",
    completed: false
  },
  {
    challengeId: "challenge_transit",
    title: "Commute Alternative",
    description: "Leave your personal vehicle behind and walk, cycle, or use public transport.",
    points: 250,
    category: "Transportation",
    completed: false
  },
  {
    challengeId: "challenge_cold_wash",
    title: "Cold Water Wizardry",
    description: "Wash all your clothes laundry cycles on COLD water to shave electricity costs.",
    points: 100,
    category: "Energy",
    completed: false
  },
  {
    challengeId: "challenge_reusable",
    title: "Zero Disposable Plastics",
    description: "Avoid single-use water bottles, cups, poly-bags, and disposable containers.",
    points: 150,
    category: "Waste",
    completed: false
  },
  {
    challengeId: "challenge_unplug",
    title: "Vampire Power Hunt",
    description: "Unplug standby adapters, desktop machines, and micro-chargers not actively in use tonight.",
    points: 120,
    category: "Energy",
    completed: true
  }
];

export const DEFAULT_ACHIEVEMENTS: UserAchievement[] = [
  {
    achievementId: "ach_welcome",
    userId: "",
    title: "Eco Pioneer",
    description: "Enrolled in CarbonWise AI and computed initial baseline carbon score.",
    icon: "Sprout",
    unlockedAt: new Date().toISOString()
  },
  {
    achievementId: "ach_first_track",
    userId: "",
    title: "First Leap",
    description: "Logged your first natural language activity footprint.",
    icon: "Compass",
    unlockedAt: ""
  },
  {
    achievementId: "ach_streak_3",
    userId: "",
    title: "Consistent Climber",
    description: "Logged activities or checked updates 3 days in a row.",
    icon: "Flame",
    unlockedAt: ""
  },
  {
    achievementId: "ach_challenge_king",
    userId: "",
    title: "Green Champion",
    description: "Completed your first active high-impact physical carbon challenge.",
    icon: "ShieldAlert",
    unlockedAt: ""
  },
  {
    achievementId: "ach_receipt_scan",
    userId: "",
    title: "Eco Auditor",
    description: "Scanned and parsed your first paper bill or purchase receipt.",
    icon: "ScanLine",
    unlockedAt: ""
  }
];

// Simple emission factors for manual calculator
export const EMISSION_FACTORS = {
  transportation: {
    sedan: 0.15, // kg CO2 per km (Driving 40 km ≈ 6 kg, within 1-15 kg)
    suv: 0.22, // kg CO2 per km (Driving 40 km ≈ 8.8 kg)
    electric: 0.03, // kg CO2 per km
    bus: 0.05, // kg CO2 per km
    train: 0.02, // kg CO2 per km
    flight: 0.08, // kg CO2 per km (Flight emissions scaled to per daily travel segment)
  },
  food: {
    vegan: 0.3, // kg CO2 per meal (3 meals ≈ 0.9 kg, within 0.5–8 kg)
    vegetarian: 0.5, // kg CO2 per meal (3 meals ≈ 1.5 kg)
    chicken: 1.0, // kg CO2 per meal (3 meals ≈ 3 kg)
    pork: 1.4, // kg CO2 per meal (3 meals ≈ 4.2 kg)
    beef: 2.5, // kg CO2 per meal (3 meals ≈ 7.5 kg, within 0.5-8 kg)
  },
  energy: {
    electricityKwh: 0.25, // kg CO2 per kWh (10 kWh daily domestic use ≈ 2.5 kg, within 1-20 kg)
    gasTherm: 1.5, // kg CO2 per therm of gas (2 therms daily use ≈ 3.0 kg, within 1-20 kg)
  },
  shopping: {
    clothing: 2.5, // kg CO2 per new garment (within 0–30 kg per purchase event)
    electronics: 15.0, // kg CO2 per average tech device (within 0–30 kg per purchase event)
    generalStuff: 1.0, // kg CO2 per item
  },
  waste: {
    householdKg: 0.5, // average per kg trash (Typical daily trash of 2 kg ≈ 1 kg, within 0-10 kg)
  }
};

// Calculate annual baseline in metric tons based on onboarding responses
export function calculateAnnualBaseline(inputs: {
  transportHabits: string;
  dietType: string;
  energyUsage: string;
  shoppingHabits: string;
}): number {
  let transportScore = 1.8; // average tons
  if (inputs.transportHabits.includes("Never") || inputs.transportHabits.includes("public")) {
    transportScore = 0.5;
  } else if (inputs.transportHabits.includes("SUV") || inputs.transportHabits.includes("frequent")) {
    transportScore = 3.2;
  } else if (inputs.transportHabits.includes("average") || inputs.transportHabits.includes("daily")) {
    transportScore = 2.2;
  }

  let dietScore = 1.2; // average tons
  if (inputs.dietType.includes("Vegan")) {
    dietScore = 0.4;
  } else if (inputs.dietType.includes("Vegetarian")) {
    dietScore = 0.7;
  } else if (inputs.dietType.includes("meat-heavy") || inputs.dietType.includes("Meat Heavy")) {
    dietScore = 2.5;
  }

  let energyScore = 1.8; // average tons
  if (inputs.energyUsage.includes("Solar") || inputs.energyUsage.includes("low")) {
    energyScore = 0.6;
  } else if (inputs.energyUsage.includes("high") || inputs.energyUsage.includes("heated pool")) {
    energyScore = 3.8;
  }

  let shoppingScore = 1.0; // average tons
  if (inputs.shoppingHabits.includes("minimalist")) {
    shoppingScore = 0.3;
  } else if (inputs.shoppingHabits.includes("frequent")) {
    shoppingScore = 2.0;
  }

  const baseTotal = transportScore + dietScore + energyScore + shoppingScore;
  return Math.round(baseTotal * 10) / 10;
}

// Map score from 0-100 based on emissions compared to baseline
export function calculateSustainabilityScore(emissionKgThisMonth: number, baselineTons: number): number {
  const monthlyBaselineKg = (baselineTons * 1000) / 12;
  if (emissionKgThisMonth === 0) return 100;
  
  const ratio = emissionKgThisMonth / monthlyBaselineKg;
  
  // If user is emitting half of monthly baseline, score should be near 90+
  // If user emits exactly baseline, score is around 70
  // If user emits way over baseline, score goes down to 20
  let score = 100 - (ratio * 30);
  if (score < 10) score = 10;
  if (score > 100) score = 100;
  
  return Math.round(score);
}

// Calculate level based on total XP
export function getLevelFromXp(xp: number): "Seed" | "Eco Learner" | "Green Guardian" | "Earth Protector" | "Climate Champion" {
  if (xp >= 2500) return "Climate Champion";
  if (xp >= 1500) return "Earth Protector";
  if (xp >= 800) return "Green Guardian";
  if (xp >= 300) return "Eco Learner";
  return "Seed";
}

export function getXpProgress(xp: number): { nextMilestone: number; percentage: number } {
  if (xp >= 2500) return { nextMilestone: 5000, percentage: Math.min(((xp - 2500) / 2500) * 100, 100) };
  if (xp >= 1500) return { nextMilestone: 2500, percentage: ((xp - 1500) / 1000) * 100 };
  if (xp >= 800) return { nextMilestone: 1500, percentage: ((xp - 800) / 700) * 100 };
  if (xp >= 300) return { nextMilestone: 800, percentage: ((xp - 300) / 500) * 100 };
  return { nextMilestone: 300, percentage: (xp / 300) * 100 };
}
