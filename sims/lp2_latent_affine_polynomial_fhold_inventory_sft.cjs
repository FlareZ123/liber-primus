"use strict";
const fs=require("node:fs");
const path=require("node:path");
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/lp2-transcription.txt",
  "resources/control/english_wordfreq_textblob.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/blake_song_of_liberty_train.txt",
  "resources/external/relikd-solved-gp29-native-v1.json"
];
function experiment(inputs){
 const check=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29,inv=x=>{for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error("zero inverse")};
 const corpus=JSON.parse(inputs[0]),rmap=new Map(corpus.runes.map((x,i)=>[x,i])),gp=new Map(corpus.translit.map((x,i)=>[x,i]));
 for(const [a,b] of [["K","C"],["Q","C"],["V","U"],["Z","S"],["ING","NG"],["IO","IA"]])gp.set(a,gp.get(b));
 const encode=(word,contract)=>{let s=word.toUpperCase().replace(/QU/g,"CW"),out=[];while(s.length){let tok=(contract?["ING","TH","NG","EO","OE","AE","IA","EA","IO"]:["TH","NG","EO","OE","AE","IA","EA"]).find(t=>s.startsWith(t))||s[0];out.push(gp.get(tok));s=s.slice(tok.length)}return out};
 const tape=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),words=[];let w=[];
 for(const c of inputs[1].split("%").slice(0,55).join("%")){if(rmap.has(c))w.push(rmap.get(c));else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){words.push(w);w=[]}}if(w.length)words.push(w);
 check(tape.length===12956&&words.length===2896&&words.flat().every((x,i)=>x===tape[i])&&words.flat().length===tape.length,"source alignment");
 const dict=new Map(),add=p=>{if(p.length&&p.length<=14&&p.every(x=>Number.isInteger(x)))dict.set(p.join(","),p)};
 for(const s of inputs.slice(2,7)){for(const t of (s.match(/[a-zA-Z]+/g)||[])){add(encode(t,true));add(encode(t,false))}}
 const native=JSON.parse(inputs[7]).sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16A0-\u16FF]+/gu)||[]).map(w=>[...w].map(c=>rmap.get(c)))}));
 for(const s of native)for(const p of s.words)add(p);
 const counts=Array(15).fill(0);for(const p of words)counts[p.length]++;
 function diff(p,d){let x=p.slice();for(let k=0;k<=d;k++)x=x.slice(1).map((v,i)=>mod(v-x[i]));return x}
 function sig(p,d){let x=diff(p,d),a=x.find(v=>v!==0);if(a!==undefined){const v=inv(a);x=x.map(t=>mod(t*v))}return x.join(",")}
 function key(p,d,mask){return p.length+":"+mask+":"+sig(p.filter((_,j)=>!(mask&(1<<j))),d)}
 function fmask(p){return p.reduce((m,v,j)=>v===0?m|(1<<j):m,0)}
 function indexes(d){const ordinary=new Map(),hold=new Map();for(const p of dict.values()){ordinary.set(key(p,d,0),p);hold.set(key(p,d,fmask(p)),p)}return {ordinary,hold}}
 function match(p,d,index,mode){if(mode!=="hold"){const q=index.ordinary.get(key(p,d,0));if(q)return {q,mask:0}}if(mode!=="ordinary"){const z=fmask(p);for(let m=z;;m=(m-1)&z){const q=index.hold.get(key(p,d,m));if(q)return {q,mask:m};if(m===0)break}}return null}
 function choose(n,k){let a=1;if(k>n)return 0;for(let i=1;i<=k;i++)a=a*(n-i+1)/i;return a}
 function replay(p,c,d,mask){let q=p.filter((_,j)=>!(mask&(1<<j))),t=c.filter((_,j)=>!(mask&(1<<j)));for(let a=1;a<29;a++){let z=t.map((v,j)=>mod(v-a*q[j])),coef=[];for(let j=0;j<=d;j++){coef.push(z[0]||0);z=z.slice(1).map((v,i)=>mod(v-z[i]))}let k=0;let y=p.map((v,j)=>{if(mask&(1<<j))return 0;const z=mod(a*v+coef.reduce((s,x,i)=>s+x*choose(k,i),0));k++;return z});if(y.every((x,j)=>x===c[j]))return true}return false}
 const summary=[];
 for(const d of [1,2,3]){
   const idx=indexes(d);let controls=[];
   for(const s of native){let n=0,held=0,amb=0;for(const [i,p] of s.words.entries()){if(p.length>14)continue;const a=1+(i*11+7)%28,co=Array.from({length:d+1},(_,j)=>(i*17+j*13+3)%29);for(const mode of ["ordinary","hold"]){let k=0;const c=p.map(v=>{if(mode==="hold"&&v===0){held++;return 0}const z=mod(a*v+co.reduce((s,x,j)=>s+x*choose(k,j),0));k++;return z});const m=match(c,d,idx,mode);check(m&&replay(m.q,c,d,m.mask),"control inverse "+s.name);n++;if(m.q.join(",")!==p.join(","))amb++}}controls.push({name:s.name,tests:n,held,alternateWitnesses:amb})}
   for(const mode of ["ordinary","hold","mixed"]){
     const edges=Array.from({length:tape.length},()=>[]),hits=Array(15).fill(0);let witnesses=0;
     for(let i=0;i<tape.length;i++)for(let L=6;L<=14&&i+L<=tape.length;L++){const c=tape.slice(i,i+L),m=match(c,d,idx,mode);if(m){if(witnesses<100){check(replay(m.q,c,d,m.mask),"original replay");witnesses++}edges[i].push(L);hits[L]++}}
     const bounds=[];
     for(let threshold=6;threshold<=14;threshold++){
       const dp=new Int32Array(tape.length+1);for(let i=tape.length-1;i>=0;i--){dp[i]=dp[i+1];for(const L of edges[i])if(L>=threshold)dp[i]=Math.max(dp[i],1+dp[i+L])}
       const demand=counts.slice(threshold).reduce((a,b)=>a+b,0),cap=counts.slice(threshold).reduce((a,x,j)=>a+Math.min(x,hits[threshold+j]),0),maximum=Math.min(dp[0],cap);
       bounds.push({threshold,demand,disjointUpper:dp[0],lengthCap:cap,minOOV:demand-maximum})
     }
     summary.push({degree:d,mode,hits,bounds,maxOOVLower:Math.max(...bounds.map(x=>x.minOOV)),controls,witnesses});
   }
 }
 return {tapeLength:tape.length,words:words.length,counts,lexicon:dict.size,sourceRefs:[],summary};
}
const out=experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")));
console.log(JSON.stringify(out,null,2));
