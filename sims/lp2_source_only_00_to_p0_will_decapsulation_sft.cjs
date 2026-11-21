"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.resolve(__dirname, "..", relative), "utf8");
}

/** @param {number} n @returns {number} */
const m29 = (n) => ((n % 29) + 29) % 29;

/**
 * @param {number} base
 * @param {number} exponent
 * @param {number} modulus
 * @returns {number}
 */
function power(base, exponent, modulus) {
  let result = 1;
  for (let i = 0; i < exponent; i += 1) result = result * base % modulus;
  return result;
}

const original = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const originalTable = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const cells = originalTable.pages.flatMap((page) => page.tokens);
const alphabet = originalTable.alphabet;
const pages = original.pages.filter((page) => page.page <= 55);
const eventsByCell = Array.from({ length: 256 }, () => []);
assert.equal(cells.length, 256);
assert.equal(pages.reduce((n, page) => n + page.indices.length, 0), 12956);

/** @param {string} token @returns {number} */
function number60(token) {
  return alphabet.indexOf(token[0]) * 60 + alphabet.indexOf(token[1]);
}

/** @param {number} index @returns {number} */
function low(index) {
  return alphabet.indexOf(cells[index][1]);
}

/** @param {number[]} runes @returns {number} */
function gpIndexSum(runes) {
  return runes.reduce((sum, rune) => sum + rune, 0);
}

/** @param {number[]} runes @returns {number} */
function gpPrimeSum(runes) {
  return runes.reduce((sum, rune) => sum + original.prime[rune], 0);
}

let global = 0, eventCount = 0;
for (const page of pages) {
  for (let i = 0; i < page.indices.length; i += 1, global += 1) {
    if (i === 0 || page.indices[i] !== page.indices[i - 1]) continue;
    const cell = (global - 1) % 256;
    eventsByCell[cell].push({ page: page.page, local: i, rune: page.indices[i] });
    eventCount += 1;
  }
}
assert.equal(eventCount, 86);

const sourceZeros = cells.flatMap((value, i) => value === "00" ? [i] : []);
assert.deepEqual(sourceZeros, [192, 229]);
const root = sourceZeros[0];
const recipientPageNumber = number60(cells[root]); // printed 00 -> page0
const firstEvents = eventsByCell[root];
assert.deepEqual(firstEvents.map((e) => e.page), [9, 24, 25, 34]);
const group1 = firstEvents.map((event) => event.rune);
const recipientOffsetWithinPacketPage = gpIndexSum(group1);
const secondEventCell = gpPrimeSum(group1);
assert.equal(recipientOffsetWithinPacketPage, 54);
assert.equal(secondEventCell, 210);
assert.equal(cells[secondEventCell], "06");

const secondEvents = eventsByCell[secondEventCell];
assert.deepEqual(secondEvents.map((e) => e.page), [4, 20, 27]);
const group2 = secondEvents.map((event) => event.rune);
const packetPageNumber = gpIndexSum(group2);
const wordTokenCell = gpPrimeSum(group2);
assert.equal(packetPageNumber, 38);
assert.equal(wordTokenCell, 133);
assert.equal(cells[wordTokenCell], "2L");

const packetPage = pages.find((page) => page.page === packetPageNumber);
const destinationPage = pages.find((page) => page.page === recipientPageNumber);
assert.ok(packetPage && destinationPage);
const packet = packetPage.indices.slice(recipientOffsetWithinPacketPage, recipientOffsetWithinPacketPage + 3);
assert.deepEqual(packet, [5, 12, 19]);
assert.equal(gpIndexSum(packet), low(recipientOffsetWithinPacketPage));
assert.equal(low(gpIndexSum(packet)), recipientOffsetWithinPacketPage);

// Candidate source-secret parameters, without referring to 2016 signed words.
const a = number60(cells[secondEventCell]);
const invA = Array.from({ length: 28 }, (_, i) => i + 1).find((x) => a * x % 29 === 1);
assert.ok(Number.isInteger(invA));
const K = m29(packet[1] * invA);
assert.equal(a, 6);
assert.equal(K, 2);
assert.equal(cells[low(secondEventCell)], String(K) + String(a));

