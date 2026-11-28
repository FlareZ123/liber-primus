'use strict';

/**
 * Agent2, 2026-11-28.
 *
 * Source-only p15 cross-validation:
 *   - derive compact state fields from the five red words;
 *   - ignore the numeric grid's red coloring while selecting row/column;
 *   - apply the repository's pre-existing H4 to all four printed rows/columns;
 *   - predict the unique grid intersection selected by the red-word state.
 *
 * No signed 2016 plaintext, unknown LP2 plaintext, fitted key, language score,
 * or external DH tuple is read.
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
const powMod=(base,exp,m)=>{
  let b=base%m,e=exp,r=1;
  while(e){if(e&1)r=(r*b)%m;b=(b*b)%m;e=Math.floor(e/2);}
  return r;
};
const dlog=(g,target,p)=>{
  let x=1;
  for(let e=0;e<p-1;e++){if(x===target)return e;x=(x*g)%p;}
  throw new Error('no dlog');
};
const prime=n=>{
  if(n<2)return false;
  for(let d=2;d*d<=n;d++)if(n%d===0)return false;
  return true;
};
const H4=([x0,x1,x2,x3])=>[
  mod(x0-x3),mod(x1-x2),mod(x1+x2),mod(x0+x3)
];

// P15's five printed red words in natural order have lengths 4,5 | 4,2,5.
// The exact rune values come from the canonical original-page corpus.
const p15Runes=corpus.pages.find(p=>p.page===15).indices.slice(0,20);
assert.equal(p15Runes.length,20);
const redLengths=[4,5,4,2,5];
let cursor=0;
const red=redLengths.map(L=>{
  const vals=p15Runes.slice(cursor,cursor+L);
  cursor+=L;
  return {L,S:sum(vals),P:product(vals)};
});
assert.equal(cursor,20);
assert.deepEqual(red,[
  {L:4,S:11,P:0},
  {L:5,S:8,P:26},
  {L:4,S:22,P:10},
  {L:2,S:6,P:5},
  {L:5,S:5,P:0},
]);
const [top1,top2,lower1,lower2,lower3]=red;

// Derive state operands from repeated/equational structure in the red packet.
const K=lower2.L;       // 2
const a=lower2.S;       // 6
const g=lower2.P;       // 5
const q=lower1.L;       // 4
const F=lower3.P;       // 0
assert.equal(lower3.L,g);
assert.equal(lower3.S,g);
assert.equal(top2.L,g);
assert.equal(top1.L,q);
assert.equal(top1.P,F);
assert.equal(lower1.P,mod(K*g));
assert.equal(q,mod(K*K));

const p=lower1.S+1;
assert(prime(p));
const A=powMod(g,a,p);
assert.equal(A,top2.S);
assert.equal(mod(top1.S*A),1);
const Binv=top2.P;
const B=inv29(Binv);
assert.equal(powMod(B,a,p),K);
const b=dlog(g,B,p);
assert.equal(b,15);
assert.equal(powMod(g,b,p),B);

// Source-exact p15 printed number square, already established independently by
// sims/lp2_p15_fibonacci_prime_spiral_sft.cjs.  The red color is deliberately
// NOT used in selecting any row or column below.
const grid=[
  [3258,3222,3152,3038],
  [3278,3299,3298,2838],
  [3288,3294,3296,2472],
  [4516,1206,708,1820],
];
const residues=grid.map(row=>row.map(x=>x%29));
const rowH=residues.map(H4);
const colH=Array.from({length:4},(_,c)=>
  H4(Array.from({length:4},(_,r)=>residues[r][c])));

// Red-word state predicts one column: its H4 tail is g, K*g, q*g.
const expectedTail=[g,mod(K*g),mod(q*g)];
const matchingCols=[];
for(let c=0;c<4;c++){
  if(colH[c].slice(1).every((x,i)=>x===expectedTail[i])) matchingCols.push(c);
}
assert.deepEqual(matchingCols,[1]);

// Independently it predicts one row: H4 starts at g and ends at B^-1.
const matchingRows=[];
for(let r=0;r<4;r++){
  if(rowH[r][0]===g && rowH[r][3]===Binv) matchingRows.push(r);
}
assert.deepEqual(matchingRows,[1]);

// Their intersection predicts row2/column2 (1-based) before consulting color.
const predicted={row:matchingRows[0],col:matchingCols[0]};
assert.deepEqual(predicted,{row:1,col:1});
assert.equal(grid[predicted.row][predicted.col],3299);

// Only now compare with the original source annotation: 3299 is the uniquely
// red printed cell in the scan and the established Fibonacci-prime spiral
// starts there.
const establishedRedCell={row:1,col:1,value:3299};
assert.deepEqual({...predicted,value:grid[predicted.row][predicted.col]},
  establishedRedCell);

// The selected cross itself has a compact state form.
assert.deepEqual(rowH[predicted.row],[5,1,14,26]);
assert.deepEqual(colH[predicted.col],[15,5,10,20]);
assert.deepEqual(colH[predicted.col],[b,g,mod(K*g),mod(q*g)]);
assert.equal(rowH[predicted.row][0],g);
assert.equal(rowH[predicted.row][2]+g,B);
assert.equal(inv29(rowH[predicted.row][3]),B);

// The physical top edge adds independent p/e and product checks.
assert.deepEqual(rowH[0],[17,12,23,3]);
const e=rowH[0][3];
assert.equal(rowH[0][2],p);
assert.equal(rowH[0][1],mod(a*K));
assert.equal(rowH[0][0],mod(K+b));
assert.equal(e,3);

// Held-out page-index self-check: b came from discrete log, not page number.
assert.equal(corpus.pages.find(x=>x.page===15).page,b);

console.log(JSON.stringify({
  schema:1,
  sourceOnly:true,
  redWordDescriptors:red,
  derived:{
    p,g,a,b,A,B,K,e,q,F,
    Binv,
    Kg:mod(K*g),
    qg:mod(q*g),
  },
  gridResidues:residues,
  H4Rows:rowH,
  H4Columns:colH,
  predictedSpecialCell:{
    row1Based:predicted.row+1,
    column1Based:predicted.col+1,
    value:grid[predicted.row][predicted.col],
  },
  establishedRedCell:{
    row1Based:establishedRedCell.row+1,
    column1Based:establishedRedCell.col+1,
    value:establishedRedCell.value,
  },
  decision:
    'The p15 red-word state predicts the unique H4 row/column intersection at printed 3299, matching the source-red spiral origin. This is structural state evidence, not an LP2 body decoder.'
},null,2));
