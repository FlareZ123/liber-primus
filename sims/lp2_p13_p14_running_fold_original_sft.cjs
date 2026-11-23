'use strict';

/*
 * Physical p13 -> p14 running-fold key, one locked nonstationary decoder.
 * Read-only, source-attached Node22 SFT; no fitted shifts or secret lookups.
 *
 * Hypothesis (not authenticated by Cicada):
 *  - Horizontally fold twelve p13 lines across the six-line seam.
 *  - Pair line r with line 11-r at the same source column; where the
 *    bottom-side line is shorter, use neutral GP0=0.
 *  - Accumulate GP29 index sums as a moving key:
 *      K[-1]=0, K[i] = K[i-1]+top[i]+bottom[i] (mod 29)
 *  - Only original F at p14 rune offset2 is bypassed.
 *  - P[i] = C_nonF[i]-K[i] (mod29).
 *
 * This is a complete 137-rune reversible receiver given p13 as a retained
 * key. Full reencryption is an implementation check, not plaintext evidence.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const partPages = corpus.pages.filter(p => p.indices.length > 0);
const unicodeParts = transcript.split('%');
assert.equal(unicodeParts.length, partPages.length);
const runemap = new Map(corpus.runes.map((r,i) => [r,i]));
const mod = x => ((x % 29) + 29) % 29;
const gp = xs => xs.map(x => corpus.translit[x]).join('-');
const nativeIoc = xs => {
  const hist=Array(29).fill(0);
  for(const x of xs) hist[x]++;
  return hist.reduce((a,v) => a+v*(v-1),0)/(xs.length*(xs.length-1));
};
function physicalLines(page) {
  const i=partPages.findIndex(p=>p.page===page);
  assert.ok(i>=0);
  const lines=unicodeParts[i].split('/').map(line => [...line]
    .filter(r => runemap.has(r)).map(r => runemap.get(r)))
    .filter(xs => xs.length);
  assert.deepEqual(lines.flat(), partPages[i].indices);
  return lines;
}
const lines=physicalLines(13);
assert.deepEqual(lines.map(l=>l.length), [
  24,21,23,23,22,23,22,25,21,22,22,24
]);
let k=0, key=[], uncoveredTop=[], uncoveredBottom=[];
for(let row=0;row<6;row++) {
  const top=lines[row], bottom=lines[11-row];
  for(let col=0;col<top.length;col++) {
    if(col>=bottom.length) uncoveredTop.push(top[col]);
    k=mod(k+top[col]+(bottom[col]===undefined ? 0 : bottom[col]));
    key.push(k);
  }
  for(let col=top.length;col<bottom.length;col++) {
    uncoveredBottom.push(bottom[col]);
  }
}
assert.equal(key.length,136);
assert.equal(uncoveredTop.length,4);
assert.equal(uncoveredBottom.length,4);
assert.equal(gp(uncoveredTop),'W-A-F-X');
assert.equal(gp(uncoveredBottom),'F-J-E-I');
const original=partPages.find(p=>p.page===14).indices;
assert.equal(original.length,137);
assert.equal(original[2],0); // actual F in FOLD
const body=original.filter((_,i)=>i!==2);
const plain=body.map((c,i)=>mod(c-key[i]));
const encrypted=plain.map((p,i)=>mod(p+key[i]));
assert.deepEqual(encrypted,body);
const reconstructed=[...encrypted.slice(0,2),0,...encrypted.slice(2)];
assert.deepEqual(reconstructed,original);
const native=partPages.find(p=>p.page===57).indices;
assert.equal(native.length,95);
// Planted independent authentic solved Cicada positive, same fixed key.
const plant=native.map((p,i)=>mod(p+key[i]));
assert.deepEqual(plant.map((c,i)=>mod(c-key[i])),native);
assert.ok(Math.abs(nativeIoc(plain)-0.03398692810457516)<1e-12);
assert.ok(Math.abs(nativeIoc(native)-0.06270996640537514)<1e-12);
console.log('source line lengths:',JSON.stringify(lines.map(l=>l.length)));
console.log('overhang top/bottom:',gp(uncoveredTop),gp(uncoveredBottom));
console.log('p14 received non-F:',body.length,'full:',original.length);
console.log('moving fold key first40:',gp(key.slice(0,40)));
console.log('candidate output first60:',gp(plain.slice(0,60)));
console.log('original ciphertext IoC:',nativeIoc(body));
console.log('candidate IoC:',nativeIoc(plain));
console.log('authentic p57 native IoC:',nativeIoc(native));
console.log('PASS original full-page forward replay and authentic solved-text plant');
