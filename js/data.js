// eslint-disable-next-line import/extensions
import { updateCollectionText } from './ui.js';

const collectedData = {
  facePointList: [],
  handPointList: [],
  labelList: [],
};

/*
 * Stages the given features and label in in-memory data
 * structures; intended to be called many times,
 * preeceding a call to save().
 * Returns the number of items staged so far.
 */
function collectFeatures(facePoints, handPoints, label) {
  collectedData.facePointList.push(facePoints);
  collectedData.handPointList.push(handPoints);
  collectedData.labelList.push(label);
  return collectedData.labelList.length;
}

/*
 * Downloads the collected data as a JSON file and resets
 * the staging buffers (collectedData).
 */
function exportData() {
  const filename = 'data.json';

  const data = JSON.stringify(collectedData, undefined, 4);

  const blob = new Blob([data], { type: 'text/json' });
  const e = document.createEvent('MouseEvents');
  const a = document.createElement('a');

  a.download = filename;
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
  e.initMouseEvent(
    'click',
    true,
    false,
    window,
    0,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null
  );
  a.dispatchEvent(e);

  Object.keys(collectedData).forEach((key) => {
    collectedData[key] = [];
  });
  updateCollectionText(0);
}

// alias to console.save for easy saving from console
(function log(console) {
  // eslint-disable-next-line no-param-reassign
  console.save = exportData;
})(console);

export { collectFeatures, exportData };
