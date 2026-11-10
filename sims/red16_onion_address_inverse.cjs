"use strict";
/**
 * Two 16-rune red headings as possible 2014 Tor-v2 hidden-service names.
 * LP2 physical pages 3 and 23 each show 16 contiguous red GP runes followed
 * by a red 13-dot mark. Source-prescribed interpretations tested:
 *
 *   A. 16 red runes -> 16 Base32 hostname characters through one arbitrary,
 *      entirely secret, globally injective 29-to-32 symbol assignment.
 *   B. Append the 13-dot count as GP index 13, yielding 17 base29 digits
 *      to encode an 80-bit Tor-v2 hostname; allow one arbitrary globally
 *      secret GP29 digit permutation.
 *
 * Seven 2014 historical onion hosts are frozen from an existing manuscript
 * archive manifest; any ordered pair, red-heading reversal and hostname
 * reversal is considered. Exact max-weight assignments check all 29!/32P29
 * alphabet choices simultaneously, with authentic-message positive controls.
 * Does not decode unknown LP2 prose or identify the missing p56 destination.
 *
 * Run: node sims/red16_onion_address_inverse.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {assignmentMax} = require("./outer_permutation_assignment.cjs");

const root = path.resolve(__dirname, "..");
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const manifest = read("resources/cicada2014-archive-hash-manifest.json");
const BASE32 = "abcdefghijklmnopqrstuvwxyz234567";
const hosts = manifest.onionHosts.map(host => host.replace(/\.onion$/, ""));
const PAGES = [3, 23];
const heads = PAGES.map(number => {
  const page = corpus.pages[number];
  const visual = ink.pages.find(record => record.page === number);
  assert.equal(visual.red_spans[0].start, 0);
  assert.equal(visual.red_spans[0].length, 16);
  assert.equal(visual.red_spans[0].runes, page.indices.slice(0, 16)
    .map(x => corpus.runes[x]).join(""));
  assert(visual.large_punctuation.some(
    mark => mark[0] === 16 && mark[1] === 13 && mark[2] === "red"
  ));
  return page.indices.slice(0, 16);
});
assert.equal(hosts.length, 7);
assert(hosts.every(host => host.length === 16 &&
  [...host].every(char => BASE32.includes(char))));

/**
 * A Tor-v2 service address has 80 bits, or 16 Base32 symbols.
 * 29^17 > 2^80, so 17 GP radix-29 digits suffice to hold the integer.
 * @param {string} address
 * @returns {number[]}
 */
function toBase29(address) {
  let number = 0n;
  for (const char of address) {
    number = (number << 5n) + BigInt(BASE32.indexOf(char));
  }
  const digits = Array(17).fill(0);
  for (let j = 16; j >= 0; j--) {
    digits[j] = Number(number % 29n);
    number /= 29n;
  }
  assert.equal(number, 0n);
  return digits;
}

/**
 * Exact maximum matching under one secret injective symbol map.
 * The padded 32x32 Hungarian instance tests the full 29-to-32 map.
 * @param {number[]} observed
 * @param {number[]} target
 * @param {29|32} alphabet
 * @returns {number}
 */
function optimum(observed, target, alphabet) {
  assert.equal(observed.length, target.length);
  const size = alphabet;
  const counts = Array.from({length:size}, () => Array(size).fill(0));
  for (let i = 0; i < observed.length; i++) {
    assert(observed[i] >= 0 && observed[i] < 29);
    assert(target[i] >= 0 && target[i] < size);
    counts[observed[i]][target[i]]++;
  }
  return assignmentMax(counts).score;
}

/**
 * @param {number[][]} input
 * @returns {object}
 */
