import type { Patient } from '../types';

export function calculateAgeFromBirthDate(birthDate: string, now = new Date()): number | null {
  if (!birthDate) return null;
  const date = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(date.getTime()) || date > now) return null;

  let age = now.getFullYear() - date.getFullYear();
  const beforeBirthday = now.getMonth() < date.getMonth()
    || (now.getMonth() === date.getMonth() && now.getDate() < date.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 ? age : null;
}

export function getPatientScreeningArea(patient: Patient): string {
  const explicitArea = patient.screeningArea?.trim();
  if (explicitArea) return explicitArea;

  const village = patient.screenedBy?.match(/หมู่\s*\d+/i)?.[0];
  if (village) return village.replace(/\s+/g, ' ').trim();

  const healthCenter = patient.screenedBy?.match(/รพ\.สต\.\s*([^()]+)/i)?.[1]?.trim();
  return healthCenter && healthCenter !== ' (Walk-in)' ? healthCenter : 'ไม่ระบุพื้นที่';
}
