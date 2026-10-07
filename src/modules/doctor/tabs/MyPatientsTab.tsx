import React, { useState } from 'react';
import type { Patient } from '../../../types';
import { calculateBMI, evaluateMalaRisk } from '../../../utils/riskEngine';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  FileText,
  Minus,
  Pencil,
  Plus,
  Search,
  Send,
  Users,
  X,
} from 'lucide-react';

interface MyPatientsTabProps {
  patients: Patient[];
  onPrescribe: (patientId: string, order: string) => void;
  onUpdatePatient?: (updated: Patient) => void;
}

type Filter = 'all' | 'pending' | 'done';
type OrderType = 'MAINTAIN' | 'REDUCE' | 'HOLD';

const BRAND = '#0B6B38';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'pending', label: 'รอแพทย์พิจารณา' },
  { value: 'done', label: 'ปรับยาแล้ว' },
];

const ORDER_OPTIONS: { value: OrderType; title: string; desc: string }[] = [
  { value: 'REDUCE', title: 'ปรับลดยา Metformin', desc: 'ลดขนาดยาต่อวัน' },
  { value: 'HOLD', title: 'หยุดยาชั่วคราว', desc: 'งดยาจนกว่าค่าไตจะฟื้นตัว' },
  { value: 'MAINTAIN', title: 'คงยาเดิมและเฝ้าระวัง', desc: 'ทานขนาดเดิมตามแพทย์สั่ง' },
];

const isDone = (p: Patient) => p.status === 'Resolved' || !!p.doctorOrder;

// สีของค่า eGFR: ยิ่งต่ำยิ่งเสี่ยง
const egfrTone = (v: number) => {
  if (v < 30) return { text: 'text-red-600', dot: 'bg-red-500' };
  if (v < 60) return { text: 'text-amber-600', dot: 'bg-amber-500' };
  return { text: 'text-emerald-700', dot: 'bg-emerald-500' };
};

const inputCls =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#0B6B38] focus:ring-2 focus:ring-[#0B6B38]/15';

