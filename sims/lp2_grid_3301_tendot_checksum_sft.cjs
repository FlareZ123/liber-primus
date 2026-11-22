"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

/**
 * Decode printed two-character positional numerals under a fixed alphabet.
 * @param {string[]} tokens
 * @param {string} alphabet
 * @returns {number[]}
 */
function decode(tokens, alphabet) {
  const base = alphabet.length;
  return tokens.map((token) => {
    assert.equal(token.length, 2);
    const high = alphabet.indexOf(token[0]);
    const low = alphabet.indexOf(token[1]);
    assert.ok(high >= 0 && low >= 0);
    const value = high * base + low;
    assert.ok(value >= 0 && value <= 255);
    return value;
  });
}

const fixture = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
const tokens = fixture.pages.flatMap((page) => page.tokens);
assert.deepEqual(fixture.pages.map((p) => [p.page, p.rows, p.cols]),
  [[49, 10, 8], [50, 13, 8], [51, 9, 8]]);
assert.equal(tokens.length, 256);
assert.equal(fixture.alphabet.length, 60);

const original = decode(tokens, fixture.alphabet);
assert.deepEqual(original, fixture.bytes);
const hash = crypto.createHash("sha256").update(Buffer.from(original)).digest("hex");
assert.equal(hash, "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const hi = tokens.reduce((s, t) => s + fixture.alphabet.indexOf(t[0]), 0);
const lo = tokens.reduce((s, t) => s + fixture.alphabet.indexOf(t[1]), 0);
const total = original.reduce((s, b) => s + b, 0);
assert.deepEqual([hi, lo, total], [424, 7566, 33006]);
assert.equal(60 * hi + lo, total);

// Context is physically visible and independently documented. These constants
// are candidate checksum operands, NOT a cipher instruction from the creator:
// p49 red marker: 10 dots; width-8 table: four concentric rings; Cicada: 3301.
const proposedTotal = 10 * 3301 - 4;
assert.equal(proposedTotal, total);
assert.equal((proposedTotal - lo) / hi, 60);

// A genuine positional radix must accommodate all 60 indexed digits. The
// previously studied alternative deletes lowercase f to get 59 digits.
const shortAlphabet = fixture.alphabet.replace("f", "");
assert.equal(shortAlphabet.length, 59);
const base59 = decode(tokens, shortAlphabet);
assert.equal(base59.reduce((s, b) => s + b, 0), 32499);
assert.notEqual(base59.reduce((s, b) => s + b, 0), proposedTotal);

// Five independently reported image-disputed alternate cell readings change
// the complete checksum by 29. Their positions are never fitted to the sum.
const disputed = [45, 50, 165, 172, 246];
const alternateValues = [81, 21, 47, 174, 224];
assert.deepEqual(disputed.map((i) => original[i]), [107, 47, 18, 148, 198]);
const alternate = original.slice();
for (let k = 0; k < disputed.length; k++) alternate[disputed[k]] = alternateValues[k];
assert.equal(alternate.reduce((s, b) => s + b, 0), 33035);

// Sanity controls: a one-byte edit changes the checksum, while reordering
// does not. Thus this identity cannot select any table traversal.
const edited = original.slice();
edited[0] += 1;
assert.equal(edited.reduce((s, b) => s + b, 0), total + 1);
assert.equal(original.slice().reverse().reduce((s, b) => s + b, 0), total);

console.log(JSON.stringify({
  source: "resources/liber-primus/lp2-grid-256.json",
  sha256: hash,
  cells: tokens.length,
  leadingDigitSum: hi,
  trailingDigitSum: lo,
  nativeBase: 60,
  total,
  conditionalChecksum: "33006 + 4 = 10 * 3301",
  rivalBase59Total: base59.reduce((s, b) => s + b, 0),
  imageDisputedFiveCellTotal: alternate.reduce((s, b) => s + b, 0),
  conclusion: "exact checksum coincidence, potential radix check; no cipher, key, or plaintext"
}, null, 2));
