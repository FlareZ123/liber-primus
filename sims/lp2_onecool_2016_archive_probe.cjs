'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const DRIVE_ID = '0BzOKQofOkvB3YmR1cjJCZGNCdXM';
const IMGUR_IDS = ['asLy62L', 'wZVmpq9', 'UasnRcL', 'RQANPSJ', 'RHV0bYJ'];
const outDir = path.join('workplace', 'onecool-2016-archive-probe');
fs.mkdirSync(outDir, { recursive: true });

/** @param {string} url @param {number} ms */
async function fetchWithTimeout(url, ms = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'liber-primus-research/1.0 (+https://github.com/FlareZ123/liber-primus)',
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/** @param {string} url */
async function cdx(url) {
  const endpoint = new URL('https://web.archive.org/cdx/search/cdx');
  endpoint.searchParams.set('url', url);
  endpoint.searchParams.set('output', 'json');
  endpoint.searchParams.set('fl', 'timestamp,original,statuscode,mimetype,digest,length');
  endpoint.searchParams.set('filter', 'statuscode:200');
  endpoint.searchParams.set('collapse', 'digest');
  endpoint.searchParams.set('from', '2014');
  endpoint.searchParams.set('to', '2020');
  const res = await fetchWithTimeout(endpoint.href, 15000);
  const text = await res.text();
  if (!res.ok) throw new Error(`CDX ${res.status} ${endpoint.href}: ${text.slice(0,200)}`);
  const rows = JSON.parse(text);
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const header = rows[0];
  return rows.slice(1).map((row) => Object.fromEntries(header.map((key, index) => [key, row[index]])));
}

/** @param {string} label @param {string} pattern */
async function probe(label, pattern) {
  try {
    const rows = await cdx(pattern);
    console.log(JSON.stringify({ label, pattern, hits: rows.length, rows }));
    return { label, pattern, rows };
  } catch (error) {
    console.log(JSON.stringify({ label, pattern, error: String(error) }));
    return { label, pattern, error: String(error), rows: [] };
  }
}


/** @param {string} label @param {string} url */
async function directRecover(label, url) {
  try {
    const res = await fetchWithTimeout(url, 15000);
    const body = Buffer.from(await res.arrayBuffer());
    const sha256 = crypto.createHash('sha256').update(body).digest('hex');
    const meta = {
      label,
      url,
      finalUrl: res.url,
      status: res.status,
      contentType: res.headers.get('content-type'),
      bytes: body.length,
      sha256,
    };
    console.log(JSON.stringify({ direct: meta }));
    if (res.ok && body.length > 0 && body.length <= 10_000_000) {
      const type = meta.contentType || '';
      const ext = type.includes('image/png') ? '.png'
        : type.includes('image/jpeg') ? '.jpg'
        : type.includes('text/html') ? '.html'
        : '.bin';
      fs.writeFileSync(path.join(outDir, `direct_${safeName(label)}${ext}`), body);
      fs.writeFileSync(path.join(outDir, `direct_${safeName(label)}.json`), JSON.stringify(meta, null, 2));
    }
    return meta;
  } catch (error) {
    const meta = { label, url, error: String(error) };
    console.log(JSON.stringify({ directError: meta }));
    return meta;
  }
}

/** @param {string} text */
function safeName(text) {
  return text.replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 120);
}

/** @param {{timestamp:string,original:string,mimetype:string,digest:string,length:string}} row @param {string} label */
async function recover(row, label) {
  const archiveUrl = `https://web.archive.org/web/${row.timestamp}id_/${row.original}`;
  try {
    const res = await fetchWithTimeout(archiveUrl, 20000);
    const body = Buffer.from(await res.arrayBuffer());
    const sha256 = crypto.createHash('sha256').update(body).digest('hex');
    const meta = {
      label,
      timestamp: row.timestamp,
      original: row.original,
      archiveUrl,
      status: res.status,
      contentType: res.headers.get('content-type'),
      bytes: body.length,
      sha256,
    };
    console.log(JSON.stringify({ recovered: meta }));
    if (res.ok && body.length > 0 && body.length <= 10_000_000) {
      const ext = (meta.contentType || '').includes('image/png') ? '.png'
        : (meta.contentType || '').includes('image/jpeg') ? '.jpg'
        : (meta.contentType || '').includes('spreadsheet') ? '.xlsx'
        : '.bin';
      fs.writeFileSync(path.join(outDir, `${safeName(label)}_${row.timestamp}${ext}`), body);
      fs.writeFileSync(path.join(outDir, `${safeName(label)}_${row.timestamp}.json`), JSON.stringify(meta, null, 2));
    }
    return meta;
  } catch (error) {
    const meta = { label, timestamp: row.timestamp, original: row.original, archiveUrl, error: String(error) };
    console.log(JSON.stringify({ recoverError: meta }));
    return meta;
  }
}

async function main() {
  const directTargets = [];
  for (const id of IMGUR_IDS) {
    directTargets.push(
      [`imgur-page-${id}`, `https://imgur.com/${id}`],
      [`imgur-cdn-png-${id}`, `https://i.imgur.com/${id}.png`],
      [`imgur-cdn-jpg-${id}`, `https://i.imgur.com/${id}.jpg`],
      [`imgur-cdn-jpeg-${id}`, `https://i.imgur.com/${id}.jpeg`],
    );
  }
  const direct = await Promise.all(
    directTargets.map(([label, url]) => directRecover(label, url))
  );

  const patterns = [
    ['drive-open-http', `http://drive.google.com/open?id=${DRIVE_ID}`],
    ['drive-open-https', `https://drive.google.com/open?id=${DRIVE_ID}`],
    ['drive-wildcard', `drive.google.com/*${DRIVE_ID}*`],
    ['docs-wildcard', `docs.google.com/*${DRIVE_ID}*`],
    ['googleusercontent-wildcard', `*.googleusercontent.com/*${DRIVE_ID}*`],
  ];

  for (const id of IMGUR_IDS) {
    patterns.push(
      [`imgur-${id}`, `imgur.com/${id}*`],
      [`i-imgur-${id}`, `i.imgur.com/${id}*`],
    );
  }

  const probes = await Promise.all(
    patterns.map(([label, pattern]) => probe(label, pattern))
  );

  const recoveryTasks = probes.flatMap((entry) =>
    entry.rows.map((row) => recover(row, entry.label))
  );
  const recovered = await Promise.all(recoveryTasks);

  const report = {
    driveId: DRIVE_ID,
    imgurIds: IMGUR_IDS,
    generatedAt: new Date().toISOString(),
    direct,
    probes,
    recovered,
  };
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    status: 'PASS',
    direct200: direct.filter((item) => item.status === 200).length,
    probeCount: probes.length,
    totalCdxHits: probes.reduce((sum, item) => sum + item.rows.length, 0),
    recoveredCount: recovered.filter((item) => item.status === 200).length,
    outDir,
  }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
