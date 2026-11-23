'use strict';
/**
 * Original-source, single frozen p15 Fibonacci spiral + authentic p56
 * plaintext-F interrupter test. Node 22/CommonJS, read-only.
 *
 * Fixed before ciphertext evaluation:
 * - Read the red 3299 square cell first, then clockwise outward.
 * - Use the sixteen physically printed integers, reduced modulo GP29.
 * - Begin at p15's black text immediately after the source 13-dot mark
 *   at rune offset 20; clock continuously through p22's terminal mark.
 * - Authentic p56 addition C=P+K (mod29): plaintext F=0 stays C=0
 *   without consuming a key; all other plaintext consumes exactly one
 *   key, even when it encrypts into a ciphertext F.
 *
 * Deliberately no phase, sign, page restart, scoring or fitting.
 * This experiment tests precisely one source-visible composition.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const mod = n => ((n % 29) + 29) % 29;
const printedSpiral = [
  3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516
];
const key = printedSpiral.map(mod);
assert.deepEqual(key, [22,21,19,17,11,1,10,3,20,22,25,7,22,12,17,21]);

/** Map known p56 text to canonical GP29 tokens, resetting at word breaks. */
function encodeGpWords(text) {
  const sorted = corpus.translit.map((token, value) => ({token, value}))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (const word of text.split(' ')) {
    for (let i=0; i<word.length;) {
      const hit = sorted.find(v => word.startsWith(v.token, i));
      assert.ok(hit, 'Unencodable source word: '+word);
      out.push(hit.value);
      i += hit.token.length;
    }
  }
  return out;
}
/** Pure forward implementation of authentic F-transparent addition. */
function encrypt(plain, schedule) {
  const cipher = [];
  let consumed = 0, bypass = 0;
  for (const p of plain) {
    assert.ok(Number.isInteger(p) && p >= 0 && p < 29);
    if (p === 0) {
      cipher.push(0);
      bypass++;
    } else {
      cipher.push(mod(p + schedule[consumed % schedule.length]));
      consumed++;
    }
  }
  return {cipher, consumed, bypass};
}
/**
 * Exact inverse over every legal plaintext-F interpretation.
 * State = consumed-key count. One linked witness per unique state is
 * sufficient for satisfiability and forward replay. No language heuristic.
 */
function allInverses(cipher, schedule) {
  let states = new Map([[0, null]]);
  let maxStates = 1;
  for (let i=0; i<cipher.length; i++) {
    const c = cipher[i];
    const next = new Map();
    for (const [consumed, head] of states) {
      if (c === 0 && !next.has(consumed))
        next.set(consumed, {value:0, previous:head});
      const p = mod(c - schedule[consumed % schedule.length]);
      if (p !== 0 && !next.has(consumed+1))
        next.set(consumed+1, {value:p, previous:head});
    }
    if (!next.size) {
      return {complete:false, deadAt:i, legalPrefix:i,
        maxStates, lastCursorStates:[...states.keys()]};
    }
    states = next;
    if (states.size > maxStates) maxStates = states.size;
  }
  const [consumed, final] = states.entries().next().value;
  const witness = Array(cipher.length);
  let node = final;
  for (let i=cipher.length-1; i>=0; i--) {
    assert.ok(node);
    witness[i] = node.value;
    node = node.previous;
  }
  assert.deepEqual(encrypt(witness, schedule).cipher, cipher);
  return {complete:true, legalPrefix:cipher.length, maxStates,
    finalStates:states.size, consumed, witness};
}
/** Independent authentic p56 proof of the exact F convention. */
function firstPrimes(n) {
  const arr=[];
  for(let p=2; arr.length<n; p++) {
    let prime=true;
    for(let d=2; d*d<=p; d++)
      if(p%d===0){prime=false;break;}
    if(prime)arr.push(p);
  }
  return arr;
}
const p56 = corpus.pages.find(p=>p.page===56).indices;
const p56Text = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO '+
  'IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const p56Plain = encodeGpWords(p56Text);
assert.equal(p56Plain.length,85);
const p56Result = encrypt(p56Plain, firstPrimes(85).map(p=>mod(p-1)));
assert.deepEqual(p56Result.cipher,p56);
assert.equal(p56Result.consumed,84);
assert.equal(p56Result.bypass,1);
assert.equal(p56Plain.indexOf(0),56);

/** The printed 13-dot mark at p15[20] ends the red eleven-rune preamble. */
const mark = ink.pages.find(p=>p.page===15);
assert.deepEqual(mark.red_spans.map(s=>[s.start,s.length]),[[0,9],[9,11]]);
assert.ok(mark.large_punctuation.some(x=>x[0]===20&&x[1]===13));
const p15 = corpus.pages.find(p=>p.page===15);
assert.equal(p15.indices.length,159);
const black15 = p15.indices.slice(20);
assert.equal(black15.length,139);
const following = corpus.pages.filter(p=>p.page>=16&&p.page<=22);
assert.deepEqual(following.map(p=>p.indices.length),
  [267,273,260,271,269,273,131]);
const actual = black15.concat(...following.map(p=>p.indices));
assert.equal(actual.length,1883);

const original = allInverses(actual,key);
assert.equal(original.complete,false);
assert.equal(original.deadAt,167);
assert.equal(original.legalPrefix,167);
assert.equal(original.deadAt-black15.length,28);

/** Source-native plant verifies entire implemented schedule and exact F skip. */
const nativePlain = Array.from({length:actual.length},
  (_,i)=>p56Plain[i%p56Plain.length]);
const plant = encrypt(nativePlain,key);
assert.ok(plant.bypass>0);
assert.ok(plant.consumed>0);
const plantInverse = allInverses(plant.cipher,key);
assert.equal(plantInverse.complete,true);
assert.deepEqual(encrypt(plantInverse.witness,key).cipher,plant.cipher);

console.log(JSON.stringify({
  source:'unchanged LP2 original p15[20..] followed by p16..p22',
  printedSpiral, keyMod29:key,
  operation:'C=(P+K_j) mod29 for nonzero P, plaintext-F bypass only',
  p56AuthenticControl:{originalRunes:85,exactForward:true,
    literalFPosition:56,consumedKeys:84},
  original:{runes:actual.length,firstImpossibleZeroBased:original.deadAt,
    p15BlackRunes:139,firstImpossiblePage:16,
    impossibleAtP16LocalOffset:28,maxCursorStates:original.maxStates,
    finalCursorStates:original.lastCursorStates},
  nativePlant:{runes:actual.length,bypassedF:plant.bypass,
    consumedKeys:plant.consumed,exactForward:true,
    completeInverse:true},
  conclusion:'This fixed source-selected spiral mod29 plus authentic F-interrupter cannot decode even the first 168-rune original interval.'
},null,2));
