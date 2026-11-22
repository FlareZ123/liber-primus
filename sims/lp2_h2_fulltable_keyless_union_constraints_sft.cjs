'use strict';

/**
 * Exact, secret-table-independent necessary condition for random-row H2
 * hidden prime-clock skips. Applies to 29 completely arbitrary secret
 * GP29 permutation rows: requires neither cyclic/Latin structure nor any
 * plaintext, key, linguistic prior, or secret lookup.
 *
 * A hypothesized rejected key row (r, previous ciphertext c_old) and
 * the final accepted key row (r_final, current ciphertext c_new) map
 * the same plaintext rune. Their unknown inverse-table cells must be
 * equal. Because each row is a permutation, two different cipher
 * columns in the same row can never belong to one equality component.
 *
 * Union-find tracks these forced equalities across the entire shared
 * table. A conflict rejects a hypothesized clock path regardless of
 * the actual secret table or plaintext. Zero conflicts is only a
 * necessary condition, never a decryption or sufficient proof.
 *
 * The clock-reset hypothesis in this SFT is per original physical page;
 * source does not authorize it. This predicate can be applied to other
 * hypothesized key reset patterns without changing its graph logic.
 *
 * Windows Node.js 22, CommonJS, read-only.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const text=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const gp=JSON.parse(text('resources/liber-primus/lp2-corpus.json'));
const original=gp.pages.filter(p=>p.page<=55).map(p=>p.indices);
const lengths=original.map(p=>p.length);
assert.equal(original.flat().length,12956);
assert.equal(lengths[50],0);
const N=29;
const composite=new Uint8Array(10000),rows=[];
for(let p=2;p<composite.length&&rows.length<500;p++){
  if(composite[p])continue;
  rows.push((p-1)%N);
  if(p*p<composite.length)
    for(let k=p*p;k<composite.length;k+=p)composite[k]=1;
}
assert.equal(rows.length,500);

/**
 * Necessary-only H2 equality graph on a candidate hidden skip history.
 * A cell index (r,c) represents the still-unknown plaintext T_r^-1(c).
 * @param {number[][]} pages
 * @param {number[][]} drift
 */
