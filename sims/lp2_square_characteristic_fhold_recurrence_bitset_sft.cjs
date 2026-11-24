"use strict";
function run(gp,raw,config){
 const mod=x=>(x%29+29)%29;const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error(w);out.push(t.i);w=w.slice(t.s.length)}}return out}
 function language(train){const uni=new Float64Array(29).fill(.5),bi=new Float64Array(30*29),tri=new Float64Array(30*30*29),btotal=new Float64Array(30),ttotal=new Float64Array(30*30);let a=29,b=29;for(const p of train){uni[p]++;bi[b*29+p]++;btotal[b]++;tri[(a*30+b)*29+p]++;ttotal[a*30+b]++;a=b;b=p;}const sum=uni.reduce((x,y)=>x+y,0),logp=new Float64Array(30*30*29);for(let a=0;a<30;a++)for(let b=0;b<30;b++)for(let p=0;p<29;p++){const u=uni[p]/sum,v=(bi[b*29+p]+8*u)/(btotal[b]+8);logp[(a*30+b)*29+p]=Math.log((tri[(a*30+b)*29+p]+12*v)/(ttotal[a*30+b]+12));}return logp;}
 const LM=language(native(raw[0]));let state=123456789;const rand=n=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)%n};
 function sequence(coef,seed,n){const k=seed.slice();for(let i=5;i<n;i++){let z=0;for(let j=0;j<5;j++)z+=coef[j]*k[i-5+j];k.push(z%29);}return k.slice(0,n)}
 function plant(P,coef){const seed=Array.from({length:5},()=>rand(29)),K=sequence(coef,seed,P.length+5);let t=0;const C=[],clock=[];for(const p of P){clock.push(t);if(!p){C.push(0);continue}C.push(mod(p+K[t++]));}return {C,K,clock,seed}}
 function longest(C){let best={offset:0,n:0},s=0;for(let i=0;i<=C.length;i++)if(i===C.length||C[i]===0){if(i-s>best.n)best={offset:s,n:i-s};s=i+1;}return best;}
 function ngram(P){let a=29,b=29,v=0;for(const p of P){v+=LM[(a*30+b)*29+p];a=b;b=p;}return v;}
 function search(C,fit,coef){const n=C.length,R=29**3,W=Math.ceil(R/32),L=29**2,started=Date.now();if(C.some(x=>!x)||fit<5)throw Error("invalid zero-free anchor");const basis=Array.from({length:5},(_,j)=>sequence(coef,Array.from({length:5},(_,i)=>+(i===j)),n));
  const table=new Uint32Array(fit*29*W);for(let s=0;s<R;s++){const x=s/841|0,y=(s/29|0)%29,z=s%29,word=s>>>5,bit=1<<(s&31);for(let i=0;i<fit;i++){const v=(x*basis[2][i]+y*basis[3][i]+z*basis[4][i])%29;table[(i*29+v)*W+word]|=bit;}}
  const mask=new Uint32Array(W),p=new Uint8Array(n),k=new Uint8Array(n),best=[];let fullBest=null,survivors=0,fullSurvivors=0;const hist=new Uint32Array(fit+1);
  for(let l=0;l<L;l++){const u=l/29|0,v=l%29;mask.fill(0xffffffff);if(R%32)mask[W-1]=0xffffffff>>>(32-R%32);for(let i=0;i<fit;i++){const q=mod(C[i]-(u*basis[0][i]+v*basis[1][i])%29),off=(i*29+q)*W;for(let j=0;j<W;j++)mask[j]&=~table[off+j];}
   for(let j=0;j<W;j++){let bits=mask[j];while(bits){const bit=bits&-bits,s=j*32+(31-Math.clz32(bit));bits=(bits^bit)>>>0;survivors++;const seed=[u,v,s/841|0,(s/29|0)%29,s%29];for(let t=0;t<5;t++)k[t]=seed[t];let a=29,b=29,score=0,fitScore=0,legal=true;for(let i=0;i<n;i++){if(i>=5){let z=0;for(let h=0;h<5;h++)z+=coef[h]*k[i-5+h];k[i]=z%29;}const q=mod(C[i]-k[i]);p[i]=q;if(!q){legal=false;if(i<fit)throw Error("mask violated");}score+=LM[(a*30+b)*29+q];a=b;b=q;if(i===fit-1)fitScore=score;}
    if(legal){fullSurvivors++;if(!fullBest||score>fullBest.fullScore)fullBest={seed,score:fitScore,fullScore:score,plain:Array.from(p)};}
    if(best.length<16||fitScore>best[best.length-1].score){best.push({seed,score:fitScore,fullScore:score,legalHeld:legal,plain:Array.from(p)});best.sort((a,b)=>b.score-a.score);if(best.length>16)best.pop();}
   }}
  }return {total:29**5,survivors,fullSurvivors,best,fullBest,ms:Date.now()-started};
 }
 const out=[];for(const [name,source,coef] of config.cases){let C,P=null,truth=null,offset,n;if(source===0){const all=gp.pages.filter(p=>p.page>=33&&p.page<=39).flatMap(p=>p.indices),z=longest(all);offset=z.offset;n=z.n;C=all.slice(offset,offset+n);}else{const p=native(raw[source]).slice(1000,1000+config.controlSize),z=plant(p,coef),l=longest(z.C);offset=l.offset;n=l.n;C=z.C.slice(offset,offset+n);P=p.slice(offset,offset+n);truth=z.K.slice(z.clock[offset],z.clock[offset]+5);if(sequence(coef,truth,n).map((x,i)=>mod(C[i]-x)).join()!==P.join())throw Error("plant replay");}
  const fit=Math.min(config.fit,Math.floor(n*.65)),q=search(C,fit,coef),summary=x=>({...x,exact:P?x.plain.filter((v,i)=>v===P[i]).length:null,withheldExact:P?x.plain.slice(fit).filter((v,i)=>v===P[fit+i]).length:null,withheldScore:ngram(x.plain.slice(fit)),preview:x.plain.map(x=>gp.translit[x]).join("")});out.push({name,source,coef,offset,n,fit,truth,truthFitScore:P?ngram(P.slice(0,fit)):null,...q,best:q.best.map(summary),fullBest:q.fullBest?summary(q.fullBest):null});
 }return out
}
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const d=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(run(JSON.parse(d[0]),d.slice(1),{"controlSize":6000,"fit":90,"cases":[["A control Emerson",1,[10,2,2,12,24]],["B control Gibran",2,[3,24,22,2,18]],["A original p33–39",0,[10,2,2,12,24]],["B original p33–39",0,[3,24,22,2,18]]]}),null,2));
