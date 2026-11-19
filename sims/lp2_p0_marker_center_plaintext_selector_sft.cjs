"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const MOD = 29;

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % MOD) + MOD) % MOD;
}

/** @param {number[]} values @returns {number[]} */
function hOutsideIn(values) {
  const out = [];
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    out.push(mod29(values[left] - values[right]), mod29(values[left] + values[right]));
  }
  if (values.length % 2 === 1) out.push(values[(values.length - 1) / 2]);
  return out;
}

/** @param {number[]} values @returns {number[]} */
function hInverse(values) {
  const out = new Array(values.length);
  const inverse2 = 15;
  for (let index = 0; index < Math.floor(values.length / 2); index += 1) {
    const difference = values[index * 2];
    const sum = values[index * 2 + 1];
    out[index] = mod29((sum + difference) * inverse2);
    out[values.length - 1 - index] = mod29((sum - difference) * inverse2);
  }
  if (values.length % 2 === 1) out[Math.floor(values.length / 2)] = values.at(-1);
  return out;
}

/** @param {number} n @param {number} base @returns {number[]} */
function digits(n, base) {
  const out = [];
  let value = n;
  while (value > 0) {
    out.push(value % base);
    value = Math.floor(value / base);
  }
  return out.reverse();
}

/** @param {string} text @returns {number[][][]} */
function parseSquares(text) {
  return text.trim().split(/\r?\n\s*\r?\n/).map((block) =>
    block.split(/\r?\n/).map((line) => line.trim().split(/\s+/).map(Number))
  );
}

/** @param {number[][]} square @returns {number} */
function center(square) {
  const middle = Math.floor(square.length / 2);
  return square[middle][middle];
}

/** @param {number[][]} square @returns {number} */
function magicSum(square) {
  return square[0].reduce((total, value) => total + value, 0);
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const annotations = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const squares = parseSquares(read("resources/cicada2014-openpuff-magic-squares.txt"));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let offset = 0; offset < normalized.length;) {
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}

