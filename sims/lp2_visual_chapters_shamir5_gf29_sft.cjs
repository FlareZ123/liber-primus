/** SFT: GP29 Shamir across nine visible LP2 chapters and opening 8|5 heading. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const mod = (v) => ((v % 29) + 29) % 29;
const inv = (v) => { for (let k = 1; k < 29; k++) if (mod(k * v) === 1) return k; throw Error('noninvertible'); };
const pow = (v, n) => { let a = 1; for (let i = 0; i < n; i++) a = mod(a * v); return a; };
/** @param {number[]} coeff Five coefficients a0..a4. @param {number} x Evaluation x. @param {boolean} monic */
function evalPoly(coeff, x, monic) {
  let y = monic ? pow(x, 5) : 0;
  for (let i = 0; i < 5; i++) y = mod(y + coeff[i] * pow(x, i));
  return y;
}
/** @param {number[]} first Source shares with public coordinates x=1..5. @param {number} x Prediction coordinate. @param {boolean} monic */
function predict(first, x, monic) {
  let y = monic ? pow(x, 5) : 0;
  for (let j = 0; j < 5; j++) {
    let w = 1;
    for (let k = 0; k < 5; k++) if (j !== k) w = mod(w * mod(x - (k + 1)) * inv(mod((j + 1) - (k + 1))));
    y = mod(y + w * mod(first[j] - (monic ? pow(j + 1, 5) : 0)));
  }
  return y;
}
const groups = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const chapters = groups.map(([a,b]) => corpus.pages.slice(a,b+1).flatMap((p) => p.indices));
assert.deepEqual(chapters.map((c) => c.length), [729,1145,1729,1903,1021,1433,1680,3008,308]);
const N = 308;
const h = chapters[0].slice(0,13);
assert.deepEqual(h, [15,8,18,3,6,19,27,0,15,26,18,21,5]);
const img = ink.pages.find((p) => p.page === 0);
assert(img.red_spans.some((s) => s.start === 0 && s.length === 13));
assert(img.large_punctuation.some((m) => m[0] === 13 && m[1] === 13 && m[2] === 'red'));
const title = [false,true].map((monic) => {
  const predicted = Array.from({length:8}, (_,i) => evalPoly(h.slice(8),i+1,monic));
  return {monic,predicted,matches:predicted.filter((a,i)=>a===h[i]).length};
});
assert.deepEqual(title.map((x)=>x.matches),[0,0]);

const originals = [false,true].map((monic) => {
  const matches=[];
  for(let j=5;j<9;j++){
    let hit=0;
    for(let i=0;i<N;i++) if(predict(chapters.slice(0,5).map((a)=>a[i]),j+1,monic)===chapters[j][i])hit++;
    matches.push(hit);
  }
  return {monic,matches,total:matches.reduce((a,b)=>a+b,0)};
});
assert.deepEqual(originals.map((x)=>x.matches),[[7,13,13,14],[13,7,12,8]]);

// Exact source-native GP plaintext recovery even when a generator rejects
// repeated adjacent share symbols. F=0 can interrupt the rejection rule.
const known=corpus.pages[57].indices;
assert.equal(known.length,95);
let state=0x3301c1ca;
const rand29=()=>{ state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)%29; };
const plant=Array.from({length:9},()=>[]);
let trials=0;
for(let t=0;t<N;t++){
  const a0=known[t%known.length];
  for(;;){
    trials++;
    const co=[a0,rand29(),rand29(),rand29(),rand29()];
    const row=Array.from({length:9},(_,j)=>evalPoly(co,j+1,true));
    if(t>0&&a0!==0&&row.some((v,j)=>v===plant[j][t-1]))continue;
    row.forEach((v,j)=>plant[j].push(v));
    break;
  }
}
let secrets=0,heldout=0,wrong=0;
for(let t=0;t<N;t++){
  const base=plant.slice(0,5).map((s)=>s[t]);
  if(predict(base,0,true)===known[t%known.length])secrets++;
  for(let j=5;j<9;j++)if(predict(base,j+1,true)===plant[j][t])heldout++;
  if(predict(base,6,true)===plant[6][t])wrong++; // falsely label the seventh tape as sixth
}
assert.equal(secrets,N);
assert.equal(heldout,4*N);
assert(wrong<N/5);
console.log(JSON.stringify({source:'Original LP2 p0-55',chapters:chapters.map((a)=>a.length),
  p0title:title,original:originals,originalExpectedNull:4*N/29,
  plant:{secrets,heldout,wrongIdentity:wrong,rejectionTrials:trials}},null,2));
