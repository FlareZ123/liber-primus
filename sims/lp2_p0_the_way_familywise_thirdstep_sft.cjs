"use strict";

/**
 * SFT for Director #1726.
 *
 * Exhausts the authenticated 2016 adjacent-word bridge over all rune-bearing
 * unknown pages, charged p50 output modes, receiver origins and source-order
 * directions. Verifies the unique endpoint80 THE/WAY pair and the frozen
 * ITS->WORDS third-step failure.
 *
 * CommonJS, Node.js 22, no third-party dependencies.
 */

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

const runeIndex = new Map(
  corpus.runes.map((rune,index) => [rune,index]));
const gpTokens = corpus.translit
  .map((symbol,value) => ({symbol,value}))
  .sort((left,right) => right.symbol.length - left.symbol.length);
const tableTokens = grid.pages.flatMap((page) => page.tokens);
const alphabet59 = grid.alphabet.replace("f","");
const parts = transcription.split(/^\s*%\s*$/m);

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total,value) => total + value,0);
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g,"CW")
    .replace(/K/g,"C")
    .replace(/V/g,"U")
    .replace(/Q/g,"C")
    .replace(/Z/g,"S");
  const out = [];
  for (let index = 0; index < normalized.length;) {
    const token = gpTokens.find((item) =>
      normalized.startsWith(item.symbol,index));
    assert.ok(token, "unmapped GP spelling: " + word);
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page,50);
  return parts[page <= 49 ? page : page - 1];
}

/**
 * @param {number} page
 * @returns {Array<{index:number,start:number,length:number,indices:number[]}>}
 */
function parsePageWords(page) {
  if (page === 50) return [];
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({
      index:words.length,
      start,
      length:current.length,
      indices:current.slice(),
    });
    current = [];
  };
  for (const char of [...physicalPart(page)]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return words;
}

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");
const message = clear.split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token));
assert.equal(message.length,43);
assert.deepEqual(
  message.slice(12,16).map((word) => word.toLowerCase()),
  ["the","way","its","words"]
);

/**
 * @param {number} address
 * @param {"base60"|"base59"|"literal"} mode
 * @returns {number|null}
 */
function decode(address,mode) {
  if (address < 0 || address >= tableTokens.length) return null;
  const token = tableTokens[address];
  if (mode === "base60") return grid.bytes[address];
  if (mode === "base59") {
    const high = alphabet59.indexOf(token[0]);
    const low = alphabet59.indexOf(token[1]);
    return high < 0 || low < 0 ? null : high * 59 + low;
  }
  return /^\d+$/u.test(token) ? Number(token) : null;
}

/**
 * @param {Array<{index:number,start:number,length:number,indices:number[]}>} words
 * @param {number} sourceIndex
 * @param {"base60"|"base59"|"literal"} mode
 * @param {"zero"|"one"} origin
 * @returns {object|null}
 */
function bridge(words,sourceIndex,mode,origin) {
  const address = sum(gp(message[sourceIndex]));
  const raw = decode(address,mode);
  if (raw === null) return null;
  const offset = raw - (origin === "one" ? 1 : 0);
  const word = words.find((item) =>
    item.start <= offset && offset < item.start + item.length);
  if (!word) return null;
  const receiverGp0 = sum(word.indices);
  if (receiverGp0 >= tableTokens.length) return null;
  const rawNext = decode(receiverGp0,mode);
  if (rawNext === null) return null;
  return {
    sourceIndex,
    address,
    raw,
    offset,
    word,
    receiverGp0,
    rawNext,
    next:rawNext - (origin === "one" ? 1 : 0),
  };
}

const family = [];
for (const mode of ["base60","base59","literal"]) {
  for (const origin of ["zero","one"]) {
    for (const order of ["forward","reverse"]) {
      let firstHopHits = 0;
      let endpoint80Hits = 0;
      let threeWordContinuations = 0;
      const endpointHits = [];

      for (let page = 0; page <= 55; page += 1) {
        if (page === 50) continue;
        const words = parsePageWords(page);
        for (let index = 0; index < message.length - 1; index += 1) {
          const firstIndex = order === "forward" ? index : index + 1;
          const secondIndex = order === "forward" ? index + 1 : index;
          const first = bridge(words,firstIndex,mode,origin);
          if (!first || first.next !== secondIndex) continue;
          firstHopHits += 1;

          const second = bridge(words,secondIndex,mode,origin);
          if (second && second.next === 80) {
            endpoint80Hits += 1;
            endpointHits.push({
              page,
              index,
              from:message[firstIndex].toLowerCase(),
              to:message[secondIndex].toLowerCase(),
              firstOffset:first.offset,
              secondOffset:second.offset,
            });
          }

          const thirdIndex = order === "forward"
            ? index + 2
            : index - 1;
          if (
            thirdIndex >= 0 &&
            thirdIndex < message.length &&
            second &&
            second.next === thirdIndex
          ) {
            threeWordContinuations += 1;
          }
        }
      }

      family.push({
        mode,origin,order,
        firstHopHits,
        endpoint80Hits,
        threeWordContinuations,
        endpointHits,
      });
    }
  }
}

