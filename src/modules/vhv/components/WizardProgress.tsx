import React from 'react';

interface WizardProgressProps {
  currentStepIndex: number;
  currentLabel: string;
  stepLabels: string[];
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStepIndex,
  currentLabel,
  stepLabels,
}) => {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12.5px] font-medium text-[#5C6B5F]">{currentLabel}</span>
        <span className="text-[11.5px] text-[#8A968C] tabular-nums font-mono">
          ขั้นที่ {currentStepIndex + 1} / 5
        </span>
      </div>
      <div className="flex gap-1.5">
        {stepLabels.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= currentStepIndex ? 'bg-[#0E5C33]' : 'bg-[#E1E4DB]'
            }`}
          />
        ))}
      </div>
    </div>
  );
};