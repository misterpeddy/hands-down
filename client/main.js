/* eslint-disable import/extensions */
import drawFrame from './components/draw.js';
import {
  computeInference,
  computeCombinedKeyPoints,
  initializeModel,
} from './components/models.js';
import { collectFeatures, exportData } from './components/data.js';
import {
  updateCollectionText,
  setStateUI,
  initButtonsUI,
  initVideoUI,
  initCanvas,
  updateInferenceText,
  error,
  setButtonsState,
} from './components/ui.js';

const FRAMES_PER_SECOND = 1000 / 60;
const state = {
  isCollectionOn: false,
  isInferenceOn: true,
  label: true,
  video: undefined,
  // TODO Consider putting the pathname to a JS[ON]/YAML file which would also be read by app.js
  isInDevMode: window.location.pathname === '/dev',
  canvas: null,
  isActiveTab: true,
  timerId: null,
};

// TODO Is this a good parallelizable function? If so -> WebWorker
const computeCameraDimensions = () => {
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
      ideal: IDEAL_VIEW_WIDTH,
      max: MAX_CAMERA_WIDTH,
    },
    height: {
      ideal: IDEAL_VIEW_HEIGHT,
      max: MAX_CAMERA_HEIGHT,
    },
  };
};

/*
 * Requests access to user-facing, video-only
 * media stream; resolves the returned promise
 * when onMetadataLoaded event is called on the
 * media stream
 */
const initCamera = async () => {
  state.video = document.getElementById('video');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    const message = 'Your browser does not support the webcam functionality';
    // eslint-disable-next-line no-alert
    alert(message);
    throw new Error(message);
  }

  try {
    const frameRate =
      state.backend === 'cpu' ? { ideal: 2, max: 20 } : { ideal: 20, max: 30 };
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        frameRate,
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
};

// TODO Is this a good parallelizable function? If so -> WebWorker
/*
 * Takes face and hand keypoints and carries out
 * all processing steps enabled in current state.
 */
const processKeyPoints = (facePoints, handPoints) => {
  if (state.isCollectionOn) {
    const collectionSize = collectFeatures(facePoints, handPoints, state.label);
    updateCollectionText(collectionSize);
  }

  if (state.isInferenceOn) {
    if (facePoints && handPoints) {
      computeInference(facePoints, handPoints).then((inference) =>
        updateInferenceText(inference[0])
      );
    } else updateInferenceText(0);
  } else if (!state.isInDevMode) {
    updateInferenceText(false);
  }
};

/*
 * Extracts facePoints, handPoints, and handAnnotations.
 */
const extractPoints = (combinedFeatures) => {
  if (combinedFeatures === undefined) {
    throw Error('Cannot draw frame with undefined features');
  }

  // Render FaceMesh
  const faceMeshes = combinedFeatures[0];
  let facePoints;
  if (faceMeshes !== undefined && faceMeshes.length > 0) {
    facePoints = faceMeshes[0].scaledMesh;
  }

  // Render HandPose
  const handMeshes = combinedFeatures[1];
  let handPoints;
  let handAnnotations;
  if (handMeshes) {
    handPoints = handMeshes[0].landmarks;
    handAnnotations = handMeshes[0].annotations;
  }
  return [facePoints, handPoints, handAnnotations];
};

// TODO Is this a good parallelizable function? If so -> WebWorker
/*
 * Each call to update carries out all key point computations,
 * any enabled processing, and draws the next frame. If no errors
 * occur, asks the runtime to be called again on next frame update.
 */
const computeFrame = async () =>
  computeCombinedKeyPoints(state.video)
    .then((combinedFeatures) => extractPoints(combinedFeatures))
    .then(([facePoints, handPoints, handAnnotations]) => {
      // Don't need to draw on canvas if tab is NOT active (i.e. visible)
      if (state.isActiveTab) {
        drawFrame(
          state.canvas,
          state.video,
          facePoints,
          handPoints,
          handAnnotations
        );
      }
      return processKeyPoints(facePoints, handPoints);
    })
    .then(() => {
      // requestAnimationFrame only works on an active tab
      if (state.isActiveTab) {
        state.timerId = requestAnimationFrame(computeFrame);
      }
      return Promise.resolve();
    })
    .catch((err) =>
      // eslint-disable-next-line no-console
      console.error('Could not compute and render frame: ', err)
    );

/*
 * Initializes video feed models and tf.js runtime.
 * Failures should be fatal.
 */
const initialize = async () => Promise.all([initializeModel(state)]);

/*
 * Handles when user switches tabs and initiates the process with appropriate loop.
 * No need for canvas when on a DIFFERENT tab.
 * Should only use requestAnimationFrame when tab=active.
 * Also responsible for the stopping the previous timer.
 */
const handleVisibilityChange = () => {
  state.isActiveTab = document.visibilityState === 'visible';
  if (!state.isActiveTab) {
    if (!state.timerId) {
      cancelAnimationFrame(state.timerId);
    }
    state.canvas.style.display = 'none';
    state.timerId = setInterval(computeFrame, FRAMES_PER_SECOND);
  } else {
    state.canvas.style.display = 'inline-block';
    if (state.timerId) {
      clearInterval(state.timerId);
    }
    computeFrame();
  }
};

/* Initializes necessary components and starts the
 * inference engine.
 */
const main = async () => {
  try {
    await initialize();
    await initCamera();
  } catch (err) {
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
  state.canvas = canvas;
  document.getElementById('loader').style.display = 'none';

  computeFrame();
  document.addEventListener('visibilitychange', handleVisibilityChange, false);

  return 0;
};

export default main;
