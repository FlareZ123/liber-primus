#!/usr/bin/env node
"use strict";

/* Transfer the solved p56 prime-totient operation to the p50 table bytes:
 * K[i] = (prime[byte[i]] - 1) mod 29.
 * Tests the 158-rune p49/p51 flank, source-marked offset 10, page reset,
 * and the p56 fourth-F literal-null convention.
 * Replay: node sims/p49_p51_table_prime_index_key_gate.cjs
 */
const fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const M=29,R=.83,MAX_TOTAL=40,MAX_LOCAL=4,mod=x=>(x%M+M)%M;

function encodeWords(text,alphabet){
 const s=text.toUpperCase().replace(/K/g,"C").replace(/Q/g,"C").replace(/V/g,"U").replace(/Z/g,"S").replace(/[^A-Z]+/g," ").trim();
 const tokens=alphabet.map((token,index)=>({token,index})).sort((a,b)=>b.token.length-a.token.length),out=[];
 for(const word of s.split(/\s+/))for(let i=0;i<word.length;){
  const m=tokens.find(x=>word.startsWith(x.token,i));if(!m)throw Error("Unmapped GP spelling "+word.slice(i));
  out.push(m.index);i+=m.token.length;
 }
 return out;
}
function buildModel(text,alphabet){
 const symbols=encodeWords(text,alphabet),u=new Uint32Array(M),b=new Uint32Array(M*M),tri=new Uint32Array(M*M*M);
 for(let i=0;i<symbols.length;i++){u[symbols[i]]++;if(i)b[symbols[i-1]*M+symbols[i]]++;if(i>1)tri[(symbols[i-2]*M+symbols[i-1])*M+symbols[i]]++;}
 const q=Array.from(u,x=>(x+1)/(symbols.length+M)),unigram=new Float64Array(M),bigram=new Float64Array(M*M),trigram=new Float64Array(M*M*M);
 for(let c=0;c<M;c++)unigram[c]=Math.log(q[c]);
 for(let a=0;a<M;a++)for(let c=0;c<M;c++)bigram[a*M+c]=Math.log((b[a*M+c]+12*q[c])/(u[a]+12));
 for(let a=0;a<M;a++)for(let v=0;v<M;v++)for(let c=0;c<M;c++){const i=(a*M+v)*M+c;trigram[i]=Math.log((tri[i]+9*Math.exp(bigram[v*M+c]))/(b[a*M+v]+9));}
 return {symbols,q,unigram,bigram,trigram};
}
function primes(n){const out=[];for(let x=2;out.length<n;x++){let ok=true;for(let d=2;d*d<=x;d++)if(x%d===0){ok=false;break;}if(ok)out.push(x);}return out;}
function p56Regression(corpus){
 const cipher=corpus.pages.find(p=>p.page===56).indices;
 const expected=encodeWords("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE",corpus.translit);
 const f=cipher.map((x,i)=>x===0?i:-1).filter(i=>i>=0),ps=primes(cipher.length+29);let j=0;
 const recovered=cipher.map((x,i)=>i===f[3]?0:mod(x-(ps[j++]-1)));
 return {exact:recovered.length===expected.length&&recovered.every((x,i)=>x===expected[i]),fPositions:f};
}
function trigramScore(a,m){
 let s=0;for(let i=0;i<a.length;i++)s+=i===0?m.unigram[a[i]]:i===1?m.bigram[a[i-1]*M+a[i]]:m.trigram[(a[i-2]*M+a[i-1])*M+a[i]];
 return s/a.length;
}
function xorshift(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function shuffle(a,r){const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function directDecode(stream,key,offset,resetAt,nulls){
 let j=offset,out=[];for(let i=0;i<stream.length;i++){
  if(nulls.has(i)){out.push(0);continue;}
  if(resetAt!==null&&i===resetAt)j=offset;
  out.push(mod(stream[i]-key[j++]));
 }return out;
}
function skipLogLikelihood(cipher,key,offset,dist,nulls=new Set()){
 const state=new Float64Array(cipher.length+MAX_TOTAL+2);state[0]=1;let logp=0,encrypted=0;
 for(let t=0;t<cipher.length;t++){
  if(nulls.has(t)){logp+=Math.log(dist[0]);continue;}
  const obs=cipher[t],prev=t?cipher[t-1]:-1,next=new Float64Array(state.length);let norm=0;
  for(let e=encrypted;e<=Math.min(encrypted+MAX_TOTAL,state.length-2);e++){
   if(offset+e>=key.length)break;
   const p=mod(obs-key[offset+e]),accept=prev===obs?1-R:1;let paths=state[e];
   if(t>0){let product=R;for(let s=1;s<=MAX_LOCAL&&e-s>=encrypted;s++){
    if(offset+e-s>=key.length)break;if(mod(p+key[offset+e-s])!==prev)break;
    paths+=state[e-s]*product;product*=R;
   }}
   const v=dist[p]*accept*paths;next[e+1]+=v;norm+=v;
  }
  if(!(norm>0))return-Infinity;
  for(let j=encrypted+1;j<=Math.min(encrypted+MAX_TOTAL+1,state.length-1);j++)next[j]/=norm;
  state.set(next);logp+=Math.log(norm);encrypted++;
 }
 return logp;
}
function skipLLR(cipher,key,offset,q,nulls){
 return skipLogLikelihood(cipher,key,offset,q,nulls)-skipLogLikelihood(cipher,key,offset,new Array(M).fill(1/M),nulls);
}
function main(){
 const grid=JSON.parse(read("resources/liber-primus/base60-grid.json"));
 const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
 const transcription=read("resources/liber-primus/lp2-transcription.txt");
 const model=buildModel(read("resources/control/shakespeare_first300k.txt"),corpus.translit);
 const p49=corpus.pages.find(p=>p.page===49).indices,p51=corpus.pages.find(p=>p.page===51).indices,stream=p49.concat(p51);
 const bytes=grid.byte_rows.flat(),ps=primes(256),key=bytes.map(b=>mod(ps[b]-1));
 const f=stream.map((x,i)=>x===0?i:-1).filter(i=>i>=0),p51F=p51.map((x,i)=>x===0?i:-1).filter(i=>i>=0);
 const masks=[{name:"none",set:new Set()},{name:"global-fourth-F",set:new Set([f[3]])},{name:"p51-fourth-F",set:new Set([p49.length+p51F[3]])}];
 const sections=transcription.split("%").map(x=>x.trim()).filter(Boolean),isRune=x=>{const n=x.codePointAt(0);return n>=0x16A0&&n<=0x16F0;};
 const words=[...sections[49].split("-"),...sections[50].split("-")].map(x=>Array.from(x).filter(isRune).join("")).filter(Boolean);
 const wordLengths=words.map(x=>Array.from(x).length);
 if(wordLengths.reduce((a,b)=>a+b,0)!==stream.length)throw Error("p49/p51 word alignment mismatch");
 const render=a=>{let i=0;return wordLengths.map(n=>a.slice(i,i+=n).map(x=>corpus.translit[x]).join("")).join(" ");};
 const directVariants=input=>{
  const k=input.map(b=>mod(ps[b]-1)),out=[];
  for(const offset of [0,10])for(const reset of [false,true])for(const mask of masks){
   const plain=directDecode(stream,k,offset,reset?p49.length:null,mask.set);
   out.push({offset,resetAtP51:reset,nullMask:mask.name,score:trigramScore(plain,model),plaintext:render(plain)});
  }
  return out.sort((a,b)=>b.score-a.score);
 };
 const direct=directVariants(bytes),rawScore=trigramScore(stream,model),nulls=[];
 for(let rep=0;rep<100;rep++)nulls.push(directVariants(shuffle(bytes,xorshift(0x151079+rep*1009)))[0].score);
 const exceeded=nulls.filter(x=>x>=direct[0].score).length;

 const skipVariants=[];
 for(const offset of [0,10])for(const reset of [false,true])for(const mask of masks){
  let value;
  if(!reset)value=skipLLR(stream,key,offset,model.q,mask.set);
  else{
   const a=new Set([...mask.set].filter(x=>x<p49.length)),b=new Set([...mask.set].filter(x=>x>=p49.length).map(x=>x-p49.length));
   value=skipLLR(p49,key,offset,model.q,a)+skipLLR(p51,key,offset,model.q,b);
  }
  skipVariants.push({offset,resetAtP51:reset,nullMask:mask.name,llr:value});
 }
 skipVariants.sort((a,b)=>b.llr-a.llr);

 const sample=model.symbols.slice(500,658),sf=sample.map((x,i)=>x===0?i:-1).filter(i=>i>=0),nullAt=sf[3],random=xorshift(0x3301);
 let cursor=7,previous=-1,skips=0,planted=[];
 for(let i=0;i<sample.length;i++){
  if(i===nullAt){planted.push(0);previous=0;continue;}
  let c=mod(sample[i]+key[cursor]),d=0;
  while(previous>=0&&c===previous&&d<MAX_LOCAL&&random()<R){cursor++;skips++;d++;c=mod(sample[i]+key[cursor]);}
  planted.push(c);previous=c;cursor++;
 }
 const p56=p56Regression(corpus);
 if(!p56.exact)throw Error("p56 regression failed");
 console.log(JSON.stringify({
  model:{trainingSymbols:model.symbols.length,rejectRepeat:R,maxTotalSkips:MAX_TOTAL,maxSkippedPerOutput:MAX_LOCAL},
  source:{tableBytes:bytes.length,uniqueBytes:new Set(bytes).size,page49:p49.length,page51:p51.length,totalRunes:stream.length,wordCount:words.length,FPositions:f},
  p56Regression:p56,
  direct:{rawCipherScore:rawScore,best:direct[0],permutationNulls:100,exceeded,empiricalP:(1+exceeded)/101},
  skip:{best:skipVariants[0],variants:skipVariants,positiveControl:{length:sample.length,nullPosition:nullAt,skips,endCursor:cursor,trueKeyLLR:skipLLR(planted,key,7,model.q,new Set([nullAt])),reversedKeyLLR:skipLLR(planted,key.slice().reverse(),7,model.q,new Set([nullAt]))}}
 },null,2));
}
if(require.main===module)main();
