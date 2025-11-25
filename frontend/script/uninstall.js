import { getAppToken } from '../node_modules/@vario-software/vario-app-framework-frontend/script/token.js';
import { uninstall } from '../node_modules/@vario-software/vario-app-framework-frontend/script/uninstall.js';

window.addEventListener('DOMContentLoaded', () => 
  {
  const iconClasses = document.querySelector('.v-icon').classList;
  const label = document.querySelector('#label');

  fetch('/api/uninstall', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAppToken()}`,
    },
  })
    .then(response => 
      {
      if (response.status === 200) {
        uninstall()
          .then(() => 
          {
            iconClasses.remove('fa-spinner-third', 'fa-spin');
            iconClasses.add('fa-circle-check');
            label.innerText = 'App successfully uninstalled';
          })
          .catch(() => 
          {
            iconClasses.remove('fa-spinner-third', 'fa-spin');
            iconClasses.add('fa-circle-xmark');
            label.innerText = 'Error during uninstall';
          });
      } 
      else 
      {
        iconClasses.remove('fa-spinner-third', 'fa-spin');
        iconClasses.add('fa-circle-xmark');
        label.innerText = 'Error during uninstall';
      }
    })
    .catch(() => 
      {
      iconClasses.remove('fa-spinner-third', 'fa-spin');
      iconClasses.add('fa-circle-xmark');
      label.innerText = 'Error during uninstall';
    });
});
