import type { RiskLevel } from '../types';

export function calculateBMI(weight: number, heightM: number): number {
  if (heightM <= 0) return 0;
  return Number((weight / (heightM * heightM)).toFixed(2));
}

export function evaluateMalaRisk(egfr: number, hasDehydration: boolean, hasAlcohol: boolean): { risk: RiskLevel; cpg: string } {
  // กฎ: eGFR < 30 หรือ (eGFR < 45 ร่วมกับขาดน้ำหรือดื่มสุรา) = เสี่ยงสูงวิกฤต (แดง)
  if (egfr < 30 || (egfr < 45 && (hasDehydration || hasAlcohol))) {
    return {
      risk: 'Red',
      cpg: 'เสี่ยงสูงมากต่อภาวะเลือดเป็นกรด (MALA) แจ้งเตือนแพทย์ทันทีเพื่อพิจารณาลดยาหรือหยุดยา Metformin'
    };
  }
  
  // กฎ: eGFR 30-59 หรือมีภาวะขาดน้ำ/ดื่มสุรา = เสี่ยงปานกลาง (เหลือง)
  if (egfr < 60 || hasDehydration || hasAlcohol) {
    return {
      risk: 'Yellow',
      cpg: 'ระดับความเสี่ยงปานกลาง เฝ้าระวังอาการขาดน้ำ แนะนำงดเครื่องดื่มแอลกอฮอล์ ติดตามอาการใกล้ชิด'
    };
  }

  // ปกติ = เสี่ยงต่ำ (เขียว)
  return {
    risk: 'Green',
    cpg: 'ความเสี่ยงต่ำ ให้การดูแลตามแนวทาง CPG ปกติ แนะนำการรับประทานยาต่อเนื่องและดื่มน้ำให้เพียงพอ'
  };
}