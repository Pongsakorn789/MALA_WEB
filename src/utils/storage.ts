import type { Patient } from '../types';
import { initialPatients } from '../data/mockPatients';

const STORAGE_KEY = 'MALA_PATIENTS_DATA';

// ดึงข้อมูลล่าสุด ถ้ายังไม่มีให้ใช้ initialPatients
export const getStoredPatients = (): Patient[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPatients));
    return initialPatients;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialPatients;
  }
};

// บันทึกข้อมูลและส่งสัญญาณข้ามหน้าจอ/แท็บ
export const saveStoredPatients = (patients: Patient[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
};