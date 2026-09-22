import React, { useState } from 'react';
import type { Patient } from '../../../types';
import { AlertTriangle, Save, CheckCircle2, UserCheck, FileText, Send } from 'lucide-react';

interface OrderPrescriptionTabProps {
  patient: Patient;
  onPrescribe: (patientId: string, order: string) => void;
}

export const OrderPrescriptionTab: React.FC<OrderPrescriptionTabProps> = ({
  patient,
  onPrescribe,
}) => {
  const [orderType, setOrderType] = useState<'MAINTAIN' | 'REDUCE' | 'HOLD'>('REDUCE');
  const [pillsPerDay, setPillsPerDay] = useState<number>(1);
  const [noteToShph, setNoteToShph] = useState<string>(
    'ให้คนไข้ดื่มน้ำเกลือแร่ เฝ้าระวังอาการขาดน้ำ และนัดเจาะเลือดซ้ำสัปดาห์หน้า'
  );
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalDirective = '';

    if (orderType === 'MAINTAIN') {
      finalDirective = 'คงยาเดิมและเฝ้าระวังอย่างใกล้ชิด';
    } else if (orderType === 'REDUCE') {
      finalDirective = `ปรับลดยา Metformin ระบุขนาดใหม่: ${pillsPerDay} เม็ด/วัน (${pillsPerDay * 500} มก.)`;
    } else {
      finalDirective = 'หยุดยา Metformin ชั่วคราว (Hold)';
    }

    if (noteToShph.trim()) {
      finalDirective += ` | หมายเหตุถึง รพ.สต.: ${noteToShph.trim()}`;
    }

    onPrescribe(patient.id, finalDirective);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5 text-[12.5px] text-[#16241A]">
      {/* 1. แถบแจ้งเตือนฉุกเฉิน */}
      <div className="p-4 bg-white border-l-[3px] border-[#C4392B] rounded-2xl space-y-1 shadow-sm">
        <div className="flex items-center gap-2 text-[#16241A] font-semibold text-[13.5px]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C4392B] shrink-0" />
          <span>แจ้งเตือนเคสส่งต่อจาก รพ.สต. บ้านดอน</span>
        </div>
        <p className="text-[#5C6A61] pl-4.5 text-[12.5px] font-medium">
          ผู้ป่วยมีความเสี่ยง MALA ระดับสูง กรุณาพิจารณาปรับขนาดยา Metformin
        </p>
      </div>

      {/* 2. กล่องแสดงบันทึกทางการพยาบาล (Nurse Note) ที่ส่งมาจาก รพ.สต. */}
      {patient.nurseNote ? (
        <div className="p-4 bg-emerald-50/70 border border-[#CFE3D5] rounded-2xl space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0B6B38]">
            <FileText className="w-4 h-4" />
            <span>บันทึกอาการและข้อความส่งต่อจากพยาบาล รพ.สต.:</span>
          </div>
          <p className="text-xs text-[#16241A] bg-white p-3 rounded-xl border border-[#DEE4DB] leading-relaxed font-medium">
            "{patient.nurseNote}"
          </p>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span>ไม่มีบันทึกอาการเพิ่มเติมจาก รพ.สต. (ส่งต่อตามเกณฑ์ความเสี่ยงสีแดงอัตโนมัติ)</span>
        </div>
      )}

      {/* 3. ข้อมูลผู้ป่วยและแหล่งส่งต่อ */}
      <div className="bg-white border border-[#E4E9E1] rounded-2xl p-5 space-y-3 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
          <div>
            <span className="font-semibold text-[#16241A] text-[13.5px]">
              ข้อมูลผู้ป่วย: {patient.name} (อายุ {patient.age} ปี)
            </span>
          </div>
          <div>
            <span className="font-medium text-[#5C6A61]">เลขบัตรประจำตัวประชาชน: </span>
            <span className="text-[#16241A] font-mono">{patient.citizenId}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[#5C6A61]">
          <div>
            <span>เพศ: </span>
            <b className="text-[#16241A]">{patient.gender || 'ชาย'}</b>
          </div>
          <div>
            <span>นน./สส.: </span>
            <b className="text-[#16241A]">{patient.weight || 66} กก. / {Math.round(patient.height * 100)} ซม.</b>
          </div>
          <div>
            <span>BMI ปัจจุบัน: </span>
            <b className="text-[#16241A]">{patient.bmi || '—'}</b>
          </div>
          <div className="col-span-2 md:col-span-1">
            <span>ที่อยู่: </span>
            <span className="text-[#16241A] font-medium">ต.บ้านดอน อ.เมือง จ.เชียงราย</span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-[#EDF1EB] flex items-center gap-1.5 text-[#5C6A61] font-medium">
          <UserCheck className="w-4 h-4 text-[#0B6B38]" />
          <span>ส่งต่อจาก: <b className="text-[#16241A]">{patient.screenedBy || 'พยาบาลวิชาชีพ ใจดี (รพ.สต. บ้านดอน)'}</b></span>
        </div>
      </div>

      {/* 4. สรุปสาเหตุความเสี่ยง */}
      <div className="bg-white border border-[#E4E9E1] rounded-2xl p-5 space-y-2 shadow-sm">
        <div className="flex items-center gap-1.5 text-[#A6740A] font-semibold text-[12.5px]">
          <AlertTriangle className="w-4 h-4" />
          <span>สรุปสาเหตุความเสี่ยง (AI Clinical Summary)</span>
        </div>
        <ul className="space-y-1 pl-5 list-disc text-[#3B4A40] font-medium marker:text-[#DEE4DB]">
          <li>ผู้ป่วยมีภาวะไตเสื่อม (ค่า eGFR ล่าสุด = {patient.egfr} mL/min/1.73m²)</li>
          <li>{patient.hasDehydration ? '⚠️ ตรวจพบภาวะขาดน้ำ/ท้องเสียหน้างาน (เสี่ยงต่อ Lactic Acidosis ฉับพลัน)' : 'ไม่มีภาวะขาดน้ำ'}</li>
          <li>{patient.hasAlcohol ? '🍺 มีประวัติดื่มเครื่องดื่มแอลกอฮอล์' : 'ไม่มีประวัติดื่มแอลกอฮอล์'}</li>
          <li>ปัจจุบันรับประทาน Metformin: {patient.metforminDose || '2 เม็ด/วัน (1,000 มก.)'}</li>
        </ul>
      </div>

      {/* 5. ฟอร์มคำสั่งแพทย์ */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#E4E9E1] rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="font-semibold text-[#16241A] text-[13.5px] border-b border-[#EDF1EB] pb-3 flex justify-between items-center">
          <span>คำสั่งแพทย์ (Physician Order)</span>
          <span className="text-[11px] text-[#5C6A61] font-normal">ระบบจะซิงค์คำสั่งย้อนกลับไปที่หน้าจอ รพ.สต. ทันที</span>
        </div>

        {/* ตัวเลือกคำสั่งยา */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-[#FAFBF9] transition">
            <input
              type="radio"
              name="orderType"
              checked={orderType === 'MAINTAIN'}
              onChange={() => setOrderType('MAINTAIN')}
              className="w-4 h-4 text-[#0B6B38] focus:ring-[#0B6B38]"
            />
            <span className="font-medium text-[#3B4A40]">คงยาเดิมและเฝ้าระวังอย่างใกล้ชิด</span>
          </label>

          <div className="flex flex-wrap items-center gap-3 p-2.5 rounded-xl hover:bg-[#FAFBF9] transition">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="orderType"
                checked={orderType === 'REDUCE'}
                onChange={() => setOrderType('REDUCE')}
                className="w-4 h-4 text-[#0B6B38] focus:ring-[#0B6B38]"
              />
              <span className="font-medium text-[#3B4A40]">ปรับลดยา Metformin ระบุขนาดใหม่:</span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="4"
                disabled={orderType !== 'REDUCE'}
                value={pillsPerDay}
                onChange={(e) => setPillsPerDay(Number(e.target.value))}
                className="w-16 px-2 py-1.5 text-center font-semibold border border-[#DEE4DB] rounded-lg bg-[#FAFBF9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B6B38]/12 focus:border-[#0B6B38] disabled:opacity-50"
              />
              <span className="text-[#5C6A61] font-medium">เม็ด/วัน ({pillsPerDay * 500} มก.)</span>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-[#FAFBF9] transition">
            <input
              type="radio"
              name="orderType"
              checked={orderType === 'HOLD'}
              onChange={() => setOrderType('HOLD')}
              className="w-4 h-4 text-[#0B6B38] focus:ring-[#0B6B38]"
            />
            <span className="font-medium text-[#3B4A40]">หยุดยา Metformin ชั่วคราว (Hold)</span>
          </label>
        </div>

        {/* หมายเหตุถึง รพ.สต. */}
        <div className="pt-1">
          <label className="block text-[#3B4A40] font-semibold mb-1.5">
            หมายเหตุและแผนการดูแลถึง รพ.สต. (Care Plan Note)
          </label>
          <textarea
            rows={3}
            value={noteToShph}
            onChange={(e) => setNoteToShph(e.target.value)}
            placeholder="ระบุคำแนะนำเพิ่มเติมถึงพยาบาล รพ.สต. เช่น การให้สารน้ำ, การงดยา, นัดหมายเจาะเลือด..."
            className="w-full p-3 border border-[#DEE4DB] rounded-xl bg-[#FAFBF9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B6B38]/12 focus:border-[#0B6B38] text-[12.5px] leading-relaxed"
          />
        </div>

        {isSaved && (
          <div className="p-3 bg-[#EAF3ED] border border-[#CFE3D5] rounded-xl flex items-center gap-2 text-[#0B6B38] text-[12.5px] font-medium animate-pulse">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>ยืนยันคำสั่งแพทย์และส่งข้อมูลย้อนกลับไปยัง รพ.สต. เรียบร้อยแล้ว</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3.5 bg-[#0B6B38] hover:bg-[#08532b] text-white font-semibold rounded-xl transition text-[13px] flex items-center justify-center gap-2 shadow-sm"
        >
          <Send className="w-4 h-4" />
          <span>ยืนยันคำสั่งแพทย์และส่งกลับ รพ.สต. ดูแลต่อ</span>
        </button>
      </form>
    </div>
  );
};