import React, { useState } from 'react';
import type { Patient } from '../../../types';
import { ScanLine, Loader2, Search, User, ShieldCheck, Shuffle } from 'lucide-react';

interface Step1ScanHNProps {
  pendingPatients: Patient[];
  currentPatient?: Patient;
  onSelectPatient: (patientId: string) => void;
  onConfirm: () => void;
}

export const Step1ScanHN: React.FC<Step1ScanHNProps> = ({
  pendingPatients,
  currentPatient,
  onSelectPatient,
  onConfirm,
}) => {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'confirmed'>('idle');
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ฟังก์ชันสุ่มผู้ป่วยเมื่อแตะสแกน
  const startScan = () => {
    setScanState('scanning');
    window.setTimeout(() => {
      if (pendingPatients.length > 0) {
        // สุ่มรายชื่อผู้ป่วยจากคิว
        const randomIndex = Math.floor(Math.random() * pendingPatients.length);
        const randomPatient = pendingPatients[randomIndex];
        onSelectPatient(randomPatient.id);
      }
      setScanState('confirmed');
    }, 700);
  };

  const filteredPatients = pendingPatients.filter(
    (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.citizenId.includes(searchQuery)
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[15px] font-semibold text-[#17301F]">สแกน HN จากสมุดประจำตัวผู้ป่วย</h2>
        <p className="text-[12.5px] text-[#6B786D] mt-0.5">
          ส่องกล้องไปที่หน้าสมุดหรือบัตรผู้ป่วย เพื่อให้ระบบอ่านเลข HN ให้อัตโนมัติ[cite: 8]
        </p>
      </div>

      {scanState !== 'confirmed' && !showManualSearch && (
        <>
          <button
            type="button"
            onClick={startScan}
            disabled={scanState === 'scanning'}
            className="w-full aspect-[4/3] rounded-lg border-2 border-dashed border-[#C7D0C3] bg-[#F6F4EF] flex flex-col items-center justify-center gap-2 text-[#5C6B5F] hover:border-[#0E5C33] transition"
          >
            {scanState === 'scanning' ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-[#0E5C33]" />
                <span className="text-[13px] font-medium">กำลังอ่านค่าและสุ่มดึง HN...</span>
              </>
            ) : (
              <>
                <ScanLine className="w-8 h-8 text-[#0E5C33]" />
                <span className="text-[13.5px] font-semibold text-center px-4 text-[#17301F]">
                  แตะเพื่อสแกน (จำลองสุ่มอ่านสมุดคนไข้)
                </span>
                <span className="text-[11.5px] text-[#8A968C] flex items-center gap-1">
                  <Shuffle className="w-3 h-3" /> สุ่มรายชื่อผู้ป่วยจากฐานข้อมูล รพ.
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowManualSearch(true)}
            className="w-full text-center text-[12.5px] text-[#0E5C33] font-medium py-1 hover:underline"
          >
            หรือค้นหาผู้ป่วยด้วยชื่อ / เลขบัตร ปชช. แทน
          </button>
        </>
      )}

      {showManualSearch && scanState !== 'confirmed' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA394]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อ หรือ เลขบัตร ปชช..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F6F4EF] border border-[#E1E4DB] rounded-md text-sm outline-none focus:border-[#0E5C33]"
            />
          </div>
          <div className="max-h-56 overflow-y-auto border border-[#E1E4DB] rounded-md divide-y divide-[#EEF0EA]">
            {filteredPatients.length === 0 ? (
              <p className="text-sm text-[#8A968C] text-center py-6">ไม่พบรายชื่อผู้ป่วย</p>
            ) : (
              filteredPatients.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelectPatient(p.id);
                    setScanState('confirmed');
                    setShowManualSearch(false);
                  }}
                  className="w-full text-left px-3.5 py-3 flex items-center gap-3 hover:bg-[#F6F4EF] transition"
                >
                  <div className="w-8 h-8 rounded-full bg-[#F3F7EC] text-[#0E5C33] flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate text-[#17301F]">{p.name}</p>
                    <p className="text-[11.5px] text-[#8A968C]">เลข ปชช: {p.citizenId}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {scanState === 'confirmed' && currentPatient && (
        <div className="space-y-3">
          <div className="rounded-md bg-[#17301F] text-white p-4 space-y-1 shadow">
            <div className="flex justify-between items-center text-[11px] text-white/70">
              <span>AI READER (ตรวจพบข้อมูลสมุดประจำตัว)</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[14px]">
              อ่านค่าได้เป็น HN <span className="font-semibold text-emerald-300 font-mono">{currentPatient.citizenId}</span>[cite: 8]
            </p>
            <p className="text-[13px] text-white/90">
              {currentPatient.name} · อายุ {currentPatient.age} ปี[cite: 8]
            </p>
          </div>

          <div className="p-3 bg-[#EBF3FB] border border-[#C5DCF5] rounded-md flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-[#18538A] block">eGFR ล่าสุด (จากฐานข้อมูล รพ.)[cite: 8]</span>
              <span className="text-[11px] text-[#597899]">ดึงค่าแล็ปล่าสุดให้อัตโนมัติ</span>
            </div>
            <span className="text-base font-extrabold text-[#18538A] bg-white px-2.5 py-1 rounded border border-[#C5DCF5] font-mono">
              {currentPatient.egfr} mL/min
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={startScan}
              className="h-11 rounded-md border border-[#DCE3DA] text-[13px] font-semibold text-[#5C6B5F] hover:bg-[#F6F4EF] transition flex items-center justify-center gap-1.5"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>สุ่มสแกนใหม่</span>
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="h-11 rounded-md bg-[#0E5C33] hover:bg-[#0A431F] text-white text-[13px] font-semibold transition"
            >
              ใช่ ถูกต้อง (ถัดไป)[cite: 8]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};