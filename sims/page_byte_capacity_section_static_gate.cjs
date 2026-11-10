"use strict";
/**
 * Exact all-secret-row obstruction for maximal unrestricted-byte
 * 28-rank page packets on physical LP2 pages 8–14.
 *
 * Each page publishes one initialization rune and D predecessor-excluding
 * radix-28 digits. Observed adjacent repeats are transparent markers.
 * The D digits encode m whole unrestricted bytes with
 * 256^m <= 28^D and m as large as possible; smaller byte lengths have
 * an equal or stronger leading-zero restriction.
 *
 * Each physical page may have a different IV and repeat mask. Each text
 * section retains a stationary hidden successor-to-rank table per
 * predecessor. The theorem holds for ANY such hidden 29x28 table.
 *
 * Run using Node 22 CommonJS from repository root.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const original = corpus.pages.filter(p => p.page >= 8 && p.page <= 14);
assert.equal(original.length, 7);
assert.equal(original.reduce((n, p) => n + p.indices.length, 0), 1729);

// The seven physical pages are the same canonical $-delimited text section.
const master = fs.readFileSync(path.join(ROOT,
  "resources/transcriptions/liber_primus_master.txt"), "utf8");
const begin = master.indexOf("ᛋᚻᛖᚩᚷ");
assert.ok(begin >= 0);
const symbol = new Map(corpus.runes.map((r, i) => [r, i]));
const sections = master.slice(begin).split("%").slice(0, 56)
  .join("%").split("$").map(s => [...s]
    .filter(r => symbol.has(r)).map(r => symbol.get(r)))
  .filter(p => p.length);
assert.equal(sections[2].length, 1729);
assert.deepEqual(sections[2], original.flatMap(p => p.indices));

const pow28 = d => 28n ** BigInt(d);

/** @param {number} digits */
function maximumWholeBytes(digits) {
  let length = 0, capacity = pow28(digits), power = 256n;
  while (power <= capacity) {
    length++;
    power *= 256n;
  }
  return length;
}

/** @param {number[]} seq */
function transitions(seq) {
  const out = [];
  for (let i = 1; i < seq.length; i++) {
    if (seq[i] !== seq[i - 1]) out.push([seq[i - 1], seq[i]]);
  }
  return out;
}

/** @param {"forward"|"backward"} traversal
 * @param {"big"|"little"} significance */
function obstruction(traversal, significance) {
  const rows = [];
  const predecessorTargets = new Map();
  for (const p of original) {
    const seq = traversal === "forward" ? p.indices :
      p.indices.slice().reverse();
    const edges = transitions(seq);
    const D = edges.length, m = maximumWholeBytes(D);
    // The largest possible most-significant radix-28 digit among all
    // m-byte unsigned integers. This is exact, with no floating point.
    const bound = ((256n ** BigInt(m)) - 1n) / pow28(D - 1);
    assert.equal(bound, 0n, "All seven pages must force zero");
    const pair = significance === "big" ? edges[0] : edges.at(-1);
    const label = corpus.translit[pair[0]];
    const item = {page:p.page, pageRunes:seq.length, digits:D,
      maxUnrestrictedBytes:m, maximumLeadingDigit:Number(bound),
      predecessor:label, successor:corpus.translit[pair[1]],
      predecessorIndex:pair[0], successorIndex:pair[1]};
    rows.push(item);
    const related = predecessorTargets.get(pair[0]) || [];
    related.push(item);
    predecessorTargets.set(pair[0], related);
  }
  // A deterministic predecessor-keyed row cannot send two distinct
  // successors to the same digit zero within this same source section.
  const contradictions = [...predecessorTargets.values()]
    .filter(xs => new Set(xs.map(x => x.successorIndex)).size >= 2)
    .map(xs => ({predecessor:xs[0].predecessor,
      observations:xs.map(x => ({
        page:x.page, successor:x.successor,
        successorIndex:x.successorIndex}))}));
  assert.ok(contradictions.length > 0);
  return {traversal, significance, forcedZeroPages:rows.length,
    contradictions, pageEvidence:rows};
}

/** @param {Buffer} bytes
 * @param {number} digits */
function toDigits(bytes, digits) {
  let value = 0n;
  for (const b of bytes) value = (value << 8n) | BigInt(b);
  const output = new Array(digits);
  for (let i = digits - 1; i >= 0; i--) {
    output[i] = Number(value % 28n);
    value /= 28n;
  }
  assert.equal(value, 0n);
  return output;
}

