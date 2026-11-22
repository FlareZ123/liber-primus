#!/usr/bin/env node
'use strict';
// Source-frozen signed-2016 PRNG line:character gate. Agent28, November 2026.
// Reproduction from original repository files; run: node sims/2016_prng_linechar_source_gate.cjs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const raw = read('resources/liber-primus/lp2-transcription.txt');
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
const text = signed.match(/Its words are the map,\s*their\s+meaning is the road,\s*and their numbers are the direction\./i);
assert.ok(text, 'Original 2016 instruction text missing');
const words = text[0].toUpperCase().match(/[A-Z]+/g);
assert.equal(words.length, 16);
const glyph = new Map(corpus.runes.map((ch, i) => [ch, i]));
const tokens = corpus.translit.map((t, i) => ({t, i})).sort((a,b) => b.t.length - a.t.length);
/** @param {string} value */
function gp(value) {
  const source = value.replaceAll('V','U').replaceAll('K','C').replaceAll('Z','S');
  const out = [];
  for(let pos=0;pos<source.length;) {
    const t = tokens.find(x => source.startsWith(x.t, pos));
    assert.ok(t,'Unencodable GP token at ' + source.slice(pos));
    out.push(t.i);
    pos += t.t.length;
  }
  return out;
}
const lines = raw.split('%').slice(0, 55).flatMap(
  p => p.replaceAll('/','').split(/\r?\n/u).filter(s => s.trim())
);
const translations = xs => xs.map(x => typeof x === 'number' ? corpus.translit[x] : x).join('');
const table = words.map(word => {
  const primeSum = gp(word).reduce((acc, x) => acc + corpus.prime[x], 0);
  const q = Math.floor(primeSum / 29), r = primeSum % 29;
  const full = [...lines[r]];
  const runeOnly = full.filter(x => glyph.has(x));
  const omitSpace = full.filter(x => x !== '-');
  const lookup = seq => glyph.has(seq[q]) ? glyph.get(seq[q]) : seq[q] || null;
  const reversed = [...lines[q]].filter(x => glyph.has(x));
  return {
    word, primeSum, quotient:q, remainder:r,
    coordinate:[r+1,q+1],
    rune:lookup(runeOnly),
    spaceIgnoring:lookup(omitSpace),
    printed:lookup(full),
    reverseInBounds:r < reversed.length,
    reverseRune: reversed[r] || null
  };
});
assert.equal(translations(table.map(x => x.rune)), 'LCBPPRNGNGPARRTHBPC');
assert.equal(translations(table.slice(4,7).map(x => x.rune)), 'PRNG');
assert.equal(translations(table.slice(4,7).map(x => x.printed)), 'XRE');
assert.equal(translations(table.slice(4,7).map(x => x.spaceIgnoring)), 'PRNG');
assert.deepEqual(table.filter(x => !x.reverseInBounds).map(x => x.word), ['ITS','THEIR','IS','THEIR']);
const remainder = table.filter((_, i) => i < 4 || i > 6).map(x => x.rune);
assert.equal(remainder.length, 13);
assert.equal(translations(remainder), 'LCBPNGPARRTHBPC');
const asInteger = remainder.reduce((v, ix) => v*29n+BigInt(ix), 0n);
assert.equal(asInteger, 7144649572585460758n);

/**
 * OutGuess 0.4 source-native ARC4 stream, faithfully reflecting
 * arc4_initkey(type,key) -> MD5(type || password), arc4_addrandom, arc4_getbyte.
 * Source: resurrecting-open-source-projects/outguess/src/arc.c.
 * The 'Encryption' role is used by OutGuess to encrypt carrier data;
 * 'Seeding' is its independent iterator role, an explicit wrong-role control.
 * @param {string} key Original-derived ASCII password candidate
 * @param {string} type Role string in OutGuess source
 * @param {number} n Number of key bytes
 */
function outguessArc4(key, type, n) {
  const digest = createHash('md5').update(type+key,'ascii').digest();
  const s = Uint8Array.from({length:256}, (_, i) => i);
  let i = 255, j = 0;
  for(let k=0;k<256;k++) {
    i = (i+1)&255;
    const si = s[i];
    j = (j+si+digest[k%16])&255;
    const old=s[i];s[i]=s[j];s[j]=old;
  }
  const stream = new Uint8Array(n);
  for(let k=0;k<n;k++) {
    i=(i+1)&255;
    const si=s[i];
    j=(j+si)&255;
    const sj=s[j];
    s[i]=sj;s[j]=si;
    stream[k]=s[(si+sj)&255];
  }
  return stream;
}
/** @param {number[]} xs */
function ioc(xs) {
  const count = Array(29).fill(0);
  for(const ix of xs)count[ix]++;
  return count.reduce((acc, x) => acc+x*(x-1), 0)/(xs.length*(xs.length-1));
}
const unsolved = corpus.pages.filter(p => p.page <=55 && p.indices && p.indices.length);
const all = unsolved.flatMap(p => p.indices);
assert.equal(all.length,12956);
const firstPage = unsolved[0].indices.length;
const candidates = [];
// These are bounded source-derived interpretations, not an arbitrary seed sweep.
for (const key of [translations(remainder), asInteger.toString()]) {
  for(const role of ['Encryption','Seeding']) {
    const stream=outguessArc4(key,role,all.length);
    for(const sign of [-1,1]) {
      const decoded=all.map((ix,i)=>(ix+sign*stream[i]+29*10)%29);
      candidates.push({
        key,role,sign,fullIoc:Number(ioc(decoded).toFixed(10)),
        page0Ioc:Number(ioc(decoded.slice(0,firstPage)).toFixed(10)),
        page0Start:translations(decoded.slice(0,30))
      });
    }
  }
}
assert.equal(candidates.length,8);
assert.ok(candidates.every(c => c.fullIoc < 0.035));
console.log(JSON.stringify({
  status:'PASS: exact signed-2016 PRNG substring, source-convention controls, bounded OutGuess inverse',
  sourceInstructionWords:words,
  coordinates:table.map(({word,primeSum,coordinate,rune,printed})=>({word,primeSum,coordinate,rune:translations([rune]),printed:translations([printed])})),
  sourceRuneOutput:translations(table.map(x=>x.rune)),
  historical2012LiteralCharOutput:translations(table.map(x=>x.printed)),
  historicallyAttestedSpaceIgnoringOutput:translations(table.map(x=>x.spaceIgnoring)),
  swappedOutOfBounds:table.filter(x=>!x.reverseInBounds).map(x=>x.word),
  detached13RuneCandidate:translations(remainder),
  extraBase29Integer:asInteger.toString(),
  cipherTests:candidates,
  conclusion:'A PRNG mnemonic appears under a retrospectively selected address grammar; no source-selected generator/state and no LP2 plaintext recovered.'
}, null, 2));
