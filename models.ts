
import { NivelAcesso, TipoArtefato, TipoComentario, TipoMetodo, StatusProjeto } from './enums';
export { NivelAcesso, TipoArtefato, TipoComentario, TipoMetodo, StatusProjeto };

// ==========================================
// CONTEÚDO CANVAS
// ==========================================

export interface IConteudoCanvas {
    titulo: string; // Novo: Título versionado
    descricao: string; // Novo: Subtítulo/Descrição versionada
    problema: string;
    objetivoGeral: string;
    objetivosEspecificos: string[];
    artefatoDescricao: string;
    artefatoTipo: TipoArtefato;
    artefatoFuncionalidades: string[];
    metodoFases: string[];
    metodoPesquisa: TipoMetodo[];
    metodologiaDetalhada: string;
    avaliacaoMetricas: string[];
    avaliacaoInstrumentos: string[];
    avaliacaoCriterios: string;
    contribuicoesPraticas: string[];
    contribuicoesTeoicas: string[];
    contribuicoesSociais: string[];
    referenciasChave: string[];
    palavrasChave: string[];
}

export class ConteudoCanvas implements IConteudoCanvas {
    titulo: string;
    descricao: string;
    problema: string;
    objetivoGeral: string;
    objetivosEspecificos: string[];
    artefatoDescricao: string;
    artefatoTipo: TipoArtefato;
    artefatoFuncionalidades: string[];
    metodoFases: string[];
    metodoPesquisa: TipoMetodo[];
    metodologiaDetalhada: string;
    avaliacaoMetricas: string[];
    avaliacaoInstrumentos: string[];
    avaliacaoCriterios: string;
    contribuicoesPraticas: string[];
    contribuicoesTeoicas: string[];
    contribuicoesSociais: string[];
    referenciasChave: string[];
    palavrasChave: string[];

    constructor(data: Partial<IConteudoCanvas> = {}) {
        this.titulo = data.titulo ?? '';
        this.descricao = data.descricao ?? '';
        this.problema = data.problema ?? '';
        this.objetivoGeral = data.objetivoGeral ?? '';
        this.objetivosEspecificos = data.objetivosEspecificos ?? [];
        this.artefatoDescricao = data.artefatoDescricao ?? '';
        this.artefatoTipo = data.artefatoTipo ?? TipoArtefato.SOFTWARE;
        this.artefatoFuncionalidades = data.artefatoFuncionalidades ?? [];
        this.metodoFases = data.metodoFases ?? [];
        this.metodoPesquisa = data.metodoPesquisa ?? [];
        this.metodologiaDetalhada = data.metodologiaDetalhada ?? '';
        this.avaliacaoMetricas = data.avaliacaoMetricas ?? [];
        this.avaliacaoInstrumentos = data.avaliacaoInstrumentos ?? [];
        this.avaliacaoCriterios = data.avaliacaoCriterios ?? '';
        this.contribuicoesPraticas = data.contribuicoesPraticas ?? [];
        this.contribuicoesTeoicas = data.contribuicoesTeoicas ?? [];
        this.contribuicoesSociais = data.contribuicoesSociais ?? [];
        this.referenciasChave = data.referenciasChave ?? [];
        this.palavrasChave = data.palavrasChave ?? [];
    }

    public calcularCompletude(): number {
        const campos = [
            this.titulo,
            this.descricao,
            this.problema,
            this.objetivoGeral,
            this.artefatoDescricao,
            this.metodologiaDetalhada,
            this.avaliacaoCriterios,
            this.contribuicoesPraticas.join(''),
        ];

        const preenchidos = campos.filter(c => c.length >= 20).length;
        return Math.min(Math.round((preenchidos / 8) * 100), 100);
    }

