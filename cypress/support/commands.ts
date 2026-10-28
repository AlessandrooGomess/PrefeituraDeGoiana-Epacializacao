/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Mocka a API de geolocalização do navegador
       */
      mockGeolocation(latitude: number, longitude: number): Chainable<AUTWindow>;
    }
  }
}

Cypress.Commands.add("mockGeolocation", (latitude: number, longitude: number) => {
  return cy.window().then((win) => {
    cy.stub(win.navigator.geolocation, "getCurrentPosition").callsFake((cb) => {
      return cb({
        coords: {
          latitude,
          longitude,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });
    });
  });
});
