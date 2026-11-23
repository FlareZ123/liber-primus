/**
 * Original 2014 1033 magic-square spectrum spells CHANGE over GP29.
 * Test its exact 5x5 GF29 change-of-basis matrix as a real cipher operator,
 * without optimizing any eigenvector, key, phase, word boundary or alphabet.
 * Node.js 22/CommonJS, zero dependencies.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(root,'resources/cicada2014-openpuff-magic-squares.txt'),'utf8');
const matrices=src.trim().split(/\r?\n\s*\r?\n/).map(block=>block.trim().split(/\r?\n/).map(row=>row.trim().split(/\s+/).map(Number)));
assert.deepEqual(matrices.map(a=>a.length),[5,7,5]);
const a=matrices[0], b=matrices[2], N=5, Q=29;
const mod=x=>(x%Q+Q)%Q;
const inv=x=>{for(let y=1;y<Q;y++)if(mod(x*y)===1)return y;throw Error('non-unit');};
const mul=(A,B)=>A.map(row=>B[0].map((_,j)=>mod(row.reduce((s,x,k)=>s+x*B[k][j],0))));
const transpose=A=>A[0].map((_,i)=>A.map(row=>row[i]));
/**
 * Reduced row echelon kernel for a simple rational eigenvalue.
 * Fix first nonzero coordinate to 1. No plaintext fitting.
 * @param {number[][]} m
 */
function eigenvector(m){
  let t=m.map(row=>row.map(mod)),pivot=[],rank=0;
  for(let j=0;j<N;j++){
    let i=t.findIndex((r,k)=>k>=rank&&r[j]!==0);
    if(i<0)continue;
    [t[rank],t[i]]=[t[i],t[rank]];
    let f=inv(t[rank][j]);t[rank]=t[rank].map(x=>mod(f*x));
    for(let k=0;k<N;k++)if(k!==rank&&t[k][j]){
      const z=t[k][j];t[k]=t[k].map((x,c)=>mod(x-z*t[rank][c]));
    }
    pivot.push(j);rank++;
  }
  const free=Array.from({length:N},(_,i)=>i).filter(i=>!pivot.includes(i));
  assert.equal(free.length,1);
  let v=new Array(N).fill(0);v[free[0]]=1;
  for(let r=rank-1;r>=0;r--)v[pivot[r]]=mod(-t[r].reduce((s,x,c)=>c===pivot[r]?s:s+x*v[c],0));
  const f=inv(v.find(x=>x!==0));return v.map(x=>mod(f*x));
}
function invert(A){
  let r=A.map((v,i)=>v.concat(Array.from({length:N},(_,j)=>Number(i===j))));
  for(let j=0;j<N;j++){
    const i=r.findIndex((row,k)=>k>=j&&row[j]!==0);
    assert.ok(i>=0,'singular source matrix');
    [r[j],r[i]]=[r[i],r[j]];
    const f=inv(r[j][j]);r[j]=r[j].map(x=>mod(x*f));
    for(let k=0;k<N;k++)if(k!==j&&r[k][j]){
      const x=r[k][j];r[k]=r[k].map((v,c)=>mod(v-x*r[j][c]));
    }
  }
  return r.map(row=>row.slice(N));
}
const ids=[5,8,24,21,18], ev=ids.map(l=>eigenvector(b.map((r,i)=>r.map((v,j)=>mod(v-(i===j?l:0))))));
const E=Array.from({length:N},(_,i)=>ev.map(v=>v[i])), Ei=invert(E);
const eigB=mul(mul(Ei,b),E);
assert.deepEqual(eigB,Array.from({length:N},(_,i)=>Array.from({length:N},(_,j)=>i===j?ids[i]:0)));
const original=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
assert.equal(ids.map(i=>original.translit[i]).join(''),'CHANGE');
// This two-square conjugacy exposes a sparse 2+2+1 decomposition:
// the 3301 square is not simultaneously diagonal, but its rational vs
// quadratic eigenpairs separate in the 1033 square's eigenbasis.
const cross=mul(mul(Ei,a),E);
assert.deepEqual(cross,[
  [24,0,9,0,0],
  [0,17,0,9,0],
  [24,0,5,0,0],
  [0,23,0,12,0],
  [0,0,0,0,24]
]);
const pg=k=>original.pages.find(p=>p.page===k).indices;
const frames={
  'p3_to_p7_5page_scroll':original.pages.filter(p=>p.page>=3&&p.page<=7).flatMap(p=>p.indices),
  'p8_single_source_page':pg(8)
};
assert.equal(frames.p3_to_p7_5page_scroll.length,1145);
assert.equal(frames.p8_single_source_page.length,255);
/** Apply one fixed 5x5 matrix in source adjacent-fives or five equal bands. */
function apply(input,M,bands){
  const L=input.length/N;
  assert.equal(L,Math.floor(L));
  const out=new Array(input.length);
  for(let k=0;k<L;k++){
    const at=Array.from({length:N},(_,j)=>bands?k+j*L:5*k+j);
    const v=at.map(i=>input[i]);
    for(let i=0;i<N;i++)out[at[i]]=mod(M[i].reduce((s,z,j)=>s+z*v[j],0));
  }
  return out;
}
function ioc(v){const n=new Array(Q).fill(0);for(const x of v)n[x]++;return n.reduce((s,k)=>s+k*(k-1),0)/(v.length*(v.length-1));}
const modes=[['E',E,Ei],['Einverse',Ei,E],['Etranspose',transpose(E),transpose(Ei)],['EinverseTranspose',transpose(Ei),transpose(E)]];
const controls=pg(57);
assert.equal(controls.length,95);
const result={basis:E,changeOfBasisA:cross,sourceWord:'CHANGE',frames:{}};
for(const [name,frame]of Object.entries(frames)){
  let tests=[];
  for(const [operator,M,Minv]of modes)for(const bands of [false,true]){
    const decoded=apply(frame,M,bands);
    assert.deepEqual(apply(decoded,Minv,bands),frame,'original roundtrip');
    // Known 95-rune source-native plaintext planted to source frame length.
    const native=Array.from({length:frame.length},(_,i)=>controls[i%controls.length]);
    const encrypted=apply(native,Minv,bands);
    assert.deepEqual(apply(encrypted,M,bands),native,'native plant');
    tests.push({operator,layout:bands?'five_bands':'adjacent_fives',ioc:ioc(decoded),first24:decoded.slice(0,24).map(j=>original.translit[j]).join('')});
  }
  assert.ok(tests.every(v=>v.ioc<0.04),name+' got native-looking collision');
  result.frames[name]={rawIoC:ioc(frame),bestIoC:Math.max(...tests.map(t=>t.ioc)),tests};
}