/** @param {number[]} digits
 * @param {number} byteLength */
function fromDigits(digits, byteLength) {
  let value = 0n;
  for (const digit of digits) value = value * 28n + BigInt(digit);
  const out = Buffer.alloc(byteLength);
  for (let i = byteLength - 1; i >= 0; i--) {
    out[i] = Number(value & 255n);
    value >>= 8n;
  }
  assert.equal(value, 0n);
  return out;
}

/** @param {number} page
 * @param {number} length */
function inputBytes(page, length) {
  let x = (0x421921 ^ (page * 0x9e3779b9)) >>> 0;
  const data = Buffer.alloc(length);
  for (let i = 0; i < length; i++) {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    data[i] = x & 255;
  }
  return data;
}

// A planted secret cyclic alphabet is one member of the much larger
// family of arbitrary predecessor-specific 28-symbol permutations.
const order = Array.from({length:29}, (_, i) => (7*i + 11) % 29);
const positions = new Array(29);
order.forEach((v, i) => { positions[v] = i; });
assert.equal(new Set(order).size, 29);
const emit = (prev, rank) => order[(positions[prev] + 1 + rank) % 29];
const invert = (prev, next) =>
  (positions[next] - positions[prev] + 28) % 29;

/** @param {"forward"|"backward"} traversal
 * @param {"big"|"little"} significance */
function positive(traversal, significance) {
  let totalBytes = 0, totalRunes = 0, repeatMarkers = 0;
  for (const p of original) {
    const seq = traversal === "forward" ? p.indices :
      p.indices.slice().reverse();
    const isRepeat = seq.map((v, i) => i > 0 && v === seq[i - 1]);
    const D = seq.length - 1 - isRepeat.filter(Boolean).length;
    const m = maximumWholeBytes(D);
    const clear = inputBytes(p.page, m);
    const bigDigits = toDigits(clear, D);
    const emittedDigits = significance === "big" ?
      bigDigits : bigDigits.slice().reverse();
    const cipher = [seq[0]];
    let j = 0;
    for (let i = 1; i < seq.length; i++) {
      const prev = cipher.at(-1);
      cipher.push(isRepeat[i] ? prev : emit(prev, emittedDigits[j++]));
    }
    assert.equal(j, D);
    assert.equal(cipher.length, seq.length);
    assert.ok(cipher.every((x, i) =>
      i === 0 || (x === cipher[i - 1]) === isRepeat[i]));
    const recoveredDigits = transitions(cipher)
      .map(([prev, next]) => invert(prev, next));
    if (significance === "little") recoveredDigits.reverse();
    assert.deepEqual(fromDigits(recoveredDigits, m), clear);
    totalBytes += m;
    totalRunes += cipher.length;
    repeatMarkers += isRepeat.filter(Boolean).length;
  }
  assert.equal(totalRunes, 1729);
  return {traversal, significance, recoveredBytes:totalBytes,
    replayedSourceLengthRunes:totalRunes,
    preservedRepeatMarkers:repeatMarkers,
    exactInverse:true};
}

function run() {
  const proofs = [], positiveControls = [];
  for (const traversal of ["forward", "backward"])
    for (const significance of ["big", "little"]) {
      proofs.push(obstruction(traversal, significance));
      positiveControls.push(positive(traversal, significance));
    }
  return {
    claim:"Exact original-source no-go for maximal unrestricted byte payloads "+
      "in per-page predecessor-excluding 28-rank code with section-static "+
      "hidden predecessor tables",
    sourcePages:"LP2 physical 8–14; one canonical section; 1729 runes",
    conclusion:"All four direction/digit-order combinations contradict "+
      "a deterministic predecessor row even under arbitrary secret alphabets.",
    forcedZeroPagesPerOrientation:7,
    original:proofs,
    syntheticControls:positiveControls,
    limits:"Assumes page-local IVs, same-page doublets treated as markers, "+
      "page-local unrestricted m-byte integer capacity with "+
      "m <= floor(log_256(28^D)), and a shared predecessor-row table "+
      "within the seven-page section. Extra byte overhead, restricted "+
      "codebooks, a mid-section hidden rekey, alternate marker rules or "+
      "an intermediate masked rank register are outside this theorem. "+
      "No original plaintext or authentic key was recovered."
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {run};