/** @param {string} source @returns {number[][]} */
function runeWords(source) {
  const words = [];
  let current = [];
  for (const character of [...source]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

// Recover q,A,B from authenticated square metadata only.
assert.equal(squares.length, 3);
const meta = squares.map((square) => ({
  order: square.length,
  sum: magicSum(square),
  center: center(square),
}));
assert.deepEqual(meta.map((row) => [row.order,row.sum,row.center]), [
  [5,3301,809],
  [7,1033,331],
  [5,1033,91],
]);
const equal1033 = meta.filter((row) => row.sum === 1033).sort((a,b) => a.order - b.order);
const smallDigits = digits(equal1033[0].center, MOD);
const largeDigits = digits(equal1033[1].center, MOD);
const e = smallDigits[0];
const q = smallDigits[1];
const A = largeDigits[0] - smallDigits[0];
const sumDigits = digits(1033, MOD);
const B = mod29(A - sumDigits[2]);
assert.deepEqual({e,q,A,B}, {e:3,q:4,A:8,B:19});
const g = equal1033[0].order;
const K = equal1033[1].order - equal1033[0].order;
const a = sumDigits[1];
const aMinusB = sumDigits[2];
const firstCenterDigits = digits(meta[0].center, MOD);
const firstSumDigits = digits(meta[0].sum, MOD);
assert.deepEqual(firstCenterDigits, [mod29(-K), mod29(-e)]);
assert.deepEqual(firstSumDigits, [e, mod29(-e), mod29(-g)]);
const squareMetadataAlphabet = [...new Set([
  K,e,q,g,a,A,aMinusB,B,
  ...firstCenterDigits,
  ...firstSumDigits,
])].sort((left,right)=>left-right);
assert.deepEqual(squareMetadataAlphabet, [2,3,4,5,6,8,18,19,24,26,27]);
const markerCenter = [q,A,B,A,q];
const u = q - e;
const t = g + K;
const w = A + g;

/** @param {number} seed @param {number[]} rises @returns {number[]} */
function cumulative(seed, rises) {
  const out = [mod29(seed)];
  let value = mod29(seed);
  for (const rise of rises) {
    value = mod29(value + rise);
    out.push(value);
  }
  return out;
}

const stateOnlyColumns = {
  left: cumulative(-q, [q-u, w-u, w+u]),
  center: cumulative(q, [q, q+t, q+2*t, q+3*t]),
  right: cumulative(t, [t-u, t, t+u]),
};
assert.deepEqual(stateOnlyColumns, {
  left:[25,28,11,25],
  center:[4,8,19,8,4],
  right:[7,13,20,28],
});

// Direct source-visible transcription of the standard 13-dot glyph geometry.
// Nine horizontal levels alternate singleton/pair populations; columns are 4|5|4.
const markerGeometry = {
  singletonRow:1,
  pairedRow:2,
  sideColumn:4,
  centerColumn:5,
  totalDots:13,
};
const geometryParameters = {
  u:markerGeometry.singletonRow,
  K:markerGeometry.pairedRow,
  q:markerGeometry.sideColumn,
  g:markerGeometry.centerColumn,
  w:markerGeometry.totalDots,
};
geometryParameters.t = geometryParameters.g + geometryParameters.K;
assert.deepEqual(geometryParameters, {u:1,K:2,q:4,g:5,w:13,t:7});
const geometryColumns = {
  left:cumulative(-geometryParameters.q, [
    geometryParameters.q-geometryParameters.u,
    geometryParameters.w-geometryParameters.u,
    geometryParameters.w+geometryParameters.u,
  ]),
  center:cumulative(geometryParameters.q, [
    geometryParameters.q,
    geometryParameters.q+geometryParameters.t,
    geometryParameters.q+2*geometryParameters.t,
    geometryParameters.q+3*geometryParameters.t,
  ]),
  right:cumulative(geometryParameters.t, [
    geometryParameters.t-geometryParameters.u,
    geometryParameters.t,
    geometryParameters.t+geometryParameters.u,
  ]),
};
assert.deepEqual(geometryColumns, stateOnlyColumns);
const geometryKey = hOutsideIn([
  ...geometryColumns.left,
  ...geometryColumns.center,
  ...geometryColumns.right,
]);
assert.deepEqual(geometryKey, [26,24,8,19,27,24,18,3,0,8,0,16,19]);

// Charge the exact frozen rise-grammar shape while varying which visible
// geometry number occupies each of its four roles.
// Q drives left seed/first rise and center seed; B is the left symmetric center;
// S is the shared +/- unit; T is the center step and right symmetric center.
const geometryValues = [...new Set(Object.values(geometryParameters))];
assert.deepEqual(geometryValues.sort((a,b)=>a-b), [1,2,4,5,7,13]);
const riseRoleRivals = [];

// Build the manuscript's complete adjacent page-local 8+5 receiver family.
const parts = transcription.split(/^\s*%\s*$/m).slice(0,55);
const pages = parts.map((_, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  words: [],
  offset: 0,
}));
let current = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;
function flushWord() {
  if (!current.length) return;
  if (startSegment === endSegment) {
    const page = pages[startSegment];
    page.words.push({
      ordinal: page.words.length + 1,
      start: startOffset,
      values: current.slice(),
    });
  }
  current = [];
}
for (let segment = 0; segment < parts.length; segment += 1) {
  for (const character of [...parts[segment]]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      if (!current.length) {
        startSegment = segment;
        startOffset = pages[segment].offset;
      }
      endSegment = segment;
      current.push(value);
      pages[segment].offset += 1;
    } else if (character !== "/" && !/\s/u.test(character)) {
      flushWord();
    }
  }
}
flushWord();

const receivers = [];
for (const page of pages) {
  for (let index = 0; index + 1 < page.words.length; index += 1) {
    const first = page.words[index];
    const second = page.words[index + 1];
    if (first.values.length === 8 && second.values.length === 5) {
      receivers.push({
        page: page.page,
        ordinal: first.ordinal,
        start: first.start,
        cipher: first.values.concat(second.values),
      });
    }
  }
}
assert.equal(receivers.length, 19);

// Build a pinned solved/authenticated native-GP lexical control.
const lexicon = new Map();
for (const section of solved.sections) {
  for (const values of runeWords(section.source_text)) {
    const label = values.map((value) => corpus.translit[value]).join("");
    lexicon.set(values.join(","), {label,values,source:"solved"});
  }
}
const clear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");
const sourceWords = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());
assert.equal(sourceWords.length, 43);
for (const label of sourceWords) {
  const values = gp(label);
  lexicon.set(values.join(","), {label,values,source:"signed2016"});
}

