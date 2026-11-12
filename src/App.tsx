import { useState, useEffect } from 'react';
import type { Patient } from './types';
import { getStoredPatients, saveStoredPatients, subscribeToPatientChanges } from './utils/storage';

import { LoginScreen } from './components/LoginScreen';
import { VhvScreen } from './modules/vhv/VhvScreen';
import { DoctorScreen } from './modules/doctor/DoctorScreen';
import { CareManagerScreen } from './modules/care-manager/CareManagerScreen';

type AppRole = 'SHPH' | 'DOCTOR' | 'CARE_MANAGER';

export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<AppRole>('SHPH');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsLoaded, setPatientsLoaded] = useState(false);

  // ดักจับข้อมูลข้ามแท็บแบบ Real-time (Cross-Tab Sync)
  useEffect(() => {
    let active = true;
    void getStoredPatients().then((stored) => {
      if (active) {
        setPatients(stored);
        setPatientsLoaded(true);
      }
    });
    const unsubscribe = subscribeToPatientChanges((updated) => setPatients(updated));
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const handleLoginSuccess = (
    selectedRole: AppRole,
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
    void saveStoredPatients(nextPatients).catch((error) => console.error(error));
  };

  const handleAddPatient = (patient: Patient) => {
    const nextPatients = [...patients, patient];
    setPatients(nextPatients);
    void saveStoredPatients(nextPatients).catch((error) => console.error(error));
  };

  const handleImportPatients = async (importedPatients: Patient[]) => {
    const merged = new Map(patients.map((patient) => [patient.citizenId, patient]));
    let added = 0;
    let updated = 0;
    importedPatients.forEach((imported) => {
      const existing = merged.get(imported.citizenId);
      if (existing) {
        merged.set(imported.citizenId, {
          ...existing,
          name: imported.name || existing.name,
          age: imported.age || existing.age,
          gender: imported.gender || existing.gender,
          egfr: imported.egfr,
          cardId: imported.cardId || existing.cardId,
          labResultDate: imported.labResultDate || existing.labResultDate,
          registeredDate: imported.registeredDate || existing.registeredDate,
          screeningArea: imported.screeningArea || existing.screeningArea,
        });
        updated += 1;
      } else {
        merged.set(imported.citizenId, imported);
        added += 1;
      }
    });

    const nextPatients = [...merged.values()];
    await saveStoredPatients(nextPatients);
    setPatients(nextPatients);
    return { added, updated };
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
    if (!patientsLoaded) {
      return <div className="flex min-h-screen items-center justify-center bg-[#F5F7F4] text-sm text-[#5C6A61]">กำลังโหลดรายชื่อผู้ป่วย…</div>;
    }
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <main>
        {role === 'SHPH' && (
          <VhvScreen
            patients={patients}
            onUpdatePatient={handleUpdatePatient}
            onAddPatient={handleAddPatient}
            onImportPatients={handleImportPatients}
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

        {role === 'CARE_MANAGER' && (
          <CareManagerScreen
            patients={patients}
            onUpdatePatient={handleUpdatePatient}
            onLogout={handleLogout}
          />
        )}
      </main>
    </div>
  );
}

export default App;
