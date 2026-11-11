"use strict";
/**
 * Original 2016 tree-carrier entropy bytes as a source-selected LP2 GP29 pad.
 * Source rationale: the signed 2016 563x569 tree image selects physical p32,
 * whose 11x11 GP-prime first row/column sum to its dimensions. Original p14
 * and p55 also contain the manuscript's associated tree imagery.
 *
 * This tests ONLY phase-zero, natural JPEG-scan byte clocks. It does not claim
 * an authentic cipher, a secret password, or plaintext from unsolved LP2.
 * Run as one standalone Node 22 file from the repository root.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { encode, train } = require("./grid_keyskip_viterbi.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const MOD = 29;
const mod = n => ((n % MOD) + MOD) % MOD;
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const jpg = fs.readFileSync(path.join(ROOT, "resources/historical/cicada2016-4gq25.jpg"));
assert.equal(jpg.length, 26342);
const gitSha = crypto.createHash("sha1").update(Buffer.concat([
  Buffer.from("blob " + jpg.length + "\0"), jpg
])).digest("hex");
assert.equal(gitSha, "22027296dcd7df53c5127e6aadbabeaf3223f72d");

function jpegEntropy(bytes) {
  assert.equal(bytes[0], 255);
  assert.equal(bytes[1], 216);
  let pos = 2;
  let scan = -1;
  while (pos < bytes.length) {
    assert.equal(bytes[pos], 255);
    while (bytes[pos] === 255) pos++;
    const marker = bytes[pos++];
    assert.notEqual(marker, 217);
    const length = bytes.readUInt16BE(pos);
    if (marker === 218) {
      scan = pos + length;
      break;
    }
    pos += length;
  }
  assert.ok(scan > 2);
  const eoi = bytes.lastIndexOf(Buffer.from([255, 217]));
  assert.equal(eoi + 2, bytes.length);
  const raw = [...bytes.subarray(scan, eoi)];
  const destuffed = [];
  for (let i = 0; i < raw.length; i++) {
    destuffed.push(raw[i]);
    if (raw[i] === 255 && raw[i + 1] === 0) i++;
  }
  assert.ok(raw.length >= 12956 && destuffed.length >= 12956);
  return { scan, raw, destuffed, stuffed: raw.length - destuffed.length };
}

/**
 * A strict phase-zero Viterbi decoder. A discarded key symbol is admissible
 * only when its proposed ciphertext would equal the PREVIOUS published rune.
 * Each original rune consumes 1 or 2 consecutive image-derived key symbols.
 * No null ciphertext insertions, variable origin or hidden offset are fitted.
 * @param {number[]} cipher Original GP29 rune indices
 * @param {number[]} key 2016 image scan-derived GP29 pad
 * @param {number} sign Encryption sign: +1 or -1
 * @param {object} model Smoothed GP language model
 * @param {number} maxSkip Maximum total rejected draws
 */
function solve(cipher, key, sign, model, maxSkip) {
  assert.ok(cipher.length >= 3);
  const n = cipher.length;
  const states = new Array(n);
  const firstPlain = mod(cipher[0] - sign * key[0]);
  states[0] = new Map([["0:1", {
    used: 0, d: 1, score: model.unigram[firstPlain], parent: null
  }]]);
  for (let t = 1; t < n; t++) {
    const next = new Map();
    for (const [id, state] of states[t - 1]) {
      const prevIndex = t - 1 + state.used;
      const prevPlain = mod(cipher[t - 1] - sign * key[prevIndex]);
      for (const distance of [1, 2]) {
        const total = state.used + distance - 1;
        if (total > maxSkip) continue;
        const index = t + total;
        assert.ok(index < key.length);
        const plain = mod(cipher[t] - sign * key[index]);
        if (distance === 2 &&
          mod(plain + sign * key[index - 1]) !== cipher[t - 1]) continue;
        let score = state.score - 3.5 * (distance - 1);
        if (t === 1) score += model.bigram[prevPlain * MOD + plain];
        else {
          const prev2Index = prevIndex - state.d;
          const prev2Plain = mod(cipher[t - 2] - sign * key[prev2Index]);
          score += model.trigram[(prev2Plain * MOD + prevPlain) * MOD + plain];
        }
        const newId = total + ":" + distance;
        if (!next.has(newId) || score > next.get(newId).score)
          next.set(newId, { used: total, d: distance, score, parent: id });
      }
    }
    assert.ok(next.size, "No legal path at rune " + t);
    states[t] = next;
  }
  let winnerId = null, winner = null;
  for (const [id, state] of states[n - 1]) {
    if (winner === null || state.score > winner.score) {
      winner = state; winnerId = id;
    }
  }
  const plaintext = new Array(n);
  for (let t = n - 1; t >= 0; t--) {
    const state = states[t].get(winnerId);
    assert.ok(state);
    plaintext[t] = mod(cipher[t] - sign * key[t + state.used]);
    winnerId = state.parent;
  }
  const hist = new Array(MOD).fill(0);
  plaintext.forEach(x => hist[x]++);
  return {
    score: winner.score, perRune: winner.score / n,
    skips: winner.used, plaintext,
    ioc: hist.reduce((a, k) => a + k * (k - 1), 0) / (n * (n - 1))
  };
}

