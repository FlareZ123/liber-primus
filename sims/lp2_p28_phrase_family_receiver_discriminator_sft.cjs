"use strict";

/**
 * SFT for Director #1721.
 *
 * Rebuilds the complete #1705 phrase-producing transform family and routes
 * every finite-register parse through the exact #1706 pre-DH receiver grammar.
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
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(
  corpus.runes.map((rune,index) => [rune,index]));
const runeSet = new Set(corpus.runes);
const cubeOrbit = [1,3,9,27,25,19];

/** @param {number} base @param {number} exponent @returns {number} */
function modPow(base, exponent) {
  let out = 1;
  let value = ((base % 29) + 29) % 29;
  let power = exponent;
  while (power > 0) {
    if (power & 1) out = out * value % 29;
    value = value * value % 29;
    power = Math.floor(power / 2);
  }
  return out;
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/**
 * @param {string} text
 * @returns {{words:Array<{start:number,values:number[]}>,runes:number[]}}
 */
function parsePage(text) {
  const words = [];
  const runes = [];
  let current = [];
  let start = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({start,values:current.slice()});
    current = [];
  };
  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return {words,runes};
}

/** @param {number[]} values @returns {string} */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

let dictionaryWords = read("resources/control/english_wordfreq_textblob.txt")
  .toLowerCase().split(/\s+/u).filter(Boolean);
for (const relative of [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt",
]) {
  dictionaryWords.push(...(
    read(relative).toLowerCase().match(/[a-z]+/gu) || []
  ));
}
const lexicon = new Set(dictionaryWords.filter((word) =>
  /^[a-z]+$/u.test(word) && word.length >= 3));

/** @param {string} latin @returns {string[][]} */
function parses(latin) {
  const out = [];
  if (lexicon.has(latin)) out.push([latin]);
  for (let cut = 3; cut <= latin.length - 3; cut += 1) {
    const left = latin.slice(0,cut);
    const right = latin.slice(cut);
    if (lexicon.has(left) && lexicon.has(right)) {
      out.push([left,right]);
    }
  }
  return out;
}

const transforms = [];
for (const boundaryExponent of cubeOrbit) {
  for (const wordExponent of cubeOrbit) {
    transforms.push({
      name:`u-${boundaryExponent}-${wordExponent}`,
      apply(boundary,word) {
        return [
          modPow(boundary,boundaryExponent),
          ...word.map((value) => modPow(value,wordExponent)),
        ];
      },
    });
  }
}
for (const boundaryBase of [3,19]) {
  for (const wordBase of [3,19]) {
    for (const direction of ["outer-in","inner-out"]) {
      const depths = direction === "outer-in"
        ? [1,2,3,2,1]
        : [3,2,1,2,3];
      const exponents = depths.map((depth) =>
        modPow(wordBase,depth) % 28);
      transforms.push({
        name:`s-${boundaryBase}-${wordBase}-${direction}`,
        apply(boundary,word) {
          return [
            modPow(boundary,boundaryBase),
            ...word.map((value,index) =>
              modPow(value,exponents[index])),
          ];
        },
      });
    }
  }
}
assert.equal(transforms.length, 44);

/**
 * @param {number[]} runes
 * @param {{start:number,values:number[]}} word
 * @param {"predecessor"|"successor"} side
 * @returns {number|null}
 */
function boundaryRune(runes,word,side) {
  if (side === "predecessor") {
    return word.start > 0 ? runes[word.start - 1] : null;
  }
  const at = word.start + word.values.length;
  return at < runes.length ? runes[at] : null;
}

const phraseTrials = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = parsePage(physicalPart(page));
  for (let wordIndex = 0; wordIndex < parsed.words.length; wordIndex += 1) {
    const word = parsed.words[wordIndex];
    if (word.values.length !== 5) continue;
    for (const side of ["predecessor","successor"]) {
      const boundary = boundaryRune(parsed.runes,word,side);
      if (boundary === null) continue;
      for (const transform of transforms) {
        for (const orientation of ["forward","reverse"]) {
          let output = transform.apply(boundary,word.values);
          if (side === "successor") {
            output = [...output.slice(1),output[0]];
          }
          if (orientation === "reverse") output = output.slice().reverse();
          const latin = translit(output).toLowerCase();
          const candidates = parses(latin);
          if (candidates.length) {
            phraseTrials.push({
              page,
              word:wordIndex + 1,
              side,
              transform:transform.name,
              orientation,
              latin,
              parses:candidates,
            });
          }
        }
      }
    }
  }
}
assert.equal(phraseTrials.length, 75);
assert.equal(
  phraseTrials.reduce((sum,trial) => sum + trial.parses.length,0),
  79
);

// Frozen #1706 matched receiver family.
const matched = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = parsePage(physicalPart(page));
  for (let first = 0; first < parsed.words.length; first += 1) {
    for (let last = first; last < parsed.words.length; last += 1) {
      const start = parsed.words[first].start;
      const end = parsed.words[last].start +
        parsed.words[last].values.length - 1;
      const length = end - start + 1;
      if (length > 23) break;
      if (length === 23 && parsed.runes[start + 11] === 0) {
        matched.push({page,start,end,center:start + 11});
      }
    }
  }
}
assert.equal(matched.length, 23);

const gpTokens = corpus.translit
  .map((token,index) => [token,index])
  .sort((left,right) => right[0].length - left[0].length);

/** @param {string} word @returns {number[]|null} */
function encodeLatin(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g,"CW")
    .replace(/V/g,"U")
    .replace(/[KQ]/g,"C")
    .replace(/Z/g,"S");
  const out = [];
  for (let position = 0; position < normalized.length;) {
    const row = gpTokens.find(([token]) =>
      normalized.startsWith(token,position));
    if (!row) return null;
    out.push(row[1]);
    position += row[0].length;
  }
  return out;
}

