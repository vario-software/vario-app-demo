const fs = require('fs');
const path = require('path');

const accountScript = fs.readFileSync(path.join(__dirname, 'accounts/accounts.app-script.js'), 'utf-8');
const activityScript = fs.readFileSync(path.join(__dirname, 'activities/activities.app-script.js'), 'utf-8');

module.exports = () => ({
  label: `Demo-Import-${Date.now()}`,
  template: false,
  orderedRuleSets: [
    {
      step: 1,
      fileName: 'accounts.json',
      label: 'accounts',
      ruleSet: {
        mode: 'SCRIPT',
        dataFrom: '1',
        charSet: 'AUTO_DETECT',
        script: accountScript,
      },
    },
    {
      step: 2,
      fileName: 'activities.json',
      label: 'activities',
      ruleSet: {
        mode: 'SCRIPT',
        dataFrom: '1',
        charSet: 'AUTO_DETECT',
        script: activityScript,
      },
    },
  ],
});
