import React, { useEffect, useRef, useState } from 'react';
import type { Patient } from '../../types';
import { DoctorSidebar } from './components/DoctorSidebar';
import { DoctorHeader } from './components/DoctorHeader';
import { OverviewTab } from './tabs/OverviewTab';
import { MyPatientsTab } from './tabs/MyPatientsTab';
import { OrderPrescriptionTab } from './tabs/OrderPrescriptionTab';
import { DoctorSettingsTab } from './tabs/DoctorSettingsTab';

interface DoctorScreenProps {
  patients: Patient[];
  onPrescribe: (patientId: string, order: string) => void;
  onUpdatePatient?: (updated: Patient) => void; // รับฟังก์ชันอัปเดตข้อมูลแก้ไขหน้างาน
  onLogout: () => void;
}

type DoctorTab = 'overview' | 'patients' | 'prescribe' | 'settings';

export const DoctorScreen: React.FC<DoctorScreenProps> = ({
  patients,
  onPrescribe,
  onUpdatePatient,
  onLogout,
}) => {
  const [currentTab, setCurrentTab] = useState<DoctorTab>('overview');

  // เก็บ ID ของคนไข้ที่แพทย์เลือกสั่งยา
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // timer สำหรับกลับหน้าภาพรวมหลังสั่งยา (เคลียร์ทิ้งเมื่อออกจากหน้านี้)
  const redirectTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(redirectTimer.current), []);

  // นับจำนวนเคสสีแดงที่ยังรอแพทย์สั่งการจริง (ไม่มีคำสั่งยาและเป็น Escalated)
  const pendingRedPatients = patients.filter(
    (p) => p.riskLevel === 'Red' && p.status === 'Escalated' && !p.doctorOrder
  );
  const redCount = pendingRedPatients.length;

  // คนไข้ที่กำลังเปิดสั่งยาอยู่ (ถ้ามีเลือกไว้ ให้ใช้คนนั้น ถ้าไม่มี ให้หยิบเคสที่รอตรวจคนแรก)
  const currentPrescribePatient =
    patients.find((p) => p.id === selectedPatientId) || pendingRedPatients[0] || patients[0];

  // เมื่อแพทย์กดเลือกจากหน้ารายการ/หน้าภาพรวม
  const handleSelectToPrescribe = (patientId: string) => {
    setSelectedPatientId(patientId);
    setCurrentTab('prescribe');
  };

  // เมื่อแพทย์สั่งยาเสร็จ
  const handlePrescribeCompleted = (patientId: string, order: string) => {
    onPrescribe(patientId, order);
    // สั่งยาเสร็จแล้ว ให้กลับมาหน้าภาพรวมเพื่อดูคิวถัดไป (รอ 1 วินาทีให้เห็นข้อความยืนยัน)
    redirectTimer.current = window.setTimeout(() => {
      setSelectedPatientId(null);
      setCurrentTab('overview');
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <DoctorSidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      <div className="flex min-w-0 flex-1 flex-col">
        <DoctorHeader alertCount={redCount} onLogout={onLogout} />

        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          {currentTab === 'overview' && (
            <OverviewTab patients={patients} onSelectPatient={handleSelectToPrescribe} />
          )}

          {currentTab === 'patients' && (
            <MyPatientsTab
              patients={patients}
              onPrescribe={onPrescribe}
              onUpdatePatient={onUpdatePatient}
            />
          )}

          {currentTab === 'prescribe' && currentPrescribePatient && (
            <OrderPrescriptionTab
              key={currentPrescribePatient.id}
              patient={currentPrescribePatient}
              onPrescribe={handlePrescribeCompleted}
            />
          )}

          {currentTab === 'settings' && <DoctorSettingsTab />}
        </main>
      </div>
    </div>
  );
};

export default DoctorScreen;