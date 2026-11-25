'use strict';
const fs=require('node:fs'),path=require('node:path');const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function encode(gp,s){let out=[],tok=gp.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;continue}if(w.startsWith("IO",i)){out.push(27);i+=2;continue}let t=tok.find(x=>w.startsWith(x[0],i));if(!t)throw Error(w);out.push(t[1]);i+=t[0].length}}return out}
function attack(gp,docs){
 const q=29,N=3008,fit=2105,K=8,mod=x=>(x+1624)%29,ix=(a,b,c)=>(a*29+b)*29+c;
 let seed=330112;const rng=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296),rand=n=>Math.floor(rng()*n);
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){let j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
 const maps=[];for(let s=1;s<29;s++)for(let d=0;d<29;d++)maps.push({s,d,p:Int16Array.from({length:29},(_,r)=>(s*r+d)%29)});
 function model(ds){let u=new Float64Array(29),bi=new Float64Array(841),tr=new Float64Array(24389);for(const d of ds)for(let i=0;i<d.length;i++){u[d[i]]++;if(i>=1)bi[d[i-1]*29+d[i]]++;if(i>=2)tr[ix(d[i-2],d[i-1],d[i])]++}let n=u.reduce((a,b)=>a+b,0)+14.5;const up=Array.from(u,x=>(x+.5)/n),bp=new Float64Array(841),tp=new Float64Array(24389);for(let a=0;a<29;a++){let bs=0;for(let b=0;b<29;b++)bs+=bi[a*29+b];for(let b=0;b<29;b++)bp[a*29+b]=(bi[a*29+b]+20*up[b])/(bs+20)}for(let a=0;a<29;a++)for(let b=0;b<29;b++){let s=0;for(let c=0;c<29;c++)s+=tr[ix(a,b,c)];for(let c=0;c<29;c++)tp[ix(a,b,c)]=Math.log((tr[ix(a,b,c)]+35*bp[b*29+c])/(s+35))}return{lp:up.map(Math.log),tp}}
 function decode(c,key){const p=c.slice(0,2);for(let i=2;i<c.length;i++){const k=key[i%q];p.push(k.map.p[mod(c[i]-k.a*c[i-1]-k.b*c[i-2])])}return p}
 function replay(c,key,p){for(let i=2;i<c.length;i++){const k=key[i%q],v=k.map.p.indexOf(p[i]);if(v<0||(v+k.a*c[i-1]+k.b*c[i-2])%29!==c[i])throw Error("replay")}}
 function score(p,m,lo,hi){let s=0;for(let i=Math.max(4,lo);i<hi;i++)s+=m.tp[ix(p[i-2],p[i-1],p[i])];return s/(hi-Math.max(4,lo))}
 function solve(c,m,truthKey=null,truth=null,restarts=3,sweeps=20){
 const pos=Array.from({length:q},()=>[]);for(let i=2;i<fit;i++)pos[i%q].push(i);
 const sortedLP=m.lp.slice().sort((a,b)=>b-a),cands=[],nomination=[];
 for(let t=0;t<q;t++){let list=[];for(let a=0;a<29;a++)for(let b=0;b<29;b++){let rs=Int16Array.from(pos[t],i=>mod(c[i]-a*c[i-1]-b*c[i-2])),h=new Uint16Array(29);for(const x of rs)h[x]++;let sorted=Array.from(h).sort((a,b)=>b-a),score=sorted.reduce((z,x,i)=>z+x*sortedLP[i],0);list.push({a,b,rs,h,score})}list.sort((a,b)=>b.score-a.score);if(truthKey)nomination.push(list.findIndex(x=>x.a===truthKey[t].a&&x.b===truthKey[t].b)+1);let short=list.slice(0,K);
 for(const a of short){let best=-Infinity,win=null;for(const map of maps){let s=0;for(let r=0;r<29;r++)s+=a.h[r]*m.lp[map.p[r]];if(s>best){best=s;win=map}}a.map=win;a.s=best}short.sort((a,b)=>b.s-a.s);cands.push(short)}
 const initialKey=cands.map(x=>x[0]),initial=decode(c,initialKey);
 function stats(key,out){return{train:score(out,m,4,fit),held:score(out,m,fit,N),matches:truth?out.slice(fit).filter((x,i)=>x===truth[fit+i]).length:null,coeffs:truthKey?key.filter((x,i)=>x.a===truthKey[i].a&&x.b===truthKey[i].b).length:null,fullKeys:truthKey?key.filter((x,i)=>x.a===truthKey[i].a&&x.b===truthKey[i].b&&x.map.s===truthKey[i].map.s&&x.map.d===truthKey[i].map.d).length:null}}
 let best=null,logs=[];
 for(let rep=0;rep<restarts;rep++){let key=cands.map(list=>rep===0?list[0]:list[rand(Math.min(rep+1,K))]),p=decode(c,key).slice(0,fit),last=-Infinity,steps=0;
 for(let it=0;it<sweeps;it++){for(const t of shuffle(Array.from({length:q},(_,i)=>i))){const ps=pos[t],context=new Float64Array(ps.length*29);for(let j=0;j<ps.length;j++){const i=ps[j];for(let v=0;v<29;v++){let s=0;if(i>=4)s+=m.tp[ix(p[i-2],p[i-1],v)];if(i>=3&&i+1<fit)s+=m.tp[ix(p[i-1],v,p[i+1])];if(i+2<fit)s+=m.tp[ix(v,p[i+1],p[i+2])];context[j*29+v]=s}}let win=null,hi=-Infinity;for(const a of cands[t]){const w=new Float64Array(841);for(let j=0;j<ps.length;j++){const r=a.rs[j]*29,o=j*29;for(let v=0;v<29;v++)w[r+v]+=context[o+v]}for(const map of maps){let s=0;for(let r=0;r<29;r++)s+=w[r*29+map.p[r]];if(s>hi){hi=s;win={...a,map}}}}key[t]=win;for(let j=0;j<ps.length;j++)p[ps[j]]=win.map.p[win.rs[j]]}
 let s=score(p,m,4,fit);steps=it+1;if(s+1e-7<last)throw Error("coordinate objective");if(s-last<1e-8)break;last=s}
 const out=decode(c,key);replay(c,key,out);const r={...stats(key,out),steps};logs.push(r);if(!best||r.train>best.train)best={...r,key:key.map(x=>({a:x.a,b:x.b,s:x.map.s,d:x.map.d})),preview:out.slice(fit,fit+120).map(x=>gp.translit[x]).join("")}}
 return{nomination,initial:stats(initialKey,initial),logs,best}
 }
 const controls=[];for(let j=0;j<3;j++){const p=docs[j].slice(20000,20000+N),key=Array.from({length:q},()=>({a:rand(29),b:rand(29),map:maps[rand(maps.length)]})),c=p.slice(0,2);for(let i=2;i<p.length;i++){const k=key[i%q];c.push((k.map.p.indexOf(p[i])+k.a*c[i-1]+k.b*c[i-2])%29)}const m=model(docs.filter((_,i)=>i!==j));controls.push({control:j,...solve(c,m,key,p,3,20)})}
 const original=gp.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);const m=model(docs);return{q,fit,N,K,controls,original:solve(original,m,null,null,3,20)}
}
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));const docs=["resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"].map(p=>encode(gp,read(p)));console.log(JSON.stringify(attack(gp,docs),null,2));
