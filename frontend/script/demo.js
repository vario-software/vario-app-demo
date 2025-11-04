import StickynavEditmode from '../node_modules/@vario-software/vario-app-framework-frontend/script/stickynavEditmode.js';
import StickynavButtons from '../node_modules/@vario-software/vario-app-framework-frontend/script/stickynavButtons.js';
import { getAppToken } from '../node_modules/@vario-software/vario-app-framework-frontend/script/token.js';
import { sendMain, receiveMain } from '../node_modules/@vario-software/vario-app-framework-frontend/script/communication.js';
import { confirm } from '../node_modules/@vario-software/vario-app-framework-frontend/script/interaction.js';
import { myCompanyId, appIdentifier } from '../node_modules/@vario-software/vario-app-framework-frontend/script/parameters.js';
import { hasPermission } from '../node_modules/@vario-software/vario-app-framework-frontend/script/permission.js';

window.addEventListener('DOMContentLoaded', () =>
{
  setupUserAndCompany();

  setupActivityDatagrid();
  setupSaveActivityForm();
  setupActivitySearch();

  setupEditmode();
  setupDemoActionButton();
  setupBacklinkButton();

  setupDialogButton();
  setupNotificationButton();
  setupVrButton();
  setupSimpleConfirmButton();
  setupCustomConfirmButton();
  setupFormularConfirmButton();
  setupNewTabButton();
  setupUpdateButton();
  setupClipboardButton();
  setupFullscreenButton();
  setupClipboardReadButton();
  setupGeolocationButton();
  setupMicrophoneButton();
  setupCameraButton();
  setupScreenShareButton();
  setupShareButton();
  setupSensorTestButton();
});

