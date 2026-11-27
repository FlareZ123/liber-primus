'use strict';
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
function experiment(corpus,native,literary,mode="all"){
 const Q=29,S=87,mod=x=>(x%Q+Q)%Q,split=249;
 const m=new Map(corpus.translit.map((x,i)=>[x,i]));
 function gp(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/ING/g,"NG").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");while(w.length){const n=m.has(w.slice(0,2))?2:1,v=m.get(w.slice(0,n));if(v===undefined)throw Error(w);out.push(v);w=w.slice(n);}}return out;}
 const tr=gp(literary.slice(0,Math.floor(literary.length/2))),hist=new Float64Array(Q).fill(.2),cnt=new Float64Array(Q*Q).fill(.2);
 for(let i=0;i<tr.length;i++){hist[tr[i]]++;if(i)cnt[Q*tr[i-1]+tr[i]]++;}
 const log1=Array.from(hist,x=>Math.log(x/(tr.length+Q*.2))),log2=new Float64Array(Q*Q);
 for(let p=0;p<Q;p++){let s=0;for(let q=0;q<Q;q++)s+=cnt[p*Q+q];for(let q=0;q<Q;q++)log2[p*Q+q]=Math.log(cnt[p*Q+q]/s);}
 const pow=Array.from({length:Q},(_,g)=>{const a=new Int32Array(Q);a[0]=1;for(let p=1;p<Q;p++)a[p]=a[p-1]*g%Q;return a;});
 const inv=Array.from({length:Q},(_,x)=>{for(let z=1;z<Q;z++)if(x*z%Q===1)return z;return 0;});
 const orig=corpus.pages.slice(0,3).flatMap(p=>p.indices).slice(13);
 if(orig.length!==716||orig[0]===0||native.length<2700)throw Error("unexpected source");
 function encode(plain,k,c0){if(!plain[0]||!c0)throw Error("nonzero initial condition");const c=[c0];let p=plain[0],v=c0;for(let i=1;i<plain.length;i++){const q=plain[i];if(!q){c.push(0);continue;}v=mod(v+mod(q-k.a*p-k.b)*inv[pow[k.g][p]]);c.push(v);p=q;}return c;}
 function geometry(c){let nz=0,nzFit=0,rep=0,repFit=0;for(let i=0;i<c.length;i++){if(!c[i]){nz++;if(i<split)nzFit++;}if(i&&c[i]===c[i-1]){rep++;if(i<split)repFit++;}}return [nz,nzFit,rep,repFit];}
 const target=geometry(orig);
 function plant(start,g,iv){let plain=native.slice(start,start+716);if(!plain[0])throw Error("zero plant initial rune");let best=null;for(let a=1;a<Q;a++)for(let b=0;b<Q;b++){const key={g,a,b},c=encode(plain,key,iv),shape=geometry(c),error=shape.reduce((s,v,i)=>s+Math.abs(v-target[i]),0);if(!best||error<best.error)best={key,c,plain,shape,error,start};}return best;}
 // Kind A (0) last output consuming, kind B (1) held F after last nonzero consuming C,
 // kind D (2) held F after consuming C=0. State p+29*kind, p in 1..28.
 function prepare(c){const steps=[];let last=c[0];for(let i=1;i<c.length;i++){const previous=c[i-1],v=c[i];steps[i]={n:previous===0?3:1,delta:[mod(v-previous),mod(v-last),v],hold:[previous===0?2:1,1,2],zero:v===0};if(v)last=v;}return steps;}
 function fillTable(k,next){for(let d=0;d<Q;d++)for(let p=1;p<Q;p++)next[d*Q+p]=(k.a*p+k.b+pow[k.g][p]*d)%Q;}
 function scan(c,truth=null){
  const steps=prepare(c),next=new Uint8Array(Q*Q),dp=new Float64Array(S),work=new Float64Array(S);
  function execute(k,lo,hi,initial=null,trace=false){
   fillTable(k,next);let x=dp,y=work;x.fill(-Infinity);
   if(initial===null){for(let p=1;p<Q;p++)x[p]=log1[p];}else{x[initial]=0;}
   const parent=trace?new Int16Array((hi-lo)*S).fill(-1):null;
   for(let i=lo;i<hi;i++){const step=steps[i];y.fill(-Infinity);for(let type=0;type<step.n;type++){const base=type*Q,delta=step.delta[type]*Q,hold=step.hold[type]*Q;for(let p=1;p<Q;p++){const j=base+p,v=x[j];if(v===-Infinity)continue;const emit=type?0:p,q=next[delta+p],log=emit*Q;
     if(q){const score=v+log2[log+q];if(score>y[q]){y[q]=score;if(trace)parent[(i-lo)*S+q]=j;}}
     if(step.zero){const t=hold+p,score=v+log2[log];if(score>y[t]){y[t]=score;if(trace)parent[(i-lo)*S+t]=j;}}
   }}const temp=x;x=y;y=temp;}
   let total=-Infinity,terminal=-1;for(let j=1;j<S;j++)if(x[j]>total){total=x[j];terminal=j;}
   let plain=null,initialState=null;if(trace&&terminal>=0){let j=terminal;plain=[];for(let i=hi-1;i>=lo;i--){plain.push(j<Q?j:0);j=parent[(i-lo)*S+j];if(j<0)throw Error("trace");}initialState=j;plain.reverse();}
   return {total,terminal,plain,initialState};
  }
  let best=null,runner=-Infinity,truthScore=null,ties=0,feasible=0,tried=0;const start=Date.now();
  for(let g=2;g<Q;g++)for(let a=0;a<Q;a++)for(let b=0;b<Q;b++){const k={g,a,b},r=execute(k,1,split);tried++;if(r.total===-Infinity)continue;feasible++;if(truth&&g===truth.key.g&&a===truth.key.a&&b===truth.key.b)truthScore=r.total;if(!best||r.total>best.total+1e-9){runner=best?Math.max(runner,best.total):runner;best={...k,total:r.total};ties=1;}else if(Math.abs(r.total-best.total)<1e-9)ties++;else runner=Math.max(runner,r.total);}
  if(!best)throw Error("no feasible key");
  const fit=execute(best,1,split,null,true);const held=execute(best,split,c.length,fit.terminal,true);const plain=held.plain?[fit.initialState,...fit.plain,...held.plain]:[fit.initialState,...fit.plain];const back=encode(plain,best,c[0]);if(back.some((x,i)=>x!==c[i]))throw Error("replay");
  const render=p=>p.map(x=>corpus.translit[x]).join("");
  return {key:{g:best.g,a:best.a,b:best.b,p0:fit.initialState},fitScore:fit.total/split,heldScore:held.plain?held.total/(c.length-split):null,runnerScore:runner/split,truthScore:truthScore===null?null:truthScore/split,fitTerminal:fit.terminal,geometry:geometry(c),tried,feasible,ties,elapsedMs:Date.now()-start,accuracy:truth?{fit:plain.slice(0,split).filter((x,i)=>x===truth.plain[i]).length,held:plain.slice(split).filter((x,i)=>x===truth.plain[i+split]).length}:null,truth:truth?{key:truth.key,p0:truth.plain[0],start:truth.start,shapeError:truth.error}:null,head:render(plain.slice(0,120)),heldHead:render(plain.slice(split,split+120)),plain};
 }
 const results={schema:1,scope:"P_i=a Pprev+b+g^Pprev (C_i-Cprev) over GF29, both registers held for literal plaintext F (emits 0); consuming P nonzero; first C public nonzero IV and first P free nonzero. Exact fit DP and fixed-state held DP.",fit:split,held:orig.length-split,trainRunes:tr.length,target};
 if(mode==="all"||mode==="original")results.original=scan(orig);
 if(mode==="all"||mode==="control1"){const p=plant(400,2,13);results.control1=scan(p.c,p);}
 if(mode==="all"||mode==="control2"){const p=plant(1900,3,7);results.control2=scan(p.c,p);}
 return results;
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/derived/dukotah-r37-lp1-map-runes.json","resources/control/gibran_prophet_58585.txt"];
console.log(JSON.stringify(experiment(JSON.parse(read(paths[0])),JSON.parse(read(paths[1])).key,read(paths[2]),process.argv[2]||'all'),null,2));
