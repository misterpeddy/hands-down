import * as draw from './draw.js';
import * as models from './models.js';
import * as data from './data.js';
import * as ui from './ui.js';

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

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'user',
    },
    audio: false,
  });
  state.video.srcObject = stream;

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
  if (combinedKeyPoints == undefined || combinedKeyPoints.length != 2) {
    throw `Expected 2 key point arrays, but received ${combinedKeyPoints}`;
  }

  const facePoints = combinedKeyPoints[0];
  const handPoints = combinedKeyPoints[1];

  if (state.isCollectionOn) {
    const collectionSize = data.collectFeatures(facePoints, handPoints, state.label);
    ui.updateCollectionText(collectionSize);
  }

  if (state.isInferenceOn) {
    if (facePoints != undefined && handPoints != undefined) {
      models.computeInference(facePoints, handPoints)
        .then((inference) => ui.updateInferenceText(inference[0]));
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
    models.computeCombinedKeyPoints(video)
      .then((combinedFeatures) => draw.frame(canvas, video, combinedFeatures))
      .then((combinedKeyPoints) => processKeyPoints(combinedKeyPoints))
      .then(() => requestAnimationFrame(update))
      .catch((err) => console.error('Could not compute and render frame: ', err));
  }());
}

/*
 * Initializes video feed models and tf.js runtime.
 * Failures should be fatal.
 */
async function initialize() {
  return Promise.all([
    initCamera(),
    models.initialize(),
  ]);
}

/* Initializes necessary components and starts the
 * inference engine.
 */
async function main() {
  await initialize();

  ui.setState(state);
  ui.initButtons();
  ui.initVideo();
  const canvas = ui.initCanvas();

  startEngine(canvas, video);
}

main();
