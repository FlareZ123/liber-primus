"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSourceNativeTrigramModel } = require("./lp1_source_native_trigram_model.cjs");

const root = path.resolve(__dirname, "..");
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const lp1Reference = read("resources/liber-primus/lp1-plaintext-reference.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function hadamardPair(pair) {
  const [left, right] = pair;
  return [mod29(left - right), mod29(left + right)];
}

function inverseHadamardPair(pair) {
  const [difference, sum] = pair;
  return [
    mod29(15 * (difference + sum)),
    mod29(15 * (sum - difference)),
  ];
}

function shellDecode(word) {
  const out = [];
  for (let left = 0, right = word.length - 1; left < right; left += 1, right -= 1) {
    out.push(...hadamardPair([word[left], word[right]]));
  }
  if (word.length % 2 === 1) out.push(word[Math.floor(word.length / 2)]);
  return out;
}

function shellEncode(decoded) {
  const out = new Array(decoded.length);
  let input = 0;
  for (let left = 0, right = decoded.length - 1; left < right; left += 1, right -= 1) {
    const [x, y] = inverseHadamardPair([decoded[input], decoded[input + 1]]);
    out[left] = x;
    out[right] = y;
    input += 2;
  }
  if (decoded.length % 2 === 1) out[Math.floor(decoded.length / 2)] = decoded[input];
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

function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

function wordsOnPage(page) {
  return runeWords(physicalPart(page));
}

function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

const p28 = wordsOnPage(28);
const selected = p28[27];
const next = p28[28];
assert.deepEqual(selected, [28, 24, 10, 1, 20]);
assert.deepEqual(next, [24, 25]);

const outer = [selected[0], selected[4]];
const inner = [selected[1], selected[3]];
assert.deepEqual(hadamardPair(next), outer);
assert.deepEqual(hadamardPair([23, 8]), [15, 2]);
assert.deepEqual(hadamardPair(outer), [8, 19]);
assert.deepEqual(hadamardPair(inner), [23, 25]);
assert.deepEqual(shellDecode(selected), [8, 19, 23, 25, 10]);
assert.deepEqual(shellEncode(shellDecode(selected)), selected);
assert.deepEqual(shellEncode(shellDecode(next)), next);

const p = 23;
const g = 5;
const a = 6;
const A = 8;
const B = 19;
const K = 2;
const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Words = runeWords(p57.source_text);
const we = p57Words.find((word) => spell(word) === "WE");
assert.ok(we);
assert.equal(gp0(we), 25);
assert.deepEqual(hadamardPair(outer), [A, B]);
assert.deepEqual(hadamardPair(inner), [p, gp0(we)]);
assert.equal(selected.length, g);
assert.equal((selected[0] + selected[4]) % p, K);
assert.equal((selected[1] + selected[3]) % p, K);

const shellLinks = [];
let eligibleFiveTwo = 0;
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = wordsOnPage(page);
  for (let i = 0; i + 1 < words.length; i += 1) {
    const current = words[i];
    const successor = words[i + 1];
    if (current.length !== 5 || successor.length !== 2) continue;
    eligibleFiveTwo += 1;
    if (
      hadamardPair(successor)[0] === current[0] &&
      hadamardPair(successor)[1] === current[4]
    ) {
      shellLinks.push({
        page,
        word: i + 1,
        successor: i + 2,
        current: current.slice(),
        next: successor.slice(),
      });
    }
  }
}
assert.deepEqual(shellLinks, [{
  page: 28,
  word: 28,
  successor: 29,
  current: selected,
  next,
}]);

const pageNumbered = [];
for (let page = 1; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = wordsOnPage(page);
  if (words.length <= page) continue;
  const current = words[page - 1];
  const successor = words[page];
  if (current.length !== 5 || successor.length !== 2) continue;
  pageNumbered.push({
    page,
    link:
      hadamardPair(successor)[0] === current[0] &&
      hadamardPair(successor)[1] === current[4],
  });
}
assert.deepEqual(pageNumbered.filter((row) => row.link), [{ page: 28, link: true }]);

for (const word of p57Words) {
  assert.deepEqual(shellEncode(shellDecode(word)), word);
}

const unknownPages = [];
const decodedPages = [];
let rawRuneCount = 0;
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = wordsOnPage(page);
  const raw = words.flat();
  const decoded = words.flatMap(shellDecode);
  assert.equal(decoded.length, raw.length);
  rawRuneCount += raw.length;
  unknownPages.push(raw);
  decodedPages.push(decoded);
}
assert.equal(rawRuneCount, 12956);

const model = buildSourceNativeTrigramModel({ corpus, referenceText: lp1Reference });
const rawScore = model.scoreChapters(unknownPages).mean;
const decodedScore = model.scoreChapters(decodedPages).mean;

const p0DecodedWords = wordsOnPage(0).map(shellDecode);
const p0Targets = {
  first: [18, 13, 10, 13, 8, 24, 9, 26],
  second: [15, 18, 18, 5, 15],
};
const p0TitleMatches =
  JSON.stringify(p0DecodedWords[0]) === JSON.stringify(p0Targets.first) &&
  JSON.stringify(p0DecodedWords[1]) === JSON.stringify(p0Targets.second);

console.log(JSON.stringify({
  status: "PASS",
  selectedP28: {
    word28: selected,
    word29: next,
    nextThroughH: hadamardPair(next),
    dhLiteral: [23, 8],
    dhLiteralThroughH: hadamardPair([23, 8]),
    outer,
    outerThroughH: hadamardPair(outer),
    inner,
    innerThroughH: hadamardPair(inner),
    shellDecoded: shellDecode(selected),
    typed: { g: selected.length, a, A, B, p, K, weGp0: gp0(we) },
  },
  structuralControl: {
    eligibleWithinPageFiveToTwoPairs: eligibleFiveTwo,
    exactShellLinks: shellLinks,
    pageNumberedEligible: pageNumbered,
  },
  wholeBookDecoder: {
    runes: rawRuneCount,
    rawTrigram: rawScore,
    shellDecodedTrigram: decodedScore,
    lp1TrainingTrigram: model.trainingScore,
    solvedP57Trigram: model.p57Score,
    p0DecodedFirstTwo: p0DecodedWords.slice(0, 2).map(spell),
    p0ConditionalTitleMatches: p0TitleMatches,
  },
  interpretation:
    "The p28 NEXT successor and the selected five-rune word determine H(x,y)=(x-y,x+y) mod29. H(literal DH indices 23,8)=(b,K)=(15,2); H(next word29) equals word28 outer circumference; H of that circumference is DH public (A,B)=(8,19); H of the inner circumference is (p,WE)=(23,25). The relation is unique in the within-page five-rune to two-rune adjacency census. The same transform is tested without tuning as a wordwise decoder on all 12956 original unknown runes and against the conditional p0 title holdout.",
}, null, 2));
