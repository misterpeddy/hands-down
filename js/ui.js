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

function initButtonsUI(exportDataHandler) {
  collectionButton = document.getElementById('collection-state-btn');
  inferenceButton = document.getElementById('inference-state-btn');
  exportButton = document.getElementById('export-btn');
  labelButton = document.getElementById('label-btn');

  collectionButton.innerHTML = state.isCollectionOn ? 'On' : 'Off';
  inferenceButton.innerHTML = state.isInferenceOn ? 'On' : 'Off';
  labelButton.innerHTML = state.label ? 'True' : 'False';

  collectionButton.onclick = () => {
    toggleButton(collectionButton, 'isCollectionOn');
  };
  inferenceButton.onclick = () => {
    toggleButton(inferenceButton, 'isInferenceOn');
  };
  labelButton.onclick = toggleLabel;
  exportButton.onclick = exportDataHandler;

  inferenceText = document.getElementById('inference-txt');
  collectionText = document.getElementById('collection-txt');
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
  inferenceText.parentElement.className =
    inference >= TOUCH_THRESHOLD ? 'danger' : '';
}

function updateCollectionText(numCollected) {
  collectionText.innerHTML = numCollected;
}

export {
  setStateUI,
  initButtonsUI,
  initVideoUI,
  initCanvas,
  updateInferenceText,
  updateCollectionText,
};
