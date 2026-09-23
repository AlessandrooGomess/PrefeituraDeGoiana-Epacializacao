"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Building2, FileText, HelpCircle, Save, Send, Settings, Upload } from "lucide-react";
import Sidebar, { type SidebarUser } from "@/components/sidebar/Sidebar";
import styles from "./area-do-servidor.module.css";

type FormState = {
  titulo: string;
  secretariaId: string;
  eixoId: string;
  descricao: string;
  distrito: string;
  endereco: string;
  bairro: string;
  latitude: string;
  longitude: string;
  engenheiroId: string;
  empresaContratada: string;
  numeroOrdemServico: string;
  valorContrato: string;
  dataOrdemServico: string;
  previsaoConclusao: string;
};

const initialForm: FormState = {
  titulo: "",
  secretariaId: "",
  eixoId: "",
  descricao: "",
  distrito: "Goiana (Sede)",
  endereco: "",
  bairro: "",
  latitude: "",
  longitude: "",
  engenheiroId: "",
  empresaContratada: "",
  numeroOrdemServico: "",
  valorContrato: "",
  dataOrdemServico: "",
  previsaoConclusao: "",
};

function Field({ label, required, children, wide = false }: { label: string; required?: boolean; children: React.ReactNode; wide?: boolean }) {
  return <label className={`${styles.field} ${wide ? styles.wide : ""}`}><span>{label}{required && <b aria-hidden="true"> *</b>}</span>{children}</label>;
}

