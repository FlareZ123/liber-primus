"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const M = 29, I2 = 15;
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const gpTokens = corpus.translit.map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);
const mod = (x) => ((x % M) + M) % M;
const H = (x, y) => [mod(x - y), mod(x + y)];
const add = (a, b) => a.map((x, i) => mod(x + b[i]));
const sub = (a, b) => a.map((x, i) => mod(x - b[i]));
const drop = (v) => [v[0], v[1], v[3], v[4]];
const shell4 = (v) => [...H(v[0], v[3]), ...H(v[1], v[2])];
const inv4 = (s) => [
  mod((s[0] + s[1]) * I2),
  mod((s[2] + s[3]) * I2),
  mod((s[3] - s[2]) * I2),
  mod((s[1] - s[0]) * I2),
];

function parsePage(text, page) {
  const words = [], runes = [];
  let current = [], start = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({page, index: words.length, start,
      end: start + current.length - 1, values: current.slice(),
      length: current.length});
    current = [];
  };
  for (const ch of [...text]) {
    const v = runeIndex.get(ch);
    if (v !== undefined) {
      if (!current.length) start = runes.length;
      current.push(v);
      runes.push(v);
    } else if ((ch === "-" || ch === ".") && current.length) flush();
  }
  flush();
  return {words, runes};
}

function gp(word) {
  const s = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S").replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith("ING", i)) { out.push(21); i += 3; continue; }
    if (s.startsWith("IO", i)) { out.push(27); i += 2; continue; }
    const t = gpTokens.find((x) => s.startsWith(x.symbol, i));
    assert.ok(t, "unmapped GP spelling at " + s.slice(i));
    out.push(t.value); i += t.symbol.length;
  }
  return out;
}

function permutations(v) {
  if (v.length <= 1) return [v.slice()];
  const out = new Map();
  for (let i = 0; i < v.length; i++) {
    for (const tail of permutations(v.slice(0, i).concat(v.slice(i + 1)))) {
      const p = [v[i], ...tail]; out.set(p.join(","), p);
    }
  }
  return [...out.values()];
}

const st = {p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3};
assert.equal(mod(st.K ** 3), st.A);
assert.equal(mod(st.A ** 3), st.B);
assert.equal(mod(st.B ** 3), st.b);

const ds = [0, mod(-st.g), st.e, st.a];
assert.deepEqual(ds, [0,24,3,6]);
const dr = inv4(ds);
assert.deepEqual(dr, [12,19,16,12]);
assert.deepEqual(dr, [mod(st.K*st.a), st.B, H(st.K,st.b)[0], mod(st.K*st.a)]);

const parts = raw.split("%");
const p0 = parsePage(parts[0], 0);
assert.equal(p0.words.length, 59);
const at = (n) => p0.words.find((w) => w.start === n);
const F = at(117), G = at(49), L = at(39), P = at(131);
assert.deepEqual(F.values, [12,2,11,10,2]);
assert.deepEqual(G.values, [24,21,26,14]);
assert.deepEqual(L.values, [8,17,9,27]);
assert.deepEqual(P.values, [23,14,21,7]);

const transition = (v) => inv4(add(shell4(drop(v)), ds));
assert.deepEqual(shell4(drop(F.values)), [10,14,21,12]);
assert.deepEqual(shell4(G.values), [10,9,24,18]);
assert.deepEqual(sub(shell4(G.values), shell4(drop(F.values))), ds);
assert.deepEqual(transition(F.values), G.values);
assert.deepEqual(sub(G.values, drop(F.values)), dr);

const kg = mod(st.K * st.g);
for (const w of [F,G,L]) assert.equal(H(w.values[0],w.values.at(-1))[0], kg);
assert.equal(H(P.values[0],P.values.at(-1))[0], 16);

const fPlain=[0,3,1,9,23], gPlain=[6,3,3,23];
const fKey=[12,28,10,1,8], gKey=[18,18,23,20];
const pd=sub(gPlain,drop(fPlain));
assert.deepEqual(pd,[st.a,0,mod(-st.a),0]);

const p28Lines=parts[28].split("/").map((line)=>[...line]
  .map((ch)=>runeIndex.get(ch)).filter((v)=>v!==undefined))
  .filter((line)=>line.length);
assert.equal(p28Lines[0].length,23);
const hereB=p28Lines[0][st.B-1];
assert.equal(hereB,22);
const kd=sub(gKey,drop(fKey));
assert.deepEqual(kd,[st.a,st.B,hereB,mod(st.K*st.a)]);
assert.deepEqual(add(pd,kd),dr);

const clear=signed2016.split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\r?\n\r?\n/).slice(1).join("\n");
const signedWords=clear.split(/[^A-Za-z0-9]+/).filter((x)=>/^[A-Za-z]+$/.test(x));
const targets=[...new Map(signedWords.map((word)=>({word:word.toUpperCase(),values:gp(word)}))
  .filter((x)=>x.values.length===4).map((x)=>[x.values.join(","),x])).values()];
assert.deepEqual(targets.map((x)=>x.word),
  ["LIES","THEIR","MEANING","ROAD","SEEK","WILL","GOOD","LUCK","PATHS"]);
