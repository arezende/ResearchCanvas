
import React, { useState } from 'react';
import { Search, X, UserPlus, Briefcase, GraduationCap, Calendar, Bot, Sparkles, BrainCircuit } from 'lucide-react';
import { AVAILABLE_PROFESSORS, AVAILABLE_AI_AGENTS, getInitials, getColorByName } from '../services';

interface CollaboratorModalProps {
  onClose: () => void;
  onSelect: (member: any) => void;
  existingCollaborators: string[]; // List of names already in project to prevent duplicates
}

export const CollaboratorModal: React.FC<CollaboratorModalProps> = ({ onClose, onSelect, existingCollaborators }) => {
  const [activeTab, setActiveTab] = useState<'professores' | 'ia'>('professores');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProfessors = AVAILABLE_PROFESSORS.filter(prof => {
    const term = searchTerm.toLowerCase();
    return (
      prof.nome.toLowerCase().includes(term) ||
      prof.area.toLowerCase().includes(term) ||
      prof.titulo.toLowerCase().includes(term)
    );
  });

  const filteredAI = AVAILABLE_AI_AGENTS.filter(agent => {
    const term = searchTerm.toLowerCase();
    return (
        agent.nome.toLowerCase().includes(term) ||
        agent.role.toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-indigo-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Convidar Membro</h3>
            <p className="text-sm text-gray-500">Adicione pesquisadores ou agentes IA ao seu projeto.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
            <button 
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'professores' ? 'border-b-2 border-indigo-600 text-indigo-700 bg-indigo-50/30' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('professores')}
            >
                <GraduationCap className="w-4 h-4" /> Professores
            </button>
            <button 
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'ia' ? 'border-b-2 border-purple-600 text-purple-700 bg-purple-50/30' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('ia')}
            >
                <Bot className="w-4 h-4" /> Agentes IA
            </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeTab === 'professores' ? "Buscar por nome, área ou título..." : "Buscar por agente ou especialidade..."}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
          <div className="space-y-3">
            {activeTab === 'professores' ? (
                // LISTA DE PROFESSORES
                filteredProfessors.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <p>Nenhum pesquisador encontrado.</p>
                    </div>
                ) : (
                    filteredProfessors.map((prof, index) => {
                        const isAlreadyAdded = existingCollaborators.includes(prof.nome);
                        const initials = getInitials(prof.nome);
                        const color = getColorByName(prof.nome);

                        return (
                            <div key={index} className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all flex items-start gap-4 group">
                                <div 
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm mt-1" 
                                    style={{ backgroundColor: color }}
                                >
                                    {initials}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800 text-lg leading-tight mb-1">{prof.nome}</h4>
                                    
                                    <div className="flex flex-wrap gap-y-1 gap-x-3 text-sm text-gray-600 mb-2">
                                        <span className="flex items-center gap-1">
                                            <Briefcase className="w-3 h-3" /> {prof.titulo}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> Desde {prof.inicio}
                                        </span>
                                    </div>
                                    
                                    <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium">
                                        <GraduationCap className="w-3 h-3" />
                                        {prof.area}
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => !isAlreadyAdded && onSelect(prof)}
                                    disabled={isAlreadyAdded}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0
                                        ${isAlreadyAdded 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                                        }
                                    `}
                                >
                                    {isAlreadyAdded ? (
                                        <span>Adicionado</span>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" />
                                            Convidar
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })
                )
            ) : (
                // LISTA DE AGENTES IA
                filteredAI.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <p>Nenhum agente encontrado.</p>
                    </div>
                ) : (
                    filteredAI.map((agent, index) => {
                        const isAlreadyAdded = existingCollaborators.includes(agent.nome);

                        return (
                            <div key={index} className="bg-gradient-to-r from-white to-purple-50 p-4 rounded-xl border border-purple-100 hover:shadow-md transition-all flex items-start gap-4 group ring-1 ring-purple-100">
                                <div 
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm mt-1 bg-gradient-to-br from-purple-500 to-indigo-600"
                                >
                                    <Bot className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-gray-900 text-lg leading-tight">{agent.nome}</h4>
                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase rounded-full border border-purple-200 flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" /> IA
                                        </span>
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 mb-2 leading-relaxed">{agent.desc}</p>
                                    
                                    <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                                        <BrainCircuit className="w-3 h-3" />
                                        {agent.role}
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => !isAlreadyAdded && onSelect({...agent, isAI: true})}
                                    disabled={isAlreadyAdded}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0
                                        ${isAlreadyAdded 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                            : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                                        }
                                    `}
                                >
                                    {isAlreadyAdded ? (
                                        <span>Ativo</span>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" />
                                            Ativar
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })
                )
            )}
          </div>
        </div>
        
        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-400">
            {activeTab === 'professores' 
                ? `Mostrando ${filteredProfessors.length} pesquisadores` 
                : `Mostrando ${filteredAI.length} agentes especializados`
            }
        </div>
      </div>
    </div>
  );
};