'use strict';
// Source-defined BASE29 conversion of the reconstructed 2013 SSSS secret and its internal field element.
const fs=require('node:fs');
function run(corpus,reference){
 const tr=corpus.translit, m=x=>(x%29+29)%29, b29=n=>{let a=[];do{a.unshift(Number(n%29n));n/=29n}while(n);return a}, show=a=>a.map(x=>tr[x]).join(""), digits=a=>a.map(x=>"0123456789ABCDEFGHIJKLMNOPQRS"[x]).join("");
 if(digits(b29(3301n))!=="3QO"||digits(b29(1033n))!=="16I")throw Error("historical BASE29 controls");
 const raw="p7amjopgric7dfdi.onion",rawHex=Array.from(raw,c=>c.charCodeAt(0).toString(16).padStart(2,"0")).join("");
 const keys=[b29(BigInt("0x"+rawHex)),b29(0x65b9c4065cc47a4a48e01d17de166a94252dfbb44e69n)];
 const map=new Map(tr.map((s,i)=>[s,i])), train=[];
 for(let word of reference.split("### 56")[0].split("\n").filter(x=>!/^#|^\[|^\(/.test(x)).join(" ").match(/[A-Z]+/g)||[]){
   word=word.replaceAll("QU","CW").replace(/[KVZ]/g,c=>({K:"C",V:"U",Z:"S"}[c])).replaceAll("ING","NG");
   for(let i=0;i<word.length;){let s=word.slice(i,i+2);if(map.has(s)){train.push(map.get(s));i+=2}else{if(map.has(word[i]))train.push(map.get(word[i]));i++}}
 }
 const counts=Array.from({length:30},()=>Array(29).fill(.25));let prev=29;
 for(const p of train){counts[prev][p]++;prev=p}
 const score=counts.map(row=>row.map(x=>Math.log(x/row.reduce((a,b)=>a+b,0))));
 function encode(P,K,sign,hold,phase=0){let C=[];for(const p of P){if(hold&&p===0)C.push(0);else{C.push(m(p+sign*K[phase]));phase=(phase+1)%K.length}}return {C,phase}}
 function decode(C,K,sign,hold,start=[{phase:0,prev:29,s:0,path:[]}]){
  let states=start;for(const c of C){const next=new Map();function add(st,p,phase){const s=st.s+score[st.prev][p],id=phase*30+p;if(!next.has(id)||next.get(id).s<s)next.set(id,{phase,prev:p,s,path:st.path.concat(p)})}
   for(const st of states){if(hold&&c===0)add(st,0,st.phase);let p=m(c-sign*K[st.phase]);if(!hold||p!==0)add(st,p,(st.phase+1)%K.length)}
   states=[...next.values()];if(!states.length)break;
  }return states.sort((a,b)=>b.s-a.s)
 }
 function mean(P){let s=0,prev=29;for(const p of P){s+=score[prev][p];prev=p}return s/P.length}
 const p8=corpus.pages[8].indices.slice(12),p9=corpus.pages[9].indices,p57=corpus.pages[57].indices,results=[],controls=[];
 for(let i=0;i<keys.length;i++)for(const sign of [1,-1])for(const hold of [false,true]){
  const K=keys[i], plant=encode(p57,K,sign,hold), d=decode(plant.C,K,sign,hold)[0];
  if(!d||encode(d.path,K,sign,hold).C.join()!==plant.C.join())throw Error("plant replay");
  const correct=d.path.filter((p,j)=>p===p57[j]).length;
  controls.push({key:i,sign,hold,correct,total:p57.length,truthScore:mean(p57),mapScore:d.s/d.path.length});
  const fit=decode(p8,K,sign,hold)[0];if(!fit){results.push({key:i,sign,hold,fit:"no legal history"});continue}
  if(encode(fit.path,K,sign,hold).C.join()!==p8.join())throw Error("original replay");
  const test=decode(p9,K,sign,hold,[{phase:fit.phase,prev:fit.prev,s:0,path:[]}])[0];
  if(test&&encode(test.path,K,sign,hold,fit.phase).C.join()!==p9.join())throw Error("held replay");
  results.push({key:i,sign,hold,fitScore:fit.s/p8.length,phase:fit.phase,fitText:show(fit.path),heldScore:test?test.s/p9.length:null,heldText:test?show(test.path):null});
 }
 return {keys:keys.map(digits),trainRunes:train.length,p8:p8.length,p9:p9.length,clearScore:mean(p57),controls,results}
}
console.log(JSON.stringify(run(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8')),fs.readFileSync('resources/liber-primus/lp1-plaintext-reference.txt','utf8')),null,2));
