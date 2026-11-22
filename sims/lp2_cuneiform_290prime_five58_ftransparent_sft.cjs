"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-ink-annotations.json"),"utf8"));
assert.equal(corpus.pages.length,58);
assert.equal(58,2*29);
const pages = new Map(corpus.pages.map(p=>[p.page,p.indices]));
assert.deepEqual([pages.get(36).length,pages.get(37).length,pages.get(38).length],[238,228,228]);
assert.equal(corpus.pages.filter(p=>p.page<56).reduce((s,p)=>s+p.indices.length,0),12956);
assert(ink.pages.find(p=>p.page===36).large_punctuation.some(p=>p[0]===99&&p[1]===10));
assert(ink.pages.find(p=>p.page===38).large_punctuation.some(p=>p[0]===186&&p[1]===10));
const spans=[[[36,99,238]],[[37,0,91]],[[37,91,189]],[[37,189,228],[38,0,57]],[[38,57,186]]];
const passages=spans.map(parts=>parts.flatMap(([p,a,b])=>pages.get(p).slice(a,b)));
assert.deepEqual(passages.map(p=>p.length),[139,91,98,96,129]);
assert.equal(passages.flat().length,553);
const primes=[];
for(let n=2;primes.length<464;n++){let prime=true;for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}if(prime)primes.push(n);}
assert.equal(primes[463],3301);
const selected=primes.filter(p=>p>1033&&p<=3301);
assert.equal(selected.length,290);
assert.equal(selected[0],1039);
assert.equal(selected[289],3301);
assert.equal(selected.length,5*58);
const rowMajor=Array.from({length:5},(_,i)=>selected.slice(i*58,(i+1)*58).map(p=>(p-1)%29));
const columnMajor=Array.from({length:5},(_,i)=>Array.from({length:58},(_,j)=>(selected[j*5+i]-1)%29));
function feasible(cipher,key,sign){
 let phases=new Set([0]),firstFail=null;
 for(let i=0;i<cipher.length;i++){
  const next=new Set();
  for(const phase of phases){
   const c=cipher[i];
   if(c===0)next.add(phase);
   const p=(c-sign*key[phase]+58)%29;
   if(p!==0)next.add((phase+1)%58);
  }
  phases=next;
  if(!phases.size){firstFail=i;break;}
 }
 return {ok:phases.size>0,firstFail:firstFail===null?cipher.length:firstFail,finalPhases:[...phases].sort((a,b)=>a-b)};
}
function encode(plain,key,sign){
 let phase=0;
 return plain.map(p=>{if(p===0)return 0;const c=(p+sign*key[phase]+29)%29;phase=(phase+1)%58;return c;});
}
function ioc(a){const f=Array(29).fill(0);for(const x of a)f[x]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));}
function direct(cipher,key,sign){return cipher.map((c,i)=>(c-sign*key[i%58]+58)%29);}
const layouts={row_major:rowMajor,column_major:columnMajor};
const expected={row_major:{1:[95,4,60,5,43],"-1":[132,0,98,6,9]},column_major:{1:[10,54,98,56,10],"-1":[5,15,0,96,11]}};
const results={};let positiveControls=0;
const p57=pages.get(57);assert.equal(p57.length,95);
for(const [name,keys] of Object.entries(layouts)){
 results[name]={};
 for(const sign of [1,-1]){
  const outcomes=passages.map((p,i)=>feasible(p,keys[i],sign));
  const failures=outcomes.map(x=>x.firstFail);
  assert.deepEqual(failures,expected[name][sign]);
  results[name][sign]={firstImpossibleOffsets:failures,passageSurvival:outcomes.map(x=>x.ok),completeFivePassageDecode:outcomes.every(x=>x.ok),finalPhaseCounts:outcomes.map(x=>x.finalPhases.length)};
  for(let i=0;i<passages.length;i++){
   const plant=Array.from({length:passages[i].length},(_,j)=>p57[j%p57.length]);
   assert.equal(feasible(encode(plant,keys[i],sign),keys[i],sign).ok,true);
   positiveControls++;
  }
 }
}
assert.equal(positiveControls,20);
const directIoC={};
for(const [name,keys] of Object.entries(layouts)){
 directIoC[name]={};
 for(const sign of [1,-1]){
  const decoded=passages.map((p,i)=>direct(p,keys[i],sign));
  directIoC[name][sign]={wholeIoC:ioc(decoded.flat()),passageIoCs:decoded.map(ioc),first30:decoded.map(p=>p.slice(0,30).map(v=>corpus.translit[v]).join(" "))};
 }
}
const survival=passages.map((_,i)=>Object.values(results).reduce((s,l)=>s+Number(l[1].passageSurvival[i])+Number(l[-1].passageSurvival[i]),0));
assert.deepEqual(survival,[0,0,2,1,0]);
console.log(JSON.stringify({classification:"bounded 5x58 prime_echo key-schedule test; no complete five-passage decode",primeInterval:{first:selected[0],last:selected[289],count:selected.length},geometry:{passages:5,keySymbolsPerPassage:58,totalLP2Pages:58,GP29:29},originalPassageLengths:passages.map(p=>p.length),layouts:results,perPassageSurvivorsAcrossFourGlobalModels:survival,positiveControls:{source:"solved p57 native GP text",passed:positiveControls,total:20},directAdditiveIoC:directIoC,recoveredUnknownPlaintext:false},null,2));
