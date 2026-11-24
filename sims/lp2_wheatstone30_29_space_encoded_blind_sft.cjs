"use strict";
// Agent 10 — space-encoding Wheatstone adaptation; deterministic blind controls and holdout.
const fs=require("node:fs"),path=require("node:path");
function clockAttack(d,nd,texts) {
 const idx=new Map(d.runes.map((x,i)=>[x,i])),N=29,M=30,mod=(x,n=N)=>(x%n+n)%n,alpha=Array.from({length:N},(_,i)=>i),sp=29,res=12,loc=x=>x===sp?0:x+1,inv=x=>x===0?sp:x-1;
 const native=nd.sections.map(s=>({name:s.name,words:[...s.source_text.matchAll(/[\u16a0-\u16ff]+/gu)].map(m=>[...m[0]].map(x=>idx.get(x)))}));
 const map=[["ING",21],["NG",21],...d.translit.map((x,i)=>[x==="IA"?"IO":x,i]),["IA",27]].filter(x=>x[1]!==res).sort((a,b)=>b[0].length-a[0].length);
 function gp(w){w=w.toUpperCase().replace(/QU/g,"CW").replace(/K/g,"C").replace(/V/g,"U").replace(/Z/g,"S");let out=[];while(w){let a=map.find(x=>w.startsWith(x[0]));if(!a)return null;out.push(a[1]);w=w.slice(a[0].length)}return out}
 const gw=texts.flatMap(t=>[...t.matchAll(/[A-Za-z]+/g)].map(m=>gp(m[0])).filter(x=>x?.length));
 function prep(words){const out=[];for(const w of words){for(const x of w){if(x===res)throw Error("literal reserve");out.push(out.at(-1)===x?res:x)}out.push(sp)}return out}
 function enc(p,key,initial){let b=initial,a=0,rev=[];key.forEach((x,i)=>rev[x]=i);return p.map(x=>{let q=loc(x),s=mod(q-a,M);if(s===0)throw Error("plain repeat");a=q;b=mod(b+s);return rev[b]})}
 function dec(c,key,initial){let a=0,b=initial;return c.map(x=>{let q=key[x],s=mod(q-b)||N;b=q;a=mod(a+s,M);return inv(a)})}
 function unprep(p){let w=[],words=[];for(const v of p){if(v===sp){if(!w.length)return null;words.push(w);w=[]}else if(v===res){if(!w.length)return null;w.push(w.at(-1))}else w.push(v)}if(w.length)return null;return prep(words).join(",")===p.join(",")?words:null}
 function RNG(seed){let s=seed>>>0;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296}}
 function shuffle(rng){const x=alpha.slice();for(let i=N-1;i>0;i--){let j=Math.floor(rng()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x.map(v=>mod(v-x[0]))}
 const norm=(a,b,c,d)=>((mod(b-a)*N+mod(c-a))*N+mod(d-a)),norm3=(a,b,c)=>mod(b-a)*N+mod(c-a);
 function model(words){const p=prep(words),c=enc(p,alpha,0);let h=new Float64Array(N**3),tri=new Float64Array(N*N),inner=new Float64Array(M**3).fill(0.1);for(let i=0;i<c.length-3;i++)h[norm(c[i],c[i+1],c[i+2],c[i+3])]++;for(let i=0;i<c.length-2;i++){tri[norm3(c[i],c[i+1],c[i+2])]++;inner[(p[i]*M+p[i+1])*M+p[i+2]]++}let floor=Math.max(0.5,c.length*1e-6);return {q:h.map(v=>Math.log(Math.max(v,floor)/c.length)),q3:tri.map(v=>Math.log(Math.max(v,floor)/c.length)),inner:inner.map(v=>Math.log(v/c.length)),n:c.length}}
 function opt(c,model,seed,restarts=12,iterations=24000) {
 const {q,q3}=model, freq=new Map();for(let i=0;i<c.length-3;i++){let a=c[i],b=c[i+1],z=c[i+2],d=c[i+3],id=((a*N+b)*N+z)*N+d;freq.set(id,(freq.get(id)||0)+1)}
 const ng=[...freq].map(([id,count])=>{let d=id%N;id=Math.floor(id/N);let c=id%N;id=Math.floor(id/N);let b=id%N;let a=Math.floor(id/N);return {a,b,c,d,count}});const affected=Array.from({length:N},()=>[]);ng.forEach((g,i)=>{for(const x of new Set([g.a,g.b,g.c,g.d]))affected[x].push(i)});
 const mark=new Int32Array(ng.length),cur=new Float64Array(ng.length);let epoch=0; const rng=RNG(seed);
 function gs(g,k,stage){let a=k[g.a],b=k[g.b],c=k[g.c],d=k[g.d],i=((b-a+N)%N)*N+(c-a+N)%N;return (stage===0?q3[i]:q[i*N+(d-a+N)%N])*g.count}
 function score(k,stage=1){let s=0;for(const g of ng)s+=gs(g,k,stage);return s}
 let keys=[];
 for(let j=0;j<restarts;j++){let k=shuffle(rng),s=0,stage=j%3===0?1:0;for(let i=0;i<ng.length;i++){cur[i]=gs(ng[i],k,stage);s+=cur[i]}let rbest=stage===1?s:-Infinity,rk=k.slice();
 for(let it=0;it<iterations;it++){if(stage===0&&it===Math.floor(iterations/3)){stage=1;s=0;for(let i=0;i<ng.length;i++){cur[i]=gs(ng[i],k,stage);s+=cur[i]}rbest=s;rk=k.slice()}
 let a=1+Math.floor(rng()*(N-1)),b=1+Math.floor(rng()*(N-1));if(a===b)continue;let x=k[a],y=k[b];k[a]=y;k[b]=x;epoch++;let diff=0;for(const i of affected[a]){mark[i]=epoch;diff+=gs(ng[i],k,stage)-cur[i]}for(const i of affected[b])if(mark[i]!==epoch)diff+=gs(ng[i],k,stage)-cur[i];
 const frac=stage===0?it/(iterations/3):j%3===0?it/iterations:(it-iterations/3)/(2*iterations/3);const temp=(c.length/1000)*25*Math.pow(0.01,Math.max(0,frac));
 if(diff>=0||rng()<Math.exp(diff/temp)){s+=diff;for(const i of affected[a])cur[i]=gs(ng[i],k,stage);for(const i of affected[b])if(mark[i]!==epoch)cur[i]=gs(ng[i],k,stage);if(stage===1&&s>rbest){rbest=s;rk=k.slice()}}else{k[a]=x;k[b]=y}}
 keys.push({s:rbest,k:rk})}
 keys.sort((a,b)=>b.s-a.s);return {keys:keys.slice(0,8),score}
 }
 function innerScore(p,m){let s=0;for(let i=0;i<p.length-2;i++)s+=m.inner[(p[i]*M+p[i+1])*M+p[i+2]];return s/(p.length-2)}
 function choose(c,keys,m){let best=null;for(const t of keys)for(let j=0;j<N;j++){const p=dec(c,t.k,j),s=innerScore(p,m);if(!best||s>best.s)best={s,key:t.k,initial:j,p}}return best}
 const p26="SECRET_MESQAGE_",key26="SCQEDRBFUAGVHWTIXOJYPKZMLN",ring26="_ABCDEFGHIJKLMNOPQRSTUVWXYZ";let ia=0,ib=0,hist="";for(const x of p26){let a=ring26.indexOf(x),s=mod(a-ia,27);if(!s)throw Error("historical");ia=a;ib=mod(ib+s,26);hist+=key26[ib]}if(hist!=="YBRPUMDOGLMUTWA")throw Error("historical known-answer");
 let plants=[];for(let n=0;n<3;n++){let train=native.filter((s,i)=>i%3!==n).flatMap(s=>s.words),donor=native.filter((s,i)=>i%3===n).flatMap(s=>s.words),p=prep(donor),m=model([...gw,...train]),key=shuffle(RNG(3301+n)),initial=7+n,c=enc(p,key,initial),o=opt(c,m,0x33abc+n,12,24000),best=choose(c,o.keys,m);plants.push({n,length:p.length,train:m.n,trueScore:o.score(key),bestScore:o.keys[0].s,bestKeyMatches:o.keys.map(x=>x.k.filter((v,i)=>v===key[i]).length),exact:o.keys.some(x=>x.k.every((v,i)=>v===key[i])),finalKeyMatches:best.key.filter((v,i)=>v===key[i]).length,initial:best.initial,exactPlain:best.p.every((v,i)=>v===p[i]),exactRaw:JSON.stringify(unprep(best.p))===JSON.stringify(donor),nativeScore:innerScore(p,m),bestInner:best.s,repeats:c.slice(1).filter((v,i)=>v===c[i]).length})}
 const m=model([...gw,...native.flatMap(s=>s.words)]),train=d.pages.slice(0,8).flatMap(p=>p.indices),hold=d.pages.slice(8,15).flatMap(p=>p.indices),rng=RNG(0x66ef0);
 const lex=new Set([...gw,...native.flatMap(s=>s.words)].map(w=>w.join(",")));
 function metrics(p){const parts=[];let w=[];for(const x of p){if(x===sp){if(w.length)parts.push(w);w=[]}else if(x===res){if(w.length)w.push(w.at(-1));else w.push(res)}else w.push(x)}const n=parts.filter(w=>lex.has(w.join(","))).length;const counts=new Int32Array(M);p.forEach(x=>counts[x]++);return {length:p.length,innerScore:innerScore(p,m),wordCount:parts.length,knownWords:n,knownFraction:n/parts.length,spaceCount:counts[sp],ic:counts.reduce((s,x)=>s+x*(x-1),0)/(p.length*(p.length-1)),preview:p.slice(0,120).map(x=>x===sp?" ":d.translit[x]).join("")}}
 const result=[];
 for(const [name,t,h] of [["LP2",train,hold],["iid",train.map(()=>Math.floor(rng()*N)),hold.map(()=>Math.floor(rng()*N))]]){const o=opt(t,m,0x544224,12,24000),b=choose(t,o.keys,m),p=dec([...t,...h],b.key,b.initial);result.push({name,key:b.key,initial:b.initial,objective:o.keys[0].s,train:metrics(p.slice(0,t.length)),holdout:metrics(p.slice(t.length)),canonical:!!unprep(p),reenc:enc(p,b.key,b.initial).every((v,i)=>v===[...t,...h][i])})}
 return {hist,corpusWords:gw.length,corpusRunes:gw.flat().length,plants,result}
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt","resources/external/kybalion-gitenberg-14209.txt"];
const data=paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(clockAttack(JSON.parse(data[0]),JSON.parse(data[1]),data.slice(2)),null,2));