export default function ObraForm({ user }: { user: SidebarUser }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "saved" | "error" | "sending">("idle");
  const [message, setMessage] = useState("");
  const update = (field: keyof FormState, value: string) => { setForm((current) => ({ ...current, [field]: value })); setStatus("idle"); setMessage(""); };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    try {
      const response = await fetch("/api/obras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo, descricao: form.descricao || null, endereco: form.endereco, bairro: form.bairro,
          latitude: Number(form.latitude), longitude: Number(form.longitude), valorContrato: form.valorContrato ? Number(form.valorContrato) : null,
          empresaContratada: form.empresaContratada || null, numeroOrdemServico: form.numeroOrdemServico || null,
          dataOrdemServico: form.dataOrdemServico || null, previsaoConclusao: form.previsaoConclusao || null,
          secretariaId: form.secretariaId, eixoId: form.eixoId || null, status: "PLANEJADA",
        }),
      });
      if (!response.ok) throw new Error("Não foi possível publicar a obra.");
      setStatus("saved"); setMessage("Obra publicada com sucesso.");
    } catch { setStatus("error"); setMessage("Não foi possível publicar agora. Verifique os campos e a conexão com o servidor."); }
  };
  return (
    <div className={styles.shell}>
      <Sidebar user={user} />
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.profile}><div className={styles.profileIcon}><Building2 size={21} /></div><div><strong>Gestão Pública</strong><small>Sec. de Infraestrutura</small></div></div>
          <button className={styles.serviceButton} type="button"><FileText size={14} /> Ordens de Serviço</button>
          <div className={styles.navList}>{["Dashboard", "Obras e Projetos", "Vistorias e Fiscalizações", "Contratos", "Relatórios"].map((label) => <button className={`${styles.navItem} ${label === "Obras e Projetos" ? styles.navItemActive : ""}`} key={label} type="button">{label}</button>)}</div>
          <div className={styles.sidebarBottom}><button className={styles.navItem} type="button"><Settings size={15} /> Configurações</button><button className={styles.navItem} type="button"><HelpCircle size={15} /> Ajuda e suporte</button></div>
        </aside>
        <main className={styles.main}>
          <div className={styles.pageHeading}><div><div className={styles.breadcrumb}>Obras e Projetos <span>/</span> Novo cadastro</div><h1 className={styles.pageTitle}>Cadastrar Nova Obra Pública <em>NOVO REGISTRO</em></h1><p>Preencha os dados técnicos, orçamentários e contratuais para registrar o projeto na base municipal de infraestrutura.</p></div><div className={styles.headingActions}><button className={styles.secondaryButton} type="button" onClick={() => { setStatus("saved"); setMessage("Rascunho salvo localmente."); }}><Save size={14} /> Salvar como Rascunho</button><button className={styles.primaryButton} type="submit" form="obra-form"><Send size={14} /> Publicar</button></div></div>
          <form id="obra-form" className={styles.form} onSubmit={handleSubmit}>
            <section className={styles.card}><div className={styles.cardHeading}><div><span className={styles.step}>01</span><div><h2>Identificação e escopo da obra</h2><p>Campos com (*) são obrigatórios</p></div></div></div><div className={styles.fieldsGrid}>
              <Field label="Nome oficial da obra / intervenção" required><input required value={form.titulo} onChange={(event) => update("titulo", event.target.value)} placeholder="Ex.: Pavimentação e Drenagem Pluvial" /></Field>
              <Field label="Secretaria responsável" required><select required value={form.secretariaId} onChange={(event) => update("secretariaId", event.target.value)}><option value="">Selecione a secretaria</option><option value="infraestrutura">Secretaria de Infraestrutura</option><option value="educacao">Secretaria de Educação</option><option value="saude">Secretaria de Saúde</option></select></Field>
              <Field label="Tipo de intervenção" required><select required value={form.eixoId} onChange={(event) => update("eixoId", event.target.value)}><option value="">Selecione o tipo</option><option value="pavimentacao">Pavimentação e drenagem</option><option value="equipamento">Equipamento público</option><option value="reforma">Reforma e manutenção</option></select></Field>
              <Field label="Descrição e escopo" wide><textarea value={form.descricao} onChange={(event) => update("descricao", event.target.value)} placeholder="Descreva o escopo e os resultados esperados..." rows={3} /></Field>
            </div></section>
            <section className={styles.card}><div className={styles.cardHeading}><div><span className={styles.step}>02</span><div><h2>Localização e território municipal</h2><p>Informe o local exato para exibição no mapa público.</p></div></div></div><div className={styles.fieldsGrid}>
              <Field label="Distrito / localidade"><select value={form.distrito} onChange={(event) => update("distrito", event.target.value)}><option>Goiana (Sede)</option><option>Tejucupapo</option><option>Ponta de Pedras</option><option>Atapuz</option></select></Field>
              <Field label="Logradouro / trecho" required><input required value={form.endereco} onChange={(event) => update("endereco", event.target.value)} placeholder="Avenida principal ou referência" /></Field>
              <Field label="Bairro" required><input required value={form.bairro} onChange={(event) => update("bairro", event.target.value)} placeholder="Centro" /></Field>
              <Field label="Latitude (graus decimais)" required><input required type="number" step="any" value={form.latitude} onChange={(event) => update("latitude", event.target.value)} placeholder="-7.558321" /></Field>
              <Field label="Longitude (graus decimais)" required><input required type="number" step="any" value={form.longitude} onChange={(event) => update("longitude", event.target.value)} placeholder="-35.004189" /></Field>
            </div></section>
            <section className={styles.card}><div className={styles.cardHeading}><div><span className={styles.step}>03</span><div><h2>Responsabilidade técnica</h2><p>Defina os responsáveis pelo acompanhamento da execução.</p></div></div></div><div className={styles.fieldsGrid}><Field label="Engenheiro fiscal titular" required><select required value={form.engenheiroId} onChange={(event) => update("engenheiroId", event.target.value)}><option value="">Selecione o responsável técnico</option><option value="engenheiro-1">Eng. Carlos Eduardo Silva</option><option value="engenheiro-2">Enga. Mariana Cavalcanti</option></select></Field></div></section>
            <section className={styles.card}><div className={styles.cardHeading}><div><span className={styles.step}>04</span><div><h2>Vínculo contratual e empreiteira</h2><p>Associe o processo licitatório e os dados do contrato.</p></div></div></div><div className={styles.fieldsGrid}><Field label="Processo licitatório vinculado"><input value={form.numeroOrdemServico} onChange={(event) => update("numeroOrdemServico", event.target.value)} placeholder="CT-2023/045" /></Field><Field label="Empresa vencedora / contratada"><input value={form.empresaContratada} onChange={(event) => update("empresaContratada", event.target.value)} placeholder="Nome da empresa contratada" /></Field><Field label="Valor homologado / contratual"><input type="number" step="0.01" value={form.valorContrato} onChange={(event) => update("valorContrato", event.target.value)} placeholder="2450000.00" /></Field><Field label="Ordem de serviço (data prevista)"><input type="date" value={form.dataOrdemServico} onChange={(event) => update("dataOrdemServico", event.target.value)} /></Field><Field label="Previsão de conclusão / entrega"><input type="date" value={form.previsaoConclusao} onChange={(event) => update("previsaoConclusao", event.target.value)} /></Field></div></section>
            <section className={styles.card}><div className={styles.cardHeading}><div><span className={styles.step}>05</span><div><h2>Documentos e imagens</h2><p>Anexe arquivos de apoio ao cadastro da obra.</p></div></div></div><label className={styles.upload}><Upload size={19} /><span><strong>Adicionar documentos</strong><small>PDF, JPG ou PNG até 10 MB</small></span><input type="file" multiple /></label></section>
            <div className={styles.formFooter}><span className={`${styles.feedback} ${status === "error" ? styles.feedbackError : ""}`}>{status === "sending" ? "Enviando..." : message}</span><div><button className={styles.cancelButton} type="button" onClick={() => setForm(initialForm)}>Cancelar</button><button className={styles.primaryButton} type="submit"><Send size={14} /> Publicar obra</button></div></div>
          </form>
        </main>
      </div>
      <footer className={styles.footer}><span>Portal de Infraestrutura · Prefeitura de Goiana</span><div><Link href="#privacidade">Privacidade</Link><Link href="#suporte">Suporte</Link><Link href="#acessibilidade">Acessibilidade</Link></div></footer>
    </div>
  );
}
