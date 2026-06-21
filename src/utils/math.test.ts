import { describe, it, expect } from 'vitest';
import { 
  calculateEquivalentTrees, 
  calculateEquivalentCarKm, 
  calculateCategoryEmissions,
  calculateTotalEmissions
} from './math';
import { ActivityLog } from '../types';

describe('math utilities', () => {
  it('calculates equivalent trees correctly', () => {
    expect(calculateEquivalentTrees(0)).toBe(0);
    expect(calculateEquivalentTrees(22)).toBe(1);
    expect(calculateEquivalentTrees(45)).toBe(3); // Math.ceil(45/22) = Math.ceil(2.04) = 3
  });

  it('calculates equivalent car km correctly', () => {
    expect(calculateEquivalentCarKm(0)).toBe(0);
    expect(calculateEquivalentCarKm(18)).toBe(100); // 18 / 0.18 = 100
  });

  it('calculates total emissions', () => {
    const activities = [
      { emissionKg: 10 },
      { emissionKg: 20.5 }
    ] as ActivityLog[];
    expect(calculateTotalEmissions(activities)).toBe(30.5);
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
