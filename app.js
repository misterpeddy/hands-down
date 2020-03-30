const express = require('express');
const path = require('path');
const reload = require('reload');

const app = express();

const PORT = process.env.PORT || 8080;
const MODELS_DIR = 'models';
const MODELS_MOUNT_PATH = '/models';
const INDEX_PATH = 'index.html';
const PUBLIC_DIR = 'public';

app.use(express.static(PUBLIC_DIR));
app.use(MODELS_MOUNT_PATH, express.static(MODELS_DIR));

app.get('/', (req, res) => res.sendFile(INDEX_PATH));

reload(app)
  .then(() => {
    // eslint-disable-next-line no-console
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  })
  // eslint-disable-next-line no-console
  .catch((err) => console.error('Reload error:', err));