/** @param {number} index @param {number} steps @returns {number} */
function advance(index, steps) {
  let position = index;
  for (let i = 0; i < steps; i += 1) position = low(position);
  return position;
}
const p = advance(root, K);
assert.equal(p, 23);
assert.equal(advance(root, packet[1]), 30);
assert.equal(cells[advance(root, packet[1])], cells[wordTokenCell]);
assert.equal(power(packet[2], a, p), K);
assert.equal(power(packet[0], a, p), 8);

// First-source 00 selects the physical recipient page0. The second
// original event group prime-indexes the printed 2L code, base60=141.
const recipientIndex = number60(cells[wordTokenCell]);
assert.equal(recipientIndex, 141);
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const firstPageLines = transcription.split(/\r?\n/);
const firstPageEnd = firstPageLines.indexOf("%");
assert.ok(firstPageEnd >= 0);
const originalPage0Text = firstPageLines.slice(0, firstPageEnd).join("").replaceAll("/", "");
const spans = [];
let position = 0, wordStart = null;
for (const char of originalPage0Text) {
  if (/\p{Script=Runic}/u.test(char)) {
    if (wordStart === null) wordStart = position;
    position += 1;
  } else if (wordStart !== null) {
    spans.push({ start: wordStart, end: position });
    wordStart = null;
  }
}
if (wordStart !== null) spans.push({ start: wordStart, end: position });
assert.equal(position, destinationPage.indices.length);
const selectedWord = spans.find((span) => span.start === recipientIndex);
assert.ok(selectedWord);
const selectedCipher = destinationPage.indices.slice(selectedWord.start, selectedWord.end);
assert.deepEqual(selectedCipher, [19, 16, 9, 18]);
const count = Number(cells[wordTokenCell][0]); // 2
const symbol = cells[wordTokenCell][1]; // L
const repeatRune = original.translit.indexOf(symbol);
assert.equal(count, 2);
assert.ok(repeatRune >= 0);
const knownKeyPrefix = [packet[1], a]; // original packet Ka=12, table a=6
const decodedPrefix = selectedCipher.slice(0, knownKeyPrefix.length)
  .map((rune, i) => m29(rune - knownKeyPrefix[i]));
assert.equal(selectedCipher.length, knownKeyPrefix.length + count);
const plaintext = decodedPrefix.concat(Array(count).fill(repeatRune));
const key = selectedCipher.map((rune, i) => m29(rune - plaintext[i]));
assert.deepEqual(plaintext.map((rune, i) => m29(rune + key[i])), selectedCipher);
const rendered = plaintext.map((rune) => original.translit[rune]).join("");
assert.equal(rendered, "WILL"); // ASSERTION ONLY, not decoder input.

// The decoder has used no 2016 signed text and no fitted last-two-key H.
console.log("Source route: original first 00 cell " + root + " -> original repeat group "
  + group1.map((r) => original.translit[r]).join(""));
console.log("Complete sums of first group: GPindex=" + recipientOffsetWithinPacketPage
  + ", GPprime=" + secondEventCell);
console.log("Source cell " + secondEventCell + "=" + cells[secondEventCell]
  + " -> second group " + group2.map((r) => original.translit[r]).join("")
  + " -> GPindex=" + packetPageNumber + ", GPprime=" + wordTokenCell);
console.log("Selected packet physical page:rune offset " + packetPageNumber + ":"
  + recipientOffsetWithinPacketPage + " has original runes " + packet);
console.log("Printed 06->a=" + a + ", 26->K=" + K + ",a=" + a
  + ", root K-step low-digit selects modulus p=" + p);
console.log("Shared secret DH23 B^a modp=" + power(packet[2], a, p));
console.log("Source 2L at cell " + wordTokenCell + " selects original page "
  + recipientPageNumber + " rune offset " + recipientIndex
  + ", complete printed word length " + selectedCipher.length);
console.log("No-signed-source decryption of two original cipher runes: "
  + decodedPrefix.map((r) => original.translit[r]).join(""));
console.log("Literal 2L suffix completes candidate original p0 plaintext: " + rendered);
console.log("Inferred suffix key values are " + key.slice(2).join(","));
console.log("PASS: source-only original-cipher local candidate WILL, no global LP2 cipher.");
