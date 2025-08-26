import appScript from 'app_scripting_proxy';

appScript.setProcess(ctx =>
{
  const { utils } = ctx.services;
  const vql = ctx.services.vqlService;

  const activity = ctx.jsonData;

  const acitivityTypes = vql.queryAll(`
        SELECT id, label
        FROM crm.activity-types
        WHERE active = 'true'
        ORDER BY sortOrder asc
        LIMIT 1
      `);

  activity.type.id = String(acitivityTypes[0].id);

  const suffix = ' (scripted)';

  activity.comment += suffix;

  return activity;
});