export const MyPatientsTab: React.FC<MyPatientsTabProps> = ({
  patients,
  onPrescribe,
  onUpdatePatient,
}) => {
  const myPatients = patients.filter(
    (p) => p.doctorOrder || p.status === 'Escalated' || p.status === 'Resolved'
  );

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // รายการ: ค้นหา + กรอง
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  // แก้ไขข้อมูลหน้างาน
  const [isEditing, setIsEditing] = useState(false);
  const [editWeight, setEditWeight] = useState<number>(0);
  const [editHeight, setEditHeight] = useState<number>(0);
  const [editDehydration, setEditDehydration] = useState<boolean>(false);
  const [editAlcohol, setEditAlcohol] = useState<boolean>(false);

  // สั่งจ่ายยาครั้งถัดไป
  const [orderType, setOrderType] = useState<OrderType>('REDUCE');
  const [pillsPerDay, setPillsPerDay] = useState<number>(1);
  const [carePlanNote, setCarePlanNote] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const currentPatient = patients.find((p) => p.id === selectedPatientId);

  const loadEditFields = (patient: Patient) => {
    setEditWeight(patient.weight || 60);
    setEditHeight(Math.round((patient.height || 1.6) * 100));
    setEditDehydration(!!patient.hasDehydration);
    setEditAlcohol(!!patient.hasAlcohol);
  };

  const handleOpenDetail = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setIsEditing(false);
    loadEditFields(patient);
    setCarePlanNote('');
    setSaveSuccess(null);
  };

  const handleCancelEdit = () => {
    if (currentPatient) loadEditFields(currentPatient);
    setIsEditing(false);
  };

  const flashSuccess = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleSaveEdit = () => {
    if (!currentPatient) return;
    const newBmi = calculateBMI(editWeight, editHeight / 100);
    const { risk, cpg } = evaluateMalaRisk(currentPatient.egfr, editDehydration, editAlcohol);

    const updated: Patient = {
      ...currentPatient,
      weight: editWeight,
      height: editHeight / 100,
      bmi: newBmi,
      hasDehydration: editDehydration,
      hasAlcohol: editAlcohol,
      riskLevel: risk,
      cpgGuideline: cpg,
      updatedAt: 'อัปเดตข้อมูลหน้างานล่าสุด',
    };

    onUpdatePatient?.(updated);
    setIsEditing(false);
    flashSuccess('บันทึกข้อมูลหน้างานแล้ว');
  };

  const handlePrescribeNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) return;

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

    const newOrderEntry = `${directive} | แผนการดูแล: ${
      carePlanNote.trim() || 'ติดตามค่าไตตามรอบ'
    } [บันทึกเมื่อ ${timeStamp}]`;

    // เก็บทุกครั้งที่แพทย์สั่ง โดยใช้ ';;;' คั่น (ล่าสุดอยู่หน้าสุด)
    const updatedFullHistory = currentPatient.doctorOrder
      ? `${newOrderEntry};;;${currentPatient.doctorOrder}`
      : newOrderEntry;

    onPrescribe(currentPatient.id, updatedFullHistory);

    setCarePlanNote('');
    flashSuccess('บันทึกคำสั่งแพทย์แล้ว');
  };

  // ==========================================
  // VIEW 1: รายชื่อคนไข้ในความดูแล
  // ==========================================
  if (!currentPatient) {
    const q = query.trim().toLowerCase();
    const visible = myPatients.filter((p) => {
      const matchesFilter =
        filter === 'all' || (filter === 'done' ? isDone(p) : !isDone(p));
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || String(p.citizenId).includes(q);
      return matchesFilter && matchesQuery;
    });
    const pendingCount = myPatients.filter((p) => !isDone(p)).length;

    return (
      <div className="mx-auto max-w-4xl space-y-6 font-sans text-sm text-zinc-900">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">คนไข้ในความดูแล</h2>
          <p className="text-zinc-500">
            {myPatients.length} ราย ·{' '}
            {pendingCount > 0 ? (
              <span className="font-medium text-red-600">รอแพทย์พิจารณา {pendingCount} ราย</span>
            ) : (
              'ไม่มีรายการค้าง'
            )}
          </p>
        </header>

        {/* ค้นหา + ตัวกรอง */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาชื่อ หรือเลขบัตรประชาชน"
              aria-label="ค้นหาผู้ป่วย"
              className={`${inputCls} pl-9`}
            />
          </div>

          <div className="inline-flex rounded-lg bg-zinc-100 p-1" role="tablist" aria-label="กรองสถานะ">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                role="tab"
                aria-selected={filter === f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition ${
                  filter === f.value
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* รายการ */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-zinc-400">
              <Users className="h-9 w-9" strokeWidth={1.5} />
              <p className="font-medium text-zinc-600">
                {myPatients.length === 0 ? 'ยังไม่มีผู้ป่วยที่ส่งต่อเข้ามา' : 'ไม่พบผู้ป่วยตามเงื่อนไข'}
              </p>
              {myPatients.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setFilter('all');
                  }}
                  className="text-[13px] font-medium text-[#0B6B38] hover:underline"
                >
                  ล้างตัวกรอง
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {visible.map((p) => {
                const latestOrder = p.doctorOrder
                  ? p.doctorOrder.split(';;;')[0].split('|')[0].trim()
                  : null;
                const done = isDone(p);
                const tone = egfrTone(p.egfr);

                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(p)}
                      className="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 text-left transition hover:bg-zinc-50 focus-visible:bg-zinc-50 focus-visible:outline-none sm:grid-cols-[minmax(0,1.2fr)_90px_minmax(0,1.5fr)_auto_16px]"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{p.name}</p>
                        <p className="font-mono text-xs text-zinc-400">{p.citizenId}</p>
                      </div>

                      <div className="hidden items-center gap-2 sm:flex">
                        <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                        <span className={`font-mono font-semibold ${tone.text}`}>{p.egfr}</span>
                        <span className="text-xs text-zinc-400">eGFR</span>
                      </div>

                      <p className="hidden truncate text-zinc-600 sm:block">
                        {latestOrder || <span className="text-zinc-400">ยังไม่มีคำสั่งใหม่</span>}
                      </p>

                      <span
                        className={`justify-self-end whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                          done ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {done ? 'ปรับยาแล้ว' : 'รอแพทย์พิจารณา'}
                      </span>

                      <ChevronRight className="hidden h-4 w-4 text-zinc-300 sm:block" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: รายละเอียดผู้ป่วย / แก้ไข / ประวัติ / สั่งยา
  // ==========================================
  const calculatedBmi =
    editWeight && editHeight ? calculateBMI(editWeight, editHeight / 100) : currentPatient.bmi;
  const orderHistoryList = currentPatient.doctorOrder ? currentPatient.doctorOrder.split(';;;') : [];
  const isHighRisk = currentPatient.riskLevel === 'Red';
  const tone = egfrTone(currentPatient.egfr);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12 font-sans text-sm text-zinc-900">
      <button
        type="button"
        onClick={() => setSelectedPatientId(null)}
        className="inline-flex items-center gap-1.5 text-zinc-500 transition hover:text-[#0B6B38]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>รายชื่อผู้ป่วย</span>
      </button>

      {/* หัวข้อผู้ป่วย */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
            style={{ backgroundColor: BRAND }}
            aria-hidden
          >
            {currentPatient.name.trim().charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{currentPatient.name}</h2>
            <p className="text-zinc-500">
              {currentPatient.gender || 'ชาย'} · {currentPatient.age} ปี ·{' '}
              <span className="font-mono text-[13px]">{currentPatient.citizenId}</span>
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium ${
            isHighRisk ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isHighRisk ? 'bg-red-500' : 'bg-amber-500'}`} />
          {isHighRisk ? 'เสี่ยงสูง' : 'เสี่ยงปานกลาง'}
        </span>
      </header>

      {saveSuccess && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 font-medium text-emerald-800"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ===== ซ้าย: ข้อมูล + ประวัติ ===== */}
        <div className="space-y-6 lg:col-span-3">
          {/* ตัวเลขสำคัญ */}
          <section className="grid grid-cols-3 divide-x divide-zinc-100 rounded-2xl border border-zinc-200 bg-white">
            <div className="p-5">
              <p className="text-xs text-zinc-500">eGFR ล่าสุด</p>
              <p className={`mt-1 font-mono text-2xl font-semibold ${tone.text}`}>
                {currentPatient.egfr}
              </p>
              <p className="text-[11px] text-zinc-400">mL/min/1.73m²</p>
            </div>
            <div className="p-5">
              <p className="text-xs text-zinc-500">ยา Metformin เดิม</p>
              <p className="mt-1 text-base font-semibold leading-snug">
                {currentPatient.metforminDose || '2 เม็ด/วัน (1,000 มก.)'}
              </p>
            </div>
            <div className="p-5">
              <p className="text-xs text-zinc-500">BMI</p>
              <p className="mt-1 font-mono text-2xl font-semibold">{currentPatient.bmi}</p>
              <p className="text-[11px] text-zinc-400">
                {currentPatient.weight} กก. · {Math.round(currentPatient.height * 100)} ซม.
              </p>
            </div>
          </section>

          {/* ข้อมูลหน้างาน */}
          <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">ข้อมูลหน้างานจาก รพ.สต.</h3>
                <p className="text-xs text-zinc-400">{currentPatient.updatedAt || 'ล่าสุด'}</p>
              </div>

              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-[#0B6B38] transition hover:bg-emerald-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  แก้ไข
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-zinc-500 transition hover:bg-zinc-100"
                  >
                    <X className="h-3.5 w-3.5" />
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="rounded-lg bg-[#0B6B38] px-3 py-1.5 text-[13px] font-medium text-white transition hover:bg-[#08532b]"
                  >
                    บันทึก
                  </button>
                </div>
              )}
            </div>

            {!isEditing ? (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <dt className="text-xs text-zinc-500">น้ำหนัก</dt>
                  <dd className="font-medium">{currentPatient.weight} กก.</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">ส่วนสูง</dt>
                  <dd className="font-medium">{Math.round(currentPatient.height * 100)} ซม.</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">ภาวะขาดน้ำ / ท้องเสีย</dt>
                  <dd className={`font-medium ${currentPatient.hasDehydration ? 'text-red-600' : ''}`}>
                    {currentPatient.hasDehydration ? 'มี' : 'ไม่มี'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">ดื่มแอลกอฮอล์</dt>
                  <dd className={`font-medium ${currentPatient.hasAlcohol ? 'text-red-600' : ''}`}>
                    {currentPatient.hasAlcohol ? 'มี' : 'ไม่มี'}
                  </dd>
                </div>
              </dl>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-xs text-zinc-500">น้ำหนัก (กก.)</span>
                    <input
                      type="number"
                      value={editWeight}
                      onChange={(e) => setEditWeight(Number(e.target.value))}
                      className={inputCls}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-zinc-500">ส่วนสูง (ซม.)</span>
                    <input
                      type="number"
                      value={editHeight}
                      onChange={(e) => setEditHeight(Number(e.target.value))}
                      className={inputCls}
                    />
                  </label>
                </div>
                <p className="text-xs text-zinc-500">
                  BMI คำนวณใหม่: <span className="font-mono font-semibold text-zinc-900">{calculatedBmi}</span>
                </p>

                <div className="space-y-2">
                  {[
                    { label: 'มีภาวะขาดน้ำ / ท้องเสีย', checked: editDehydration, set: setEditDehydration },
                    { label: 'มีประวัติดื่มแอลกอฮอล์', checked: editAlcohol, set: setEditAlcohol },
                  ].map((c) => (
                    <label
                      key={c.label}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2.5 transition hover:bg-zinc-50"
                    >
                      <input
                        type="checkbox"
                        checked={c.checked}
                        onChange={(e) => c.set(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-300 text-[#0B6B38] focus:ring-[#0B6B38]"
                      />
                      <span>{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ผลประเมินความเสี่ยง */}
          <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5">
            <h3 className="font-semibold">ผลประเมิน MALA Risk</h3>
            <p className="leading-relaxed text-zinc-600">
              ผู้ป่วยมีภาวะไตเสื่อมและมีปัจจัยเสี่ยง เสี่ยงเกิดภาวะเลือดเป็นกรด (Lactic Acidosis)
            </p>

            {currentPatient.nurseNote && (
              <div className="flex gap-3 rounded-xl bg-zinc-50 p-3.5">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                <div>
                  <p className="text-xs font-medium text-zinc-500">บันทึกจากพยาบาล รพ.สต.</p>
                  <p className="mt-0.5 text-zinc-800">“{currentPatient.nurseNote}”</p>
                </div>
              </div>
            )}
          </section>

          {/* ประวัติคำสั่งแพทย์ */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="mb-4 flex items-baseline justify-between">
              <h3 className="font-semibold">ประวัติคำสั่งแพทย์</h3>
              <span className="text-xs text-zinc-400">{orderHistoryList.length} ครั้ง</span>
            </div>

            {orderHistoryList.length === 0 ? (
              <p className="py-6 text-center text-zinc-400">ยังไม่มีคำสั่งแพทย์สำหรับผู้ป่วยรายนี้</p>
            ) : (
              <ol className="relative space-y-5 border-l border-zinc-200 pl-5">
                {orderHistoryList.map((entry, index) => {
                  const parts = entry.split('|');
                  const directive = parts[0]?.trim() || '';
                  const details = parts.slice(1).join(' | ').trim();
                  const isLatest = index === 0;

                  return (
                    <li key={index} className="relative">
                      <span
                        className={`absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${
                          isLatest ? 'bg-[#0B6B38]' : 'bg-zinc-300'
                        }`}
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={isLatest ? 'font-semibold' : 'font-medium text-zinc-700'}>{directive}</p>
                        {isLatest && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                            ล่าสุด
                          </span>
                        )}
                      </div>
                      {details && <p className="mt-1 leading-relaxed text-zinc-500">{details}</p>}
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>

        {/* ===== ขวา: ฟอร์มสั่งยา (ติดอยู่ขณะเลื่อนบนจอใหญ่) ===== */}
        <form
          onSubmit={handlePrescribeNext}
          className="space-y-5 self-start rounded-2xl border border-zinc-200 bg-white p-5 lg:sticky lg:top-6 lg:col-span-2"
        >
          <div>
            <h3 className="font-semibold">สั่งการรักษาครั้งใหม่</h3>
            <p className="text-xs text-zinc-400">ระบบจะส่งคำสั่งกลับไปให้ รพ.สต.</p>
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
              คำแนะนำถึง รพ.สต. <span className="font-normal text-zinc-400">(ไม่บังคับ)</span>
            </span>
            <textarea
              rows={3}
              value={carePlanNote}
              onChange={(e) => setCarePlanNote(e.target.value)}
              placeholder="เช่น นัดเจาะเลือดซ้ำ 4 สัปดาห์, ให้เกลือแร่, สังเกตอาการหอบลึก"
              className={`${inputCls} resize-none`}
            />
          </label>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B6B38] py-3 font-medium text-white transition hover:bg-[#08532b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B6B38]/40 focus-visible:ring-offset-2"
          >
            <Send className="h-4 w-4" />
            บันทึกคำสั่งแพทย์
          </button>
        </form>
      </div>
    </div>
  );
};

export default MyPatientsTab;