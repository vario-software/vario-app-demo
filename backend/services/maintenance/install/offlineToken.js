const { getApp, getTenant, getRequest } = require('@vario-software/vario-app-framework-backend/utils/context');

async function saveOfflineToken()
{
  const req = getRequest();
  const app = getApp();
  const tenant = getTenant();

  const { offlineToken } = req.body;
  
  if (offlineToken)
  {
    await app.offlineToken.set(tenant, offlineToken);
  }

  try
  {
    await app.offlineToken.get(tenant);
  }
  catch
  {
    throw new Error('MISSING_OFFLINE_TOKEN');
  }
}

module.exports = saveOfflineToken;
