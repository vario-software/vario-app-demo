function setup(app)
{
  app.apiServer.post('/webhooks/crm-activity.create', async (req, res) =>
{
    res.status(200).send({ success: true });

    const { id } = req.body;

    const { data: activity } = await app.erp.fetch(`/erp/crm-activities/${id}`);

    activity.custom.demoapp.reference = String(Math.floor(Math.random() * 100000));

    await app.erp.fetch(`/erp/crm-activities/${id}`, {
        method: 'PUT',
        body: JSON.stringify(activity),
      });
  });
}

module.exports = setup;
