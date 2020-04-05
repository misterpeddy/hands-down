/* global describe, it, cy */
describe('User Page', () => {
  it('loads', () => {
    cy.visit('/');
    cy.contains('Hands Down!');
  });

  it('has the important elements', () => {
    cy.get('#output');
    cy.get('#inference-state-btn').should('be.disabled');
    cy.contains('- %');
  });
  // TODO Find a way to test when the camera is enabled so the button aren't disabled
});
