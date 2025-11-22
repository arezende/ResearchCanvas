
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Save, FileText, Share2, Users, BarChart3, 
  Download, Plus, MessageSquare, Clock, CheckCircle, 
  AlertCircle, Target, Lightbulb, Settings, GitBranch,
  Loader2, GitCompare, Trash2, CornerDownRight, Send,
  Bot, Sparkles, PenLine, BookOpen, Search, AtSign
} from 'lucide-react';
import { 
  Projeto, ConteudoCanvas, Colaborador, 
  Comentario, TipoComentario, NivelAcesso, VersaoProjeto, Resposta
} from './models';
import { 
  ProjetoService, 
  ConteudoService, 
  VersaoProjetoService, 
  ComentarioService, 
  ColaboradorService,
  AIService,
  getInitials,
  getColorByName
} from './services';
import { CanvasCard } from './components/CanvasCard';
import { VersionComparison } from './components/VersionComparison';
import { CollaboratorModal } from './components/CollaboratorModal';

const ResearchCanvasApp = () => {
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('canvas');
  const [saveMessage, setSaveMessage] = useState('');
  
  const [isNewVersionModalOpen, setIsNewVersionModalOpen] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);
  
  // AI Helper States
  const [isAIHelpModalOpen, setIsAIHelpModalOpen] = useState(false);
  const [aiTargetField, setAiTargetField] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [newVersionTitle, setNewVersionTitle] = useState('');
  const [newVersionDesc, setNewVersionDesc] = useState('');
  
  // Discussion States
  const [newCommentText, setNewCommentText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [processingAiResponse, setProcessingAiResponse] = useState(false);

  // Mention System State
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionActiveInput, setMentionActiveInput] = useState<'comment' | 'reply' | null>(null);
  
  // Library State
  const [librarySearch, setLibrarySearch] = useState('');

  // Force update mechanism for deep object changes in UI before sync
  const [, updateState] = useState({});
  const forceUpdate = useCallback(() => updateState({}), []);

  // Mock Library Data
  const libraryProjects = [
    {
      id: 1,
      titulo: 'Sistema de Gamificação para EAD',
      autor: 'João Silva',
      descricao: 'Plataforma para engajamento em cursos online.',
      tags: ['Educação', 'Gamificação'],
      problema: 'Altas taxas de evasão e baixo engajamento dos alunos em plataformas de ensino a distância assíncronas.',
      objetivos: 'Criar um framework adaptativo que utilize mecânicas de jogos para aumentar a retenção.',
      artefato: 'Plataforma Web (Software) com sistema de pontuação dinâmica e badges.'
    },
    {
      id: 2,
      titulo: 'Framework de Avaliação de Acessibilidade',
      autor: 'Maria Santos',
      descricao: 'Metodologia para avaliação em governos digitais.',
      tags: ['Acessibilidade', 'GovTech'],
      problema: 'Falta de padronização na avaliação de acessibilidade em portais de serviços públicos municipais.',
      objetivos: 'Desenvolver um método de inspeção simplificado para gestores públicos.',
      artefato: 'Método (Checklist e Processo) de avaliação heurística.'
    },
    {
      id: 3,
      titulo: 'IA para Diagnóstico de Imagens',
      autor: 'Carlos Oliveira',
      descricao: 'Uso de Deep Learning para raio-x pulmonar.',
      tags: ['Saúde', 'IA', 'Visão Computacional'],
      problema: 'Escassez de radiologistas em regiões remotas para laudos rápidos de doenças pulmonares.',
      objetivos: 'Automatizar a triagem inicial de exames de raio-x torácico.',
      artefato: 'Modelo de Deep Learning (CNN) e API de inferência.'
    }
  ];

  // Carregar projeto inicial
  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoading(true);
        // Simulando fetch do projeto ID '1'
        const data = await ProjetoService.getById('1');
        setProjeto(data);
      } catch (error) {
        console.error("Erro ao carregar projeto:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, []);

  const currentVersion = projeto?.getVersaoAtual();
  const stats = projeto?.getEstatisticas();
  const activeAIAgents = projeto?.colaboradores.filter(c => c.isAI) || [];

  // Derived title for sticky header
  const displayTitle = currentVersion?.conteudo.titulo || projeto?.titulo || 'Carregando...';

  // --- MENTION LOGIC ---

  const checkForMentions = (text: string, inputType: 'comment' | 'reply') => {
      const lastAt = text.lastIndexOf('@');
      if (lastAt !== -1) {
          const textAfterAt = text.substring(lastAt + 1);
          // If there's a space, we assume the mention is "closed" or user is just typing text
          if (!textAfterAt.includes(' ')) {
              setMentionQuery(textAfterAt);
              setMentionActiveInput(inputType);
              return;
          }
      }
      setMentionQuery(null);
      setMentionActiveInput(null);
  };

  const insertMention = (name: string) => {
      if (mentionActiveInput === 'comment') {
          const lastAt = newCommentText.lastIndexOf('@');
          const newText = newCommentText.substring(0, lastAt) + `@${name} ` + newCommentText.substring(lastAt + (mentionQuery?.length || 0) + 1);
          setNewCommentText(newText);
      } else if (mentionActiveInput === 'reply') {
          const lastAt = replyText.lastIndexOf('@');
          const newText = replyText.substring(0, lastAt) + `@${name} ` + replyText.substring(lastAt + (mentionQuery?.length || 0) + 1);
          setReplyText(newText);
      }
      setMentionQuery(null);
      setMentionActiveInput(null);
  };

  const getFilteredCollaborators = () => {
      if (!projeto || mentionQuery === null) return [];
      return projeto.colaboradores.filter(c => 
          c.nome.toLowerCase().includes(mentionQuery.toLowerCase())
      );
  };

  const processAIMentions = async (text: string, parentCommentId?: string) => {
      if (!projeto) return;
      
      // Regex to find @Mentions (simple version)
      const mentionRegex = /@([a-zA-ZÀ-ÿ0-9 .()]+)/g;
      const matches = [...text.matchAll(mentionRegex)];
      
      const mentionedAgents = matches
          .map(match => match[1].trim())
          .map(name => projeto.colaboradores.find(c => c.nome === name && c.isAI))
          .filter(agent => agent !== undefined) as Colaborador[];

      if (mentionedAgents.length > 0) {
          setProcessingAiResponse(true);
          // Process each agent response
          for (const agent of mentionedAgents) {
              try {
                  const aiResponse = await AIService.generateDiscussionResponse(agent.nome, text);
                  
                  if (parentCommentId) {
                      // Reply to existing comment
                      await ComentarioService.reply(projeto.id, parentCommentId, {
                          texto: aiResponse,
                          autorNome: agent.nome,
                          autorIniciais: 'IA',
                          autorCor: agent.cor
                      });
                  } else {
                      // New comment (though typically AI replies to main comments, 
                      // if user mentions in main comment, AI creates a new main comment or we could structure it differently. 
                      // For now, let's just add a main comment from AI)
                      await ComentarioService.add(projeto.id, {
                          texto: aiResponse,
                          autorNome: agent.nome,
                          autorIniciais: 'IA',
                          autorCor: agent.cor,
                          tipo: TipoComentario.SUGESTAO
                      });
                  }
              } catch (e) {
                  console.error("AI failed to respond", e);
              }
          }
          
          // Refresh project
          const updated = await ProjetoService.getById(projeto.id);
          setProjeto(updated);
          setProcessingAiResponse(false);
      }
  };

  // --- HANDLERS ---

  const handleSave = async () => {
    if (!projeto || !currentVersion) return;

    try {
      setIsSaving(true);
      await ConteudoService.update(currentVersion.id, currentVersion.conteudo);
      
      const projetoParaSalvar = new Projeto({
          ...projeto,
          titulo: currentVersion.conteudo.titulo,
          descricao: currentVersion.conteudo.descricao
      });

      const updatedProjeto = await ProjetoService.update(projetoParaSalvar);
      setProjeto(updatedProjeto);
      
      setSaveMessage('Projeto salvo com sucesso! ✓');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Erro ao salvar!');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateContent = (field: keyof ConteudoCanvas, value: string) => {
    if (currentVersion) {
      (currentVersion.conteudo as any)[field] = value;
      forceUpdate();
    }
  };

  const handleCreateVersion = async () => {
    if (!newVersionTitle.trim() || !projeto || !currentVersion) return;
    
    try {
      setIsSaving(true);
      const conteudoClone = currentVersion.conteudo.clone();
      const mudancas = conteudoClone.compararCom(currentVersion.conteudo); 

      const novaVersaoData = {
          numero: projeto.versoes.length + 1,
          titulo: newVersionTitle,
          descricao: newVersionDesc,
          conteudo: conteudoClone,
          autorId: 'current_user',
          mudancas: mudancas.length ? mudancas : ['Nova versão criada manualmente']
      };

      await VersaoProjetoService.create(projeto.id, novaVersaoData);
      const projetoAtualizado = await ProjetoService.getById(projeto.id);
      setProjeto(projetoAtualizado);

      setIsNewVersionModalOpen(false);
      setNewVersionTitle('');
      setNewVersionDesc('');
      setSaveMessage('Nova versão criada! ✓');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setSaveMessage('Erro ao criar versão');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadVersion = (versionId: string) => {
    if (projeto) {
        projeto.versaoAtualId = versionId;
        forceUpdate();
    }
  };

  const handleDuplicateVersion = async (version: VersaoProjeto) => {
      if (!projeto) return;
      try {
          setIsSaving(true);
          await VersaoProjetoService.duplicate(version, 'current_user');
          const projetoAtualizado = await ProjetoService.getById(projeto.id);
          setProjeto(projetoAtualizado);
          setSaveMessage('Versão duplicada! ✓');
          setTimeout(() => setSaveMessage(''), 3000);
      } catch (err) {
          console.error(err);
      } finally {
          setIsSaving(false);
      }
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim() || !projeto) return;
    
    try {
        const textToSend = newCommentText;
        setNewCommentText(''); // Clear immediately for UX
        setMentionQuery(null);

        const tempComment = new Comentario({
            texto: textToSend,
            autorNome: 'Anderson Rezende',
            autorIniciais: 'AR',
            autorCor: '#10b981',
            dataCriacao: new Date()
        });
        
        await ComentarioService.add(projeto.id, tempComment);
        
        // Refresh to show user comment
        let projetoAtualizado = await ProjetoService.getById(projeto.id);
        setProjeto(projetoAtualizado);

        // Process AI Mentions
        await processAIMentions(textToSend);

    } catch (error) {
        console.error(error);
        setSaveMessage('Erro ao enviar comentário');
    }
  };

  const handleRemoveComment = async (commentId: string) => {
    if (!projeto || !window.confirm("Tem certeza que deseja remover este comentário?")) return;

    try {
      await ComentarioService.remove(projeto.id, commentId);
      const projetoAtualizado = await ProjetoService.getById(projeto.id);
      setProjeto(projetoAtualizado);
      setSaveMessage('Comentário removido.');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch(err) {
      console.error(err);
      setSaveMessage('Erro ao remover comentário');
    }
  };

  const handleReplySubmit = async (commentId: string) => {
    if (!replyText.trim() || !projeto) return;

    try {
      const textToSend = replyText;
      setReplyText('');
      setActiveReplyId(null);
      setMentionQuery(null);

      await ComentarioService.reply(projeto.id, commentId, {
        texto: textToSend,
        autorNome: 'Anderson Rezende',
        autorIniciais: 'AR',
        autorCor: '#10b981',
      });
      
      // Refresh to show user reply
      let projetoAtualizado = await ProjetoService.getById(projeto.id);
      setProjeto(projetoAtualizado);
      
      // Process AI Mentions in this reply
      await processAIMentions(textToSend, commentId);

    } catch (error) {
      console.error(error);
      setSaveMessage('Erro ao responder');
    }
  };

  const handleSelectCollaborator = async (member: any) => {
      if (!projeto) return;
      
      const isAI = member.isAI === true;
      const initials = isAI ? 'IA' : getInitials(member.nome);
      const color = member.color || getColorByName(member.nome);

      try {
          await ColaboradorService.add(projeto.id, {
              nome: member.nome,
              iniciais: initials,
              cor: color,
              nivelAcesso: NivelAcesso.VISUALIZADOR,
              isAI: isAI
          });
          
          const projetoAtualizado = await ProjetoService.getById(projeto.id);
          setProjeto(projetoAtualizado);
          
          setSaveMessage(`${member.nome} convidado! ✓`);
          setTimeout(() => setSaveMessage(''), 3000);
      } catch (e) {
          console.error(e);
          setSaveMessage('Erro ao adicionar membro');
      }
  }

  const handleAskAI = (field: string) => {
      setAiTargetField(field);
      setIsAIHelpModalOpen(true);
  }

  const handleConsultAgent = async (agent: Colaborador) => {
      if(!projeto || !currentVersion || !aiTargetField) return;
      
      setIsGeneratingAI(true);
      try {
          const currentContent = (currentVersion.conteudo as any)[aiTargetField] || '';
          const suggestion = await AIService.generateSuggestion(agent.nome, aiTargetField, currentContent.toString());
          
          await ComentarioService.add(projeto.id, {
              texto: suggestion,
              autorNome: agent.nome,
              autorIniciais: 'IA',
              autorCor: agent.cor,
              tipo: TipoComentario.SUGESTAO
          });

          const projetoAtualizado = await ProjetoService.getById(projeto.id);
          setProjeto(projetoAtualizado);

          setSaveMessage(`Sugestão de ${agent.nome} adicionada!`);
          setTimeout(() => setSaveMessage(''), 3000);
          
          setIsAIHelpModalOpen(false);
          setActiveTab('colaboracao');
      } catch (e) {
          console.error(e);
          setSaveMessage('Erro ao consultar IA');
      } finally {
          setIsGeneratingAI(false);
      }
  }

  const calculateFieldProgress = (text: string) => {
    return Math.min(Math.round((text.length / 200) * 100), 100);
  };

  const exportData = () => {
    if(!projeto) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projeto, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "projeto_dsr.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 text-indigo-600">
              <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 animate-spin" />
                  <p className="font-medium text-gray-500">Carregando projeto...</p>
              </div>
          </div>
      );
  }

  if (!projeto || !stats) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      
      {/* HEADER */}
      <header className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 text-white shadow-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <GitBranch className="w-6 h-6 text-pink-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{displayTitle}</h1>
                  <div className="flex items-center gap-2 text-indigo-100 text-sm mt-0.5">
                    <span className="bg-indigo-500/30 px-2 py-0.5 rounded text-xs font-medium border border-indigo-400/30">
                      {currentVersion?.titulo}
                    </span>
                    <span>•</span>
                    <span>Atualizado {projeto.dataAtualizacao.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-indigo-200 font-medium uppercase tracking-wider">Completude</div>
                <div className="text-3xl font-bold leading-none">{stats.completude}%</div>
              </div>
              <div className="w-12 h-12 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-indigo-900/30" />
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
                    strokeDasharray={125.6} 
                    strokeDashoffset={125.6 - (125.6 * stats.completude) / 100} 
                    className="text-green-400 transition-all duration-1000 ease-out" 
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ALERT TOAST */}
      {saveMessage && (
        <div className="fixed top-24 right-6 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-2xl z-50 animate-bounce flex items-center gap-2 font-medium">
          <CheckCircle className="w-5 h-5" />
          {saveMessage}
        </div>
      )}

      {/* NAVIGATION */}
      <nav className="bg-white border-b border-gray-200 sticky top-[88px] z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto hide-scrollbar space-x-1">
            {[
              { id: 'canvas', label: 'Canvas DSR', icon: FileText },
              { id: 'versoes', label: 'Versões', icon: Clock },
              { id: 'colaboracao', label: 'Colaboração', icon: MessageSquare },
              { id: 'biblioteca', label: 'Biblioteca', icon: BookOpen },
              { id: 'dashboard', label: 'Relatórios', icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                    ${isActive 
                      ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB: CANVAS */}
        {activeTab === 'canvas' && currentVersion && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
              <div className="w-full md:w-2/3">
                 <div className="group relative">
                    <input 
                        type="text"
                        value={currentVersion.conteudo.titulo}
                        onChange={(e) => handleUpdateContent('titulo', e.target.value)}
                        className="text-3xl font-bold text-gray-800 bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-indigo-500 focus:outline-none w-full transition-all px-1 -ml-1 placeholder-gray-300"
                        placeholder="Nome do Projeto"
                    />
                    <PenLine className="w-4 h-4 text-gray-400 absolute right-full top-1/2 -translate-y-1/2 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
                 <div className="group relative mt-1">
                    <input 
                        type="text"
                        value={currentVersion.conteudo.descricao}
                        onChange={(e) => handleUpdateContent('descricao', e.target.value)}
                        className="text-base text-gray-500 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-indigo-500 focus:outline-none w-full transition-all px-1 -ml-1 placeholder-gray-300"
                        placeholder="Subtítulo ou breve descrição do projeto..."
                    />
                 </div>
              </div>

              <div className="flex gap-2 self-start md:self-center">
                <button onClick={() => setIsNewVersionModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm">
                  <Plus className="w-4 h-4" /> Nova Versão
                </button>
                <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors shadow-sm disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />} Salvar
                </button>
                <button onClick={exportData} className="p-2 text-gray-500 hover:text-indigo-600 transition-colors" title="Exportar JSON">
                    <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CanvasCard
                title="Problema"
                icon={<AlertCircle className="w-5 h-5 opacity-50"/>}
                field="problema"
                value={currentVersion.conteudo.problema}
                onChange={(val) => handleUpdateContent('problema', val)}
                onAskAI={handleAskAI}
                color="from-amber-50 to-orange-100"
                placeholder="Qual o problema prático? Quem sofre com ele? Por que é relevante?"
                completeness={calculateFieldProgress(currentVersion.conteudo.problema)}
              />
              <CanvasCard
                title="Objetivos"
                icon={<Target className="w-5 h-5 opacity-50"/>}
                field="objetivoGeral"
                value={currentVersion.conteudo.objetivoGeral}
                onChange={(val) => handleUpdateContent('objetivoGeral', val)}
                onAskAI={handleAskAI}
                color="from-emerald-50 to-teal-100"
                placeholder="Objetivo Geral e Específicos. O que você pretende alcançar?"
                completeness={calculateFieldProgress(currentVersion.conteudo.objetivoGeral)}
              />
              <CanvasCard
                title="Artefato"
                icon={<Lightbulb className="w-5 h-5 opacity-50"/>}
                field="artefatoDescricao"
                value={currentVersion.conteudo.artefatoDescricao}
                onChange={(val) => handleUpdateContent('artefatoDescricao', val)}
                onAskAI={handleAskAI}
                color="from-purple-50 to-violet-100"
                placeholder="Descreva a solução proposta (Constructo, Modelo, Método, Instanciação...)"
                completeness={calculateFieldProgress(currentVersion.conteudo.artefatoDescricao)}
              />
              <CanvasCard
                title="Método"
                icon={<Settings className="w-5 h-5 opacity-50"/>}
                field="metodologiaDetalhada"
                value={currentVersion.conteudo.metodologiaDetalhada}
                onChange={(val) => handleUpdateContent('metodologiaDetalhada', val)}
                onAskAI={handleAskAI}
                color="from-blue-50 to-cyan-100"
                placeholder="Como a pesquisa será conduzida? Etapas, coleta de dados..."
                completeness={calculateFieldProgress(currentVersion.conteudo.metodologiaDetalhada)}
              />
              <CanvasCard
                title="Avaliação"
                icon={<BarChart3 className="w-5 h-5 opacity-50"/>}
                field="avaliacaoCriterios"
                value={currentVersion.conteudo.avaliacaoCriterios}
                onChange={(val) => handleUpdateContent('avaliacaoCriterios', val)}
                onAskAI={handleAskAI}
                color="from-rose-50 to-pink-100"
                placeholder="Como você saberá que o artefato resolve o problema? Métricas e instrumentos."
                completeness={calculateFieldProgress(currentVersion.conteudo.avaliacaoCriterios)}
              />
              <CanvasCard
                title="Contribuições"
                icon={<Share2 className="w-5 h-5 opacity-50"/>}
                field="contribuicoesPraticas"
                value={currentVersion.conteudo.contribuicoesPraticas.join('\n')}
                onChange={(val) => {
                    const lines = val.split('\n');
                    (currentVersion.conteudo as any).contribuicoesPraticas = lines;
                    forceUpdate();
                }}
                onAskAI={handleAskAI}
                color="from-sky-50 to-indigo-100"
                placeholder="Contribuições para a base de conhecimento e para a prática."
                completeness={calculateFieldProgress(currentVersion.conteudo.contribuicoesPraticas.join(''))}
              />
            </div>

            {/* Collaborators Section in Canvas Tab */}
            <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        Colaboradores do Projeto
                    </h3>
                    <button
                        onClick={() => setIsCollaboratorModalOpen(true)}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Convidar
                    </button>
                </div>
                <div className="flex flex-wrap gap-3">
                    {projeto.colaboradores.length === 0 && (
                        <span className="text-gray-400 text-sm italic">Nenhum colaborador adicionado ainda.</span>
                    )}
                    {projeto.colaboradores.map((colab) => (
                        <div key={colab.id} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                                style={{ backgroundColor: colab.cor }}
                            >
                                {colab.isAI ? <Bot className="w-4 h-4" /> : colab.iniciais}
                            </div>
                            <span className="font-medium text-gray-700 text-sm">{colab.nome}</span>
                            {colab.isAI && (
                                <span className="bg-purple-100 text-purple-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">IA</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}

        {/* TAB: VERSIONS */}
        {activeTab === 'versoes' && (
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Histórico de Versões</h2>
                    <div className="flex gap-2">
                      <button 
                          onClick={() => setIsComparisonModalOpen(true)}
                          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
                      >
                          <GitCompare className="w-4 h-4"/> Comparar
                      </button>
                      <button 
                          onClick={() => setIsNewVersionModalOpen(true)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
                      >
                          <Plus className="w-4 h-4"/> Nova Versão
                      </button>
                    </div>
                </div>

                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                    {[...projeto.versoes].reverse().map((versao) => {
                        const isCurrent = versao.id === projeto.versaoAtualId;
                        return (
                            <div key={versao.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${isCurrent ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-500'}`}>
                                    <GitBranch className="w-5 h-5" />
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900">{versao.titulo}</span>
                                            {isCurrent && <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-medium">Atual</span>}
                                        </div>
                                        <span className="text-xs text-gray-500">{versao.dataCriacao.toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-4">{versao.descricao || 'Sem descrição.'}</p>
                                    
                                    <div className="mb-3 text-xs text-gray-500 border-l-2 border-indigo-100 pl-2">
                                        <p><span className="font-medium">Projeto:</span> {versao.conteudo.titulo}</p>
                                    </div>

                                    {versao.mudancas.length > 0 && (
                                        <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 mb-4">
                                            <p className="font-semibold mb-1">Alterações:</p>
                                            <ul className="list-disc list-inside space-y-0.5">
                                                {versao.mudancas.map((m, idx) => <li key={idx}>{m}</li>)}
                                            </ul>
                                        </div>
                                    )}

                                    {!isCurrent && (
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleLoadVersion(versao.id)}
                                                className="text-indigo-600 text-sm font-medium hover:underline"
                                            >
                                                Carregar
                                            </button>
                                            <button 
                                                onClick={() => handleDuplicateVersion(versao)}
                                                className="text-gray-500 text-sm font-medium hover:text-gray-700 hover:underline"
                                            >
                                                {isSaving ? 'Duplicando...' : 'Duplicar'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* TAB: COLLABORATION */}
        {activeTab === 'colaboracao' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Team List */}
             <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600"/> Equipe
                    </h3>
                    <div className="space-y-3">
                        {projeto.colaboradores.map((colab) => (
                            <div key={colab.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm" style={{ backgroundColor: colab.cor }}>
                                    {colab.isAI ? <Bot className="w-5 h-5"/> : colab.iniciais}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1">
                                        <p className="font-medium text-gray-900 text-sm">{colab.nome}</p>
                                        {colab.isAI && <span className="bg-purple-100 text-purple-700 text-[9px] px-1 rounded border border-purple-200 font-bold">IA</span>}
                                    </div>
                                    <p className="text-xs text-gray-500 capitalize">{colab.nivelAcesso.toLowerCase()}</p>
                                </div>
                            </div>
                        ))}
                        <button 
                            onClick={() => setIsCollaboratorModalOpen(true)}
                            className="w-full py-2 mt-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4"/> Convidar Membro
                        </button>
                    </div>
                </div>
             </div>

             {/* Comments Feed */}
             <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col relative">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-600"/> Discussão
                        {processingAiResponse && (
                            <span className="ml-auto flex items-center gap-2 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full animate-pulse">
                                <Bot className="w-3 h-3"/> IA digitando...
                            </span>
                        )}
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-6 max-h-[600px]">
                        {projeto.comentarios.length === 0 && (
                            <div className="text-center text-gray-400 py-12">
                                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20"/>
                                <p>Nenhum comentário ainda.</p>
                            </div>
                        )}
                        {projeto.comentarios.map((comentario) => (
                            <div key={comentario.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex gap-4">
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm" style={{ backgroundColor: comentario.autorCor }}>
                                      {comentario.autorIniciais}
                                  </div>
                                  <div className="flex-1">
                                      <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none shadow-sm relative group">
                                          <div className="flex justify-between items-baseline mb-1">
                                              <span className="font-bold text-gray-900 text-sm">{comentario.autorNome}</span>
                                              <span className="text-xs text-gray-400">{comentario.dataCriacao.toLocaleDateString()}</span>
                                          </div>
                                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{comentario.texto}</p>
                                      </div>
                                      
                                      <div className="flex gap-4 mt-1 ml-2">
                                          <button 
                                            onClick={() => setActiveReplyId(activeReplyId === comentario.id ? null : comentario.id)}
                                            className="text-xs text-gray-500 font-medium hover:text-indigo-600 flex items-center gap-1"
                                          >
                                            <CornerDownRight className="w-3 h-3"/> Responder
                                          </button>
                                          <button 
                                            onClick={() => handleRemoveComment(comentario.id)}
                                            className="text-xs text-gray-500 font-medium hover:text-red-600 flex items-center gap-1"
                                          >
                                            <Trash2 className="w-3 h-3"/> Remover
                                          </button>
                                      </div>

                                      {/* REPLIES */}
                                      {comentario.respostas && comentario.respostas.length > 0 && (
                                        <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-100 ml-4">
                                          {comentario.respostas.map(resposta => (
                                            <div key={resposta.id} className="flex gap-3 animate-in fade-in">
                                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ backgroundColor: resposta.autorCor }}>
                                                  {resposta.autorIniciais}
                                              </div>
                                              <div className="bg-white border border-gray-100 p-3 rounded-xl rounded-tl-none flex-1">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <span className="font-bold text-gray-800 text-xs">{resposta.autorNome}</span>
                                                    <span className="text-[10px] text-gray-400">{resposta.dataCriacao.toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-wrap">{resposta.texto}</p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {/* REPLY INPUT */}
                                      {activeReplyId === comentario.id && (
                                        <div className="mt-3 ml-4 animate-in fade-in slide-in-from-top-1 relative">
                                            {/* MENTION LIST POPUP (Reply) */}
                                            {mentionQuery !== null && mentionActiveInput === 'reply' && (
                                                <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-20">
                                                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500">
                                                        Mencionar Colaborador
                                                    </div>
                                                    <div className="max-h-40 overflow-y-auto">
                                                        {getFilteredCollaborators().map(c => (
                                                            <button 
                                                                key={c.id} 
                                                                className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 flex items-center gap-2"
                                                                onClick={() => insertMention(c.nome)}
                                                            >
                                                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: c.cor }}>
                                                                    {c.isAI ? <Bot className="w-3 h-3"/> : c.iniciais}
                                                                </div>
                                                                <span>{c.nome}</span>
                                                            </button>
                                                        ))}
                                                        {getFilteredCollaborators().length === 0 && (
                                                            <div className="px-3 py-2 text-sm text-gray-400 italic">Nenhum membro encontrado</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                          <div className="flex gap-2">
                                            <input 
                                              type="text"
                                              autoFocus
                                              value={replyText}
                                              onChange={(e) => {
                                                  setReplyText(e.target.value);
                                                  checkForMentions(e.target.value, 'reply');
                                              }}
                                              placeholder="Escreva uma resposta... (use @ para mencionar)"
                                              className="flex-1 text-sm border border-indigo-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                              onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit(comentario.id)}
                                            />
                                            <button 
                                              onClick={() => handleReplySubmit(comentario.id)}
                                              className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                            >
                                              <Send className="w-4 h-4"/>
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                  </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 pt-4 relative">
                        {/* MENTION LIST POPUP (Main Comment) */}
                        {mentionQuery !== null && mentionActiveInput === 'comment' && (
                            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-20">
                                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500">
                                    Mencionar Colaborador
                                </div>
                                <div className="max-h-40 overflow-y-auto">
                                    {getFilteredCollaborators().map(c => (
                                        <button 
                                            key={c.id} 
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 flex items-center gap-2"
                                            onClick={() => insertMention(c.nome)}
                                        >
                                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: c.cor }}>
                                                {c.isAI ? <Bot className="w-3 h-3"/> : c.iniciais}
                                            </div>
                                            <span>{c.nome}</span>
                                        </button>
                                    ))}
                                    {getFilteredCollaborators().length === 0 && (
                                        <div className="px-3 py-2 text-sm text-gray-400 italic">Nenhum membro encontrado</div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input 
                                    type="text" 
                                    value={newCommentText}
                                    onChange={(e) => {
                                        setNewCommentText(e.target.value);
                                        checkForMentions(e.target.value, 'comment');
                                    }}
                                    placeholder="Escreva um comentário... (use @ para mencionar)"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm pr-8"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                />
                                <AtSign className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 opacity-50" />
                            </div>
                            <button 
                                onClick={handleAddComment}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                <Share2 className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        )}

        {/* TAB: LIBRARY */}
        {activeTab === 'biblioteca' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Biblioteca de Projetos</h2>
                    <p className="text-gray-500">Explore pesquisas similares e referências para seu trabalho.</p>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
                    <input 
                        type="text" 
                        value={librarySearch}
                        onChange={(e) => setLibrarySearch(e.target.value)}
                        placeholder="Buscar projetos..." 
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {libraryProjects
                    .filter(p => p.titulo.toLowerCase().includes(librarySearch.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(librarySearch.toLowerCase())))
                    .map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all relative group cursor-pointer h-72 flex flex-col">
                        
                        {/* Static Content */}
                        <div className="p-6 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-wide">
                                    DSR Project
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{item.titulo}</h3>
                            <p className="text-sm text-gray-600 mb-4">por <span className="font-medium text-gray-800">{item.autor}</span></p>
                            <p className="text-sm text-gray-500 line-clamp-3 mb-auto">{item.descricao}</p>
                            
                            <div className="flex flex-wrap gap-2 mt-4">
                                {item.tags.map(tag => (
                                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">#{tag}</span>
                                ))}
                            </div>
                        </div>

                        {/* Hover Tooltip Overlay */}
                        <div className="absolute inset-0 bg-indigo-900/95 backdrop-blur-sm p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-center text-white overflow-y-auto z-10">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> Problema
                                    </h4>
                                    <p className="text-sm leading-relaxed text-indigo-50">{item.problema}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Target className="w-3 h-3" /> Objetivos
                                    </h4>
                                    <p className="text-sm leading-relaxed text-emerald-50">{item.objetivos}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Lightbulb className="w-3 h-3" /> Artefato
                                    </h4>
                                    <p className="text-sm leading-relaxed text-purple-50">{item.artefato}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB: DASHBOARD */}
        {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                            <GitBranch className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Versões</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalVersoes}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Colaboradores</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalColaboradores}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Comentários</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalComentarios}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-100 text-rose-600 rounded-lg">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Completude</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.completude}%</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </main>

      {/* MODAL: NEW VERSION */}
      {isNewVersionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Nova Versão</h3>
                    <button onClick={() => setIsNewVersionModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título da Versão</label>
                        <input 
                            type="text" 
                            value={newVersionTitle}
                            onChange={(e) => setNewVersionTitle(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Ex: Ajustes Pós-Banca"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição das Mudanças</label>
                        <textarea 
                            value={newVersionDesc}
                            onChange={(e) => setNewVersionDesc(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                            placeholder="O que mudou nesta versão?"
                        />
                    </div>
                    <div className="bg-blue-50 text-blue-700 text-sm p-4 rounded-lg flex gap-3">
                        <Lightbulb className="w-5 h-5 shrink-0"/>
                        <p>A nova versão será uma cópia do estado atual do canvas. Certifique-se de que salvou suas últimas alterações.</p>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                    <button 
                        onClick={() => setIsNewVersionModalOpen(false)}
                        className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleCreateVersion}
                        disabled={isSaving}
                        className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                    >
                        {isSaving && <Loader2 className="w-3 h-3 animate-spin"/>} Criar Versão
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* MODAL: VERSION COMPARISON */}
      {isComparisonModalOpen && projeto && (
        <VersionComparison 
          versions={projeto.versoes} 
          onClose={() => setIsComparisonModalOpen(false)} 
        />
      )}

      {/* MODAL: COLLABORATOR SELECTION */}
      {isCollaboratorModalOpen && projeto && (
        <CollaboratorModal
            onClose={() => setIsCollaboratorModalOpen(false)}
            onSelect={handleSelectCollaborator}
            existingCollaborators={projeto.colaboradores.map(c => c.nome)}
        />
      )}

      {/* MODAL: AI CONSULTATION */}
      {isAIHelpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-purple-50">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600"/>
                        <h3 className="text-lg font-bold text-gray-900">Consultar Agente IA</h3>
                    </div>
                    <button onClick={() => setIsAIHelpModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-600 mb-4 text-sm">Selecione um agente especialista da sua equipe para analisar o campo <strong>{aiTargetField}</strong>:</p>
                    
                    {activeAIAgents.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <Bot className="w-10 h-10 text-gray-300 mx-auto mb-2"/>
                            <p className="text-gray-500 text-sm mb-3">Você não tem agentes IA na equipe.</p>
                            <button 
                                onClick={() => {
                                    setIsAIHelpModalOpen(false);
                                    setActiveTab('colaboracao');
                                    setIsCollaboratorModalOpen(true);
                                }}
                                className="text-indigo-600 font-medium text-sm hover:underline"
                            >
                                Adicionar Agente
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeAIAgents.map(agent => (
                                <button
                                    key={agent.id}
                                    onClick={() => handleConsultAgent(agent)}
                                    disabled={isGeneratingAI}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left group"
                                >
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm" style={{ backgroundColor: agent.cor }}>
                                        <Bot className="w-5 h-5"/>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 text-sm group-hover:text-purple-700">{agent.nome}</h4>
                                        <p className="text-xs text-gray-500">Agente Especialista</p>
                                    </div>
                                    {isGeneratingAI ? <Loader2 className="w-5 h-5 animate-spin text-purple-600"/> : <CornerDownRight className="w-4 h-4 text-gray-300 group-hover:text-purple-600"/>}
                                </button>
                            ))}
                        </div>
                    )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ResearchCanvasApp;
