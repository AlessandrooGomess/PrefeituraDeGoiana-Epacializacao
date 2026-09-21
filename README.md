# Espacialização de Obras Públicas da Prefeitura de Goiana/PE

Plataforma web para mapeamento georreferenciado, monitoramento e transparência das obras públicas municipais de Goiana - PE.

Atualmente, a aplicação apresenta um mapa público interativo com as obras cadastradas, seus status, secretarias responsáveis, valores contratuais e percentual de execução.

---

## O que é a plataforma

A Espacialização de Obras Públicas é uma plataforma web para mapear, acompanhar e dar transparência às obras públicas municipais de Goiana/PE.

Por meio de um mapa interativo, a aplicação permite localizar as obras no território, consultar seus dados principais e acompanhar informações como secretaria responsável, status, valor do contrato, previsão de conclusão e percentual de execução.

## Pra quem é

- **Cidadãos**: consulta pública das obras realizadas ou planejadas no município.
- **Engenheiros e fiscais**: acompanhamento técnico, registro de medições e evolução das obras.
- **Secretarias municipais**: organização e acompanhamento das obras sob sua responsabilidade.
- **Gestores públicos**: visão consolidada dos investimentos, status e distribuição territorial das obras.

## Principais funcionalidades

- Mapa interativo centralizado no município de Goiana e seus distritos.
- Limite territorial de Goiana carregado a partir de GeoJSON.
- Marcadores coloridos de acordo com a secretaria responsável.
- Popups com título, status, endereço, bairro, valor do contrato, previsão de conclusão e percentual executado.
- API pública `GET /api/obras` para consulta das obras cadastradas.
- Endpoints de criação, consulta detalhada e atualização de obras.
- Validação de coordenadas geográficas antes da exibição dos marcadores.
- Validação de entrada com Zod para dados cadastrais, coordenadas, datas, valores e relacionamentos.
- Modelagem de secretarias, obras, eixos estratégicos, áreas temáticas, medições, fotos e usuários.
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
4. A API busca as obras no PostgreSQL por meio do Prisma, incluindo secretaria, eixo estratégico, área temática e a medição mais recente.
5. As obras com coordenadas válidas são exibidas como marcadores no mapa.
6. Ao selecionar um marcador, o usuário visualiza as principais informações da obra em um popup.

A página `/projetos` também consome `GET /api/obras` para apresentar uma listagem pública de projetos. A rota `/login` oferece acesso por e-mail e senha para usuários administrativos, de gestão, de secretarias e engenheiros. A rota `/area-do-servidor` exige uma sessão autorizada.

## Camadas Internas

- **Apresentação**: página principal em `app/page.tsx` e componente interativo do mapa em `components/map/MapContainer.tsx`.
- **API**: rotas em `app/api/obras/`, responsáveis pela consulta, criação, detalhamento, atualização, exclusão e registro de medições.
- **Autenticação**: Auth.js em `auth.ts`, com credenciais, sessão JWT e autorização por papel e secretaria.
- **Persistência**: Prisma Client em `lib/prisma.ts`, com schema e migrações na pasta `prisma/`.
- **Validações**: schemas Zod em `lib/validations/obra.ts` e validação de relacionamentos em `lib/obras/validate-relations.ts`.
- **Serialização**: conversão de datas e valores do Prisma em `lib/serializers/obra.ts`.
- **Tipos compartilhados**: contratos TypeScript em `types/obra.ts`.
- **Assets**: limite territorial em `public/geojson/`, fotos em `public/fotos/` e ícones em `public/icons/`.

## Contrato atual da API de obras

