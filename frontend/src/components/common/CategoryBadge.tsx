import React from 'react';
import { getCategoryLabel } from '../../utils/formatters';
import { Construction, Trash2, LightbulbOff, Droplets, Layers } from 'lucide-react';

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className = '' }) => {
  const label = getCategoryLabel(category);

  const getIcon = () => {
    switch (category) {
      case 'potholes_damaged_roads':
        return <Construction className="w-3.5 h-3.5 text-amber-400" />;
      case 'garbage_overflow':
        return <Trash2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'broken_streetlights':
        return <LightbulbOff className="w-3.5 h-3.5 text-cyan-400" />;
      case 'water_drainage_leakage':
        return <Droplets className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/80 border border-slate-700/60 text-slate-200 ${className}`}
    >
      {getIcon()}
      <span>{label}</span>
    </span>
  );
};
