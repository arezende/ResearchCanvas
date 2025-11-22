
import { 
    Projeto, 
    VersaoProjeto, 
    ConteudoCanvas, 
    Colaborador, 
    Comentario, 
    Resposta,
    IConteudoCanvas,
    NivelAcesso,
    TipoComentario,
    IProjeto,
    IVersaoProjeto,
    IColaborador,
    IComentario,
    IResposta
} from './models';

// ============================================================================
// MOCK DATA: PROFESSORES (DIRETÓRIO)
// ============================================================================

export const AVAILABLE_PROFESSORS = [
    { nome: "Adriano Maurício de Almeida Côrtes", titulo: "Professor Adjunto", area: "Inteligência Artificial", inicio: 2023 },
    { nome: "Carlos Eduardo Pedreira", titulo: "Professor Titular - Pesquisador CNPq 1A", area: "Inteligência Artificial", inicio: 2014 },
    { nome: "Celina Miraglia Herrera de Figueiredo", titulo: "Professor Titular - Pesquisador CNPq 1A", area: "Algoritmos e Combinatória", inicio: 1991 },
    { nome: "Claudia Maria Lima Werner", titulo: "Professor Titular - Pesquisador CNPq 1D", area: "Engenharia de Software", inicio: 1994 },
    { nome: "Claudio Esperança", titulo: "Professor Titular", area: "Computação Gráfica", inicio: 1998 },
    { nome: "Claudio Luis de Amorim", titulo: "Professor Titular", area: "Arquitetura e Sistemas Operacionais", inicio: 1985 },
    { nome: "Claudio Miceli de Farias", titulo: "Professor Adjunto", area: "Engenharia de Software", inicio: 2020 },
    { nome: "Daniel Ratton Figueiredo", titulo: "Professor Associado - Pesquisador CNPq 2", area: "Redes de Computadores", inicio: 2007 },
    { nome: "Daniel Serrão Schneider", titulo: "Professor Adjunto", area: "Engenharia de Dados e Conhecimento", inicio: 2025 },
    { nome: "Diego Leonel Cadette Dutra", titulo: "Professor Adjunto - Pesquisador CNPq C", area: "Arquitetura e Sistemas Operacionais", inicio: 2020 },
    { nome: "Edmundo Albuquerque de Souza e Silva", titulo: "Professor Titular - Pesquisador CNPq SR", area: "Inteligência Artificial / Redes", inicio: 1989 },
    { nome: "Franklin de Lima Marquezino", titulo: "Professor Associado - Pesquisador CNPq C", area: "Algoritmos e Combinatória", inicio: 2011 },
    { nome: "Geraldo Bonorino Xexéo", titulo: "Professor Associado", area: "Engenharia de Dados e Conhecimento", inicio: 1995 },
    { nome: "Geraldo Zimbrão da Silva", titulo: "Professor Associado", area: "Engenharia de Dados e Conhecimento", inicio: 2000 },
    { nome: "Gerson Zaverucha", titulo: "Professor Titular - Pesquisador CNPq 1D", area: "Inteligência Artificial", inicio: 1993 },
    { nome: "Guilherme Horta Travassos", titulo: "Professor Titular - Pesquisador CNPq 1C", area: "Engenharia de Software", inicio: 1996 },
    { nome: "Henrique Luiz Cukierman", titulo: "Professor Titular", area: "Informática e Sociedade", inicio: 2002 },
    { nome: "Jano Moreira de Souza", titulo: "Professor Titular", area: "Engenharia de Dados e Conhecimento", inicio: 1976 },
    { nome: "José Ferreira de Rezende", titulo: "Professor Associado - Pesquisador CNPq 1D", area: "Redes de Computadores", inicio: 2014 },
    { nome: "Laura Silvia Bahiense da Silva Leite", titulo: "Professor Associado - Pesquisador CNPq 2", area: "Engenharia de Dados / Otimização", inicio: 2018 },
    { nome: "Luidi Gelabert Simonetti", titulo: "Professor Associado - Pesquisador CNPq 2", area: "Otimização", inicio: 2015 },
    { nome: "Luis Felipe Magalhães de Moraes", titulo: "Professor Adjunto", area: "Redes de Computadores", inicio: 1995 },
    { nome: "Luiz Arthur Silva de Faria", titulo: "Professor Adjunto", area: "Informática e Sociedade", inicio: 2024 },
    { nome: "Márcia Helena Costa Fampa", titulo: "Professor Titular - Pesquisador CNPq 2", area: "Otimização", inicio: 1997 },
    { nome: "Márcia Rosana Cerioli", titulo: "Professor Associado", area: "Algoritmos e Combinatória", inicio: 2000 },
    { nome: "Marta Lima de Queirós Mattoso", titulo: "Professor Titular - Pesquisador CNPq 1B", area: "Engenharia de Dados e Conhecimento", inicio: 1994 },
    { nome: "Pedro Henrique González Silva", titulo: "Professor Adjunto - Pesquisador CNPq C", area: "Otimização", inicio: 2023 },
    { nome: "Priscila Machado Vieira Lima", titulo: "Professor Adjunto", area: "Arquitetura e Sistemas Operacionais", inicio: 2019 },
    { nome: "Ricardo Cordeiro de Farias", titulo: "Professor Associado", area: "Computação Gráfica", inicio: 2003 },
    { nome: "Rosa Maria Meri Leão", titulo: "Professor Associado", area: "Redes de Computadores", inicio: 1997 },
    { nome: "Rubem Pinto Mondaini", titulo: "Professor Titular", area: "Otimização", inicio: 1998 }
];

