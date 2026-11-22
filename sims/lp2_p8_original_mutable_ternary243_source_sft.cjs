"use strict";
/**
 * Original-source p7 -> p8 mutable five-trit table decoder SFT.
 * The 2014 p7 five-red-word GP29 index products define a 242-cycle GF(3)
 * sequence; p8's original black punctuation favors its zero splice at 208.
 * Test a genuinely writable 243-state table on untouched p9-p14 runes.
 * Node.js 22, CommonJS, Windows 11: standalone repository-relative test file.
 * This is a bounded experimental receiver, not an authenticated Cicada cipher.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const source = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const transcript = fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-transcription.txt"), "utf8").split("%");
const p7 = source.pages[7].indices;
const p8 = source.pages[8].indices;
const p9 = source.pages[9].indices;
const black = p8.slice(12);
const target = source.pages.slice(9, 15).flatMap(p => p.indices);
const p13Start = source.pages.slice(9, 13).reduce((s, p) => s + p.indices.length, 0);
const positive = source.pages[57].indices;
assert.equal(p7.length, 208);
assert.equal(p8.length, 255);
assert.equal(black.length, 243);
assert.equal(target.length, 1474);
assert.equal(positive.length, 95);
assert.deepEqual(p8.slice(-1), [12]);
assert.deepEqual(p9.slice(0, 5), [26, 7, 25, 6, 11]);
assert.equal(p13Start, 1065);

const redWords = [[23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]];
assert.deepEqual(p7.slice(-14), redWords.flat());
const products = redWords.map(w => w.reduce((a, v) => a * v % 29, 1));
assert.deepEqual(products, [11, 26, 8, 15, 2]);
const taps = products.map(v => v % 3);
assert.deepEqual(taps, [2, 2, 2, 0, 2]);

const runeSet = new Set(source.runes);
const stops = [];
const hyphens = new Set();
let runePosition = 0;
for (const glyph of transcript[8]) {
  if (runeSet.has(glyph)) runePosition++;
  else if (runePosition > 12 && runePosition < 255) {
    if (glyph === ".") stops.push(runePosition - 12);
    if (glyph === "-") hyphens.add(runePosition - 12);
  }
}
assert.equal(runePosition, 255);
assert.deepEqual(stops, [28, 122, 208]);
assert(hyphens.has(87));

/** @param {number[]} key @returns {number[]} */
function primitiveSequence(key) {
  const output = [];
  let state = key.slice();
  for (let i = 0; i < 242; i++) {
    output.push(state[0]);
    state = state.slice(1).concat([taps.reduce((v, x, j) => v + x * state[j], 0) % 3]);
  }
  assert.deepEqual(state, key);
  return output;
}
const seq = primitiveSequence(taps);
const zeroInsertions = [];
for (let i = 0; i < 242; i++) {
  if ([0, 1, 2, 3].every(j => seq[(i + j) % 242] === 0)) {
    zeroInsertions.push((i + 4) % 242);
  }
}
assert.deepEqual(zeroInsertions, [87, 208]);

/** @param {number} insertion @returns {number[]} */
function sourceCycleAddresses(insertion) {
  const trits = [...seq.slice(0, insertion), 0, ...seq.slice(insertion)];
  const addresses = trits.map((_, i) => {
    let address = 0;
    for (let j = 0; j < 5; j++) address = 3 * address + trits[(i + j) % 243];
    return address;
  });
  assert.equal(new Set(addresses).size, 243, "one use of every de Bruijn cell");
  return addresses;
}

/** @param {number} insertion @returns {number[]} */
function sourceAddressedTable(insertion) {
  const addresses = sourceCycleAddresses(insertion);
  const table = Array(243);
  addresses.forEach((address, i) => {
    assert.equal(table[address], undefined);
    table[address] = black[i];
  });
  assert(table.every(Number.isInteger));
  return table;
}

/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((v, n) => v + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}
/**
 * @param {number[]} xs Plaintext when encrypt is true, ciphertext otherwise.
 * @param {number[]} table Original p8 black243 placed at source GF3 state addresses.
 * @param {"cube"|"overwriteC"|"overwriteP"} update Writable table transition.
 * @param {1|-1} sign Encryption sign: C = P + sign*T[address] modulo29.
 * @param {boolean} encrypt
 * @param {"add"|"cube"} output
 * @returns {number[]}
 */
