'use strict';

/**
 * Agent2, 2026-11-28.
 *
 * Strong causal p15 gate:
 *   Phase A reads ONLY the lower red11 rune span (p15 offsets 9..19).
 *   Phase B uses its derived fields to make fixed H4 row/column predictions
 *   on the established 4x4 printed number grid while ignoring cell color.
 *   Exactly one unknown scalar, B, is harvested from a column selected by
 *   three already-known coordinates; DH algebra then fixes b and e.
 *   The complete H4 row/column state templates, red 3299 cell, physical page
 *   index, and separated upper red9 span are all checked afterward.
 *
 * No signed-2016 plaintext, unknown LP2 plaintext, fitted key, language model,
 * external DH tuple, upper-red-span value, page index, or red-cell color is
 * used to select the Phase-B state.
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
const dlog=(base,target,m)=>{
  let x=1;
  for(let e=0;e<m-1;e++){if(x===target)return e;x=(x*base)%m;}
  throw new Error('no discrete logarithm');
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

// Charge obvious repository-native numeric conventions before interpretation.
const lowerGp1=descriptors(lowerRunes.map(x=>mod(x+1)),[4,2,5]);
const lowerPrime29=descriptors(
  lowerRunes.map(x=>mod(corpus.prime[x])),[4,2,5]);
const lowerIdentityChecks=ds=>{
  const [x,y,z]=ds;
  const K0=y.L,a0=y.S,g0=y.P,q0=x.L,F0=z.P;
  return {
    repeatedG:z.L===g0&&z.S===g0,
    Kg:x.P===mod(K0*g0),
    qEqK2:q0===K0*K0,
    F:F0,pCandidate:x.S+1,a:a0,g:g0
  };
};
const representationCharge=[
  ['GP0',lower],['GP1',lowerGp1],['primeMod29',lowerPrime29]
].map(([name,ds])=>({name,descriptors:ds,checks:lowerIdentityChecks(ds)}));
assert.deepEqual(
  representationCharge.filter(x=>x.checks.repeatedG&&x.checks.Kg)
    .map(x=>x.name),
  ['GP0']
);

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

// ---------- Phase B: numeric grid, color-blind ----------
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

// A complete row is predicted from lower-red fields alone.
const knownRow=[q,mod(-K),mod(g+K),mod(p-g)];
const knownRowHits=[];
for(let r=0;r<4;r++) if(rowH[r].every((x,i)=>x===knownRow[i]))
  knownRowHits.push(r);
assert.deepEqual(knownRowHits,[2]);
assert.deepEqual(knownRow,[4,27,7,18]);

// Three known coordinates select a unique column.  Only its middle scalar is
// harvested; call that source value B and immediately demand the DH closure.
const partialColumnHits=[];
for(let c=0;c<4;c++){
  const v=colH[c];
  if(v[0]===mod(p-g)&&v[2]===mod(a*K)&&v[3]===K)
    partialColumnHits.push(c);
}
assert.deepEqual(partialColumnHits,[0]);
const B=colH[partialColumnHits[0]][1];
assert.equal(B,19);
assert.equal(powMod(B,a,p),K);

// b and e now follow algebraically, not from page number or another grid cell.
const b=dlog(g,B,p);
const e=invMod(b,p-1);
const Binv=inv29(B);
assert.equal(b,15);
assert.equal(e,3);

// With B/b/e fixed, every transformed column is an exact compact state row.
const expectedCols=[
  [mod(p-g),B,mod(a*K),K],
  [b,g,mod(K*g),mod(q*g)],
  [A,K,inv29(A),e],
  [F,mod(p-g),e,b],
];
assert.deepEqual(colH,expectedCols);

// And every transformed row is also an exact compact state row.
const expectedRows=[
  [mod(K+b),mod(a*K),p,e],
  [g,1,mod(-b),Binv],
  [q,mod(-K),mod(g+K),mod(p-g)],
  [mod(-1),g,F,mod(-b)],
];
assert.deepEqual(rowH,expectedRows);

// Red origin is now predicted without consulting color: the state row carrying
// [g,1,-b,B^-1] and the state column carrying [b,g,Kg,qg] intersect at 3299.
const redRow=rowH.findIndex(v=>v.every((x,i)=>x===expectedRows[1][i]));
const redCol=colH.findIndex(v=>v.every((x,i)=>x===expectedCols[1][i]));
assert.deepEqual([redRow,redCol],[1,1]);
assert.equal(grid[redRow][redCol],3299);

// Charge the small canonical transform family before using the harvested B.
// The lower-only complete-row plus three-coordinate column predicates jointly
// select H4 and reject identity/inverse/adjacent-pair variants.
const canonicalTransforms=[
  ['identity',identity],['H4',H4],['H4inv',H4inv],
  ['H2adjacent',H2adj],['H2adjacentInv',H2adjInv]
];
const transformCharge=canonicalTransforms.map(([name,T])=>{
  const rows=residues.map(T);
  const cols=Array.from({length:4},(_,c)=>
    T(Array.from({length:4},(_,r)=>residues[r][c])));
  const rowHits=[];
  for(let r=0;r<4;r++)
    if(rows[r].every((x,i)=>x===knownRow[i])) rowHits.push(r);
  const colHits=[];
  for(let c=0;c<4;c++){
    const v=cols[c];
    if(v[0]===mod(p-g)&&v[2]===mod(a*K)&&v[3]===K) colHits.push(c);
  }
  return {name,rowHits,colHits,joint:rowHits.length===1&&colHits.length===1};
});
assert.deepEqual(
  transformCharge.filter(x=>x.joint).map(x=>x.name),
  ['H4']
);

// Charge all eight ordinary dihedral orientations with the same pre-B
// predicates and fixed row/column roles.  Only printed orientation passes both.
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
    const rowHits=[];
    const colHits=[];
    for(let r=0;r<4;r++)
      if(rh[r].every((x,i)=>x===knownRow[i])) rowHits.push(r);
    for(let c=0;c<4;c++){
      const v=ch[c];
      if(v[0]===mod(p-g)&&v[2]===mod(a*K)&&v[3]===K) colHits.push(c);
    }
    orientationResults.push({
      turns,mirrored,rowHits,colHits,
      joint:rowHits.length===1&&colHits.length===1
    });
  }
  rotated=rotate90(rotated);
}
assert.deepEqual(
  orientationResults.filter(x=>x.joint)
    .map(x=>[x.turns,x.mirrored,x.rowHits,x.colHits]),
  [[0,false,[2],[0]]]
);

// Exhaustive presentation charge: all 4! row permutations × 4! column
// permutations, with and without transposition.  Predicates and DH closure
// remain fixed; no state expression is re-labelled per presentation.
const permute=a=>{
  if(a.length<=1)return [a.slice()];
  const out=[];
  for(let i=0;i<a.length;i++)
    for(const rest of permute(a.slice(0,i).concat(a.slice(i+1))))
      out.push([a[i],...rest]);
  return out;
};
const p4=permute([0,1,2,3]);
const transpose=m=>m[0].map((_,c)=>m.map(row=>row[c]));
const presentationCharge=[];
for(const transposed of [false,true]){
  const base=transposed?transpose(residues):residues;
  for(const rowOrder of p4) for(const colOrder of p4){
    const candidate=rowOrder.map(r=>colOrder.map(c=>base[r][c]));
    const rh=candidate.map(H4);
    const ch=Array.from({length:4},(_,c)=>
      H4(Array.from({length:4},(_,r)=>candidate[r][c])));
    const rowHits=[];
    const colHits=[];
    for(let r=0;r<4;r++)
      if(rh[r].every((x,i)=>x===knownRow[i])) rowHits.push(r);
    for(let c=0;c<4;c++){
      const v=ch[c];
      if(v[0]===mod(p-g)&&v[2]===mod(a*K)&&v[3]===K) colHits.push(c);
    }
    if(rowHits.length===1&&colHits.length===1){
      const candidateB=ch[colHits[0]][1];
      presentationCharge.push({
        transposed,rowOrder,colOrder,rowHits,colHits,candidateB,
        closesDH:powMod(candidateB,a,p)===K
      });
    }
  }
}
assert.equal(2*24*24,1152);
assert.equal(presentationCharge.length,2);
assert.deepEqual(
  presentationCharge.map(x=>[x.transposed,x.rowOrder,x.colOrder,x.candidateB,x.closesDH]),
  [
    [false,[0,1,2,3],[0,1,2,3],19,true],
    [false,[0,2,1,3],[0,1,2,3],10,false]
  ]
);
assert.deepEqual(
  presentationCharge.filter(x=>x.closesDH)
    .map(x=>[x.transposed,x.rowOrder,x.colOrder,x.candidateB]),
  [[false,[0,1,2,3],[0,1,2,3],19]]
);

// Only now compare with source annotations withheld from selection.
assert.deepEqual(
  {row:redRow,col:redCol,value:grid[redRow][redCol]},
  {row:1,col:1,value:3299}
);
assert.equal(p15.page,b); // held-out physical page self-address

// ---------- Phase C: separated upper red9 held out until now ----------
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
  schema:2,
  sourceOnly:true,
  phaseAInput:'p15 lower red11 offsets9..19 only',
  lowerDescriptors:lower,
  representationCharge,
  lowerDerived:{p,g,a,A,K,q,F},
  gridPreBPredictions:{
    fullRow:knownRow,
    fullRowHits:knownRowHits,
    partialColumnPattern:[mod(p-g),'?',mod(a*K),K],
    partialColumnHits,
    harvestedB:B
  },
  derivedAfterSingleHarvest:{B,b,e,Binv},
  H4Rows:rowH,
  expectedH4Rows:expectedRows,
  H4Columns:colH,
  expectedH4Columns:expectedCols,
  canonicalTransformCharge:transformCharge,
  dihedralOrientationResults:orientationResults,
  exhaustivePresentationCharge:{
    tested:1152,
    preClosureHits:presentationCharge,
    dhClosureHits:presentationCharge.filter(x=>x.closesDH)
  },
  predictedRedCell:{
    row1Based:redRow+1,column1Based:redCol+1,value:grid[redRow][redCol]
  },
  heldOutPageIndex:p15.page,
  heldOutUpperDescriptors:upper,
  decision:
    'Lower red11 predicts a full H4 grid row and 3/4 of one H4 column; the sole harvested B closes DH, after which all H4 rows/columns, red3299, page15, and upper red9 are exact held-out consequences.'
},null,2));
