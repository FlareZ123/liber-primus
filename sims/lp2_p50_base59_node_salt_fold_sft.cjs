"use strict";

/**
 * Source-supplied node salt in the original base59 256-cell tree.
 * Each non-leaf symbol equals the sum of its children plus or minus its
 * OWN printed table value, modulo the 29-symbol Gematria Primus alphabet.
 *
 * The source graph itself supplies the sole address-varying parameter.
 * Assign the 95 independently clear p57 runes to leaves, predict the
 * 84 key-consuming known p56 runes, and leave p55's 76 unknown signs blind.
 *
 * Windows 11, Node.js 22: node sims/lp2_p50_base59_node_salt_fold_sft.cjs
 * This hypothesis is conditional and does not recover unknown plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..", "resources", "liber-primus");

/** @param {string} name @returns {any} */
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = read("lp2-corpus.json");
const table = read("base60-grid.json");
const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx";
/** @param {number} x @returns {number} */
const mod = x => (x % 29 + 29) % 29;
assert.equal(alphabet.length, 59);
const token = table.rows.flat();
assert.equal(token.length, 256);
const value = token.map(s => 59 * alphabet.indexOf(s[0]) + alphabet.indexOf(s[1]));
assert(value.every(x => x >= 0 && x < 256));
const children = Array.from({length:256}, () => []);
const indegree = Array(256).fill(0);
value.forEach((parent,child) => {
  indegree[parent]++;
  if (parent !== child) children[parent].push(child);
});
assert.deepEqual(value.flatMap((v,i) => v === i ? [i] : []), [189]);

const preorder = [], postorder = [];
/** @param {number} n @returns {void} */
function walk(n) {
  preorder.push(n);
  for (const child of children[n]) walk(child);
  postorder.push(n);
}
walk(189);
assert.equal(preorder.length, 256);
assert.equal(new Set(preorder).size, 256);

const leaves = {
  address: Array.from({length:256}, (_,i)=>i).filter(i=>indegree[i]===0),
  dfs: preorder.filter(i=>indegree[i]===0)
};
const internals = {
  address: Array.from({length:256}, (_,i)=>i).filter(i=>indegree[i]>0&&i!==189),
  dfs: preorder.filter(i=>indegree[i]>0&&i!==189),
  post: postorder.filter(i=>indegree[i]>0&&i!==189)
};
assert(Object.values(leaves).every(a=>a.length===95));
assert(Object.values(internals).every(a=>a.length===160));
assert.equal(corpus.pages[55].indices.length,76);
assert.equal(corpus.pages[56].indices.length,85);
assert.equal(corpus.pages[57].indices.length,95);

// Exact p56 decoded text uses authentic native-GP spelling: U=V and C=K.
const known = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const tokenMap = corpus.translit.map((name,i)=>({name,i}))
  .sort((a,b)=>b.name.length-a.name.length);
/** @param {string} s @returns {number[]} */
function nativeGP(s) {
  return s.split(" ").flatMap(word=>{
    const out=[];
    for (let i=0;i<word.length;) {
      const rune=tokenMap.find(t=>word.startsWith(t.name,i));
      assert(rune, "unmapped source plaintext");
      out.push(rune.i);
      i+=rune.name.length;
    }
    return out;
  });
}
const p56plain=nativeGP(known);
assert.equal(p56plain.length,85);
assert.deepEqual(p56plain.flatMap((p,i)=>p===0?[i]:[]),[56]);
const p56consuming=p56plain.filter(p=>p!==0);
assert.equal(p56consuming.length,84);

const primes=[];
for (let x=2;primes.length<84;x++) {
  let prime=true;
  for(let k=2;k*k<=x;k++) if(x%k===0){prime=false;break;}
  if(prime) primes.push(x-1);
}
let clock=0;
const authentic=p56plain.map(p=>p===0?0:mod(p+primes[clock++]));
assert.equal(clock,84);
assert.deepEqual(authentic,corpus.pages[56].indices);

const observations=[];
for(const [leafOrder,leafAddresses] of Object.entries(leaves))
for(const [internalOrder,internalAddresses] of Object.entries(internals))
for(const weight of ["index","prime"])
for(const reverse of [false,true])
for(const sign of [-1,1]) {
  const assigned=Array(256).fill(-1);
  leafAddresses.forEach((address,i)=>{
    const p=corpus.pages[57].indices[reverse?94-i:i];
    assigned[address]=weight==="index"?p:corpus.prime[p]%29;
  });
  /** @param {number} n @returns {number} */
  function fold(n) {
    if (assigned[n]>=0) return assigned[n];
    return assigned[n]=mod(sign*value[n]+children[n]
      .reduce((sum,c)=>sum+fold(c),0));
  }
  const graphRoot=fold(189);
  assert(assigned.every(x=>x>=0&&x<29));
  const predicted=internalAddresses.slice(76).map(i=>assigned[i]);
  assert.equal(predicted.length,84);
  const exact=predicted.filter((p,i)=>p===p56consuming[i]).length;
  const rootZero=predicted.filter((p,i)=>mod(p-graphRoot)===p56consuming[i]).length;
  observations.push({leafOrder,internalOrder,weight,reverse,sign,exact,rootZero,graphRoot});
}
assert.equal(observations.length,48);
const bestExact=Math.max(...observations.map(x=>x.exact));
const bestRootZero=Math.max(...observations.map(x=>x.rootZero));
assert.equal(bestExact,7);
assert.equal(bestRootZero,8);
assert(bestExact<84&&bestRootZero<84);

console.log(JSON.stringify({
  classification: "new node-salted base59 tree fold: source-derived 48 readers rejected by exact p56 plaintext",
  original: {tableCells:256,root:189,leaves:95,unassignedNonroot:76,
    p56CipherRunes:85,p56AuthenticFSkipIndex:56,p56Consuming:84,p57Clear:95},
  originalP56FullyReencrypted:authentic.length,
  tested:observations.length,
  bestExactP56:bestExact,
  bestRootZeroP56:bestRootZero,
  bestExactReader:observations.find(x=>x.exact===bestExact),
  bestRootZeroReader:observations.find(x=>x.rootZero===bestRootZero),
  decision:"A source-valued node salt does not rescue the p50 base59 leaf-to-p56 fold. No p55 plaintext."
},null,2));
