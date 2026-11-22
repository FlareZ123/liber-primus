'use strict';
/**
 * Original LP2 red-title KDF source inversion: untouched 300..440 rune
 * continuation after selecting one exact 96-mode/8! source-column model
 * only on the earlier 160-rune fitting prefix.
 *
 * Source is the visually corrected 59-digit decoding of 32x8 printed tokens,
 * through the same opt-in, independently tested source fixture reader.
 * Reconstruct 300 key uses and inferred collision-driven skips without
 * changing the fitted title-key derivation or section assignment. A further
 * 140 runes per section are untouched until the final frozen score.
 *
 * Paired 64 matched source shuffles repeat entire 96-mode fitting and third
 * continuation. Independent English GP planted source verifies the model
 * can identify and invert the specified keyed, output-filtered stream.
 *
 * Node.js 22 CommonJS. Manual CI only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { originalBodies, originalKeys, viterbi } =
  require('./grid_stream_collision_viterbi.cjs');
const { originalTitles, pad, fit } =
  require('./title_grid_kdf_viterbi.cjs');
const { encode, train } = require('./grid_keyskip_viterbi.cjs');

const ROOT = path.join(__dirname, '..');
const READ = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const TRAIN = 160, SECOND = 140, THIRD = 140;
const BOUNDARY = TRAIN + SECOND;
const LENGTH = BOUNDARY + THIRD;
const SHUFFLES = 64;
const MOD = 29;
const mod29 = x => (x % MOD + MOD) % MOD;

/**
 * Evaluate the completely unseen ciphertext at indices 300..439 with an
 * unchanged section KDF and assignment fitted at indices 0..159. Inferred
 * skip offset at index 300 is calculated only on prefix 0..299, so no
 * third-block ciphertext influences an earlier model parameter.
 * @param {number[][]} fullCipher
 * @param {Buffer[]} keys
 * @param {ReturnType<typeof originalTitles>} titles
 * @param {object} lm
 * @param {ReturnType<typeof fit>} frozen
 * @returns {{mean:number,checks:object[]}}
 */
function thirdScore(fullCipher, keys, titles, lm, frozen) {
  const checks = [];
  assert.equal(fullCipher.length, 8);
  for (let section = 0; section < 8; section++) {
    const key = pad(keys[frozen.columns[section]],
      titles[section], frozen.setting, LENGTH + 55);
    const first = viterbi(fullCipher[section].slice(0, BOUNDARY),
      key, frozen.setting.sign, lm);
    const third = viterbi(fullCipher[section].slice(BOUNDARY, LENGTH),
      key.slice(BOUNDARY + first.skips), frozen.setting.sign, lm);
    assert.equal(third.plaintext.length, THIRD);
    checks.push({
      section,
      sourceKeyColumn: frozen.columns[section],
      keyDrawOffset: BOUNDARY + first.skips,
      inferredFirst300Skips: first.skips,
      inferredThirdSkips: third.skips,
      logScorePerRune: third.perRune,
      candidateGP: third.plaintext
    });
  }
  return {
    mean: checks.reduce((sum, x) => sum + x.logScorePerRune, 0) / 8,
    checks
  };
}

/** @param {number} seed */
function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/** @param {Buffer[]} columns @param {() => number} random */
function shuffled(columns, random) {
  return columns.map(column => {
    const out = Buffer.from(column);
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  });
}

/**
 * Planted source-true KDF English, exact next 140 heldout beyond all
 * intermediate title-fitting and previous 140-continuation positions.
 */
