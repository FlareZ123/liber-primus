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
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const p50 = grid.rows.flat();
const alphabet60 = grid.alphabet;
const parts = transcription.split(/^\s*%\s*$/m);

const clear = signed.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clear);
const sourceWords = (clear[1].match(/\b[A-Za-z]+\b/gu) || [])
  .map((word) => word.toUpperCase());
assert.equal(sourceWords.length, 43);

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol:symbol.toUpperCase(), value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number} */
function gp0English(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  let total = 0;
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      total += 21;
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      total += 27;
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "cannot tokenize " + normalized.slice(offset));
    total += token.value;
    offset += token.symbol.length;
  }
  return total;
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let out = 1;
  let value = ((base % modulus) + modulus) % modulus;
  let power = exponent;
  while (power > 0) {
    if (power & 1) out = out * value % modulus;
    value = value * value % modulus;
    power = Math.floor(power / 2);
  }
  return out;
}

/** @param {string} token @returns {number} */
function decode60(token) {
  const high = alphabet60.indexOf(token[0]);
  const low = alphabet60.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * 60 + low;
}

/** @param {number} address @returns {number} */
function low60(address) {
  assert.ok(Number.isInteger(address) && address >= 0 && address < p50.length);
  const low = alphabet60.indexOf(p50[address][1]);
  assert.ok(low >= 0);
  return low;
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/**
 * @param {string} text
 * @returns {{words:Array<{start:number,end:number,values:number[]}>,runes:number[]}}
 */
function parsePhysical(text) {
  const words = [];
  const runes = [];
  let current = [];
  let start = 0;

  function flush() {
    if (!current.length) return;
    words.push({start, end:start + current.length - 1, values:current.slice()});
    current = [];
  }

  for (const character of [...text]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if (character === "-" || character === ".") {
      flush();
    }
  }
  flush();
  return {words, runes};
}

/** @param {number[]} values @returns {string} */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {number} left @param {number} right @returns {number[]} */
function H(left, right) {
  return [((left - right) % 29 + 29) % 29, (left + right) % 29];
}

const state = {p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,q:4};

// Reproduce the existing source-selected p39 VERIFY output.
const p39 = parsePhysical(physicalPart(39));
const selected39 = p39.words.find((word) => word.start === 105);
assert.ok(selected39);
assert.deepEqual(selected39.values, [8,6,4,12,16]);
assert.equal(selected39.values.length, state.g);
const p39Inner = selected39.values.slice(1, -1);
assert.deepEqual(p39Inner, [state.a,state.q,state.K * state.a]);
const p39InnerGp0 = p39Inner.reduce((sum, value) => sum + value, 0);
assert.equal(p39InnerGp0, state.p - 1);
const verifyAddress = decode60(p50[p39InnerGp0]);
assert.equal(verifyAddress, 59);
assert.equal(verifyAddress, gp0English("VERIFY"));
assert.equal(sourceWords[41], "VERIFY");
assert.equal(sourceWords[42], "OPENPGP");

// Use both fields of p50[VERIFY]: low digit selects the page; full value is held out.
const verifyCell = p50[verifyAddress];
const verifyPage = low60(verifyAddress);
const verifyFull = decode60(verifyCell);
assert.equal(verifyCell, "19");
assert.equal(verifyPage, 9);
assert.equal(verifyFull, 69);

// The selected p9 word is the nearest complete g=5 word to the midpoint.
const p9 = parsePhysical(physicalPart(verifyPage));
assert.equal(p9.runes.length, 268);
const midpoint = (p9.runes.length - 1) / 2;
assert.equal(midpoint, 133.5);
const fiveRuneWords = p9.words.filter((word) => word.values.length === state.g);
const selected9 = fiveRuneWords.reduce((best, word) => {
  const distance = Math.min(
    Math.abs(word.start - midpoint),
    Math.abs(word.end - midpoint)
  );
  return !best || distance < best.distance ? {word, distance} : best;
}, null);
assert.ok(selected9);
assert.equal(selected9.word.start, 135);
assert.equal(selected9.word.end, 139);
assert.deepEqual(selected9.word.values, [25,4,0,3,16]);

const selectedIndex = p9.words.indexOf(selected9.word);
const previousWord = p9.words[selectedIndex - 1];
assert.ok(previousWord.start < midpoint && previousWord.end > midpoint);
assert.equal(previousWord.end, 134);

const predecessor = p9.runes[selected9.word.start - 1];
const successor = p9.runes[selected9.word.end + 1];
assert.equal(predecessor, state.B);
assert.equal(successor, state.B + state.K);

const predecessorPacket = [predecessor, ...selected9.word.values];
const successorPacket = [...selected9.word.values, successor];
assert.equal(predecessorPacket.reduce((sum, value) => sum + value, 0), 67);
assert.equal(successorPacket.reduce((sum, value) => sum + value, 0), verifyFull);
assert.deepEqual(successorPacket, [25,4,0,3,16,21]);
assert.equal(translit(successorPacket), "AERFOTNG");

// State-fixed K=2 split recovers authenticated signed source word positions.
const rawLeft = successorPacket.slice(0, state.K);
const rawRight = successorPacket.slice(state.K);
assert.equal(rawLeft.reduce((sum, value) => sum + value, 0), 29);
assert.equal(rawRight.reduce((sum, value) => sum + value, 0), 40);
assert.equal(sourceWords[29], "DIRECTION");
assert.equal(sourceWords[40], "PATHS");

assert.deepEqual(H(successorPacket[0], successorPacket[1]), [state.B + state.K, 0]);
assert.deepEqual(H(successorPacket[2], successorPacket[3]), [29 - state.e, state.e]);
assert.deepEqual(H(successorPacket[4], successorPacket[5]), [state.p + 1, state.A]);

const directionGp0 = gp0English(sourceWords[29]);
const pathsGp0 = gp0English(sourceWords[40]);
assert.equal(directionGp0, 112);
assert.equal(pathsGp0, 54);
const directionWalk = [directionGp0];
for (let i = 0; i < 6; i += 1) {
  directionWalk.push(low60(directionWalk.at(-1)));
}
assert.deepEqual(directionWalk, [112,13,4,37,20,42,28]);
assert.equal(low60(pathsGp0), 36);
assert.equal(low60(36), pathsGp0);

// Familywise low-page/full-checksum control over every p50 address.
const pageChecksums = new Map();
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = parsePhysical(physicalPart(page));
  if (!parsed.runes.length) continue;
  const mid = (parsed.runes.length - 1) / 2;
  const gWords = parsed.words.filter((word) => word.values.length === state.g);
  if (!gWords.length) continue;
  const nearest = gWords.reduce((best, word) => {
    const distance = Math.min(
      Math.abs(word.start - mid),
      Math.abs(word.end - mid)
    );
    return !best || distance < best.distance ? {word, distance} : best;
  }, null);
  assert.ok(nearest);
  if (!(nearest.word.start > mid)) continue;
  const boundaryAt = nearest.word.end + 1;
  if (boundaryAt >= parsed.runes.length) continue;
  const packet = [...nearest.word.values, parsed.runes[boundaryAt]];
  pageChecksums.set(page, {
    start: nearest.word.start,
    packet,
    sum: packet.reduce((sum, value) => sum + value, 0),
  });
}
assert.deepEqual([...pageChecksums.keys()], [9,14,20,28,40,54]);

