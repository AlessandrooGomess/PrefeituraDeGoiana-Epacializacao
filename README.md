# Sistema de Espacialização de Obras Públicas - Prefeitura de Goiana/PE

Plataforma institucional para mapeamento georreferenciado, acompanhamento técnico em campo e gestão das obras públicas do município de Goiana, Pernambuco.

---

## Visão Geral

O sistema tem como finalidade centralizar as informações sobre intervenções e obras públicas no município de Goiana, integrando dados geográficos, contratuais e técnicos. A aplicação atende a diferentes públicos por meio de áreas com controle de acesso específico:

- **Consulta Pública**: disponibilização de mapa interativo e fichas técnicas das obras para a população.
- **Fiscalização Técnica**: módulo operacional para engenheiros e fiscais registrarem vistorias, medições, avanço físico e relatórios fotográficos diretamente do canteiro de obras.
- **Gestão Setorial**: painel destinado às secretarias municipais para gerenciamento das obras sob sua responsabilidade.
- **Painel Executivo**: visualização consolidada de indicadores de investimento, prazos e status para tomada de decisão pela gestão municipal.
- **Administração Geral**: controle de usuários, permissões, secretarias, eixos de planejamento e tipologias de obras.

---

## Perfis de Acesso e Permissões

O controle de acesso é implementado com base em papéis (Role-Based Access Control - RBAC):

| Perfil | Identificador | Rota Principal | Atribuições |
| --- | --- | --- | --- |
| Cidadão | `CIDADAO` | `/` e `/projetos` | Consulta ao mapa público, pesquisa de obras por filtros e visualização de fichas técnicas detalhadas. |
| Gestão Municipal | `GESTAO` | `/area-do-prefeito` | Acompanhamento de indicadores consolidados, montante de investimentos e distribuição geográfica das obras. |
| Secretaria Municipal | `ADM_SECRETARIA` | `/area-do-servidor` | Cadastro de novas obras, acompanhamento das execuções e emissão de dados da pasta. |
| Engenheiro Fiscal | `ENGENHEIRO` | `/area-do-engenheiro` | Gestão das obras sob sua fiscalização e preenchimento de registros de campo e medições. |
| Administrador Geral | `SUPER_ADMIN` | `/area-do-admin` | Configuração geral da plataforma, gerenciamento de contas, eixos estratégicos e relatórios. |

---

## Módulos do Sistema

### Portal Público
- Mapa georreferenciado com MapLibre GL JS cobrindo todo o território municipal e seus distritos.
- Delimitação territorial oficial de Goiana carregada via camada GeoJSON.
- Marcadores com codificação visual por secretaria responsável.
- Busca textual e filtros por secretaria, situação da obra e bairro.
- Listagem pública de projetos em formato de grade (`/projetos`).
- Página de detalhe da obra (`/projetos/[id]`) com:
  - Dados contratuais, empresa executora e número da ordem de serviço;
  - Linha do tempo das vistorias e histórico de medições;
  - Galeria de imagens categorizadas com visualizador em tela cheia;
  - Documentação e detalhamento técnico.

### Módulo de Fiscalização e Registro de Campo (`/area-do-engenheiro`)
- Interface adaptada para dispositivos móveis para utilização em campo.
- Acompanhamento percentual estruturado por etapas e subetapas específicas por tipo de obra.
- Registro padronizado de intercorrências (chuvas, atraso de insumos, falta de efetivo, entre outros).
- Inclusão de registros fotográficos vinculados à vistoria com categorização por fase.

### Painel Executivo (`/area-do-prefeito`)
- Painel com indicadores agregados: total de obras, obras em andamento, concluídas e paralisadas.
- Montante financeiro global contratado e percentual médio de execução.
- Mapa de distribuição das frentes de trabalho no município.

### Gestão por Secretaria (`/area-do-servidor`)
- Isolamento de escopo por secretaria vinculada ao usuário logado.
- Cadastro orientado de novas obras com validação de dados geográficos e contratuais.
- Monitoramento da carteira de obras do órgão municipal.

### Gestão Administrativa (`/area-do-admin`)
- Gerenciamento de usuários, cargos e atribuições de acesso.
- Manutenção da estrutura de planejamento (Eixos Estratégicos e Áreas Temáticas).
- Cadastro de secretarias e tipos de obras com seus respectivos modelos de etapas.
- Extração de relatórios consolidados.

---

## Stack Tecnológica

