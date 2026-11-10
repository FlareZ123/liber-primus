"use strict";
/**
 * Finite original-LP2 plaintext inverse for the Agent17 lossless EA/T6/U5/E5
 * word-history tableau. Fits the remaining key rotations under all short
 * periodic clocks without re-choosing reserved plaintext symbols.
 *
 * Run: node sims/lossless_echo_periodic_original_inverse.cjs (Node >=22).
 * This is a model-family exclusion, not a Cicada plaintext decryption.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {gpText, descriptors, encrypt, decryptPrepared, unigramModel} =
  require("./lossless_echo_table_inverse.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const manuscript = parseSharedCorpus().words;
const metadata = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = new Map(metadata.runes.map((c, i) => [c, i]));
const words = manuscript.map(w => [...w.runes].map(c => table.get(c)));
const raw = read("resources/lp2-transcription.txt");
const sections = raw.split("$").slice(0, 8);
const expectedLengths = [729,1145,1738,1894,1021,1433,1680,3316];
const CLOCKS = ["global", "sectionAt", "wordAt"];
const PERIODS = 128;
const truthKey = [15,22,8,17,3,26,14,11,1,24,7,9,4];

/** @returns {{global:number,section:number,sectionAt:number,wordAt:number}[]} */
function coordinates() {
  const out = [];
  let global = 0;
  for (let section = 0; section < sections.length; section++) {
    const wordStrings = sections[section].replace(/[\r\n\t\/% ]/gu, "")
      .split(/[-.&§0-9]+/gu).filter(Boolean);
    let sectionAt = 0;
    for (const original of wordStrings) {
      for (let wordAt = 0; wordAt < [...original].length; wordAt++) {
        out.push({global:global++, section, sectionAt:sectionAt++, wordAt});
      }
    }
  }
  assert.equal(out.length, 12956);
  assert.deepEqual(out.reduce((a, c) => {
    a[c.section]++; return a;
  }, Array(8).fill(0)), expectedLengths);
  assert.deepEqual(words.map(w => w.length),
    sections.flatMap(s => s.replace(/[\r\n\t\/% ]/gu,"")
      .split(/[-.&§0-9]+/gu).filter(Boolean).map(w => [...w].length)));
  return out;
}

const COORD = coordinates();
assert.equal(words.length, 2896);
assert.equal(words.flat().length, 12956);
assert.deepEqual(words.flat(), metadata.pages
  .filter(p => p.page <= 55 && p.indices.length).flatMap(p => p.indices));
const literature = read("resources/control/shakespeare_first300k.txt");
const prior = unigramModel(gpText(literature.slice(0, 190000)));
const heldoutPlain = gpText(literature.slice(190000))
  .slice(5000, 5000 + 12956);
assert.equal(heldoutPlain.length, 12956);

/**
 * @param {ReturnType<typeof descriptors>} data
 * @param {number} maxPeriod
 * @returns {Array<{clock:string,period:number,train:number,heldout:number,
 *   key:number[],usedResidues:number}>}
 */
function fit(data, maxPeriod = PERIODS) {
  const nTraining = COORD.filter(m => m.section < 4).length;
  const nHeld = COORD.length - nTraining;
  const schedules = [];
  for (const clock of CLOCKS) {
    for (let period = 1; period <= maxPeriod; period++) {
      const scores = Array.from({length:period},
        () => new Float64Array(28));
      const used = new Uint16Array(period);
      let train = 0, heldout = 0;
      for (let i = 0; i < data.length; i++) {
        const item = data[i], m = COORD[i];
        if (item.fixed >= 0) {
          if (m.section < 4) train += prior[item.fixed];
          else heldout += prior[item.fixed];
          continue;
        }
        if (m.section >= 4) continue;
        const r = m[clock] % period;
        used[r]++;
        for (let key = 0; key < 28; key++) {
          const size = item.free.length;
          const plain = item.free[
            (item.rank - key % size + size) % size];
          scores[r][key] += prior[plain];
        }
      }
      const key = new Uint8Array(period);
      for (let r = 0; r < period; r++) {
        if (!used[r]) continue;
        let best = -Infinity;
        for (let k = 0; k < 28; k++) {
          if (scores[r][k] > best) {
            best = scores[r][k];
            key[r] = k;
          }
        }
        train += best;
      }
      for (let i = 0; i < data.length; i++) {
        if (COORD[i].section < 4 || data[i].fixed >= 0) continue;
        const item = data[i], size = item.free.length;
        const k = key[COORD[i][clock] % period];
        const plain = item.free[(item.rank - k % size + size) % size];
        heldout += prior[plain];
      }
      schedules.push({clock,period,train:train/nTraining,
        heldout:heldout/nHeld,key:Array.from(key),
        usedResidues:used.filter(x => x > 0).length});
    }
  }
  schedules.sort((a,b) => b.train-a.train || a.period-b.period);
  return schedules;
}

/**
 * @param {ReturnType<typeof fit>[number]} mode
 * @returns {(index:number,freeCount:number)=>number}
 */
function keyOf(mode) {
  return (index, _freeCount) =>
    mode.key[COORD[index][mode.clock] % mode.period];
}

/** @param {number[]} one @param {number[]} two */
function exactMatches(one,two) {
  return one.reduce((n,x,i) => n + Number(x === two[i]), 0);
}

function main() {
  const original = fit(descriptors(words));
  const best = original[0];
  const recovered = decryptPrepared(descriptors(words), keyOf(best));
  assert.deepEqual(encrypt(recovered, keyOf(best)), words);

  const plantedCipher = encrypt(heldoutPlain, index =>
    truthKey[COORD[index].global % truthKey.length]);
  const plantedDescriptors = descriptors(plantedCipher);
  const planted = fit(plantedDescriptors);
  const top = planted[0];
  const period13 = planted.find(x =>
    x.clock === "global" && x.period === 13);
  assert(period13);
  assert.deepEqual(period13.key, truthKey);
  const plantDecoded = decryptPrepared(plantedDescriptors, keyOf(top));
  const plant13Decoded = decryptPrepared(plantedDescriptors, keyOf(period13));
  assert.deepEqual(plantDecoded, heldoutPlain);
  assert.deepEqual(plant13Decoded, heldoutPlain);
  assert.deepEqual(encrypt(plantDecoded,keyOf(top)),plantedCipher);

  const concise = x => ({clock:x.clock,period:x.period,
    train:x.train,heldout:x.heldout,
    usedResidues:x.usedResidues});
  const output = {
    method:"Exact key-rank periodic inverse of original lossless echo tableau",
    classification:"conditional model-family negative; no authentic plaintext",
    original:{runes:12956,words:2896,sections:8,
      searchedSchedules:original.length,fit:5506,untouched:7450,
      winner:concise(best),
      topFive:original.slice(0,5).map(concise),
      bestPeriodAtMost16:concise(original.find(x => x.period <= 16)),
      globalPeriod13:concise(original.find(x =>
        x.clock === "global" && x.period === 13)),
      exactlyReencodesOriginal:true},
    sourceMatchedPositive:{period13Key:truthKey,
      winner:concise(top),truePeriod:concise(period13),
      plaintextRecoveredExactly:exactMatches(plantDecoded,heldoutPlain),
      truePeriodRecoveredExactly:exactMatches(plant13Decoded,heldoutPlain),
      exactlyReencodesPlant:true},
    interpretation:"The true source-disjoint period13 key recovers all 12956 plaintext runes; all 384 original periodic-clock training winners have negative untouched language scores."
  };
  console.log(JSON.stringify(output,null,2));
  return output;
}
if (require.main === module) main();
module.exports = {main,fit,keyOf,coordinates};
