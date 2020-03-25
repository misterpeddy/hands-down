const express = require('express');
const path = require('path');

const app = express();

const PORT = 8080;
const JS_DIR = 'js';
const JS_MOUNT_PATH = '/js';
const MODELS_DIR = 'models';
const MODELS_MOUNT_PATH = '/models';
const INDEX_PATH = path.join(__dirname + '/index.html');

app.use(JS_MOUNT_PATH, express.static(JS_DIR));
app.use(MODELS_MOUNT_PATH, express.static(MODELS_DIR));

app.get('/', (req, res) => res.sendFile(INDEX_PATH));

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
