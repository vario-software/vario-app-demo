const path = require('path');
const install = require('#backend/services/maintenance/install/install.js');
const uninstall = require('#backend/services/maintenance/uninstall.js');

function setup(app)
{
  app.express.get('/manifest', async (req, res) =>
  {
    res.type('application/json');

    res.sendFile(path.join(process.cwd(), 'app-manifest.json'));
  });

  app.apiServer.post('/install', async (req, res) =>
  {
    await install();

    res.status(200).end();
  });

  app.apiServer.post('/uninstall', async (req, res) =>
  {
    await uninstall();

    res.status(200).end();
  });
}

module.exports = setup;
