'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function run(gp,transcript,solved){
 const assert=(b,m)=>{if(!b)throw Error(m)},eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),mod=x=>(x%29+29)%29;
 const lut=new Map(gp.runes.map((x,i)=>[x,i])),rx=/[\u16a0-\u16ff]+/g;
 const parse=s=>(s.replace(/[\s/%]/g,"").match(rx)||[]).map(w=>[...w].map(x=>lut.get(x)));
 const words=parse(transcript).slice(0,2896);
 assert(eq(words.flat(),gp.pages.slice(0,56).flatMap(p=>p.indices)),"original mismatch");
 const native=solved.sections.flatMap(s=>parse(s.source_text)).filter(w=>w.every(x=>x!==undefined));
 const max=14*Math.max(...gp.prime),sum=w=>w.reduce((n,x)=>n+gp.prime[x],0),digits=n=>{const d=[];do{d.unshift(n%29);n=Math.floor(n/29)}while(n);return d};
 const keys=Array.from({length:max+1},(_,i)=>digits(i));
 function enc(p,seed,sign,hold){let state=seed;return p.map(w=>{let k=0,d=keys[state];const c=w.map(x=>hold&&x===0?0:mod(x+sign*d[k++%d.length]));state=sum(w);return c})}
 function options(w,state,sign,hold){const d=keys[state],out=[];function walk(i,k,p,s){if(i===w.length){out.push({p,s});return}const x=w[i],y=mod(x-sign*d[k%d.length]);if(hold&&x===0)walk(i+1,k,[...p,0],s+gp.prime[0]);if(!hold||y!==0)walk(i+1,k+1,[...p,y],s+gp.prime[y])}walk(0,0,[],0);return out}
 const voc=new Set(native.map(w=>w.join(",")));
 function gate(c,sign,hold,truth=null,seed=null){let states=new Map(Array.from({length:max+1},(_,i)=>[i,{score:0,seed:i,trace:null}]));let min=states.size;const counts=[];let ts=seed;
 for(let i=0;i<c.length;i++){const next=new Map();for(const [st,v] of states)for(const o of options(c[i],st,sign,hold)){const score=v.score+(voc.has(o.p.join(","))?o.p.length:0);const old=next.get(o.s);if(!old||old.score<score)next.set(o.s,{score,seed:v.seed,trace:{p:o.p,prev:v.trace}})}
 if(truth){assert(options(c[i],ts,sign,hold).some(o=>eq(o.p,truth[i])),"plant transition lost");ts=sum(truth[i]);assert(next.has(ts),"plant state lost")}
 states=next;min=Math.min(min,states.size);if(i<12||!states.size)counts.push([i+1,states.size]);if(!states.size)return {deathWord:i+1,deathRune:c.slice(0,i+1).flat().length,counts};}
 const best=[...states.values()].sort((a,b)=>b.score-a.score)[0],p=[];for(let z=best.trace;z;z=z.prev)p.unshift(z.p);assert(eq(enc(p,best.seed,sign,hold),c),"replay");return {survivors:states.size,minimum:min,seed:best.seed,score:best.score,runes:c.flat().length,excerpt:p.slice(0,25).map(w=>w.map(x=>gp.translit[x]).join("")).join(" "),counts}}
 const counts=[158,255,383,437,224,326,378,669,66],groups=[];let a=0;for(const n of counts){groups.push(words.slice(a,a+n));a+=n}assert(a===2896,"chapter count");
 const results=[];for(const sign of [1,-1])for(const hold of [true,false]){const chapters=groups.map(c=>gate(c,sign,hold));const control=native.slice(0,150).filter(w=>w.length<=14);const seed=3301%max;const plant=gate(enc(control,seed,sign,hold),sign,hold,control,seed);results.push({sign,hold,chapters,plant})}return {max,words:words.length,runes:words.flat().length,results};
}
console.log(JSON.stringify(run(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/liber-primus/lp2-transcription.txt'),JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));
