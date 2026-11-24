"use strict";

/*
 * Period-13 additive vs standard Beaufort sign comparison under the same
 * native word-relation CSP, lexicon, and 3,000-node budget.
 *
 * Affine convention is C = a*P + K mod 29:
 *   a=1  -> additive Vigenere C=P+K
 *   a=28 -> standard Beaufort C=K-P
 * Plaintext F is transparent and does not advance the key clock.
 * Ciphertext F is ambiguous: it may be a transparent plaintext F or a
 * non-F plaintext encrypted to F. Plants assert/report the latter.
 *
 * The p54-55 original comparison uses the same 205/103 rune split as the
 * all-slope companion task. This script is sign-focused and adds independent
 * native Beaufort plants; it does not search other periods or slopes.
 */

const fs = require("node:fs"), path = require("node:path");
const { createSolver, encode, decodeFixed } = require("./lp2_fhold_word_relation_csp.cjs");
const ROOT = path.resolve(__dirname, "..");
const inputs = [
  "resources/liber-primus/lp2-corpus.json",
  "resources/liber-primus/lp2-transcription.txt",
  "resources/control/english_wordfreq_textblob.txt",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt"
].map(p => fs.readFileSync(path.join(ROOT, p), "utf8"));
const [gp, trans, lex, nativeText, gibran, shakespeare] = [
  JSON.parse(inputs[0]), inputs[1], inputs[2], JSON.parse(inputs[3]), inputs[4], inputs[5]
];
const assert = (x, m) => { if (!x) throw Error(m); };
const mod = x => (x % 29 + 29) % 29;
const runeMap = new Map(gp.runes.map((r, i) => [r, i]));
const alpha = new Map(gp.translit.map((s, i) => [s, i]));
const translit = xs => xs.map(x => gp.translit[x]).join("");

const parse = s => (s.replace(/[\s/%]/g, "").match(/[\u16a0-\u16ff]+/g) || [])
  .map(w => Array.from(w, x => runeMap.get(x)));
