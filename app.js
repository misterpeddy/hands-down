const express = require('express');
const reload = require('reload');
const { info, error } = require('nclr/symbols');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 8080;
const MODELS_DIR = 'models';
const MODELS_MOUNT_PATH = '/models';
const DEV_PATH = path.join(`${__dirname}/public/dev.html`);
const INDEX_PATH = 'index.html';
const PUBLIC_DIR = 'public';

app.use(express.static(PUBLIC_DIR));
app.use(MODELS_MOUNT_PATH, express.static(MODELS_DIR));

app.get('/dev', (_, res) => res.sendFile(DEV_PATH));
app.get('/', (_, res) => res.sendFile(INDEX_PATH));

reload(app)
  .then(() => {
    app.listen(PORT, () => info(`Listening on port ${PORT}`));
  })
  .catch((err) => error('Reload error:', err));
