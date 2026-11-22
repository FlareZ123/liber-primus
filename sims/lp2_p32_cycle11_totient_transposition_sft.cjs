'use strict';

/**
 * Exact original p32 11×11 cycle-rank transposition + authentic p56
 * prime-totient decoder gate. Windows Node22 CommonJS SFT.
 *
 * Independent original inputs: authentic signed-2016 source-selected p32
 * table landing, native p50 successor cycle of length 11, printed p32
 * rune count 121=11², solved original p56 prime-totient/F-transparent
 * decoder. This tests 576 frozen conventional compositions, not plaintext-
 * fitted keys. No general decoder is claimed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const original = corpus.pages.find(p => p.page === 32).indices;
assert.equal(original.length, 121);
const bytes = table.pages.flatMap(p => p.tokens);
assert.equal(bytes.length, 256);
const alpha = table.alphabet;
const successor = bytes.map(t => alpha.indexOf(t[0]) * 60 + alpha.indexOf(t[1]));
assert(successor.every(v => Number.isInteger(v) && v >= 0 && v <= 255));
const cycle = [];
for (let n = successor[32]; !cycle.includes(n); n = successor[n]) cycle.push(n);
assert.deepEqual(cycle, [115,247,192,0,203,68,199,47,76,114,197]);
assert.equal(successor[cycle.at(-1)], cycle[0]);

const sortedCycle = [...cycle].sort((a,b)=>a-b);
const rank = cycle.map(v => sortedCycle.indexOf(v));
const inverseRank = rank.map((_,i) => rank.indexOf(i));
const identity = Array.from({length:11},(_,i)=>i);
const permutations = {identity,rank,inverseRank};
assert.deepEqual(rank, [5,10,6,0,9,2,8,1,3,4,7]);
for (const a of Object.values(permutations)) assert.equal(new Set(a).size, 11);

/** @param {number} n @returns {number[]} */
function primeList(n) {
  const out = [];
  for (let x=2; out.length<n; x++) {
    let prime=true;
    for (let j=2; j*j<=x; j++) if (x%j===0) {prime=false;break;}
    if (prime) out.push(x);
  }
  return out;
}
const primes=primeList(150);
const mod29 = x => ((x%29)+29)%29;

/**
 * Exact solved-p56 F-transparent φ(prime) decoder: each ciphertext F is
 * potentially a transparent plaintext F and does not consume key. The
 * subset mask is indexed only by positions with ciphertext F.
 * @param {number[]} input
 * @param {-1|1} sign
 * @param {number} mask
 * @returns {number[]}
 */
function phiDecode(input,sign,mask) {
  let clock=0, f=0;
  return input.map(cipher => {
    if (cipher===0 && (mask&(1<<f++))) return 0;
    return mod29(cipher + sign*(primes[clock++]-1));
  });
}

/**
 * GP-native spelling by longest token, same exact alphabet as original
 * solved pages. Keep words separate to avoid false digraphs across spaces.
 * @param {string} text
 * @returns {number[]}
 */
function encodeGP(text) {
  const ordered=corpus.translit.map((token,index)=>({token,index}))
    .sort((a,b)=>b.token.length-a.token.length);
  const out=[];
  for (const word0 of text.toUpperCase().match(/[A-Z]+/g)||[]) {
    const word=word0.replace(/QU/g,'CW').replace(/V/g,'U')
      .replace(/K/g,'C').replace(/Z/g,'S');
    for (let i=0;i<word.length;) {
      const hit=ordered.find(v=>word.startsWith(v.token,i));
      assert(hit,'Unmapped GP rune: '+word.slice(i));
      out.push(hit.index);
      i+=hit.token.length;
    }
  }
  return out;
}

