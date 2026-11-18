"use strict";
/**
 * Original red225 + mark31 -> 256 LPAD test with p50 table.
 *
 * Source hypothesis: The bounded original p3-p7 red initials spell LPAD.
 * Thus left pad the original 225 red rune events with the 31 physical 13-dot
 * markers to exactly 256 positions, matching the 256 source table cells.
 * Frozen minimal receiver: subtract table byte at the same ordinal mod 29.
 *
 * A negative does not rule out other key derivations or other meanings of LPAD.
 * Run: node sims/lp2_lpad225_red31_grid256_original_sft.cjs
 * Evidence: original-source bounded hypothesis; never assert plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { run: solvedRegression } = require("./authentic_decryption_regression.cjs");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} filename */
function read(filename) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, filename), "utf8"));
}
/** @param {number[]} nums */
function ioc(nums) {
  const counts = new Array(29).fill(0);
  nums.forEach(n => { assert.ok(Number.isInteger(n) && n >= 0 && n < 29); counts[n]++; });
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (nums.length * (nums.length - 1));
}
/** @param {number[]} nums */
function hash(nums) {
  return crypto.createHash("sha256").update(Buffer.from(nums)).digest("hex");
}
/** @param {number[]} nums @param {string[]} texts */
function transliterate(nums, texts) {
  return nums.map(n => texts[n]).join("");
}
/** @param {number[]} input @param {number[]} key */
function subtract(input, key) {
  assert.equal(input.length, key.length);
  return input.map((x, i) => (x - key[i] % 29 + 29) % 29);
}
/** @param {number[]} input @param {number[]} key */
function add(input, key) {
  assert.equal(input.length, key.length);
  return input.map((x, i) => (x + key[i] % 29) % 29);
}

function main() {
  const corpus = read("resources/liber-primus/lp2-corpus.json");
  const ink = read("resources/liber-primus/lp2-ink-annotations.json");
  const grid = read("resources/liber-primus/lp2-grid-256.json");
  const native = read("resources/external/relikd-solved-gp29-native-v1.json");
  const runeIndex = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
  const byPage = new Map(corpus.pages.map(p => [p.page, p]));
  const red = [];
  const mark13 = [];
  for (const page of ink.pages) {
    const c = byPage.get(page.page);
    for (const span of page.red_spans || []) {
      const runes = [...span.runes];
      assert.deepEqual(runes.map(g => runeIndex.get(g)),
        c.indices.slice(span.start, span.start + span.length));
      red.push(...runes.map(r => runeIndex.get(r)));
    }
    for (const punct of page.large_punctuation || []) {
      if (punct[1] === 13) mark13.push({ page: page.page, offset: punct[0], ink: punct[2] });
    }
  }
  assert.equal(red.length, 225);
  assert.equal(mark13.length, 31);
  assert.equal(grid.bytes.length, 256);
  assert.equal(grid.bytes.every(n => Number.isInteger(n) && n >= 0 && n < 256), true);

  // First-party eight? The chapter has exactly 4 red spans (L,P,A,D).
  const chapter = ink.pages.filter(p => p.page >= 3 && p.page <= 7);
  const init = chapter.flatMap(p => (p.red_spans || []).map(s => runeIndex.get([...s.runes][0])));
  assert.deepEqual(init, [20,13,24,23]);

  // GP index13 denotes the 13-dot marker in this candidate's pad register.
  const padded = new Array(mark13.length).fill(13).concat(red);
  assert.equal(padded.length, 256);
  assert.deepEqual(padded.slice(31), red);
  const restoredPad = padded.slice(31);
  assert.deepEqual(restoredPad, red);

  const full256 = subtract(padded, grid.bytes);
  const red225 = full256.slice(31);
  assert.deepEqual(add(full256, grid.bytes), padded);

  // Source-native comparator: contiguous windows of exact source plaintext GP.
  const solved = native.sections.flatMap(section =>
    [...section.source_text].filter(g => runeIndex.has(g)).map(g => runeIndex.get(g)));
  assert.equal(solved.length, 2979);
  const length225 = [];
  const length256 = [];
  for (let i = 0; i + 225 <= solved.length; i++) length225.push(ioc(solved.slice(i, i+225)));
  for (let i = 0; i + 256 <= solved.length; i++) length256.push(ioc(solved.slice(i, i+256)));
  assert.equal(length225.length, 2755);
  assert.equal(length256.length, 2724);
  // A genuine source-native plaintext plant encrypted into red positions
  // decodes exactly, independently of the original text/cipher.
  const plant = solved.slice(0, 225);
  const key = grid.bytes.slice(31);
  const plantCipher = add(plant, key);
  assert.deepEqual(subtract(plantCipher, key), plant);

  const known = solvedRegression();
  assert.equal(known.reduce((s,v) => s+v.recoveredRunes,0),599);
  const result = {
    status: "SOURCE-ORIGINAL PASS: exact alignment and native controls; plaintext status evaluated below",
    hypothesis: "Source LPAD initial -> 31 13-dot markers left-padded before 225 physical red runes to 256, then literal p50 base60 byte subtraction mod29",
    source: {
      redRunes: red.length,
      mark13: mark13.length,
      dot13InkCounts: {
        red: mark13.filter(m=>m.ink==="red").length,
        black: mark13.filter(m=>m.ink==="black").length
      },
      printedTableCells: grid.bytes.length,
      leftPadLength: 31,
      padGPIndexFor13Dot: 13,
      first8Red: transliterate(red.slice(0,8),corpus.translit),
      last8Red: transliterate(red.slice(-8),corpus.translit),
      originalRedSHA256: hash(red),
      decodedFull256SHA256: hash(full256),
      decodedRed225SHA256: hash(red225)
    },
    sourceNativeControls: {
      authenticSolvedGP: solved.length,
      authenticSolvedCipherRegression: 599,
      plantedRedDecoderExact: 225,
      window225: {count:length225.length, min:Math.min(...length225), max:Math.max(...length225)},
      window256: {count:length256.length, min:Math.min(...length256), max:Math.max(...length256)}
    },
    originalReceiver: {
      padded256IoC: ioc(padded),
      decodedFull256IoC: ioc(full256),
      decodedRed225IoC: ioc(red225),
      red225IoCRaw: ioc(red),
      originalRed225AboveNativeMin: ioc(red225) >= Math.min(...length225),
      decodedRedPrefix100: transliterate(red225.slice(0,100),corpus.translit),
      decodedFullPrefix64: transliterate(full256.slice(0,64),corpus.translit),
      exactForwardRoundtrip: true
    }
  };
  process.stdout.write(JSON.stringify(result,null,2)+"\n");
}
if (require.main === module) main();
module.exports={ioc,main};
