#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const assert=require("node:assert/strict");
const read=p=>fs.readFileSync(p,"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table=JSON.parse(read("resources/liber-primus/lp2-grid-256.json")).bytes;
const control=read("resources/control/shakespeare_first300k.txt");
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
const p56Cipher=corpus.pages.find(p=>p.page===56).indices;
const p57Plain=corpus.pages.find(p=>p.page===57).indices;
const translit=corpus.translit;
const tokens=translit.map((t,i)=>[t,i]).sort((a,b)=>b[0].length-a[0].length);
const mod=(x,n=29)=>((x%n)+n)%n;
function encodeEnglish(text){
 const words=text.toUpperCase().match(/[A-Z]+/g)||[],out=[];
 for(let word of words){
  word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
  for(let i=0;i<word.length;){
   const token=tokens.find(([t])=>word.startsWith(t,i));
   if(!token)break;
   out.push(token[1]);i+=token[0].length;
  }
 }
 return out;
}
const anti=Array(29).fill(-1);
for(let k=0,x=1;k<28;k++,x=x*2%29)anti[x]=k;
const hist=Array(28).fill(.5);
for(const p of encodeEnglish(control.slice(0,180000)))if(p!==28)hist[anti[p+1]]++;
const histTotal=hist.reduce((a,b)=>a+b,0),prior=hist.map(x=>Math.log(28*x/histTotal));
const reference=encodeEnglish(control.slice(190000,270000)).filter(p=>p!==28);
const referenceScore=reference.reduce((s,p)=>s+prior[anti[p+1]],0)/reference.length;
function sieve(limit){
 const composite=new Uint8Array(limit+1),out=[];
 for(let p=2;p<=limit;p++){
  if(composite[p])continue;
  out.push(p);
  if(p*p<=limit)for(let n=p*p;n<=limit;n+=p)composite[n]=1;
 }
 return out;
}
const primes=sieve(600000);
function primeKey(kind,count){
 const out=[];
 for(const p of primes){
  const k=mod(kind==="prime"?p:p-1);
  if(k!==0)out.push(k);
  if(out.length>=count)break;
 }
 return out;
}
function ring(top,bottom,left,right,reverse=false){
 const a=[];
 for(let c=left;c<=right;c++)a.push(table[top*8+c]);
 for(let r=top+1;r<=bottom;r++)a.push(table[r*8+right]);
 for(let c=right-1;c>=left;c--)a.push(table[bottom*8+c]);
 for(let r=bottom-1;r>top;r--)a.push(table[r*8+left]);
 return reverse?a.reverse():a;
}
const rings=[ring(0,31,0,7),ring(1,30,1,6),ring(2,29,2,5),ring(3,28,3,4)];
const innerRow=Array.from({length:180},(_,i)=>table[(Math.floor(i/6)+1)*8+(i%6)+1]);
const tableOrders=[
 ["p50-row-major",table],
 ["p50-column-major",Array.from({length:256},(_,i)=>table[(i%32)*8+Math.floor(i/32)])],
 ["p50-outer-in-cw",rings.flat()],
 ["p50-outer-in-ccw",rings.map(r=>r.slice().reverse()).flat()],
 ["p50-inner-row-major",innerRow],
 ["p50-inner-out-cw",rings.slice(1).reverse().flat()],
 ["p50-inner-out-ccw",rings.slice(1).reverse().map(r=>r.slice().reverse()).flat()]
];
const p56Plain=[];let primeIndex=0;
for(let i=0;i<p56Cipher.length;i++){
 if(i===56){p56Plain.push(p56Cipher[i]);continue;}
 const p=primes[primeIndex++];
 p56Plain.push(mod(p56Cipher[i]-(p-1)));
}
const p56Head=p56Plain.slice(0,13).map(i=>translit[i]).join("");
const knownTextKey=p56Plain.concat(p57Plain).map(x=>x===28?0:x+1).filter(x=>x!==0);
const keys=[
 {name:"prime-mod29-zero-skipped",seq:primeKey("prime",30000)},
 {name:"totient-mod29-zero-skipped",seq:primeKey("totient",30000)}
];
for(const [name,values] of tableOrders){
 keys.push({name:name+"-mod28-plus1",seq:values.map(x=>x%28+1)});
 keys.push({name:name+"-mod29-zero-skipped",seq:values.map(x=>x%29).filter(x=>x!==0)});
}
keys.push({name:"p56+p57-known-plaintext-key",seq:knownTextKey});
const inv=Array(29).fill(0);
for(let a=1;a<29;a++)for(let b=1;b<29;b++)if(a*b%29===1)inv[a]=b;
function sampleEncrypt(plain,key,sign,clock){
 let prev=0,ptr=0;const out=[];
 for(const p of plain){
  let c;
  if(p===28){c=prev;if(clock==="all")ptr++;}
  else{c=mod(prev+sign*key[ptr%key.length]*(p+1));ptr++;}
  out.push(c);prev=c;
 }
 return out;
}
function sampleDecrypt(cipher,key,sign,clock){
 let prev=0,ptr=0;const out=[];
 for(const c of cipher){
  const d=mod(c-prev);
  if(d===0){out.push(28);if(clock==="all")ptr++;}
  else{out.push(mod(sign*d*inv[key[ptr%key.length]]-1));ptr++;}
  prev=c;
 }
 return out;
}
const sample=[0,4,28,11,3,28,19,27,2],sampleKey=[2,3,5,7,11];
for(const clock of ["all","nonzero"])for(const sign of [1,-1])
 assert.deepEqual(sampleDecrypt(sampleEncrypt(sample,sampleKey,sign,clock),sampleKey,sign,clock),sample);
function scoreCandidate(seq,sign,keyClock,keyReset){
 let previous=0,globalKey=0,score=0,scored=0,zeroSteps=0,preview="";
 for(const page of pages){
  let ptr=keyReset==="page"?0:globalKey;const plain=[];
  for(const c of page.indices){
   const d=mod(c-previous);
   if(d===0){plain.push(28);zeroSteps++;if(keyClock==="all")ptr++;}
   else{const p=mod(sign*d*inv[seq[ptr%seq.length]]-1);plain.push(p);score+=prior[anti[p+1]];scored++;ptr++;}
   previous=c;
  }
  if(keyReset==="global")globalKey=ptr;
  if(!preview)preview=plain.slice(0,120).map(i=>translit[i]).join("");
 }
 return {score:score/scored,scored,zeroSteps,preview};
}
let totalRunes=0,withinPageDoublets=0,crossPageEqual=0,last=null;
for(const page of pages){
 totalRunes+=page.indices.length;
 for(let i=1;i<page.indices.length;i++)if(page.indices[i]===page.indices[i-1])withinPageDoublets++;
 if(last!==null&&page.indices[0]===last)crossPageEqual++;
 last=page.indices[page.indices.length-1];
}
assert.equal(pages.length,55);assert.equal(totalRunes,12956);
assert.equal(withinPageDoublets,86);assert.equal(crossPageEqual,0);
assert.equal(table.length,256);assert.equal(innerRow.length,180);
assert.equal(p56Plain.length,85);assert.equal(p57Plain.length,95);
assert.ok(p56Head.startsWith("ANENDWITHIN"));
const results=[];
for(const candidate of keys){
 assert.ok(candidate.seq.length>0,candidate.name+" empty key");
 for(const sign of [1,-1])for(const keyClock of ["all","nonzero"])for(const keyReset of ["global","page"])
  results.push({name:candidate.name,sign,keyClock,keyReset,period:candidate.seq.length,...scoreCandidate(candidate.seq,sign,keyClock,keyReset)});
}
results.sort((a,b)=>b.score-a.score);
const bestTable=results.filter(r=>r.name.startsWith("p50-")).sort((a,b)=>b.score-a.score)[0];
console.log(JSON.stringify({
 pages:pages.length,totalRunes,withinPageDoublets,crossPageEqual,
 p56PlainHead:p56Head,p56Length:p56Plain.length,p57Length:p57Plain.length,
 knownTextKeyLength:knownTextKey.length,tableLength:table.length,innerLength:innerRow.length,
 referenceScore,candidates:keys.length,models:results.length,best:results[0],bestTable,top:results.slice(0,8)
},null,2));
