import React from 'react';
import { Bell, UserRound, LogOut } from 'lucide-react';

interface ShphHeaderProps {
  alertCount: number;
  onLogout: () => void;
}

export const ShphHeader: React.FC<ShphHeaderProps> = ({ alertCount, onLogout }) => {
  return (
    <header className="h-16 bg-white border-b border-[#E4E9E1] px-6 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-2 bg-[#EAF3ED] text-[#0B6B38] border border-[#CFE3D5] text-[12.5px] font-medium pl-1.5 pr-3.5 py-1.5 rounded-full">
        <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-[#CFE3D5]">
          <UserRound className="w-3.5 h-3.5" />
        </span>
        <span>พยาบาลวิชาชีพ ใจดี · รพ.สต. บ้านดอน</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="การแจ้งเตือน"
          className="relative text-[#9AA69C] hover:text-[#16241A] transition p-1"
        >
          <Bell className="w-5 h-5" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white ring-2 ring-white rounded-full text-[10px] font-semibold w-4 h-4 flex items-center justify-center">
              {alertCount}
            </span>
          )}
        </button>

        <div className="h-4 w-px bg-[#E4E9E1]" />

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FBEEEE] hover:bg-[#F7DADA] text-[#9B3131] border border-[#F2C2C2] rounded-md text-[12px] font-semibold transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </header>
  );
};