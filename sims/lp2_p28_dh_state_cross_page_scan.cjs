#!/usr/bin/env node
"use strict";

// Fixed-schema search for the p28 line-6 Diffie–Hellman register.
// Inputs are canonical repository transcriptions; no external dependencies.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const transcription = fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-transcription.txt"),
  "utf8"
);
const corpus = JSON.parse(
  fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8")
);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);
const mod = (x, m) => ((x % m) + m) % m;

function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return Math.abs(a);
}

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

function powMod(base, exponent, modulus) {
  let result = 1;
  let value = mod(base, modulus);
  let power = exponent;
  while (power > 0) {
    if (power & 1) result = (result * value) % modulus;
    value = (value * value) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

function inverseMod(a, modulus) {
  let oldR = mod(a, modulus), r = modulus;
  let oldS = 1, s = 0;
  while (r !== 0) {
    const q = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  if (oldR !== 1) return null;
  return mod(oldS, modulus);
}

function H(x, y) {
  return [mod(x - y, 29), mod(x + y, 29)];
}

function fragments(line) {
  return [...line.matchAll(/[\u16A0-\u16FF]+/gu)].map((match) =>
    [...match[0]].map((rune) => runeIndex.get(rune)).filter(Number.isInteger)
  );
}

// The transcription omits physical p50 from the page-part sequence.
function physicalPart(page) {
  return page >= 51 ? page - 1 : page;
}

const exactHits = [];
const partial = [];
let linesScanned = 0;

for (let page = 0; page <= 55; page++) {
  if (page === 50) continue;
  const source = parts[physicalPart(page)] || "";
  const runeLines = source.split("/").filter((line) => /[\u16A0-\u16FF]/u.test(line));

  for (let lineIndex = 0; lineIndex < runeLines.length; lineIndex++) {
    linesScanned++;
    const frags = fragments(runeLines[lineIndex]);
    if (frags.length < 2 || frags.some((fragment) => fragment.length === 0)) continue;

    const p = frags.reduce((sum, fragment) => sum + fragment.length, 0);
    const g = frags.length;
    const a = lineIndex + 1;
    const [b, K] = H(frags[0][0], frags[0].at(-1));
    const [A, B] = H(frags.at(-1)[0], frags.at(-1).at(-1));

    const equations = {
      A_equals_g_pow_a: powMod(g, a, p) === A,
      B_equals_g_pow_b: powMod(g, b, p) === B,
      K_equals_B_pow_a: powMod(B, a, p) === K,
      K_equals_A_pow_b: powMod(A, b, p) === K,
    };
    const passed = Object.values(equations).filter(Boolean).length;
    const coprime = p > 2 && gcd(b, p - 1) === 1;
    const prime = isPrime(p);

    const candidate = {
      page,
      line: a,
      p,
      g,
      a,
      b,
      K,
      A,
      B,
      prime,
      gcd_b_p_minus_1: p > 2 ? gcd(b, p - 1) : null,
      inverse_b_mod_p_minus_1: p > 2 && coprime ? inverseMod(b, p - 1) : null,
      fragment_lengths: frags.map((fragment) => fragment.length),
      equations,
      equations_passed: passed,
    };

    if (prime && coprime && passed === 4) {
      // q=4 is fixed by the independent p0 marker's 4|5|4 geometry.
      const q = 4;
      const e = inverseMod(b, p - 1);
      candidate.fragment_signature = [K, e, a + e, q, g];
      candidate.fragment_signature_matches =
        JSON.stringify(candidate.fragment_lengths) ===
        JSON.stringify(candidate.fragment_signature);
      exactHits.push(candidate);
    } else if (passed >= 2) {
      partial.push(candidate);
    }
  }
}

partial.sort((left, right) =>
  right.equations_passed - left.equations_passed ||
  left.page - right.page ||
  left.line - right.line
);

console.log(JSON.stringify({
  schema: "p=total rune count; g=fragment count; a=one-based rune-line ordinal; (b,K)=H(first-fragment endpoints); (A,B)=H(last-fragment endpoints)",
  required: [
    "p prime",
    "g^a = A mod p",
    "g^b = B mod p",
    "B^a = K mod p",
    "A^b = K mod p",
    "gcd(b,p-1)=1"
  ],
  pages_scanned: 55,
  rune_lines_scanned: linesScanned,
  exact_hits: exactHits,
  closest_partials: partial.slice(0, 12)
}, null, 2));
