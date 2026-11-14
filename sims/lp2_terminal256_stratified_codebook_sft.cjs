"use strict";

/**
 * Original LP2 pp49-51 numeric grid and terminal known-text, exact
 * all-secret stationary lookup inverse. No fitted cipher keys.
 *
 * Conditional model: place plaintext p56+p57 on the inner three shells
 * of the original 32x8 printed grid, in any of eight corner/winding
 * orientations independently per shell. Each printed two-glyph numeral
 * maps to one GP rune via a secret lookup, optionally independently
 * for a source-visible ring, column, or physical grid page.
 *
 * For every lookup class, the best secret 29-valued codebook is found
 * analytically by choosing its majority known symbol. The number of
 * unavoidable errors is sum(class size - max symbol multiplicity).
 * An exact decoder requires zero errors, irrespective of unknown maps.
 *
 * Run: node sims/lp2_terminal256_stratified_codebook_sft.cjs
 * Source: original corpus and literal two-glyph table tokens.
 * Node22 built-ins; no network, writes, or third-party dependencies.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),"utf8"));
const db=read("resources/liber-primus/lp2-corpus.json");
const grid=read("resources/liber-primus/lp2-grid-256.json");
const tokens=grid.pages.flatMap(p=>p.tokens);
assert.deepEqual(grid.pages.map(p=>[p.page,p.tokens.length]),
  [[49,80],[50,104],[51,72]]);
assert.equal(tokens.length,256);
assert(tokens.every(t=>t.length===2));

/** @returns {number[]} */
function firstPrimes(n) {
  const out=[];
  for(let v=2;out.length<n;v++){
    if(out.every(p=>p*p>v||v%p!==0))out.push(v);
  }
  return out;
}
const first84=firstPrimes(84);
let primeClock=0;
const p56Cipher=db.pages[56].indices;
const p56Plain=p56Cipher.map((v,i)=>
  i===56?v:(v-(first84[primeClock++]-1)%29+29)%29);
assert.equal(primeClock,84);
const known={
  decoded:p56Plain.concat(db.pages[57].indices),
  printed:p56Cipher.concat(db.pages[57].indices)
};
for(const list of Object.values(known))assert.equal(list.length,180);

// Independent known-p56 literal prose ensures correct solved control.
const phrase="AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES "+
  "TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const alphabet=db.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} s @returns {number[]} */
function spell(s){
  const out=[];
  for(const word of s.split(" ")){
    for(let k=0;k<word.length;){
      const t=alphabet.find(x=>word.startsWith(x.s,k));
      assert(t,"unknown GP plaintext token: "+word.slice(k));
      out.push(t.i);
      k+=t.s.length;
    }
  }
  return out;
}
assert.deepEqual(p56Plain,spell(phrase));
assert.deepEqual(p56Plain.flatMap((v,i)=>v===0?[i]:[]),[56]);

/** @param {number} d @returns {number[]} */
function shell(d){
  const t=d,b=31-d,l=d,r=7-d,out=[];
  for(let c=l;c<=r;c++)out.push(t*8+c);
  for(let row=t+1;row<=b;row++)out.push(row*8+r);
  for(let c=r-1;c>=l;c--)out.push(b*8+c);
  for(let row=b-1;row>t;row--)out.push(row*8+l);
  return out;
}
/** @param {number} d @param {number} mode @returns {number[]} */
function orient(d,mode){
  const points=shell(d);
  if(mode&1)points.reverse();
  const corners=[d*8+d,d*8+7-d,(31-d)*8+7-d,(31-d)*8+d];
  const start=points.indexOf(corners[mode>>1]);
  assert(start>=0);
  return points.slice(start).concat(points.slice(0,start));
}
assert.deepEqual([0,1,2,3].map(d=>shell(d).length),
  [76,68,60,52]);
assert.equal(new Set([0,1,2,3].flatMap(shell)).size,256);

/**
 * All-secret lookup groups. No assumption about the secret table's
 * actual contents, arithmetic form, or cryptographic generation.
 * @type {Record<string,(cell:number,ring:number)=>string>}
 */
const classes={
  token:(cell,ring)=>tokens[cell],
  ring_token:(cell,ring)=>ring+":"+tokens[cell],
  column_token:(cell,ring)=>(cell%8)+":"+tokens[cell],
  physical_page_token:(cell,ring)=>
    (cell<80?49:cell<184?50:51)+":"+tokens[cell],
  ring_column_token:(cell,ring)=>
    ring+":"+(cell%8)+":"+tokens[cell],
  // Solved p56 and clear p57 have distinct original page headings and
  // genuinely different observed cipher status. Grant each an independent
  // unlimited secret codebook, even within the same ring+column+token class.
  terminal_page_token:(cell,ring,i)=>
    (i<85?56:57)+":"+tokens[cell],
  terminal_page_ring_token:(cell,ring,i)=>
    (i<85?56:57)+":"+ring+":"+tokens[cell],
  terminal_page_column_token:(cell,ring,i)=>
    (i<85?56:57)+":"+(cell%8)+":"+tokens[cell],
  terminal_page_ring_column_token:(cell,ring,i)=>
    (i<85?56:57)+":"+ring+":"+(cell%8)+":"+tokens[cell]
};

