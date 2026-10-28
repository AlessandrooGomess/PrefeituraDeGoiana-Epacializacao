/// <reference types="cypress" />

describe("Página 1: Portal Público e Mapa Interativo (/) - Testes Profundos", () => {
  beforeEach(() => {
    // Garante viewport padrão desktop antes de cada teste
    cy.viewport(1280, 720);

    // Monitora erros no console para assegurar que nada quebre silenciosamente
    cy.on("window:before:load", (win) => {
      cy.spy(win.console, "error").as("consoleError");
    });
  });

  // =========================================================================
  // CAMADA 1: Estrutura, UI, Layout e Responsividade
  // =========================================================================
  describe("Camada 1: UI, Layout e Responsividade", () => {
    it("deve carregar todos os elementos estruturais essenciais do portal", () => {
      cy.visit("/");

      // Título da página
      cy.title().should("exist");

      // Campo de busca
      cy.get("input[placeholder=\"Buscar projeto...\"]")
        .should("be.visible")
        .and("have.attr", "aria-label", "Buscar projeto");

      // Painel lateral de filtros
      cy.get("[data-filter-panel]").should("exist");
      cy.get("[data-filter-panel] h1").should("contain.text", "Filtros");
      cy.get("[data-filter-panel]").contains("h2", "Áreas de interesse").should("be.visible");
      cy.get("[data-filter-panel]").contains("h2", "Status").should("be.visible");

      // Contêiner do mapa e chip de resultados
      cy.get("#mapa").should("be.visible");
      cy.get("div").filter(":contains('obras encontradas'), :contains('obra encontrada')").should("exist");
    });

    it("deve inicializar o contêiner do mapa MapLibre", () => {
      cy.intercept("GET", "/api/obras").as("getObras");
      cy.visit("/");

      cy.wait("@getObras");

      // O elemento pai do mapa deve conter a classe maplibregl
      cy.get("#mapa").within(() => {
        cy.get(".maplibregl-map, [class*='maplibregl']").should("exist");
      });
    });

    it("deve garantir comportamento responsivo em viewport mobile", () => {
      cy.intercept("GET", "/api/obras").as("getObrasMobile");
      cy.viewport("iphone-x");
      cy.visit("/");
      cy.wait("@getObrasMobile");

      // No mobile, o botão de alternância de filtros deve existir e expandir o painel
      cy.get("button[class*='mobile-filter-toggle']")
        .should("be.visible")
        .and("have.attr", "aria-expanded", "false")
        .click();

      // O botão deve indicar aria-expanded="true" e o painel estar expandido
      cy.get("button[class*='mobile-filter-toggle']").should("have.attr", "aria-expanded", "true");
      cy.get("[data-filter-panel]").should("have.attr", "class").and("include", "is-expanded");

      // Botão 'Filtrar' deve fechar o painel móvel
      cy.get("[data-filter-panel] button[class*='filter-apply']").click({ force: true });
      cy.get("button[class*='mobile-filter-toggle']").should("have.attr", "aria-expanded", "false");

      // Restaura viewport para desktop
      cy.viewport(1280, 720);
    });
  });

  // =========================================================================
  // CAMADA 2: Interações, Formulários de Filtro e Regras de Negócio
  // =========================================================================
  describe("Camada 2: Busca Interativa, Filtros e WorkCard", () => {
    it("deve filtrar obras em tempo real pelo campo de busca e permitir limpeza", () => {
      cy.intercept("GET", "/api/obras").as("getObrasSearch");
      cy.visit("/");
      cy.wait("@getObrasSearch");

      // Digitar termo após a hidratação do React
      cy.get("input[placeholder=\"Buscar projeto...\"]")
        .type("Goiana")
        .should("have.value", "Goiana");

      // Botão de limpar (✕) deve aparecer e funcionar
      cy.get("button[aria-label=\"Limpar pesquisa\"]").should("be.visible").click();
      cy.get("input[placeholder=\"Buscar projeto...\"]").should("have.value", "");

      // Tecla Escape deve limpar o input
      cy.get("input[placeholder=\"Buscar projeto...\"]").type("Hospital");
      cy.get("input[placeholder=\"Buscar projeto...\"]").type("{esc}");
      cy.get("input[placeholder=\"Buscar projeto...\"]").should("have.value", "");
    });

    it("deve alternar e filtrar status de obras", () => {
      cy.visit("/");

      // Por padrão, 'Em execução' (EM_ANDAMENTO) inicia marcado
      cy.get("[data-filter-panel]").contains("label", "Em execução").within(() => {
        cy.get("input[type=\"checkbox\"]").should("be.checked");
      });

      // Marca 'Concluída'
      cy.get("[data-filter-panel]").contains("label", "Concluída").within(() => {
        cy.get("input[type=\"checkbox\"]").check({ force: true });
        cy.get("input[type=\"checkbox\"]").should("be.checked");
      });

      // Desmarca 'Em execução'
      cy.get("[data-filter-panel]").contains("label", "Em execução").within(() => {
        cy.get("input[type=\"checkbox\"]").uncheck({ force: true });
        cy.get("input[type=\"checkbox\"]").should("not.be.checked");
      });
    });

    it("deve expandir e selecionar secretarias dentro de um eixo estratégico", () => {
      cy.visit("/");

      // Se houver eixos carregados, expande o primeiro
      cy.get("[data-filter-panel]").then(($panel) => {
        const toggleButtons = $panel.find("button[aria-label*='Expandir']");
        if (toggleButtons.length > 0) {
          cy.wrap(toggleButtons.first()).click();
          // Secretarias filhas devem ser exibidas
          cy.get("[data-filter-panel]").find("input[type=\"checkbox\"]").should("have.length.greaterThan(1)");
        }
      });
    });

    it("deve interagir com a geolocalização 'Perto de Mim'", () => {
      cy.intercept("GET", "/api/obras").as("getObrasNearMe");
      cy.mockGeolocation(-7.56, -34.95);
      cy.visit("/");
      cy.wait("@getObrasNearMe");

      // Clica no botão Perto de Mim desktop
      cy.get("button[class*='near-button-desktop']")
        .should("be.visible")
        .and("have.attr", "aria-pressed", "false")
        .click();

      // Deve alterar aria-pressed para true e o texto para "Ver todas as obras"
      cy.get("button[class*='near-button-desktop']")
        .should("have.attr", "aria-pressed", "true")
        .and("contain.text", "Ver todas as obras");

      // Clicar novamente reseta para "Perto de Mim"
      cy.get("button[class*='near-button-desktop']").click();
      cy.get("button[class*='near-button-desktop']")
        .should("have.attr", "aria-pressed", "false")
        .and("contain.text", "Perto de Mim");
    });

    it("deve exibir card de detalhes (WorkCard) quando uma obra for selecionada", () => {
      // Mock de uma obra controlada para garantir seleção previsível
      const mockObra = {
        id: "obra-teste-cypress-01",
        titulo: "Construção da Policlínica Municipal",
        descricao: "Obra de teste automatizado",
        endereco: "Rua do Centro, 100",
        bairro: "Centro",
        latitude: -7.56,
        longitude: -34.95,
        status: "EM_ANDAMENTO",
        percentualExecutado: 45,
        previsaoConclusao: "2026-12-31T00:00:00.000Z",
        secretaria: {
          id: "sec-saude",
          nome: "Secretaria de Saúde",
          sigla: "SESAU",
          corIdentificacao: "#0284c7",
        },
      };

      cy.intercept("GET", "/api/obras", [mockObra]).as("getMockObras");
      cy.visit("/");
      cy.wait("@getMockObras");

      // Clica no marcador criado no mapa
      cy.get(".map-marker, [class*='marker']").first().click({ force: true });

      // Valida o WorkCard
      cy.get("article").within(() => {
        cy.get("h2").should("contain.text", "Construção da Policlínica Municipal");
        cy.contains("SESAU").should("be.visible");
        cy.contains("Em execução").should("be.visible");
        cy.contains("Ver Detalhes Completos")
          .should("have.attr", "href")
          .and("include", `/projetos/${mockObra.id}`);

        // Fecha o card pelo botão de fechar
        cy.get("button[aria-label=\"Fechar detalhes\"]").click();
      });

      // Card não deve mais estar visível
      cy.get("article").should("not.exist");
    });
  });

  // =========================================================================
  // CAMADA 3: Resiliência de Rede e Integridade de API
  // =========================================================================
  describe("Camada 3: Resiliência de Rede e Tratamento de Erros de API", () => {
    it("deve exibir estado gracioso de erro quando a API /api/obras falhar (500)", () => {
      cy.intercept("GET", "/api/obras", {
        statusCode: 500,
        body: { message: "Erro interno no servidor de banco de dados." },
      }).as("getObrasFail");

      cy.visit("/");
      cy.wait("@getObrasFail");

      // O sistema NÃO deve crashar em tela branca
      cy.get("#mapa").should("be.visible");

      // Deve alertar o usuário de forma amigável
      cy.contains("Falha ao obter obras").should("be.visible");
    });

    it("deve lidar corretamente com lista vazia de obras sem quebrar", () => {
      cy.intercept("GET", "/api/obras", {
        statusCode: 200,
        body: [],
      }).as("getObrasVazia");

      cy.visit("/");
      cy.wait("@getObrasVazia");

      // Chip deve indicar 0 obras encontradas
      cy.contains("0 obras encontradas").should("be.visible");
    });
  });

  // =========================================================================
  // CAMADA 4: Segurança Ativa e Bateria OWASP Top 10
  // =========================================================================
  describe("Camada 4: Bateria de Segurança OWASP Top 10", () => {
    it("OWASP A03 (SQL Injection): deve sanitizar e repelir injeções de SQL no campo de busca", () => {
      cy.visit("/");

      const sqlPayloads = [
        "' OR '1'='1",
        "'; DROP TABLE usuarios; --",
        "' UNION SELECT id, email, password_hash FROM usuarios --",
        "1' OR '1' = '1' /*",
        "admin'--",
      ];

      sqlPayloads.forEach((payload) => {
        cy.get("input[placeholder=\"Buscar projeto...\"]").clear().type(payload);

        // A aplicação não deve crashar, nem expor dados sensíveis ou gerar erros 500
        cy.get("#mapa").should("be.visible");
        cy.get("@consoleError").should("not.be.calledWithMatch", /syntax error|prisma|sql/i);
      });
    });

    it("OWASP A10 (Reflected / DOM XSS): deve neutralizar scripts no campo de pesquisa", () => {
      cy.visit("/");

      // Marca se algum script arbitrário conseguiu rodar
      cy.window().then((win) => {
        // @ts-expect-error test flag
        win.__xss_vulnerable = false;
      });

      const xssPayloads = [
        "<script>window.__xss_vulnerable=true</script>",
        "<img src=x onerror=\"window.__xss_vulnerable=true\">",
        "<svg/onload=\"window.__xss_vulnerable=true\">",
        "javascript:window.__xss_vulnerable=true",
      ];

      xssPayloads.forEach((payload) => {
        cy.get("input[placeholder=\"Buscar projeto...\"]").clear().type(payload, { parseSpecialCharSequences: false });

        // Valida que o payload não foi executado
        cy.window().then((win) => {
          // @ts-expect-error test flag
          expect(win.__xss_vulnerable, `Vulnerabilidade XSS detectada com payload: ${payload}`).to.be.false;
        });
      });
    });

    it("OWASP A10 (Stored / DOM XSS): deve escapar com segurança dados vindos da API", () => {
      // Simula uma obra maliciosa cadastrada no banco com payload XSS em todos os campos de texto
      const maliciousObra = {
        id: "xss-test-id",
        titulo: "<script>window.__stored_xss=true</script><img src=x onerror=\"window.__stored_xss=true\">Praça Segura",
        descricao: "<svg onload=\"window.__stored_xss=true\">Descrição</svg>",
        endereco: "<iframe src=\"javascript:window.__stored_xss=true\"></iframe>Rua Central",
        bairro: "Centro",
        latitude: -7.56,
        longitude: -34.95,
        status: "EM_ANDAMENTO",
        percentualExecutado: 50,
        previsaoConclusao: null,
        secretaria: {
          id: "sec-teste",
          nome: "<script>window.__stored_xss=true</script>Sec",
          sigla: "SEC",
          corIdentificacao: "#ff0000",
        },
      };

      cy.intercept("GET", "/api/obras", [maliciousObra]).as("getXssObra");
      cy.visit("/");
      cy.wait("@getXssObra");

      // Clica no marcador da obra no mapa para abrir o WorkCard
      cy.get(".map-marker, [class*='marker']").first().click({ force: true });

      // Verifica que nenhuma das injeções disparou código no contexto do navegador
      cy.window().then((win) => {
        // @ts-expect-error test flag
        expect(win.__stored_xss, "Stored XSS executou código indevido no DOM").to.be.undefined;
      });

      // O título deve ser renderizado como texto puro escapado, não como elemento HTML executável
      cy.get("h2").should("exist");
      cy.get("script").should("not.have.text", "window.__stored_xss=true");
    });

    it("OWASP A02 (Cryptographic & Sensitive Data Leak): não deve expor campos sensíveis em /api/obras", () => {
      // Faz requisição direta na API pública de obras e examina o contrato retornado
      cy.request("/api/obras").then((response) => {
        expect(response.status).to.eq(200);

        const obras = response.body;
        if (Array.isArray(obras) && obras.length > 0) {
          obras.forEach((obra) => {
            // Nenhum usuário com hash de senha ou credenciais deve estar presente
            expect(obra).to.not.have.property("password");
            expect(obra).to.not.have.property("passwordHash");
            expect(obra).to.not.have.property("password_hash");

            if (obra.usuario) {
              expect(obra.usuario).to.not.have.property("passwordHash");
              expect(obra.usuario).to.not.have.property("password_hash");
            }
          });
        }
      });
    });
  });
});
