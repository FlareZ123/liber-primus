'use strict';
// Agent17 #2634: exact clause-fed lexical CSP with arbitrary first seed.
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus,transcript,ink,gold,raws){
 const assert=(v,m)=>{if(!v)throw Error(m)},mod=x=>(x%29+29)%29,idx=new Map(corpus.runes.map((r,i)=>[r,i]));
 const C=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),words=[];let w=[],start=0,pos=0;const periods=[];
 for(const ch of transcript.split("%").slice(0,55).join("%")){if(idx.has(ch)){if(!w.length)start=pos;w.push(idx.get(ch));pos++;}else{if(ch==="."&&periods.at(-1)!==pos)periods.push(pos);if(ch!=="%"&&ch!=="/"&&!/\s/u.test(ch)&&w.length){words.push({start,w});w=[];}}}if(w.length)words.push({start,w});
 assert(pos===12956&&periods.length===173&&words.length===2896&&words.flatMap(w=>w.w).every((x,i)=>x===C[i]),"canonical source");
 const native=gold.sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(r=>idx.get(r))),body:s.source_text.split("⁜")[1]?.split("⁘").slice(0,4).map(s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(r=>idx.get(r))))}));
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(raw,cal){const word=raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(let i=0;i<word.length;){if(cal&&word.startsWith("ING",i)){a.push(21);i+=3;continue;}if(cal&&word.startsWith("IO",i)){a.push(27);i+=2;continue;}const t=tokens.find(x=>word.startsWith(x.s,i));assert(t,"GP token");a.push(t.i);i+=t.s.length;}return a;}
 const base=new Map();function add(L,w){if(!L.has(w.length))L.set(w.length,new Map());L.get(w.length).set(w.join(","),w);}
 for(const raw of raws)for(const w of raw.match(/[A-Za-z]+/g)||[])for(const cal of [false,true])add(base,gp(w,cal));
 function lex(exclude){const L=new Map([...base].map(([n,m])=>[n,new Map(m)]));for(const s of native)if(s.name!==exclude)for(const w of s.words)add(L,w);return L;}
 function clause(start,end){const ws=words.filter(w=>w.start>=start&&w.start+w.w.length<=end);assert(ws.flatMap(w=>w.w).length===end-start,"intact groups");return {c:C.slice(start,end),lengths:ws.map(w=>w.w.length)};}
 let offset=0;const offsets=corpus.pages.map(p=>{const z=offset;offset+=p.indices.length;return z;});const pages=[0,3,8,15,23,27,33,40,54];
 const openings=pages.map(p=>{let n=0;for(const s of ink.pages.find(x=>x.page===p)?.red_spans||[])if(s.start===n)n+=s.length;const start=offsets[p]+n,stop=periods.filter(x=>x>start).slice(0,4),limit=offsets[pages[pages.indexOf(p)+1]]??12956;return {page:p,start,stops:stop.filter(x=>x<=limit),first:stop[0]-start};});
 const eligible=openings.filter(x=>x.stops.length>=2).sort((a,b)=>a.first-b.first),choice=eligible[0];assert(choice.page===40&&choice.start===9648&&choice.first===21&&choice.stops.join()==="9669,9715,9736,9805","frozen shortest source");
 const cuts=[choice.start,...choice.stops],original=cuts.slice(0,-1).map((s,i)=>clause(s,cuts[i+1]));
 function masks(c){const zero=c.map((x,i)=>x===0?i:-1).filter(x=>x>=0);assert(zero.length<=16,"visible F mask limit");return Array.from({length:2**zero.length},(_,m)=>{const hold=Array(c.length).fill(false);zero.forEach((i,k)=>hold[i]=Boolean(m&(1<<k)));let j=0;const active=hold.map(h=>h?-1:j++);return {hold,active,q:j};});}
 function varsFor(A,B,ma,mb,L,seedQ){
  const vars=[];let start=0;
  for(let side=0;side<2;side++){
   const S=side?B:A,m=side?mb:ma;start=0;
   for(let n=0;n<S.lengths.length;n++){
    const len=S.lengths[n],ids=[];for(let i=0;i<len;i++){const x=m.active[start+i];if(x<0)continue;ids.push(side?x%ma.q:x);if(!side&&seedQ)ids.push(ma.q+x%seedQ);}
    const slots=[...new Set(ids)].sort((a,b)=>a-b),dom=[];
    for(const P of L.get(len)?.values()||[]){
     const key=new Map();let ok=true;function put(k,v){if(key.has(k)&&key.get(k)!==v)ok=false;key.set(k,v);}
     for(let i=0;i<len&&ok;i++){const j=start+i,x=m.active[j],p=P[i];if((x<0)!==(p===0)){ok=false;break;}if(x<0)continue;if(side){const k=mod(S.c[j]-p);if(!k){ok=false;break;}put(x%ma.q,k);}else{put(x,p);if(seedQ)put(ma.q+x%seedQ,mod(S.c[j]-p));}}
     if(ok)dom.push({v:slots.map(k=>key.get(k)),P});
    }
    vars.push({label:`${side+1}:${n}`,slots,dom});start+=len;
   }
  }return vars;
 }
 function makeArcs(vars){const a=[];for(let i=0;i<vars.length;i++)for(let j=i+1;j<vars.length;j++){const common=vars[i].slots.filter(x=>vars[j].slots.includes(x));if(common.length)a.push({i,j,pi:common.map(x=>vars[i].slots.indexOf(x)),pj:common.map(x=>vars[j].slots.indexOf(x))});}return a;}
 function prop(dom,arcs,vars){let changes=true,passes=0;while(changes){passes++;changes=false;for(let i=0;i<dom.length;i++)if(!dom[i].length)return {ok:false,passes,empty:vars[i].label};for(const a of arcs){const {i,j,pi,pj}=a;const sig=(x,p)=>p.map(k=>String.fromCharCode(65+x.v[k])).join("");const si=new Set(dom[i].map(x=>sig(x,pi))),sj=new Set(dom[j].map(x=>sig(x,pj)));const ni=dom[i].filter(x=>sj.has(sig(x,pi))),nj=dom[j].filter(x=>si.has(sig(x,pj)));if(ni.length!==dom[i].length||nj.length!==dom[j].length)changes=true;dom[i]=ni;dom[j]=nj;if(!ni.length||!nj.length)return {ok:false,passes,empty:!ni.length?vars[i].label:vars[j].label,edge:[vars[i].label,vars[j].label],shared:pi.length};}}return {ok:true,passes};}
 function decode(c,K){const out=[],p=[];function go(i,j){if(i===c.length){out.push([...p]);return;}if(c[i]===0){p.push(0);go(i+1,j);p.pop();}const x=mod(c[i]-K[j%K.length]);if(x){p.push(x);go(i+1,j+1);p.pop();}}go(0,0);return out;}
 function enc(p,k){let j=0;return p.map(x=>x===0?0:mod(x+k[j++%k.length]));}
 function inLex(p,lens,L){let i=0;return lens.every(n=>{const w=p.slice(i,i+n);i+=n;return L.get(n)?.has(w.join(","));});}
 function solve(A,B,L,seedQ=0){
  const masksA=masks(A.c),masksB=masks(B.c),runs=[],solutions=[];let nodes=0,capped=false;
  for(const ma of masksA)for(const mb of masksB){
   if(!ma.q)continue;const vars=varsFor(A,B,ma,mb,L,seedQ),arcs=makeArcs(vars),dom=vars.map(x=>x.dom),before=dom.map(x=>x.length),g=prop(dom,arcs,vars);
   runs.push({q:ma.q,holdA:ma.hold.flatMap((h,i)=>h?[i]:[]),holdB:mb.hold.flatMap((h,i)=>h?[i]:[]),before,after:dom.map(x=>x.length),gate:g});
   if(!g.ok)continue;
   function dfs(d){if(++nodes>100000||solutions.length>=10000){capped=true;return;}let best=-1;for(let i=0;i<d.length;i++)if(d[i].length>1&&(best<0||d[i].length<d[best].length))best=i;if(best<0){const a=d.slice(0,A.lengths.length).flatMap(x=>x[0].P),b=d.slice(A.lengths.length).flatMap(x=>x[0].P),k=a.filter(Boolean);assert(enc(b,k).join()===B.c.join(),"replay");const seed=a.flatMap((p,i)=>p?[mod(A.c[i]-p)]:[]);if(seedQ)assert(enc(a,seed.slice(0,seedQ)).join()===A.c.join(),"seed replay");solutions.push({a,b,seed:seedQ?seed.slice(0,seedQ):seed});return;}for(const x of d[best]){const next=d.slice();next[best]=[x];if(prop(next,arcs,vars).ok)dfs(next);if(capped)return;}}
   dfs(dom);if(capped)break;
  }return {runs,solutions,nodes,capped};
 }
 const L=lex(null),g=solve(original[0],original[1],L);
 const controls=[];
 for(const [name,K] of [["0_warning",[2,7,9,4,11,24,8,1]],["0_koan_1",[4,21,6,2,13,7,19,8]]]){
   const s=native.find(x=>x.name===name),L=lex(name);assert(s.body.length===4&&s.body.every(w=>w.length),"four native clauses");
   const ps=s.body.map(ws=>ws.flat()),cs=ps.map((p,i)=>({c:enc(p,i?ps[i-1].filter(Boolean):K),lengths:s.body[i].map(w=>w.length)}));
   const oov=s.body.flat().filter(w=>!L.get(w.length)?.has(w.join(","))).map(w=>w.join(","));
   const sol=solve(cs[0],cs[1],L,8),matches=sol.solutions.filter(x=>x.a.join()===ps[0].join()&&x.b.join()===ps[1].join()&&x.seed.join()===K.join());
   const frozen=sol.solutions.length===1?sol.solutions[0]:null;let holdout=null;if(frozen){const a=decode(cs[2].c,frozen.b.filter(Boolean)).filter(p=>inLex(p,cs[2].lengths,L)),bs=a.flatMap(p=>decode(cs[3].c,p.filter(Boolean)).filter(q=>inLex(q,cs[3].lengths,L)).map(q=>[p,q]));holdout={paths:bs.length,exact:bs.filter(([p,q])=>p.join()===ps[2].join()&&q.join()===ps[3].join()).length,runes:ps[2].length+ps[3].length};}
   controls.push({name,seed:K,firstLengths:ps.map(p=>p.length),oov,solutions:sol.solutions.length,nodes:sol.nodes,capped:sol.capped,exactFit:matches.length,holdout,maskRuns:sol.runs.length});
 }
 return {openings,choice,cuts,groups:original.map(x=>x.lengths),lexWords:[...L.values()].reduce((a,m)=>a+m.size,0),original:{...g,solutions:g.solutions.slice(0,10)},controls};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/liber-primus/lp2-ink-annotations.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
const a=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(a[0]),a[1],JSON.parse(a[2]),JSON.parse(a[3]),a.slice(4)),null,2));
