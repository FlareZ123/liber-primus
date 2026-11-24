"use strict";
function run(gp,raw,config){
 const mod=x=>(x%29+29)%29;const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error(w);out.push(t.i);w=w.slice(t.s.length)}}return out}
 function language(train){const uni=new Float64Array(29).fill(.5),bi=new Float64Array(30*29),tri=new Float64Array(30*30*29),btotal=new Float64Array(30),ttotal=new Float64Array(30*30);let a=29,b=29;for(const p of train){uni[p]++;bi[b*29+p]++;btotal[b]++;tri[(a*30+b)*29+p]++;ttotal[a*30+b]++;a=b;b=p;}const sum=uni.reduce((x,y)=>x+y,0),logp=new Float64Array(30*30*29);for(let a=0;a<30;a++)for(let b=0;b<30;b++)for(let p=0;p<29;p++){const u=uni[p]/sum,v=(bi[b*29+p]+8*u)/(btotal[b]+8);logp[(a*30+b)*29+p]=Math.log((tri[(a*30+b)*29+p]+12*v)/(ttotal[a*30+b]+12));}return logp;}
 const LM=language(native(raw[0])),first=new Uint8Array(841),second=new Uint8Array(841),decode=new Uint8Array(841);for(let i=0;i<841;i++){first[i]=i/29|0;second[i]=i%29;decode[i]=mod(first[i]-second[i]);}
 let state=123456789;const rand=n=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)%n};
 function plant(P){const a=rand(29),b=1+rand(28),c=rand(29),u=rand(29),v=rand(29);let x=u,y=v;const C=[],K=[],active=[];for(const p of P){if(!p){C.push(0);K.push(null);active.push(null);continue;}C.push(mod(p+x));K.push(x);active.push(y);const z=mod(a*y+b*x+c);x=y;y=z;}return {a,b,c,u,v,C,K,active}}
 function longest(C){let best={offset:0,n:0},s=0;for(let i=0;i<=C.length;i++)if(i===C.length||C[i]===0){if(i-s>best.n)best={offset:s,n:i-s};s=i+1;}return best;}
 function sequence({a,b,c,u,v},n){const k=[u,v];for(let i=2;i<n;i++)k.push(mod(a*k[i-1]+b*k[i-2]+c));return k.slice(0,n);}
 function decrypt(C,q){const k=sequence(q,C.length);return C.map((x,i)=>mod(x-k[i]));}
 function ngram(P){let a=29,b=29,v=0;for(const p of P){v+=LM[(a*30+b)*29+p];a=b;b=p;}return v;}
 function search(C,top=16){const n=C.length;if(C.some(x=>x===0))throw Error("anchor must be zero-free");const next=new Uint16Array(841);let survivors=0,total=0,scored=0,best=[];const seen=new Set();const started=Date.now();
  for(let a=0;a<29;a++)for(let b=1;b<29;b++)for(let c=0;c<29;c++){
   for(let s=0;s<841;s++)next[s]=second[s]*29+(a*second[s]+b*first[s]+c)%29;
   for(let s0=0;s0<841;s0++){total++;let s=s0,i=0;for(;i<n;i++){if(C[i]===first[s])break;s=next[s];}if(i<n)continue;survivors++;s=s0;let x=29,y=29,score=0,tag=0;for(let j=0;j<n;j++){const k=first[s],p=decode[C[j]*29+k];score+=LM[(x*30+y)*29+p];x=y;y=p;if(j<5)tag=tag*29+k;s=next[s];}scored++;
    if(best.length===top&&score<=best[best.length-1].score)continue;if(seen.has(tag))continue;seen.add(tag);best.push({a,b,c,u:first[s0],v:second[s0],score,tag});best.sort((x,y)=>y.score-x.score);if(best.length>top){const old=best.pop();seen.delete(old.tag);}
   }
  }
  return {total,survivors,scored,ms:Date.now()-started,best};
 }
 const out=[];for(const name of config.cases){
  let C,P=null,truth=null,offset=0,n;
  if(name==="original"){const all=gp.pages.filter(p=>p.page>=3&&p.page<=7).flatMap(p=>p.indices),z=longest(all);offset=z.offset;n=z.n;C=all.slice(offset,offset+n);}
  else {const source=name==="Emerson"?1:2;P=native(raw[source]).slice(1000,1000+config.controlSize);const z=plant(P),l=longest(z.C);offset=l.offset;n=l.n;truth={a:z.a,b:z.b,c:z.c,u:z.K[offset],v:z.active[offset]};P=P.slice(offset,offset+n);C=z.C.slice(offset,offset+n);if(decrypt(C,truth).join()!==P.join())throw Error("plant failed");}
  const fit=Math.min(config.fit,Math.floor(n*.65)),s=search(C.slice(0,fit));const candidates=s.best.map(x=>{const p=decrypt(C,x);return {...x,fullScore:ngram(p),withheldScore:ngram(p.slice(fit)),legalHeld:p.slice(fit).every(v=>v!==0),exact:P?p.filter((v,i)=>v===P[i]).length:null,withheldExact:P?p.slice(fit).filter((v,i)=>v===P[fit+i]).length:null,plain:p,preview:p.map(x=>gp.translit[x]).join("")};});out.push({name,offset,n,fit,truth,truthTrainScore:P?ngram(P.slice(0,fit)):null,truthHeldScore:P?ngram(P.slice(fit)):null,total:s.total,survivors:s.survivors,scored:s.scored,ms:s.ms,candidates});
 }
 return out;
}
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const d=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(run(JSON.parse(d[0]),d.slice(1),{"cases":["Emerson","Gibran","original"],"controlSize":6000,"fit":100}),null,2));