// ============================================================================
// MOCK DATA: AGENTES IA
// ============================================================================

export const AVAILABLE_AI_AGENTS = [
    { nome: "Dr. Turing (IA)", role: "Metodologista DSR", desc: "Especialista em rigor metodológico e estrutura de Design Science Research.", color: "#8b5cf6" },
    { nome: "Prof. Ada (IA)", role: "Cientista de Dados", desc: "Especialista em estatística, métricas de avaliação e machine learning.", color: "#ec4899" },
    { nome: "Eng. Von Neumann (IA)", role: "Arquiteto de Sistemas", desc: "Focado na definição do artefato, arquitetura e viabilidade técnica.", color: "#06b6d4" },
    { nome: "Dra. Hopper (IA)", role: "Revisora Acadêmica", desc: "Verifica clareza, coesão textual e contribuições científicas.", color: "#f59e0b" },
    { nome: "Agente Shannon (IA)", role: "Analista de Literatura", desc: "Ajuda a conectar o problema com a base de conhecimento e trabalhos relacionados.", color: "#10b981" }
];

// Helper para gerar iniciais
export const getInitials = (name: string) => {
    return name
        .split(' ')
        .filter(n => n.length > 2 && !n.includes('('))
        .slice(0, 2)
        .map(n => n[0])
        .join('')
        .toUpperCase();
};

