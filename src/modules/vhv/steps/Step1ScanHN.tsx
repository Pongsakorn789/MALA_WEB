import React, { useState } from 'react';
import type { Patient } from '../../../types';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ScanLine,
  Search,
  Shuffle,
} from 'lucide-react';

interface Step1ScanHNProps {
  patients: Patient[];
  currentPatient?: Patient;
  onSelectPatient: (patientId: string) => void;
  onConfirm: () => void;
}

// ระดับความเสี่ยง → ข้อความ + สี (ใช้ร่วมกันทั้งรายการค้นหาและผลสแกน)
const riskInfo = (level?: string) => {
  if (level === 'Red') return { label: 'เสี่ยงสูง', dot: 'bg-red-500', soft: 'bg-red-50 text-red-700' };
  if (level === 'Yellow')
    return { label: 'เสี่ยงปานกลาง', dot: 'bg-amber-500', soft: 'bg-amber-50 text-amber-700' };
  return { label: 'ความเสี่ยงต่ำ', dot: 'bg-emerald-500', soft: 'bg-emerald-50 text-emerald-700' };
};

const initialOf = (name: string) => name.trim().charAt(0);

export const Step1ScanHN: React.FC<Step1ScanHNProps> = ({
  patients,
  currentPatient,
  onSelectPatient,
  onConfirm,
}) => {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'confirmed'>('idle');
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // สุ่มผู้ป่วยเมื่อกดปุ่มสแกน (จำลองการอ่านสมุด)
  const startScan = () => {
    setScanState('scanning');

    window.setTimeout(() => {
      if (patients.length > 0) {
        const randomIndex = Math.floor(Math.random() * patients.length);
        onSelectPatient(patients[randomIndex].id);
      }
      setScanState('confirmed');
    }, 700);
  };

  // ค้นหาจากชื่อ / เลขบัตรประชาชน / Patient ID
  const filteredPatients = patients.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      p.name.toLowerCase().includes(query) ||
      p.citizenId.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query)
    );
  });

  const isScanning = scanState === 'scanning';
  const showScanner = scanState !== 'confirmed' && !showManualSearch;
  const showSearch = scanState !== 'confirmed' && showManualSearch;

  return (
    <div className="space-y-5 font-sans text-sm text-zinc-900">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">สแกน HN ผู้ป่วย</h2>
        <p className="leading-relaxed text-zinc-500">
          ส่องกล้องไปที่หน้าสมุดหรือบัตรผู้ป่วย ระบบจะอ่านเลข HN ให้อัตโนมัติ
        </p>
      </header>

      {/* ===== สแกน ===== */}
      {showScanner && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={startScan}
            disabled={isScanning || patients.length === 0}
            aria-busy={isScanning}
            className="group relative flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl bg-zinc-50 text-zinc-600 transition hover:bg-emerald-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5C33]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {/* มุมกรอบช่องเล็งกล้อง */}
            <span className="pointer-events-none absolute left-5 top-5 h-6 w-6 rounded-tl-lg border-l-2 border-t-2 border-[#0E5C33]/60" />
            <span className="pointer-events-none absolute right-5 top-5 h-6 w-6 rounded-tr-lg border-r-2 border-t-2 border-[#0E5C33]/60" />
            <span className="pointer-events-none absolute bottom-5 left-5 h-6 w-6 rounded-bl-lg border-b-2 border-l-2 border-[#0E5C33]/60" />
            <span className="pointer-events-none absolute bottom-5 right-5 h-6 w-6 rounded-br-lg border-b-2 border-r-2 border-[#0E5C33]/60" />

            {isScanning ? (
              <>
                <Loader2 className="h-9 w-9 animate-spin text-[#0E5C33]" />
                <span className="font-medium">กำลังอ่านเลข HN...</span>
              </>
            ) : (
              <>
                <ScanLine className="h-9 w-9 text-[#0E5C33]" />
                <span className="text-base font-semibold text-zinc-900">แตะเพื่อสแกน</span>
                <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Shuffle className="h-3 w-3" />
                  โหมดจำลอง · สุ่มผู้ป่วยจากฐานข้อมูล รพ.
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowManualSearch(true)}
            disabled={isScanning}
            className="w-full py-2 text-[13px] font-medium text-[#0E5C33] transition hover:underline disabled:opacity-50"
          >
            ค้นหาด้วยชื่อหรือเลขบัตรประชาชนแทน
          </button>
        </div>
      )}

      {/* ===== ค้นหาเอง ===== */}
      {showSearch && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              setShowManualSearch(false);
              setSearchQuery('');
            }}
            className="inline-flex items-center gap-1.5 text-zinc-500 transition hover:text-[#0E5C33]"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปสแกน
          </button>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ชื่อ เลขบัตร ปชช. หรือ Patient ID"
              aria-label="ค้นหาผู้ป่วย"
              className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-4 outline-none transition placeholder:text-zinc-400 focus:border-[#0E5C33] focus:ring-2 focus:ring-[#0E5C33]/15"
            />
          </div>

          <p className="px-1 text-xs text-zinc-400">
            {searchQuery.trim()
              ? `พบ ${filteredPatients.length} จาก ${patients.length} คน`
              : `ผู้ป่วยทั้งหมด ${patients.length} คน`}
          </p>

          <div className="max-h-80 overflow-y-auto rounded-2xl border border-zinc-200 bg-white">
            {filteredPatients.length === 0 ? (
              <p className="py-10 text-center text-zinc-400">ไม่พบรายชื่อผู้ป่วย</p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {filteredPatients.map((p) => {
                  const r = riskInfo(p.riskLevel);
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectPatient(p.id);
                          setScanState('confirmed');
                          setShowManualSearch(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-zinc-50 focus-visible:bg-zinc-50 focus-visible:outline-none"
                      >
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0E5C33] text-sm font-semibold text-white"
                          aria-hidden
                        >
                          {initialOf(p.name)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{p.name}</p>
                          <p className="truncate text-xs text-zinc-500">
                            <span className="font-mono">{p.citizenId}</span> · อายุ {p.age} ปี
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${r.soft}`}
                        >
                          {r.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ===== ยืนยันผู้ป่วย ===== */}
      {scanState === 'confirmed' && currentPatient && (
        <div className="space-y-4">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              อ่านข้อมูลจากสมุดประจำตัวได้แล้ว
            </p>

            <div className="mt-4 flex items-center gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0E5C33] text-lg font-semibold text-white"
                aria-hidden
              >
                {initialOf(currentPatient.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold tracking-tight">{currentPatient.name}</p>
                <p className="text-zinc-500">
                  HN <span className="font-mono text-zinc-800">{currentPatient.citizenId}</span> · อายุ{' '}
                  {currentPatient.age} ปี
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 divide-x divide-zinc-100 border-t border-zinc-100 pt-4">
              <div>
                <p className="text-xs text-zinc-500">ระดับความเสี่ยง</p>
                <p className="mt-1.5 flex items-center gap-2 font-semibold">
                  <span className={`h-2 w-2 rounded-full ${riskInfo(currentPatient.riskLevel).dot}`} />
                  {riskInfo(currentPatient.riskLevel).label}
                </p>
              </div>
              <div className="pl-4">
                <p className="text-xs text-zinc-500">eGFR ล่าสุด (ฐานข้อมูล รพ.)</p>
                <p className="mt-1 font-mono text-xl font-semibold leading-none">
                  {currentPatient.egfr}
                  <span className="ml-1 font-sans text-xs font-normal text-zinc-400">mL/min</span>
                </p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-5 gap-2.5">
            <button
              type="button"
              onClick={startScan}
              className="col-span-2 flex h-12 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 font-medium text-zinc-600 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5C33]/30"
            >
              <Shuffle className="h-4 w-4" />
              สแกนใหม่
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="col-span-3 h-12 rounded-xl bg-[#0E5C33] font-medium text-white transition hover:bg-[#0A431F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5C33]/40 focus-visible:ring-offset-2"
            >
              ถูกต้อง · ถัดไป
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step1ScanHN;