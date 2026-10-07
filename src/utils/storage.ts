import type { Patient } from '../types';
import { initialPatients } from '../data/mockPatients';

// เปลี่ยน Key เป็น V2 เพื่อตัดปัญหาแคชเครื่องเก่า
const STORAGE_KEY = 'MALA_PATIENTS_DATA_V3';

// ดึงข้อมูลล่าสุด ถ้ายังไม่มีหรือข้อมูลเก่าไม่ครบ ให้ใช้ initialPatients 30 คนใหม่
export const getStoredPatients = (): Patient[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPatients));
    return initialPatients;
  }
  try {
    const parsed = JSON.parse(data);
    // ถ้าในเครื่องเคยจำข้อมูลไว้ แต่น้อยกว่า 10 คน (ข้อมูลเก่า) ให้ทับด้วย 30 คนใหม่
    if (Array.isArray(parsed) && parsed.length < 10) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPatients));
      return initialPatients;
    }
    return parsed;
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPatients));
    return initialPatients;
  }
};

// บันทึกข้อมูลและส่งสัญญาณข้ามหน้าจอ/แท็บ
export const saveStoredPatients = (patients: Patient[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
};