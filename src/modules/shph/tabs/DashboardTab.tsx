import React, { useState, useEffect } from 'react';
import type { Patient } from '../../../types';
import { Search, ChevronLeft, ChevronRight, BellRing, Clock, X, Eye, CheckCircle2 } from 'lucide-react';

interface DashboardTabProps {
  patients: Patient[];
  onSelectPatient: (id: string, mode?: 'detail' | 'feedback') => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ patients, onSelectPatient }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  // เก็บ ID ของเคสที่เพิ่งส่งเข้ามาล่าสุด
  const [latestPatientId, setLatestPatientId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);

  useEffect(() => {
    if (patients.length > 0) {
      const recentlyScreened = patients.find(
        (p) => p.status === 'Escalated' || p.status === 'Screened'
      );

      if (recentlyScreened && recentlyScreened.id !== latestPatientId) {
        setLatestPatientId(recentlyScreened.id);
        setShowToast(true);
      }
    }
  }, [patients]);

  const latestPatient = patients.find((p) => p.id === latestPatientId);

  const redCount = patients.filter((p) => p.riskLevel === 'Red').length;
  const yellowCount = patients.filter((p) => p.riskLevel === 'Yellow').length;
  const greenCount = patients.filter((p) => p.riskLevel === 'Green').length;

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.citizenId.includes(searchQuery);
    const matchesRisk = filterRisk === 'ALL' || p.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const handleOpenDetail = (patientId: string) => {
    if (latestPatientId === patientId) {
      setShowToast(false);
      setLatestPatientId(null);
    }
    const target = patients.find((p) => p.id === patientId);
    if (target?.status === 'Resolved') {
      onSelectPatient(patientId, 'feedback');
    } else {
      onSelectPatient(patientId, 'detail');
    }
  };

  return (
    <div className="space-y-5 relative">
      {/* 1. กล่อง Toast Notification เด้งมุมขวาบนแบบยังไม่อ่าน */}
      {showToast && latestPatient && (
        <div className="fixed top-20 right-6 z-50 max-w-sm w-full bg-white border-2 border-emerald-600 rounded-2xl shadow-2xl p-4 transition-all duration-300 transform translate-y-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-[#0B6B38] flex-shrink-0 animate-bounce">
                <BellRing className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-white bg-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    อสม. ส่งข้อมูลมาใหม่
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {latestPatient.updatedAt || 'เมื่อสักครู่'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  {latestPatient.name} (อายุ {latestPatient.age} ปี)
                </h4>
                <p className="text-xs text-slate-500">
                  ระดับความเสี่ยง:{' '}
                  <span
                    className={`font-bold ${
                      latestPatient.riskLevel === 'Red'
                        ? 'text-red-600'
                        : latestPatient.riskLevel === 'Yellow'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {latestPatient.riskLevel === 'Red'
                      ? 'เสี่ยงสูง (Red Tier)'
                      : latestPatient.riskLevel === 'Yellow'
                      ? 'เสี่ยงปานกลาง'
                      : 'เสี่ยงต่ำ/ปกติ'}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-slate-400 hover:text-slate-600 transition p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-end gap-2">
            <button
              onClick={() => setShowToast(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
            >
              ปิด
            </button>
            <button
              onClick={() => handleOpenDetail(latestPatient.id)}
              className="px-3.5 py-1.5 bg-[#0B6B38] hover:bg-[#08532b] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>เปิดดูข้อมูลทันที</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. สรุปสถานการณ์ประจำวัน */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-slate-800">สรุปสถานการณ์ประจำวัน</h2>
        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
          <div className="flex items-center space-x-1.5 font-bold">
            <span>เคสทั้งหมด : {patients.length}</span>
            <span>👤</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>เสี่ยงสูง : <b className="text-slate-800">{redCount}</b></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>เสี่ยงปานกลาง : <b className="text-slate-800">{yellowCount}</b></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>เสี่ยงต่ำ/ปกติ : <b className="text-slate-800">{greenCount}</b></span>
          </div>
        </div>
      </div>

      {/* 3. แถบค้นหาและตัวกรอง */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหารายชื่อคนไข้..."
            className="w-full pl-3 pr-8 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#0B6B38]"
          />
          <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
        </div>

        <div className="text-xs text-slate-600 flex items-center space-x-2">
          <span>ตัวกรอง :</span>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="bg-transparent font-bold border-none outline-none cursor-pointer"
          >
            <option value="ALL">เรียงตามความเสี่ยง ▼</option>
            <option value="Red">เฉพาะเสี่ยงสูง (สีแดง)</option>
            <option value="Yellow">เฉพาะเสี่ยงปานกลาง (สีเหลือง)</option>
            <option value="Green">เฉพาะเสี่ยงต่ำ (สีเขียว)</option>
          </select>
        </div>
      </div>

      {/* 4. ตารางรายชื่อผู้ป่วย */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
        <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-800 flex justify-between items-center">
          <span>ตารางรายชื่อผู้ป่วยที่ต้องเฝ้าระวัง MALA</span>
          {latestPatientId && (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              มี 1 เคสอัปเดตใหม่ที่ยังไม่ได้ตรวจ
            </span>
          )}
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] text-slate-600 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 text-center">ระดับความเสี่ยง</th>
              <th className="py-3 px-4">ชื่อ-นามสกุล</th>
              <th className="py-3 px-4">สถานะขั้นตอน</th>
              <th className="py-3 px-4">ข้อมูลจาก</th>
              <th className="py-3 px-4">วันที่อัปเดต</th>
              <th className="py-3 px-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredPatients.map((p) => {
              const isUnreadLatest = p.id === latestPatientId;

              return (
                <tr
                  key={p.id}
                  className={`transition duration-150 ${
                    isUnreadLatest
                      ? 'bg-emerald-50/70 border-l-4 border-emerald-600 font-medium'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* ระดับความเสี่ยง */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${
                        p.riskLevel === 'Red'
                          ? 'bg-red-600 ring-2 ring-red-200'
                          : p.riskLevel === 'Yellow'
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                    />
                  </td>

                  {/* ชื่อคนไข้ */}
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span>{p.name}</span>
                      {isUnreadLatest && (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                          ส่งมาล่าสุด ✨
                        </span>
                      )}
                    </div>
                  </td>

                  {/* สถานะขั้นตอน (Workflow Stage Badge) */}
                  <td className="py-3.5 px-4">
                    {p.status === 'Resolved' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {p.doctorOrder ? 'แพทย์ตอบกลับแล้ว' : 'ให้คำแนะนำ CPG แล้ว'}
                      </span>
                    ) : p.status === 'Escalated' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[11px] font-bold animate-pulse">
                        <Clock className="w-3 h-3 text-amber-600" />
                        รอแพทย์สั่งยา
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[11px] font-medium">
                        รอประเมิน รพ.สต.
                      </span>
                    )}
                  </td>

                  {/* แหล่งข้อมูล */}
                  <td className="py-3.5 px-4">{p.screenedBy || 'รพ.สต. (Walk-in)'}</td>

                  {/* วันที่อัปเดต */}
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{p.updatedAt || '22/09/2026 09:30'}</span>
                    </div>
                  </td>

                  {/* ปุ่มจัดการ */}
                  <td className="py-3.5 px-4 text-center">
                    {p.status === 'Resolved' && p.doctorOrder ? (
                      <button
                        onClick={() => onSelectPatient(p.id, 'feedback')}
                        className="px-3 py-1 bg-[#0B6B38] hover:bg-[#08532b] text-white rounded-lg text-xs font-bold transition shadow-sm"
                      >
                        ดูคำสั่งแพทย์
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectPatient(p.id, 'detail')}
                        className={`font-semibold underline ${
                          isUnreadLatest
                            ? 'text-[#0B6B38] font-bold hover:text-emerald-800'
                            : 'text-slate-600 hover:text-[#0B6B38]'
                        }`}
                      >
                        {p.status === 'Escalated' ? 'ดูความคืบหน้า' : 'ตรวจประเมิน'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="p-4 border-t border-slate-100 flex justify-end items-center space-x-3 text-xs text-slate-500">
          <button className="hover:text-slate-800"><ChevronLeft className="w-4 h-4 inline" /></button>
          <span className="font-semibold text-slate-700">หน้า 1 จาก 1</span>
          <button className="hover:text-slate-800"><ChevronRight className="w-4 h-4 inline" /></button>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;