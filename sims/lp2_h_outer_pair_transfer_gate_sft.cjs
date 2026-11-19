"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const translitTokens = corpus.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
const parts = transcription.split(/^\s*%\s*$/m);

function mod(x) {
  return ((x % 29) + 29) % 29;
}
function H(x, y) {
  return [mod(x - y), mod(x + y)];
}
function Hinv(u, v) {
  return [mod(15 * (u + v)), mod(15 * (v - u))];
}
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}
function gp(word) {
  word = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S").replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith("ING", i)) {
      out.push(21);
      i += 3;
      continue;
    }
    if (word.startsWith("IO", i)) {
      out.push(27);
      i += 2;
      continue;
    }
    const token = translitTokens.find((entry) => word.startsWith(entry.s, i));
    assert.ok(token, "Unmapped GP spelling: " + word.slice(i));
    out.push(token.i);
    i += token.s.length;
  }
  return out;
}
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}
function pageWords(page) {
  const text = physicalPart(page).replace(/\/\s*/gu, "");
  const out = [];
  let current = [];
  let start = null;
  let offset = 0;
  const flush = () => {
    if (!current.length) return;
    out.push({ start, end: offset - 1, len: current.length, values: current.slice() });
    current = [];
    start = null;
  };
  for (const char of text) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (start === null) start = offset;
      current.push(value);
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return out;
}
function runeWords(text) {
  const normalized = text.replace(/\/\s*/gu, "");
  return (normalized.match(/[\u16A0-\u16FF]+/gu) || []).map((word) =>
    [...word].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}
function lineFragments(page) {
  return physicalPart(page).split("/").map((line) =>
    (line.match(/[\u16A0-\u16FF]+/gu) || []).map((word) =>
      [...word].map((rune) => runeIndex.get(rune))
    )
  );
}
function shell(values, pairFn, pairOrder = "outside-in", centerMode = "last") {
  const pairs = [];
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    pairs.push(pairFn(values[left], values[right]));
  }
  if (pairOrder === "inside-out") pairs.reverse();
  const out = [];
  const center = values.length % 2 ? values[Math.floor(values.length / 2)] : null;
  if (center !== null && centerMode === "first") out.push(center);
  for (const pair of pairs) out.push(...pair);
  if (center !== null && centerMode === "last") out.push(center);
  return out;
}
function affineShell(values, a, b, c, d, tx = 0, ty = 0, pairOrder = "outside-in", centerMode = "last") {
  return shell(values, (x, y) => [
    mod(a * x + b * y + tx),
    mod(c * x + d * y + ty),
  ], pairOrder, centerMode);
}
function endpointPair(fragment, pairFn) {
  return pairFn(fragment[0], fragment[fragment.length - 1]);
}
function countExact(actual, expected) {
  let count = 0;
  for (let i = 0; i < actual.length; i += 1) if (actual[i] === expected[i]) count += 1;
  return count;
}
function exactWords(actual, expected) {
  return actual.reduce((count, word, i) =>
    count + (word.length === expected[i].length && word.every((value, j) => value === expected[i][j]) ? 1 : 0), 0);
}
function hasAll(values, required) {
  const set = new Set(values);
  return required.every((value) => set.has(value));
}

const p56PlainSection = solved.sections.find((section) => section.name === "p56_an_end");
const p57PlainSection = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p56PlainSection && p57PlainSection);

const clear = signed.split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\r?\n\r?\n/).slice(1).join("\n");
const signedWords = clear.split(/[^A-Za-z0-9]+/)
  .filter((word) => /^[A-Za-z]+$/.test(word))
  .map((word) => ({ word: word.toUpperCase(), values: gp(word) }));
assert.equal(signedWords.length, 43);
const signedSet = new Set(signedWords.map((row) => spell(row.values)));
const signedByLength = new Map();
for (const row of signedWords) {
  if (!signedByLength.has(row.values.length)) signedByLength.set(row.values.length, new Set());
  signedByLength.get(row.values.length).add(spell(row.values));
}