/* Separately frozen source-length receiver. Original p50's very first cell
 * is 3N=203, congruent to zero mod29. Treating it as a possible header leaves
 * exactly 255 cells, matching *all* unmodified original 255 p8 runes. That
 * header interpretation is provisional: seven cells have zero GP residue.
 * Use the already source-derived CHANGE basis without choosing a new cipher.
 */
const grid=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-grid-256.json'),'utf8'));
assert.equal(grid.bytes.length,256);
assert.equal(grid.bytes[0],203);
assert.equal(grid.bytes[0]%29,0);
const table255=grid.bytes.slice(1).map(v=>v%29);
const ciphertext=pg(8);
assert.equal(ciphertext.length,255);
const p50Tests=[];
for(const [operator,M]of modes)for(const bands of [false,true]){
  const key=apply(table255,M,bands);
  const matches=key.reduce((s,v,i)=>s+Number(v===ciphertext[i]),0);
  for(const sign of [-1,1]){
    const decoded=ciphertext.map((c,i)=>mod(c+sign*key[i]));
    // Exact full-register synthetic p57 native-language plant.
    const native=Array.from({length:255},(_,i)=>controls[i%controls.length]);
    const synthetic=native.map((p,i)=>mod(p-sign*key[i]));
    assert.deepEqual(synthetic.map((c,i)=>mod(c+sign*key[i])),native);
    p50Tests.push({operator,layout:bands?'five_bands':'adjacent_fives',sign,
      originalDecodedIoC:ioc(decoded),sourceSamePositionMatches:matches});
  }
}
const p50Max=Math.max(...p50Tests.map(x=>x.originalDecodedIoC));
assert.ok(Math.abs(p50Max-0.036066079975297205)<1e-10);
assert.ok(Math.max(...p50Tests.map(x=>x.sourceSamePositionMatches))<=11);
result.tableHeader255ToP8={sourceHeaderByte:203,
  totalZeroResidueTableCells:grid.bytes.filter(x=>x%29===0).length,
  bestIoC:p50Max,tests:p50Tests};


/* The five original red-numbered p36..38 units are an especially natural
 * five-channel recipient, distinct from the five-page single-stream layout.
 * The first 91 GP glyphs of each unit are unambiguously present; no padding
 * or fitted word/letter was used. Decode at each shared source offset.
 */
const numbered=[
  pg(36).slice(99,238),
  pg(37).slice(0,91),
  pg(37).slice(91,189),
  [...pg(37).slice(189,228),...pg(38).slice(0,57)],
  pg(38).slice(57,186)
];
assert.deepEqual(numbered.map(x=>x.length),[139,91,98,96,129]);
const common=91;
const fiveShare=[];
for(const [operator,M,Minv]of modes){
  const out=Array.from({length:5},()=>[]);
  for(let i=0;i<common;i++){
    const input=numbered.map(v=>v[i]);
    for(let j=0;j<5;j++)out[j].push(mod(M[j].reduce((s,x,k)=>s+x*input[k],0)));
  }
  // Source-native 91-rune positive: force one actual known p57 prose channel,
  // synthesize five coded lanes with no preselected key or fitting.
  const sourceText=controls.slice(0,common);
  const known=Array.from({length:5},(_,j)=>j===0?sourceText:
    Array.from({length:common},(_,i)=>controls[(i+7*j)%controls.length]));
  for(let i=0;i<common;i++){
    const v=known.map(row=>row[i]);
    const enc=Minv.map(row=>mod(row.reduce((s,x,k)=>s+x*v[k],0)));
    const rec=M.map(row=>mod(row.reduce((s,x,k)=>s+x*enc[k],0)));
    for(let k=0;k<5;k++)assert.equal(rec[k],v[k]);
  }
  const channelScores=out.map((row,i)=>({channel:i,ioc:ioc(row),head:row.slice(0,24).map(x=>original.translit[x]).join('')}));
  assert.ok(channelScores.every(c=>c.ioc<0.045));
  fiveShare.push({operator,channels:channelScores});
}
const maxFiveIoC=Math.max(...fiveShare.flatMap(x=>x.channels.map(c=>c.ioc)));
assert.ok(Math.abs(maxFiveIoC-0.03882783882783883)<1e-10);
result.fiveNumbered91CommonPrefix={originalUnitLengths:numbered.map(x=>x.length),
  commonRuneOffsets:common,maxIoC:maxFiveIoC,sourceNativePlantsRecovered:4*5*91,
  tests:fiveShare};

console.log(JSON.stringify(result,null,2));
console.log('PASS: 2014 CHANGE eigenbasis and two-square cross-basis, all 16 original inverses, native plants and 16 source-header p50/p8 key negatives');