const addressHits = [];
for (let address = 0; address < p50.length; address += 1) {
  const page = low60(address);
  const candidate = pageChecksums.get(page);
  if (!candidate) continue;
  if (decode60(p50[address]) === candidate.sum) {
    addressHits.push({
      address,
      token:p50[address],
      page,
      full:decode60(p50[address]),
      start:candidate.start,
    });
  }
}
assert.deepEqual(addressHits, [{
  address:59, token:"19", page:9, full:69, start:135,
}]);

const sourceHits = [];
for (let position = 0; position < sourceWords.length; position += 1) {
  const word = sourceWords[position];
  const address = gp0English(word);
  if (address >= p50.length) continue;
  const page = low60(address);
  const candidate = pageChecksums.get(page);
  if (!candidate) continue;
  if (decode60(p50[address]) === candidate.sum) {
    sourceHits.push({
      word, position, address, token:p50[address], page,
      full:decode60(p50[address]), start:candidate.start,
    });
  }
}
assert.deepEqual(sourceHits, [{
  word:"VERIFY", position:41, address:59, token:"19",
  page:9, full:69, start:135,
}]);

// Complete pre-existing 44-transform p28 family on the fixed p9 object.
const orbit = [1,3,9,27,25,19];
const transforms = [];
for (const boundaryExponent of orbit) {
  for (const wordExponent of orbit) {
    transforms.push({
      kind:"uniform",
      name:"u-" + boundaryExponent + "-" + wordExponent,
      apply(boundary, word) {
        return [
          modPow(boundary, boundaryExponent, 29),
          ...word.map((value) => modPow(value, wordExponent, 29)),
        ];
      },
    });
  }
}
for (const boundaryBase of [3,19]) {
  for (const wordBase of [3,19]) {
    for (const depthDirection of ["outer-in","inner-out"]) {
      const depths = depthDirection === "outer-in"
        ? [1,2,3,2,1]
        : [3,2,1,2,3];
      const wordExponents = depths.map((depth) =>
        modPow(wordBase, depth, 28) % 28
      );
      transforms.push({
        kind:"per-shell",
        name:"s-" + boundaryBase + "-" + wordBase + "-" + depthDirection,
        apply(boundary, word) {
          return [
            modPow(boundary, boundaryBase, 29),
            ...word.map((value, index) =>
              modPow(value, wordExponents[index], 29)
            ),
          ];
        },
      });
    }
  }
}
assert.equal(transforms.length, 44);

