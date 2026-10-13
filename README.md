# Espacialização de Obras Públicas da Prefeitura de Goiana/PE

Plataforma web integrada para mapeamento georreferenciado, monitoramento técnico em campo, gestão administrativa e transparência pública das obras municipais de Goiana - PE.

---

## 🏛️ Sobre a Plataforma

A **Espacialização de Obras Públicas** é um sistema de governança e transparência que conecta a população, fiscais em campo, secretarias municipais e a alta gestão da Prefeitura de Goiana.

A plataforma combina geoprocessamento em tempo real com fluxos de fiscalização de engenharia, permitindo:
- **Ao cidadão**: localizar intervenções públicas no mapa do município, consultar contratos, empresas responsáveis, prazos e percentuais de evolução.
- **Aos engenheiros e fiscais**: realizar registros de vistorias em campo (*mobile-first*), apontar avanço de etapas/subetapas, relatar intercorrências físicas (chuvas, falta de material) e anexar fotos georreferenciadas.
- **Às secretarias municipais**: gerenciar o portfólio de obras de sua pasta, cadastrar novos projetos e acompanhar medições.
- **Ao prefeito e gestores executivos**: acompanhar painéis com indicadores consolidados de investimentos, distribuição geográfica e status de execução municipal.
- **Aos administradores**: manter cadastros de eixos estratégicos, áreas temáticas, secretarias, tipologias de obras e controle de acessos.

---

## 👥 Perfis de Acesso e Módulos

A plataforma opera com controle de acesso baseado em papéis (**RBAC - Role-Based Access Control**):

| Perfil | Nível de Acesso | Rota Principal | Principais Ações |
| --- | --- | --- | --- |
| **Cidadão** | Consulta Pública | `/` e `/projetos` | Navegação no mapa interativo, busca com filtros, visualização detalhada da obra com fotos e linha do tempo. |
| **Gestão / Prefeito** | `GESTAO` | `/area-do-prefeito` | Painel executivo com mapa resumido, KPIs de investimento total, volume de obras e gráficos de status. |
| **Secretaria** | `ADM_SECRETARIA` | `/area-do-servidor` | Gestão das obras da própria secretaria, cadastro de novas obras e acompanhamento de medições. |
| **Engenheiro / Fiscal** | `ENGENHEIRO` | `/area-do-engenheiro` | Painel de obras atribuídas e **Registro de Campo** (*mobile-first*) para diário de obras, medições e fotos. |
| **Super Administrador** | `SUPER_ADMIN` | `/area-do-admin` | Gestão global de secretarias, usuários, eixos estratégicos, tipologias de obras, relatórios e permissões. |

---

## 🚀 Principais Funcionalidades

### 🌐 Portal Público do Cidadão
- **Mapa Interativo (MapLibre GL JS)**: centralizado no território de Goiana e seus distritos, com renderização dos limites municipais via GeoJSON.
- **Marcadores Temáticos**: identificação visual por cores das secretarias e ícones representativos.
- **Popups e Cards Informativos**: resumo rápido ao clicar no marcador ou na lista lateral (`WorkList`).
- **Filtros Avançados**: busca textual, filtro por secretaria, status da obra e bairros/distritos.
- **Página Pública de Projetos (`/projetos`)**: listagem completa em grid responsivo.
- **Detalhes da Obra (`/projetos/[id]`)**: página completa contendo:
  - Cabeçalho com status, valor contratual e empresa executora;
  - Galeria de fotos categorizadas com visualizador em modal ampliado;
  - Linha do tempo interativa com histórico de vistorias e medições;
  - Ficha técnica e documentação contratual.

### 👷 Diário e Registro de Campo do Engenheiro (`/area-do-engenheiro`)
- Interface desenvolvida para smartphones e tablets para uso no canteiro de obras.
- **Avanço Físico Estruturado**: acompanhamento detalhado por etapas e subetapas configuradas por tipo de obra.
- **Registro de Intercorrências**: apontamento de chuvas, atrasos de materiais, carência de equipe ou incidentes.
- **Vistoria Fotográfica**: captura e categorização de fotos (*Antes*, *Em Andamento*, *Concluído*).

