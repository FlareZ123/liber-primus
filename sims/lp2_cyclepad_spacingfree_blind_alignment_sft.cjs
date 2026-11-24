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
 function search(C,L,truth,phaseTrue){const g=graph(C,L),actual=truth?.map((v,i)=>v===0?i:-1).filter(i=>i>=0),runs=[];let oracle=null;
 if(truth){const mm=matrix(hist(C.filter((_,i)=>truth[i]!==0),L,phaseTrue));const guesses=Array.from({length:64},()=>opt(mm,[0,...Array.from({length:L-1},()=>rand(29))]));guesses.sort((a,b)=>b.score-a.score);oracle={best:guesses[0],trueK:null};}
 for(let z=0;z<config.starts;z++){let K=[0,...Array.from({length:L-1},()=>rand(29))];if(z%2===0){const a=C.filter(v=>v!==0||rand(100)<60);K=opt(matrix(hist(a,L,rand(L))),K).K;}let prev="";let a;for(let i=0;i<config.iterations;i++){a=align(C,L,g,K);const k=opt(matrix(hist(a.active,L,a.phase)),K).K;const s=k.join();if(s===K.join()||s===prev)break;prev=K.join();K=k;}a=align(C,L,g,K);runs.push({K,score:a.score,phase:a.phase,holds:a.holds});}
 runs.sort((a,b)=>b.score-a.score);return {peak:g.peak,oracle,runs:runs.slice(0,5),allScores:runs.map(a=>a.score),actual};
 }
 const results=[];for(const [source,L] of config.cases){const plain=native(raw[source]).slice(1000,1000+config.n),p=plant(plain,L),s=search(p.C,L,plain,p.phase),g=graph(p.C,L),a=align(p.C,L,g,p.K);const set=new Set(s.actual);const summarize=x=>({K:x.K,score:x.score,phase:x.phase,holds:x.holds.length,holdMatches:x.holds.filter(i=>set.has(i)).length,keyMatches:x.K?.filter((v,i)=>v===p.K[i]).length??null});results.push({source,L,K:p.K,phase:p.phase,actualHolds:s.actual.length,peak:s.peak,oracleKey:s.oracle.best.K,knownKeyAlignment:summarize({...a,K:p.K}),runs:s.runs.map(summarize),allScores:s.allScores});}
 return {holdPenalty,results}
}
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const d=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(run(JSON.parse(d[0]),d.slice(1),{"starts":16,"iterations":8,"n":3008,"cases":[[1,8],[2,13]]}),null,2));