    public clone(): ConteudoCanvas {
        return new ConteudoCanvas({
            ...this,
            objetivosEspecificos: [...this.objetivosEspecificos],
            artefatoFuncionalidades: [...this.artefatoFuncionalidades],
            metodoFases: [...this.metodoFases],
            metodoPesquisa: [...this.metodoPesquisa],
            avaliacaoMetricas: [...this.avaliacaoMetricas],
            avaliacaoInstrumentos: [...this.avaliacaoInstrumentos],
            contribuicoesPraticas: [...this.contribuicoesPraticas],
            contribuicoesTeoicas: [...this.contribuicoesTeoicas],
            contribuicoesSociais: [...this.contribuicoesSociais],
            referenciasChave: [...this.referenciasChave],
            palavrasChave: [...this.palavrasChave],
        });
    }

    public compararCom(outro: ConteudoCanvas): string[] {
        const mudancas: string[] = [];
        if (this.titulo !== outro.titulo) mudancas.push('Título do Projeto alterado');
        if (this.descricao !== outro.descricao) mudancas.push('Subtítulo/Descrição alterada');
        if (this.problema !== outro.problema) mudancas.push('Problema de pesquisa alterado');
        if (this.objetivoGeral !== outro.objetivoGeral) mudancas.push('Objetivo geral alterado');
        if (this.artefatoDescricao !== outro.artefatoDescricao) mudancas.push('Descrição do artefato alterada');
        if (this.metodologiaDetalhada !== outro.metodologiaDetalhada) mudancas.push('Metodologia detalhada alterada');
        if (this.avaliacaoCriterios !== outro.avaliacaoCriterios) mudancas.push('Critérios de avaliação alterados');
        if (this.artefatoTipo !== outro.artefatoTipo) mudancas.push('Tipo de artefato alterado');
        
        return mudancas.length > 0 ? mudancas : ['Nenhuma mudança relevante detectada'];
    }
}

// ==========================================
// VERSÃO PROJETO
// ==========================================

export interface IVersaoProjeto {
    id: string;
    numero: number;
    titulo: string;
    descricao: string;
    conteudo: ConteudoCanvas;
    autorId: string;
    dataCriacao: Date;
    mudancas: string[];
    tags: string[];
}

export class VersaoProjeto implements IVersaoProjeto {
    id: string;
    numero: number;
    titulo: string;
    descricao: string;
    conteudo: ConteudoCanvas;
    autorId: string;
    dataCriacao: Date;
    mudancas: string[];
    tags: string[];