const words = [...lexicon.values()];
const length8 = words.filter((word) => word.values.length === 8);
const length5 = words.filter((word) => word.values.length === 5);
assert.equal(length8.length, 18);
assert.equal(length5.length, 38);

const p0Receiver = receivers.find((row) => row.page === 0 && row.ordinal === 1);
assert.ok(p0Receiver);

// Re-evaluate the finite rise-role family now that the receiver and lexicon exist.
riseRoleRivals.length = 0;
for (const Q of geometryValues) {
  for (const Bv of geometryValues) {
    for (const S of geometryValues) {
      for (const T of geometryValues) {
        const columns = {
          left:cumulative(-Q,[Q-S,Bv-S,Bv+S]),
          center:cumulative(Q,[Q,Q+T,Q+2*T,Q+3*T]),
          right:cumulative(T,[T-S,T,T+S]),
        };
        const packet=[...columns.left,...columns.center,...columns.right];
        const key=hOutsideIn(packet);
        for (const sign of [-1,1]) {
          const plain=p0Receiver.cipher.map((value,index)=>mod29(value+sign*key[index]));
          const leftWord=length8.find((candidate)=>
            candidate.values.join(",")===plain.slice(0,8).join(","));
          const rightWord=length5.find((candidate)=>
            candidate.values.join(",")===plain.slice(8).join(","));
          if (leftWord && rightWord) riseRoleRivals.push({
            Q,B:Bv,S,T,sign,packet,key,
            lexicalPair:[leftWord.label,rightWord.label],
          });
        }
      }
    }
  }
}
assert.equal(geometryValues.length ** 4 * 2, 2592);
const p0SecondCipher = p0Receiver.cipher.slice(8);
const metadataFields = {g,K,e,q,A,a,B};
const metadataFieldEntries = Object.entries(metadataFields);
const fullStateFields = {p,g,a,b,A,B,K,e,q};
const fullStateFieldEntries = Object.entries(fullStateFields);

/**
 * @param {Array<[string,number]>} fieldEntries
 * @returns {Array<object>}
 */
function palindromeDecryptionsFor(fieldEntries) {
  const out = [];
  for (const [xName,x] of fieldEntries) {
    for (const [yName,y] of fieldEntries) {
      for (const [zName,z] of fieldEntries) {
        const center = [x,y,z,y,x];
        const key = hOutsideIn(center);
        const plain = p0SecondCipher.map((value,index) => mod29(value - key[index]));
        const word = length5.find((candidate) =>
          candidate.values.join(",") === plain.join(",")
        );
        if (word) {
          out.push({
            fields:[xName,yName,zName],
            center,
            key,
            word:word.label,
            source:word.source,
          });
        }
      }
    }
  }
  return out;
}

const palindromeDecryptions = palindromeDecryptionsFor(metadataFieldEntries);
const fullStatePalindromeDecryptions = palindromeDecryptionsFor(fullStateFieldEntries);

/** @param {Array<[string,number]>} fieldEntries @returns {Array<object>} */
function palindromeAdditiveDecryptionsFor(fieldEntries) {
  const out = [];
  for (const [xName,x] of fieldEntries) {
    for (const [yName,y] of fieldEntries) {
      for (const [zName,z] of fieldEntries) {
        const center = [x,y,z,y,x];
        const key = hOutsideIn(center);
        const plain = p0SecondCipher.map((value,index) => mod29(value + key[index]));
        const word = length5.find((candidate) =>
          candidate.values.join(",") === plain.join(",")
        );
        if (word) out.push({
          fields:[xName,yName,zName], center, key,
          word:word.label, source:word.source,
        });
      }
    }
  }
  return out;
}
const palindromeAdditiveDecryptions =
  palindromeAdditiveDecryptionsFor(metadataFieldEntries);
const fullStatePalindromeAdditiveDecryptions =
  palindromeAdditiveDecryptionsFor(fullStateFieldEntries);

const exactRed13MarkerReceivers = [];
let red13MarkerCount = 0;
for (const pageAnnotation of annotations.pages) {
  for (const [offset,dots,color] of pageAnnotation.large_punctuation || []) {
    if (dots !== 13 || color !== "red") continue;
    red13MarkerCount += 1;
    for (const span of pageAnnotation.red_spans || []) {
      if (span.start + span.length === offset && span.length === 13) {
        exactRed13MarkerReceivers.push({
          page:pageAnnotation.page,
          start:span.start,
          length:span.length,
          markerOffset:offset,
        });
      }
    }
  }
}
assert.equal(red13MarkerCount,30);
assert.deepEqual(exactRed13MarkerReceivers, [{
  page:0,start:0,length:13,markerOffset:13,
}]);

