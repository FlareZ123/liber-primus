"use strict";

/**
 * Exact original-input singleton-word necessary-condition gate.
 *
 * Hypothesis: original printed word boundaries are genuine English plaintext
 * boundaries, and each ciphertext rune is produced by a bijection determined
 * solely by one public clock phase. The phase can be global-rune, page-rune,
 * global-word, or page-word modulo an arbitrary tested period.
 *
 * Under that hypothesis, one-rune plaintext words lie in {A,I}, or the more
 * permissive {A,I,O}; a single phase must produce no more than two/three
 * distinct ciphertext symbols, regardless of the unknown secret permutation.
 * A GP29 additive cipher permits only an A/I pair separated by 14 mod29.
 *
 * This guard intentionally does not address page-specific IVs, stateful
 * changes within a phase, transformed word boundaries, or other languages.
 */

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const base = path.join(__dirname, "..", "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(base, "lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(base, "lp2-ink-annotations.json"), "utf8"));
const transcript = fs.readFileSync(path.join(base, "lp2-transcription.txt"), "utf8");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const inkByPage = new Map(ink.pages.map(p => [p.page, p.red_spans || []]));

/**
 * @typedef {{
 *  sequence:number[], rune:number, page:number, runeIndex:number,
 *  pageRuneIndex:number, wordIndex:number, pageWordIndex:number, red:boolean
 * }} Word
 */

/** @returns {Word[]} Canonical words, continuing across printed page breaks. */
function parseWords() {
  const segments = transcript.split("%").slice(0, 55);
  /** @type {Word[]} */
  const words = [];
  let globalRune = 0;
  let globalWord = 0;
  /** @type {Word|null} */
  let current = null;

  const finish = () => {
    if (current !== null) words.push(current);
    current = null;
  };

  for (let sourcePage = 0; sourcePage < segments.length; sourcePage++) {
    const physicalPage = sourcePage >= 50 ? sourcePage + 1 : sourcePage;
    const redSpans = inkByPage.get(physicalPage) || [];
    let pageRune = 0;
    let pageWord = 0;

    for (const ch of segments[sourcePage]) {
      if (runeIndex.has(ch)) {
        const index = /** @type {number} */ (runeIndex.get(ch));
        if (current === null) {
          const red = redSpans.some(s => pageRune >= s.start && pageRune < s.start + s.length);
          current = {
            sequence: [], rune: index, page: physicalPage,
            runeIndex: globalRune, pageRuneIndex: pageRune,
            wordIndex: globalWord++, pageWordIndex: pageWord++, red
          };
        }
        current.sequence.push(index);
        globalRune++;
        pageRune++;
      } else if (ch !== "/" && !/\s/u.test(ch)) {
        finish();
      }
    }
  }
  finish();

  assert.equal(words.length, 2896, "canonical printed word count");
  assert.equal(globalRune, 12956, "canonical original rune count");
  assert.equal(words.filter(w => w.sequence.length === 1).length, 83);
  return words;
}

/**
 * @param {Word[]} singletons
 * @param {keyof Pick<Word,"runeIndex"|"pageRuneIndex"|"wordIndex"|"pageWordIndex">} clock
 * @param {number} period
 * @returns {{period:number,violatingTwo:number,violatingThree:number,violatingShift:number}}
 */
function measure(singletons, clock, period) {
  /** @type {Map<number,Set<number>>} */
  const phases = new Map();
  for (const word of singletons) {
    const phase = word[clock] % period;
    if (!phases.has(phase)) phases.set(phase, new Set());
    phases.get(phase).add(word.rune);
  }
  let violatingTwo = 0;
  let violatingThree = 0;
  let violatingShift = 0;
  for (const symbols of phases.values()) {
    if (symbols.size > 2) violatingTwo++;
    if (symbols.size > 3) violatingThree++;
    let additiveKeyExists = false;
    for (let k = 0; k < 29; k++) {
      if ([...symbols].every(x => x === (24 + k) % 29 || x === (10 + k) % 29)) {
        additiveKeyExists = true;
        break;
      }
    }
    if (!additiveKeyExists) violatingShift++;
  }
  return {period, violatingTwo, violatingThree, violatingShift};
}

