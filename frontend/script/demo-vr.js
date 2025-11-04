import * as THREE from 'three';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/geometries/TextGeometry.js';
import { sendMain } from '../node_modules/@vario-software/vario-app-framework-frontend/script/communication.js';
import { additionalPayload } from '../node_modules/@vario-software/vario-app-framework-frontend/script/parameters.js';

window.addEventListener('DOMContentLoaded', () =>
{
  sendMain({ height: 500 });

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
  camera.position.z = 2;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;

  document.body.appendChild(renderer.domElement);

  const resizeRenderer = () =>
  {
    const width = window.innerWidth;
    const height = document.fullscreenElement ? window.screen.height : window.innerHeight;

    renderer.setSize(width, height);

    renderer.domElement.style.width = `${width}px`;
    renderer.domElement.style.height = `${height}px`;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const sessionInit = { optionalFeatures: ['local-floor', 'bounded-floor'] };

  const openVrBtn = document.getElementById('openvr');

  openVrBtn.addEventListener('click', () =>
  {
    document.documentElement.requestFullscreen().then(() =>
    {
      resizeRenderer();
      return navigator.xr.requestSession('immersive-vr', sessionInit);
    }).then(session =>
    {
      renderer.xr.setSession(session);

      session.addEventListener('end', () =>
      {
        camera.position.set(0, 0, 2);
        camera.rotation.set(0, 0, 0);
        camera.updateProjectionMatrix();

        if (document.fullscreenElement)
        {
          document.exitFullscreen();
        }
      });
    }).catch(err =>
    {
      console.error('Fehler:', err);
    });
  });

  // Digit-Effekt vorbereiten
  const digitsGroup = new THREE.Group();
  scene.add(digitsGroup);

  const digitMeshes = [];
  const digitCount = 300;
  const digitMaterial = new THREE.MeshBasicMaterial({ color: 0x84b933 });

  new FontLoader().load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', font =>
  {
    // Haupttext
    const geometry = new TextGeometry(additionalPayload, { font, size: 0.8, height: 0.1 });
    geometry.computeBoundingBox();
    geometry.center();

    const material = new THREE.MeshBasicMaterial({ color: 0x84b933 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -5;
    scene.add(mesh);

    // Matrix-Ziffern erzeugen
    for (let i = 0; i < digitCount; i++)
    {
      const char = Math.random() > 0.5 ? '1' : '0';

      const digitGeo = new TextGeometry(char, {
        font,
        size: 0.1,
        height: 0.01,
      });
      digitGeo.computeBoundingBox();
      digitGeo.center();

      const digitMesh = new THREE.Mesh(digitGeo, digitMaterial);

      digitMesh.position.set(
        (Math.random() - 0.5) * 10, // X
        Math.random() * 8, // Y
        (Math.random() - 0.5) * 10, // Z
      );

      digitsGroup.add(digitMesh);
      digitMeshes.push(digitMesh);
    }

    renderer.setAnimationLoop(() =>
    {
      mesh.position.y = renderer.xr.isPresenting ? 1.6 : 0;
      mesh.rotation.y += 0.01;

      // Matrix-Zahlen fallen lassen
      digitMeshes.forEach(digit =>
      {
        digit.position.y -= 0.02;

        if (digit.position.y < -2)
        {
          digit.position.y = 6 + Math.random() * 2;
        }
      });

      renderer.render(scene, camera);
    });
  });

  document.addEventListener('fullscreenchange', () =>
  {
    const isFullscreen = !!document.fullscreenElement;
    const session = renderer.xr.getSession();

    if (!isFullscreen && session)
    {
      session.end();
    }
  });

  window.addEventListener('resize', resizeRenderer);
});