### 📊 Painel Executivo do Prefeito (`/area-do-prefeito`)
- Visão macro dos investimentos públicos em infraestrutura.
- Contadores consolidados: Total de Obras, Em Andamento, Concluídas e Paralisadas.
- Volume financeiro total investido e taxa média de execução.
- Mini-mapa integrado para localização geográfica das frentes de trabalho.

### 🏢 Painel das Secretarias (`/area-do-servidor`)
- Acesso isolado e seguro para cada órgão municipal (SEDUO, SEDUC, Saúde, etc.).
- Formulário assistido de cadastro de novas obras com validação de coordenadas e dados contratuais.
- Acompanhamento das obras ativas e histórico de intervenções da secretaria.

### ⚙️ Gestão Administrativa (`/area-do-admin`)
- Painel para gestão de usuários, senhas e atribuição de cargos/secretarias.
- Gestão da matriz de planejamento municipal (Eixos Estratégicos e Áreas Temáticas).
- Gestão de secretarias e tipos de obras com templates de etapas padronizadas.

---

## 🛠️ Stack Tecnológica

| Tecnologia | Finalidade |
| --- | --- |
| **[Next.js 16](https://nextjs.org/)** (App Router, React 19) | Framework fullstack com Server Components e Server Actions. |
| **[TypeScript](https://www.typescriptlang.org/)** | Tipagem estática em toda a aplicação. |
| **[Tailwind CSS v4](https://tailwindcss.com/)** | Estilização utilitária moderna e responsiva. |
| **[Prisma ORM 6.19](https://www.prisma.io/)** | Modelagem de dados, migrações e client tipado. |
| **[PostgreSQL](https://www.postgresql.org/) / Supabase** | Banco de dados relacional (suporte a Session e Transaction Pooler na porta 6543). |
| **[MapLibre GL JS 6.7](https://maplibre.org/)** | Renderização de mapas vetoriais de alta performance com OpenStreetMap tiles. |
| **[Auth.js (NextAuth v5 beta)](https://authjs.dev/)** | Autenticação com sessão JWT, credenciais e guards RBAC. |
| **[Bcrypt.js](https://github.com/dcodeIO/bcrypt.js)** | Hashing seguro de senhas com salt cost 12. |
| **[Zod v4](https://zod.dev/)** | Validação rigorosa de schemas e payloads de entrada. |
| **[Vitest 5](https://vitest.dev/)** | Suíte de testes automatizados unitários e de integração (153 testes). |
| **[Lucide React](https://lucide.dev/)** | Biblioteca de ícones moderna e consistente. |
| **[pnpm](https://pnpm.io/)** | Gerenciador de pacotes performático e determinístico. |

---

## 🗄️ Modelo de Dados (Prisma)

As principais entidades mapeadas no banco de dados são:

- **`Usuario`**: usuários do sistema vinculados aos papéis `SUPER_ADMIN`, `GESTAO`, `ADM_SECRETARIA`, `ENGENHEIRO` ou `CIDADAO`.
- **`Secretaria`**: pastas municipais com cores institucionais para exibição em mapas.
- **`EixoEstrategico` & `AreaTematica`**: organização dos programas de governo do município.
- **`TipoObra`**: categorias de obras (ex.: Pavimentação, Edificação, Drenagem) que definem templates de execução.
- **`EtapaTemplate` & `SubEtapaTemplate`**: pesos e nomenclaturas técnicas e cidadãs para etapas de obras.
- **`Obra`**: entidade central com coordenadas geográficas (`latitude`, `longitude`), dados contratuais, datas, endereço e status (`PLANEJADA`, `ORDEM_EMITIDA`, `EM_ANDAMENTO`, `PARALISADA`, `CONCLUIDA`).
- **`EtapaObra` & `SubEtapaObra`**: instâncias de etapas atreladas à obra com percentuais calculados.
- **`Medicao`**: registros formais de evolução percentual e observações técnicas realizadas pelo fiscal.
- **`RegistroCampo`**: diário de obras contendo intercorrências (`CHUVA`, `ATRASO_MATERIAL`, etc.) e status de rascunho/enviado.
- **`Foto`**: registros visuais georreferenciados vinculados à obra e categorizados (`RENDER_PROJETO`, `ANTES`, `EM_ANDAMENTO`, `CONCLUIDO`).

---

## 🛣️ Rotas da Aplicação

### Páginas (Frontend)

| Rota | Descrição | Acesso |
| --- | --- | --- |
| `/` | Portal público com mapa interativo de Goiana, busca e filtros. | Público |
| `/projetos` | Listagem pública de obras e projetos municipais. | Público |
| `/projetos/[id]` | Detalhe completo da obra (ficha técnica, fotos, histórico). | Público |
| `/login` | Tela de autenticação por e-mail e senha. | Público |
| `/pos-login` | Redirecionamento automático baseado na função (`Role`) do usuário. | Autenticado |
| `/area-do-prefeito` | Painel Executivo com indicadores municipais e mapa. | `GESTAO` / `SUPER_ADMIN` |
| `/area-do-servidor` | Painel de controle da secretaria logada. | `ADM_SECRETARIA` |
| `/area-do-servidor/nova-obra` | Fluxo de cadastro de nova obra pela secretaria. | `ADM_SECRETARIA` |
| `/area-do-servidor/obras/[id]` | Gerenciamento e edição da obra. | `ADM_SECRETARIA` |
| `/area-do-engenheiro` | Painel de obras atribuídas ao fiscal. | `ENGENHEIRO` |
| `/area-do-engenheiro/registro-campo` | Diário de obras mobile para vistorias em campo. | `ENGENHEIRO` |
| `/area-do-admin` | Dashboard administrativo geral. | `SUPER_ADMIN` |
| `/area-do-admin/eixos` | Gestão de eixos estratégicos e áreas temáticas. | `SUPER_ADMIN` |
| `/area-do-admin/secretarias` | Gestão de secretarias municipais. | `SUPER_ADMIN` |
| `/area-do-admin/obras` | Gestão centralizada de todas as obras municipais. | `SUPER_ADMIN` |
| `/area-do-admin/usuarios` | Gestão de usuários, permissões e senhas. | `SUPER_ADMIN` |
| `/area-do-admin/relatorios` | Relatórios e consolidação de dados. | `SUPER_ADMIN` |

---

### Endpoints da API REST

| Endpoint | Método | Descrição | Autenticação / Permissão |
| --- | --- | --- | --- |
| `/api/obras` | `GET` | Listagem com filtros de busca, paginação e dados agregados. | Público |
| `/api/obras` | `POST` | Cadastro de nova obra com validação Zod. | Autenticado (`ADM_SECRETARIA`, `SUPER_ADMIN`) |
| `/api/obras/[id]` | `GET` | Detalhes completos da obra com etapas, medições e fotos. | Público |
| `/api/obras/[id]` | `PATCH` | Atualização parcial dos dados da obra. | Autenticado (Secretaria responsável ou Admin) |
| `/api/obras/[id]` | `DELETE` | Exclusão lógica da obra (`deletedAt`). | `SUPER_ADMIN` ou `GESTAO` |
| `/api/obras/[id]/medicoes` | `GET` | Histórico cronológico de medições da obra. | Público |
| `/api/obras/[id]/medicoes` | `POST` | Registro de nova medição técnica. | Engenheiro autorizado |
| `/api/obras/[id]/fotos` | `GET` | Fotos cadastradas da obra. | Público |
| `/api/obras/[id]/fotos` | `POST` | Cadastro de nova foto para a obra. | Usuário autorizado |
| `/api/obras/[id]/registros-campo` | `GET`, `POST` | Consulta e envio de diário de vistoria de campo. | Engenheiro fiscal |
| `/api/obras/[id]/etapas` | `GET`, `POST` | Consulta e atualização de etapas físicas da obra. | Autenticado |
| `/api/filtros` | `GET` | Lista dinâmica de secretarias, status e bairros para filtros. | Público |
| `/api/tipos-obra` | `GET`, `POST` | Gerenciamento de tipologias de obras e seus templates. | `SUPER_ADMIN` |
| `/api/auth/[...nextauth]` | `GET`, `POST` | Rotas de autenticação gerenciadas pelo Auth.js. | Público |

---

## 💻 Como Rodar o Projeto Localmente

### Pré-requisitos
- **Node.js** (versão 20.x ou superior)
- **pnpm** instalado globalmente (`npm install -g pnpm`)
- Banco de dados **PostgreSQL** ativo (local ou serviço em nuvem como Supabase)

### 1. Clonar o repositório e instalar dependências
```bash
git clone https://github.com/AlessandrooGomess/PrefeituraDeGoiana-Espacializa-o.git
cd espacializacao-obras
pnpm install
```

### 2. Configurar as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```env
# Conexão com o PostgreSQL
DATABASE_URL="postgresql://postgres:[SENHA]@[HOST]:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[SENHA]@[HOST]:5432/postgres"

# Segredo para a sessão JWT do Auth.js
AUTH_SECRET="gere-um-segredo-com-pnpm-exec-auth-secret-ou-openssl"

# (Opcional) Senhas customizadas para o seed de demonstração
SEED_SENHA_ADMIN="12345678"
SEED_SENHA_PREFEITO="12345678"
SEED_SENHA_GESTOR_SEDUO="12345678"
SEED_SENHA_ENG_SEDUO="12345678"
```

> **Dica para Supabase**: utilize a porta `6543` no `DATABASE_URL` para o pooler de conexões por transação e a porta `5432` no `DIRECT_URL` para as migrações do Prisma.

### 3. Executar migrações e popular dados de teste (Seed)
```bash
# Executa as migrações do Prisma
pnpm prisma migrate dev

# Popula o banco com secretarias, eixos, obras reais de Goiana e usuários
pnpm prisma db seed
```

### 4. Iniciar o servidor de desenvolvimento
```bash
pnpm dev
```
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🔑 Contas de Demonstração (Seed)

O comando `pnpm prisma db seed` cadastra automaticamente as seguintes contas para testes dos diferentes perfis:

| Perfil | E-mail | Senha Padrão | Destino Pós-Login |
| --- | --- | --- | --- |
| **Administrador Geral** | `admin@goiana.pe.gov.br` | `12345678` | `/area-do-admin` |
| **Prefeito / Gestão** | `prefeito@goiana.pe.gov.br` | `12345678` | `/area-do-prefeito` |
| **Secretário (SEDUO)** | `gestor.seduo@goiana.pe.gov.br` | `12345678` | `/area-do-servidor` |
| **Engenheiro Fiscal (SEDUO)** | `engenheiro.seduo@goiana.pe.gov.br` | `12345678` | `/area-do-engenheiro` |
| **Engenheiro Fiscal (SEDUC)** | `engenheiro.seduc@goiana.pe.gov.br` | `12345678` | `/area-do-engenheiro` |

> Para alterar ou criar a senha de qualquer usuário via linha de comando, utilize o script auxiliar:
> ```bash
> $env:ADMIN_EMAIL="usuario@goiana.pe.gov.br"; $env:ADMIN_PASSWORD="NovaSenhaForte"; pnpm auth:set-password
> ```

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
| --- | --- |
| `pnpm dev` | Inicia a aplicação em modo de desenvolvimento (Next.js). |
| `pnpm build` | Compila a aplicação e valida tipos TypeScript para produção. |
| `pnpm start` | Inicia o servidor otimizado em modo de produção. |
| `pnpm test` | Executa a suíte de 153 testes automatizados via Vitest. |
| `pnpm test:watch` | Executa os testes no modo observador (*watch mode*). |
| `pnpm lint` | Analisa a qualidade do código com ESLint. |
| `pnpm auth:set-password` | Utilitário CLI para definir/atualizar hash de senha no banco. |
| `pnpm prisma studio` | Interface visual web para inspecionar e editar tabelas do banco. |
| `pnpm prisma migrate dev` | Aplica alterações do schema do Prisma no banco de dados. |
| `pnpm prisma db seed` | Recria a base inicial de secretarias, obras e usuários. |

---

## 📁 Estrutura de Pastas

```text
espacializacao-obras/
├── app/
│   ├── api/                           # Rotas da API REST
│   │   ├── auth/[...nextauth]/        # Handlers do Auth.js
│   │   ├── filtros/                   # Agregação de opções para filtros
│   │   ├── obras/                     # CRUD de obras, medições, fotos e etapas
│   │   └── tipos-obra/                # Gestão de tipos de obras e templates
│   ├── area-do-admin/                 # Painel do Administrador Geral
│   │   ├── eixos/                     # Gestão de eixos estratégicos
│   │   ├── obras/                     # Gestão global de obras
│   │   ├── secretarias/               # Gestão de secretarias
│   │   ├── usuarios/                  # Gestão de usuários e permissões
│   │   └── relatorios/                # Relatórios consolidados
│   ├── area-do-engenheiro/            # Painel do Engenheiro Fiscal
│   │   └── registro-campo/            # Vistoria e diário de obras mobile-first
│   ├── area-do-prefeito/              # Painel Executivo do Prefeito (KPIs e mapa)
│   ├── area-do-servidor/              # Painel da Secretaria Municipal
│   │   ├── nova-obra/                 # Cadastro e etapas de nova obra
│   │   └── obras/[id]/                # Gerenciamento de obra específica
│   ├── login/                         # Página de autenticação por credenciais
│   ├── pos-login/                     # Roteador de transição inteligente (RBAC)
│   ├── projetos/                      # Listagem pública de projetos
│   │   └── [id]/                      # Detalhes públicos e linha do tempo da obra
│   ├── layout.tsx                     # Layout raiz com fontes e tema
│   └── page.tsx                       # Página inicial (Portal do Cidadão com Mapa)
├── components/
│   ├── area-engenheiro/               # Componentes do painel do engenheiro
│   ├── map/                           # Mapa MapLibre, marcadores, filtros e popups
│   ├── obra-detalhe/                  # Linha do tempo, galeria modal e ficha técnica
│   ├── portal/                        # Cabeçalho e rodapé do portal público
│   ├── registro-campo/                # Cards de evolução física, fotos e intercorrências
│   └── sidebar/                       # Menu lateral adaptativo por perfil
├── lib/
│   ├── auth/                          # Provedores, sessões e guardas de rota
│   ├── obras/                         # Regras de negócio, cálculos e validações
│   ├── serializers/                   # Serializadores Decimal/Date para JSON
│   ├── utils/                         # Formatadores de moeda, tempo e busca
│   ├── validations/                   # Schemas de validação Zod
│   └── prisma.ts                      # Instância singleton do Prisma Client
├── prisma/
│   ├── schema.prisma                  # Modelagem relacional e enumerações
│   ├── seed.ts                        # Script de dados de demonstração
│   └── migrations/                    # Histórico versionado de migrações SQL
├── public/
│   ├── geojson/                       # Limites territoriais de Goiana e distritos
│   ├── fotos/                         # Fotos e registros visuais locais
│   └── icons/                         # Ícones e marcadores do mapa
└── scripts/
    └── set-user-password.ts           # Script CLI para gestão de senhas com bcrypt
```

---

## 🗺️ Status e Roadmap

- [x] Modelagem relacional completa com Prisma e PostgreSQL
- [x] Mapa interativo com MapLibre GL JS e limites de Goiana via GeoJSON
- [x] Portal público com busca, filtros dinâmicos, cards e popups
- [x] Página pública de projetos e detalhe completo com galeria e linha do tempo (`/projetos/[id]`)
- [x] Autenticação segura com Auth.js, senhas criptografadas com bcrypt e controle por papéis (RBAC)
- [x] Painel Executivo do Prefeito com métricas de investimento e acompanhamento (`/area-do-prefeito`)
- [x] Painel do Engenheiro com Registro de Campo mobile-first (`/area-do-engenheiro/registro-campo`)
- [x] Gestão de obras e formulário de cadastro por secretaria (`/area-do-servidor`)
- [x] Painel administrativo com gestão de eixos, secretarias e usuários (`/area-do-admin`)
- [x] Suíte de testes automatizados com Vitest (153 testes aprovados)
- [ ] Integração com serviço de Cloud Storage (ex.: AWS S3 ou Supabase Storage) para upload físico de fotos
- [ ] Exportação de relatórios consolidados em PDF e planilhas Excel
- [ ] Suporte offline (PWA) para coleta de vistorias em áreas rurais sem sinal de internet
