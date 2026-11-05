import React from 'react';
import { Download } from 'lucide-react';
import type { Patient } from '../../../types';
import { assessMetforminDose, parseMetforminDoseMg } from '../../../utils/metforminGuideline';

interface ReportsTabProps {
  patients: Patient[];
}

const escapeCsv = (value: string | number | boolean | undefined) => {
  const text = value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

export const ReportsTab: React.FC<ReportsTabProps> = ({ patients }) => {
  const screened = patients.filter((patient) => patient.status !== 'Pending');
  const redCount = screened.filter((patient) => patient.riskLevel === 'Red').length;
  const yellowCount = screened.filter((patient) => patient.riskLevel === 'Yellow').length;
  const greenCount = screened.filter((patient) => patient.riskLevel === 'Green').length;
  const referredCount = screened.filter((patient) => patient.status === 'Escalated').length;
  const completionRate = patients.length ? Math.round((screened.length / patients.length) * 100) : 0;
  const denominator = screened.length || 1;

  const downloadReport = () => {
    const headers = [
      'HN', 'ชื่อ-สกุล', 'เพศ', 'อายุ', 'น้ำหนัก (กก.)', 'ส่วนสูง (ซม.)', 'BMI', 'eGFR',
      'ขนาดยา Metformin (มก./วัน)', 'ผล Part 1 ขนาดยา', 'คะแนน Part 2', 'ระดับความเสี่ยง',
      'ดื่มหนักใน 2 ชั่วโมง', 'ดื่มเกินเกณฑ์ต่อสัปดาห์', 'อาเจียน/ท้องเสีย',
      'กินอาหารได้น้อย 1–2 วัน', 'ยาแก้ปวด/แก้อักเสบ/ยาชุด', 'สมุนไพร/อาหารเสริม',
      'สถานะ', 'ผู้คัดกรอง', 'วันที่คัดกรอง',
    ];
    const rows = screened.map((patient) => {
      const doseMg = parseMetforminDoseMg(patient.metforminDose);
      const doseResult = assessMetforminDose(patient.egfr, doseMg).title;
      return [
        patient.citizenId, patient.name, patient.gender, patient.age, patient.weight,
        patient.height ? Math.round(patient.height * 100) : undefined, patient.bmi, patient.egfr,
        doseMg ?? undefined, doseResult, patient.riskScore, patient.riskLevel,
        patient.bingeDrinking ? 'ใช่' : 'ไม่ใช่', patient.highWeeklyAlcohol ? 'ใช่' : 'ไม่ใช่',
        patient.hasDehydration ? 'ใช่' : 'ไม่ใช่', patient.poorIntake ? 'ใช่' : 'ไม่ใช่',
        patient.painMedication ? 'ใช่' : 'ไม่ใช่', patient.supplementOrHerbal ? 'ใช่' : 'ไม่ใช่',
        patient.status, patient.screenedBy, patient.updatedAt,
      ];
    });
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mala-screening-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const riskRows = [
    { label: 'เสี่ยงสูง', count: redCount, color: '#C4392B' },
    { label: 'เสี่ยงปานกลาง', count: yellowCount, color: '#C99A1F' },
    { label: 'เสี่ยงต่ำ/ปกติ', count: greenCount, color: '#0B6B38' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold text-[#16241A]">รายงานสรุปผลการคัดกรอง MALA</h2>
          <p className="text-[12.5px] text-[#9AA69C]">สถิติจากข้อมูลผู้ป่วยที่บันทึกในระบบ</p>
        </div>
        <button type="button" onClick={downloadReport} disabled={screened.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0B6B38] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#08552D] disabled:cursor-not-allowed disabled:opacity-40">
          <Download className="h-4 w-4" /> ดาวน์โหลดรายงานสำหรับ Excel
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1 rounded-2xl border border-[#E4E9E1] bg-white p-5">
          <span className="block text-[12px] font-medium text-[#9AA69C]">คัดกรองแล้ว</span>
          <span className="text-[24px] font-semibold text-[#16241A]">{screened.length} / {patients.length} ราย</span>
          <p className="text-[11px] font-medium text-[#0B6B38]">ครอบคลุม {completionRate}% ของรายชื่อในระบบ</p>
        </div>
        <div className="space-y-1 rounded-2xl border border-[#E4E9E1] bg-white p-5">
          <span className="block text-[12px] font-medium text-[#9AA69C]">ส่งต่อแพทย์แล้ว</span>
          <span className="text-[24px] font-semibold text-[#C4392B]">{referredCount} ราย</span>
          <p className="text-[11px] text-[#5C6A61]">นับจากสถานะ Escalated</p>
        </div>
        <div className="space-y-1 rounded-2xl border border-[#E4E9E1] bg-white p-5">
          <span className="block text-[12px] font-medium text-[#9AA69C]">เข้าเกณฑ์เสี่ยง Part 2</span>
          <span className="text-[24px] font-semibold text-[#A6740A]">{redCount + yellowCount} ราย</span>
          <p className="text-[11px] text-[#5C6A61]">จากผู้ป่วยที่คัดกรองแล้ว {screened.length} ราย</p>
        </div>
      </div>

      <div className="space-y-5 rounded-2xl border border-[#E4E9E1] bg-white p-6">
        <h3 className="text-[13.5px] font-semibold text-[#16241A]">สัดส่วนระดับความเสี่ยงในผู้ป่วยที่คัดกรองแล้ว</h3>
        {screened.length === 0 ? (
          <p className="py-5 text-center text-sm text-[#9AA69C]">ยังไม่มีผลคัดกรองให้แสดง</p>
        ) : (
          <div className="space-y-4 text-[12.5px]">
            {riskRows.map((row) => {
              const percent = Math.round((row.count / denominator) * 100);
              return <div key={row.label}>
                <div className="mb-1.5 flex justify-between font-medium">
                  <span style={{ color: row.color }}>{row.label}</span>
                  <span className="text-[#5C6A61]">{row.count} ราย ({percent}%)</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#EDF1EB]">
                  <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: row.color }} />
                </div>
              </div>;
            })}
          </div>
        )}
        <p className="border-t border-[#EDF1EB] pt-3 text-[11px] text-[#9AA69C]">ไฟล์รายงานเป็น CSV UTF-8 ซึ่งเปิดและบันทึกต่อใน Microsoft Excel ได้</p>
      </div>
    </div>
  );
};
