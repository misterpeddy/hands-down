/* global describe, it, cy */
describe('User Page', () => {
  it('loads', () => {
    cy.visit('/');
    cy.contains('Hands Down!');
  });

  it('has the important elements', () => {
    cy.get('#output');
    cy.contains('- %');
  });

  it('can turn on inference', () => {
    const inferenceButton = cy.get('#inference-state-btn');
    inferenceButton.should('contain', 'On');
    /*  inferenceButton.click().then((btn) => {
      expect(btn.text()).to.eq('Off');
    }); */
  });
  // TODO Find a way to test when the camera is enabled so the button aren't disabled
});
