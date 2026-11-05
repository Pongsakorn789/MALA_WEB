export type MetforminDoseStatus = 'review' | 'within-range' | 'contraindicated';

export interface MetforminDoseAssessment {
  status: MetforminDoseStatus;
  title: string;
  detail: string;
}

export function parseMetforminDoseMg(dose: string): number | null {
  const match = dose.match(/[\d,]+(?=\s*(?:มก\.|mg\b))/i);
  if (!match) return null;
  const value = Number(match[0].replace(/,/g, ''));
  return Number.isFinite(value) ? value : null;
}

/** Part 1 criteria from the screening rubric supplied by the user. */
export function assessMetforminDose(egfr: number, doseMg: number | null): MetforminDoseAssessment {
  if (egfr < 30) {
    return {
      status: 'contraindicated',
      title: 'ควรส่งแพทย์ทบทวนโดยเร็ว',
      detail: 'ตามเกณฑ์คัดกรองที่ให้มา eGFR ต่ำกว่า 30 ควรหยุด Metformin และแจ้งแพทย์ผู้รับผิดชอบ; ระบบไม่สั่งหยุดยาแทนแพทย์',
    };
  }

  if (doseMg === null) {
    return {
      status: 'review',
      title: 'ตรวจสอบขนาดยาปัจจุบัน',
      detail: 'อ่านขนาดยาเป็นมิลลิกรัมต่อวันจากข้อมูลผู้ป่วยไม่ได้',
    };
  }

  if (egfr < 45) {
    return doseMg <= 1000
      ? {
          status: 'within-range',
          title: 'ขนาดยาอยู่ในเกณฑ์',
          detail: `eGFR 30–44 และขนาดยาไม่เกิน 1,000 มก./วัน ตาม CPG ที่ให้มา`,
        }
      : {
          status: 'review',
          title: 'ขนาดยาสูงกว่าช่วงที่แนะนำ',
          detail: `eGFR 30–44 แต่ขนาดยา ${doseMg.toLocaleString()} มก./วัน ซึ่งเกินเกณฑ์ไม่เกิน 1,000 มก./วัน; แจ้งแพทย์ผู้รับผิดชอบทบทวน`,
        };
  }

  if (doseMg <= 2000) {
    return {
      status: 'within-range',
      title: 'ขนาดยาอยู่ในเกณฑ์',
      detail: `eGFR ตั้งแต่ 45 ขึ้นไป และขนาดยาไม่เกิน 2,000 มก./วัน ตาม CPG ที่ให้มา`,
    };
  }

  return {
    status: 'review',
    title: 'ขนาดยาสูงกว่าเกณฑ์',
    detail: `eGFR ตั้งแต่ 45 ขึ้นไป แต่ขนาดยา ${doseMg.toLocaleString()} มก./วัน เกินเกณฑ์ไม่เกิน 2,000 มก./วัน; แจ้งแพทย์ผู้รับผิดชอบทบทวน`,
  };
}
