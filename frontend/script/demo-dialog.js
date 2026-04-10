import { sendMain } from '../node_modules/@vario-software/vario-app-framework-frontend/script/communication.js';

window.addEventListener('DOMContentLoaded', () =>
{
  document.querySelector('.v-button#close').addEventListener('click', () => sendMain({
    dialog: {
      close: true,
    },
  }));
});
