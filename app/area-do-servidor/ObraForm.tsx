"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AlertCircle, Building2, CheckCircle2, HelpCircle, Save, Send, Settings, Upload } from "lucide-react";
import Sidebar, { type SidebarUser } from "@/components/sidebar/Sidebar";
import styles from "./area-do-servidor.module.css";

type FormState = {
  titulo: string;
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

type FieldErrors = Partial<Record<keyof FormState | "geral", string>>;

function Field({
  label,
  required,
  error,
  children,
  wide = false,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`${styles.field} ${wide ? styles.wide : ""} ${error ? styles.fieldHasError : ""}`}>
      <span>
        {label}
        {required && <b aria-hidden="true"> *</b>}
      </span>
      {children}
      {error && <span className={styles.fieldError}>{error}</span>}
    </label>
  );
}

type ObraFormProps = {
  user: SidebarUser;
  secretaria: { id: string; nome: string; sigla: string; eixo: { id: string; nome: string } | null };
  engenheiros: Array<{ id: string; nome: string }>;
};

export default function ObraForm({ user, secretaria, engenheiros }: ObraFormProps) {
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "saved" | "error" | "sending">("idle");
  const [message, setMessage] = useState("");

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setStatus("idle");
    setMessage("");
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateClientForm = (): FieldErrors => {
    const errors: FieldErrors = {};

    if (!form.titulo.trim()) {
      errors.titulo = "Informe o nome oficial da obra.";
    } else if (form.titulo.trim().length < 3) {
      errors.titulo = "O título deve ter pelo menos 3 caracteres.";
    }

    if (!form.endereco.trim()) {
      errors.endereco = "Informe o logradouro ou referência.";
    }

    if (!form.bairro.trim()) {
      errors.bairro = "Informe o bairro ou comunidade.";
    }

    if (!form.latitude.trim()) {
      errors.latitude = "Informe a coordenada de latitude.";
    } else {
      const lat = Number(form.latitude);
      if (Number.isNaN(lat) || lat < -90 || lat > 90) {
        errors.latitude = "Informe uma latitude válida (entre -90 e 90).";
      }
    }

    if (!form.longitude.trim()) {
      errors.longitude = "Informe a coordenada de longitude.";
    } else {
      const lng = Number(form.longitude);
      if (Number.isNaN(lng) || lng < -180 || lng > 180) {
        errors.longitude = "Informe uma longitude válida (entre -180 e 180).";
      }
    }

    if (form.dataOrdemServico && form.previsaoConclusao) {
      const inicio = new Date(form.dataOrdemServico);
      const fim = new Date(form.previsaoConclusao);
      if (fim < inicio) {
        errors.previsaoConclusao = "A previsão de conclusão não pode ser anterior à data da ordem de serviço.";
      }
    }

    return errors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 1. Validação preventiva no cliente
    const clientErrors = validateClientForm();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setStatus("error");
      setMessage("Por favor, revise os campos destacados em vermelho abaixo.");
      return;
    }

    setStatus("sending");
    setFieldErrors({});
    setMessage("");

    try {
      const response = await fetch("/api/obras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo.trim(),
          descricao: form.descricao.trim() || null,
          endereco: form.endereco.trim(),
          bairro: form.bairro.trim(),
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          valorContrato: form.valorContrato ? Number(form.valorContrato) : null,
          empresaContratada: form.empresaContratada.trim() || null,
          numeroOrdemServico: form.numeroOrdemServico.trim() || null,
          dataOrdemServico: form.dataOrdemServico || null,
          previsaoConclusao: form.previsaoConclusao || null,
          eixoId: secretaria.eixo?.id ?? null,
          engenheiroId: form.engenheiroId || null,
          status: "PLANEJADA",
        }),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const apiErrors: FieldErrors = {};

        // Extrai e mapeia erros do Zod retornados pelo backend
        if (responseData?.errors && Array.isArray(responseData.errors)) {
          responseData.errors.forEach((err: { path?: string[]; message?: string }) => {
            const fieldName = err.path?.[0] as keyof FormState | undefined;
            if (fieldName && err.message) {
              apiErrors[fieldName] = err.message;
            }
          });
        }

        // Extrai relações inválidas
        if (responseData?.fields && Array.isArray(responseData.fields)) {
          responseData.fields.forEach((fieldName: string) => {
            if (fieldName in initialForm) {
              apiErrors[fieldName as keyof FormState] = "Referência inválida ou não encontrada.";
            }
          });
        }

        if (Object.keys(apiErrors).length > 0) {
          setFieldErrors(apiErrors);
          setStatus("error");
          setMessage("Por favor, corrija os campos destacados em vermelho.");
        } else {
          setStatus("error");
          setMessage(responseData?.message || "Não foi possível publicar a obra. Verifique os dados.");
        }
        return;
      }

      setStatus("saved");
      setFieldErrors({});
      setMessage("Obra cadastrada e publicada com sucesso!");
    } catch {
      setStatus("error");
      setMessage("Erro de conexão ao tentar salvar a obra. Verifique sua rede e tente novamente.");
    }
  };
  return (
    <div className={styles.shell}>
      <Sidebar user={user} />
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.profile}><div className={styles.profileIcon}><Building2 size={21} /></div><div><strong>{secretaria.sigla}</strong><small>{secretaria.nome}</small></div></div>
          <div className={styles.navList}><Link className={styles.navItem} href="/area-do-servidor">Visão geral</Link><span className={`${styles.navItem} ${styles.navItemActive}`}>Cadastrar obra</span></div>
          <div className={styles.sidebarBottom}><button className={styles.navItem} type="button"><Settings size={16} /> Configurações</button><button className={styles.navItem} type="button"><HelpCircle size={16} /> Ajuda e suporte</button></div>
        </aside>
        <main className={styles.main}>
          <div className={styles.pageHeading}>
            <div>
              <div className={styles.breadcrumb}>Obras e Projetos <span>/</span> Novo cadastro</div>
              <h1 className={styles.pageTitle}>Cadastrar Nova Obra Pública <em>NOVO REGISTRO</em></h1>
              <p>Preencha os dados técnicos, orçamentários e contratuais para registrar o projeto na base municipal de infraestrutura.</p>
            </div>
            <div className={styles.headingActions}>
              <button
                className={styles.secondaryButton}
                type="button"
                disabled={status === "sending"}
                onClick={() => {
                  setStatus("saved");
                  setMessage("Rascunho salvo localmente.");
                }}
              >
                <Save size={16} /> Salvar como Rascunho
              </button>
              <button
                className={styles.primaryButton}
                type="submit"
                form="obra-form"
                disabled={status === "sending"}
              >
                <Send size={16} /> {status === "sending" ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </div>

          <form id="obra-form" className={styles.form} onSubmit={handleSubmit} noValidate>
            {status === "error" && message && (
              <div className={styles.errorBanner} role="alert">
                <AlertCircle size={20} />
                <span>{message}</span>
              </div>
            )}

            <section className={styles.card}>
              <div className={styles.cardHeading}>
                <div>
                  <span className={styles.step}>01</span>
                  <div>
                    <h2>Identificação e escopo da obra</h2>
                    <p>Campos com (*) são obrigatórios</p>
                  </div>
                </div>
              </div>
              <div className={styles.fieldsGrid}>
                <Field label="Nome oficial da obra / intervenção" required error={fieldErrors.titulo}>
                  <input
                    required
                    value={form.titulo}
                    onChange={(event) => update("titulo", event.target.value)}
                    placeholder="Ex.: Pavimentação e Drenagem Pluvial"
                  />
                </Field>
                <Field label="Secretaria responsável">
                  <input value={`${secretaria.sigla} - ${secretaria.nome}`} readOnly />
                </Field>
                <Field label="Eixo estratégico">
                  <input value={secretaria.eixo?.nome ?? "Sem eixo vinculado"} readOnly />
                </Field>
                <Field label="Descrição e escopo" wide error={fieldErrors.descricao}>
                  <textarea
                    value={form.descricao}
                    onChange={(event) => update("descricao", event.target.value)}
                    placeholder="Descreva o escopo e os resultados esperados..."
                    rows={3}
                  />
                </Field>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeading}>
                <div>
                  <span className={styles.step}>02</span>
                  <div>
                    <h2>Localização e território municipal</h2>
                    <p>Informe o local exato para exibição no mapa público.</p>
                  </div>
                </div>
              </div>
              <div className={styles.fieldsGrid}>
                <Field label="Distrito / localidade">
                  <select value={form.distrito} onChange={(event) => update("distrito", event.target.value)}>
                    <option>Goiana (Sede)</option>
                    <option>Tejucupapo</option>
                    <option>Ponta de Pedras</option>
                    <option>Atapuz</option>
                  </select>
                </Field>
                <Field label="Logradouro / trecho" required error={fieldErrors.endereco}>
                  <input
                    required
                    value={form.endereco}
                    onChange={(event) => update("endereco", event.target.value)}
                    placeholder="Avenida principal ou referência"
                  />
                </Field>
                <Field label="Bairro" required error={fieldErrors.bairro}>
                  <input
                    required
                    value={form.bairro}
                    onChange={(event) => update("bairro", event.target.value)}
                    placeholder="Centro"
                  />
                </Field>
                <Field label="Latitude (graus decimais)" required error={fieldErrors.latitude}>
                  <input
                    required
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(event) => update("latitude", event.target.value)}
                    placeholder="-7.558321"
                  />
                </Field>
                <Field label="Longitude (graus decimais)" required error={fieldErrors.longitude}>
                  <input
                    required
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(event) => update("longitude", event.target.value)}
                    placeholder="-35.004189"
                  />
                </Field>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeading}>
                <div>
                  <span className={styles.step}>03</span>
                  <div>
                    <h2>Responsabilidade técnica</h2>
                    <p>Defina os responsáveis pelo acompanhamento da execução.</p>
                  </div>
                </div>
              </div>
              <div className={styles.fieldsGrid}>
                <Field label="Engenheiro fiscal titular" error={fieldErrors.engenheiroId}>
                  <select
                    value={form.engenheiroId}
                    onChange={(event) => update("engenheiroId", event.target.value)}
                  >
                    <option value="">Selecione o responsável técnico</option>
                    {engenheiros.map((engenheiro) => (
                      <option key={engenheiro.id} value={engenheiro.id}>
                        {engenheiro.nome}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeading}>
                <div>
                  <span className={styles.step}>04</span>
                  <div>
                    <h2>Vínculo contratual e empreiteira</h2>
                    <p>Associe o processo licitatório e os dados do contrato.</p>
                  </div>
                </div>
              </div>
              <div className={styles.fieldsGrid}>
                <Field label="Processo licitatório vinculado" error={fieldErrors.numeroOrdemServico}>
                  <input
                    value={form.numeroOrdemServico}
                    onChange={(event) => update("numeroOrdemServico", event.target.value)}
                    placeholder="CT-2023/045"
                  />
                </Field>
                <Field label="Empresa vencedora / contratada" error={fieldErrors.empresaContratada}>
                  <input
                    value={form.empresaContratada}
                    onChange={(event) => update("empresaContratada", event.target.value)}
                    placeholder="Nome da empresa contratada"
                  />
                </Field>
                <Field label="Valor homologado / contratual" error={fieldErrors.valorContrato}>
                  <input
                    type="number"
                    step="0.01"
                    value={form.valorContrato}
                    onChange={(event) => update("valorContrato", event.target.value)}
                    placeholder="2450000.00"
                  />
                </Field>
                <Field label="Ordem de serviço (data prevista)" error={fieldErrors.dataOrdemServico}>
                  <input
                    type="date"
                    value={form.dataOrdemServico}
                    onChange={(event) => update("dataOrdemServico", event.target.value)}
                  />
                </Field>
                <Field label="Previsão de conclusão / entrega" error={fieldErrors.previsaoConclusao}>
                  <input
                    type="date"
                    value={form.previsaoConclusao}
                    onChange={(event) => update("previsaoConclusao", event.target.value)}
                  />
                </Field>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeading}>
                <div>
                  <span className={styles.step}>05</span>
                  <div>
                    <h2>Documentos e imagens</h2>
                    <p>Anexe arquivos de apoio ao cadastro da obra.</p>
                  </div>
                </div>
              </div>
              <label className={styles.upload}>
                <Upload size={19} />
                <span>
                  <strong>Adicionar documentos</strong>
                  <small>PDF, JPG ou PNG até 10 MB</small>
                </span>
                <input type="file" multiple />
              </label>
            </section>

            <div className={styles.formFooter}>
              <span className={`${styles.feedback} ${status === "error" ? styles.feedbackError : ""}`}>
                {status === "sending" ? "Publicando obra..." : message}
              </span>
              <div>
                <button
                  className={styles.cancelButton}
                  type="button"
                  disabled={status === "sending"}
                  onClick={() => {
                    setForm(initialForm);
                    setFieldErrors({});
                    setStatus("idle");
                    setMessage("");
                  }}
                >
                  Cancelar
                </button>
                <button
                  className={styles.primaryButton}
                  type="submit"
                  disabled={status === "sending"}
                >
                  <Send size={16} /> {status === "sending" ? "Publicando..." : "Publicar obra"}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
      <footer className={styles.footer}><span>Portal de Infraestrutura · Prefeitura de Goiana</span><div><Link href="#privacidade">Privacidade</Link><Link href="#suporte">Suporte</Link><Link href="#acessibilidade">Acessibilidade</Link></div></footer>
    </div>
  );
}
