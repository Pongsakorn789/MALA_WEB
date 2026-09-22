import React from 'react';
import type { Patient } from '../../../types';
import { Download } from 'lucide-react';

interface PatientListTabProps {
  patients: Patient[];
}

export const PatientListTab: React.FC<PatientListTabProps> = ({ patients }) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2 className="text-[16px] font-semibold text-[#16241A]">ทะเบียนประวัติผู้ป่วยเบาหวานในเขต</h2>
          <p className="text-[12.5px] text-[#9AA69C]">ข้อมูลเวชระเบียนผู้ป่วยที่ได้รับยา Metformin ทั้งหมดในพื้นที่ รพ.สต. บ้านดอน</p>
        </div>
        <button className="px-3.5 py-2 bg-[#0B6B38] hover:bg-[#08532b] text-white text-[12.5px] font-semibold rounded-xl flex items-center gap-1.5 transition shrink-0">
          <Download className="w-3.5 h-3.5" />
          <span>ส่งออกข้อมูล (Excel)</span>
        </button>
      </div>

      <div className="bg-white border border-[#E4E9E1] rounded-2xl overflow-hidden">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-[#FAFBF9] text-[#9AA69C] border-b border-[#EDF1EB]">
            <tr>
              <th className="py-3.5 px-4 font-medium">รหัสคนไข้</th>
              <th className="py-3.5 px-4 font-medium">ชื่อ - นามสกุล</th>
              <th className="py-3.5 px-4 font-medium">เลขบัตร ปชช.</th>
              <th className="py-3.5 px-4 font-medium">อายุ / ส่วนสูง</th>
              <th className="py-3.5 px-4 font-medium">eGFR ล่าสุด</th>
              <th className="py-3.5 px-4 font-medium">ขนาดยา Metformin</th>
              <th className="py-3.5 px-4 text-center font-medium">สิทธิ์การรักษา</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDF1EB] text-[#3B4A40]">
            {patients.map((p) => (
              <tr key={p.id} className="hover:bg-[#FAFBF9] transition">
                <td className="py-3.5 px-4 font-mono text-[#9AA69C]">{p.id}</td>
                <td className="py-3.5 px-4 font-semibold text-[#16241A]">{p.name}</td>
                <td className="py-3.5 px-4 font-mono">{p.citizenId}</td>
                <td className="py-3.5 px-4">{p.age} ปี / {p.height * 100} ซม.</td>
                <td className="py-3.5 px-4">
                  <span className={`font-semibold ${p.egfr < 30 ? 'text-[#C4392B]' : 'text-[#3B4A40]'}`}>
                    {p.egfr} mL/min
                  </span>
                </td>
                <td className="py-3.5 px-4 text-[#5C6A61]">{p.metforminDose}</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="bg-[#EFF6FF] text-[#1D5FBF] border border-[#D6E6FB] px-2.5 py-0.5 rounded-full font-medium text-[11px]">
                    บัตรทอง (UC)
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};