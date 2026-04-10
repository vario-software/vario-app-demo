const { getApp, getTenant } = require('@vario-software/vario-app-framework-backend/utils/context');

const uninstall = async function()
{
  const tenant = getTenant();

  const app = getApp();

  app.offlineToken.delete(tenant)
    .then(() => true)
    .catch(() =>
    {
      throw new Error('ERROR_WHILE_TOKEN_DELETION');
    });
};

module.exports = uninstall;
