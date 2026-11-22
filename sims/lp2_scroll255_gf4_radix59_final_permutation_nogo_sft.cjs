'use strict';
/**
 * SFT: exact no-go for ALL additive positional word maps with an arbitrary
 * secret final GP29 output permutation, under the conditional p3-p8 255/GF4/
 * p50 radix59 receiver. Includes unrestricted twelve positional alphabets.
 * Windows Node22, CommonJS, read-only; only committed original-derived data.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(base, 'lp2-grid-256.json'), 'utf8'));
const parts = fs.readFileSync(path.join(base, 'lp2-transcription.txt'), 'utf8').split('%');
const runeMap = new Map(corpus.runes.map((rune,i)=>[rune,i]));
const words = [];
let word = [];
for (let page=3;page<=7;page++) for (const c of parts[page]) {
  if (runeMap.has(c)) word.push(runeMap.get(c));
  else if ((c==='-'||c==='.') && word.length) {
    words.push(word);
    word=[];
  }
}
if(word.length) words.push(word);
assert.equal(words.length,255);
assert.equal(words.reduce((s,w)=>s+w.length,0),1145);
assert.equal(Math.max(...words.map(w=>w.length)),12);
const target=corpus.pages.find(p=>p.page===8).indices;
assert.equal(target.length,255);
const alphabet=grid.alphabet.replace('f','');
assert.equal(alphabet.length,59);
const tokens=grid.pages.flatMap(p=>p.tokens);
assert.equal(tokens.length,256);
const table=tokens.map(t=>59*alphabet.indexOf(t[0])+alphabet.indexOf(t[1]));
const mod=n=>(n%29+29)%29;
function gf4(a,b) {
  let s=0;
  for(let k=0;k<2;k++){
    if((b>>k)&1)s^=a;
    a<<=1;
    if(a&4)a^=7;
  }
  return s;
}
let state=[2,0,0,0];
const addresses=[];
for(let i=0;i<255;i++){
  addresses.push(state.reduce((s,v)=>4*s+v,0));
  let feedback=0;
  for(let j=0;j<4;j++)feedback^=gf4(state[j],[3,2,0,3][j]);
  state=[state[1],state[2],state[3],feedback];
}
assert.equal(new Set(addresses).size,255);
assert.deepEqual(state,[2,0,0,0]);
const H=target.map((x,i)=>mod(x+table[addresses[i]]));
assert.equal(new Set(H).size,29);
assert.deepEqual([[47,240],[48,231],[235,236],[88,179]]
  .map(([i,j])=>[H[i],H[j]]),
  [[20,20],[8,8],[2,2],[9,9]]);

/**
 * GF29 row-rank of an integer feature matrix.
 * No floating point, no fitted plaintext, no secret-key search.
 * @param {number[][]} rows
 * @param {number} columns
 */
function rank29(rows,columns) {
  const a=rows.map(row=>Uint8Array.from(row.map(mod)));
  let rank=0;
  const inv=Array.from({length:29},(_,x)=>{
    if(!x)return 0;
    for(let y=1;y<29;y++)if(x*y%29===1)return y;
    throw Error('GF29 inversion failed');
  });
  for(let col=0;col<columns;col++){
    let pivot=rank;
    while(pivot<a.length && a[pivot][col]===0)pivot++;
    if(pivot===a.length)continue;
    [a[rank],a[pivot]]=[a[pivot],a[rank]];
    const scale=inv[a[rank][col]];
    for(let j=col;j<columns;j++)a[rank][j]=a[rank][j]*scale%29;
    for(let row=rank+1;row<a.length;row++){
      const factor=a[row][col];
      if(!factor)continue;
      for(let j=col;j<columns;j++)a[row][j]=mod(a[row][j]-factor*a[rank][j]);
    }
    rank++;
    if(rank===a.length)break;
  }
  return rank;
}
function features(phases){
  const columns=29*phases+12;
  const F=words.map(w=>{
    const row=Array(columns).fill(0);
    w.forEach((rune,i)=>row[29*(i%phases)+rune]++);
    row[29*phases+w.length-1]=1;
    return row;
  });
  return {F,columns};
}
function differenceRows(F,labels){
  const seen=new Map(),D=[];
  F.forEach((row,i)=>{
    const label=labels[i];
    if(!seen.has(label)){seen.set(label,row);return;}
    const previous=seen.get(label);
    D.push(row.map((n,j)=>mod(n-previous[j])));
  });
  return D;
}
const expected=[
  [1,41,40,39],[2,70,68,67],[3,99,96,95],
  [4,128,124,123],[5,157,152,151],[6,186,177,176],
  [7,215,198,197],[8,244,200,199],[9,273,200,199],
  [10,302,200,199],[11,331,200,199],[12,360,200,199]
];
for(const [phase,numCoefficients,wantRank,wantEqualRank] of expected){
  const {F,columns}=features(phase);
  assert.equal(columns,numCoefficients);
  const full=rank29(F,columns);
  const diff=rank29(F.slice(1).map(row=>
    row.map((v,j)=>mod(v-F[0][j]))),columns);
  const equality=rank29(differenceRows(F,H),columns);
  assert.deepEqual([full,diff,equality],
    [wantRank,wantRank-1,wantEqualRank]);
  assert.equal(equality,diff,
    'Every hidden additive output is forced to equal one constant');

  // Fully original-shaped generated positive with secret maps and an arbitrary
  // bijective final substitution, including its inverse (not a null model).
  let seed=0x3301a14c;
  function next(){
    seed^=seed<<13; seed^=seed>>>17; seed^=seed<<5;
    return seed>>>0;
  }
  const secrets=Array.from({length:columns},()=>next()%29);
  const permutation=Array.from({length:29},(_,i)=>i);
  for(let i=28;i>=1;i--){
    const j=next()%(i+1);
    [permutation[i],permutation[j]]=[permutation[j],permutation[i]];
  }
  const hidden=F.map(row=>mod(row.reduce((sum,v,i)=>sum+v*secrets[i],0)));
  const synthetic=hidden.map(x=>permutation[x]);
  const positiveRank=rank29(differenceRows(F,synthetic),columns);
  assert(positiveRank<diff,
    'A genuine secret-codebook model must retain nonconstant hidden values');
  assert.deepEqual(synthetic.map((c,i)=>
    mod(hidden[i]-permutation.indexOf(c))),Array(255).fill(0));
  console.log('ALL_SECRET_NONLINEAR_FINAL_PERMUTATION_NO_GO '+JSON.stringify({
    positionalAlphabets:phase,secretCoefficients:columns,
    featureRank:full,allDifferenceRank:diff,
    originalSameOutputDifferenceRank:equality,
    originalDistinctOutputs:new Set(H).size,
    positiveSameOutputDifferenceRank:positiveRank,
    positiveDistinctOutputs:new Set(synthetic).size
  }));
}
console.log('PASS GF29 all-secret final-permutation no-go + original-shaped planted positives');
