'use strict';
// Agent5: exact all-secret alphabet bound; no arbitrary per-word keys.
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus,transcript,solved){
 const check=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29;
 const idx=new Map(corpus.runes.map((r,i)=>[r,i]));
 const words=[];let w=[];for(const c of transcript.split("%").slice(0,55).join("%")){if(idx.has(c))w.push(idx.get(c));else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){words.push(w);w=[];}}if(w.length)words.push(w);
 const tape=words.flat();check(words.length===2896&&JSON.stringify(tape)===JSON.stringify(corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices)),"source shape");
 const sieve=new Uint8Array(1000001),primes=[];for(let n=2;n<sieve.length;n++)if(!sieve[n]){primes.push(n);if(n*n<sieve.length)for(let j=n*n;j<sieve.length;j+=n)sieve[j]=1;}
 check(primes[173]===1033&&primes[463]===3301,"prime anchors");
 const K=primes.map(p=>(p-1)%29),diff=Array(K.length);diff[K.length-1]=K.length;for(let t=K.length-2;t>=0;t--)diff[t]=K[t]===K[t+1]?diff[t+1]:t+1;
 const origins=Array.from({length:464},(_,i)=>i);
 function eachChoice(c,prev,t,visit){
  if(c===prev){const p=mod(c-K[t]);for(let end=t+1;end<=diff[t];end++)visit(p,end);}
  else{visit(mod(c-K[t]),t+1);const p=mod(prev-K[t]),j=diff[t];if(mod(p+K[j])===c)visit(p,j+1);}
 }
 function pop(x){let z=0;while(x){x&=x-1;z++;}return z;}
 function bound(ws,k,previous=0,expected=null){
  const tape=ws.flat(),singleton=new Set();let n=0;for(const w of ws){if(w.length===1)singleton.add(n);n+=w.length;}
  function extend(set,p){const bit=1<<p;const result=new Set();for(const m of set){const a=m|bit;if(a===m||pop(a)<=k)result.add(a);}return result;}
  let active=new Map(origins.map(t=>[t,new Set([0])])),prev=previous,seen=0,marks=[];
  function merge(next,t,set){
   if(!set.size)return;
   const old=next.get(t);if(!old){next.set(t,set);return;}if(old===set)return;
   const big=old.size>=set.size?old:set,small=big===old?set:old;
   let out=big;for(const m of small){if(!out.has(m)){if(out===big)out=new Set(big);out.add(m);}}
   next.set(t,out);
  }
  for(let i=0;i<tape.length;i++){
   const next=new Map(),flag=singleton.has(i);
   for(const [t,set] of active)eachChoice(tape[i],prev,t,(p,end)=>merge(next,end,flag?extend(set,p):set));
   active=next;prev=tape[i];
   if(flag){seen++;let total=0,max=0;for(const set of active.values()){total+=set.size;max=Math.max(max,set.size);}marks.push({i,seen,states:active.size,total,max});}
   if(!active.size)return {failure:i,seen,marks};
  }
  let masks=new Set();for(const set of active.values())for(const m of set)masks.add(m);
  return {survivors:active.size,maskCount:masks.size,minimumTypes:Math.min(...[...masks].map(pop)),expectedSurvives:expected===null?null:active.get(expected.end)?.has(expected.mask)??false,seen,marks};
 }
 const donor=solved.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>idx.get(c))));
 function plant(seed,start){
  let x=seed>>>0;function rng(){x=(Math.imul(x,1664525)+1013904223)>>>0;return x;}
  const S=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const j=rng()%(i+1);[S[i],S[j]]=[S[j],S[i]];}
  let t=start,prev=0,mask=0,skips=0;const ws=donor.map(w=>w.map((p,i)=>{const v=S[p];if(w.length===1)mask|=1<<v;if(mod(v+K[t])===prev&&primes[t]%7!==1){const j=diff[t];skips+=j-t;t=j;}const c=mod(v+K[t++]);prev=c;return c;}));
  check(pop(mask)<=4,"native singleton alphabet");
  const a=bound(ws,4,0,{end:t,mask});check(a.expectedSurvives,"true permuted singleton path removed");
  return {start,skips,trueTypes:pop(mask),runes:ws.flat().length,singletons:donor.filter(w=>w.length===1).length,maskCount:a.maskCount,states:a.survivors,minimumTypes:a.minimumTypes,expectedSurvives:a.expectedSurvives};
 }
 const controls=[plant(5301,0),plant(5302,173),plant(5303,463)];
 const original=bound(words,4);
 const page=corpus.pages.filter(p=>p.page<=55);let n=0,at=null;for(const p of page){if(original.failure>=n&&original.failure<n+p.indices.length)at={page:p.page,offset:original.failure-n};n+=p.indices.length;}
 return {controls,original,at};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
console.log(JSON.stringify(experiment(JSON.parse(read(paths[0])),read(paths[1]),JSON.parse(read(paths[2]))),null,2));
