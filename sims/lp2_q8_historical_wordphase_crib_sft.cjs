'use strict';
/** Source-selected exact word-phase quotation inverse, reusing Agent4's aligned crib algebra.
 * node sims/lp2_q8_historical_wordphase_crib_sft.cjs
 * No printed ciphertext word boundaries or language score used.
 */
const S="0123456789abcdefghijklmnopqrs",Q=29,N=28,mod=x=>(x%Q+Q)%Q,seq=n=>Array.from({length:n},(_,i)=>i);
const inv=seq(Q).map(x=>seq(Q).find(y=>x*y%Q===1));
 function rot(a,j){return a.slice(j).concat(a.slice(0,j))}
 function canonical(pi,k){const v=inv[pi[1]];return pi.map(x=>mod(x*v)).join(",")+":"+seq(8).map(i=>rot(k,i).map(x=>mod(x*v)).join(",")).sort()[0]}
 function encrypt(w,pi,k,start){let t=start,out="";const I=[];pi.forEach((v,i)=>I[v]=i);for(const z of w){const p=S.indexOf(z);if(!p){out+="0";continue}out+=S[I[mod(pi[p]+k[t])]];t=(t+1)%8}return out}
 function matches(w,pi,k){return seq(8).some(s=>encrypt(w.p,pi,k,s)===w.c)}
 function align(w){const a=[];if(w.p.length!==w.c.length)throw Error("length");for(let i=0;i<w.p.length;i++){const x=S.indexOf(w.p[i]),y=S.indexOf(w.c[i]);if(x<0||y<0)throw Error("symbol");if(!x){if(y)return null;continue}a.push([x,y]);}return a}
 function row(a,b){const v=new Int8Array(N+1);for(const [e,sign] of [[a,1],[b,-1]]){if(e[1])v[e[1]-1]+=sign;if(e[0])v[e[0]-1]-=sign}for(let i=0;i<N;i++)v[i]=mod(v[i]);return v}
 function add(B,r){r=r.slice();for(let i=0;i<N;i++)if(r[i]&&B[i]){const a=r[i],b=B[i];for(let j=i;j<=N;j++)r[j]=mod(r[j]-a*b[j])}
  let i=0;while(i<N&&!r[i])i++;if(i===N)return r[N]===0;
  const a=inv[r[i]];for(let j=i;j<=N;j++)r[j]=mod(r[j]*a);
  for(let l=0;l<N;l++)if(B[l]?.[i]){const b=B[l].slice(),v=b[i];for(let j=i;j<=N;j++)b[j]=mod(b[j]-v*r[j]);B[l]=b}
  B[i]=r;return true;
 }
 function collision(B){const f=seq(N).filter(i=>!B[i]);const seen=new Set(["0,"+f.map(()=>0).join(",")]);for(let i=0;i<N;i++){let s;if(B[i])s=B[i][N]+","+f.map(j=>mod(-B[i][j])).join(",");else s="0,"+f.map(j=>+(i===j)).join(",");if(seen.has(s))return true;seen.add(s)}return false}
 function recover(words,ids,cap=2000000,nodeCap=500000){
  const aa=ids.map(i=>({i,e:align(words[i])}));if(aa.some(a=>a.e===null))return {complete:true,candidates:0,reason:"literal-F mismatch",actions:[]};
  aa.sort((a,b)=>b.e.length-a.e.length||a.i-b.i);
  if(aa[0].e.length<8)return {complete:false,reason:"no full anchor",actions:[]};
  const anchor=aa.shift(), A=anchor.e.slice(0,8), B=Array(N).fill(null),g=new Int8Array(N+1);g[0]=g[N]=1;add(B,g);
  for(let i=8;i<anchor.e.length;i++)if(!add(B,row(anchor.e[i],A[i%8])))return {complete:true,candidates:0,reason:"anchor contradiction",actions:[]};
  const groups=aa.map(a=>({i:a.i,opts:seq(8).flatMap(s=>{const rows=[];for(let i=0;i<a.e.length;i++){const x=a.e[i],y=A[(i+s)%8];if((x[0]===x[1])!==(y[0]===y[1]))return [];rows.push(row(x,y));}return [{s,rows}]})}));
  groups.sort((a,b)=>a.opts.length-b.opts.length||b.opts[0]?.rows.length-a.opts[0]?.rows.length);if(groups.some(g=>!g.opts.length))return {complete:true,candidates:0,reason:"zero-shift pattern",actions:[]};
  const counts={nodes:0,joins:0,collisions:0,contradictions:0,freeLeaves:0,enumerations:0,cappedLeaves:0,fullRank:0};
  const actions=new Map();let complete=true,stop=false;
  function test(pi){counts.enumerations++;if(new Set(pi).size!==Q)return;const k=A.map(([x,y])=>mod(pi[y]-pi[x]));if([1,2,4].some(d=>k.every((x,i)=>x===k[i%d])))return;for(const i of ids)if(!matches(words[i],pi,k))return;actions.set(canonical(pi,k),{pi,k})}
  function finish(B){const f=seq(N).filter(i=>!B[i]);if(f.length>3||counts.enumerations+Q**f.length>cap){complete=false;counts.cappedLeaves++;return}counts.freeLeaves++;if(!f.length)counts.fullRank++;
   const x=Array(N).fill(0);
   function visit(i){if(i<f.length){for(let v=0;v<Q;v++){x[f[i]]=v;visit(i+1)}return}
    for(let j=0;j<N;j++)if(B[j])x[j]=mod(B[j][N]-f.reduce((s,k)=>s+B[j][k]*x[k],0));
    test([0,...x]);
   }visit(0)
  }
  function walk(B,p){if(stop)return;if(++counts.nodes>nodeCap){complete=false;stop=true;return}if(collision(B)){counts.collisions++;return}if(B.every(Boolean)||p===groups.length){finish(B);return}
   for(const o of groups[p].opts){counts.joins++;const C=B.slice();if(o.rows.every(r=>add(C,r)))walk(C,p+1);else counts.contradictions++}
  }walk(B,0);
  return {ids,anchor:anchor.i,runes:ids.reduce((n,i)=>n+words[i].p.length,0),consuming:ids.reduce((n,i)=>n+align(words[i]).length,0),complete,candidates:actions.size,actions:[...actions.values()],...counts};
 }