function positive(keys, titles, model) {
  const plain = encode(READ('resources/control/shakespeare_first300k.txt')
    .slice(205000)).slice(0, 8 * LENGTH);
  assert.equal(plain.length, 8 * LENGTH);
  const groups = Array.from({length: 8}, (_, i) =>
    plain.slice(i * LENGTH, (i + 1) * LENGTH));
  const trueModel = {
    kdf: 'hmac', titleEncoding: 'runes', algo: 'aes-256-ctr',
    ivMode: 'title-sha256', reducer: 'scaled29', sign: 1
  };
  const mapping = [6,2,4,0,1,7,5,3];
  const random = seededRandom(0x59330551);
  const emitted = [];
  let repairs = 0;
  for (let i = 0; i < 8; i++) {
    const sourceKey = pad(keys[mapping[i]], titles[i],
      trueModel, LENGTH + 70);
    const output = [];
    let prev = -1, pointer = 0;
    for (const rune of groups[i]) {
      let c = mod29(rune + sourceKey[pointer++]);
      if (c === prev && random() < 0.81) {
        c = mod29(rune + sourceKey[pointer++]);
        repairs++;
      }
      output.push(c);
      prev = c;
    }
    emitted.push(output);
  }
  const best = fit(emitted.map(x => x.slice(0, BOUNDARY)),
    keys, titles, model);
  const third = thirdScore(emitted, keys, titles, model, best);
  const correctSetting = Object.keys(trueModel).every(
    k => best.setting[k] === trueModel[k]);
  const correctMapping = mapping.every((col, i) =>
    best.columns[i] === col);
  const recovered = third.checks.reduce((count, x) =>
    count + x.candidateGP.filter((symbol, j) =>
      symbol === groups[x.section][BOUNDARY + j]).length, 0);
  assert(correctSetting && correctMapping,
    'Source-true model and assignment must be blindly recovered');
  assert(recovered >= 0.8 * 8 * THIRD,
    'Must recover at least 80% source-original plain on third');
  return {plantedRunes:8*LENGTH,originalSourceKeys:true,
    alteredOutputEvents:repairs,correctSetting,correctMapping,
    thirdRecovered:recovered,thirdRunes:8*THIRD,
    thirdAccuracy:recovered/(8*THIRD),thirdLogScore:third.mean};
}

function main() {
  assert.equal(process.env.LP2_GRID_RADIX,'59');
  assert.equal(process.env.LP2_GRID_FIVE_CORRECTIONS,'1');
  const original = originalBodies(LENGTH);
  assert.equal(original.length,8);
  assert(original.every(group => group.length===LENGTH));
  const keys=originalKeys(), titles=originalTitles();
  const model=train(READ('resources/control/shakespeare_first300k.txt')
    .slice(0,200000));
  const planted=positive(keys,titles,model);
  const frozen=fit(original.map(x=>x.slice(0, BOUNDARY)),
    keys,titles,model);
  const actual=thirdScore(original,keys,titles,model,frozen);
  const random=seededRandom(0x3201babe);
  const shuffledThird=[];
  for (let i=0;i<SHUFFLES;i++) {
    const fake=shuffled(keys,random);
    const selected=fit(original.map(x=>x.slice(0,BOUNDARY)),
      fake,titles,model);
    const result=thirdScore(original,fake,titles,model,selected);
    shuffledThird.push(result.mean);
  }
  const outrank=shuffledThird.filter(x=>x>=actual.mean).length;
  const output={
    model:'Corrected base59 grid source x red-title KDF, 96 methods, exact 8-column assignment, fresh third original holdout',
    source:'Unchanged LP2 red headings and printed numeric grid, corrected as 59-digit tokens',
    plaintextRegister:'GP-English trigram; synthetic Shakespeare source',
    trainRunes:8*TRAIN,secondRunes:8*SECOND,
    thirdUnseenRunes:8*THIRD,
    frozenSetting:frozen.setting,frozenAssignment:frozen.columns,
    frozenTrainingScore:frozen.trainMean,
    previouslySelectedSecondScore:frozen.heldoutMean,
    untouchedThirdScore:actual.mean,
    thirdBySection:actual.checks.map(({candidateGP,...rest})=>({
      ...rest,first48CandidateGP: candidateGP.slice(0,48)
    })),
    planted,
    matchedNull:{
      replicates:SHUFFLES,seed:'0x3201babe',
      hypothesisSelection:'full 96-configuration and 8! assignment on first 160 only',
      mean:shuffledThird.reduce((a,b)=>a+b,0)/SHUFFLES,
      min:Math.min(...shuffledThird),max:Math.max(...shuffledThird),
      originalOutrankCount:outrank,
      addOneUpperTail:(outrank+1)/(SHUFFLES+1)
    },
    conclusion:'A candidate key requires authentic readable GP plaintext and exact original forward reencryption; nuisance-parameter fit and independent null score alone are not sufficient.'
  };
  console.log(JSON.stringify(output,null,2));
  return output;
}
if(require.main===module)main();
module.exports={thirdScore,seededRandom,positive,main};
