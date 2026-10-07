import React from 'react';
import { Delete } from 'lucide-react';

interface NumberPadProps {
  value: string;
  onChange: (v: string) => void;
  allowDecimal?: boolean;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'];

export const NumberPad: React.FC<NumberPadProps> = ({ value, onChange, allowDecimal = true }) => {
  const press = (key: string) => {
    if (key === 'back') {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === '.') {
      if (!allowDecimal || value.includes('.')) return;
      // กด . ก่อนใส่ตัวเลข → เติม 0 ให้ (0.)
      if (value === '') {
        onChange('0.');
        return;
      }
    }
    if (value.replace('.', '').length >= 5) return;
    onChange(value + key);
  };

  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="แป้นตัวเลข">
      {KEYS.map((k) => {
        // ไม่รับทศนิยม → เว้นช่องว่างไว้ ไม่แสดงปุ่มที่กดไม่ได้
        if (k === '.' && !allowDecimal) return <span key={k} aria-hidden />;

        const isBack = k === 'back';

        return (
          <button
            key={k}
            type="button"
            onClick={() => press(k)}
            aria-label={isBack ? 'ลบตัวเลขล่าสุด' : k === '.' ? 'จุดทศนิยม' : `ใส่เลข ${k}`}
            className={`flex h-14 touch-manipulation select-none items-center justify-center rounded-xl text-xl font-medium transition active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5C33]/40 ${
              isBack
                ? 'text-zinc-500 hover:bg-zinc-100 active:bg-zinc-200'
                : 'bg-zinc-50 text-zinc-900 hover:bg-zinc-100 active:bg-emerald-50'
            }`}
          >
            {isBack ? <Delete className="h-5 w-5" /> : k}
          </button>
        );
      })}
    </div>
  );
};

export default NumberPad;