"use strict";
/**
 * Exact lexical and ordinary-position gate for the signature-valid 2016 clue.
 *
 * Run: node sims/lp2_signed2016_literal_semantic_route_sft.cjs
 * Read-only CommonJS / Node 22 / standard library; canonical repository inputs.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));

const alphabet = new Map(corpus.runes.map((rune, index) => [rune, index]));
const latinTokens = corpus.translit
  .map((token, index) => ({token: token.toLowerCase(), index}))
  .sort((a, b) => b.token.length - a.token.length);

/** Historical Latin-to-GP normalization used only for exact lexical comparison. */
function encodeLatin(word) {
  const source = word.toLowerCase()
    .replaceAll("v", "u")
    .replaceAll("k", "c")
    .replaceAll("z", "s");
  const out = [];
  for (let at = 0; at < source.length;) {
    const hit = latinTokens.find(({token}) => source.startsWith(token, at));
    assert.ok(hit, `No GP token for ${word} at ${source.slice(at)}`);
    out.push(hit.index);
    at += hit.token.length;
  }
  return out;
}
const key = indices => indices.join(",");

/** Parse real printed LP2 words; line/page wraps never terminate a word. */
function parseUnknownWords() {
  const pages = transcription.split("%");
  const unbroken = pages.slice(0, 55).join("%");
  const words = [];
  let fragment = [];
  let runeCount = 0;
  function finish() {
    if (!fragment.length) return;
    words.push(fragment);
    fragment = [];
  }
  for (const char of unbroken) {
    if (alphabet.has(char)) {
      fragment.push(alphabet.get(char));
      runeCount++;
    } else if (char === "%" || char === "/" || /\s/u.test(char)) {
      // Page and line wrapping are continuations.
    } else {
      finish();
    }
  }
  finish();
  assert.equal(runeCount, 12956);
  assert.equal(words.length, 2896);
  return words;
}

/** Parse runic words from independently solved/native-GP source sections. */
function parseRunicWords(source) {
  const words = [];
  let fragment = [];
  function finish() {
    if (!fragment.length) return;
    words.push(fragment);
    fragment = [];
  }
  for (const char of source) {
    if (alphabet.has(char)) fragment.push(alphabet.get(char));
    else finish();
  }
  finish();
  return words;
}

const bodyMatch = signed.match(/Hash: SHA1\r?\n\r?\n([\s\S]*?)\r?\n-----BEGIN PGP SIGNATURE-----/);
assert.ok(bodyMatch);
const signedWords = (bodyMatch[1].replaceAll("7A35090F", "").match(/[A-Za-z]+/g) || []);
assert.equal(signedWords.length, 43);

const requested = [
  "path", "empty", "epiphany", "devoted", "words",
  "map", "meaning", "road", "numbers", "direction"
];
const signedPositions = Object.fromEntries(requested.map(word => {
  const position = signedWords.findIndex(candidate => candidate.toLowerCase() === word) + 1;
  assert.ok(position > 0);
  return [word, position];
}));
assert.deepEqual(signedPositions, {
  path:3, empty:5, epiphany:6, devoted:9, words:16,
  map:19, meaning:21, road:24, numbers:27, direction:30
});

const unknownWords = parseUnknownWords();
const unknownKeys = new Set(unknownWords.map(key));
const unknownHits = Object.fromEntries(requested.map(word => [
  word, unknownKeys.has(key(encodeLatin(word))) ? 1 : 0
]));
assert.deepEqual(unknownHits, {
  path:0, empty:0, epiphany:0, devoted:0, words:0,
  map:0, meaning:0, road:0, numbers:0, direction:0
});

const exactHits = {};
for (const word of [...requested, "way", "seek"]) {
  const target = key(encodeLatin(word));
  const hits = [];
  for (const section of solved.sections) {
    const words = parseRunicWords(section.source_text);
    words.forEach((indices, index) => {
      if (key(indices) === target) hits.push({section: section.name, word: index + 1});
    });
  }
  exactHits[word] = hits;
}
assert.deepEqual(exactHits.words, [{section:"0_warning", word:38}]);
assert.deepEqual(exactHits.numbers, [{section:"0_warning", word:41}]);
assert.deepEqual(exactHits.way, [
  {section:"0_welcome", word:26},
  {section:"0_welcome", word:35}
]);
assert.deepEqual(exactHits.seek, [{section:"p56_an_end", word:22}]);
for (const word of ["path","empty","epiphany","devoted","map","meaning","road","direction"]) {
  assert.deepEqual(exactHits[word], []);
}

function transliteratedWords(sectionName) {
  const section = solved.sections.find(candidate => candidate.name === sectionName);
  assert.ok(section);
  return parseRunicWords(section.source_text)
    .map(indices => indices.map(index => corpus.translit[index]).join(""));
}
function countNgram(sectionName, phrase) {
  const words = transliteratedWords(sectionName);
  const target = phrase.split(" ");
  let count = 0;
  for (let i = 0; i + target.length <= words.length; i++) {
    if (words.slice(i, i + target.length).join(" ") === phrase) count++;
  }
  return count;
}
assert.equal(countNgram("0_warning", "THEIR NUMBERS"), 1);
assert.equal(countNgram("0_welcome", "THE WAY"), 1);
assert.equal(countNgram("0_welcome", "AND YOU WILL"), 1);

const physicalPagesOneBased = requested.map(word => signedPositions[word]);
const projectPagesZeroBased = physicalPagesOneBased.map(page => page - 1);
const originalScans = projectPagesZeroBased.map(page => page + 17);
assert.deepEqual(physicalPagesOneBased, [3,5,6,9,16,19,21,24,27,30]);
assert.deepEqual(originalScans, [19,21,22,25,32,35,37,40,43,46]);
assert.equal(physicalPagesOneBased.includes(51), false); // p50 table
assert.equal(physicalPagesOneBased.includes(57), false); // solved p56
assert.equal(physicalPagesOneBased.includes(58), false); // solved p57

process.stdout.write(JSON.stringify({
  source:"signature-valid 2016 message + original p0-p55 words + solved native-GP corpus",
  signedWordCount:signedWords.length,
  requestedSignedPositions:signedPositions,
  ordinaryOneBasedPageProjection:{
    physicalPages:physicalPagesOneBased,
    projectPages:projectPagesZeroBased,
    originalScans
  },
  exactUnknownWordHits:unknownHits,
  exactSolvedHits:exactHits,
  exactPhraseEchoes:{
    warning:"THEIR NUMBERS",
    welcome:["THE WAY","AND YOU WILL"],
    p56:"SEEC"
  },
  verdict:"Literal lexical echoes re-select solved instructions, but the requested words do not define a unique route to an untouched LP2 object."
},null,2)+"\n");
