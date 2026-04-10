const archiver = require('archiver');
const { PassThrough } = require('stream');
const { Readable, Transform } = require('stream');
const { pipeline } = require('stream/promises');
const { getApp } = require('@vario-software/vario-app-framework-backend/utils/context.js');
const Api = require('@vario-software/vario-app-framework-backend/api/Api.js');

const DEMO_ACCOUNTS = require('./accounts/accounts.json');
const DEMO_ACTIVITIES = require('./activities/activities.json');
const IMPORT_DEFINITION = require('./definition.js');

// Orchestrates the full import pipeline
async function runDemoImport()
{
  const multiPartImport = await createMultiPartImport();
  const importId = multiPartImport.id;

  const resource = await uploadDemoData(importId);
  await pollUntil(() => isFileAttached(resource.id));

  await createImportRuns(importId);
  await pollUntil(() => isDataExtracted(importId));

  await executeImport(importId);

  return {
    multiPartImportId: importId,
    label: multiPartImport.label,
  };
}

async function createMultiPartImport()
{
  const { data } = await getApp().erp.fetch('/cmn/data-import/runs/multi-part', {
    method: 'POST',
    body: JSON.stringify(IMPORT_DEFINITION()),
  });

  return data;
}

async function createImportRuns(importId)
{
  await getApp().erp.fetch(
    `/cmn/data-import/runs/multi-part/${importId}/create-import-runs`,
    { method: 'POST' },
  );
}

async function executeImport(importId)
{
  await getApp().erp.fetch(
    `/cmn/data-import/runs/multi-part/${importId}/run`,
    { method: 'PUT' },
  );
}

async function isFileAttached(resourceId)
{
  const { data } = await getApp().erp.fetch(`/dms/resources/${resourceId}`);
  return data.state === 'FILE_ATTACHED';
}

async function isDataExtracted(importId)
{
  const { data } = await getApp().erp.fetch(
    `/cmn/data-import/runs/multi-part/${importId}`,
  );

  return data.orderedRuleSets.every(rs => rs.importRun?.state === 'DATA_EXTRACTED');
}

/*
  End-to-end streaming with bounded memory:
  pushChunk -> PassThrough -> archiver (ZIP) -> uploadBuffer (20 MB chunks) -> DMS
  When a buffer is full, pushChunk waits for drain before writing more.
  This keeps memory constant regardless of data volume.
*/
async function uploadDemoData(importId)
{
  const { data: resource } = await getApp().erp.fetch('/dms/resources', {
    method: 'POST',
    body: JSON.stringify({
      shelfDocument: {
        entryDate: new Date().toISOString(),
        type: { id: '1' },
        description: 'Demo import',
      },
      attributions: [{
        purpose: 'IMPORT_SOURCE',
        refType: 'MULTI_PART_IMPORT_RUN',
        refId: importId,
      }],
    }),
  });

  const { data: transfer } = await getApp().erp.fetch(
    `/dms/resources/${resource.id}/file-transfer`,
    { method: 'POST', body: JSON.stringify({ fileName: 'demo.zip' }) },
  );

  const CHUNK_SIZE = 20 * 1024 * 1024;
  let part = 0;
  let buffer = Buffer.alloc(0);

  async function uploadChunk(buf)
  {
    part += 1;

    const { data: link } = await getApp().erp.fetch(
      `/dms/resources/${resource.id}/file-transfer/${transfer.token}/${part}`,
      { method: 'POST' },
    );

    const request = new Api(link.uploadUri, {
      inputStream: Readable.from(buf),
      method: 'PUT',
      headers: { 'Content-Type': null },
    });
    await request.execute();

    const { etag } = request.getResponseHeaders();
    await getApp().erp.fetch(
      `/dms/resources/${resource.id}/file-transfer/${transfer.token}/${part}`,
      { method: 'PUT', body: JSON.stringify({ uploadEtag: etag }) },
    );
  }

  const uploadBuffer = new Transform({
    async transform(chunk, _enc, cb)
    {
      buffer = Buffer.concat([buffer, chunk]);
      while (buffer.length >= CHUNK_SIZE)
      {
        await uploadChunk(buffer.subarray(0, CHUNK_SIZE));
        buffer = buffer.subarray(CHUNK_SIZE);
      }
      cb();
    },
    async flush(cb)
    {
      if (buffer.length) await uploadChunk(buffer);
      cb();
    },
  });

  const archive = createZipStreamer(['accounts.json', 'activities.json']);
  const uploading = pipeline(archive.zip, uploadBuffer);

  await archive.pushChunk('accounts.json', JSON.stringify(DEMO_ACCOUNTS));
  archive.closeFile('accounts.json');

  await archive.pushChunk('activities.json', JSON.stringify(DEMO_ACTIVITIES));
  archive.closeFile('activities.json');

  archive.finalize();

  await uploading;

  await getApp().erp.fetch(
    `/dms/resources/${resource.id}/file-transfer/${transfer.token}/finish`,
    { method: 'POST', body: JSON.stringify({ partCount: part }) },
  );

  return resource;
}

async function pollUntil(checkFn, timeoutMs = 60000, intervalMs = 1000)
{
  const start = Date.now();

  while (Date.now() - start < timeoutMs)
  {
    if (await checkFn()) return;
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error('Poll timed out');
}

function createZipStreamer(fileNames)
{
  const zip = archiver('zip', { zlib: { level: 9 } });
  const files = new Map();

  fileNames.forEach(name =>
  {
    const stream = new PassThrough();
    zip.append(stream, { name });
    files.set(name, stream);
  });

  return {
    zip,

    async pushChunk(fileName, data)
    {
      const stream = files.get(fileName);
      if (!stream) return;

      if (!stream.write(data))
      {
        await new Promise(resolve => stream.once('drain', resolve));
      }
    },

    closeFile(fileName)
    {
      const stream = files.get(fileName);
      if (!stream) return;

      stream.end();
      files.delete(fileName);
    },

    finalize()
    {
      files.forEach(stream => stream.end());
      files.clear();
      zip.finalize();
    },
  };
}

module.exports = runDemoImport;
