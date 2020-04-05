/* eslint-disable no-undef */
// TODO(peddy): Fix the CORS issue on 302 redirect and use canonical model URL
// const MODEL_URL = "http://models.peddy.ai/covid.js/05-03-20-0/model.json"

// The URL appears to be incorrect, it leads to a 404
const MODEL_URL =
  'https://storage.googleapis.com/peddy-ai-models/covid.js/31-03-20-0/model.json';
const MODEL_LOCAL_PATH = 'models/31-03-20-0/model.json';

const BACKEND = 'webgl';
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
async function initializeModel() {
  await tf.setBackend(BACKEND);

  function completeInit(models) {
    if (models.length !== 3) {
      throw Error(
        `Expected to initialize 3 models but received ${models.length}`
      );
    }

    [faceMesh, handPose, classifier] = models;

    // eslint-disable-next-line no-console
    console.log(`${tf.getBackend()} tf.js backend initialized`);

    initialized = true;
  }

  const modelPromises = [
    facemesh.load({ maxFaces: 1 }),
    handpose.load(),
    tf
      .loadGraphModel(MODEL_URL, { mode: 'cors' })
      .catch(() => tf.loadGraphModel(MODEL_LOCAL_PATH)),
  ];

  return Promise.all(modelPromises).then((models) => completeInit(models));
}

/*
 * Throws error if  init() has not previously been called.
 */
function validateInit() {
  if (!initialized) {
    throw Error(
      'Attempted to use a function from models Module before initialization'
    );
  }
}

/*
 * Given a video stream, returns a promise wrapping
 * the estimated keypoints of a single face and a
 * single hand present in the current frame.
 */
async function computeCombinedKeyPoints(video) {
  validateInit();
  if (video === undefined) {
    throw Error('Cannot compute key points for undefined video stream');
  }

  return Promise.all([
    faceMesh.estimateFaces(video),
    handPose.estimateHands(video),
  ]);
}

/*
 * Given the face and hand keypoints extracted from an image,
 * returns a promise for there inference result (probability
 * that the hand is touching the face).
 */
function computeInference(faceKeyPoints, handKeyPoints) {
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
}

export { initializeModel, computeCombinedKeyPoints, computeInference };
