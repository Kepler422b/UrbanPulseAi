import React from 'react';
import { getPriorityBadgeConfig } from '../../utils/formatters';
import { AlertTriangle } from 'lucide-react';

interface PriorityBadgeProps {
  level: string;
  score?: number;
  showScore?: boolean;
  className?: string;
  explanation?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  level,
  score,
  showScore = false,
  className = '',
  explanation,
}) => {
  const config = getPriorityBadgeConfig(level);

  return (
    <span
      title={explanation || `Priority Level: ${config.label} (Score: ${score ?? 'N/A'})`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className} cursor-help`}
    >
      {level.toLowerCase() === 'critical' && <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />}
      <span>{config.label}</span>
      {showScore && typeof score === 'number' && (
        <span className="opacity-75 font-mono text-[10px]">[{score.toFixed(0)}]</span>
      )}
    </span>
  );
};
