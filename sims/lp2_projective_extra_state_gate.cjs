// Agent49 #2851. Run from repository root: node sims/lp2_projective_extra_state_gate.cjs
const fs = require('node:fs');
const assert = require('node:assert/strict');
const j = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const pages = fs.readFileSync('resources/external/Liber Primus 57.txt', 'utf8').replace(/\r/g, '').split(/\n%\d+\n/).slice(1);
const rs = j.runes;
const report = [];
for (const n of [15, 56, 57]) {
  const src = pages[n].split('\n').filter(l => [...l].some(x => rs.includes(x))).join('\n');
  const indices = [...src].filter(c => rs.includes(c)).map(c => rs.indexOf(c));
  assert.deepEqual(indices, j.pages[n].indices);
  const serializations = {};
  for (const mark of ['᛫', '⁕']) {
    const coded = [...src].map(x => x === mark ? 29 : rs.includes(x) ? rs.indexOf(x) : x);
    assert.equal(coded.map(x => typeof x === 'number' ? (x === 29 ? mark : rs[x]) : x).join(''), src);
    serializations[mark] = coded.filter(x => x === 29).length;
  }
  report.push({ n, runes: indices.length, serializations, otherMarks: Object.fromEntries(['჻', '⁖', '⁘', '᛭'].map(m => [m, [...src].filter(x => x === m).length])) });
}
const words = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const sorted = j.translit.map((t,i) => ({t,i})).sort((a,b) => b.t.length-a.t.length);
const p = [];
for (let w of words.split(' ')) {
  while (w.length) {
    const t = sorted.find(x => w.startsWith(x.t));
    assert.ok(t, w);
    p.push(t.i);
    w = w.slice(t.t.length);
  }
}
const primes = [];
for (let x=2; primes.length<84; x++) {
  if (primes.every(p => p*p>x || x%p!==0)) primes.push(x);
}
let k=0;
const rows=p.map((P,i)=>{
  const prime=P===0?null:primes[k++];
  const C=prime===null?0:(P+prime-1)%29;
  return {i,P,C,prime};
});
assert.deepEqual(rows.map(x=>x.C),j.pages[56].indices);
const collisions=rows.filter(x=>x.C===0);
assert.deepEqual(collisions.map(x=>[x.i,x.P,x.prime]),[[35,24,151],[47,10,223],[51,23,239],[56,0,null],[74,5,373]]);
console.log(JSON.stringify({report,collisions},null,2));