const dictionarySources = [
  "resources/control/english_wordfreq_textblob.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt",
];
const dictionary = new Set();
for (const source of dictionarySources) {
  for (const word of read(source).match(/[A-Za-z]+/g) || []) {
    if (word.length >= 3) dictionary.add(word.toLowerCase());
  }
}
assert.ok(dictionary.size > 30000);

const unknownWords = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  for (const word of pageWords(page)) {
    if (word.len === 4 || word.len === 5) unknownWords.push({ page, ...word });
  }
}
const fourRuneWords = unknownWords.filter((word) => word.len === 4);
const fiveRuneWords = unknownWords.filter((word) => word.len === 5);
assert.equal(fourRuneWords.length, 514);
assert.equal(fiveRuneWords.length, 318);
assert.equal(unknownWords.length, 832);

const p56Cipher = pageWords(56).map((word) => word.values);
const p56Plain = runeWords(p56PlainSection.source_text);
const p57Clear = runeWords(p57PlainSection.source_text);
const p57Raw = pageWords(57).map((word) => word.values);
assert.equal(p56Cipher.length, 25);
assert.equal(p56Plain.length, 25);
assert.deepEqual(p56Cipher.map((word) => word.length), p56Plain.map((word) => word.length));
assert.equal(p56Cipher.reduce((sum, word) => sum + word.length, 0), 85);
assert.equal(p57Raw.length, 20);
assert.equal(p57Clear.length, 20);
assert.deepEqual(p57Raw, p57Clear);
assert.equal(p57Clear.reduce((sum, word) => sum + word.length, 0), 95);

function transformSummary(words, pairFn) {
  const outputs = words.map((word) => shell(word, pairFn));
  const texts = outputs.map(spell);
  return {
    exactPlainWords: exactWords(outputs, p56Plain),
    alignedPlainRunes: outputs.reduce((sum, word, i) => sum + countExact(word, p56Plain[i]), 0),
    dictionaryHits: texts.filter((word) => dictionary.has(word.toLowerCase())).length,
    signedHits: texts.filter((word) => signedSet.has(word)).length,
    outputs: texts,
  };
}
const p56H = transformSummary(p56Cipher, H);
const p56Hinv = transformSummary(p56Cipher, Hinv);
const p57H = transformSummary(p57Clear, H);
const p57Hinv = transformSummary(p57Clear, Hinv);
assert.equal(p56H.exactPlainWords, 0);
assert.equal(p56Hinv.exactPlainWords, 0);
assert.equal(p56H.alignedPlainRunes, 2);
assert.equal(p56Hinv.alignedPlainRunes, 1);

const p28Words = pageWords(28);
const p28LineFragments = lineFragments(28);
const p28Line1 = p28LineFragments[0].filter((fragment) => fragment.length >= 2);
const p28Line6 = p28LineFragments[5].filter((fragment) => fragment.length >= 2);
assert.deepEqual(p28Line6.map((fragment) => fragment.length), [2, 3, 9, 4, 5]);
assert.equal(p28Line6.reduce((sum, fragment) => sum + fragment.length, 0), 23);
const p28Line6H = p28Line6.map((fragment) => endpointPair(fragment, H));
const p28Line6Hinv = p28Line6.map((fragment) => endpointPair(fragment, Hinv));
assert.deepEqual(p28Line6H, [[15, 2], [14, 4], [12, 12], [23, 12], [8, 19]]);
const p28StartH = p28Line1.slice(0, 2).flatMap((fragment) => endpointPair(fragment, H));
const p28StartHinv = p28Line1.slice(0, 2).flatMap((fragment) => endpointPair(fragment, Hinv));
assert.equal(spell(p28StartH), "HERE");

