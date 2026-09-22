import React from 'react';
import { Delete } from 'lucide-react';

interface NumberPadProps {
  value: string;
  onChange: (v: string) => void;
  allowDecimal?: boolean;
}

export const NumberPad: React.FC<NumberPadProps> = ({ value, onChange, allowDecimal = true }) => {
  const press = (key: string) => {
    if (key === 'back') {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === '.' && (!allowDecimal || value.includes('.'))) return;
    if (value.replace('.', '').length >= 5) return;
    onChange(value + key);
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'];

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {keys.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => press(k)}
          disabled={k === '.' && !allowDecimal}
          aria-label={k === 'back' ? 'ลบตัวเลขล่าสุด' : `ใส่เลข ${k}`}
          className="h-14 rounded-md bg-white border border-[#DCE3DA] text-xl font-semibold text-[#17301F] hover:bg-[#F3F7EC] active:bg-[#E7EFE1] transition disabled:opacity-30 flex items-center justify-center shadow-sm"
        >
          {k === 'back' ? <Delete className="w-5 h-5 text-slate-500" /> : k}
        </button>
      ))}
    </div>
  );
};