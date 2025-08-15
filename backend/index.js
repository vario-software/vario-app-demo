const path = require('path');
const VarioCloudApp = require('@vario-app-framework/backend/app.js');
const ErpApi = require('@vario-app-framework/backend/api/ErpApi');
const setupMaintenanceRoutes = require('#backend/routes/maintenance.js');
const setupDemoRoutes = require('#backend/routes/demo.js');
const setupWebhookRoutes = require('#backend/routes/webhook.js');

const client = require('../app-client.json');

const app = new VarioCloudApp(client);

app.port = 443;

app.uiPath = path.resolve(__dirname, '../frontend');

setupMaintenanceRoutes(app);
setupDemoRoutes(app);
setupWebhookRoutes(app);

app.offlineToken.init()
  .then(() =>
  {
    app.start();
  });
