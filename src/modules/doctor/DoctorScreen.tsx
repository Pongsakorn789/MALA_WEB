import React, { useState } from 'react';
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
  onLogout: () => void;
}

export const DoctorScreen: React.FC<DoctorScreenProps> = ({ patients, onPrescribe, onLogout }) => {
  const [currentTab, setCurrentTab] = useState<'overview' | 'patients' | 'prescribe' | 'settings'>('overview');
  
  // เก็บ ID ของคนไข้ที่แพทย์เลือกสั่งยา
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // นับจำนวนเคสสีแดงที่ยังรอแพทย์สั่งการจริง
  const pendingRedPatients = patients.filter((p) => p.riskLevel === 'Red' && p.status === 'Escalated');
  const redCount = pendingRedPatients.length;

  // คนไข้ที่กำลังเปิดสั่งยาอยู่ (ถ้ามีเลือกไว้ ให้ใช้คนนั้น ถ้าไม่มี ให้หยิบเคสที่รอตรวจคนแรก)
  const currentPrescribePatient = 
    patients.find((p) => p.id === selectedPatientId) || 
    pendingRedPatients[0] || 
    patients[0];

  // เมื่อแพทย์กดเลือกจากหน้ารายการ/หน้าภาพรวม
  const handleSelectToPrescribe = (patientId: string) => {
    setSelectedPatientId(patientId);
    setCurrentTab('prescribe');
  };

  // เมื่อแพทย์สั่งยาเสร็จ
  const handlePrescribeCompleted = (patientId: string, order: string) => {
    onPrescribe(patientId, order);
    // สั่งยาเสร็จแล้ว ให้เด้งกลับมาหน้าภาพรวมเพื่อดูคิวถัดไป
    setTimeout(() => {
      setSelectedPatientId(null);
      setCurrentTab('overview');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F4] flex text-[#16241A] font-sans">
      <DoctorSidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      <div className="flex-1 flex flex-col min-w-0">
        <DoctorHeader alertCount={redCount} onLogout={onLogout} />

        <main className="p-6 md:p-8 flex-1 overflow-y-auto">
          {currentTab === 'overview' && (
            <OverviewTab 
              patients={patients} 
              onSelectPatient={handleSelectToPrescribe} 
            />
          )}

          {currentTab === 'patients' && (
            <MyPatientsTab patients={patients} />
          )}

          {currentTab === 'prescribe' && currentPrescribePatient && (
            <OrderPrescriptionTab 
              patient={currentPrescribePatient} 
              onPrescribe={handlePrescribeCompleted} 
            />
          )}

          {currentTab === 'settings' && (
            <DoctorSettingsTab />
          )}
        </main>
      </div>
    </div>
  );
};

export default DoctorScreen;