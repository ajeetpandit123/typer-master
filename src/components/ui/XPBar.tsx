import React from 'react';

interface XPBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
  levelName?: string;
  className?: string;
}

export const XPBar: React.FC<XPBarProps> = ({
  currentXP,
  maxXP,
  level,
  levelName,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((currentXP / (maxXP || 1)) * 100)));

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-baseline text-[12px] font-medium leading-none">
        <span className="text-[var(--color-text-secondary)]">
          {currentXP.toLocaleString()} / {maxXP.toLocaleString()} XP
        </span>
        <span className="text-[var(--color-brand)] font-bold">
          Level {level} {levelName && <span className="text-[var(--color-text-muted)] font-normal text-[10px] ml-1">({levelName})</span>}
        </span>
      </div>
      <div className="w-full bg-[var(--color-border)] h-[6px] rounded-[3px] overflow-hidden">
        <div
          className="bg-[var(--color-brand)] h-full rounded-[3px] transition-all duration-[600ms] cubic-bezier(0.4, 0, 0.2, 1)"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
