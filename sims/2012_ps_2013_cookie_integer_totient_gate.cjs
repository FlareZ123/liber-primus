"use strict";

// Bounded integer interpretation of the 2012 P.S. RSA modulus and 2013
// final-onion cookie values. Run from the repository root:
//   node sims/2012_ps_2013_cookie_integer_totient_gate.cjs
//
// The factorization constants below were found with SymPy 1.14 trial
// division and ECM. This script verifies their products and reproduces the
// totient residues, RSA probes, and fixed-key GP29 Vigenere score gate.
// It does not claim the historical values are an LP2 key.

const fs = require("fs");
const assert = require("assert");

const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const quadText = fs.readFileSync("resources/control/dukotah_english_quadgrams.txt", "utf8");
const cookieSource = fs.readFileSync("resources/external/2013-final-onion-cookie-values.md", "utf8");

const base29Alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
const gp = corpus.translit;

const psN = BigInt(
  "1041279065891998535982789873959431895640" +
  "442510695567564373922695237268242385295908173" +
  "9834390370374475764863415203423499357108713631"
);
const psP = 99554414790940424414351515490472769096534141749790794321708050837n;
const psQ = 104593961812606247801193807142122161186583731774511103180935025763n;
const rsaE = 65537n;

const cookies = {
  "167": {
    hex: "6941f707ff39d259ff71657a79cb6b54c184d2f0455810109c1a960860bde0e6",
    factors: [
      2n,
      7n,
      1361320421n,
      236799195671201320135081n,
      10549310670307874697161710919718123012798761n
    ]
  },
  "761": {
    hex: "7bc1e7805ccfa518920f0d94fc4e8f7dbd83287a03b337b89109cd2287befae5",
    factors: [
      11n,
      53n,
      454967n,
      2536798119511n,
      28850460227246503493n,
      2883521092882646610513901291579979911n
    ]
  }
};

function product(xs) {
  return xs.reduce((a, x) => a * x, 1n);
}
function phiFromPrimeFactors(xs) {
  return xs.reduce((a, x) => a * (x - 1n), 1n);
}
function modPow(a, e, m) {
  let out = 1n;
  a %= m;
  while (e > 0n) {
    if (e & 1n) out = (out * a) % m;
    a = (a * a) % m;
    e >>= 1n;
  }
  return out;
}
function egcd(a, b) {
  if (b === 0n) return [a, 1n, 0n];
  const [g, x, y] = egcd(b, a % b);
  return [g, y, x - (a / b) * y];
}
function modInverse(a, m) {
  const [g, x] = egcd(a, m);
  assert.strictEqual(g, 1n, "modular inverse does not exist");
  return ((x % m) + m) % m;
}
function base29(n) {
  if (n === 0n) return { text: "0", indices: [0] };
  let text = "";
  while (n > 0n) {
    const r = Number(n % 29n);
    text = base29Alphabet[r] + text;
    n /= 29n;
  }
  // Mapping the signed BASE29 digit positions to GP29 rune indices is an
  // explicit analyst assumption, not a mapping specified by the TCP source.
  return { text, indices: Array.from(text, ch => base29Alphabet.indexOf(ch)) };
}
function fixedHex(n, bytes) {
  return n.toString(16).padStart(bytes * 2, "0");
}
function asciiPreview(hex) {
  const bytes = hex.match(/../g).map(x => parseInt(x, 16));
  return bytes.map(x => x >= 32 && x <= 126 ? String.fromCharCode(x) : ".").join("");
}
function mod29Rune(n) {
  const r = Number(n % 29n);
  return { value: r, rune: gp[r] };
}

const psPhi = (psP - 1n) * (psQ - 1n);
assert.strictEqual(psP * psQ, psN, "2012 RSA factors do not multiply to P.S. modulus");
assert.strictEqual((rsaE * modInverse(rsaE, psPhi)) % psPhi, 1n);

const cookieInts = {};
const cookiePhi = {};
for (const [label, item] of Object.entries(cookies)) {
  const n = BigInt("0x" + item.hex);
  assert(cookieSource.includes(item.hex), "cookie value is absent from the pinned local source record");
  assert.strictEqual(product(item.factors), n, "cookie factorization product mismatch for " + label);
  cookieInts[label] = n;
  cookiePhi[label] = phiFromPrimeFactors(item.factors);
}

const integerSummary = {
  ps: {
    digits: psN.toString().length,
    bits: psN.toString(2).length,
    residue29: mod29Rune(psN)
  },
  phiPs: mod29Rune(psPhi),
  cookies: Object.fromEntries(Object.keys(cookies).map(label => [
    label,
    {
      bits: cookieInts[label].toString(2).length,
      factors: cookies[label].factors.map(String),
      phi: cookiePhi[label].toString(),
      phiMod29: mod29Rune(cookiePhi[label]),
      even: cookieInts[label] % 2n === 0n
    }
  ]))
};

const rsaD = modInverse(rsaE, psPhi);
const rsaProbes = {};
for (const [label, c] of Object.entries(cookieInts)) {
  const dec = fixedHex(modPow(c, rsaD, psN), 54);
  const pub = fixedHex(modPow(c, rsaE, psN), 54);
  rsaProbes[label] = {
    privateExponentDecrypt: dec,
    privateDecryptAscii: asciiPreview(dec),
    privateDecryptPkcs1v15Prefix: dec.startsWith("0001") || dec.startsWith("0002"),
    publicExponentTransform: pub,
    publicTransformAscii: asciiPreview(pub),
    publicTransformPkcs1v15Prefix: pub.startsWith("0001") || pub.startsWith("0002")
  };
}

