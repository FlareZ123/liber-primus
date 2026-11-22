"use strict";

/**
 * Exact global all-secret GF29 fifth-back marker feasibility.
 *
 * Hypothesis:
 *  C[w,j] = C[w,j-1] + k[w,j]*(P[w,j] - f(P[w,j-5])) mod29, j>=5.
 * Every nonzero k[w,j] may be independently secret and EVERY value of the
 * global table f: GF29->GF29 is secret, with collisions permitted.
 *
 * This is reversible in the current plaintext rune if f and k are known.
 * Its key-free necessary and sufficient marker is:
 *  C[w,j] == C[w,j-1] iff P[w,j] == f(P[w,j-5]).
 *
 * No search over 29^29 secret tables is needed. Every equality forces
 * f(x)=y, every inequality forbids f(x)=y, and a contradiction or
 * completely forbidden row disproves existence of ANY global f.
 *
 * Source controls condition on every original word length and original
 * same-physical-page j>=5 site. A native English model is an explicitly
 * stated hypothesis; no original ciphertext plaintext is inferred.
 *
 * Windows11 Node22 CommonJS single-file SFT:
 * node sims/lp2_lag5_arbitrary_secret_table_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const sourcePages = gp.pages.filter(p => p.page <= 55 && p.indices.length);
const original = sourcePages.flatMap(p => p.indices);
assert.equal(original.length, 12956);
const glyphs = new Map(gp.runes.map((r, i) => [r, i]));
const sourceText = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
const words = (sourceText.match(new RegExp("[" + gp.runes.join("") + "]+", "gu")) || [])
  .map(w => Array.from(w, r => glyphs.get(r)));
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);
const pageAt = new Uint8Array(original.length);
let offset = 0;
for (const p of sourcePages) {
  pageAt.fill(p.page, offset, offset + p.indices.length);
  offset += p.indices.length;
}
const wordOffsets = [];
const sectionSource = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");
const sectionLengths = sectionSource.split("$")
  .map(part => (part.match(new RegExp("[" + gp.runes.join("") + "]", "gu")) || []).length)
  .filter(Boolean);
assert.deepEqual(sectionLengths,
  [729,1145,1738,1894,1021,1433,1680,3316]);
const sectionAt = new Uint8Array(original.length);
let sectionStart=0;
for (const [number,length] of sectionLengths.entries()) {
  sectionAt.fill(number,sectionStart,sectionStart+length);
  sectionStart+=length;
}
assert.equal(sectionStart,original.length);
const slots = [];
offset = 0;
for (const w of words) {
  wordOffsets.push(offset);
  const indices = [];
  for (let j = 5; j < w.length; j++)
    if (pageAt[offset+j] === pageAt[offset+j-5])
      indices.push(j);
  slots.push(indices);
  offset += w.length;
}
const nSites = slots.reduce((sum, s) => sum + s.length, 0);
assert.equal(nSites, 2073);

/**
 * @param {number[][]} stream
 * @returns {boolean[][]} same physical source locations
 */
function markers(stream) {
  return stream.map((w, i) =>
    slots[i].map(j => w[j] === w[j-1]));
}
const observed = markers(words);
const nObserved = observed.flat().filter(Boolean).length;
assert.equal(nObserved, 15);

/**
 * Find whether any single global function f: GP29 -> GP29 can exactly
 * satisfy ALL equality/non-equality markers. No bijection assumption.
 *
 * @param {number[][]} plain full 2896 native-GP words
 * @param {boolean[][]} event indexed by same-page j>=5 slots
 */
function feasibility(plain, event, scope = "global") {
  assert(["global","section","page"].includes(scope));
  const groups = new Map();
  function groupAt(id) {
    if (!groups.has(id))
      groups.set(id,{required:Array(29).fill(-1),
        banned:Array.from({length:29},()=>new Uint8Array(29)),
        conflicting:new Uint8Array(29)});
    return groups.get(id);
  }
  for (let wi=0; wi<plain.length; wi++) {
    const w = plain[wi];
    for (let site=0; site<slots[wi].length; site++) {
      const j=slots[wi][site], g=wordOffsets[wi]+j;
      const id=scope==="global" ? 0 :
        scope==="section" ? sectionAt[g] : pageAt[g];
      const group=groupAt(id);
      const input=w[j-5], output=w[j];
      if (event[wi][site]) {
        if (group.required[input]!==-1 && group.required[input]!==output)
          group.conflicting[input]=1;
        group.required[input]=output;
      } else group.banned[input][output]=1;
    }
  }
  let conflicts=0,forbiddenForced=0,emptyUnforced=0;
  let possibilities=0,forced=0;
  for (const {required,banned,conflicting} of groups.values()) {
    conflicts+=conflicting.reduce((s,v)=>s+v,0);
    for(let x=0;x<29;x++) {
      if(required[x]!==-1) {
        forced++;
        if(banned[x][required[x]]) forbiddenForced++;
        else if(!conflicting[x]) possibilities++;
      } else {
        let allowed=0;
        for(let y=0;y<29;y++)if(!banned[x][y])allowed++;
        if(!allowed)emptyUnforced++;
        possibilities+=allowed;
      }
    }
  }
  return {possible: !conflicts && !forbiddenForced && !emptyUnforced,
    scope,groups:groups.size,
    conflictingForcedRows:conflicts,
    forbiddenForcedRows:forbiddenForced,
    emptyUnforcedRows:emptyUnforced,
    possibleTableEntries:possibilities,
    forcedRows:forced};
}

