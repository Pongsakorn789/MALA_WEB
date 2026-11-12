import React, { useMemo, useState } from 'react';
import type { Patient } from '../../types';
import { CheckCircle2, ChevronDown, ChevronUp, ClipboardList, LogOut, Search, UserRound } from 'lucide-react';
import { ReportsTab } from '../shph/tabs/ReportsTab';

interface CareManagerScreenProps {
  patients: Patient[];
  onUpdatePatient: (updated: Patient) => void;
  onLogout: () => void;
}

type QueueView = 'pending' | 'resolved';

export const CareManagerScreen: React.FC<CareManagerScreenProps> = ({
  patients,
  onUpdatePatient,
  onLogout,
}) => {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'queue'>('dashboard');
  const [queueView, setQueueView] = useState<QueueView>('pending');
  const [query, setQuery] = useState('');
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);

  const riskCases = useMemo(
    () => patients.filter((patient) => patient.caseType === 'MALA_RISK'),
    [patients],
  );
  const pendingCases = riskCases.filter((patient) => patient.careManagerStatus !== 'Resolved');
  const resolvedCases = riskCases.filter((patient) => patient.careManagerStatus === 'Resolved');
  const visibleCases = (queueView === 'pending' ? pendingCases : resolvedCases).filter((patient) => {
    const term = query.trim().toLowerCase();
    return !term || patient.name.toLowerCase().includes(term) || patient.citizenId.toLowerCase().includes(term);
  });

  const updateCase = (patient: Patient, careManagerStatus: 'InProgress' | 'Resolved') => {
    onUpdatePatient({ ...patient, careManagerStatus });
  };

  return (
    <div className="min-h-screen bg-[#F6F4EF] font-sans text-zinc-900">
      <header className="flex items-center justify-between bg-[#0E5C33] px-5 py-4 text-white md:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
            <ClipboardList className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-semibold">คิวติดตามกลุ่มเสี่ยง MALA</h1>
            <p className="text-xs text-white/75">ผู้ดูแลเคส · ไม่ใช่คิวแพทย์</p>
          </div>
        </div>
        <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-3 py-2 text-sm hover:bg-white/10">
          <LogOut className="h-4 w-4" /> ออกจากระบบ
        </button>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-7 md:px-8">
        <nav className="flex gap-2 border-b border-zinc-200" aria-label="ส่วนผู้ดูแล">
          <button onClick={() => setActiveSection('dashboard')} className={`px-3 py-3 text-sm font-medium ${activeSection === 'dashboard' ? 'border-b-2 border-[#0E5C33] text-[#0E5C33]' : 'text-zinc-500 hover:text-zinc-800'}`}>แดชบอร์ด/รายงาน</button>
          <button onClick={() => setActiveSection('queue')} className={`px-3 py-3 text-sm font-medium ${activeSection === 'queue' ? 'border-b-2 border-[#0E5C33] text-[#0E5C33]' : 'text-zinc-500 hover:text-zinc-800'}`}>คิวติดตาม <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">{pendingCases.length}</span></button>
        </nav>
        {activeSection === 'dashboard' ? <ReportsTab patients={patients} /> : <>
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">รายการที่ต้องจัดการ</h2>
            <p className="mt-1 text-sm text-zinc-600">เคสที่คะแนนคัดกรองเข้าเกณฑ์เสี่ยงจะเข้าคิวนี้โดยอัตโนมัติ</p>
          </div>
          <div className="flex gap-2 rounded-xl bg-white p-1 shadow-sm" role="tablist" aria-label="สถานะเคส">
            {([
              ['pending', 'รอดำเนินการ', pendingCases.length],
              ['resolved', 'จัดการแล้ว', resolvedCases.length],
            ] as const).map(([value, label, count]) => (
              <button
                key={value}
                role="tab"
                aria-selected={queueView === value}
                onClick={() => setQueueView(value)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${queueView === value ? 'bg-[#0E5C33] text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}
              >
                {label} <span className="ml-1 tabular-nums">{count}</span>
              </button>
            ))}
          </div>
        </section>

        <label className="relative block max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหาชื่อหรือเลขบัตรประชาชน"
            className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#0E5C33] focus:ring-2 focus:ring-[#0E5C33]/15"
          />
        </label>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {visibleCases.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
              <p className="mt-3 font-medium">{query ? 'ไม่พบเคสที่ค้นหา' : queueView === 'pending' ? 'ไม่มีเคสรอดำเนินการ' : 'ยังไม่มีเคสที่จัดการแล้ว'}</p>
              <p className="mt-1 text-sm text-zinc-500">เคสเสี่ยง MALA จะปรากฏที่นี่หลังเจ้าหน้าที่คัดกรอง</p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {visibleCases.map((patient) => (
                <li key={patient.id} className="p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-800">
                        <UserRound className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">{patient.name}</h3>
                        <p className="mt-0.5 text-sm text-zinc-500">HN {patient.citizenId} · eGFR {patient.egfr} · คะแนน {patient.riskScore ?? '—'}</p>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-700">{patient.cpgGuideline || 'คัดกรองพบความเสี่ยง MALA โปรดติดตามตามแนวทางหน่วยงาน'}</p>
                        <p className="mt-1 text-xs text-zinc-400">คัดกรองโดย {patient.screenedBy || 'ไม่ระบุ'}{patient.updatedAt ? ` · ${patient.updatedAt}` : ''}</p>
                      </div>
                    </div>
                    {queueView === 'pending' ? (
                      <div className="flex shrink-0 gap-2">
                        {patient.careManagerStatus !== 'InProgress' && (
                          <button onClick={() => updateCase(patient, 'InProgress')} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium hover:bg-zinc-50">รับดำเนินการ</button>
                        )}
                        <button onClick={() => updateCase(patient, 'Resolved')} className="rounded-lg bg-[#0E5C33] px-3 py-2 text-sm font-medium text-white hover:bg-[#0A431F]">จัดการแล้ว</button>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5" /> จัดการแล้ว
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-expanded={expandedPatientId === patient.id}
                    onClick={() => setExpandedPatientId((current) => current === patient.id ? null : patient.id)}
                    className="mt-4 ml-[52px] inline-flex items-center gap-1.5 text-sm font-medium text-[#0E5C33] hover:underline"
                  >
                    {expandedPatientId === patient.id ? <>ซ่อนรายละเอียด <ChevronUp className="h-4 w-4" /></> : <>ดูประวัติและรายละเอียด <ChevronDown className="h-4 w-4" /></>}
                  </button>
                  {expandedPatientId === patient.id && (
                    <div className="mt-4 ml-[52px] space-y-4 rounded-xl bg-zinc-50 p-4">
                      <section>
                        <h4 className="text-sm font-semibold">ข้อมูลผู้ป่วย</h4>
                        <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                          <div><dt className="inline text-zinc-500">HN: </dt><dd className="inline">{patient.citizenId || '—'}</dd></div>
                          <div><dt className="inline text-zinc-500">อายุ/เพศ: </dt><dd className="inline">{patient.age ?? '—'} ปี / {patient.gender || 'ไม่ระบุ'}</dd></div>
                          <div><dt className="inline text-zinc-500">วันเกิด: </dt><dd className="inline">{patient.birthDate || 'ไม่ระบุ'}</dd></div>
                          <div><dt className="inline text-zinc-500">พื้นที่/รพ.สต.: </dt><dd className="inline">{patient.screeningArea || 'ไม่ระบุ'}</dd></div>
                          <div><dt className="inline text-zinc-500">ส่วนสูง/น้ำหนัก: </dt><dd className="inline">{patient.height ? `${patient.height} ซม.` : 'ไม่ระบุ'} / {patient.weight ? `${patient.weight} กก.` : 'ไม่ระบุ'}</dd></div>
                          <div><dt className="inline text-zinc-500">BMI: </dt><dd className="inline">{patient.bmi ?? 'ไม่ระบุ'}</dd></div>
                          <div><dt className="inline text-zinc-500">eGFR / Metformin: </dt><dd className="inline">{patient.egfr ?? '—'} / {patient.metforminDose || 'ไม่ระบุ'} มก./วัน</dd></div>
                        </dl>
                      </section>
                      <section>
                        <h4 className="text-sm font-semibold">ปัจจัยที่พบจากการคัดกรองล่าสุด</h4>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-700">
                          {[patient.hasDehydration && 'ขาดน้ำ/อาเจียน/ท้องเสีย', patient.poorIntake && 'ขาดอาหารชั่วคราว', patient.bingeDrinking && 'ดื่มหนักเป็นครั้งคราว', patient.highWeeklyAlcohol && 'ดื่มแอลกอฮอล์ปริมาณสูงต่อสัปดาห์', patient.painMedication && 'ใช้ยาแก้ปวดกลุ่ม NSAIDs', patient.supplementOrHerbal && 'ใช้อาหารเสริมหรือสมุนไพร'].filter(Boolean).join(' · ') || 'ไม่พบปัจจัยที่บันทึกไว้'}
                        </p>
                      </section>
                      <section>
                        <h4 className="text-sm font-semibold">ประวัติการคัดกรอง ({patient.screeningHistory?.length || 0} ครั้ง)</h4>
                        {patient.screeningHistory?.length ? (
                          <ol className="mt-2 space-y-2">
                            {[...patient.screeningHistory].reverse().map((record, index) => (
                              <li key={record.id || `${record.screenedAt}-${index}`} className="rounded-lg border border-zinc-200 bg-white p-3 text-sm">
                                <p className="font-medium">{new Date(record.screenedAt).toLocaleString('th-TH')} · {record.dosePassed ? 'ขนาดยาผ่าน' : 'ส่งแพทย์ทบทวนขนาดยา'}</p>
                                <p className="mt-1 text-zinc-600">พื้นที่ {record.screeningArea || 'ไม่ระบุ'} · eGFR {record.egfr ?? '—'} · Metformin {record.metforminDose || 'ไม่ระบุ'} มก./วัน</p>
                                {record.riskScore !== undefined && <p className="mt-1 text-zinc-600">คะแนน MALA {record.riskScore} · {record.riskLevel || 'ยังไม่มีระดับความเสี่ยง'} · BMI {record.bmi ?? '—'}</p>}
                                <p className="mt-1 text-xs leading-relaxed text-zinc-500">{[record.hasDehydration && 'ขาดน้ำ/อาเจียน/ท้องเสีย', record.poorIntake && 'ขาดอาหารชั่วคราว', record.bingeDrinking && 'ดื่มหนักเป็นครั้งคราว', record.highWeeklyAlcohol && 'ดื่มปริมาณสูงต่อสัปดาห์', record.painMedication && 'ยาแก้ปวด NSAIDs', record.supplementOrHerbal && 'อาหารเสริม/สมุนไพร'].filter(Boolean).join(' · ') || 'ไม่มีปัจจัยกระตุ้นที่บันทึกไว้'}</p>
                              </li>
                            ))}
                          </ol>
                        ) : <p className="mt-2 text-sm text-zinc-500">ยังไม่มีประวัติการคัดกรองในระบบ</p>}
                      </section>
                    </div>
                  )}
                  {patient.careManagerStatus === 'InProgress' && queueView === 'pending' && (
                    <p className="mt-3 ml-[52px] text-xs font-medium text-sky-700">กำลังดำเนินการ</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        </>}
      </main>
    </div>
  );
};

export default CareManagerScreen;
