import React from 'react';
import type { Patient } from '../../../types';

interface CpgModalProps {
  patient: Patient | null;
  onClose: () => void;
}

export const CpgModal: React.FC<CpgModalProps> = ({ patient, onClose }) => {
  if (!patient) return null;

  return (
    <div className="fixed inset-0 bg-[#0F1712]/45 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl border border-[#E4E9E1] max-w-md w-full p-6 space-y-4">
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-[#0B6B38] bg-[#EAF3ED] border border-[#CFE3D5] px-2 py-0.5 rounded-full inline-block">
            แนวทาง CPG
          </span>
          <h3 className="font-semibold text-[#16241A] text-[15px]">{patient.name}</h3>
        </div>

        <p className="text-[13px] text-[#3B4A40] bg-[#FAFBF9] border border-[#EDF1EB] p-4 rounded-xl leading-relaxed">
          {patient.cpgGuideline || 'แนะนำให้ผู้ป่วยรับประทานยาตามเวลาอย่างสม่ำเสมอ หลีกเลี่ยงภาวะขาดน้ำ และนัดตรวจค่าไตทุก 6 เดือน'}
        </p>

        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0B6B38] hover:bg-[#08532b] text-white text-[13px] font-semibold rounded-xl transition"
          >
            บันทึกคำแนะนำเรียบร้อย
          </button>
        </div>
      </div>
    </div>
  );
};