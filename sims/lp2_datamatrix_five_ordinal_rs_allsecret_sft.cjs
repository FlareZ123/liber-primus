"use strict";
/**
 * Exact five-source-ordinal ECC200 80x80 original ciphertext exclusion.
 * GP29 rune-to-bit lookups are independently arbitrary at four public
 * row/column-parity phases. All 32 conventional scans/orientations and all
 * 32 bit assignments at the five nonrunic Arabic-ordinal slots are tested.
 *
 * Algorithm references: ISO/IEC 16022 ECC200 and ZXing's Apache-2.0
 * DefaultPlacement / ErrorCorrection implementations, independently written
 * for this finite source test. Node.js 22 CommonJS, no writes.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const original=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(original.length,12956);
assert.deepEqual(original.slice(6555,6561),original.slice(-6));
const slots=[2244,2384,2476,2575,2672];
const source=original.slice(6561);
assert.equal(source.length,6395);
for(let i=0;i<5;i++)source.splice(slots[i],0,29+i);
assert.equal(source.length,6400);
/** @param {number} r @param {number} c */
const finder=(r,c)=>{
  const y=r%20,x=c%20;
  if(x===0||y===19)return 1;
  if(y===0)return x%2===0?1:0;
  if(x===19)return y%2===1?1:0;
  return null;
};
/** @param {number} i @param {number} t */
function route(i,t){
  const a=i%80,b=Math.floor(i/80);
  if(t===0)return [b,a];
  if(t===1)return [b,b%2===0?a:79-a];
  if(t===2)return [a,b];
  return [b%2===0?a:79-a,b];
}
/** @param {number} r @param {number} c @param {number} sym */
function orient(r,c,sym){
  switch(sym){
    case 0:return [r,c];case 1:return [r,79-c];
    case 2:return [79-r,c];case 3:return [79-r,79-c];
    case 4:return [c,r];case 5:return [c,79-r];
    case 6:return [79-c,r];case 7:return [79-c,79-r];
    default:throw Error("Unknown symmetry");
  }
}
/** @param {number} r @param {number} c */
const phase=(r,c)=>2*(r%2)+(c%2);
/** @param {number} r @param {number} c */
const phaseBit=(r,c)=>r%2===0&&c%2===1?0:1;

// The original mandatory finder modules determine all four completely
// unrestricted rune-to-bit lookup tables: 4 × 29 = 116 hidden entries.
let examined=0;
for(let t=0;t<4;t++)for(let sym=0;sym<8;sym++){
  const constraints=Array.from({length:116},()=>[0,0]);
  let ordinalFinder=0,sourceFinder=0;
  for(let i=0;i<6400;i++){
    const [r,c]=orient(...route(i,t),sym),bit=finder(r,c);
    if(bit===null)continue;
    if(source[i]>=29){ordinalFinder++;continue;}
    constraints[phase(r,c)*29+source[i]][bit]++;
    sourceFinder++;
  }
  assert.equal(ordinalFinder,0);
  assert.equal(sourceFinder,1216);
  assert(constraints.every(([zero,one])=>(zero>0)!==(one>0)));
  for(let phaseId=0;phaseId<4;phaseId++)
    for(let rune=0;rune<29;rune++)
      assert.equal(constraints[phaseId*29+rune][1]>0?1:0,
        phaseBit(Math.floor(phaseId/2),phaseId%2));
  examined++;
}
assert.equal(examined,32);

// Independently reconstruct the ECC200 symbol-character Utah/corner map
// on the 72x72 payload inside sixteen 18x18 data regions.
const N=72;
const map=Array.from({length:N},()=>Array(N).fill(null));
/** @param {number} r @param {number} c @param {number} word @param {number} bit */
function put(r,c,word,bit){
  if(r<0){r+=N;c+=4-((N+4)%8);}
  if(c<0){c+=N;r+=4-((N+4)%8);}
  assert(r>=0&&r<N&&c>=0&&c<N);
  assert.equal(map[r][c],null);
  map[r][c]={word,bit};
}
/** @param {number} r @param {number} c @param {number} pos */
function utah(r,c,pos){
  const p=[[r-2,c-2],[r-2,c-1],[r-1,c-2],[r-1,c-1],
    [r-1,c],[r,c-2],[r,c-1],[r,c]];
  p.forEach(([x,y],i)=>put(x,y,pos,i));
}
const corners=[
  [[N-1,0],[N-1,1],[N-1,2],[0,N-2],[0,N-1],[1,N-1],[2,N-1],[3,N-1]],
  [[N-3,0],[N-2,0],[N-1,0],[0,N-4],[0,N-3],[0,N-2],[0,N-1],[1,N-1]],
  [[N-3,0],[N-2,0],[N-1,0],[0,N-2],[0,N-1],[1,N-1],[2,N-1],[3,N-1]],
  [[N-1,0],[N-1,N-1],[0,N-3],[0,N-2],[0,N-1],[1,N-3],[1,N-2],[1,N-1]]
];
/** @param {number} kind @param {number} pos */
function corner(kind,pos){
  corners[kind].forEach(([r,c],bit)=>put(r,c,pos,bit));
}
let row=4,col=0,index=0;
do{
  if(row===N&&col===0)corner(0,index++);
  if(row===N-2&&col===0&&N%4!==0)corner(1,index++);
  if(row===N-2&&col===0&&N%8===4)corner(2,index++);
  if(row===N+4&&col===2&&N%8===0)corner(3,index++);
  do{
    if(row<N&&col>=0&&map[row][col]===null)utah(row,col,index++);
    row-=2;col+=2;
  }while(row>=0&&col<N);
  row++;col+=3;
  do{
    if(row>=0&&col<N&&map[row][col]===null)utah(row,col,index++);
    row+=2;col-=2;
  }while(row<N&&col>=0);
  row+=3;col++;
}while(row<N||col<N);
if(map[N-1][N-1]===null){
  map[N-1][N-1]={fixed:1};map[N-2][N-2]={fixed:1};
}
assert.equal(index,648);
const wordBits=Array(648).fill(0);
for(let r=0;r<N;r++)for(let c=0;c<N;c++){
  const cell=map[r][c];assert(cell&&!cell.fixed);
  assert(cell.word<648);wordBits[cell.word]++;
}
assert(wordBits.every(v=>v===8));

