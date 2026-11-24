'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const chart = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const native = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const gp = new Map(chart.runes.map((r, i) => [r, i]));
const P = chart.prime;
const digits = s => [...s].filter(c => gp.has(c)).map(c => gp.get(c));
const C = chart.pages.slice(0, 56).flatMap(p => p.indices);
const starts = [0,729,1874,3603,5506,6527,7960,9640,12648,12956];
assert.equal(C.length, 12956);
assert.deepEqual(C, digits(read('resources/transcriptions/lp2-image-corrected.txt')).slice(0, C.length));
/** @param {number} n */
const enc = n => n < 29 ? [n] : [Math.floor(n / 29), n % 29];
const tokens = new Map();
for (const p of P) for (const k of P) {
  const t = enc(p + k).join(',');
  tokens.set(t, (tokens.get(t) || 0) + 1);
}
/** @param {number[]} s */
function parse(s) {
  const n = s.length;
  const w = Array(n + 1).fill(0n), m = Array(n + 1).fill(0n);
  const lo = Array(n + 1).fill(Infinity), hi = Array(n + 1).fill(-Infinity);
  w[0] = m[0] = 1n; lo[0] = hi[0] = 0;
  let far = 0;
  for (let i = 0; i < n; i++) if (w[i]) {
    for (let l = 1; l <= 2 && i + l <= n; l++) {
      const q = tokens.get(s.slice(i, i + l).join(','));
      if (!q) continue;
      w[i+l] += w[i];
      m[i+l] += m[i] * BigInt(q);
      lo[i+l] = Math.min(lo[i+l], lo[i] + 1);
      hi[i+l] = Math.max(hi[i+l], hi[i] + 1);
      far = Math.max(far, i+l);
    }
  }
  const uncovered = [];
  for (let i = 1; i < n-1; i++) {
    if (!tokens.has(String(s[i])) &&
        !tokens.has(s.slice(i-1,i+1).join(',')) &&
        !tokens.has(s.slice(i,i+2).join(','))) {
      uncovered.push({i, triple:s.slice(i-1,i+2)});
    }
  }
  return {length:n, far, tokenParses:String(w[n]), pairParses:String(m[n]),
    min:Number.isFinite(lo[n])?lo[n]:null, max:Number.isFinite(hi[n])?hi[n]:null,
    uncovered:uncovered.length, firstUncovered:uncovered[0]||null};
}
const chapters = starts.slice(0,-1).map((x,i) => parse(C.slice(x,starts[i+1])));
const key = [3,17,9,22,5,28,11,0];
const controls = native.sections.map(s => {
  const d = digits(s.source_text);
  const ct = d.flatMap((p,i) => enc(P[p] + P[key[i%8]]));
  const r = parse(ct);
  assert(BigInt(r.tokenParses)>0n && r.min<=d.length && d.length<=r.max);
  assert.equal(r.uncovered,0);
  let pos=0;
  const replay=d.map((p,i)=>{
    const t=enc(P[p]+P[key[i%8]]);
    assert.deepEqual(ct.slice(pos,pos+t.length),t);
    pos+=t.length;
    return t;
  }).flat();
  assert.deepEqual(replay,ct);
  return {name:s.name, sourceLength:d.length,...r};
});
assert.equal(tokens.size,136);
assert.deepEqual(chapters.map(x=>x.tokenParses),Array(9).fill('0'));
assert.deepEqual(chapters.map(x=>x.far),[3,1,8,0,0,27,0,0,3]);
assert.deepEqual(chapters.map(x=>x.uncovered),[135,179,293,345,169,276,265,556,46]);
assert.equal(parse(C).uncovered,2269);
console.log(JSON.stringify({starts,tokenCount:tokens.size,single:[...tokens.keys()].filter(t=>!t.includes(',')).map(Number).sort((a,b)=>a-b),chapters,key,controls},null,2));
