"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=n=>JSON.parse(fs.readFileSync(path.join(root,n),"utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json");
const annotations=read("resources/liber-primus/lp2-ink-annotations.json");
const grid=read("resources/liber-primus/lp2-grid-256.json");
const mod=n=>(n%29+29)%29;
const BLACK=[13,26,20,9,18,4,8,16,0,1,2,5,10,21,11,23,14,29,27,22,12,24,17,3,7,15,31,30,28,25,19,6];
const F31=[31,1,13,14,27,10,6,16,0,22,7,29,5,3,8,11,19,30,18,17,4,21,25,15,9,24,2,26,28,23,20,12];
const LCG8=[0,7,2,1,4,3,6,5];
const SECTION_LENGTHS=[729,1145,1729,1903,1021,1524,1589,3316];

function primes(n){
 const out=[];
 for(let x=2;out.length<n;x++){
  let ok=true;for(let d=2;d*d<=x;d++)if(x%d===0){ok=false;break;}
  if(ok)out.push(x);
 }
 return out;
}
function nativeGp(text){
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const out=[];
 for(let w of (text.toUpperCase().match(/[A-Z]+/g)||[])){
  w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
  for(let j=0;j<w.length;){
   const t=tokens.find(t=>w.startsWith(t.s,j));
   if(!t)throw Error("unmapped Gibran GP token");
   out.push(t.i);j+=t.s.length;
  }
 }
 return out;
}
function modelFor(native){
 const train=native.slice(0,40000),held=native.slice(40000),counts=new Map();let total=0;
 for(let i=2;i<train.length;i++){
  const k=train[i-2]*841+train[i-1]*29+train[i];
  counts.set(k,(counts.get(k)||0)+1);total++;
 }
 const den=total+0.1*29**3;
 const score=a=>{
  let s=0;
  for(let i=2;i<a.length;i++){
   const k=a[i-2]*841+a[i-1]*29+a[i];
   s+=Math.log(((counts.get(k)||0)+0.1)/den);
  }
  return s/(a.length-2);
 };
 const windows=a=>{
  const q=[];for(let i=0;i+256<=a.length;i+=256)q.push(score(a.slice(i,i+256)));
  q.sort((x,y)=>x-y);
  return {count:q.length,min:q[0],median:q[Math.floor(q.length/2)],max:q.at(-1),aboveNativeMin:q.filter(x=>x>=-9.131040318938505).length};
 };
 return {score,held,referenceWindows:windows(held)};
}
function main(){
 const all=corpus.pages.flatMap(p=>p.indices);
 const pageOffsets=new Map();let offset=0;
 for(const p of corpus.pages){pageOffsets.set(p.page,offset);offset+=p.indices.length;}
 const marks=[];
 for(const p of annotations.pages)for(const e of (p.large_punctuation||[]))
  if(e[1]===13)marks.push({page:p.page,local:e[0],global:pageOffsets.get(p.page)+e[0]});
 marks.sort((a,b)=>a.page-b.page||a.local-b.local);
 const bounds=[0,...marks.map(m=>m.global),all.length];
 const fragments=bounds.slice(0,-1).map((x,i)=>all.slice(x,bounds[i+1]));
 assert.equal(all.length,13136);assert.equal(marks.length,31);assert.equal(fragments.length,32);
 assert.equal(fragments.slice(0,28).flat().length,12956);
 const cuts=SECTION_LENGTHS.reduce((a,n)=>(a.push(a.at(-1)+n),a),[0]);
 assert.equal(cuts.at(-1),12956);
 assert.ok(cuts.slice(1,-1).every(x=>marks.some(m=>m.global===x)));
 const section=fragments.slice(0,28).map((f,i)=>{
  const start=bounds[i],end=bounds[i+1];
  for(let s=0;s<8;s++){
   if(f.length&&start>=cuts[s]&&end<=cuts[s+1])return s;
   if(!f.length&&start>=cuts[s]&&start<cuts[s+1])return s;
  }
  throw Error("fragment not contained in one section: "+i);
 });
 assert.equal(fragments.slice(0,28).filter(f=>f.length).length,26);
 assert.deepEqual(section,[0,0,1,1,1,1,1,1,1,1,2,3,3,3,3,4,4,5,5,5,5,6,6,6,6,7,7,7]);
 assert.equal(grid.bytes.length,256);
 const maxStart=Math.max(...grid.bytes),maxLen=Math.max(...fragments.slice(0,28).map(f=>f.length));
 const primeTable=primes(maxStart+maxLen+1);
 const tableCell=(rows,cols,f)=>grid.bytes[rows[f]*8+cols[section[f]]];

 // The cell at [fragment row, section column] selects a prime-stream start.
 // B=0 selects p_1; rune t uses p_(B+t+1)-1 mod 29.
 function primeTransform(input,rows,cols,sign){
  const out=[];let pos=0;
  for(let f=0;f<28;f++){
   const frag=fragments[f];if(!frag.length)continue;
   const B=tableCell(rows,cols,f);
   for(let t=0;t<frag.length;t++)out.push(mod(input[pos++]+sign*mod(primeTable[B+t]-1)));
  }
  assert.equal(pos,input.length);return out;
 }
 // The simpler per-fragment constant-shift interpretation of the same cell.
 function shiftTransform(input,rows,cols,projection,sign){
  const out=[];let pos=0;
  for(let f=0;f<28;f++){
   const frag=fragments[f];if(!frag.length)continue;
   const B=tableCell(rows,cols,f);
   const K=projection==="mod29"?mod(B):Math.floor(29*B/256);
   for(let t=0;t<frag.length;t++)out.push(mod(input[pos++]+sign*K));
  }
  assert.equal(pos,input.length);return out;
 }
 const control=fs.readFileSync(path.join(root,"resources/control/gibran_prophet_58585.txt"),"utf8");
 const native=nativeGp(control),model=modelFor(native);
 const unknown=fragments.slice(0,28).flat();
 const rawScore=model.score(unknown);
 const rows=[["BLACK",BLACK],["F31",F31]],cols=[["natural",Array.from({length:8},(_,i)=>i)],["LCG8",LCG8]];
 const primeVariants=[],shiftVariants=[];
 for(const [rn,r] of rows)for(const [cn,c] of cols)for(const sign of [-1,1]){
  const out=primeTransform(unknown,r,c,sign);
  primeVariants.push({row:rn,column:cn,sign,score:model.score(out),windows:model.windows(out),prefix:out.slice(0,180).map(x=>corpus.translit[x]).join("")});
 }
 for(const [rn,r] of rows)for(const [cn,c] of cols)
  for(const projection of ["mod29","floor29"])for(const sign of [-1,1]){
   const out=shiftTransform(unknown,r,c,projection,sign);
   shiftVariants.push({row:rn,column:cn,projection,sign,score:model.score(out),windows:model.windows(out),prefix:out.slice(0,180).map(x=>corpus.translit[x]).join("")});
  }
 const sort=v=>v.slice().sort((a,b)=>b.score-a.score);
 const bestPrime=sort(primeVariants)[0],bestShift=sort(shiftVariants)[0];
 const primaryPrime=primeVariants.find(x=>x.row==="BLACK"&&x.column==="natural"&&x.sign===-1);
 const primaryShift=shiftVariants.find(x=>x.row==="BLACK"&&x.column==="natural"&&x.projection==="mod29"&&x.sign===-1);

 // Both primary transforms must round-trip an independent planted GP stream.
 const plant=native.slice(1000,1000+unknown.length);
 const primeCipher=primeTransform(plant,BLACK,cols[0][1],+1);
 const primeRecovered=primeTransform(primeCipher,BLACK,cols[0][1],-1);
 const shiftCipher=shiftTransform(plant,BLACK,cols[0][1],"mod29",+1);
 const shiftRecovered=shiftTransform(shiftCipher,BLACK,cols[0][1],"mod29",-1);
 assert.deepEqual(primeRecovered,plant);
 assert.deepEqual(shiftRecovered,plant);

 const ref=model.referenceWindows;
 const selectedKeys=fragments.slice(0,28).map((f,i)=>f.length?tableCell(BLACK,cols[0][1],i):null);
 const result={
  source:{
   totalRunes:all.length,thirteenDotMarks:marks.length,fragments:fragments.length,
   unknownFragments:28,nonemptyUnknownFragments:26,unknownRunes:unknown.length,
   fragmentLengths:fragments.slice(0,28).map(f=>f.length),
   sectionLengths:SECTION_LENGTHS,sectionCuts:cuts,
   everyInternalSectionCutIsThirteenDot:cuts.slice(1,-1).every(x=>marks.some(m=>m.global===x)),
   fragmentSections:section,blackRows:BLACK.slice(0,28),selectedBlackNaturalCells:selectedKeys,
   unknownLiteralFCount:unknown.filter(x=>x===0).length,
   keyTableBytes:grid.bytes.length,maxPrimeIndexUsed:maxStart+maxLen-1
  },
  primeStartModel:{
   formula:"P_(f,t)=C_(f,t)-(prime[B_(f,s)+t+1]-1) mod 29",
   variantCount:primeVariants.length,
   scoreRange:[Math.min(...primeVariants.map(x=>x.score)),Math.max(...primeVariants.map(x=>x.score))],
   primary:primaryPrime,best:bestPrime,
   exactPlantedRoundTrip:primeRecovered.every((x,i)=>x===plant[i])
  },
  constantShiftModel:{
   formula:"P_(f,t)=C_(f,t)-K_f mod 29; K_f is B_f mod29 or floor(29*B_f/256)",
   variantCount:shiftVariants.length,
   scoreRange:[Math.min(...shiftVariants.map(x=>x.score)),Math.max(...shiftVariants.map(x=>x.score))],
   primary:primaryShift,best:bestShift,
   exactPlantedRoundTrip:shiftRecovered.every((x,i)=>x===plant[i])
  },
  languageReference:{trainRunes:40000,heldoutWindows:ref.count,min:ref.min,median:ref.median,max:ref.max},
  rawGibranTrigramNatsPerRune:rawScore,
  FRule:"Unknown-page F is an ordinary rune and consumes one position. A symbol-level F skip is not invertible without an authenticated positional/escape rule: a shifted non-F can also produce ciphertext F.",
  decision:"The fragment×section cell schedule is source-motivated, but neither its p56 prime-start stream nor the simple constant-shift interpretations recover GP prose. All candidate windows remain far below native controls."
 };
 console.log(JSON.stringify(result,null,2));
}
if(require.main===module)main();
module.exports={main};
