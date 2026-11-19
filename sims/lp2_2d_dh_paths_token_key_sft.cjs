"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const gpBySymbol = new Map(corpus.translit.map((symbol, value) => [symbol, value]));
const parts = transcription.split(/^\s*%\s*$/m);
const tableTokens = grid.pages.flatMap((page) => page.tokens);
const alphabet59 = grid.alphabet.replace("f", "");

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

function Hinv(diff, sum) {
  const inv2 = 15;
  return [mod29((diff + sum) * inv2), mod29((sum - diff) * inv2)];
}

function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      out.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      out.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((row) =>
      normalized.startsWith(row.symbol, offset));
    assert.ok(token, "unmapped GP spelling: " + word);
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}

function gp0(word) {
  return gp(word).reduce((total, value) => total + value, 0);
}

function parsePage(source) {
  const words = [];
  let current = [];
  let start = 0;
  let runeOffset = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      index: words.length,
      start,
      end: runeOffset - 1,
      length: current.length,
      values: current.slice(),
    });
    current = [];
  }

  for (const char of [...source]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runeOffset;
      current.push(value);
      runeOffset += 1;
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return words;
}

function decodeToken(token, alphabet) {
  let value = 0;
  for (const char of token) {
    const digit = alphabet.indexOf(char);
    assert.ok(digit >= 0);
    value = value * alphabet.length + digit;
  }
  return value;
}

function tokenKey(token, alphabet) {
  const digit = Number(token[0]);
  assert.ok(Number.isInteger(digit));
  const n = decodeToken(token, alphabet);
  const q = Math.floor(n / 29);
  const r = n % 29;
  const [u, v] = H(q, r);
  const shell = [u, digit, ...H(v, v)];
  const [key0, key3] = Hinv(shell[0], shell[1]);
  const [key1, key2] = Hinv(shell[2], shell[3]);
  return {digit, n, q, r, uv:[u,v], shell, key:[key0,key1,key2,key3]};
}

function signedWords() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\n\n/u)
    .slice(1)
    .join("\n");

  return clear
    .split(/[^A-Za-z0-9]+/u)
    .filter((token) => /^[A-Za-z]+$/u.test(token))
    .map((word) => ({word:word.toUpperCase(), values:gp(word)}));
}

const state = Object.freeze({p:23,g:5,a:6,b:15,A:8,B:19,K:2});
const hereLength = 4;

assert.equal(gp0("DH"), 31);
assert.equal(gp0("LUCK"), 31);
assert.equal(tableTokens[31], "2D");

const twoDPositions = tableTokens
  .map((token, address) => token === "2D" ? address : -1)
  .filter((address) => address >= 0);
assert.deepEqual(twoDPositions, [state.p + state.A, state.p + state.b]);

const positionsByToken = new Map();
tableTokens.forEach((token, address) => {
  if (!positionsByToken.has(token)) positionsByToken.set(token, []);
  positionsByToken.get(token).push(address);
});
const stateAddresses = new Set(Object.values(state).map((value) => state.p + value));
const duplicateStatePairs = [...positionsByToken.entries()]
  .filter(([, positions]) => positions.length === 2)
  .filter(([, positions]) => positions.every((address) => stateAddresses.has(address)))
  .map(([token, positions]) => ({token, positions}));
assert.deepEqual(duplicateStatePairs, [{token:"2D", positions:[31,38]}]);

const twoD = tokenKey("2D", alphabet59);
assert.equal(twoD.digit, state.K);
assert.equal(gpBySymbol.get("D"), state.p);
assert.equal(twoD.n, 131);
assert.deepEqual([twoD.q,twoD.r], [hereLength,state.b]);
assert.deepEqual(twoD.uv, [18,state.B]);
assert.deepEqual(twoD.shell, [18,state.K,0,9]);
assert.deepEqual(twoD.key, [10,19,19,21]);