/** @param {number} seed */
function xorshift(seed) {
  let state=seed>>>0;
  return ()=>{
    state ^= state<<13;state ^= state>>>17;state ^= state<<5;
    return (state>>>0)/4294967296;
  };
}
const mod = x => (x%29+29)%29;
function inverse(k) {
  assert(k>=1&&k<=28);
  for(let v=1;v<29;v++) if(v*k%29===1) return v;
  throw Error("nonzero GF29 multiplier must invert");
}

/**
 * Exact reversible native-English plant on the ORIGINAL whole printed-word
 * shapes, with either a bijective or arbitrary nonbijective global f.
 * @param {number[][]} plain
 * @param {number[]} table 29 secret entries
 */
function plant(plain,table) {
  const ciphertext=[];
  const recovered=[];
  for(let wi=0;wi<plain.length;wi++){
    const p=plain[wi],c=p.slice(0,5),out=c.slice();
    for(let j=5;j<p.length;j++){
      const k=1+(19*wi+7*j)%28;
      c[j]=mod(c[j-1]+k*(p[j]-table[p[j-5]]));
      out[j]=mod(table[out[j-5]]+
        mod(c[j]-c[j-1])*inverse(k));
    }
    assert.deepEqual(out,p);
    ciphertext.push(c);
    recovered.push(out);
  }
  const event=markers(ciphertext);
  const result=feasibility(recovered,event);
  assert(result.possible);
  assert.deepEqual(recovered,plain);
  return {
    symbolsRecovered: recovered.reduce((n,w)=>n+w.length,0),
    originalSitesVerified: nSites,
    cipherDoublets: event.flat().filter(Boolean).length,
    markerTableFeasible: result.possible
  };
}
const controls=[
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
];
const nTrials=300;
const output=[];
for (let src=0;src<controls.length;src++){
  const pools=new Map();
  for (const word of read(controls[src]).match(/[A-Za-z]+/g)||[]){
    const native=encodeSourceNativeGP(word);
    if (!pools.has(native.length)) pools.set(native.length,[]);
    pools.get(native.length).push(native);
  }
  for(const w of words)
    assert(pools.has(w.length),"missing GP length "+w.length);
  const next=xorshift(0x33015550+src);
  const stats=[];
  const pass={global:0,section:0,page:0};
  let positive=null;
  for(let trial=0;trial<nTrials;trial++){
    const draw=words.map(w=>{
      const options=pools.get(w.length);
      return options[Math.floor(next()*options.length)];
    });
    if(trial===0){
      const arbitrary=Array.from({length:29},()=>Math.floor(next()*29));
      const bijective=Array.from({length:29},(_,i)=>i);
      for(let j=28;j>0;j--){
        const k=Math.floor(next()*(j+1));
        [bijective[j],bijective[k]]=[bijective[k],bijective[j]];
      }
      positive={arbitraryFunction:plant(draw,arbitrary),
        secretBijection:plant(draw,bijective)};
    }
    const globalResult=feasibility(draw,observed);
    stats.push(globalResult);
    if(globalResult.possible) pass.global++;
    if(feasibility(draw,observed,"section").possible) pass.section++;
    if(feasibility(draw,observed,"page").possible) pass.page++;
  }
  const avg=f=>stats.reduce((s,x)=>s+f(x),0)/nTrials;
  output.push({source:controls[src],samples:nTrials,positive,
    secretTablesSatisfyingOriginal:
      pass.global,
    exactScopePassCounts:pass,
    conflictingForcedRowsMean:+avg(x=>x.conflictingForcedRows).toFixed(3),
    minimumConflictingForcedRows:
      Math.min(...stats.map(x=>x.conflictingForcedRows)),
    emptyUnforcedRowsMean:+avg(x=>x.emptyUnforcedRows).toFixed(3),
    minEmptyUnforcedRows:
      Math.min(...stats.map(x=>x.emptyUnforcedRows)),
    forbiddenForcedRowsMean:+avg(x=>x.forbiddenForcedRows).toFixed(3),
    meanForcedRows:+avg(x=>x.forcedRows).toFixed(3)});
}
console.log(JSON.stringify({
  model:"Cj=Cprev + secret_kj*(Pj - global_secret_f(Pj-5)) modulo29",
  keyIndependence:"Any arbitrary secret function f with all29 entries and any nonzero arbitrary per-site secret multiplier k",
  original:{runes:original.length,wholeWords:words.length,
    samePageLag5Sites:nSites,adjacentCipherDoublets:nObserved},
  output,
  scope:"Exact necessary-condition contradiction on native-English matched controls, allowing an independent secret f by original printed section or physical page. Not an exclusion of arbitrary non-English plaintext, evolving f within these scopes, or other ciphers; no plaintext recovered"
},null,2));
