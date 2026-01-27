const fs = require('fs');
const path = require('path');
const { getApp, getRequest, getTenant } = require('@vario-software/vario-app-framework-backend/utils/context');
const MigratorErp = require('@vario-software/vario-app-framework-backend/utils/migrator.js');
const eavGroupDemoapp = require('./static/erp/eav-groups/demoapp.json');

const handle = async function()
{

  const migratorErp = new MigratorErp('migration1');

  await migratorErp.setMigration('createEavStructure', createEavStructure);
  await migratorErp.setMigration('createWebhook', createWebhook);
  await migratorErp.always('updateScript', updateScript);
};

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

async function updateScript(methods)
{
  const script = fs.readFileSync(path.join(__dirname, 'static/erp/app-scripts/beforeCreateActivity.js'), 'utf-8');

  methods.addAppScriptingTrigger(
    'beforeCreateActivity',
    script,
  );
}

module.exports = handle;