assert.equal(tableTokens[state.p - state.K], "2H");
const twoH = tokenKey("2H", alphabet59);
assert.equal(twoH.digit, state.K);
assert.equal(gpBySymbol.get("H"), state.A);
assert.deepEqual([twoH.q,twoH.r], [hereLength,state.B]);

const p0 = parsePage(parts[0]);
const pathsReceiver = p0.find((word) => word.start === twoD.n);
assert.ok(pathsReceiver);
assert.equal(pathsReceiver.length, 4);
assert.deepEqual(pathsReceiver.values, [23,14,21,7]);
assert.deepEqual(
  pathsReceiver.values.map((value, index) => mod29(value - twoD.key[index])),
  gp("PATHS"),
);

const fourTargets = [...new Map(
  signedWords()
    .filter((row) => row.values.length === 4)
    .map((row) => [row.values.join(","), row])
).values()];

const alphabets = {base59:alphabet59, base60:grid.alphabet};

const fullHits = [];
let fullConfigs = 0;
for (let address = 0; address < tableTokens.length; address += 1) {
  const token = tableTokens[address];
  if (!/^[0-9]/u.test(token)) continue;

  for (const [radix, alphabet] of Object.entries(alphabets)) {
    for (const origin of [0,1]) {
      const generated = tokenKey(token, alphabet);
      const receiver = generated.n - origin;
      const word = p0.find((candidate) =>
        candidate.start === receiver && candidate.length === 4);

      for (const sign of [-1,1]) {
        fullConfigs += 1;
        if (!word) continue;
        const plaintext = word.values.map((value, index) =>
          mod29(value + sign * generated.key[index]));
        const target = fourTargets.find((candidate) =>
          candidate.values.every((value, index) => value === plaintext[index]));
        if (target) {
          fullHits.push({
            address, token, radix, origin, receiver, sign,
            target:target.word, key:generated.key,
          });
        }
      }
    }
  }
}
assert.equal(fullConfigs, 2048);
assert.deepEqual(fullHits, [
  {address:31,token:"2D",radix:"base59",origin:0,receiver:131,sign:-1,target:"PATHS",key:twoD.key},
  {address:38,token:"2D",radix:"base59",origin:0,receiver:131,sign:-1,target:"PATHS",key:twoD.key},
  {address:177,token:"2B",radix:"base60",origin:0,receiver:131,sign:-1,target:"PATHS",key:twoD.key},
]);

const sourceHits = [];
for (const source of fourTargets) {
  const address = source.values.reduce((total, value) => total + value, 0);
  const token = tableTokens[address];

  for (const [radix, alphabet] of Object.entries(alphabets)) {
    for (const origin of [0,1]) {
      const generated = tokenKey(token, alphabet);
      const receiver = generated.n - origin;
      const word = p0.find((candidate) =>
        candidate.start === receiver && candidate.length === 4);
      if (!word) continue;

      for (const sign of [-1,1]) {
        const plaintext = word.values.map((value, index) =>
          mod29(value + sign * generated.key[index]));
        const target = fourTargets.find((candidate) =>
          candidate.values.every((value, index) => value === plaintext[index]));
        if (target) {
          sourceHits.push({
            source:source.word,address,token,radix,origin,receiver,sign,
            target:target.word,key:generated.key,
          });
        }
      }
    }
  }
}
assert.deepEqual(sourceHits, [{
  source:"LUCK",address:31,token:"2D",radix:"base59",origin:0,
  receiver:131,sign:-1,target:"PATHS",key:twoD.key,
}]);

console.log(JSON.stringify({
  status:"PASS: DH/LUCK select 2D; token generates PATHS receiver and exact key",
  selector:{dhAddress:gp0("DH"),luckAddress:gp0("LUCK"),token:tableTokens[31]},
  packet:{base59:twoD.n,base29:[twoD.q,twoD.r],H:twoD.uv,shell:twoD.shell,key:twoD.key},
  broadCharge:{configs:fullConfigs,hits:fullHits},
  sourceHits,
}, null, 2));
