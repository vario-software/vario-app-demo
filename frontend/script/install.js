import { getAppToken } from '../node_modules/@vario-app-framework/frontend/script/token.js';

window.addEventListener('DOMContentLoaded', () =>
{
  const url = new URL(window.location.href);

  const offlineToken = url.searchParams.get('offlineToken');

  const iconClasses = document.querySelector('.v-icon').classList;
  const label = document.querySelector('#label');

  fetch('/api/install', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAppToken()}`,
    },
    body: JSON.stringify({ offlineToken }),
  })
    .then(response =>
    {
      if (response.status === 200)
      {
        iconClasses.remove('fa-spinner-third', 'fa-spin');
        iconClasses.add('fa-circle-check');
        label.innerText = 'App successfully installed';
      }
      else
      {
        iconClasses.remove('fa-spinner-third', 'fa-spin');
        iconClasses.add('fa-circle-xmark');
        label.innerText = 'Error during install';
      }
    })
    .catch(() =>
    {
      iconClasses.remove('fa-spinner-third', 'fa-spin');
      iconClasses.add('fa-circle-xmark');
      label.innerText = 'Error during install';
    });
});