const paths=[
"resources/external/blake-marriage-1906-gutenberg45315.txt",
"resources/external/2013-liber-al-bookcode-I.txt",
"resources/external/2013-liber-al-bookcode-II.txt",
"resources/external/2013-liber-al-bookcode-III.txt",
"resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt"];
const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
function normalize(t,A){
 const map=new Map(A.translit.map((x,i)=>[x,i]));
 return (t.normalize("NFKD").replace(/\p{M}/gu,"").toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{
  w=w.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  let out="";for(let i=0;i<w.length;){const d=w.slice(i,i+2),k=d.length===2&&map.has(d)?2:1,x=map.get(w.slice(i,i+k));if(x===undefined)throw Error(w);out+=S[x];i+=k}return out
 });
}
function spans(words,n){
 const out=[];let offset=0;
 for(let i=0;i<words.length;i++){
  let l=0,k=i;while(k<words.length&&l<n)l+=words[k++].length;
  if(l<n)break;const p=words.slice(i,k),f=[...p.join("")].flatMap((x,j)=>x==="0"?[j]:[]);
  if(f.length>=2&&p.some(w=>w.replace(/0/g,"").length>=8))out.push({from:i,to:k,offset,p,f,l});
  offset+=words[i].length;
 }return out
}
function scopeIndex(name,c,offset=0){
 const m=Array.from({length:256},()=>[]),f=[...c].flatMap((x,i)=>x==="0"?[i]:[]);
 for(const x of f)for(let d=1;d<m.length&&x+d<c.length;d++)if(c[x+d]==="0")m[d].push(x);
 return {name,c,offset,m}
}
function scan(scope,ss){
 const {name,c,offset,m}=scope, result={name,spans:ss.length,alignments:0,pairCandidates:0,fCompatible:0,completeRejected:0,unresolved:[],hits:[],reasons:{},nodes:0,joins:0};
 for(const s of ss){
  const {p,f,l}=s;result.alignments+=Math.max(0,c.length-l+1);
  if(l>c.length)continue;
  let a=f[0],b=f[1];
  for(let u=0;u<f.length;u++)for(let v=u+1;v<f.length;v++)if(m[f[v]-f[u]].length<m[b-a].length){a=f[u];b=f[v]}
  for(const x of m[b-a]){
   const start=x-a;if(start<0||start+l>c.length)continue;result.pairCandidates++;
   if(!f.every(t=>c[start+t]==="0"))continue;result.fCompatible++;
   let pos=start;const words=p.map(p=>{const w={p,c:c.slice(pos,pos+p.length)};pos+=p.length;return w});
   const r=recover(words,seq(words.length));result.nodes+=r.nodes||0;result.joins+=r.joins||0;
   if(!r.complete)result.unresolved.push({from:s.from,to:s.to,donorRune:s.offset,start:offset+start,candidates:r.candidates,reason:r.reason,counts:{nodes:r.nodes,joins:r.joins,cappedLeaves:r.cappedLeaves}});
   else if(!r.candidates)result.completeRejected++;
   if(r.actions.length)result.hits.push({from:s.from,to:s.to,donorRune:s.offset,start:offset+start,plain:p,actions:r.actions,complete:r.complete});
   const reason=r.reason||(!r.complete?"unresolved":r.candidates?"candidate":"affine rejection");
   result.reasons[reason]=(result.reasons[reason]||0)+1;
  }
 }
 return result
}
function plant(words,ss,seed){
 let st=seed>>>0;function rng(n){st=(Math.imul(st,1664525)+1013904223)>>>0;return st%n}
 const pi=seq(Q);for(let i=28;i>1;i--){const j=1+rng(i);[pi[i],pi[j]]=[pi[j],pi[i]]}
 // RNG low bits can correlate; choose high bits for key/phase draws.
 function high(n){st=(Math.imul(st,1664525)+1013904223)>>>0;return Math.floor(st/4294967296*n)}
 let k;do{k=seq(8).map(()=>high(29))}while([1,2,4].some(d=>k.every((x,i)=>x===k[i%d])));
 const eligible=ss.filter(s=>s.to+16<=words.length);
 const s=eligible[high(eligible.length)],p=s.p;
 const prefix=seq(13).map(()=>S[high(29)]).join("");
 const aligned=p.map(p=>({p,c:encrypt(p,pi,k,high(8))}));
 const held=words.slice(s.to,s.to+16).map(p=>({p,c:encrypt(p,pi,k,high(8))}));
 const c=prefix+aligned.map(w=>w.c).join("")+held.map(w=>w.c).join("");
 const r=scan(scopeIndex("plant",c),[s]),truth=canonical(pi,k);
 const found=r.hits.find(h=>h.start===prefix.length&&h.actions.some(a=>canonical(a.pi,a.k)===truth));
 if(!found)return {seed,from:s.from,to:s.to,runes:s.l,truth,truthRetained:false,exact:false,heldTruth:null,heldTotal:held.length,scan:r};
 const a=found.actions.find(a=>canonical(a.pi,a.k)===truth),heldTruth=held.filter(w=>matches(w,a.pi,a.k)).length;
 if(heldTruth!==held.length)throw Error("held truth lost");
 return {seed,from:s.from,to:s.to,runes:s.l,truth,truthRetained:true,exact:found.complete&&found.actions.length===1,heldTruth,heldTotal:held.length,scan:r}
}
function study(A,donors,minimums=[64,96],sourceIds=seq(paths.length)){
 const D=donors.map(t=>normalize(t,A)),lens=D.map(w=>w.join("").length);
 if(lens.join(",")!=="18355,6958,7059,7484,41181")throw Error("source lengths changed "+lens);
 let offset=0;const scopes=ranges.map(([a,b])=>{const c=A.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices).map(x=>S[x]).join("");const s=scopeIndex("p"+a+"-"+b,c,offset);offset+=c.length;return s});
 if(offset!==12956)throw Error("LP2 length");
 const outputs=[],plants=[];
 for(const n of minimums)for(const j of sourceIds){
  const ss=spans(D[j],n);
  plants.push({path:paths[j],n,...plant(D[j],ss,3301+19*j+n)});
  outputs.push({path:paths[j],n,spans:ss.length,scopes:scopes.map(scope=>scan(scope,ss))});
 }
 return {schema:1,model:"common GP29 q8, primitive, literal-F holds, independent donor word starts",minimums,lens,plants,outputs}
}
if(require.main===module){const fs=require("node:fs"),A=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8")),d=paths.map(p=>fs.readFileSync(p,"utf8"));console.log(JSON.stringify(study(A,d),null,2))}
module.exports={study,paths,normalize,spans,scan,scopeIndex,plant};
