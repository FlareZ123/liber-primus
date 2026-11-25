"use strict";
/** Director #2863: public delimiter-context conflict graph and compact-clock recovery. */
const fs=require("node:fs");
const path=require("node:path");
function experiment(read) {
  const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json")), raw=read("resources/liber-primus/lp2-transcription.txt").split("%"), known=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
  const idx=new Map(corpus.runes.map((x,i)=>[x,i])), latinIdx=new Map(corpus.translit.map((x,i)=>[x,i]));
  const assert=(x,m)=>{if(!x)throw Error(m)};
  const parse=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>Array.from(w,c=>idx.get(c)));
  const clean=s=>s.replace(/\/\r?\n/g,"").replace(/[\r\n%]/g,"");
  const words=parse(clean(raw.slice(0,55).join(""))), C=words.flat();
  assert(C.length===12956&&words.length===2896&&JSON.stringify(C)===JSON.stringify(corpus.pages.slice(0,56).flatMap(p=>p.indices)),"original tape");
  const split=corpus.pages.slice(0,40).reduce((n,p)=>n+p.indices.length,0);
  const context=ws=>{let prev=0,labels=[];for(const w of ws){for(let j=0;j<w.length;j++)labels.push(`${prev},${w.length},${j}`);prev=w.length;}return labels};
  const labels=context(words);
  const choose=n=>n*(n-1)/2;
  /** Construct exact incompatible observation-pair counts within each public context. */
  function conflict(C,P,L,lo=0,hi=C.length) {
    const groups=new Map();
    for(let i=lo;i<hi;i++){if(P[i]<0)continue;const key=L[i];if(!groups.has(key))groups.set(key,{p:new Uint16Array(29),c:new Uint16Array(29),pc:new Map(),f:Array(29).fill(-1),inv:Array(29).fill(-1),first:new Map()});
      const g=groups.get(key),p=P[i],c=C[i];g.p[p]++;g.c[c]++;const pc=p*29+c;g.pc.set(pc,(g.pc.get(pc)||0)+1);if(!g.first.has(pc))g.first.set(pc,i);g.f[p]=c;g.inv[c]=p;}
    let pairs=0,bad=0,example=null,seen=0;
    for(const [key,g] of groups){const n=Array.from(g.p).reduce((a,b)=>a+b,0);seen+=n;const q=Array.from(g.p).reduce((a,b)=>a+choose(b),0)+Array.from(g.c).reduce((a,b)=>a+choose(b),0)-2*Array.from(g.pc.values()).reduce((a,b)=>a+choose(b),0);pairs+=q;if(q){bad++;if(!example){const entries=[...g.pc.keys()];for(let a=0;a<entries.length&&!example;a++)for(let b=a+1;b<entries.length;b++){let x=entries[a],y=entries[b];if(Math.floor(x/29)===Math.floor(y/29)||x%29===y%29){example={context:key,i:g.first.get(x),j:g.first.get(y),pairs:[[Math.floor(x/29),x%29],[Math.floor(y/29),y%29]]};break;}}}}}
    return {pairs,bad,seen,groups,example};
  }
  /** Construct conflict edges, clique lower bound and DSATUR constructive upper bound. */
  function color(G) {
    assert(G.bad===0,"cannot color a looped context graph");const entries=[...G.groups],n=entries.length,adj=Array.from({length:n},()=>[]);
    for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const a=entries[i][1],b=entries[j][1];let bad=false;for(let k=0;k<29;k++)if((a.f[k]>=0&&b.f[k]>=0&&a.f[k]!==b.f[k])||(a.inv[k]>=0&&b.inv[k]>=0&&a.inv[k]!==b.inv[k])){bad=true;break;}if(bad){adj[i].push(j);adj[j].push(i);}}
    let lower=0;
    for(let k=0;k<29;k++){const a=new Set(),b=new Set();for(const [,g] of entries){if(g.f[k]>=0)a.add(g.f[k]);if(g.inv[k]>=0)b.add(g.inv[k]);}lower=Math.max(lower,a.size,b.size);}
    const cs=Array(n).fill(-1),sat=Array.from({length:n},()=>new Set());let upper=0;
    for(let t=0;t<n;t++){let v=-1;for(let i=0;i<n;i++)if(cs[i]<0&&(v<0||sat[i].size>sat[v].size||(sat[i].size===sat[v].size&&adj[i].length>adj[v].length)))v=i;let k=0;while(sat[v].has(k))k++;cs[v]=k;upper=Math.max(upper,k+1);for(const u of adj[v])sat[u].add(k);}
    const merged=Array.from({length:upper},()=>Array(29).fill(-1)), inv=Array.from({length:upper},()=>Array(29).fill(-1));
    entries.forEach(([key,g],i)=>{let k=cs[i];for(let p=0;p<29;p++){const c=g.f[p];if(c>=0){assert(merged[k][p]===-1||merged[k][p]===c,"color map conflict");assert(inv[k][c]===-1||inv[k][c]===p,"color inverse conflict");merged[k][p]=c;inv[k][c]=p;}}});
    return {lower,upper,exact:lower===upper,edges:adj.reduce((a,b)=>a+b.length,0)/2,contexts:n,assign:new Map(entries.map(([key],i)=>[key,cs[i]])),inv,merged};
  }
  const brief=g=>({lower:g.lower,upper:g.upper,exact:g.exact,edges:g.edges,contexts:g.contexts});
  const latin=s=>(s.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{const out=[];for(let i=0;i<w.length;){let t=["ING","TH","NG","EO","OE","AE","IA","IO","EA"].find(x=>w.startsWith(x,i))||w[i];i+=t.length;t=({ING:"NG",IO:"IA",K:"C",Q:"C",V:"U",Z:"S"})[t]||t;assert(latinIdx.has(t),"Latin token");out.push(latinIdx.get(t));}return out;});
  const sources=[["solved-Cicada",known.sections.flatMap(s=>parse(s.source_text))],["Gibran",latin(read("resources/control/gibran_prophet_58585.txt"))],["Emerson",latin(read("resources/control/emerson_essays_2944.txt"))],["Shakespeare",latin(read("resources/control/shakespeare_first300k.txt"))]];
  const rng=seed=>()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
  function pool(ws){const a=new Map();for(const w of ws){if(!a.has(w.length))a.set(w.length,[]);a.get(w.length).push(w);}return a;}
  const sample=(p,r)=>words.flatMap(w=>p.has(w.length)?p.get(w.length)[r()%p.get(w.length).length]:Array(w.length).fill(-1));
  const results=[];let plantP=null;
  for(let d=0;d<sources.length;d++){const [name,ws]=sources[d],p=pool(ws),r=rng(0x28633301+d),trials=64;let min=Infinity,max=0,leastBad=Infinity,compatible=0,matched=0,witness=null;for(let t=0;t<trials;t++){const P=sample(p,r);if(name==="Shakespeare"&&t===0)plantP=P;const x=conflict(C,P,labels,0,split);if(x.pairs<min){min=x.pairs;witness=x.example;}max=Math.max(max,x.pairs);leastBad=Math.min(leastBad,x.bad);matched=x.seen;compatible+=Number(x.pairs===0);}results.push({name,trials,matched,missing:[...new Set(words.map(w=>w.length))].filter(n=>!p.has(n)),minConflictPairs:min,maxConflictPairs:max,minBadContexts:leastBad,compatible,witness});}
  const p56w=parse(clean(raw[55])), p57w=parse(clean(raw[56])), C56=p56w.flat(),C57=p57w.flat(),P56=parse(known.sections.find(s=>s.name==="p56_an_end").source_text).flat(),P57=parse(known.sections.find(s=>s.name==="p57_parable").source_text).flat();
  assert(P56.length===85&&P57.length===95&&JSON.stringify(C57)===JSON.stringify(P57),"native source lengths");
  let primes=[];for(let n=2;primes.length<85;n++)if(primes.every(p=>p*p>n||n%p!==0))primes.push(n);
  let k=0;const s56=P56.map((p,i)=>i===56?0:(primes[k++]-1)%29);
  assert(P56.every((p,i)=>(p+s56[i])%29===C56[i]),"authentic p56 replay");
  const p56Native=brief(color(conflict(C56,P56,s56.map(String)))), p57Native=brief(color(conflict(C57,P57,context(p57w))));
  const p56Public=conflict(C56,P56,context(p56w));
  assert(plantP.every(p=>p>=0),"plant has all source lengths");
  const trueState=label=>label.split(",").map(Number).reduce((a,b)=>a+b,0)%4;
  const r=rng(0x2863c0de),key=Array.from({length:4},()=>{const a=Array.from({length:29},(_,i)=>i);for(let j=28;j>0;j--){let k=r()%(j+1);[a[j],a[k]]=[a[k],a[j]];}return a;});
  const plantC=plantP.map((p,i)=>key[trueState(labels[i])][p]);
  const paired=conflict(plantC,plantP,labels,0,split);
  const trained=color(paired);
  let unknownContext=0,unknownSymbol=0,correct=0,wrong=0;
  for(let i=split;i<C.length;i++){const s=trained.assign.get(labels[i]);if(s===undefined){unknownContext++;continue;}const p=trained.inv[s][plantC[i]];if(p===-1){unknownSymbol++;continue;}if(p===plantP[i])correct++;else wrong++;}
  // Infer a compact four-state public clock from the learned partial maps, not from heldout data.
  // Constant term is redundant with the 4! state-label permutations.
  const perms=a=>a.length===0?[[]]:a.flatMap((v,i)=>perms(a.filter((_,j)=>i!==j)).map(p=>[v,...p]));
  const clock=(label,coef,perm)=>perm[label.split(",").map(Number).reduce((n,v,i)=>n+v*coef[i],0)%4];
  const compat=[...paired.groups].map(([label,g])=>({label,allowed:trained.merged.map(m=>g.f.every((c,p)=>c<0||m[p]===c))}));
  const rules=[];
  if(trained.upper===4)for(let a=0;a<4;a++)for(let b=0;b<4;b++)for(let c=0;c<4;c++)for(const perm of perms([0,1,2,3])){let coef=[a,b,c];if(compat.every(x=>x.allowed[clock(x.label,coef,perm)]))rules.push({coef,perm});}
  const frozen=rules.map(rule=>{let n=0,unknown=0;for(let i=split;i<C.length;i++){const p=trained.inv[clock(labels[i],rule.coef,rule.perm)][plantC[i]];if(p===plantP[i])n++;if(p<0)unknown++;}return {...rule,correct:n,unknown};});
  assert(rules.length>0,"compact plant clock recovery");
  return {split,holdout:C.length-split,contextCount:new Set(labels).size,trainingContexts:new Set(labels.slice(0,split)).size,results,p56Native,p57Native,p56Public:{conflictPairs:p56Public.pairs,badContexts:p56Public.bad,example:p56Public.example},plant:{...brief(trained),correct,wrong,unknownContext,unknownSymbol,knownMapEntries:trained.merged.map(m=>m.filter(c=>c>=0).length),compactRules:frozen}};
}
console.log(JSON.stringify(experiment(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),null,2));