assert.deepEqual(
  family.map((row) => [
    row.mode,row.origin,row.order,
    row.firstHopHits,row.endpoint80Hits,row.threeWordContinuations,
  ]),
  [
    ["base60","zero","forward",10,1,0],
    ["base60","zero","reverse",6,0,0],
    ["base60","one","forward",4,0,0],
    ["base60","one","reverse",9,0,0],
    ["base59","zero","forward",8,0,0],
    ["base59","zero","reverse",4,0,0],
    ["base59","one","forward",7,0,0],
    ["base59","one","reverse",7,0,0],
    ["literal","zero","forward",0,0,0],
    ["literal","zero","reverse",0,0,0],
    ["literal","one","forward",1,0,0],
    ["literal","one","reverse",1,0,0],
  ]
);

const winningFamily = family.find((row) =>
  row.mode === "base60" &&
  row.origin === "zero" &&
  row.order === "forward");
assert.deepEqual(winningFamily.endpointHits,[{
  page:0,
  index:12,
  from:"the",
  to:"way",
  firstOffset:102,
  secondOffset:118,
}]);
assert.equal(
  family.reduce((sum,row) => sum + row.endpoint80Hits,0),
  1
);
assert.equal(
  family.reduce((sum,row) => sum + row.threeWordContinuations,0),
  0
);

// Exact winning pair.
const p0 = parsePageWords(0);
const the = bridge(p0,12,"base60","zero");
const way = bridge(p0,13,"base60","zero");
assert.ok(the && way);
assert.deepEqual(
  {
    gp0:sum(gp("THE")),
    offset:the.offset,
    receiver:[the.word.start,the.word.start + the.word.length - 1],
    receiverGp0:the.receiverGp0,
    next:the.next,
  },
  {gp0:20,offset:102,receiver:[95,102],receiverGp0:139,next:13}
);
assert.deepEqual(
  {
    gp0:sum(gp("WAY")),
    offset:way.offset,
    receiver:[way.word.start,way.word.start + way.word.length - 1],
    receiverGp0:way.receiverGp0,
    next:way.next,
  },
  {gp0:57,offset:118,receiver:[117,121],receiverGp0:37,next:80}
);

// Frozen untouched third step.
const its = bridge(p0,14,"base60","zero");
assert.ok(its);
assert.deepEqual(
  {
    gp0:sum(gp("ITS")),
    offset:its.offset,
    receiver:[its.word.start,its.word.start + its.word.length - 1],
    receiverGp0:its.receiverGp0,
    actualNext:its.next,
    requiredNext:15,
  },
  {
    gp0:41,
    offset:84,
    receiver:[83,89],
    receiverGp0:78,
    actualNext:46,
    requiredNext:15,
  }
);
assert.notEqual(its.next,15);

const wordsStep = bridge(p0,15,"base60","zero");
assert.ok(wordsStep);
assert.equal(wordsStep.offset,86);
assert.equal(wordsStep.receiverGp0,78);
assert.equal(wordsStep.next,46);

console.log(JSON.stringify({
  status:"PASS",
  family,
  winningPair:{
    source:["THE","WAY"],
    sourceIndices:[12,13],
    endpoint:80,
  },
  frozenThirdStep:{
    source:"ITS",
    requiredFollowingSource:"WORDS",
    requiredIndex:15,
    actualNext:its.next,
    receiverOffset:its.offset,
    receiverGp0:its.receiverGp0,
    passes:false,
  },
  decision:
    "THE/WAY is the sole charged endpoint80 adjacency, but every charged semantics has zero three-word source continuations and the frozen ITS->WORDS prediction fails. Preserve the pair as a local graph relation, not authentication of a reusable p50 numeral-to-LP2-offset grammar.",
}, null, 2));
