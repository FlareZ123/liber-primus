"use strict";

/**
 * Exact original-LP2 falsification of same-key replay after a lag-six T repair.
 *
 * Every repair in the proposed lossless variant emits a marker
 * T(c[j-6]) = (24 - 2*c[j-6]) mod 29, then retries the collided
 * plaintext rune under the SAME key. Because the provisional rune
 * collided with c[j-1], the three transmitted symbols MUST satisfy
 * c[j-1] == c[j+1]. This invariant needs no plaintext or unknown key.
 *
 * Run on the checked-in original transcription with Node.js 22.
 * Read-only, deterministic, zero external dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const book = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const text = fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-transcription.txt"), "utf8"
);

const glyphs = Array.from("ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ");
assert.equal(glyphs.length, 29);
const index = new Map(glyphs.map((glyph, i) => [glyph, i]));
const physical = text.split("%").filter((section) => /[\u16A0-\u16FF]/u.test(section));
assert.equal(physical.length, 57, "The transcription omits numeric-only physical p50");
physical.splice(50, 0, "");
assert.equal(physical.length, 58);

/** @param {number[]} word @param {number} i */
function markedReplay(word, i) {
  const marker = (24 - 2 * word[i - 6] + 58) % 29;
  return {
    isT: word[i] === marker,
    isReplay: word[i - 1] === word[i + 1],
  };
}

const planted = [3, 12, 14, 16, 20, 7, 18, 7, 6];
assert.deepEqual(markedReplay(planted, 6), {isT: true, isReplay: true});
assert.deepEqual(markedReplay([3, 12, 14, 16, 20, 7, 18, 14, 6], 6),
  {isT: true, isReplay: false});

const strict = {eligible: 0, T: 0, replay: 0, both: 0, witnesses: []};
const pageOnly = {eligible: 0, T: 0, replay: 0, both: 0, witnesses: []};
let literalWords = 0;
let originalRunes = 0;

for (let p = 0; p < 58; p++) {
  const joined = physical[p].replace(/[\/\r\n&$]/g, "");
  const words = joined.split(/[-.]/).map((field) =>
    Array.from(field).filter((glyph) => index.has(glyph)).map((glyph) => index.get(glyph))
  ).filter((word) => word.length > 0);
  const fromTranscript = words.flat();
  const original = book.pages[p].indices;
  assert.deepEqual(fromTranscript, original, "Exact original rune tape mismatch on p" + p);
  if (p > 55) continue;

  literalWords += words.length;
  originalRunes += original.length;

  for (let w = 0; w < words.length; w++) {
    const word = words[w];
    for (let i = 6; i + 1 < word.length; i++) {
      const hit = markedReplay(word, i);
      strict.eligible++;
      strict.T += Number(hit.isT);
      strict.replay += Number(hit.isReplay);
      strict.both += Number(hit.isT && hit.isReplay);
      if (hit.isT && hit.isReplay) {
        strict.witnesses.push({page: p, word: w, offset: i});
      }
    }
  }

  // Generous control: drop the word-boundary restriction entirely.
  for (let i = 6; i + 1 < original.length; i++) {
    const hit = markedReplay(original, i);
    pageOnly.eligible++;
    pageOnly.T += Number(hit.isT);
    pageOnly.replay += Number(hit.isReplay);
    pageOnly.both += Number(hit.isT && hit.isReplay);
    if (hit.isT && hit.isReplay) {
      pageOnly.witnesses.push({page: p, offset: i});
    }
  }
}

assert.equal(originalRunes, 12956);
assert.equal(literalWords, 2928);
assert.deepEqual([strict.eligible, strict.T, strict.replay, strict.both],
  [713, 46, 26, 1]);
assert.deepEqual(strict.witnesses, [{page: 45, word: 16, offset: 7}]);
assert.deepEqual([pageOnly.eligible, pageOnly.T, pageOnly.replay, pageOnly.both],
  [12564, 465, 426, 13]);

console.log(JSON.stringify({
  source: "original LP2 p0–55, exact source glyphs and separators",
  originalRunes, literalWords,
  sameKeyReplayNecessity: "T(c[j-6]) at j AND c[j-1] == c[j+1]",
  strict, pageOnly,
  plantedAndBrokenPositiveControls: "PASS",
}, null, 2));
