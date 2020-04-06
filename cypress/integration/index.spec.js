/* global describe, it, cy */
// Source: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/By_example/Detect_WebGL
const detectWebGLContext = () => {
  /* eslint-disable no-console */
  const canvas = document.createElement('canvas');
  const gl =
    canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (gl && gl instanceof WebGLRenderingContext) {
    console.info('Congratulations! Your browser supports WebGL.');
  } else {
    console.info(
      'Failed to get WebGL context. Your browser or device may not support WebGL.'
    );
  }
};

detectWebGLContext();

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
