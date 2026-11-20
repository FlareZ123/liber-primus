#!/usr/bin/env node
"use strict";

/**
 * Source-locked p55 test of the three 2014 magic-square centres as one
 * scalar Caesar shift per matching 3x3/5x5/3x3 interior block.
 *
 * The source order is fixed by the 2014 form: 5x5, 7x7, 5x5.
 * Removing each outer border gives 9,25,9 cells, matching the 43 strict
 * interiors of p55's original 17 words. Test the raw centre residues and
 * the LP1-p05-motivated Euler-phi centre residues, in both directions.
 * No phase, fitted scalar, permutation, padding, or word-boundary reset.
 *
 * From repository root:
 *   node sims/lp2_p55_2014_center_block_shift_sft.cjs
 *
 * Status: bounded direct centre-shift negatives; NOT plaintext recovery.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const squareText = read("resources/cicada2014-openpuff-magic-squares.txt");

const words = transcription.split("%")[54]
  .replace(/\/\s*/g, "")
  .match(/[\u16A0-\u16FF]+/gu) || [];
const lengths = words.map(word => [...word].length);
assert.deepEqual(lengths,[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);

const cipher = words.flatMap(word => [...word].slice(1,-1))
  .map(rune => corpus.runes.indexOf(rune));
assert.equal(cipher.length,43);
assert.ok(cipher.every(value => value >= 0 && value < 29));

const squares = squareText.trim().split(/\r?\n\s*\r?\n/).map(section =>
  section.trim().split(/\r?\n/).map(line =>
    line.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map(matrix => matrix.length),[5,7,5]);
assert.ok(squares.every(matrix =>
  matrix.every(row => row.length === matrix.length)));
const centers = squares.map(matrix =>
  matrix[(matrix.length-1)/2][(matrix.length-1)/2]);
assert.deepEqual(centers,[809,331,91]);

const mod = value => ((value % 29) + 29) % 29;
function phi(value) {
  let remaining = value;
  let result = value;
  for (let p=2; p*p<=remaining; p+=1) {
    if (remaining % p === 0) {
      while (remaining % p === 0) remaining /= p;
      result -= result/p;
    }
  }
  if (remaining > 1) result -= result/remaining;
  return result;
}
const blockSizes = [9,25,9];
const keys = {
  raw: centers.map(mod),
  phi: centers.map(value => mod(phi(value)))
};
assert.deepEqual(keys.raw,[26,12,4]);
assert.deepEqual(keys.phi,[25,11,14]);

function transform(key, sign) {
  const output = [];
  let at = 0;
  for (let block=0; block<blockSizes.length; block+=1) {
    for (let i=0; i<blockSizes[block]; i+=1) {
      output.push(mod(cipher[at+i] + sign*key[block]));
    }
    at += blockSizes[block];
  }
  assert.equal(at,43);
  return output;
}
function replay(key, sign, plain) {
  const output = [];
  let at = 0;
  for (let block=0; block<blockSizes.length; block+=1) {
    for (let i=0; i<blockSizes[block]; i+=1) {
      output.push(mod(plain[at+i] - sign*key[block]));
    }
    at += blockSizes[block];
  }
  return output;
}
function ioc(data) {
  const counts = new Uint16Array(29);
  for (const value of data) counts[value] += 1;
  return Array.from(counts).reduce((sum,n) => sum+n*(n-1),0) /
    (data.length*(data.length-1));
}

const tokens = corpus.translit.map((token,index) => ({
  token: token.toUpperCase(), index
})).sort((a,b) => b.token.length-a.token.length);
function encodeWord(word) {
  const normalized = word.toUpperCase().replace(/QU/g,"CW")
    .replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S")
    .replace(/Q/g,"C");
  const output = [];
  for (let at=0; at<normalized.length;) {
    const match = tokens.find(item => normalized.startsWith(item.token,at));
    if (!match) return null;
    output.push(match.index);
    at += match.token.length;
  }
  return output;
}

const sourceWords = (read("resources/control/shakespeare_first300k.txt")
  .match(/[A-Za-z]+/g) || []).map(encodeWord).filter(Boolean);
const pairs = Array.from({length:29},() => new Uint32Array(29));
const starts = new Uint32Array(29);
for (const word of sourceWords) {
  for (let i=1; i<word.length; i+=1) {
    pairs[word[i-1]][word[i]] += 1;
    starts[word[i-1]] += 1;
  }
}
const logProb = pairs.map((row,i) => Array.from(row,value =>
  Math.log((value+0.25)/(starts[i]+29*0.25))));

function interiorBigramScore(data) {
  let at=0, sum=0, count=0;
  for (const length of lengths) {
    const n = Math.max(0,length-2);
    const part = data.slice(at,at+n);
    for (let i=1; i<part.length; i+=1) {
      sum += logProb[part[i-1]][part[i]];
      count += 1;
    }
    at += n;
  }
  assert.equal(at,43);
  assert.equal(count,32);
  return sum/count;
}

const expected = {
  original: -6.341504871710818,
  rawSubtract: -6.4958517128847495,
  rawAdd: -5.625461971117761,
  phiSubtract: -6.385403056576551,
  phiAdd: -5.816453532471106
};
const originalScore = interiorBigramScore(cipher);
assert.ok(Math.abs(originalScore-expected.original)<1e-8);

const results = [];
for (const [name,key] of Object.entries(keys)) {
  for (const sign of [-1,1]) {
    const plain = transform(key,sign);
    assert.deepEqual(replay(key,sign,plain),cipher);
    const score = interiorBigramScore(plain);
    const label = name + (sign<0 ? "Subtract" : "Add");
    assert.ok(Math.abs(score-expected[label])<1e-8);
    results.push({
      key:name,
      residues:key,
      direction:sign<0 ? "C-K" : "C+K",
      ioc:ioc(plain),
      bigramScore:score,
      replay:"43/43",
      decoded:plain.map(value => corpus.translit[value]).join(".")
    });
  }
}

console.log(JSON.stringify({
  page:55,
  wordLengths:lengths,
  centres:centers,
  blockSizes,
  rawKey:keys.raw,
  phiKey:keys.phi,
  originalIoC:ioc(cipher),
  originalBigramScore:originalScore,
  results
},null,2));
