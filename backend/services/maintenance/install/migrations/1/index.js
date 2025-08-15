const fs = require('fs');
const path = require('path');
const { getApp, getRequest, getTenant } = require('@vario-app-framework/backend/utils/context');
const MigratorErp = require('@vario-app-framework/backend/utils/migrator.js');
const eavGroupDemoapp = require('./static/erp/eav-groups/demoapp.json');

const handle = async function()
{
  const migratorErp = new MigratorErp('migration1');

  await migratorErp.setMigration('saveOfflineToken', saveOfflineToken);
  await migratorErp.setMigration('createEavStructure', createEavStructure);
  await migratorErp.setMigration('createWebhook', createWebhook);
  await migratorErp.setMigration('createScript', createScript);
};

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

async function createEavStructure(methods)
{
  methods.createEavGroup(eavGroupDemoapp);
}

async function createWebhook(methods)
{
  // Todo: process.env.WEBHOOK_HOST muss geändert werden
  // methods.registerWebhook(
  //   'crm-activity.create',
  //   `https://${getRequest().get('host')}/api/webhooks/crm-activity.create`,
  // );
}

async function createScript(methods)
{
  const script = fs.readFileSync(path.join(__dirname, 'static/erp/app-scripts/beforeCreateActivity.js'), 'utf-8');

  methods.addAppScriptingTrigger(
    'beforeCreateActivity',
    script,
  );
}

module.exports = handle;
