import React from 'react';
import { LayoutDashboard, Users, FileBarChart, Settings, Stethoscope } from 'lucide-react';
import type { Patient } from '../../../types';

interface ShphSidebarProps {
  currentTab: 'dashboard' | 'patients' | 'feedback' | 'reports' | 'settings';
  onSelectTab: (tab: 'dashboard' | 'patients' | 'feedback' | 'reports' | 'settings') => void;
  patients?: Patient[];
}

export const ShphSidebar: React.FC<ShphSidebarProps> = ({ currentTab, onSelectTab, patients = [] }) => {
  // นับจำนวนเคสที่แพทย์ตอบกลับมาแล้ว
  const resolvedCount = patients.filter((p) => p.status === 'Resolved').length;

  return (
    <aside className="w-56 bg-white border-r border-[#E4E9E1] flex flex-col justify-between py-6 px-4">
      <div className="space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-full bg-[#0B6B38] flex items-center justify-center text-white font-bold text-xs">
            M
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#16241A] tracking-tight">MEDINOVA</h1>
            <p className="text-[10px] text-[#9AA69C]">MALA Project</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 text-xs">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition ${
              currentTab === 'dashboard'
                ? 'bg-[#0B6B38] text-white font-semibold shadow-sm'
                : 'text-[#5C6A61] hover:bg-[#FAFBF9]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>แดชบอร์ด</span>
          </button>

          <button
            onClick={() => onSelectTab('patients')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition ${
              currentTab === 'patients'
                ? 'bg-[#0B6B38] text-white font-semibold shadow-sm'
                : 'text-[#5C6A61] hover:bg-[#FAFBF9]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>ผู้ป่วย</span>
          </button>

          {/* แท็บใหม่: คำสั่งแพทย์ / ติดตามผล */}
          <button
            onClick={() => onSelectTab('feedback')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition ${
              currentTab === 'feedback'
                ? 'bg-[#0B6B38] text-white font-semibold shadow-sm'
                : 'text-[#5C6A61] hover:bg-[#FAFBF9]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Stethoscope className="w-4 h-4" />
              <span>คำสั่งแพทย์</span>
            </div>
            {resolvedCount > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                currentTab === 'feedback' ? 'bg-white text-[#0B6B38]' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {resolvedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('reports')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition ${
              currentTab === 'reports'
                ? 'bg-[#0B6B38] text-white font-semibold shadow-sm'
                : 'text-[#5C6A61] hover:bg-[#FAFBF9]'
            }`}
          >
            <FileBarChart className="w-4 h-4" />
            <span>รายงาน</span>
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition ${
              currentTab === 'settings'
                ? 'bg-[#0B6B38] text-white font-semibold shadow-sm'
                : 'text-[#5C6A61] hover:bg-[#FAFBF9]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>ตั้งค่า</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};