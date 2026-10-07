import React, { useState } from 'react';
import type { Patient } from '../../../types';
import { CheckCircle2, FileText, Minus, Plus, Send, UserCheck } from 'lucide-react';

interface OrderPrescriptionTabProps {
  patient: Patient;
  onPrescribe: (patientId: string, order: string) => void;
}

type OrderType = 'MAINTAIN' | 'REDUCE' | 'HOLD';

const BRAND = '#0B6B38';

const ORDER_OPTIONS: { value: OrderType; title: string; desc: string }[] = [
  { value: 'REDUCE', title: 'ปรับลดยา Metformin', desc: 'ระบุขนาดยาใหม่ต่อวัน' },
  { value: 'HOLD', title: 'หยุดยาชั่วคราว (Hold)', desc: 'งดยาจนกว่าค่าไตจะฟื้นตัว' },
  { value: 'MAINTAIN', title: 'คงยาเดิมและเฝ้าระวัง', desc: 'ทานขนาดเดิมตามแพทย์สั่ง' },
];

// สีของค่า eGFR: ยิ่งต่ำยิ่งเสี่ยง
const egfrTone = (v: number) => {
  if (v < 30) return 'text-red-600';
  if (v < 60) return 'text-amber-600';
  return 'text-emerald-700';
};

const inputCls =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#0B6B38] focus:ring-2 focus:ring-[#0B6B38]/15';