/** @param {string} word @returns {number|null} */
function gp0(word) {
  const encoded = encodeLatin(word);
  return encoded === null
    ? null
    : encoded.reduce((sum,value) => sum + value,0);
}

const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet59 = grid.alphabet.replace("f","");

/** @param {string} token @returns {number|null} */
function decode59(token) {
  const high = alphabet59.indexOf(token[0]);
  const low = alphabet59.indexOf(token[1]);
  return high < 0 || low < 0 ? null : high * 59 + low;
}

/**
 * @param {number} address
 * @param {"base60"|"base59"|"literal"} mode
 * @returns {number|null}
 */
function decode(address,mode) {
  if (address < 0 || address >= tokens.length) return null;
  const token = tokens[address];
  if (mode === "base60") return grid.bytes[address];
  if (mode === "base59") return decode59(token);
  return /^\d+$/u.test(token) ? Number(token) : null;
}

const routed = [];
for (const trial of phraseTrials) {
  for (const words of trial.parses) {
    const sums = words.map(gp0);
    if (sums.some((value) => value === null)) continue;
    const wholeAddress = sums.reduce((sum,value) => sum + value,0);
    const outcomes = [];

    for (const mode of ["base60","base59","literal"]) {
      for (const origin of ["zero","one"]) {
        const adjust = (value) =>
          value === null ? null : value - (origin === "one" ? 1 : 0);
        const wholeValue = adjust(decode(wholeAddress,mode));
        const wholeHits = wholeValue === null
          ? []
          : matched.filter((item) => item.center === wholeValue);
        const splitHits = [];

        if (words.length === 2) {
          const values = sums.map((address) =>
            adjust(decode(address,mode)));
          if (values.every((value) => value !== null)) {
            for (const order of ["source","reverse"]) {
              const ordered = order === "source"
                ? values
                : values.slice().reverse();
              const low = Math.min(...ordered);
              const high = Math.max(...ordered);
              for (const leftOpen of [false,true]) {
                for (const rightOpen of [false,true]) {
                  const start = low + (leftOpen ? 1 : 0);
                  const end = high - (rightOpen ? 1 : 0);
                  for (const hit of matched.filter((item) =>
                    item.start === start && item.end === end)) {
                    splitHits.push({
                      order,leftOpen,rightOpen,interval:[start,end],hit,
                    });
                  }
                }
              }
            }
          }
        }

        const joint = [];
        for (const whole of wholeHits) {
          for (const split of splitHits) {
            if (
              whole.page === split.hit.page &&
              (whole.start !== split.hit.start || whole.end !== split.hit.end)
            ) {
              joint.push({whole,split});
            }
          }
        }

        if (wholeHits.length || splitHits.length) {
          outcomes.push({mode,origin,wholeHits,splitHits,joint});
        }
      }
    }

    if (outcomes.length) {
      routed.push({
        trial,
        words,
        sums,
        wholeAddress,
        outcomes,
      });
    }
  }
}

assert.equal(routed.length, 24);
const jointWinners = routed.filter((row) =>
  row.outcomes.some((outcome) => outcome.joint.length));
assert.equal(jointWinners.length, 1);

const winner = jointWinners[0];
assert.deepEqual(
  {
    page:winner.trial.page,
    word:winner.trial.word,
    side:winner.trial.side,
    transform:winner.trial.transform,
    orientation:winner.trial.orientation,
    latin:winner.trial.latin,
    words:winner.words,
    sums:winner.sums,
    whole:winner.wholeAddress,
  },
  {
    page:28,
    word:28,
    side:"predecessor",
    transform:"u-3-27",
    orientation:"forward",
    latin:"readout",
    words:["read","out"],
    sums:[55,20],
    whole:75,
  }
);

const winningOutcome = winner.outcomes.find((row) =>
  row.joint.length);
assert.equal(winningOutcome.mode,"base60");
assert.equal(winningOutcome.origin,"zero");
assert.deepEqual(winningOutcome.wholeHits, [{
  page:0,start:166,end:188,center:177,
}]);
assert.deepEqual(
  [...new Set(winningOutcome.splitHits.map((row) =>
    JSON.stringify(row.interval)))].map(JSON.parse),
  [[80,102]]
);

// Named source-object/frozen-transform rivals have no receiver hit at all.
for (const rival of [
  ["lungdear",42,55,97],
  ["woefili",29,40,69],
]) {
  const [latin] = rival;
  assert.equal(routed.some((row) => row.trial.latin === latin), false);
}

console.log(JSON.stringify({
  status:"PASS",
  family:{
    phraseProducingTrials:phraseTrials.length,
    finiteRegisterParses:79,
    matchedReceiverIntervals:matched.length,
    parsesWithAnyGeometryHit:routed.length,
    jointWholeSplitSamePageWinners:jointWinners.length,
  },
  winner:{
    page:winner.trial.page,
    word:winner.trial.word,
    side:winner.trial.side,
    transform:winner.trial.transform,
    orientation:winner.trial.orientation,
    plaintext:winner.words.join(" ").toUpperCase(),
    gp0Words:winner.sums,
    gp0Whole:winner.wholeAddress,
    mode:winningOutcome.mode,
    origin:winningOutcome.origin,
    wholeReceiver:winningOutcome.wholeHits[0],
    splitReceiver:[80,102],
  },
  decision:
    "Across every phrase hit in the complete #1705 family, READ OUT alone produces the #1706 joint whole/split receiver geometry under shared base60 zero-offset semantics. DH/state content is not used for selection.",
}, null, 2));
