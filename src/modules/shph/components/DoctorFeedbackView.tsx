import React, { useState } from 'react';
import type { Patient } from '../../../types';
import { ArrowLeft, Stethoscope, CheckCircle2, FileText, Save, UserCheck } from 'lucide-react';

interface DoctorFeedbackViewProps {
  patient: Patient;
  onBack: () => void;
  onUpdatePatient?: (updated: Patient) => void;
}

export const DoctorFeedbackView: React.FC<DoctorFeedbackViewProps> = ({
  patient,
  onBack,
  onUpdatePatient,
}) => {
  const [followUpNote, setFollowUpNote] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // แยกคำสั่งยา กับ หมายเหตุถึง รพ.สต.
  const orderParts = patient.doctorOrder ? patient.doctorOrder.split('|') : ['ไม่มีคำสั่งระบุ'];
  const medicationOrder = orderParts[0]?.trim();
  const shphNote = orderParts[1]?.replace('หมายเหตุถึง รพ.สต.:', '').trim();

  const handleSaveFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdatePatient) {
      onUpdatePatient({
        ...patient,
        nurseNote: followUpNote ? `[ติดตามอาการ]: ${followUpNote}` : patient.nurseNote,
      });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ปุ่มย้อนกลับ */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B6B38] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>ย้อนกลับไปตารางรายชื่อ</span>
      </button>

      {/* Header สถานะ */}
      <div className="bg-white border border-[#E4E9E1] rounded-2xl p-6 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              แพทย์ตรวจและตอบกลับแล้ว (Resolved)
            </span>
            <span className="text-xs text-slate-400 font-mono">อัปเดตเมื่อ: {patient.updatedAt || 'วันนี้'}</span>
          </div>
          <h1 className="text-lg font-bold text-slate-800">{patient.name}</h1>
          <p className="text-xs text-slate-500 font-mono">HN: {patient.citizenId} · อายุ {patient.age} ปี</p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">แพทย์ผู้ตรวจสั่งการ</span>
          <span className="text-sm font-semibold text-slate-700">นพ. สมหมาย เก่งกาจ (รพ.ศูนย์)</span>
        </div>
      </div>

      {/* ใบสั่งการรักษาของแพทย์ (Physician Order Sheet) */}
      <div className="bg-white border-2 border-[#0B6B38] rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-[#0B6B38] text-white px-6 py-3.5 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-emerald-200" />
          <h2 className="text-sm font-bold tracking-wide">คำสั่งการรักษาและแผนดูแลต่อเนื่องจากแพทย์</h2>
        </div>

        <div className="p-6 space-y-5">
          {/* ขนาดยาที่แพทย์สั่ง */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
            <span className="text-xs font-bold text-[#0B6B38] uppercase">คำสั่งปรับยา Metformin:</span>
            <p className="text-sm font-extrabold text-slate-800">
              {medicationOrder}
            </p>
          </div>

          {/* คำแนะนำเพิ่มเติมถึง รพ.สต. */}
          {shphNote && (
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" />
                คำแนะนำและหมายเหตุถึงพยาบาล รพ.สต.:
              </span>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed font-medium">
                {shphNote}
              </p>
            </div>
          )}

          {/* สรุปข้อมูลประเมินแล็ปเปรียบเทียบ */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-400 block">eGFR หน้างาน</span>
              <b className="text-sm font-mono text-slate-800">{patient.egfr} mL/min</b>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-400 block">ภาวะขาดน้ำ</span>
              <b className="text-sm text-slate-800">{patient.hasDehydration ? 'มีอาการ' : 'ไม่มี'}</b>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-400 block">ขนาดยาเดิม</span>
              <b className="text-sm text-slate-800">{patient.metforminDose}</b>
            </div>
          </div>
        </div>
      </div>

      {/* บันทึกติดตามอาการของ รพ.สต. (Follow-up Care Note) */}
      <form onSubmit={handleSaveFollowUp} className="bg-white border border-[#E4E9E1] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
          <UserCheck className="w-4 h-4 text-[#0B6B38]" />
          <span>บันทึกผลการติดตามอาการในชุมชน (รพ.สต. / อสม.)</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            บันทึกการส่งต่อ อสม. เยี่ยมบ้าน / ผลการจ่ายยาใหม่ / อาการคนไข้ล่าสุด:
          </label>
          <textarea
            rows={3}
            value={followUpNote}
            onChange={(e) => setFollowUpNote(e.target.value)}
            placeholder="เช่น อสม. นำยาขนาดใหม่ไปส่งที่บ้านแล้ว คนไข้เข้าใจ Sick Day Rule ไม่มีอาการอ่อนเพลีย นัดเจาะเลือดสัปดาห์หน้า..."
            className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#0B6B38]/20 focus:border-[#0B6B38]"
          />
        </div>

        <div className="flex justify-between items-center pt-1">
          {savedSuccess ? (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> บันทึกผลติดตามอาการเรียบร้อย
            </span>
          ) : <div />}

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#0B6B38] hover:bg-[#08532b] text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>บันทึกความคืบหน้า</span>
          </button>
        </div>
      </form>
    </div>
  );
};