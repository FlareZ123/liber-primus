'use strict';

/**
 * One-pass, archive-only grep of the exact original #33012014 IRC log.
 * This is a historical-source discriminator for LP2 red119 SKY/UDP, not
 * network probing. We retrieve ONLY a pinned public GitHub archival log.
 *
 * Node.js 22: node sims/lp2_2014_udp_irc_source_audit_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const https = require('node:https');

const COMMIT = 'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';
const SOURCE = 'https://raw.githubusercontent.com/neuroretransmit/cicada/'
  + COMMIT + '/irc-logs/%2333012014.freenode.log';
const BLOB = 'a2880b1db31ce523599ef30ca2e55291bf295900';
const BYTES = 8629610;

/** @param {string} url @returns {Promise<Buffer>} */
function retrieve(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {timeout:30000}, response => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error('Pinned archive HTTP status ' + response.statusCode));
        return;
      }
      const chunks = [];
      let total = 0;
      response.on('data', chunk => {
        total += chunk.length;
        if (total > 10000000) {
          response.destroy(new Error('Pinned archive exceeded expected bounds'));
          return;
        }
        chunks.push(chunk);
      });
      response.on('end', () => resolve(Buffer.concat(chunks, total)));
      response.on('error', reject);
    });
    request.on('timeout', () => request.destroy(new Error('Archive download timeout')));
    request.on('error', reject);
  });
}

/** @param {Buffer} data @returns {string} */
function blobSha1(data) {
  const header = Buffer.from('blob ' + data.length + '\0', 'ascii');
  return crypto.createHash('sha1').update(header).update(data).digest('hex');
}

/** @param {string[]} lines */
function inspect(lines) {
  const terms = [
    ['UDP', /\budp\b/i],
    ['port9133', /\b9133\b/i],
    ['port3319', /\b3319\b/i],
    ['packetCapture', /\bpcap\b|packet\s+capture/i],
    ['port', /\bport\b/i],
    ['icmp', /\bicmp\b/i]
  ];
  const hits = [];
  const counts = Object.fromEntries(terms.map(([name]) => [name, 0]));
  for (let i = 0; i < lines.length; i++) {
    const found = terms.filter(([, regex]) => regex.test(lines[i])).map(([name]) => name);
    for (const name of found) counts[name]++;
    if (found.some(name => name !== 'port' && name !== 'icmp')) {
      hits.push({line: i+1, terms:found, text:lines[i].slice(0,500)});
    }
  }
  return {counts, totalTargetMatches:hits.length, targetExamples:hits.slice(0,100)};
}

async function run() {
  const data = await retrieve(SOURCE);
  assert.equal(data.length, BYTES);
  assert.equal(blobSha1(data), BLOB, 'Downloaded bytes differ from original archived Git blob');
  const text = data.toString('utf8');
  const lines = text.split(/\r?\n/);
  // Assert matcher recognizes an explicit port/protocol control.
  assert.deepEqual(inspect(['test UDP on port 9133']).counts,
    {UDP:1,port9133:1,port3319:0,packetCapture:0,port:1,icmp:0});
  const result = {
    source:SOURCE,
    pinnedGitBlobSha1:BLOB,
    sourceSha256:crypto.createHash('sha256').update(data).digest('hex'),
    rawBytes:data.length,
    lines:lines.length,
    dated2014IrcProtocolRecord:inspect(lines),
    scope:'Original publicly archived participant IRC log only; no claim about missing private messages, packet traces or other channels',
    networkUdpTransmissions:0
  };
  console.log(JSON.stringify(result,null,2));
}
run().catch(error => {console.error(error);process.exitCode=1;});
