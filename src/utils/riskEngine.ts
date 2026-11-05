import type { RiskLevel } from '../types';

export function calculateBMI(weight: number, heightM: number): number {
  if (heightM <= 0) return 0;
  return Number((weight / (heightM * heightM)).toFixed(2));
}

export function calculateMalaRiskScore(egfr: number, bmi: number, heavyAlcohol: boolean): number {
  // Part 2 rubric provided by the user: eGFR <60 = 1, BMI <23 = 2, heavy alcohol = 2.
  return (egfr < 60 ? 1 : 0) + (bmi > 0 && bmi < 23 ? 2 : 0) + (heavyAlcohol ? 2 : 0);
}

export function getMalaRiskLevel(score: number): RiskLevel {
  return score >= 2 ? 'Yellow' : 'Green';
}

// Kept for the clinician's manual edit flow, which still uses the legacy yes/no risk toggles.
export function evaluateMalaRisk(egfr: number, hasDehydration: boolean, hasAlcohol: boolean): { risk: RiskLevel; cpg: string } {
  if (egfr < 30 || (egfr < 45 && (hasDehydration || hasAlcohol))) {
    return { risk: 'Red', cpg: 'eGFR/ปัจจัยร่วมเข้าเกณฑ์กฎเดิม ควรให้แพทย์ทบทวน' };
  }
  if (egfr < 60 || hasDehydration || hasAlcohol) {
    return { risk: 'Yellow', cpg: 'ควรเฝ้าระวังและติดตามตามแนวทางหน่วยงาน' };
  }
  return { risk: 'Green', cpg: 'ติดตามตามแนวทางปกติ' };
}
