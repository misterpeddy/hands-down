/* eslint-disable no-undef */

const MODEL_FILENAME = 'model.json';
const MODEL_VERSION = '31-03-20-0';
const REMOTE_MODEL_ROOT =
  'https://peddy-ai-models.storage.googleapis.com/hands-down';
const LOCAL_MODEL_ROOT = 'public/models';

const REMOTE_MODEL_URL = `${REMOTE_MODEL_ROOT}/${MODEL_VERSION}/${MODEL_FILENAME}`;
const LOCAL_MODEL_URL = `${LOCAL_MODEL_ROOT}/${MODEL_VERSION}/${MODEL_FILENAME}`;

const BACKENDS = ['webgl', 'wasm', 'cpu'];

const IS_INFERENCE_VERBOSE = false;

let faceMesh;
let handPose;
let classifier;
let initialized;

/*
 * Must be called before any other functions in module.
 * First tries to load most performant TF backend.
 * Initializes the Facemesh and Handpose models, fetches
 * and loads the frozen classifer into memory, all in parallel.
 */
const initializeModel = async () => {
  let i = 0;
  for (; i < BACKENDS.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    if (await tf.setBackend(BACKENDS[i])) break;
  }

  if (i === BACKENDS.length || tf.getBackend() === undefined)
    throw Error('No TensorFlow backend was successfully initialized.');

  const completeInit = (models) => {
    if (models.length !== 3) {
      throw Error(
        `Expected to initialize 3 models but received ${models.length}`
      );
    }

    [faceMesh, handPose, classifier] = models;

    // eslint-disable-next-line no-console
    console.log(`${tf.getBackend()} tf.js backend initialized`);

    initialized = true;
  };

  const modelPromises = [
    facemesh.load({ maxFaces: 1 }),
    handpose.load(),
    tf
      .loadGraphModel(REMOTE_MODEL_URL, { mode: 'cors' })
      .catch(() => tf.loadGraphModel(LOCAL_MODEL_URL)),
  ];

  return Promise.all(modelPromises)
    .then((models) => completeInit(models))
    .catch((err) => {
      throw Error(`Model initialization unsuccessful: ${err}`);
    });
};

/*
 * Throws error if  init() has not previously been called.
 */
const validateInit = () => {
  if (!initialized) {
    throw Error(
      'Attempted to use a function from models Module before initialization'
    );
  }
};

/*
 * Given a video stream, returns a promise wrapping
 * the estimated keypoints of a single face and a
 * single hand present in the current frame.
 */
const computeCombinedKeyPoints = async (video) => {
  validateInit();
  if (video === undefined) {
    throw Error('Cannot compute key points for undefined video stream');
  }

  const combinedFeatures = await Promise.all([
    faceMesh.estimateFaces(video),
    handPose.estimateHands(video),
  ]);

  const noHandFound = !combinedFeatures[1].length;
  return noHandFound ? [combinedFeatures[0], null] : combinedFeatures;
};

/*
 * Given the face and hand keypoints extracted from an image,
 * returns a promise for there inference result (probability
 * that the hand is touching the face).
 */
const computeInference = (faceKeyPoints, handKeyPoints) => {
  validateInit();
  if (!faceKeyPoints || !handKeyPoints) {
    return Promise.reject(Error('Both key points must be set'));
  }

  let fp = tf.tensor(faceKeyPoints).expandDims(0);
  let hp = tf.tensor(handKeyPoints).expandDims(0);

  // Compute difference between every (hp, fp) pair
  hp = hp.expandDims(2);
  fp = fp.expandDims(1);
  const diff = hp.sub(fp);

  // Reduce to distance to closest fp for each hp
  const norm = diff.norm(undefined, 3);
  const minDiff = norm.min(2);

  const inputs = {
    input_1: minDiff,
  };

  const inference = classifier.predict(inputs, {
    verbose: IS_INFERENCE_VERBOSE,
  });

  if (IS_INFERENCE_VERBOSE) {
    // eslint-disable-next-line no-console
    console.log(inference);
  }

  return inference.data();
};

export { initializeModel, computeCombinedKeyPoints, computeInference };