| Componente | Tecnologia | Versão / Descrição |
| --- | --- | --- |
| Framework Fullstack | Next.js | 16 (App Router, React 19) |
| Linguagem | TypeScript | Tipagem estática rigorosa |
| Estilização | Tailwind CSS | Versão 4 |
| ORM | Prisma ORM | 6.19 |
| Banco de Dados | PostgreSQL | Suporte a Transaction e Session Pooler |
| Mecanismo de Mapas | MapLibre GL JS | 6.7 com tiles OpenStreetMap |
| Autenticação | Auth.js | NextAuth v5 beta com sessão baseada em JWT |
| Criptografia de Senhas | bcryptjs | Hashing de senhas com custo de salt 12 |
| Validação de Dados | Zod | Schemas de validação na camada de entrada |
| Testes Automatizados | Vitest | Testes unitários e de integração (153 testes) |
| Gerenciador de Pacotes | pnpm | Versão 10 |

---

## Modelo de Dados

O banco de dados relacional é estruturado pelas seguintes entidades principais:

- **Usuario**: contas do sistema com perfis de permissão (`SUPER_ADMIN`, `GESTAO`, `ADM_SECRETARIA`, `ENGENHEIRO`, `CIDADAO`).
- **Secretaria**: secretarias municipais com identificação visual por cor.
- **EixoEstrategico** e **AreaTematica**: hierarquia de planejamento municipal às quais as obras podem ser associadas.
- **TipoObra**: tipologias de obras com definição de modelos de etapas e subetapas (`EtapaTemplate`, `SubEtapaTemplate`).
- **Obra**: registro principal contendo coordenadas geográficas, endereço, bairro, dados de contrato, prazos e status (`PLANEJADA`, `ORDEM_EMITIDA`, `EM_ANDAMENTO`, `PARALISADA`, `CONCLUIDA`).
- **EtapaObra** e **SubEtapaObra**: desdobramento operacional da obra com percentuais de avanço.
- **Medicao**: histórico de medições formais de evolução percentual registradas pelos fiscais.
- **RegistroCampo**: relatórios diários de vistoria em campo, contendo intercorrências e observações técnicas.
- **Foto**: registros fotográficos categorizados (`RENDER_PROJETO`, `ANTES`, `EM_ANDAMENTO`, `CONCLUIDO`).

---

## Rotas da Aplicação

### Páginas

| Rota | Descrição | Permissão |
| --- | --- | --- |
| `/` | Portal público com mapa interativo municipal. | Público |
| `/projetos` | Listagem pública de obras cadastradas. | Público |
| `/projetos/[id]` | Ficha completa da obra, fotos e linha do tempo. | Público |
| `/login` | Formulário de autenticação de servidores e fiscais. | Público |
| `/pos-login` | Roteamento automático baseado no perfil do usuário. | Autenticado |
| `/area-do-prefeito` | Painel executivo de acompanhamento de obras. | `GESTAO`, `SUPER_ADMIN` |
| `/area-do-servidor` | Painel de controle da secretaria do usuário. | `ADM_SECRETARIA` |
| `/area-do-servidor/nova-obra` | Formulário de cadastro de nova obra. | `ADM_SECRETARIA` |
| `/area-do-servidor/obras/[id]` | Edição e manutenção dos dados da obra. | `ADM_SECRETARIA` |
| `/area-do-engenheiro` | Painel do engenheiro com obras sob sua fiscalização. | `ENGENHEIRO` |
| `/area-do-engenheiro/registro-campo` | Formulário móvel de registro de vistoria em campo. | `ENGENHEIRO` |
| `/area-do-admin` | Painel geral de administração da plataforma. | `SUPER_ADMIN` |
| `/area-do-admin/eixos` | Cadastro de eixos estratégicos e áreas temáticas. | `SUPER_ADMIN` |
| `/area-do-admin/secretarias` | Cadastro e edição de secretarias municipais. | `SUPER_ADMIN` |
| `/area-do-admin/obras` | Gerenciamento global de obras do município. | `SUPER_ADMIN` |
| `/area-do-admin/usuarios` | Gerenciamento de usuários, cargos e permissões. | `SUPER_ADMIN` |
| `/area-do-admin/relatorios` | Emissão de relatórios consolidados. | `SUPER_ADMIN` |

### Endpoints da API REST

