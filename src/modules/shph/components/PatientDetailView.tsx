import React, { useState } from 'react';
import type { Patient } from '../../../types';
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  ClipboardCheck, 
  FileText, 
  Edit3, 
  Save, 
  X,
  Droplets,
  Wine,
  Clock
} from 'lucide-react';

interface PatientDetailViewProps {
  patient: Patient;
  onBack: () => void;
  onEscalate: (id: string, note?: string) => void;
  onOpenCpg: () => void;
  onUpdatePatient?: (updated: Patient) => void;
}

const RISK_STYLES = {
  Red: { text: 'text-[#C4392B]', bg: 'bg-[#FBEDEB]', border: 'border-[#F2CFC9]', dot: 'bg-[#C4392B]', label: 'เสี่ยงสูง (High Risk)' },
  Yellow: { text: 'text-[#A6740A]', bg: 'bg-[#FBF3E1]', border: 'border-[#EFDDAF]', dot: 'bg-[#C99A1F]', label: 'เสี่ยงปานกลาง' },
  Green: { text: 'text-[#0B6B38]', bg: 'bg-[#EAF3ED]', border: 'border-[#CFE3D5]', dot: 'bg-[#0B6B38]', label: 'เสี่ยงต่ำ' },
} as const;

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({
  patient,
  onBack,
  onEscalate,
  onOpenCpg,
  onUpdatePatient,
}) => {
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  // State บันทึกการพยาบาล
  const [nurseNote, setNurseNote] = useState(patient.nurseNote || '');

  // State แก้ไขข้อมูลหน้างาน (Re-assessment)
  const [isEditing, setIsEditing] = useState(false);
  const [editWeight, setEditWeight] = useState(String(patient.weight || 65));
  const [editDehydration, setEditDehydration] = useState(patient.hasDehydration);
  const [editAlcohol, setEditAlcohol] = useState(patient.hasAlcohol);

  const risk = RISK_STYLES[patient.riskLevel as keyof typeof RISK_STYLES] ?? RISK_STYLES.Green;

  // บันทึกเฉพาะ Nurse Note
  const handleSaveNoteOnly = () => {
    if (onUpdatePatient) {
      onUpdatePatient({
        ...patient,
        nurseNote,
      });
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    }
  };

  // บันทึกข้อมูลที่แก้ไขหน้างาน
  const handleSaveRecheck = () => {
    const w = parseFloat(editWeight) || (patient.weight || 60);
    const h = patient.height || 1.65;
    const newBmi = parseFloat((w / (h * h)).toFixed(1));

    if (onUpdatePatient) {
      onUpdatePatient({
        ...patient,
        weight: w,
        bmi: newBmi,
        hasDehydration: editDehydration,
        hasAlcohol: editAlcohol,
        nurseNote,
      });
    }
    setIsEditing(false);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleCancelEdit = () => {
    setEditWeight(String(patient.weight || 65));
    setEditDehydration(patient.hasDehydration);
    setEditAlcohol(patient.hasAlcohol);
    setIsEditing(false);
  };

  // ส่งแจ้งเตือนแพทย์พร้อมแนบ Nurse Note
  const handleAlert = () => {
    if (onUpdatePatient && nurseNote) {
      onUpdatePatient({
        ...patient,
        nurseNote,
      });
    }
    onEscalate(patient.id, nurseNote);
    setAlertSuccess(true);
    setTimeout(() => setAlertSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto bg-white border border-[#E4E9E1] rounded-2xl p-6 space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#5C6A61] hover:text-[#0B6B38] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ย้อนกลับไปหน้ารายชื่อผู้ป่วย</span>
        </button>

        {noteSaved && (
          <span className="text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            บันทึกข้อมูลเรียบร้อย
          </span>
        )}
      </div>

      {/* Header Info */}
      <div className="border-b border-[#EDF1EB] pb-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-[12.5px]">
          <div>
            <span className="text-[#9AA69C] block mb-0.5">ประเมินความเสี่ยง MALA</span>
            <span className="font-semibold text-[#16241A] text-[14px]">{patient.name}</span>
          </div>
          <div>
            <span className="text-[#9AA69C] block mb-0.5">เลขบัตรประจำตัวประชาชน</span>
            <span className="font-semibold text-[#16241A] font-mono">{patient.citizenId}</span>
          </div>
          <div>
            <span className="text-[#9AA69C] block mb-0.5">เพศ / อายุ</span>
            <span className="font-semibold text-[#16241A]">{patient.gender || 'ไม่ระบุ'} / {patient.age} ปี</span>
          </div>
          <div>
            <span className="text-[#9AA69C] block mb-0.5">นน. / สส. / BMI ปัจจุบัน</span>
            <span className="font-semibold text-[#16241A]">
              {patient.weight || 66} กก. / {Math.round(patient.height * 100)} ซม. (BMI {patient.bmi || '—'})
            </span>
          </div>
        </div>
      </div>

      {/* Lab vs Field Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* คอลัมน์ซ้าย: ข้อมูลแล็ปจาก รพ. */}
        <div className="border border-[#E4E9E1] rounded-2xl p-5 bg-[#FAFBF9] space-y-2.5 text-[12.5px]">
          <span className="inline-flex items-center bg-white text-[#5C6A61] font-medium px-2.5 py-1 rounded-lg border border-[#E4E9E1] text-[11px] mb-1">
            ข้อมูลผู้ป่วย (ดึงจากระบบ รพ.) · อัตโนมัติ
          </span>
          <p><span className="text-[#9AA69C]">ชื่อ-สกุล:</span> <b className="text-[#16241A]">{patient.name}</b></p>
          <p><span className="text-[#9AA69C]">อายุ:</span> <b className="text-[#16241A]">{patient.age} ปี</b></p>
          <p><span className="text-[#9AA69C]">โรคประจำตัว:</span> <b className="text-[#16241A]">เบาหวานชนิดที่ 2 (DM Type 2)</b></p>
          <p><span className="text-[#9AA69C]">ขนาดยาเดิม:</span> <b className="text-[#16241A]">{patient.metforminDose}</b></p>
          <div className="pt-1.5">
            <span className="text-[#9AA69C] block mb-1">ค่าการทำงานของไตล่าสุด (eGFR)</span>
            <span className="text-[15px] font-semibold text-[#16241A] bg-white border border-[#E4E9E1] px-3 py-1.5 rounded-xl inline-block font-mono">
              {patient.egfr} mL/min/1.73m²
            </span>
          </div>
          <span className="text-[10.5px] text-[#0B6B38] font-medium block pt-1">
            ✓ เชื่อมโยงฐานข้อมูลแล็ป รพ.เชียงรายฯ
          </span>
        </div>

        {/* คอลัมน์ขวา: ข้อมูลหน้างาน (ปรับแก้ได้) */}
        <div className="border border-[#E4E9E1] rounded-2xl p-5 bg-[#FAFBF9] space-y-2.5 text-[12.5px]">
          <div className="flex items-center justify-between mb-1">
            <span className="inline-flex items-center bg-[#EAF3ED] text-[#0B6B38] font-medium px-2.5 py-1 rounded-lg border border-[#CFE3D5] text-[11px]">
              ข้อมูลหน้างาน (อสม. ส่งมา · {patient.updatedAt || 'วันนี้'})
            </span>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-[11px] text-[#0B6B38] hover:underline font-medium"
              >
                <Edit3 className="w-3 h-3" />
                <span>แก้ไขหน้างาน</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSaveRecheck}
                  className="flex items-center gap-1 text-[11px] bg-[#0B6B38] text-white px-2 py-0.5 rounded font-medium shadow-sm"
                >
                  <Save className="w-3 h-3" />
                  <span>บันทึก</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {!isEditing ? (
            <>
              <p><span className="text-[#9AA69C]">น้ำหนักปัจจุบัน:</span> <b className="text-[#16241A]">{patient.weight || 65.5} กก.</b></p>
              <p><span className="text-[#9AA69C]">ส่วนสูง:</span> <b className="text-[#16241A]">{Math.round(patient.height * 100)} ซม.</b></p>
              <p><span className="text-[#9AA69C]">ค่า BMI:</span> <b className="text-[#16241A]">{patient.bmi || '—'}</b></p>

              <div className="pt-1.5">
                <span className="font-semibold text-[#A6740A] flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>ปัจจัยเสี่ยงที่ตรวจพบ</span>
                </span>
                <div className="space-y-1.5 pl-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${patient.hasDehydration ? 'bg-[#C4392B] ring-2 ring-red-200' : 'bg-[#DEE4DB]'}`} />
                    <span className={patient.hasDehydration ? 'font-semibold text-[#C4392B]' : 'text-[#AFB8AC]'}>
                      {patient.hasDehydration ? '⚠️ มีภาวะขาดน้ำ/ท้องเสีย' : 'ไม่มีภาวะขาดน้ำ'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${patient.hasAlcohol ? 'bg-[#C99A1F] ring-2 ring-amber-200' : 'bg-[#DEE4DB]'}`} />
                    <span className={patient.hasAlcohol ? 'font-semibold text-[#16241A]' : 'text-[#AFB8AC]'}>
                      {patient.hasAlcohol ? '🍺 ดื่มแอลกอฮอล์' : 'ไม่ดื่มแอลกอฮอล์'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] text-[#5C6A61] block mb-1">ชั่งน้ำหนักใหม่ที่ รพ.สต. (กก.):</label>
                <input
                  type="number"
                  value={editWeight}
                  onChange={(e) => setEditWeight(e.target.value)}
                  className="w-full p-2 bg-white border border-[#DEE4DB] rounded-lg text-xs font-semibold outline-none focus:border-[#0B6B38]"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="text-[11px] text-[#5C6A61] block">ปรับสถานะปัจจัยเสี่ยงหน้างาน:</label>
                <button
                  type="button"
                  onClick={() => setEditDehydration(!editDehydration)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg border text-xs transition ${
                    editDehydration
                      ? 'bg-red-50 border-red-300 text-red-700 font-semibold'
                      : 'bg-white border-[#DEE4DB] text-[#5C6A61]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <span>มีอาการท้องเสีย / ขาดน้ำ</span>
                  </span>
                  <span>{editDehydration ? 'ใช่' : 'ไม่'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditAlcohol(!editAlcohol)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg border text-xs transition ${
                    editAlcohol
                      ? 'bg-amber-50 border-amber-300 text-amber-800 font-semibold'
                      : 'bg-white border-[#DEE4DB] text-[#5C6A61]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Wine className="w-3.5 h-3.5 text-amber-600" />
                    <span>ดื่มเครื่องดื่มแอลกอฮอล์</span>
                  </span>
                  <span>{editAlcohol ? 'ใช่' : 'ไม่'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Engine Assessment */}
      <div className="border-t border-[#EDF1EB] pt-5 space-y-2.5">
        <h3 className="text-[13.5px] font-semibold text-[#16241A]">ผลการประเมินระบบ MALA Risk Engine</h3>
        <div className="flex items-center gap-2 text-[12.5px]">
          <span className="text-[#5C6A61] font-medium">สถานะความเสี่ยง:</span>
          <span className={`flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-lg border ${risk.text} ${risk.bg} ${risk.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
            <span>{risk.label}</span>
          </span>
        </div>
        <p className="text-[12.5px] text-[#5C6A61]">
          <span className="font-semibold text-[#3B4A40]">คำแนะนำจากระบบ:</span>{' '}
          {patient.cpgGuideline || 'ผู้ป่วยมีภาวะไตเสื่อมและมีปัจจัยเสี่ยง เสี่ยงเกิดภาวะเลือดเป็นกรด Lactic Acidosis'}
        </p>
      </div>

      {/* กล่องบันทึกทางการพยาบาล (Nurse Clinical Note) */}
      <div className="border border-[#CFE3D5] bg-[#FAFBF9] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[13px] font-bold text-[#0B6B38]">
            <FileText className="w-4 h-4" />
            <span>บันทึกการประเมินอาการของ รพ.สต. (Nurse Note)</span>
          </div>
          <button
            type="button"
            onClick={handleSaveNoteOnly}
            className="flex items-center gap-1 text-[11.5px] bg-white border border-[#CFE3D5] text-[#0B6B38] hover:bg-[#EAF3ED] px-3 py-1 rounded-lg font-semibold transition shadow-sm"
          >
            <Save className="w-3 h-3" />
            <span>บันทึกโน้ต</span>
          </button>
        </div>

        <textarea
          value={nurseNote}
          onChange={(e) => setNurseNote(e.target.value)}
          rows={3}
          placeholder="พิมพ์บันทึกอาการที่ตรวจพบหน้างาน หรือระบุข้อความส่งต่อถึงแพทย์ห้องตรวจ เช่น คนไข้มีอาการเพลีย หายใจเร็ว ปัสสาวะออกน้อย..."
          className="w-full text-xs p-3 bg-white border border-[#DEE4DB] rounded-xl outline-none focus:ring-2 focus:ring-[#0B6B38]/20 focus:border-[#0B6B38] text-[#16241A] placeholder:text-[#9AA69C]"
        />
      </div>

      {alertSuccess && (
        <div className="p-3 bg-[#EAF3ED] border border-[#CFE3D5] rounded-xl flex items-center gap-2 text-[#0B6B38] text-[12.5px] font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>ส่งสัญญาณแจ้งเตือนไปยังห้องตรวจแพทย์ รพ.ศูนย์ พร้อมแนบบันทึกทางการพยาบาลเรียบร้อยแล้ว</span>
        </div>
      )}

      {/* ปุ่ม Action ด้านล่าง (ป้องกันการกดส่งซ้ำ) */}
      <div className="space-y-2.5 pt-1">
        {patient.riskLevel === 'Red' && (
          patient.status === 'Escalated' ? (
            <div className="w-full py-3 bg-amber-50 border border-amber-300 text-amber-800 font-semibold rounded-xl text-[13px] flex items-center justify-center gap-2 shadow-sm">
              <Clock className="w-4 h-4 text-amber-600 animate-spin" />
              <span>ส่งต่อแพทย์แล้ว · อยู่ระหว่างรอแพทย์สั่งการรักษา</span>
            </div>
          ) : (
            <button
              onClick={handleAlert}
              className="w-full py-3 bg-[#C4392B] hover:bg-[#A62F23] text-white font-semibold rounded-xl transition text-[13px] flex items-center justify-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>ส่งแจ้งเตือนแพทย์ รพ.ศูนย์ เพื่อพิจารณาปรับยา</span>
            </button>
          )
        )}

        <button
          onClick={onOpenCpg}
          className="w-full py-3 bg-[#0B6B38] hover:bg-[#08532b] text-white font-semibold rounded-xl transition text-[13px] flex items-center justify-center gap-2 shadow-sm"
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>บันทึกข้อมูลและให้คำแนะนำเบื้องต้น (CPG) ที่ รพ.สต.</span>
        </button>
      </div>
    </div>
  );
};