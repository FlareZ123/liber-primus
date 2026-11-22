"use strict";

/**
 * All-secret rank-phase collision SFT, source-authentic 2013 prime echo
 * 464-cell clock and 2014 Stage11 RSA signature 512-byte clock.
 *
 * Tests an arbitrary independently secret 28! permutation at each phase,
 * allowing all unknown key values. Equality marker and page-initial
 * positions are removed identically from original and source-native
 * controls. No original ciphertext is edited. Windows/Node22 CommonJS.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(ROOT, name), "utf8");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter((x) => x.page < 56 && x.indices.length);
assert.equal(pages.length, 55);
const original = pages.flatMap((x) => x.indices);
assert.equal(original.length, 12956);
const shell = read("resources/historical/cicada2013-os-original-prime-echo.sh");
const lines = shell.split(/\r?\n/u)
  .map((s) => /^echo(?:\s+-n)?\s+"(\d+)\s*";\s+sleep\s+([\d.]+)$/u.exec(s.trim()))
  .filter(Boolean);
assert.equal(lines.length, 464);
assert.deepEqual(lines.filter((x) => Number(x[2]) === 2).map((x) => Number(x[1])), [1033, 3301]);
const rsaArmor = read("resources/historical/cicada2014-stage11-message.asc");
const armorStart = rsaArmor.indexOf("-----BEGIN PGP SIGNATURE-----");
const armorEnd = rsaArmor.indexOf("-----END PGP SIGNATURE-----", armorStart);
assert(armorStart >= 0 && armorEnd > armorStart);
const lines64 = rsaArmor.slice(armorStart + 29, armorEnd).split(/\r?\n/u)
  .map((s) => s.trim()).filter((s) => /^[A-Za-z0-9+/]+={0,2}$/u.test(s));
const packet = Buffer.from(lines64.join(""), "base64");
assert.equal(packet[0], 0x89);
const body = packet.subarray(3);
assert.equal(body[0], 4);
let pos = 6 + body.readUInt16BE(4);
pos += 2 + body.readUInt16BE(pos);
pos += 2;
const bits = body.readUInt16BE(pos); pos += 2;
const mpi = body.subarray(pos);
assert.equal(mpi.length, 512);
assert.equal(bits, 4096);
assert.equal(pos + mpi.length, body.length);

const pageOf = new Uint16Array(original.length);
const isFree = new Uint8Array(original.length);
const rank = new Int16Array(original.length).fill(-1);
let at = 0;
for (let p = 0; p < pages.length; p++) {
  const seq = pages[p].indices;
  for (let j = 0; j < seq.length; j++, at++) {
    pageOf[at] = p;
    if (j === 0 || seq[j] === seq[j - 1]) isFree[at] = 1;
    else rank[at] = (seq[j] - seq[j - 1] + 28) % 29;
  }
}
assert.equal(at, 12956);
const active = [];
for (let i = 0; i < original.length; i++) if (!isFree[i]) active.push(i);
assert.equal(active.length, 12815);
assert.equal(isFree.reduce((s, v) => s + v, 0), 141);
assert.equal(active.every((i) => rank[i] >= 0 && rank[i] < 28), true);

/** @param {number} period @param {string} reset @param {string} consumption @returns {Int16Array} */
function clock(period, reset, consumption) {
  const phase = new Int16Array(original.length);
  let q = 0;
  for (let i = 0; i < original.length; i++) {
    if (i === 0 || (reset === "page" && pageOf[i] !== pageOf[i - 1])) q = 0;
    phase[i] = q % period;
    if (consumption === "all" || !isFree[i]) q++;
  }
  return phase;
}
/**
 * Collision fraction among positions in the same publicly observable phase,
 * invariant under arbitrary, independent secret phase-wise bijections.
 * @param {ArrayLike<number>} values
 * @param {Int16Array} phase
 * @param {number} period
 * @param {number} alphabet
 * @returns {{equal:number,denom:number,q:number}}
 */
function collision(values, phase, period, alphabet) {
  const counts = new Uint16Array(period * alphabet);
  const totals = new Uint16Array(period);
  for (const i of active) {
    const value = values[i];
    assert(value >= 0 && value < alphabet);
    counts[phase[i] * alphabet + value]++;
    totals[phase[i]]++;
  }
  let equal = 0, denom = 0;
  for (let k = 0; k < period; k++) {
    denom += totals[k] * (totals[k] - 1);
    for (let v = 0; v < alphabet; v++) {
      const n = counts[k * alphabet + v];
      equal += n * (n - 1);
    }
  }
  return { equal, denom, q: equal / denom };
}
/** @param {string} raw @returns {number[]} */
function toNative(raw) {
  const tokens = corpus.translit.map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.length - a.s.length);
  const output = [];
  const clean = raw.toUpperCase().replace(/QU/gu, "CW")
    .replace(/V/gu, "U").replace(/[KQ]/gu, "C").replace(/Z/gu, "S");
  for (const word of clean.match(/[A-Z]+/gu) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith("ING", i)) { output.push(21); i += 3; continue; }
      if (word.startsWith("IO", i)) { output.push(27); i += 2; continue; }
      const match = tokens.find((t) => word.startsWith(t.s, i));
      assert(match, "unmappable native word");
      output.push(match.i); i += match.s.length;
    }
  }
  return output;
}
const sourceRefs = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 62492],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 217106],
].map(([name, file, count]) => {
  const native = toNative(read(file));
  assert.equal(native.length, count);
  return { name, native };
});
assert.deepEqual(toNative("PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE"), corpus.pages[57].indices);