function scan(input) {
  const results = {base32:{best:null, maximum:0, exact:0},
    base29:{best:null, maximum:0, exact:0}};
  let models = 0;
  for (let a = 0; a < hosts.length; a++) {
    for (let b = 0; b < hosts.length; b++) {
      if (a === b) continue;
      for (let mask = 0; mask < 16; mask++) {
        const headsA = mask & 1 ? input[0].slice().reverse() : input[0];
        const headsB = mask & 2 ? input[1].slice().reverse() : input[1];
        const addressA = mask & 4 ? [...hosts[a]].reverse().join("") : hosts[a];
        const addressB = mask & 8 ? [...hosts[b]].reverse().join("") : hosts[b];
        const base32 = optimum([...headsA, ...headsB],
          [...addressA, ...addressB].map(c => BASE32.indexOf(c)), 32);
        const base29 = optimum([...headsA, 13, ...headsB, 13],
          [...toBase29(addressA), ...toBase29(addressB)], 29);
        const candidate = {addressA:hosts[a], addressB:hosts[b],
          reverseHeaderA:Boolean(mask & 1), reverseHeaderB:Boolean(mask & 2),
          reverseAddressA:Boolean(mask & 4), reverseAddressB:Boolean(mask & 8)};
        models++;
        for (const [name, number, length] of
          [["base32",base32,32],["base29",base29,34]]) {
          const slot = results[name];
          slot.exact += Number(number === length);
          if (number > slot.maximum) {
            slot.maximum = number;
            slot.best = candidate;
          }
        }
      }
    }
  }
  return {models, results};
}

/** Source-authentic 32-character target encoded with a secret injective map. */
function plant32() {
  const labels = [hosts[0], hosts[4]].flatMap(x =>
    [...x].map(c => BASE32.indexOf(c)));
  const used = [...new Set(labels)].sort((a,b)=>a-b);
  assert(used.length <= 29);
  const cipher = new Map(used.map((x, i) => [x, (7 + i*13) % 29]));
  const words = [labels.slice(0,16).map(x=>cipher.get(x)),
    labels.slice(16).map(x=>cipher.get(x))];
  const matched = optimum(words.flat(), labels, 32);
  assert.equal(matched,32);
  return {matched, decodedSymbols:32, usedAlphabet:used.length};
}

/** Two original historical addresses with the same final base29 digit. */
function plant29() {
  const [a,b] = [hosts[0], hosts[4]];
  const targets = [toBase29(a),toBase29(b)];
  assert.equal(targets[0].at(-1),targets[1].at(-1));
  const plantedCipher = Array.from({length:29},(_,i)=>((i*11+7)%29));
  // Swap the existing 13 to the source-specified marker digit position.
  const previous = plantedCipher.indexOf(13);
  if(previous !== targets[0].at(-1)) {
    [plantedCipher[previous], plantedCipher[targets[0].at(-1)]] =
      [plantedCipher[targets[0].at(-1)],plantedCipher[previous]];
  }
  const cipherWords = targets.map(digits => digits.map(x => plantedCipher[x]));
  assert.equal(cipherWords[0][16], 13);
  assert.equal(cipherWords[1][16], 13);
  const matched = optimum(cipherWords.flat(), targets.flat(), 29);
  assert.equal(matched,34);
  return {matched, decodedDigits:34, markerCipherIndex:13};
}

function main() {
  const found = scan(heads);
  assert.equal(found.models, 672);
  assert.equal(found.results.base32.maximum, 20);
  assert.equal(found.results.base29.maximum, 22);
  assert.equal(found.results.base32.exact, 0);
  assert.equal(found.results.base29.exact, 0);
  const control = {base32:plant32(),base29:plant29()};
  const result = {
    sourcePages:PAGES,
    printedRedRuneLength:16,
    followingDotCount:13,
    historicalHostCandidates:hosts.length,
    interpretationA:"16 printed runes to 16 onion-v2 Base32 symbols under any globally injective 29-to-32 alphabet",
    interpretationB:"16 runes plus literal 13-dot GP digit to 17 base29 digits under any secret 29-symbol permutation",
    testedPairOrientationCases:found.models,
    original:found.results,
    synthetic:control,
    verdict:"Zero complete original address inverses in either exact symbol-map family. These historical addresses are excluded as simultaneous two-title direct encodings; other sites, lengths, transforms and destination channels remain open."
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if (require.main === module) main();
module.exports = {toBase29,optimum,scan,plant32,plant29,main};
