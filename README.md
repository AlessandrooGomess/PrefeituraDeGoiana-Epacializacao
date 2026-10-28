# Espacialização de Obras Públicas da Prefeitura de Goiana/PE

Plataforma web para mapeamento georreferenciado, monitoramento técnico e transparência das obras públicas municipais de Goiana - PE.

A aplicação integra dados geoespaciais, contratuais e operacionais, permitindo que a administração municipal gerencie frentes de trabalho em tempo real e disponibilize à população um canal de acompanhamento das intervenções no território.

---

## O que é a plataforma

A Espacialização de Obras Públicas é uma plataforma web desenvolvida para centralizar, mapear e acompanhar a execução das obras públicas do município de Goiana/PE.

Por meio de um mapa interativo e painéis operacionais integrados, a ferramenta permite localizar intervenções em todo o território municipal, consultar valores de contratos, prazos de execução, empresas responsáveis e percentuais de avanço físico. O sistema também oferece módulos dedicados para coleta de dados de vistoria em campo por fiscais e painéis analíticos para tomada de decisão pela gestão pública.

---

## Pra quem é

- **Cidadãos**: consulta pública e georreferenciada das obras realizadas ou planejadas no município, com acesso a contratos, empresas responsáveis, fotos e histórico de evolução.
- **Engenheiros e fiscais**: acompanhamento operacional em campo, preenchimento de diário de obras, registro de medições e controle de avanço por etapas.
- **Secretarias municipais**: gestão da carteira de obras do respectivo órgão, cadastro de novos projetos e fiscalização das execuções da pasta.
- **Gestores públicos e Prefeito**: acompanhamento gerencial e executivo dos investimentos municipais, distribuição territorial das intervenções e cumprimento de prazos.
- **Administradores do sistema**: gestão centralizada de usuários, permissões, secretarias, eixos de planejamento e tipologias de obras.

---

## Principais funcionalidades

- Mapa interativo com MapLibre GL JS e camada vetorial dos limites oficiais do município de Goiana e distritos via GeoJSON.
- Marcadores georreferenciados com identificação visual por cores das secretarias municipais.
- Popups e painéis laterais com ficha resumida da obra, endereço, bairro, valor contratado e percentual executado.
- Mecanismo de busca textual e filtros dinâmicos por secretaria, status da obra e bairros/distritos.
- Listagem pública de projetos em grade (`/projetos`) e página de detalhe da obra (`/projetos/[id]`) com linha do tempo de medições, dados contratuais e galeria de fotos com visualizador ampliado.
- Módulo de vistoria e registro de campo para engenheiros (`/area-do-engenheiro/registro-campo`), desenvolvido para uso em dispositivos móveis, com apontamento de evolução física por etapas/subetapas, registro de intercorrências (chuvas, falta de material) e fotos de vistoria.
- Painel executivo da gestão municipal (`/area-do-prefeito` e `/area-do-prefeito/status-obras`) com indicadores consolidados de investimentos, detalhamento por eixo e secretaria, separação entre obras atrasadas e em alerta (até 60 dias) e mini-mapa territorial.
- Painel setorial de secretarias (`/area-do-servidor`) com acompanhamento de obras da pasta e formulário assistido para cadastro de novas obras.
- Painel administrativo geral (`/area-do-admin`) com controle de usuários, permissões, eixos estratégicos, áreas temáticas e exportação de relatórios (CSV e JSON).
- Autenticação e controle de acesso baseado em papéis (RBAC) com Auth.js, sessões via JWT e criptografia de senhas com bcryptjs (custo de salt 12).
- Roteamento inteligente pós-login (`/pos-login`) com redirecionamento automático para a área correspondente ao perfil do usuário autenticado.
- API REST documentada com validações rigorosas de entrada com Zod.
- Suíte automatizada com 157 testes unitários e de integração utilizando Vitest.

---

## Como funciona, na prática

