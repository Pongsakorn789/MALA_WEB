import React, { useState } from 'react';
import type { Patient } from '../../../types';
import { CheckCircle2, ChevronRight } from 'lucide-react';

interface OverviewTabProps {
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
}

type QueueTab = 'pending' | 'completed';

export const OverviewTab: React.FC<OverviewTabProps> = ({ patients, onSelectPatient }) => {
  const [activeQueueTab, setActiveQueueTab] = useState<QueueTab>('pending');

  // 1. เคสฉุกเฉินที่ยังรอแพทย์สั่งการรักษา (ยังไม่มีคำสั่ง doctorOrder และสถานะ Escalated)
  const pendingCases = patients.filter(
    (p) => p.riskLevel === 'Red' && p.status === 'Escalated' && !p.doctorOrder
  );

  // 2. เคสที่แพทย์สั่งการรักษาและตอบกลับ รพ.สต. เรียบร้อยแล้ว
  const completedCases = patients.filter((p) => p.doctorOrder || p.status === 'Resolved');

  // 3. สัดส่วนเคสที่ส่งต่อมาแล้วแพทย์ปรับยาเรียบร้อย (คำนวณจากข้อมูลจริง)
  const totalReferred = pendingCases.length + completedCases.length;
  const handledRate =
    totalReferred > 0 ? Math.round((completedCases.length / totalReferred) * 100) : null;

  const tabs: { value: QueueTab; label: string; count: number }[] = [
    { value: 'pending', label: 'รอสั่งการรักษา', count: pendingCases.length },
    { value: 'completed', label: 'สั่งยาแล้ว', count: completedCases.length },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 font-sans text-sm text-zinc-900">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">ภาพรวมการเฝ้าระวัง MALA</h2>
        <p className="text-zinc-500">เคสเสี่ยงสูงที่ส่งต่อจากเครือข่าย รพ.สต. ถึง รพ.ศูนย์</p>
      </header>

      {/* สถิติ */}
      <section className="grid grid-cols-1 divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <p className="text-xs text-zinc-500">รอพิจารณาปรับยา</p>
          <p
            className={`mt-1 font-mono text-3xl font-semibold ${
              pendingCases.length > 0 ? 'text-red-600' : 'text-zinc-900'
            }`}
          >
            {pendingCases.length}
            <span className="ml-1.5 font-sans text-sm font-normal text-zinc-400">ราย</span>
          </p>
          <p className="mt-0.5 text-xs text-zinc-400">เคสฉุกเฉิน (Red Tier)</p>
        </div>

        <div className="p-5">
          <p className="text-xs text-zinc-500">ปรับยาแล้ว</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-[#0B6B38]">
            {completedCases.length}
            <span className="ml-1.5 font-sans text-sm font-normal text-zinc-400">ราย</span>
          </p>
          <p className="mt-0.5 text-xs text-zinc-400">ส่งคำสั่งกลับ รพ.สต. สำเร็จ</p>
        </div>

        <div className="p-5">
          <p className="text-xs text-zinc-500">อัตราการปรับยา</p>
          <p className="mt-1 font-mono text-3xl font-semibold">
            {handledRate === null ? '—' : handledRate}
            {handledRate !== null && (
              <span className="ml-1 font-sans text-sm font-normal text-zinc-400">%</span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-zinc-400">
            {completedCases.length} จาก {totalReferred} เคสที่ส่งต่อ
          </p>
        </div>
      </section>

      {/* คิวผู้ป่วย */}
      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="flex gap-6 border-b border-zinc-100 px-5" role="tablist" aria-label="คิวผู้ป่วย">
          {tabs.map((t) => {
            const active = activeQueueTab === t.value;
            return (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveQueueTab(t.value)}
                className={`-mb-px flex items-center gap-2 border-b-2 py-3.5 font-medium transition focus-visible:outline-none ${
                  active
                    ? 'border-zinc-900 text-zinc-900'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {t.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    t.value === 'pending' && t.count > 0 && active
                      ? 'bg-red-50 text-red-700'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {activeQueueTab === 'pending' ? (
          pendingCases.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-center text-zinc-400">
              <CheckCircle2 className="h-9 w-9 text-emerald-600/70" strokeWidth={1.5} />
              <p className="font-medium text-zinc-600">ไม่มีเคสค้างรอสั่งการรักษา</p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {pendingCases.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onSelectPatient(p.id)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-zinc-50 focus-visible:bg-zinc-50 focus-visible:outline-none"
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden />

                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-semibold">{p.name}</span>
                        <span className="font-mono text-xs text-zinc-400">{p.citizenId}</span>
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-zinc-500">
                        <span>
                          eGFR <span className="font-mono font-semibold text-red-600">{p.egfr}</span> mL/min
                        </span>
                        <span aria-hidden>·</span>
                        <span>ทานยา {p.metforminDose}</span>
                        {p.hasDehydration && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                            ขาดน้ำ
                          </span>
                        )}
                      </p>
                    </div>

                    <span className="flex shrink-0 items-center gap-1 text-[13px] font-medium text-[#0B6B38]">
                      <span className="hidden sm:inline">สั่งจ่ายยา</span>
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : completedCases.length === 0 ? (
          <p className="py-14 text-center text-zinc-400">ยังไม่มีประวัติการสั่งยา</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {completedCases.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onSelectPatient(p.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-zinc-50 focus-visible:bg-zinc-50 focus-visible:outline-none"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{p.name}</p>
                    <p className="mt-0.5 truncate text-[13px] text-zinc-500">
                      {p.doctorOrder?.split('|')[0].trim() || 'ปรับยาเรียบร้อย'}
                    </p>
                  </div>

                  <span className="hidden shrink-0 text-xs text-zinc-400 sm:block">
                    {p.updatedAt || 'วันนี้'}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-[13px] font-medium text-zinc-500">
                    <span className="hidden sm:inline">ดูคำสั่งเดิม</span>
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default OverviewTab;