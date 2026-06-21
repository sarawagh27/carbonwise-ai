import { ActivityLog } from "../types";

export const calculateEquivalentTrees = (savedKg: number) => savedKg > 0 ? Math.ceil(savedKg / 22) : 0;
export const calculateEquivalentCarKm = (savedKg: number) => savedKg > 0 ? Math.round(savedKg / 0.18) : 0;
export const calculateEquivalentFanHours = (savedKg: number) => savedKg > 0 ? Math.round(savedKg / 0.04) : 0;
export const calculateEquivalentEnergy = (savedKg: number) => savedKg > 0 ? Math.round(savedKg / 0.85) : 0;

export const calculateCategoryEmissions = (activities: ActivityLog[]) => {
  const categoryEmissions: Record<string, number> = {
    Transportation: 0,
    Food: 0,
    Energy: 0,
    Shopping: 0,
    Waste: 0
  };
  activities.forEach(act => {
    if (categoryEmissions[act.category] !== undefined) {
      categoryEmissions[act.category] += act.emissionKg;
    }
  });
  return categoryEmissions;
};

export const filterEmissionsByDateRange = (activities: ActivityLog[], daysAgo: number) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysAgo);
  return activities
    .filter(a => new Date(a.timestamp) >= cutoff)
    .reduce((sum, a) => sum + a.emissionKg, 0);
};

export const calculateTotalEmissions = (activities: ActivityLog[]) => {
  return activities.reduce((sum, a) => sum + a.emissionKg, 0);
};
