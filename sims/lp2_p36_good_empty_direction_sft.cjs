"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number[]} */
function H4(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
  ];
}

/** @param {number[]} values @returns {number[]} */
function H5(values) {
  assert.equal(values.length, 5);
  return [
    mod29(values[0] - values[4]),
    mod29(values[1] - values[3]),
    values[2],
    mod29(values[1] + values[3]),
    mod29(values[0] + values[4]),
  ];
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const parts = transcription.split(/^\s*%\s*$/m);
const runeToValue = new Map(corpus.runes.map((rune, value) => [rune, value]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let index = 0; index < normalized.length;) {
    if (normalized.startsWith("ING", index)) {
      out.push(21);
      index += 3;
      continue;
    }
    if (normalized.startsWith("IO", index)) {
      out.push(27);
      index += 2;
      continue;
    }
    const token = gpTokens.find((row) => normalized.startsWith(row.symbol, index));
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(index));
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {number} page @returns {{ordinal:number,start:number,end:number,values:number[]}[]} */
function canonicalWords(page) {
  const out = [];
  let current = [];
  let start = 0;
  let runeOffset = 0;
  function flush() {
    if (!current.length) return;
    out.push({
      ordinal: out.length + 1,
      start,
      end: runeOffset - 1,
      values: current.slice(),
    });
    current = [];
  }
  for (const character of [...physicalPart(page)]) {
    const value = runeToValue.get(character);
    if (value !== undefined) {
      if (!current.length) start = runeOffset;
      current.push(value);
      runeOffset += 1;
    } else if ((character === "-" || character === ".") && current.length) {
      flush();
    }
  }
  flush();
  return out;
}

const sourceWords = signed2016
  .slice(signed2016.indexOf("Hello."), signed2016.indexOf("-----BEGIN PGP SIGNATURE-----"))
  .replace(/\b7A35090F\b/g, "")
  .match(/[A-Za-z]+/g)
  .map((word) => word.toUpperCase());

assert.equal(sourceWords.length, 43);
assert.deepEqual(
  [19,25,26,27,28,29,36].map((index) => [index, sourceWords[index]]),
  [[19,"THEIR"],[25,"THEIR"],[26,"NUMBERS"],[27,"ARE"],[28,"THE"],[29,"DIRECTION"],[36,"GOOD"]]
);

const state = {
  K: sourceWords.indexOf("PATH"),
  e: sourceWords.indexOf("LIES"),
  q: sourceWords.indexOf("EMPTY"),
  g: sourceWords.indexOf("EPIPHANY"),
  a: sourceWords.indexOf("SEEKS"),
  A: sourceWords.indexOf("DEVOTED"),
  b: sourceWords.indexOf("WORDS"),
  B: sourceWords.indexOf("THEIR"),
  p: sourceWords.indexOf("ROAD"),
};
assert.deepEqual(state, {K:2,e:3,q:4,g:5,a:6,A:8,b:15,B:19,p:23});

const selected = canonicalWords(36)[36];
assert.deepEqual(selected, {
  ordinal: 37,
  start: 169,
  end: 173,
  values: [2,22,4,1,20],
});
assert.deepEqual(
  H5(selected.values),
  [state.a + state.g, state.p - state.K, state.q, state.p, state.p - 1]
);
assert.equal(selected.values[2], state.q);

const emptied = [selected.values[0], selected.values[1], selected.values[3], selected.values[4]];
assert.deepEqual(emptied, [2,22,1,20]);

const good = gp("GOOD");
assert.deepEqual(good, [state.a,state.e,state.e,mod29(-state.a)]);
assert.deepEqual(H4(good), [state.K * state.a,0,state.a,0]);

const exactKey = [25,19,27,26];
assert.deepEqual(exactKey, [
  mod29(state.p + state.K),
  state.B,
  mod29(-state.K),
  mod29(state.p + state.e),
]);
assert.deepEqual(
  emptied.map((value,index) => mod29(value - exactKey[index])),
  good
);
const encoded4 = good.map((value,index) => mod29(value + exactKey[index]));
assert.deepEqual(
  [encoded4[0], encoded4[1], state.q, encoded4[2], encoded4[3]],
  selected.values
);

const distinctAuth4 = [];
for (const word of sourceWords) {
  const values = gp(word);
  if (values.length === 4 && !distinctAuth4.some((entry) => entry.values.join(",") === values.join(","))) {
    distinctAuth4.push({word,values});
  }
}
assert.equal(distinctAuth4.length, 9);
const auth4ByValues = new Map(distinctAuth4.map((entry) => [entry.values.join(","), entry.word]));

/** @template T @param {T[]} values @returns {T[][]} */
function permutations(values) {
  const out = [];
  function visit(items,index) {
    if (index === items.length) {
      out.push(items.slice());
      return;
    }
    for (let swap=index; swap<items.length; swap+=1) {
      [items[index],items[swap]]=[items[swap],items[index]];
      visit(items,index+1);
      [items[index],items[swap]]=[items[swap],items[index]];
    }
  }
  visit(values.slice(),0);
  return out;
}

/** @template T @param {T[]} values @param {number} count @returns {T[][]} */
function combinations(values,count) {
  const out=[];
  function visit(start,current) {
    if (current.length===count) {
      out.push(current.slice());
      return;
    }
    for (let index=start; index<values.length; index+=1) {
      current.push(values[index]);
      visit(index+1,current);
      current.pop();
    }
  }
  visit(0,[]);
  return out;
}

const fiveRuneWords=[];
for (let page=0; page<=55; page+=1) {
  if (page===50) continue;
  for (const word of canonicalWords(page)) {
    if (word.values.length===5) fiveRuneWords.push({page,...word});
  }
}
assert.equal(fiveRuneWords.length,318);

const narrowKeys=permutations([19,25,26,27]);
assert.equal(narrowKeys.length,24);
const narrowHits=[];
for (const word of fiveRuneWords) {
  const receiver=[word.values[0],word.values[1],word.values[3],word.values[4]];
  for (const key of narrowKeys) {
    for (const sign of [-1,1]) {
      const output=receiver.map((value,index)=>mod29(value + sign*key[index]));
      const target=auth4ByValues.get(output.join(","));
      if (target) narrowHits.push({
        page:word.page,ordinal:word.ordinal,start:word.start,center:word.values[2],
        key:key.slice(),sign,target,output,
      });
    }
  }
}
assert.equal(318*24*2,15264);
assert.deepEqual(narrowHits,[{
  page:36,ordinal:37,start:169,center:4,
  key:[25,19,27,26],sign:-1,target:"GOOD",output:[6,3,3,23],
}]);

const qCentered=fiveRuneWords.filter((word)=>word.values[2]===state.q);
assert.equal(qCentered.length,9);
assert.equal(qCentered.length*24*2,432);

const broadAtoms=[
  {label:"THEIR1",value:19},
  {label:"THEIR2",value:25},
  {label:"NUMBERS",value:26},
  {label:"ARE",value:27},
  {label:"THE",value:28},
  {label:"DIRECTION",value:mod29(29)},
];
const broadSets=combinations(broadAtoms,4);
assert.equal(broadSets.length,15);
const broadHits=[];
let broadOutputs=0;
for (const atomSet of broadSets) {
  for (const orderedAtoms of permutations(atomSet)) {
    const key=orderedAtoms.map((atom)=>atom.value);
    for (const word of fiveRuneWords) {
      const receiver=[word.values[0],word.values[1],word.values[3],word.values[4]];
      for (const sign of [-1,1]) {
        broadOutputs+=1;
        const output=receiver.map((value,index)=>mod29(value + sign*key[index]));
        const target=auth4ByValues.get(output.join(","));
        if (target) broadHits.push({
          page:word.page,ordinal:word.ordinal,start:word.start,center:word.values[2],
          keyLabels:orderedAtoms.map((atom)=>atom.label),key,sign,target,output,
        });
      }
    }
  }
}
assert.equal(broadOutputs,228960);
assert.deepEqual(
  broadHits.map((hit)=>[hit.page,hit.ordinal,hit.center,hit.target]),
  [[36,37,4,"GOOD"],[28,4,9,"WILL"],[18,13,0,"LUCK"]]
);
assert.equal(9*15*24*2,6480);
assert.deepEqual(broadHits.filter((hit)=>hit.center===state.q),[broadHits[0]]);

const sourceStateShapeHits=distinctAuth4.filter((entry)=>{
  const values=entry.values;
  return Object.values(state).includes(values[0]) &&
    Object.values(state).includes(values[1]) &&
    values[2]===values[1] &&
    values[3]===mod29(-values[0]);
});
assert.deepEqual(sourceStateShapeHits.map((entry)=>entry.word),["GOOD"]);

const sourceGp0Rows=sourceWords.map((word,index)=>{
  const values=gp(word);
  return {index,word,values,gp0:values.reduce((sum,value)=>sum+value,0)};
});
const reciprocalGp0Cycles=[];
for (const row of sourceGp0Rows) {
  if (row.gp0<0 || row.gp0>=sourceGp0Rows.length) continue;
  const peer=sourceGp0Rows[row.gp0];
  if (peer.gp0===row.index && row.index<=peer.index) {
    reciprocalGp0Cycles.push({
      indices:[row.index,peer.index],
      words:[row.word,peer.word],
      gp0:[row.gp0,peer.gp0],
    });
  }
}
assert.deepEqual(reciprocalGp0Cycles,[{
  indices:[35,36],
  words:["FOUND","GOOD"],
  gp0:[36,35],
}]);
assert.deepEqual(sourceGp0Rows[35],{
  index:35,word:"FOUND",values:[0,3,1,9,23],gp0:36,
});
assert.deepEqual(sourceGp0Rows[36],{
  index:36,word:"GOOD",values:[6,3,3,23],gp0:35,
});

console.log(JSON.stringify({
  status:"PASS",
  selected:{page:36,ordinal:37,offsets:[169,173],original:selected.values,emptyCenter:state.q,emptied},
  decoder:{key:exactKey,sign:"subtract",plaintext:good,word:"GOOD",keyStateTyping:["p+K","B","-K","p+e"]},
  narrowControl:{fiveRuneWords:318,decodedOutputs:15264,qCenteredWords:9,qCenteredOutputs:432,hits:narrowHits},
  broadControl:{atomSets:15,decodedOutputs:228960,totalHits:broadHits.length,qCenteredOutputs:6480,qCenteredHits:1},
  sourceReciprocalGp0:{cycles:reciprocalGp0Cycles},
  decision:"Strong local GOOD candidate under literal EMPTY-center removal and finite signed direction-number key family; preserve chronology caveat before generalizing."
},null,2));
