'use strict';
/** Earlier book-code quote recovery using partial-anchor word-phase inverse.
 * Run: node sims/lp2_multiword_phase_historical_crib_sft.cjs [target|full] [q] [minimum] [source id]
 */
const {solve,trial,S}=require("./lp2_multiword_phase_affine_crib.cjs");
const {paths,normalize,scopeIndex}=require("./lp2_q8_historical_wordphase_crib_sft.cjs");
const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
function candidates(words,n,q,partialOnly){
 const out=[];let offset=0;
 for(let i=0;i<words.length;i++){let l=0,k=i;while(k<words.length&&l<n)l+=words[k++].length;if(l<n)break;
  const p=words.slice(i,k),f=[...p.join("")].flatMap((x,j)=>x==="0"?[j]:[]),max=Math.max(...p.map(w=>w.replace(/0/g,"").length));
  if(f.length>=2&&(!partialOnly||max<q))out.push({from:i,to:k,offset,p,f,l,max});offset+=words[i].length;
 }return out
}
function scan(scope,ss,q){
 const {name,c,offset,m}=scope,result={name,spans:ss.length,alignments:0,fCompatible:0,completeRejected:0,hits:[],unresolved:[],reasons:{},nodes:0,joins:0,linearPrune:0,pairPrune:0,forcedCollision:0};
 for(const s of ss){
  const {p,f,l}=s;result.alignments+=Math.max(0,c.length-l+1);if(l>c.length)continue;
  let a=f[0],b=f[1];for(let u=0;u<f.length;u++)for(let v=u+1;v<f.length;v++)if(m[f[v]-f[u]].length<m[b-a].length){a=f[u];b=f[v]}
  for(const x of m[b-a]){const start=x-a;if(start<0||start+l>c.length||!f.every(t=>c[start+t]==="0"))continue;result.fCompatible++;
   let pos=start;const words=p.map(p=>{const c0=c.slice(pos,pos+p.length);pos+=p.length;return {p,c:c0}});
   const r=solve(q,words);for(const k of ["nodes","joins","linearPrune","pairPrune","forcedCollision"])result[k]+=r[k]||0;
   if(!r.complete)result.unresolved.push({from:s.from,to:s.to,donorRune:s.offset,start:offset+start,counts:r});
   else if(!r.actions.length)result.completeRejected++;
   if(r.actions.length)result.hits.push({from:s.from,to:s.to,donorRune:s.offset,start:offset+start,plain:p,...r});
   const reason=r.reason||(!r.complete?"unresolved":r.actions.length?"candidate":"phase/affine rejection");result.reasons[reason]=(result.reasons[reason]||0)+1;
  }
 }
 return result
}
function study(A,donors,mode="target",q=13,n=128,ids=[0,1,2,3,4]){
 const D=donors.map(t=>normalize(t,A)),lens=D.map(w=>w.join("").length);
 if(lens.join(",")!=="18355,6958,7059,7484,41181")throw Error("source lengths changed");
 let offset=0;const all=ranges.map(([a,b])=>{const c=A.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices).map(x=>S[x]).join("");const s=scopeIndex("p"+a+"-"+b,c,offset);offset+=c.length;return s});
 if(offset!==12956)throw Error("LP2 length");
 let scopes;if(mode==="full")scopes=all;else if(mode==="target"){const p=q===13?0:54,skip=q===13?13:9,len=q===13?249:213;
  scopes=[scopeIndex("p"+p+"-black-complete-fit",A.pages[p].indices.slice(skip,skip+len).map(x=>S[x]).join(""),all.find(s=>s.name.startsWith("p"+p+"-")).offset+skip)];
 }else throw Error("mode");
 const controls=[],outputs=[];
 for(const j of ids){
  const words=D[j],ss=candidates(words,n,q,q===8);
  // Choose a deterministic source-constrained partial-anchor plant; no phase oracle.
  const eligible=ss.filter(s=>s.max<q&&s.to+16<=words.length);
  if(!eligible.length)throw Error("no partial-anchor control");
  const seed=1033+n*101+q*13+j*173,s=eligible[(seed*3301)%eligible.length],r=trial(s.p,q,seed,words.slice(s.to,s.to+16));
  controls.push({path:paths[j],from:s.from,to:s.to,...r});
  outputs.push({path:paths[j],spans:ss.length,partialSpans:ss.filter(s=>s.max<q).length,scopes:scopes.map(scope=>scan(scope,ss,q))});
 }
 return {schema:1,mode,q,n,lens,controls,outputs}
}
if(require.main===module){const fs=require("node:fs"),A=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8")),d=paths.map(p=>fs.readFileSync(p,"utf8")),mode=process.argv[2]||"target",q=+(process.argv[3]||13),n=+(process.argv[4]||128),ids=process.argv[5]===undefined?undefined:[+process.argv[5]];console.log(JSON.stringify(study(A,d,mode,q,n,ids),null,2))}
module.exports={study,candidates,scan};
