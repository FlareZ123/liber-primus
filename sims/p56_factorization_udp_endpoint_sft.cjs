"use strict";
/**
 * Reconstruct the p56 factorization and a source-motivated p55 UDP packet
 * candidate. This script NEVER opens a socket or sends network traffic.
 *
 * Inputs:
 *   resources/liber-primus/lp2-corpus.json
 *   resources/control/shakespeare_first300k.txt
 *
 * Run: node sims/p56_factorization_udp_endpoint_sft.cjs
 *
 * The endpoint/packet interpretation remains a hypothesis. The large
 * 465-bit cofactor is a strong probable prime, not accompanied here by
 * an ECPP/Pocklington certificate.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const TARGET_HEX =
  "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
const N = BigInt("0x" + TARGET_HEX);
assert.equal(TARGET_HEX.length, 128);

function bitLength(n) {
  return n.toString(2).length;
}
function gcd(a, b) {
  while (b !== 0n) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a < 0n ? -a : a;
}
function abs(n) {
  return n < 0n ? -n : n;
}
function primesUpTo(limit) {
  const sieve = new Uint8Array(limit + 1);
  const result = [];
  for (let p = 2; p <= limit; p++) {
    if (sieve[p]) continue;
    result.push(p);
    for (let q = p * p; q <= limit; q += p) sieve[q] = 1;
  }
  return result;
}

// Deterministic Brent-style Pollard rho. Fixed seed, c, block size and cap.
function pollardRho(n, seed = 2n, c = 1n, blockSize = 128, maxSteps = 2000000) {
  if (n % 2n === 0n) return {factor: 2n, steps: 0};
  let y = seed, r = 1, g = 1n, q = 1n, x = 0n, ys = 0n, steps = 0;
  const f = value => (value * value + c) % n;
  while (g === 1n && steps < maxSteps) {
    x = y;
    for (let i = 0; i < r; i++) {
      y = f(y);
      steps++;
    }
    let k = 0;
    while (k < r && g === 1n) {
      ys = y;
      const stop = Math.min(blockSize, r - k);
      for (let i = 0; i < stop; i++) {
        y = f(y);
        q = (q * abs(x - y)) % n;
        steps++;
      }
      g = gcd(q, n);
      k += blockSize;
    }
    r *= 2;
  }
  if (g === n) {
    do {
      ys = f(ys);
      g = gcd(abs(x - ys), n);
      steps++;
    } while (g === 1n && steps < maxSteps + 1000000);
  }
  return g > 1n && g < n ? {factor: g, steps} : null;
}

let remainder = N;
const smallFactors = [];
for (const p of primesUpTo(281)) {
  const prime = BigInt(p);
  while (remainder % prime === 0n) {
    smallFactors.push(prime);
    remainder /= prime;
  }
}
const rho = pollardRho(remainder);
assert.ok(rho, "Pollard rho did not split the remaining cofactor");
smallFactors.push(rho.factor);
remainder /= rho.factor;
const Q = remainder;
assert.equal(rho.factor, 2155279523n);
assert.equal(Q.toString(16),
  "12bf3c5580890a0a04bb5ec1eb69c5856887ab08e1f5f04fd3a99ae40394c85da0c6d25f3836aa0ea4058e95d0253b494d48c1e4ba8fab27ec2eb");

function trialPrime(n) {
  if (n < 2n) return false;
  if (n % 2n === 0n) return n === 2n;
  for (let d = 3n; d * d <= n; d += 2n) {
    if (n % d === 0n) return false;
  }
  return true;
}
function modPow(base, exponent, modulus) {
  let result = 1n;
  base %= modulus;
  while (exponent > 0n) {
    if (exponent & 1n) result = (result * base) % modulus;
    base = (base * base) % modulus;
    exponent >>= 1n;
  }
  return result;
}
function strongMillerRabin(n, base) {
  let d = n - 1n, s = 0;
  while (d % 2n === 0n) {
    d /= 2n;
    s++;
  }
  let x = modPow(base, d, n);
  if (x === 1n || x === n - 1n) return true;
  for (let i = 1; i < s; i++) {
    x = (x * x) % n;
    if (x === n - 1n) return true;
  }
  return false;
}
const mrBases = primesUpTo(599).map(BigInt);
assert.equal(mrBases.length, 109);
const qMrPassed = mrBases.filter(base => strongMillerRabin(Q, base)).length;
assert.equal(qMrPassed, 109);
assert(smallFactors.every(trialPrime));
const product = smallFactors.reduce((acc, factor) => acc * factor, Q);
assert.equal(product, N);

const factorCounts = {};
for (const factor of smallFactors) {
  const key = factor.toString();
  factorCounts[key] = (factorCounts[key] || 0) + 1;
}
const smallProduct = smallFactors.reduce((acc, factor) => acc * factor, 1n);
assert.equal(smallProduct, 84n * 281n * 2155279523n);

// Big-endian IPv4 interpretation of the 32-bit prime factor.
const ipInteger = 2155279523n;
const ipOctets = [24n, 16n, 8n, 0n].map(shift =>
  Number((ipInteger >> shift) & 255n));
const ipAddress = ipOctets.join(".");
assert.equal(ipAddress, "128.118.244.163");
const littleEndianAlternative = [0n, 8n, 16n, 24n].map(shift =>
  Number((ipInteger >> shift) & 255n)).join(".");

// The 465-bit probable-prime cofactor has a 59-byte big-endian representation.
const qHex59 = Q.toString(16).padStart(118, "0");
const qBytes = Buffer.from(qHex59, "hex");
assert.equal(qBytes.length, 59);
const qSha512 = crypto.createHash("sha512").update(qBytes).digest("hex");

// Source-defined GP29 positional digit alphabet: 3301 decimal -> 3QO.
const BASE29_TEXT = "0123456789ABCDEFGHIJKLMNOPQRS";
assert.equal(BASE29_TEXT.length, 29);
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const p55 = corpus.pages.find(page => page.page === 55).indices;
assert.equal(p55.length, 76);
assert(p55.every(symbol => Number.isInteger(symbol) && symbol >= 0 && symbol < 29));
const p55Payload = p55.map(symbol => BASE29_TEXT[symbol]).join("");
const p55PayloadBytes = Buffer.from(p55Payload, "ascii");
assert.equal(p55Payload.length, 76);
assert.equal(p55PayloadBytes.length, 76);
const udpHeaderBytes = 8;
const udpLength = udpHeaderBytes + p55PayloadBytes.length;
assert.equal(udpLength, 84);
assert.equal(udpLength, Number(2n * 2n * 3n * 7n)); // 84 = 2^2 * 3 * 7
assert.equal(84n, 2n * 2n * 3n * 7n);
const udpLengthHex = udpLength.toString(16).padStart(4, "0");
const destinationPort = 281;
const destinationPortHex = destinationPort.toString(16).padStart(4, "0");
// A source-shaped RFC 768 specimen only. No historical UDP service is established.
const udpSegment = Buffer.alloc(8 + p55PayloadBytes.length);
udpSegment.writeUInt16BE(0, 0); // optional source port absent; cannot identify a reply port
udpSegment.writeUInt16BE(destinationPort, 2);
udpSegment.writeUInt16BE(udpLength, 4);
udpSegment.writeUInt16BE(0, 6); // zero checksum allowed for IPv4
p55PayloadBytes.copy(udpSegment, 8);
assert.equal(udpSegment.length, 84);
assert.equal(udpSegment.subarray(0, 8).toString("hex"), "0000011900540000");
assert.equal(udpSegment.subarray(8).toString("ascii"), p55Payload);
assert.equal(p55Payload.slice(0, 2), "LP");
const lpOccurrences = corpus.pages.flatMap(page => {
  const symbols = page.indices.map(index => BASE29_TEXT[index]).join("");
  const hits = [];
  for (let at = symbols.indexOf("LP"); at >= 0; at = symbols.indexOf("LP", at + 1)) {
    hits.push({page: page.page, offset: at});
  }
  return hits;
});
assert.equal(lpOccurrences.length, 23);
assert.deepEqual(lpOccurrences.filter(hit => hit.offset === 0), [{page: 55, offset: 0}]);
assert.equal(primesUpTo(281).length, 60); // 281 is prime #60, but no signed ordinal instruction.
// Look-elsewhere: the target factors support a 281-byte UDP shape
// for six original 273-rune pages, as well as 84 bytes for p55.
const compatibleUdpLengthPages = corpus.pages
  .filter(page => page.page <= 55 && page.indices.length > 0
    && N % BigInt(page.indices.length + udpHeaderBytes) === 0n)
  .map(page => ({
    page: page.page,
    runes: page.indices.length,
    datagramBytes: page.indices.length + udpHeaderBytes
  }));
assert.deepEqual(compatibleUdpLengthPages, [
  {page: 11, runes: 273, datagramBytes: 281},
  {page: 17, runes: 273, datagramBytes: 281},
  {page: 21, runes: 273, datagramBytes: 281},
  {page: 25, runes: 273, datagramBytes: 281},
  {page: 41, runes: 273, datagramBytes: 281},
  {page: 44, runes: 273, datagramBytes: 281},
  {page: 55, runes: 76, datagramBytes: 84}
]);


// Also test the simplest direct use of Q as a GP29 additive key stream.
// The result is deliberately bounded: MSB/LSB order, +/- sign, no phase fit.
function toBase29(value) {
  const digits = [];
  while (value > 0n) {
    digits.push(Number(value % 29n));
    value /= 29n;
  }
  return digits.reverse();
}
const qBase29Msd = toBase29(Q);
const qBase29Lsd = qBase29Msd.slice().reverse();
assert.equal(qBase29Msd.length, 96);

const transliterations = corpus.translit.map((value, index) => ({value, index}))
  .sort((a, b) => b.value.length - a.value.length);
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const normalized = shakespeare.toUpperCase().replace(/QU/g, "CW")
  .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S").replace(/Q/g, "C");
const native = [];
for (const word of normalized.match(/[A-Z]+/g) || []) {
  for (let i = 0; i < word.length;) {
    const match = transliterations.find(symbol => word.startsWith(symbol.value, i));
    if (match) {
      native.push(match.index);
      i += match.value.length;
    } else {
      i++;
    }
  }
}
assert.equal(native.length, 218800);
const trainingEnd = Math.floor(native.length * 0.75);
const trigram = new Float64Array(29 ** 3).fill(0.005);
const bigram = new Float64Array(29 ** 2).fill(0.145);
for (let i = 2; i < trainingEnd; i++) {
  const code = native[i - 2] * 841 + native[i - 1] * 29 + native[i];
  trigram[code]++;
  bigram[Math.floor(code / 29)]++;
}
function score(symbols) {
  let total = 0;
  for (let i = 2; i < symbols.length; i++) {
    const code = symbols[i - 2] * 841 + symbols[i - 1] * 29 + symbols[i];
    total += Math.log(trigram[code] / bigram[Math.floor(code / 29)]);
  }
  return total / (symbols.length - 2);
}
function heldout(length, stride) {
  const values = [];
  for (let i = trainingEnd; i + length < native.length; i += stride) {
    values.push(score(native.slice(i, i + length)));
  }
  values.sort((a, b) => a - b);
  return {
    count: values.length,
    minimum: values[0],
    median: values[Math.floor(values.length / 2)]
  };
}
const controls = {
  43: heldout(43, 1),
  75: heldout(75, 1),
  76: heldout(76, 76)
};
const interiorOffsets = [
  2,3,10,11,12,13,16,17,18,19,24,25,26,27,28,29,30,31,32,33,34,
  37,38,39,40,43,44,49,50,51,52,53,56,57,58,59,60,65,66,67,68,71,74
];
const targets = {
  full76: p55,
  body75: p55.slice(1),
  interior43: interiorOffsets.map(offset => p55[offset])
};
const qKeyTests = [];
for (const [targetName, ciphertext] of Object.entries(targets)) {
  for (const [order, key] of [["MSD", qBase29Msd], ["LSD", qBase29Lsd]]) {
    const prefix = key.slice(0, ciphertext.length);
    for (const sign of [-1, 1]) {
      const plaintext = ciphertext.map((symbol, i) =>
        (symbol + sign * prefix[i] + 29) % 29);
      const result = {
        target: targetName,
        keyOrder: order,
        sign,
        score: score(plaintext),
        gp: plaintext.map(index => corpus.translit[index]).join("-")
      };
      assert(result.score < controls[ciphertext.length].minimum);
      qKeyTests.push(result);
    }
  }
}
assert.equal(qKeyTests.length, 12);

console.log(JSON.stringify({
  target: {
    hex: TARGET_HEX,
    hexCharacters: TARGET_HEX.length,
    bytes: TARGET_HEX.length / 2,
    bitLength: bitLength(N)
  },
  factorization: {
    factors: factorCounts,
    smallFactorProduct: smallProduct.toString(),
    smallFactorProductHex: "0x" + smallProduct.toString(16),
    remainingCofactor: Q.toString(),
    remainingCofactorHex: Q.toString(16),
    remainingCofactorBits: bitLength(Q),
    remainingCofactorBytes: qBytes.length,
    pollardRhoSteps: rho.steps,
    exactProductCheck: product === N,
    smallFactorsTrialDivisionPrime: smallFactors.every(trialPrime),
    remainingCofactorMillerRabin: {
      primeBases: mrBases.length,
      passed: qMrPassed,
      status: "strong probable prime; no primality certificate"
    }
  },
  endpointCandidate: {
    ipv4Integer: ipInteger.toString(),
    ipv4BigEndian: ipAddress,
    ipv4LittleEndianAlternative: littleEndianAlternative,
    destinationPort: destinationPort,
    destinationPortHex: "0x" + destinationPortHex,
    ianaServiceName: "personal-link",
    transportCandidate: "UDP",
    networkOrderIpBytesHex: ipOctets.map(value => value.toString(16).padStart(2, "0")).join("")
  },
  packetCandidate: {
    encoding: "one ASCII base29 digit per p55 GP29 rune index, alphabet 0-9A-S",
    payloadRuneCount: p55.length,
    payloadByteLength: p55PayloadBytes.length,
    payloadText: p55Payload,
    payloadHex: p55PayloadBytes.toString("hex"),
    udpHeaderLength: udpHeaderBytes,
    udpDatagramLength: udpLength,
    base29PageLocalPrefix: p55Payload.slice(0, 2),
    corpusLpPairOccurrences: lpOccurrences.length,
    lpAtOriginalPageOffsetZero: lpOccurrences.filter(hit => hit.offset === 0),
    prime281Ordinal: primesUpTo(281).length,
    allOriginalUnknownPagesWhoseHeaderPlusRuneaCountDividesTarget: compatibleUdpLengthPages,
    candidateZeroBasedOrdinal: 59,
    illustrativeUdpSegment: {
      sourcePort: 0,
      checksum: 0,
      headerHex: udpSegment.subarray(0, 8).toString("hex"),
      fullHex: udpSegment.toString("hex"),
      usableReplyPort: false,
      transmitted: false
    },
    udpLengthHex: "0x" + udpLengthHex,
    destinationPortHex: "0x" + destinationPortHex,
    transmitted: false
  },
  possiblePage59Binary: {
    bytes: qBytes.length,
    hexCharacters: qHex59.length,
    paddedHex: qHex59,
    sha512EqualsPrintedTarget: qSha512 === TARGET_HEX,
    sha512: qSha512,
    identityWithMissing59Bin: "unsupported: 59 denotes page number, not archived file length"
  },
  qBase29DirectKeyGate: {
    keyLength: qBase29Msd.length,
    keyMsd: qBase29Msd.join(""),
    keyLsd: qBase29Lsd.join(""),
    controls,
    rawTargetScores: Object.fromEntries(
      Object.entries(targets).map(([name, symbols]) => [name, score(symbols)])
    ),
    variants: qKeyTests,
    decision: "All 12 fixed +/- direct additive uses of the Q base29 digits remain below the minimum corresponding held-out native-English windows."
  },
  safety: "No network sockets opened; no packet sent; no host or port scanned."
}, null, 2));
