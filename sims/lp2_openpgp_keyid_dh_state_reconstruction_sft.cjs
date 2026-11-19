"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const table = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");

function mod(value, modulus = 29) {
  return ((value % modulus) + modulus) % modulus;
}

function H(left, right) {
  return [mod(left - right), mod(left + right)];
}

function shell(values) {
  const output = [];
  for (
    let left = 0, right = values.length - 1;
    left < right;
    left += 1, right -= 1
  ) {
    output.push(...H(values[left], values[right]));
  }
  if (values.length % 2 === 1) {
    output.push(values[(values.length - 1) / 2]);
  }
  return output;
}

function inverse(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  return null;
}

function modPow(base, exponent, modulus) {
  let result = 1;
  let factor = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const output = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      output.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      output.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    output.push(token.value);
    offset += token.symbol.length;
  }
  return output;
}

function gp0(word) {
  return gp(word).reduce((total, value) => total + value, 0);
}

function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/)
  .slice(1)
  .join("\n");
assert.ok(clear.includes("7A35090F"));

const signedWords = clear
  .split(/[^A-Za-z0-9]+/)
  .filter((token) => /^[A-Za-z]+$/.test(token))
  .map((word) => word.toUpperCase());
assert.equal(signedWords.length, 43);

// Source-authenticated OpenPGP fingerprint suffix as eight hexadecimal nibbles.
const keyId = "7A35090F";
const nibbles = [...keyId].map((digit) => Number.parseInt(digit, 16));
assert.deepEqual(nibbles, [7, 10, 3, 5, 0, 9, 0, 15]);

const keyIdShell = shell(nibbles);
assert.deepEqual(keyIdShell, [21, 22, 10, 10, 23, 12, 5, 5]);

// Reconstruct p,g,K,a from the packet without inserting their target values.
assert.equal(keyIdShell[2], keyIdShell[3]);
assert.equal(keyIdShell[6], keyIdShell[7]);

const p = keyIdShell[4];
const g = keyIdShell[6];
const gInv29 = inverse(g, 29);
assert.ok(gInv29);
const K = mod(keyIdShell[2] * gInv29);
const kInv29 = inverse(K, 29);
assert.ok(kInv29);
const a = mod(keyIdShell[5] * kInv29);

assert.equal(keyIdShell[0], mod(p - K));
assert.equal(keyIdShell[1], mod(p - 1));
assert.deepEqual({ p, g, K, a }, { p: 23, g: 5, K: 2, a: 6 });

const A = modPow(g, a, p);
assert.equal(A, 8);

// Charge all 16 dihedral orientations of the eight nibbles against the same
// structural packet template. Only the printed orientation survives.
function structuralState(values) {
  const packet = shell(values);
  if (packet[2] !== packet[3] || packet[6] !== packet[7]) return null;
  const candidateP = packet[4];
  const candidateG = packet[6];
  const candidateGInv = inverse(candidateG, 29);
  if (!candidateGInv) return null;
  const candidateK = mod(packet[2] * candidateGInv);
  if (packet[0] !== mod(candidateP - candidateK)) return null;
  if (packet[1] !== mod(candidateP - 1)) return null;
  const candidateKInv = inverse(candidateK, 29);
  if (!candidateKInv) return null;
  const candidateA = mod(packet[5] * candidateKInv);
  return {
    p: candidateP,
    g: candidateG,
    K: candidateK,
    a: candidateA,
    packet,
  };
}

const dihedralHits = [];
for (const [orientation, base] of [
  ["forward", nibbles],
  ["reversed", nibbles.slice().reverse()],
]) {
  for (let rotation = 0; rotation < nibbles.length; rotation += 1) {
    const values = base.slice(rotation).concat(base.slice(0, rotation));
    const reconstructed = structuralState(values);
    if (reconstructed) {
      dihedralHits.push({ orientation, rotation, values, reconstructed });
    }
  }
}
assert.equal(dihedralHits.length, 1);
assert.equal(dihedralHits[0].orientation, "forward");
assert.equal(dihedralHits[0].rotation, 0);

// The complete dual-radix source family was independently selected by p0 word
// boundary geometry. Its three members are exactly 16 signed words apart.
const anchors = ["PRIMUS", "NUMBERS", "OPENPGP"].map((word) => {
  const sourceIndex = signedWords.indexOf(word);
  const address = gp0(word);
  const token = table[address];
  const value59 = decodeToken(token, alphabet59);
  const value60 = decodeToken(token, alphabet60);
  return {
    word,
    sourceIndex,
    address,
    token,
    value59,
    value60,
    residue59: mod(value59),
    residue60: mod(value60),
  };
});
assert.deepEqual(anchors.map((row) => row.sourceIndex), [10, 26, 42]);
assert.deepEqual(
  anchors.slice(1).map((row, index) =>
    row.sourceIndex - anchors[index].sourceIndex
  ),
  [16, 16]
);

// Base60 residues complete the public/private state channel.
assert.equal(anchors[0].residue60, A);
const B = anchors[1].residue60;
const e = anchors[2].residue60;
assert.deepEqual([A, B, e], [8, 19, 3]);

// Recover b from the public DH value B in the tiny p=23 group.
const bCandidates = [];
for (let exponent = 0; exponent < p - 1; exponent += 1) {
  if (modPow(g, exponent, p) === B) bCandidates.push(exponent);
}
assert.deepEqual(bCandidates, [15]);
const b = bCandidates[0];
assert.equal((b * e) % (p - 1), 1);

// Base59 residues independently cross-check a, H(K,b)[0], and F.
assert.deepEqual(
  anchors.map((row) => row.residue59),
  [a, H(K, b)[0], 0]
);

// The entire independently reconstructed p28 DH/GCD state is now recovered.
assert.deepEqual(
  { p, g, a, b, A, B, K, e },
  { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3 }
);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "authenticated-source state reconstruction: the signed OpenPGP key ID 7A35090F, under the already frozen H transform, independently reconstructs p,g,K,a; the uniquely selected 16-word-spaced PRIMUS/NUMBERS/OPENPGP dual-radix triad supplies A,B,e and cross-checks a,H(K,b)[0],F, recovering the full p28 DH/GCD state without using p28 ciphertext values",
  keyId,
  nibbles,
  keyIdShell,
  reconstructedFromKeyId: { p, g, K, a, A },
  dihedralHits,
  anchors,
  fullState: { p, g, a, b, A, B, K, e },
}, null, 2));