const selectedWord28 = p28Words[27].values;
const successorWord29 = p28Words[28].values;
assert.deepEqual(selectedWord28, [28, 24, 10, 1, 20]);
assert.deepEqual(successorWord29, [24, 25]);
const outer28 = [selectedWord28[0], selectedWord28[4]];
const inner28 = [selectedWord28[1], selectedWord28[3]];
assert.deepEqual(H(...outer28), [8, 19]);
assert.deepEqual(H(...inner28), [23, 25]);
assert.deepEqual(H(...successorWord29), outer28);
assert.deepEqual(Hinv(...H(...outer28)), outer28);
assert.deepEqual(Hinv(...H(...inner28)), inner28);

const fragmentPairs = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  for (const line of lineFragments(page)) {
    const fragments = line.filter((fragment) => fragment.length >= 2);
    for (let i = 0; i + 1 < fragments.length; i += 1) {
      fragmentPairs.push({ page, left: fragments[i], right: fragments[i + 1] });
    }
  }
}
assert.equal(fragmentPairs.length, 2404);
function fragmentPairText(row, pairFn, reverseBoundary = false) {
  const left = endpointPair(reverseBoundary ? row.right : row.left, pairFn);
  const right = endpointPair(reverseBoundary ? row.left : row.right, pairFn);
  return spell([...left, ...right]);
}
const fragmentH = fragmentPairs.map((row) => fragmentPairText(row, H));
const fragmentHinv = fragmentPairs.map((row) => fragmentPairText(row, Hinv));
const fragmentHHere = fragmentPairs.filter((row) => fragmentPairText(row, H) === "HERE")
  .map((row) => ({ page: row.page, left: row.left, right: row.right }));
const fragmentHinvHere = fragmentPairs.filter((row) => fragmentPairText(row, Hinv) === "HERE")
  .map((row) => ({ page: row.page, left: row.left, right: row.right }));
assert.deepEqual(fragmentHHere.map((row) => row.page), [28]);

const p27Red13 = [];
for (const page of ink.pages) {
  for (const span of page.red_spans || []) {
    const end = span.start + span.length;
    for (const mark of page.large_punctuation || []) {
      if (mark[0] !== end || mark[1] !== 13 || mark[2] !== "red") continue;
      p27Red13.push({
        page: page.page,
        start: span.start,
        length: span.length,
        throughH: H(span.length, mark[1]),
        throughHinv: Hinv(span.length, mark[1]),
      });
    }
  }
}
assert.equal(p27Red13.length, 16);
assert.deepEqual(
  p27Red13.filter((row) => row.throughH[0] === 6 && row.throughH[1] === 3)
    .map((row) => ({ page: row.page, start: row.start, length: row.length })),
  [{ page: 27, start: 0, length: 19 }]
);

const p0Words = pageWords(0);
const p0ReceiverWords = p0Words.filter((word) => word.start >= 80 && word.end <= 102);
assert.deepEqual(p0ReceiverWords.map((word) => word.len), [3, 7, 5, 8]);
assert.equal(p0ReceiverWords[0].start, 80);
assert.equal(p0ReceiverWords[3].end, 102);
const p0H = p0ReceiverWords.flatMap((word) => shell(word.values, H));
const p0Hinv = p0ReceiverWords.flatMap((word) => shell(word.values, Hinv));
const p0ExpectedH = [19, 23, 25, 4, 16, 12, 9, 6, 10, 14, 15, 8, 24, 5, 21, 5, 28, 26, 22, 9, 0, 18, 2];
assert.deepEqual(p0H, p0ExpectedH);
const dhState = [23, 5, 6, 15, 8, 19, 2];
const p0Windows = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = pageWords(page);
  for (let i = 0; i + 3 < words.length; i += 1) {
    const window = words.slice(i, i + 4);
    const total = window.reduce((sum, word) => sum + word.len, 0);
    if (total === 23) p0Windows.push({ page, words: window });
  }
}
assert.equal(p0Windows.length, 117);
const p0WindowH = p0Windows.map((row) => row.words.flatMap((word) => shell(word.values, H)));
const p0WindowHinv = p0Windows.map((row) => row.words.flatMap((word) => shell(word.values, Hinv)));
const p0WindowState = {
  H_full_state_coverage: p0WindowH.filter((values) => hasAll(values, dhState)).length,
  Hinv_full_state_coverage: p0WindowHinv.filter((values) => hasAll(values, dhState)).length,
  H_exact_p0_receiver: p0WindowH.filter((values) => values.length === p0ExpectedH.length && values.every((value, i) => value === p0ExpectedH[i])).length,
  Hinv_exact_p0_receiver: p0WindowHinv.filter((values) => values.length === p0ExpectedH.length && values.every((value, i) => value === p0ExpectedH[i])).length,
};