    constructor(data: Partial<IVersaoProjeto>) {
        this.id = data.id || `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.numero = data.numero || 1;
        this.titulo = data.titulo || `Versão ${this.numero}`;
        this.descricao = data.descricao || '';
        this.conteudo = data.conteudo || new ConteudoCanvas();
        this.autorId = data.autorId || '';
        this.dataCriacao = data.dataCriacao || new Date();
        this.mudancas = data.mudancas || [];
        this.tags = data.tags || [];
    }

    public toJSON(): Record<string, any> {
        return {
            ...this,
            conteudo: this.conteudo, // Assuming simple serialization
            dataCriacao: this.dataCriacao.toISOString()
        }
    }
    
    public static fromJSON(json: any): VersaoProjeto {
        return new VersaoProjeto({
            ...json,
            dataCriacao: new Date(json.dataCriacao),
            conteudo: new ConteudoCanvas(json.conteudo)
        });
    }
}

// ==========================================
// COLABORADOR
// ==========================================

export interface IColaborador {
    id: string;
    usuarioId: string;
    projetoId: string;
    nivelAcesso: NivelAcesso;
    dataAdicao: Date;
    adicionadoPor: string;
    notificacoesAtivas: boolean;
    // UI Helpers included in model for simplicity in this demo
    nome: string;
    iniciais: string;
    cor: string;
    isAI: boolean;
}

export class Colaborador implements IColaborador {
    id: string;
    usuarioId: string;
    projetoId: string;
    nivelAcesso: NivelAcesso;
    dataAdicao: Date;
    adicionadoPor: string;
    notificacoesAtivas: boolean;
    nome: string;
    iniciais: string;
    cor: string;
    isAI: boolean;

    constructor(data: Partial<IColaborador>) {
        this.id = data.id || `collab_${Date.now()}`;
        this.usuarioId = data.usuarioId || '';
        this.projetoId = data.projetoId || '';
        this.nivelAcesso = data.nivelAcesso || NivelAcesso.VISUALIZADOR;
        this.dataAdicao = data.dataAdicao || new Date();
        this.adicionadoPor = data.adicionadoPor || '';
        this.notificacoesAtivas = data.notificacoesAtivas !== false;
        this.nome = data.nome || 'Usuário';
        this.iniciais = data.iniciais || 'US';
        this.cor = data.cor || '#667eea';
        this.isAI = data.isAI || false;
    }
    
    public toJSON() { return { ...this, dataAdicao: this.dataAdicao.toISOString() }; }
    public static fromJSON(json: any) { return new Colaborador({ ...json, dataAdicao: new Date(json.dataAdicao) }); }
}

// ==========================================
// RESPOSTA E COMENTÁRIO
// ==========================================

export interface IResposta {
    id: string;
    autorNome: string;
    autorIniciais: string;
    autorCor: string;
    texto: string;
    dataCriacao: Date;
}

export class Resposta implements IResposta {
    id: string;
    autorNome: string;
    autorIniciais: string;
    autorCor: string;
    texto: string;
    dataCriacao: Date;

    constructor(data: Partial<IResposta>) {
        this.id = data.id || `reply_${Date.now()}_${Math.random().toString(36).substr(2,5)}`;
        this.autorNome = data.autorNome || 'Usuário';
        this.autorIniciais = data.autorIniciais || 'US';
        this.autorCor = data.autorCor || '#764ba2';
        this.texto = data.texto || '';
        this.dataCriacao = data.dataCriacao || new Date();
    }

    public toJSON() { return { ...this, dataCriacao: this.dataCriacao.toISOString() }; }
    public static fromJSON(json: any) { return new Resposta({ ...json, dataCriacao: new Date(json.dataCriacao) }); }
}

export interface IComentario {
    id: string;
    projetoId: string;
    autorId: string;
    autorNome: string;
    autorIniciais: string;
    autorCor: string;
    texto: string;
    tipo: TipoComentario;
    dataCriacao: Date;
    resolvido: boolean;
    respostas: Resposta[];
}

export class Comentario implements IComentario {
    id: string;
    projetoId: string;
    autorId: string;
    autorNome: string;
    autorIniciais: string;
    autorCor: string;
    texto: string;
    tipo: TipoComentario;
    dataCriacao: Date;
    resolvido: boolean;
    respostas: Resposta[];

    constructor(data: Partial<IComentario>) {
        this.id = data.id || `comment_${Date.now()}`;
        this.projetoId = data.projetoId || '';
        this.autorId = data.autorId || '';
        this.autorNome = data.autorNome || 'Usuário';
        this.autorIniciais = data.autorIniciais || 'US';
        this.autorCor = data.autorCor || '#764ba2';
        this.texto = data.texto || '';
        this.tipo = data.tipo || TipoComentario.GERAL;
        this.dataCriacao = data.dataCriacao || new Date();
        this.resolvido = data.resolvido || false;
        this.respostas = (data.respostas || []).map(r => r instanceof Resposta ? r : new Resposta(r));
    }

    public toJSON() { 
        return { 
            ...this, 
            dataCriacao: this.dataCriacao.toISOString(),
            respostas: this.respostas.map(r => r.toJSON())
        }; 
    }
    
    public static fromJSON(json: any) { 
        return new Comentario({ 
            ...json, 
            dataCriacao: new Date(json.dataCriacao),
            respostas: (json.respostas || []).map((r: any) => Resposta.fromJSON(r))
        }); 
    }
}

// ==========================================
// PROJETO
// ==========================================

export interface IProjeto {
    id: string;
    titulo: string;
    descricao: string;
    status: StatusProjeto;
    versaoAtualId: string;
    versoes: VersaoProjeto[];
    colaboradores: Colaborador[];
    comentarios: Comentario[];
    dataAtualizacao: Date;
}

export interface EstatisticasProjeto {
    totalVersoes: number;
    totalColaboradores: number;
    totalComentarios: number;
    completude: number;
    ultimaAtualizacao: Date;
}

export class Projeto implements IProjeto {
    id: string;
    titulo: string;
    descricao: string;
    status: StatusProjeto;
    versaoAtualId: string;
    versoes: VersaoProjeto[];
    colaboradores: Colaborador[];
    comentarios: Comentario[];
    dataAtualizacao: Date;

    constructor(data: Partial<IProjeto>) {
        this.id = data.id || `project_${Date.now()}`;
        this.titulo = data.titulo || 'Novo Projeto DSR';
        this.descricao = data.descricao || '';
        this.status = data.status || StatusProjeto.RASCUNHO;
        this.versoes = data.versoes || [];
        this.colaboradores = data.colaboradores || [];
        this.comentarios = data.comentarios || [];
        this.dataAtualizacao = data.dataAtualizacao || new Date();
        this.versaoAtualId = data.versaoAtualId || '';

        if (this.versoes.length === 0) {
            this.criarVersaoInicial();
        } else if (!this.versaoAtualId) {
            this.versaoAtualId = this.versoes[this.versoes.length - 1].id;
        }
    }

    private criarVersaoInicial(): void {
        const versaoInicial = new VersaoProjeto({
            numero: 1,
            titulo: 'Versão Inicial',
            descricao: 'Início do projeto',
            conteudo: new ConteudoCanvas({
                titulo: this.titulo,
                descricao: this.descricao
            }),
            mudancas: ['Criação do projeto']
        });
        this.versoes.push(versaoInicial);
        this.versaoAtualId = versaoInicial.id;
    }

    public getVersaoAtual(): VersaoProjeto | undefined {
        return this.versoes.find(v => v.id === this.versaoAtualId);
    }

    public criarNovaVersao(titulo: string, descricao: string, autorId: string): VersaoProjeto {
        const versaoAtual = this.getVersaoAtual();
        const novoNumero = this.versoes.length + 1;
        
        const conteudoAnterior = versaoAtual ? versaoAtual.conteudo : new ConteudoCanvas();
        const novoConteudo = conteudoAnterior.clone();

        const novaVersao = new VersaoProjeto({
            numero: novoNumero,
            titulo,
            descricao,
            conteudo: novoConteudo,
            autorId,
            mudancas: novoConteudo.compararCom(conteudoAnterior)
        });

        this.versoes.push(novaVersao);
        this.versaoAtualId = novaVersao.id;
        this.dataAtualizacao = new Date();
        return novaVersao;
    }

    public duplicarVersao(versaoId: string, autorId: string): VersaoProjeto | null {
        const versao = this.versoes.find(v => v.id === versaoId);
        if (!versao) return null;

        const novaVersao = new VersaoProjeto({
            numero: this.versoes.length + 1,
            titulo: `${versao.titulo} (Cópia)`,
            descricao: `Cópia da versão ${versao.numero}`,
            conteudo: versao.conteudo.clone(),
            autorId,
            mudancas: ['Versão duplicada']
        });
        this.versoes.push(novaVersao);
        this.dataAtualizacao = new Date();
        return novaVersao;
    }

    public getEstatisticas(): EstatisticasProjeto {
        const versaoAtual = this.getVersaoAtual();
        const completude = versaoAtual ? versaoAtual.conteudo.calcularCompletude() : 0;
        return {
            totalVersoes: this.versoes.length,
            totalColaboradores: this.colaboradores.length,
            totalComentarios: this.comentarios.length,
            completude,
            ultimaAtualizacao: this.dataAtualizacao
        };
    }
}
