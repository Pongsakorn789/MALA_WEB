import React, { useEffect, useRef, useState } from 'react';
import type { Patient } from '../../../types';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Loader2,
  RotateCcw,
  ScanLine,
  Search,
  X,
} from 'lucide-react';

interface Step1ScanHNProps {
  patients: Patient[];
  currentPatient?: Patient;
  onSelectPatient: (patientId: string) => void;
  onConfirm: () => void;
}

const riskInfo = (level?: string) => {
  if (level === 'Red') return { label: 'เสี่ยงสูง', dot: 'bg-red-500', soft: 'bg-red-50 text-red-700' };
  if (level === 'Yellow') return { label: 'เสี่ยงปานกลาง', dot: 'bg-amber-500', soft: 'bg-amber-50 text-amber-700' };
  return { label: 'ความเสี่ยงต่ำ', dot: 'bg-emerald-500', soft: 'bg-emerald-50 text-emerald-700' };
};

const initialOf = (name: string) => name.trim().charAt(0);
const normalizeCode = (value: string) => value.normalize('NFKC').toUpperCase().replace(/[^A-Z0-9]/g, '');

const getCodeCandidates = (raw: string) => {
  const values = [raw.trim()];
  const labeledCode = raw.match(/(?:HN|PATIENT[_ -]?ID|CITIZEN[_ -]?ID|ID)\s*[:=#]\s*([A-Z0-9-]+)/i)?.[1];
  if (labeledCode) values.push(labeledCode);

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    for (const key of ['hn', 'patientId', 'patient_id', 'citizenId', 'citizen_id', 'id']) {
      const value = parsed[key];
      if (typeof value === 'string' || typeof value === 'number') values.push(String(value));
    }
  } catch {
    // Most printed HN barcodes contain a plain value rather than JSON.
  }

  try {
    const url = new URL(raw);
    for (const key of ['hn', 'patientId', 'patient_id', 'citizenId', 'id']) {
      const value = url.searchParams.get(key);
      if (value) values.push(value);
    }
  } catch {
    // The scanned value may not be a URL.
  }

  return [...new Set(values.map(normalizeCode).filter(Boolean))];
};

export const Step1ScanHN: React.FC<Step1ScanHNProps> = ({
  patients,
  currentPatient,
  onSelectPatient,
  onConfirm,
}) => {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'confirmed'>('idle');
  const [scanOrigin, setScanOrigin] = useState<'camera' | 'manual' | null>(null);
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scannerError, setScannerError] = useState('');
  const [scannedValue, setScannedValue] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const handledResultRef = useRef(false);

  useEffect(() => {
    if (scanState !== 'scanning' || !videoRef.current) return;
    let cancelled = false;
    let activeControls: { stop: () => void } | null = null;

    const beginCamera = async () => {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        if (cancelled || !videoRef.current) return;

        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } }, audio: false },
          videoRef.current,
          (result, _error, callbackControls) => {
          if (!result || handledResultRef.current || cancelled) return;
          handledResultRef.current = true;
          const raw = result.getText();
          callbackControls.stop();
          activeControls = null;
          controlsRef.current = null;
          selectScannedCode(raw);
          },
        );

        if (cancelled || handledResultRef.current) controls.stop();
        else {
          activeControls = controls;
          controlsRef.current = controls;
        }
      } catch (error) {
        if (cancelled) return;
        setScanState('idle');
        setScannerError(error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'ยังไม่ได้อนุญาตให้ใช้กล้อง กรุณาอนุญาตสิทธิ์กล้องในเบราว์เซอร์แล้วลองอีกครั้ง'
          : 'เปิดกล้องไม่สำเร็จ ตรวจสอบว่ามีกล้องและไม่มีแอปอื่นใช้งานอยู่');
      }
    };

    void beginCamera();
    return () => {
      cancelled = true;
      activeControls?.stop();
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }
    };
  // Scanner is initialized when the preview video element mounts and stops when the view closes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanState, patients]);

  const stopScan = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setScanState('idle');
  };

  const selectScannedCode = (raw: string) => {
    const candidates = new Set(getCodeCandidates(raw));
    const match = patients.find((patient) =>
      candidates.has(normalizeCode(patient.citizenId)) || candidates.has(normalizeCode(patient.id)),
    );

    if (match) {
      onSelectPatient(match.id);
      setScanOrigin('camera');
      setScanState('confirmed');
      setShowManualSearch(false);
      setScannerError('');
      return;
    }

    setScannedValue(raw);
    setSearchQuery(raw);
    setScannerError('อ่านรหัสได้แล้ว แต่ไม่พบ HN นี้ในรายชื่อผู้ป่วยที่เชื่อมอยู่');
    setShowManualSearch(true);
    setScanState('idle');
  };

  const startScan = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setScannerError('เบราว์เซอร์นี้เปิดกล้องไม่ได้ กรุณาใช้ HTTPS หรือ localhost แล้วค้นหารายชื่อแทน');
      return;
    }
    handledResultRef.current = false;
    setScannerError('');
    setScannedValue('');
    setScanState('scanning');
  };

  const normalizedQuery = normalizeCode(searchQuery);
  const filteredPatients = patients.filter((patient) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return patient.name.toLowerCase().includes(query)
      || patient.citizenId.toLowerCase().includes(query)
      || patient.id.toLowerCase().includes(query)
      || normalizeCode(patient.citizenId).includes(normalizedQuery)
      || normalizeCode(patient.id).includes(normalizedQuery);
  });

  const isScanning = scanState === 'scanning';
  const showScanner = scanState !== 'confirmed' && !showManualSearch;
  const showSearch = scanState !== 'confirmed' && showManualSearch;

  return (
    <div className="space-y-5 font-sans text-sm text-zinc-900">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">สแกน HN ผู้ป่วย</h2>
        <p className="leading-relaxed text-zinc-500">เปิดกล้องเพื่อสแกน QR หรือบาร์โค้ดบนบัตร/สมุดผู้ป่วย แล้วค้นหา HN ในรายชื่อที่เชื่อมอยู่</p>
      </header>

      {showScanner && (
        <div className="space-y-3">
          {isScanning ? (
            <div className="relative overflow-hidden rounded-2xl bg-black">
              <video ref={videoRef} autoPlay muted playsInline className="aspect-[4/3] w-full object-cover" />
              <span className="pointer-events-none absolute left-5 top-5 h-7 w-7 rounded-tl-lg border-l-2 border-t-2 border-white" />
              <span className="pointer-events-none absolute right-5 top-5 h-7 w-7 rounded-tr-lg border-r-2 border-t-2 border-white" />
              <span className="pointer-events-none absolute bottom-5 left-5 h-7 w-7 rounded-bl-lg border-b-2 border-l-2 border-white" />
              <span className="pointer-events-none absolute bottom-5 right-5 h-7 w-7 rounded-br-lg border-b-2 border-r-2 border-white" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-4 py-3 text-white">
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />กำลังสแกน รหัสจะถูกอ่านเมื่ออยู่ในกรอบ</span>
                <button type="button" onClick={stopScan} className="rounded-lg bg-white/15 p-2 hover:bg-white/25" aria-label="ปิดกล้อง"><X className="h-4 w-4" /></button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={startScan} disabled={patients.length === 0}
              className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl bg-zinc-50 text-zinc-600 transition hover:bg-emerald-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5C33]/40 focus-visible:ring-offset-2 disabled:opacity-50">
              <ScanLine className="h-10 w-10 text-[#0E5C33]" />
              <span className="text-base font-semibold text-zinc-900">เปิดกล้องและสแกน HN</span>
              <span className="flex items-center gap-1.5 text-xs text-zinc-400"><Camera className="h-3.5 w-3.5" />ต้องอนุญาตให้เว็บไซต์ใช้กล้อง</span>
            </button>
          )}

          {scannerError && <p role="alert" className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">{scannerError}</p>}

          <button type="button" onClick={() => { stopScan(); setShowManualSearch(true); setScanOrigin(null); }}
            className="w-full py-2 text-[13px] font-medium text-[#0E5C33] transition hover:underline">
            ค้นหาด้วยชื่อ HN หรือเลขบัตรแทน
          </button>
        </div>
      )}

      {showSearch && (
        <div className="space-y-3">
          <button type="button" onClick={() => { setShowManualSearch(false); setSearchQuery(''); setScannerError(''); setScannedValue(''); }}
            className="inline-flex items-center gap-1.5 text-zinc-500 transition hover:text-[#0E5C33]">
            <ArrowLeft className="h-4 w-4" />กลับไปสแกน
          </button>
          {scannerError && <p role="alert" className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">{scannerError}{scannedValue && <span className="mt-1 block font-mono">รหัสที่อ่านได้: {scannedValue}</span>}</p>}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input type="search" autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ชื่อ HN เลขบัตร หรือ Patient ID" aria-label="ค้นหาผู้ป่วย"
              className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-4 outline-none transition placeholder:text-zinc-400 focus:border-[#0E5C33] focus:ring-2 focus:ring-[#0E5C33]/15" />
          </div>
          <p className="px-1 text-xs text-zinc-400">{searchQuery.trim() ? `พบ ${filteredPatients.length} จาก ${patients.length} คน` : `ผู้ป่วยทั้งหมด ${patients.length} คน`}</p>
          <div className="max-h-80 overflow-y-auto rounded-2xl border border-zinc-200 bg-white">
            {filteredPatients.length === 0 ? <p className="py-10 text-center text-zinc-400">ไม่พบรายชื่อผู้ป่วย</p> : (
              <ul className="divide-y divide-zinc-100">
                {filteredPatients.map((patient) => {
                  const status = riskInfo(patient.riskLevel);
                  return <li key={patient.id}>
                    <button type="button" onClick={() => { onSelectPatient(patient.id); setScanOrigin('manual'); setScanState('confirmed'); setShowManualSearch(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-zinc-50 focus-visible:bg-zinc-50 focus-visible:outline-none">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0E5C33] text-sm font-semibold text-white" aria-hidden>{initialOf(patient.name)}</div>
                      <div className="min-w-0 flex-1"><p className="truncate font-semibold">{patient.name}</p><p className="truncate text-xs text-zinc-500"><span className="font-mono">{patient.citizenId}</span> · อายุ {patient.age} ปี</p></div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${status.soft}`}>{status.label}</span>
                    </button>
                  </li>;
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {scanState === 'confirmed' && currentPatient && (
        <div className="space-y-4">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-4 w-4" />{scanOrigin === 'camera' ? 'สแกนและจับคู่ HN สำเร็จ' : 'เลือกผู้ป่วยจากรายชื่อแล้ว'}</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0E5C33] text-lg font-semibold text-white" aria-hidden>{initialOf(currentPatient.name)}</div>
              <div className="min-w-0"><p className="truncate text-lg font-semibold tracking-tight">{currentPatient.name}</p><p className="text-zinc-500">HN <span className="font-mono text-zinc-800">{currentPatient.citizenId}</span> · อายุ {currentPatient.age} ปี</p></div>
            </div>
            <div className="mt-5 grid grid-cols-2 divide-x divide-zinc-100 border-t border-zinc-100 pt-4">
              <div><p className="text-xs text-zinc-500">ระดับความเสี่ยงเดิม</p><p className="mt-1.5 flex items-center gap-2 font-semibold"><span className={`h-2 w-2 rounded-full ${riskInfo(currentPatient.riskLevel).dot}`} />{riskInfo(currentPatient.riskLevel).label}</p></div>
              <div className="pl-4"><p className="text-xs text-zinc-500">eGFR ล่าสุด</p><p className="mt-1 font-mono text-xl font-semibold leading-none">{currentPatient.egfr}<span className="ml-1 font-sans text-xs font-normal text-zinc-400">mL/min</span></p></div>
            </div>
          </section>
          <div className="grid grid-cols-5 gap-2.5">
            <button type="button" onClick={() => { setScanState('idle'); setScanOrigin(null); setScannerError(''); }} className="col-span-2 flex h-12 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 font-medium text-zinc-600 transition hover:bg-zinc-50"><RotateCcw className="h-4 w-4" />สแกนใหม่</button>
            <button type="button" onClick={onConfirm} className="col-span-3 h-12 rounded-xl bg-[#0E5C33] font-medium text-white transition hover:bg-[#0A431F]">ถูกต้อง · ถัดไป</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step1ScanHN;
