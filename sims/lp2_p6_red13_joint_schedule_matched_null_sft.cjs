"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} x @returns {number} */
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number[][]} */
function permutations(values) {
  const out = [];
  /** @param {number[]} prefix @param {number[]} rest */
  function visit(prefix, rest) {
    if (!rest.length) {
      out.push(prefix);
      return;
    }
    for (let i = 0; i < rest.length; i += 1) {
      visit(
        prefix.concat(rest[i]),
        rest.slice(0, i).concat(rest.slice(i + 1))
      );
    }
  }
  visit([], values);
  return out;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
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
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

const clear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .slice(signed.indexOf("Hello."));

const sourceWords = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word, index) => {
    const values = gp(word);
    return {
      index,
      word: word.toUpperCase(),
      length: values.length,
      gp0: values.reduce((sum, value) => mod29(sum + value), 0),
    };
  });

assert.equal(sourceWords.length, 43);
assert.deepEqual(sourceWords.slice(30).map((row) => row.word), [
  "SEEK", "AND", "YOU", "WILL", "BE", "FOUND", "GOOD",
  "LUCK", "BEWARE", "FALSE", "PATHS", "VERIFY", "OPENPGP",
]);

// Canonical complete page-local printed groups.
const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const allWords = [];
let current = [];
let startPage = -1;
let endPage = -1;
let startOffset = -1;

function flush() {
  if (!current.length) return;
  allWords.push({
    page: startPage,
    endPage,
    start: startOffset,
    values: current.slice(),
  });
  current = [];
}

for (let block = 0; block < parts.length; block += 1) {
  const page = block >= 50 ? block + 1 : block;
  let offset = 0;
  for (const char of parts[block]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) {
        startPage = page;
        startOffset = offset;
      }
      endPage = page;
      current.push(value);
      offset += 1;
    } else if (!/[\s/]/u.test(char)) {
      flush();
    }
  }
}
flush();

const canonical = allWords.filter((word) => word.page === word.endPage);
const pages = Array.from({ length: 56 }, (_, page) =>
  canonical.filter((word) => word.page === page)
);

/** @param {number[]} values @returns {number[]} */
function hPair3(values) {
  assert.equal(values.length, 3);
  return [
    mod29(values[0] - values[2]),
    mod29(values[0] + values[2]),
    values[1],
  ];
}

const q = 4;
const K = 2;
const F = 0;
const H = [2, 26, 5, 6];
const W1 = [24, 16, 14, 17];
const W3 = [6, 27, 15, 17];

const hPermutations = permutations(H);
const coordinateOrders = permutations([0, 1, 2, 3]);

// Precompute prepared ciphertext GP0 sums by operation class, source arity,
// and local-word ordinal residue.
const prepared = pages.map((words) => {
  const maps = {
    direct: new Map(),
    adj23: new Map(),
    centerQ: new Map(),
    centerF: new Map(),
    terminal: new Map(),
  };

  /** @param {Map<string, number[]>} map @param {number} length @param {number} residue @param {number} sum */
  function put(map, length, residue, sum) {
    const key = String(length) + "|" + String(residue);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(sum);
  }

  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    const residue = mod29(index + 1);
    const sum = word.values.reduce((left, right) => mod29(left + right), 0);

    put(maps.direct, word.values.length, residue, sum);

    if (
      index + 1 < words.length &&
      word.values.length === 2 &&
      words[index + 1].values.length === 3
    ) {
      const values = word.values.concat(words[index + 1].values);
      put(
        maps.adj23,
        5,
        residue,
        values.reduce((left, right) => mod29(left + right), 0)
      );
    }

    if (word.values.length % 2 === 1) {
      const middle = (word.values.length - 1) / 2;
      if (word.values[middle] === q) {
        const values = word.values
          .slice(0, middle)
          .concat(word.values.slice(middle + 1));
        put(
          maps.centerQ,
          values.length,
          residue,
          values.reduce((left, right) => mod29(left + right), 0)
        );
      }
      if (word.values[middle] === F) {
        const values = word.values
          .slice(0, middle)
          .concat(word.values.slice(middle + 1));
        put(
          maps.centerF,
          values.length,
          residue,
          values.reduce((left, right) => mod29(left + right), 0)
        );
      }
    }

    if (word.values.length > 1 && word.values[1] === F && index >= K) {
      const marker = words[index - K];
      if (
        marker.values.length === 3 &&
        hPair3(marker.values).join(",") === "2,1,0"
      ) {
        const values = word.values.slice(0, 1).concat(word.values.slice(2));
        put(
          maps.terminal,
          values.length,
          residue,
          values.reduce((left, right) => mod29(left + right), 0)
        );
      }
    }
  }

  return maps;
});

