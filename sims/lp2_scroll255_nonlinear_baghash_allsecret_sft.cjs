'use strict';
/**
 * Conditional all-secret source bag-hash test for the fitted GF4/radix59
 * 255-word scroll -> 255 p8-rune interface. Windows 11 Node 22.
 * Arbitrary secret lookup f(T(word)) must agree at identical T.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const dir = path.join(__dirname, '..', 'resources', 'liber-primus');
/** @param {string} f @returns {string} */
const read = f => fs.readFileSync(path.join(dir,f),'utf8');
const gp = JSON.parse(read('lp2-corpus.json'));
const grid = JSON.parse(read('lp2-grid-256.json'));
const spans = read('lp2-transcription.txt').split('%');
const rune = new Map(gp.runes.map((r,i)=>[r,i]));
const words=[]; let word=[];
for(let p=3;p<=7;p++)for(const c of spans[p]){
  if(rune.has(c))word.push(rune.get(c));
  else if((c==='-'||c==='.')&&word.length){words.push(word);word=[];}
}
if(word.length)words.push(word);
assert.equal(words.length,255);
assert.deepEqual(words.flat(),gp.pages.slice(3,8).flatMap(x=>x.indices));
const alpha=grid.alphabet.replace('f','');
const tokens=grid.pages.flatMap(p=>p.tokens);
const table=tokens.map(t=>59*alpha.indexOf(t[0])+alpha.indexOf(t[1]));
assert.equal(table.length,256);
const mod=x=>(x%29+29)%29;
/** @param {number} a @param {number} b @returns {number} */
function gf4(a,b){
  let z=0;for(let i=0;i<2;i++){if((b>>>i)&1)z^=a;a<<=1;if(a&4)a^=7;}return z;
}
let state=[2,0,0,0];const addresses=[];
for(let i=0;i<255;i++){
  addresses.push(state.reduce((a,v)=>4*a+v,0));
  const next=gf4(state[0],3)^gf4(state[1],2)^gf4(state[3],3);
  state=[state[1],state[2],state[3],next];
}
assert.equal(new Set(addresses).size,255);
assert.equal(addresses.includes(0),false);
assert.deepEqual(state,[2,0,0,0]);
const output=gp.pages[8].indices.map((v,i)=>mod(v+table[addresses[i]]));
assert.deepEqual([[47,240],[48,231],[235,236],[88,179]].map(([i,j])=>[output[i],output[j]]),
  [[20,20],[8,8],[2,2],[9,9]]);
