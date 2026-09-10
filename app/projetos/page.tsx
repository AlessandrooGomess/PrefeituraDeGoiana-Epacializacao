'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Bell, 
  User, 
  MapPin, 
  Activity, 
  GraduationCap, 
  Trees, 
  Zap, 
  Route, 
  CheckCircle2, 
  Clock, 
  FileText,
  Calendar,
  Layers,
  ChevronRight,
  X
} from 'lucide-react';

export interface ObraItem {
  id: string;
  codigo: string;
  titulo: string;
  categoria: 'Saude' | 'Mobilidade' | 'Educacao' | 'MeioAmbiente' | 'Energia' | 'Rodovias';
  categoriaLabel: string;
  status: 'Em Projeto' | 'Ordem de Serviço' | 'Licitado' | 'Concluído';
  progressoFisico: number;
  atualizadoEm: string;
  imagemUrl: string;
  valorPrevisto?: string;
  bairro?: string;
  secretaria?: string;
}

const DADOS_OBRAS_INICIAIS: ObraItem[] = [
  {
    id: '1',
    codigo: 'OBR-2026-001',
    titulo: 'Novo Complexo Hospitalar Regional',
    categoria: 'Saude',
    categoriaLabel: 'Saúde',
    status: 'Em Projeto',
    progressoFisico: 15,
    atualizadoEm: 'Atualizado há 2 dias',
    imagemUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?q=80&w=900&auto=format&fit=crop',
    valorPrevisto: 'R$ 42.500.000,00',
    bairro: 'Setor Central',
    secretaria: 'Secretaria Municipal de Saúde'
  },
  {
    id: '2',
    codigo: 'OBR-2026-002',
    titulo: 'Ponte de Integração Sul-Norte',
    categoria: 'Mobilidade',
    categoriaLabel: 'Mobilidade',
    status: 'Ordem de Serviço',
    progressoFisico: 42,
    atualizadoEm: 'Atualizado hoje',
    imagemUrl: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?q=80&w=900&auto=format&fit=crop',
    valorPrevisto: 'R$ 28.150.000,00',
    bairro: 'Margem do Rio Goiana',
    secretaria: 'Secretaria de Infraestrutura e Mobilidade'
  },
  {
    id: '3',
    codigo: 'OBR-2026-003',
    titulo: 'Instituto Federal Campus Avançado',
    categoria: 'Educacao',
    categoriaLabel: 'Educação',
    status: 'Licitado',
    progressoFisico: 0,
    atualizadoEm: 'Atualizado há 1 semana',
    imagemUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=900&auto=format&fit=crop',
    valorPrevisto: 'R$ 19.800.000,00',
    bairro: 'Distrito Universitário',
    secretaria: 'Secretaria Municipal de Educação'
  },
  {
    id: '4',
    codigo: 'OBR-2026-004',
    titulo: 'Parque Metropolitano das Águas',
    categoria: 'MeioAmbiente',
    categoriaLabel: 'Meio Ambiente',
    status: 'Concluído',
    progressoFisico: 100,
    atualizadoEm: 'Atualizado há 1 mês',
    imagemUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=900&auto=format&fit=crop',
    valorPrevisto: 'R$ 8.900.000,00',
    bairro: 'Residencial das Águas',
    secretaria: 'Secretaria de Meio Ambiente e Sustentabilidade'
  },
  {
    id: '5',
    codigo: 'OBR-2026-005',
    titulo: 'Usina Solar Fotovoltaica Central',
    categoria: 'Energia',
    categoriaLabel: 'Energia',
    status: 'Ordem de Serviço',
    progressoFisico: 68,
    atualizadoEm: 'Atualizado ontem',
    imagemUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=900&auto=format&fit=crop',
    valorPrevisto: 'R$ 14.300.000,00',
    bairro: 'Polo Agroindustrial',
    secretaria: 'Secretaria de Inovação e Energia'
  },
  {
    id: '6',
    codigo: 'OBR-2026-006',
    titulo: 'Duplicação BR-101 Trecho Norte',
    categoria: 'Rodovias',
    categoriaLabel: 'Rodovias',
    status: 'Ordem de Serviço',
    progressoFisico: 85,
    atualizadoEm: 'Atualizado há 5 horas',
    imagemUrl: 'https://images.unsplash.com/photo-1584463699039-4d640fa8a1e2?q=80&w=900&auto=format&fit=crop',
    valorPrevisto: 'R$ 56.700.000,00',
    bairro: 'Acesso Rodoviário Norte',
    secretaria: 'Secretaria de Obras e Serviços Públicos'
  }
];

