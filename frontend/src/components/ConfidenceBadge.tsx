import React from 'react';

interface ConfidenceBadgeProps {
  score?: number;
  label?: string;
  size?: 'sm' | 'md';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ score = 0.9, label, size = 'sm' }) => {
  const percent = Math.round(score * 100);
  
  let colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let dotColor = 'bg-emerald-500';

  if (percent < 70) {
    colorClass = 'bg-rose-50 text-[#D9534F] border-rose-200';
    dotColor = 'bg-[#D9534F]';
  } else if (percent < 88) {
    colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
  }

  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${colorClass} ${paddingClass} shadow-xs`}
      title={`${label ? `${label}: ` : ''}${percent}% AI confidence score`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
      {label && <span className="opacity-75 font-normal">{label}:</span>}
      <span>{percent}%</span>
    </span>
  );
};
