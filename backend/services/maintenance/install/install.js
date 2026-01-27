const migration1 = require('./migrations/1/index.js');
const saveOfflineToken = require('#backend/services/maintenance/install/offlineToken.js');
const runAsAppUser = require('@vario-software/vario-app-framework-backend/setup/runAsAppUser');

const install = async function()
{
  await runAsAppUser();

  await saveOfflineToken();

  await migration1();
};

module.exports = install;
