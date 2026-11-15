"use strict";
/**
 * Correct 2014 FIRFUMFERENFE + DIVINITY keys on the original p55/final chapter.
 * Exhaust all legal ciphertext-F branches for independent per-layer bypass rules.
 * Node.js 22 CommonJS, read-only original-input SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = p => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const circ = [..."FIRFUMFERENFE"].map(c => gp.translit.indexOf(c));
// GP29 uses U for Latin V; the original DIVINITY key is DIUINITY in GP labels.
const div = [..."DIUINITY"].map(c => gp.translit.indexOf(c));
assert.deepEqual(circ, [0,10,4,0,1,19,0,18,4,18,9,0,18]);
assert.deepEqual(div, [23,10,1,10,9,10,16,26]);

/** @param {number} x @returns {number} */
function mod(x) { return (x % 29 + 29) % 29; }
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const n = Array(29).fill(0);
  for (const x of a) n[x]++;
  return n.reduce((s,x) => s + x*(x-1), 0) / (a.length * (a.length-1));
}
/** @param {number[]} a @param {number[]} k @returns {number[]} */
function dec(a,k) { return a.map((x,i) => mod(x-k[i%k.length])); }
/**
 * All valid predecessors of one ciphertext rune, preserving key-clock phase.
 * A ciphertext F may be an unconsumed literal F or an encrypted non-F.
 * @param {number} c @param {number[]} k @param {number} phase
 * @param {boolean} skip @returns {[number,number][]}
 */
function options(c,k,phase,skip) {
  const p = mod(c-k[phase]);
  if (!skip) return [[p,(phase+1)%k.length]];
  const a = [];
  if (c === 0) a.push([0,phase]);
  if (p !== 0) a.push([p,(phase+1)%k.length]);
  return a;
}
/**
 * @param {number[]} a @param {number[]} k @param {boolean} skip
 * @returns {number[]}
 */
function enc(a,k,skip) {
  let phase = 0;
  return a.map(p => {
    if (skip && p === 0) return 0;
    const c = mod(p+k[phase]);
    phase = (phase+1)%k.length;
    return c;
  });
}
/**
 * @param {number[]} cipher @param {number[]} outer @param {number[]} inner
 * @param {boolean} skipOuter @param {boolean} skipInner
 * @param {number[]|null} expected
 * @returns {{failure:number|null,states:number,maxStates:number}}
 */
function inverse(cipher,outer,inner,skipOuter,skipInner,expected=null) {
  let states = new Map([["0:0",[0,0]]]);
  let maxStates = 1;
  for (let i = 0; i < cipher.length; i++) {
    const next = new Map();
    for (const [a,b] of states.values()) {
      for (const [mid,aa] of options(cipher[i],outer,a,skipOuter)) {
        for (const [plain,bb] of options(mid,inner,b,skipInner)) {
          if (expected && expected[i] !== plain) continue;
          next.set(aa+":"+bb,[aa,bb]);
        }
      }
    }
    if (!next.size) return {failure:i,states:0,maxStates};
    states = next;
    maxStates = Math.max(maxStates,states.size);
  }
  return {failure:null,states:states.size,maxStates};
}

// Independent positive on authentic solved original 2014 LP1 p14–15.
const rune = new Map(gp.runes.map((r,i) => [r,i]));
const parts = read("resources/transcriptions/liber_primus_master.txt").split("%");
const lp1 = [...parts[13]+parts[14]].filter(r => rune.has(r)).map(r => rune.get(r));
assert.equal(lp1.length,319);
const known36 = "A C O A N D U R NG A L E S S O N TH E M A S T E R E X P L A I N E D TH E I"
  .split(" ").map(s => gp.translit.indexOf(s));
assert.deepEqual(dec(lp1.slice(0,36),circ),known36);
const obsolete = [..."FIRFUMFERENCE"].map(s => gp.translit.indexOf(s));
assert.deepEqual(dec(lp1.slice(0,36),obsolete).flatMap((x,i)=>x===known36[i]?[]:[i]),[11,24]);

const known95 = gp.pages[57].indices;
assert.equal(known95.length,95);
const originals = [
  ["p55",gp.pages[55].indices],
  ["p54+55",gp.pages[54].indices.concat(gp.pages[55].indices)]
];
assert.equal(originals[0][1].length,76);
assert.equal(originals[1][1].length,308);
assert.deepEqual(originals[1][1].slice(232),originals[0][1]);
const orders = [["circ>div",circ,div],["div>circ",div,circ]];
const output = {}, expectations = {
  "p55":[null,3,74,3,null,16,3,3],
  "p54+55":[null,36,49,36,null,36,38,36]
};
for (const [name,cipher] of originals) {
  const cases = [], failures = [];
  for (const [order,outer,inner] of orders) {
    for (const skipOuter of [false,true]) {
      for (const skipInner of [false,true]) {
        const planted = enc(enc(known95,inner,skipInner),outer,skipOuter);
        assert.equal(inverse(planted,outer,inner,skipOuter,skipInner,known95).failure,null);
        const actual = inverse(cipher,outer,inner,skipOuter,skipInner);
        cases.push({order,skipOuter,skipInner,...actual});
        failures.push(actual.failure);
      }
    }
  }
  assert.deepEqual(failures,expectations[name]);
  const plain = dec(dec(cipher,circ),div);
  assert.deepEqual(plain.map((v,i)=>mod(v+circ[i%13]+div[i%8])),cipher);
  output[name] = {
    sourceRunes:cipher.length,
    sourceIoC:ioc(cipher),
    allConsumingIoC:ioc(plain),
    decodedTailIoC:name==="p54+55"?ioc(plain.slice(232)):null,
    decodedPrefix:plain.slice(0,60).map(i=>gp.translit[i]).join(" "),
    cases
  };
}
assert(Math.abs(output.p55.allConsumingIoC - 0.037192982456140354)<1e-12);
assert(Math.abs(output["p54+55"].allConsumingIoC - 0.03456152967553619)<1e-12);
assert(Math.abs(output["p54+55"].decodedTailIoC - 0.039649122807017545)<1e-12);
console.log(JSON.stringify({
  source:"original LP1 key-positive, original LP2 unknown final chapter",
  circKey:"FIRFUMFERENFE",
  divKey:"DIVINITY",
  solvedLP1PositiveRunes:36,
  solvedP57EncryptedPositiveRunesPerCase:95,
  output,
  verdict:"No unknown plaintext; every F-bypass composition fails on the original zero-phase ciphertext"
},null,2));
