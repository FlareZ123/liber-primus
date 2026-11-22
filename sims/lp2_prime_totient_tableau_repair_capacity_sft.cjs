"use strict";

/**
 * Keyless lower bound on how many ciphertext-symbol edits a fixed-clock,
 * arbitrary GP29 permutation tableau needs to reach original LP2's
 * within-state collision count.
 *
 * Independently solved LP2 p56 supplies K_i = phi(prime_i) mod29. All-secret
 * substitution T[(physical page, key residue)][P_i] preserves collision
 * counts inside these groups. We allow the solver EVERY SECRET permutation.
 * Non-consuming collision repair may edit ciphertext symbols but keeps the
 * group label; the best achievable reduction in equal pairs after m edits
 * can be upper bounded without guessing any secret alphabet.
 *
 * This experiment never tries to decipher unknown original runes.
 * Read-only, Node22 CJS, deterministic.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const shakes=read("resources/control/shakespeare_first300k.txt");
const token=gp.translit.map((s,i)=>({s:s.toLowerCase(),i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} text @returns {number[]} */
function gpRunes(text) {
  const source=text.toLowerCase().replace(/v/g,"u")
    .replace(/[kq]/g,"c").replace(/z/g,"s");
  const out=[];
  for(const word of source.match(/[a-z]+/g)||[]) {
    for(let i=0;i<word.length;) {
      if(word.startsWith("ing",i)) {out.push(21);i+=3;}
      else {
        const t=token.find(t=>word.startsWith(t.s,i));
        assert(t,"unmapped reference runes");
        out.push(t.i);i+=t.s.length;
      }
    }
  }
  return out;
}
const ref=gpRunes(shakes);
const original=gp.pages.slice(0,56).flatMap(p=>p.indices);
assert.equal(ref.length,217644);
assert.equal(original.length,12956);
const N=29,L=original.length;
const pp=[],clocks={book:[],page:[],chapter:[]};
const chapters=new Set([0,3,8,15,23,27,33,40,54]);
let book=0,chapter=0;
for(let p=0;p<56;p++) {
  if(chapters.has(p))chapter=0;
  for(let i=0;i<gp.pages[p].indices.length;i++) {
    pp.push(p);clocks.book.push(book++);
    clocks.page.push(i);clocks.chapter.push(chapter++);
  }
}
assert.equal(pp.length,L);
const sieve=new Uint8Array(350000).fill(1);
sieve[0]=sieve[1]=0;
for(let i=2;i*i<sieve.length;i++)
  if(sieve[i])for(let j=i*i;j<sieve.length;j+=i)sieve[j]=0;
const key=[];
for(let i=2;i<sieve.length&&key.length<L;i++)
  if(sieve[i])key.push((i-1)%N);
assert.equal(key.length,L);

/**
 * Each state groups positions whose arbitrary secret GP29 permutation
 * is identical. Changing at most m output symbols can eliminate at most
 * the first m of the sorted candidate c-1,c-2,...,1 repeated-symbol gains.
 * The generous bound even permits choosing a fresh unused symbol when
 * the group might already contain every GP rune.
 *
 * @param {number[]} x
 * @param {number[]} clock
 * @returns {{ordered:number,counts:Uint16Array}}
 */
