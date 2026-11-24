"use strict";
/** Spacing-free minimum hidden-state collision bound for deterministic GP29 context encoders.
 * Direct or integrated outputs, exact contiguous source comparisons. Node22/CommonJS.
 * Controls are finite descriptive samples, not a theorem about all natural language.
 */
const fs=require("node:fs");const path=require("node:path");
const read=f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8");
function run(gp,raw,donor){
 const mod=x=>(x%29+29)%29,tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),ix=new Map(gp.runes.map((g,i)=>[g,i]));
 function native(s){const out=[];for(const raw of s.toUpperCase().match(/[A-Z]+/g)||[]){let w=raw.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error(w);out.push(t.i);w=w.slice(t.s.length)}}return out}
 const corpus=raw.map(native),solved=donor.sections.map(s=>[...s.source_text].filter(x=>ix.has(x)).map(x=>ix.get(x)));
 const pages=gp.pages.filter(p=>p.page<56),C=pages.flatMap(p=>p.indices);
 if(C.length!==12956)throw Error("source");
 function counts(seq,k,start=0,end=seq.length){
  const m=new Map();let v=0,power=29**(k-1);
  for(let i=start;i<start+k;i++)v=v*29+seq[i];
  m.set(v,1);
  for(let i=start+k;i<end;i++){v=(v-seq[i-k]*power)*29+seq[i];m.set(v,(m.get(v)||0)+1)}
  const f=[...m.values()];return {pairs:f.reduce((s,n)=>s+n*(n-1)/2,0),freq:f.filter(x=>x>1)};
 }
 // Occupancy lower bound: each identical plaintext block has at most S outputs
 // under a deterministic transducer given the same initial state.
 function lower(freq,S){let total=0;for(const v of freq){const q=Math.floor(v/S),r=v%S;total+=r*q*(q+1)/2+(S-r)*q*(q-1)/2}return total}
 function minS(freq,pairs){let lo=1,hi=Math.max(1,...freq);while(lo<hi){const mid=(lo+hi)>>>1;if(lower(freq,mid)<=pairs)hi=mid;else lo=mid+1}return lo}
 function stats(v){return {min:Math.min(...v),max:Math.max(...v),mean:v.reduce((s,n)=>s+n,0)/v.length}}
 function analyze(cipher,controls){
  const D=cipher.map((x,i)=>i?mod(x-cipher[i-1]):-1);
  const observed=Array.from({length:4},(_,mi)=>Array.from({length:6},(_,ni)=>{
    const m=mi+1,n=ni+1;return {m,n,C:counts(cipher,n,m).pairs,D:counts(D,n,m).pairs};
  }));
  const result=[];
  for(const {name,seq} of controls){
   if(seq.length<cipher.length)continue;
   // Evenly spaced, naturally contiguous same-length windows; no word-shape conditioning.
   const windows=Math.min(32,Math.floor(seq.length/cipher.length)*2+1);
   const samples=[];
   for(let w=0;w<windows;w++){
    const start=windows===1?0:Math.round(w*(seq.length-cipher.length)/(windows-1));
    const h=Array.from({length:10},(_,i)=>i===0?null:counts(seq,i+1,start,start+cipher.length));
    const per=observed.map(row=>{
      let minC=1,minD=1,bestC=0,bestD=0;for(const {m,n,C,D} of row){const f=h[m+n-1].freq;
       const sC=minS(f,C),sD=minS(f,D);if(sC>minC){minC=sC;bestC=n}if(sD>minD){minD=sD;bestD=n}}
      return {minC,minD,bestC,bestD};
    });samples.push(per);
   }
   result.push({name,windows,length:seq.length,minimumStates:Array.from({length:4},(_,i)=>({m:i+1,direct:stats(samples.map(s=>s[i].minC)),integrated:stats(samples.map(s=>s[i].minD)),integratedS1Pass:samples.filter(s=>s[i].minD===1).length}))});
  }
  return {L:cipher.length,observed,controls:result};
 }
 const controls=corpus.map((seq,i)=>({name:["Shakespeare","Emerson","Gibran"][i],seq}));
 const full=analyze(C,controls);
 const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 const chapters=ranges.map(range=>({range,...analyze(pages.filter(p=>p.page>=range[0]&&p.page<=range[1]).flatMap(p=>p.indices),[...controls,...solved.map((seq,i)=>({name:donor.sections[i].name,seq}))])}));
 // Positive exact-source controls. Distinct hidden row permutations and a deterministic clock.
 let seed=0x3301abcd;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}
 const P=solved[3],positive=[];
 for(const S of [1,3,13]){
  const Q=Array.from({length:S},()=>Array.from({length:29},()=>{const a=Array.from({length:29},(_,i)=>i);for(let j=28;j>0;j--){const k=rand(j+1);[a[j],a[k]]=[a[k],a[j]]}return a}));
  const Qi=Q.map(rows=>rows.map(row=>{const inv=Array(29);row.forEach((d,p)=>inv[d]=p);return inv}));
  const D=[-1],c=[rand(29)];let state=0;
  for(let i=1;i<P.length;i++){const d=Q[state][P[i-1]][P[i]];D.push(d);c.push(mod(c[i-1]+d));state=(state+P[i]+1)%S}
  const recovered=[P[0]];state=0;for(let i=1;i<c.length;i++){const p=Qi[state][recovered[i-1]][mod(c[i]-c[i-1])];recovered.push(p);state=(state+p+1)%S}
  if(recovered.join(",")!==P.join(","))throw Error("positive inverse");
  const bounds=[];for(let m=1;m<=4;m++){let need=1;for(let n=1;n<=6;n++)need=Math.max(need,minS(counts(P,m+n).freq,counts(D,n,m).pairs));if(need>S)throw Error("theorem violated");bounds.push(need)}
  positive.push({S,runes:P.length,recovered:recovered.length,bounds});
 }
 return {full,chapters,positive};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const data=files.map(read);console.log(JSON.stringify(run(JSON.parse(data[0]),data.slice(1,4),JSON.parse(data[4])),null,2));
