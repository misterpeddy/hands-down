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

  it('can turn on collection', () => {
    const collectionButton = cy.get('#collection-state-btn');
    collectionButton.contains('Off');
    /* collectionButton.click().then((btn) => {
      // collectionButton.contains('On');
      expect(btn.text()).to.include('On');
    }); */
  });

  it('can turn on inference', () => {
    const inferenceButton = cy.get('#inference-state-btn');
    inferenceButton.should('contain', 'On');
    /*  inferenceButton.click().then((btn) => {
      expect(btn.text()).to.eq('Off');
    }); */
  });

  it('can change the label', () => {
    const labelButton = cy.get('#label-btn');
    labelButton.should('contain', 'True');
    /*  labelButton.click().then((btn) => {
      expect(btn.text()).to.eq('False');
    }); */
  });

  // TODO Find a way to test when the camera is enabled so the button aren't disabled
});