function countPairs(x,clock) {
  assert.equal(x.length,L);
  const counts=new Uint16Array(56*N*N);
  let ordered=0;
  for(let i=0;i<L;i++) {
    const index=(pp[i]*N+key[clock[i]])*N+x[i];
    ordered+=2*counts[index];
    counts[index]++;
  }
  return {ordered,counts};
}
/** @param {{ordered:number,counts:Uint16Array}} base @param {number} target */
function minEdits(base,target) {
  if(base.ordered<=target)return 0;
  const marginal=[];
  for(const count of base.counts)
    for(let c=count-1;c>=1;c--)marginal.push(2*c);
  marginal.sort((a,b)=>b-a);
  let left=base.ordered,edits=0;
  while(left>target&&edits<marginal.length)
    left-=marginal[edits++];
  assert(left<=target);
  return edits;
}
const expected={
  book:[3602,6050,6538,6866,751,917,1022],
  page:[3594,5924,6332,6720,699,850,990],
  chapter:[3670,6076,6454,6824,736,851,966]
};
const windows=150;
const stride=Math.floor((ref.length-L)/(windows-1));
const findings=[];
for(const [name,clock] of Object.entries(clocks)) {
  const target=countPairs(original,clock).ordered;
  const starts=[],edits=[];
  for(let i=0;i<windows;i++) {
    const plain=ref.slice(i*stride,i*stride+L);
    const base=countPairs(plain,clock);
    starts.push(base.ordered);
    edits.push(minEdits(base,target));
  }
  starts.sort((a,b)=>a-b);
  edits.sort((a,b)=>a-b);
  const score=[target,starts[0],starts[75],starts.at(-1),
    edits[0],edits[75],edits.at(-1)];
  assert.deepEqual(score,expected[name]);
  findings.push({clock:name,originalPairsOrdered:target,
    nativePairsMin:starts[0],nativePairsMedian:starts[75],
    nativePairsMax:starts.at(-1),
    minRequiredSymbolEdits:edits[0],
    medianRequiredSymbolEdits:edits[75],
    maxRequiredSymbolEdits:edits.at(-1),
    minimumEditFraction:edits[0]/L});
}
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
function perm(r) {
  const a=Array.from({length:N},(_,i)=>i);
  for(let j=N-1;j>0;j--) {
    const k=r.int(j+1);
    [a[j],a[k]]=[a[k],a[j]];
  }
  return a;
}
// Explicit GP29 page-local clock controls: arbitrary unknown tableau
// and non-consuming q=.81 repair. Every repair uses the originally
// observed lag-six affine operator 24-2*C[i-6] mod29, as one source-shaped
// example, with no claim that this is the author's actual operation.
const pgState=pp.map((page,i)=>page*N+key[clocks.page[i]]);
const samples=[];
for(let t=0;t<50;t++) {
  const random=rng((0x14e9c0de+t*2654435761)>>>0);
  const offset=random.int(ref.length-L);
  const plaintext=ref.slice(offset,offset+L);
  const table=Array.from({length:56*N},()=>perm(random));
  const cipher=[],decodedBefore=[];
  let edits=0,attempts=0;
  for(let i=0;i<L;i++) {
    const base=table[pgState[i]][plaintext[i]];
    decodedBefore.push(base);
    let c=base;
    if(i>=6&&c===cipher[i-1]) {
      attempts++;
      if(random.u()<0.81) {
        const repaired=((24-2*cipher[i-6])%N+N)%N;
        if(repaired!==base)edits++;
        c=repaired;
      }
    }
    cipher.push(c);
  }
  const basePairs=countPairs(plaintext,clocks.page).ordered;
  const secretPairs=countPairs(decodedBefore,clocks.page).ordered;
  assert.equal(basePairs,secretPairs); // all-secret permutation invariant
  samples.push({edits,attempts,basePairs,
    outputPairs:countPairs(cipher,clocks.page).ordered});
}
const statistic=field=>{
  const a=samples.map(x=>x[field]);
  return {min:Math.min(...a),mean:a.reduce((s,x)=>s+x,0)/a.length,
    max:Math.max(...a)};
};
const stats={
  edits:statistic("edits"),attempts:statistic("attempts"),
  basePairs:statistic("basePairs"),outputPairs:statistic("outputPairs")
};
assert.deepEqual(stats,{
  edits:{min:312,mean:350.46,max:386},
  attempts:{min:404,mean:447.62,max:486},
  basePairs:{min:6048,mean:6353.84,max:6716},
  outputPairs:{min:5936,mean:6203.28,max:6522}
});
assert.equal(samples.filter(s=>s.outputPairs<=3594).length,0);
assert(stats.edits.max<findings.find(x=>x.clock==="page").minRequiredSymbolEdits);
console.log(JSON.stringify({sourceLength:L,referenceLength:ref.length,
  findings,repair50:stats,allRepairedSamplesAboveOriginal:true},null,2));