| Rota | Método | Comportamento atual |
| --- | --- | --- |
| `/api/obras` | `GET` | Retorna diretamente um array de obras, incluindo secretaria, eixo, área temática, foto mais recente e medição mais recente. |
| `/api/obras` | `POST` | Valida e cria uma obra; retorna os campos básicos e os identificadores dos relacionamentos. |
| `/api/obras/[id]` | `GET` | Retorna os detalhes de uma obra, incluindo medições, fotos e engenheiro relacionado. |
| `/api/obras/[id]` | `PATCH` | Valida e atualiza parcialmente uma obra existente. Requer usuário autorizado. |
| `/api/obras/[id]` | `DELETE` | Exclui logicamente uma obra. Requer `SUPER_ADMIN` ou `GESTAO`. |
| `/api/obras/[id]/medicoes` | `POST` | Registra uma medição para a obra. Requer engenheiro autenticado da secretaria da obra. |
| `/api/obras/[id]/medicoes` | `GET` | Retorna o histórico de medições da obra, ordenado pela data da vistoria. |
| `/api/auth/[...nextauth]` | `GET`, `POST` | Handlers do Auth.js para sessão e login por credenciais. |

As datas são retornadas em formato ISO 8601 e valores `Decimal` do Prisma são serializados como números JSON. O `GET /api/obras` aceita filtros e paginação opcionais; sem parâmetros, mantém o retorno em array para compatibilidade com o mapa.

Os endpoints de criação, atualização, exclusão e medições possuem autenticação e autorização no servidor. Usuários `CIDADAO` permanecem restritos à consulta pública.

---

## Modelo de Dados

O domínio da aplicação está modelado no Prisma com as seguintes entidades centrais:

- **Secretaria**: Órgãos municipais responsáveis pelas obras (ex.: Infraestrutura, Educação, Saúde) com cores de identificação visual no mapa.
- **Obra**: Cadastro georreferenciado com latitude/longitude, bairro, número de ordem de serviço, valor de contrato e status (`PLANEJADA`, `ORDEM_EMITIDA`, `EM_ANDAMENTO`, `PARALISADA`, `CONCLUIDA`).
- **EixoEstrategico**: Eixos de planejamento aos quais as obras podem ser relacionadas.
- **AreaTematica**: Áreas temáticas vinculadas a um eixo estratégico.
- **Medicao**: Acompanhamento da evolução percentual e pareceres técnicos realizados pelos fiscais.
- **Foto**: Registro visual categorizado (`RENDER_PROJETO`, `ANTES`, `EM_ANDAMENTO`, `CONCLUIDO`).
- **Usuario**: Usuários com perfis de acesso (`SUPER_ADMIN`, `GESTAO`, `ADM_SECRETARIA`, `ENGENHEIRO`, `CIDADAO`).

Relacionamentos principais:

- Uma `Secretaria` possui várias `Obra` e `Usuario`.
- Uma `Obra` pertence a uma `Secretaria` e pode estar relacionada a um `EixoEstrategico` e uma `AreaTematica`.
- Uma `Obra` possui várias `Medicao` e `Foto`.
- Uma `Medicao` é registrada por um `Usuario` com função de engenheiro.
- Uma `AreaTematica` pertence a um `EixoEstrategico`.

## Papéis e permissões

Os papéis estão definidos no modelo `Role` do Prisma:

| Papel | Responsabilidade prevista |
| --- | --- |
| `SUPER_ADMIN` | Administração geral da plataforma. |
| `GESTAO` | Acompanhamento gerencial e institucional. |
| `ADM_SECRETARIA` | Administração das obras de uma secretaria. |
| `ENGENHEIRO` | Registro e acompanhamento de medições e vistorias. |
| `CIDADAO` | Consulta pública das informações das obras. |

Autenticação e autorização são implementadas com Auth.js, sessão JWT e `bcryptjs`. Usuários administrativos precisam possuir `passwordHash`; usuários `CIDADAO` não podem entrar no fluxo administrativo. `ADM_SECRETARIA` e `ENGENHEIRO` são limitados à própria secretaria nas operações correspondentes.

## Mapa das rotas

| Rota | Método | Descrição |
| --- | --- | --- |
| `/` | `GET` | Página principal com o mapa público de obras. |
| `/projetos` | `GET` | Página pública de listagem e consulta de projetos. |
| `/login` | `GET` | Tela de login por e-mail e senha. |
| `/area-do-servidor` | `GET` | Área protegida para usuários autorizados. |
| `/api/obras` | `GET` | Retorna as obras cadastradas com seus relacionamentos e a medição mais recente. |
| `/api/obras` | `POST` | Cria uma obra após validação dos dados recebidos. |
| `/api/obras/[id]` | `GET` | Retorna os detalhes de uma obra. |
| `/api/obras/[id]` | `PATCH` | Atualiza parcialmente uma obra com autorização. |
| `/api/obras/[id]` | `DELETE` | Exclui logicamente uma obra com autorização. |
| `/api/obras/[id]/medicoes` | `POST` | Registra uma medição com autorização. |
| `/api/obras/[id]/medicoes` | `GET` | Retorna o histórico de medições da obra. |