const kindByLane = [
  "direct", "direct", "direct", "direct", "direct",
  "adj23", "centerQ",
  "direct", "direct", "direct", "direct",
  "centerF", "terminal",
];

/**
 * @param {number} sourceStart
 * @param {number} pageStart
 * @param {number} lane
 * @param {number[]} delta
 * @returns {number[]}
 */
function preparedSums(sourceStart, pageStart, lane, delta) {
  const source = sourceWords[sourceStart + lane];
  const page = pageStart + lane;
  const residue = mod29(source.index + delta[lane]);
  const map = prepared[page][kindByLane[lane]];
  return map.get(String(source.length) + "|" + String(residue)) || [];
}

/** @param {number[][]} columns @param {boolean} reverseColumns @param {boolean} reverseVertical @returns {number[]} */
function orient(columns, reverseColumns, reverseVertical) {
  let output = columns.map((column) => column.slice());
  if (reverseVertical) {
    output = output.map((column) => column.reverse());
  }
  if (reverseColumns) {
    output.reverse();
  }
  return output.flat();
}

/**
 * @param {number[]} roles
 * @param {number} one
 * @param {boolean} reverseColumns
 * @param {boolean} reverseVertical
 * @returns {number[]}
 */
function addressGrid(roles, one, reverseColumns, reverseVertical) {
  const [r0, r1, r2, r3] = roles;
  const left = [r1, one, mod29(-r1), r0];
  const center = [r1, one, F, one, mod29(-r1)];
  const transition = [mod29(-r3), r2, mod29(-r0), one];
  const right = left.map((value, i) => mod29(value + transition[i]));
  return orient(
    [left, center, right],
    reverseColumns,
    reverseVertical
  );
}

/**
 * @param {number[]} roles
 * @param {number} one
 * @param {boolean} reverseColumns
 * @param {boolean} reverseVertical
 * @param {boolean} swapOpposite
 * @param {number[]} transitionOrder
 * @returns {number[]}
 */
function correctionGrid(
  roles,
  one,
  reverseColumns,
  reverseVertical,
  swapOpposite,
  transitionOrder
) {
  const [r0, r1, r2, r3] = roles;
  const left = [mod29(-r3), 2 * q, one, mod29(-r0)];
  const center = [
    mod29(-r1),
    mod29(-r2),
    mod29(r0 * r2),
    r3,
    r1,
  ];
  const opposite = swapOpposite
    ? [W3[2], W1[2]]
    : [W1[2], W3[2]];
  const baseTransition = [
    opposite[0],
    opposite[1],
    mod29(-r1),
    W1[3],
  ];
  const transition = transitionOrder.map((index) => baseTransition[index]);
  const right = left.map((value, i) => mod29(value + transition[i]));
  return orient(
    [left, center, right],
    reverseColumns,
    reverseVertical
  );
}

let baseLabels = 0;
const baseNumeric = new Map();

for (const permutation of hPermutations) {
  for (let signMask = 0; signMask < 16; signMask += 1) {
    const roles = permutation.map((value, i) =>
      mod29(((signMask >> i) & 1) ? -value : value)
    );

    for (const oneRaw of [1, -1]) {
      const one = mod29(oneRaw);
      for (const reverseColumns of [false, true]) {
        for (const reverseVertical of [false, true]) {
          const delta = addressGrid(
            roles,
            one,
            reverseColumns,
            reverseVertical
          );
          const key = delta.join(",");
          baseLabels += 1;
          assert.ok(!baseNumeric.has(key), "unexpected duplicate address grid");
          baseNumeric.set(key, {
            roles,
            one,
            reverseColumns,
            reverseVertical,
            delta,
          });
        }
      }
    }
  }
}

assert.equal(baseLabels, 3072);
assert.equal(baseNumeric.size, 3072);

const baseSurvivors = [];

for (const base of baseNumeric.values()) {
  for (let sourceStart = 0; sourceStart <= 30; sourceStart += 1) {
    for (let pageStart = 0; pageStart <= 43; pageStart += 1) {
      let full = true;
      for (let lane = 0; lane < 13; lane += 1) {
        if (!preparedSums(sourceStart, pageStart, lane, base.delta).length) {
          full = false;
          break;
        }
      }
      if (full) {
        baseSurvivors.push({ base, sourceStart, pageStart });
      }
    }
  }
}

