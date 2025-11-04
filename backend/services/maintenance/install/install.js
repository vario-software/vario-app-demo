const migration1 = require('./migrations/1/index.js');
const saveOfflineToken = require('#backend/services/maintenance/install/offlineToken.js');

const install = async function()
{
  await saveOfflineToken();

  await migration1();
};

module.exports = install;
