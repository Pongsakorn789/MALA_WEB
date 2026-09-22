import { useState, useEffect } from 'react';
import type { Patient } from './types';
import { getStoredPatients, saveStoredPatients } from './utils/storage';

import { LoginScreen } from './components/LoginScreen';
import { VhvScreen } from './modules/vhv/VhvScreen';
import { ShphDashboard } from './modules/shph/ShphDashboard';
import { DoctorScreen } from './modules/doctor/DoctorScreen';

export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<'VHV' | 'SHPH' | 'DOCTOR'>('VHV');
  const [patients, setPatients] = useState<Patient[]>(getStoredPatients);

  // ดักจับข้อมูลข้ามแท็บ (Cross-Tab Realtime Sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'MALA_PATIENTS_DATA' && e.newValue) {
        setPatients(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLoginSuccess = (selectedRole: 'VHV' | 'SHPH' | 'DOCTOR') => {
    setRole(selectedRole);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // 1. อสม. กรอกข้อมูลส่งมา -> บันทึกและซิงค์ทันที
  const handleUpdatePatient = (updated: Patient) => {
    const nextPatients = patients.map((p) => (p.id === updated.id ? updated : p));
    setPatients(nextPatients);
    saveStoredPatients(nextPatients);
  };

  // 2. รพ.สต. กดส่งแจ้งเตือนหาหมอ -> เปลี่ยนสถานะเป็น Escalated
  const handleEscalate = (id: string) => {
    const nextPatients = patients.map((p) =>
      p.id === id ? { ...p, status: 'Escalated' as const, riskLevel: 'Red' as const } : p
    );
    setPatients(nextPatients);
    saveStoredPatients(nextPatients);
  };

  // 3. หมอกดสั่งปรับยา -> เปลี่ยนสถานะเป็น Resolved และบันทึกคำสั่ง
  const handlePrescribe = (patientId: string, order: string) => {
    const nextPatients = patients.map((p) =>
      p.id === patientId ? { ...p, doctorOrder: order, status: 'Resolved' as const } : p
    );
    setPatients(nextPatients);
    saveStoredPatients(nextPatients);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <main>
        {role === 'VHV' && (
          <VhvScreen
            patients={patients}
            onUpdatePatient={handleUpdatePatient}
            onLogout={handleLogout}
          />
        )}
        {role === 'SHPH' && (
          <ShphDashboard
            patients={patients}
            onEscalate={handleEscalate}
            onLogout={handleLogout}
          />
        )}
        {role === 'DOCTOR' && (
          <DoctorScreen
            patients={patients}
            onPrescribe={handlePrescribe}
            onLogout={handleLogout}
          />
        )}
      </main>
    </div>
  );
}

export default App;