// GF(256) uses the ECC200 primitive polynomial 0x12d, generator roots
// alpha^1 through alpha^48 for each 114-data+48-error block.
const exp=[1],log=Array(256).fill(-1);
for(let i=1;i<255;i++){
  const v=exp[i-1]*2;
  exp.push(v>=256?v^0x12d:v);
}
exp.forEach((v,i)=>log[v]=i);
const mul=(a,b)=>a===0||b===0?0:exp[(log[a]+log[b])%255];
let generator=[1];
for(let i=1;i<=48;i++){
  const next=Array(generator.length+1).fill(0);
  for(let k=0;k<generator.length;k++){
    next[k]^=generator[k];
    next[k+1]^=mul(generator[k],exp[i]);
  }
  generator=next;
}
/** @param {number[]} data */
function parity(data){
  assert.equal(data.length,114);
  const work=[...data,...Array(48).fill(0)];
  for(let i=0;i<114;i++){
    const z=work[i];
    for(let k=0;k<49;k++)work[i+k]^=mul(z,generator[k]);
  }
  return work.slice(114);
}
/** @param {number[]} block */
function syndrome(block){
  assert.equal(block.length,162);
  let failures=0;
  for(let k=1;k<=48;k++){
    let value=0;
    for(const byte of block)value=mul(value,exp[k])^byte;
    if(value!==0)failures++;
  }
  return failures;
}
/** @param {number[]} codewords */
function failureCount(codewords){
  let bad=0;
  for(let b=0;b<4;b++){
    const words=[
      ...Array.from({length:114},(_,i)=>codewords[4*i+b]),
      ...Array.from({length:48},(_,i)=>codewords[456+4*i+b])
    ];
    bad+=syndrome(words);
  }
  return bad;
}
const planted=Array(648).fill(0);
for(let b=0;b<4;b++){
  const data=Array.from({length:114},(_,i)=>(i*37+b*17+3*i*i)&255);
  const ecc=parity(data);
  assert.equal(syndrome([...data,...ecc]),0);
  for(let i=0;i<114;i++)planted[4*i+b]=data[i];
  for(let i=0;i<48;i++)planted[456+4*i+b]=ecc[i];
}
assert.equal(failureCount(planted),0);
const roundtrip=Array(648).fill(0);
for(let r=0;r<72;r++)for(let c=0;c<72;c++){
  const {word,bit}=map[r][c];
  const imageBit=(planted[word]>>(7-bit))&1;
  roundtrip[word]|=imageBit<<(7-bit);
}
assert.deepEqual(roundtrip,planted);

// The finder-forced raster is independent of the original rune identities.
// The five Arabic numerals are granted five unconstrained bit values.
const encoded=Array(648).fill(0);
for(let r=0;r<72;r++)for(let c=0;c<72;c++){
  const R=Math.floor(r/18)*20+1+r%18;
  const C=Math.floor(c/18)*20+1+c%18;
  const {word,bit}=map[r][c];
  encoded[word]|=phaseBit(R,C)<<(7-bit);
}
/** @param {number} r @param {number} c */
function mapping(r,c){
  const dy=r%20,dx=c%20;
  assert(dy>=1&&dy<=18&&dx>=1&&dx<=18);
  return map[Math.floor(r/20)*18+dy-1][Math.floor(c/20)*18+dx-1];
}
let tested=0,minimum=192,maximum=0,winners=[];
for(let t=0;t<4;t++)for(let sym=0;sym<8;sym++){
  const ordinals=slots.map(i=>mapping(...orient(...route(i,t),sym)));
  for(let mask=0;mask<32;mask++){
    const candidate=encoded.slice();
    for(let j=0;j<5;j++)if(mask&(1<<j)){
      const {word,bit}=ordinals[j];
      candidate[word]^=1<<(7-bit);
    }
    const bad=failureCount(candidate);
    if(bad<minimum){minimum=bad;winners=[{route:t,sym,mask}];}
    else if(bad===minimum)winners.push({route:t,sym,mask});
    maximum=Math.max(maximum,bad);
    tested++;
  }
}
assert.equal(tested,1024);
assert.equal(minimum,187);
assert.equal(maximum,192);
assert.deepEqual(winners,[{route:0,sym:6,mask:30},{route:2,sym:2,mask:30}]);
console.log(JSON.stringify({
  originalRunes:12956,terminalSourceRunes:6395,
  ordinalInsertionSlots:slots,
  mandatoryRuneFinderModulesPerVariant:1216,
  lookupEntriesForcedPerVariant:116,
  independentLookupEntriesRemaining:0,
  routesOrientations:32,freeOrdinalBitAssignments:32,
  completeECC200OriginalCases:tested,
  minNonzeroReedSolomonSyndromes:minimum,
  maxNonzeroReedSolomonSyndromes:maximum,
  bestSourceCases:winners,
  trueECC200PositivePlantSyndromes:failureCount(planted),
  recoveredOriginalPlaintext:false
},null,2));