let me;
let fetchActivities;

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAppToken()}`,
});

async function setupUserAndCompany()
{
  const response = await fetch('/api/me', {
    headers: getAuthHeaders(),
  });

  me = await response.json();

  const user = document.querySelector('#user');
  const company = document.querySelector('#company');

  user.innerText = `👤 ${me.user.username}`;

  company.innerText = `🏢 ${me.company.name1}`;
}

function setupEditmode()
{
  const editmode = new StickynavEditmode();

  editmode.setEditFn(() =>
  {
    sendMain({
      notify: {
        message: 'edit',
        timeout: 1000,
        progress: false,
        group: false,
        icon: 'fal fa-pencil',
      },
    });
  });

  editmode.setSaveFn(() =>
  {
    sendMain({
      notify: {
        message: 'save',
        timeout: 1000,
        progress: false,
        group: false,
        icon: 'fal fa-floppy-disk',
      },
    });
  });

  editmode.setCancelFn(() =>
  {
    sendMain({
      notify: {
        message: 'cancel',
        timeout: 1000,
        progress: false,
        group: false,
        icon: 'fal fa-times',
      },
    });
  });
}

function setupDemoActionButton()
{
  const stickynavButtons = new StickynavButtons();

  stickynavButtons.add({
    key: 'demoaction',
    icon: 'fal fa-stars',
    label: 'Demo Action',
  });

  receiveMain({
    'button-demoaction': () => sendMain({
      notify: {
        message: '🥷 Demo action button clicked',
      },
    }),
  });
}

function setupBacklinkButton()
{
  sendMain({
    backlink: { label: 'Custom Backlink' },
  });

  receiveMain({
    back: () => sendMain({
      notify: {
        message: 'Custom backlink handler triggered (for in-app iframe routing)',
        timeout: 10000,
      },
    }),
  });
}

function setupDialogButton()
{
  document.querySelector('.v-button#dialog').addEventListener('click', () => sendMain({
    dialog: {
      open: {
        integrationId: 'demo-dialog',
        additionalPayload: 'any-payload-for-dialog',
        title: 'Dialogs Title',
      },
    },
  }),
  );
}

function setupNotificationButton()
{
  document.querySelector('.v-button#notification').addEventListener('click', () => sendMain({
    notify: {
      message: '✨ Have fun with this demo',
      timeout: 6000,
      progress: true,
    },
  }),
  );
}

function setupVrButton()
{
  document.querySelector('.v-button#vr').addEventListener('click', () => sendMain({
    dialog: {
      open: {
        integrationId: 'demo-vr',
        additionalPayload: me?.company?.name1,
        title: 'Demo VR',
        fullHeight: true,
      },
    },
  }),
  );
}

function setupSimpleConfirmButton()
{
  document.querySelector('.v-button#simpleconfirm').addEventListener('click', () => confirm('Are you satisfied with it?', confirmed => sendMain({
    notify: {
      type: confirmed ? 'positive' : 'negative',
      message: confirmed ? 'Confirmation issued' : 'Confirmation rejected',
    },
  }),
  ),
  );
}

function setupCustomConfirmButton()
{
  document.querySelector('.v-button#customconfirm').addEventListener('click', () => confirm(
    {
      title: 'Now it is up to you',
      message: 'How would you rate this ERP system?',
      buttons: [
        { label: '📈 Scalable', key: 'scalable' },
        { label: '✅ Reliable', key: 'reliable' },
        { label: '🔀 Flexible', key: 'flexible' },
        { label: '🔒 Secure', key: 'secure' },
      ],
    },
    rating => sendMain({
      notify: {
        message: `Thank you for voting this ERP system as "${rating}".`,
        icon: 'fal fa-thumbs-up',
      },
    }),
  ),
  );
}

function setupFormularConfirmButton()
{
  document.querySelector('.v-button#formularconfirm').addEventListener('click', () => confirm(
    {
      title: 'Tell me your name',
      inputs: [
        {
          type: 'INPUT',
          label: 'Whats your name?',
          key: 'name',
          default: 'John Doe',
        },
      ],
    },
    (confirmed, form) => sendMain({
      notify: {
        type: confirmed ? 'positive' : 'negative',
        message: confirmed ? `Hello ${form.name}` : 'User aborted action',
        icon: confirmed ? 'fal fa-hand-wave' : false,
      },
    }),
  ),
  );
}

function setupNewTabButton()
{
  document.querySelector('.v-button#newtab').addEventListener('click', () => sendMain({
    openInNewTab: {
      name: 'accounts.detail.tabs.masterdata',
      hash: '#address',
      params: { id: myCompanyId },
    },
  }),
  );
}

function setupUpdateButton()
{
  document.querySelector('.v-button#update').addEventListener('click', () => sendMain({
    updateComponents: true,
    notify: {
      message: 'Send update signal to ERP',
    },
  }),
  );

  receiveMain({
    updateComponents: () =>
    {
      sendMain({
        notify: {
          type: 'info',
          message: 'Received update signal from ERP',
        },
      });

      fetchActivities();
    },
  });
}

function setupClipboardButton()
{
  document.querySelector('.v-button#clipboard').addEventListener('click', () => sendMain({
    copyToClipboard: 'Hello World!',
  }),
  );
}

function setupFullscreenButton()
{
  document.querySelector('.v-button#fullscreen').addEventListener('click', () => document.documentElement.requestFullscreen(),
  );
}

function setupClipboardReadButton()
{
  document.querySelector('.v-button#clipboardread').addEventListener('click', () => navigator.clipboard.readText().then(text => sendMain({
    notify: {
      message: `Clipboard content is "${text}"`,
      icon: 'fal fa-book-open',
    },
  }),
  ),
  );
}

function setupGeolocationButton()
{
  document.querySelector('.v-button#geolocation').addEventListener('click', () => navigator.geolocation.getCurrentPosition(pos => sendMain({
    notify: {
      message: `Geolocation is "${pos.coords.latitude}, ${pos.coords.longitude}" and ±${Math.round(
        pos.coords.accuracy,
      )} meters accuracy`,
      timeout: 6000,
    },
  }),
  ),
  );
}

function setupMicrophoneButton()
{
  document.querySelector('.v-button#microphone').addEventListener('click', () => navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(stream =>
    {
      sendMain({
        notify: {
          message: 'Access to microphone ',
          icon: 'fal fa-microphone',
          progress: true,
          timeout: 6000,
        },
      });

      setTimeout(() =>
      {
        stream.getTracks().forEach(track => track.stop());
      }, 7250);
    }),
  );
}

function setupCameraButton()
{
  document.querySelector('.v-button#camera').addEventListener('click', () =>
  {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(async stream =>
      {
        const videoWrapper = document.querySelector('#camera-preview');
        const videoElement = videoWrapper.querySelector('video');

        videoElement.srcObject = stream;

        await videoElement.play(); // Wichtig: Video muss abgespielt werden

        sendMain({
          notify: {
            message: 'Access to camera granted',
            icon: 'fal fa-camera',
            progress: true,
            timeout: 10000,
          },
        });

        videoWrapper.classList.remove('hidden');

        setTimeout(() =>
        {
          stream.getTracks().forEach(track => track.stop());
          videoElement.srcObject = null;
          videoWrapper.classList.add('hidden');
        }, 11250);
      });
  });
}

function setupScreenShareButton()
{
  document.querySelector('.v-button#screen-share').addEventListener('click', async () =>
  {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });

    const videoWrapper = document.querySelector('#camera-preview');
    const videoElement = videoWrapper.querySelector('video');

    videoElement.srcObject = stream;

    await videoElement.play(); // Wichtig: Muss abgespielt werden

    sendMain({
      notify: {
        message: 'Screen sharing started',
        icon: 'fal fa-display',
        progress: true,
        timeout: 10000,
      },
    });

    videoWrapper.classList.remove('hidden');

    setTimeout(() =>
    {
      stream.getTracks().forEach(track => track.stop());
      videoElement.srcObject = null;
      videoWrapper.classList.add('hidden');
    }, 11250);
  });
}

function setupShareButton()
{
  document.querySelector('.v-button#share').addEventListener('click', async () => navigator.share({
    title: 'May the ERP be with you',
    text: 'Look at this!',
    url: 'http://www.vario.ag',
  }),
  );
}

function setupSensorTestButton()
{
  document.querySelector('.v-button#sensor-test').addEventListener('click', async () =>
  {
    if (typeof DeviceMotionEvent?.requestPermission === 'function')
    {
      await DeviceMotionEvent.requestPermission();
    }

    const handler = event =>
    {
      const accelerometer = event.accelerationIncludingGravity;
      const gyroscope = event.rotationRate;

      console.log({ accelerometer, gyroscope });

      sendMain({
        notify: {
          message: 'Sensor data has been written to the console',
          icon: 'fal fa-square-terminal',
        },
      });

      window.removeEventListener('devicemotion', handler);
    };

    window.addEventListener('devicemotion', handler);
  });
}

function setupActivityDatagrid()
{
  fetchActivities = async query =>
  {
    const activitiesUrl = new URL('/api/own-company-activities', window.location.origin);

    if (query)
    {
      activitiesUrl.searchParams.set('keyword', query);
    }

    const res = await fetch(activitiesUrl.toString(), {
      headers: getAuthHeaders(),
    });
    const activitiesList = await res.json();
    const tableBody = document.querySelector('.v-datagrid tbody');

    tableBody.innerHTML = '';

    activitiesList.forEach(item =>
    {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${new Date(item.startDateTime).toLocaleString('en-US')}</td>
          <td>${item.username ?? ''}</td>
          <td>${item.type ?? ''}</td>
          <td>${item.comment?.length > 50 ? `${item.comment.slice(0, 50)}…` : item.comment}</td>
          <td>${item.reference ?? ''}</td>
          <td><div class="v-toggle"><input type="checkbox" ${item.published ? 'checked' : ''}/><label></label></div></td>
        `;
      row.addEventListener('click', () =>
      {
        sendMain({
          openInNewTab: {
            name: 'crm.activities',
            query: { activityId: item.id },
          },
        });
      });
      tableBody.appendChild(row);
    });

    if (!activitiesList.length)
    {
      tableBody.innerHTML = '<td colspan="6" class="text-grey">No data</td>';
    }

    const foot = document.querySelector('.v-datagrid .v-foot');
    foot.innerText = `Rows: ${activitiesList.length}`;
  };

  fetchActivities();

  document.querySelector('.v-link#webhook').addEventListener('click', () => sendMain({
    openInNewTab: {
      name: 'system.apps.detail.webhooks',
      params: { identifier: appIdentifier },
    },
  }));
}

