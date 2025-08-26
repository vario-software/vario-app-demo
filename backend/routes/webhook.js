function setup(app)
{
  app.apiServer.post('/webhooks/crm-activity.create', async (req, res) =>
  {
    res.status(200).send({ success: true });

    const { activityId } = req.body;

    const { data: activity } = await app.erp.fetch(`/erp/crm-activities/${activityId}`, {
      useInternalApi: true,
    });

    activity.custom.demoapp.reference = Math.floor(Math.random() * 100000);

    await app.erp.fetch(`/erp/crm-activities/${activityId}`, {
      method: 'POST',
      useInternalApi: true,
      body: JSON.stringify(activity),
    }).then(({ data }) =>
    {
      res.send(data).end();
    });
  });
}

module.exports = setup;
