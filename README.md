# Espacialização de Obras Públicas da Prefeitura de Goiana/PE

Plataforma web para mapeamento georreferenciado, monitoramento e transparência das obras públicas municipais de Goiana - PE.

Atualmente, a aplicação apresenta um mapa público interativo com as obras cadastradas, seus status, secretarias responsáveis, valores contratuais e percentual de execução calculado automaticamente de acordo com as etapas concluídas.

---

## O que é a plataforma

A Espacialização de Obras Públicas é uma plataforma web para mapear, acompanhar e dar transparência às obras públicas municipais de Goiana/PE.

Por meio de um mapa interativo, a aplicação permite localizar as obras no território, consultar seus dados principais e acompanhar informações como secretaria responsável, status, valor do contrato, previsão de conclusão e percentual de execução. A população também pode acessar uma página de detalhes públicos para ver o status de execução de cada etapa da obra, promovendo total transparência.

## Pra quem é

- **Cidadãos**: consulta pública das obras realizadas ou planejadas no município, com acompanhamento de progresso transparente por fases.
- **Engenheiros e fiscais**: acompanhamento técnico, elaboração de registros de campo (diário de obras) e preenchimento do checklist da evolução física por etapas.
- **Secretarias municipais**: organização, gestão em painel administrativo e acompanhamento das obras sob sua responsabilidade.
- **Gestores públicos**: visão consolidada dos investimentos, status e distribuição territorial das obras.

## Principais funcionalidades

- Mapa interativo centralizado no município de Goiana e seus distritos.
- Limite territorial de Goiana carregado a partir de GeoJSON.
- Marcadores coloridos de acordo com a secretaria responsável.
- Popups com informações rápidas e atalhos para os detalhes das obras.
- **Página de detalhes públicos da obra** com mapa individual e detalhamento das fases do projeto.
- Cálculo de progresso automático baseado em uma média ponderada das etapas concluídas (checklist interativo).
- Painel administrativo para cadastro e gerenciamento de obras (`/area-do-servidor`).
- API pública `GET /api/obras` para consulta das obras cadastradas.
- Endpoints de criação, consulta detalhada, atualização de obras, registros de campo e controle de etapas.
- Validação de entrada com Zod para dados cadastrais, coordenadas, datas, valores e relacionamentos.
- Dados iniciais para demonstração via seed do Prisma.

---

## Arquitetura e Stack

