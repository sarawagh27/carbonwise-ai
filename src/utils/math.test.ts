import { describe, it, expect } from 'vitest';
import { 
  calculateEquivalentTrees, 
  calculateEquivalentCarKm, 
  calculateEquivalentFanHours,
  calculateEquivalentEnergy,
  calculateCategoryEmissions,
  calculateTotalEmissions,
  filterEmissionsByDateRange
} from './math';
import { ActivityLog } from '../types';

describe('math utilities', () => {
  describe('equivalent units', () => {
    it('calculates equivalent trees correctly', () => {
      expect(calculateEquivalentTrees(0)).toBe(0);
      expect(calculateEquivalentTrees(-5)).toBe(0);
      expect(calculateEquivalentTrees(22)).toBe(1);
      expect(calculateEquivalentTrees(45)).toBe(3); // Math.ceil(45/22) = Math.ceil(2.04) = 3
    });

    it('calculates equivalent car km correctly', () => {
      expect(calculateEquivalentCarKm(0)).toBe(0);
      expect(calculateEquivalentCarKm(-1)).toBe(0);
      expect(calculateEquivalentCarKm(18)).toBe(100); // 18 / 0.18 = 100
    });

    it('calculates equivalent fan hours correctly', () => {
      expect(calculateEquivalentFanHours(0)).toBe(0);
      expect(calculateEquivalentFanHours(-2)).toBe(0);
      expect(calculateEquivalentFanHours(4)).toBe(100); // 4 / 0.04 = 100
      expect(calculateEquivalentFanHours(0.2)).toBe(5); // 0.2 / 0.04 = 5
    });

    it('calculates equivalent energy correctly', () => {
      expect(calculateEquivalentEnergy(0)).toBe(0);
      expect(calculateEquivalentEnergy(-10)).toBe(0);
      expect(calculateEquivalentEnergy(85)).toBe(100); // 85 / 0.85 = 100
    });
  });

  describe('emissions aggregations', () => {
    it('calculates total emissions', () => {
      const activities = [
        { emissionKg: 10 },
        { emissionKg: 20.5 },
        { emissionKg: -5.5 }
      ] as ActivityLog[];
      expect(calculateTotalEmissions(activities)).toBe(25);
    });

    it('groups emissions by category correctly', () => {
      const activities = [
        { category: 'Transportation', emissionKg: 10 },
        { category: 'Food', emissionKg: 5 },
        { category: 'Transportation', emissionKg: 15 },
        { category: 'Waste', emissionKg: 2 }
      ] as ActivityLog[];

      const expected = {
        Transportation: 25,
        Food: 5,
        Energy: 0,
        Shopping: 0,
        Waste: 2
      };

      expect(calculateCategoryEmissions(activities)).toEqual(expected);
    });
  });

  describe('filterEmissionsByDateRange', () => {
    it('should aggregate emissions for activities within the date window and exclude others', () => {
      const now = new Date();
      
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(now.getDate() - 2);

      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(now.getDate() - 10);

      const activities = [
        { emissionKg: 15, timestamp: now.toISOString() },
        { emissionKg: 10, timestamp: twoDaysAgo.toISOString() },
        { emissionKg: 50, timestamp: tenDaysAgo.toISOString() }
      ] as ActivityLog[];

      // In a 7-day window, now and 2 days ago are included (15 + 10 = 25). 10 days ago is excluded.
      expect(filterEmissionsByDateRange(activities, 7)).toBe(25);

      // In a 30-day window, all are included (15 + 10 + 50 = 75).
      expect(filterEmissionsByDateRange(activities, 30)).toBe(75);

      // In a 1-day window, only now is included (15).
      expect(filterEmissionsByDateRange(activities, 1)).toBe(15);
    });
  });
});