const originalWords = parse(trans).slice(0, 2896);
assert(String(originalWords.flat()) === String(gp.pages.slice(0, 56).flatMap(p => p.indices)), "original source mismatch");
const solved = nativeText.sections.map(s =>
  (s.source_text.replace(/['’]/g, "").match(/[\u16a0-\u16ff]+/g) || [])
    .map(w => Array.from(w, x => runeMap.get(x)))
);

function buildLexicon(excluded) {
  const dict = Array.from({ length: 32 }, () => new Map());
  const add = w => { if (w.length && w.length < 32) dict[w.length].set(String(w), w); };
  function variants(word) {
    const s = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/[KQ]/g, "C").replace(/Z/g, "S").replace(/['’]/g, "");
    function walk(i, w) {
      if (i === s.length) { add(w); return; }
      for (const n of [1, 2, 3]) {
        const a = s.slice(i, i + n);
        if (a.length !== n) continue;
        const v = n === 3 ? (a === "ING" ? alpha.get("NG") : undefined)
          : a === "IO" ? alpha.get("IA") : alpha.get(a);
        if (v !== undefined) walk(i + n, [...w, v]);
      }
    }
    walk(0, []);
  }
  for (const line of lex.split(/\r?\n/)) {
    const m = /^([a-z']+)\s+(\d+)$/.exec(line);
    if (m && m[1].length >= 2) variants(m[1]);
  }
  for (const s of ["A", "I", "O"]) variants(s);
  for (const [i, section] of solved.entries()) if (i !== excluded) {
    for (const w of section) add(w);
  }
  const tokens = gp.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
  for (const source of [gibran, shakespeare]) {
    for (let w of source.toUpperCase().match(/[A-Z]+(?:['’][A-Z]+)*/g) || []) {
      const p = [];
      w = w.replace(/['’]/g, "").replace(/QU/g, "CW").replace(/V/g, "U")
        .replace(/[KQ]/g, "C").replace(/Z/g, "S").replace(/ING/g, "NG").replace(/IO/g, "IA");
      while (w.length) {
        const token = tokens.find(t => w.startsWith(t.s));
        if (!token) throw Error("unmapped donor token " + w);
        p.push(token.i);
        w = w.slice(token.s.length);
      }
      add(p);
    }
  }
  return dict;
}
function cutAt(words, minRunes) {
  let cut = 0, n = 0;
  while (n < minRunes && cut < words.length) n += words[cut++].length;
  return { cut, n };
}
const rng = seed => () => {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return seed >>> 0;
};
function randomKey(seed) {
  const rand = rng(seed);
  return Array.from({ length: 13 }, () => rand() % 29);
}
function countFEvents(plainWords, cipherWords) {
  const plain = plainWords.flat(), cipher = cipherWords.flat();
  let plaintextFHolds = 0, encryptedNonFToCipherF = 0, cursor = 0;
  for (let i = 0; i < plain.length; i++) {
    if (plain[i] === 0) plaintextFHolds++;
    else {
      if (cipher[i] === 0) encryptedNonFToCipherF++;
      cursor++;
    }
  }
  return { plaintextFHolds, encryptedNonFToCipherF, cipherFTotal: plaintextFHolds + encryptedNonFToCipherF, consumedKeySymbols: cursor };
}
function solveSlope(label, words, cut, dict, slope, truth = null, actualKey = null) {
  const fit = words.slice(0, cut), holdout = words.slice(cut);
  const result = createSolver(13, dict, slope).solve(fit, { limit: 3000 });
  const out = {
    label, slope, model: slope === 1 ? "additive C=P+K" : "Beaufort C=K-P",
    trainWords: cut, trainRunes: fit.flat().length, holdoutRunes: holdout.flat().length,
    vocabularySize: dict.reduce((n, d) => n + d.size, 0),
    candidateCount: result.keys.length, exhausted: result.exhausted,
    exact: result.exact, nodes: result.nodes, passes: result.passes,
    rowVisits: result.rowVisits, initialRows: result.initialRows,
    failure: result.failure,
    candidates: result.keys.map(v => ({ key: v.key, paths: v.paths, endPhases: v.endPhases }))
  };
  if (truth && actualKey) {
    out.exactKeyCandidateCount = result.keys.filter(v => String(v.key) === String(actualKey)).length;
    const exactCandidate = result.keys.find(v => String(v.key) === String(actualKey));
    if (exactCandidate) {
      out.exactPrefixMatches = exactCandidate.p.flat().filter((v, i) => v === truth.slice(0, cut).flat()[i]).length;
    }
  }
  if (result.keys.length === 1 && !result.exhausted && result.keys[0].endPhases.length === 1) {
    const selected = result.keys[0];
    const continuation = decodeFixed(holdout, selected.key, dict, selected.endPhases[0], slope);
    if (continuation) {
      const replay = encode(selected.p.concat(continuation.p), selected.key, slope);
      out.selected = { key: selected.key, paths: selected.paths, endPhases: selected.endPhases };
      out.continuation = {
        score: continuation.score, paths: continuation.paths,
        plaintext: continuation.p.map(w => translit(w)).join(" "),
        forwardReplay: String(replay.flat()) === String(words.flat())
      };
      if (truth) {
        out.exactPrefixRunes = selected.p.flat().filter((v, i) => v === truth.slice(0, cut).flat()[i]).length;
        out.exactHoldoutRunes = continuation.p.flat().filter((v, i) => v === truth.slice(cut).flat()[i]).length;
      }
    }
  }
  return out;
}
function makePlant(index, trueSlope, seed) {
  const truth = solved[index], key = randomKey(seed);
  const dict = buildLexicon(index);
  const { cut, n } = cutAt(truth, 155);
  assert(n > 0 && cut < truth.length, "bad native split");
  const cipher = encode(truth, key, trueSlope);
  const events = countFEvents(truth, cipher);
  assert(events.encryptedNonFToCipherF > 0, "plant must include non-F plaintext encrypted to ciphertext F");
  return {
    label: "plant " + nativeText.sections[index].name + " seed=" + seed,
    donor: nativeText.sections[index].name,
    seed, trueSlope, trueModel: trueSlope === 1 ? "additive" : "Beaufort",
    hiddenKey: key, hiddenKeyText: translit(key),
    trainWords: cut, trainRunes: n, holdoutRunes: truth.slice(cut).flat().length,
    fEvents: events,
    tests: [
      solveSlope("same ciphertext", cipher, cut, dict, 1, truth, key),
      solveSlope("same ciphertext", cipher, cut, dict, 28, truth, key)
    ]
  };
}

function main() {
  const plants = [
    makePlant(3, 28, 0x25510001),
    makePlant(3, 28, 0x25510005),
    makePlant(3, 1, 0x25510003),
    makePlant(3, 1, 0x25510006)
  ];
  const original = originalWords.slice(-66);
  assert(original.flat().length === 308, "p54-55 target length");
  assert(String(original.flat()) === String(gp.pages.slice(54, 56).flatMap(p => p.indices)), "p54-55 source");
  const { cut, n } = cutAt(original, 205);
  assert(n === 205, "frozen original split must be 205/103");
  const originalDict = buildLexicon(-1);
  const originalComparison = [
    solveSlope("p54-55 original", original, cut, originalDict, 1),
    solveSlope("p54-55 original", original, cut, originalDict, 28)
  ];
  process.stdout.write(JSON.stringify({
    model: {
      period: 13, plaintextF: "transparent; no key advance",
      additive: "C=P+K mod29 (a=1)",
      beaufort: "C=K-P mod29 (a=28)",
      searchBudgetPerSlope: 3000,
      noOtherSlopesOrPeriods: true
    },
    controls: plants,
    original: {
      pages: "p54-p55", runes: 308, words: original.length,
      trainRunes: n, holdoutRunes: 103, splitWords: cut,
      identicalBudgetComparison: originalComparison
    }
  }, null, 2) + "\n");
}
main();
