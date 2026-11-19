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
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const transcription = read("resources/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((row) =>
      normalized.startsWith(row.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling " + word);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {number[]} values @returns {number[]} */
function shell(values) {
  const out = [];
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    out.push(mod29(values[left] - values[right]));
    out.push(mod29(values[left] + values[right]));
  }
  if (values.length % 2 === 1) out.push(values[(values.length - 1) / 2]);
  return out;
}

/** @param {number[]} values @returns {number[]} */
function hInverse(values) {
  const key = new Array(values.length);
  const inverse2 = 15;
  const pairs = Math.floor(values.length / 2);
  for (let pair = 0; pair < pairs; pair += 1) {
    const difference = values[2 * pair];
    const sum = values[(2 * pair) + 1];
    key[pair] = mod29((difference + sum) * inverse2);
    key[values.length - 1 - pair] = mod29((sum - difference) * inverse2);
  }
  if (values.length % 2 === 1) key[pairs] = values.at(-1);
  return key;
}

const state = { p:23, g:5, a:6, b:15, A:8, B:19, K:2, e:3 };

const clear = signed.split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/).slice(1).join("\n");
const sourceWords = clear.split(/[^A-Za-z0-9]+/)
  .filter((token) => /^[A-Za-z]+$/.test(token))
  .map((word) => ({ word:word.toUpperCase(), values:gp(word) }));

const warning = sourceWords.slice(-5);
assert.deepEqual(warning.map((row) => row.word),
  ["BEWARE","FALSE","PATHS","VERIFY","OPENPGP"]);
assert.deepEqual(warning.map((row) => row.values.length), [6,5,4,6,7]);
assert.equal(warning.reduce((sum, row) => sum + row.values.length, 0), 28);
assert.equal(gp("FALSE").length, state.g);
const kept = warning.filter((row) => row.word !== "FALSE");
assert.equal(kept.reduce((sum, row) => sum + row.values.length, 0), state.p);
assert.deepEqual(kept.map((row) => row.values.length), [6,4,6,7]);
assert.deepEqual(
  [kept[3], kept[1], kept[2], kept[0]].map((row) => row.word),
  ["OPENPGP","PATHS","VERIFY","BEWARE"]
);
assert.deepEqual(
  [kept[3], kept[1], kept[2], kept[0]].map((row) => row.values.length),
  [7,4,6,6]
);

const p0Text = transcription.split(/^\s*%\s*$/m)[0];
const p0Words = [];
let current = [];
let start = 0;
let offset = 0;

/** @returns {void} */
function flushWord() {
  if (!current.length) return;
  p0Words.push({
    index:p0Words.length,
    start,
    end:offset - 1,
    values:current.slice(),
  });
  current = [];
}

for (const char of [...p0Text]) {
  const value = runeIndex.get(char);
  if (value !== undefined) {
    if (!current.length) start = offset;
    current.push(value);
    offset += 1;
  } else if (char === "-" || char === ".") {
    flushWord();
  }
}
flushWord();

assert.deepEqual(
  p0Words.slice(37, 42).map((row) => [row.start, row.end, row.values.length]),
  [[166,172,7],[173,175,3],[176,176,1],[177,182,6],[183,188,6]]
);

const pathsCipher = p0Words[38].values.concat(p0Words[39].values);
const bewareCipher = p0Words[41].values;
assert.deepEqual(pathsCipher, [22,8,20,28]);
assert.deepEqual(bewareCipher, [0,20,7,12,16,25]);

const targetMaps = new Map();
for (const length of [4,6]) {
  const map = new Map();
  for (const row of sourceWords) {
    if (row.values.length !== length) continue;
    if (!map.has(row.values.join(","))) map.set(row.values.join(","), row.word);
  }
  targetMaps.set(length, map);
}

