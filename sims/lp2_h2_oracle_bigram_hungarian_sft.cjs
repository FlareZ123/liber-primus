"use strict";

/**
 * Recover arbitrary 29x29 GP29 permutation tableaux from source-native
 * H2 synthetic ciphertext with the secret key/skip state supplied by an
 * oracle. This is an identifiability test, NOT an LP2 decryption.
 *
 * Original LP2 has four raised apostrophe glyphs in physical p4/p21/p35/
 * p41. This experiment plants two possible contractions at those exact
 * positions as short known plaintext, with the other two held out.
 *
 * The candidate hidden-table cipher uses each successive ordinary prime's
 * Euler totient mod29 as the row label and redraws on a repeated ciphertext
 * with probability q=.81. The inverse tableau is secret. The full true
 * per-position row path is intentionally GIVEN to the decoder.
 *
 * Decoder: GP29 Shakespeare bigram language model, 29 rows of 29-entry
 * unknown permutation, unigram initialization and 12 sweeps of exact
 * maximum weight bipartite matching (Hungarian algorithm), one row at a
 * time. The true source plaintext is NEVER used to optimize row mappings.
 * Recovered-rune accuracy is for an independent *evaluation* only.
 *
 * Node22 CommonJS, read-only and deterministic.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const sourceText = read("resources/control/gibran_prophet_58585.txt");
const controlText = read("resources/control/shakespeare_first300k.txt");
const N=29, LENGTH=12956, TRIALS=8, SWEEPS=12;
const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);

/** @param {string} w @returns {number[]} */
function gpWord(w) {
  w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const a=[];
  for(let i=0;i<w.length;) {
    if(w.startsWith("ING",i)) {a.push(21);i+=3;}
    else if(w.startsWith("IO",i)) {a.push(27);i+=2;}
    else {
      const t=tokens.find(t=>w.startsWith(t.s,i));
      assert(t,"unmapped source character");
      a.push(t.i);i+=t.s.length;
    }
  }
  return a;
}
/** @param {string} s @returns {number[]} */
const toRunes = s => (s.match(/[A-Za-z]+/g)||[]).flatMap(gpWord);
const corpus=toRunes(sourceText), ref=toRunes(controlText);
assert.equal(corpus.length,62492);
assert.equal(ref.length,217106);
const unigram=Array(N).fill(0);
const bigram=Array.from({length:N},()=>Array(N).fill(0));
for(let i=0;i<ref.length;i++) {
  unigram[ref[i]]++;
  if(i>0) bigram[ref[i-1]][ref[i]]++;
}
const ln=Array.from({length:N},(_,i)=>
  Array.from({length:N},(_,j)=>
    Math.log((bigram[i][j]+3)/(unigram[i]+3*N))));
const isComposite=new Uint8Array(650001);
const stream=[];
for(let i=2;i<isComposite.length&&stream.length<45000;i++) {
  if(isComposite[i]) continue;
  stream.push((i-1)%N);
  if(i*i<isComposite.length)
    for(let j=i*i;j<isComposite.length;j+=i)isComposite[j]=1;
}
assert.equal(stream.length,45000);
const sites=[
  {start:1107,after:1110,word:"DONT"},
  {start:5136,after:5138,word:"ITS"},
  {start:8513,after:8515,word:"HES"},
  {start:10086,after:10089,word:"CANT"}
];
assert.deepEqual(sites.map(s=>s.after),[1110,5138,8515,10089]);
assert.deepEqual(sites.map(s=>gpWord(s.word).length),[4,3,3,4]);
const known=sites.slice(0,2).flatMap(s=>
  gpWord(s.word).map((v,i)=>[s.start+i,v]));
const holdout=sites.slice(2).flatMap(s=>
  gpWord(s.word).map((v,i)=>s.start+i));
const span=Array.from({length:150},(_,i)=>8500+i);
const allPositions=Array.from({length:LENGTH},(_,i)=>i);
assert.equal(known.length,7);
assert.equal(holdout.length,7);

