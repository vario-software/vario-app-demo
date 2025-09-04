import appScript from 'app_scripting_proxy';

appScript.setProcess((ctx, jsonData) =>
{
  const { logger, vqlService } = ctx.services;

  const activity = jsonData;

  const acitivityTypes = vqlService.queryAll(`
        SELECT id, label
        FROM crm.activity-types
        WHERE active = 'true'
        ORDER BY sortOrder asc
        LIMIT 1
      `);

  logger.info(acitivityTypes);

  activity.type = { id: String(acitivityTypes[0].id) };

  const suffix = ' (scripted)';

  activity.comment += suffix;

  return activity;
});