- **Frontend & Backend**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/)
- **ORM & Banco de Dados**: [Prisma ORM](https://www.prisma.io/) com [PostgreSQL](https://www.postgresql.org/)
- **Mapas**: [MapLibre GL JS](https://maplibre.org/) com tiles do OpenStreetMap
- **Linguagem**: TypeScript
- **Gerenciador de Pacotes**: `pnpm`

---

## Como funciona, na prática

1. O usuário acessa a página principal da aplicação.
2. O mapa é inicializado com o município de Goiana, usando MapLibre GL e tiles do OpenStreetMap.
3. A aplicação consulta a rota `GET /api/obras`.
4. A API busca as obras no PostgreSQL por meio do Prisma, incluindo secretaria, eixo estratégico, área temática e o progresso físico atualizado.
5. As obras com coordenadas válidas são exibidas como marcadores no mapa.
6. Ao selecionar um marcador, o usuário visualiza as principais informações da obra em um popup e pode acessar a **Página de Detalhes da Obra** para ver o avanço de cada fase.

A página `/projetos` apresenta uma listagem pública de projetos. A rota `/login` oferece acesso por e-mail e senha para usuários administrativos, de gestão, de secretarias e engenheiros. A rota `/area-do-servidor` exige uma sessão autorizada e permite a criação e o gerenciamento do acervo de obras. Engenheiros utilizam o painel de **Etapas** para marcar, por meio de checkboxes, o que foi concluído, e a aplicação calcula automaticamente a evolução geral percentual da obra com base no peso de cada fase.

## Camadas Internas

- **Apresentação**: página principal em `app/page.tsx`, componente interativo do mapa em `components/map/` e painel administrativo em `app/area-do-servidor/`.
- **API**: rotas em `app/api/obras/`, responsáveis pela consulta, criação, detalhamento, atualização, controle de etapas e registros de campo.
- **Autenticação**: Auth.js em `auth.ts`, com credenciais, sessão JWT e autorização por papel e secretaria.
- **Persistência**: Prisma Client em `lib/prisma.ts`, com schema e migrações na pasta `prisma/`.
- **Validações**: schemas Zod em `lib/validations/`.
- **Serialização**: conversão de datas e valores do Prisma em `lib/serializers/`.
- **Tipos compartilhados**: contratos TypeScript na pasta `types/`.
- **Assets**: limite territorial em `public/geojson/`, fotos em `public/fotos/` e ícones em `public/icons/`.

## Contrato atual da API de obras

| Rota | Método | Comportamento atual |
| --- | --- | --- |
| `/api/obras` | `GET` | Retorna um array de obras (secretaria, eixo, foto principal) com o progresso geral ponderado. |
| `/api/obras` | `POST` | Valida e cria uma obra; retorna os campos básicos e relacionamentos. Requer autorização. |
| `/api/obras/[id]` | `GET` | Retorna os detalhes e progresso geral de uma obra específica. |
| `/api/obras/[id]` | `PATCH` | Valida e atualiza parcialmente uma obra existente. Requer usuário autorizado. |
| `/api/obras/[id]` | `DELETE` | Exclui logicamente uma obra. Requer `SUPER_ADMIN` ou `GESTAO`. |
| `/api/obras/[id]/etapas` | `GET` | Retorna as etapas e subetapas da obra (checklist), incluindo o cálculo do progresso local. |
| `/api/obras/[id]/etapas/[etapaId]`| `PATCH`| Atualiza status/percentual de uma etapa e aciona o recálculo do progresso geral automaticamente. |
| `/api/obras/[id]/registros-campo`| `GET/POST` | Retorna e cadastra relatórios e diários de obra (vistorias, pareceres e intercorrências). |
| `/api/obras/[id]/fotos` | `GET/POST` | Retorna ou cadastra referência de fotos da obra. |
| `/api/auth/[...nextauth]` | `GET`, `POST` | Handlers do Auth.js para sessão e login por credenciais. |

*(Nota: rotas legadas de medições diretas foram refatoradas para integrar o sistema unificado de Etapas e Registros de Campo).*

---

## Modelo de Dados

O domínio da aplicação está modelado no Prisma com as seguintes entidades centrais:

- **Secretaria**: Órgãos municipais (ex.: Infraestrutura, Educação) com cores de identificação visual no mapa.
- **Obra**: Cadastro georreferenciado com status (`PLANEJADA`, `EM_ANDAMENTO`, etc), valores contratuais e responsáveis.
- **TipoObra**: Classificação que define o template base de fases construtivas (ex.: Pavimentação, Creches).
- **EtapaTemplate / SubEtapaTemplate**: Dicionários de etapas e pesos que definem o checklist padrão obrigatório por Tipo de Obra.
- **EtapaObra / SubEtapaObra**: A instância dessas fases em uma Obra específica, recebendo status como `PENDENTE`, `EM_ANDAMENTO` ou `CONCLUIDA`.
- **RegistroCampo**: Relatório técnico de acompanhamento contendo observações, datas de vistoria e tipos de intercorrências (clima, material, etc).
- **Foto**: Registro visual categorizado (`RENDER_PROJETO`, `ANTES`, `EM_ANDAMENTO`, `CONCLUIDO`).
- **Usuario**: Usuários com perfis de acesso (`SUPER_ADMIN`, `GESTAO`, `ADM_SECRETARIA`, `ENGENHEIRO`, `CIDADAO`).

## Papéis e permissões

Os papéis estão definidos no modelo `Role` do Prisma:

| Papel | Responsabilidade prevista |
| --- | --- |
| `SUPER_ADMIN` | Administração geral da plataforma. |
| `GESTAO` | Acompanhamento gerencial e institucional sem restrição de secretaria. |
| `ADM_SECRETARIA` | Administração e cadastro de obras atreladas à própria secretaria. |
| `ENGENHEIRO` | Inserção de registros de campo, fotos, e check das etapas. |
| `CIDADAO` | Consulta pública e visualização dos dados e mapas das obras. |

## Mapa das rotas de Frontend

| Rota | Descrição |
| --- | --- |
| `/` | Página principal com o mapa público consolidado de obras. |
| `/projetos` | Página pública de listagem e painel de projetos. |
| `/projetos/[id]` | Página pública com informações e status de fases de uma obra específica. |
| `/login` | Tela de login por e-mail e senha. |
| `/area-do-servidor` | Área protegida principal e dashboard interno. |
| `/area-do-servidor/nova-obra` | Formulário para o cadastro de novas obras. |
| `/area-do-servidor/obras/[id]` | Painel de controle da obra, incluindo a checklist do engenheiro. |

---

## Como rodar o projeto localmente

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
Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/banco?schema=public"
DIRECT_URL="postgresql://usuario:senha@host:5432/banco?schema=public"
AUTH_SECRET="gere-um-segredo-forte-e-mantenha-fora-do-Git"
```

### 3. Sincronizar o Banco de Dados (Prisma)
```bash
pnpm prisma migrate dev
pnpm prisma studio
pnpm prisma db seed
```

### 4. Rodar o Servidor de Desenvolvimento
```bash
pnpm dev
```
Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `pnpm dev` | Inicia o servidor de desenvolvimento. |
| `pnpm build` | Gera a versão de produção da aplicação. |
| `pnpm start` | Inicia a aplicação compilada. |
| `pnpm lint` | Executa o ESLint. |
| `pnpm test` | Executa os testes automatizados. |
| `pnpm prisma migrate dev` | Cria e aplica migrações no banco de desenvolvimento. |

---

## 🗺️ Roadmap de Desenvolvimento

- [x] Modelagem do banco de dados relacional e migrações iniciais (Prisma)
- [x] Integração de mapa interativo com MapLibre GL
- [x] Limite territorial de Goiana via GeoJSON
- [x] API pública para listagem de obras e detalhes
- [x] API para criação e gestão administrativa de obras
- [x] Página pública de listagem de projetos
- [x] Página pública de detalhes da obra (`/projetos/[id]`)
- [x] Autenticação e controle de permissões básicos
- [x] Painel administrativo de gerenciamento de obras (`/area-do-servidor`)
- [x] Registro de evolução via Checklist de Etapas interativo e Registros de Campo
- [x] Cálculo automático de progresso global ponderado
- [ ] Painel administrativo completo para gestão de secretarias e templates de etapas
- [ ] Upload real de fotos (integração com storage como AWS S3 ou similar)
- [ ] Dashboard analítico com métricas de investimento municipal
