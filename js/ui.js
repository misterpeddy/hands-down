let state;
let collectionButton;
let inferenceButton;
let exportButton;
let labelButton;
let inferenceText;
let collectionText;

// All handlers are private
function toggleCollection() {
  state.isCollectionOn = !state.isCollectionOn;
  collectionButton.innerHTML = state.isCollectionOn ? 'On' : 'Off';
}

function toggleInference() {
  state.isInferenceOn = !state.isInferenceOn;
  inferenceButton.innerHTML = state.isInferenceOn ? 'On' : 'Off';
}

function toggleLabel() {
  state.label = !state.label;
  labelButton.innerHTML = state.label ? 'True' : 'False';
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

  collectionButton.onclick = toggleCollection;
  inferenceButton.onclick = toggleInference;
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
  inferenceText.innerHTML = inference.toFixed(4);
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