const centerKey = hOutsideIn(markerCenter);
assert.deepEqual(centerKey, [0,8,0,16,19]);
const fiveLexicon = new Map(length5.map((word) => [word.values.join(","), word]));
const centerKeyMarkerTransfers = [];
const centerKeyMarkerAddTransfers = [];
let centerKeyMarkerWindows = 0;
for (const pageAnnotation of annotations.pages) {
  const page = corpus.pages.find((candidate) => candidate.page === pageAnnotation.page);
  assert.ok(page);
  for (const marker of pageAnnotation.large_punctuation || []) {
    if (marker[1] !== 13 || marker[2] !== "red") continue;
    for (const side of ["pre","post"]) {
      const start = side === "pre" ? marker[0] - 5 : marker[0];
      if (start < 0 || start + 5 > page.indices.length) continue;
      centerKeyMarkerWindows += 1;
      const cipher = page.indices.slice(start,start+5);
      const plain = cipher.map((value,index) => mod29(value - centerKey[index]));
      const word = fiveLexicon.get(plain.join(","));
      if (word) {
        centerKeyMarkerTransfers.push({
          page:page.page,
          markerOffset:marker[0],
          side,
          start,
          cipher,
          plain,
          word:word.label,
          source:word.source,
        });
      }
      const addPlain = cipher.map((value,index) => mod29(value + centerKey[index]));
      const addWord = fiveLexicon.get(addPlain.join(","));
      if (addWord) {
        centerKeyMarkerAddTransfers.push({
          page:page.page,
          markerOffset:marker[0],
          side,
          start,
          cipher,
          plain:addPlain,
          word:addWord.label,
          source:addWord.source,
        });
      }
    }
  }
}

const hits = [];
for (const receiver of receivers) {
  for (const left of length8) {
    for (const right of length5) {
      const plain = left.values.concat(right.values);
      const residual = receiver.cipher.map((value,index) => mod29(value - plain[index]));
      const inverse = hInverse(residual);
      if (inverse.slice(4,9).join(",") !== markerCenter.join(",")) continue;
      hits.push({
        page:receiver.page,
        ordinal:receiver.ordinal,
        start:receiver.start,
        words:[left.label,right.label],
        sources:[left.source,right.source],
        inverse,
        residual,
      });
    }
  }
}

const columnNames = ["left","center","right"];
const columnOrders = [
  ["left","center","right"], ["left","right","center"],
  ["center","left","right"], ["center","right","left"],
  ["right","left","center"], ["right","center","left"],
];
const columnTraversalControls = [];
for (const order of columnOrders) {
  for (let reverseMask = 0; reverseMask < 8; reverseMask += 1) {
    const packet = [];
    for (let columnIndex = 0; columnIndex < order.length; columnIndex += 1) {
      const values = stateOnlyColumns[order[columnIndex]].slice();
      if (reverseMask & (1 << columnIndex)) values.reverse();
      packet.push(...values);
    }
    const key = hOutsideIn(packet);
    const plain = p0Receiver.cipher.map((value,index) => mod29(value-key[index]));
    const leftWord = length8.find((candidate) =>
      candidate.values.join(",") === plain.slice(0,8).join(",")
    );
    const rightWord = length5.find((candidate) =>
      candidate.values.join(",") === plain.slice(8).join(",")
    );
    columnTraversalControls.push({
      order,
      reverseMask,
      packet,
      key,
      lexicalPair:leftWord && rightWord ? [leftWord.label,rightWord.label] : null,
    });
  }
}
assert.equal(columnTraversalControls.length, 48);
const columnAdditiveRivalHits = columnTraversalControls
  .map((row) => {
    const plain = p0Receiver.cipher.map((value,index) => mod29(value + row.key[index]));
    const leftWord = length8.find((candidate) =>
      candidate.values.join(",") === plain.slice(0,8).join(",")
    );
    const rightWord = length5.find((candidate) =>
      candidate.values.join(",") === plain.slice(8).join(",")
    );
    return {
      order:row.order,
      reverseMask:row.reverseMask,
      lexicalPair:leftWord && rightWord ? [leftWord.label,rightWord.label] : null,
    };
  })
  .filter((row) => row.lexicalPair);

