import React from 'react';
import type { Patient } from '../../../types';

interface ReportsTabProps {
  patients: Patient[];
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ patients }) => {
  const redCount = patients.filter((p) => p.riskLevel === 'Red').length;
  const yellowCount = patients.filter((p) => p.riskLevel === 'Yellow').length;
  const greenCount = patients.filter((p) => p.riskLevel === 'Green').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-[16px] font-semibold text-[#16241A]">รายงานสรุปผลการเฝ้าระวัง MALA</h2>
        <p className="text-[12.5px] text-[#9AA69C]">สถิติและตัวชี้วัดความเสี่ยงจากการใช้ยา Metformin ประจำเขตพื้นที่</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E4E9E1] space-y-1">
          <span className="text-[12px] text-[#9AA69C] block font-medium">อัตราการคัดกรองสำเร็จ</span>
          <span className="text-[24px] font-semibold text-[#16241A]">92.4%</span>
          <p className="text-[11px] text-[#0B6B38] font-medium">↑ ครอบคลุมผู้ป่วย 48 จาก 52 รายในเขต</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E4E9E1] space-y-1">
          <span className="text-[12px] text-[#9AA69C] block font-medium">เคสส่งต่อแพทย์ (High Risk)</span>
          <span className="text-[24px] font-semibold text-[#C4392B]">{redCount} ราย</span>
          <p className="text-[11px] text-[#5C6A61]">ได้รับการปรับขนาดยาแล้ว 100%</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E4E9E1] space-y-1">
          <span className="text-[12px] text-[#9AA69C] block font-medium">การดูแลตาม CPG ที่ รพ.สต.</span>
          <span className="text-[24px] font-semibold text-[#0B6B38]">{greenCount + yellowCount} ราย</span>
          <p className="text-[11px] text-[#5C6A61]">ให้คำแนะนำปรับพฤติกรรมและงดแอลกอฮอล์</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-[#E4E9E1] space-y-5">
        <h3 className="text-[13.5px] font-semibold text-[#16241A]">สัดส่วนระดับความเสี่ยง MALA ประจำสัปดาห์</h3>
        <div className="space-y-4 text-[12.5px]">
          <div>
            <div className="flex justify-between font-medium mb-1.5">
              <span className="text-[#C4392B]">เสี่ยงสูง (High Risk)</span>
              <span className="text-[#5C6A61]">{redCount} ราย ({((redCount / patients.length) * 100).toFixed(0)}%)</span>
            </div>
            <div className="w-full bg-[#EDF1EB] h-2.5 rounded-full overflow-hidden">
              <div className="bg-[#C4392B] h-full rounded-full" style={{ width: `${(redCount / patients.length) * 100}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-medium mb-1.5">
              <span className="text-[#A6740A]">เสี่ยงปานกลาง (Moderate Risk)</span>
              <span className="text-[#5C6A61]">{yellowCount} ราย ({((yellowCount / patients.length) * 100).toFixed(0)}%)</span>
            </div>
            <div className="w-full bg-[#EDF1EB] h-2.5 rounded-full overflow-hidden">
              <div className="bg-[#C99A1F] h-full rounded-full" style={{ width: `${(yellowCount / patients.length) * 100}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-medium mb-1.5">
              <span className="text-[#0B6B38]">เสี่ยงต่ำ/ปกติ (Low Risk)</span>
              <span className="text-[#5C6A61]">{greenCount} ราย ({((greenCount / patients.length) * 100).toFixed(0)}%)</span>
            </div>
            <div className="w-full bg-[#EDF1EB] h-2.5 rounded-full overflow-hidden">
              <div className="bg-[#0B6B38] h-full rounded-full" style={{ width: `${(greenCount / patients.length) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};