const stateScalars = Object.entries(state);
const pathsHits = [];
for (const [xName, x] of stateScalars) {
  for (const [yName, y] of stateScalars) {
    const keyShell = [
      mod29(x + y),
      mod29(x - (y - 1)),
      mod29(x + (y - 1)),
      y,
    ];
    const key = hInverse(keyShell);
    for (const sign of [-1, 1]) {
      const plain = pathsCipher.map((value, index) =>
        mod29(value + (sign * key[index]))
      );
      const target = targetMaps.get(4).get(plain.join(","));
      if (target) {
        pathsHits.push({
          x:xName,
          y:yName,
          sign,
          shell:keyShell,
          key,
          plain,
          target,
        });
      }
    }
  }
}
assert.equal(stateScalars.length * stateScalars.length * 2, 128);
assert.deepEqual(pathsHits, [{
  x:"p",
  y:"K",
  sign:-1,
  shell:[25,22,24,2],
  key:[9,13,18,13],
  plain:gp("PATHS"),
  target:"PATHS",
}]);
assert.deepEqual(shell(pathsHits[0].key), pathsHits[0].shell);

const oldPathsKey = [10,19,19,21];
const oldPathsOutput = pathsCipher.map((value, index) =>
  mod29(value - oldPathsKey[index])
);
assert.deepEqual(oldPathsOutput, [12,18,1,7]);
assert.notDeepEqual(oldPathsOutput, gp("PATHS"));

const roles = [
  { name:"Alice-self", u:state.a, U:state.A, v:state.b, V:state.B },
  { name:"Bob-self", u:state.b, U:state.B, v:state.a, V:state.A },
];
const bewareHits = [];
for (const role of roles) {
  for (const [sName, s] of [["g",state.g],["e",state.e],["K",state.K]]) {
    for (const firstSign of [-1, 1]) {
      for (const secondSign of [-1, 1]) {
        const keyShell = [
          s,
          role.V,
          role.V,
          mod29(role.U + (firstSign * role.u)),
          mod29(state.K * role.u),
          mod29(role.v + (secondSign * state.K)),
        ];
        const key = hInverse(keyShell);
        for (const sign of [-1, 1]) {
          const plain = bewareCipher.map((value, index) =>
            mod29(value + (sign * key[index]))
          );
          const target = targetMaps.get(6).get(plain.join(","));
          if (target) {
            bewareHits.push({
              role:role.name,
              s:sName,
              firstSign,
              secondSign,
              sign,
              shell:keyShell,
              key,
              plain,
              target,
            });
          }
        }
      }
    }
  }
}
assert.equal(roles.length * 3 * 2 * 2 * 2, 48);
assert.deepEqual(bewareHits, [{
  role:"Alice-self",
  s:"g",
  firstSign:1,
  secondSign:1,
  sign:-1,
  shell:[5,19,19,14,12,17],
  key:[12,2,0,17,12,7],
  plain:gp("BEWARE"),
  target:"BEWARE",
}]);
assert.deepEqual(shell(bewareHits[0].key), bewareHits[0].shell);
assert.deepEqual(shell(bewareCipher), [4,25,4,7,24,19]);

console.log(JSON.stringify({
  status:"PASS",
  classification:
    "positive source-assigned warning-packet inverses: Agent20's source-only length gate fixes PATHS and BEWARE blocks before scoring; the frozen 128-case PATHS shell family has only p,K/subtract -> PATHS, and the 48-case BEWARE role family has only Alice-self,g,plus/plus,subtract -> BEWARE; templates were recognized after required key values, so this is mechanism compression rather than blind key derivation",
  packet:{
    words:p0Words.slice(37,42).map((row) => ({
      index:row.index,start:row.start,end:row.end,length:row.values.length
    })),
    logical:["OPENPGP","PATHS","VERIFY","BEWARE"],
  },
  paths:{
    cipher:pathsCipher,
    configs:128,
    hits:pathsHits,
    oldKeyTransfer:{ key:oldPathsKey, output:oldPathsOutput, result:"FAIL" },
  },
  beware:{
    cipher:bewareCipher,
    rawShell:shell(bewareCipher),
    configs:48,
    hits:bewareHits,
  },
}, null, 2));