function setupActivitySearch()
{
  const filterInput = document.querySelector('.v-datagrid .v-input input');
  let debounceTimer;

  filterInput.addEventListener('input', () =>
  {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() =>
    {
      const query = filterInput.value.trim();
      fetchActivities(query);
    }, 300);
  });
}

function setupSaveActivityForm()
{
  const activityButton = document.querySelector('.v-button#save-activity');

  if (!hasPermission('add-activity'))
  {
    activityButton.disabled = true;
    activityButton.title = 'No permission';
  }

  activityButton.addEventListener('click', async () =>
  {
    const commentInput = document.querySelector('.v-input#activity input');
    const publishToggle = document.querySelector('.v-toggle#publish input');
    const comment = commentInput?.value.trim() ?? '';
    const published = publishToggle?.checked ?? false;

    await fetch('/api/activity'.toString(), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ comment, published }),
    });

    commentInput.value = '';

    publishToggle.checked = false;

    fetchActivities();
  });

  document.querySelector('.v-link#scripting').addEventListener('click', () => sendMain({
    openInNewTab: {
      name: 'system.apps.detail.scripting',
      params: { identifier: appIdentifier },
    },
  }));

  document.querySelector('.v-link#permission').addEventListener('click', () => sendMain({
    openInNewTab: {
      name: 'settings.general.users.index',
    },
  }));
}