assert.equal(baseSurvivors.length, 4);
assert.ok(baseSurvivors.every((row) =>
  row.sourceStart === 30 && row.pageStart === 30
));

const survivorDeltas = baseSurvivors
  .map((row) => row.base.delta.join(","))
  .sort();

assert.deepEqual(survivorDeltas, [
  "26,1,3,2,26,1,0,1,3,20,25,1,3",
  "26,1,3,2,26,1,0,1,3,20,6,1,3",
  "26,1,3,2,26,1,0,1,3,3,25,1,3",
  "26,1,3,2,26,1,0,1,3,3,6,1,3",
].sort());

let jointLabels = 0;
const jointNumeric = new Map();

for (const survivor of baseSurvivors) {
  const { base, sourceStart, pageStart } = survivor;

  for (const swapOpposite of [false, true]) {
    for (const transitionOrder of coordinateOrders) {
      jointLabels += 1;

      const correction = correctionGrid(
        base.roles,
        base.one,
        base.reverseColumns,
        base.reverseVertical,
        swapOpposite,
        transitionOrder
      );
      const keySums = base.delta.map((value, i) =>
        mod29(value + correction[i])
      );

      let full = true;
      let allUnique = true;

      for (let lane = 0; lane < 13; lane += 1) {
        const source = sourceWords[sourceStart + lane];
        const sums = preparedSums(
          sourceStart,
          pageStart,
          lane,
          base.delta
        );
        const matches = sums.filter((cipherSum) =>
          mod29(cipherSum - keySums[lane]) === source.gp0
        );

        if (!matches.length) {
          full = false;
          break;
        }
        if (matches.length !== 1) allUnique = false;
      }

      if (full) {
        const key = [
          base.delta.join(","),
          keySums.join(","),
          sourceStart,
          pageStart,
        ].join("|");
        jointNumeric.set(key, {
          delta: base.delta,
          keySums,
          sourceStart,
          pageStart,
          allUnique,
        });
      }
    }
  }
}

assert.equal(jointLabels, 192);
assert.equal(jointNumeric.size, 1);

const winner = [...jointNumeric.values()][0];
assert.deepEqual(winner, {
  delta: [26,1,3,2,26,1,0,1,3,20,6,1,3],
  keySums: [20,9,4,0,0,25,10,7,0,28,0,5,18],
  sourceStart: 30,
  pageStart: 30,
  allUnique: true,
});

const preparedCipherSums = winner.delta.map((_, lane) => {
  const sums = preparedSums(
    winner.sourceStart,
    winner.pageStart,
    lane,
    winner.delta
  );
  const source = sourceWords[winner.sourceStart + lane];
  const matching = sums.filter((cipherSum) =>
    mod29(cipherSum - winner.keySums[lane]) === source.gp0
  );
  assert.equal(matching.length, 1);
  return matching[0];
});

const predictedPlainSums = preparedCipherSums.map((cipherSum, lane) =>
  mod29(cipherSum - winner.keySums[lane])
);

assert.deepEqual(predictedPlainSums, [
  27,27,1,28,6,7,6,2,1,19,25,1,17,
]);
assert.deepEqual(
  predictedPlainSums,
  sourceWords.slice(30, 43).map((row) => row.gp0)
);

console.log(JSON.stringify({
  status: "PASS",
  exclusion:
    "No fitted coordinate key, no target rune equality, no language score.",
  search: {
    sourceWindows: 31,
    pageIntervals: 44,
    sourcePagePairs: 1364,
  },
  addressFamily: {
    labeled: baseLabels,
    distinct: baseNumeric.size,
    fullReceiverConfigurations: baseSurvivors.length,
    allFullReceiverSourceStarts: [...new Set(
      baseSurvivors.map((row) => row.sourceStart)
    )],
    allFullReceiverPageStarts: [...new Set(
      baseSurvivors.map((row) => row.pageStart)
    )],
    survivorDeltas,
  },
  jointChecksumFamilyAfterReceiverGate: {
    labeled: jointLabels,
    exactNumeric: jointNumeric.size,
  },
  winner: {
    sourceStart: winner.sourceStart,
    pageStart: winner.pageStart,
    words: sourceWords.slice(30, 43).map((row) => row.word),
    delta: winner.delta,
    keySums: winner.keySums,
    preparedCipherSums,
    predictedPlainSums,
    allPreparedReceiversUniqueAfterChecksum: winner.allUnique,
  },
}, null, 2));
