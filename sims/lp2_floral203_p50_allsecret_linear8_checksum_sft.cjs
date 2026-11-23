'use strict';
/**
 * LP2 p39 double root + floral pp40–55 black 16×203 + p49–51 table:
 * all-secret GF29 linear/affine eight-column checksum compatibility.
 *
 * Original sources unchanged. A 32x8 (or affine 32x9) matrix-rank
 * comparison decides existence of ANY shared key in GF(29)^8 / GF(29)^9.
 * Standalone read-only Node22 CommonJS source test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const repo = path.resolve(__dirname,'..');
const read = p => JSON.parse(fs.readFileSync(path.join(repo,p),'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');
const table = read('resources/liber-primus/base60-grid.json');
const mod = n => ((n%29)+29)%29;
function inverse(a) {
  for(let i=1;i<29;i++) if(mod(a*i)===1) return i;
  throw Error('singular GF29 pivot');
}
const red = new Map(ink.pages.map(p=>[p.page,p.red_spans||[]]));
const p39=corpus.pages.find(p=>p.page===39);
assert.deepEqual(p39.indices.slice(119,122),[27,5,15]);
assert.equal(mod(27+5*24+15*24*24),0);
assert.equal(mod(5+30*24),0);
assert.equal(table.rows[0][0],'3N');
assert.equal(table.byte_rows[0][0],203);
assert.equal(table.byte_rows.length,32);
assert.ok(table.byte_rows.every(row=>row.length===8));
const B=table.byte_rows.map(row=>row.map(mod));
function floralBlack() {
  const b=[];
  for(let p=40;p<=55;p++){
    const source=corpus.pages.find(x=>x.page===p).indices;
    for(let j=0;j<source.length;j++)
      if(!(red.get(p)||[]).some(s=>j>=s.start&&j<s.start+s.length))
        b.push(source[j]);
  }
  assert.equal(b.length,3248);
  return b;
}
const black=floralBlack();
function checksumPairs(data){
  assert.equal(data.length,16*203);
  const append=[],prepend=[],jets=[];
  for(let row=0;row<16;row++){
    let p=0,d=0;
    for(let j=0;j<203;j++){
      const x=data[row*203+j];
      d=mod(24*d+p);p=mod(24*p+x);
    }
    const u=mod(-48*p-576*d),v=mod(-576*p-24*u);
    // X^2 P(X)+uX+v double root24.
    assert.equal(mod(24*24*p+24*u+v),0);
    assert.equal(mod(48*p+576*d+u),0);
    const a=mod(-d),b=mod(-p-24*a);
    // aX^204+bX^203+P(X), since 24^203=1, 203=0 mod29.
    assert.equal(mod(24*a+b+p),0);
    assert.equal(mod(a+d),0);
    append.push([u,v]);prepend.push([a,b]);jets.push([p,d]);
  }
  return {append,prepend,jets};
}
const checks=checksumPairs(black);
assert.deepEqual(checks.append.slice(0,8),[
  [6,3],[12,15],[25,16],[17,4],[1,6],[18,26],[25,12],[4,27]
]);
function rank(input){
  if(!input.length)return 0;
  const m=input.map(row=>row.map(mod)),cols=m[0].length;
  assert.ok(m.every(row=>row.length===cols));
  let r=0;
  for(let c=0;c<cols&&r<m.length;c++){
    let pivot=r;while(pivot<m.length&&m[pivot][c]===0)pivot++;
    if(pivot===m.length)continue;
    [m[r],m[pivot]]=[m[pivot],m[r]];
    const inv=inverse(m[r][c]);
    for(let j=c;j<cols;j++)m[r][j]=mod(m[r][j]*inv);
    for(let i=0;i<m.length;i++)if(i!==r&&m[i][c]){
      const scale=m[i][c];
      for(let j=c;j<cols;j++)m[i][j]=mod(m[i][j]-scale*m[r][j]);
    }
    r++;
  }
  return r;
}
function solveSquare(input,target){
  const n=input.length;
  assert.ok(input.every(row=>row.length===n));
  const m=input.map((row,i)=>[...row.map(mod),mod(target[i])]);
  for(let col=0;col<n;col++){
    let pivot=col;while(pivot<n&&m[pivot][col]===0)pivot++;
    assert.ok(pivot<n,'first source rows must be independent');
    [m[col],m[pivot]]=[m[pivot],m[col]];
    const inv=inverse(m[col][col]);
    for(let j=col;j<=n;j++)m[col][j]=mod(m[col][j]*inv);
    for(let i=0;i<n;i++)if(i!==col&&m[i][col]){
      const scale=m[i][col];
      for(let j=col;j<=n;j++)m[i][j]=mod(m[i][j]-scale*m[col][j]);
    }
  }
  return m.map(row=>row[n]);
}
const dot=(a,b)=>mod(a.reduce((s,v,i)=>s+v*b[i],0));
const cases=[];
for(const [type,pairs] of Object.entries({append:checks.append,prepend:checks.prepend}))
for(const layout of ['interleaved','blocked']){
  const target=layout==='interleaved'?pairs.flat():
    [...pairs.map(x=>x[0]),...pairs.map(x=>x[1])];
  assert.equal(target.length,32);
  for(const affine of [false,true]){
    const X=B.map(row=>affine?[...row,1]:row.slice());
    const baseRank=rank(X);
    const augmentedRank=rank(X.map((row,i)=>[...row,target[i]]));
    const n=affine?9:8;
    assert.equal(baseRank,n);
    assert.equal(augmentedRank,n+1);
    const w=solveSquare(X.slice(0,n),target.slice(0,n));
    for(let i=0;i<n;i++)assert.equal(dot(X[i],w),target[i]);
    const nextPred=dot(X[n],w),nextRequired=target[n];
    assert.notEqual(nextPred,nextRequired);
    cases.push({type,layout,affine,baseRank,augmentedRank,weights:w,
      training:n,firstHeldoutRow:n+1,firstHeldoutPredicted:nextPred,
      firstHeldoutRequired:nextRequired,
      sourceMatches:X.reduce((a,row,i)=>a+Number(dot(row,w)===target[i]),0)});
  }
}
assert.equal(cases.length,8);
// Source-native positive: clear p57 GP29 paragraph repeated to 3248,
// then seven copied source bytes per new row and a manufactured eighth
// cell determined by a fixed hidden all-eight-column linear key.
const p57=corpus.pages.find(p=>p.page===57).indices;
assert.equal(p57.length,95);
const plant=Array.from({length:3248},(_,i)=>p57[i%95]);
const target=checksumPairs(plant).append.flat();
const trueW=[2,3,5,7,11,13,17,19];
const plantedB=B.map((row,i)=>{
  const out=row.slice();
  out[7]=mod((target[i]-dot(out.slice(0,7),trueW.slice(0,7)))*inverse(trueW[7]));
  return out;
});
assert.equal(rank(plantedB),8);
assert.equal(rank(plantedB.map((row,i)=>[...row,target[i]])),8);
const recovered=solveSquare(plantedB.slice(0,8),target.slice(0,8));
assert.deepEqual(recovered,trueW);
assert.ok(plantedB.every((row,i)=>dot(row,recovered)===target[i]));
console.log(JSON.stringify({
  status:'PASS',blackRunes:black.length,
  source:'p39 red double root24; p40–55 floral black16x203; p49–51 32x8',
  originalCases:cases,
  positive:{nativeP57Runes:95,recoveredWeights:recovered,matchedChecks:32},
  decision:'All eight original fixed linear/affine table-combiner families inconsistent. No original plaintext.'
},null,2));
