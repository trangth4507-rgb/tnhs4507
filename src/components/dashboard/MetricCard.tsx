import React, { useEffect, useState } from 'react';

interface MetricCardProps {
  label: string;
  value: number;
  colorClass: string;
  bgClass: string;
  icon: React.ReactNode;
  onClick?: () => void;
  gradientClass?: string;
  trend?: { value: number; label: string };
}

export default function MetricCard({ label, value, colorClass, bgClass, icon, onClick, gradientClass, trend }: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) { setDisplayValue(0); return; }
    const duration = 700;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplayValue(end); clearInterval(timer); }
      else setDisplayValue(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  if (gradientClass) {
    return (
      <div
        className={`${gradientClass} rounded-xl p-5 flex items-center gap-4 text-white ${onClick ? 'cursor-pointer card-hover' : ''} shadow-md`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      >
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
          <span className="text-white">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-0.5">{label}</p>
          <p className="text-3xl font-heading font-bold text-white animate-count-up leading-none">{displayValue}</p>
          {trend && (
            <p className="text-xs text-white/70 mt-1">
              <span className="text-white font-semibold">+{trend.value}</span> {trend.label}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-card border border-border rounded-xl p-5 flex items-center gap-4 card-hover ${onClick ? 'cursor-pointer hover:border-primary/30' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center flex-shrink-0`}>
        <span className={colorClass}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-caption text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-h2 font-heading font-bold ${colorClass} animate-count-up leading-none`}>{displayValue}</p>
      </div>
    </div>
  );
}
