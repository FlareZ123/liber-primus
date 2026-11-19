"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
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

/** @param {number} value @returns {boolean} */
function isPrime(value) {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0) return false;
  }
  return true;
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function powModulo(base, exponent, modulus) {
  let result = 1;
  let current = ((base % modulus) + modulus) % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * current) % modulus;
    current = (current * current) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");
const words = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());
assert.equal(words.length, 43);

const occurrences = new Map();
for (let index = 0; index < words.length; index += 1) {
  const word = words[index];
  if (!occurrences.has(word)) occurrences.set(word, []);
  occurrences.get(word).push(index);
}

/** @param {string} word @param {number} occurrence */
function rawIndex(word, occurrence = 0) {
  const indices = occurrences.get(word);
  assert.ok(indices && indices.length > occurrence, "missing source word " + word);
  return indices[occurrence];
}

assert.equal(rawIndex("DIRECTION"), 29);
assert.equal(rawIndex("PATH"), 2);
assert.equal(rawIndex("LIES"), 3);
assert.equal(rawIndex("EMPTY"), 4);
assert.equal(rawIndex("EPIPHANY"), 5);
assert.equal(rawIndex("SEEKS"), 6);
assert.equal(words[7], "THE");
assert.equal(rawIndex("DEVOTED"), 8);
assert.equal(rawIndex("WORDS"), 15);
assert.deepEqual(occurrences.get("THEIR"), [19, 25]);
assert.equal(rawIndex("ROAD"), 23);
assert.equal(rawIndex("PATHS"), 40);

const emptyGp0 = gp("EMPTY").reduce((total, value) => total + value, 0);
assert.equal(emptyGp0, 92);

const candidates = [];
for (const origin of [0, 1]) {
  const position = (index) => index + origin;

  for (const modulusWord of ["ROAD", "PATHS"]) {
    const p = position(rawIndex(modulusWord));

    for (const sharedWord of ["PATH", "PATHS"]) {
      const K = position(rawIndex(sharedWord));

      for (let theirOccurrence = 0; theirOccurrence < 2; theirOccurrence += 1) {
        const g = position(rawIndex("EPIPHANY"));
        const a = position(rawIndex("SEEKS"));
        const A = position(rawIndex("DEVOTED"));
        const b = position(rawIndex("WORDS"));
        const B = position(rawIndex("THEIR", theirOccurrence));
        const e = position(rawIndex("LIES"));
        const q = position(rawIndex("EMPTY"));
        const interveningThe = position(7);

        let valid = isPrime(p);
        for (const value of [g, a, A, b, B, K, e, q]) {
          valid = valid && value > 0 && value < p;
        }
        valid = valid && powModulo(g, a, p) === A;
        valid = valid && powModulo(g, b, p) === B;
        valid = valid && powModulo(A, b, p) === K;
        valid = valid && powModulo(B, a, p) === K;
        valid = valid && (b * e) % (p - 1) === 1;
        valid = valid && emptyGp0 === p * q;
        valid = valid && g + K === interveningThe;

        if (valid) {
          candidates.push({
            origin,
            modulusWord,
            sharedWord,
            theirOccurrence,
            directionNumber: position(rawIndex("DIRECTION")),
            state: { p, g, a, b, A, B, K, e, q },
            interveningThe,
          });
        }
      }
    }
  }
}

assert.equal(2 * 2 * 2 * 2, 16);
assert.deepEqual(candidates, [{
  origin:0,
  modulusWord:"ROAD",
  sharedWord:"PATH",
  theirOccurrence:0,
  directionNumber:29,
  state:{p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,q:4},
  interveningThe:7,
}]);

const state = candidates[0].state;
assert.deepEqual(
  [state.K, state.e, state.q, state.g, state.a, state.g + state.K, state.A],
  [2,3,4,5,6,7,8]
);
assert.deepEqual(
  [state.K, state.e, state.q, state.g, state.a, state.g + state.K, state.A]
    .map((index) => words[index]),
  ["PATH","LIES","EMPTY","EPIPHANY","SEEKS","THE","DEVOTED"]
);
assert.deepEqual(
  [state.b, state.B, state.p].map((index) => words[index]),
  ["WORDS","THEIR","ROAD"]
);

console.log(JSON.stringify({
  status:"PASS",
  classification:
    "H-free authenticated-2016 word-position DH reconstruction. Literal clue words at zero-based positions PATH=2, LIES=3, EMPTY=4, EPIPHANY=5, SEEKS=6, DEVOTED=8, WORDS=15, first THEIR=19 and ROAD=23 satisfy the complete DH23 exchange and inverse relation; DIRECTION itself is word29. Across both index origins, ROAD/PATHS modulus alternatives, PATH/PATHS shared-secret alternatives and both THEIR occurrences, exactly one of 16 source-semantic configurations closes.",
  source:{
    direction:[rawIndex("DIRECTION"),"DIRECTION"],
    path:[rawIndex("PATH"),"PATH"],
    lies:[rawIndex("LIES"),"LIES"],
    empty:[rawIndex("EMPTY"),"EMPTY",emptyGp0],
    epiphany:[rawIndex("EPIPHANY"),"EPIPHANY"],
    seeks:[rawIndex("SEEKS"),"SEEKS"],
    devoted:[rawIndex("DEVOTED"),"DEVOTED"],
    words:[rawIndex("WORDS"),"WORDS"],
    their:occurrences.get("THEIR"),
    road:[rawIndex("ROAD"),"ROAD"],
    paths:[rawIndex("PATHS"),"PATHS"],
  },
  family:{
    configurations:16,
    survivor:candidates[0],
  },
  equations:{
    alice:powModulo(state.g,state.a,state.p),
    bob:powModulo(state.g,state.b,state.p),
    sharedAlice:powModulo(state.A,state.b,state.p),
    sharedBob:powModulo(state.B,state.a,state.p),
    inverse:(state.b*state.e)%(state.p-1),
    emptyProduct:state.p*state.q,
    interveningThe:state.g+state.K,
  },
  indexedClue:{
    consecutive:[state.K,state.e,state.q,state.g,state.a,state.g+state.K,state.A]
      .map((index)=>[index,words[index]]),
    anchors:[[state.b,words[state.b]],[state.B,words[state.B]],[state.p,words[state.p]]],
  },
},null,2));
