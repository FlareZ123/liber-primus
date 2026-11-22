"use strict";
/**
 * Original p27 15-face post-heading hop to p55 terminal bookend.
 * Candidate only: source coordinates select a 15-rune window, not a cipher.
 * One historically attested GP29 plaintext-F-transparent Vigenere inverse
 * is falsified under the independently visible 1 + 5*15 p55 segmentation.
 *
 * Run: node sims/lp2_p27_p55_wing15_bookend_sft.cjs
 * Node.js 22 CommonJS; original checked-in source files; read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-ink-annotations.json"), "utf8"));
const mod29 = x => ((x % 29) + 29) % 29;

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((acc, x) => acc + x * (x - 1), 0)
    / (values.length * (values.length - 1));
}
/**
 * Number of reachable consumed-key counts after exact native-F-bypass steps.
 * The source-historical rule is P=F -> C=F and key state unchanged;
 * non-F P is Vigenere encrypted and advances the key.
 *
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} start first non-IV ciphertext index
 * @returns {{firstImpossible:number|null,terminalStates:number}}
 */
function recoverPossibleState(cipher, key, start) {
  let states = new Set([0]);
  for (let i = start; i < cipher.length; i++) {
    const next = new Set();
    for (const consumed of states) {
      const plain = mod29(cipher[i] - key[consumed % key.length]);
      if (plain !== 0) next.add(consumed + 1);
      if (cipher[i] === 0) next.add(consumed);
    }
    if (!next.size) return {firstImpossible:i,terminalStates:0};
    states = next;
  }
  return {firstImpossible:null,terminalStates:states.size};
}
/** @param {number[]} plain @param {number[]} key @returns {number[]} */
function transparentEncrypt(plain, key) {
  const out = [];
  let consumed = 0;
  for (const v of plain) {
    if (v === 0) out.push(0);
    else {
      out.push(mod29(v + key[consumed % key.length]));
      consumed++;
    }
  }
  return out;
}

function main() {
  const a = corpus.pages[27].indices;
  const b = corpus.pages[55].indices;
  const red27 = ink.pages.find(p => p.page === 27);
  const red55 = ink.pages.find(p => p.page === 55);
  assert.equal(red27.red_spans[0].length, 19);
  assert.deepEqual(red27.large_punctuation, [[19,13,"red"]]);
  assert.deepEqual(red55.large_punctuation, [[76,13,"red"]]);
  assert.equal(a.length, 234);
  assert.equal(b.length, 76);

  const wingHop = a.slice(19, 34);
  const motif = a.slice(28, 34);
  assert.equal(wingHop.length, 15);
  assert.deepEqual(wingHop.slice(-6), motif);
  assert.deepEqual(motif, b.slice(-6));
  const allMatches = [];
  for (let page = 0; page < 56; page++) {
    const values = corpus.pages[page].indices;
    for (let i = 0; i + motif.length <= values.length; i++) {
      if (motif.every((x, j) => values[i + j] === x)) {
        allMatches.push([page, i]);
      }
    }
  }
  assert.deepEqual(allMatches, [[27,28],[55,70]]);
  assert.equal(b.length, 1 + 5 * wingHop.length);

  // Frozen literal consumer: p55 first rune is an IV/control;
  // the next 75 runes use five repeats of the 15-rune post-mark word key.
  const ordinary = b.slice(1).map(
    (x, i) => mod29(x - wingHop[i % wingHop.length]));
  assert.deepEqual(ordinary.slice(-6), [0,0,0,0,0,0]);
  // Attractive but insufficient postselected substring: the aligned final
  // fifteen runes decrypt as GDTRUTHEBX followed by six F symbols. The
  // authentic source LP1 uses the word TRUTH, yet the complete decoded page
  // is nonlinguistic and its historical F-transparent inverse is impossible.
  const terminal15 = ordinary.slice(-15);
  const truthGp = ["T", "R", "U", "TH"].map(label => corpus.translit.indexOf(label));
  assert.deepEqual(terminal15.slice(2, 6), truthGp);

  assert.equal(ordinary.every(
    (x, i) => mod29(x + wingHop[i % wingHop.length]) === b[i + 1]), true);

  // The native plaintext-F-transparent rule cannot encrypt an F
  // into a non-F ciphertext symbol. It yields NO legal complete path.
  const actual = recoverPossibleState(b, wingHop, 1);
  assert.deepEqual(actual, {firstImpossible:23,terminalStates:0});

  // Sensitivity control: known-native GP p57 plaintext under this
  // explicitly modelled keyed rule must retain at least one decode path.
  const known = corpus.pages[57].indices;
  const plant = transparentEncrypt(known, wingHop);
  const positive = recoverPossibleState(plant, wingHop, 0);
  assert.equal(positive.firstImpossible, null);
  assert(positive.terminalStates >= 1);

  const result = {
    classification: "candidate authored 15-rune navigation, failed 15-key direct cipher",
    original_p27_red_heading_runes: 19,
    original_p27_red_dot_count: 13,
    wing_faces_from_original_image: 15,
    post_mark_window_runes: wingHop.map(x => corpus.translit[x]),
    terminal_motif: motif.map(x => corpus.translit[x]),
    motif_occurs_only_at: allMatches,
    original_p55_red_dot_after_runecount: 76,
    p55_shape: "1 + 5*15 runes",
    plain_f_transparent_first_impossible_p55_offset: actual.firstImpossible,
    ordinary_vigenere_decrypted_ioc: ioc(ordinary),
    ordinary_vigenere_terminal_plaintext_f_count: 6,
    ordinary_vigenere_terminal15: terminal15.map(x => corpus.translit[x]),
    local_gp_truth_match: "p55 final15 - p27 15-symbol key, decoded positions 2..5: T R U TH; unselected four-rune substring only",
    independent_p57_known_plaintext_plant_passes: true,
    original_unknown_plaintext_recovered: false
  };
  console.log(JSON.stringify(result, null, 2));
}
if (require.main === module) main();
module.exports = {main,recoverPossibleState,transparentEncrypt,ioc};
