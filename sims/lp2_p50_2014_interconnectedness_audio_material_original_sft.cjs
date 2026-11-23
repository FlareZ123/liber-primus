'use strict';

/**
 * Historical-source identity attack: original 2014 Stage07 MP3 against LP2's
 * original 256-cell p50 bytes and conditionally derived 252-digit H*G quotient.
 * Exact eight-symbol contiguous windows, full audio length and one frozen order.
 * 23 Nov 2026, Agent43, Windows Node 22, read-only.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const sourceURL = 'https://raw.githubusercontent.com/krisyotam/cicada3301/main/media/audio/index.mp3';
const gitBlobSHA = '09fe068192b76a3697c47ec1d604b527703db798';
const sourceSHA256 = '1ce3839b4a62462d9009c4469acc189b523e1bdcf338cb49cda1cd7bb4efffc6';
const mod = (x) => (x % 29 + 29) % 29;

/**
 * @param {Buffer} needle
 * @param {Buffer} haystack
 * @param {number} width
 * @returns {{tableIndex:number,audioOffset:number,matching:number}[]}
 */
function exactWindows(needle, haystack, width) {
  const hits = [];
  for (let i = 0; i + width <= needle.length; i += 1) {
    const fragment = needle.subarray(i, i + width);
    let off = -1;
    while ((off = haystack.indexOf(fragment, off + 1)) !== -1) {
      let k = width;
      while (i + k < needle.length && off + k < haystack.length &&
        needle[i + k] === haystack[off + k]) k += 1;
      hits.push({tableIndex:i,audioOffset:off,matching:k});
    }
  }
  return hits;
}

assert.equal(grid.bytes.length, 256);
assert.equal(grid.alphabet,'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
const bytes = Buffer.from(grid.bytes);
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const p = grid.bytes.map((v) => v % 29);
const factor = [12,17,11,21,23];
const q = [];
for(let i=0;i<252;i+=1) {
  const v = mod(17*p[i]);
  q.push(v);
  for(let j=0;j<5;j+=1) p[i+j] = mod(p[i+j]-v*factor[j]);
}
assert.deepEqual(p.slice(252),[0,0,0,0]);
assert.deepEqual(q.slice(0,16),[0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21]);
const residues = Buffer.from(grid.bytes.map((v) => v%29));
const quotient = Buffer.from(q);

async function main() {
  const response = await fetch(sourceURL,{signal:AbortSignal.timeout(120000)});
  assert.equal(response.status,200);
  const audio = Buffer.from(await response.arrayBuffer());
  assert.equal(audio.length,6651873);
  assert.equal(crypto.createHash('sha256').update(audio).digest('hex'),sourceSHA256);
  assert.equal(crypto.createHash('sha1')
    .update(Buffer.from('blob '+audio.length+'\0')).update(audio).digest('hex'),gitBlobSHA);

  const audio29 = Buffer.from(audio.map((b)=>b%29));
  const patterns = [
    {name:'original literal 256-byte grid',needle:bytes,haystack:audio},
    {name:'original 256 GP29 residues',needle:residues,haystack:audio29},
    {name:'exact 252 GP29 H*G quotient',needle:quotient,haystack:audio29},
  ];

  const results = [];
  for (const {name,needle,haystack} of patterns) {
    const plantStart = 4096;
    const plant=haystack.subarray(plantStart,plantStart+needle.length);
    const positive=exactWindows(plant,haystack,8);
    assert.ok(positive.some((h)=>h.tableIndex===0 && h.audioOffset===plantStart
      && h.matching===needle.length));
    const hits=exactWindows(needle,haystack,8);
    results.push({name,registerSymbols:needle.length,sourceSymbols:haystack.length,
      threshold:8,positive:plantStart,exactHits:hits.length,
      topHits:hits.sort((a,b)=>b.matching-a.matching).slice(0,12)});
  }
  console.log(JSON.stringify({sourceURL,sourceSHA256,sourceGitBlobSHA1:gitBlobSHA,
    originalGridByteSHA256:crypto.createHash('sha256').update(bytes).digest('hex'),
    results},null,2));
  console.log('PASS: source-exact literal-byte and GP29-residue original material search');
}
main().catch((e)=>{console.error(e);process.exitCode=1;});
