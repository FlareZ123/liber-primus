"use strict";
/** #2609. Exact sparse-slip collision bound; run from repository root with Node 22. */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
function run(gp,donor,raw,sourceBlobShas){
 const assert=(v,m)=>{if(!v)throw Error(m)};
 const D=[13,26,39],W=[[1,0],[0,1],[1,4]],mod=x=>(x%29+29)%29;
 const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){let a=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){let t=tok.find(t=>w.startsWith(t.s));assert(t,"transliteration");a.push(t.i);w=w.slice(t.s.length)}}return a}
 function zero(C){let z=[0];for(let c of C)z.push(z.at(-1)+ +(c===0));return z}
 function fixed(C){let S=new Map([["",W.map(()=>0)]]);for(let c of C){let T=new Map();function merge(h,v,r,b){let a=T.get(h);if(!a)T.set(h,v.map((x,j)=>x+W[j][0]*r+W[j][1]*b));else for(let j=0;j<W.length;j++)a[j]=Math.max(a[j],v[j]+W[j][0]*r+W[j][1]*b)}for(let [h,v] of S){if(c===0)merge(h,v,0,0);let r=0,b=0;for(let d of D)if(h.length>=d&&h.charCodeAt(h.length-d)===c){r++;if(h.length>d&&h.charCodeAt(h.length-1)===h.charCodeAt(h.length-d-1))b++}merge((h+String.fromCharCode(c)).slice(-40),v,r,b)}S=T}return W.map((_,j)=>Math.max(...[...S.values()].map(a=>a[j])))}
 /** Enumerate possible new equal end pairs, and guaranteed lost nominal pairs. */
 function events(C){let z=zero(C),E=[];for(let i=0;i<C.length;i++)for(let j=i-1;j>=0;j--){let min=i-j-(z[i]-z[j+1]);if(min>41)break;if(C[i]!==C[j])continue;let flags=0;for(let d of D)for(let s of [-2,-1,1,2])if(d-s>=min&&d-s<=i-j)flags|=1<<(s+2);let p=i-1,b=false;while(p>=0){let q=j-1;while(q>=0){if(C[p]===C[q])b=true;if(C[q]!==0)break;q--}if(C[p]!==0)break;p--}if(flags)E.push({l:j+1,r:i,flags,b,w:1});if(D.includes(i-j)&&z[i+1]===z[j])E.push({l:j+1,r:i,flags:27,b:j>0&&C[j-1]!==0&&C[i-1]!==0&&C[j-1]===C[i-1],w:-1})}return E}
 function score(e,s,wr,wb){return s!==0&&(e.flags&(1<<(s+2)))?e.w*(wr+wb*+e.b):0}
 function coarseAt(E,cuts,wr,wb){return E.reduce((v,e)=>v+score(e,cuts.reduce((s,[j,k])=>s+(e.l<=j&&j<=e.r?k:0),0),wr,wb),0)}
 /** Exact max of the signed interval-event upper bound over at most two cuts. */
 function coarse(C,E,wr,wb,threshold=null){let n=C.length,z=zero(C),B=Math.max(1,...E.map(e=>e.r-e.l+1)),one=0,two=0,singles=[],close=[];
  for(let s1 of [-1,1])for(let s2 of [-1,1]){
   let a=new Int32Array(n+1),b=new Int32Array(n+1),corr=Array.from({length:n},()=>new Int32Array(B));
   for(let e of E){let x=score(e,s1,wr,wb),y=score(e,s2,wr,wb),v=score(e,s1+s2,wr,wb);a[e.l]+=x;a[e.r+1]-=x;b[e.l]+=y;b[e.r+1]-=y;for(let i=e.l;i<=e.r;i++)for(let j=i;j<=e.r;j++)corr[i][j-i]+=v-x-y}
   for(let i=1;i<n;i++){a[i]+=a[i-1];b[i]+=b[i-1];one=Math.max(one,a[i],b[i]);}
   if(threshold!==null&&s1===s2)for(let i=1;i<n;i++)if(a[i]>=Math.ceil(threshold/2))singles.push({cuts:[[i,s1]],upper:a[i]});
   let prev=-Infinity;for(let j=1;j<n;j++){if(j>B)prev=Math.max(prev,a[j-B]);two=Math.max(two,prev+b[j]);for(let i=Math.max(1,j-B+1);i<=j;i++)two=Math.max(two,a[i]+b[j]+corr[i][j-i]);}
   if(threshold!==null)for(let j=1;j<n;j++)for(let i=j;i>=1&&j-i-(z[j]-z[i])<43;i--){let v=a[i]+b[j]+(j-i<B?corr[i][j-i]:0);if(v>=threshold)close.push({cuts:[[i,s1],[j,s2]],upper:v})}
  }
  return {one,two:Math.max(one,two),singles,close};
 }
 /** Collision statistic at actual clock separations; bigrams also require the predecessor phases. */
 function stats(a,ph,k=2){let r=0,b=0;for(let i=0;i<a.length;i++)for(let d of D)for(let j=i-d-k;j<=i-d+k;j++)if(j>=0&&j<i&&ph[i]-ph[j]===d&&a[i]===a[j]){r++;if(j>0&&a[i-1]===a[j-1]&&ph[i-1]-ph[j-1]===d)b++}return [r,b]}
 function active(C,cuts,mask,l=0,r=C.length){let a=[],ph=[],m=0;for(let i=l;i<r;i++){if(C[i]===0&&(Math.floor(mask/2**m++)%2))continue;ph.push(a.length+cuts.reduce((s,[j,k])=>s+(i>=j?k:0),0));a.push(C[i])}return {a,ph}}
 function delta(C,cuts,mask,wr,wb,l=0,r=C.length){let {a,ph}=active(C,cuts,mask,l,r),base=stats(a,a.map((_,i)=>i),0),now=stats(a,ph,cuts.length);return wr*(now[0]-base[0])+wb*(now[1]-base[1])}
 /** Affected pairs fit inside 43 guaranteed consuming runes on either side. */
 function region(C,cuts){let l=cuts[0][0],r=cuts.at(-1)[0],m=0;while(l>0&&m<43){l--;m+=+(C[l]!==0)}m=0;while(r<C.length&&m<43){m+=+(C[r]!==0);r++}return [l,r]}
 function exact(C,cuts,wr,wb){let [l,r]=region(C,cuts),z=zero(C),num=z[r]-z[l],best=-Infinity;assert(num<24,"enumeration unexpectedly large");const a=new Int8Array(r-l),ph=new Int16Array(r-l),shifts=Array.from({length:r-l},(_,i)=>cuts.reduce((s,[j,k])=>s+(i+l>=j?k:0),0));
  for(let mask=0;mask<2**num;mask++){let len=0,m=0;for(let i=l;i<r;i++){if(C[i]===0&&((mask>>m++)&1))continue;ph[len]=len+shifts[i-l];a[len++]=C[i]}let v=0;for(let i=11;i<len;i++)for(let d of D){let j=i-d;if(j>=0&&a[i]===a[j])v-=wr+wb*+(j>0&&a[i-1]===a[j-1]);for(let j=i-d-2;j<=i-d+2;j++)if(j>=0&&ph[i]-ph[j]===d&&a[i]===a[j])v+=wr+wb*+(j>0&&a[i-1]===a[j-1]&&ph[i-1]-ph[j-1]===d)}best=Math.max(best,v)}
  return {best,zeros:num,masks:2**num};
 }
 /** Native lower bound: subtract maximum weighted union of nominal equalities touched by two cuts. */
 function nativeBound(a,wr,wb){let E=[];for(let d of D)for(let i=d;i<a.length;i++)if(a[i]===a[i-d]){if(wr)E.push({l:i-d+1,r:i,w:wr});if(wb&&i>d&&a[i-1]===a[i-d-1])E.push({l:i-d,r:i,w:wb})}let n=a.length,B=40,A=new Int32Array(n+1),I=Array.from({length:n},()=>new Int32Array(B));for(let e of E){A[e.l]+=e.w;A[e.r+1]-=e.w;for(let i=e.l;i<=e.r;i++)for(let j=i;j<=e.r;j++)I[i][j-i]+=e.w}for(let i=1;i<n;i++)A[i]+=A[i-1];let m1=Math.max(...A),m2=0,prev=0;for(let j=1;j<n;j++){if(j>=B)prev=Math.max(prev,A[j-B]);m2=Math.max(m2,prev+A[j]);for(let i=Math.max(1,j-B+1);i<=j;i++)m2=Math.max(m2,A[i]+A[j]-I[i][j-i])}let total=E.reduce((s,e)=>s+e.w,0);return {total,loss1:m1,loss2:m2,lower1:total-m1,lower2:total-m2}}
 let seed=0x2609c0de;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 let toyCases=0,toyMasks=0;
 for(let t=0;t<32;t++){let C=Array.from({length:110},()=>1+rng()%5);for(let j=0;j<5;j++)C[(7+j*19+t)%C.length]=0;let x=1+rng()%(C.length-1),y=t%4===0?x:t%4===1?Math.min(C.length-1,x+55):1+rng()%(C.length-1),cuts=[[x,rng()%2?1:-1],[y,rng()%2?1:-1]].sort((a,b)=>a[0]-b[0]);if(t%5===0)cuts.pop();let E=events(C),z=zero(C),num=z.at(-1);let truth=-Infinity;
  for(let mask=0;mask<2**num;mask++){let d=delta(C,cuts,mask,1,4);assert(d<=coarseAt(E,cuts,1,4),"toy interval upper");truth=Math.max(truth,d);toyMasks++}
  assert(exact(C,cuts,1,4).best===truth,"local/global exhaustive delta");
  if(cuts.length===2&&cuts[1][0]-cuts[0][0]-(z[cuts[1][0]]-z[cuts[0][0]])>=43)assert(truth<=exact(C,[cuts[0]],1,4).best+exact(C,[cuts[1]],1,4).best,"far-cut additivity");
  let ca=coarse(C,E,1,4);assert(truth<=(cuts.length===1?ca.one:ca.two),"global interval upper");toyCases++;
 }
 const plants=[],ix=new Map(gp.runes.map((r,i)=>[r,i]));
 for(let [name,cuts] of [["0_welcome",[[112,1],[311,-1]]],["jpg107-167",[[105,-1]]],["jpg107-167",[[140,1],[140,1]]]]){
  let P=[...donor.sections.find(s=>s.name===name).source_text].filter(x=>ix.has(x)).map(x=>ix.get(x));
  let key=Array.from({length:13},()=>{let p=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){let j=rng()%(i+1);[p[i],p[j]]=[p[j],p[i]]}return p});
  let pa=[],ca=[],ph=[],C=[],mask=0,m=0,k=0;
  for(let i=0;i<P.length;i++){let p=P[i],phase=k+cuts.reduce((s,[j,v])=>s+(i>=j?v:0),0),c=p===0?0:key[(phase%13+13)%13][p];C.push(c);if(c===0){if(p===0)mask+=2**m;m++}if(p!==0){pa.push(p);ca.push(c);ph.push(phase);assert(key[(phase%13+13)%13].indexOf(c)===p,"plant inverse");k++}}
  let ps=stats(pa,ph),cs=stats(ca,ph);assert(ps.join()===cs.join(),"planted slipped invariant");
  let base=fixed(C),E=events(C),baseP=stats(pa,pa.map((_,i)=>i),0);
  for(let j=0;j<W.length;j++){let [wr,wb]=W[j],v=wr*cs[0]+wb*cs[1],v0=wr*baseP[0]+wb*baseP[1],lb=nativeBound(pa,wr,wb);assert(v<=base[j]+coarseAt(E,cuts,wr,wb),"plant upper");assert(v>=(cuts.length===1?lb.lower1:lb.lower2),"plant lower");assert(v0===lb.total,"plant native total")}
  plants.push({name,n:P.length,cuts,holds:P.length-pa.length,cipherFs:m,plain:ps,cipher:cs,base});
 }
 let C=gp.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);assert(C.length===3008&&zero(C).at(-1)===125,"target shape");
 let base=fixed(C),E=events(C);assert(base.join()==="425,24,507","frozen base");
 let co=W.map(([r,b])=>coarse(C,E,r,b));let upper1=co.map((x,i)=>base[i]+x.one),upper2=co.map((x,i)=>base[i]+x.two);
 let controls=raw.map(native).flatMap((p,j)=>Array.from({length:32},(_,i)=>{let start=Math.round(i*(p.length-C.length)/31),a=p.slice(start,start+C.length).filter(x=>x!==0);return {j,i,start,holds:C.length-a.length,bounds:W.map(([r,b])=>nativeBound(a,r,b))}}));
 let pass=(x,u,k)=>x.bounds.every((b,i)=>b[k]<=u[i]);
 let one=controls.filter(x=>pass(x,upper1,"lower1")),two=controls.filter(x=>pass(x,upper2,"lower2"));
 assert(one.length===0&&two.length===1&&two[0].j===0&&two[0].i===23,"coarse decision");
 let threshold=two[0].bounds[2].lower2-base[2];assert(threshold===41,"weighted target");
 let candidates=coarse(C,E,1,4,threshold),single=candidates.singles.map(x=>({...x,...exact(C,x.cuts,1,4)})),close=candidates.close.map(x=>({...x,...exact(C,x.cuts,1,4)}));
 let singleBound=Math.max(Math.ceil(threshold/2)-1,...single.map(x=>x.best)),closeBound=Math.max(threshold-1,...close.map(x=>x.best)),gain=Math.max(2*singleBound,closeBound),finalUpper=base[2]+gain;
 assert(finalUpper<two[0].bounds[2].lower2,"two-slip exclusion");
 return {sourceBlobShas,toyCases,toyMasks,plants,original:{n:C.length,visibleF:125,weights:W,base,events:E.length,upper1,upper2,coarseOnePass:one.length,coarseTwoPass:two,threshold,singleBound,closeBound,singleCandidates:single.length,closeCandidates:close.length,singleMasks:single.reduce((s,x)=>s+x.masks,0),closeMasks:close.reduce((s,x)=>s+x.masks,0),maxExactSingle:Math.max(...single.map(x=>x.best)),maxExactClose:Math.max(...close.map(x=>x.best)),finalUpper,lower:two[0].bounds[2].lower2,minimumSlips:3},controls,single,close};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const raw=files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
const shas=raw.map(x=>crypto.createHash("sha1").update("blob "+Buffer.byteLength(x)+"\0").update(x).digest("hex"));
console.log(JSON.stringify(run(JSON.parse(raw[0]),JSON.parse(raw[1]),raw.slice(2),shas),null,2));
