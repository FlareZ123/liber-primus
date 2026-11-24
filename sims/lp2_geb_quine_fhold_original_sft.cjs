"use strict";
// Director #2596: exact original quote-adjacent repeated-plaintext inverse.
function experiment(c,meta,raw){
 const assert=(x,m)=>{if(!x)throw Error(m)}, mod=x=>(x%29+29)%29;
 const fixed=[[1659,1677],[5459,5478],[9715,9727],[9811,9869],[10211,10279],[10279,10439],[12522,12592]];
 assert(JSON.stringify(meta.quotes.map(x=>[x.start,x.end]))===JSON.stringify(fixed),"quote intervals changed");
 const orig=c.pages.filter(x=>x.page<56).flatMap(x=>x.indices);assert(orig.length===12956,"corpus size");
 const gaps=new Set();let pos=0;const trans=[];
 for(const ch of raw){if(/[\u16A0-\u16FF]/u.test(ch)){trans.push(c.runes.indexOf(ch));pos++;}else if(/[-.&$§]/u.test(ch))gaps.add(pos);}
 assert(JSON.stringify(trans.slice(0,orig.length))===JSON.stringify(orig),"transcription disagrees with canonical corpus");
 const shape=(s,e)=>Array.from({length:e-s-1},(_,i)=>i+1).filter(i=>gaps.has(s+i));
 function enc(p,k){let j=0;return p.map(x=>x===0?0:mod(x+k[j++%k.length]));}
 function solve(a,b,q){
  const n=a.length,zero=a.flatMap((x,i)=>x===0&&b[i]===0?[i]:[]),cut=Math.ceil(n/2);
  let masks=0n,trainMasks=0n,fullMasks=0n,trainKeys=0n,fullKeys=0n,witness=null;const candidates=[];
  function constraints(held,limit){
   const shift=(n-held.size)%q,adj=Array.from({length:q},()=>[]),forbid=Array.from({length:q},()=>new Set());let j=0;
   for(let i=0;i<limit;i++){if(held.has(i))continue;const u=j++%q,v=(u+shift)%q,d=mod(b[i]-a[i]);adj[u].push([v,d]);adj[v].push([u,mod(-d)]);forbid[u].add(a[i]);forbid[v].add(b[i]);}
   const pot=Array(q).fill(null),groups=[];let count=1n;
   for(let i=0;i<q;i++){if(pot[i]!==null)continue;pot[i]=0;const component=[i];for(let t=0;t<component.length;t++){const u=component[t];for(const [v,d] of adj[u]){const p=mod(pot[u]+d);if(pot[v]===null){pot[v]=p;component.push(v);}else if(pot[v]!==p)return {count:0n};}}
    const blocked=new Set();for(const u of component)for(const v of forbid[u])blocked.add(mod(v-pot[u]));const allowed=Array.from({length:29},(_,j)=>j).filter(x=>!blocked.has(x));if(!allowed.length)return {count:0n};count*=BigInt(allowed.length);groups.push({component,allowed});
   }return {count,pot,groups};
  }
  function visit(i,held){
   if(i<zero.length){visit(i+1,held);held.add(zero[i]);visit(i+1,held);held.delete(zero[i]);return;}
   masks++;const tr=constraints(held,cut);if(!tr.count)return;trainMasks++;trainKeys+=tr.count;
   const f=constraints(held,n);if(!f.count)return;fullMasks++;fullKeys+=f.count;
   const k=Array(q);function emit(g){if(g===f.groups.length){let j=0;const p=a.map((x,i)=>held.has(i)?0:mod(x-k[j++%q]));assert(p.every((x,i)=>(x===0)===held.has(i)),"hold witness");assert(JSON.stringify(enc(p.concat(p),k))===JSON.stringify(a.concat(b)),"full witness replay");const w={key:k.slice(),plaintext:p,holds:[...held]};if(!witness)witness=w;if(f.count<=1000n)candidates.push(w);return;}const group=f.groups[g];for(const root of (f.count<=1000n?group.allowed:group.allowed.slice(0,1))){for(const u of group.component)k[u]=mod(root+f.pot[u]);emit(g+1);}}emit(0);
  }
  visit(0,new Set());return {q,n,cut,doubleZeros:zero,maskCount:String(masks),trainMasks:String(trainMasks),trainKeys:String(trainKeys),fullMasks:String(fullMasks),fullKeys:String(fullKeys),witness,candidates};
 }
 const p57=c.pages.find(x=>x.page===57).indices,controls=[];
 for(const k of [[23,10,1,10,9,10,16,26],[0,10,4,0,1,19,0,18,4,18,9,0,18]]){
  const n=48,p=p57.slice(0,n),ct=enc(p.concat(p),k),result=solve(ct.slice(0,n),ct.slice(n),k.length);assert(result.candidates.some(w=>JSON.stringify(w.key)===JSON.stringify(k)&&JSON.stringify(w.plaintext)===JSON.stringify(p)),"true planted key/plaintext absent");controls.push({q:k.length,trainKeys:result.trainKeys,fullKeys:result.fullKeys,truthPresent:true,doubleZeros:result.doubleZeros});
 }
 const results=[];
 for(const [s,e] of fixed){const n=e-s;if(fixed.some(([u,v])=>u<e+n&&v>e)){results.push({s,e,n,excluded:"next block intersects another quote"});continue;}
  const shapeA=shape(s,e),shapeB=shape(e,e+n),endBoundary=gaps.has(e+n);
  for(const q of [8,13]){const z=solve(orig.slice(s,e),orig.slice(e,e+n),q);results.push({s,e,...z,shapeA,shapeB,endBoundary,printedShapeMatch:JSON.stringify(shapeA)===JSON.stringify(shapeB)&&endBoundary,plaintextCandidates:z.candidates.map(w=>w.plaintext.map(x=>c.translit[x]).join(""))});}
 }
 return {controls,results};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path"); console.log(JSON.stringify(experiment(require("../resources/liber-primus/lp2-corpus.json"),require("../resources/liber-primus/lp2-quote-punctuation-spans.json"),fs.readFileSync(path.join(__dirname,"../resources/liber-primus/lp2-transcription.txt"),"utf8")),null,2));}
module.exports=experiment;
