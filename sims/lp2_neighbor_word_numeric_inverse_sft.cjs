'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function run(j,transcript,lexicon){
 const mod=x=>(x%29+29)%29, eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b), check=(a,b)=>{if(!a)throw Error(b)};
 const lut=new Map(j.runes.map((x,i)=>[x,i]));const all=transcript.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g).map(w=>[...w].map(x=>lut.get(x)));const words=all.slice(0,2896),orig=j.pages.slice(0,56).flatMap(p=>p.indices);check(eq(words.flat(),orig),"source mismatch");
 let k=2896,n=0;while(n<85)n+=all[k++].length;const clear=all.slice(k);check(n===85&&eq(clear.flat(),j.pages[57].indices),"p57 mismatch");
 function b29(n){const o=[];do{o.unshift(n%29);n=Math.floor(n/29)}while(n);return o}
 const maps={prime:w=>w.map(x=>mod(j.prime[x])),phi:w=>w.map(x=>mod(j.prime[x]-1)),base29:w=>w.flatMap(x=>b29(j.prime[x]))};
 const toks=j.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);function encode(s){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let out=[];while(s){if(s.startsWith("ING")){out.push(21);s=s.slice(3)}else if(s.startsWith("IO")){out.push(27);s=s.slice(2)}else{const t=toks.find(([x])=>s.startsWith(x));if(!t)return null;out.push(t[1]);s=s.slice(t[0].length)}}return out}
 const dict=new Set(lexicon.split("\n").filter(x=>/^[a-z]+ \d+$/.test(x)).map(x=>encode(x.split(" ")[0])?.join(",")).filter(Boolean));dict.add("24");dict.add("10");check(dict.size===29060,"dictionary count");
 function advance(ct,key,sign,hold){let states=[{p:[],t:0}];for(const c of ct){const next=[];for(const st of states){const p=mod(c+sign*key[st.t%key.length]);if(!hold||p!==0)next.push({p:[...st.p,p],t:st.t+1});if(hold&&c===0)next.push({p:[...st.p,0],t:st.t})}states=next;if(!states.length)break}return states.map(s=>s.p)}
 function forward(p,key,sign,hold){let t=0;return p.map(x=>hold&&x===0?0:mod(x-sign*key[(t++)%key.length]))}
 const results=[], first=words.findIndex(x=>x.length===1), last=words.findLastIndex(x=>x.length===1);
 for(const [name,map] of Object.entries(maps))for(const dir of [1,-1])for(const sign of [-1,1]){
  const start=dir===1?first:last;let states=new Map(Array.from({length:29},(_,i)=>[String(i),[i]]));let failure=null,max=29,limit=0,counts=[];
  for(let i=start+dir;i>=0&&i<words.length;i+=dir){const next=new Map();for(const w of states.values())for(const p of advance(words[i],map(w),sign,true)){check(eq(forward(p,map(w),sign,true),words[i]),"branch replay");next.set(p.join(","),p)}states=next;limit++;counts.push(states.size);max=Math.max(max,states.size);if(!states.size){failure=i;break}}
  check(failure!==null,"unexpected F survivor");
  let best=null;for(let seed=0;seed<29;seed++){let w=[seed],ct=0,ok=0,coverage=0,run=0,maxRun=0,first35=[];for(let i=start+dir;i>=0&&i<words.length;i+=dir){const p=advance(words[i],map(w),sign,false)[0];check(eq(forward(p,map(w),sign,false),words[i]),"ordinary replay");const hit=dict.has(p.join(","));ct++;ok+=hit;coverage+=hit?p.length:0;run=hit?run+1:0;maxRun=Math.max(run,maxRun);if(first35.length<35)first35.push(p.map(x=>j.translit[x]).join(""));w=p}const result={seed,ct,ok,coverage,maxRun,first35:first35.join(" ")};if(!best||coverage>best.coverage)best=result}
  const ordered=dir===1?clear:clear.slice().reverse();let st=new Map([[ordered[0].join(","),ordered[0]]]),prev=ordered[0];for(const p of ordered.slice(1)){const key=map(prev),c=forward(p,key,sign,true),next=new Map();for(const w of st.values())for(const q of advance(c,map(w),sign,true))next.set(q.join(","),q);st=next;check(st.has(p.join(",")),"clear p57 true path lost");check(eq(advance(forward(p,key,sign,false),key,sign,false)[0],p),"ordinary p57 exact inverse");prev=p}
  results.push({name,dir,sign,start,holdFailure:failure,holdWords:limit,maxStates:max,counts,ordinaryBest:best,clearP57Control:true})
 }return {first,last,dict:dict.size,results}
}
console.log(JSON.stringify(run(JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8')),fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8'),fs.readFileSync(path.join(root,'resources/control/english_wordfreq_textblob.txt'),'utf8')),null,2));
