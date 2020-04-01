const express = require('express');
const reload = require('reload');
const { info, error } = require('nclr/symbols');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 8080;
const MODELS_DIR = 'models';
const MODELS_MOUNT_PATH = '/models';
const INDEX_PATH = 'index.html';
const USER_PATH = path.join(`${__dirname}/public/user.html`);
const PUBLIC_DIR = 'public';

app.use(express.static(PUBLIC_DIR));
app.use(MODELS_MOUNT_PATH, express.static(MODELS_DIR));

// TODO Change the '/' to '/dev' or '/collection' for index.html (to be renamed to dev.html)
app.get('/', (_, res) => res.sendFile(INDEX_PATH));
// TODO Change the '/user' to '/' for user.html (to be renamed to index.html)
app.get('/user', (_, res) => res.sendFile(USER_PATH));

reload(app)
  .then(() => {
    app.listen(PORT, () => info(`Listening on port ${PORT}`));
  })
  .catch((err) => error('Reload error:', err));
