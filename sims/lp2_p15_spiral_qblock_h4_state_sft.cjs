'use strict';

/**
 * Agent2, 2026-11-28.
 *
 * P15 source-only spiral/H4 state gate.
 *
 * Phase A: derive state from lower red11 only.
 * Phase B: use the independently established red-origin Fibonacci-prime spiral
 *          order on the 4x4 number square, reduce cells mod29, split into q=4
 *          consecutive groups, and charge a fixed small transform family.
 *          Seven H4 output coordinates are predicted before any unknown output
 *          coordinate is read.  The eighth output is the sole harvested scalar.
 * Phase C: DH closure predicts the remaining eight outputs, page index, red
 *          origin, and the held-out upper red9 descriptors.
 *
 * No signed-2016 plaintext, unknown LP2 plaintext, fitted body key, page index,
 * upper-red value, or target language score is used to select the gate.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(
  path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));

const mod=x=>((x%29)+29)%29;
const sum=v=>mod(v.reduce((a,b)=>a+b,0));
const product=v=>v.reduce((a,b)=>mod(a*b),1);
const inv29=x=>{
  for(let y=1;y<29;y++) if(mod(x*y)===1) return y;
  throw new Error('noninvertible');
};
const invMod=(x,m)=>{
  for(let y=1;y<m;y++) if((x*y)%m===1) return y;
  throw new Error('noninvertible modulo '+m);
};
const powMod=(base,exp,m)=>{
  let b=base%m,e=exp,r=1;
  while(e){if(e&1)r=(r*b)%m;b=(b*b)%m;e=Math.floor(e/2);}
  return r;
};
const H4=([x0,x1,x2,x3])=>[
  mod(x0-x3),mod(x1-x2),mod(x1+x2),mod(x0+x3)
];
const inv2=15;
const H4inv=([y0,y1,y2,y3])=>[
  mod((y0+y3)*inv2),mod((y1+y2)*inv2),
  mod((y2-y1)*inv2),mod((y3-y0)*inv2)
];
const H2adj=([x0,x1,x2,x3])=>[
  mod(x0-x1),mod(x0+x1),mod(x2-x3),mod(x2+x3)
];
const H2adjInv=([y0,y1,y2,y3])=>[
  mod((y0+y1)*inv2),mod((y1-y0)*inv2),
  mod((y2+y3)*inv2),mod((y3-y2)*inv2)
];
const identity=x=>x.map(mod);
const desc=(vals,lengths)=>{
  let at=0;
  const out=lengths.map(L=>{
    const w=vals.slice(at,at+L);
    at+=L;
    return {L,S:sum(w),P:product(w)};
  });
  assert.equal(at,vals.length);
  return out;
};

const page=corpus.pages.find(p=>p.page===15);
assert(page);

// Phase A: lower red11 only.
const lower=desc(page.indices.slice(9,20),[4,2,5]);
assert.deepEqual(lower,[
  {L:4,S:22,P:10},
  {L:2,S:6,P:5},
  {L:5,S:5,P:0},
]);
const [w1,w2,w3]=lower;
const K=w2.L,a=w2.S,g=w2.P,q=w1.L,F=w3.P,p=w1.S+1;
assert.deepEqual({p,g,a,K,q,F},{p:23,g:5,a:6,K:2,q:4,F:0});
assert.equal(w1.P,mod(K*g));
assert.equal(w3.L,g);
assert.equal(w3.S,g);
const A=powMod(g,a,p);
const Ainv=inv29(A);
assert.deepEqual({A,Ainv},{A:8,Ainv:11});

// Exact source grid and independently established spiral:
// red 3299 -> right 3298 -> down 3296 -> left ... through all 16 cells.
const grid=[
  [3258,3222,3152,3038],
  [3278,3299,3298,2838],
  [3288,3294,3296,2472],
  [4516,1206,708,1820],
];
const spiralCoords=[
  [1,1],[1,2],[2,2],[2,1],
  [2,0],[1,0],[0,0],[0,1],
  [0,2],[0,3],[1,3],[2,3],
  [3,3],[3,2],[3,1],[3,0],
];
const spiralResidues=spiralCoords.map(([r,c])=>grid[r][c]%29);
assert.deepEqual(spiralResidues,[
  22,21,19,17, 11,1,10,3, 20,22,25,7, 22,12,17,21
]);
assert.equal(q,4);

// Seven coordinates are predicted from lower-red state before the eighth
// output (the first previously unknown state coordinate) is inspected.
const predictedPrefix=[
  g,K,Ainv,mod(K*g),
  A,mod(q*g),Ainv
];
assert.deepEqual(predictedPrefix,[5,2,11,10,8,20,11]);

const transforms=[
  ['identity',identity],
  ['H4',H4],
  ['H4inv',H4inv],
  ['H2adjacent',H2adj],
  ['H2adjacentInv',H2adjInv],
];
function applyBlocks(seq,T){
  const out=[];
  for(let i=0;i<seq.length;i+=q) out.push(...T(seq.slice(i,i+q)));
  return out;
}

// Generous finite presentation charge: the authored spiral already fixes
// red-origin start and forward direction, but charge all 16 cyclic starts and
// both directions anyway, for every canonical transform.
const variants=[];
for(const [name,T] of transforms){
  for(const reversed of [false,true]){
    const base=reversed?spiralResidues.slice().reverse():spiralResidues.slice();
    for(let start=0;start<16;start++){
      const seq=base.slice(start).concat(base.slice(0,start));
      const output=applyBlocks(seq,T);
      variants.push({
        name,reversed,start,
        prefixMatch:predictedPrefix.every((x,i)=>output[i]===x),
        output
      });
    }
  }
}
assert.equal(variants.length,160);
const prefixHits=variants.filter(v=>v.prefixMatch);
assert.deepEqual(
  prefixHits.map(v=>[v.name,v.reversed,v.start]),
  [['H4',false,0]]
);

const output=prefixHits[0].output;
assert.deepEqual(output,[
  5,2,11,10,
  8,20,11,14,
  13,26,18,27,
  1,24,0,14
]);

// Sole harvest: coordinate8 is -b.  All state after this must close DH.
const minusBexp=output[7];
const b=mod(-minusBexp);
assert.equal(b,15);
const B=powMod(g,b,p);
assert.equal(B,19);
assert.equal(powMod(B,a,p),K);
const Binv=inv29(B);
const e=invMod(b,p-1);
assert.deepEqual({B,Binv,e},{B:19,Binv:26,e:3});

// Remaining eight coordinates are now predictions, not harvested state.
const predictedSuffix=[
  mod(b-K),Binv,mod(p-g),mod(-K),
  1,mod(g+B),F,mod(-b)
];
assert.deepEqual(predictedSuffix,[13,26,18,27,1,24,0,14]);
assert.deepEqual(output.slice(8),predictedSuffix);

// The full four q-blocks admit a compact state reading.
assert.deepEqual(output,[
  g,K,Ainv,mod(K*g),
  A,mod(q*g),Ainv,mod(-b),
  mod(b-K),Binv,mod(p-g),mod(-K),
  1,mod(g+B),F,mod(-b)
]);

// Held-out source consequences.
assert.equal(page.page,b);
assert.equal(grid[1][1],3299); // source-red spiral origin; color not used above
const upper=desc(page.indices.slice(0,9),[4,5]);
assert.deepEqual(upper,[
  {L:q,S:Ainv,P:F},
  {L:g,S:A,P:Binv},
]);

console.log(JSON.stringify({
  schema:1,
  sourceOnly:true,
  lowerDescriptors:lower,
  lowerDerived:{p,g,a,A,Ainv,K,q,F},
  spiralResidues,
  predictedPrefix,
  finiteCharge:{
    tested:variants.length,
    hits:prefixHits.map(v=>({name:v.name,reversed:v.reversed,start:v.start}))
  },
  soleHarvest:{coordinateOneBased:8,value:minusBexp,meaning:'-b',b},
  dhClosure:{B,Kcheck:powMod(B,a,p),Binv,e},
  predictedSuffix,
  fullH4Tape:output,
  heldOut:{
    pageIndex:page.page,
    redOriginValue:grid[1][1],
    upperDescriptors:upper
  },
  decision:
    'Lower red11 + authored red-origin spiral predicts seven H4 coordinates; 1/160 charged transform/direction/start variants passes. One -b harvest closes DH and predicts the remaining eight outputs plus held-out p15 checks.'
},null,2));
