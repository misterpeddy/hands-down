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
const notificationsEnabled =
  localStorage.getItem('handsdown-notifications') !== 'false';
let lastInference = null;
const EPS = 2 ** -52;
const PRECISION = 10_000;
const TOUCH_THRESHOLD = 0.8;

// All handlers are private
const toggleButton = (button, value) => {
  state[value] = !state[value];
  /* eslint-disable no-param-reassign */
  if (state[value]) {
    button.innerHTML = 'On';
    button.classList.remove('button-off');
  } else {
    button.innerHTML = 'Off';
    button.classList.add('button-off');
  }
};

const toggleLabel = () => {
  state.label = !state.label;
  if (state.label) {
    labelButton.innerHTML = 'True';
    labelButton.classList.remove('button-off');
  } else {
    labelButton.innerHTML = 'False';
    labelButton.classList.add('button-off');
  }
};

const setStateUI = (appState) => {
  state = appState;
};

const remindUser = () => {
  if (notificationsEnabled && state.handFaceContact && !state.isInDevMode) {
    notify('Hands Down!!', {
      // TODO See why the icon isn't being shown (in Chromium-based browsers) and fix it!
      icon: '/assets/favicon-64.png',
      body: 'YOU are touching your face!',
      vibrate: [200, 100, 200], // Vibrates the device for 200ms, pause 100ms, vibrate for 200ms
    });
  }
};

const initButtonsUI = (exportDataHandler) => {
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

  /*
   * Ideal delays:
   * - Throttling: 2000
   * - Debounce: 200 (or anywhere between 150-200)
   */

  const DELAY = 3500;
  const textObserver = new MutationObserver(throttle(remindUser, DELAY));

  const observerConfig = { childList: true };
  textObserver.observe(inferenceText, observerConfig);
  window.onunload = () => textObserver.disconnect();
};

const initVideoUI = () => {
  const { video } = state;
  video.play();
  video.width = video.videoWidth;
  video.height = video.videoHeight;
};

const initCanvas = () => {
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
};

const hasNotChangedEnough = (inference) => {
  const change =
    Math.round(Math.abs(inference - lastInference) * PRECISION) / PRECISION;
  return change < EPS;
};

const updateInferenceText = (inference) => {
  if (hasNotChangedEnough(inference)) return;
  if (!inference) {
    inferenceText.innerHTML = '- %';
    inferenceText.parentElement.className = '';
  } else {
    inferenceText.innerHTML = `${(inference * 100).toFixed(2)} %`;
    const touching = inference >= TOUCH_THRESHOLD;
    state.handFaceContact = touching;
    inferenceText.parentElement.className = touching ? 'danger' : '';
  }
  lastInference = inference;
};

const updateCollectionText = (numCollected) => {
  collectionText.innerHTML = numCollected;
};

const error = (message) => {
  const errorText = document.getElementById('error-message');
  errorText.innerHTML = message;
};

const setButtonsState = ({ disable = false }) => {
  const buttons = [...document.querySelectorAll('button')];
  buttons.forEach((button) => {
    button.setAttribute('disabled', disable);
  });
};

export {
  setStateUI,
  initButtonsUI,
  initVideoUI,
  initCanvas,
  updateInferenceText,
  updateCollectionText,
  error,
  setButtonsState,
};
