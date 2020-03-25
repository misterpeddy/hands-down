// TODO(peddy): Fix the CORS issue on 302 redirect and use canonical model URL
// const MODEL_URL = "http://models.peddy.ai/covid.js/05-03-20-0/model.json"
const MODEL_URL = "https://storage.googleapis.com/peddy-ai-models/covid.js/05-03-20-0/model.json"
const MODEL_LOCAL_PATH = "models/05-03-20-0/model.json"

// TODO(peddy): Check and set BACKEND to the most performant option with available hardware 
const BACKEND = 'wasm';
const BACKEND_FALLBACK = 'cpu';
const IS_INFERENCE_VERBOSE = true;

let faceMesh, handPose, classifier, initialized;

/*
 * Must be called before any other functions in module.
 * First tries to load most performant TF backend.
 * Initializes the Facemesh and Handpose models, fetches
 * and loads the frozen classifer into memory, all in parallel.
 */
async function initialize() {
  try {
    await tf.setBackend(BACKEND);
  } catch(err) {
    console.log(BACKEND + " could not be initialized - fallbacking to CPU: " + err);
    await tf.setBackend(BACKEND_FALLBACK);
  }

  function completeInit(models) {
    if (models.length != 3)
      throw "Expected to initialize 3 models but received " + models.length;

    faceMesh = models[0];
    handPose = models[1];
    classifier = models[2];

    initialized = true;
  }

  const modelPromises = [
    facemesh.load({maxFaces: 1}),
    handpose.load(),
    tf.loadGraphModel(MODEL_URL, {mode: 'cors'})
    .catch(()=>{tf.loadGraphModel(MODEL_LOCAL_PATH)})
  ];

  return Promise.all(modelPromises)
    .then((models) => completeInit(models));
}

/*
 * Throws error if  init() has not previously been called.
 */
function validateInit() {
  if (!initialized)
    throw "Attempted to use a function from models Module before initialization";
}

/*
 * Given a video stream, returns a promise wrapping
 * the estimated keypoints of a single face and a
 * single hand present in the current frame.
 */
async function computeCombinedKeyPoints(video) {
  validateInit();
  if (video == undefined)
    throw "Cannot compute key points for undefined video stream";

  return Promise.all([
    faceMesh.estimateFaces(video),
    handPose.estimateHands(video)
  ]);
}

/*
 * Given the face and hand keypoints extracted from an image,
 * returns whether the classifier infers hand is touching
 * the face.
 */
function computeInference(faceKeyPoints, handKeyPoints) {
  validateInit();
  if (faceKeyPoints == undefined || handKeyPoints == undefined)
    return undefined;

  const fp = tf.tensor(faceKeyPoints).expandDims(0);
  const hp = tf.tensor(handKeyPoints).expandDims(0); 
  const inputs = {
    'face_tower_input': fp,
    'hand_tower_input': hp
  };
  
  const inference = classifier.predict(inputs, {verbose: IS_INFERENCE_VERBOSE});

  if (IS_INFERENCE_VERBOSE) {
    console.log("Inference output: ", inference);
    console.log(": ", inference.data);
  }

  return inference;
}

export {initialize, computeCombinedKeyPoints, computeInference}
