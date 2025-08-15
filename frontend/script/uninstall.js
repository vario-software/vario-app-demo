import { getAppToken } from '../node_modules/@vario-app-framework/frontend/script/token.js';

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
      if (response.status === 200)
      {
        iconClasses.remove('fa-spinner-third', 'fa-spin');
        iconClasses.add('fa-circle-check');
        label.innerText = 'App successfully uninstalled';
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
