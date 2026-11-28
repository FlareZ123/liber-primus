'use strict';

/**
 * Agent2, 2026-11-28.
 *
 * Strong causal p15 gate:
 *   Phase A reads ONLY the lower red11 rune span (p15 offsets 9..19) plus
 *   the already-established 4x4 printed number grid.  The upper red9 span
 *   is held out completely.
 *   Phase B derives DH state and predicts the red grid origin.
 *   Phase C finally opens the held-out upper red9 span and checks it against
 *   the state already derived in A/B.
 *
 * No signed-2016 plaintext, unknown LP2 plaintext, fitted key, language model,
 * external DH tuple, or upper-red-span values are used in Phase A/B.
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
const prime=n=>{
  if(n<2)return false;
  for(let d=2;d*d<=n;d++) if(n%d===0) return false;
  return true;
};
const H4=([x0,x1,x2,x3])=>[
  mod(x0-x3),mod(x1-x2),mod(x1+x2),mod(x0+x3)
];
const inv2=15; // 2^-1 mod29
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
const descriptors=(vals,lengths)=>{
  let at=0;
  const out=lengths.map(L=>{
    const word=vals.slice(at,at+L);
    at+=L;
    return {L,S:sum(word),P:product(word)};
  });
  assert.equal(at,vals.length);
  return out;
};

// ---------- Phase A: lower red11 only ----------
const p15=corpus.pages.find(p=>p.page===15);
assert(p15);
const lowerRunes=p15.indices.slice(9,20);
assert.equal(lowerRunes.length,11);
const lower=descriptors(lowerRunes,[4,2,5]);
assert.deepEqual(lower,[
  {L:4,S:22,P:10},
  {L:2,S:6,P:5},
  {L:5,S:5,P:0},
]);
const [l1,l2,l3]=lower;

const K=l2.L;       // 2
const a=l2.S;       // 6
const g=l2.P;       // 5
const q=l1.L;       // 4
const F=l3.P;       // 0
assert.equal(l3.L,g);
assert.equal(l3.S,g);
assert.equal(l1.P,mod(K*g));
assert.equal(q,K*K);

const p=l1.S+1;
assert(prime(p));
const A=powMod(g,a,p);
assert.equal(A,8);

// The exact number square is independently established from the source image
// by sims/lp2_p15_fibonacci_prime_spiral_sft.cjs.  Cell color is not used.
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

// Lower-red-derived fields select exactly one transformed column.
const expectedTail=[g,mod(K*g),mod(q*g)];
const matchingCols=[];
for(let c=0;c<4;c++)
  if(colH[c].slice(1).every((x,i)=>x===expectedTail[i])) matchingCols.push(c);
assert.deepEqual(matchingCols,[1]);

// Charge the small canonical transform family already used in the repository's
// p6 source-only serializer gates.  Keep the same state predicate fixed.
// H4 is the sole transform whose column tail can even enter the DH closure.
const canonicalTransforms=[
  ['identity',identity],['H4',H4],['H4inv',H4inv],
  ['H2adjacent',H2adj],['H2adjacentInv',H2adjInv]
];
const transformCharge=canonicalTransforms.map(([name,T])=>{
  const rows=residues.map(T);
  const cols=Array.from({length:4},(_,c)=>
    T(Array.from({length:4},(_,r)=>residues[r][c])));
  const colHits=[];
  for(let c=0;c<4;c++)
    if(cols[c].slice(1).every((x,i)=>x===expectedTail[i])) colHits.push(c);
  const closures=[];
  for(const c of colHits){
    const bc=cols[c][0];
    const Bc=powMod(g,bc,p);
    if(powMod(Bc,a,p)!==K) continue;
    const Bic=inv29(Bc);
    const rowHits=[];
    for(let r=0;r<4;r++)
      if(rows[r][0]===g&&rows[r][3]===Bic) rowHits.push(r);
    if(rowHits.length) closures.push({column:c,b:bc,B:Bc,rowHits});
  }
  return {name,colHits,closures};
});
assert.deepEqual(
  transformCharge.filter(x=>x.closures.length).map(x=>x.name),
  ['H4']
);

// The remaining head is not assigned from page number or historical DH.
// Read it from the uniquely selected grid column.
const selectedCol=colH[matchingCols[0]];
const b=selectedCol[0];
assert.equal(b,15);
const B=powMod(g,b,p);
assert.equal(B,19);
assert.equal(powMod(B,a,p),K);
const Binv=inv29(B);

// The state derived above now selects exactly one row, still without color.
const matchingRows=[];
for(let r=0;r<4;r++)
  if(rowH[r][0]===g&&rowH[r][3]===Binv) matchingRows.push(r);
assert.deepEqual(matchingRows,[1]);
const predicted={row:matchingRows[0],col:matchingCols[0]};
assert.equal(grid[predicted.row][predicted.col],3299);

// Charge all eight ordinary dihedral orientations while keeping predicates,
// row/column roles and H4 direction fixed.
const rotate90=m=>m[0].map((_,c)=>m.map(row=>row[c]).reverse());
const mirror=m=>m.map(row=>row.slice().reverse());
const orientationResults=[];
let rotated=grid.map(row=>row.slice());
for(let turns=0;turns<4;turns++){
  for(const mirrored of [false,true]){
    const candidate=mirrored?mirror(rotated):rotated.map(row=>row.slice());
    const rr=candidate.map(row=>row.map(x=>x%29));
    const rh=rr.map(H4);
    const ch=Array.from({length:4},(_,c)=>
      H4(Array.from({length:4},(_,r)=>rr[r][c])));
    const cols=[];
    for(let c=0;c<4;c++)
      if(ch[c].slice(1).every((x,i)=>x===expectedTail[i])) cols.push(c);
    // If no column passes, b/B cannot be derived in this frozen direction.
    const rows=[];
    if(cols.length===1){
      const bc=ch[cols[0]][0];
      const Bc=powMod(g,bc,p);
      if(powMod(Bc,a,p)===K){
        const Bic=inv29(Bc);
        for(let r=0;r<4;r++)
          if(rh[r][0]===g&&rh[r][3]===Bic) rows.push(r);
      }
    }
    orientationResults.push({
      turns,mirrored,cols,rows,
      joint:cols.length===1&&rows.length===1
    });
  }
  rotated=rotate90(rotated);
}
assert.deepEqual(
  orientationResults.filter(x=>x.joint)
    .map(x=>[x.turns,x.mirrored,x.rows,x.cols]),
  [[0,false,[1],[1]]]
);

// Only now compare the predicted intersection with the source-red origin.
// The established original scan has 3299 as the uniquely red numeric cell.
const establishedRedCell={row:1,col:1,value:3299};
assert.deepEqual(
  {row:predicted.row,col:predicted.col,value:grid[predicted.row][predicted.col]},
  establishedRedCell
);

// Independent physical page self-address: b came from selected grid column.
assert.equal(p15.page,b);

// The selected column/row state forms are now consequences, not inputs.
assert.deepEqual(selectedCol,[b,g,mod(K*g),mod(q*g)]);
assert.deepEqual(rowH[predicted.row],[g,1,mod(B-g),Binv]);

// The physical top numeric row adds p/e checks without the upper red runes.
assert.deepEqual(rowH[0],[17,12,23,3]);
const e=rowH[0][3];
assert.equal(rowH[0][2],p);
assert.equal(rowH[0][1],mod(a*K));
assert.equal(rowH[0][0],mod(K+b));

// ---------- Phase C: open held-out upper red9 ----------
const upperRunes=p15.indices.slice(0,9);
assert.equal(upperRunes.length,9);
const upper=descriptors(upperRunes,[4,5]);
assert.deepEqual(upper,[
  {L:q,S:inv29(A),P:F},
  {L:g,S:A,P:Binv},
]);
assert.deepEqual(upper,[
  {L:4,S:11,P:0},
  {L:5,S:8,P:26},
]);

console.log(JSON.stringify({
  schema:1,
  sourceOnly:true,
  phaseAInput:'p15 lower red11 offsets9..19 + established 4x4 printed grid; upper red9 held out',
  lowerDescriptors:lower,
  derivedBeforeUpper:{
    p,g,a,b,A,B,K,e,q,F,Binv,
    Kg:mod(K*g),qg:mod(q*g)
  },
  H4Rows:rowH,
  H4Columns:colH,
  canonicalTransformCharge:transformCharge,
  dihedralOrientationResults:orientationResults,
  predictedRedCell:{
    row1Based:predicted.row+1,
    column1Based:predicted.col+1,
    value:grid[predicted.row][predicted.col]
  },
  heldOutUpperDescriptors:upper,
  decision:
    'Lower red11 + grid H4 alone derives the DH23 exchange and predicts the red 3299 cell; only afterward the separated upper red9 exactly confirms q/A^-1/F and g/A/B^-1.'
},null,2));
