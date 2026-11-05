import React from 'react';
import { Droplets, UtensilsCrossed, Pill, Leaf, Wine, Info, ChevronDown } from 'lucide-react';

export type AlcoholLevel = 'none' | 'drinking';

interface Step4RiskFactorsProps {
  alcoholLevel: AlcoholLevel;
  bingeDrinking: boolean;
  highWeeklyAlcohol: boolean;
  hasDehydration: boolean;
  poorIntake: boolean;
  painMedication: boolean;
  supplementOrHerbal: boolean;
  onSelectAlcohol: (level: AlcoholLevel) => void;
  onToggleBingeDrinking: (value: boolean) => void;
  onToggleHighWeeklyAlcohol: (value: boolean) => void;
  onToggleDehydration: (status: boolean) => void;
  onTogglePoorIntake: (value: boolean) => void;
  onTogglePainMedication: (value: boolean) => void;
  onToggleSupplementOrHerbal: (value: boolean) => void;
  isFemale: boolean;
}

const BRAND = '#0E5C33';
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5C33]/40 focus-visible:ring-offset-1';

/* ---------- Segmented control (ใช้ซ้ำทั้งหมด) ---------- */
type SegOption<T> = { value: T; label: string; tone?: 'default' | 'warn' };

function Segmented<T extends string | boolean>({
  value, onChange, options, label,
}: { value: T; onChange: (v: T) => void; options: SegOption<T>[]; label: string }) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl bg-zinc-100 p-1"
    >
      {options.map((o) => {
        const active = value === o.value;
        const activeCls =
          o.tone === 'warn'
            ? 'bg-amber-500 text-white shadow-sm'
            : 'bg-white text-zinc-900 shadow-sm ring-1 ring-black/5';
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`h-11 min-w-[72px] rounded-lg px-4 text-sm font-medium transition active:scale-[0.97] ${focusRing} ${
              active ? activeCls : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const yesNoOptions: SegOption<boolean>[] = [
  { value: false, label: 'ไม่ใช่' },
  { value: true, label: 'ใช่', tone: 'warn' },
];

const YesNo = ({
  value, onChange, label,
}: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
  <Segmented value={value} onChange={onChange} options={yesNoOptions} label={label} />
);

/* ---------- แถวคำถาม ---------- */
const QuestionRow = ({
  no, icon: Icon, title, hint, children,
}: {
  no: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-3 px-5 py-4">
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#0E5C33]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <h3 className="text-[15px] font-medium leading-snug text-zinc-900">
          <span className="mr-1.5 text-zinc-400">{no}.</span>
          {title}
        </h3>
        {hint && <p className="mt-1 text-xs leading-relaxed text-zinc-500">{hint}</p>}
      </div>
    </div>
    {children}
  </div>
);

/* ---------- ส่วนขยายแบบนุ่ม ---------- */
const Collapse = ({ open, children }: { open: boolean; children: React.ReactNode }) => (
  <div
    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
      open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
    }`}
    aria-hidden={!open}
  >
    <div className="overflow-hidden">{children}</div>
  </div>
);

export const Step4RiskFactors: React.FC<Step4RiskFactorsProps> = (props) => {
  const {
    alcoholLevel, bingeDrinking, highWeeklyAlcohol, hasDehydration, poorIntake,
    painMedication, supplementOrHerbal, onSelectAlcohol, onToggleBingeDrinking,
    onToggleHighWeeklyAlcohol, onToggleDehydration, onTogglePoorIntake,
    onTogglePainMedication, onToggleSupplementOrHerbal, isFemale,
  } = props;

  const sex = isFemale ? 'หญิง' : 'ชาย';
  const thresholdBinge = isFemale ? '4 ดื่มมาตรฐานขึ้นไป' : '5 ดื่มมาตรฐานขึ้นไป';
  const thresholdWeekly = isFemale ? '8 ดื่มมาตรฐาน/สัปดาห์ขึ้นไป' : '15 ดื่มมาตรฐาน/สัปดาห์ขึ้นไป';
  const drinking = alcoholLevel === 'drinking';

  const alcoholOptions: SegOption<AlcoholLevel>[] = [
    { value: 'none', label: 'ไม่ดื่ม' },
    { value: 'drinking', label: 'ดื่ม' },
  ];

  const questions = [
    { no: 10, icon: Droplets, title: 'ช่วงที่ผ่านมา มีอาการอาเจียนหรือท้องเสียหรือไม่?', value: hasDehydration, change: onToggleDehydration },
    { no: 11, icon: UtensilsCrossed, title: 'ทานอาหารไม่ได้ หรือทานได้น้อยลงต่อเนื่อง 1–2 วันหรือไม่?', value: poorIntake, change: onTogglePoorIntake },
    { no: 12, icon: Pill, title: 'ใช้ยาแก้ปวด แก้อักเสบ หรือยาชุดหรือไม่?', value: painMedication, change: onTogglePainMedication },
    { no: 13, icon: Leaf, title: 'ใช้ยาต้ม ยาหม้อ สมุนไพร หรืออาหารเสริมหรือไม่?', value: supplementOrHerbal, change: onToggleSupplementOrHerbal },
  ];

  return (
    <div className="space-y-8 font-sans text-sm text-zinc-900">
      {/* ===== 9. แอลกอฮอล์ ===== */}
      <section className="space-y-3">
        <header className="px-1">
          <h2 className="text-lg font-semibold tracking-tight">ประวัติการดื่มแอลกอฮอล์</h2>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            1 ดื่มมาตรฐาน = แอลกอฮอล์บริสุทธิ์ 10 กรัม
          </p>
        </header>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <QuestionRow no={9} icon={Wine} title="ช่วงที่ผ่านมา คุณดื่มแอลกอฮอล์หรือไม่?">
            <Segmented
              value={alcoholLevel}
              onChange={onSelectAlcohol}
              options={alcoholOptions}
              label="ดื่มแอลกอฮอล์หรือไม่"
            />
          </QuestionRow>

          <Collapse open={drinking}>
            <div className="space-y-5 border-t border-zinc-100 bg-zinc-50/60 px-5 py-4">
              <div className="space-y-2.5">
                <h4 className="font-medium">ดื่มหนักในเวลาสั้นๆ หรือไม่?</h4>
                <p className="text-xs leading-relaxed text-zinc-500">
                  <span className="mr-1 rounded-md bg-white px-1.5 py-0.5 font-medium text-zinc-700 ring-1 ring-zinc-200">
                    {sex} {thresholdBinge}
                  </span>
                  ภายใน 2 ชั่วโมง
                </p>
                <YesNo value={bingeDrinking} onChange={onToggleBingeDrinking} label="ดื่มหนักในช่วงเวลาอันสั้น" />
              </div>

              <div className="space-y-2.5">
                <h4 className="font-medium">ดื่มเป็นประจำ หรือดื่มหนักต่อเนื่องหรือไม่?</h4>
                <p className="text-xs leading-relaxed text-zinc-500">
                  <span className="mr-1 rounded-md bg-white px-1.5 py-0.5 font-medium text-zinc-700 ring-1 ring-zinc-200">
                    {sex} {thresholdWeekly}
                  </span>
                </p>
                <YesNo value={highWeeklyAlcohol} onChange={onToggleHighWeeklyAlcohol} label="ดื่มเกินเกณฑ์ต่อสัปดาห์" />
              </div>

              <details className="group rounded-xl bg-white ring-1 ring-zinc-200">
                <summary className={`flex cursor-pointer list-none items-center gap-2 rounded-xl px-3.5 py-3 text-xs font-medium text-zinc-600 ${focusRing}`}>
                  <Info className="h-4 w-4 text-sky-500" />
                  ตัวอย่างปริมาณเครื่องดื่ม
                  <ChevronDown className="ml-auto h-4 w-4 text-zinc-400 transition-transform group-open:rotate-180" />
                </summary>
                <ul className="space-y-1.5 border-t border-zinc-100 px-3.5 py-3 text-xs text-zinc-600">
                  {[
                    ['เบียร์กระป๋องเล็ก 330 มล.', '≈ 1 ดื่ม'],
                    ['เหล้า 1 ช็อต 30 มล.', '≈ 1 ดื่ม'],
                    ['ไวน์ 1 แก้ว 100–120 มล.', '≈ 1 ดื่ม'],
                    ['เบียร์ขวดใหญ่ 620 มล.', '≈ 2 ดื่ม'],
                    ['เหล้าขาว 1 กั๊ก 180 มล.', '≈ 6 ดื่ม'],
                  ].map(([name, val]) => (
                    <li key={name} className="flex items-center justify-between gap-3">
                      <span>{name}</span>
                      <span className="shrink-0 font-medium" style={{ color: BRAND }}>{val}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </Collapse>
        </div>
      </section>

      {/* ===== 10–13 คัดกรอง ===== */}
      <section className="space-y-3">
        <header className="px-1">
          <h2 className="text-lg font-semibold tracking-tight">อาการและปัจจัยกระตุ้น</h2>
          <p className="mt-1 text-xs text-zinc-500">เลือกคำตอบที่ตรงกับช่วงที่ผ่านมามากที่สุด</p>
        </header>

        <div className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {questions.map((q) => (
            <QuestionRow key={q.no} no={q.no} icon={q.icon} title={q.title}>
              <YesNo value={q.value} onChange={q.change} label={q.title} />
            </QuestionRow>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Step4RiskFactors;