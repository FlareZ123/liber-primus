'use strict';
// Exact GF29 affine hyperplane slicing. Input and graph construction reused from Agent18's corrected common-key SFT.
function experiment(src,lex,fix){
 const N=29,Q=8,ALL=(1<<29)-1,SYM="0123456789abcdefghijklmnopqrs",A=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"],mod=x=>(x%N+N)%N,inv=Array.from({length:N},(_,x)=>Array.from({length:N},(_,y)=>y).find(y=>x*y%N===1)||0),rot=(m,t)=>t?((m<<t)|(m>>>(N-t)))&ALL:m;
 let rng=0x1827226;function rnd(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n;}
 const check=(x,msg)=>{if(!x)throw Error(msg);};
 const dict=new Set();for(const line of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)\s*$/.exec(line);if(!m)continue;const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function rec(i,w){if(i===s.length){dict.add(w);return;}for(let n=1;n<=3&&i+n<=s.length;n++){const t=s.slice(i,i+n),a=n===3?(t==="ING"?21:-1):A.indexOf(t);if(a>=0)rec(i+n,w+SYM[a]);}}rec(0,"");}
 check(dict.size===38910,"dictionary "+dict.size);for(const w of fix.added.split(/\s+/))dict.add(w);check(dict.size===38938,"expanded dictionary");
 const by=Array.from({length:60},()=>[]);for(const w of dict)by[w.length].push(w);for(const b of by)b.sort();
 const prefixes=[...new Set(by[11].map(w=>w.slice(0,10)))].sort();
 const source=src.p54.body_groups,train=source.slice(0,-1),carry=source.at(-1);check(train.length===47&&train.join("").length===213&&carry.length===10,"physical split");
 const zero=()=>Array(Q).fill(0),sub=(a,b)=>a.map((x,i)=>mod(x-b[i])),add=(a,b)=>a.map((x,i)=>mod(x+b[i])),unit=j=>{let a=zero();a[j]=1;return a;};
 function initial(){return {r:Array.from({length:N},(_,i)=>i),off:Array.from({length:N},zero),rows:Array(Q).fill(null)};}
 function reduce(a,rows){a=a.slice();for(let j=1;j<Q;j++)if(rows[j]&&a[j]){const t=a[j];a=a.map((x,i)=>mod(x-t*rows[j][i]));}return a;}
 function impose(g,a){a=reduce(a,g.rows);let j=1;while(j<Q&&!a[j])j++;if(j===Q)return a[0]===0;a=a.map(x=>mod(x*inv[a[j]]));for(let i=1;i<Q;i++)if(g.rows[i]&&g.rows[i][j]){const t=g.rows[i][j];g.rows[i]=g.rows[i].map((x,h)=>mod(x-t*a[h]));}g.rows[j]=a;return true;}
 const dim=g=>g.rows.slice(1).filter(x=>!x).length;
 function extend(base,es){let g={r:base.r.slice(),off:base.off.map(x=>x.slice()),rows:base.rows.map(x=>x&&x.slice())};for(const id of es){const j=id%Q,p=Math.floor(id/Q)%N,c=Math.floor(id/(Q*N)),rc=g.r[c],rp=g.r[p],s=sub(add(g.off[p],unit(j)),g.off[c]);if(rc===rp){if(!impose(g,s))return null;}else{let nc=0,np=0;for(const x of g.r){nc+=+(x===rc);np+=+(x===rp);}if(nc<=np){for(let x=0;x<N;x++)if(g.r[x]===rc){g.r[x]=rp;g.off[x]=add(g.off[x],s);}}else{for(let x=0;x<N;x++)if(g.r[x]===rp){g.r[x]=rc;g.off[x]=sub(g.off[x],s);}}}}
 const v=g.off.map(x=>reduce(x,g.rows).join(","));for(let x=0;x<N;x++)for(let y=0;y<x;y++)if(g.r[x]===g.r[y]&&v[x]===v[y])return null;
 if(Array.from({length:4},(_,j)=>reduce(sub(unit(j),unit(j+4)),g.rows).every(x=>!x)).every(Boolean))return null;return g;}
 function option(c,w,start){let e=[],j=start;for(let i=0;i<w.length;i++){let p=SYM.indexOf(w[i]),x=SYM.indexOf(c[i]);if(!p){if(x)return null;continue;}if(j===0&&p===x)return null;e.push((x*N+p)*Q+j);j=(j+1)%Q;}return e;}
 function domains(c,words,canonical=false){let out=[],seen=new Set();for(const w of words){let first=-1,n=0;if(canonical)for(let i=0;i<w.length;i++){let p=SYM.indexOf(w[i]);if(!p)continue;if(w[i]!==c[i]){first=mod(-n)%Q;first=(Q-n%Q)%Q;break;}n++;}for(let j=0;j<Q;j++){if(first>=0&&first!==j)continue;const e=option(c,w,j);if(e){const id=[...new Set(e)].sort((a,b)=>a-b).join(",");if(!seen.has(id)){seen.add(id);out.push(e);}}}}return out;}

 // New exact finite-field union-of-hyperplanes enumeration.
 function freeVars(g){return Array.from({length:7},(_,i)=>i+1).filter(j=>!g.rows[j]);}
 function affine(g){const free=freeVars(g);return {free,forms:g.off.map(v=>{const r=reduce(v,g.rows);return [r[0],...free.map(j=>r[j])]}),keyForms:Array.from({length:Q},(_,j)=>{const r=reduce(unit(j),g.rows);return [r[0],...free.map(i=>r[i])]})};}
 function value(a,x){let t=a[0];for(let i=0;i<x.length;i++)t+=a[i+1]*x[i];return t%N;}
 function primitive(keyForms,x){return keyForms.slice(0,4).some((a,j)=>value(a,x)!==value(keyForms[j+4],x));}
 function prepare(g){const {free,forms,keyForms}=affine(g),d=free.length,cons=[];let impossible=false;
  for(let i=0;i<N;i++)for(let j=0;j<i;j++)if(g.r[i]===g.r[j]){const v=sub(forms[i],forms[j]);if(!v.slice(1).some(Boolean)){if(!v[0])impossible=true;}else cons.push(v);}
  return {free,forms,keyForms,d,cons,impossible};
 }
 function buckets(p,order){const d=p.d,maps=Array.from({length:d},()=>new Map());
  for(const v of p.cons){let j=d-1;while(j>=0&&!v[order[j]+1])j--;check(j>=0,"constraint without variable");const m=inv[v[order[j]+1]],a=order.slice(0,j).map(i=>mod(-v[i+1]*m)),b=mod(-v[0]*m),id=a.join(",");let x=maps[j].get(id);if(!x){x={a,mask:0};maps[j].set(id,x);}x.mask|=1<<b;}
  return maps.map(m=>[...m.values()]);
 }
 function chooseOrder(p){let order=Array.from({length:p.d},(_,i)=>i),best=order.slice(),score=Infinity,bb=null;
  function visit(i){if(i===order.length){const b=buckets(p,order),s=b.reduce((z,v,j)=>z+v.length*29**j,0);if(s<score){score=s;best=order.slice();bb=b;}return;}for(let j=i;j<order.length;j++){[order[i],order[j]]=[order[j],order[i]];visit(i+1);[order[i],order[j]]=[order[j],order[i]];}}
  visit(0);return {order:best,groups:bb,score};
 }
 function keyId(x){let z=0;for(const v of x)z=z*N+v;return z;}
 function sliceKeys(g,p){const t=Date.now(),bits=new Uint32Array(Math.ceil(N**p.d/32)),x=Array(p.d).fill(0),y=Array(p.d).fill(0),stats={prefix:0,rotations:0,leaves:0,count:0,zeroMasks:0};if(p.impossible)return {bits,stats,ms:Date.now()-t,order:[],groupCounts:[]};
  const {order,groups}=chooseOrder(p);
  function dfs(j){if(j===p.d){stats.leaves++;if(primitive(p.keyForms,x)){const id=keyId(x);bits[id>>>5]|=1<<(id&31);stats.count++;}return;}
   stats.prefix++;let forbidden=0;
   for(const q of groups[j]){let t=0;for(let i=0;i<j;i++)t+=q.a[i]*y[i];forbidden|=rot(q.mask,t%N);stats.rotations++;if(forbidden===ALL)break;}
   let m=ALL&~forbidden;if(!m){stats.zeroMasks++;return;}while(m){const bit=m&-m,v=31-Math.clz32(bit);m^=bit;y[j]=v;x[order[j]]=v;dfs(j+1);}
  }
  dfs(0);return {bits,stats,ms:Date.now()-t,order,groupCounts:groups.map(x=>x.length)};
 }
 function bruteKeys(g,p){const t=Date.now(),bits=new Uint32Array(Math.ceil(N**p.d/32)),x=Array(p.d).fill(0),m=new Uint32Array(N);let count=0,tests=0;
  if(p.impossible)return {bits,count,tests,ms:Date.now()-t};
  function dfs(j){if(j<p.d){for(let v=0;v<N;v++){x[j]=v;dfs(j+1);}return;}tests++;m.fill(0);for(let i=0;i<N;i++){const z=1<<value(p.forms[i],x);if(m[g.r[i]]&z)return;m[g.r[i]]|=z;}if(!primitive(p.keyForms,x))return;const id=keyId(x);bits[id>>>5]|=1<<(id&31);count++;}
  dfs(0);return {bits,count,tests,ms:Date.now()-t};
 }
 function compare(g,kind,detail){const p=prepare(g),a=sliceKeys(g,p),b=bruteKeys(g,p);check(a.bits.length===b.bits.length&&a.bits.every((x,i)=>x===b.bits[i]),"exact key set mismatch");return {kind,detail,d:p.d,components:new Set(g.r).size,largest:Math.max(...Array.from({length:N},(_,i)=>g.r.filter(r=>r===i).length)),constraints:p.cons.length,order:a.order,groups:a.groupCounts,keys:a.stats.count,bruteTests:b.tests,bruteMs:b.ms,sliceMs:a.ms,...a.stats};}
 const ds=train.map(c=>domains(c,by[c.length])),carryOpts=domains(carry,prefixes,true),seeds=carryOpts.map(e=>extend(initial(),e)).filter(Boolean);
 check(seeds.length===93,"carry seed count");
 const long=train.map((w,i)=>({i,n:w.length})).sort((a,b)=>b.n-a.n||a.i-b.i).slice(0,12).map(x=>x.i);
 const sampled=[],seen=new Set(),target={2:4,3:6,4:6},counts={2:0,3:0,4:0};
 function save(g,detail){const d=dim(g);if(!target[d]||counts[d]>=target[d])return;const sig=JSON.stringify([g.r,g.off,g.rows]);if(seen.has(sig))return;seen.add(sig);sampled.push({g,detail});counts[d]++;}
 for(let t=0;t<180&&Object.keys(target).some(d=>counts[d]<target[d]);t++){let si=rnd(seeds.length),g=seeds[si],chosen=[],used=new Set();save(g,{si,chosen:chosen.slice()});for(let step=0;step<6&&dim(g)>1;step++){const choices=long.filter(i=>!used.has(i));if(!choices.length)break;const q=choices[rnd(choices.length)];used.add(q);let candidates=[];for(let z=0;z<100;z++){const id=rnd(ds[q].length),h=extend(g,ds[q][id]);if(h)candidates.push({g:h,id});}
   if(!candidates.length)break;const wish=[4,3,2].find(d=>counts[d]<target[d]),x=candidates.find(x=>dim(x.g)===wish)||candidates[rnd(candidates.length)];g=x.g;chosen.push([q,x.id]);save(g,{si,chosen:chosen.slice()});
 }}
 const original=sampled.map(x=>compare(x.g,"original",x.detail));
 function perm(){let p=Array.from({length:N},(_,i)=>i);for(let i=N-1;i>1;i--){let j=1+rnd(i);[p[i],p[j]]=[p[j],p[i]];}return p;}
 function enc(w,p,k,j){let s="";for(const ch of w){let x=SYM.indexOf(ch);if(!x){s+="0";continue;}s+=SYM[p.indexOf(mod(p[x]+k[j]))];j=(j+1)%Q;}return s;}
 const plants=[];
 for(let t=0;t<6;t++){const p=perm(),k=[1,...Array.from({length:7},()=>rnd(N))];if(k.slice(0,4).every((x,j)=>x===k[j+4]))k[4]=mod(k[4]+1);const w=by[11].find(w=>w[0]!=="0"),cp=enc(w,p,k,0).slice(0,10);let g=extend(initial(),option(cp,w.slice(0,10),0));check(g,"plant carry");let joins=0;
  for(const q of long){if(dim(g)<=4)break;const plain=by[train[q].length][rnd(by[train[q].length].length)],j=rnd(Q),c=enc(plain,p,k,j);g=extend(g,option(c,plain,j));check(g,"plant join");joins++;}
  const a=prepare(g);check(a.d<=4,"plant dimension");const r=sliceKeys(g,a),id=keyId(a.free.map(j=>k[j]));check(r.bits[id>>>5]&(1<<(id&31)),"planted key lost");plants.push({...compare(g,"plant",{t,joins}),trueKeyRetained:true});
 }
 return {schema:"gp29-affine-hyperplane-slice-v1",carrySeeds:seeds.length,original,plants,counts,scope:"Original graph states sampled deterministically from corrected p54 mandatory carry and long-group options. No p55 holdout used. Exact collision-free key domain only; no global component packing or lexical exhaustion."};
}

const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
console.log(JSON.stringify(experiment(JSON.parse(read('resources/liber-primus/lp2-page-groups-54-55-derived.json')),read('resources/control/english_wordfreq_textblob.txt'),JSON.parse(read('im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json'))),null,2));
