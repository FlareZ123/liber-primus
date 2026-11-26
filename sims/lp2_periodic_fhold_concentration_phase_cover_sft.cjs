"use strict";
/**
 * Exact concentration upper bound for a shared q-phase additive GP29 key,
 * arbitrary latent literal-F holds and arbitrary starting phase.
 * A phase-subset solver relaxes other phases' key consistency/legality,
 * then cyclic translations cover all phases equally.
 */
function experiment(inputs) {
 const [gp,rawG,rawS,rawE,native]=[JSON.parse(inputs[0]),inputs[1],inputs[2],inputs[3],JSON.parse(inputs[4])];
 const assert=(x,m)=>{if(!x)throw Error(m)},NEG=-10000;
 const C=gp.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
 let hash=2166136261;for(const c of C)hash=Math.imul(hash^c,16777619)>>>0;
 assert(C.length===3008&&C.filter(x=>x===0).length===125&&hash===1862123327,"physical chapter");
 function make(C,q,p,sub,A=29){
  const blocks=[];let b=[];for(const c of C){if(c===0){blocks.push(b);b=[]}else b.push(c)}blocks.push(b);
  const N=blocks.length,k=sub.length;
  const ss=blocks.map(run=>{
   const h=Array.from({length:q},()=>new Int16Array(A));for(let i=0;i<run.length;i++)h[i%q][run[i]]++;
   const per=sub.map(j=>Array.from({length:A},(_,x)=>Int16Array.from({length:q},(_,r)=>{const v=h[(j-r+q)%q];return v[x]?NEG:v[(p+x)%A]})));
   return {n:run.length,per}
  });
  const fixed=new Int8Array(q),d=new Int16Array(q),e=new Int16Array(q);
  return function one(keys){
   fixed.fill(-1);for(let i=0;i<k;i++)fixed[sub[i]]=keys[i];d.fill(0);
   for(let b=0;b<N;b++){e.fill(NEG);const {n,per}=ss[b];let any=false;
    for(let r=0;r<q;r++){let v=d[r];if(v<0)continue;
     for(let i=0;i<k;i++){v+=per[i][keys[i]][r];if(v<0)break}
     if(v<0)continue;any=true;const a=(r+n)%q;
     // Hold each visible F, or consume it if the selected phase is not shift zero.
     if(v>e[a])e[a]=v;
     if(b<N-1&&fixed[a]!==0){const u=(a+1)%q,w=v+(fixed[a]===A-p?1:0);if(w>e[u])e[u]=w}
    }
    if(!any)return NEG;d.set(e)
   }
   return Math.max(...d)
  }
 }
 function direct(C,q,p,sub,keys,A=29,witness=false){
  const k=new Int8Array(q).fill(-1);sub.forEach((j,i)=>k[j]=keys[i]);
  let d=new Int16Array(q),e=new Int16Array(q);const prev=witness?[]:null;
  for(const c of C){e.fill(NEG);const step=witness?Array(q).fill(null):null;
   function add(r,v,prior,hold){if(v>e[r]){e[r]=v;if(step)step[r]=[prior,hold]}}
   for(let r=0;r<q;r++){if(d[r]<0)continue;
    if(c===0)add(r,d[r],r,true);
    if(k[r]<0||c!==k[r])add((r+1)%q,d[r]+ +(k[r]>=0&&(c-k[r]+A)%A===p),r,false)
   }
   if(step)prev.push(step);[d,e]=[e,d]
  }
  const score=Math.max(...d);if(!witness||score<0)return score;
  assert(sub.length===q,"full key required for witness");let r=d.indexOf(score),end=r;const plain=[],holds=[];
  for(let i=C.length-1;i>=0;i--){const [prior,hold]=prev[i][r];plain.push(hold?0:(C[i]-k[prior]+A)%A);holds.push(hold);r=prior}
  plain.reverse();holds.reverse();let a=r;
  for(let i=0;i<C.length;i++){assert(holds[i]===(plain[i]===0),"literal F law");const c=holds[i]?0:(plain[i]+k[a++%q])%A;assert(c===C[i],"exact replay")}
  assert(plain.filter(x=>x===p).length===score,"score replay");
  return {score,start:r,end,holds:holds.filter(Boolean).length,key:Array.from(k),hist:Array.from({length:A},(_,j)=>plain.filter(x=>x===j).length),plain}
 }
 function table(C,q,p,sub,A=29){
  const f=make(C,q,p,sub,A),T=new Int16Array(A**sub.length),K=new Int8Array(sub.length);
  let best=NEG,bestK=null,legal=0;
  for(let id=0;id<T.length;id++){let x=id;for(let j=K.length-1;j>=0;j--){K[j]=x%A;x=Math.floor(x/A)}
   const v=f(K);T[id]=v;if(v>=0)legal++;if(v>best){best=v;bestK=Array.from(K)}
  }
  return {T,best,bestK,legal}
 }
 function quad(C,q,p,sub,A=29){
  const triples=sub.map((_,i)=>sub.filter((_,j)=>i!==j)),maps=new Map();
  const Ts=triples.map(s=>{const k=s.map(x=>(x-s[0]+q)%q).join(",");if(!maps.has(k))maps.set(k,table(C,q,p,s,A));return maps.get(k).T});
  const f=make(C,q,p,sub,A),K=new Int8Array(4);let best=NEG,bestK=null,checked=0,skip=0,infeasible=0;
  // Each phase appears in three of the four triple factors. All are
  // necessary relaxations of the same four-phase path/key, so sum/3 is sound.
  const bins=Array.from({length:C.length+1},()=>[]);
  for(let id=0;id<A**4;id++){let x=id;for(let j=3;j>=0;j--){K[j]=x%A;x=Math.floor(x/A)}
   let u=0;for(let i=0;i<4;i++){let k=0;for(let j=0;j<4;j++)if(i!==j)k=k*A+K[j];const v=Ts[i][k];if(v<0){u=NEG;break}u+=v}
   if(u<0){infeasible++;continue}bins[Math.floor(u/3)].push(id)
  }
  let maxUB=NEG;
  for(let upper=bins.length-1;upper>=0;upper--){if(!bins[upper].length)continue;if(maxUB<0)maxUB=upper;
   for(const id of bins[upper]){if(upper<=best){skip++;continue}
    let x=id;for(let j=3;j>=0;j--){K[j]=x%A;x=Math.floor(x/A)}
    const v=f(K);checked++;if(v>best){best=v;bestK=Array.from(K)}
   }
  }
  assert(checked+skip+infeasible===A**4,"complete quad enumeration");
  assert(direct(C,q,p,sub,bestK,A)===best,"quad maximizing witness");
  return {best,bestK,checked,skip,infeasible,maxUB,triples:[...maps.entries()].map(([shape,{best,legal}])=>({shape,best,legal}))}
 }
 // Independent brute-force on every small key and every legal zero mask.
 let seed=0x442888;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function brute(C,q,p,sub,keys,A){
  const K=new Int8Array(q).fill(-1);sub.forEach((x,i)=>K[x]=keys[i]);
  let best=NEG;function visit(i,r,n){if(i===C.length){best=Math.max(best,n);return}
   const c=C[i];if(c===0)visit(i+1,r,n);
   if(K[r]!==c)visit(i+1,(r+1)%q,n+ +(K[r]>=0&&(c-K[r]+A)%A===p))
  }for(let r=0;r<q;r++)visit(0,r,0);return best
 }
 let toyKeys=0,toyQuad=0;
 for(let t=0;t<18;t++){
  const A=5,q=3+t%3,p=1+rng()%(A-1),v=Array.from({length:11},()=>rng()%A),sub=Array.from({length:t%2?q:2},(_,j)=>j);
  const f=make(v,q,p,sub,A),keys=new Int8Array(sub.length);
  for(let id=0;id<A**sub.length;id++){let x=id;for(let j=keys.length-1;j>=0;j--){keys[j]=x%A;x=Math.floor(x/A)}
   const b=brute(v,q,p,sub,keys,A);assert(f(keys)===b&&direct(v,q,p,sub,keys,A)===b,"toy exact DP mismatch");toyKeys++
  }
  if(q>=4){const s=[0,1,2,3];assert(quad(v,q,p,s,A).best===table(v,q,p,s,A).best,"toy exact quad");toyQuad++}
 }
 const E=gp.translit.indexOf("E");assert(E===18,"E rune");
 const r8=table(C,8,E,[0,2,4]),r13=quad(C,13,E,[0,2,4,6]);
 const results=[{q:8,sub:[0,2,4],best:r8.best,bestK:r8.bestK,legal:r8.legal,bound:Math.floor(8*r8.best/3)},
 {q:13,sub:[0,2,4,6],...r13,bound:Math.floor(13*r13.best/4)}];
 assert(direct(C,8,E,[0,2,4],r8.bestK)===r8.best,"triple maximizing witness");
 const map=new Map(gp.runes.map((s,i)=>[s,i])),tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function donor(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));assert(t,"donor token");out.push(t.i);w=w.slice(t.s.length)}}return out}
 function body(s,start,end){const a=s.indexOf(start),b=s.indexOf(end);assert(a>=0&&b>a,"donor bounds");return s.slice(a,b)}
 const donors=[["Gibran",donor(body(rawG,"Almustafa, the{7} chosen","End of the Project Gutenberg EBook of The Prophet"))],["Shakespeare",donor(rawS)],["Emerson",donor(body(rawE,"THERE is one mind","*** END OF THIS PROJECT GUTENBERG EBOOK"))]];
 const references=donors.map(([name,v])=>{
  const windows=Array.from({length:32},(_,i)=>{const start=Math.round(i*(v.length-C.length)/31),x=v.slice(start,start+C.length);return {start,E:x.filter(x=>x===18).length,F:x.filter(x=>x===0).length}});
  let e=0,f=0,minE=Infinity,maxE=0,counts=[0,0],eligible=0;
  for(let i=0;i<v.length;i++){e+= +(v[i]===18);f+= +(v[i]===0);if(i>=C.length){e-= +(v[i-C.length]===18);f-= +(v[i-C.length]===0)}
   if(i>=C.length-1){minE=Math.min(minE,e);maxE=Math.max(maxE,e);eligible+= +(f<=125);results.forEach((r,j)=>counts[j]+= +(f<=125&&e<=r.bound))}
  }
  return {name,length:v.length,windows,fixedSurvive:results.map(r=>windows.filter(w=>w.F<=125&&w.E<=r.bound).length),allSliding:{n:v.length-C.length+1,minE,maxE,eligibleF:eligible,survive:counts}}
 });
 const sections=native.sections.map(s=>({name:s.name,P:Array.from(s.source_text).filter(x=>map.has(x)).map(x=>map.get(x))}));
 const P=sections.flatMap(s=>s.P);const controls=[];
 for(const r of results){
  // Actual native rune text (not target ciphertext), with unknown F histories
  // and planted independent periodic keys. Conditional subset scores are exact.
  for(const name of ["0_welcome","0_koan_1","p56_an_end"]){
   const v=sections.find(s=>s.name===name).P,K=Array.from({length:r.q},()=>rng()%29),start=rng()%r.q;let j=start;const c=v.map(x=>x===0?0:(x+K[j++%r.q])%29);
   const actual=v.filter(x=>x===E).length,subscores=[];
   for(let t=0;t<r.q;t++){const s=r.sub.map(x=>(x+t)%r.q),keys=s.map(x=>K[x]);const a=make(c,r.q,E,s)(keys);assert(a===direct(c,r.q,E,s,keys),"native subset direct DP");subscores.push(a)}
   const bound=Math.floor(subscores.reduce((n,x)=>n+x,0)/r.sub.length);assert(actual<=bound,"native plant cover lost");
   const w=direct(c,r.q,E,Array.from({length:r.q},(_,j)=>j),K,29,true);assert(w.score>=actual,"native full-key control");
   controls.push({q:r.q,name,n:v.length,actual,bound,maxFixedKey:w.score,holds:w.holds,cipherF:c.filter(x=>!x).length,key:K,start})
  }
 }
 const lower=[direct(C,8,E,Array.from({length:8},(_,i)=>i),Array(8).fill(0),29,true),direct(C,13,E,Array.from({length:13},(_,i)=>i),[14,0,21,7,0,0,6,0,0,0,0,8,0],29,true)];
 // Full-key witnesses show legal paths exist; they are not native plaintext.
 return {n:C.length,F:125,hash,native:{n:P.length,E:P.filter(x=>x===18).length,F:P.filter(x=>x===0).length},toyKeys,toyQuad,results,references,controls,lower};
}
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
