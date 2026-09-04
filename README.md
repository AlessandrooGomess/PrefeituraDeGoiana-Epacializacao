# 📍 Espacialização de Obras Públicas — Prefeitura de Goiana/PE

Plataforma web para mapeamento georreferenciado, monitoramento e transparência das obras públicas municipais de Goiana - PE.

---

## 🎯 Objetivo do Projeto

Centralizar e espacializar em mapas interativos todas as intervenções, reformas e construções da Prefeitura Municipal de Goiana, permitindo:
- **Transparência Pública (Cidadão)**: Consulta visual do andamento das obras por bairro, valores investidos e fotos de evolução.
- **Gestão Técnica (Engenheiros / Fiscais)**: Registro de vistorias técnicas, evolução percentual e histórico fotográfico (*Antes, Em Andamento, Concluído*).
- **Tomada de Decisão (Administração / Secretarias)**: Visão consolidada dos investimentos por secretaria e status de execução.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend & Backend**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/)
- **ORM & Banco de Dados**: [Prisma ORM](https://www.prisma.io/) com [PostgreSQL](https://www.postgresql.org/)
- **Linguagem**: TypeScript
- **Gerenciador de Pacotes**: `pnpm`

---

## 🏗️ Modelo de Dados

O domínio da aplicação está modelado no Prisma com as seguintes entidades centrais:

- **Secretaria**: Órgãos municipais responsáveis pelas obras (ex.: Infraestrutura, Educação, Saúde) com cores de identificação visual no mapa.
- **Obra**: Cadastro georreferenciado com latitude/longitude, bairro, número de ordem de serviço, valor de contrato e status (`PLANEJADA`, `ORDEM_EMITIDA`, `EM_ANDAMENTO`, `PARALISADA`, `CONCLUIDA`).
- **Medicao**: Acompanhamento da evolução percentual e pareceres técnicos realizados pelos fiscais.
- **Foto**: Registro visual categorizado (`RENDER_PROJETO`, `ANTES`, `EM_ANDAMENTO`, `CONCLUIDO`).
- **Usuario**: Perfis de acesso (`CIDADAO`, `ENGENHEIRO`, `ADMIN`).

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js** (versão 20 ou superior)
- **pnpm** (`npm install -g pnpm`)
- Instância PostgreSQL ativa

### 1. Clonar e Instalar Dependências
```bash
git clone <url-do-repositorio>
cd espacializacao-obras
pnpm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com as credenciais do banco de dados:

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/banco?schema=public"
DIRECT_URL="postgresql://usuario:senha@host:5432/banco?schema=public"
```

### 3. Sincronizar o Banco de Dados (Prisma)
```bash
# Executar as migrações existentes
pnpm prisma migrate dev

# (Opcional) Abrir o Prisma Studio para visualizar os dados
pnpm prisma studio
```

### 4. Rodar o Servidor de Desenvolvimento
```bash
pnpm dev
```
Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## 🗺️ Roadmap de Desenvolvimento

- [x] Modelagem do banco de dados relacional e migrações iniciais (Prisma)
- [ ] Integração de mapa interativo (Leaflet / MapLibre) com marcadores e filtros por bairro/secretaria
- [ ] Página pública de listagem e detalhes da obra
- [ ] Painel administrativo para cadastro de obras e secretarias
- [ ] Módulo do engenheiro para inclusão de vistorias e upload de fotos
- [ ] Dashboard analítico com métricas de investimento municipal
