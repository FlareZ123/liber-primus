'use strict';
/**
 * Authenticated 2016 sentence's sixteen words paired in printed order with
 * original LP2 physical pp40-55 (sixteen identical floral-ornament pages).
 * Try two individually source-exemplified historical inverse operations:
 * Stage04 GP-word Vigenere and p56 prime-totient subtraction.
 * This hypothesis does not claim a Cicada-authenticated LP2 key selector.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
const phrase = 'Its words are the map, their meaning is the road, and their numbers are the direction.';
assert(signed.replace(/\s+/g, ' ').includes(phrase));
const words = phrase.match(/[A-Za-z]+/g);
assert.equal(words.length, 16);
const pages = corpus.pages.filter(p => p.page >= 40 && p.page <= 55);
assert.deepEqual(pages.map(p => p.page), Array.from({length:16}, (_, i) => i+40));
assert.equal(pages[10].indices.length, 0);
assert.equal(pages.flatMap(p => p.indices).length, 3316);
const map = new Map(corpus.translit.map((token, index) => [token, index]));
/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/[KQ]/g, 'C').replace(/V/g, 'U').replace(/Z/g, 'S');
  const tokens = [];
  for (let i = 0; i < normalized.length;) {
    if (normalized.startsWith('ING', i)) {
      tokens.push(21);
      i += 3;
      continue;
    }
    const digraph = map.get(normalized.slice(i, i+2));
    if (digraph !== undefined) {
      tokens.push(digraph);
      i += 2;
      continue;
    }
    const single = map.get(normalized[i]);
    assert.notEqual(single, undefined, 'Unrepresentable: '+word);
    tokens.push(single);
    i++;
  }
  return tokens;
}
const p57 = corpus.pages[57].indices;
const tunnel = gp('TUNNELING');
assert(p57.some((_, i) => tunnel.every((v, j) => p57[i+j] === v)));
const wordKeys = words.map(gp);
const primeSums = wordKeys.map(key => key.reduce((sum, v) => sum+corpus.prime[v], 0));
assert.deepEqual(primeSums,
  [143,179,175,72,211,114,288,84,72,204,215,114,295,175,72,337]);
/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  const primes = [];
  for (let n = 2; primes.length < n; n++)
    if (primes.every(p => p*p>n || n%p!==0)) primes.push(n);
  return primes;
}
const primes = firstPrimes(650);
/** @param {number} n @returns {number} */
const mod = n => ((n%29)+29)%29;
/** @param {number[]} a @returns {number} */
function ioc(a) {
  if (a.length<2) return NaN;
  const f = Array(29).fill(0);
  a.forEach(x => f[x]++);
  return f.reduce((sum,n) => sum+n*(n-1),0)/(a.length*(a.length-1));
}
/**
 * No shift/phase fitted to the ciphertext. All sixteen pages reset at offset 0.
 * @param {number[]} runes
 * @param {number} index Page index 0..15
 * @param {'text-guide'|'totient-prime'} mode
 * @param {-1|1} sign
 * @returns {number[]}
 */
function transform(runes, index, mode, sign) {
  const textKey = wordKeys[index];
  const primeOffset = primeSums[index]-1; // One-based word-sum prime rank.
  return runes.map((v,k) => mod(v + sign *
    (mode==='text-guide' ? textKey[k%textKey.length] : primes[primeOffset+k]-1)));
}
// Historical solved p56 control, including precisely its known F exception.
let primeIndex=0;
const decodedP56 = corpus.pages[56].indices.map((v,i) =>
  i===56 ? v : mod(v-(primes[primeIndex++]-1)));
assert.equal(primeIndex,84);
assert.equal(decodedP56.slice(0,5).map(i=>corpus.translit[i]).join(''),'ANEND');
const original = pages.flatMap(p=>p.indices);
const native = (read('resources/control/gibran_prophet_58585.txt')
  .match(/[A-Za-z]+/g)||[]).flatMap(gp);
const nativeWindows = Array.from({length:Math.floor(native.length/3316)},(_,i)=>
  ioc(native.slice(i*3316,(i+1)*3316)));
assert.equal(nativeWindows.length,18);
assert(nativeWindows.every(v=>v>0.058));
const results=[];
for(const mode of ['text-guide','totient-prime']) {
  const deciphered=pages.map((p,i)=>transform(p.indices,i,mode,-1));
  assert.deepEqual(deciphered.map((p,i)=>transform(p,i,mode,1)),
    pages.map(p=>p.indices));
  const planted=pages.map(p=>Array.from({length:p.indices.length},(_,k)=>
    p57[k%p57.length]));
  const encrypted=planted.map((p,i)=>transform(p,i,mode,1));
  assert.deepEqual(encrypted.map((p,i)=>transform(p,i,mode,-1)),planted);
  results.push({mode,originalDecodedIoC:ioc(deciphered.flat()),
    nativePlantRecovered:3316,originalReencrypted:3316,
    byPage:pages.map((p,i)=>({page:p.page,runes:p.indices.length,
      ioc:deciphered[i].length>1?ioc(deciphered[i]):null})),
    first60:deciphered[0].slice(0,60).map(x=>corpus.translit[x]).join(' ')});
}
assert(Math.abs(ioc(original)-0.03446282660786315)<1e-12);
assert(Math.abs(results[0].originalDecodedIoC-0.034393870752346595)<1e-12);
assert(Math.abs(results[1].originalDecodedIoC-0.03459455230547262)<1e-12);
console.log(JSON.stringify({
  source:'Signed 2016 sixteen-word passage; floral-frame LP2 pp40-55',
  originalRunes:original.length,rawIoC:ioc(original),
  words,primeSums,
  nativeGPWindow:{n:nativeWindows.length,length:3316,
    minIoC:Math.min(...nativeWindows),maxIoC:Math.max(...nativeWindows)},
  results,
  conclusion:'Both direct original-page transfers yield nonlinguistic GP29; no unknown plaintext or authentic LP2 key.'
},null,2));