/**
 * @param {number[]} positions
 * @param {number[]} symbols
 * @param {(cell:number,ring:number,position:number)=>string} tag
 * @returns {{errors:number,classes:number,contradictoryClasses:number}}
 */
function fit(positions,symbols,tag){
  const bins=new Map();
  for(let i=0;i<180;i++){
    const ring=i<68?1:i<128?2:3;
    const key=tag(positions[i],ring,i);
    if(!bins.has(key))bins.set(key,new Map());
    const counts=bins.get(key),value=symbols[i];
    counts.set(value,(counts.get(value)||0)+1);
  }
  let errors=0,contradictoryClasses=0;
  for(const counts of bins.values()){
    const votes=[...counts.values()];
    const minimum=votes.reduce((s,n)=>s+n,0)-Math.max(...votes);
    errors+=minimum;
    contradictoryClasses+=+(minimum>0);
  }
  return {errors,classes:bins.size,contradictoryClasses};
}
const stats={};
for(const textMode of Object.keys(known)){
  for(const kind of Object.keys(classes)){
    stats[textMode+":"+kind]={
      minErrors:Infinity,maxErrors:0,exactRoutes:0,bestRoute:null
    };
  }
}
let candidates=0;
for(let a=0;a<8;a++)for(let b=0;b<8;b++)for(let c=0;c<8;c++){
  const positions=[...orient(1,a),...orient(2,b),...orient(3,c)];
  assert.equal(new Set(positions).size,180);
  candidates++;
  for(const [mode,symbols] of Object.entries(known)){
    for(const [kind,tag] of Object.entries(classes)){
      const tested=fit(positions,symbols,tag);
      const record=stats[mode+":"+kind];
      record.maxErrors=Math.max(record.maxErrors,tested.errors);
      if(tested.errors<record.minErrors){
        record.minErrors=tested.errors;
        record.bestRoute=[a,b,c];
      }
      record.exactRoutes+=+(tested.errors===0);
    }
  }
}
assert.equal(candidates,512);
// The broadest of these source-visible direct lookup families already fails.
for(const mode of Object.keys(known)){
  assert.equal(stats[mode+":ring_column_token"].exactRoutes,0);
  assert.equal(stats[mode+":terminal_page_ring_column_token"].exactRoutes,0);
}
assert.deepEqual(
  Object.fromEntries(Object.entries(stats).map(([k,v])=>[k,v.minErrors])),
  {
    "decoded:token":43,
    "decoded:ring_token":17,
    "decoded:column_token":6,
    "decoded:physical_page_token":9,
    "decoded:ring_column_token":6,
    "decoded:terminal_page_token":21,
    "decoded:terminal_page_ring_token":14,
    "decoded:terminal_page_column_token":5,
    "decoded:terminal_page_ring_column_token":5,
    "printed:token":46,
    "printed:ring_token":20,
    "printed:column_token":7,
    "printed:physical_page_token":12,
    "printed:ring_column_token":7,
    "printed:terminal_page_token":24,
    "printed:terminal_page_ring_token":16,
    "printed:terminal_page_column_token":6,
    "printed:terminal_page_ring_column_token":6
  }
);

// Positive control: an unknown ring+column+token symbol table generated
// independently of any target text is always exactly reconstructed.
const example=[...orient(1,3),...orient(2,6),...orient(3,1)];
const planted=example.map((cell,i)=>{
  const ring=i<68?1:i<128?2:3;
  const key=classes.ring_column_token(cell,ring);
  let hash=0;
  for(const ch of key)hash=(hash*31+ch.charCodeAt(0))%29;
  return hash;
});
assert.equal(fit(example,planted,classes.ring_column_token).errors,0);
const labelCounts=new Map();
for(let i=0;i<180;i++){
  const key=classes.ring_column_token(example[i],i<68?1:i<128?2:3);
  if(!labelCounts.has(key))labelCounts.set(key,[]);
  labelCounts.get(key).push(i);
}
const pair=[...labelCounts.values()].find(x=>x.length>=2);
assert(pair,"must have at least one true codebook collision");
const corrupted=planted.slice();
corrupted[pair[1]]=(corrupted[pair[1]]+1)%29;
assert.equal(fit(example,corrupted,classes.ring_column_token).errors,1);

console.log(JSON.stringify({
  hypothesis:"256 table cells directly encode 76+85+95 GP runes",
  sourceTablePages:[49,50,51],
  originalKnown:"p56 solved totient plaintext and p57 direct plaintext",
  sourceVisibleDecoderReset:"independent p56 and p57 secret codebooks also exhausted",
  alternateKnown:"p56 and p57 literally printed rune symbols",
  originalGridSize:"32x8",
  knownInnerRings:[68,60,52],
  independentCornerWindingRoutes:candidates,
  statistic:"exact minimum GP symbol edits under any secret lookup map per source-visible class",
  results:stats,
  positivePlant:{all180Exact:true,oneCorruptedRepeatedClassDetected:true},
  decision:"No tested ring/column/page-aware stationary direct codebook explains 180 authentic known source runes in any original 3-ring orientation.",
  limit:"The 256-token terminal ring hypothesis itself is unproven. This does not exclude multi-cell, stateful, keyed-by-position, or nonlocal operations and recovers no p55 plaintext."
},null,2));
