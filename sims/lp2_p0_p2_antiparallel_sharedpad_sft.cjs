"use strict";
// Exact antiparallel common-additive-pad feasibility, interval-overlap forest DP.
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt"];
const data=paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));
const run=function run(gp,transcription,lex,donor){
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const mod=x=>(x%29+29)%29;
 const ix=new Map(gp.runes.map((x,i)=>[x,i]));
 const spell=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(s){s=s.toUpperCase().replace(/[KVZQ]/g,x=>({K:"C",V:"U",Z:"S",Q:"C"}[x]));let out=[];for(let i=0;i<s.length;){const a=spell.find(x=>s.startsWith(x.s,i));if(a){out.push(a.i);i+=a.s.length;}else i++;}return out;}
 const all=[],cls=[];let buf=[];
 function end(){for(let j=0;j<buf.length;j++){all.push(buf[j]);cls.push(buf.length===1?3:j===0?0:j===buf.length-1?2:1);}buf=[];}
 for(const ch of transcription){if(ix.has(ch))buf.push(ix.get(ch));else if(ch==="-"||ch===".")end();}end();
 const tape=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
 assert(tape.length===12956&&tape.every((x,i)=>x===all[i]),"tape mismatch");
 const pages=[];let cursor=0;for(const p of gp.pages.filter(p=>p.page<56)){pages[p.page]={runes:p.indices,cls:cls.slice(cursor,cursor+p.indices.length)};cursor+=p.indices.length;}
 assert([262,266,201].every((x,i)=>pages[i].runes.length===x),"page lengths");
 const forms=new Map(),byLen=new Map();
 for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(l);if(m){const w=encode(m[1]);if(w.length)forms.set(w.join(","),w);}}
 for(const w of forms.values()){if(!byLen.has(w.length))byLen.set(w.length,[]);byLen.get(w.length).push(w);}
 assert(forms.size===29061,"lexicon count "+forms.size);
 const orient=(p,rev)=>rev?{runes:p.runes.slice().reverse(),cls:p.cls.slice().reverse().map(x=>x===0?2:x===2?0:x)}:p;
 function intervals(c,n){const out=[];for(let j=0;j<n;j++){if(c[j]!==0&&c[j]!==3)continue;let e=j;while(e<n&&c[e]!==2&&c[e]!==3)e++;if(e===n)break;out.push([j,e+1]);j=e;}return out;}
 function solve(p,q,ra,rb,save=false){
  const a=orient(p,ra),b=orient(q,rb),n=Math.min(a.runes.length,b.runes.length);
  const ranges=[intervals(a.cls,n),intervals(b.cls,n)],nodes=[],groups=[[],[]];
  for(let s=0;s<2;s++){const c=s?b.runes:a.runes,rev=s?rb:ra;
   for(const [lo,hi] of ranges[s]){
    const keys=(byLen.get(hi-lo)||[]).map(w=>{let k="";for(let j=0;j<w.length;j++)k+=String.fromCharCode(65+mod(c[lo+j]-w[rev?w.length-1-j:j]));return k;});
    const node={id:nodes.length,lo,hi,keys,edges:[],children:[],cost:null,best:null};nodes.push(node);groups[s].push(node);
   }
  }
  let i=0,j=0,edges=0;
  while(i<groups[0].length&&j<groups[1].length){const x=groups[0][i],y=groups[1][j],lo=Math.max(x.lo,y.lo),hi=Math.min(x.hi,y.hi);
   if(lo<hi){x.edges.push({v:y,lo,hi});y.edges.push({v:x,lo,hi});edges++;}
   if(x.hi<=y.hi)i++;if(y.hi<=x.hi)j++;
  }
  const visited=new Set(),roots=[];
  function dfs(v,parent){
   assert(!visited.has(v.id),"overlap graph cycle");visited.add(v.id);
   const M=v.keys.length,cost=new Int32Array(M+1);cost[M]=1;
   for(const e of v.edges){const u=e.v;if(u===parent)continue;dfs(u,v);
    const W=u.keys.length,dict=new Map();let best=0;
    for(let k=0;k<=W;k++){if(u.cost[k]<u.cost[best])best=k;if(k===W)continue;const tag=u.keys[k].slice(e.lo-u.lo,e.hi-u.lo),old=dict.get(tag);if(old===undefined||u.cost[k]<u.cost[old])dict.set(tag,k);}
    for(let k=0;k<M;k++){const tag=v.keys[k].slice(e.lo-v.lo,e.hi-v.lo),match=dict.get(tag),choice=match!==undefined&&u.cost[match]<u.cost[W]?match:W;cost[k]+=u.cost[choice];}
    cost[M]+=u.cost[best];v.children.push({u,lo:e.lo,hi:e.hi,dict,best});
   }
   v.cost=cost;let best=0;for(let k=1;k<=M;k++)if(cost[k]<cost[best])best=k;v.best=best;
  }
  let min=0;for(const v of nodes)if(!visited.has(v.id)){dfs(v,null);roots.push(v);min+=v.cost[v.best];}
  assert(edges===nodes.length-roots.length,"forest identity");
  const pad=Array(n).fill(-1);
  function recover(v,k){const key=v.keys[k];if(key!==undefined){for(let t=v.lo;t<v.hi;t++){const x=key.charCodeAt(t-v.lo)-65;assert(pad[t]===-1||pad[t]===x,"key conflict");pad[t]=x;}}
   for(const e of v.children){const u=e.u,W=u.keys.length;let choice=e.best;if(key!==undefined){const tag=key.slice(e.lo-v.lo,e.hi-v.lo),match=e.dict.get(tag);choice=match!==undefined&&u.cost[match]<u.cost[W]?match:W;}recover(u,choice);}
  }
  for(const v of roots)recover(v,v.best);for(let t=0;t<n;t++)if(pad[t]===-1)pad[t]=0;
  const plainA=a.runes.slice(0,n).map((x,t)=>mod(x-pad[t])),plainB=b.runes.slice(0,n).map((x,t)=>mod(x-pad[t]));
  function oov(p,range,rev){return range.reduce((s,[lo,hi])=>{const w=p.slice(lo,hi);if(rev)w.reverse();return s+!forms.has(w.join(","));},0);}
  assert(oov(plainA,ranges[0],ra)+oov(plainB,ranges[1],rb)===min,"recount failed");
  assert(pad.every((k,t)=>mod(plainA[t]+k)===a.runes[t]&&mod(plainB[t]+k)===b.runes[t]),"replay failed");
  return {n,words:ranges.map(x=>x.length),components:roots.length,edges,minOov:min,...(save?{witness:{a:plainA,b:plainB,pad}}:{})};
 }
 // Exhaustively enumerate all 29^2 pad values in an independent tiny overlap control.
 for(const [a,b] of [[[3,4],[5,6]],[[1,1],[1,1]],[[13,18],[2,4]]]){
  const p={runes:a,cls:[0,2]},q={runes:b,cls:[3,3]};
  let best=3;for(let k=0;k<29;k++)for(let l=0;l<29;l++){
   const x=[mod(a[0]-k),mod(a[1]-l)],y=[mod(b[1]-k),mod(b[0]-l)];
   const v=+!forms.has(x.join(","))+ +!forms.has(String(y[0]))+ +!forms.has(String(y[1]));best=Math.min(best,v);
  }
  assert(solve(p,q,false,true).minOov===best,"brute disagreement");
 }
 const donorByLen=new Map();for(const w of donor.match(/[A-Za-z]+/g).map(encode).filter(w=>w.length)){if(!donorByLen.has(w.length))donorByLen.set(w.length,[]);donorByLen.get(w.length).push(w);}
 let seed=0x42261126;function rand(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;}
 function plant(p){const out=Array(p.runes.length).fill(0).map(()=>rand(29));for(const [lo,hi] of intervals(p.cls,p.runes.length)){const a=donorByLen.get(hi-lo)||byLen.get(hi-lo);assert(a&&a.length,"missing length");const w=a[rand(a.length)];for(let j=lo;j<hi;j++)out[j]=w[j-lo];}return {runes:out,cls:p.cls};}
 function encrypt(p,rev,k){const x=orient(p,rev),v=x.runes.map((s,i)=>mod(s+(k[i]??rand(29))));return {runes:rev?v.reverse():v,cls:p.cls};}
 function plantedOov(p,rev,n){const a=orient(p,rev);return intervals(a.cls,n).reduce((s,[lo,hi])=>{const w=a.runes.slice(lo,hi);if(rev)w.reverse();return s+!forms.has(w.join(","));},0);}
 const results=[];
 for(const [i,j] of [[0,1],[0,2],[1,2]])for(const [ra,rb] of [[false,true],[true,false]]){
  const orig=solve(pages[i],pages[j],ra,rb,true),n=orig.n,controls=[];
  for(let z=0;z<4;z++){
   const p=plant(pages[i]),q=plant(pages[j]),k=Array.from({length:n},()=>rand(29)),l=Array.from({length:n},()=>rand(29));
   const a=encrypt(p,ra,k),b=encrypt(q,rb,k),wrong=encrypt(q,rb,l);
   const pos=solve(a,b,ra,rb).minOov,neg=solve(a,wrong,ra,rb).minOov,truth=plantedOov(p,ra,n)+plantedOov(q,rb,n);
   assert(pos<=truth,"positive bound");
   controls.push({same:pos,independent:neg,plantedOov:truth});
  }
  results.push({pair:[i,j],direction:(ra?"R":"F")+(rb?"R":"F"),...orig,controls});
 }
 return {dictionary:forms.size,toyExhaustiveCases:3,results};
};
console.log(JSON.stringify(run(JSON.parse(data[0]),...data.slice(1)),null,2));