const PROJETOS_EXTRAS: ObraItem[] = [
  {
    id: '7',
    codigo: 'OBR-2026-007',
    titulo: 'Canalização e Drenagem da Bacia Central',
    categoria: 'MeioAmbiente',
    categoriaLabel: 'Meio Ambiente',
    status: 'Em Projeto',
    progressoFisico: 20,
    atualizadoEm: 'Atualizado há 3 dias',
    imagemUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=900&auto=format&fit=crop',
    valorPrevisto: 'R$ 11.200.000,00',
    bairro: 'Vila Esperança',
    secretaria: 'Secretaria de Infraestrutura'
  },
  {
    id: '8',
    codigo: 'OBR-2026-008',
    titulo: 'Novo Terminal Rodoviário Integrado',
    categoria: 'Mobilidade',
    categoriaLabel: 'Mobilidade',
    status: 'Licitado',
    progressoFisico: 5,
    atualizadoEm: 'Atualizado há 4 dias',
    imagemUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=900&auto=format&fit=crop',
    valorPrevisto: 'R$ 22.400.000,00',
    bairro: 'Setor Intermunicipal',
    secretaria: 'Secretaria de Transportes'
  }
];

function getCategoriaBadge(categoria: ObraItem['categoria'], label: string) {
  switch (categoria) {
    case 'Saude':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-white bg-[#ef4444] shadow-sm">
          <Activity className="w-3 h-3" />
          {label}
        </span>
      );
    case 'Mobilidade':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-white bg-[#2563eb] shadow-sm">
          <Route className="w-3 h-3" />
          {label}
        </span>
      );
    case 'Educacao':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-white bg-[#ea580c] shadow-sm">
          <GraduationCap className="w-3 h-3" />
          {label}
        </span>
      );
    case 'MeioAmbiente':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-white bg-[#15803d] shadow-sm">
          <Trees className="w-3 h-3" />
          {label}
        </span>
      );
    case 'Energia':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-white bg-[#d97706] shadow-sm">
          <Zap className="w-3 h-3" />
          {label}
        </span>
      );
    case 'Rodovias':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-white bg-[#0284c7] shadow-sm">
          <Layers className="w-3 h-3" />
          {label}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-white bg-[#475569] shadow-sm">
          {label}
        </span>
      );
  }
}

function getStatusBadge(status: ObraItem['status']) {
  switch (status) {
    case 'Em Projeto':
      return (
        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold text-[#1d4ed8] bg-[#dbeafe]">
          Em Projeto
        </span>
      );
    case 'Ordem de Serviço':
      return (
        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold text-[#1e40af] bg-[#e0e7ff]">
          Ordem de Serviço
        </span>
      );
    case 'Licitado':
      return (
        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold text-[#334155] bg-[#f1f5f9]">
          Licitado
        </span>
      );
    case 'Concluído':
      return (
        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold text-[#15803d] bg-[#dcfce7]">
          Concluído
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold text-gray-700 bg-gray-100">
          {status}
        </span>
      );
  }
}

export default function PaginaCarteiraProjetos() {
  const [projetos, setProjetos] = useState<ObraItem[]>(DADOS_OBRAS_INICIAIS);
  const [termoBusca, setTermoBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<string>('Todos');
  const [mostrarFiltrosMenu, setMostrarFiltrosMenu] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [projetoSelecionado, setProjetoSelecionado] = useState<ObraItem | null>(null);

  const projetosFiltrados = useMemo(() => {
    return projetos.filter((item) => {
      const matchTexto = 
        item.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
        item.codigo.toLowerCase().includes(termoBusca.toLowerCase()) ||
        item.categoriaLabel.toLowerCase().includes(termoBusca.toLowerCase());

      const matchStatus = 
        statusFiltro === 'Todos' || item.status === statusFiltro;

      return matchTexto && matchStatus;
    });
  }, [projetos, termoBusca, statusFiltro]);

  const handleCarregarMais = () => {
    setCarregandoMais(true);
    setTimeout(() => {
      setProjetos((prev) => [...prev, ...PROJETOS_EXTRAS]);
      setCarregandoMais(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfcfd] text-[#0f172a] font-sans antialiased selection:bg-blue-100">
      
      {/* Top Navigation Bar - Fiel à cor da prefeitura no Figma (#0f2a42) */}
      <header className="bg-[#0b243b] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo / Brand Name */}
          <div className="flex items-center space-x-3">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block animate-pulse"></span>
              Portal de Infraestrutura
            </span>
          </div>

          {/* Center Nav Links */}
          <nav className="flex items-center space-x-8 text-sm font-medium">
            <button 
              type="button" 
              className="text-slate-300 hover:text-white transition-colors duration-150"
            >
              Mapa
            </button>
            <div className="relative py-5">
              <button 
                type="button" 
                className="text-white font-semibold flex items-center gap-1"
              >
                Projetos
              </button>
              {/* Active Indicator Underline */}
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white rounded-t-full"></div>
            </div>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-4">
            <button 
              type="button"
              className="p-1.5 text-slate-300 hover:text-white rounded-full transition relative focus:outline-none focus:ring-2 focus:ring-blue-400"
              title="Notificações"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full"></span>
            </button>

            <button 
              type="button"
              className="p-1.5 text-slate-300 hover:text-white rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-400"
              title="Perfil de Usuário"
            >
              <div className="w-7 h-7 rounded-full border border-slate-400 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            </button>
          </div>

        </div>
      </header>

      {}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header: Title + Search & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-8 border-b border-slate-100">
          
          {/* Title & Subtitle */}
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#092237] tracking-tight">
              Carteira de Projetos
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Acompanhe o andamento físico e financeiro das obras e intervenções estruturais em todo o município de Goiana
            </p>
          </div>

          {/* Search Bar & Filter Button */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            
            {/* Input Search */}
            <div className="relative flex-1 lg:w-72">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Buscar por nome ou ID..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-md text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0b243b] focus:border-transparent transition"
              />
              {termoBusca && (
                <button 
                  onClick={() => setTermoBusca('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMostrarFiltrosMenu(!mostrarFiltrosMenu)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium border rounded-md shadow-sm transition ${
                  mostrarFiltrosMenu || statusFiltro !== 'Todos'
                    ? 'bg-[#0b243b] text-white border-[#0b243b]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filtros</span>
                {statusFiltro !== 'Todos' && (
                  <span className="w-2 h-2 rounded-full bg-blue-400 ml-1"></span>
                )}
              </button>

              {/* Dropdown de status para demonstração interativa */}
              {mostrarFiltrosMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1.5 z-40 text-xs animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1.5 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                    Status da Obra
                  </div>
                  {['Todos', 'Em Projeto', 'Ordem de Serviço', 'Licitado', 'Concluído'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setStatusFiltro(st);
                        setMostrarFiltrosMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${
                        statusFiltro === st
                          ? 'bg-blue-50 text-blue-800 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                      {statusFiltro === st && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {}
        {projetosFiltrados.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Nenhum projeto encontrado</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Não encontramos nenhuma obra com o termo pesquisado. Tente alterar o filtro ou limpar o campo de busca.
            </p>
            <button
              type="button"
              onClick={() => {
                setTermoBusca('');
                setStatusFiltro('Todos');
              }}
              className="mt-4 px-4 py-1.5 text-xs font-semibold text-[#0b243b] border border-slate-300 rounded hover:bg-slate-50 transition"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
            {projetosFiltrados.map((obra) => (
              <div
                key={obra.id}
                onClick={() => setProjetoSelecionado(obra)}
                className="group bg-white rounded-lg border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
              >
                {/* Card Image Container */}
                <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                  <img
                    src={obra.imagemUrl}
                    alt={obra.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Floating Category Badge (Top-left exactly like Figma) */}
                  <div className="absolute top-2.5 left-2.5">
                    {getCategoriaBadge(obra.categoria, obra.categoriaLabel)}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Project Title */}
                    <h3 className="font-bold text-[15px] leading-snug text-[#0f2438] line-clamp-2 min-h-[42px]">
                      {obra.titulo}
                    </h3>

                    {/* Status Section */}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                        STATUS
                      </span>
                      <div>
                        {getStatusBadge(obra.status)}
                      </div>
                    </div>

                    {/* Progress Bar Section */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="text-slate-500 font-medium">Progresso Físico</span>
                        <span className="font-bold text-slate-900">{obra.progressoFisico}%</span>
                      </div>
                      
                      {/* Visual progress bar */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0b243b] rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${obra.progressoFisico}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Last Updated Date (Right aligned as in Figma) */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end text-[10px] text-slate-400">
                    <span>{obra.atualizadoEm}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {}
        {projetos.length <= DADOS_OBRAS_INICIAIS.length && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={handleCarregarMais}
              disabled={carregandoMais}
              className="px-6 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-medium text-xs rounded-md shadow-sm hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
            >
              {carregandoMais ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                  Carregando...
                </span>
              ) : (
                'Carregar mais projetos'
              )}
            </button>
          </div>
        )}

      </main>

      {}
      {projetoSelecionado && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setProjetoSelecionado(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/9] w-full">
              <img 
                src={projetoSelecionado.imagemUrl} 
                alt={projetoSelecionado.titulo} 
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setProjetoSelecionado(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3">
                {getCategoriaBadge(projetoSelecionado.categoria, projetoSelecionado.categoriaLabel)}
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {projetoSelecionado.codigo}
                </span>
                {getStatusBadge(projetoSelecionado.status)}
              </div>

              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {projetoSelecionado.titulo}
              </h2>

              <div className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Localização:</span>
                  <span className="font-semibold text-slate-800">{projetoSelecionado.bairro}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Investimento Estimado:</span>
                  <span className="font-bold text-emerald-700">{projetoSelecionado.valorPrevisto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Secretaria Responsável:</span>
                  <span className="text-slate-800">{projetoSelecionado.secretaria}</span>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Execução Físico-Financeira</span>
                  <span className="text-blue-900">{projetoSelecionado.progressoFisico}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#0b243b] rounded-full" 
                    style={{ width: `${projetoSelecionado.progressoFisico}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProjetoSelecionado(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => setProjetoSelecionado(null)}
                  className="px-4 py-2 text-xs font-medium text-white bg-[#0b243b] hover:bg-[#123657] rounded-md transition shadow-sm"
                >
                  Ver Relatório Completo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      <footer className="bg-[#0b243b] text-slate-300 py-6 border-t border-[#163554] mt-auto">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-end text-[11px] font-medium space-y-3 sm:space-y-0 sm:space-x-8">
          <a href="#privacidade" className="hover:text-white transition">Privacidade</a>
          <a href="#transparencia" className="hover:text-white transition">Transparência</a>
          <a href="#contato" className="hover:text-white transition">Contato</a>
          <a href="#acessibilidade" className="hover:text-white transition">Acessibilidade</a>
        </div>
      </footer>

    </div>
  );
}