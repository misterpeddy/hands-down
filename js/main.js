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
  initDom,
  updateInferenceText,
  error,
  setButtonsState,
} from './ui.js';

const state = {
  isCollectionOn: false,
  isInferenceOn: true,
  label: true,
  video: undefined,
  // TODO Consider putting the pathname to a JS[ON]/YAML file which would also be read by app.js
  isInDevMode: window.location.pathname === '/dev',
};

function computeCameraDimensions() {
  const IDEAL_VIEW_WIDTH = 768;
  const IDEAL_VIEW_HEIGHT = 576;
  const REF_WIDTH = 1440;
  const REF_HEIGHT = 1024;

  const VIEW_RATIO = {
    width: IDEAL_VIEW_WIDTH / REF_WIDTH,
    height: IDEAL_VIEW_HEIGHT / REF_HEIGHT,
  };
  const MAX_CAMERA_WIDTH = window.innerWidth * VIEW_RATIO.width;
  const MAX_CAMERA_HEIGHT = window.innerHeight * VIEW_RATIO.height;

  return {
    width: {
      // min: 640,
      ideal: IDEAL_VIEW_WIDTH,
      max: MAX_CAMERA_WIDTH,
    },
    height: {
      // min: 480,
      ideal: IDEAL_VIEW_HEIGHT,
      max: MAX_CAMERA_HEIGHT,
    },
  };
}

/*
 * Requests access to user-facing, video-only
 * media stream; resolves the returned promise
 * when onMetadataLoaded event is called on the
 * media stream
 */
async function initCamera() {
  state.video = document.getElementById('video');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    const message = 'Your browser does not support the webcam functionality';
    // eslint-disable-next-line no-alert
    alert(message);
    throw new Error(message);
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        ...computeCameraDimensions(),
      },
      audio: false,
    });
    state.video.srcObject = stream;
  } catch (err) {
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
    /* eslint-disable no-alert */
    if (err.name === 'NotReadableError') {
      alert(
        'Another software is using the webcam, please close it and reload this page!'
      );
    } else if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
      alert(
        'The webcam access was blocked by either the insecure connection or Content Security Policy'
      );
    } else {
      alert(`Media error: ${err.message}`);
    }
    throw err;
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
    if (handPoints !== null) {
      computeInference(facePoints, handPoints).then((inference) =>
        updateInferenceText(inference[0])
      );
    } else updateInferenceText(0);
  } else if (!state.isInDevMode) {
    document.getElementById('inference-txt').innerHTML = '- %';
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
  return Promise.all([initCamera(), initializeModel(), initDom()]);
}

/* Initializes necessary components and starts the
 * inference engine.
 */
async function main() {
  try {
    await initialize();
  } catch (err) {
    // TODO Use the danger class once this hits the new UI
    error(err.message);
    setButtonsState({ disable: true });
    // Maybe also disable the buttons to increase the emphasis?
    // eslint-disable-next-line no-console
    console.warn('App failure:', err);
    return -1;
  }

  setStateUI(state);
  initButtonsUI(exportData);
  initVideoUI();
  const canvas = initCanvas();

  startEngine(canvas, state.video);

  return 0;
}

main();