/** @param {number} seed */
function xorshift(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}
function plant(plain, key, sign) {
  const random = xorshift(0x33012016);
  let keyIndex = 0, previous = -1, skipped = 0;
  const cipher = [];
  for (const p of plain) {
    let c = mod(p + sign * key[keyIndex]);
    if (previous >= 0 && c === previous && random() < 0.82) {
      keyIndex++;
      skipped++;
      c = mod(p + sign * key[keyIndex]);
    }
    cipher.push(c);
    previous = c;
    keyIndex++;
  }
  return { cipher, skipped };
}

const jpeg = jpegEntropy(jpg);
const language = read("resources/control/shakespeare_first300k.txt");
const model = train(language.slice(0, 200000));
const holdout = encode(language.slice(250000, 252000)).slice(0, 400);
assert.equal(holdout.length, 400);
const sourceKey = jpeg.destuffed.map(b => b % MOD);
const synthetic = plant(holdout, sourceKey, +1);
const positive = solve(synthetic.cipher, sourceKey, +1, model, 40);
const exact = positive.plaintext.filter((x, i) => x === holdout[i]).length;
assert.ok(synthetic.skipped >= 1 && synthetic.skipped <= 40);
assert.ok(exact >= 380, "Instrument failed true source-shaped plant: " + exact);

const targets = [14, 32, 55];
const families = [];
for (const [stream, bytes] of [["encoded", jpeg.raw], ["destuffed", jpeg.destuffed]]) {
  for (const [reducer, reduce] of [
    ["mod29", b => b % MOD],
    ["scaled29", b => Math.floor(b * MOD / 256)]
  ]) {
    const key = bytes.map(reduce);
    for (const sign of [+1, -1]) {
      const pages = targets.map(page => {
        const indices = corpus.pages.find(p => p.page === page).indices;
        const output = solve(indices, key, sign, model, Math.ceil(indices.length * 0.1));
        return {
          page, runes: indices.length, logScore: output.perRune,
          ioc: output.ioc, rejectedKeys: output.skips,
          preview: output.plaintext.slice(0, 100).map(i => corpus.translit[i]).join("")
        };
      });
      families.push({ stream, reducer, sign, pages });
    }
  }
}
const byPage = targets.map(page => {
  const variants = families.map(f => ({stream:f.stream,reducer:f.reducer,sign:f.sign,
    ...f.pages.find(p=>p.page===page)})).sort((a,b)=>b.logScore-a.logScore);
  return {page, candidates:variants};
});
for (const p of byPage) {
  const winner = p.candidates[0];
  assert.ok(winner.ioc < 0.06,
    "Unexpected English-like GP coincidence index: require manual review " + JSON.stringify(winner));
}
console.log(JSON.stringify({
  classification:"source-selected fixed-image-byte inversion; native-plaintext negative",
  carrier:{file:"cicada2016-4gq25.jpg",gitSha,scanStart:jpeg.scan,
    encodedBytes:jpeg.raw.length,unescapedBytes:jpeg.destuffed.length,
    stuffedBytes:jpeg.stuffed,dimensions:[563,569]},
  grammar:"eight fixed entropy-byte/GP29 +/- models, no key offset; one collision-qualified key rejection per rune",
  positive:{runes:holdout.length,plantedSkips:synthetic.skipped,
    inferredSkips:positive.skips, exactRunes:exact,
    sourceScore:positive.perRune,ioc:positive.ioc},
  originals:byPage,
  conclusion:"No candidate demonstrates coherent original GP29 plaintext; key source/phase/transport remain unproven"
},null,2));