function pow29(x, exponent) {
  let result = 1;
  for (let e = exponent; e > 0; e = Math.floor(e / 2)) {
    if (e % 2 === 1) result = result * x % 29;
    x = x * x % 29;
  }
  return result;
}
function transform(xs, table, update, sign, encrypt, output) {
  const mutable = table.slice();
  const history = p8.slice(-5);
  const out = [];
  for (const x of xs) {
    const address = history.slice(-5).reduce((v, rune) => 3 * v + rune % 3, 0);
    const key = mutable[address];
    const y = output === "add"
      ? (x + (encrypt ? sign : -sign) * key + 29) % 29
      : encrypt
        ? pow29((x + sign * key + 29) % 29, 3)
        : (pow29(x, 19) - sign * key + 29) % 29;
    out.push(y);
    const cipher = encrypt ? y : x;
    const plain = encrypt ? x : y;
    if (update === "cube") mutable[address] = key * key * key % 29;
    else if (update === "overwriteC") mutable[address] = cipher;
    else mutable[address] = plain;
    history.push(cipher);
  }
  return out;
}

/**
 * Exactly one full de Bruijn cycle exhausts 243 distinct table cells.
 * Whatever new value is written to a just-read cell, the first 243
 * reads cannot observe it. This theorem covers EVERY cell-local writeback.
 * Enumerate ALL phase shifts and two printed-source output laws on original p9.
 */
const p9FirstCycle = p9.slice(0, 243);
const frozenCycle = [];
for (const splice of [208, 87]) {
  const addresses = sourceCycleAddresses(splice);
  const initialTable = sourceAddressedTable(splice);
  for (let phase = 0; phase < 243; phase++) {
    const writable = initialTable.slice();
    for (let step = 0; step < 243; step++) {
      const addr = addresses[(phase + step) % 243];
      assert.equal(writable[addr], black[(phase + step) % 243]);
      writable[addr] = (step * 17 + phase + 13) % 29;
    }
  }
}
for (const output of ["add", "cube"]) {
  for (const sign of [1, -1]) {
    const phases = [];
    for (let phase = 0; phase < 243; phase++) {
      const plain = p9FirstCycle.map((cipher, i) => {
        const key = black[(i + phase) % 243];
        return ((output === "add" ? cipher : pow29(cipher, 19)) - sign * key + 29) % 29;
      });
      const reencrypted = plain.map((p, i) => {
        const key = black[(i + phase) % 243];
        return output === "add" ? (p + sign * key + 29) % 29
          : pow29((p + sign * key + 29) % 29, 3);
      });
      assert.deepEqual(reencrypted, p9FirstCycle);
      phases.push({ phase, IoC: ioc(plain) });
    }
    phases.sort((a, b) => b.IoC - a.IoC);
    frozenCycle.push({
      output, sign,
      greatestIoC: phases[0],
      leastIoC: phases.at(-1),
      phaseZeroIoC: phases.find(x => x.phase === 0).IoC,
      phasesAtLeastPoint04: phases.filter(x => x.IoC >= 0.04).length,
      fullCyclePhases: phases.length
    });
  }
}
assert.equal(frozenCycle.length, 4);
assert(frozenCycle.every(x => x.greatestIoC.IoC < 0.04));

/** @param {string} input @returns {number[]} */
function encodeSourceNativeGP(input) {
  const byLength = source.translit.map((token, value) => ({ token, value }))
    .sort((a, b) => b.token.length - a.token.length);
  const text = input.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const output = [];
  for (const word of text.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith("ING", i)) { output.push(21); i += 3; }
      else if (word.startsWith("IO", i)) { output.push(27); i += 2; }
      else {
        const match = byLength.find(t => word.startsWith(t.token, i));
        assert(match, "source GP29 orthography missing token");
        output.push(match.value);
        i += match.token.length;
      }
    }
  }
  return output;
}
/**
 * Find the actual lowest GP29 IoC of ALL contiguous 243-rune windows.
 * @param {number[]} stream
 * @returns {{totalRunes:number, windows:number, minimumIoC:number}}
 */
