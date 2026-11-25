"use strict";
const fs=require("node:fs");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp2-transcription.txt"];
function run(raw,spec) {
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const id=a=>String.fromCharCode(...a.map(x=>65+x)),nums=s=>Array.from(s,x=>x.charCodeAt(0)-65);
 const words=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger));
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error(w);o.push(q.i);j+=q.t.length;}return o;}
 const hold=new Set(["0_koan_1","0_loss_of_divinity"]);
 const train=gold.sections.filter(s=>!hold.has(s.name)).map(s=>words(s.source_text));
 const types=new Set();for(const a of train)for(const w of a)types.add(id(w));for(const l of raw[2].split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+(\d+)$/i);if(m)for(const alt of [true,false])types.add(id(word(m[1],alt)));}
 const lex=Array.from({length:30},()=>[]);for(const w of types)if(w.length<30)lex[w.length].push(nums(w));
 const uni=new Float64Array(29),bi=new Float64Array(29**2),tri=new Float64Array(29**3);let total=0;for(const a of train){const t=a.flat();for(let i=0;i<t.length;i++){uni[t[i]]++;total++;if(i)bi[t[i-1]*29+t[i]]++;if(i>1)tri[(t[i-2]*29+t[i-1])*29+t[i]]++;}}
 const lm=new Float64Array(29**3);for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++){const p0=(uni[c]+0.5)/(total+14.5),p1=(bi[b*29+c]+8*p0)/(uni[b]+8),p2=(tri[(a*29+b)*29+c]+8*p1)/(bi[a*29+b]+8);lm[(a*29+b)*29+c]=Math.log(p2);}
 const score=t=>{let s=0;for(let i=2;i<t.length;i++)s+=lm[(t[i-2]*29+t[i-1])*29+t[i]];return s/Math.max(1,t.length-2);};
 const M=n=>29n**BigInt(n),mod=(x,m)=>(x%m+m)%m;
 function inv(a,m){let [r,s,t,u]=[m,a,0n,1n];while(s){const q=r/s;[r,s,t,u]=[s,r-q*s,u,t-q*u];}if(r!==1n)throw Error("nonunit "+a);return mod(t,m);}
 function int(a,orient){const v=orient==="BE"?a:a.slice().reverse();return v.reduce((n,x)=>n*29n+BigInt(x),0n);}
 function dig(v,n,orient){const a=Array(n);for(let i=0;i<n;i++){a[orient==="BE"?n-1-i:i]=Number(v%29n);v/=29n;}if(v)throw Error("overflow");return a;}
 function transform(a,k,orient,mode,decode){const m=M(a.length);const mul=(mode==="encMultiplier")===decode?inv(k,m):k;return dig(int(a,orient)*mul%m,a.length,orient);}
 function same(a,b){return a.length===b.length&&a.every((x,i)=>x===b[i]);}
 const fmt=t=>t.map(x=>gp.translit[x]).join(""),span=(a,lo,hi)=>a.filter(w=>w.start>=lo&&w.start+w.w.length<=hi);
 function wordScore(p,ws,base){let hit=0,all=0;for(const w of ws){all+=w.w.length;if(types.has(id(p.slice(w.start-base,w.start-base+w.w.length))))hit+=w.w.length;}return {hit,all};}
 function layout(a){let off=0;return a.map(w=>{const p={w,start:off};off+=w.length;return p;});}
 const W=[];let w=[];for(const c of raw[3].split("%").slice(0,55).join("%")){if(ix.has(c))w.push(ix.get(c));else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){W.push(w);w=[];}}if(w.length)W.push(w);
 const tape=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);if(W.length!==2896||tape.length!==12956||!same(W.flat(),tape))throw Error("source mismatch");
 

