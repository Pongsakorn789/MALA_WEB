import React from 'react';
import type { Patient } from '../../../types';

interface MyPatientsTabProps {
  patients: Patient[];
}

export const MyPatientsTab: React.FC<MyPatientsTabProps> = ({ patients }) => {
  return (
    <div className="max-w-5xl mx-auto bg-white border border-[#E4E9E1] rounded-2xl p-5 space-y-4 text-[12.5px]">
      <div>
        <h2 className="text-[15px] font-semibold text-[#16241A]">คนไข้เบาหวานในความดูแล (รพ.ศูนย์)</h2>
        <p className="text-[#9AA69C]">รายชื่อผู้ป่วยโรคเบาหวานที่เคยมีประวัติถูกส่งต่อเข้ามาที่ รพ.ศูนย์</p>
      </div>

      <table className="w-full text-left">
        <thead className="bg-[#FAFBF9] text-[#9AA69C] border-b border-[#EDF1EB]">
          <tr>
            <th className="py-3 px-3 font-medium">ชื่อ-นามสกุล</th>
            <th className="py-3 px-3 font-medium">เลข ปชช.</th>
            <th className="py-3 px-3 font-medium">eGFR</th>
            <th className="py-3 px-3 font-medium">คำสั่งแพทย์ล่าสุด</th>
            <th className="py-3 px-3 text-center font-medium">สถานะ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EDF1EB]">
          {patients.map((p) => (
            <tr key={p.id} className="hover:bg-[#FAFBF9] transition">
              <td className="py-3 px-3 font-semibold text-[#16241A]">{p.name}</td>
              <td className="py-3 px-3 font-mono text-[#9AA69C]">{p.citizenId}</td>
              <td className="py-3 px-3 font-semibold text-[#C4392B]">{p.egfr}</td>
              <td className="py-3 px-3 text-[#5C6A61]">{p.doctorOrder || 'ยังไม่มีคำสั่งใหม่'}</td>
              <td className="py-3 px-3 text-center whitespace-nowrap">
                <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium border whitespace-nowrap ${
                    p.doctorOrder
                    ? 'bg-[#EAF3ED] text-[#0B6B38] border-[#CFE3D5]'
                    : 'bg-[#FBEDEB] text-[#C4392B] border-[#F2CFC9]'
                }`}>
                    {p.doctorOrder ? 'ปรับยาแล้ว' : 'รอแพทย์พิจารณา'}
                </span>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};