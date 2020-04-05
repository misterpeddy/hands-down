/* global describe, it, cy */
describe('Dev Page', () => {
  it('loads', () => {
    cy.visit('/dev');
    cy.contains('Hands Down!');
  });

  it('has the important elements', () => {
    cy.get('#output');
    cy.get('#collection-state-btn').should('be.disabled');
    cy.get('#inference-state-btn').should('be.disabled');
    cy.get('#label-btn').should('be.disabled');
    cy.get('#export-btn').should('be.disabled');
    cy.contains('0 Data Points');
  });
  // TODO Find a way to test when the camera is enabled so the button aren't disabled
});