const terms=[st.a,st.B,hereB,mod(st.K*st.a)], keyHits=[];
for(const p of permutations(terms)) for(const sign of [1,-1]) {
  const key=drop(fKey).map((v,i)=>mod(v+sign*p[i]));
  const plain=G.values.map((v,i)=>mod(v-key[i]));
  for(const t of targets) if(plain.join(",")===t.values.join(","))
    keyHits.push({p,sign,key,target:t.word});
}
assert.equal(permutations(terms).length*2,48);
assert.deepEqual(keyHits,[{p:[6,19,22,12],sign:1,key:[18,18,23,20],target:"GOOD"}]);

const words=[];
for(let i=0;i<55;i++) words.push(...parsePage(parts[i],i<=49?i:i+1).words);
const fives=words.filter((w)=>w.length===5), fours=words.filter((w)=>w.length===4);
assert.equal(fives.length,318); assert.equal(fours.length,514);
const map4=new Map();
for(const w of fours){const k=w.values.join(","); if(!map4.has(k))map4.set(k,[]); map4.get(k).push(w);}
const pairHits=[];
for(const a of fives) for(const b of (map4.get(transition(a.values).join(","))||[])) pairHits.push({a,b});
assert.equal(pairHits.length,1);
assert.deepEqual([pairHits[0].a.page,pairHits[0].a.start,pairHits[0].b.page,pairHits[0].b.start],[0,117,0,49]);

const prim=[st.p,st.g,st.a,st.b,st.A,st.B,st.K,st.e];
const signed=[...new Set(prim.flatMap((v)=>[v,mod(-v)]))];
assert.equal(signed.length,14);
let configs=0, configsAny=0, totalPairHits=0, exactHits=0;
for(const x of signed)for(const y of signed)for(const z of signed){
  configs++; const d=[0,x,y,z]; let hits=0;
  for(const a of fives){
    const pred=inv4(add(shell4(drop(a.values)),d));
    hits+=(map4.get(pred.join(","))||[]).length;
  }
  if(hits){configsAny++;totalPairHits+=hits;}
  if(d.join(",")===ds.join(",")) exactHits=hits;
}
assert.deepEqual([configs,configsAny,totalPairHits,exactHits],[2744,537,592,1]);

// Source-only order/radix compression for the discovered key-update packet.
const alice59=[];
const alice60=[];
const bob59=[];
for(let x=1;x<=p28Lines[0].length;x++){
  const value=p28Lines[0][x-1];
  if(st.a+x+value+mod(st.K*st.a)===59) alice59.push({x,value});
  if(st.a+x+value+mod(st.K*st.a)===60) alice60.push({x,value});
  if(st.b+x+value+mod(st.K*st.b)===59) bob59.push({x,value});
}
assert.deepEqual(alice59,[{x:st.B,value:hereB}]);
assert.deepEqual(alice60,[{x:18,value:24}]);
assert.deepEqual(bob59,[]);
assert.equal(terms.reduce((a,b)=>a+b,0),59);

// Prospective matched-shape holdout: the authenticated carrier has exactly
// two adjacent 5-GP-rune -> 4-GP-rune transitions.
const carrier54=[];
for(let i=0;i<signedWords.length-1;i++){
  const from=gp(signedWords[i]), to=gp(signedWords[i+1]);
  if(from.length===5 && to.length===4)
    carrier54.push([signedWords[i].toUpperCase(),signedWords[i+1].toUpperCase()]);
}
assert.deepEqual(carrier54,[["FOUND","GOOD"],["FALSE","PATHS"]]);

// Freeze the direct rune delta learned above and invert it from the already
// selected PATHS receiver. This predicts the four non-center coordinates a
// FALSE receiver would require before searching any five-rune source fragment.
const falseOuter=P.values.map((v,i)=>mod(v-dr[i]));
assert.deepEqual(falseOuter,[11,24,5,24]);
const falseMatches=fives.filter((w)=>drop(w.values).join(",")===falseOuter.join(","));
assert.deepEqual(falseMatches,[]);

const len45=words.filter((w)=>w.length===4||w.length===5);
const outer=len45.filter((w)=>H(w.values[0],w.values.at(-1))[0]===kg);
const p0len=len45.filter((w)=>w.page===0);
const p0outer=p0len.filter((w)=>H(w.values[0],w.values.at(-1))[0]===kg);
assert.deepEqual([len45.length,outer.length,p0len.length,p0outer.length],[832,31,16,5]);

console.log(JSON.stringify({
  shellDelta:ds,runeDelta:dr,keyDelta:kd,hereB,
  exactPair:[0,117,0,49],
  manuscript:{fiveRune:fives.length,fourRune:fours.length,pairHits:pairHits.length},
  keyFamily:{configs:48,hits:keyHits},
  broadFamily:{configs,configsAny,totalPairHits,exactHits},
  packetSelector:{sum:terms.reduce((a,b)=>a+b,0),alice59,alice60,bob59},
  holdout:{carrier54,falseOuter,falseMatches:falseMatches.length},
  outer:{kg,all:[outer.length,len45.length],p0:[p0outer.length,p0len.length]}
},null,2));
