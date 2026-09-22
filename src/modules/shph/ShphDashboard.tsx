import React, { useState } from 'react';
import type { Patient } from '../../types';
import { ShphSidebar } from './components/ShphSidebar';
import { ShphHeader } from './components/ShphHeader';
import { CpgModal } from './components/CpgModal';
import { PatientDetailView } from './components/PatientDetailView';
import { DoctorFeedbackView } from './components/DoctorFeedbackView';
import { DashboardTab } from './tabs/DashboardTab';
import { PatientListTab } from './tabs/PatientListTab';
import { ReportsTab } from './tabs/ReportsTab';
import { SettingsTab } from './tabs/SettingsTab';
import { Stethoscope, Clock, CheckCircle2 } from 'lucide-react';

export interface ShphDashboardProps {
  patients: Patient[];
  onEscalate: (id: string, note?: string) => void;
  onLogout: () => void;
  onUpdatePatient?: (updated: Patient) => void;
}

export const ShphDashboard: React.FC<ShphDashboardProps> = ({
  patients,
  onEscalate,
  onLogout,
  onUpdatePatient,
}) => {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'patients' | 'feedback' | 'reports' | 'settings'>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'detail' | 'feedback'>('detail');
  const [showCpgModal, setShowCpgModal] = useState(false);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || null;
  const redCount = patients.filter((p) => p.riskLevel === 'Red').length;
  const resolvedPatients = patients.filter((p) => p.status === 'Resolved');

  const handleSelectTab = (tab: 'dashboard' | 'patients' | 'feedback' | 'reports' | 'settings') => {
    setCurrentTab(tab);
    setSelectedPatientId(null);
  };

  const handleSelectPatient = (id: string, mode: 'detail' | 'feedback' = 'detail') => {
    setSelectedPatientId(id);
    setViewMode(mode);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F4] flex text-[#16241A] font-sans">
      {/* Sidebar พร้อมส่งรายชื่อคนไข้ไปนับ badge */}
      <ShphSidebar currentTab={currentTab} onSelectTab={handleSelectTab} patients={patients} />

      <div className="flex-1 flex flex-col min-w-0">
        <ShphHeader alertCount={redCount} onLogout={onLogout} />

        <main className="p-6 md:p-8 flex-1 overflow-y-auto">
          {/* แท็บแดชบอร์ด */}
          {currentTab === 'dashboard' && (
            selectedPatient ? (
              viewMode === 'feedback' ? (
                <DoctorFeedbackView
                  patient={selectedPatient}
                  onBack={() => setSelectedPatientId(null)}
                  onUpdatePatient={onUpdatePatient}
                />
              ) : (
                <PatientDetailView
                  patient={selectedPatient}
                  onBack={() => setSelectedPatientId(null)}
                  onEscalate={onEscalate}
                  onOpenCpg={() => setShowCpgModal(true)}
                  onUpdatePatient={onUpdatePatient}
                />
              )
            ) : (
              <DashboardTab
                patients={patients}
                onSelectPatient={handleSelectPatient}
              />
            )
          )}

          {/* แท็บคำสั่งแพทย์ (Feedback Tab) */}
          {currentTab === 'feedback' && (
            selectedPatient ? (
              <DoctorFeedbackView
                patient={selectedPatient}
                onBack={() => setSelectedPatientId(null)}
                onUpdatePatient={onUpdatePatient}
              />
            ) : (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-[#0B6B38]" />
                    <span>คำสั่งการรักษาและแผนดูแลต่อเนื่องจากแพทย์</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    รายชื่อผู้ป่วยที่แพทย์ตอบกลับคำสั่งปรับยาแล้ว เพื่อให้ รพ.สต. และ อสม. ติดตามอาการในชุมชน
                  </p>
                </div>

                <div className="bg-white border border-[#E4E9E1] rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">ชื่อ-นามสกุล</th>
                        <th className="py-3 px-4">คำสั่งปรับยาของแพทย์</th>
                        <th className="py-3 px-4">วันที่แพทย์สั่ง</th>
                        <th className="py-3 px-4 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {resolvedPatients.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400">
                            ยังไม่มีคำสั่งการรักษาที่ตอบกลับจากแพทย์
                          </td>
                        </tr>
                      ) : (
                        resolvedPatients.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50 transition">
                            <td className="py-3.5 px-4 font-bold text-slate-800">{p.name}</td>
                            <td className="py-3.5 px-4 font-medium text-emerald-800">
                              <span className="bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg inline-block">
                                {p.doctorOrder?.split('|')[0] || 'ปรับยาเรียบร้อย'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>{p.updatedAt || 'วันนี้'}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => handleSelectPatient(p.id, 'feedback')}
                                className="px-3.5 py-1.5 bg-[#0B6B38] hover:bg-[#08532b] text-white rounded-lg text-xs font-bold transition shadow-sm"
                              >
                                เปิดดูคำสั่ง & บันทึกติดตาม
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

          {currentTab === 'patients' && <PatientListTab patients={patients} />}
          {currentTab === 'reports' && <ReportsTab patients={patients} />}
          {currentTab === 'settings' && <SettingsTab />}
        </main>
      </div>

      {showCpgModal && (
        <CpgModal patient={selectedPatient} onClose={() => setShowCpgModal(false)} />
      )}
    </div>
  );
};

export default ShphDashboard;