export type RiskLevel = 'Green' | 'Yellow' | 'Red';

export interface ScreeningRecord {
  id: string;
  screenedAt: string;
  screeningArea?: string;
  dosePassed: boolean;
  egfr?: number;
  metforminDose?: string;
  bmi?: number;
  riskScore?: number;
  riskLevel?: RiskLevel;
  hasDehydration?: boolean;
  bingeDrinking?: boolean;
  highWeeklyAlcohol?: boolean;
  poorIntake?: boolean;
  painMedication?: boolean;
  supplementOrHerbal?: boolean;
}

export interface Patient {
  id: string;
  name: string;
  citizenId: string;
  age: number;
  gender?: string;
  birthDate?: string;
  cardId?: string;
  labResultDate?: string;
  registeredDate?: string;
  screeningArea?: string;
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
  caseType?: 'DOSE_REVIEW' | 'MALA_RISK' | 'ROUTINE';
  careManagerStatus?: 'Pending' | 'InProgress' | 'Resolved';
  screeningHistory?: ScreeningRecord[];
  updatedAt?: string;
}

// เพิ่มบรรทัดนี้ไว้ล่างสุด เพื่อให้ Vite Bundle ได้แน่นอน
export const DUMMY_TYPES_LOADED = true;
