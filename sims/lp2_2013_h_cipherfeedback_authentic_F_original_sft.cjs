'use strict';

/**
 * Original-source GP29 2013-H ciphertext-or-plaintext-feedback / literal-F experiment.
 * Run with Node.js 22 from the repository root.
 * The companion register and injected ciphertext/plaintext rules are hypotheses.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const mod = n => (n % 29 + 29) % 29;
const chapters = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const expectedLengths = [729,1145,1729,1903,1021,1433,1680,3008,308];
const expected = [
  [[null,21],[null,3]],
  [[752,0],[410,0]],
  [[494,0],[182,0]],
  [[337,0],[437,0]],
  [[702,0],[613,0]],
  [[809,0],[648,0]],
  [[419,0],[413,0]],
  [[1536,0],[1663,0]],
  [[null,2],[300,0]]
];
const expectedPlain = [
  [[null,14],[null,2]],
  [[547,0],[459,0]],
  [[589,0],[790,0]],
  [[319,0],[354,0]],
  [[790,0],[610,0]],
  [[669,0],[729,0]],
  [[379,0],[421,0]],
  [[1664,0],[682,0]],
  [[null,2],[null,3]]
];
function originalChapter(first, last) {
  return corpus.pages.filter(p => p.page >= first && p.page <= last).flatMap(p => p.indices);
}
/**
 * Exact all-IV/all-transparent-F automaton.
 * Normal emission: C=P+sign*u (mod29), P!=0;
 * update: (u,v)=(v,18*u+11*v+feedback) (mod29), feedback=C or P.
 * Literal F: P=C=0, state unchanged.
 * @param {number[]} cipher
 * @param {1|-1} sign
 * @param {[number,number]|null} seed
 * @param {'cipher'|'plain'} feedback
 * @returns {{firstImpossible:number|null,survivors:number}}
 */
function scan(cipher, sign, seed = null, feedback = 'cipher') {
  let states = new Uint8Array(841);
  if (seed) states[seed[0] * 29 + seed[1]] = 1;
  else states.fill(1);
  for (let i = 0; i < cipher.length; i++) {
    const c = cipher[i], next = new Uint8Array(841);
    for (let s = 0; s < 841; s++) {
      if (!states[s]) continue;
      const u = Math.floor(s / 29), v = s % 29;
      if (c === 0) next[s] = 1;
      if (mod(c - sign * u) !== 0) {
        next[v * 29 + mod(18*u + 11*v + (feedback === 'plain' ? mod(c - sign*u) : c))] = 1;
      }
    }
    states = next;
    if (!states.some(Boolean)) return { firstImpossible: i, survivors: 0 };
  }
  return { firstImpossible: null, survivors: states.reduce((s,x) => s + x, 0) };
}
/** Exact native-GP encryption with a known literal-F trace. */
function encrypt(plain, sign, seed, feedback = 'cipher') {
  let [u,v] = seed;
  const cipher = [], transparent = [];
  for (const p of plain) {
    if (p === 0) {
      cipher.push(0);
      transparent.push(true);
    } else {
      const c = mod(p + sign*u);
      cipher.push(c);
      transparent.push(false);
      [u,v] = [v,mod(18*u + 11*v + (feedback === 'plain' ? p : c))];
    }
  }
  return {cipher,transparent};
}
/** Exact known-branch inverse for a planted positive, not original text. */
function invertKnownBranches(plant, sign, seed, feedback = 'cipher') {
  let [u,v] = seed;
  const plain = [];
  for (let i = 0; i < plant.cipher.length; i++) {
    const c = plant.cipher[i];
    if (plant.transparent[i]) {
      assert.equal(c,0);
      plain.push(0);
    } else {
      const p = mod(c - sign*u);
      assert.notEqual(p,0);
      plain.push(p);
      [u,v] = [v,mod(18*u + 11*v + (feedback === 'plain' ? p : c))];
    }
  }
  return plain;
}
/** Direct no-skip IV sensitivity, separate from the exact branch gate. */
function bestDirectIoC(cipher, sign, feedback = 'cipher') {
  let best = {ioc:-1,seed:null};
  for (let u0=0;u0<29;u0++) for (let v0=0;v0<29;v0++) {
    let u=u0,v=v0;
    const freq=new Uint16Array(29);
    for (const c of cipher) {
      const p = mod(c - sign*u);
      freq[p]++;
      [u,v]=[v,mod(18*u + 11*v + (feedback === 'plain' ? p : c))];
    }
    const n=cipher.length;
    const ioc=freq.reduce((s,x)=>s+x*(x-1),0)/(n*(n-1));
    if (ioc>best.ioc) best={ioc,seed:[u0,v0]};
  }
  return best;
}
assert.equal(corpus.pages.filter(p=>p.page<=55).reduce((s,p)=>s+p.indices.length,0),12956);
assert.deepEqual(chapters.map(([a,b])=>originalChapter(a,b).length),expectedLengths);
for (let i=0;i<chapters.length;i++) {
  const [a,b]=chapters[i],cipher=originalChapter(a,b);
  for (let j=0;j<2;j++) {
    const sign=j===0?1:-1;
    for (const feedback of ['cipher', 'plain']) {
      const got=scan(cipher,sign,null,feedback);
      const reference=feedback === 'plain' ? expectedPlain : expected;
      assert.deepEqual([got.firstImpossible,got.survivors],reference[i][j]);
      console.log('original p'+a+'-'+b,'sign='+sign,'feedback='+feedback,JSON.stringify(got));
    }
  }
}
const opening=originalChapter(0,2);
assert.equal(scan(opening,1,[26,24]).survivors,11);
assert.equal(scan(opening,-1,[26,24]).survivors,3);
console.log('2013 BASE29 trailing [26,24] is formally consistent with opening but yields no established plaintext.');
const clear=corpus.pages.find(p=>p.page===57).indices;
assert.equal(clear.length,95);
const native=Array.from({length:33},()=>clear).flat().slice(0,3008);
for (const sign of [1,-1]) for (const feedback of ['cipher','plain']) {
  const plant=encrypt(native,sign,[26,24],feedback);
  assert.deepEqual(invertKnownBranches(plant,sign,[26,24],feedback),native);
  assert.ok(scan(plant.cipher,sign,null,feedback).survivors>0);
  assert.ok(scan(plant.cipher,sign,[26,24],feedback).survivors>0);
  console.log('known-clear GP-native 3008-rune plant sign='+sign+' feedback='+feedback+': exact 3008/3008 recovery');
}
for (const [a,b] of [[33,39],[40,53]]) for (const sign of [1,-1]) for (const feedback of ['cipher','plain']) {
  console.log('direct p'+a+'-'+b,'sign='+sign,'feedback='+feedback,JSON.stringify(bestDirectIoC(originalChapter(a,b),sign,feedback)));
}
console.log('PASS: seven complete original chapters have zero possible seeds/traces for either sign and either feedback register.');
