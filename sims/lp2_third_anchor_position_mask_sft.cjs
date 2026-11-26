"use strict";
const fs=require("node:fs");
const path=require("node:path");
function experiment(corpus, transcription, lexText, donorText) {
  const mod=n=>(n%29+29)%29;
  const R=corpus.runes, T=corpus.translit;
  const idx=new Map(R.map((s,i)=>[s,i]));
  const words=transcription.split("%").slice(0,55).join("").replace(/[\/\s]/g,"").split(new RegExp(`[^${R.join("")}]+`,"u")).filter(Boolean).map(w=>[...w].map(c=>idx.get(c)));
  const canonical=corpus.pages.slice(0,56).flatMap(p=>p.indices);
  if(words.length!==2896||words.flat().length!==12956||words.flat().some((v,i)=>v!==canonical[i]))throw Error("source mismatch");
  const offsets=[];let off=0;for(const w of words){offsets.push(off);off+=w.length}
  const endPage=p=>corpus.pages.slice(0,p+1).reduce((s,x)=>s+x.indices.length,0);
  const wordSet=(lo,hi)=>words.filter((w,i)=>offsets[i]>=lo&&offsets[i]+w.length<=hi&&w.length>=3);
  const map=new Map(T.map((s,i)=>[s,i]));map.set("K",map.get("C"));map.set("Q",map.get("C"));map.set("V",map.get("U"));map.set("Z",map.get("S"));map.set("ING",map.get("NG"));
  function gp(word){const out=[];const s=word.toUpperCase();for(let i=0;i<s.length;){let found=false;for(const n of [3,2,1]){const k=s.slice(i,i+n);if(k.length===n&&map.has(k)){out.push(map.get(k));i+=n;found=true;break}}if(!found)return null}return out}
  const encode=w=>String.fromCharCode(...w.map(x=>65+x));
  const show=w=>w.map(x=>T[x]).join("");
  const fromString=s=>[...s].map(c=>c.charCodeAt(0)-65);
  const lex=new Map();
  for(const line of lexText.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/i.exec(line);if(!m)continue;const w=gp(m[1]);if(!w||w.length<3)continue;const k=encode(w);if(!lex.has(w.length))lex.set(w.length,new Map());const m2=lex.get(w.length);m2.set(k,(m2.get(k)||0)+Number(m[2]))}
  const dict=new Map([...lex].map(([n,m])=>[n,[...m.keys()]]));
  const has=w=>lex.get(w.length)?.has(encode(w))??false;
  const diff=(c,p)=>{let s="";for(let i=0;i<c.length;i++)s+=String.fromCharCode(65+mod(p.charCodeAt(i)-65-c[i]));return s};
  function assign(scores){
    const n=29,u=Array(n+1).fill(0),v=Array(n+1).fill(0),p=Array(n+1).fill(0),way=Array(n+1).fill(0);
    for(let i=1;i<=n;i++){p[0]=i;let j0=0;const minv=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);do{used[j0]=true;let i0=p[j0],delta=Infinity,j1=0;for(let j=1;j<=n;j++)if(!used[j]){const cur=-scores[i0-1][j-1]-u[i0]-v[j];if(cur<minv[j]){minv[j]=cur;way[j]=j0}if(minv[j]<delta){delta=minv[j];j1=j}}for(let j=0;j<=n;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta}else minv[j]-=delta;j0=j1}while(p[j0]!==0);do{const j1=way[j0];p[j0]=p[j1];j0=j1}while(j0)}
    const out=Array(n);for(let j=1;j<=n;j++)out[p[j]-1]=j-1;return out
  }
  function fit(ws){const chosen=[],counts=[],opts=[];for(let x=0;x<29;x++){const own=ws.filter(w=>w[2]===x);const buckets=new Map();
    for(const c of own){const n=c.length;let b=buckets.get(n);if(!b){b=new Map();buckets.set(n,b)}for(const p of dict.get(n)||[]){const k=diff(c,p);b.set(k,(b.get(k)||0)+1)}}
    const lens=[...buckets.keys()].sort((a,b)=>a-b);
    const best=Array.from({length:29},()=>({count:0,key:""}));
    for(const n of lens){for(const [key,cnt] of buckets.get(n)){let support=cnt;for(const shorter of lens){if(shorter>=n)break;support+=buckets.get(shorter).get(key.slice(0,shorter))||0}const y=mod(x+key.charCodeAt(2)-65);const z=best[y];if(support>z.count||(support===z.count&&(key.length>z.key.length||(key.length===z.key.length&&key<z.key))))best[y]={count:support,key}}}
    opts.push(best);counts.push(own.length)
  }
  const scores=opts.map(row=>row.map(z=>z.count));const permutation=assign(scores);for(let x=0;x<29;x++)chosen.push(opts[x][permutation[x]].key);
  const total=permutation.reduce((s,y,x)=>s+scores[x][y],0);
  return {chosen,permutation,total,independentUpper:scores.reduce((s,row)=>s+Math.max(...row),0),counts,depths:chosen.map(k=>k.length)}
  }
  function decode(c,f){const k=f.chosen[c[2]];if(k.length<c.length)return null;return c.map((v,j)=>mod(v+k.charCodeAt(j)-65))}
  function metrics(ws,f,truth){let covered=0,hit=0,exact=0,runes=0,correct=0;const examples=[];const inv=Array(29);for(let x=0;x<29;x++)inv[f.permutation[x]]=x;for(let i=0;i<ws.length;i++){const c=ws[i],p=decode(c,f);if(!p)continue;covered++;if(has(p))hit++;if(truth){if(encode(p)===encode(truth[i]))exact++;for(let j=0;j<p.length;j++){runes++;if(p[j]===truth[i][j])correct++}}
    const x=inv[p[2]],k=f.chosen[x];if(x!==c[2]||encode(p.map((v,j)=>mod(v-k.charCodeAt(j)+65)))!==encode(c))throw Error("original replay failure");
    if(examples.length<16)examples.push({c:show(c),p:show(p),lexical:has(p)})}
    return {n:ws.length,covered,hit,exact:truth?exact:null,runes:truth?runes:null,correct:truth?correct:null,examples}
  }
  let seed=0x6a09e667;function rand(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n}
  const donorWords=Array.from(donorText.matchAll(/[A-Za-z]+/g),m=>gp(m[0])).filter(w=>w&&w.length>=3);
  const donors=new Map();for(const w of donorWords){if(!donors.has(w.length))donors.set(w.length,[]);donors.get(w.length).push(w)}
  function plant(train,hold){const perm=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const j=rand(i+1);[perm[i],perm[j]]=[perm[j],perm[i]]}const inverse=Array(29);for(let x=0;x<29;x++)inverse[perm[x]]=x;
    const max=Math.max(...[...train,...hold].map(w=>w.length));const K=Array.from({length:29},(_,x)=>Array.from({length:max},(_,j)=>j===2?mod(perm[x]-x):rand(29)));
    let fallback=0,randomFallback=0;
    const choose=ws=>ws.map(w=>{const list=donors.get(w.length);if(list?.length)return list[rand(list.length)];fallback++;const d=dict.get(w.length);if(!d?.length){randomFallback++;return Array.from({length:w.length},()=>rand(29))}return fromString(d[rand(d.length)])});
    const tr=choose(train),te=choose(hold);const encrypt=p=>{const x=inverse[p[2]];return p.map((v,j)=>mod(v-K[x][j]))};
    const Ctr=tr.map(encrypt),Cte=te.map(encrypt);for(let i=0;i<Ctr.length;i++){const c=Ctr[i];if(encode(c.map((v,j)=>mod(v+K[c[2]][j])))!==encode(tr[i]))throw Error("plant inverse failure")}
    const f=fit(Ctr);const recovered=f.permutation.filter((v,x)=>v===perm[x]).length;
    return {trainDictionary:tr.filter(has).length,holdDictionary:te.filter(has).length,training:metrics(Ctr,f,tr),heldout:metrics(Cte,f,te),assignmentSupport:f.total,exactAnchorMappings:recovered,depths:f.depths,fallback,randomFallback}
  }
  const split1=[wordSet(13,endPage(1)),wordSet(endPage(1),endPage(2))];
  const split2=[wordSet(endPage(2),endPage(39)),wordSet(endPage(39),endPage(55))];
  const output={lexiconSize:[...lex.values()].reduce((s,m)=>s+m.size,0),wholeBookWords:words.length,wholeBookRunes:off,anchorPosition:3,results:[]};
  // Title pair independently fixes the entire first five mask entries.
  const [a,b]=words; if(a.length!==8||b.length!==5||a[2]!==18||b[2]!==18)throw Error("unexpected title");
  const bMap=new Map((dict.get(5)||[]).map(p=>[diff(b,p),p]));
  const candidates=[];const eBody=wordSet(13,endPage(2)).filter(w=>w[2]===18&&w.length<=8);
  for(const p of dict.get(8)||[]){const k=diff(a,p);const q=bMap.get(k.slice(0,5));if(!q)continue;const decoded=eBody.map(c=>c.map((v,j)=>mod(v+k.charCodeAt(j)-65)));candidates.push({title:[show(fromString(p)),show(fromString(q))],mask:fromString(k),bodyHits:decoded.filter(has).length,body:decoded.map(show)})}
  output.title={cipher:[show(a),show(b)],eligibleBody:eBody.map(show),nCandidates:candidates.length,candidates,lexiconLengths:[dict.get(8).length,dict.get(5).length]};
  for(const [label,[tr,te]] of [["opening_black_p0_p1_to_p2",split1],["p3_39_to_p40_55",split2]]){
    const control=plant(tr,te);
    const f=fit(tr);
    const fitMetrics=metrics(tr,f),heldout=metrics(te,f);
    if(fitMetrics.hit!==f.total)throw Error("exact objective mismatch");
    const all=fit([...tr,...te]);if(metrics([...tr,...te],all).hit!==all.total)throw Error("combined objective mismatch");
    output.results.push({label,train:fitMetrics,heldout,assignmentSupport:f.total,independentUpper:f.independentUpper,depths:f.depths,permutation:f.permutation,keys:f.chosen.map(fromString),combinedExactSupport:all.total,combinedIndependentUpper:all.independentUpper,control})
  }
  return output
}
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const result=experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),read("resources/control/english_wordfreq_textblob.txt"),read("resources/control/gibran_prophet_58585.txt"));
console.log(JSON.stringify(result,null,2));
