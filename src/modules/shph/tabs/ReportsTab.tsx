import React, { useMemo } from 'react';
import { Download, MapPin, Pill, Sprout } from 'lucide-react';
import type { Patient, ScreeningRecord } from '../../../types';

interface ReportsTabProps {
  patients: Patient[];
}

type RecordRow = { patient: Patient; record: ScreeningRecord };

const escapeCsv = (value: string | number | boolean | undefined) => {
  const text = value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const toPercent = (numerator: number, denominator: number) => denominator ? Math.round((numerator / denominator) * 100) : 0;

export const ReportsTab: React.FC<ReportsTabProps> = ({ patients }) => {
  const records = useMemo<RecordRow[]>(
    () => patients.flatMap((patient) => (patient.screeningHistory || []).map((record) => ({ patient, record }))),
    [patients],
  );
  const part1Count = records.length;
  const dosePassCount = records.filter(({ record }) => record.dosePassed).length;
  const doseReviewCount = part1Count - dosePassCount;
  const part2Records = records.filter(({ record }) => record.riskScore !== undefined);
  const riskRecords = part2Records.filter(({ record }) => (record.riskScore || 0) >= 2);
  const savedPatientCount = new Set(records.map(({ patient }) => patient.id)).size;
  const savedRate = toPercent(savedPatientCount, patients.length);
  const riskPercent = toPercent(riskRecords.length, part2Records.length);

  const areaCounts = useMemo(() => {
    const counts = new Map<string, number>();
    riskRecords.forEach(({ record }) => {
      const area = record.screeningArea?.trim() || 'ไม่ระบุพื้นที่';
      counts.set(area, (counts.get(area) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [riskRecords]);

  const painMedicationCases = part2Records.filter(({ record }) => record.painMedication).length;
  const herbSupplementCases = part2Records.filter(({ record }) => record.supplementOrHerbal).length;

  const downloadReport = () => {
    const headers = [
      'วันที่คัดกรอง', 'HN', 'ชื่อ-สกุล', 'อายุ', 'พื้นที่', 'eGFR', 'ขนาดยา Metformin',
      'Part 1 ผ่านเกณฑ์', 'Part 2 คะแนน', 'ผล Part 2 เสี่ยง', 'ใช้ยาแก้ปวด/ยาแก้อักเสบ', 'ใช้สมุนไพร/อาหารเสริม',
    ];
    const rows = records.map(({ patient, record }) => [
      record.screenedAt, patient.citizenId, patient.name, patient.age, record.screeningArea,
      patient.egfr, patient.metforminDose, record.dosePassed ? 'ผ่าน' : 'ส่งทบทวน',
      record.riskScore, record.riskScore === undefined ? '' : record.riskScore >= 2 ? 'เสี่ยง' : 'ไม่เข้าเกณฑ์เสี่ยง',
      record.painMedication ? 'ใช่' : 'ไม่ใช่', record.supplementOrHerbal ? 'ใช่' : 'ไม่ใช่',
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mala-screening-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const metrics = [
    { label: 'ตรวจขนาดยา · Part 1', value: `${part1Count} ครั้ง`, detail: `${dosePassCount} ผ่าน · ${doseReviewCount} ส่งแพทย์ทบทวน`, tint: 'text-[#0B6B38]' },
    { label: 'ประเมินความเสี่ยง · Part 2', value: `${part2Records.length} ครั้ง`, detail: `คะแนนเข้าเกณฑ์เสี่ยง ${riskRecords.length} ครั้ง`, tint: 'text-amber-700' },
    { label: 'สัดส่วน Part 2 ที่เข้าเกณฑ์เสี่ยง', value: `${riskPercent}%`, detail: `${riskRecords.length} จาก ${part2Records.length} ครั้ง`, tint: 'text-red-700' },
    { label: 'ผู้ป่วยที่มีผลบันทึก', value: `${savedRate}%`, detail: `${savedPatientCount} จาก ${patients.length} รายชื่อในระบบ`, tint: 'text-sky-700' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 font-sans text-sm text-zinc-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">แดชบอร์ดคัดกรอง MALA</h2>
          <p className="mt-1 text-zinc-500">สถิติ Part 1 และ Part 2 จากประวัติการคัดกรองที่บันทึกไว้</p>
        </div>
        <button type="button" onClick={downloadReport} disabled={!records.length}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0B6B38] px-4 py-2.5 font-medium text-white hover:bg-[#08552D] disabled:cursor-not-allowed disabled:opacity-40">
          <Download className="h-4 w-4" /> ดาวน์โหลด CSV
        </button>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-medium text-zinc-500">{metric.label}</p>
            <p className={`mt-2 text-2xl font-semibold tabular-nums ${metric.tint}`}>{metric.value}</p>
            <p className="mt-1 text-xs text-zinc-500">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#0B6B38]" />
            <h3 className="font-semibold">พื้นที่ที่พบเคสเข้าเกณฑ์เสี่ยง</h3>
          </div>
          <p className="mt-1 text-xs text-zinc-500">นับจากการประเมิน Part 2 ที่ได้คะแนนตั้งแต่ 2 คะแนน</p>
          {areaCounts.length ? (
            <ol className="mt-4 divide-y divide-zinc-100">
              {areaCounts.map(([area, count], index) => (
                <li key={area} className="flex items-center justify-between gap-3 py-3">
                  <span className="font-medium">{index === 0 ? 'พบมากสุด · ' : ''}{area}</span>
                  <span className="tabular-nums text-zinc-600">{count} ครั้ง</span>
                </li>
              ))}
            </ol>
          ) : <p className="py-8 text-center text-sm text-zinc-400">ยังไม่มีข้อมูลพื้นที่ของเคสเสี่ยง</p>}
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h3 className="font-semibold">แนวทางต่อยอดคำแนะนำในชุมชน</h3>
          <p className="mt-1 text-xs text-zinc-500">จำนวนครั้งที่ผู้ป่วยแจ้งปัจจัยนี้ในแบบประเมิน Part 2</p>
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-3">
              <Pill className="mt-0.5 h-4 w-4 text-amber-700" />
              <div><p className="font-medium">ยาแก้ปวด/ยาแก้อักเสบ</p><p className="mt-1 text-sm text-zinc-600">พบ {painMedicationCases} ครั้ง · จัดกิจกรรมให้ผู้ป่วยนำรายการยาที่ใช้มาปรึกษา อสม. หรือบุคลากรสุขภาพก่อนใช้ยาใหม่</p></div>
            </div>
            <div className="flex items-start gap-3">
              <Sprout className="mt-0.5 h-4 w-4 text-emerald-700" />
              <div><p className="font-medium">สมุนไพร/อาหารเสริม</p><p className="mt-1 text-sm text-zinc-600">พบ {herbSupplementCases} ครั้ง · ทำสื่อชวนแจ้งชื่อผลิตภัณฑ์หรือให้นำบรรจุภัณฑ์มาทบทวนร่วมกับบุคลากรสุขภาพ</p></div>
            </div>
          </div>
          <p className="mt-4 border-t border-zinc-100 pt-3 text-xs text-zinc-400">ตัวชี้วัดหลักของแดชบอร์ดนับเฉพาะ Part 1 และ Part 2; อาการคลื่นไส้/อาเจียนไม่รวมในสถิติหลัก</p>
        </article>
      </section>
    </div>
  );
};
