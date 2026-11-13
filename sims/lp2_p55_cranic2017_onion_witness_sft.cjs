'use strict';

const https = require('node:https');
const zlib = require('node:zlib');
const crypto = require('node:crypto');

const URL = 'https://www.cranic.it/data/supporting_material.tar.gz';
const TARGET = '6sws36unkmvdy4b7.onion';
const CONTROLS = [
  'facebookcorewwwi.onion',
  '3g2upl4pq6kufc4m.onion',
  'ky2khlqdf7qdznac.onion',
];
const MAX_DOWNLOAD = 80 * 1024 * 1024;
const MAX_EXPANDED = 256 * 1024 * 1024;

/** @param {string} url @param {number} redirects @returns {Promise<Buffer>} */
async function download(url, redirects = 0) {
  if (redirects > 3) throw Error('Too many redirects');
  return await new Promise((resolve, reject) => {
    https.get(url, { timeout: 30000, headers: { 'user-agent': 'liber-primus-cranic-gate/1.0' } }, async (res) => {
      try {
        if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
          const location = res.headers.location;
          res.resume();
          if (!location) throw Error('Redirect without Location');
          return resolve(await download(new global.URL(location, url).href, redirects + 1));
        }
        if (res.statusCode !== 200) throw Error('HTTP ' + res.statusCode);
        const chunks = [];
        let size = 0;
        for await (const chunk of res) {
          size += chunk.length;
          if (size > MAX_DOWNLOAD) throw Error('Compressed archive exceeds limit');
          chunks.push(chunk);
        }
        resolve(Buffer.concat(chunks));
      } catch (e) {
        reject(e);
      }
    }).on('timeout', function () {
      this.destroy(Error('Download timeout'));
    }).on('error', reject);
  });
}

/** @param {Buffer} archive @returns {{name:string,bytes:Buffer}[]} */
function tarMembers(archive) {
  const members = [];
  for (let offset = 0; offset + 512 <= archive.length;) {
    const header = archive.subarray(offset, offset + 512);
    if (header.every(byte => byte === 0)) break;
    const name = header.subarray(0, 100).toString('utf8').replace(/\0.*$/s, '');
    const rawSize = header.subarray(124, 136).toString('ascii').replace(/\0.*$/s, '').trim();
    if (!/^[0-7]+$/.test(rawSize)) throw Error('Invalid tar member size: ' + name);
    const size = Number.parseInt(rawSize, 8);
    const begin = offset + 512;
    const end = begin + size;
    if (end > archive.length) throw Error('Truncated tar member: ' + name);
    members.push({ name, bytes: archive.subarray(begin, end) });
    offset = begin + Math.ceil(size / 512) * 512;
  }
  return members;
}

/** @param {{name:string,bytes:Buffer}[]} members */
function inspect(members) {
  const hosts = [TARGET, ...CONTROLS];
  const matches = Object.fromEntries(hosts.map(h => [h, []]));
  const memberNames = [];
  let onionMarkers = 0;
  for (const { name, bytes } of members) {
    memberNames.push({ name, size: bytes.length });
    let content = bytes;
    if (/\.gz$/i.test(name)) {
      content = zlib.gunzipSync(bytes, { maxOutputLength: MAX_EXPANDED });
    }
    const text = content.toString('latin1').toLowerCase();
    for (const host of hosts) {
      const bare = host.slice(0, -6);
      if (text.includes(host) || text.includes(bare)) matches[host].push(name);
    }
    onionMarkers += (text.match(/[a-z2-7]{16}\.onion/g) || []).length;
  }
  return { members: memberNames, onionMarkers, matches };
}

/** Synthetic gate proves that the tar matcher actually sees service identifiers. */
function selfTest() {
  const payload = Buffer.from('facebookcorewwwi.onion 6sws36unkmvdy4b7.onion', 'utf8');
  const header = Buffer.alloc(512);
  header.write('fixture.txt', 0, 'ascii');
  header.write(payload.length.toString(8).padStart(11, '0') + '\0', 124, 'ascii');
  const tar = Buffer.concat([header, payload, Buffer.alloc(512 - payload.length % 512), Buffer.alloc(1024)]);
  const members = tarMembers(zlib.gunzipSync(zlib.gzipSync(tar)));
  const result = inspect(members);
  if (result.matches[TARGET].length !== 1 || result.matches[CONTROLS[0]].length !== 1) {
    throw Error('Self-test failed');
  }
  console.log('Synthetic tar-gzip hostname controls PASS');
}

async function main() {
  selfTest();
  if (process.argv.includes('--self-test')) return;
  const compressed = await download(URL);
  const sha256 = crypto.createHash('sha256').update(compressed).digest('hex');
  const archive = zlib.gunzipSync(compressed, { maxOutputLength: MAX_EXPANDED });
  const result = inspect(tarMembers(archive));
  console.log(JSON.stringify({
    source: URL,
    downloadedBytes: compressed.length,
    sha256,
    uncompressedBytes: archive.length,
    ...result,
  }, null, 2));
  if (result.onionMarkers === 0 && Object.values(result.matches).every(x => x.length === 0)) {
    console.log('NO POSITIVE HOST-CORPUS CONTROL: archive cannot decide candidate existence');
  } else {
    console.log('A missing candidate remains inconclusive: 2017 public-Tor crawl is incomplete');
  }
}

main().catch(err => {
  console.error('CRANIC source retrieval/gate error:', err.message);
  process.exitCode = 1;
});
