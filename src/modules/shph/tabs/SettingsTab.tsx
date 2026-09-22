import React, { useState } from 'react';
import { Database, Bell, ShieldCheck } from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const [autoSyncHIS, setAutoSyncHIS] = useState(true);
  const [soundAlert, setSoundAlert] = useState(true);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-[16px] font-semibold text-[#16241A]">การตั้งค่าระบบ</h2>
        <p className="text-[12.5px] text-[#9AA69C]">จัดการการเชื่อมโยงข้อมูล HIS, ความปลอดภัยตาม PDPA และการแจ้งเตือน</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E4E9E1] divide-y divide-[#EDF1EB] text-[12.5px]">
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-[#EFF6FF] text-[#1D5FBF] rounded-xl shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[#16241A]">การเชื่อมต่อฐานข้อมูล รพ.เชียงรายประชานุเคราะห์ (HIS Sync)</h3>
              <p className="text-[#9AA69C] text-[11px] mt-0.5">ดึงค่าแล็ป eGFR และประวัติยาอัตโนมัติผ่าน RESTful API</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={autoSyncHIS}
              onChange={() => setAutoSyncHIS(!autoSyncHIS)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[#DEE4DB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#DEE4DB] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0B6B38]"></div>
          </label>
        </div>

        <div className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-[#FBF3E1] text-[#A6740A] rounded-xl shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[#16241A]">เสียงแจ้งเตือนฉุกเฉิน</h3>
              <p className="text-[#9AA69C] text-[11px] mt-0.5">เปิดเสียงแจ้งเตือนทันทีเมื่อตรวจพบเคสเสี่ยงสูงระดับสีแดง</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={soundAlert}
              onChange={() => setSoundAlert(!soundAlert)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[#DEE4DB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#DEE4DB] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0B6B38]"></div>
          </label>
        </div>

        <div className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-[#EAF3ED] text-[#0B6B38] rounded-xl shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[#16241A]">มาตรฐานความปลอดภัย PDPA & เข้ารหัสข้อมูล (AES-256)</h3>
              <p className="text-[#9AA69C] text-[11px] mt-0.5">บันทึก Audit Logs และซ่อนข้อมูลสุขภาพเชิงลึกสำหรับผู้ใช้งานกลุ่ม อสม.</p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-[#0B6B38] bg-[#EAF3ED] border border-[#CFE3D5] px-2.5 py-1 rounded-lg shrink-0">
            เปิดใช้งานตลอดเวลา
          </span>
        </div>
      </div>
    </div>
  );
};