const p2Receiver = pageWords(2).find((word) => word.start === 36 && word.end === 39);
const p38Receiver = pageWords(38).find((word) => word.start === 49 && word.end === 53);
assert.ok(p2Receiver && p38Receiver);
assert.deepEqual(p2Receiver.values, [1, 2, 8, 26]);
assert.deepEqual(p38Receiver.values, [19, 25, 22, 26, 3]);
const GOOD = [6, 3, 3, 23];
const FOUND = [0, 3, 1, 9, 23];
const p2H = shell(p2Receiver.values, H);
const p2Hinv = shell(p2Receiver.values, Hinv);
const p38H = shell(p38Receiver.values, H);
const p38Hinv = shell(p38Receiver.values, Hinv);
assert.ok(!p2H.every((value, i) => value === GOOD[i]));
assert.ok(!p2Hinv.every((value, i) => value === GOOD[i]));
assert.ok(!p38H.every((value, i) => value === FOUND[i]));
assert.ok(!p38Hinv.every((value, i) => value === FOUND[i]));

const naturalVariants = [
  { name: "d,s", a: 1, b: -1, c: 1, d: 1 },
  { name: "s,d", a: 1, b: 1, c: 1, d: -1 },
  { name: "-d,s", a: -1, b: 1, c: 1, d: 1 },
  { name: "s,-d", a: 1, b: 1, c: -1, d: 1 },
  { name: "d,-s", a: 1, b: -1, c: -1, d: -1 },
  { name: "-s,d", a: -1, b: -1, c: 1, d: -1 },
  { name: "-d,-s", a: -1, b: 1, c: -1, d: -1 },
  { name: "-s,-d", a: -1, b: -1, c: -1, d: 1 },
];
const orientationBoundary = [];
for (const variant of naturalVariants) {
  for (const pairOrder of ["outside-in", "inside-out"]) {
    for (const centerMode of ["last", "first", "omit"]) {
      let dictionaryHits = 0;
      let signedHits = 0;
      for (const word of unknownWords) {
        const output = affineShell(word.values, variant.a, variant.b, variant.c, variant.d, 0, 0, pairOrder, centerMode);
        const text = spell(output);
        if (dictionary.has(text.toLowerCase())) dictionaryHits += 1;
        if (signedSet.has(text)) signedHits += 1;
      }
      orientationBoundary.push({
        variant: variant.name,
        pairOrder,
        centerMode,
        dictionaryHits,
        signedHits,
      });
    }
  }
}
const hOrientationRow = orientationBoundary.find((row) =>
  row.variant === "d,s" && row.pairOrder === "outside-in" && row.centerMode === "last");
const bestOrientation = orientationBoundary.slice().sort((a, b) =>
  b.dictionaryHits - a.dictionaryHits || b.signedHits - a.signedHits)[0];

const fragmentMatrixControls = [];
for (const variant of naturalVariants) {
  for (const reverseBoundary of [false, true]) {
    let dictionaryHits = 0;
    let signedHits = 0;
    for (const row of fragmentPairs) {
      const left = affineShell(row.left.slice(0, 1).concat(row.left.slice(-1)), variant.a, variant.b, variant.c, variant.d);
      const right = affineShell(row.right.slice(0, 1).concat(row.right.slice(-1)), variant.a, variant.b, variant.c, variant.d);
      const values = reverseBoundary ? [...right, ...left] : [...left, ...right];
      const text = spell(values);
      if (dictionary.has(text.toLowerCase())) dictionaryHits += 1;
      if (signedSet.has(text)) signedHits += 1;
    }
    fragmentMatrixControls.push({ variant: variant.name, reverseBoundary, dictionaryHits, signedHits });
  }
}