function graph(pages,drift){
  assert.equal(pages.length,drift.length);
  const count=N*N;
  const parents=Int16Array.from({length:count},(_,i)=>i);
  const rowMasks=Uint32Array.from({length:count},(_,i)=>
    (1<<Math.floor(i/N))>>>0);
  const find=i=>{
    while(parents[i]!==i){
      parents[i]=parents[parents[i]];
      i=parents[i];
    }
    return i;
  };
  let edges=0,rejectedEdges=0,joined=0,redundant=0;
  for(let page=0;page<pages.length;page++){
    const C=pages[page],D=drift[page];
    assert.equal(C.length,D.length);
    if(!C.length)continue;
    assert.equal(D[0],0);
    for(let i=1;i<C.length;i++){
      assert.ok(D[i]>=D[i-1]);
      assert.ok(i+D[i]<rows.length);
      const accepted=rows[i+D[i]]*N+C[i];
      for(let k=D[i-1];k<D[i];k++){
        edges++;
        const proposed=rows[i+k]*N+C[i-1];
        const a=find(proposed),b=find(accepted);
        if(a===b){redundant++;continue;}
        if((rowMasks[a]&rowMasks[b])!==0){
          rejectedEdges++;
          continue;
        }
        parents[a]=b;
        rowMasks[b]|=rowMasks[a];
        joined++;
      }
    }
  }
  return {edges,rejectedEdges,joined,redundant,
    consistentEdges:edges-rejectedEdges,
    necessaryConditionSatisfied:rejectedEdges===0};
}
function rng(seed){
  let state=seed>>>0;
  const float=()=>{
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return(state>>>0)/4294967296;
  };
  return {float,int:n=>Math.floor(float()*n)};
}
function permutation(r){
  const a=Array.from({length:N},(_,i)=>i);
  for(let i=N-1;i>0;i--){
    const j=r.int(i+1);[a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
const notation=gp.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
function gpWord(w){
  w=w.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const a=[];
  for(let i=0;i<w.length;){
    if(w.startsWith('ING',i)){a.push(21);i+=3;}
    else if(w.startsWith('IO',i)){a.push(27);i+=2;}
    else{
      const token=notation.find(t=>w.startsWith(t.s,i));
      assert.ok(token);
      a.push(token.i);i+=token.s.length;
    }
  }
  return a;
}
const native=(text('resources/control/gibran_prophet_58585.txt')
  .match(/[A-Za-z]+/g)||[]).flatMap(gpWord);
assert.equal(native.length,62492);
/**
 * Generate original-page-length synthetic native GP cipher under a secret,
 * randomly permuted 29x29 table and actual q=.81 skipped redraws.
 * The graph predicate receives neither this table nor source plaintext.
 * @param {number} seed
 */
function plant(seed){
  const rand=rng(seed),start=rand.int(native.length-12956);
  const plain=native.slice(start,start+12956);
  const table=Array.from({length:N},()=>permutation(rand));
  const cipher=[],drift=[];
  let pos=0,actualSkips=0;
  for(const n of lengths){
    let j=0,previous=-1;
    const C=[],D=[];
    for(let i=0;i<n;i++){
      let out=table[rows[j]][plain[pos+i]];
      while(out===previous&&rand.float()<.81){
        j++;actualSkips++;
        out=table[rows[j]][plain[pos+i]];
      }
      C.push(out);D.push(j-i);
      previous=out;j++;
    }
    cipher.push(C);drift.push(D);pos+=n;
  }
  assert.equal(pos,12956);
  return {cipher,drift,actualSkips};
}
/**
 * This deliberately wrong hidden-pointer schedule is *source-independent*.
 * It tests whether the graph can detect wrong trajectories, not whether
 * any unknown original cipher is specifically H2.
 * @param {number[][]} pages
 * @param {number} seed
 */
function randomClock(pages,seed){
  const random=rng(seed);
  return pages.map(C=>{
    let extra=0;
    return C.map((_,i)=>{
      if(i&&random.float()<.028)extra++;
      return extra;
    });
  });
}
const tests=[];
for(let t=0;t<4;t++){
  const seed=(0x3301abcd+t*1013904223)>>>0;
  const src=plant(seed),truth=graph(src.cipher,src.drift);
  assert.equal(truth.rejectedEdges,0,
    'every authentic H2 hidden skip must satisfy graph equalities');
  assert.equal(truth.edges,src.actualSkips);
  const wrong=graph(src.cipher,
    randomClock(src.cipher,seed^0x6d2b79f5));
  tests.push({trial:t,seed,actualSkips:src.actualSkips,
    trueSecretRowPath:truth,independentWrongClock:wrong});
}
const originalZero=graph(original,
  original.map(C=>C.map(()=>0)));
const originalFixed=graph(original,
  original.map(C=>C.map((_,i)=>Math.floor(i*.028))));
const originalRandom=graph(original,
  randomClock(original,0x3301f00d));
assert.equal(originalZero.rejectedEdges,0);
console.log(JSON.stringify({
  status:'key-independent exact H2 table-permutation path-constraint SFT',
  confidence:'Necessary constraint only, does NOT recover a key or original plaintext',
  originalPhysicalPages:lengths,
  publicClock:'successive prime totients mod29, page-local reset is hypothetical',
  trueTableSuppliedToPredicate:false,
  syntheticNativeEnglish:tests,
  originalHypotheticalSchedules:{
    zeroSkipTrivial:originalZero,
    fixed028EachRune:originalFixed,
    pseudorandom028EachRune:originalRandom
  },
  interpretation:'Any hypothesized path with rejectedEdges>0 is impossible under one shared 29x29 perm-table H2 model. Zero rejected edges neither validates the path nor selects how many skips occurred.'
},null,2));
module.exports={graph};
