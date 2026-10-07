import { useState, useEffect } from 'react';
import type { Patient } from './types';
import { getStoredPatients, saveStoredPatients } from './utils/storage';

import { LoginScreen } from './components/LoginScreen';
import { VhvScreen } from './modules/vhv/VhvScreen';
import { DoctorScreen } from './modules/doctor/DoctorScreen';

export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<'SHPH' | 'DOCTOR'>('SHPH');
  const [patients, setPatients] = useState<Patient[]>(getStoredPatients);

  // ดักจับข้อมูลข้ามแท็บแบบ Real-time (Cross-Tab Sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'MALA_PATIENTS_DATA_V3' && e.newValue) {
        setPatients(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLoginSuccess = (
    selectedRole: 'SHPH' | 'DOCTOR',
    _username: string
  ) => {
    setRole(selectedRole);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // เจ้าหน้าที่คัดกรองเสร็จ -> อัปเดตข้อมูล
  const handleUpdatePatient = (updated: Patient) => {
    const nextPatients = patients.map((p) =>
      p.id === updated.id ? updated : p
    );

    setPatients(nextPatients);
    saveStoredPatients(nextPatients);
  };

  // แพทย์สั่งปรับยา -> เปลี่ยนสถานะเป็น Resolved
  const handlePrescribe = (patientId: string, order: string) => {
    const nextPatients = patients.map((p) =>
      p.id === patientId
        ? {
            ...p,
            doctorOrder: order,
            status: 'Resolved' as const,
          }
        : p
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
        {role === 'SHPH' && (
          <VhvScreen
            patients={patients}
            onUpdatePatient={handleUpdatePatient}
            onLogout={handleLogout}
          />
        )}

        {role === 'DOCTOR' && (
          <DoctorScreen
            patients={patients}
            onPrescribe={handlePrescribe}
            onUpdatePatient={handleUpdatePatient}
            onLogout={handleLogout}
          />
        )}
      </main>
    </div>
  );
}

export default App;