const coeffs = [-1, 0, 1];
const affineMatrices = [];
for (const a of coeffs) for (const b of coeffs) for (const c of coeffs) for (const d of coeffs) {
  if (mod(a * d - b * c) !== 0) affineMatrices.push({ a, b, c, d });
}
assert.equal(affineMatrices.length, 48);

function mapStats(words, a, b, c, d, tx, ty) {
  let dictionaryHits = 0;
  let signedHits = 0;
  for (const word of words) {
    const text = spell(affineShell(word.values, a, b, c, d, tx, ty));
    if (dictionary.has(text.toLowerCase())) dictionaryHits += 1;
    if (signedSet.has(text)) signedHits += 1;
  }
  return { dictionaryHits, signedHits };
}
const affineControls = [];
for (const matrix of affineMatrices) {
  for (let tx = 0; tx < 29; tx += 1) {
    for (let ty = 0; ty < 29; ty += 1) {
      const scores = mapStats(unknownWords, matrix.a, matrix.b, matrix.c, matrix.d, tx, ty);
      const p56Out = p56Cipher.map((word) => affineShell(word, matrix.a, matrix.b, matrix.c, matrix.d, tx, ty));
      const p56Exact = exactWords(p56Out, p56Plain);
      const p56Runes = p56Out.reduce((sum, word, i) => sum + countExact(word, p56Plain[i]), 0);
      affineControls.push({
        ...matrix, tx, ty,
        ...scores,
        p56Exact,
        p56Runes,
      });
    }
  }
}
assert.equal(affineControls.length, 40368);
const hAffine = affineControls.find((row) =>
  row.a === 1 && row.b === -1 && row.c === 1 && row.d === 1 && row.tx === 0 && row.ty === 0);
assert.ok(hAffine);
const affineOrder = affineControls.slice().sort((a, b) =>
  b.dictionaryHits - a.dictionaryHits ||
  b.signedHits - a.signedHits ||
  b.p56Exact - a.p56Exact ||
  b.p56Runes - a.p56Runes);
const hAffineRank = 1 + affineOrder.filter((row) =>
  row.dictionaryHits > hAffine.dictionaryHits ||
  (row.dictionaryHits === hAffine.dictionaryHits && row.signedHits > hAffine.signedHits) ||
  (row.dictionaryHits === hAffine.dictionaryHits && row.signedHits === hAffine.signedHits && row.p56Exact > hAffine.p56Exact) ||
  (row.dictionaryHits === hAffine.dictionaryHits && row.signedHits === hAffine.signedHits && row.p56Exact === hAffine.p56Exact && row.p56Runes > hAffine.p56Runes)
).length;
const affineSummary = {
  matrices: affineMatrices.length,
  translationsPerMatrix: 29 * 29,
  totalAffineMaps: affineControls.length,
  H_zero_offset: hAffine,
  H_rank_by_dictionary_signed_and_p56: hAffineRank,
  mapsWithAnyDictionaryHit: affineControls.filter((row) => row.dictionaryHits > 0).length,
  mapsWithAnySignedHit: affineControls.filter((row) => row.signedHits > 0).length,
  maxDictionaryHits: affineOrder[0].dictionaryHits,
  maxSignedHits: Math.max(...affineControls.map((row) => row.signedHits)),
  maxP56ExactWords: Math.max(...affineControls.map((row) => row.p56Exact)),
  mapsWithAnyP56ExactWord: affineControls.filter((row) => row.p56Exact > 0).length,
  topThree: affineOrder.slice(0, 3),
};