// Helper para gerar cor consistente baseada no nome
export const getColorByName = (name: string) => {
    const colors = [
        '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', 
        '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

// ============================================================================
// MOCK DATABASE & UTILS
// ============================================================================

// Simulação de latência de rede (500ms a 1500ms)
const simulateLatency = () => new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

// Banco de dados em memória (persistente enquanto a aba não for recarregada)
class MockDatabase {
    private static projectData: any = null;

    static init() {
        if (this.projectData) return;

        // Inicializa com dados de exemplo
        const proj = new Projeto({
            titulo: 'Intelligent Tutor for DSR',
            descricao: 'A system to guide students through Design Science Research methodology.',
        });
        
        // Ensure content has title/desc populated from project initially
        if (proj.versoes.length > 0) {
            proj.versoes[0].conteudo.titulo = proj.titulo;
            proj.versoes[0].conteudo.descricao = proj.descricao;
        }

        proj.colaboradores.push(new Colaborador({ 
            nome: 'Geraldo Xexéo', 
            iniciais: 'GX', 
            cor: '#4f46e5',
            nivelAcesso: NivelAcesso.PROPRIETARIO 
        }));
        
        proj.colaboradores.push(new Colaborador({ 
            nome: 'Anderson Rezende', 
            iniciais: 'AR', 
            cor: '#10b981',
            nivelAcesso: NivelAcesso.EDITOR
        }));

        proj.comentarios.push(new Comentario({
            texto: 'Ótima definição do problema. Sugiro focar na classe de problemas.',
            autorNome: 'Geraldo Xexéo',
            autorIniciais: 'GX',
            autorCor: '#4f46e5',
            tipo: TipoComentario.SUGESTAO
        }));

        this.projectData = JSON.parse(JSON.stringify(proj));
    }

    static getProject(): any {
        this.init();
        return this.projectData;
    }

    static updateProject(data: any) {
        this.projectData = { ...this.projectData, ...data };
        return this.projectData;
    }

    static addVersion(version: any) {
        this.projectData.versoes.push(version);
        this.projectData.versaoAtualId = version.id;
        this.projectData.dataAtualizacao = new Date().toISOString();
        return version;
    }

    static updateContent(versionId: string, content: any) {
        const versionIndex = this.projectData.versoes.findIndex((v: any) => v.id === versionId);
        if (versionIndex !== -1) {
            this.projectData.versoes[versionIndex].conteudo = content;
            this.projectData.dataAtualizacao = new Date().toISOString();
            return this.projectData.versoes[versionIndex];
        }
        throw new Error('Versão não encontrada');
    }

    static addComment(comment: any) {
        this.projectData.comentarios.push(comment);
        this.projectData.dataAtualizacao = new Date().toISOString();
        return comment;
    }

    static addReply(commentId: string, reply: any) {
        const comment = this.projectData.comentarios.find((c: any) => c.id === commentId);
        if (comment) {
            if (!comment.respostas) comment.respostas = [];
            comment.respostas.push(reply);
            this.projectData.dataAtualizacao = new Date().toISOString();
            return reply;
        }
        throw new Error('Comentário não encontrado');
    }

    static removeComment(commentId: string) {
        this.projectData.comentarios = this.projectData.comentarios.filter((c: any) => c.id !== commentId);
        this.projectData.dataAtualizacao = new Date().toISOString();
    }

    static addCollaborator(collaborator: any) {
        this.projectData.colaboradores.push(collaborator);
        this.projectData.dataAtualizacao = new Date().toISOString();
        return collaborator;
    }
}

// ============================================================================
// SERVIÇOS
// ============================================================================

/**
 * Serviço para gerenciamento da entidade Projeto
 * Simula endpoints: GET /api/projetos/:id, PUT /api/projetos/:id
 */
export class ProjetoService {
    static async getById(id: string): Promise<Projeto> {
        await simulateLatency();
        const data = MockDatabase.getProject();
        // Reconstrói o objeto completo com as classes
        return new Projeto({
            ...data,
            dataAtualizacao: new Date(data.dataAtualizacao),
            versoes: data.versoes.map((v: any) => VersaoProjeto.fromJSON(v)),
            colaboradores: data.colaboradores.map((c: any) => Colaborador.fromJSON(c)),
            comentarios: data.comentarios.map((c: any) => Comentario.fromJSON(c))
        });
    }

    static async update(projeto: Projeto): Promise<Projeto> {
        await simulateLatency();
        const updatedData = MockDatabase.updateProject({
            titulo: projeto.titulo,
            descricao: projeto.descricao,
            status: projeto.status,
            versaoAtualId: projeto.versaoAtualId,
            dataAtualizacao: new Date().toISOString()
        });
        
        return ProjetoService.getById(updatedData.id);
    }
}

/**
 * Serviço para gerenciamento da entidade ConteudoCanvas
 * Simula endpoint: PATCH /api/versoes/:id/conteudo
 */
export class ConteudoService {
    static async update(versaoId: string, conteudo: ConteudoCanvas): Promise<ConteudoCanvas> {
        await simulateLatency();
        const rawContent = JSON.parse(JSON.stringify(conteudo));
        MockDatabase.updateContent(versaoId, rawContent);
        return new ConteudoCanvas(rawContent);
    }
}

/**
 * Serviço para gerenciamento da entidade VersaoProjeto
 * Simula endpoints: POST /api/projetos/:id/versoes, GET /api/versoes/:id
 */
export class VersaoProjetoService {
    static async create(projetoId: string, dadosVersao: Partial<IVersaoProjeto>): Promise<VersaoProjeto> {
        await simulateLatency();
        
        const novaVersao = new VersaoProjeto(dadosVersao);
        MockDatabase.addVersion(JSON.parse(JSON.stringify(novaVersao.toJSON())));
        
        return novaVersao;
    }

    static async duplicate(versaoOriginal: VersaoProjeto, autorId: string): Promise<VersaoProjeto> {
        await simulateLatency();
        
        const novaVersao = new VersaoProjeto({
            numero: versaoOriginal.numero + 1, 
            titulo: `${versaoOriginal.titulo} (Cópia)`,
            descricao: `Cópia da versão ${versaoOriginal.numero}`,
            conteudo: versaoOriginal.conteudo.clone(),
            autorId,
            mudancas: ['Versão duplicada']
        });

        MockDatabase.addVersion(JSON.parse(JSON.stringify(novaVersao.toJSON())));
        return novaVersao;
    }
}

/**
 * Serviço para gerenciamento da entidade Comentario
 * Simula endpoint: POST /api/projetos/:id/comentarios
 */
export class ComentarioService {
    static async add(projetoId: string, comentario: Partial<IComentario>): Promise<Comentario> {
        await simulateLatency();
        const novoComentario = new Comentario(comentario);
        MockDatabase.addComment(JSON.parse(JSON.stringify(novoComentario.toJSON())));
        return novoComentario;
    }

    static async reply(projetoId: string, comentarioId: string, resposta: Partial<IResposta>): Promise<Resposta> {
        await simulateLatency();
        const novaResposta = new Resposta(resposta);
        MockDatabase.addReply(comentarioId, JSON.parse(JSON.stringify(novaResposta.toJSON())));
        return novaResposta;
    }

    static async remove(projetoId: string, comentarioId: string): Promise<void> {
        await simulateLatency();
        MockDatabase.removeComment(comentarioId);
    }
}

/**
 * Serviço para gerenciamento da entidade Colaborador
 * Simula endpoint: POST /api/projetos/:id/colaboradores
 */
export class ColaboradorService {
    static async add(projetoId: string, colaborador: Partial<IColaborador>): Promise<Colaborador> {
        await simulateLatency();
        const novoColaborador = new Colaborador(colaborador);
        MockDatabase.addCollaborator(JSON.parse(JSON.stringify(novoColaborador.toJSON())));
        return novoColaborador;
    }
}

/**
 * Serviço para Simulação de IA
 */
export class AIService {
    // Para consultas específicas via botão "Consultar IA" no card
    static async generateSuggestion(agentName: string, field: string, content: string): Promise<string> {
        // Simulating processing time
        await new Promise(resolve => setTimeout(resolve, 2000));

        const emptyContent = content.trim().length === 0;

        // Logic to select response based on Agent Persona
        if (agentName.includes("Dr. Turing")) {
            // Metodologista
            if (field === 'problema') {
                return emptyContent 
                    ? "Para definir um bom problema de pesquisa DSR, comece identificando a relevância prática e a ausência de soluções adequadas na literatura atual. Qual a dor específica do usuário?"
                    : `Analisei sua descrição do problema. Certifique-se de que a relevância e a classe de problemas estão claras. Você considerou: "${content.substring(0, 30)}..." - isso é generalizável?`;
            }
            if (field === 'metodologiaDetalhada') {
                return "Sugiro estruturar sua metodologia seguindo os ciclos de Hevner: Ciclo de Relevância, Ciclo de Design e Ciclo de Rigor. Detalhe como cada iteração ocorrerá.";
            }
            return `Como metodologista, recomendo verificar se o campo ${field} está alinhado com os objetivos de pesquisa definidos.`;
        } 
        
        else if (agentName.includes("Prof. Ada")) {
            // Cientista de Dados
            if (field === 'avaliacaoCriterios') {
                return emptyContent 
                    ? "Para avaliação, considere métricas quantitativas (desempenho, acurácia) e qualitativas (usabilidade via SUS, por exemplo). O que define o sucesso do seu artefato?"
                    : "Interessante seus critérios. Você possui dados de baseline para comparar? Sugiro adicionar uma análise estatística (teste t ou ANOVA) se houver experimentos comparativos.";
            }
            return `Da perspectiva de dados, o campo ${field} precisa ser mensurável. Evite termos vagos e busque evidências concretas.`;
        }

        else if (agentName.includes("Eng. Von Neumann")) {
            // Arquiteto
            if (field === 'artefatoDescricao') {
                return emptyContent
                    ? "Defina se seu artefato é um Modelo, Método, Instanciação ou Constructo. Qual a arquitetura de alto nível? Quais tecnologias serão empregadas?"
                    : "Sua descrição técnica parece sólida. Considere adicionar um diagrama de componentes para ilustrar melhor a arquitetura da solução proposta.";
            }
            return `Tecnicamente, verifique a viabilidade de implementação do que foi descrito em ${field}.`;
        }

        else if (agentName.includes("Dra. Hopper")) {
            // Revisora
            return `Revisei o texto de ${field}. Atente-se à clareza e ao tom acadêmico. Evite a voz passiva excessiva e certifique-se de que as frases estão conectadas logicamente.`;
        }

        else if (agentName.includes("Agente Shannon")) {
            // Literatura
            if (field === 'contribuicoesPraticas' || field === 'contribuicoesTeoicas') {
                return "Compare suas contribuições com o estado da arte. O que o seu trabalho adiciona que Smith (2020) ou Jones (2021) não cobriram?";
            }
            return `Para o campo ${field}, recomendo buscar trabalhos recentes no Google Scholar ou IEEE Xplore para fundamentar suas afirmações.`;
        }

        // Fallback
        return `Análise preliminar do campo ${field} concluída. Parece um bom ponto de partida, mas considere detalhar mais os aspectos específicos.`;
    }

    // Para interações em chat/discussão via menção (@Agente)
    static async generateDiscussionResponse(agentName: string, userMessage: string): Promise<string> {
        await new Promise(resolve => setTimeout(resolve, 2500)); // Latência de "digitação"

        if (agentName.includes("Dr. Turing")) {
            return `Obrigado por me chamar. Analisando seu comentário sobre "${userMessage.substring(0, 20)}...", reitero a importância de manter o rigor científico. Certifique-se de que cada decisão de design seja justificada por teorias de base. Se precisar de ajuda com a estrutura do método, estou à disposição.`;
        }
        else if (agentName.includes("Prof. Ada")) {
            return `Li sua mensagem. Se houver dados envolvidos nisso, lembre-se de verificar a validade estatística. Posso sugerir métricas de avaliação se detalhar melhor os objetivos.`;
        }
        else if (agentName.includes("Eng. Von Neumann")) {
            return `Entendido. Do ponto de vista de engenharia, essa abordagem é viável? Considere a complexidade computacional e a escalabilidade da solução proposta.`;
        }
        else if (agentName.includes("Dra. Hopper")) {
            return `Notei sua observação. Para a escrita acadêmica, tente ser mais direto. Evite ambiguidades. Se precisar que eu revise algum parágrafo específico, é só pedir.`;
        }
        else if (agentName.includes("Agente Shannon")) {
            return `Interessante ponto. Isso me lembra abordagens vistas em trabalhos recentes na área de DSR. Recomendaria cruzar essa ideia com a literatura de referência para garantir originalidade.`;
        }
        
        return `Olá! Estou aqui para ajudar. Como posso contribuir com essa questão específica do projeto?`;
    }
}