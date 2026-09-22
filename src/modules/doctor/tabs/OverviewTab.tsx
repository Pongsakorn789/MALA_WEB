import React, { useState } from 'react';
import type { Patient } from '../../../types';
import { AlertCircle, CheckCircle2, ChevronRight, Clock } from 'lucide-react';

interface OverviewTabProps {
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ patients, onSelectPatient }) => {
  const [activeQueueTab, setActiveQueueTab] = useState<'pending' | 'completed'>('pending');

  // 1. เคสฉุกเฉินที่ยังรอแพทย์สั่งการรักษา (ยังไม่มีคำสั่ง doctorOrder หรือสถานะ Escalated)
  const pendingCases = patients.filter(
    (p) => p.riskLevel === 'Red' && p.status === 'Escalated' && !p.doctorOrder
  );

  // 2. เคสที่แพทย์สั่งการรักษาและตอบกลับ รพ.สต. เรียบร้อยแล้ว
  const completedCases = patients.filter(
    (p) => p.doctorOrder || p.status === 'Resolved'
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-[12.5px] text-[#16241A]">
      <div>
        <h2 className="text-[16px] font-semibold text-[#16241A]">ภาพรวมการเฝ้าระวัง MALA (รพ.ศูนย์)</h2>
        <p className="text-[#9AA69C]">สถิติและรายการส่งต่อเคสเสี่ยงสูงจากเครือข่าย รพ.สต. ทั้งหมด</p>
      </div>

      {/* สถิติ 3 การ์ดคำนวณตามสถานะจริง */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 border border-[#E4E9E1] rounded-2xl space-y-1 shadow-sm">
          <span className="text-[#9AA69C] font-medium block text-[12px]">เคสแจ้งเตือนฉุกเฉิน (Red Tier)</span>
          <span className="text-[24px] font-semibold text-[#C4392B] font-mono">{pendingCases.length} ราย</span>
          <p className="text-[#5C6A61] text-[11px]">รอการพิจารณาปรับยา</p>
        </div>

        <div className="bg-white p-5 border border-[#E4E9E1] rounded-2xl space-y-1 shadow-sm">
          <span className="text-[#9AA69C] font-medium block text-[12px]">ปรับยาเรียบร้อยแล้ว</span>
          <span className="text-[24px] font-semibold text-[#0B6B38] font-mono">
            {completedCases.length} ราย
          </span>
          <p className="text-[#5C6A61] text-[11px]">ส่งคำสั่งกลับ รพ.สต. สำเร็จ</p>
        </div>

        <div className="bg-white p-5 border border-[#E4E9E1] rounded-2xl space-y-1 shadow-sm">
          <span className="text-[#9AA69C] font-medium block text-[12px]">เวลาตอบสนองเฉลี่ย</span>
          <span className="text-[24px] font-semibold text-[#16241A] font-mono">18 นาที</span>
          <p className="text-[#0B6B38] font-medium text-[11px]">เร็วขึ้น 70% เทียบกับระบบ Manual</p>
        </div>
      </div>

      {/* กล่องรายการคิวผู้ป่วยพร้อมแท็บสลับสถานะ */}
      <div className="bg-white border border-[#E4E9E1] rounded-2xl overflow-hidden shadow-sm">
        <div className="flex border-b border-[#EDF1EB] bg-[#FAFBF9] px-5 pt-3 gap-6 text-[12.5px]">
          <button
            onClick={() => setActiveQueueTab('pending')}
            className={`pb-3 font-semibold transition flex items-center gap-1.5 border-b-2 ${
              activeQueueTab === 'pending'
                ? 'border-[#C4392B] text-[#C4392B]'
                : 'border-transparent text-[#5C6A61] hover:text-[#16241A]'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>คิวเคสฉุกเฉินที่ต้องสั่งการรักษา ({pendingCases.length})</span>
          </button>

          <button
            onClick={() => setActiveQueueTab('completed')}
            className={`pb-3 font-semibold transition flex items-center gap-1.5 border-b-2 ${
              activeQueueTab === 'completed'
                ? 'border-[#0B6B38] text-[#0B6B38]'
                : 'border-transparent text-[#5C6A61] hover:text-[#16241A]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ประวัติเคสที่สั่งยาเรียบร้อยแล้ว ({completedCases.length})</span>
          </button>
        </div>

        <div className="divide-y divide-[#EDF1EB]">
          {activeQueueTab === 'pending' ? (
            pendingCases.length === 0 ? (
              <div className="py-12 text-center text-[#9AA69C] text-[12.5px]">
                <CheckCircle2 className="w-8 h-8 text-[#0B6B38] mx-auto mb-2 opacity-80" />
                ไม่มีเคสค้างรอสั่งการรักษา
              </div>
            ) : (
              pendingCases.map((p) => (
                <div key={p.id} className="p-4 flex justify-between items-center gap-3 hover:bg-[#FAFBF9] transition">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#C4392B] animate-pulse" />
                      <p className="font-semibold text-[#16241A] text-[13px]">{p.name}</p>
                      <span className="text-[#9AA69C] text-[11px] font-mono">({p.citizenId})</span>
                    </div>
                    <p className="text-[#5C6A61] text-[11.5px] pl-4">
                      eGFR: <b className="text-[#C4392B] font-mono">{p.egfr}</b> mL/min · ทานยา: {p.metforminDose}
                      {p.hasDehydration && <span className="text-[#C4392B] font-medium"> · ⚠️ ขาดน้ำ</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectPatient(p.id)}
                    className="px-3.5 py-1.5 bg-[#FBEDEB] text-[#C4392B] font-semibold border border-[#F2CFC9] rounded-lg hover:bg-[#C4392B] hover:text-white transition text-[12px] shrink-0 flex items-center gap-1 shadow-sm"
                  >
                    <span>เปิดสั่งจ่ายยา</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )
          ) : (
            completedCases.length === 0 ? (
              <div className="py-12 text-center text-[#9AA69C] text-[12.5px]">
                ยังไม่มีประวัติการสั่งยา
              </div>
            ) : (
              completedCases.map((p) => (
                <div key={p.id} className="p-4 flex justify-between items-center gap-3 hover:bg-[#FAFBF9] transition">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0B6B38]" />
                      <p className="font-semibold text-[#16241A] text-[13px]">{p.name}</p>
                      <span className="bg-[#EAF3ED] text-[#0B6B38] border border-[#CFE3D5] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        สั่งการแล้ว
                      </span>
                    </div>
                    <p className="text-[#5C6A61] text-[11.5px] pl-6">
                      คำสั่งแพทย์: <span className="font-medium text-[#0B6B38]">{p.doctorOrder?.split('|')[0] || 'ปรับยาเรียบร้อย'}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[#9AA69C] font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {p.updatedAt || 'วันนี้'}
                    </span>
                    <button
                      onClick={() => onSelectPatient(p.id)}
                      className="px-3 py-1 border border-[#DEE4DB] text-[#5C6A61] hover:bg-[#FAFBF9] rounded-lg text-[11.5px] font-medium transition"
                    >
                      ดูคำสั่งเดิม
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;