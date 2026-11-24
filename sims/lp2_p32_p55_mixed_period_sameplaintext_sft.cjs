"use strict";
// Read-only p32/p55 mixed-period exact inverse and phase-bijection relaxation.
// Corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; native-control blob 1b064ef6d85819b7d96adaff31a82d1ec551598f.
function run(corpus,gold){
  const mod=x=>(x%29+29)%29,check=(x,msg)=>{if(!x)throw Error(msg)};
  const page=n=>corpus.pages.find(x=>x.page===n).indices;
  const A=page(32),B=page(55);check(A.length===121&&B.length===76,"source lengths");
  function masks(a,b){const z=a.map((v,i)=>v===0&&b[i]===0?i:-1).filter(i=>i>=0);return Array.from({length:2**z.length},(_,m)=>new Set(z.filter((_,j)=>m&(1<<j))));}
  function rows(a,b,qa,qb,h){let t=0;return a.flatMap((x,i)=>h.has(i)?[]:[{i,x,y:b[i],u:t%qa,v:qa+t++%qb}]);}
  function witness(a,b,qa,qb,h,p,mode){
    const maps=Array.from({length:qa+qb},()=>new Map());
    for(let i=0;i<p.length;i++)if(h.has(i)!==(p[i]===0)||h.has(i)&&(a[i]!==0||b[i]!==0))return false;
    for(const {i,u,v,x,y} of rows(a,b,qa,qb,h))for(const [k,c] of [[u,x],[v,y]]){const m=maps[k];if(m.has(p[i])&&m.get(p[i])!==c)return false;m.set(p[i],c);}
    return maps.every(m=>mode==="additive"?new Set([...m].map(([p,c])=>mod(c-p))).size<=1:new Set(m.values()).size===m.size);
  }
  function additive(a,b,qa,qb,h){
    const r=rows(a,b,qa,qb,h),n=qa+qb,adj=Array.from({length:n},()=>[]);
    for(const {u,v,x,y} of r){const d=mod(x-y);adj[u].push([v,mod(-d)]);adj[v].push([u,d]);}
    const val=Array(n).fill(null),comp=Array(n).fill(-1),allowed=[];
    for(let s=0;s<n;s++){if(val[s]!==null)continue;const k=allowed.length;allowed.push(new Set(Array.from({length:29},(_,i)=>i)));val[s]=0;comp[s]=k;const q=[s];for(let i=0;i<q.length;i++){const u=q[i];for(const [v,d] of adj[u]){const w=mod(val[u]+d);if(val[v]===null){val[v]=w;comp[v]=k;q.push(v);}else if(val[v]!==w)return {ok:false,reason:"cycle"};}}}
    for(const {u,x} of r)allowed[comp[u]].delete(mod(x-val[u]));
    if(allowed.some(x=>!x.size))return {ok:false,reason:"zero"};
    const gauge=allowed.map(x=>[...x]),decode=g=>{const p=Array(a.length).fill(0);for(const {i,u,x} of r)p[i]=mod(x-val[u]-g[comp[u]]);check(witness(a,b,qa,qb,h,p,"additive"),"additive replay");return p;};
    return {ok:true,components:gauge.length,count:gauge.reduce((p,x)=>p*BigInt(x.length),1n).toString(),texts:gauge.length===1?gauge[0].map(g=>decode([g])):[],representative:decode(gauge.map(x=>x[0]))};
  }
  function permutation(a,b,qa,qb,h){
    const r=rows(a,b,qa,qb,h),parent=Array.from({length:r.length},(_,i)=>i);
    function root(i){while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;}
    function join(i,j){parent[root(i)]=root(j);}
    const groups=Array.from({length:qa+qb},()=>new Map());
    r.forEach(({u,v,x,y},i)=>{for(const [phase,c] of [[u,x],[v,y]]){const g=groups[phase];if(g.has(c))join(i,g.get(c));else g.set(c,i);}});
    const adj=new Map([...new Set(r.map((_,i)=>root(i)))].map(i=>[i,new Set()]));
    for(const g of groups){const s=[...g.values()].map(root);if(new Set(s).size!==s.length)return {ok:false,reason:"bijection"};for(const u of s)for(const v of s)if(u!==v)adj.get(u).add(v);}
    const colors=new Map();
    while(colors.size<adj.size){let best=-1,bs=-1,bd=-1;for(const [u,neighbors] of adj){if(colors.has(u))continue;const sat=new Set([...neighbors].filter(v=>colors.has(v)).map(v=>colors.get(v))).size;if(sat>bs||(sat===bs&&neighbors.size>bd)){best=u;bs=sat;bd=neighbors.size;}}
      const banned=new Set([...adj.get(best)].filter(v=>colors.has(v)).map(v=>colors.get(v)));let c=1;while(banned.has(c))c++;if(c>28)return {ok:null,reason:"coloring unresolved"};colors.set(best,c);}
    const p=Array(a.length).fill(0);r.forEach(({i},j)=>p[i]=colors.get(root(j)));
    check(witness(a,b,qa,qb,h,p,"permutation"),"permutation replay");
    const k=Math.max(0,...colors.values());let bound=1n;for(let i=0;i<k;i++)bound*=BigInt(28-i);
    return {ok:true,components:adj.size,colors:k,plaintextRelabelLowerBound:bound.toString(),representative:p};
  }
  function scan(A,B,qa,qb,mode,withPrefix=false){
    const solve=mode==="additive"?additive:permutation;let states=0,bestPrefix=0,unresolved=0;const surviving=[],reasons={};
    for(let off=0;off<=A.length-B.length;off++){const a=A.slice(off,off+B.length);for(const h of masks(a,B)){states++;const r=solve(a,B,qa,qb,h);if(r.ok===true){surviving.push({off,holds:[...h],...r});}else if(r.ok===null)unresolved++;else{reasons[r.reason]=(reasons[r.reason]||0)+1;if(withPrefix){let lo=0,hi=B.length;while(hi-lo>1){const mid=(lo+hi)>>1;const q=solve(a.slice(0,mid),B.slice(0,mid),qa,qb,h);if(q.ok!==false)lo=mid;else hi=mid;}bestPrefix=Math.max(bestPrefix,lo);}}}}
    return {qa,qb,mode,placements:A.length-B.length+1,states,paths:surviving.length,distinctOffsets:new Set(surviving.map(x=>x.off)).size,unresolved,bestPrefix:surviving.length?B.length:withPrefix?bestPrefix:null,reasons,surviving};
  }
  let seed=0x14261124;
  const rnd=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n;};
  const keys=(q,mode)=>Array.from({length:q},()=>{if(mode==="additive")return rnd(29);const a=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;});
  function force(K,phase,p,mode){if(mode==="additive"){K[phase]=mod(-p);return;}const a=K[phase],j=a.indexOf(0);[a[p],a[j]]=[a[j],a[p]];}
  function enc(p,K,phase,mode){let t=phase;return p.map(x=>x===0?0:mode==="permutation"?K[t++%K.length][x]:mod(x+K[t++%K.length]));}
  const sections=["0_welcome","0_wisdom","0_koan_1","0_loss_of_divinity"];
  const controls=[];
  for(const [qa,qb] of [[8,8],[8,13],[13,8],[13,13]])for(const mode of (qa===qb?["permutation"]:["additive","permutation"]))for(const [j,name] of sections.entries()){
    const native=[...gold.sections.find(s=>s.name===name).source_text].filter(x=>corpus.runes.includes(x)).map(x=>corpus.runes.indexOf(x));
    const source=native.slice(0,121),off=5+11*j,p=source.slice(off,off+76),K=keys(qa,mode),J=keys(qb,mode),u=rnd(qa),v=rnd(qb);
    check(source.length===121&&p.length===76,"control lengths");
    const first=p.find(x=>x!==0),phase=(u+source.slice(0,off).filter(x=>x!==0).length)%qa;
    force(K,phase,first,mode);force(J,v,first,mode);
    const a=enc(source,K,u,mode),b=enc(p,J,v,mode),holds=p.map((x,i)=>x===0?i:-1).filter(i=>i>=0),firstActive=p.findIndex(x=>x!==0);
    check(a[off+firstActive]===0&&b[firstActive]===0,"forced consuming double zero");
    const result=scan(a,b,qa,qb,mode),hit=result.surviving.find(x=>x.off===off&&x.holds.join(",")===holds.join(","));
    check(hit&&witness(a.slice(off,off+76),b,qa,qb,new Set(holds),p,mode),"planted alignment absent");
    const trueInGauge=mode==="additive"?hit.texts.some(x=>x.every((v,i)=>v===p[i])):null;
    if(mode==="additive")check(hit.components===1&&trueInGauge&&result.distinctOffsets===1,"mixed additive recovery");
    controls.push({name,qa,qb,mode,off,holds:holds.length,generatedDoubleZero:true,distinctOffsets:result.distinctOffsets,trueInGauge,candidates:hit.count??null});
  }
  const original=[];
  for(const [qa,qb] of [[8,8],[8,13],[13,8],[13,13]])for(const mode of (qa===qb?["permutation"]:["additive","permutation"]))original.push(scan(A,B,qa,qb,mode,true));
  return {source:[A.length,B.length],controls,original};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,"..");const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));console.log(JSON.stringify(run(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));}
module.exports={run};
