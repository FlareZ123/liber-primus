'use strict';
// Exact spacing-free q8 F-hold MAP, additive-first then source row-rank permutation.
// The second optimization conditions on suffix ciphertext reachability only, not its language score.
function experiment(inputs){
 const [gp,grid,native]=inputs.map(JSON.parse),mod=x=>(x+29)%29,ALL=(1<<29)-1;
 const check=(x,m)=>{if(!x)throw Error(m)};
 const alphabet59=grid.alphabet.replace("f",""),v59=grid.pages.flatMap(p=>p.tokens).map(t=>59*alphabet59.indexOf(t[0])+alphabet59.indexOf(t[1]));
 const rows=Array.from({length:32},(_,r)=>Array.from({length:8},(_,i)=>i).sort((a,b)=>grid.bytes[8*r+a]-grid.bytes[8*r+b]));
 check(rows.every((r,j)=>String(r)===String(Array.from({length:8},(_,i)=>i).sort((a,b)=>v59[j*8+a]-v59[j*8+b]))),"rank agreement");
 const mp=new Map(gp.runes.map((x,i)=>[x,i])),solved=native.sections.map(s=>Array.from(s.source_text).filter(x=>mp.has(x)).map(x=>mp.get(x)));
 function mapping(n,inv){return Array.from({length:n},(_,j)=>{const r=rows[Math.floor(j/8)%32];return (j&~7)+(inv?r[j%8]:r.indexOf(j%8))})}
 function model(exclude){
  const bg=Array.from({length:29},()=>new Float64Array(29).fill(.5)),u=new Float64Array(29).fill(.5);
  solved.forEach((p,j)=>{if(j!==exclude)p.forEach((x,i)=>{u[x]++;if(i)bg[p[i-1]][x]++})});
  for(const r of bg){const sum=r.reduce((a,b)=>a+b);for(let i=0;i<29;i++)r[i]=Math.log(r[i]/sum)}
  const sum=u.reduce((a,b)=>a+b);for(let i=0;i<29;i++)u[i]=Math.log(u[i]/sum);
  return {bg,u};
 }
 function encode(p,k,phase=0){return p.map(x=>x===0?0:(x+k[phase++&7])%29)}
 function viterbi(c,key,m,start,prev){
  let states=new Map([[start*29+prev,{q:start,last:prev,score:0,p:[]}]]);
  for(const x of c){const next=new Map();
   function add(st,p,q){const score=st.score+m.bg[st.last][p],id=q*29+p,old=next.get(id);if(!old||score>old.score)next.set(id,{q,last:p,score,p:st.p.concat(p)})}
   for(const st of states.values()){if(x===0)add(st,0,st.q);const p=mod(x-key[st.q]);if(p)add(st,p,(st.q+1)&7)}
   states=next;if(!states.size)return null;
  }
  return [...states.values()].reduce((a,b)=>a.score>=b.score?a:b);
 }
 function reachable(c,k,phase){
  let mask=1<<phase;
  for(const x of c){let next=0;for(let q=0;q<8;q++)if(mask&(1<<q)){if(x===0)next|=1<<q;if(x!==k[q])next|=1<<((q+1)&7)}mask=next;if(!mask)return false}return true;
 }
 function zeros(c){const z=new Int8Array(c.length).fill(-1);let n=0;c.forEach((x,i)=>{if(!x)z[i]=n++});check(n<=20,"exact zero mask cap");return {z,n}}
 function suffixDomains(c){
  const {z,n}=zeros(c),unique=new Map();
  for(let mask=0;mask<2**n;mask++){const d=new Uint32Array(8).fill(ALL);let q=0;for(let i=0;i<c.length;i++){if(z[i]>=0&&((mask>>>z[i])&1))continue;d[q++&7]&=~(1<<c[i])}if(d.every(x=>x))unique.set(String(d),d)}
  return {count:2**n,domains:[...unique.values()]};
 }
 function fit(c,h,m){
  const n=c.length,{z,n:nz}=zeros(c),suffix=suffixDomains(h);
  let best=null,conditional=null,legalMasks=0,states=0,intersections=0,nonempty=0,conditionalOptimizations=0;
  const phase=new Int8Array(n),allowed=new Uint32Array(8);
  const u=Array.from({length:8},()=>new Float64Array(29)),e=Array.from({length:8},()=>new Float64Array(841));
  const dec=Array.from({length:29},(_,x)=>Array.from({length:29},(_,k)=>mod(x-k)));
  const asDomains=bits=>Array.from(bits,b=>{const d=[];for(let k=0;k<29;k++)if(b&(1<<k))d.push(k);return d});
  const val=new Float64Array(29),next=new Float64Array(29),back=Array.from({length:8},()=>new Int8Array(29));
  function optimize(domains,constant){
   let s=0;for(let a=1;a<8;a++)if(domains[a].length<domains[s].length)s=a;
   let best=null;
   for(const first of domains[s]){
    val.fill(-Infinity);val[first]=u[s][first];
    for(let t=1;t<8;t++){
     const a=(s+t-1)&7,b=(s+t)&7,edge=e[a];next.fill(-Infinity);
     for(const y of domains[b]){let mx=-Infinity,kbest=-1;for(const x of domains[a]){const v=val[x]+edge[x*29+y];if(v>mx){mx=v;kbest=x}}next[y]=mx+u[b][y];back[t][y]=kbest}
     val.set(next);states+=domains[a].length*domains[b].length;
    }
    const last=(s+7)&7;let mx=-Infinity,end=-1;
    for(const x of domains[last]){const v=val[x]+e[last][x*29+first];if(v>mx){mx=v;end=x}}
    const score=mx+constant;
    if(!best||score>best.score){const key=new Array(8);key[last]=end;for(let t=7;t>0;t--){const a=(s+t)&7,b=(s+t-1)&7;key[b]=back[t][key[a]]}best={score,key}}
   }
   return best;
  }
  for(let mask=0;mask<2**nz;mask++){
   allowed.fill(ALL);let q=0;
   for(let i=0;i<n;i++){if(z[i]>=0&&((mask>>>z[i])&1)){phase[i]=-1;continue}const a=q++&7;phase[i]=a;allowed[a]&=~(1<<c[i])}
   if(allowed.some(x=>!x))continue;
   legalMasks++;let constant=0;const domains=asDomains(allowed);
   for(let a=0;a<8;a++){u[a].fill(0);e[a].fill(0)}
   if(phase[0]<0)constant+=m.u[0];else for(const k of domains[phase[0]])u[phase[0]][k]+=m.u[dec[c[0]][k]];
   for(let i=1;i<n;i++){
    const a=phase[i-1],b=phase[i];
    if(a<0&&b<0){constant+=m.bg[0][0];continue}
    if(a<0){for(const k of domains[b])u[b][k]+=m.bg[0][dec[c[i]][k]];continue}
    if(b<0){for(const k of domains[a])u[a][k]+=m.bg[dec[c[i-1]][k]][0];continue}
    check(b===((a+1)&7),"cycle phase");
    const edge=e[a],d1=dec[c[i-1]],d2=dec[c[i]];
    for(const x of domains[a]){const r=m.bg[d1[x]],off=x*29;for(const y of domains[b])edge[off+y]+=r[d2[y]]}
   }
   const top=optimize(domains,constant);
   function record(x){return {...x,mask,phase:q&7,p:c.map((v,i)=>phase[i]<0?0:dec[v][x.key[phase[i]]])}}
   if(!best||top.score>best.score)best=record(top);
   if(conditional&&top.score<=conditional.score)continue; // exact prefix upper bound
   if(reachable(h,top.key,q&7)){conditional=record(top);continue}
   // For each suffix hold pattern, reachability is a Cartesian product of allowed
   // key domains. Intersect it with the prefix domains and optimize that product.
   const seen=new Set();
   for(const s of suffix.domains){
    intersections++;
    const d=new Uint32Array(8);for(let a=0;a<8;a++)d[a]=allowed[a]&s[(a-q+8*(1+Math.ceil(q/8)))&7];
    if(d.some(x=>!x))continue;nonempty++;
    const id=String(d);if(seen.has(id))continue;seen.add(id);conditionalOptimizations++;
    const r=optimize(asDomains(d),constant);
    if(!conditional||r.score>conditional.score){check(reachable(h,r.key,q&7),"conditional reachability");conditional=record(r)}
   }
  }
  check(best,"no fit");return {best,conditional,zeros:nz,masks:2**nz,legalMasks,states,suffixMasks:suffix.count,suffixUnique:suffix.domains.length,intersections,nonempty,conditionalOptimizations};
 }
 function run(label,C,inv,model,truth=null,key=null){
  const map=mapping(C.length,inv),c=map.map(i=>C[i]),r=fit(c.slice(0,256),c.slice(256),model);
  function summarize(x){
   if(!x)return null;
   check(String(encode(x.p,x.key))===String(c.slice(0,256)),"fit replay");
   const h=viterbi(c.slice(256),x.key,model,x.phase,x.p[255]);
   const out={key:x.key,mask:x.mask,phase:x.phase,score:x.score/256,fit:x.p,fitDisplay:x.p.map(x=>gp.translit[x]).join(""),correctKey:key?String(key)===String(x.key):null,correctFit:truth?x.p.filter((x,i)=>x===truth[i]).length:null,holdout:null};
   if(h){check(String(encode(x.p.concat(h.p),x.key))===String(c),"all replay");out.holdout={score:h.score/256,p:h.p,display:h.p.map(x=>gp.translit[x]).join(""),correct:truth?h.p.filter((x,i)=>x===truth[i+256]).length:null,replay:true}}
   return out;
  }
  const {best,conditional,...stats}=r;return {label,inv,...stats,best:summarize(best),conditional:summarize(conditional)};
 }
 const controls=[];
 for(const [idx,key,inv] of [[1,[23,10,1,10,9,10,16,26],false],[4,[3,17,9,22,6,1,14,10],true]]){
  const p=solved[idx].slice(0,512),c=encode(p,key),map=mapping(512,inv),C=new Array(512);map.forEach((j,i)=>C[j]=c[i]);controls.push(run(native.sections[idx].name,C,inv,model(idx),p,key));
 }
 const C=gp.pages.slice(51,54).flatMap(p=>p.indices).slice(0,512);check(C.length===512,"target length");
 const target=[false,true].map(inv=>run("p51-53",C,inv,model(-1)));
 return {method:"exact cyclic pairwise MAP; complete zero-mask enumeration; additive-first only; suffix constraint uses ciphertext reachability only",controls,target};
}
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-grid-256.json","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));