Upload de fotos, gerenciamento de usuários e dashboards analíticos ainda estão previstos no roadmap.

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
Crie um arquivo `.env` na raiz do projeto com as credenciais do banco de dados:

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/banco?schema=public"
DIRECT_URL="postgresql://usuario:senha@host:5432/banco?schema=public"
AUTH_SECRET="gere-um-segredo-forte-e-mantenha-fora-do Git"
```

### 3. Sincronizar o Banco de Dados (Prisma)
```bash
# Executar as migrações existentes
pnpm prisma migrate dev

# (Opcional) Abrir o Prisma Studio para visualizar os dados
pnpm prisma studio

# (Opcional) Popular o banco com dados de demonstração
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
| `pnpm start` | Inicia a aplicação compilada para produção. |
| `pnpm lint` | Executa o ESLint. |
| `pnpm test` | Executa os testes automatizados. |
| `pnpm auth:set-password` | Define o hash de senha de um usuário autorizado usando `ADMIN_EMAIL` e `ADMIN_PASSWORD` do ambiente. |
| `pnpm prisma migrate dev` | Cria e aplica migrações no banco de desenvolvimento. |
| `pnpm prisma migrate deploy` | Aplica migrations pendentes sem recriar dados. |
| `pnpm prisma studio` | Abre a interface visual do Prisma para consultar os dados. |
| `pnpm prisma db seed` | Popula o banco com os dados definidos em `prisma/seed.ts`. |

## Estrutura de pastas

```text
app/
	api/obras/route.ts             # Listagem e criação de obras
	api/obras/[id]/route.ts        # Detalhes e atualização de uma obra
	api/obras/[id]/medicoes/       # Registro de medições
	api/auth/[...nextauth]/        # Handlers do Auth.js
	area-do-servidor/page.tsx      # Rota reservada para o painel interno
	login/page.tsx                 # Login administrativo
	projetos/page.tsx              # Listagem pública de projetos
	globals.css                    # Estilos globais
	layout.tsx                     # Layout e metadata da aplicação
	page.tsx                       # Página principal do mapa
components/
	map/                           # Mapa, filtros, marcadores e popups
lib/
	prisma.ts                      # Cliente Prisma compartilhado
	auth/                          # Guards de autorização
	obras/                         # Regras de relacionamento das obras
	serializers/                   # Serialização de dados para a API
	validations/                   # Schemas de validação com Zod
prisma/
	schema.prisma                  # Modelo de dados
	seed.ts                        # Dados iniciais de demonstração
	migrations/                    # Histórico de migrações
public/
	fotos/                         # Fotos usadas pelos registros de obras
	geojson/                       # Limite territorial de Goiana
	icons/                         # Ícones públicos
types/
	obra.ts                        # Tipos das obras consumidos pelo frontend
```

---

## 🗺️ Roadmap de Desenvolvimento

- [x] Modelagem do banco de dados relacional e migrações iniciais (Prisma)
- [x] Integração de mapa interativo com MapLibre GL
- [x] Limite territorial de Goiana via GeoJSON
- [x] Marcadores e popups com informações das obras
- [x] API pública para listagem de obras
- [x] API para criação, detalhe e atualização de obras
- [x] Validações de entrada e referências relacionadas
- [x] Filtros e paginação da API de obras
- [x] Página pública de listagem de projetos
- [ ] Página pública de detalhes da obra
- [x] Autenticação e controle de permissões básicos
- [x] Registro de medições por engenheiros autorizados
- [ ] Painel administrativo completo para cadastro de obras e secretarias
- [ ] Upload de fotos
- [ ] Dashboard analítico com métricas de investimento municipal
