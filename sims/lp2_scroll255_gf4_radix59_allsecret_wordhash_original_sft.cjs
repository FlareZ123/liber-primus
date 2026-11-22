'use strict';
/**
 * All-secret GP29 word-hash test on original scroll255 -> p8 registration,
 * after the independently source-selected p7 GF4/p50 radix59 correction.
 *
 * Exhausts five entire families by GF29 rank, including unconstrained 29
 * glyph weights, 59 parity-position weights, and 88 mod3-position weights.
 * No byte, symbol, plaintext or secret weight is changed on original input.
 *
 * Windows Node22 SFT:
 *   node sims/lp2_scroll255_gf4_radix59_allsecret_wordhash_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources', 'liber-primus');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const corpus = JSON.parse(read('lp2-corpus.json'));
const grid = JSON.parse(read('lp2-grid-256.json'));
const pages = read('lp2-transcription.txt').split('%');
const runeMap = new Map(corpus.runes.map((v,i)=>[v,i]));
/** @param {number} v @returns {number} */
const mod = v => ((v % 29) + 29) % 29;
const words = [];
let current = [];
for(let p=3;p<=7;p++){
  for(const ch of pages[p]){
    if(runeMap.has(ch)){
      current.push(runeMap.get(ch));
    }else if((ch==='-'||ch==='.')&&current.length){
      words.push(current);
      current=[];
    }
  }
}
if(current.length)words.push(current);
assert.equal(words.length,255);
assert.equal(words.flat().length,1145);
assert.deepEqual(words.flat(),corpus.pages.slice(3,8).flatMap(p=>p.indices));
const target=corpus.pages[8].indices;
assert.equal(target.length,255);
const redWords=[[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]];
const products=redWords.map(word=>word.reduce((v,x)=>v*x%29,1));
assert.deepEqual(products,[11,26,8,15,2]);
assert.deepEqual(corpus.pages[7].indices.slice(194),redWords.flat());
const alphabet59=grid.alphabet.replace('f','');
assert.equal(alphabet59.length,59);
const table=grid.pages.flatMap(p=>p.tokens).map(token=>
  59*alphabet59.indexOf(token[0])+alphabet59.indexOf(token[1]));
assert.equal(table.length,256);
assert(table.every(v=>v>=0&&v<=251));
/** @param {number} a @param {number} b @returns {number} */
function gf4mul(a,b){
  let result=0;
  for(let k=0;k<2;k++){
    if((b>>>k)&1)result^=a;
    a<<=1;
    if(a&4)a^=7;
  }
  return result;
}
const taps=products.slice(0,4).map(v=>v%4);
let state=[products[4]%4,0,0,0];
const addresses=[];
for(let i=0;i<255;i++){
  addresses.push(state.reduce((v,digit)=>4*v+digit,0));
  let feedback=0;
  for(let k=0;k<4;k++)feedback^=gf4mul(state[k],taps[k]);
  state=[state[1],state[2],state[3],feedback];
}
assert.deepEqual(state,[2,0,0,0]);
assert.equal(new Set(addresses).size,255);
assert(!addresses.includes(0));
const key=addresses.map(i=>table[i]);
const corrected=target.map((v,i)=>mod(v+key[i]));
const repeated=[[47,240],[48,231],[235,236]];
for(const [i,j] of repeated){
  assert.deepEqual(words[i],words[j]);
  assert.equal(corrected[i],corrected[j]);
}
assert.deepEqual(repeated.map(([i])=>corrected[i]),[20,8,2]);
assert.deepEqual(corrected.map((v,i)=>mod(v-key[i])),target);

