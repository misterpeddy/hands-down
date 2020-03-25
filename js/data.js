let handPointList = [];
let facePointList = [];
let labelList = [];
let collectedData = {
  'facePointList': facePointList,
  'handPointList': handPointList,
  'labelList': labelList
};

/*
 * Stages the given features and label in in-memory data 
 * structures; intended to be called many times, 
 * preeceding a call to save().
 */
function collectFeatures(facePoints, handPoints, label) {
  facePointList.push(facePoints);
  handPointList.push(handPoints);
  labelList.push(label);
  console.log("List at size: " + labelList.length);
}

/*
 * Downloads the collected data as a JSON file.
 */
function exportData(){
  const filename = 'data.json';

  const data = JSON.stringify(collectedData, undefined, 4)

  const blob = new Blob([data], {type: 'text/json'}),
    e = document.createEvent('MouseEvents'),
    a = document.createElement('a')

  a.download = filename
  a.href = window.URL.createObjectURL(blob)
  a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
  e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  a.dispatchEvent(e)
}

// alias to console.save for easy saving from console
(function(console){
  console.save = exportData;
})(console)

export {collectFeatures, exportData}