/** @param {Word[]} words */
function originalGate(words) {
  const all = words.filter(w => w.sequence.length === 1);
  const black = all.filter(w => !w.red);
  assert.equal(black.length, 81, "ink annotations for singleton words");

  const clocks = /** @type {const} */ ([
    "runeIndex", "pageRuneIndex", "wordIndex", "pageWordIndex"
  ]);
  const selected = [28, 29, 59, 79, 127, 256];
  /** @type {Record<string,unknown>} */
  const outcomes = {};
  for (const clock of clocks) {
    const rows = Array.from({length: 256}, (_, i) => measure(black, clock, i + 1));
    outcomes[clock] = {
      excludedSecretTwo: rows.filter(x => x.violatingTwo > 0).length,
      excludedSecretThree: rows.filter(x => x.violatingThree > 0).length,
      excludedAdditiveAI: rows.filter(x => x.violatingShift > 0).length,
      selected: rows.filter(x => selected.includes(x.period))
    };
  }

  const pageWordGroups = new Map();
  for (const w of black) {
    if (!pageWordGroups.has(w.pageWordIndex)) pageWordGroups.set(w.pageWordIndex, []);
    pageWordGroups.get(w.pageWordIndex).push(w);
  }
  const witnesses = [];
  for (const [index, rows] of pageWordGroups) {
    const distinct = new Set(rows.map(w => w.rune));
    if (distinct.size >= 4) {
      witnesses.push({
        pageWordIndex: index,
        symbols: [...distinct].map(rune => ({
          rune: corpus.runes[rune], gpIndex: rune,
          locations: rows.filter(w => w.rune === rune).map(
            w => ({page: w.page, pageRuneIndex: w.pageRuneIndex, runeIndex: w.runeIndex})
          )
        }))
      });
    }
  }
  witnesses.sort((a, b) => a.pageWordIndex - b.pageWordIndex);
  assert.ok(witnesses.length >= 1);
  assert.equal(outcomes.pageWordIndex.excludedSecretThree, 256);
  return {allSingletons: all.length, blackSingletons: black.length, outcomes, witnesses};
}

/**
 * Construct source-shaped data with fixed English A/I one-rune words and
 * arbitrary phase-permutations. The entire 12,956-rune corpus is inverted
 * exactly in this synthetic positive control.
 * @param {Word[]} words
 */
function plantedPositive(words) {
  let state = 0x5a174201;
  const rand = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
  const keys = Array.from({length:79}, () => {
    const a = Array.from({length:29}, (_,i) => i);
    for (let i = 28; i > 0; i--) {
      const j = rand() % (i + 1);
      const temp = a[i];
      a[i] = a[j];
      a[j] = temp;
    }
    return a;
  });
  let count = 0;
  /** @type {Word[]} */
  const planted = [];
  for (const w of words) {
    const phase = w.pageWordIndex % 79;
    const mapping = keys[phase];
    const inv = Array(29);
    mapping.forEach((v,i) => {inv[v] = i;});
    const plaintext = w.sequence.length === 1
      ? [w.wordIndex % 2 === 0 ? 24 : 10]
      : w.sequence;
    const ciphertext = plaintext.map(x => mapping[x]);
    assert.deepEqual(ciphertext.map(x => inv[x]), plaintext);
    count += ciphertext.length;
    planted.push({...w,sequence:ciphertext,rune:ciphertext[0]});
  }
  assert.equal(count, 12956);
  const plantSingles = planted.filter(w => w.sequence.length === 1 && !w.red);
  const test = measure(plantSingles, "pageWordIndex", 79);
  assert.equal(test.violatingTwo, 0, "A/I phase-invariant plant");
  assert.equal(test.violatingShift >= 0, true);
  return {originalShapeRuneCount: count, period: 79, test};
}

const words = parseWords();
const original = originalGate(words);
const plant = plantedPositive(words);
process.stdout.write(JSON.stringify({original, plant}, null, 2) + "\n");
