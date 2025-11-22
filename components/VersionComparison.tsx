
import React, { useState, useMemo } from 'react';
import { X, AlertCircle, ArrowRight } from 'lucide-react';
import { VersaoProjeto, IConteudoCanvas } from '../models';

interface VersionComparisonProps {
  versions: VersaoProjeto[];
  onClose: () => void;
}

export const VersionComparison: React.FC<VersionComparisonProps> = ({ versions, onClose }) => {
  // Default to comparing the last two versions if available, otherwise the first one twice
  const sortedVersions = useMemo(() => [...versions].sort((a, b) => b.numero - a.numero), [versions]);
  
  const [v1Id, setV1Id] = useState<string>(sortedVersions.length > 1 ? sortedVersions[1].id : sortedVersions[0]?.id || '');
  const [v2Id, setV2Id] = useState<string>(sortedVersions[0]?.id || '');

  const v1 = sortedVersions.find(v => v.id === v1Id);
  const v2 = sortedVersions.find(v => v.id === v2Id);

  const fields: { key: keyof IConteudoCanvas; label: string }[] = [
    { key: 'titulo', label: 'Título do Projeto' },
    { key: 'descricao', label: 'Descrição do Projeto' },
    { key: 'problema', label: 'Problema' },
    { key: 'objetivoGeral', label: 'Objetivos' },
    { key: 'artefatoDescricao', label: 'Artefato' },
    { key: 'metodologiaDetalhada', label: 'Metodologia' },
    { key: 'avaliacaoCriterios', label: 'Avaliação' },
    { key: 'contribuicoesPraticas', label: 'Contribuições' },
  ];

  const getValue = (version: VersaoProjeto | undefined, key: keyof IConteudoCanvas): string => {
    if (!version) return '';
    const val = version.conteudo[key];
    if (Array.isArray(val)) {
      return val.join('\n');
    }
    return String(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Comparar Versões</h3>
            <p className="text-sm text-gray-500">Selecione duas versões para visualizar as alterações.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Selectors */}
        <div className="px-6 py-4 grid grid-cols-2 gap-8 bg-white border-b border-gray-200 shadow-sm z-10">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Versão Base (Antiga)</label>
            <select 
              value={v1Id} 
              onChange={(e) => setV1Id(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              {sortedVersions.map(v => (
                <option key={v.id} value={v.id}>
                  v{v.numero} - {v.titulo} ({v.dataCriacao.toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2 relative">
             <div className="absolute top-1/2 -left-4 -translate-y-1/2 -translate-x-1/2 hidden lg:block text-gray-400">
                <ArrowRight className="w-6 h-6" />
             </div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Versão Comparada (Nova)</label>
            <select 
              value={v2Id} 
              onChange={(e) => setV2Id(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              {sortedVersions.map(v => (
                <option key={v.id} value={v.id}>
                  v{v.numero} - {v.titulo} ({v.dataCriacao.toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          <div className="space-y-6">
            {fields.map((field) => {
              const val1 = getValue(v1, field.key);
              const val2 = getValue(v2, field.key);
              const hasChanged = val1 !== val2;

              return (
                <div key={field.key} className={`bg-white rounded-xl border transition-all ${hasChanged ? 'border-amber-200 shadow-md' : 'border-gray-200 shadow-sm opacity-80'}`}>
                  <div className={`px-4 py-2 border-b flex justify-between items-center ${hasChanged ? 'bg-amber-50 border-amber-100' : 'bg-gray-50 border-gray-100'}`}>
                    <h4 className={`font-bold ${hasChanged ? 'text-amber-800' : 'text-gray-700'}`}>{field.label}</h4>
                    {hasChanged && (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full border border-amber-200">
                        <AlertCircle className="w-3 h-3" /> Modificado
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    <div className="p-4 bg-red-50/10">
                      <div className="text-xs text-gray-400 mb-2 font-mono">v{v1?.numero}</div>
                      <div className="whitespace-pre-wrap text-sm text-gray-600 font-normal leading-relaxed">
                        {val1 || <span className="text-gray-300 italic">Vazio</span>}
                      </div>
                    </div>
                    <div className="p-4 bg-green-50/10">
                      <div className="text-xs text-gray-400 mb-2 font-mono">v{v2?.numero}</div>
                      <div className="whitespace-pre-wrap text-sm text-gray-800 font-normal leading-relaxed">
                        {val2 || <span className="text-gray-300 italic">Vazio</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
