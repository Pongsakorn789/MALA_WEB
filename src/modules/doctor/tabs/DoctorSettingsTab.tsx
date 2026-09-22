import React from 'react';

export const DoctorSettingsTab: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white border border-[#E4E9E1] rounded-2xl p-5 space-y-4 text-[12.5px]">
      <div>
        <h2 className="text-[15px] font-semibold text-[#16241A]">ตั้งค่าระบบห้องตรวจแพทย์</h2>
        <p className="text-[#9AA69C]">ปรับแต่งการเตือน ป้องกันความเหนื่อยล้าจากเสียงเตือน (Alarm Fatigue)</p>
      </div>

      <div className="divide-y divide-[#EDF1EB]">
        <div className="py-3.5 flex justify-between items-center gap-4">
          <div>
            <p className="font-semibold text-[#16241A]">การแจ้งเตือนด้วยเสียง (Audible Emergency Alarm)</p>
            <p className="text-[#9AA69C] text-[11px] mt-0.5">ส่งเสียงเตือนเฉพาะเคส Red Tier ที่มี eGFR วิกฤตเท่านั้น</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-9 h-5 bg-[#DEE4DB] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#DEE4DB] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0B6B38]"></div>
          </label>
        </div>

        <div className="py-3.5 flex justify-between items-center gap-4">
          <div>
            <p className="font-semibold text-[#16241A]">การยืนยันตัวตนก่อนบันทึกคำสั่งยา (MOPH Digital Signature)</p>
            <p className="text-[#9AA69C] text-[11px] mt-0.5">ใช้ใบประกอบวิชาชีพแพทย์ในการลงนามคำสั่งปรับยา</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-9 h-5 bg-[#DEE4DB] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#DEE4DB] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0B6B38]"></div>
          </label>
        </div>
      </div>
    </div>
  );
};