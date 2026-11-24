"use strict";
function run(gp,raw,config){
 const mod=x=>(x%29+29)%29;const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error(w);out.push(t.i);w=w.slice(t.s.length)}}return out}
 let state=123456789;const rand=n=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)%n};
 const train=native(raw[0]),A=train.filter(x=>x!==0),P=Array.from({length:13},()=>Array(29).fill(1));for(let lag=1;lag<13;lag++){for(let i=lag;i<A.length;i++)P[lag][mod(A[i]-A[i-lag])]++;const sum=P[lag].reduce((a,b)=>a+b,0);P[lag]=P[lag].map(x=>Math.log(29*x/sum));}
 const holdPenalty=Math.log(29*(train.length-A.length)/A.length);
 function hist(C,L,phase){const H=Array.from({length:L},(_,s)=>Array.from({length:s},()=>new Int32Array(29)));let h=Array(phase).fill(-1);for(const c of C){const s=h.length;for(let t=0;t<s;t++)if(h[t]>=0)H[s][t][mod(c-h[t])]++;h.push(c);if(h.length===L)h=[];}return H;}
 function matrix(H){return H.map((row,s)=>row.map((counts,t)=>Array.from({length:29},(_,k)=>counts.reduce((a,n,d)=>a+n*P[s-t][mod(d-k)],0))));}
 function score(M,K){let a=0;for(let s=1;s<K.length;s++)for(let t=0;t<s;t++)a+=M[s][t][mod(K[s]-K[t])];return a;}
 function opt(M,K,sweeps=20){K=K.slice();for(let n=0;n<sweeps;n++){let changes=0;for(let s=1;s<K.length;s++){let best=K[s],bs=-Infinity;for(let k=0;k<29;k++){let a=0;for(let t=0;t<K.length;t++)if(t<s)a+=M[s][t][mod(k-K[t])];else if(t>s)a+=M[t][s][mod(K[t]-k)];if(a>bs){bs=a;best=k}}if(best!==K[s])changes++;K[s]=best;}if(!changes)break;}return {K,score:score(M,K)}}
 function plant(plain,L){const K=[0,...Array.from({length:L-1},()=>rand(29))],phase=rand(L);let s=phase,G=rand(29);const C=[];for(const p of plain){if(!p){C.push(0);continue}C.push(mod(p+K[s]+G));s++;if(s===L){s=0;G=rand(29)}}return {C,K,phase}}
 function graph(C,L){const n=C.length;
  function edges(i,phase){const list=[],a=[],skip=[];function rec(j){if(a.length===L-phase||j===n){const feat=[];for(let s=0;s<a.length;s++)for(let t=0;t<s;t++)feat.push(((s+phase)*L+(t+phase))*29+mod(a[s]-a[t]));list.push({end:j,phase,feat:Int32Array.from(feat),skip:skip.slice()});return;}if(C[j]===0){skip.push(j);rec(j+1);skip.pop();}a.push(C[j]);rec(j+1);a.pop();}rec(i);return list;}
  const E=Array.from({length:n},(_,i)=>edges(i,0)),first=Array.from({length:L},(_,s)=>edges(0,s));return {E,first,peak:Math.max(...E.map(x=>x.length)),n};
 }
 function align(C,L,g,K){const {E,first,n}=g,tab=new Float64Array(L*L*29),scale=2/(L-1);for(let s=1;s<L;s++)for(let t=0;t<s;t++)for(let d=0;d<29;d++)tab[(s*L+t)*29+d]=P[s-t][mod(d-K[s]+K[t])]*scale;
  const dp=new Float64Array(n+1);dp.fill(-Infinity);const back=Array(n+1);function step(i,e){let v=(i===0?0:dp[i])+holdPenalty*e.skip.length;for(const j of e.feat)v+=tab[j];if(v>dp[e.end]){dp[e.end]=v;back[e.end]=[i,e]}}
  for(const es of first)for(const e of es)step(0,e);for(let i=1;i<n;i++)if(Number.isFinite(dp[i]))for(const e of E[i])step(i,e);
  const holds=[];let i=n,phase=0;while(i){const [j,e]=back[i];holds.push(...e.skip);phase=e.phase;i=j;}holds.sort((a,b)=>a-b);const mask=new Set(holds);return {score:dp[n],phase,holds,active:C.filter((_,i)=>!mask.has(i))};
 }

 function profileCoordinate(C,L,g,K,q){
  const {E,first,n}=g,scale=2/(L-1),tab=new Float64Array(L*L*29),vary=Array.from({length:L*L*29},()=>null);
  for(let s=1;s<L;s++)for(let t=0;t<s;t++)for(let d=0;d<29;d++){const f=(s*L+t)*29+d;tab[f]=P[s-t][mod(d-K[s]+K[t])]*scale;if(s===q||t===q){const a=new Float64Array(29);for(let k=0;k<29;k++)a[k]=P[s-t][mod(d-(s===q?k:K[s])+(t===q?k:K[t]))]*scale;vary[f]=a;}}
  const dp=new Float64Array((n+1)*29);dp.fill(-Infinity);const v=new Float64Array(29);
  function step(i,e){let base=holdPenalty*e.skip.length;v.fill(0);for(const f of e.feat){const a=vary[f];if(!a)base+=tab[f];else for(let k=0;k<29;k++)v[k]+=a[k];}const end=e.end*29,start=i*29;for(let k=0;k<29;k++){const val=(i===0?0:dp[start+k])+base+v[k];if(val>dp[end+k])dp[end+k]=val;}}
  for(const es of first)for(const e of es)step(0,e);for(let i=1;i<n;i++)if(Number.isFinite(dp[i*29]))for(const e of E[i])step(i,e);
  let best=K[q],bs=dp[n*29+best];for(let k=0;k<29;k++)if(dp[n*29+k]>bs+1e-10){bs=dp[n*29+k];best=k;}return {best,score:bs};
 }
 function refine(C,L,g,K){K=K.slice();let moves=0,history=[];for(let i=0;i<config.profileSweeps;i++){let changed=0;for(let j=0;j<L;j++){const q=(j+i)%L,b=profileCoordinate(C,L,g,K,q);if(b.best!==K[q]){K[q]=b.best;const gauge=K[0];K=K.map(x=>mod(x-gauge));changed++;moves++;}}history.push(align(C,L,g,K).score);if(!changed)break;}const a=align(C,L,g,K);return {K,score:a.score,phase:a.phase,holds:a.holds,moves,history};}

 function language(train){const uni=new Float64Array(29).fill(.5),bi=new Float64Array(30*29),tri=new Float64Array(30*30*29),btotal=new Float64Array(30),ttotal=new Float64Array(30*30);
  let a=29,b=29;for(const p of train){uni[p]++;bi[b*29+p]++;btotal[b]++;tri[(a*30+b)*29+p]++;ttotal[a*30+b]++;a=b;b=p;}const sum=uni.reduce((x,y)=>x+y,0),logp=new Float64Array(30*30*29);
  for(let a=0;a<30;a++)for(let b=0;b<30;b++)for(let p=0;p<29;p++){const u=uni[p]/sum,v=(bi[b*29+p]+8*u)/(btotal[b]+8);logp[(a*30+b)*29+p]=Math.log((tri[(a*30+b)*29+p]+12*v)/(ttotal[a*30+b]+12));}return logp;
 }
 const LM=language(train);
 function decode(C,L,K){const g=graph(C,L),n=C.length,dp=Array.from({length:n+1},()=>new Map());dp[0].set(899,{score:0,back:null});let candidates=0,peak=1;
  function step(i,e){if(!dp[i].size)return;const held=new Set(e.skip),len=e.end-i;for(let G=0;G<29;G++){let s=e.phase,a=[],legal=true,consumed=0;for(let j=i;j<e.end;j++){if(held.has(j)){a.push(0);continue;}const p=mod(C[j]-K[s]-G);if(p===0){legal=false;break;}a.push(p);s++;consumed++;}if(!legal)continue;if(!consumed&&G!==0)continue;candidates++;
   let base=-(consumed?Math.log(29):0)-(i===0?Math.log(L):0);for(let j=2;j<a.length;j++)base+=LM[(a[j-2]*30+a[j-1])*29+a[j]];
   for(const [context,prev] of dp[i]){let v=prev.score+base,x=Math.floor(context/30),y=context%30;if(a.length){v+=LM[(x*30+y)*29+a[0]];x=y;y=a[0];}if(a.length>=2){v+=LM[(x*30+y)*29+a[1]];x=a[a.length-2];y=a[a.length-1];}
    const end=x*30+y,old=dp[e.end].get(end);if(!old||v>old.score)dp[e.end].set(end,{score:v,back:prev,a,phase:e.phase,G,skip:e.skip,from:i,end:e.end});}
  }}
  for(const es of g.first)for(const e of es)step(0,e);for(let i=1;i<n;i++){peak=Math.max(peak,dp[i].size);for(const e of g.E[i])step(i,e);}
  const best=[...dp[n].values()].sort((a,b)=>b.score-a.score)[0];if(!best)return null;const edges=[];let x=best;while(x.back){edges.push(x);x=x.back;}edges.reverse();const plain=edges.flatMap(e=>e.a),holds=edges.flatMap(e=>e.skip);let replay=true;for(const e of edges){let s=e.phase;for(let j=0;j<e.a.length;j++){const p=e.a[j],c=p===0?0:mod(p+K[s++]+e.G);if(c!==C[e.from+j])replay=false;}}return {score:best.score,plain,holds,phase:edges[0].phase,candidates,peak,replay};
 }
 function search(C,L,truth,phaseTrue){const g=graph(C,L),actual=truth?.map((v,i)=>v===0?i:-1).filter(i=>i>=0),runs=[];let oracle=null;
 if(truth){const mm=matrix(hist(C.filter((_,i)=>truth[i]!==0),L,phaseTrue));const guesses=Array.from({length:64},()=>opt(mm,[0,...Array.from({length:L-1},()=>rand(29))]));guesses.sort((a,b)=>b.score-a.score);oracle={best:guesses[0],trueK:null};}
 for(let z=0;z<config.starts;z++){let K=[0,...Array.from({length:L-1},()=>rand(29))];if(z%2===0){const a=C.filter(v=>v!==0||rand(100)<60);K=opt(matrix(hist(a,L,rand(L))),K).K;}let prev="";let a;for(let i=0;i<config.iterations;i++){a=align(C,L,g,K);const k=opt(matrix(hist(a.active,L,a.phase)),K).K;const s=k.join();if(s===K.join()||s===prev)break;prev=K.join();K=k;}a=align(C,L,g,K);runs.push({K,score:a.score,phase:a.phase,holds:a.holds});}
 runs.sort((a,b)=>b.score-a.score);const prof=runs.slice(0,config.profileStarts).map(x=>refine(C,L,g,x.K));prof.sort((a,b)=>b.score-a.score);for(let pass=0;pass<config.rotationPasses;pass++){const base=prof[0].K;const rotate=[];for(let i=1;i<L;i++){const k=base.slice(i).concat(base.slice(0,i));const off=k[0];const K=k.map(x=>mod(x-off));rotate.push({K,score:align(C,L,g,K).score});}rotate.sort((a,b)=>b.score-a.score);for(const x of rotate.slice(0,3))prof.push(refine(C,L,g,x.K));prof.sort((a,b)=>b.score-a.score);}return {peak:g.peak,oracle,runs:runs.slice(0,5),profile:prof,allScores:runs.map(a=>a.score),actual};
 }
 const results=[];for(const [source,L] of config.cases){const plain=native(raw[source]).slice(1000,1000+config.n),p=plant(plain,L),s=search(p.C.slice(0,config.fit),L,plain.slice(0,config.fit),p.phase),g=graph(p.C,L),a=align(p.C,L,g,p.K);const set=new Set(s.actual);const summarize=x=>({K:x.K,score:x.score,phase:x.phase,holds:x.holds.length,holdMatches:x.holds.filter(i=>set.has(i)).length,keyMatches:x.K?.filter((v,i)=>v===p.K[i]).length??null,bestRotGauge:x.K?Math.max(...Array.from({length:L},(_,s)=>Math.max(...Array.from({length:29},(_,g)=>x.K.filter((v,i)=>v===mod(p.K[(i+s)%L]+g)).length)))):null});const best=s.profile[0];const dec=decode(p.C,L,best.K),oracleDec=decode(p.C,L,p.K);const cmp=x=>({score:x.score,phase:x.phase,exact:x.plain.filter((v,i)=>v===plain[i]).length,fitExact:x.plain.slice(0,config.fit).filter((v,i)=>v===plain[i]).length,withheldExact:x.plain.slice(config.fit).filter((v,i)=>v===plain[config.fit+i]).length,holds:x.holds.length,candidates:x.candidates,peak:x.peak,replay:x.replay,preview:x.plain.slice(config.fit,config.fit+120).map(v=>gp.translit[v]).join('')});results.push({source,L,K:p.K,phase:p.phase,actualHolds:plain.filter(x=>!x).length,peak:s.peak,oracleKey:s.oracle.best.K,knownKeyAlignment:summarize({...a,K:p.K}),runs:s.runs.map(summarize),profile:s.profile.slice(0,3).map(x=>({...summarize(x),moves:x.moves,history:x.history})),allScores:s.allScores,decoded:cmp(dec),oracleDecoded:cmp(oracleDec)});}
 return {holdPenalty,results}
}
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const d=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(run(JSON.parse(d[0]),d.slice(1),{"starts":16,"iterations":8,"n":3008,"fit":2400,"cases":[[1,8],[2,13]],"profileStarts":3,"profileSweeps":8,"rotationPasses":2}),null,2));
