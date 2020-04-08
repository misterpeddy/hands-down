/* global describe, it, cy */

describe('Dev Page', () => {
  it('loads', () => {
    cy.visit('/dev');
    cy.contains('Hands Down!');
  });

  it('has the important elements', () => {
    cy.get('#output');
    cy.contains('0 Data Points');
  });

  const CLICK_DELAY = 350;

  it('can turn on collection', () => {
    const collectionButton = cy.get('#collection-state-btn');
    collectionButton.contains('Off');
    collectionButton.click().then(() => {
      cy.wait(CLICK_DELAY);
      collectionButton.contains('On');
    });
  });

  it('can turn on inference', () => {
    const inferenceButton = cy.get('#inference-state-btn');
    inferenceButton.should('contain', 'On');
    inferenceButton.click().then(() => {
      cy.wait(CLICK_DELAY);
      inferenceButton.contains('Off');
    });
  });

  it('can change the label', () => {
    const labelButton = cy.get('#label-btn');
    labelButton.should('contain', 'True');
    labelButton.click().then(() => {
      cy.wait(CLICK_DELAY);
      labelButton.contains('False');
    });
  });

  // TODO Find a way to test when the camera is enabled so the button aren't disabled
});