1. O cidadão acessa a página inicial pública da aplicação (`/`).
2. O mapa interativo é carregado, centralizado em Goiana, renderizando o limite territorial do município e consultando o endpoint `GET /api/obras`.
3. As obras georreferenciadas são exibidas como marcadores no mapa. Ao selecionar uma obra, o usuário visualiza suas informações resumidas e pode abrir a página completa (`/projetos/[id]`), com ficha técnica, histórico de medições e galeria fotográfica.
4. Para acessar os módulos internos, servidores, fiscais e gestores utilizam a tela de autenticação (`/login`) com e-mail institucional e senha.
5. A rota intermediária `/pos-login` verifica o papel (`Role`) do usuário na sessão e o direciona para seu respectivo painel de trabalho:
   - `SUPER_ADMIN` é encaminhado para o painel de administração geral (`/area-do-admin`).
   - `GESTAO` é encaminhado para o painel executivo do prefeito (`/area-do-prefeito`).
   - `ADM_SECRETARIA` é encaminhado para o painel da secretaria (`/area-do-servidor`).
   - `ENGENHEIRO` é encaminhado para o painel de fiscalização (`/area-do-engenheiro`).
6. O engenheiro fiscal utiliza o smartphone no canteiro de obras para acessar `/area-do-engenheiro/registro-campo`, onde registra o avanço físico de cada etapa e subetapa, insere fotos da vistoria e aponta eventuais intercorrências.
7. Os registros de campo e medições atualizam automaticamente os percentuais e indicadores da obra, refletindo no portal público e nos painéis executivos.

---

## Arquitetura e Stack

