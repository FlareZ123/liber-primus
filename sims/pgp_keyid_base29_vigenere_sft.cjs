'use strict';
/**
 * Source-fixed OpenPGP key-ID -> GP29 key challenge.
 *
 * The 2016 signed body explicitly says "Verify OpenPGP 7A35090F". The
 * signature packet carries the full 64-bit issuer ID 181F01E57A35090F,
 * which is the suffix of Cicada's authenticated 2012 public-key fingerprint.
 * Convert those source numbers to standard big-endian base-29 digits, then
 * test the resulting short GP keys as direct additive Vigenere keys.
 *
 * A second nested candidate is the large prime factor of the explicitly
 * printed 32-bit suffix. This is a small, frozen source-derived family:
 * full64 ID (13 GP digits), short32 suffix (7), and its large prime factor (5).
 *
 * No fitted KDF, key rotation, arbitrary phase, or language-selected clock.
 * Clocks are only book start, physical-page reset, or the 31 printed 13-dot
 * fragment boundaries. Both additive signs are tested.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {train, encode} = require('./grid_keyskip_viterbi.cjs');
const {plainScore} = require('./grid_latin_register_inverse.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
const MOD = 29;
const mod = x => (x % MOD + MOD) % MOD;

function base29(n) {
  n = BigInt(n);
  const out = [];
  while (n > 0n) { out.unshift(Number(n % 29n)); n /= 29n; }
  return out;
}
function powmod(a, e, n) {
  let r = 1n;
  while (e > 0n) {
    if (e & 1n) r = r * a % n;
    a = a * a % n;
    e >>= 1n;
  }
  return r;
}
// Deterministic Miller-Rabin bases for all unsigned 64-bit integers.
function isPrime64(n) {
  n = BigInt(n);
  if (n < 2n) return false;
  for (const p of [2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n]) {
    if (n === p) return true;
    if (n % p === 0n) return false;
  }
  let d = n - 1n, s = 0;
  while ((d & 1n) === 0n) { d >>= 1n; s++; }
  for (const base of [2n,325n,9375n,28178n,450775n,9780504n,1795265022n]) {
    const a = base % n;
    if (a === 0n) continue;
    let x = powmod(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    let witness = true;
    for (let r = 1; r < s; r++) {
      x = x * x % n;
      if (x === n - 1n) { witness = false; break; }
    }
    if (witness) return false;
  }
  return true;
}
function issuerIdFromSignature() {
  const match = signed.match(/-----BEGIN PGP SIGNATURE-----\r?\nVersion: [^\r\n]+\r?\n\r?\n([\s\S]*?)\r?\n-----END PGP SIGNATURE-----/u);
  assert.ok(match, '2016 signature armor');
  const b64 = match[1].split(/\r?\n/u).filter(x => x && !x.startsWith('=')).join('');
  const packet = Buffer.from(b64, 'base64');
  assert.equal(packet.length, 543);
  const body = packet.subarray(3);
  assert.deepEqual(Array.from(body.subarray(0, 4)), [4,1,1,2]);
  const hlen = body.readUInt16BE(4);
  const uoff = 6 + hlen;
  const ulen = body.readUInt16BE(uoff);
  const unhashed = body.subarray(uoff + 2, uoff + 2 + ulen);
  assert.equal(unhashed.toString('hex'), '0910181f01e57a35090f');
  return unhashed.subarray(2).toString('hex').toUpperCase();
}
function sourceKeys() {
  const fullHex = issuerIdFromSignature();
  const shortMatch = signed.match(/Verify OpenPGP ([0-9A-F]{8})/u);
  assert.ok(shortMatch, 'explicit short key ID in signed cleartext');
  const shortHex = shortMatch[1];
  assert.equal(fullHex.slice(-8), shortHex);
  assert.equal(fullHex, '181F01E57A35090F');
  // Independently archived 2012 fingerprint ends with this exact issuer ID.
  const fingerprint = '6D854CD7933322A601C3286D181F01E57A35090F';
  assert.equal(fingerprint.slice(-16), fullHex);
  const full = BigInt('0x' + fullHex);
  const short = BigInt('0x' + shortHex);
  const largeFactor = 2673137n;
  assert.equal(short, 13n * 59n * largeFactor);
  assert.ok(isPrime64(full), 'full 64-bit issuer ID is prime');
  assert.ok(isPrime64(largeFactor), 'large short-ID factor is prime');
  assert.equal(String(largeFactor).split('').reduce((s,c)=>s+Number(c),0), 29);
  const candidates = [
    {name:'full64-issuer-id', sourceHex:fullHex, number:full, key:base29(full)},
    {name:'explicit-short32-id', sourceHex:shortHex, number:short, key:base29(short)},
    {name:'short32-large-prime-factor', sourceHex:String(largeFactor), number:largeFactor, key:base29(largeFactor)}
  ];
  assert.deepEqual(candidates.map(x=>x.key.length), [13,7,5]);
  for (const c of candidates) {
    assert(c.key.every(x => Number.isInteger(x) && x >= 0 && x < 29));
    c.translit = c.key.map(x => corpus.translit[x]).join('');
  }
  return {
    issuerId64:fullHex, explicitShortId32:shortHex,
    shortIdFactorization:'13 × 59 × 2673137',
    fullIdPrime:true, largeFactorPrime:true, largeFactorDigitSum:29,
    candidates
  };
}
function originalSegments() {
  const pages = corpus.pages.slice(0, 56).map(p => p.indices);
  assert.equal(pages.reduce((n,p)=>n+p.length,0), 12956);
  const starts = [];
  let base = 0;
  const pageStart = [];
  for (const p of corpus.pages) { pageStart[p.page] = base; base += p.indices.length; }
  const marks = ink.pages.flatMap(p => (p.large_punctuation || [])
    .filter(m => m[1] === 13)
    .map(m => ({page:p.page, offset:m[0], global:pageStart[p.page]+m[0]})))
    .sort((a,b)=>a.global-b.global);
  assert.equal(marks.length, 31);
  const all = corpus.pages.flatMap(p => p.indices);
  const boundaries = [0, ...marks.map(m => m.global)];
  const fragments = boundaries.map((s,i) => all.slice(s, boundaries[i+1] ?? all.length));
  assert.equal(fragments.length, 32);
  assert.deepEqual(fragments.map((f,i)=>f.length===0?i:-1).filter(i=>i>=0), [8,11]);
  const unknownFragments = fragments.slice(0,28);
  assert.equal(unknownFragments.reduce((n,f)=>n+f.length,0),12956);
  return {
    book:[pages.flat()],
    page:pages,
    fragment:unknownFragments,
    source:{runes:12956,marks:31,fragments:32,emptyFragments:[8,11]}
  };
}
function crypt(segments, key, sign, decrypt) {
  return segments.map(segment => segment.map((x,i) =>
    mod(x + (decrypt ? sign : -sign) * key[i % key.length])));
}
function ioc(x) {
  const h = Array(29).fill(0);
  for (const c of x) h[c]++;
  return h.reduce((s,n)=>s+n*(n-1),0)/(x.length*(x.length-1));
}
function translit(x) { return x.slice(0,120).map(i=>corpus.translit[i]).join(''); }
function main() {
  const keys = sourceKeys();
  const clocks = originalSegments();
  const controlText = read('resources/control/shakespeare_first300k.txt');
  const lm = train(controlText.slice(0,190000));
  const native = encode(controlText.slice(205000));
  assert(native.length >= 12956);
  const results = [];
  for (const candidate of keys.candidates) {
    for (const clock of ['book','page','fragment']) {
      const segments = clocks[clock];
      const original = segments.flat();
      assert.equal(original.length,12956);
      for (const sign of [-1,1]) {
        const decoded = crypt(segments,candidate.key,sign,true);
        const flat = decoded.flat();
        const plantedSegments = [];
        let off = 0;
        for (const seg of segments) {
          plantedSegments.push(native.slice(off,off+seg.length));
          off += seg.length;
        }
        assert.equal(off,12956);
        const plantedCipher = crypt(plantedSegments,candidate.key,sign,false);
        assert.deepEqual(crypt(plantedCipher,candidate.key,sign,true),plantedSegments,
          'source-native positive control exact recovery');
        assert.deepEqual(crypt(decoded,candidate.key,sign,false),segments,
          'original input exact re-encryption');
        results.push({
          key:candidate.name,keyLength:candidate.key.length,
          keyDigits:candidate.key,keyTranslit:candidate.translit,
          clock,sign,scorePerRune:plainScore(flat,lm),
          ioc:ioc(flat),ECount:flat.filter(x=>x===18).length,
          prefix:translit(flat)
        });
      }
    }
  }
  const baseline = clocks.book[0];
  results.sort((a,b)=>b.scorePerRune-a.scorePerRune);
  return {
    source:keys,
    segmentation:clocks.source,
    modelCount:results.length,
    untreated:{scorePerRune:plainScore(baseline,lm),ioc:ioc(baseline),
      ECount:baseline.filter(x=>x===18).length,prefix:translit(baseline)},
    best:results[0],
    results
  };
}
if (require.main === module) console.log(JSON.stringify(main(),null,2));
module.exports = {base29,isPrime64,sourceKeys,originalSegments,crypt,main};
