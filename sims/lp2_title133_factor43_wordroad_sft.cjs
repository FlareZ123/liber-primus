"use strict";

/**
 * SFT: title133 full-rank factors -> signed-word ROAD map -> p32/p33 states.
 *
 * Reconstructs the authenticated 43-word signed message, consumes the three
 * large class-A full-rank factors modulo that independently exact word count,
 * then follows only already-established direction operations:
 *
 *   factor mod 43 -> signed word
 *   signed-word direction graph
 *   GP0(word) -> zero-based p50 byte-pointer state, g=5 steps
 *
 * Run:
 *   node sims/lp2_title133_factor43_wordroad_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const dh = {p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3};
const q = 4;
const mod29 = value => ((value % 29) + 29) % 29;
const tableTokens = grid.rows.flat();
const tableBytes = grid.byte_rows.flat();
const alpha60 = grid.alphabet;

const gpTokens = corpus.translit
  .map((symbol,value) => ({symbol,value}))
  .sort((left,right) => right.symbol.length-left.symbol.length);

/** @param {string} word */
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
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO",offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find(item =>
      normalized.startsWith(item.symbol,offset)
    );
    assert.ok(token,"unmapped GP spelling: "+normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {string} word */
const gp0 = word => gp(word).reduce((sum,value) => sum+value,0);

/** @param {number} start @param {number} steps */
function p50Walk(start,steps) {
  const route = [start];
  let current = start;
  for (let step=0; step<steps; step+=1) {
    assert.ok(current>=0 && current<tableBytes.length);
    current = tableBytes[current];
    route.push(current);
  }
  return route;
}

const clear = signed2016.match(
  /Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u
);
assert.ok(clear);
const words = (clear[1].match(/\b[A-Za-z]+\b/gu) || [])
  .map(word => word.toUpperCase());
assert.equal(words.length,43);

// The factorization was frozen independently in the title133 full-rank gate.
const q13 = 5051n;
const q32 = 3435600587n;
const q79 = 571505208178548184347727n;
const factors = [
  ["q13",q13],
  ["q32",q32],
  ["q79",q79],
];

const selected = factors.map(([name,value]) => {
  const index = Number(value % 43n);
  return {name,index,word:words[index]};
});
assert.deepEqual(selected,[
  {name:"q13",index:20,word:"MEANING"},
  {name:"q32",index:3,word:"LIES"},
  {name:"q79",index:23,word:"ROAD"},
]);

// Reconstruct the frozen signed-word direction graph:
// next_i = low60(p50[i]) - i - GP_length(word_i) mod29.
const graph = words.map((word,index) => {
  const token = tableTokens[index];
  const low = alpha60.indexOf(token[1]);
  assert.ok(low>=0);
  return {
    index,
    word,
    length:gp(word).length,
    next:mod29(low-index-gp(word).length),
  };
});

/** @param {number} start @param {number} target */
function graphDistance(start,target) {
  let current = start;
  const seen = new Set();
  for (let distance=0; !seen.has(current); distance+=1) {
    if (current===target) return distance;
    seen.add(current);
    current = graph[current].next;
  }
  return null;
}

const roadIndex = words.indexOf("ROAD");
assert.equal(roadIndex,23);
const selectedGraph = selected.map(row => ({
  ...row,
  roadDistance:graphDistance(row.index,roadIndex),
}));
assert.deepEqual(
  selectedGraph.map(row => row.roadDistance),
  [dh.K,q,0]
);

// Spell out the exact source-only paths, so the distance claims are
// independently reproducible rather than inferred from the counts alone.
assert.deepEqual(
  [20,graph[20].next,graph[graph[20].next].next],
  [20,18,23]
);
assert.deepEqual(
  [3,graph[3].next,graph[graph[3].next].next,
   graph[graph[graph[3].next].next].next,
   graph[graph[graph[graph[3].next].next].next].next],
  [3,28,0,18,23]
);

// The three selected words then address p50 by their canonical whole-word GP0
// numbers and use the already promoted generator depth g=5.
const routes = selected.map(row => {
  const start = gp0(row.word);
  const route = p50Walk(start,dh.g);
  return {...row,gp0:start,route,endpoint:route.at(-1)};
});
assert.deepEqual(
  routes.map(row => ({word:row.word,gp0:row.gp0,endpoint:row.endpoint})),
  [
    {word:"MEANING",gp0:77,endpoint:32},
    {word:"LIES",gp0:63,endpoint:79},
    {word:"ROAD",gp0:54,endpoint:115},
  ]
);
assert.deepEqual(routes[0].route,[77,144,125,20,102,32]);
assert.deepEqual(routes[1].route,[63,51,59,69,73,79]);
assert.deepEqual(routes[2].route,[54,156,52,86,111,115]);

// Independent receiver labels.
//
// MEANING=77 is the literal p32 SURFACE-exit state found by extending the
// source-selected NE q=4 path one step beyond the 11x11 square.
const p32SurfaceExit = 6*11 + 11;
assert.equal(routes[0].gp0,p32SurfaceExit);
assert.equal(routes[0].endpoint,32);

// The p33 second visible marker is NG. Its GP prime is 79, and its second
// black body is 115 runes. Reconstruct the latter from canonical transcription.
const ngIndex = corpus.translit.indexOf("NG");
assert.ok(ngIndex>=0);
const ngPrime = corpus.prime[ngIndex];
assert.equal(ngPrime,79);
assert.equal(routes[1].endpoint,ngPrime);

const runeSet = new Set(corpus.runes);
const countRunes = value => [...value].filter(ch => runeSet.has(ch)).length;
const pages = transcription.split("%");
const p33Text = pages[33];
const firstUnitEnd = p33Text.indexOf("&");
assert.ok(firstUnitEnd>0);
const secondUnit = p33Text.slice(firstUnitEnd+1);
const secondTitleEnd = secondUnit.indexOf(".");
assert.ok(secondTitleEnd>0);
const secondTitleLength = countRunes(secondUnit.slice(0,secondTitleEnd));
const secondBodyLength = countRunes(secondUnit)-secondTitleLength;
assert.equal(secondTitleLength,dh.A);
assert.equal(secondBodyLength,115);
assert.equal(routes[2].endpoint,secondBodyLength);

// Collision controls: endpoint labels are not unique across all 43 source
// words. The factor mod43 selector is what fixes MEANING/LIES/ROAD.
const endpointTargets = [32,79,115];
const endpointControls = endpointTargets.map(endpoint => ({
  endpoint,
  words:words
    .map((word,index) => ({
      index,
      word,
      gp0:gp0(word),
      endpoint:p50Walk(gp0(word),dh.g).at(-1),
    }))
    .filter(row => row.endpoint===endpoint)
    .map(({index,word,gp0}) => ({index,word,gp0})),
}));
assert.deepEqual(endpointControls,[
  {
    endpoint:32,
    words:[
      {index:20,word:"MEANING",gp0:77},
      {index:39,word:"FALSE",gp0:77},
    ],
  },
  {
    endpoint:79,
    words:[
      {index:3,word:"LIES",gp0:63},
      {index:26,word:"NUMBERS",gp0:83},
    ],
  },
  {
    endpoint:115,
    words:[
      {index:23,word:"ROAD",gp0:54},
      {index:34,word:"BE",gp0:35},
      {index:36,word:"GOOD",gp0:35},
      {index:40,word:"PATHS",gp0:54},
    ],
  },
]);

console.log(JSON.stringify({
  status:"PASS",
  classification:
    "title133 full-rank factors self-select signed words MEANING/LIES/ROAD and map them through existing graph/p50 operations to p32/p33 states",
  factorMod43:selectedGraph,
  p50WordRoutes:routes,
  receiverLabels:{
    meaning77:"literal p32 SURFACE-exit state",
    liesEndpoint79:"GP-prime(NG), visible p33 second marker",
    roadEndpoint115:"p33 second black-body length",
  },
  endpointControls,
  decision:
    "Treat the full-rank factorization as an internal word-number roadmap. The p33 second body at state115 is now independently selected by ROAD and by the NG-factor route.",
},null,2));
