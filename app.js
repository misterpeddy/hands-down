const express = require('express');
const path = require('path');

const app = express();

const PORT = 8080;
const ASSET_DIR = 'public';
const INDEX_PATH = path.join(__dirname + '/index.html');

app.use(express.static(ASSET_DIR));

app.get('/', (req, res) => res.sendFile(INDEX_PATH));

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