const transformHits = [];
for (const transform of transforms) {
  let output = transform.apply(successor, selected9.word.values);
  output = [...output.slice(1), output[0]];
  const left = output.slice(0, state.K).reduce((sum, value) => sum + value, 0);
  const right = output.slice(state.K).reduce((sum, value) => sum + value, 0);
  if (left === 29 && right === 40) {
    transformHits.push({
      name:transform.name,
      kind:transform.kind,
      output,
      latin:translit(output),
    });
  }
}
assert.deepEqual(transformHits, [
  {
    name:"u-1-1",
    kind:"uniform",
    output:[25,4,0,3,16,21],
    latin:"AERFOTNG",
  },
  {
    name:"u-3-27",
    kind:"uniform",
    output:[7,22,0,10,20,10],
    latin:"WOEFILI",
  },
]);

const exponent9Output = [
  ...selected9.word.values.map((value) => modPow(value, 9, 29)),
  modPow(successor, 3, 29),
];
assert.equal(exponent9Output.slice(0, state.K)
  .reduce((sum, value) => sum + value, 0), 29);
assert.equal(exponent9Output.slice(state.K)
  .reduce((sum, value) => sum + value, 0), 55);
assert.equal(translit(exponent9Output), "TPFNGAI");

console.log(JSON.stringify({
  status:"PASS",
  verify:{address:verifyAddress,cell:verifyCell,page:verifyPage,full:verifyFull},
  p9:{
    runeCount:p9.runes.length,
    midpoint,
    start:selected9.word.start,
    predecessor,
    successor,
    rawPacket:successorPacket,
    rawLatin:translit(successorPacket),
    rawSum:successorPacket.reduce((sum, value) => sum + value, 0),
    kSplit:[29,40],
    sourceWords:[sourceWords[29],sourceWords[40]],
    hPairs:[
      H(successorPacket[0], successorPacket[1]),
      H(successorPacket[2], successorPacket[3]),
      H(successorPacket[4], successorPacket[5]),
    ],
  },
  navigation:{
    directionGp0,
    directionWalk,
    pathsGp0,
    pathsLoop:[pathsGp0,low60(pathsGp0),low60(low60(pathsGp0))],
  },
  familywise:{
    eligiblePages:[...pageChecksums.entries()].map(([page,row]) => ({
      page,start:row.start,sum:row.sum,
    })),
    addressHits,
    sourceHits,
  },
  cubeTransfer:{
    familySize:transforms.length,
    directionPathsHits:transformHits,
    exponent9:{values:exponent9Output,latin:translit(exponent9Output),kSplit:[29,55]},
  },
}, null, 2));
