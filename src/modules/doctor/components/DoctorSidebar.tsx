import React from 'react';
import { BarChart2, Users, Settings } from 'lucide-react';
import logo from '../../../assets/logo.png';

interface DoctorSidebarProps {
  currentTab: 'overview' | 'patients' | 'prescribe' | 'settings';
  onSelectTab: (tab: 'overview' | 'patients' | 'prescribe' | 'settings') => void;
}

const NAV_ITEMS = [
  { key: 'overview' as const, label: 'ภาพรวม', icon: BarChart2 },
  { key: 'patients' as const, label: 'คนไข้ของฉัน', icon: Users },

  { key: 'settings' as const, label: 'ตั้งค่า', icon: Settings },
];

export const DoctorSidebar: React.FC<DoctorSidebarProps> = ({ currentTab, onSelectTab }) => {
  return (
    <aside className="w-60 bg-white border-r border-[#E4E9E1] flex-col justify-between hidden md:flex shrink-0 select-none">
      <div>
        <div className="px-5 py-5 flex items-center gap-3 border-b border-[#EDF1EB]">
          <img
            src={logo}
        
            alt="MOPH Logo"
            className="w-9 h-9 object-contain"
          />
          <div>
            <h1 className="text-[13px] font-semibold text-[#16241A] tracking-tight">MEDINOVA</h1>
            <p className="text-[10.5px] text-[#9AA69C]">MALA Project</p>
          </div>
        </div>

        <nav className="p-3 space-y-1 text-[13px] font-medium">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
            const active = currentTab === key;
            return (
              <button
                key={key}
                onClick={() => onSelectTab(key)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                  active
                    ? 'bg-[#0B6B38] text-white'
                    : 'text-[#5C6A61] hover:bg-[#F5F7F4] hover:text-[#16241A]'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={active ? 2.25 : 2} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-[#EDF1EB] text-[11px] text-[#9AA69C] text-center">
        รพ.ศูนย์ เชียงรายฯ · v1.0.4
      </div>
    </aside>
  );
};