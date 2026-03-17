import batchAction from 'batch_script';


batchAction.setGuard((ctx) => {

  // Validate import data; throw Error for business rule violation

  return true;
});

batchAction.setAction((ctx) => {
  const { importData, services } = ctx;
  const { logger, accountService, vqlService, dtoFactory } = services;

  let account, operationType;

  const [existingAccount] = vqlService.queryAll(`
    SELECT id
      FROM account.query
     WHERE default_address.name1 = '${importData.name1}'
     LIMIT 1
  `);

  if (existingAccount) {
    account = accountService.readById(existingAccount.id);
    operationType = 'update';
  } else {

    account = accountService.getNewDto();
    account.defaultAddress = dtoFactory.createAccountAddress();
    account.number = '' + Math.floor(100000 + Math.random() * 900000);
    operationType = 'create';
  }

  account.defaultAddress.name1 = importData.name1;
  account.defaultAddress.street = importData.street;
  account.defaultAddress.postcode = importData.postcode;
  account.defaultAddress.city = importData.city;
  account.defaultAddress.countryCode = importData.countryCode;

  accountService[operationType](account);

  logger.info('Account ' + operationType + 'd: ' + importData.name1);
  
  return true;
});
