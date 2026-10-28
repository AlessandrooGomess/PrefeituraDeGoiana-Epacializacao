describe("Portal de Obras - Testes Iniciais", () => {
  it("deve carregar a página inicial com sucesso", () => {
    cy.visit("/");
    cy.title().should("exist");
  });

  it("deve acessar a página de login e exibir o formulário", () => {
    cy.visit("/login");
    cy.url().should("include", "/login");
    cy.get("input[type=\"email\"], input[name=\"email\"]").should("exist");
  });
});
