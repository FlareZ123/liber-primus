'use strict';
/**
 * Locate possible public original 2017 Tor WARC sources for the unsolved
 * p56 deep-web continuation. Three WARC crawls are described in Bernaschi et
 * al., World Wide Web 25 (2022), doi:10.1007/s11280-022-01044-z, Jan-May 2017.
 * Published supplementary data: https://www.cranic.it/data/supporting_material.tar.gz
 *
 * Node.js 22, CommonJS. Source archive inspection is bounded to 40 MiB;
 * no source data is written to disk and no active onion is contacted.
 */
const assert = require('node:assert/strict');
const https = require('node:https');
const zlib = require('node:zlib');
const crypto = require('node:crypto');

const SOURCE_URL = 'https://www.cranic.it/data/supporting_material.tar.gz';
const MAX_DOWNLOAD = 40 * 1024 * 1024;
const TARGETS = ['ky2khlqdf7qdznac.onion', '36367763ab73783c7af284446c59466b'];

/** @param {string} url @param {'HEAD'|'GET'} method */
function request(url, method) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {method, headers: {'User-Agent': 'LiberPrimus-public-archive-research/1.0'}}, res => {
      /** @type {Buffer[]} */
      const chunks = [];
      let length = 0;
      if (method === 'HEAD') {
        res.resume();
        res.on('end', () => resolve({status: res.statusCode, headers: res.headers, body: Buffer.alloc(0)}));
        return;
      }
      res.on('data', b => {
        length += b.length;
        if(length > MAX_DOWNLOAD) {req.destroy(Error('Download exceeded 40MiB ceiling')); return;}
        chunks.push(b);
      });
      res.on('end', () => resolve({status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks)}));
    });
    req.setTimeout(30000, () => req.destroy(Error('Source request timeout')));
    req.on('error', reject);
    req.end();
  });
}

/** @param {Buffer} tar */
function listTar(tar) {
  const entries = [];
  for (let offset = 0; offset + 512 <= tar.length;) {
    const head = tar.subarray(offset, offset + 512);
    if (head.every(b => b === 0)) break;
    const name = head.subarray(0, 100).toString('utf8').replace(/\0.*$/, '');
    const prefix = head.subarray(345, 500).toString('utf8').replace(/\0.*$/, '');
    const oct = head.subarray(124, 136).toString('utf8').replace(/\0.*$/, '').trim();
    assert.match(oct, /^[0-7]+$/, 'Invalid TAR byte length: ' + oct);
    const n = parseInt(oct, 8);
    const path = prefix ? prefix + '/' + name : name;
    assert(n >= 0 && offset + 512 + n <= tar.length, 'Invalid TAR record: ' + path);
    const bytes = tar.subarray(offset + 512, offset + 512 + n);
    const lower = path.toLowerCase();
    const candidate = /\.warc(\.gz)?$|\.html?$|\.jsonl?$|\.csv$/.test(lower);
    const matches = candidate ? TARGETS.filter(s => bytes.includes(Buffer.from(s))) : [];
    entries.push({path, size: n, kind: head[156], candidate, targets: matches});
    offset += 512 + Math.ceil(n / 512) * 512;
  }
  return entries;
}

function syntheticControl() {
  const payload = Buffer.from('Record of ky2khlqdf7qdznac.onion in test WARC');
  const tar = Buffer.alloc(2048);
  tar.write('sample.warc', 0, 'utf8');
  tar.write(payload.length.toString(8).padStart(11, '0') + '\0', 124, 'ascii');
  tar[156] = 48;
  payload.copy(tar, 512);
  const table = listTar(zlib.gunzipSync(zlib.gzipSync(tar)));
  assert.equal(table.length, 1);
  assert.deepEqual(table[0].targets, [TARGETS[0]]);
  return true;
}

async function main() {
  assert(syntheticControl());
  const head = await request(SOURCE_URL, 'HEAD');
  const bytes = Number(head.headers['content-length']);
  console.log(JSON.stringify({
    stage: 'HEAD', source: SOURCE_URL, status: head.status,
    bytes: Number.isFinite(bytes) ? bytes : null,
    contentType: head.headers['content-type'], lastModified: head.headers['last-modified']
  }));
  if (head.status !== 200 || !bytes || bytes > MAX_DOWNLOAD) return;
  const get = await request(SOURCE_URL, 'GET');
  assert.equal(get.status, 200);
  const sha256 = crypto.createHash('sha256').update(get.body).digest('hex');
  const tar = zlib.gunzipSync(get.body, {maxOutputLength: 512 * 1024 * 1024});
  const entries = listTar(tar);
  console.log(JSON.stringify({
    stage: 'TAR', sha256, entryCount: entries.length,
    totalContentBytes: entries.reduce((n, e) => n + e.size, 0),
    records: entries.slice(0, 100),
    warc: entries.filter(e => /\.warc(\.gz)?$/i.test(e.path)).map(e => e.path),
    targetHits: entries.filter(e => e.targets.length)
  }));
}
if (require.main === module) main().catch(e => {console.error(e); process.exitCode = 1;});
module.exports = {listTar, syntheticControl};
