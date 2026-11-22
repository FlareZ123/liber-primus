"use strict";
/**
 * LP2 original p15 -> archived 2014 Emerson 16-character extraction.
 *
 * Provisional clue reconstruction, not an authenticated LP2 book-cipher key,
 * a verified Tor onion endpoint, or recovered unknown-page plaintext.
 *
 * Run on Windows 11: node sims/lp2_p15_emerson_spiral16_candidate_sft.cjs
 *
 * Primary physical source: resources/liber-primus/32.jpg (LP2 p15).
 * Literary source: neuroretransmit/cicada @ ade9a02889ef8acbc8cde8edbfd0a785c369f4c3,
 * 2014/001-twitter/self-reliance.txt, Git blob 12a6bc018047a1276e77f2b7f633d5905732fff9.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root, p), "utf8");

/** Exact original 4x4 layout of p15, image 32.jpg; 3299 is red. */
const grid = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
const expected = [
  3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516
];
const points = [[1, 1]];
let row = 1, col = 1, distance = 1, direction = 0;
const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
while (points.length < 16) {
  for (let side = 0; side < 2 && points.length < 16; side++) {
    const [dr, dc] = directions[direction % 4];
    for (let i = 0; i < distance && points.length < 16; i++) {
      row += dr;
      col += dc;
      assert.ok(row >= 0 && row < 4 && col >= 0 && col < 4);
      points.push([row, col]);
    }
    direction++;
  }
  distance++;
}
const nums = points.map(([r, c]) => grid[r][c]);
assert.deepEqual(nums, expected);
assert.equal(new Set(points.map(([r, c]) => r * 4 + c)).size, 16);

/** Pinned, byte-identical 2014 text previously used in the Emerson onion book code. */
const essay = read("resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt");
const buffer = Buffer.from(essay, "utf8");
const blob = crypto.createHash("sha1")
  .update(Buffer.from("blob " + buffer.length + "\0", "utf8"))
  .update(buffer).digest("hex");
assert.equal(blob, "12a6bc018047a1276e77f2b7f633d5905732fff9");
/** Historical positive control: 15 coordinates plus the signed literal '3'. */
const historicalAddresses = [
  "1:2:3:1", "3:3:13:5", "45:5:2:3", "20:3:20:5",
  "8:3:8:6", "48:5:14:2", "21:13:4:1", "25:1:7:4",
  "15:9:3:4", "1:1:16:3", "4:3:3:1", "8:3:26:4",
  "47:3:3:5", "3", "13:2:5:4", "1:4:16:4"
];
const historicParagraphs = essay.split("\n\n").map(paragraph =>
  paragraph.split(/(?<=[.!?])\s+/).map(sentence =>
    sentence.replace(/\n/g, " ").split(" ")));
const historicalOnion = historicalAddresses.map(code => {
  if (code === "3") return code;
  let [paragraph, sentence, word, letter] = code.split(":")
    .map(n => Number(n) - 1);
  if (paragraph + 1 >= 45) paragraph++;
  return historicParagraphs[paragraph][sentence][word][letter];
}).join("");
assert.equal(historicalOnion, "auqgnxjtvdbll3pv");

const letters = essay.toUpperCase().replace(/[^A-Z]/g, "");
assert.equal(letters.length, 43516);
assert.ok(Math.max(...nums) <= letters.length);
const onion = nums.map(oneBased => letters[oneBased - 1]).join("").toLowerCase();
assert.equal(onion, "vnteacldthtirony");
assert.match(onion, /^[a-z2-7]{16}$/);

/** Text-witness control: a separate Gutenberg spelling changes the extraction. */
const alternative = read("resources/control/emerson_essays_2944.txt");
const origin = alternative.toLowerCase().indexOf("i read the other day some verses");
assert.ok(origin >= 0);
const alternateLetters = alternative.slice(origin).toUpperCase().replace(/[^A-Z]/g, "");
const alternateOnion = nums.map(oneBased => alternateLetters[oneBased - 1])
  .join("").toLowerCase();
assert.equal(alternateOnion, "iveinyehootirono");

/** Descriptive same-witness offset control, no inferential p-value asserted. */
const wordList = read("resources/control/english_wordfreq_textblob.txt")
  .split(/\r?\n/).map(line => /^([a-z]{5}) (\d+)$/.exec(line))
  .filter(Boolean).filter(match => Number(match[2]) >= 10)
  .map(match => match[1].toUpperCase());
const common = new Set(wordList);
assert.equal(common.size, 1077);
const finalFive = nums.slice(-5).map(n => n - 1);
const max = Math.max(...finalFive);
let lexicalTailCount = 0;
let ironyOffsets = [];
for (let shift = 0; shift + max < letters.length; shift++) {
  const candidate = finalFive.map(index => letters[index + shift]).join("");
  if (common.has(candidate)) lexicalTailCount++;
  if (candidate === "IRONY") ironyOffsets.push(shift);
}
assert.equal(lexicalTailCount, 26);
assert.deepEqual(ironyOffsets, [0]);
console.log(JSON.stringify({
  status: "provisional letter-address hypothesis, not verified service or plaintext",
  original_p15_spiral: nums,
  source_git_blob: blob,
  source_ascii_letters: letters.length,
  authentic_2014_emerson_bookcode_positive: historicalOnion,
  extracted_16_base32: onion,
  hypothetical_onion_v2: onion + ".onion",
  other_edition_readout: alternateOnion,
  within_source_shift_control: {
    source_shifts: letters.length - max,
    common_5_letter_tail_shifts: lexicalTailCount,
    exact_IRONY_tail_shifts: ironyOffsets
  }
}, null, 2));
