
import React from 'react';
import { Sparkles } from 'lucide-react';
import { IConteudoCanvas } from '../models';

interface CanvasCardProps {
  title: string;
  field: keyof IConteudoCanvas;
  value: string;
  color: string;
  placeholder: string;
  onChange: (value: string) => void;
  completeness: number;
  icon?: React.ReactNode;
  onAskAI?: (field: keyof IConteudoCanvas) => void;
}

export const CanvasCard: React.FC<CanvasCardProps> = ({
  title,
  field,
  value,
  color,
  placeholder,
  onChange,
  completeness,
  icon,
  onAskAI
}) => {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 relative group`}>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/10">
        <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        {onAskAI && (
            <button 
                onClick={() => onAskAI(field)}
                className="p-1.5 bg-white/40 hover:bg-white text-indigo-700 rounded-full transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-bold shadow-sm"
                title="Consultar Agente IA"
            >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">IA</span>
            </button>
        )}
      </div>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-48 p-4 bg-white/50 backdrop-blur-sm border-2 border-transparent rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-none resize-none text-sm text-gray-800 placeholder-gray-500 transition-all"
      />
      
      <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
        <div className="flex-1 bg-black/10 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${completeness}%` }}
          />
        </div>
        <span className="font-medium text-xs opacity-70">{completeness}% Preenchido</span>
      </div>
    </div>
  );
};
