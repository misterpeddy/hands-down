/* eslint-disable import/extensions */
import drawFrame from './draw.js';
import {
  computeInference,
  computeCombinedKeyPoints,
  initializeModel,
} from './models.js';
import { collectFeatures, exportData } from './data.js';
import {
  updateCollectionText,
  setStateUI,
  initButtonsUI,
  initVideoUI,
  initCanvas,
  updateInferenceText,
} from './ui.js';

const state = {
  isCollectionOn: false,
  isInferenceOn: true,
  label: true,
  video: undefined,
};

/*
 * Requests access to user-facing, video-only
 * media stream; resolves the returned promise
 * when onMetadataLoaded event is called on the
 * media stream
 */
async function initCamera() {
  state.video = document.getElementById('video');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    // eslint-disable-next-line no-alert
    return alert('Your browser does not support the webcam functionality');
  }

  /* navigator.mediaDevices.getUserMedia().then(
    (m) => console.log('Media stream=', m),
    (err) => console.log('Media stream err=', err) // Gets called
  ); */

  navigator.mediaDevices.ondevicechange = (evt) => {
    // eslint-disable-next-line no-console
    console.log('Device change detected:', evt);
    // Do some updates here
  };
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        // width: { exact: 768 },
        // height: { exact: 576 },
        // width: { min: 640, ideal: 768, max: 1430 },
        // height: { min: 480, ideal: 576, max: 1010 },
        // frameRate: { ideal: 30, max: 60 } (or whatever will improve the app's performance)
      },
      audio: false,
    });
    state.video.srcObject = stream;
  } catch (err) {
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
    /* eslint-disable no-alert, no-console */
    if (err.name === 'NotReadableError')
      alert(
        'Another software is using the webcam, please close it and reload this page!'
      );
    else if (err.name === 'NotAllowedError' || err.name === 'SecurityError')
      alert(
        'The webcam access was blocked by either the insecure connection or Content Security Policy'
      );
    else console.error('Media error:', err);
  }

  return new Promise((resolve) => {
    state.video.onloadedmetadata = () => {
      resolve();
    };
  });
}

/*
 * Takes face and hand keypoints and carries out
 * all processing steps enabled in current state.
 */
function processKeyPoints(combinedKeyPoints) {
  if (combinedKeyPoints === undefined || combinedKeyPoints.length !== 2) {
    throw Error(
      `Expected 2 key point arrays, but received ${combinedKeyPoints}`
    );
  }

  const facePoints = combinedKeyPoints[0];
  const handPoints = combinedKeyPoints[1];

  if (state.isCollectionOn) {
    const collectionSize = collectFeatures(facePoints, handPoints, state.label);
    updateCollectionText(collectionSize);
  }

  if (state.isInferenceOn) {
    if (facePoints !== undefined && handPoints !== undefined) {
      computeInference(facePoints, handPoints).then((inference) =>
        updateInferenceText(inference[0])
      );
    }
  }
}

/*
 * Each call to update carries out all key point computations,
 * any enabled processing, and draws the next frame. If no errors
 * occur, asks the runtime to be called again on next frame update.
 */
async function startEngine(canvas, video) {
  (function update() {
    computeCombinedKeyPoints(video)
      .then((combinedFeatures) => drawFrame(canvas, video, combinedFeatures))
      .then((combinedKeyPoints) => processKeyPoints(combinedKeyPoints))
      .then(() => requestAnimationFrame(update))
      .catch((err) =>
        // eslint-disable-next-line no-console
        console.error('Could not compute and render frame: ', err)
      );
  })();
}

/*
 * Initializes video feed models and tf.js runtime.
 * Failures should be fatal.
 */
async function initialize() {
  return Promise.all([initCamera(), initializeModel()]);
}

/* Initializes necessary components and starts the
 * inference engine.
 */
async function main() {
  await initialize();

  setStateUI(state);
  initButtonsUI(exportData);
  initVideoUI();
  const canvas = initCanvas();

  startEngine(canvas, state.video);
}

main();
