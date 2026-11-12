'use strict';

/**
 * Single-file original-input gate for historical Playfair's no-equal-cipher-digraph
 * invariant. Run: node sims/lp2_historical_playfair_repeat_gate_sft.cjs
 *
 * Source: original physical LP2 pages in resources/liber-primus/lp2-corpus.json.
 * Historical positive control: M. E. Ohaver, Flynn's, 25 February 1928,
 * https://toebes.com/Flynns/Flynns-19280225.htm (Cipher No. 136).
 *
 * This proves a narrow original-cipher incompatibility. It does not test
 * source-unselected insertion/omission, interleaving or a changing pairing clock.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const controlLines = [
  'UL.WR.AM.HQ.FW.RU.GC.HY.IO.KL.',
  'BG.FI.QB.AP.YP.AB.DC.ET.CO.AL.',
  'KF.PU.SL.LI.LH.IM.FB.PB.MI.HL.',
  'DO.IB.KF.LN.EL.CO.FC.KA.LI.AL.',
  'KF.LB.MK.RN.UE.OM.TM.UN.CD.OI.',
  'BA.MC.PZ.AB.FU.MB.BG.FE.HV.YV.',
];
const controlPairs = controlLines.join('').match(/[A-Z]{2}/g);
assert.equal(controlPairs.length, 60);
assert.ok(controlPairs.every(pair => pair[0] !== pair[1]));
console.log('PASS historical 1928 Playfair control: 60/60 encrypted pairs have distinct symbols.');

const file = path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json');
const corpus = JSON.parse(fs.readFileSync(file, 'utf8'));
const pages = corpus.pages.filter(
  page => page.page >= 0 && page.page <= 55 && Array.isArray(page.indices) && page.indices.length > 0
);
assert.equal(corpus.runes.length, 29);
assert.equal(pages.length, 55);

let runes = 0;
let transitions = 0;
let repeats = 0;
let parityEven = 0;
let parityOdd = 0;
let minimumViolationsWithFreePagePhase = 0;
const pagesWithBothParities = [];

for (const page of pages) {
  const indices = page.indices;
  assert.equal(indices.length, page.runic_count, 'p' + page.page + ' count');
  runes += indices.length;
  transitions += indices.length - 1;
  const parity = [0, 0];
  for (let first = 0; first + 1 < indices.length; first++) {
    if (indices[first] === indices[first + 1]) {
      parity[first % 2]++;
      repeats++;
    }
  }
  parityEven += parity[0];
  parityOdd += parity[1];
  minimumViolationsWithFreePagePhase += Math.min(...parity);
  if (parity[0] && parity[1]) {
    pagesWithBothParities.push({ page: page.page, even: parity[0], odd: parity[1] });
  }
}

assert.equal(runes, 12956);
assert.equal(transitions, 12901);
assert.equal(repeats, 86);
assert.equal(parityEven, 35);
assert.equal(parityOdd, 51);
assert.equal(pagesWithBothParities.length, 14);
assert.equal(minimumViolationsWithFreePagePhase, 17);

const result = {
  input: 'resources/liber-primus/lp2-corpus.json',
  runeAlphabet: 29,
  runeBearingPages: pages.length,
  runes,
  withinPageTransitions: transitions,
  equalSuccessors: repeats,
  equalSuccessorsAtZeroBasedEvenFirstOffset: parityEven,
  equalSuccessorsAtZeroBasedOddFirstOffset: parityOdd,
  pagesWithBothRepeatParities: pagesWithBothParities,
  minimumIllegalPlayfairCipherPairsEvenWithIndependentPagePhases: minimumViolationsWithFreePagePhase,
};
console.log('PASS original LP2 exact-source no-equal-cipher-digraph invariant test.');
console.log(JSON.stringify(result, null, 2));
