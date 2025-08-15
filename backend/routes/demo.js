const { getExternalUserId } = require('@vario-app-framework/backend/utils/context.js');
const { checkPermission } = require('@vario-app-framework/backend/utils/permission');

function setup(app)
{
  app.apiServer.get('/me', async () =>
  {
    app.erp.gateway('/cmn/users/me', {
      useInternalApi: true,
    });
  });

  app.apiServer.post('/activity', async (req, res) =>
  {
    await checkPermission('add-activity');

    const activity = {
      comment: req.body.comment,
      published: req.body.published,
      billingType: 'INTERNAL',
      type: {},
      accountRef: { id: '1389132653974581248' },
      userRef: { id: getExternalUserId() },
      custom: { demoapp: { reference: '' } },
    };

    const { data: activityAfterScripting } = await app.erp.fetch(
      `/community/latest/cmn/system/app-scripting-proxy/${app.client.appIdentifier}/beforeCreateActivity`,
      {
        useInternalApi: true,
        method: 'POST',
        body: JSON.stringify(activity),
      });

    await app.erp.fetch('/erp/crm-activities', {
      method: 'POST',
      useInternalApi: true,
      body: activityAfterScripting,
    }).then(({ data }) =>
    {
      res.send(data).end();
    });
  });

  app.apiServer.get('/own-company-activities', async (req, res) =>
  {
    const { data: activities } = await app.erp.vql({
      statement: `
        SELECT 
          id,
          --v:result{displayname='startDateTime'}
          startDateTime,
          --v:result{displayname='username'}
          user.username,
          --v:result{displayname='type'}
          type.label,
          --v:result{displayname='comment'}
          comment,
          --v:result{displayname='published'}
          published,
          --v:result{displayname='reference'}
          custom.demoapp.reference
        FROM crm.activities
      ${req.query.keyword ? `
        WHERE comment LIKE '%${req.query.keyword}%'
      ` : ''}
        ORDER BY startDateTime desc
        LIMIT 20
        `,
    });

    res.send(activities).end();
  });
}

module.exports = setup;
