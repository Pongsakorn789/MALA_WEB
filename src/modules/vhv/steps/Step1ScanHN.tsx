import React, { useEffect, useRef, useState } from 'react';
import type { Patient } from '../../../types';
import { calculateAgeFromBirthDate } from '../../../utils/patientData';
import { parseMetforminDoseMg } from '../../../utils/metforminGuideline';
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
  onAddPatient: (patient: Patient) => void;
  onUpdatePatient: (patient: Patient) => void;
  onSelectPatient: (patientId: string) => void;
  onConfirm: (patientOverride?: Patient) => void;
  onImportPatients: (patients: Patient[]) => Promise<{ added: number; updated: number }>;
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
  onAddPatient,
  onUpdatePatient,
  onImportPatients,
  onSelectPatient,
  onConfirm,
}) => {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'confirmed'>('idle');
  const [scanOrigin, setScanOrigin] = useState<'camera' | 'manual' | null>(null);
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visiblePatientLimit, setVisiblePatientLimit] = useState(100);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientHn, setNewPatientHn] = useState('');
  const [newPatientBirthDate, setNewPatientBirthDate] = useState('');
  const [newPatientGender, setNewPatientGender] = useState('หญิง');
  const [newPatientEgfr, setNewPatientEgfr] = useState('');
  const [newPatientDose, setNewPatientDose] = useState('');
  const [newPatientArea, setNewPatientArea] = useState('');
  const [addPatientError, setAddPatientError] = useState('');
  const [doseEntry, setDoseEntry] = useState('');
  const [importArea, setImportArea] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSummary, setImportSummary] = useState('');
  const [scannerError, setScannerError] = useState('');
  const [scannedValue, setScannedValue] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const handledResultRef = useRef(false);

  useEffect(() => {
    setDoseEntry(String(parseMetforminDoseMg(currentPatient?.metforminDose || '') ?? ''));
  }, [currentPatient?.id, currentPatient?.metforminDose]);

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
  const visiblePatients = filteredPatients.slice(0, visiblePatientLimit);

  const calculatedAge = calculateAgeFromBirthDate(newPatientBirthDate);
  const needsDoseEntry = !!currentPatient && parseMetforminDoseMg(currentPatient.metforminDose) === null;
  const confirmPatient = () => {
    if (!currentPatient) return;
    if (needsDoseEntry) {
      const dose = Number(doseEntry);
      if (!doseEntry || !Number.isFinite(dose) || dose <= 0) {
        setScannerError('กรุณากรอกขนาดยา Metformin ปัจจุบันเป็นมก./วันก่อนเริ่มประเมิน');
        return;
      }
      const updated = { ...currentPatient, metforminDose: `${dose.toLocaleString()} มก./วัน` };
      onUpdatePatient(updated);
      onConfirm(updated);
      return;
    }
    onConfirm(currentPatient);
  };
  const createPatient = (event: React.FormEvent) => {
    event.preventDefault();
    setAddPatientError('');
    const hn = newPatientHn.trim();
    if (patients.some((patient) => normalizeCode(patient.citizenId) === normalizeCode(hn))) {
      setAddPatientError('มี HN/เลขบัตรนี้ในระบบแล้ว กรุณาค้นหาและเลือกจากรายชื่อ');
      return;
    }
    if (calculatedAge === null) {
      setAddPatientError('กรุณาตรวจสอบวันเดือนปีเกิด');
      return;
    }

    const egfr = Number(newPatientEgfr);
    const dose = Number(newPatientDose);
    if (!Number.isFinite(egfr) || egfr < 0 || !Number.isFinite(dose) || dose < 0) {
      setAddPatientError('กรุณากรอก eGFR และขนาดยาเป็นตัวเลขที่ถูกต้อง');
      return;
    }

    const patient: Patient = {
      id: `P-${Date.now()}`,
      name: newPatientName.trim(),
      citizenId: hn,
      birthDate: newPatientBirthDate,
      age: calculatedAge,
      gender: newPatientGender,
      height: 0,
      egfr,
      metforminDose: `${dose.toLocaleString()} มก./วัน`,
      hasDehydration: false,
      hasAlcohol: false,
      riskLevel: 'Green',
      screeningArea: newPatientArea.trim() || undefined,
      status: 'Pending',
    };
    onAddPatient(patient);
    onSelectPatient(patient.id);
    setScanOrigin('manual');
    setScanState('confirmed');
    setShowManualSearch(false);
    setShowAddPatient(false);
  };

  const importWorkbook = async (file?: File) => {
    if (!file) return;
    setImportError('');
    setImportSummary('');
    setIsImporting(true);
    try {
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(await file.arrayBuffer(), { cellDates: false });
      let headerRow: string[] | undefined;
      let dataRows: unknown[][] = [];
      for (const sheetName of workbook.SheetNames) {
        const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], { header: 1, defval: '', raw: false });
        const headerIndex = rows.findIndex((row) => {
          const keys = row.map((value) => String(value).trim().toLowerCase());
          return keys.includes('hn') && keys.includes('name') && keys.includes('real_res');
        });
        if (headerIndex >= 0) {
          headerRow = (rows[headerIndex] as unknown[]).map((value) => String(value).trim());
          dataRows = rows.slice(headerIndex + 1) as unknown[][];
          break;
        }
      }
      if (!headerRow) throw new Error('ไม่พบหัวคอลัมน์ HN, name และ real_res ในไฟล์');

      const columnIndex = new Map(headerRow.map((name, index) => [name.toLowerCase(), index]));
      const normalizeHeader = (value: string) => value.normalize('NFKC').toLowerCase().replace(/[\s_./()\-]/g, '');
      const areaHeaderAliases = new Set([
        'area', 'screeningarea', 'pcu', 'pcuname', 'facility', 'facilityname', 'healthcenter', 'healthcentername',
        'village', 'villagename', 'พื้นที่', 'พื้นที่รพสต', 'หมู่บ้าน', 'หมู่', 'รพสต', 'ชื่อรพสต',
        'หน่วยบริการ', 'สถานบริการ', 'รพสตที่ให้บริการ', 'ชื่อหน่วยบริการ',
      ].map(normalizeHeader));
      const areaColumnIndex = headerRow.findIndex((name) => areaHeaderAliases.has(normalizeHeader(name)));
      const valueAt = (row: unknown[], key: string) => {
        const index = columnIndex.get(key);
        return index === undefined ? '' : String(row[index] ?? '').trim();
      };
      const parsedPatients: Patient[] = [];
      const patientIndexByHn = new Map<string, number>();
      let validSourceRows = 0;
      let missingAreaRows = 0;
      for (const row of dataRows) {
        const hn = valueAt(row, 'hn');
        const name = valueAt(row, 'name');
        const resultName = valueAt(row, 'result_name').toLowerCase();
        const egfr = Number(valueAt(row, 'real_res'));
        if (!hn || !name || !Number.isFinite(egfr) || egfr < 0) continue;
        if (resultName && resultName !== 'egfr') continue;
        validSourceRows += 1;
        const normalizedHn = normalizeCode(hn);
        const rawSex = valueAt(row, 'sex');
        const rawAge = Number(valueAt(row, 'age'));
        const areaFromFile = areaColumnIndex < 0 ? '' : String(row[areaColumnIndex] ?? '').trim();
        const resolvedArea = areaFromFile || importArea.trim();
        if (!resolvedArea) missingAreaRows += 1;
        const convertExcelDate = (raw: string) => {
          const match = raw.match(/^(\d{4})(\d{2})(\d{2})$/);
          if (match) {
            const year = Number(match[1]) > 2400 ? Number(match[1]) - 543 : Number(match[1]);
            return `${year}-${match[2]}-${match[3]}`;
          }
          const dayFirst = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
          if (!dayFirst) return undefined;
          const year = Number(dayFirst[3]) > 2400 ? Number(dayFirst[3]) - 543 : Number(dayFirst[3]);
          return `${year}-${dayFirst[2].padStart(2, '0')}-${dayFirst[1].padStart(2, '0')}`;
        };
        const labResultDate = convertExcelDate(valueAt(row, 'max_res_date'));
        const registeredDate = convertExcelDate(valueAt(row, 'registdate'));
        const importedPatient: Patient = {
          id: `IMPORT-${normalizedHn}`,
          name,
          citizenId: hn,
          age: Number.isFinite(rawAge) && rawAge >= 0 ? rawAge : 0,
          gender: rawSex === 'ช' || rawSex === 'ชาย' ? 'ชาย' : rawSex === 'ญ' || rawSex === 'หญิง' ? 'หญิง' : rawSex || undefined,
          height: 0,
          egfr,
          metforminDose: '',
          hasDehydration: false,
          hasAlcohol: false,
          riskLevel: 'Green',
          screeningArea: resolvedArea || undefined,
          cardId: valueAt(row, 'cardid') || undefined,
          labResultDate,
          registeredDate,
          screenedBy: 'นำเข้าจากไฟล์ Excel',
          status: 'Pending',
        };
        const existingIndex = patientIndexByHn.get(normalizedHn);
        if (existingIndex === undefined) {
          patientIndexByHn.set(normalizedHn, parsedPatients.length);
          parsedPatients.push(importedPatient);
        } else if ((importedPatient.labResultDate || '') > (parsedPatients[existingIndex].labResultDate || '')) {
          parsedPatients[existingIndex] = importedPatient;
        }
      }
      if (!parsedPatients.length) throw new Error('ไม่พบแถวข้อมูล HN และ eGFR ที่นำเข้าได้');
      if (missingAreaRows > 0) {
        throw new Error(`ยังขาดพื้นที่ ${missingAreaRows.toLocaleString()} แถว กรุณากรอกพื้นที่สำรอง แล้วเลือกไฟล์เดิมอีกครั้ง`);
      }
      const { added, updated } = await onImportPatients(parsedPatients);
      const areaDescription = areaColumnIndex >= 0
        ? `ใช้พื้นที่จากคอลัมน์ “${headerRow[areaColumnIndex]}”${importArea.trim() ? ` และพื้นที่สำรอง “${importArea.trim()}” สำหรับแถวว่าง` : ''}`
        : `ใช้พื้นที่สำรอง “${importArea.trim()}” กับทุกรายการ`;
      setImportSummary(`อ่าน ${validSourceRows.toLocaleString()} แถว · ได้ ${parsedPatients.length.toLocaleString()} ราย (รวม HN ซ้ำโดยเลือก eGFR ล่าสุด) · เพิ่มใหม่ ${added.toLocaleString()} · อัปเดต ${updated.toLocaleString()} · ${areaDescription}`);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'อ่านไฟล์ไม่สำเร็จ กรุณาตรวจสอบรูปแบบไฟล์');
    } finally {
      setIsImporting(false);
    }
  };

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

          <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
            <div>
              <h3 className="font-semibold">นำเข้ารายชื่อจาก Excel</h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">ระบบอ่าน HN, ชื่อ, เพศ, อายุ และ eGFR จากไฟล์ ถ้ามีคอลัมน์พื้นที่จะใช้พื้นที่รายแถว ถ้าไม่มีจะใช้พื้นที่สำรองกับทั้งไฟล์</p>
            </div>
            <label className="block space-y-1 text-xs font-medium text-zinc-600">พื้นที่สำรอง / รพ.สต. (ใช้เมื่อแถวใน Excel ไม่มีพื้นที่)
              <input value={importArea} onChange={(event) => setImportArea(event.target.value)} placeholder="เช่น รพ.สต. ท่าสาย หรือ หมู่ 1" className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-[#0E5C33]" />
            </label>
            <label className={`flex cursor-pointer items-center justify-center rounded-lg bg-[#0E5C33] px-4 py-3 text-sm font-medium text-white hover:bg-[#0A431F] ${isImporting ? 'pointer-events-none opacity-60' : ''}`}>
              {isImporting ? 'กำลังอ่านและบันทึกไฟล์…' : 'เลือกไฟล์ Excel (.xlsx / .xls)'}
              <input type="file" accept=".xlsx,.xls" disabled={isImporting} className="sr-only" onChange={(event) => { void importWorkbook(event.target.files?.[0]); event.currentTarget.value = ''; }} />
            </label>
            <p className="text-[11px] leading-relaxed text-zinc-400">ไฟล์จะไม่ถูกส่งขึ้น backend; ข้อมูลที่ไฟล์ตัวอย่างไม่มี เช่น วันเกิด, พื้นที่เดิม, น้ำหนัก, ส่วนสูง และขนาดยา ต้องกรอกเพิ่มก่อนใช้ประเมิน</p>
            {importError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">{importError}</p>}
            {importSummary && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-xs leading-relaxed text-emerald-800">{importSummary}</p>}
          </section>
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
            <input type="search" autoFocus value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setVisiblePatientLimit(100); }}
              placeholder="ชื่อ HN เลขบัตร หรือ Patient ID" aria-label="ค้นหาผู้ป่วย"
              className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-4 outline-none transition placeholder:text-zinc-400 focus:border-[#0E5C33] focus:ring-2 focus:ring-[#0E5C33]/15" />
          </div>
          <p className="px-1 text-xs text-zinc-400">{searchQuery.trim() ? `พบ ${filteredPatients.length} จาก ${patients.length} คน · แสดง ${visiblePatients.length} ราย` : `ผู้ป่วยทั้งหมด ${patients.length} คน · แสดง ${visiblePatients.length} ราย พิมพ์ชื่อหรือ HN เพื่อค้นหา`}</p>
          {!showAddPatient && (
            <button type="button" onClick={() => { setShowAddPatient(true); setAddPatientError(''); }} className="w-full rounded-xl border border-dashed border-[#0E5C33]/40 px-4 py-3 text-sm font-medium text-[#0E5C33] hover:bg-emerald-50">
              + ไม่พบรายชื่อ? เพิ่มผู้ป่วยด้วยการกรอกมือ
            </button>
          )}
          {showAddPatient && (
            <form onSubmit={createPatient} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4">
              <div>
                <h3 className="font-semibold">เพิ่มผู้ป่วยใหม่</h3>
                <p className="mt-1 text-xs text-zinc-500">กรอกวันเกิด ระบบคำนวณอายุให้อัตโนมัติ</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs font-medium text-zinc-600">ชื่อ-นามสกุล
                  <input required value={newPatientName} onChange={(e) => setNewPatientName(e.target.value)} className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-[#0E5C33]" />
                </label>
                <label className="space-y-1 text-xs font-medium text-zinc-600">HN / เลขบัตรประชาชน
                  <input required value={newPatientHn} onChange={(e) => setNewPatientHn(e.target.value)} className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-[#0E5C33]" />
                </label>
                <label className="space-y-1 text-xs font-medium text-zinc-600">วันเดือนปีเกิด
                  <input required type="date" max={new Date().toISOString().slice(0, 10)} value={newPatientBirthDate} onChange={(e) => setNewPatientBirthDate(e.target.value)} className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-[#0E5C33]" />
                </label>
                <div className="space-y-1 text-xs font-medium text-zinc-600">อายุที่คำนวณได้
                  <p className="rounded-lg bg-zinc-50 px-3 py-2.5 text-sm text-zinc-800">{calculatedAge === null ? 'กรอกวันเกิดเพื่อคำนวณ' : `${calculatedAge} ปี`}</p>
                </div>
                <label className="space-y-1 text-xs font-medium text-zinc-600">เพศ
                  <select value={newPatientGender} onChange={(e) => setNewPatientGender(e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0E5C33]"><option value="หญิง">หญิง</option><option value="ชาย">ชาย</option><option value="อื่น ๆ">อื่น ๆ</option></select>
                </label>
                <label className="space-y-1 text-xs font-medium text-zinc-600">พื้นที่ / หมู่บ้าน
                  <input value={newPatientArea} onChange={(e) => setNewPatientArea(e.target.value)} placeholder="เช่น หมู่ 1 หรือ บ้านดู่" className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-[#0E5C33]" />
                </label>
                <label className="space-y-1 text-xs font-medium text-zinc-600">eGFR ล่าสุด
                  <input required type="number" min="0" step="any" value={newPatientEgfr} onChange={(e) => setNewPatientEgfr(e.target.value)} className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-[#0E5C33]" />
                </label>
                <label className="space-y-1 text-xs font-medium text-zinc-600">Metformin (มก./วัน)
                  <input required type="number" min="0" step="any" value={newPatientDose} onChange={(e) => setNewPatientDose(e.target.value)} className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-[#0E5C33]" />
                </label>
              </div>
              {addPatientError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">{addPatientError}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAddPatient(false)} className="flex-1 rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-medium">ยกเลิก</button>
                <button type="submit" disabled={!newPatientName.trim() || !newPatientHn.trim() || calculatedAge === null} className="flex-1 rounded-lg bg-[#0E5C33] px-3 py-2.5 text-sm font-medium text-white disabled:opacity-50">บันทึกผู้ป่วย</button>
              </div>
            </form>
          )}
          <div className="max-h-[60vh] min-h-[320px] overflow-y-auto rounded-2xl border border-zinc-200 bg-white">
            {filteredPatients.length === 0 ? <p className="py-10 text-center text-zinc-400">ไม่พบรายชื่อผู้ป่วย</p> : (
              <>
              <ul className="divide-y divide-zinc-100">
                {visiblePatients.map((patient) => {
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
              {filteredPatients.length > visiblePatients.length && <button type="button" onClick={() => setVisiblePatientLimit((limit) => limit + 100)} className="w-full border-t border-zinc-100 px-4 py-3 text-sm font-medium text-[#0E5C33] hover:bg-emerald-50">แสดงเพิ่มอีก {Math.min(100, filteredPatients.length - visiblePatients.length)} ราย ({visiblePatients.length}/{filteredPatients.length})</button>}
              </>
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
            {needsDoseEntry && (
              <label className="mt-4 block space-y-1 text-xs font-medium text-zinc-600">ขนาดยา Metformin ปัจจุบัน (มก./วัน)
                <input type="number" min="1" step="any" value={doseEntry} onChange={(event) => setDoseEntry(event.target.value)} placeholder="กรอกขนาดยาที่ใช้อยู่" className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-[#0E5C33]" />
                <span className="block font-normal text-zinc-400">ไฟล์นำเข้าไม่มีคอลัมน์ขนาดยา จึงต้องกรอกก่อนตรวจ Part 1</span>
              </label>
            )}
            {scannerError && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">{scannerError}</p>}
            <div className="mt-5 grid grid-cols-2 divide-x divide-zinc-100 border-t border-zinc-100 pt-4">
              <div><p className="text-xs text-zinc-500">ระดับความเสี่ยงเดิม</p><p className="mt-1.5 flex items-center gap-2 font-semibold"><span className={`h-2 w-2 rounded-full ${riskInfo(currentPatient.riskLevel).dot}`} />{riskInfo(currentPatient.riskLevel).label}</p></div>
              <div className="pl-4"><p className="text-xs text-zinc-500">eGFR ล่าสุด</p><p className="mt-1 font-mono text-xl font-semibold leading-none">{currentPatient.egfr}<span className="ml-1 font-sans text-xs font-normal text-zinc-400">mL/min</span></p></div>
            </div>
          </section>
          <div className="grid grid-cols-5 gap-2.5">
            <button type="button" onClick={() => { setScanState('idle'); setScanOrigin(null); setScannerError(''); }} className="col-span-2 flex h-12 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 font-medium text-zinc-600 transition hover:bg-zinc-50"><RotateCcw className="h-4 w-4" />สแกนใหม่</button>
            <button type="button" onClick={confirmPatient} disabled={needsDoseEntry && !doseEntry} className="col-span-3 h-12 rounded-xl bg-[#0E5C33] font-medium text-white transition hover:bg-[#0A431F] disabled:opacity-50">ถูกต้อง · ถัดไป</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step1ScanHN;