/** @param {number[]} w @param {(x:number)=>number} f @returns {number} */
const sum=(w,f)=>mod(w.reduce((a,x)=>a+f(x),0));
/** @param {number[]} w @param {(x:number)=>number} f @returns {number} */
const product=(w,f)=>w.reduce((a,x)=>mod(a*f(x)),1);
const sig={
  'rune-index-sum':w=>[sum(w,x=>x)],
  'prime-sum':w=>[sum(w,x=>gp.prime[x])],
  'ordinal-product':w=>[product(w,x=>x+1)],
  'prime-product':w=>[product(w,x=>gp.prime[x])],
  'index-sum+prime-product':w=>[sum(w,x=>x),product(w,x=>gp.prime[x])],
  'prime-sum+prime-product':w=>[sum(w,x=>gp.prime[x]),product(w,x=>gp.prime[x])],
  'index-sum+ordinal-product':w=>[sum(w,x=>x),product(w,x=>x+1)],
  'length+prime-product':w=>[w.length,product(w,x=>gp.prime[x])],
  'length+prime-sum+prime-product':w=>[w.length,sum(w,x=>gp.prime[x]),product(w,x=>gp.prime[x])],
  'length+index-sum+ordinal-product':w=>[w.length,sum(w,x=>x),product(w,x=>x+1)]
};
const expected=[
  [29,29,198],[29,29,199],[29,29,201],[29,29,199],
  [203,37,46],[203,39,47],[204,36,46],[124,64,118],
  [235,15,15],[240,11,11]
];
let k=0;
for(const [name,fn] of Object.entries(sig)){
  const groups=new Map();
  words.forEach((w,i)=>{const s=fn(w).join(',');if(!groups.has(s))groups.set(s,[]);groups.get(s).push(i);});
  let conflicts=0, errors=0, witness=null;
  for(const [name,ids] of groups){
    const freq=new Map();
    ids.forEach(i=>freq.set(output[i],(freq.get(output[i])||0)+1));
    errors+=ids.length-Math.max(...freq.values());
    if(freq.size>1){conflicts++;if(!witness){
      const i=ids[0],j=ids.find(n=>output[n]!==output[i]);
      witness={signature:name,wordIndices:[i,j],wordRunes:[words[i],words[j]],correctedRunes:[output[i],output[j]]};
    }}
  }
  assert.deepEqual([groups.size,conflicts,errors],expected[k++]);
  assert(witness);
  const secret=new Map([...groups.keys()].map((s,i)=>[s,(7*i+11)%29]));
  for(const [s,ids] of groups)for(const i of ids)assert.equal(secret.get(fn(words[i]).join(',')),secret.get(s));
  console.log(JSON.stringify({digest:name,classes:groups.size,conflicts,minimumWrongEvenWithArbitrarySecretLookup:errors,witness}));
}
// Stronger hidden-group theorem: allow independently secret GP29 input labels
// A[r], output labels B[H] and arbitrary additive source word length/page/ink
// offsets. A 29-element associative group is cyclic, so all its relabelings
// must embed into this exact GF(29) linear system.
const pageCuts=[];let pageEnd=0;
for(let p=3;p<=7;p++){pageEnd+=gp.pages[p].indices.length;pageCuts.push(pageEnd);}
const pageOf=offset=>pageCuts.findIndex(cut=>offset<cut);
const startPage=[],endPage=[];
let globalCursor=0;
for(const w of words){
  startPage.push(pageOf(globalCursor));
  endPage.push(pageOf(globalCursor+w.length-1));
  globalCursor+=w.length;
}
assert.equal(globalCursor,pageEnd);
assert(startPage.every(p=>p>=0&&p<=4));
assert(endPage.every(p=>p>=0&&p<=4));
const ink=JSON.parse(read('lp2-ink-annotations.json'));
const redOffsets=new Set();
let pageBase=0;
for(let p=3;p<=7;p++){
  const pageInk=ink.pages.find(x=>x.page===p);
  for(const span of pageInk?.red_spans||[])
    for(let k=0;k<span.length;k++)redOffsets.add(pageBase+span.start+k);
  pageBase+=gp.pages[p].indices.length;
}
assert.equal(pageBase,globalCursor);
const isRed=[];globalCursor=0;
for(const w of words){
  const colors=w.map((_,j)=>redOffsets.has(globalCursor+j));
  assert(colors.every(v=>v===colors[0]));
  isRed.push(colors[0]);
  globalCursor+=w.length;
}
assert.deepEqual(isRed.flatMap((v,i)=>v?[i]:[]),
  [0,1,2,22,176,177,178,179,250,251,252,253,254]);
const lengths=[...new Set(words.map(w=>w.length))].sort((a,b)=>a-b);
assert.deepEqual(lengths,[1,2,3,4,5,6,7,8,9,10,11,12]);
const inverse=Array(29).fill(0);
for(let i=1;i<29;i++)for(let j=1;j<29;j++)
  if(i*j%29===1)inverse[i]=j;
assert(inverse.slice(1).every(Boolean));

/**
 * Each equation is sum_r count(w,r)*A[r] - B[observedH]
 * + D[length] + E[source-page] + F[red]=0 over GF29.
 * @param {number[]} observed
 * @param {{length:boolean,page:boolean,red:boolean}} flags
 * @param {number[]} pageTypes
 * @returns {{matrix:number[][],rank:number,nullity:number,outputConstant:boolean,basis:number[][],n:number}}
 */
