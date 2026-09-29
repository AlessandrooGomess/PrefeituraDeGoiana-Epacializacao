"use client";

import { StatusObra } from "@/types/obra";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  ClipboardList,
  ExternalLink,
  MapPin,
  Pencil,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Sidebar, { type SidebarUser } from "@/components/sidebar/Sidebar";
import { formatCurrencyBRL, parseCurrencyBRLToNumber } from "@/lib/utils/currency";
import styles from "../../area-do-servidor.module.css";

type RelatedName = { id: string; nome: string } | null;
type Photo = {
  id: string;
  url: string;
  tipo: string;
  descricao: string | null;
  dataFoto: string;
};

type ObraDetail = {
  id: string;
  titulo: string;
  descricao: string | null;
  endereco: string;
  bairro: string;
  latitude: number;
  longitude: number;
  valorContrato: number | null;
  empresaContratada: string | null;
  numeroOrdemServico: string | null;
  dataOrdemServico: string | null;
  previsaoConclusao: string | null;
  dataConclusaoReal: string | null;
  status: StatusObra;
  secretaria: { id: string; nome: string; sigla: string };
  eixo: RelatedName;
  areaTematica: RelatedName;
  engenheiro: { id: string; nome: string; cargo: string | null } | null;
  tipoObra: RelatedName;
  createdAt: string;
  updatedAt: string;
  medicoes: Array<{
    id: string;
    dataVistoria: string;
    percentualExecutado: number;
    observacoesTecnicas: string | null;
    engenheiro: { nome: string; cargo: string | null };
  }>;
  fotos: Photo[];
  etapas: Array<{
    id: string;
    nome: string;
    nomeCidadao: string;
    ordem: number;
    status: string;
    percentualConcluido: number;
    dataInicio: string | null;
    dataPrevisao: string | null;
    dataConclusao: string | null;
    observacoes: string | null;
    subEtapas: Array<{
      id: string;
      nome: string;
      ordem: number;
      status: string;
      percentualConcluido: number;
      dataInicio: string | null;
      dataConclusao: string | null;
      observacoes: string | null;
    }>;
  }>;
  registrosCampo: Array<{
    id: string;
    dataVistoria: string;
    status: string;
    intercorrencias: string[];
    observacoes: string | null;
    engenheiro: { nome: string };
    fotos: Photo[];
  }>;
};

type ObraDraft = {
  titulo: string;
  descricao: string;
  endereco: string;
  bairro: string;
  latitude: string;
  longitude: string;
  valorContrato: string;
  empresaContratada: string;
  numeroOrdemServico: string;
  dataOrdemServico: string;
  previsaoConclusao: string;
  dataConclusaoReal: string;
  status: StatusObra;
  tipoObraId: string;
  engenheiroId: string;
};

const statusLabel: Record<StatusObra, string> = {
  PLANEJADA: "Em planejamento",
  ORDEM_EMITIDA: "Ordem emitida",
  EM_ANDAMENTO: "Em andamento",
  PARALISADA: "Paralisada",
  CONCLUIDA: "Concluída",
};
const etapaStatusLabel: Record<string, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDA: "Concluída",
  PARALISADA: "Paralisada",
};

const dateValue = (value: string | null) => value?.slice(0, 10) ?? "";
const displayDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(value))
    : "Não informada";
