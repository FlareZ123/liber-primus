'use strict';
/**
 * Test the source-derived primitive GF(29^2) 840-cycle in a genuinely
 * predecessor-excluding GP28 transition channel on original LP2 pp33–39.
 * This is distinct from a GP29 additive pad or its collision filter.
 * No original source proves the hypothesized channel or reserved marker.
 * Windows Node.js 22, CommonJS.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { train, encode } = require('./grid_keyskip_viterbi.cjs');
const { fieldCycle, projections, scoreText } =
  require('./lp2_gf841_period840_collision_keyskip_sft.cjs');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const language = read('resources/control/shakespeare_first300k.txt');
const N = 840, GP = 29, RANK = 28;
const mod29 = x => ((x % GP) + GP) % GP;
const mod28 = x => ((x % RANK) + RANK) % RANK;

/**
 * Invert one 28-way predecessor-exclusion transport with the first observed
 * ciphertext rune used as an IV. Difference zero means reserved GP EA=28.
 * @param {number[]} ciphertext Original GP29 runes
 * @param {number[]} key 840-element field projection
 * @param {number} encodeSign +/- 1
 * @param {number} phase Key-start phase
 * @param {boolean} consumeZero Whether zero-difference marker consumes key
 * @returns {number[]} Recovered content at positions 1..end (IV omitted)
 */
function inverse(ciphertext, key, encodeSign, phase, consumeZero) {
  const plain = [];
  let j = phase;
  for (let i = 1; i < ciphertext.length; i++) {
    const difference = mod29(ciphertext[i] - ciphertext[i - 1]);
    if (difference === 0) {
      plain.push(28);
      if (consumeZero) j = (j + 1) % N;
    } else {
      plain.push(mod28(difference - 1 - encodeSign * (key[j] % RANK)));
      j = (j + 1) % N;
    }
  }
  return plain;
}

/**
 * @param {number[]} plaintext Native GP29 register
 * @param {number[]} key Field cycle projection
 * @param {number} encodeSign +/- 1
 * @param {number} phase Key-start phase
 * @param {boolean} consumeZero
 * @returns {number[]} Ciphertext of same length, first input symbol as IV
 */
function forward(plaintext, key, encodeSign, phase, consumeZero) {
  const ciphertext = [plaintext[0]];
  let j = phase, previous = plaintext[0];
  for (let i = 1; i < plaintext.length; i++) {
    const p = plaintext[i];
    const difference = p === 28 ? 0 : 1 + mod28(p + encodeSign * (key[j] % RANK));
    const c = mod29(previous + difference);
    ciphertext.push(c);
    if (difference !== 0 || consumeZero) j = (j + 1) % N;
    previous = c;
  }
  return ciphertext;
}

function main() {
  const original = [33,34,35,36,37,38,39]
    .flatMap(page => corpus.pages.find(p=>p.page===page).indices);
  assert.equal(original.length, 1680);
  const source = encode(language.slice(230000, 290000)).slice(0, 1680);
  assert.equal(source.length, 1680);
  const model = train(language.slice(0,200000));
  const projectionList = projections(fieldCycle());

  let originalZero = 0;
  for (let i=1;i<original.length;i++) if(original[i]===original[i-1])originalZero++;
  const candidates=[];
  for (const {name,key} of projectionList) {
    for (const sign of [-1,1]) for(const consumeZero of [false,true]) {
      const plant = forward(source,key,sign,227,consumeZero);
      const check = inverse(plant,key,sign,227,consumeZero);
      assert.deepEqual(check,source.slice(1),'True-phase GP28 planted plaintext recovery');
      const forwardRecheck = forward([plant[0],...check],key,sign,227,consumeZero);
      assert.deepEqual(forwardRecheck,plant,'True-phase forward recovery');

      let top = {score:-Infinity,phase:null,plaintext:[]};
      for(let phase=0;phase<N;phase++){
        const plain = inverse(original,key,sign,phase,consumeZero);
        const score = scoreText(plain,model) / plain.length;
        if(score>top.score) top={score,phase,plaintext:plain};
      }
      let nativeBest={score:-Infinity,phase:null,recovered:0};
      for(let phase=0;phase<N;phase++){
        const pp=inverse(plant,key,sign,phase,consumeZero);
        const score=scoreText(pp,model)/pp.length;
        if(score>nativeBest.score) nativeBest={score,phase,
          recovered:pp.reduce((count,p,i)=>count+(p===source[i+1]?1:0),0)};
      }
      assert.ok(nativeBest.recovered>=0.99*(source.length-1),
        'A planted native-GP cipher must be recovered with unknown start phase');
      const histogram = new Uint32Array(GP);
      top.plaintext.forEach(p=>histogram[p]++);
      const n=top.plaintext.length;
      const ioc=histogram.reduce((s,c)=>s+c*(c-1),0)/(n*(n-1));
      const result = {
        projection:name,sign,consumeZero,originalZero,
        score:top.score,phase:top.phase,ioc,
        nativeScore:scoreText(source.slice(1),model)/(source.length-1),
        plantedBestScore:nativeBest.score,plantedRecovered:nativeBest.recovered,
        plantPhase:nativeBest.phase,
        preview:top.plaintext.slice(0,100).map(p=>corpus.translit[p]).join(' ')
      };
      console.log('ORIGINAL '+JSON.stringify(result));
      candidates.push(result);
    }
  }
  const best=candidates.reduce((a,b)=>a.score>b.score?a:b);
  console.log('BEST_ORIGINAL '+JSON.stringify(best));
  console.log('PASS: all 16 models, all 16 planted native controls');
}
if (require.main===module) main();
module.exports={inverse,forward};
