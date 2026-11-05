export type RiskLevel = 'Green' | 'Yellow' | 'Red';

export interface Patient {
  id: string;
  name: string;
  citizenId: string;
  age: number;
  gender?: string;
  height: number;
  weight?: number;
  bmi?: number;
  egfr: number;
  metforminDose: string;
  hasDehydration: boolean;
  hasAlcohol: boolean;
  riskScore?: number;
  bingeDrinking?: boolean;
  highWeeklyAlcohol?: boolean;
  poorIntake?: boolean;
  painMedication?: boolean;
  supplementOrHerbal?: boolean;
  riskLevel: RiskLevel;
  screenedBy?: string;
  cpgGuideline?: string;
  doctorOrder?: string;
  nurseNote?: string;
  status: 'Pending' | 'Screened' | 'Escalated' | 'Resolved';
  updatedAt?: string;
}

// เพิ่มบรรทัดนี้ไว้ล่างสุด เพื่อให้ Vite Bundle ได้แน่นอน
export const DUMMY_TYPES_LOADED = true;
