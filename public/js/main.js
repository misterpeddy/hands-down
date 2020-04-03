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
  console.info(navigator.mediaDevices);

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.log('mediaDevices not supported');
    // eslint-disable-next-line no-alert
    return alert('Your browser does not support the webcam functionality');
  }

  console.info(
    'sup constraints:',
    navigator.mediaDevices.getSupportedConstraints()
  );
  // navigator.mediaDevices
  //   .enumerateDevices()
  //   // eslint-disable-next-line no-console
  //   .then((devs) => console.log('Media devices:', devs), console.error);

  navigator.mediaDevices.getUserMedia.onactive = (evt) => {
    console.log('Media active', evt);
  };

  navigator.mediaDevices.getUserMedia.oninactive = (evt) => {
    console.log('Media inactive', evt);
  };

  try {
    navigator.mediaDevices.getUserMedia().then(
      (m) => console.log('m=', m),
      (err) => console.log('m err=', err) // Gets called
    );
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { exact: 768 },
        height: { exact: 576 },
        // width: { min: 768 },
        // height: { min: 576 },
        // frameRate: 30 (or whatever will improve the app's performance)
      },
      audio: false,
    });
    state.video.srcObject = stream;
    console.log('stream=', stream);
    stream.onactive = () => {
      // eslint-disable-next-line no-console
      console.log('Stream back up');
    }; // or stream.onaddtrack or navigator.mediaDevices.ondevicechange or navigator.mediaDevices.getUserMedia.onactive
    stream.onaddtrack = (t) => {
      console.log('Track added:', t);
    };
    stream.oninactive = () => {
      // eslint-disable-next-line no-alert
      alert('Oh! I lost you!');
    }; // or stream.onremovetrack
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Media error:', err); // Not called
    /* 
      Errors to look for according to https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices
      error.name = 'ConstraintNotSatisfiedError' | 'PermissionDeniedError'
    */
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