const HinvMatrix = { a: 15, b: 15, c: 14, d: 15 };
const HinvAffineControls = [];
for (let tx = 0; tx < 29; tx += 1) {
  for (let ty = 0; ty < 29; ty += 1) {
    const scores = mapStats(unknownWords, HinvMatrix.a, HinvMatrix.b, HinvMatrix.c, HinvMatrix.d, tx, ty);
    HinvAffineControls.push({ tx, ty, ...scores });
  }
}
const HinvZero = HinvAffineControls.find((row) => row.tx === 0 && row.ty === 0);
const HinvAffineRank = 1 + HinvAffineControls.filter((row) =>
  row.dictionaryHits > HinvZero.dictionaryHits ||
  (row.dictionaryHits === HinvZero.dictionaryHits && row.signedHits > HinvZero.signedHits)
).length;

const unknownH = unknownWords.map((word) => shell(word.values, H).map((value) => value));
const unknownHinv = unknownWords.map((word) => shell(word.values, Hinv).map((value) => value));
function wordRegisterStats(outputs) {
  const texts = outputs.map(spell);
  return {
    dictionaryHits: texts.filter((text) => dictionary.has(text.toLowerCase())).length,
    signedHits: texts.filter((text) => signedSet.has(text)).length,
    signedHitRows: texts.map((text, i) => signedSet.has(text) ? {
      page: unknownWords[i].page,
      start: unknownWords[i].start,
      len: unknownWords[i].len,
      text,
    } : null).filter(Boolean),
  };
}
const unknownHStats = wordRegisterStats(unknownH);
const unknownHinvStats = wordRegisterStats(unknownHinv);

const fragmentRegister = {
  eligibleAdjacentPairs: fragmentPairs.length,
  H: {
    dictionaryHits: fragmentH.filter((text) => dictionary.has(text.toLowerCase())).length,
    signedHits: fragmentH.filter((text) => signedSet.has(text)).length,
    exactHERE: fragmentHHere,
  },
  Hinv: {
    dictionaryHits: fragmentHinv.filter((text) => dictionary.has(text.toLowerCase())).length,
    signedHits: fragmentHinv.filter((text) => signedSet.has(text)).length,
    exactHERE: fragmentHinvHere,
  },
  naturalVariantControls: fragmentMatrixControls,
};

const p2p38 = {
  p2: {
    start: p2Receiver.start,
    end: p2Receiver.end,
    cipher: p2Receiver.values,
    H: p2H,
    H_text: spell(p2H),
    Hinv: p2Hinv,
    Hinv_text: spell(p2Hinv),
    preselected_target: "GOOD",
    H_exact_GOOD: p2H.every((value, i) => value === GOOD[i]),
    Hinv_exact_GOOD: p2Hinv.every((value, i) => value === GOOD[i]),
  },
  p38: {
    start: p38Receiver.start,
    end: p38Receiver.end,
    cipher: p38Receiver.values,
    H: p38H,
    H_text: spell(p38H),
    Hinv: p38Hinv,
    Hinv_text: spell(p38Hinv),
    preselected_target: "FOUND",
    H_exact_FOUND: p38H.every((value, i) => value === FOUND[i]),
    Hinv_exact_FOUND: p38Hinv.every((value, i) => value === FOUND[i]),
  },
};

