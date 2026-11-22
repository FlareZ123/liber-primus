'use strict';

/**
 * Source-constrained 2013/2014 prime-count -> LP2 terminal-table AES-256 gate.
 *
 * Independent printed sources:
 *   2013 CicadaOS prime_echo: 464 ascending primes, ending 3301
 *   2014 seventh-onion HTML: title 133, div 331, 58 images in 0..57 order
 *   original LP2 p49-51: 32 rows of eight radix-60 two-glyph byte cells
 *
 * Arithmetic: 133 + 331 = 464 = 58 * 8. Assign the eight successive
 * authentic prime_echo values to the corresponding image/page. For each
 * printed table row r, use prime[p*8 + (r mod 8)] to choose one of its
 * eight byte columns; this makes a unique 32-byte AES-256 key per page.
 *
 * Hypotheses NOT selected by the author: selecting columns using p or p-1
 * residue mod8; AES-256-CTR (zero IV) as a stream generator; byte->GP29
 * shifts through modulo29 or the unbiased byte<232 rejection rule; direct
 * GP29 subtraction without plaintext-F bypass. Predeclare these 2x2 cells,
 * hold all 55 original ciphertext pages untouched. This is an *exclusion*
 * of these exact constructions when native GP29 frequencies are absent,
 * not a proof against cryptographic use of the grid or prime list.
 *
 * SFT: node sims/lp2_prime464_terminaltable_pageaes256_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.join(__dirname, '..');

/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const primeSource = read('resources/historical/cicada2013-os-original-prime-echo.sh');
const html = read('resources/cicada2014-onion7-index.html');
const primes = [...primeSource.matchAll(/echo(?: -n)?\s+"(\d+)/gu)]
  .map(m => Number(m[1]));
const printedImages = [...html.matchAll(/<img src="(\d+)\.jpg"\s*\/>/gu)]
  .map(m => Number(m[1]));
const title = /^<head><title>(\d+)<\/title><\/head>$/m.exec(html);
const div = /<div id="(\d+)">/u.exec(html);
assert(title && div);
assert.deepEqual([Number(title[1]), Number(div[1])], [133, 331]);
assert.equal(Number(title[1]) + Number(div[1]), 464);
assert.deepEqual(printedImages, Array.from({length:58}, (_, i) => i));
assert.equal(primes.length, 464);
assert.equal(primes[0], 2);
assert.equal(primes[173], 1033);
assert.equal(primes.at(-1), 3301);
assert.equal(grid.bytes.length, 256);
assert.equal(grid.shape.length > 0, true);
assert.equal(corpus.pages.length, 58);
assert.equal(corpus.pages[50].indices.length, 0);
assert.equal(corpus.pages.slice(0,56).reduce((n,p) => n+p.indices.length,0),12956);

/**
 * @param {number} page
 * @param {number} subtract 0 or 1, applied to the prime before modulus8
 * @returns {Buffer}
 */
function pageKey(page, subtract) {
  assert(page >= 0 && page < 58 && Number.isInteger(page));
  assert(subtract === 0 || subtract === 1);
  return Buffer.from(Array.from({length:32}, (_, row) =>
    grid.bytes[row*8 + ((primes[page*8 + row%8]-subtract)%8)]));
}

/**
 * @param {Buffer} key AES256 key
 * @param {number} length bytes requested
 * @returns {Buffer}
 */
function aesPad(key, length) {
  const c = crypto.createCipheriv('aes-256-ctr',key,Buffer.alloc(16));
  return Buffer.concat([c.update(Buffer.alloc(length)),c.final()]);
}

/**
 * @param {Buffer} pad
 * @param {number} count
 * @param {boolean} reject Whether to reject octets 232..255
 * @returns {number[]}
 */
function shifts(pad, count, reject) {
  const out = [];
  for (const b of pad) {
    if (!reject || b < 232) out.push(b%29);
    if (out.length === count) break;
  }
  assert.equal(out.length,count);
  return out;
}

/**
 * @param {number[]} source Original GP29 ciphertext, no plaintext-F skip
 * @param {number[]} pad GP29 shifts
 * @param {number} sign +1 encrypt, -1 decrypt
 * @returns {number[]}
 */
function apply(source,pad,sign) {
  return source.map((v,i) => (v + sign*pad[i] + 58)%29);
}

/** @param {number[]} x @returns {number} */
function ioc(x) {
  const a=Array(29).fill(0);
  for(const n of x) a[n]++;
  return a.reduce((s,n)=>s+n*(n-1),0)/(x.length*(x.length-1));
}

/** @param {number[]} indices @returns {string} */
function latin(indices) {
  return indices.map(i => corpus.translit[i]).join('');
}

const sample = corpus.pages[57].indices;
assert.equal(sample.length,95);
const nativeIoc = ioc(sample);
const originals = corpus.pages.slice(0,56).filter(p=>p.indices.length);
assert.equal(originals.length,55);
const modes = [];
for (const subtract of [0,1]) {
  for (const reject of [false,true]) {
    const all=[];
    const perPage=[];
    const pagePreviews=[];
    let knownPlantDecoded=0;
    for(const page of originals){
      const key=pageKey(page.page,subtract);
      const bytes=aesPad(key,page.indices.length*4+64);
      const pad=shifts(bytes,page.indices.length,reject);
      const plain=apply(page.indices,pad,-1);
      const recon=apply(plain,pad,1);
      assert.deepEqual(recon,page.indices,'re-encrypt unchanged original');
      const control=Array.from({length:page.indices.length},(_,i)=>sample[i%sample.length]);
      assert.deepEqual(apply(apply(control,pad,1),pad,-1),control);
      knownPlantDecoded+=control.length;
      perPage.push({page:page.page,n:page.indices.length,ioc:ioc(plain)});
      if([0,1,2,27,39,54,55].includes(page.page))
        pagePreviews.push({page:page.page,first40:latin(plain.slice(0,40)),
          ioc:ioc(plain)});
      all.push(...plain);
    }
    assert.equal(knownPlantDecoded,12956);
    modes.push({primeResidue:subtract===0?'p mod 8':'(p-1) mod 8',
      byteReducer:reject?'reject octet>=232, then mod29':'octet mod29',
      originalUnknownRunes:all.length,pooledIoc:ioc(all),
      minPageIoc:Math.min(...perPage.map(x=>x.ioc)),
      maxPageIoc:Math.max(...perPage.map(x=>x.ioc)),
      pagesAbove05:perPage.filter(x=>x.ioc>=0.05).map(x=>x.page),
      firstThreeConcatenatedIoc:ioc(all.slice(0,729)),
      selectedPagePreviews:pagePreviews,
      nativeControlRecovery:knownPlantDecoded});
  }
}

assert.equal(new Set(Array.from({length:58},(_,i)=>pageKey(i,0).toString('hex'))).size,58);
assert.equal(modes.length,4);
const output={
  status:'reversible original-input scope test; no original unknown plaintext recovered',
  sourceContract:'133+331=464=58*8, authentic 2013 prime_echo, original 32x8 LP2 grid',
  sourceDerivedKeyCount:58,keyLengthBytes:32,
  aes256CtrIv:'00000000000000000000000000000000 (unsupplied assumption)',
  nativeSolvedP57Ioc:nativeIoc,originalUnchangedIoc:ioc(originals.flatMap(p=>p.indices)),
  modes,
  interpretation:'AES, IV, byte reducer, and prime residue are analyst hypotheses; no source authenticates this cipher. The original plaintext remains unknown unless any mode demonstrates independent native-language recovery.'
};
console.log(JSON.stringify(output,null,2));