const {name,mode,startAt=0,endAt=Infinity}=spec,orient="LE",m=13,mm=M(m);let C,G,Ptrue,key;
if(name==="p0-2"){C=tape.slice(0,729);G=layout(W).filter(w=>w.start+w.w.length<=729);}
else{const sec=gold.sections.find(x=>x.name===name),ww=words(sec.source_text),i=name==="0_koan_1"?143:67;Ptrue=ww.slice(i).flat();G=layout(ww.slice(i));key=name==="0_koan_1"?7427232006771293411n:234567891234734567n;if(key>=mm||key%29n===0n)throw Error("control key");C=transform(Ptrue,key,orient,mode,false);}
const ns=G.slice(0,4).map(x=>x.w.length);
if(ns[0]+ns[1]!==m)throw Error("anchor length");const b=M(ns[0]),m3=M(ns[2]),m4=M(ns[3]),mt=mm*m3*m4,ct=int(C.slice(0,ns.reduce((a,b)=>a+b)),orient),cm=ct%mm,cinv=inv(cm,mm),ci=int(C,orient);
const L1=lex[ns[0]].map(w=>int(w,orient)).filter(x=>x%29n!==0n),L2=lex[ns[1]].map(w=>int(w,orient)),L3=new Set(lex[ns[2]].map(w=>int(w,orient))),L4=new Set(lex[ns[3]].map(w=>int(w,orient)));
const S1=L1.map(x=>x*cinv%mm),S2=L2.map(x=>x*b*cinv%mm),keys=new Set();let pairs=0,g3=0,g4=0;const ts=Date.now();
function process(z0,a){const z=mode==="encMultiplier"?mod(z0*(2n-a*z0),mt):a,p=(z*ct%mt)/mm;pairs++;if(!L3.has(p%m3))return;g3++;if(!L4.has(p/m3))return;g4++;keys.add(a);}
for(let i=startAt;i<Math.min(endAt,S1.length);i++){
 if(mode==="decMultiplier"){for(const y of S2){const z=(S1[i]+y)%mm;process(z,z);}}
 else{const zs=S2.map(y=>(S1[i]+y)%mm),pre=[1n];for(const z of zs)pre.push(pre.at(-1)*z%mm);let t=inv(pre.at(-1),mm);for(let j=zs.length-1;j>=0;j--){const a=t*pre[j]%mm;t=t*zs[j]%mm;process(zs[j],a);}}
}
const fitN=name==="p0-2"?262:Math.floor(C.length/2),fitmod=M(fitN),fws=span(G,0,fitN).filter(w=>w.start>=m),hws=span(G,fitN,C.length);let best=null;
for(const a of keys){const z=mode==="encMultiplier"?inv(a,fitmod):a,P=dig((ci%fitmod)*z%fitmod,fitN,orient),q=wordScore(P,fws,0),s=score(P.slice(m));if(!best||q.hit>best.hit||q.hit===best.hit&&s>best.s)best={a,hit:q.hit,all:q.all,s};}
if(best){const P=transform(C,best.a,orient,mode,true),H=wordScore(P,hws,0);if(!same(transform(P,best.a,orient,mode,false),C))throw Error("replay");best={key:best.a.toString(),fitHit:best.hit,fitTotal:best.all,fitScore:best.s,holdHit:H.hit,holdTotal:H.all,holdScore:score(P.slice(fitN)),exact:Ptrue?P.filter((x,i)=>x===Ptrue[i]).length:undefined,head:G.slice(0,12).map(w=>fmt(P.slice(w.start,w.start+w.w.length))).join(" ")};}
return {name,mode,ns,totalFirst:L1.length,second:L2.length,startAt,endAt:Math.min(endAt,L1.length),pairs,g3,g4,keys:keys.size,trueKey:key?.toString(),trueCandidate:key?keys.has(key):undefined,best,ms:Date.now()-ts};
}
const specs=[{"name":"p0-2","mode":"decMultiplier"},{"name":"0_koan_1","mode":"decMultiplier"},{"name":"0_loss_of_divinity","mode":"decMultiplier"},{"name":"p0-2","mode":"encMultiplier"},{"name":"0_koan_1","mode":"encMultiplier"},{"name":"0_loss_of_divinity","mode":"encMultiplier"}];
const raw=files.map(p=>fs.readFileSync(p,"utf8"));
for(const spec of specs)console.log(JSON.stringify(run(raw,spec),null,2));
