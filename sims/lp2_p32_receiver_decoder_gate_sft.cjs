"use strict";

/**
 * Director #1781 SFT: finite p32 receiver decoder gate.
 *
 * Frozen receiver:
 *   p32 fragment15 = [22,21,3,19,17,1,23,15]
 * Frozen H state shell:
 *   [7,8,27,15,2,4,2,7]
 *
 * Charged consumers:
 *   1. one positional outside-in H pass and its exact Hinv counterpart;
 *   2. direct GP29 +/- by the frozen ordered state shell;
 *   3. solved p56 prime-totient inverse, reset at receiver start.
 *
 * No key search, atom selection, offset rescue, or language-guided tuning.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g,"");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(
  read("resources/external/relikd-solved-gp29-native-v1.json")
);
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune,index) => [rune,index]));
const mod29 = value => ((value%29)+29)%29;
const inv2 = 15;
const H = (left,right) => [mod29(left-right),mod29(left+right)];
const Hinv = (diff,sum) => [
  mod29((diff+sum)*inv2),
  mod29((sum-diff)*inv2),
];

const pages = transcription.split("%");

/** @param {string} raw */
function parseFragments(raw) {
  const fragments = [];
  let current = [];
  const flush = () => {
    if (!current.length) return;
    fragments.push([...current]);
    current = [];
  };
  for (const char of raw) {
    if (runeIndex.has(char)) current.push(runeIndex.get(char));
    else if (char === "/" || /\s/u.test(char)) continue;
    else flush();
  }
  flush();
  return fragments;
}

const receiver = parseFragments(pages[32])[15];
assert.deepEqual(receiver,[22,21,3,19,17,1,23,15]);

const shell = [7,8,27,15,2,4,2,7];

/** @param {number[]} values */
const translit = values => values.map(value => corpus.translit[value]).join("");

function positionalOuter(values,fn) {
  const out = [...values];
  for (let left=0,right=values.length-1; left<right; left+=1,right-=1) {
    const pair = fn(values[left],values[right]);
    out[left] = pair[0];
    out[right] = pair[1];
  }
  return out;
}

// Consumer 1: one fixed positional H/Hinv pass.
const hForward = positionalOuter(receiver,H);
const hRecovered = positionalOuter(hForward,Hinv);
assert.deepEqual(hRecovered,receiver);

const hInverse = positionalOuter(receiver,Hinv);
const hiRecovered = positionalOuter(hInverse,H);
assert.deepEqual(hiRecovered,receiver);

// Consumer 2: direct ordered state-shell add/subtract.
const stateMinus = receiver.map((value,index) => mod29(value-shell[index]));
const statePlus = receiver.map((value,index) => mod29(value+shell[index]));
assert.deepEqual(
  stateMinus.map((value,index) => mod29(value+shell[index])),
  receiver
);
assert.deepEqual(
  statePlus.map((value,index) => mod29(value-shell[index])),
  receiver
);

// Consumer 3: p56 prime-totient inverse, reset at receiver start.
// The frozen receiver contains no ciphertext F, so no interrupter choice exists.
function primes(count) {
  const out = [];
  for (let candidate=2; out.length<count; candidate+=1) {
    let prime = true;
    for (let divisor=2; divisor*divisor<=candidate; divisor+=1) {
      if (candidate%divisor===0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(candidate);
  }
  return out;
}
const primeKeys = primes(receiver.length).map(prime => (prime-1)%29);
const totientPlain = receiver.map((value,index) =>
  mod29(value-primeKeys[index])
);
const totientRebuilt = totientPlain.map((value,index) =>
  mod29(value+primeKeys[index])
);
assert.deepEqual(totientRebuilt,receiver);
assert.equal(receiver.filter(value => value===0).length,0);

const candidates = [
  {name:"H-positional",values:hForward},
  {name:"Hinv-positional",values:hInverse},
  {name:"state-shell-minus",values:stateMinus},
  {name:"state-shell-plus",values:statePlus},
  {name:"p56-totient-minus",values:totientPlain},
].map(row => ({...row,text:translit(row.values)}));

assert.deepEqual(
  candidates.map(row => [row.name,row.text]),
  [
    ["H-positional","WIATHTHWRSH"],
    ["Hinv-positional","ROETHEEAEAUJ"],
    ["state-shell-minus","SPCRSYNGH"],
    ["state-shell-plus","FFUCMCAEOE"],
    ["p56-totient-minus","NGMEAPWEWY"],
  ]
);

// Exact known-plaintext control: none of the charged outputs occurs as an
// eight-rune contiguous slice in the published solved corpus or authenticated
// signed-2016 cleartext encoded under the same GP spelling.
const knownStreams = solved.sections.map(section => {
  return [...section.source_text]
    .map(ch => runeIndex.get(ch))
    .filter(value => value !== undefined);
});

const gpTokens = corpus.translit
  .map((symbol,value) => ({symbol,value}))
  .sort((left,right) => right.symbol.length-left.symbol.length);
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g,"CW")
    .replace(/V/g,"U")
    .replace(/[KQ]/g,"C")
    .replace(/Z/g,"S")
    .replace(/[^A-Z]/g,"");
  const values = [];
  for (let offset=0; offset<normalized.length;) {
    if (normalized.startsWith("ING",offset)) {
      values.push(21); offset+=3; continue;
    }
    if (normalized.startsWith("IO",offset)) {
      values.push(27); offset+=2; continue;
    }
    const token = gpTokens.find(item =>
      normalized.startsWith(item.symbol,offset)
    );
    assert.ok(token);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}
const clear = signed2016.match(
  /Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u
);
assert.ok(clear);
const signedWords = clear[1].match(/\b[A-Za-z]+\b/gu) || [];
knownStreams.push(signedWords.flatMap(gp));

function containsSlice(stream,needle) {
  for (let start=0; start+needle.length<=stream.length; start+=1) {
    if (needle.every((value,index) => stream[start+index]===value)) {
      return true;
    }
  }
  return false;
}

for (const candidate of candidates) {
  candidate.knownEightRuneHit = knownStreams.some(stream =>
    containsSlice(stream,candidate.values)
  );
}
assert.deepEqual(
  candidates.map(row => row.knownEightRuneHit),
  [false,false,false,false,false]
);

// Preserve the already authenticated readout edge separately: the outer pair
// alone under H returns source indices [7,8] = THE DEVOTED. This is a valid
// receiver/readout relation, but it is not a full-fragment plaintext decoder.
assert.deepEqual(H(receiver[0],receiver.at(-1)),[7,8]);

console.log(JSON.stringify({
  status:"PASS",
  classification:
    "Director #1781 finite negative: admitted reversible consumers do not decode the frozen p32 eight-rune receiver",
  receiver,
  receiverText:translit(receiver),
  stateShell:shell,
  candidates,
  preservedReadout:{
    outerH:H(receiver[0],receiver.at(-1)),
    sourceWords:["THE","DEVOTED"],
  },
  decision:
    "Keep the p32 route as navigation/readout structure. None of the admitted typed consumers yields a full receiver plaintext interval.",
},null,2));