| Endpoint | Método | Descrição | Acesso |
| --- | --- | --- | --- |
| `/api/obras` | `GET` | Listagem de obras com paginação e filtros dinâmicos. | Público |
| `/api/obras` | `POST` | Criação de novo registro de obra. | `ADM_SECRETARIA`, `SUPER_ADMIN` |
| `/api/obras/[id]` | `GET` | Retorno detalhado dos dados de uma obra específica. | Público |
| `/api/obras/[id]` | `PATCH` | Atualização parcial dos dados cadastrais da obra. | Autorizado |
| `/api/obras/[id]` | `DELETE` | Exclusão lógica do registro da obra. | `SUPER_ADMIN`, `GESTAO` |
| `/api/obras/[id]/medicoes` | `GET` | Histórico cronológico de medições da obra. | Público |
| `/api/obras/[id]/medicoes` | `POST` | Registro de medição técnica por engenheiro responsável. | `ENGENHEIRO` |
| `/api/obras/[id]/fotos` | `GET` | Relação de fotos cadastradas para a obra. | Público |
| `/api/obras/[id]/fotos` | `POST` | Cadastro de nova imagem vinculada à obra. | Autorizado |
| `/api/obras/[id]/registros-campo` | `GET`, `POST` | Consulta e envio de diário de vistoria de campo. | `ENGENHEIRO` |
| `/api/obras/[id]/etapas` | `GET`, `POST` | Consulta e controle de avanço das etapas da obra. | Autorizado |
| `/api/filtros` | `GET` | Agregação de opções de filtros (secretarias, status, bairros). | Público |
| `/api/tipos-obra` | `GET`, `POST` | Gestão de tipos de obras e modelos de etapas. | `SUPER_ADMIN` |
| `/api/auth/[...nextauth]` | `GET`, `POST` | Manipuladores de sessão do Auth.js. | Público |

---

## Configuração do Ambiente de Desenvolvimento

### Pré-requisitos
- Node.js 20.x ou superior
- pnpm instalado globalmente (`npm install -g pnpm`)
- PostgreSQL ativo (localmente ou via serviço em nuvem)

### 1. Obtenção do código e dependências
```bash
git clone https://github.com/AlessandrooGomess/PrefeituraDeGoiana-Espacializa-o.git
cd espacializacao-obras
pnpm install
```

### 2. Variáveis de ambiente
Crie o arquivo `.env` na raiz do projeto com base no arquivo `.env.example`:

```env
DATABASE_URL="postgresql://usuario:senha@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://usuario:senha@host:5432/postgres"
AUTH_SECRET="chave-de-seguranca-gerada-para-sessao"

# Senhas padrão opcionais para carga inicial (seed)
SEED_SENHA_ADMIN="12345678"
SEED_SENHA_PREFEITO="12345678"
SEED_SENHA_GESTOR_SEDUO="12345678"
SEED_SENHA_ENG_SEDUO="12345678"
```

Observação para ambientes com Supabase: configure a porta `6543` no parâmetro `DATABASE_URL` (Transaction Pooler) para conexões de aplicação e a porta `5432` no parâmetro `DIRECT_URL` para execução de comandos do Prisma.

### 3. Migrações e carga inicial de dados
```bash
# Aplicação das migrações do banco
pnpm prisma migrate dev

# Carga inicial com secretarias, eixos, obras e usuários
pnpm prisma db seed
```

### 4. Inicialização da aplicação
```bash
pnpm dev
```
O servidor estará acessível em `http://localhost:3000`.

---

## Contas Pré-configuradas para Testes

O comando de carga inicial (`pnpm prisma db seed`) gera as seguintes contas para homologação:

| Perfil | E-mail | Senha Padrão | Destino Pós-Autenticação |
| --- | --- | --- | --- |
| Administrador Geral | `admin@goiana.pe.gov.br` | `12345678` | `/area-do-admin` |
| Prefeito / Gestão | `prefeito@goiana.pe.gov.br` | `12345678` | `/area-do-prefeito` |
| Secretário (SEDUO) | `gestor.seduo@goiana.pe.gov.br` | `12345678` | `/area-do-servidor` |
| Engenheiro Fiscal (SEDUO) | `engenheiro.seduo@goiana.pe.gov.br` | `12345678` | `/area-do-engenheiro` |
| Engenheiro Fiscal (SEDUC) | `engenheiro.seduc@goiana.pe.gov.br` | `12345678` | `/area-do-engenheiro` |

Para redefinir a senha de um usuário existente via linha de comando:
```bash
$env:ADMIN_EMAIL="usuario@goiana.pe.gov.br"; $env:ADMIN_PASSWORD="NovaSenha"; pnpm auth:set-password
```

