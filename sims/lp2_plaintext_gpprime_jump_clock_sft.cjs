"use strict";
/** SFT: prime-minus-one shifts, GP-prime weighted plaintext cursor, transparent F.
 * Run: node sims/lp2_plaintext_gpprime_jump_clock_sft.cjs
 * No historical selector or unknown plaintext claimed. Native singleton constraints A/I/O.
 */
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function experiment(corpus,trans,solved){
 const check=(b,m)=>{if(!b)throw Error(m);};const idx=new Map(corpus.runes.map((r,i)=>[r,i])),w=corpus.prime,mod=x=>(x%29+29)%29;
 function parse(s,lp=false){const tape=[],sing=[];let word=[];const finish=()=>{if(word.length===1)sing.push(tape.length-1);word=[];};for(const ch of s){if(idx.has(ch)){const p=idx.get(ch);tape.push(p);word.push(p);}else if(/\s/u.test(ch)||(lp&&(ch==="%"||ch==="/"))){}else finish();}finish();return {tape,sing};}
 const orig=parse(trans.split("%").slice(0,55).join("%"),true);
 check(orig.tape.join(",")===corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices).join(",")&&orig.tape.length===12956&&orig.sing.length===83,"original corpus mismatch");
 const sieve=new Uint8Array(5000000);sieve.fill(1,2);for(let p=2;p*p<sieve.length;p++)if(sieve[p])for(let j=p*p;j<sieve.length;j+=p)sieve[j]=0;
 const primes=[];for(let i=2;i<sieve.length;i++)if(sieve[i])primes.push(i);
 const K=Uint8Array.from(primes,p=>(p-1)%29);
 check(K.length>3301+1903*109,"prime bound");
 function enc(plain,start,cursor=start-1){return {cipher:plain.map(p=>{if(p===0)return 0;const c=mod(p+K[cursor]);cursor+=w[p];return c;}),cursor};}
 function edges(c,j,is){const out=[];if(c===0&&!is)out.push([0,j]);check(j<K.length,"prime index out of bound");const p=mod(c-K[j]);if(p!==0&&(!is||p===24||p===10||p===3))out.push([p,j+w[p]]);return out;}
 function gate(tape,singletons,fit){const ss=new Set(singletons);let live=new Map(Array.from({length:3301},(_,i)=>[i+1,[i]])),peak=3301,ops=0,dead=-1,checkpoints=[];for(let i=0;i<fit;i++){const c=tape[i],is=ss.has(i);let nstates=0;for(const [start,states] of live){const n=new Set();for(const j of states){ops++;for(const [,k] of edges(c,j,is))n.add(k);}if(n.size){live.set(start,[...n]);nstates+=n.size;}else live.delete(start);}peak=Math.max(peak,nstates);if(is||i%100===99)checkpoints.push([i,live.size,nstates]);if(!live.size){dead=i;break;}}return {dead,peak,ops,origins:[...live.keys()],checkpoints};}
 function unit(lo,hi){const start=corpus.pages.filter(p=>p.page<lo).reduce((s,p)=>s+p.indices.length,0),tape=corpus.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices);return {tape,sing:orig.sing.filter(i=>i>=start&&i<start+tape.length).map(i=>i-start)};}
 function lm(excluded){const counts=new Float64Array(30*30*29).fill(0.1);for(const s of solved.sections){if(s.name===excluded)continue;let a=29,b=29;for(const p of parse(s.source_text).tape){counts[(a*30+b)*29+p]++;a=b;b=p;}}for(let i=0;i<counts.length;i+=29){let total=0;for(let j=0;j<29;j++)total+=counts[i+j];for(let j=0;j<29;j++)counts[i+j]=Math.log(counts[i+j]/total);}return counts;}
 function decode(tape,sing,start,model,initial=null){
 const ss=new Set(sing);let map=initial?initial.states:new Map([[(start-1)*900+29*30+29,{score:0,node:null}]]);
 for(let i=0;i<tape.length;i++){const next=new Map();for(const [id,v] of map){const j=Math.floor(id/900),a=Math.floor((id%900)/30),b=id%30;for(const [p,k] of edges(tape[i],j,ss.has(i))){const nid=k*900+b*30+p,score=v.score+model[(a*30+b)*29+p];if(!next.has(nid)||score>next.get(nid).score)next.set(nid,{score,node:{p,prev:v.node}});}}map=next;if(!map.size)return null;}
 let best=null;for(const [id,v] of map)if(!best||v.score>best.score)best={id,...v};
 const plain=[];for(let n=best.node;n;n=n.prev)plain.push(n.p);plain.reverse();return {id:best.id,score:best.score,plain,states:map};}
 const tests=[];for(const [lo,hi] of [[15,22],[54,55],[0,2]]){const {tape,sing}=unit(lo,hi),fit=Math.floor(tape.length*.8),g=gate(tape,sing,fit);tests.push({lo,hi,len:tape.length,fit,sing:sing.length,dead:g.dead,peak:g.peak,ops:g.ops,survivors:g.origins.length,checkpoints:g.checkpoints});}
 const plants=[];for(const [name,start] of [["0_koan_1",73],["0_koan_1",167],["0_welcome",1033]]){const p=parse(solved.sections.find(s=>s.name===name).source_text),c=enc(p.tape,start).cipher,fit=Math.floor(c.length*.8),g=gate(c,p.sing,fit),model=lm(name);
 check(g.origins.includes(start),"true origin pruned");const cand=g.origins.map(origin=>({origin,...decode(c.slice(0,fit),p.sing,origin,model)})).sort((a,b)=>b.score-a.score);const best=cand[0],suffix=decode(c.slice(fit),[],best.origin,model,best);let exact=null,replay=false;if(suffix){const combined=suffix.plain;replay=enc(combined,best.origin).cipher.every((x,i)=>x===c[i]);check(replay,"plant replay failure");exact=suffix.plain.slice(fit).filter((x,i)=>x===p.tape[fit+i]).length;}
 plants.push({name,start,len:c.length,fit,origins:g.origins.length,selected:best.origin,truthRank:cand.findIndex(x=>x.origin===start)+1,scoreGap:cand.length>1?best.score-cand[1].score:null,holdout:c.length-fit,exact,replay});}
 check(tests.every(t=>t.survivors===0),"original gate changed");check(plants.every(p=>p.selected===p.start&&p.replay),"plant origin or replay changed");return {tests,plants};
}
const result=experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/lp2-transcription.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")));
console.log(JSON.stringify(result,null,2));