/** @param {number[][]} rows @param {number} columns @returns {{rank:number,inconsistent:boolean,solution:number[],pivotIndices:number[],contradictionCount:number}} */
function solve(rows,columns){
  const matrix=rows.map(v=>v.map(mod));
  const pivotIndices=[];
  const pivotColumns=[];
  let rank=0;
  for(let col=0;col<columns;col++){
    let candidate=rank;
    while(candidate<matrix.length&&matrix[candidate][col]===0)candidate++;
    if(candidate===matrix.length)continue;
    [matrix[rank],matrix[candidate]]=[matrix[candidate],matrix[rank]];
    let inverse=1;
    while(mod(inverse*matrix[rank][col])!==1)inverse++;
    for(let j=col;j<=columns;j++)
      matrix[rank][j]=mod(matrix[rank][j]*inverse);
    for(let i=0;i<matrix.length;i++){
      if(i===rank||matrix[i][col]===0)continue;
      const factor=matrix[i][col];
      for(let j=col;j<=columns;j++)
        matrix[i][j]=mod(matrix[i][j]-factor*matrix[rank][j]);
    }
    pivotColumns.push(col);
    rank++;
  }
  const contradictionCount=matrix.slice(rank)
    .filter(r=>r.slice(0,columns).every(x=>x===0)&&r[columns]!==0).length;
  const solution=Array(columns).fill(0);
  for(let i=0;i<rank;i++)solution[pivotColumns[i]]=matrix[i][columns];
  return {rank,inconsistent:contradictionCount>0,solution,pivotIndices,contradictionCount};
}
/** @param {number[]} w @param {number} modClasses @returns {number[]} */
function counts(w,modClasses){
  const x=Array(29*modClasses).fill(0);
  for(let i=0;i<w.length;i++)x[29*(i%modClasses)+w[i]]++;
  return x;
}
/** @param {number[]} row @param {number[]} coefficients @returns {number} */
function apply(row,coefficients){
  return mod(row.reduce((s,v,i)=>s+v*coefficients[i],0));
}
const families={
  'allsecret-29-glyph-sum':w=>counts(w,1),
  'allsecret-29-glyph-sum-plus-intercept':w=>[...counts(w,1),1],
  'allsecret-29-glyph-sum-plus-first-last':w=>[
    ...counts(w,1),...counts(w.slice(0,1),1),
    ...counts(w.slice(-1),1),1],
  'allsecret-58-glyph-odd-even':w=>[...counts(w,2),1],
  'allsecret-87-glyph-position-mod3':w=>[...counts(w,3),1]
};
const result=[];
for(const [name,representation] of Object.entries(families)){
  const features=words.map(representation);
  const cols=features[0].length;
  assert(features.every(v=>v.length===cols));
  const rows=features.map((f,i)=>[...f,corrected[i]]);
  const original=solve(rows,cols);
  assert(original.inconsistent,name+': original system rejects all secret weights');
  // First maximal independent set of feature rows (not ciphertext fit):
  // select by rank without consulting original values and fit only those.
  const independent=[];
  const basis=[];
  for(let i=0;i<255;i++){
    const candidate=features[i].map(mod);
    for(const existing of basis){
      const factor=candidate[existing.pivot];
      if(factor){
        for(let j=existing.pivot;j<cols;j++)
          candidate[j]=mod(candidate[j]-factor*existing.row[j]);
      }
    }
    const pivot=candidate.findIndex(v=>v!==0);
    if(pivot<0)continue;
    let inverse=1;
    while(mod(inverse*candidate[pivot])!==1)inverse++;
    for(let j=pivot;j<cols;j++)candidate[j]=mod(candidate[j]*inverse);
    basis.push({pivot,row:candidate});
    basis.sort((a,b)=>a.pivot-b.pivot);
    independent.push(i);
  }
  assert.equal(basis.length,original.rank);
  const trained=solve(independent.map(i=>rows[i]),cols);
  assert.equal(trained.inconsistent,false);
  assert.equal(trained.rank,original.rank);
  const hold=rows.filter((r,i)=>!independent.includes(i));
  const predicted=hold.filter(r=>apply(r.slice(0,cols),trained.solution)===r[cols]).length;
  // Positive control with 100% authentic source features and unconstrained,
  // fixed arbitrary secret coefficients from a position-local formula.
  const secret=Array.from({length:cols},(_,i)=>(i*13+7+(i*i)%29)%29);
  const planted=features.map(f=>apply(f,secret));
  const solved=solve(features.map((f,i)=>[...f,planted[i]]),cols);
  assert.equal(solved.inconsistent,false);
  assert.equal(solved.rank,original.rank);
  assert.equal(features.filter((f,i)=>apply(f,solved.solution)===planted[i]).length,255);
  result.push({name,secretCoefficients:cols,originalRank:original.rank,
    originalContradictions:original.contradictionCount,
    independentTrainingRows:independent.length,
    untouchedMatches:predicted,untouchedTotal:hold.length,
    plantedOriginalFeatureMatches:255});
}
console.log(JSON.stringify({originalWordCount:words.length,
  originallyMatchedDuplicateClasses:3,
  correctedDuplicateValues:repeated.map(([i])=>corrected[i]),
  originalHiddenKeyTableCells:table.length,
  originalGF4States:addresses.length,
  summary:result},null,2));
console.log('PASS: all five all-secret original GP29 word-hash families inconsistent, 255/255 source-native planted controls.');