export const OrderPrescriptionTab: React.FC<OrderPrescriptionTabProps> = ({
  patient,
  onPrescribe,
}) => {
  const [orderType, setOrderType] = useState<OrderType>('REDUCE');
  const [pillsPerDay, setPillsPerDay] = useState<number>(1);
  const [noteToShph, setNoteToShph] = useState<string>(
    'ให้คนไข้ดื่มน้ำเกลือแร่ เฝ้าระวังอาการขาดน้ำ และนัดเจาะเลือดซ้ำสัปดาห์หน้า'
  );
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const timeStamp = `${String(now.getDate()).padStart(2, '0')}/${String(
      now.getMonth() + 1
    ).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    let directive = '';
    if (orderType === 'MAINTAIN') {
      directive = 'คงยาเดิมและเฝ้าระวังอย่างใกล้ชิด';
    } else if (orderType === 'REDUCE') {
      directive = `ปรับลดยา Metformin เหลือ ${pillsPerDay} เม็ด/วัน (${pillsPerDay * 500} มก.)`;
    } else {
      directive = 'หยุดยา Metformin ชั่วคราว (Hold)';
    }

    // รวมคำสั่งแพทย์และบันทึกประวัติการดูแลต่อเนื่องลงฐานข้อมูล
    const finalDirective = `${directive} | แผนการดูแล: ${
      noteToShph.trim() || 'ติดตามอาการตามรอบ'
    } [บันทึกเมื่อ ${timeStamp}]`;

    onPrescribe(patient.id, finalDirective);
    setIsSaved(true);
  };

  const riskSummary: { text: string; warn: boolean }[] = [
    {
      text: `ภาวะไตเสื่อม (eGFR ล่าสุด ${patient.egfr} mL/min/1.73m²)`,
      warn: true,
    },
    {
      text: patient.hasDehydration
        ? 'ตรวจพบภาวะขาดน้ำ/ท้องเสียหน้างาน เสี่ยง Lactic Acidosis ฉับพลัน'
        : 'ไม่มีภาวะขาดน้ำ',
      warn: !!patient.hasDehydration,
    },
    {
      text: patient.hasAlcohol ? 'มีประวัติดื่มเครื่องดื่มแอลกอฮอล์' : 'ไม่มีประวัติดื่มแอลกอฮอล์',
      warn: !!patient.hasAlcohol,
    },
    {
      text: `ปัจจุบันรับประทาน Metformin ${patient.metforminDose || '2 เม็ด/วัน (1,000 มก.)'}`,
      warn: false,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12 font-sans text-sm text-zinc-900">
      {/* แจ้งเตือนเคสส่งต่อ */}
      <div role="alert" className="flex items-start gap-3 rounded-2xl bg-red-50 px-5 py-4">
        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" aria-hidden />
        <div>
          <p className="font-semibold text-red-900">เคสส่งต่อจาก รพ.สต. บ้านดอน</p>
          <p className="mt-0.5 text-red-800/80">
            ผู้ป่วยมีความเสี่ยง MALA ระดับสูง กรุณาพิจารณาปรับขนาดยา Metformin
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ===== ซ้าย: ข้อมูลผู้ป่วย ===== */}
        <div className="space-y-6 lg:col-span-3">
          {/* ผู้ป่วย */}
          <section className="rounded-2xl border border-zinc-200 bg-white">
            <div className="flex items-center gap-4 p-5">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
                style={{ backgroundColor: BRAND }}
                aria-hidden
              >
                {patient.name.trim().charAt(0)}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold tracking-tight">{patient.name}</h2>
                <p className="text-zinc-500">
                  {patient.gender || 'ชาย'} · {patient.age} ปี ·{' '}
                  <span className="font-mono text-[13px]">{patient.citizenId}</span>
                </p>
                <p className="text-xs text-zinc-400">ต.บ้านดอน อ.เมือง จ.เชียงราย</p>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-zinc-100 border-t border-zinc-100">
              <div className="p-5">
                <p className="text-xs text-zinc-500">eGFR ล่าสุด</p>
                <p className={`mt-1 font-mono text-2xl font-semibold ${egfrTone(patient.egfr)}`}>
                  {patient.egfr}
                </p>
                <p className="text-[11px] text-zinc-400">mL/min/1.73m²</p>
              </div>
              <div className="p-5">
                <p className="text-xs text-zinc-500">น้ำหนัก / ส่วนสูง</p>
                <p className="mt-1 text-base font-semibold leading-snug">
                  {patient.weight || 66} กก.
                  <br />
                  {Math.round(patient.height * 100)} ซม.
                </p>
              </div>
              <div className="p-5">
                <p className="text-xs text-zinc-500">BMI</p>
                <p className="mt-1 font-mono text-2xl font-semibold">{patient.bmi || '—'}</p>
                <p className="text-[11px] text-zinc-400">kg/m²</p>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-zinc-100 px-5 py-3.5 text-zinc-500">
              <UserCheck className="h-4 w-4 text-[#0B6B38]" />
              <span>
                ส่งต่อจาก{' '}
                <span className="font-medium text-zinc-900">
                  {patient.screenedBy || 'พยาบาลวิชาชีพ ใจดี (รพ.สต. บ้านดอน)'}
                </span>
              </span>
            </div>
          </section>

          {/* บันทึกจากพยาบาล */}
          {patient.nurseNote ? (
            <section className="flex gap-3 rounded-2xl border border-zinc-200 bg-white p-5">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#0B6B38]" />
              <div>
                <h3 className="text-xs font-medium text-zinc-500">บันทึกอาการจากพยาบาล รพ.สต.</h3>
                <p className="mt-1 leading-relaxed text-zinc-800">“{patient.nurseNote}”</p>
              </div>
            </section>
          ) : (
            <p className="flex items-center gap-2 px-1 text-zinc-400">
              <FileText className="h-4 w-4 shrink-0" />
              ไม่มีบันทึกอาการเพิ่มเติม (ส่งต่อตามเกณฑ์ความเสี่ยงสีแดงอัตโนมัติ)
            </p>
          )}

          {/* สรุปสาเหตุความเสี่ยง */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h3 className="font-semibold">สรุปสาเหตุความเสี่ยง</h3>
              <span className="text-xs text-zinc-400">สร้างโดย AI</span>
            </div>
            <ul className="space-y-2.5">
              {riskSummary.map((item) => (
                <li key={item.text} className="flex gap-3 leading-relaxed">
                  <span
                    className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                      item.warn ? 'bg-amber-500' : 'bg-zinc-300'
                    }`}
                    aria-hidden
                  />
                  <span className={item.warn ? 'text-zinc-900' : 'text-zinc-500'}>{item.text}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ===== ขวา: คำสั่งแพทย์ (ติดอยู่ขณะเลื่อนบนจอใหญ่) ===== */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 self-start rounded-2xl border border-zinc-200 bg-white p-5 lg:sticky lg:top-6 lg:col-span-2"
        >
          <div>
            <h3 className="font-semibold">คำสั่งแพทย์</h3>
            <p className="text-xs text-zinc-400">ระบบจะซิงค์คำสั่งกลับไปที่ รพ.สต. ทันที</p>
          </div>

          <fieldset className="space-y-2">
            <legend className="sr-only">เลือกคำสั่งยา</legend>
            {ORDER_OPTIONS.map((opt) => {
              const selected = orderType === opt.value;
              const isHold = opt.value === 'HOLD';
              return (
                <label
                  key={opt.value}
                  className={`block cursor-pointer rounded-xl border p-3.5 transition focus-within:ring-2 focus-within:ring-[#0B6B38]/20 ${
                    selected
                      ? isHold
                        ? 'border-red-400 bg-red-50/60'
                        : 'border-[#0B6B38] bg-emerald-50/50'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="orderType"
                      checked={selected}
                      onChange={() => setOrderType(opt.value)}
                      className={`mt-0.5 h-4 w-4 ${
                        isHold ? 'text-red-600 focus:ring-red-600' : 'text-[#0B6B38] focus:ring-[#0B6B38]'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{opt.title}</p>
                      <p className="text-xs text-zinc-500">{opt.desc}</p>

                      {opt.value === 'REDUCE' && selected && (
                        <div className="mt-3 flex items-center gap-3">
                          <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-white">
                            <button
                              type="button"
                              aria-label="ลดจำนวนเม็ด"
                              onClick={() => setPillsPerDay((n) => Math.max(1, n - 1))}
                              className="p-2 text-zinc-500 hover:text-zinc-900"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center font-mono font-semibold">{pillsPerDay}</span>
                            <button
                              type="button"
                              aria-label="เพิ่มจำนวนเม็ด"
                              onClick={() => setPillsPerDay((n) => Math.min(4, n + 1))}
                              className="p-2 text-zinc-500 hover:text-zinc-900"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="text-[13px] text-zinc-600">
                            เม็ด/วัน · {pillsPerDay * 500} มก.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </fieldset>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-zinc-700">
              แผนการดูแลถึง รพ.สต.
            </span>
            <textarea
              rows={4}
              value={noteToShph}
              onChange={(e) => setNoteToShph(e.target.value)}
              placeholder="เช่น การให้สารน้ำ, การงดยา, นัดเจาะเลือด"
              className={`${inputCls} resize-none leading-relaxed`}
            />
          </label>

          {isSaved && (
            <div
              role="status"
              className="flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 font-medium text-emerald-800"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>ส่งคำสั่งแพทย์กลับไปที่ รพ.สต. แล้ว</span>
            </div>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B6B38] py-3 font-medium text-white transition hover:bg-[#08532b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B6B38]/40 focus-visible:ring-offset-2"
          >
            <Send className="h-4 w-4" />
            ยืนยันและส่งกลับ รพ.สต.
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderPrescriptionTab;