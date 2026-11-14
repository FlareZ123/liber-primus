"use strict";
/**
 * Direct GP29 inverse for repeat-delimited, predecessor-excluding base28
 * integers. A candidate plain-text transport, tested without fitted keys.
 * Run: node sims/lp2_repeatpacket_gp29_inverse_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const book = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "resources",
  "liber-primus", "lp2-corpus.json"), "utf8"));
const chapters = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];

/** @param {number[]} digits @param {number} base @returns {bigint} */
function numeral(digits, base) {
  return digits.reduce((v, d) => v * BigInt(base) + BigInt(d), 0n);
}
/** @param {bigint} value @param {number} base @returns {number[]} */
function digits(value, base) {
  if (!value) return [0];
  const out = [];
  for (let n = value; n; n /= BigInt(base)) out.push(Number(n % BigInt(base)));
  return out.reverse();
}
/** @param {number[]} p @returns {number[]} */
function inverse(p) {
  return p.length ? digits(numeral(p, 28), 29) : [];
}
/** @param {number[]} p @param {number} width @returns {number[]} */
function forward(p, width) {
  if (!width) {
    assert.deepEqual(p, []);
    return [];
  }
  const out = digits(numeral(p, 29), 28);
  assert.ok(out.length <= width, "known packet length cannot carry this GP plaintext");
  return Array(width - out.length).fill(0).concat(out);
}
/**
 * @param {number[]} cipher Original chapter GP indices
 * @param {"sorted"|"cyclic"} mode
 */
function parse(cipher, mode) {
  assert.ok(cipher.length);
  const packets = [[]];
  for (let i = 1; i < cipher.length; i++) {
    const previous = cipher[i - 1], current = cipher[i];
    if (current === previous) packets.push([]);
    else packets[packets.length - 1].push(mode === "sorted"
      ? current - Number(current > previous)
      : (current - previous + 29) % 29 - 1);
  }
  return {seed:cipher[0], packets};
}
/**
 * @param {{seed:number,packets:number[][]}} section
 * @param {"sorted"|"cyclic"} mode
 * @returns {number[]}
 */
function reconstruct(section, mode) {
  let previous = section.seed;
  const out = [previous];
  for (let k = 0; k < section.packets.length; k++) {
    for (const d of section.packets[k]) {
      const next = mode === "sorted"
        ? d + Number(d >= previous) : (previous + d + 1) % 29;
      assert.notEqual(next, previous);
      out.push(next);
      previous = next;
    }
    if (k + 1 < section.packets.length) out.push(previous);
  }
  return out;
}
/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  const count = Array(29).fill(0);
  for (const x of xs) count[x]++;
  return count.reduce((s,n) => s + n * (n-1), 0) / (xs.length * (xs.length-1));
}
/** @param {number} width @param {number} ordinal @returns {number[]} */
function nativePositive(width, ordinal) {
  if (!width) return [];
  const solved = book.pages.find(p => p.page === 57).indices;
  const count = Math.max(1, Math.floor(width * Math.log(28)/Math.log(29)) - 2);
  const p = Array.from({length:count}, (_,i) => solved[(ordinal+i)%solved.length]);
  if (p[0] === 0 || (width === 1 && p[0] === 28)) p[0] = solved[0];
  return p;
}
function run() {
  let sourceRunes = 0;
  const outputs = [];
  for (const mode of ["sorted", "cyclic"]) {
    let separators = 0, packets = 0, plantRunes = 0, ordinal = 0;
    let plantedWeightedIoCSum = 0;
    const decoded = [];
    const decodedPackets = [];
    const parable = book.pages.find(p => p.page === 57).indices;
    const perChapter = [];
    for (const [start,end] of chapters) {
      const source = book.pages.filter(p => p.page >= start && p.page <= end)
        .flatMap(p => p.indices);
      if (mode === "sorted") sourceRunes += source.length;
      const section = parse(source, mode);
      assert.deepEqual(reconstruct(section, mode), source);
      separators += section.packets.length - 1;
      packets += section.packets.length;
      let chapterRunes = 0;
      for (const pack of section.packets) {
        const candidate = inverse(pack);
        assert.deepEqual(forward(candidate, pack.length), pack);
        decoded.push(...candidate);
        decodedPackets.push(candidate);
        chapterRunes += candidate.length;
        const plantedPlain = nativePositive(pack.length, ordinal++);
        assert.deepEqual(inverse(forward(plantedPlain, pack.length)), plantedPlain);
        plantRunes += plantedPlain.length;
        if (plantedPlain.length > 1)
          plantedWeightedIoCSum += ioc(plantedPlain) * plantedPlain.length;
        // A second source-native control: use the actual 95-rune clear
        // p57 parable as one GP29 additive key rune for each packet.
        const k = parable[ordinal - 1];
        const keyedPlain = plantedPlain.slice();
        const keyedCipher = keyedPlain.map(x => (x + k) % 29);
        if (keyedCipher.length && (keyedCipher[0] === 0 ||
            (pack.length === 1 && keyedCipher[0] === 28))) {
          keyedCipher[0] = 1;
          keyedPlain[0] = (1 - k + 29) % 29;
        }
        const cipherRanks = forward(keyedCipher, pack.length);
        assert.deepEqual(inverse(cipherRanks).map(x => (x - k + 29) % 29), keyedPlain);
      }
      perChapter.push({pages:start+"-"+end, cipherRunes:source.length,
        delimiters:section.packets.length-1, plaintextRunes:chapterRunes});
    }
    assert.equal(separators, 86);
    assert.equal(packets, 95);
    const expected = mode === "sorted"
      ? {n:12746, ic:0.034507472771094366}
      : {n:12748, ic:0.034466897703512266};
    assert.equal(decoded.length, expected.n);
    assert.ok(Math.abs(ioc(decoded) - expected.ic) < 1e-12);
    const meanPacketIoC = decodedPackets.reduce((sum,p) =>
      sum + (p.length > 1 ? ioc(p) * p.length : 0), 0) / decoded.length;
    const packetIocExpected = mode === "sorted"
      ? 0.03433959015950163 : 0.03464409924579924;
    assert.ok(Math.abs(meanPacketIoC - packetIocExpected) < 1e-12);
    const parableKeyReadings = [];
    for (const order of ["forward", "reverse"]) {
      for (const sign of [-1, 1]) {
        const shifted = decodedPackets.flatMap((pack,i) =>
          pack.map(value => (value + sign * parable[order === "forward" ? i : 94-i] + 29) % 29));
        parableKeyReadings.push({order, sign, ioc:ioc(shifted),
          first20:shifted.slice(0,20).map(i => book.translit[i]).join(" ")});
      }
    }
    assert.ok(parableKeyReadings.every(x => x.ioc < 0.04));
    const plantedNativeMeanIoC = plantedWeightedIoCSum / plantRunes;
    assert.ok(plantedNativeMeanIoC > 0.06);
    outputs.push({mode, packets, delimiters:separators,
      meanPacketIoC, plantedNativeMeanIoC, parableKeyReadings,
      runeCount:decoded.length, ioc:ioc(decoded), positiveNativeRunes:plantRunes,
      first40:decoded.slice(0,40).map(i => book.translit[i]).join(" "),
      perChapter});
  }
  assert.equal(sourceRunes, 12956);
  assert.equal(book.pages.find(p => p.page === 56).indices.length, 85);
  assert.equal(book.pages.find(p => p.page === 57).indices.length, 95);
  const result = {sourceRunes, referenceClearP57IoC:ioc(book.pages.find(p=>p.page===57).indices), outputs};
  console.log(JSON.stringify(result,null,2));
  return result;
}
if (require.main === module) run();
module.exports = {run,parse,reconstruct,inverse,forward};