const result = {
  status: "PASS",
  source: {
    transcriptionParts: parts.length,
    p28OriginalImage: "liber-primus-jpegs/45.jpg",
    p56OriginalImage: "liber-primus-jpegs/73.jpg",
    p57OriginalImage: "liber-primus-jpegs/74.jpg",
    p56PlaintextSource: "resources/external/relikd-solved-gp29-native-v1.json",
    p56PlaintextIsExternalSolvedTranscription: true,
  },
  operation: {
    H: "[(x-y),(x+y)] mod29",
    Hinv: "[(15*(u+v)),(15*(v-u))] mod29",
    serialization: "outside-in pairs; preserve odd center as final rune",
    affineControls: "all 48 invertible 2x2 matrices with coefficients in {-1,0,1}, crossed with all 29^2 translations",
  },
  solvedControls: {
    p56CipherWords: p56Cipher.length,
    p56PlainWords: p56Plain.length,
    p56Runes: 85,
    H: {
      exactPlainWords: p56H.exactPlainWords,
      alignedPlainRunes: p56H.alignedPlainRunes,
      dictionaryHits: p56H.dictionaryHits,
      signedHits: p56H.signedHits,
    },
    Hinv: {
      exactPlainWords: p56Hinv.exactPlainWords,
      alignedPlainRunes: p56Hinv.alignedPlainRunes,
      dictionaryHits: p56Hinv.dictionaryHits,
      signedHits: p56Hinv.signedHits,
    },
    p57ClearWords: p57Clear.length,
    p57Runes: 95,
    H_on_clear_p57: {
      dictionaryHits: p57H.dictionaryHits,
      signedHits: p57H.signedHits,
    },
    Hinv_on_clear_p57: {
      dictionaryHits: p57Hinv.dictionaryHits,
      signedHits: p57Hinv.signedHits,
    },
  },
  p28Geometry: {
    line1FragmentLengths: p28Line1.map((fragment) => fragment.length),
    line1FirstTwoThroughH: p28StartH,
    line1FirstTwoText: spell(p28StartH),
    line1FirstTwoThroughHinv: p28StartHinv,
    line1FirstTwoHinvText: spell(p28StartHinv),
    line6FragmentLengths: p28Line6.map((fragment) => fragment.length),
    line6ThroughH: p28Line6H,
    line6ThroughHinv: p28Line6Hinv,
    word28Outer: outer28,
    word28OuterThroughH: H(...outer28),
    word28Inner: inner28,
    word28InnerThroughH: H(...inner28),
    word29ThroughH: H(...successorWord29),
    allAdjacentFragmentPairs: fragmentRegister,
  },
  p27IndependentReceiver: {
    red19Red13Rows: p27Red13.length,
    H_hits: p27Red13.filter((row) => row.throughH[0] === 6 && row.throughH[1] === 3),
    Hinv_rows: p27Red13.map((row) => ({ page: row.page, start: row.start, length: row.length, throughHinv: row.throughHinv })),
  },
  p0Receiver: {
    offsets: [80, 102],
    wordLengths: p0ReceiverWords.map((word) => word.len),
    H_output: p0H,
    H_state: hasAll(p0H, dhState),
    Hinv_output: p0Hinv,
    Hinv_state: hasAll(p0Hinv, dhState),
    matched23RuneFourWordWindows: p0Windows.length,
    windowStateCoverage: p0WindowState,
  },
  untouchedSourceSelectedReceivers: p2p38,
  unknownWordFamily: {
    fourRuneWords: fourRuneWords.length,
    fiveRuneWords: fiveRuneWords.length,
    total: unknownWords.length,
    dictionarySize: dictionary.size,
    authenticated2016Words: signedWords.length,
    H: unknownHStats,
    Hinv: unknownHinvStats,
    orientationAndBoundaryConfigurations: orientationBoundary.length,
    H_orientation_row: hOrientationRow,
    best_orientation_boundary_row: bestOrientation,
    affineControls: affineSummary,
    Hinv_translationControls: {
      translations: HinvAffineControls.length,
      zeroOffset: HinvZero,
      rank: HinvAffineRank,
      mapsWithAnyDictionaryHit: HinvAffineControls.filter((row) => row.dictionaryHits > 0).length,
      maxDictionaryHits: Math.max(...HinvAffineControls.map((row) => row.dictionaryHits)),
    },
  },
  decision:
    "H is exactly reversible and source-selective on the p28 local geometry, but it does not transfer as a wordwise deciphering operation to solved p56 or the preselected p38 FOUND receiver. p56 provides the direct known-ciphertext/known-plaintext negative control; p57 is a clear-text lexical baseline. Do not promote manuscript-wide H semantics from the local p28/p0 structures.",
};

console.log(JSON.stringify(result, null, 2));