// A label-as-public-exponent / cookie-as-modulus interpretation is checked
// only where mathematically possible. Cookie 167 is even and cannot be a
// conventional RSA modulus.
const labelExponentProbe = {
  "167": { validRsaModulus: cookieInts["167"] % 2n === 1n },
  "761": { validRsaModulus: cookieInts["761"] % 2n === 1n }
};
if (labelExponentProbe["761"].validRsaModulus) {
  const n = cookieInts["761"];
  const ph = cookiePhi["761"];
  const d = modInverse(761n, ph);
  const candidates = {
    cookie167: cookieInts["167"],
    psModulus: psN
  };
  labelExponentProbe["761"].decrypted = Object.fromEntries(Object.entries(candidates).map(([name, value]) => {
    const out = fixedHex(modPow(value % n, d, n), 32);
    return [name, {
      hex: out,
      ascii: asciiPreview(out),
      pkcs1v15Prefix: out.startsWith("0001") || out.startsWith("0002")
    }];
  }));
}

const rawKeys = {
  "P.S. modulus": base29(psN),
  "cookie 167": base29(cookieInts["167"]),
  "cookie 761": base29(cookieInts["761"]),
  "cookies 167||761": {
    text: base29(cookieInts["167"]).text + base29(cookieInts["761"]).text,
    indices: [...base29(cookieInts["167"]).indices, ...base29(cookieInts["761"]).indices]
  }
};
const phiKeys = {
  "phi(P.S.)": base29(psPhi),
  "phi(cookie 167)": base29(cookiePhi["167"]),
  "phi(cookie 761)": base29(cookiePhi["761"]),
  "phi(cookie 167)||phi(cookie 761)": {
    text: base29(cookiePhi["167"]).text + base29(cookiePhi["761"]).text,
    indices: [...base29(cookiePhi["167"]).indices, ...base29(cookiePhi["761"]).indices]
  },
  "phi(P.S.)||phi(cookie 167)||phi(cookie 761)": {
    text: base29(psPhi).text + base29(cookiePhi["167"]).text + base29(cookiePhi["761"]).text,
    indices: [...base29(psPhi).indices, ...base29(cookiePhi["167"]).indices, ...base29(cookiePhi["761"]).indices]
  }
};

const quad = new Map();
let quadTotal = 0;
for (const line of quadText.split(/\r?\n/)) {
  const m = line.trim().match(/^([A-Z]{4})\s+(\d+)$/);
  if (!m) continue;
  const count = Number(m[2]);
  quad.set(m[1], count);
  quadTotal += count;
}
function scorePages(pages) {
  let score = 0;
  let n = 0;
  for (const page of pages) {
    const text = page.map(i => gp[i]).join("").toUpperCase().replace(/[^A-Z]/g, "");
    for (let i = 0; i + 4 <= text.length; i++) {
      score += Math.log((quad.get(text.slice(i, i + 4)) || 0.01) / quadTotal);
      n++;
    }
  }
  return score / n;
}
function decrypt(key, op, clock, transparent) {
  let globalPos = 0;
  return corpus.pages.slice(0, 56).map(page => {
    let pos = clock === "page-reset" ? 0 : globalPos;
    const out = page.indices.map(x => {
      if (transparent && x === 0) return 0;
      const k = key[pos % key.length];
      pos++;
      if (op === "sub") return (x - k + 29) % 29;
      if (op === "add") return (x + k) % 29;
      return (k - x + 29) % 29;
    });
    globalPos = pos;
    return out;
  });
}

const trainPages = corpus.pages.slice(0, 28);
const holdPages = corpus.pages.slice(28, 56);
const baseline = {
  train: scorePages(trainPages.map(p => p.indices)),
  holdout: scorePages(holdPages.map(p => p.indices))
};

const candidates = [];
function runKeyFamily(familyName, keyMap, operations) {
  for (const [keyName, keyData] of Object.entries(keyMap)) {
    for (const op of operations) {
      for (const clock of ["global", "page-reset"]) {
        for (const transparent of [false, true]) {
          const pages = decrypt(keyData.indices, op, clock, transparent);
          candidates.push({
            family: familyName,
            key: keyName,
            keyLength: keyData.indices.length,
            op,
            clock,
            fTransparent: transparent,
            train: scorePages(pages.slice(0, 28)),
            holdout: scorePages(pages.slice(28, 56)),
            full: scorePages(pages),
            firstPagePrefix: pages[0].slice(0, 80).map(i => gp[i]).join("")
          });
        }
      }
    }
  }
}
runKeyFamily("raw integer BASE29", rawKeys, ["sub", "add"]);
runKeyFamily("Euler-phi integer BASE29", phiKeys, ["sub", "add", "beaufort"]);
candidates.sort((a, b) => b.holdout - a.holdout);

const result = {
  scope: {
    unsolvedPages: 56,
    runes: corpus.pages.slice(0, 56).reduce((s, p) => s + p.indices.length, 0),
    quadgramTypes: quad.size,
    candidateSettings: candidates.length
  },
  integerSummary,
  rsaProbes,
  labelExponentProbe,
  base29KeyLengths: {
    raw: Object.fromEntries(Object.entries(rawKeys).map(([k, v]) => [k, v.indices.length])),
    phi: Object.fromEntries(Object.entries(phiKeys).map(([k, v]) => [k, v.indices.length]))
  },
  baseline,
  bestByHoldout: candidates.slice(0, 12)
};

console.log(JSON.stringify(result, null, 2));
