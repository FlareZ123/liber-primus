"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const grid = read("resources/liber-primus/base60-grid.json");
const corpus = read("resources/liber-primus/lp2-corpus.json");
const mod = n => (n % 29 + 29) % 29;

function inverse(n) {
  n = mod(n);
  for (let x = 1; x < 29; x++) if (mod(n * x) === 1) return x;
  throw new Error("zero has no inverse in GF(29)");
}
function polyMulLow(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
  return out;
}
function polyDivLow(dividend, divisor) {
  const a = dividend.map(mod);
  const degree = divisor.length - 1;
  const q = Array(a.length - degree).fill(0);
  const inverseLead = inverse(divisor[degree]);
  for (let k = a.length - 1; k >= degree; k--) {
    const coefficient = mod(a[k] * inverseLead);
    q[k - degree] = coefficient;
    if (coefficient) {
      for (let j = 0; j <= degree; j++)
        a[k - degree + j] = mod(a[k - degree + j] - coefficient * divisor[j]);
    }
  }
  return { quotientLow: q, remainder: a.slice(0, degree) };
}
function ioc(a) {
  const f = Array(29).fill(0);
  for (const x of a) f[x]++;
  return f.reduce((sum, n) => sum + n * (n - 1), 0) / (a.length * (a.length - 1));
}
function nativeGp(text) {
  const tokens = corpus.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
  const out = [];
  for (let word of (text.toUpperCase().match(/[A-Z]+/g) || [])) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S").replace(/ING/g, "NG");
    for (let j = 0; j < word.length;) {
      const token = tokens.find(t => word.startsWith(t.s, j));
      if (!token) throw new Error("unmapped GP control token: " + word.slice(j));
      out.push(token.i);
      j += token.s.length;
    }
  }
  return out;
}
function makeModel(native) {
  const train = native.slice(0, 40000);
  const held = native.slice(40000);
  const counts = new Map();
  let total = 0;
  for (let i = 2; i < train.length; i++) {
    const k = train[i - 2] * 841 + train[i - 1] * 29 + train[i];
    counts.set(k, (counts.get(k) || 0) + 1);
    total++;
  }
  const denominator = total + 0.1 * 29 ** 3;
  const score = a => {
    let sum = 0;
    for (let i = 2; i < a.length; i++) {
      const k = a[i - 2] * 841 + a[i - 1] * 29 + a[i];
      sum += Math.log(((counts.get(k) || 0) + 0.1) / denominator);
    }
    return sum / (a.length - 2);
  };
  const referenceWindows = [];
  for (let i = 0; i + 256 <= held.length; i += 256)
    referenceWindows.push(score(held.slice(i, i + 256)));
  return { score, referenceWindows };
}
function addKey(input, key, sign) {
  return input.map((value, i) => mod(value + sign * key[i % key.length]));
}
function summary(a, model) {
  const windows = [];
  for (let i = 0; i + 256 <= a.length; i += 256)
    windows.push(model.score(a.slice(i, i + 256)));
  const sorted = windows.slice().sort((x, y) => x - y);
  const worstNative = Math.min(...model.referenceWindows);
  return {
    length: a.length,
    ioc: ioc(a),
    meanTrigramNatsPerRune: model.score(a),
    window256: windows.length ? {
      count: windows.length,
      min: sorted[0],
      median: sorted[Math.floor(sorted.length / 2)],
      max: sorted[sorted.length - 1],
      atOrAboveWorstNativeWindow: windows.filter(x => x >= worstNative).length
    } : null,
    prefix120: a.slice(0, 120).map(x => corpus.translit[x]).join("")
  };
}
function base29BigEndianBytes(digits) {
  let value = 0n;
  for (const digit of digits) value = value * 29n + BigInt(digit);
  const bitLength = value === 0n ? 0 : value.toString(2).length;
  const bytes = [];
  while (value > 0n) {
    bytes.push(Number(value & 255n));
    value >>= 8n;
  }
  bytes.reverse();
  return { bytes, bitLength };
}
function main() {
  const bytes = grid.byte_rows.flat();
  assert.equal(bytes.length, 256);
  const tableHash = crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex");
  assert.equal(tableHash, "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

  // Source-linked factors: BASE29 3301 gives H; the p39/DH23 red triad gives G.
  const H = [3, 26, 24];
  const G = [27, 5, 15];
  const F = polyMulLow(H, G);
  assert.deepEqual(F, [23, 21, 11, 17, 12]);
  const monicF = F.map(x => mod(x * inverse(F[4])));
  assert.deepEqual(monicF, [14, 9, 13, 28, 1]);

  // P50 is read high-to-low as the original 256 base-60 byte coefficients.
  const p50Low = bytes.map(mod).reverse();
  const division = polyDivLow(p50Low, monicF);
  assert.deepEqual(division.remainder, [0, 0, 0, 0]);
  const quotient = division.quotientLow.slice().reverse();
  assert.equal(quotient.length, 252);

  const cipher = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
  assert.equal(cipher.length, 12956);
  const nativeText = fs.readFileSync(path.join(root, "resources/control/gibran_prophet_58585.txt"), "utf8");
  const native = nativeGp(nativeText);
  const model = makeModel(native);
  assert.equal(model.referenceWindows.length, 88);

  // Three fixed interpretations: quotient as GP plaintext; repeated additive key
  // over the complete continuous unknown-rune stream; and the direct base-29
  // big-endian integer serialization demonstrated by the 2013 BASE29 command.
  const raw = summary(cipher, model);
  const quotientPlaintext = summary(quotient, model);
  const cMinusQ = addKey(cipher, quotient, -1);
  const cPlusQ = addKey(cipher, quotient, +1);
  const qMinusC = cipher.map((c, i) => mod(quotient[i % quotient.length] - c));

  assert.deepEqual(addKey(cMinusQ, quotient, +1), cipher);
  assert.deepEqual(addKey(cPlusQ, quotient, -1), cipher);
  assert.deepEqual(qMinusC.map((x, i) => mod(quotient[i % quotient.length] - x)), cipher);

  const packed = base29BigEndianBytes(quotient);
  const printable = packed.bytes.filter(x => x >= 32 && x <= 126).length;
  const byteCounts = Array(256).fill(0);
  for (const x of packed.bytes) byteCounts[x]++;
  const byteEntropy = -byteCounts.filter(Boolean).reduce((sum, n) => {
    const p = n / packed.bytes.length;
    return sum + p * Math.log2(p);
  }, 0);
  const sha = values => crypto.createHash("sha256").update(Buffer.from(values)).digest("hex");

  const first16Hex = Buffer.from(packed.bytes.slice(0, 16)).toString("hex");
  const signatures = [
    "89504e470d0a1a0a", "ffd8ff", "474946383761", "474946383961",
    "504b0304", "25504446", "1f8b", "7f454c46", "4f676753",
    "377abcaf271c", "526172211a0700", "53514c69746520666f726d6174203300"
  ];
  const recognizedHeader = signatures.some(signature => first16Hex.startsWith(signature));
  assert.equal(recognizedHeader, false);

  const result = {
    source: {
      table: "resources/liber-primus/base60-grid.json",
      interpretation: "base-60 row-major bytes, reduced mod 29; high-to-low polynomial coefficients",
      byteCount: bytes.length,
      byteSha256: tableHash,
      base60Conditional: true
    },
    factors: { H, G, productLow: F, productMonicLow: monicF },
    division: {
      remainderLow: division.remainder,
      quotientLength: quotient.length,
      quotientSha256: sha(quotient),
      quotientFirst40: quotient.slice(0, 40),
      quotientLast40: quotient.slice(-40)
    },
    quotientAsGpPlaintext: quotientPlaintext,
    quotientAsBase29BigEndianInteger: {
      bitLength: packed.bitLength,
      byteLength: packed.bytes.length,
      printableAsciiBytes: printable,
      printableRatio: printable / packed.bytes.length,
      shannonEntropyBitsPerByte: byteEntropy,
      first16Hex,
      first16Bytes: packed.bytes.slice(0, 16),
      recognizedHeader
    },
    originalStream: {
      raw,
      repeatedKeyCMinusQ: summary(cMinusQ, model),
      repeatedKeyCPlusQ: summary(cPlusQ, model),
      repeatedKeyQMinusC: summary(qMinusC, model),
      keyPeriodRunes: quotient.length,
      exactOriginalReencryption: true,
      nativeReference: {
        heldOutWindows: model.referenceWindows.length,
        worstWindowNatsPerRune: Math.min(...model.referenceWindows),
        medianWindowNatsPerRune: model.referenceWindows.slice().sort((a, b) => a - b)[Math.floor(model.referenceWindows.length / 2)]
      }
    },
    decision: "No direct GP plaintext, base-29 byte payload, or repeating 252-rune additive key. The result is conditional on the base-60 table interpretation; no source-selected parity frame, rune alignment, or further operation is established."
  };
  console.log(JSON.stringify(result, null, 2));
}
if (require.main === module) main();
module.exports = { main, polyMulLow, polyDivLow, base29BigEndianBytes };