---

## Scripts Disponíveis

| Comando | Descrição |
| --- | --- |
| `pnpm dev` | Inicia o servidor em modo de desenvolvimento. |
| `pnpm build` | Gera a compilação de produção e valida tipos TypeScript. |
| `pnpm start` | Inicia o servidor com a compilação de produção. |
| `pnpm test` | Executa a suíte de testes automatizados com Vitest. |
| `pnpm test:watch` | Executa os testes em modo contínuo (watch). |
| `pnpm lint` | Executa a verificação estática de código com ESLint. |
| `pnpm auth:set-password` | Atualiza o hash da senha de um usuário no banco. |
| `pnpm prisma studio` | Abre interface web para visualização direta do banco. |
| `pnpm prisma migrate dev` | Aplica migrações pendentes no ambiente de desenvolvimento. |
| `pnpm prisma db seed` | Executa a rotina de carga de dados iniciais. |

---

## Estrutura de Diretórios

```text
espacializacao-obras/
├── app/
│   ├── api/                           # Rotas e controladores da API REST
│   │   ├── auth/[...nextauth]/        # Autenticação e sessões
│   │   ├── filtros/                   # Agregação de opções para filtros
│   │   ├── obras/                     # Endpoints de obras, medições e vistorias
│   │   └── tipos-obra/                # Endpoints de tipologias de obras
│   ├── area-do-admin/                 # Módulo do Administrador Geral
│   ├── area-do-engenheiro/            # Módulo do Fiscal e Registro de Campo
│   ├── area-do-prefeito/              # Painel Executivo da Gestão Municipal
│   ├── area-do-servidor/              # Módulo das Secretarias Municipais
│   ├── login/                         # Autenticação por credenciais
│   ├── pos-login/                     # Roteador de transição por perfil
│   ├── projetos/                      # Listagem e detalhe público de obras
│   ├── layout.tsx                     # Layout global da aplicação
│   └── page.tsx                       # Página inicial e mapa público
├── components/
│   ├── area-engenheiro/               # Componentes do painel do engenheiro
│   ├── map/                           # Componentes do mapa e controles
│   ├── obra-detalhe/                  # Componentes da ficha detalhada da obra
│   ├── portal/                        # Componentes comuns da área pública
│   ├── registro-campo/                # Componentes do formulário de vistoria
│   └── sidebar/                       # Menu de navegação lateral por perfil
├── lib/
│   ├── auth/                          # Configurações de autenticação e RBAC
│   ├── obras/                         # Regras de negócio e cálculos
│   ├── serializers/                   # Serializadores de tipos para a API
│   ├── utils/                         # Utilitários de formatação e busca
│   ├── validations/                   # Schemas de validação Zod
│   └── prisma.ts                      # Instância do cliente Prisma
├── prisma/
│   ├── schema.prisma                  # Definição do esquema do banco de dados
│   ├── seed.ts                        # Script de carga inicial de dados
│   └── migrations/                    # Histórico versionado de migrações
├── public/
│   ├── geojson/                       # Dados geográficos do município
│   ├── fotos/                         # Arquivos de imagem locais
│   └── icons/                         # Ícones institucionais
└── scripts/
    └── set-user-password.ts           # Utilitário CLI para geração de senhas
```

---

## Situação do Projeto

- [x] Modelagem do banco de dados relacional e migrações (Prisma/PostgreSQL)
- [x] Integração de mapa interativo com MapLibre GL JS e delimitação municipal via GeoJSON
- [x] Portal público com busca, filtros por secretaria/status/bairro e cartões de obras
- [x] Página pública de detalhamento da obra com fotos, ficha técnica e linha do tempo de medições
- [x] Controle de acesso baseado em papéis (RBAC) com Auth.js e criptografia bcrypt
- [x] Painel Executivo para a gestão municipal com indicadores e mapa resumido
- [x] Módulo móvel para fiscais com registro de campo, etapas e intercorrências
- [x] Módulo para secretarias municipais com fluxo de cadastro e edição de obras
- [x] Painel administrativo com gerenciamento de eixos, secretarias e contas
- [x] Suíte de testes automatizados com cobertura de regras de negócio e validações
- [ ] Integração com serviço de armazenamento em nuvem (S3/Blob Storage) para upload de arquivos
- [ ] Módulo de exportação de relatórios em formatos PDF e planilhas
- [ ] Operação offline progressiva para vistorias em áreas rurais sem conectividade
