import React from 'react';
import { ShieldAlert, Users, Activity, Stethoscope } from 'lucide-react';

interface NavbarProps {
  currentRole: 'VHV' | 'SHPH' | 'DOCTOR';
  setRole: (role: 'VHV' | 'SHPH' | 'DOCTOR') => void;
  redAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRole, setRole, redAlertCount }) => {
  return (
    <header className="bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">MALA Risk Surveillance</h1>
            <p className="text-xs text-slate-400">ระบบคัดกรองความเสี่ยง Metformin - รพ.เชียงรายประชานุเคราะห์</p>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setRole('VHV')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition ${
              currentRole === 'VHV' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. อสม. (ภาคสนาม)</span>
          </button>

          <button
            onClick={() => setRole('SHPH')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition ${
              currentRole === 'SHPH' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>2. รพ.สต. (คัดกรอง)</span>
          </button>

          <button
            onClick={() => setRole('DOCTOR')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition relative ${
              currentRole === 'DOCTOR' ? 'bg-red-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>3. แพทย์ (ห้องตรวจ)</span>
            {redAlertCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-yellow-400 text-slate-900 rounded-full text-xs font-bold animate-pulse">
                {redAlertCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};