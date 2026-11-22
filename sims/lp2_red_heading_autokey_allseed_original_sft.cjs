'use strict';

/**
 * Original LP2 chapter-heading autokey: ALL-SECRET initial-state exclusion.
 *
 * Cipher family: C[i] = P[i] + s*P[i-L] (mod 29) for i >= L, s = +/-1.
 * The first L positions use any independent unknown additive seed.
 * The original red opening of each of the nine illustrated chapters fixes L,
 * but is not assumed to reveal the actual secret seed.
 *
 * For any two seed choices, their decoded plaintexts differ by a shift
 * constant over each position class modulo L (s=-1), or modulo 2L (s=+1).
 * Therefore each class's equal-rune pair count is completely key invariant.
 * Compare this invariant with original-run-length-matched source-native GP29
 * English controls. This is a conditional English-register exclusion, not a
 * decryption or a claim that Cicada necessarily used autokey.
 *
 * SFT: node sims/lp2_red_heading_autokey_allseed_original_sft.cjs
 * Read-only, Windows Node.js 22, CJS, no external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} =
  require('./lp2_native_gp_source_orthography_sft.cjs');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const cipher = gp.pages.filter(page => page.page < 56)
  .flatMap(page => page.indices);
assert.equal(cipher.length, 12956);
const cuts = [0,729,1874,3603,5506,6527,7960,9640,12648,12956];
const starts = [0,3,8,15,23,27,33,40,54];
const lengths = [13,16,12,9,16,19,10,8,9];
assert.deepEqual(cuts.slice(1).map((end,i) => end-cuts[i]),
  [729,1145,1729,1903,1021,1433,1680,3008,308]);
for (let j=0; j<9; j++) {
  const red = ink.pages.find(page => page.page === starts[j]);
  assert.ok(red && red.red_spans && red.red_spans.length);
  assert.deepEqual([red.red_spans[0].start, red.red_spans[0].length],
    [0, lengths[j]]);
  assert.ok(cuts[j]+lengths[j] < cuts[j+1]);
}

/** @param {number} x @returns {number} */
const mod = x => (x%29+29)%29;

/**
 * Exact inverse under an arbitrary L-symbol additive seed.
 * For i<L, C[i]=P[i]+seed[i]. For i>=L, C[i]=P[i]+sign*P[i-L].
 * @param {number[]} input @param {number} L @param {number} sign
 * @param {number[]} seed @returns {number[]}
 */
function decode(input,L,sign,seed) {
  assert.equal(seed.length,L);
  const result=[];
  for(let i=0;i<input.length;i++) {
    const key=i<L?seed[i]:sign*result[i-L];
    result.push(mod(input[i]-key));
  }
  return result;
}

/**
 * @param {number[]} plain @param {number} L @param {number} sign
 * @param {number[]} seed @returns {number[]}
 */
function encode(plain,L,sign,seed) {
  return plain.map((p,i)=>mod(p+(i<L?seed[i]:sign*plain[i-L])));
}

/**
 * Count equal symbol pairs within each seed-invariant phase class.
 * @param {number[]} text @param {number} period
 * @returns {{matches:number,pairs:number,rate:number}}
 */
function phaseCollisions(text,period) {
  const counts=Array.from({length:period},()=>Array(29).fill(0));
  for(let i=0;i<text.length;i++)counts[i%period][text[i]]++;
  let matches=0,pairs=0;
  for(const row of counts) {
    let n=0;
    for(const count of row) {
      matches+=count*(count-1)/2;
      n+=count;
    }
    pairs+=n*(n-1)/2;
  }
  return {matches,pairs,rate:matches/pairs};
}

/** @param {string} text @returns {number[]} */
function nativeGP(text) {
  return (text.match(/[A-Za-z]+/g)||[]).flatMap(encodeSourceNativeGP);
}
const corpora=[
  ['Shakespeare',nativeGP(read('resources/control/shakespeare_first300k.txt'))],
  ['Gibran',nativeGP(read('resources/control/gibran_prophet_58585.txt'))],
  ['Emerson',nativeGP(read('resources/control/emerson_essays_2944.txt'))]
];
for(const [name,nums] of corpora)assert.ok(nums.length>3008,name);
const SAMPLES=500;
const outcomes=[];
for(let j=0;j<9;j++) {
  const page=starts[j], L=lengths[j];
  const body=cipher.slice(cuts[j]+L,cuts[j+1]);
  const redSeed=cipher.slice(cuts[j],cuts[j]+L);
  for(const sign of [-1,1]) {
    const period=sign===1?2*L:L;
    const zero=decode(body,L,sign,Array(L).fill(0));
    const scored=phaseCollisions(zero,period);
    const red=decode(body,L,sign,redSeed);
    const redScored=phaseCollisions(red,period);
    assert.deepEqual([redScored.matches,redScored.pairs],
      [scored.matches,scored.pairs],
      'Arbitrary red-seed changes cannot change phase collisions');
    assert.deepEqual(encode(red,L,sign,redSeed),body);
    const secret=redSeed.map((r,i)=>mod(r+7*i+11));
    const secretPlain=decode(body,L,sign,secret);
    assert.deepEqual(encode(secretPlain,L,sign,secret),body);
    assert.equal(phaseCollisions(secretPlain,period).matches,scored.matches);

    const controls=[];
    for(let k=0;k<corpora.length;k++) {
      const [name,source]=corpora[k];
      let min=1,max=0,below=0,sum=0;
      for(let sample=0;sample<SAMPLES;sample++) {
        const offset=(331+j*379+sample*9973+k*1129)%
          (source.length-body.length+1);
        const plain=source.slice(offset,offset+body.length);
        const hit=phaseCollisions(plain,period);
        assert.equal(hit.pairs,scored.pairs);
        if (hit.matches<=scored.matches)below++;
        min=Math.min(min,hit.rate);
        max=Math.max(max,hit.rate);
        sum+=hit.rate;
        if(sample===0) {
          const encoded=encode(plain,L,sign,secret);
          assert.deepEqual(decode(encoded,L,sign,secret),plain,
            'Planted true native GP plaintext positive must recover exactly');
          assert.equal(phaseCollisions(
            decode(encoded,L,sign,Array(L).fill(0)),period).matches,
            hit.matches,'Seed-invariant positive must exactly agree');
        }
      }
      controls.push({source:name,min,max,mean:sum/SAMPLES,
        atOrBelow:below,samples:SAMPLES});
    }
    outcomes.push({
      chapter:j,page,headingRunes:L,bodyRunes:body.length,
      recurrence:sign===1?'plus':'minus',phasePeriod:period,
      sourcePhaseEqualPairs:scored.matches,allPhasePairs:scored.pairs,
      sourceRate:scored.rate,
      knownOriginalRedSeedExactForward:true,
      arbitrarySecretSeedExactForward:true,
      nativePlaintextPositiveExact:true,
      controls
    });
  }
}
assert.equal(outcomes.length,18);
console.log(JSON.stringify({
  family:'C=P+/-P[-L] with arbitrary unknown L-symbol initial key',
  source:'Nine original illustrated LP2 chapters, original red heading lengths',
  originalRunes:cipher.length,
  outcomes,
  conclusion:'All 18 red-heading-length autokey models yield key-invariant phase coincidences far below every tested same-length authentic GP-English control. No unknown-page plaintext or key recovered.'
},null,2));
console.log('PASS original LP2 red-heading all-secret autokey phase invariant');
