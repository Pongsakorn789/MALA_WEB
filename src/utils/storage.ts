import type { Patient } from '../types';
import { initialPatients } from '../data/mockPatients';

const STORAGE_KEY = 'MALA_PATIENTS_DATA_V3';
const DATABASE_NAME = 'mala-project';
const OBJECT_STORE = 'application-data';
const PATIENTS_KEY = 'patients';
const CHANNEL_NAME = 'mala-patient-updates';

let sharedChannel: BroadcastChannel | null = null;

const openDatabase = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const request = indexedDB.open(DATABASE_NAME, 1);
  request.onupgradeneeded = () => {
    if (!request.result.objectStoreNames.contains(OBJECT_STORE)) {
      request.result.createObjectStore(OBJECT_STORE);
    }
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error || new Error('เปิดฐานข้อมูลในเบราว์เซอร์ไม่สำเร็จ'));
});

const readFromDatabase = async (): Promise<Patient[] | null> => {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(OBJECT_STORE, 'readonly').objectStore(OBJECT_STORE).get(PATIENTS_KEY);
    request.onsuccess = () => {
      database.close();
      resolve(Array.isArray(request.result) ? request.result as Patient[] : null);
    };
    request.onerror = () => {
      database.close();
      reject(request.error || new Error('อ่านข้อมูลผู้ป่วยไม่สำเร็จ'));
    };
  });
};

const writeToDatabase = async (patients: Patient[]): Promise<void> => {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(OBJECT_STORE, 'readwrite');
    transaction.objectStore(OBJECT_STORE).put(patients, PATIENTS_KEY);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error('บันทึกข้อมูลผู้ป่วยไม่สำเร็จ'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error || new Error('ยกเลิกการบันทึกข้อมูลผู้ป่วย'));
    };
  });
};

const readLegacyLocalStorage = (): Patient[] | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as Patient[] : null;
  } catch {
    return null;
  }
};

export const getStoredPatients = async (): Promise<Patient[]> => {
  if (typeof indexedDB !== 'undefined') {
    try {
      const stored = await readFromDatabase();
      if (stored) return stored;
      const legacy = readLegacyLocalStorage();
      const seed = legacy || initialPatients;
      await writeToDatabase(seed);
      return seed;
    } catch {
      // Keep the existing localStorage data usable in browsers that block IndexedDB.
    }
  }
  return readLegacyLocalStorage() || initialPatients;
};

export const saveStoredPatients = async (patients: Patient[]): Promise<void> => {
  if (typeof indexedDB !== 'undefined') {
    try {
      await writeToDatabase(patients);
      if (typeof BroadcastChannel !== 'undefined') {
        sharedChannel ??= new BroadcastChannel(CHANNEL_NAME);
        sharedChannel.postMessage('patients-updated');
      }
      return;
    } catch {
      // Fall back for environments where IndexedDB is unavailable or blocked.
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  } catch (error) {
    throw new Error(`บันทึกข้อมูลไม่สำเร็จ${error instanceof Error ? `: ${error.message}` : ''}`);
  }
};

export const subscribeToPatientChanges = (onChange: (patients: Patient[]) => void) => {
  if (typeof BroadcastChannel === 'undefined') return () => undefined;
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = async () => onChange(await getStoredPatients());
  return () => channel.close();
};
