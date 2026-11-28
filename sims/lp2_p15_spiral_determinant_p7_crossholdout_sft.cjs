'use strict';

/**
 * Agent2, 2026-11-28.
 *
 * Original-only p15/p7 determinant cross-holdout.
 * P15 uses the independently decoded red-origin spiral and lower-red q=4.
 * P7 uses the pre-existing five-red-product right-circulant construction.
 * This tests a shared determinant/state invariant; it does not authenticate
 * determinant or H4 as a manuscript-wide cipher opcode.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(
  path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const mod=x=>((x%29)+29)%29;
const prod=v=>v.reduce((a,b)=>mod(a*b),1);
const sum=v=>mod(v.reduce((a,b)=>a+b,0));
const inv=x=>{for(let y=1;y<29;y++)if(mod(x*y)===1)return y;throw Error('inv');};
const invMod=(x,m)=>{for(let y=1;y<m;y++)if((x*y)%m===1)return y;throw Error('inv');};
const powMod=(base,exp,m)=>{let b=base%m,e=exp,r=1;while(e){if(e&1)r=r*b%m;b=b*b%m;e=Math.floor(e/2);}return r;};
const dlog=(base,target,m)=>{let x=1;for(let e=0;e<m-1;e++){if(x===target)return e;x=x*base%m;}throw Error('dlog');};
const H4=v=>[mod(v[0]-v[3]),mod(v[1]-v[2]),mod(v[1]+v[2]),mod(v[0]+v[3])];
const inv2=15;
const transforms=[
 ['identity',v=>v.map(mod)],
 ['H4',H4],
 ['H4inv',y=>[mod((y[0]+y[3])*inv2),mod((y[1]+y[2])*inv2),mod((y[2]-y[1])*inv2),mod((y[3]-y[0])*inv2)]],
 ['H2adjacent',v=>[mod(v[0]-v[1]),mod(v[0]+v[1]),mod(v[2]-v[3]),mod(v[2]+v[3])]],
 ['H2adjacentInv',y=>[mod((y[0]+y[1])*inv2),mod((y[1]-y[0])*inv2),mod((y[2]+y[3])*inv2),mod((y[3]-y[2])*inv2)]],
];
function detMod(matrix){
  const a=matrix.map(r=>r.map(mod));
  let det=1;
  for(let c=0;c<a.length;c++){
    let pivot=c;
    while(pivot<a.length&&!a[pivot][c])pivot++;
    if(pivot===a.length)return 0;
    if(pivot!==c){[a[pivot],a[c]]=[a[c],a[pivot]];det=mod(-det);}
    const lead=a[c][c];
    det=mod(det*lead);
    const scale=inv(lead);
    for(let j=c;j<a.length;j++)a[c][j]=mod(a[c][j]*scale);
    for(let r=c+1;r<a.length;r++){
      const f=a[r][c];
      for(let j=c;j<a.length;j++)a[r][j]=mod(a[r][j]-f*a[c][j]);
    }
  }
  return det;
}
function desc(vals,lengths){
 let at=0;return lengths.map(L=>{const w=vals.slice(at,at+L);at+=L;return{L,S:sum(w),P:prod(w)};});
}
function inverseMatrixMod(matrix){
  const n=matrix.length;
  const a=matrix.map((row,i)=>row.map(mod).concat(
    Array.from({length:n},(_,j)=>Number(i===j))));
  for(let c=0;c<n;c++){
    let pivot=c;
    while(pivot<n&&!a[pivot][c])pivot++;
    if(pivot===n)return null;
    if(pivot!==c)[a[pivot],a[c]]=[a[c],a[pivot]];
    const scale=inv(a[c][c]);
    a[c]=a[c].map(x=>mod(x*scale));
    for(let r=0;r<n;r++)if(r!==c){
      const factor=a[r][c];
      a[r]=a[r].map((x,j)=>mod(x-factor*a[c][j]));
    }
  }
  return a.map(row=>row.slice(n));
}

const p15=corpus.pages.find(p=>p.page===15);
const lower=desc(p15.indices.slice(9,20),[4,2,5]);
const K=lower[1].L,a=lower[1].S,g=lower[1].P,q=lower[0].L,F=lower[2].P,p=lower[0].S+1;
const A=powMod(g,a,p),Ainv=inv(A);
assert.deepEqual({p,g,a,A,K,q,F},{p:23,g:5,a:6,A:8,K:2,q:4,F:0});

const grid=[
 [3258,3222,3152,3038],
 [3278,3299,3298,2838],
 [3288,3294,3296,2472],
 [4516,1206,708,1820],
];
const coords=[
 [1,1],[1,2],[2,2],[2,1],
 [2,0],[1,0],[0,0],[0,1],
 [0,2],[0,3],[1,3],[2,3],
 [3,3],[3,2],[3,1],[3,0],
];
const spiral=coords.map(([r,c])=>grid[r][c]%29);
const rawMatrix=Array.from({length:q},(_,i)=>spiral.slice(i*q,(i+1)*q));
assert.deepEqual(rawMatrix,[
 [22,21,19,17],
 [11,1,10,3],
 [20,22,25,7],
 [22,12,17,21],
]);

// Candidate determinant operation on the authored q x q spiral matrix.
const rawInverse=inverseMatrixMod(rawMatrix);
assert(rawInverse);
const lowerOnlyInversePattern=[
  [K,g,mod(K+g),g],
  [null,q,null,null],
  [null,null,q,a],
  [null,null,null,Ainv],
];
for(let r=0;r<q;r++)for(let c=0;c<q;c++)
  if(lowerOnlyInversePattern[r][c]!==null)
    assert.equal(rawInverse[r][c],lowerOnlyInversePattern[r][c]);

// Charge all cyclic starts and both directions against the eight lower-only
// inverse coordinates.  Only the authored red-origin forward traversal fits.
const inverseTraversalCharge=[];
for(const reversed of [false,true]){
  const base=reversed?spiral.slice().reverse():spiral.slice();
  for(let start=0;start<16;start++){
    const seq=base.slice(start).concat(base.slice(0,start));
    const m=Array.from({length:q},(_,i)=>seq.slice(i*q,(i+1)*q));
    const candidate=inverseMatrixMod(m);
    if(!candidate)continue;
    let match=true;
    for(let r=0;r<q;r++)for(let c=0;c<q;c++){
      const want=lowerOnlyInversePattern[r][c];
      if(want!==null&&candidate[r][c]!==want)match=false;
    }
    if(match)inverseTraversalCharge.push({reversed,start,inverse:candidate});
  }
}
assert.deepEqual(
  inverseTraversalCharge.map(x=>[x.reversed,x.start]),
  [[false,0]]
);

const p15Det=detMod(rawMatrix);
assert.equal(p15Det,19);
const B=p15Det;
assert.equal(powMod(B,a,p),K);
const b=dlog(g,B,p),Binv=inv(B),e=invMod(b,p-1);
assert.deepEqual({B,b,Binv,e},{B:19,b:15,Binv:26,e:3});

assert.deepEqual(rawInverse,[
  [K,g,mod(K+g),g],
  [B,q,b,Binv],
  [e,mod(e+a),q,a],
  [b,mod(-1),mod(-b),Ainv],
]);
assert.deepEqual(rawInverse,[
  [2,5,7,5],
  [19,4,15,26],
  [3,9,4,6],
  [15,28,14,11],
]);

// Independent older p7 product circulant has the same determinant B.
const p7Products=[11,26,8,15,2];
const circulant=row=>Array.from({length:5},(_,i)=>
  Array.from({length:5},(_,k)=>row[(k-i+5)%5]));
const p7Det=detMod(circulant(p7Products));
assert.equal(p7Det,B);

// H4 is independently charged by the already-passing authored-spiral SFT.
// Here the matrix branch checks only its direct held-out H4 tape consequence.
const expectedH4Tape=[
 g,K,Ainv,mod(K*g),
 A,mod(q*g),Ainv,mod(-b),
 mod(b-K),Binv,mod(p-g),mod(-K),
 1,mod(g+B),F,mod(-b)
];
assert.deepEqual(expectedH4Tape,
 [5,2,11,10,8,20,11,14,13,26,18,27,1,24,0,14]);
const authoredH4Output=[];
for(let i=0;i<16;i+=q)authoredH4Output.push(...H4(spiral.slice(i,i+q)));
assert.deepEqual(authoredH4Output,expectedH4Tape);

// Determinant-only traversal charge is weaker, as expected: row rotations and
// reversal symmetries leave four of 32 cyclic/directional presentations at B.
const detVariants=[];
for(const reversed of [false,true]){
 const base=reversed?spiral.slice().reverse():spiral.slice();
 for(let start=0;start<16;start++){
  const seq=base.slice(start).concat(base.slice(0,start));
  const m=Array.from({length:q},(_,i)=>seq.slice(i*q,(i+1)*q));
  const d=detMod(m);
  detVariants.push({reversed,start,det:d,closes:powMod(d,a,p)===K});
 }
}
assert.equal(detVariants.filter(v=>v.closes).length,4);

console.log(JSON.stringify({
 schema:1,
 classification:'candidate matrix determinant/inverse bridge; H4 family charged in separate passing SFT',
 p15:{rawMatrix,determinant:p15Det,rawInverse,lowerOnlyInversePattern,
       inverseTraversalCharge,derived:{B,b,Binv,e}},
 p7:{products:p7Products,determinant:p7Det},
 expectedH4Tape,
 authoredH4Output,
 h4FamilyChargeReference:'sims/lp2_p15_spiral_qblock_h4_state_sft.cjs',
 determinantTraversalCharge:{tested:32,closureHits:detVariants.filter(v=>v.closes)},
 boundary:'The shared B determinant and full H4 tape are original-artifact structure; determinant/H4 remain candidate operations, not an authenticated body cipher.'
},null,2));