/** @param {number} seed */
function rng(seed) {
  let s=seed>>>0;
  const u=()=> {
    s^=s<<13;s^=s>>>17;s^=s<<5;
    return (s>>>0)/4294967296;
  };
  return {u,int:n=>Math.floor(u()*n)};
}
/** @param {{int:(n:number)=>number}} r @returns {number[]} */
function permute(r) {
  const a=Array.from({length:N},(_,i)=>i);
  for(let i=N-1;i>0;i--) {
    const j=r.int(i+1);
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

/**
 * Hungarian minimum cost perfect assignment. Input is square n x n.
 * @param {number[][]} costs @returns {number[]}
 */
function assign(costs) {
  const n=costs.length;
  const u=new Float64Array(n+1),v=new Float64Array(n+1);
  const p=new Int32Array(n+1),way=new Int32Array(n+1);
  for(let i=1;i<=n;i++) {
    p[0]=i;
    let j0=0;
    const min=new Float64Array(n+1).fill(Infinity);
    const used=new Uint8Array(n+1);
    do {
      used[j0]=1;
      const i0=p[j0];
      let delta=Infinity,j1=0;
      for(let j=1;j<=n;j++) {
        if(used[j]) continue;
        const current=costs[i0-1][j-1]-u[i0]-v[j];
        if(current<min[j]) {min[j]=current;way[j]=j0;}
        if(min[j]<delta) {delta=min[j];j1=j;}
      }
      for(let j=0;j<=n;j++) {
        if(used[j]) {u[p[j]]+=delta;v[j]-=delta;}
        else min[j]-=delta;
      }
      j0=j1;
    } while(p[j0]!==0);
    do {
      const j1=way[j0];
      p[j0]=p[j1];
      j0=j1;
    } while(j0!==0);
  }
  const a=Array(n).fill(-1);
  for(let j=1;j<=n;j++)a[p[j]-1]=j-1;
  assert(a.every(i=>i>=0&&i<n));
  return a;
}

/**
 * GP bigram rowwise permutation recovery, granted exact true key rows.
 * @param {number[]} cipher
 * @param {number[]} rows
 * @param {number[]} truth evaluation ONLY, never used in optimization
 * @returns {{trace:{sweep:number,all:number,heldout:number,span:number}[]}}
 */
function invert(cipher,rows,truth) {
  const n=cipher.length;
  const counts=Array.from({length:N},()=>Array(N).fill(0));
  const fixed=Array.from({length:N},()=>new Map());
  for(let i=0;i<n;i++) counts[rows[i]][cipher[i]]++;
  for(const [i,p] of known) fixed[rows[i]].set(cipher[i],p);
  for(let r=0;r<N;r++)
    assert.equal(new Set(fixed[r].values()).size,fixed[r].size);
  const map=Array.from({length:N},()=>Array(N).fill(0));
  for(let r=0;r<N;r++) {
    const assignedPlain=new Set(fixed[r].values());
    const remainingCipher=Array.from({length:N},(_,i)=>i)
      .filter(x=>!fixed[r].has(x))
      .sort((a,b)=>counts[r][b]-counts[r][a]||a-b);
    const remainingPlain=Array.from({length:N},(_,i)=>i)
      .filter(x=>!assignedPlain.has(x))
      .sort((a,b)=>unigram[b]-unigram[a]||a-b);
    for(const [c,p] of fixed[r])map[r][c]=p;
    remainingCipher.forEach((c,i)=>map[r][c]=remainingPlain[i]);
  }
  const trace=[];
  for(let sweep=0;sweep<SWEEPS;sweep++) {
    const decoded=cipher.map((x,i)=>map[rows[i]][x]);
    for(let rr=0;rr<N;rr++) {
      const r=sweep%2?N-1-rr:rr;
      const scores=Array.from({length:N},()=>new Float64Array(N));
      for(let i=0;i<n;i++) {
        if(rows[i]!==r)continue;
        const c=cipher[i];
        for(let y=0;y<N;y++) {
          if(i>0)scores[c][y]+=ln[decoded[i-1]][y];
          if(i+1<n)scores[c][y]+=ln[y][decoded[i+1]];
        }
      }
      const freeCipher=Array.from({length:N},(_,i)=>i)
        .filter(x=>!fixed[r].has(x));
      const alreadyUsed=new Set(fixed[r].values());
      const freePlain=Array.from({length:N},(_,i)=>i)
        .filter(x=>!alreadyUsed.has(x));
      const costs=freeCipher.map(c=>freePlain.map(y=>-scores[c][y]));
      const assignment=assign(costs);
      for(const [c,p] of fixed[r])map[r][c]=p;
      freeCipher.forEach((c,i)=>map[r][c]=freePlain[assignment[i]]);
      for(let i=0;i<n;i++)if(rows[i]===r)
        decoded[i]=map[r][cipher[i]];
    }
    // Evaluation reads the true source text only AFTER a full sweep.
    const hit=seq=>seq.reduce((s,i)=>
      s+Number(decoded[i]===truth[i]),0);
    trace.push({sweep:sweep+1,all:hit(allPositions),
      heldout:hit(holdout),span:hit(span)});
  }
  return {trace};
}

const results=[];
for(let t=0;t<TRIALS;t++) {
  const random=rng((0x3301abcd+t*1013904223)>>>0);
  const offset=random.int(corpus.length-LENGTH);
  const plain=corpus.slice(offset,offset+LENGTH);
  for(const site of sites)
    plain.splice(site.start,gpWord(site.word).length,...gpWord(site.word));
  assert.equal(plain.length,LENGTH);
  const secret=Array.from({length:N},()=>permute(random));
  const cipher=new Array(LENGTH),row=new Array(LENGTH);
  let ptr=0,prior=-1;
  for(let i=0;i<LENGTH;i++) {
    let out=secret[stream[ptr]][plain[i]];
    while(out===prior&&random.u()<0.81) {
      ptr++;
      out=secret[stream[ptr]][plain[i]];
    }
    cipher[i]=out;
    row[i]=stream[ptr];
    prior=out;
    ptr++;
  }
  const inverse=secret.map(a=>{
    const b=Array(N).fill(-1);
    a.forEach((c,p)=>b[c]=p);
    return b;
  });
  // Strong positive: true secret table + true path recover all glyphs.
  assert.deepEqual(cipher.map((c,i)=>inverse[row[i]][c]),plain);
  const result=invert(cipher,row,plain);
  if(t<2) {
    // Independent reusable module must match this stand-alone decoder's
    // terminal results exactly on original-size, source-native plants.
    const {languageModel,recoverTableau} =
      require("./gp29_bigram_tableau_decoder.cjs");
    const recovered=recoverTableau(cipher,row,languageModel(ref),{
      known:known.map(([position,rune])=>({position,rune})),sweeps:12
    }).plaintext;
    const hit=positions=>positions.reduce((s,i)=>
      s+Number(recovered[i]===plain[i]),0);
    assert.deepEqual([hit(allPositions),hit(holdout),hit(span)],
      [result.trace.at(-1).all,result.trace.at(-1).heldout,
        result.trace.at(-1).span]);
  }
  results.push({trial:t,first:result.trace[0],last:result.trace.at(-1)});
}
const expected=[
  [12815,7,148],[12110,6,141],[12789,7,150],[12819,6,149],
  [11719,7,134],[12843,7,144],[12837,7,148],[12852,7,150]
];
assert.deepEqual(results.map(r=>[
  r.last.all,r.last.heldout,r.last.span]),expected);
const mean=x=>results.reduce((s,r)=>s+r.last[x],0)/results.length;
const summary={
  name:"H2 full-true-path 29x29 unknown-table permutation calibrated inverse",
  trials:TRIALS,key:"Euler totients of ordinary primes, mod29",
  source:"Gibran GP29 plants, independent Shakespeare GP29 bigram decoder",
  secretRowHistory:"oracle-given; unavailable on real unknown LP2",
  knownPlantRunes:7,eachPlantLength:LENGTH,
  recoveryMean:mean("all"),recoveryRate:mean("all")/LENGTH,
  heldoutWordGlyphMean:mean("heldout"),heldoutSpanMean:mean("span"),
  results
};
console.log(JSON.stringify(summary,null,2));
