import * as data from './data.js';

let state, collectionButton, inferenceButton, exportButton, 
  labelButton, inferenceText, collectionText;

function _toggleCollection() {
  state.isCollectionOn = !state.isCollectionOn;
  collectionButton.innerHTML = state.isCollectionOn ? "On" : "Off";
}

function _toggleInference() {
  state.isInferenceOn = !state.isInferenceOn;
  inferenceButton.innerHTML = (state.isInferenceOn ? "On" : "Off");
}

function _toggleLabel() {
  state.label = !state.label;
  labelButton.innerHTML = (state.label ? "True" : "False");
}

function setState(appState) {
  state = appState;
}

function initButtons() {
  collectionButton = document.getElementById('collection-state-btn');
  inferenceButton = document.getElementById('inference-state-btn');
  exportButton = document.getElementById('export-btn');
  labelButton = document.getElementById('label-btn');

  collectionButton.innerHTML = state.isCollectionOn ? "On" : "Off";
  inferenceButton.innerHTML = state.isInferenceOn? "On" : "Off";
  labelButton.innerHTML = state.label ? "True" : "False";
 
  collectionButton.onclick = _toggleCollection;
  inferenceButton.onclick = _toggleInference;
  labelButton.onclick = _toggleLabel;
  exportButton.onclick = data.exportData;

  inferenceText = document.getElementById('inference-txt');
  collectionText = document.getElementById('collection-txt');
}

function initVideo() {
  const video = state.video;
  video.play();
  video.width = video.videoWidth;
  video.height = video.videoHeight;
}

function initCanvas() {
  const canvas = document.getElementById('output');
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

export {setState, initButtons, initVideo, initCanvas, 
  updateInferenceText, updateCollectionText}

