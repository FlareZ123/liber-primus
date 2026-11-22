"use strict";

/**
 * Original-source p27/p55 six-rune delimiter and prime-gap field-orbit gate.
 * SFT: node sims/lp2_p27_p55_prime6389_13orbit_original_sft.cjs
 *
 * Tests ONE deliberately constrained, reversible additive GP29 consumer.
 * The author did not authenticate the proposed 13/80 finite-field operation.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..");
/** @param {string} file */
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const book = corpus.pages.slice(0, 56).flatMap((page) => page.indices);
assert.equal(book.length, 12956);
const phrase = [23, 11, 1, 17, 18, 10]; // DJU BEI
const positions = [];
for (let i = 0; i <= book.length - phrase.length; i++) {
  if (phrase.every((v, j) => book[i+j] === v)) positions.push(i);
}
assert.deepEqual(positions, [6555, 12950]);

const pageStart = (page) =>
  corpus.pages.slice(0, page).reduce((n, x) => n + x.runic_count, 0);
assert.equal(positions[0] - pageStart(27), 28);
assert.equal(positions[1] - pageStart(55), 70);
assert.equal(corpus.pages[55].runic_count, 76);
assert.equal(positions[1] + phrase.length, book.length);
assert.deepEqual(book.slice(positions[1]), phrase);
const firstInterior = positions[0] + phrase.length;
const lastInterior = positions[1];
const interior = book.slice(firstInterior, lastInterior);
const prime = interior.length;
assert.equal(firstInterior, 6561);
assert.equal(prime, 6389);
assert.equal(prime - 1, 4 * 1597);

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d*d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}
assert(isPrime(prime));
assert(isPrime(1597));

/** @param {number} b @param {number} e @param {number} m */
function modPow(b,e,m) {
  let x=1, v=b%m;
  while(e) {
    if(e%2) x=x*v%m;
    v=v*v%m;
    e=Math.floor(e/2);
  }
  return x;
}
assert.notEqual(modPow(13, (prime-1)/2, prime), 1);
assert.notEqual(modPow(13, (prime-1)/1597, prime), 1);

// Conditional generator: sum of six original GP0 indices = 80;
// "13" is visible next to the wing/terminal bookends but the use as a
// multiplicative generator and the zero splice are speculative.
const seed = phrase.reduce((n,x)=>n+x,0);
assert.equal(seed, 80);
const state = [0];
let value=seed;
for(let i=0;i<prime-1;i++) {
  state.push(value);
  value=value*13%prime;
}
assert.equal(value, seed);
assert.equal(new Set(state).size, prime);
assert.equal(state.length, prime);

/** @param {number} p @param {number} k */
const encrypt=(p,k)=>(p+(k%29))%29;
/** @param {number} c @param {number} k */
const decrypt=(c,k)=>(c-(k%29)+29)%29;
const originalCandidate = interior.map((v,i)=>decrypt(v,state[i]));
assert.deepEqual(originalCandidate.map((v,i)=>encrypt(v,state[i])), interior);

/** Transparent bookend convention to expose the true p54/p55 86-rune receiver.
 * It does not imply the marker was intended to stay in plaintext.
 * @param {number} absolute
 * @returns {number}
 */
function decodeSource(absolute) {
  if(absolute >= firstInterior && absolute < lastInterior)
    return decrypt(book[absolute],state[absolute-firstInterior]);
  return book[absolute];
}
const p27Context = Array.from({length:100},
  (_,i)=>decodeSource(pageStart(27)+34+i));
const crossingStart=pageStart(55)-10;
const terminalContext = Array.from({length:86},
  (_,i)=>decodeSource(crossingStart+i));
assert.equal(crossingStart,12870);
assert.equal(crossingStart+86,book.length);
assert.deepEqual(terminalContext.slice(-6),phrase);
assert.deepEqual(book.slice(crossingStart,crossingStart+86).slice(-6), phrase);
assert.equal(p27Context.length,100);
assert.equal(terminalContext.length,86);

/** @param {number[]} tape */
function metrics(tape) {
  const bins=Array(29).fill(0);
  tape.forEach(x=>bins[x]++);
  return {
    length:tape.length,
    ioc:bins.reduce((sum,n)=>sum+n*(n-1),0)/(tape.length*(tape.length-1)),
    top12:bins.sort((a,b)=>b-a).slice(0,12).reduce((a,b)=>a+b,0),
    doubles:tape.slice(1).reduce((sum,x,i)=>sum+(x===tape[i]),0)
  };
}

const sample=read("resources/control/gibran_prophet_58585.txt");
const begin=sample.indexOf("*** START OF");
const end=sample.indexOf("*** END OF");
assert(begin>0 && end>begin);
const gpTokens=corpus.translit.map((token,i)=>({token:token.toLowerCase(),i}))
  .sort((a,b)=>b.token.length-a.token.length);
/** @param {string} raw @returns {number[]} */
function nativeGP(raw) {
  const word=raw.toLowerCase().replace(/v/g,"u").replace(/k/g,"c").replace(/z/g,"s");
  const out=[];
  for(let offset=0;offset<word.length;) {
    const t=gpTokens.find(x=>word.startsWith(x.token,offset));
    if(!t) return [];
    out.push(t.i);
    offset+=t.token.length;
  }
  return out;
}
const words=sample.slice(begin,end).match(/[A-Za-z]+/g) || [];
const native=words.flatMap(nativeGP).slice(0,prime);
assert.equal(native.length,prime);
const plantedCipher=native.map((x,i)=>encrypt(x,state[i]));
const plantedRecovery=plantedCipher.map((x,i)=>decrypt(x,state[i]));
assert.deepEqual(plantedRecovery,native);

const allSimpleRoots=Array.from({length:28},(_,i)=>i+2)
  .filter(x=>modPow(x,prime-1,prime)===1
    && modPow(x,(prime-1)/2,prime)!==1
    && modPow(x,(prime-1)/1597,prime)!==1);
assert(allSimpleRoots.includes(13));

console.log(JSON.stringify({
  claim:"Conditional only: 13 primitive GP-field clock does not decode original prose",
  corpus_runes:book.length,
  phrase_gp29:phrase,
  phrase_positions:positions,
  first_anchor_ending: firstInterior,
  last_anchor_start: lastInterior,
  interior_length:prime,
  prime_factors_6388:[2,2,1597],
  seed_gp0:seed,
  primitive_root_13_order:prime-1,
  small_primitive_roots_2_through_29:allSimpleRoots,
  native_planted_recovery:`6389/6389`,
  original_roundtrip:`6389/6389`,
  first_100_p27_original_context:p27Context.map(x=>corpus.translit[x]).join(" "),
  terminal_86_p54_p55_original_context:terminalContext.map(x=>corpus.translit[x]).join(" "),
  receiver_86_literal_footer_runecount:6,
  original_interior_metrics:metrics(interior),
  decoded_interior_metrics:metrics(originalCandidate),
  native_GP_literary_control:metrics(native),
  original_plaintext_recovered:false
},null,2));