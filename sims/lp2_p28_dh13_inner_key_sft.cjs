"use strict";
const fs = require("node:fs");
const path = require("node:path");
function experiment(c,native){
 const q=29, mod=x=>(x%q+q)%q, p28=c.pages[28].indices,p29=c.pages[29].indices,line=p28.slice(117,140),lens=[2,3,9,4,5];let pos=0;
 const key=lens.flatMap(len=>{const a=line.slice(pos+1,pos+len-1);pos+=len;return a});
 if(key.length!==13||p29.length!==277)throw Error("source mismatch");
 const sections=native.sections.map(s=>({name:s.name,p:Array.from(s.source_text).map(x=>native.runes.indexOf(x)).filter(x=>x>=0)}));
 const train=sections.filter(s=>s.name!=="0_welcome"),donor=sections.find(s=>s.name==="0_welcome").p;
 const counts=new Float64Array(30*30*29),tot=new Float64Array(900),alpha=.2;
 for(const {p} of train){let a=29,b=29;for(const x of p){counts[(a*30+b)*29+x]++;tot[a*30+b]++;a=b;b=x;}}
 const probs=Float64Array.from(counts,(v,i)=>Math.log((v+alpha)/(tot[Math.floor(i/29)]+29*alpha)));
 function score(p){let a=29,b=29,v=0;for(const x of p){v+=probs[(a*30+b)*29+x];a=b;b=x;}return v;}
 function encode(p,s,t,hold,phase){return p.map(x=>{if(hold&&x===0)return 0;const y=mod(s*x+t*key[phase]);phase=(phase+1)%13;return y;});}
 function decode(cipher,s,t,hold,phase){let cur=new Map([[phase*900+899,{score:0,p:[]}]]);for(const y of cipher){const next=new Map();for(const [state,v] of cur){const k=Math.floor(state/900),a=Math.floor(state%900/30),b=state%30;const x=mod(s*(y-t*key[k]));const opts=[];if(!hold||x!==0)opts.push([x,(k+1)%13]);if(hold&&y===0)opts.push([0,k]);for(const [z,h] of opts){const id=h*900+b*30+z,val=v.score+probs[(a*30+b)*29+z];if(!next.has(id)||next.get(id).score<val)next.set(id,{score:val,p:[...v.p,z]});}}cur=next;if(!cur.size)return null;}let best=null;for(const v of cur.values())if(!best||v.score>best.score)best=v;if(encode(best.p,s,t,hold,phase).some((x,i)=>x!==cipher[i]))throw Error("replay");return best;}
 const modes=[["add",1,1],["subtract",1,-1],["beaufort",-1,1]];
 function scan(cipher){let best=null,complete=0,byMode=[];for(const [name,s,t] of modes)for(const hold of [false,true]){let b=null,n=0;for(let phase=0;phase<13;phase++){const d=decode(cipher,s,t,hold,phase);if(d){complete++;n++;if(!b||d.score>b.score)b={...d,name,hold,phase};if(!best||d.score>best.score)best={...d,name,hold,phase};}}byMode.push({name,hold,viable:n,score:b?b.score/cipher.length:null,phase:b?.phase});}return {best:{...best,scorePerRune:best.score/cipher.length,text:best.p.map(x=>c.translit[x]).join("")},complete,byMode};}
 const results=[];for(const [name,cipher] of [["p29-body",p29.slice(3,272)],["p28-suffix",p28.slice(140)]]){const L=cipher.length;let floor=Infinity,max=-Infinity;for(let i=0;i<=donor.length-L;i++){let s=score(donor.slice(i,i+L))/L;floor=Math.min(floor,s);max=Math.max(max,s);}const controls=[];for(const [mode,s,t] of modes)for(const hold of [false,true]){const p=donor.slice(17,17+L),phase=7,ct=encode(p,s,t,hold,phase),d=scan(ct);controls.push({mode,hold,truePhase:phase,recovered:d.best.name,recoveredHold:d.best.hold,recoveredPhase:d.best.phase,correct:d.best.p.filter((x,i)=>x===p[i]).length,length:L,score:d.best.scorePerRune,truthScore:score(p)/L});}results.push({name,L,nativeFloor:floor,nativeMax:max,controls,original:scan(cipher)});}return {key,lens,train:train.map(x=>x.name),holdout:"0_welcome",results};
}
const root=path.resolve(__dirname,"..");
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
console.log(JSON.stringify(experiment(load("resources/liber-primus/lp2-corpus.json"),load("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