const displayValue = (value: number | null) =>
  value === null
    ? "Não informado"
    : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-b border-slate-100 py-3 last:border-b-0">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="m-0 mt-1 wrap-break-word text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  wide = false,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  wide?: boolean;
  step?: string;
}) {
  return (
    <label className={`grid min-w-0 gap-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <input
        className="min-h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        type={type}
        step={step}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export default function ObraDetalheClient({
  user,
  obra,
  tiposObra,
  engenheiros,
  initialEditMode,
}: {
  user: SidebarUser;
  obra: ObraDetail;
  tiposObra: Array<{ id: string; nome: string }>;
  engenheiros: Array<{ id: string; nome: string }>;
  initialEditMode: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(initialEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [draft, setDraft] = useState<ObraDraft>({
    titulo: obra.titulo,
    descricao: obra.descricao ?? "",
    endereco: obra.endereco,
    bairro: obra.bairro,
    latitude: String(obra.latitude),
    longitude: String(obra.longitude),
    valorContrato: obra.valorContrato === null ? "" : formatCurrencyBRL(obra.valorContrato),
    empresaContratada: obra.empresaContratada ?? "",
    numeroOrdemServico: obra.numeroOrdemServico ?? "",
    dataOrdemServico: dateValue(obra.dataOrdemServico),
    previsaoConclusao: dateValue(obra.previsaoConclusao),
    dataConclusaoReal: dateValue(obra.dataConclusaoReal),
    status: obra.status,
    tipoObraId: obra.tipoObra?.id ?? "",
    engenheiroId: obra.engenheiro?.id ?? "",
  });

  const updateDraft = <K extends keyof ObraDraft>(key: K, value: ObraDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setError("");
    setSuccess("");
  };

  async function saveChanges(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/obras/${obra.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: draft.titulo.trim(),
          descricao: draft.descricao.trim() || null,
          endereco: draft.endereco.trim(),
          bairro: draft.bairro.trim(),
          latitude: Number(draft.latitude),
          longitude: Number(draft.longitude),
          valorContrato: parseCurrencyBRLToNumber(draft.valorContrato),
          empresaContratada: draft.empresaContratada.trim() || null,
          numeroOrdemServico: draft.numeroOrdemServico.trim() || null,
          dataOrdemServico: draft.dataOrdemServico || null,
          previsaoConclusao: draft.previsaoConclusao || null,
          dataConclusaoReal: draft.dataConclusaoReal || null,
          status: draft.status,
          tipoObraId: draft.tipoObraId,
          engenheiroId: draft.engenheiroId || null,
        }),
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        setError(body?.message ?? "Não foi possível salvar as alterações.");
        return;
      }

      setEditing(false);
      setSuccess("Alterações salvas.");
      router.refresh();
    } catch {
      setError("Erro de conexão ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.shell}>
      <Sidebar user={user} />
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.profile}>
            <div className={styles.profileIcon}>{obra.secretaria.sigla}</div>
            <div>
              <strong>{obra.secretaria.sigla}</strong>
              <small>{obra.secretaria.nome}</small>
            </div>
          </div>
          <nav className={styles.navList} aria-label="Navegação da secretaria">
            <Link className={styles.navItem} href="/area-do-servidor">
              Visão geral
            </Link>
            <Link className={styles.navItem} href="/area-do-servidor/nova-obra">
              Cadastrar obra
            </Link>
          </nav>
        </aside>

        <main className={styles.main}>
          <div className={styles.pageHeading}>
            <div>
              <div className={styles.breadcrumb}>
                Área administrativa <span>/</span> Obras e Projetos <span>/</span> Detalhes
              </div>
              <h1 className={styles.pageTitle}>{obra.titulo}</h1>
              <p>Detalhes e acompanhamento da obra na área da secretaria.</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 sm:pt-6">
              {editing ? (
                <button
                  className={styles.secondaryButton}
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setEditing(false);
                    setError("");
                  }}
                >
                  <X size={16} aria-hidden="true" /> Cancelar edição
                </button>
              ) : (
                <button
                  className={styles.primaryButton}
                  type="button"
                  onClick={() => setEditing(true)}
                >
                  <Pencil size={16} aria-hidden="true" /> Editar obra
                </button>
              )}
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className={styles.statusTag}>{statusLabel[obra.status]}</span>
            <span className="text-xs text-slate-500">
              Atualizada em {displayDate(obra.updatedAt)}
            </span>
            {success && <span className="text-sm font-medium text-emerald-700">{success}</span>}
          </div>

          {editing ? (
            <form className={styles.form} onSubmit={saveChanges}>
              {error && <p className={styles.errorBanner} role="alert">{error}</p>}
              <section className={styles.card}>
                <div className={styles.cardHeading}>
                  <div><span className={styles.step}>01</span><div><h2>Identificação e escopo</h2><p>Dados principais do cadastro</p></div></div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <EditField label="Nome oficial da obra" value={draft.titulo} required onChange={(value) => updateDraft("titulo", value)} />
                  <label className="grid gap-1.5">
                    <span className="text-xs font-semibold text-slate-600">Tipo de obra</span>
                    <select
                      className="min-h-10 rounded border border-slate-300 bg-white px-3 text-sm"
                      value={draft.tipoObraId}
                      required
                      onChange={(event) => updateDraft("tipoObraId", event.target.value)}
                    >
                      <option value="">Selecione o tipo de obra</option>
                      {tiposObra.map((tipo) => <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>)}
                    </select>
                  </label>
                  <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    Secretaria: <strong>{obra.secretaria.sigla} · {obra.secretaria.nome}</strong>
                    {obra.eixo && <span className="block pt-1">Eixo: {obra.eixo.nome}</span>}
                    {obra.areaTematica && <span className="block pt-1">Área temática: {obra.areaTematica.nome}</span>}
                  </div>
                  <label className="grid gap-1.5 sm:col-span-2">
                    <span className="text-xs font-semibold text-slate-600">Descrição e escopo</span>
                    <textarea
                      className="min-h-24 rounded border border-slate-300 bg-white px-3 py-2 text-sm"
                      value={draft.descricao}
                      onChange={(event) => updateDraft("descricao", event.target.value)}
                    />
                  </label>
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeading}>
                  <div><span className={styles.step}>02</span><div><h2>Localização</h2><p>Endereço e coordenadas registradas</p></div></div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <EditField label="Logradouro / trecho" value={draft.endereco} required onChange={(value) => updateDraft("endereco", value)} />
                  <EditField label="Bairro" value={draft.bairro} required onChange={(value) => updateDraft("bairro", value)} />
                  <EditField label="Latitude" value={draft.latitude} type="number" step="any" required onChange={(value) => updateDraft("latitude", value)} />
                  <EditField label="Longitude" value={draft.longitude} type="number" step="any" required onChange={(value) => updateDraft("longitude", value)} />
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeading}>
                  <div><span className={styles.step}>03</span><div><h2>Responsabilidade e contrato</h2><p>Vínculos e dados contratuais</p></div></div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5">
                    <span className="text-xs font-semibold text-slate-600">Engenheiro fiscal</span>
                    <select className="min-h-10 rounded border border-slate-300 bg-white px-3 text-sm" value={draft.engenheiroId} onChange={(event) => updateDraft("engenheiroId", event.target.value)}>
                      <option value="">Sem engenheiro atribuído</option>
                      {engenheiros.map((engenheiro) => <option key={engenheiro.id} value={engenheiro.id}>{engenheiro.nome}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-xs font-semibold text-slate-600">Status</span>
                    <select className="min-h-10 rounded border border-slate-300 bg-white px-3 text-sm" value={draft.status} onChange={(event) => updateDraft("status", event.target.value as StatusObra)}>
                      {Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>
                  <EditField label="Processo / ordem de serviço" value={draft.numeroOrdemServico} onChange={(value) => updateDraft("numeroOrdemServico", value)} />
                  <EditField label="Empresa contratada" value={draft.empresaContratada} onChange={(value) => updateDraft("empresaContratada", value)} />
                  <EditField label="Valor do contrato" value={draft.valorContrato} onChange={(value) => updateDraft("valorContrato", formatCurrencyBRL(value))} />
                  <EditField label="Data da ordem de serviço" value={draft.dataOrdemServico} type="date" onChange={(value) => updateDraft("dataOrdemServico", value)} />
                  <EditField label="Previsão de conclusão" value={draft.previsaoConclusao} type="date" onChange={(value) => updateDraft("previsaoConclusao", value)} />
                  <EditField label="Data de conclusão real" value={draft.dataConclusaoReal} type="date" onChange={(value) => updateDraft("dataConclusaoReal", value)} />
                </div>
              </section>

              <div className="flex justify-end">
                <button className={styles.primaryButton} type="submit" disabled={saving}>
                  <Save size={16} aria-hidden="true" /> {saving ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.form}>
              <section className={styles.card}>
                <div className={styles.cardHeading}>
                  <div><span className={styles.step}><Building2 size={16} /></span><div><h2>Identificação e escopo</h2><p>Dados principais do cadastro</p></div></div>
                </div>
                <dl className="m-0 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                  <DetailField label="Nome oficial da obra" value={obra.titulo} />
                  <DetailField label="Tipo de obra" value={obra.tipoObra?.nome ?? "Não informado"} />
                  <DetailField label="Secretaria responsável" value={`${obra.secretaria.sigla} · ${obra.secretaria.nome}`} />
                  <DetailField label="Eixo estratégico" value={obra.eixo?.nome ?? "Não informado"} />
                  <DetailField label="Área temática" value={obra.areaTematica?.nome ?? "Não informada"} />
                  <DetailField label="Descrição e escopo" value={obra.descricao ?? "Não informado"} />
                  <DetailField label="Cadastro criado em" value={displayDate(obra.createdAt)} />
                </dl>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeading}>
                  <div><span className={styles.step}><MapPin size={16} /></span><div><h2>Localização</h2><p>Endereço e coordenadas para o mapa</p></div></div>
                </div>
                <dl className="m-0 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                  <DetailField label="Logradouro / trecho" value={obra.endereco} />
                  <DetailField label="Bairro" value={obra.bairro} />
                  <DetailField label="Latitude" value={String(obra.latitude)} />
                  <DetailField label="Longitude" value={String(obra.longitude)} />
                </dl>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeading}>
                  <div><span className={styles.step}><CalendarDays size={16} /></span><div><h2>Responsabilidade e contrato</h2><p>Status, equipe e datas</p></div></div>
                </div>
                <dl className="m-0 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                  <DetailField label="Status" value={statusLabel[obra.status]} />
                  <DetailField label="Engenheiro fiscal" value={obra.engenheiro?.nome ?? "Não atribuído"} />
                  <DetailField label="Processo / ordem de serviço" value={obra.numeroOrdemServico ?? "Não informado"} />
                  <DetailField label="Empresa contratada" value={obra.empresaContratada ?? "Não informada"} />
                  <DetailField label="Valor do contrato" value={displayValue(obra.valorContrato)} />
                  <DetailField label="Data da ordem de serviço" value={displayDate(obra.dataOrdemServico)} />
                  <DetailField label="Previsão de conclusão" value={displayDate(obra.previsaoConclusao)} />
                  <DetailField label="Conclusão real" value={displayDate(obra.dataConclusaoReal)} />
                </dl>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeading}>
                  <div><span className={styles.step}><ClipboardList size={16} /></span><div><h2>Etapas da obra</h2><p>Progresso das etapas e subetapas cadastradas</p></div></div>
                </div>
                {obra.etapas.length ? (
                  <div className="divide-y divide-slate-100">
                    {[...obra.etapas].sort((a, b) => a.ordem - b.ordem).map((etapa) => (
                      <article className="py-3" key={etapa.id}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <strong className="text-sm text-slate-800">{etapa.nomeCidadao || etapa.nome}</strong>
                          <span className={styles.statusTag}>{etapaStatusLabel[etapa.status] ?? etapa.status}</span>
                        </div>
                        <p className="mb-0 mt-1 text-xs text-slate-500">
                          {etapa.percentualConcluido}% concluída
                          {etapa.dataInicio && ` · Início: ${displayDate(etapa.dataInicio)}`}
                          {etapa.dataPrevisao && ` · Previsão: ${displayDate(etapa.dataPrevisao)}`}
                          {etapa.dataConclusao && ` · Conclusão: ${displayDate(etapa.dataConclusao)}`}
                        </p>
                        {etapa.observacoes && <p className="mb-0 mt-2 text-sm text-slate-700">{etapa.observacoes}</p>}
                        {etapa.subEtapas.length > 0 && (
                          <ul className="mb-0 mt-3 grid list-none gap-2 border-l-2 border-blue-100 pl-3">
                            {[...etapa.subEtapas].sort((a, b) => a.ordem - b.ordem).map((subEtapa) => (
                              <li key={subEtapa.id}>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="text-xs font-medium text-slate-700">{subEtapa.nome}</span>
                                  <span className="text-xs text-slate-500">{subEtapaStatusLabel(subEtapa.status)} · {subEtapa.percentualConcluido}%</span>
                                </div>
                                {subEtapa.observacoes && <p className="mb-0 mt-1 text-xs text-slate-500">{subEtapa.observacoes}</p>}
                              </li>
                            ))}
                          </ul>
                        )}
                      </article>
                    ))}
                  </div>
                ) : <p className={styles.emptyState}>Ainda não há etapas cadastradas para esta obra.</p>}
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeading}>
                  <div><span className={styles.step}><ClipboardList size={16} /></span><div><h2>Medições e vistorias</h2><p>Histórico registrado pelos engenheiros</p></div></div>
                </div>
                {obra.medicoes.length ? (
                  <div className="divide-y divide-slate-100">
                    {obra.medicoes.map((medicao) => (
                      <article className="grid gap-1 py-3 sm:grid-cols-[1fr_auto] sm:items-start" key={medicao.id}>
                        <div>
                          <strong className="text-sm text-slate-800">{medicao.percentualExecutado}% executado</strong>
                          <p className="m-0 mt-1 text-xs text-slate-500">{displayDate(medicao.dataVistoria)} · {medicao.engenheiro.nome}</p>
                          {medicao.observacoesTecnicas && <p className="mb-0 mt-2 text-sm text-slate-700">{medicao.observacoesTecnicas}</p>}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : <p className={styles.emptyState}>Ainda não há medições cadastradas.</p>}
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeading}>
                  <div><span className={styles.step}><ClipboardList size={16} /></span><div><h2>Registros de campo</h2><p>Vistorias, intercorrências e observações</p></div></div>
                </div>
                {obra.registrosCampo.length ? (
                  <div className="divide-y divide-slate-100">
                    {obra.registrosCampo.map((registro) => (
                      <article className="py-3" key={registro.id}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <strong className="text-sm text-slate-800">{displayDate(registro.dataVistoria)} · {registro.engenheiro.nome}</strong>
                          <span className={styles.statusTag}>{registro.status === "ENVIADO" ? "Enviado" : "Rascunho"}</span>
                        </div>
                        {registro.intercorrencias.length > 0 && <p className="mb-0 mt-2 text-xs text-slate-600">Intercorrências: {registro.intercorrencias.join(", ")}</p>}
                        {registro.observacoes && <p className="mb-0 mt-2 text-sm text-slate-700">{registro.observacoes}</p>}
                        {registro.fotos.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                            {registro.fotos.map((foto) => (
                              <a className="text-xs font-medium text-blue-700 hover:underline" href={foto.url} target="_blank" rel="noreferrer" key={foto.id}>
                                {foto.descricao || foto.tipo} · {displayDate(foto.dataFoto)}
                              </a>
                            ))}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                ) : <p className={styles.emptyState}>Ainda não há registros de campo.</p>}
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeading}>
                  <div><span className={styles.step}><ExternalLink size={16} /></span><div><h2>Fotos da obra</h2><p>Arquivos já associados ao cadastro</p></div></div>
                </div>
                {obra.fotos.length ? (
                  <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
                    {obra.fotos.map((foto) => (
                      <li className="flex min-w-0 items-center justify-between gap-3 border-b border-slate-100 py-2" key={foto.id}>
                        <span className="min-w-0 truncate text-sm text-slate-700">{foto.descricao || foto.tipo} · {displayDate(foto.dataFoto)}</span>
                        <a className="shrink-0 text-xs font-semibold text-blue-700 hover:underline" href={foto.url} target="_blank" rel="noreferrer">Abrir</a>
                      </li>
                    ))}
                  </ul>
                ) : <p className={styles.emptyState}>Ainda não há fotos cadastradas.</p>}
              </section>
            </div>
          )}

          <Link className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700" href="/area-do-servidor">
            <ArrowLeft size={16} aria-hidden="true" /> Voltar à visão geral
          </Link>
        </main>
      </div>
    </div>
  );
}
