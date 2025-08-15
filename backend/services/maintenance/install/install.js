const migration1 = require('./migrations/1/index.js');

const install = async function()
{
  await migration1();
};

module.exports = install;