function referenceWindowMinimum(stream) {
  const width = 243;
  const freq = Array(29).fill(0);
  for (let i = 0; i < width; i++) freq[stream[i]]++;
  let numerator = freq.reduce((a, count) => a + count * (count - 1), 0);
  let lowest = numerator;
  for (let i = width; i < stream.length; i++) {
    const first = stream[i - width];
    numerator -= 2 * (freq[first] - 1);
    freq[first]--;
    const last = stream[i];
    numerator += 2 * freq[last];
    freq[last]++;
    lowest = Math.min(lowest, numerator);
  }
  return { totalRunes: stream.length, windows: stream.length - width + 1,
    minimumIoC: lowest / (width * (width - 1)) };
}
const nativeGibran = fs.readFileSync(path.join(root, "resources", "control", "gibran_prophet_58585.txt"), "utf8");
const nativeShakespeare = fs.readFileSync(path.join(root, "resources", "control", "shakespeare_first300k.txt"), "utf8");
const gibranStart = nativeGibran.toUpperCase().indexOf("ALMUSTAFA");
const gibranEnd = nativeGibran.toUpperCase().indexOf("*** END OF THIS PROJECT", gibranStart);
assert(gibranStart >= 0 && gibranEnd > gibranStart);
const nativeControls = {
  gibran: referenceWindowMinimum(encodeSourceNativeGP(nativeGibran.slice(gibranStart, gibranEnd))),
  shakespeare: referenceWindowMinimum(encodeSourceNativeGP(nativeShakespeare))
};
assert.equal(nativeControls.gibran.totalRunes, 46834);
assert.equal(nativeControls.shakespeare.totalRunes, 217106);
assert(nativeControls.gibran.minimumIoC > 0.05);
assert(nativeControls.shakespeare.minimumIoC > 0.047);
assert(frozenCycle.every(x => x.greatestIoC.IoC < nativeControls.gibran.minimumIoC
  && x.greatestIoC.IoC < nativeControls.shakespeare.minimumIoC));

const result = [];
for (const splice of [208, 87]) {
  const table = sourceAddressedTable(splice);
  for (const update of ["cube", "overwriteC", "overwriteP"]) {
    for (const sign of [1, -1]) {
      for (const output of ["add", "cube"]) {
        const recovered = transform(target, table, update, sign, false, output);
        const reconstructed = transform(recovered, table, update, sign, true, output);
        assert.deepEqual(reconstructed, target);
        const planted = transform(positive, table, update, sign, true, output);
        assert.deepEqual(transform(planted, table, update, sign, false, output), positive);
        const whole = ioc(recovered);
        const first300 = ioc(recovered.slice(0, 300));
        const heldP13 = ioc(recovered.slice(p13Start, p13Start + 200));
        result.push({
          splice, update, sign, output,
          wholeIoC: Number(whole.toFixed(8)),
          first300IoC: Number(first300.toFixed(8)),
          untouchedP13First200IoC: Number(heldP13.toFixed(8)),
          first30GP: recovered.slice(0, 30).map(x => source.translit[x]).join("."),
          originalForwardReplay: reconstructed.length,
          nativeSolvedP57Plant: positive.length
        });
      }
    }
  }
}
assert.equal(result.length, 24);
assert(result.every(x => x.wholeIoC >= 0.033 && x.wholeIoC <= 0.036));
console.log(JSON.stringify({
  source: "2014 p7 red14 + p8 red12/black243; p8 last one-rune fragment continues with first 5 p9 runes",
  redWordIndexProducts: products,
  primitiveGF3Taps: taps,
  sourcePunctuation: { blackSentenceStops: stops, blackHyphenAt: 87 },
  zeroSplices: zeroInsertions,
  selectedSplice: 208,
  original: {
    p9ToP14Runes: target.length,
    IoC: ioc(target),
    first300IoC: ioc(target.slice(0, 300)),
    separateP13First200IoC: ioc(source.pages[13].indices.slice(0, 200))
  },
  fullCycleAllPhaseNoRevisit: { originalFirst243IoC: ioc(p9FirstCycle), outputs: frozenCycle, nativeControls },
  result,
  decision: "No original native-GP plaintext recovered under these twenty-four fixed, exactly reversible mutable-source-table variants"
}, null, 2));