const markerRowsTopDown = [
  ["center",0],
  ["pair",0],
  ["center",1],
  ["pair",1],
  ["center",2],
  ["pair",2],
  ["center",3],
  ["pair",3],
  ["center",4],
];
const rowTraversalControls = [];
for (let pairSwapMask = 0; pairSwapMask < 16; pairSwapMask += 1) {
  for (const bottomUp of [false,true]) {
    const rows = bottomUp ? markerRowsTopDown.slice().reverse() : markerRowsTopDown;
    const packet = [];
    for (const [kind,index] of rows) {
      if (kind === "center") {
        packet.push(stateOnlyColumns.center[index]);
      } else {
        const pair = [
          stateOnlyColumns.left[index],
          stateOnlyColumns.right[index],
        ];
        if (pairSwapMask & (1 << index)) pair.reverse();
        packet.push(...pair);
      }
    }
    assert.equal(packet.length,13);
    const key = hOutsideIn(packet);
    const plain = p0Receiver.cipher.map((value,index) => mod29(value-key[index]));
    const leftWord = length8.find((candidate) =>
      candidate.values.join(",") === plain.slice(0,8).join(",")
    );
    const rightWord = length5.find((candidate) =>
      candidate.values.join(",") === plain.slice(8).join(",")
    );
    rowTraversalControls.push({
      pairSwapMask,
      bottomUp,
      packet,
      lexicalPair:leftWord && rightWord ? [leftWord.label,rightWord.label] : null,
    });
  }
}
assert.equal(rowTraversalControls.length,32);
const rowAdditiveRivalHits = rowTraversalControls
  .map((row) => {
    const key = hOutsideIn(row.packet);
    const plain = p0Receiver.cipher.map((value,index) => mod29(value + key[index]));
    const leftWord = length8.find((candidate) =>
      candidate.values.join(",") === plain.slice(0,8).join(",")
    );
    const rightWord = length5.find((candidate) =>
      candidate.values.join(",") === plain.slice(8).join(",")
    );
    return {
      pairSwapMask:row.pairSwapMask,
      bottomUp:row.bottomUp,
      lexicalPair:leftWord && rightWord ? [leftWord.label,rightWord.label] : null,
    };
  })
  .filter((row) => row.lexicalPair);

const p0Hits = hits.filter((row) => row.page === 0 && row.ordinal === 1);
const squareTypedHits = hits.filter((row) =>
  row.residual.slice(0,8).every((value) => squareMetadataAlphabet.includes(value))
);
const signedAdjacentHits = hits.filter((row) => {
  for (let index = 0; index + 1 < sourceWords.length; index += 1) {
    if (sourceWords[index] === row.words[0] && sourceWords[index+1] === row.words[1]) return true;
  }
  return false;
});

console.log(JSON.stringify({
  status:"PASS",
  independentSquareState:{e,q,A,B,markerCenter,squareMetadataAlphabet},
  markerGeometry,
  geometryParameters,
  geometryKey,
  riseRoleRivalHits:riseRoleRivals,
  sourceVisibleReceiverGate:{red13MarkerCount,exactRed13MarkerReceivers},
  palindromeDecryptions,
  palindromeAdditiveDecryptions,
  fullStatePalindromeDecryptions,
  fullStatePalindromeAdditiveDecryptions,
  centerKeyMarkerTransfers,
  centerKeyMarkerAddTransfers,
  columnTraversalHits:columnTraversalControls.filter((row) => row.lexicalPair),
  columnAdditiveRivalHits,
  rowTraversalHits:rowTraversalControls.filter((row) => row.lexicalPair),
  rowAdditiveRivalHits,
  family:{
    rowTraversalControls:rowTraversalControls.length,
    centerKeyMarkerWindows,
    palindromeAssignments:metadataFieldEntries.length ** 3,
    fullStatePalindromeAssignments:fullStateFieldEntries.length ** 3,
    receivers:receivers.length,
    length8:length8.length,
    length5:length5.length,
    candidates:receivers.length * length8.length * length5.length,
  },
  hits,
  p0Hits,
  squareTypedHits,
  signedAdjacentHits,
}, null, 2));
