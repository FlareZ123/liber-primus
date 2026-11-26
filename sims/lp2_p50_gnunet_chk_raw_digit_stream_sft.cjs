'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const grid = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/liber-primus/base60-grid.json'), 'utf8'));
const alphabet = grid.alphabet;
const original = grid.rows.flat().join('').split('');
const target = Buffer.from('36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4', 'hex');
const ambiguous = original.map((c,i) => /[Il]/.test(c) ? i : -1).filter(i => i >= 0);

function sha(data) { return crypto.createHash('sha512').update(data).digest(); }
function cfb(data, h, decrypt=false) {
  const fn = decrypt ? crypto.createDecipheriv : crypto.createCipheriv;
  const x = fn('aes-256-cfb', h.subarray(0,32), h.subarray(32,48));
  x.setAutoPadding(false);
  return Buffer.concat([x.update(data), x.final()]);
}
const probe = Buffer.concat([Buffer.from('GNUnet-CHK-positive-control\0'), Buffer.from(Array.from({length:32},(_,i)=>i))]);
const probeHash = sha(probe);
assert.deepEqual(cfb(cfb(probe,probeHash),probeHash,true),probe);
assert.equal(original.length,512);
assert.equal(ambiguous.length,10);
assert.equal(target.length,64);

const counts = {
  numeric_digit_bytes:{directKeyhash:0,keyhashDecrypt:0,queryhash:0},
  ascii_digit_bytes:{directKeyhash:0,keyhashDecrypt:0,queryhash:0}
};
const hits=[];
for(let mask=0;mask<(1<<ambiguous.length);mask++){
  const chars=original.slice();
  for(let bit=0;bit<ambiguous.length;bit++) if(mask&(1<<bit)){
    const p=ambiguous[bit]; chars[p]=chars[p]==='I'?'l':'I';
  }
  const blocks=[
    ['numeric_digit_bytes',Buffer.from(chars.map(c=>alphabet.indexOf(c)))],
    ['ascii_digit_bytes',Buffer.from(chars.join(''),'ascii')]
  ];
  for(const [name,block] of blocks){
    const keyhash=sha(block);
    if(keyhash.equals(target)){counts[name].directKeyhash++;hits.push([mask,name,'direct-keyhash']);}
    if(sha(cfb(block,target,true)).equals(target)){counts[name].keyhashDecrypt++;hits.push([mask,name,'keyhash-decrypt']);}
    if(sha(cfb(block,keyhash)).equals(target)){counts[name].queryhash++;hits.push([mask,name,'queryhash']);}
  }
}
const result={
  sourceTokens:grid.rows.flat().length,rawDigits:original.length,readings:1<<ambiguous.length,
  counts,hits,
  canonicalNumericSha512:sha(Buffer.from(original.map(c=>alphabet.indexOf(c)))).toString('hex'),
  canonicalAsciiSha512:sha(Buffer.from(original.join(''),'ascii')).toString('hex')
};
for(const v of Object.values(counts)) for(const n of Object.values(v)) assert.equal(n,0);
console.log(JSON.stringify(result,null,2));