// This control must identify the actual authenticated p56 cipher, not a
// synthetically convenient prime sequence or guessed alphabet.
const p56Cipher=corpus.pages.find(p=>p.page===56).indices;
const p56Plain=encodeGP(
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE');
assert.equal(p56Plain.length,85);
assert.deepEqual(phiDecode(p56Cipher,-1,8),p56Plain);

/** @param {number[]} input @param {number[]} row @param {number[]} column */
function transpose(input,row,column) {
  assert.equal(input.length,121);
  const out=[];
  for (let i=0;i<11;i++)
    for (let j=0;j<11;j++) out.push(input[row[i]*11+column[j]]);
  return out;
}
/** @param {number[]} input @returns {number} */
function ioc(input) {
  const hist=Array(29).fill(0);
  for (const v of input) hist[v]++;
  return hist.reduce((s,n)=>s+n*(n-1),0)/(input.length*(input.length-1));
}

// Two-component/backoff trigram scorer fitted solely to the existing
// independent Shakespeare control corpus, not original LP2 ciphertext.
const reference=encodeGP(read('resources/control/shakespeare_first300k.txt'));
assert.equal(reference.length,218800);
const singles=new Uint32Array(29),bigrams=new Uint32Array(29**2),
  trigrams=new Uint32Array(29**3);
for (let i=0;i<reference.length;i++) {
  singles[reference[i]]++;
  if (i>=1) bigrams[reference[i-1]*29+reference[i]]++;
  if (i>=2) trigrams[(reference[i-2]*29+reference[i-1])*29+reference[i]]++;
}
/** @param {number[]} input @returns {number} */
function score(input) {
  let sum=0;
  for (let i=2;i<input.length;i++) {
    const a=input[i-2],b=input[i-1],c=input[i];
    const p=.8*(trigrams[(a*29+b)*29+c]+.25)/(bigrams[a*29+b]+7.25)
      +.2*(bigrams[b*29+c]+.25)/(singles[b]+7.25);
    sum+=Math.log(p);
  }
  return sum/(input.length-2);
}
const controls=[];
for (let i=0;i<90;i++) {
  const start=2000+i*120;
  controls.push(score(reference.slice(start,start+121)));
}
controls.sort((a,b)=>a-b);
const results=[];
for (const [rowName,row] of Object.entries(permutations))
  for (const [colName,col] of Object.entries(permutations))
    for (const sign of /** @type {Array<-1|1>} */ ([-1,1]))
      for (let mask=0;mask<16;mask++)
        for (const order of ['transpose-then-phi','phi-then-transpose']) {
          const plaintext=order==='transpose-then-phi'
            ?phiDecode(transpose(original,row,col),sign,mask)
            :transpose(phiDecode(original,sign,mask),row,col);
          results.push({rowName,colName,sign,mask,order,
            trigram:score(plaintext),ioc:ioc(plaintext),
            preview:plaintext.slice(0,64).map(x=>corpus.translit[x]).join('')});
        }
results.sort((a,b)=>b.trigram-a.trigram);
assert.equal(results.length,576);
assert.equal(results.filter(x=>x.trigram>=controls[0]).length,0);

// Reversibility of row/column source-derived transposition, independent
// of any GP29 language condition and both inverse geometries.
const encodedSource=reference.slice(25000,25121);
assert.equal(encodedSource.length,121);
for (const row of Object.values(permutations))
  for (const col of Object.values(permutations)) {
    const transformed=transpose(encodedSource,row,col);
    assert.deepEqual(transpose(transformed,
      row.map((_,i)=>row.indexOf(i)),col.map((_,i)=>col.indexOf(i))),encodedSource);
  }
// Two F-transparency positive plants, with the same real φ clock:
// exact masked F=0 positions in ciphertext, and no F bypass.
for (const mask of [0,5]) {
  const planted=reference.slice(25000,25121);
  const fLocations=[8,37,72,113];
  if (mask) for (let j=0;j<4;j++) if(mask&(1<<j))
    planted[fLocations[j]]=0;
  const ciphertext=[], cF=[];
  let clock=0;
  for (let i=0;i<planted.length;i++) {
    if (mask && fLocations.includes(i)
      && (mask&(1<<fLocations.indexOf(i)))) {
      ciphertext.push(0);
    } else ciphertext.push(mod29(planted[i]+(primes[clock++]-1)));
  }
  // The positions of accidental ciphertext zero values can differ from
  // intended transparent Fs, so derive the ciphertext-zero-bit mask exactly.
  for (let i=0;i<ciphertext.length;i++)
    if (ciphertext[i]===0) cF.push(i);
  let actualMask=0;
  for (let j=0;j<cF.length;j++)
    if (mask && fLocations.includes(cF[j])
      && (mask&(1<<fLocations.indexOf(cF[j])))) actualMask|=1<<j;
  assert.deepEqual(phiDecode(ciphertext,-1,actualMask),planted);
}
console.log(JSON.stringify({
  originalPage:32,originalRunes:121,sourceTableCycle:cycle,
  sourceCycleRank:rank,sourceP56Control:'85/85 exact',
  modelCount:results.length,
  originalUnmodifiedIoc:ioc(original),originalTrigram:score(original),
  bestOriginal:results.slice(0,6),
  nativeControlTrigramMin:controls[0],
  nativeControlTrigramMedian:controls[45],
  originalModelsAtOrAboveWeakestControl:0,
  exactPositiveTranspositions:9,
  exactPositivePrimeClockPlants:2,
  decision:'No readable p32 plaintext under this finite historical composition.'
},null,2));
