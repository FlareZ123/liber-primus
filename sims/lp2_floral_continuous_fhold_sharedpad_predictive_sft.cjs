"use strict";
function experiment(inputs,width=256){
 const [gp,native,gib,sh,em]=[JSON.parse(inputs[0]),JSON.parse(inputs[1]),inputs[2],inputs[3],inputs[4]];
 const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x+29)%29;
 const map=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function donor(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tokens.find(t=>w.startsWith(t.s));if(!t)throw Error(w);out.push(t.i);w=w.slice(t.s.length)}}return out}
 function body(s,start,end){const a=s.indexOf(start),b=s.indexOf(end,a);assert(a>=0&&b>a,"donor boundaries");return s.slice(a,b)}
 const g=donor(body(gib,"Almustafa, the{7} chosen","End of the Project Gutenberg EBook of The Prophet")),s=donor(sh),e=donor(body(em,"THERE is one mind","*** END OF THIS PROJECT GUTENBERG EBOOK"));
 const ds=[g,s,e];const train=ds.map(x=>x.slice(0,Math.floor(x.length*.7)));
 const off=[0,1,30,871],sizes=[1,29,841,24389],N=25260,counts=new Uint32Array(N*29),tot=new Uint32Array(N),probs=new Float64Array(N*29),ll=new Float64Array(N*29),next=new Uint16Array(N*29);
 for(const x of train)for(let i=0;i<x.length;i++){let code=0;for(let l=0;l<=Math.min(i,3);l++){if(l>0)code=x[i-l]*29**(l-1)+code;const r=off[l]+code;counts[r*29+x[i]]++;tot[r]++}}
 for(let l=0;l<=3;l++)for(let a=0;a<sizes[l];a++){
  const r=off[l]+a,back=l===0?-1:off[l-1]+a%sizes[l-1],prior=l===0?29*.5:8;
  for(let p=0;p<29;p++){const ix=r*29+p;probs[ix]=(counts[ix]+prior*(l===0?1/29:probs[back*29+p]))/(tot[r]+prior);ll[ix]=Math.log(29*probs[ix]);next[ix]=l<3?off[l+1]+a*29+p:off[3]+(a%841)*29+p}
 }
 const score=P=>{let r=0,z=0;for(const p of P){z+=ll[r*29+p];r=next[r*29+p]}return z/P.length};
 function decode(C,steps,cap,fixed=null){
  const n=C.length;let beam=[{pos:Array(n).fill(0),ctx:Array(n).fill(0),s:0,parent:null,k:-1}];let expanded=0,pruned=0,peak=0;
  for(let t=0;t<steps;t++){
   const best=new Map();
   for(const b of beam){
    const options=C.map((c,j)=>{
     const out=[];let p=b.pos[j],r=b.ctx[j],z=0,h=0;
     while(p<c.length){out.push([p,r,z,h]);if(c[p]!==0)break;z+=ll[r*29];r=next[r*29];p++;h++}
     return out;
    });
    if(options.some(x=>!x.length))continue;
    const arr=[];function rec(j){if(j<n){for(const o of options[j]){arr[j]=o;rec(j+1)}return}
     const k0=fixed?fixed[t]:0,k1=fixed?k0+1:29;
     for(let k=k0;k<k1;k++){
      const pos=[],ctx=[],runes=[],holds=[];let z=b.s,ok=true;
      for(let j=0;j<n;j++){const [i,r,v,h]=arr[j],p=mod(C[j][i]-k);if(!p){ok=false;break}const ix=r*29+p;pos.push(i+1);ctx.push(next[ix]);runes.push(p);holds.push(h);z+=v+ll[ix]}
      if(!ok)continue;expanded++;const code=pos.join(",")+";"+ctx.join(",");const old=best.get(code);
      if(!old||z>old.s)best.set(code,{pos,ctx,s:z,parent:b,k,runes,holds})
     }
    }rec(0);
   }
   peak=Math.max(peak,best.size);if(!best.size)return {possible:false,failedAt:t,expanded,pruned,peak};
   beam=[...best.values()].sort((a,b)=>b.s-a.s);pruned+=Math.max(0,beam.length-cap);beam.length=Math.min(cap,beam.length);
  }
  const top=beam[0],chain=[];for(let b=top;b.parent;b=b.parent)chain.push(b);chain.reverse();
  const K=chain.map(b=>b.k),P=C.map((_,j)=>chain.flatMap(b=>Array(b.holds[j]).fill(0).concat(b.runes[j])));
  for(let j=0;j<n;j++){let k=0;const re=P[j].map(p=>p===0?0:mod(p+K[k++]));assert(String(re)===String(C[j].slice(0,re.length)),"prefix replay");assert(k===steps,"key length")}
  return {possible:true,K,P,score:P.map(score),expanded,pruned,peak,margin:beam.length>1?top.s-beam[1].s:null};
 }

 let seed=0x44f10a1;function rand(){return seed=(Math.imul(seed,1664525)+1013904223)>>>0}
 const lengths=gp.pages.slice(40,49).map(p=>p.indices.length),steps=200;
 assert(String(lengths)==="231,273,272,274,273,270,270,274,271","physical page shapes");
 const authentic=native.sections.flatMap(s=>Array.from(s.source_text).filter(x=>map.has(x)).map(x=>map.get(x)));
 let cursor=0;const nat=lengths.map(n=>{const x=authentic.slice(cursor,cursor+n);cursor+=n;assert(x.length===n,"native control length");return x});
 const lit=lengths.map((n,j)=>{const x=ds[j%3],a=Math.floor(x.length*.75)+1000*Math.floor(j/3);return x.slice(a,a+n)});
 const enc=(P,K)=>{let k=0;return P.map(p=>p===0?0:mod(p+K[k++]))};
 const render=P=>P.map(p=>gp.translit[p]).join("");
 function pair(A,B,T){let states=new Map([[0,0]]);const n=B.length+1;
  for(let t=0;t<T;t++){const nx=new Map();for(const [key,s] of states){const i=Math.floor(key/n),j=key%n;for(let a=i;a<A.length;a++){for(let b=j;b<B.length;b++){const k=(a+1)*n+b+1,v=s+(A[a]===B[b]);if(v>(nx.get(k)??-1))nx.set(k,v);if(B[b]!==0)break}if(A[a]!==0)break}}states=nx}return Math.max(...states.values())}
 function cap(C){let z=0;for(let i=0;i<C.length;i++)for(let j=i+1;j<C.length;j++)z+=pair(C[i],C[j],steps);return z}
 function trueEqual(P){const X=P.map(p=>p.filter(x=>x!==0).slice(0,steps));let z=0;for(let i=0;i<X.length;i++)for(let j=i+1;j<X.length;j++)for(let k=0;k<steps;k++)z+=X[i][k]===X[j][k];return z}
 function run(C,truth=null,keys=null){
  assert(C.every(c=>c.length-c.filter(x=>!x).length>=steps),"steps not guaranteed");
  const fit=decode(C.slice(0,6),steps,width),held=fit.possible?decode(C.slice(6),steps,2048,fit.K):null;
  const joint=decode(C,steps,width);
  function fmt(r,js){if(!r||!r.possible)return r;return {...r,text:r.P.map(render),plainCorrect:truth?r.P.map((p,i)=>p.filter((x,k)=>x===truth[js[i]][k]).length):null,plainLengths:r.P.map(p=>p.length),keyCorrect:keys?r.K.filter((x,k)=>x===keys[0][k]).length:null}}
  return {cipherF:C.map(c=>c.filter(x=>!x).length),fit:fmt(fit,[0,1,2,3,4,5]),holdout:fmt(held,[6,7,8]),joint:fmt(joint,[0,1,2,3,4,5,6,7,8]),pairwiseCeiling:cap(C),truthEqual:truth?trueEqual(truth):null,truthScores:truth?truth.map(score):null};
 }
 function plant(P,independent){const K=Array.from({length:9},()=>Array.from({length:274},()=>rand()%29));if(!independent)for(let j=1;j<9;j++)K[j]=K[0];return run(P.map((p,j)=>enc(p,K[j])),P,K)}
 const controls=[{kind:"authentic native shared",...plant(nat,false)},{kind:"independent literature shared",...plant(lit,false)},{kind:"authentic native independent pads",...plant(nat,true)}];
 const original=run(gp.pages.slice(40,49).map(p=>p.indices));
 return {width,steps,lengths,trainingRunes:train.map(x=>x.length),controls,original};
}
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),Number(process.argv[2]||128)),null,2));
