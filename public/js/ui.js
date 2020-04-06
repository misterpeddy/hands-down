/* eslint-disable import/extensions */
import { throttle } from './event.js';
import notify from './notify.js';

let state;
let collectionButton;
let inferenceButton;
let exportButton;
let labelButton;
let inferenceText;
let collectionText;

// All handlers are private
function toggleButton(button, value) {
  state[value] = !state[value];
  /* eslint-disable no-param-reassign */
  if (state[value]) {
    button.innerHTML = 'On';
    button.classList.remove('button-off');
  } else {
    button.innerHTML = 'Off';
    button.classList.add('button-off');
  }
}

function toggleLabel() {
  state.label = !state.label;
  if (state.label) {
    labelButton.innerHTML = 'True';
    labelButton.classList.remove('button-off');
  } else {
    labelButton.innerHTML = 'False';
    labelButton.classList.add('button-off');
  }
}

function setStateUI(appState) {
  state = appState;
}

function remindUser() {
  if (state.handFaceContact && !state.isInDevMode) {
    notify('Hands Down!!', {
      // TODO See why the icon isn't being shown and fix it!
      badge: `${window.location.origin}/assets/doNotTouch.png`,
      icon: '/assets/doNotTouch.png',
      // image: 'https://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
      body: 'YOU are touching your face!',
      vibrate: [200, 100, 200], // Vibrates the device for 200ms, pause 100ms, vibrate for 200ms
    });
  }
}

function initButtonsUI(exportDataHandler) {
  if (state.isInDevMode) {
    collectionButton = document.getElementById('collection-state-btn');
    exportButton = document.getElementById('export-btn');
    labelButton = document.getElementById('label-btn');

    collectionButton.innerHTML = state.isCollectionOn ? 'On' : 'Off';
    labelButton.innerHTML = state.label ? 'True' : 'False';

    collectionButton.onclick = () => {
      toggleButton(collectionButton, 'isCollectionOn');
    };

    labelButton.onclick = toggleLabel;
    exportButton.onclick = exportDataHandler;

    collectionText = document.getElementById('collection-txt');
  }

  inferenceButton = document.getElementById('inference-state-btn');

  inferenceButton.innerHTML = state.isInferenceOn ? 'On' : 'Off';

  inferenceButton.onclick = () => {
    toggleButton(inferenceButton, 'isInferenceOn');
  };

  inferenceText = document.getElementById('inference-txt');

  const DELAY = 2000;
  const textObserver = new MutationObserver(throttle(remindUser, DELAY));

  const observerConfig = { childList: true };
  textObserver.observe(inferenceText, observerConfig);
  window.onunload = () => textObserver.disconnect();
}

function initVideoUI() {
  const { video } = state;
  video.play();
  video.width = video.videoWidth;
  video.height = video.videoHeight;
}

function initCanvas() {
  const canvas = document.getElementById('output');
  const { video } = state;
  canvas.width = video.width;
  canvas.height = video.height;

  const canvasContainer = document.querySelector('.canvas-wrapper');
  canvasContainer.style = `width: ${video.width}px; height: ${video.height}px`;

  const ctx = canvas.getContext('2d');
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.fillStyle = '#32EEDB';
  ctx.strokeStyle = '#32EEDB';
  ctx.lineWidth = 0.5;

  return canvas;
}

function updateInferenceText(inference) {
  inferenceText.innerHTML = `${(inference * 100).toFixed(2)} %`;
  const TOUCH_THRESHOLD = 0.8;
  const touching = inference >= TOUCH_THRESHOLD;
  state.handFaceContact = touching;
  inferenceText.parentElement.className = touching ? 'danger' : '';
}

function updateCollectionText(numCollected) {
  collectionText.innerHTML = numCollected;
}

function error(message) {
  const errorText = document.getElementById('error-message');
  errorText.innerHTML = message;
}

function setButtonsState({ disable = false }) {
  const buttons = [...document.querySelectorAll('button')];
  buttons.forEach((button) => {
    button.setAttribute('disabled', disable);
  });
}

function initDom() {
  // eslint-disable-next-line no-restricted-globals
  if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    const reloadScript = document.querySelector(
      'script[src="/reload/reload.js"]'
    );
    reloadScript.parentElement.removeChild(reloadScript);
  }
}

export {
  setStateUI,
  initButtonsUI,
  initVideoUI,
  initCanvas,
  initDom,
  updateInferenceText,
  updateCollectionText,
  error,
  setButtonsState,
};
