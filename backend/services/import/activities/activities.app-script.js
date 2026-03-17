import batchAction from 'batch_script';

batchAction.setGuard((ctx) => {

  // Validate import data; throw Error for business rule violation

  return true;
});

batchAction.setAction((ctx) => {
  const { importData, services } = ctx;
  const { logger, crmActivityService, vqlService, utils } = services;

  const [account] = vqlService.queryAll(`
    SELECT id
      FROM account.query
     WHERE default_address.name1 = '${importData.accountName}'
     LIMIT 1
  `);

  if (!account) {
    throw new Error('Account not found: ' + importData.accountName);
  }

  let activity, operationType;

  const [existingActivity] = vqlService.queryAll(`
    SELECT id
      FROM crm.activities
     WHERE comment = '${importData.comment}'
       AND relations.account.id = '${account.id}'
     LIMIT 1
  `);

  if (existingActivity) {
    activity = crmActivityService.readById(existingActivity.id);
    operationType = 'update';
  } else {
    activity = crmActivityService.getNewDto();
    operationType = 'create';
  }

  activity.comment = importData.comment;
  activity.durationInSeconds = importData.durationInSeconds;
  activity.billingType = 'INTERNAL';

  const [acitivityType] = vqlService.queryAll(`
        SELECT id
        FROM crm.activity-types
        WHERE active = 'true'
          AND possibleUsingTypes IN ('ACCOUNT')
        ORDER BY sortOrder asc
        LIMIT 1
      `);

  activity.type = crmActivityService.findTypeById(acitivityType.id);
  activity.accountRef = utils.toApiReference(account.id);

  crmActivityService[operationType](activity);

  logger.info('Activity ' + operationType + 'd: ' + importData.comment);
  return true;
});