/** @param {number[]} reference @param {number} start @returns {Uint8Array} */
function nativeWindow(reference, start) {
  const source = reference.slice(start, start + original.length);
  assert.equal(source.length, original.length);
  // In this precise proposed cipher, a repeat is reserved to carry EA.
  // For a conservative GP-native control, remove EA from all ordinary
  // positions, while fixing the same 141 genuine free events as original.
  return Uint8Array.from(source.map((v, i) => isFree[i] ? 28 : (v === 28 ? 18 : v)));
}

/**
 * Independent secret phase codebooks, chosen without touching original text.
 * Seed mixes genuine prime source, signature byte source, source physical
 * table, and phase; the seed is exclusively an implementation control.
 * @param {number} period
 * @returns {Uint8Array[]}
 */
function hiddenPermutations(period) {
  let state = 0x33012014 >>> 0;
  const out = [];
  for (let phase = 0; phase < period; phase++) {
    const row = Uint8Array.from({ length: 28 }, (_, i) => i);
    for (let i = 27; i > 0; i--) {
      state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
      const j = (state >>> 0) % (i + 1);
      const old = row[i]; row[i] = row[j]; row[j] = old;
    }
    out.push(row);
  }
  return out;
}
/**
 * @param {Uint8Array} plain @param {Int16Array} phase
 * @param {Uint8Array[]} secret
 * @returns {number[]}
 */
function encryptNative(plain, phase, secret) {
  const cipher = new Array(plain.length);
  for (let i = 0; i < plain.length; i++) {
    if (i === 0 || pageOf[i] !== pageOf[i - 1]) {
      cipher[i] = plain[i]; continue;
    }
    if (isFree[i]) { assert.equal(plain[i], 28); cipher[i] = cipher[i - 1]; continue; }
    const value = plain[i];
    assert(value < 28);
    cipher[i] = (cipher[i - 1] + 1 + secret[phase[i]][value]) % 29;
  }
  return cipher;
}
const results = [];
for (const period of [464, 512]) {
  for (const reset of ["book", "page"]) {
    for (const consumption of ["all", "nonfree"]) {
      const phases = clock(period, reset, consumption);
      const source = collision(rank, phases, period, 28);
      const controls = [];
      for (const { name, native } of sourceRefs) {
        let minimum = Infinity, maximum = -Infinity;
        for (let a = 0; a < 80; a++) {
          const first = Math.floor((native.length - original.length) * a / 79);
          const sample = nativeWindow(native, first);
          const q = collision(sample, phases, period, 29).q;
          minimum = Math.min(minimum, q);
          maximum = Math.max(maximum, q);
        }
        assert(minimum > source.q + 0.015);
        controls.push({ name, windows: 80, min: minimum, max: maximum });
      }
      const planted = nativeWindow(sourceRefs[0].native, 0);
      const secret = hiddenPermutations(period);
      const encoded = encryptNative(planted, phases, secret);
      const encodedRank = new Int16Array(encoded.length).fill(-1);
      const decoded = new Array(encoded.length);
      const inv = secret.map((row) => {
        const back = new Uint8Array(28);
        row.forEach((v, i) => { back[v] = i; });
        return back;
      });
      for (let i = 0; i < encoded.length; i++) {
        if (i === 0 || pageOf[i] !== pageOf[i - 1]) {
          decoded[i] = encoded[i]; continue;
        }
        if (isFree[i]) {
          assert.equal(encoded[i], encoded[i - 1]);
          decoded[i] = 28; continue;
        }
        const r = (encoded[i] - encoded[i - 1] + 28) % 29;
        encodedRank[i] = r;
        decoded[i] = inv[phases[i]][r];
      }
      assert.deepEqual(decoded, [...planted]);
      const qPlant = collision(planted, phases, period, 29);
      const qEncoded = collision(encodedRank, phases, period, 28);
      assert.equal(qPlant.equal, qEncoded.equal);
      assert.equal(qPlant.denom, qEncoded.denom);
      results.push({
        period, reset, consumption, active: active.length, original: source,
        native: controls, plant: { recovered: decoded.length, equal: qPlant.equal, q: qPlant.q },
      });
    }
  }
}
assert.equal(results.length, 8);
console.log(JSON.stringify({
  result: "PASS: no fixed-phase arbitrary 28-way substitution can recover native reference controls",
  originalRunes: original.length, freeEvents: 141, activeNonrepeat: active.length,
  historicalSources: { primeEmissions2013: 464, signatureMPIBytes2014: mpi.length },
  model: "one secret 28-way alphabet per visible phase; no invisible extra key advancement",
  candidateFamilies: results,
}, null, 2));
