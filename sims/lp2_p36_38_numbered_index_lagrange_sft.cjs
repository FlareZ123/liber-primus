'use strict';

/**
 * Literal, printed-number-only reading gate for LP2 p36–38.
 * A standalone Windows Node >=22 SFT: node sims/lp2_p36_38_numbered_index_lagrange_sft.cjs
 *
 * Five source labels 1..5 select literal word/rune indexing and, as a
 * separate motivated but UNAUTHENTICATED rival, GF(29) five-share
 * interpolation on the maximal common-prefix alignment. No parameter
 * is selected by ciphertext language. Uses unchanged original sources.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const raw = fs.readFileSync(path.join(root, 'resources', 'liber-primus',
  'lp2-transcription.txt'), 'utf8');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources',
  'liber-primus', 'lp2-corpus.json'), 'utf8'));
const ps = raw.split(/(?:^|\n)%\s*(?:\n|$)/m);
assert.equal(ps.length, 57);
const [a,b,c] = [ps[36],ps[37],ps[38]];
const [i1,i3,i4,i5,end] = [a.indexOf('\n1-'),b.indexOf('\n3-'),
  b.indexOf('\n4-'),c.indexOf('\n5-'),c.indexOf('\n&')];
assert.ok([i1,i3,i4,i5,end].every(x => x >= 0));
const fragments = [a.slice(i1+3),b.slice(2,i3),b.slice(i3+3,i4),
  b.slice(i4+3)+c.slice(0,i5),c.slice(i5+3,end)];
const gp = corpus.runes;
const words = fragments.map(s => s.replace(/\//g,'')
  .replace(/[\r\n]/g,'').split(/[-.]/).filter(Boolean));
const streams = words.map(ws => ws.flatMap(w => [...w].map(r => {
  const j = gp.indexOf(r);
  assert.ok(j >= 0, 'Non-GP rune in printed section');
  return j;
})));
assert.deepEqual(streams.map(a => a.length), [139,91,98,96,129]);
assert.deepEqual(words.map(a => a.length), [30,20,25,19,28]);
assert.equal(streams.flat().length,553);
const mod = n => ((n % 29) + 29) % 29;
const translit = ar => ar.map(x => corpus.translit[x]).join('');
const sym = r => corpus.translit[gp.indexOf(r)];
const rowRead = (f, indexBase=0) => words.map((w,i) =>
  f(w,i+1,indexBase));
const read = ar => ar.map(x=>x ?? '(unavailable)').join(' | ');
const literal = {
  firstRune:read(rowRead(w=>sym([...w[0]][0]))),
  lastRune:read(rowRead(w=>sym([...w.at(-1)].at(-1)))),
  ordinalRuneOfFirstWord:read(rowRead((w,n)=>[...w[0]][n-1])
    .map(x=>x&&sym(x))),
  ordinalWordInitial:read(rowRead((w,n)=>sym([...w[n-1]][0]))),
  ordinalWordLast:read(rowRead((w,n)=>sym([...w[n-1]].at(-1)))),
  ordinalRuneOfOrdinalWord:read(rowRead((w,n)=>
    [...w[n-1]][n-1]).map(x=>x&&sym(x)))
};
assert.equal(literal.firstRune,'L | N | D | NG | H');
assert.equal(literal.ordinalRuneOfFirstWord,'L | Y | P | J | B');
assert.equal(literal.ordinalWordInitial,'L | N | R | D | H');
assert.equal(literal.ordinalRuneOfOrdinalWord,
  'L | U | I | (unavailable) | NG');
console.log(JSON.stringify({literal,originalRuneCounts:streams.map(x=>x.length),
  originalPrintedWords:words.map(x=>x.length)}));

/** Inverse Vandermonde over GP's 29-element field for printed x=1..5.
 * These are algebraically forced by the five red numbers, but Shamir
 * secret-sharing is NOT instructed in the manuscript and unequal
 * source-stream lengths give no natural alignment beyond 91 runes.
 */
function inverseMatrix(m) {
  const n = m.length;
  const x = m.map((r,i)=>r.map(mod).concat(
    Array.from({length:n},(_,j)=>+(i===j))));
  for(let col=0;col<n;col++) {
    const pivot=x.findIndex((r,i)=>i>=col&&r[col]!==0);
    assert.ok(pivot>=0);
    [x[col],x[pivot]]=[x[pivot],x[col]];
    const z=Array.from({length:28},(_,k)=>k+1)
      .find(k=>mod(k*x[col][col])===1);
    x[col]=x[col].map(t=>mod(t*z));
    for(let i=0;i<n;i++)if(i!==col) {
      const a=x[i][col];
      x[i]=x[i].map((t,j)=>mod(t-a*x[col][j]));
    }
  }
  return x.map(r=>r.slice(n));
}
const V = Array.from({length:5},(_,i)=>
  Array.from({length:5},(_,j)=>mod((i+1)**j)));
const VI = inverseMatrix(V);
assert.deepEqual(VI,[[5,19,10,24,1],[25,13,24,15,10],
  [9,24,5,27,22],[26,7,26,26,2],[23,24,22,24,23]]);
const coefficients=Array.from({length:5},()=>[]);
for(let pos=0;pos<91;pos++)for(let k=0;k<5;k++) {
  coefficients[k].push(mod(VI[k].reduce(
    (sum,w,j)=>sum+w*streams[j][pos],0)));
}
const recon = Array.from({length:5},()=>[]);
for(let pos=0;pos<91;pos++)for(let s=0;s<5;s++) {
  recon[s].push(mod(V[s].reduce(
    (sum,w,k)=>sum+w*coefficients[k][pos],0)));
}
assert.ok(recon.every((r,j)=>r.every((x,k)=>x===streams[j][k])));
const ioc = ar => {
  const f=Array(29).fill(0);
  for(const x of ar)f[x]++;
  return f.reduce((v,x)=>v+x*(x-1),0)/(ar.length*(ar.length-1));
};
const output = coefficients.map((p,k)=>({
  coefficient:k, runes:p.length, ioc:ioc(p), opening:translit(p.slice(0,50))
}));
assert.ok(output.every(x=>x.ioc<0.041));
console.log(JSON.stringify({shamirIsSourceSpecified:false,
  referenceField:29, numberedX:[1,2,3,4,5],
  commonPrefixRuneLength:91,
  matrixInverse:VI, fullOriginalReencryption:true, output,
  conclusion:'No original GP-native plaintext and no authored extraction/interpolation selector'}));
console.log('PASS source-exact finite literal indexing and five-share gate');
