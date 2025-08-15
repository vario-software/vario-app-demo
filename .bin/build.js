const { existsSync, cpSync, writeFileSync, rmSync } = require('fs');
const path = require('path');
const packageJson = require('../package.json');

const dist = path.resolve(__dirname, '../.dist');

if (existsSync(dist))
{
  rmSync(dist, { recursive: true, force: true });
}

cpSync(path.resolve(__dirname, '../node_modules'), path.resolve(dist, './node_modules'), { recursive: true });
cpSync(path.resolve(__dirname, '../backend'), path.resolve(dist, './backend'), { recursive: true });
cpSync(path.resolve(__dirname, '../frontend'), path.resolve(dist, './frontend'), { recursive: true });
cpSync(path.resolve(__dirname, '../app-client.json'), path.resolve(dist, './app-client.json'), { recursive: true });
cpSync(path.resolve(__dirname, '../app-manifest.json'), path.resolve(dist, './app-manifest.json'), { recursive: true });

delete packageJson.repository;
delete packageJson.scripts;
delete packageJson.devDependencies;
delete packageJson.publishConfig;

writeFileSync(path.resolve(dist, './package.json'), JSON.stringify(packageJson, null, 2));