- **Frontend & Backend**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Linguagem**: TypeScript com checagem estrita de tipos
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/)
- **ORM & Banco de Dados**: [Prisma ORM 6.19](https://www.prisma.io/) com [PostgreSQL](https://www.postgresql.org/)
- **Mecanismo de Mapas**: [MapLibre GL JS 6.7](https://maplibre.org/) com tiles do OpenStreetMap
- **Autenticação**: [Auth.js](https://authjs.dev/) (NextAuth v5 beta) com sessões JWT e guards de rotas
- **Criptografia**: [bcryptjs](https://github.com/dcodeIO/bcrypt.js) para hashing de senhas
- **Validação de Schemas**: [Zod](https://zod.dev/) para sanitização de entradas e APIs
- **Testes Automatizados**: [Vitest 5](https://vitest.dev/) (157 testes unitários e de integração)
- **Iconografia**: [Lucide React](https://lucide.dev/)
- **Gerenciador de Pacotes**: `pnpm`

---

## Camadas Internas

- **Apresentação**: páginas em `app/` estruturadas no App Router, componentes de mapa em `components/map/`, fichas de detalhes em `components/obra-detalhe/`, módulo de vistoria em `components/registro-campo/` e barras de navegação em `components/sidebar/` e `components/area-engenheiro/`.
- **API**: rotas em `app/api/` responsáveis por consulta, cadastro, detalhamento, atualização, exclusão lógica, histórico de medições, fotos e etapas de obras.
- **Autenticação e Permissões**: configuração do Auth.js em `auth.ts` e guards de autorização por papel e secretaria em `lib/auth/`.
- **Persistência**: cliente Prisma configurado em `lib/prisma.ts`, com esquemas relacionais e migrações em `prisma/`.
- **Regras de Negócio e Validações**: esquemas Zod em `lib/validations/`, regras de integridade e cálculos de etapas em `lib/obras/`.
- **Serialização e Utilitários**: conversão de tipos `Decimal` e formatação de datas em `lib/serializers/` e funções auxiliares de moeda, busca e tempo em `lib/utils/`.
- **Assets e Recursos**: arquivos GeoJSON em `public/geojson/`, fotos em `public/fotos/` e ícones em `public/icons/`.

---

## Papéis e permissões

Os papéis estão modelados no enum `Role` do banco de dados:

| Papel | Rota Inicial | Atribuições |
| --- | --- | --- |
| `CIDADAO` | `/` e `/projetos` | Consulta pública das informações, mapa interativo e fichas técnicas. |
| `GESTAO` | `/area-do-prefeito` | Acompanhamento executivo (somente leitura) de investimentos, alertas e status territorial. |
| `ADM_SECRETARIA` | `/area-do-servidor` | Gestão de obras exclusivamente da própria secretaria e cadastro de novos projetos. |
| `ENGENHEIRO` | `/area-do-engenheiro` | Fiscalização operacional, diário de campo, controle de etapas e medições. |
| `SUPER_ADMIN` | `/area-do-admin` | Configuração geral, gestão de eixos, secretarias, tipologias e usuários. |

---

## Mapa das rotas

### Páginas

| Rota | Descrição | Acesso |
| --- | --- | --- |
| `/` | Página principal com mapa público interativo de Goiana. | Público |
| `/projetos` | Listagem pública de projetos com filtros e busca. | Público |
| `/projetos/[id]` | Ficha detalhada da obra, linha do tempo e galeria de fotos. | Público |
| `/login` | Formulário de autenticação por e-mail e senha. | Público |
| `/pos-login` | Rota de redirecionamento automático por perfil. | Autenticado |
| `/area-do-prefeito` | Painel executivo da gestão municipal com indicadores e mapa. | `GESTAO`, `SUPER_ADMIN` |
| `/area-do-prefeito/status-obras` | Acompanhamento detalhado do status, prazos e alertas da carteira de obras. | `GESTAO`, `SUPER_ADMIN` |
| `/area-do-servidor` | Painel da secretaria municipal logada. | `ADM_SECRETARIA` |
| `/area-do-servidor/nova-obra` | Formulário de cadastro de nova obra. | `ADM_SECRETARIA` |
| `/area-do-servidor/obras/[id]` | Visualização e manutenção dos dados da obra (edição restrita à secretaria dona e ao Admin Geral). | `ADM_SECRETARIA`, `SUPER_ADMIN`, `GESTAO` (leitura) |
| `/area-do-engenheiro` | Painel do engenheiro com obras sob sua responsabilidade. | `ENGENHEIRO` |
| `/area-do-engenheiro/registro-campo` | Interface móvel para diário de obras e vistoria em campo. | `ENGENHEIRO` |
| `/area-do-admin` | Painel geral de administração da plataforma. | `SUPER_ADMIN` |
| `/area-do-admin/eixos` | Gestão de eixos estratégicos e áreas temáticas. | `SUPER_ADMIN` |
| `/area-do-admin/secretarias` | Gestão de secretarias municipais. | `SUPER_ADMIN` |
| `/area-do-admin/obras` | Gestão global de todas as obras cadastradas. | `SUPER_ADMIN` |
| `/area-do-admin/usuarios` | Gestão de contas de usuários, permissões e senhas. | `SUPER_ADMIN` |
| `/area-do-admin/relatorios` | Emissão de relatórios e consolidação de dados. | `SUPER_ADMIN` |

### Endpoints da API REST

| Rota | Método | Descrição | Permissão |
| --- | --- | --- | --- |
| `/api/obras` | `GET` | Lista obras cadastradas com suporte a paginação e filtros. | Público |
| `/api/obras` | `POST` | Valida e cadastra uma nova obra. | `ADM_SECRETARIA`, `SUPER_ADMIN` |
| `/api/obras/[id]` | `GET` | Retorna os detalhes completos da obra (etapas, medições, fotos). | Público |
| `/api/obras/[id]` | `PATCH` | Atualiza parcialmente os dados de uma obra existente. | `ADM_SECRETARIA` (própria pasta), `SUPER_ADMIN` |
| `/api/obras/[id]` | `DELETE` | Realiza exclusão lógica da obra (`deletedAt`). | `ADM_SECRETARIA` (própria pasta), `SUPER_ADMIN` |
| `/api/obras/[id]/medicoes` | `GET` | Retorna o histórico de medições da obra. | Público |
| `/api/obras/[id]/medicoes` | `POST` | Registra uma nova medição técnica. | Engenheiro autorizado |
| `/api/obras/[id]/fotos` | `GET` | Retorna as fotos vinculadas à obra. | Público |
| `/api/obras/[id]/fotos` | `POST` | Cadastra nova referência fotográfica para a obra. | `ADM_SECRETARIA` (própria pasta), `ENGENHEIRO`, `SUPER_ADMIN` |
| `/api/obras/[id]/registros-campo` | `GET`, `POST` | Consulta e envio do diário de vistoria de campo. | `ENGENHEIRO` |
| `/api/obras/[id]/etapas` | `GET`, `POST` | Consulta e inicialização das etapas da obra. | `ADM_SECRETARIA` (própria pasta), `SUPER_ADMIN` |
| `/api/admin/eixos` | `GET`, `POST` | Listagem e criação de eixos estratégicos (`PATCH`/`DELETE` em `/[id]`). | `SUPER_ADMIN` |
| `/api/admin/areas-tematicas` | `POST` | Criação de áreas temáticas vinculadas aos eixos (`PATCH`/`DELETE` em `/[id]`). | `SUPER_ADMIN` |
| `/api/admin/secretarias` | `GET`, `POST` | Listagem e criação de secretarias municipais (`PATCH`/`DELETE` em `/[id]`). | `SUPER_ADMIN` |
| `/api/admin/usuarios` | `GET`, `POST` | Listagem e criação de usuários e perfis (`PATCH` em `/[id]`). | `SUPER_ADMIN` |
| `/api/filtros` | `GET` | Retorna opções agregadas para filtros (secretarias, status, bairros). | Público |
| `/api/tipos-obra` | `GET`, `POST` | Gerenciamento de tipos de obras e modelos de etapas. | `SUPER_ADMIN` |
| `/api/auth/[...nextauth]` | `GET`, `POST` | Handlers de autenticação e sessão do Auth.js. | Público |

---

## Modelo de Dados

O modelo relacional gerenciado pelo Prisma contém as seguintes entidades centrais:

- **Usuario**: contas do sistema com perfis de acesso, senhas com hash e vínculo institucional.
- **Secretaria**: secretarias municipais com sigla e cor institucional de identificação no mapa.
- **EixoEstrategico** e **AreaTematica**: hierarquia de planejamento do plano de governo municipal.
- **TipoObra**: tipologias construtivas que determinam modelos de etapas e subetapas (`EtapaTemplate`, `SubEtapaTemplate`).
- **Obra**: cadastro georreferenciado com coordenadas, bairro, número de ordem de serviço, valor contratual e status (`PLANEJADA`, `ORDEM_EMITIDA`, `EM_ANDAMENTO`, `PARALISADA`, `CONCLUIDA`).
- **EtapaObra** e **SubEtapaObra**: acompanhamento físico operacional com percentuais concluídos por etapa.
- **Medicao**: registros formais de evolução percentual realizados pelos fiscais.
- **RegistroCampo**: relatórios diários de vistoria em campo, contendo intercorrências (`CHUVA`, `ATRASO_MATERIAL`, `FALTA_PESSOAL`, `ACIDENTE_TRABALHO`, `PROBLEMA_FORNECEDOR`, `OUTROS`) e status de envio.
- **Foto**: registros visuais categorizados por momento construtivo (`RENDER_PROJETO`, `ANTES`, `EM_ANDAMENTO`, `CONCLUIDO`).

---

## Como rodar o projeto localmente

### Pré-requisitos
- **Node.js** (versão 20 ou superior)
- **pnpm** instalado globalmente (`npm install -g pnpm`)
- Instância ativa do **PostgreSQL** (local ou em nuvem)

### 1. Clonar o repositório e instalar dependências
```bash
git clone https://github.com/AlessandrooGomess/PrefeituraDeGoiana-Espacializa-o.git
cd espacializacao-obras
pnpm install
```

### 2. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com base no arquivo `.env.example`:

```env
DATABASE_URL="postgresql://usuario:senha@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://usuario:senha@host:5432/postgres"
AUTH_SECRET="gere-um-segredo-forte-e-mantenha-fora-do-git"

# Senhas padrão opcionais para os dados iniciais do seed
SEED_SENHA_ADMIN="12345678"
SEED_SENHA_PREFEITO="12345678"
SEED_SENHA_GESTOR_SEDUO="12345678"
```

Observação para Supabase: utilize a porta `6543` no parâmetro `DATABASE_URL` (Transaction Pooler) para a execução da aplicação e a porta `5432` no parâmetro `DIRECT_URL` para comandos de migração do Prisma.

### 3. Sincronizar o banco de dados e popular dados iniciais
```bash
# Executa as migrações existentes
pnpm prisma migrate dev

# Popula o banco com secretarias, eixos, obras reais de Goiana e usuários
pnpm prisma db seed
```

### 4. Iniciar o servidor de desenvolvimento
```bash
pnpm dev
```
Acesse `http://localhost:3000` no navegador.

---

## Contas de demonstração (Seed)

O comando `pnpm prisma db seed` gera automaticamente os seguintes usuários para testes locais:

| Perfil | E-mail | Senha Padrão | Destino Pós-Login |
| --- | --- | --- | --- |
| Administrador Geral | `admin@goiana.pe.gov.br` | `12345678` | `/area-do-admin` |
| Prefeito / Gestão | `prefeito@goiana.pe.gov.br` | `12345678` | `/area-do-prefeito` |
| Secretário (SEDUO) | `gestor.seduo@goiana.pe.gov.br` | `12345678` | `/area-do-servidor` |
| Engenheiro Fiscal (SEDUO) | `engenheiro.seduo@goiana.pe.gov.br` | `12345678` | `/area-do-engenheiro` |
| Engenheiro Fiscal (SEDUC) | `engenheiro.seduc@goiana.pe.gov.br` | `12345678` | `/area-do-engenheiro` |

Para redefinir a senha de qualquer usuário via terminal:
```bash
$env:ADMIN_EMAIL="usuario@goiana.pe.gov.br"; $env:ADMIN_PASSWORD="NovaSenha123"; pnpm auth:set-password
```

---

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `pnpm dev` | Inicia o servidor de desenvolvimento do Next.js. |
| `pnpm build` | Gera a compilação de produção e valida tipos TypeScript. |
| `pnpm start` | Inicia o servidor com a compilação de produção. |
| `pnpm lint` | Executa a verificação estática de código com ESLint. |
| `pnpm test` | Executa a suíte de 157 testes automatizados com Vitest. |
| `pnpm test:watch` | Executa os testes no modo contínuo de observação. |
| `pnpm auth:set-password` | Atualiza o hash de senha de um usuário no banco de dados. |
| `pnpm prisma migrate dev` | Cria e aplica migrações no banco de desenvolvimento. |
| `pnpm prisma studio` | Abre a interface visual web para consulta ao banco de dados. |
| `pnpm prisma db seed` | Recria a base inicial de dados com registros de Goiana. |

---

## Estrutura de pastas

```text
espacializacao-obras/
├── app/
│   ├── api/                           # Rotas da API REST
│   │   ├── admin/                     # Rotas administrativas (eixos, áreas, secretarias e usuários)
│   │   ├── auth/[...nextauth]/        # Handlers de autenticação do Auth.js
│   │   ├── filtros/                   # Rota de agregação de filtros
│   │   ├── obras/                     # CRUD de obras, medições, fotos e etapas
│   │   └── tipos-obra/                # Gestão de tipos de obras e etapas template
│   ├── area-do-admin/                 # Painel do Administrador Geral
│   │   ├── eixos/                     # Gestão de eixos estratégicos e áreas temáticas
│   │   ├── obras/                     # Gestão global de obras
│   │   ├── secretarias/               # Gestão de secretarias municipais
│   │   ├── usuarios/                  # Gestão de usuários e permissões
│   │   └── relatorios/                # Relatórios consolidados e exportação (CSV/JSON)
│   ├── area-do-engenheiro/            # Painel do Engenheiro Fiscal
│   │   └── registro-campo/            # Interface móvel de vistoria e diário de obras
│   ├── area-do-prefeito/              # Painel Executivo do Prefeito e Gestão
│   │   └── status-obras/              # Acompanhamento detalhado do status e prazos das obras
│   ├── area-do-servidor/              # Painel das Secretarias Municipais
│   │   ├── nova-obra/                 # Formulário e confirmação de nova obra
│   │   └── obras/[id]/                # Gerenciamento de obra da pasta
│   ├── login/                         # Página de login institucional
│   ├── pos-login/                     # Roteador de redirecionamento por perfil
│   ├── projetos/                      # Listagem pública de projetos
│   │   └── [id]/                      # Detalhes públicos e linha do tempo da obra
│   ├── layout.tsx                     # Layout global da aplicação
│   └── page.tsx                       # Página inicial com o mapa interativo
├── components/
│   ├── area-engenheiro/               # Componentes do módulo de engenharia
│   ├── map/                           # Mapa MapLibre, marcadores, filtros e popups
│   ├── obra-detalhe/                  # Linha do tempo, galeria de fotos e ficha técnica
│   ├── portal/                        # Cabeçalho e rodapé institucional
│   ├── registro-campo/                # Cards de vistoria de campo, fotos e intercorrências
│   └── sidebar/                       # Navegação lateral adaptativa por perfil
├── lib/
│   ├── auth/                          # Configurações de autenticação e guards de rotas
│   ├── obras/                         # Regras de negócio, cálculos e validações
│   ├── serializers/                   # Serializadores de dados para a API
│   ├── utils/                         # Formatadores de moeda, tempo decorrido e busca
│   ├── validations/                   # Schemas de validação Zod
│   └── prisma.ts                      # Instância única do cliente Prisma
├── prisma/
│   ├── schema.prisma                  # Modelagem relacional do banco de dados
│   ├── seed.ts                        # Script com dados iniciais de demonstração
│   └── migrations/                    # Histórico versionado de migrações SQL
├── public/
│   ├── geojson/                       # Delimitação territorial de Goiana e distritos
│   ├── fotos/                         # Arquivos visuais locais de demonstração
│   └── icons/                         # Ícones e marcadores gráficos
└── scripts/
    └── set-user-password.ts           # Script CLI para hashing e definição de senhas
```

---

## Roadmap de Desenvolvimento

- [x] Modelagem do banco de dados relacional e migrações iniciais (Prisma/PostgreSQL)
- [x] Integração de mapa interativo com MapLibre GL JS
- [x] Limite territorial de Goiana carregado via GeoJSON oficial
- [x] Marcadores, popups e painéis laterais com informações das obras
- [x] Busca textual e filtros dinâmicos por secretaria, status e bairro
- [x] API pública para listagem de obras com paginação e filtros
- [x] API para criação, detalhamento e atualização de obras com validação Zod
- [x] Página pública de listagem de projetos (`/projetos`)
- [x] Página pública de detalhes da obra com galeria e linha do tempo (`/projetos/[id]`)
- [x] Autenticação e controle de permissões por perfil (RBAC) com Auth.js
- [x] Painel Executivo para o Prefeito com indicadores e mapa (`/area-do-prefeito`)
- [x] Painel de fiscalização e registro de campo para engenheiros (`/area-do-engenheiro`)
- [x] Painel setorial de secretarias municipais com cadastro de obras (`/area-do-servidor`)
- [x] Painel administrativo geral para gestão de usuários, secretarias e eixos (`/area-do-admin`)
- [x] Registro de medições e avanço de etapas por engenheiros autorizados
- [x] Suíte de testes automatizados com cobertura de regras e APIs (157 testes)
- [x] Módulo de exportação de relatórios em formato de planilhas (CSV) e JSON
- [ ] Integração com serviço de Cloud Storage (S3 / Supabase Storage) para upload físico de fotos
- [ ] Suporte a operação offline progressiva para vistorias em áreas rurais sem sinal de dados