function groupSystem(observed,flags,pageTypes){
  const n=58+(flags.length?lengths.length:0)+(flags.page?5:0)+(flags.red?1:0);
  const matrix=words.map((w,i)=>{
    const row=Array(n).fill(0);
    w.forEach(r=>row[r]=mod(row[r]+1));
    row[29+observed[i]]=28;
    let k=58;
    if(flags.length){row[k+lengths.indexOf(w.length)]=1;k+=lengths.length;}
    if(flags.page){row[k+pageTypes[i]]=1;k+=5;}
    if(flags.red){row[k]=isRed[i]?1:0;}
    return row;
  });
  const a=matrix.map(r=>r.slice());
  const pivots=[];let rank=0;
  for(let col=0;col<n;col++){
    let pick=rank;
    while(pick<a.length&&a[pick][col]===0)pick++;
    if(pick===a.length)continue;
    [a[pick],a[rank]]=[a[rank],a[pick]];
    const inv=inverse[a[rank][col]];
    for(let j=col;j<n;j++)a[rank][j]=mod(a[rank][j]*inv);
    for(let i=0;i<a.length;i++)if(i!==rank&&a[i][col]){
      const q=a[i][col];
      for(let j=col;j<n;j++)a[i][j]=mod(a[i][j]-q*a[rank][j]);
    }
    pivots.push(col);rank++;
  }
  const pset=new Set(pivots),free=[];
  for(let i=0;i<n;i++)if(!pset.has(i))free.push(i);
  const basis=free.map(f=>{
    const v=Array(n).fill(0);v[f]=1;
    for(let i=0;i<pivots.length;i++)v[pivots[i]]=mod(-a[i][f]);
    return v;
  });
  const outputConstant=basis.every(v=>new Set(v.slice(29,58)).size===1);
  return {matrix,rank,nullity:free.length,outputConstant,basis,n};
}
const hiddenExpected=[
  {tag:'constant',flags:{length:false,page:false,red:false},rank:57,nullity:1},
  {tag:'length',flags:{length:true,page:false,red:false},rank:68,nullity:2},
  {tag:'length+page-start',flags:{length:true,page:true,red:false},rank:72,nullity:3},
  {tag:'length+page-end',flags:{length:true,page:true,red:false},rank:72,nullity:3},
  {tag:'length+page-start+red',flags:{length:true,page:true,red:true},rank:73,nullity:3},
  {tag:'length+page-end+red',flags:{length:true,page:true,red:true},rank:73,nullity:3}
];
for(const cfg of hiddenExpected){
  const ptype=cfg.tag.endsWith('end')||cfg.tag.includes('end+red')?endPage:startPage;
  const sys=groupSystem(output,cfg.flags,ptype);
  assert.equal(sys.n,58+(cfg.flags.length?12:0)+(cfg.flags.page?5:0)+(cfg.flags.red?1:0));
  // The theoretical obstruction is ALL output-label values forced equal.
  // Rank/nullity are captured as fixed, independently reproducible checks.
  assert.equal(sys.outputConstant,true);
  console.log('HIDDEN_GROUP_ALL_SECRET '+JSON.stringify({
    model:cfg.tag,sourceEquations:words.length,unknownCoefficients:sys.n,
    rank:sys.rank,nullity:sys.nullity,allPossibleOutputLabelsConstant:true
  }));
}
// Positive plant for the most expressive length+page+red model.
// The exact hidden input/output codebooks are distinct permutations.
const aSecret=Array.from({length:29},(_,i)=>mod(7*i+3));
const bSecret=Array.from({length:29},(_,i)=>mod(5*i+9));
assert.equal(new Set(aSecret).size,29);assert.equal(new Set(bSecret).size,29);
const dSecret=lengths.map(len=>mod(11*len+5));
const eSecret=Array.from({length:5},(_,p)=>mod(13*p+4));
const plant=words.map((w,i)=>mod(
  (w.reduce((sum,r)=>sum+aSecret[r],0)
  +dSecret[lengths.indexOf(w.length)]+eSecret[startPage[i]]
  +(isRed[i]?17:0)-9)*6
));
const checked=groupSystem(plant,{length:true,page:true,red:true},startPage);
const witness=[...aSecret,...bSecret,...dSecret,...eSecret,17];
assert.equal(witness.length,checked.n);
for(const row of checked.matrix)
  assert.equal(mod(row.reduce((sum,x,i)=>sum+x*witness[i],0)),0);
assert(checked.basis.some(v=>new Set(v.slice(29,58)).size>1));
console.log('HIDDEN_GROUP_PLANTED_POSITIVE '+JSON.stringify({
  symbols:plant.length,alphabetBijections:'PASS',exactEquations:checked.matrix.length,
  nonconstantOutputLabelSolution:true,rank:checked.rank,nullity:checked.nullity
}));
console.log('PASS: 10 source bag hashes and all-secret hidden-group constraints');
