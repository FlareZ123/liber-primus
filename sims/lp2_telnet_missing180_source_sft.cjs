"use strict";

/**
 * Source-led 2013 telnet prime-gap -> LP2 numeric/terminal geometry probe.
 *
 * The archived Cicada telnet "primes" listing skips from 71 to 1229:
 * https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/README.md
 * https://github.com/scream314/cicada3301/blob/master/hints_never_used.md
 *
 * This SFT quantifies a concrete candidate source/key relationship and
 * uses the independently solved p56 as a false-positive control. There is
 * no claimed original LP2 decryption. Node.js 22, no extra packages.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {decryptTotient} = require("./solved_cipher_regression.cjs");

const ROOT = path.join(__dirname, "..");

/** @param {string} relative @returns {any} */
function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relative), "utf8"));
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const result = [];
  for (let n = 2; result.length < count; n++) {
    let prime = true;
    for (let d = 2; d*d <= n; d++) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) result.push(n);
  }
  return result;
}

/** @param {number[]} a @param {number[]} b @returns {number} */
function matches(a,b) {
  assert.equal(a.length,b.length);
  return a.filter((x,i) => x === b[i]).length;
}

/**
 * Authentic solved p56 has a literal F at ciphertext offset 56.
 * All other runes consume one consecutive prime key step.
 * @param {number[]} cipher
 * @param {number[]} keyPrimes
 * @returns {number[]}
 */
function decodeP56(cipher,keyPrimes) {
  let keyPosition = 0;
  return cipher.map((c,i) => {
    if (i === 56) return c;
    return ((c - (keyPrimes[keyPosition++]-1)) % 29 + 29) % 29;
  });
}

/** @returns {object} */
function main() {
  const corpus = readJson("resources/liber-primus/lp2-corpus.json");
  const grid = readJson("resources/liber-primus/base60-grid.json");
  const primes = firstPrimes(464);
  assert.deepEqual([primes[19],primes[20],primes[199],primes[200]],
    [71,73,1223,1229]);

  const missing = primes.slice(20,200);
  assert.equal(missing.length,180);
  assert.deepEqual([primes[102],primes[103]],[563,569]);

  const page32 = corpus.pages.find(p => p.page === 32).indices;
  assert.equal(page32.length,121);
  const gpPrime = i => corpus.prime[i];
  const top = page32.slice(0,11).map(gpPrime);
  const left = Array.from({length:11},(_,i)=>gpPrime(page32[11*i]));
  assert.deepEqual([top[0],top.reduce((a,b)=>a+b,0),
    left.reduce((a,b)=>a+b,0)],[73,563,569]);

  const alphabet = grid.alphabet;
  const byte = token => 60*alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]);
  assert.equal(grid.rows.length,32);
  assert.ok(grid.rows.every(row=>row.length===8));
  const border=[],interior=[];
  for(let r=0;r<32;r++)for(let c=0;c<8;c++) {
    const target = r===0||r===31||c===0||c===7?border:interior;
    target.push(byte(grid.rows[r][c]));
  }
  assert.deepEqual([border.length,interior.length],[76,180]);
  const p56 = corpus.pages.find(p=>p.page===56).indices;
  const p57 = corpus.pages.find(p=>p.page===57).indices;
  assert.deepEqual([p56.length,p57.length],[85,95]);
  const terminal = p56.concat(p57);
  const sourceKey = missing.map(x=>(x-1)%29);

  const known = decryptTotient(p56,new Set([56]));
  assert.deepEqual(decodeP56(p56,primes),known);
  const tentative = decodeP56(p56,missing);

  const tests = {
    gridInteriorVsMissingPrimesMod256:
      matches(interior,missing.map(x=>x%256)),
    gridInteriorVsMissingTotientsMod256:
      matches(interior,missing.map(x=>(x-1)%256)),
    gridInteriorVsMissingPrimesMod29:
      matches(interior.map(x=>x%29),missing.map(x=>x%29)),
    terminalCiphertextVsMissingTotientsMod29:
      matches(terminal,sourceKey),
    missingPrimeKeyVsSolvedP56Plaintext:
      matches(tentative,known)
  };
  assert.deepEqual(tests,{
    gridInteriorVsMissingPrimesMod256:1,
    gridInteriorVsMissingTotientsMod256:4,
    gridInteriorVsMissingPrimesMod29:3,
    terminalCiphertextVsMissingTotientsMod29:5,
    missingPrimeKeyVsSolvedP56Plaintext:5
  });
  const result = {
    source:"2013 telnet prime-list discontinuity (historical transcript)",
    omittedPrimeOrdinalsOneBased:[21,200],
    omittedPrimeEndpoints:[missing[0],missing.at(-1)],
    omittedPrimeCount:missing.length,
    gp29Split:[20,9],
    treePage32:{
      firstGPPrime:top[0],sumTopRow:top.reduce((a,b)=>a+b,0),
      sumLeftColumn:left.reduce((a,b)=>a+b,0),
      omittedPrimesAt103And104:[primes[102],primes[103]]
    },
    lp2Table:[grid.rows.length,grid.rows[0].length],
    tableBorderAndInterior:[border.length,interior.length],
    solvedTerminalLengths:[p56.length,p57.length],
    exactOriginalMatches:tests,
    authenticatedP56PositiveControl:matches(decodeP56(p56,primes),known),
    outcome:"structural source candidate; direct pad/integer mappings fail; no unknown plaintext"
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}

if (require.main === module) main();
module.exports = {main,firstPrimes,decodeP56};
