'use strict';
// Exact GF29 affine hyperplane slicing. Input and graph construction reused from Agent18's corrected common-key SFT.
function experiment(src,lex,fix,raw){
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
 function support(g,v,es,cache){for(const id of es){let t=cache[id];if(!t){const j=id%Q,p=Math.floor(id/Q)%N,c=Math.floor(id/(Q*N)),s=mod(v.o[p]+v.k[j]-v.o[c]),a=g.r[c],b=g.r[p];t=(a===b?s===0:!(rot(v.m[a],s)&v.m[b]))?1:-1;cache[id]=t;}if(t<0)return false;}return true;}
 function whole(g,v,es){let r=g.r.slice(),o=v.o.slice(),m=v.m.slice();for(const id of es){const j=id%Q,p=Math.floor(id/Q)%N,c=Math.floor(id/(Q*N)),s=mod(o[p]+v.k[j]-o[c]),a=r[c],b=r[p];if(a===b){if(s)return false;continue;}const mm=rot(m[a],s);if(mm&m[b])return false;for(let x=0;x<N;x++)if(r[x]===a){r[x]=b;o[x]=mod(o[x]+s);}m[b]|=mm;m[a]=0;}return true;}

 function keysFromSlice(g){const p=prepare(g),a=sliceKeys(g,p),out=[];for(let w=0;w<a.bits.length;w++){let z=a.bits[w];while(z){const bit=z&-z;z^=bit;let id=w*32+31-Math.clz32(bit),q=id,x=Array(p.d);for(let j=p.d-1;j>=0;j--){x[j]=q%29;q=Math.floor(q/29);}const k=p.keyForms.map(f=>value(f,x)),o=p.forms.map(f=>value(f,x)),m=Array(N).fill(0);for(let j=0;j<N;j++)m[g.r[j]]|=1<<o[j];out.push({id,k,o,m});}}return out;}
 function trie(words){const root={ch:new Map(),end:false};for(const w of words){let x=root;for(const c of w){const p=SYM.indexOf(c);if(!x.ch.has(p))x.ch.set(p,{ch:new Map(),end:false});x=x.ch.get(p);}x.end=true;}return root;}
 const tries=by.map(trie);
 function wordTrie(g,v,c,t,stats){
  const glyph=Array.from(c,x=>SYM.indexOf(x)),k=v.k,r=g.r.slice(),o=v.o.slice(),m=v.m.slice();
  function rec(node,i,j){stats.trieNodes++;if(i===glyph.length)return node.end;const x=glyph[i],rc=r[x],want=mod(o[x]-k[j]),own=m[rc]&(1<<want);
   if(x===0&&node.ch.has(0)&&rec(node.ch.get(0),i+1,j))return true;
   if(own){for(let p=1;p<N;p++)if(r[p]===rc&&o[p]===want){const next=node.ch.get(p);return !!next&&rec(next,i+1,(j+1)%Q);}return false;}
   for(const [p,next] of node.ch){if(!p||r[p]===rc)continue;const rp=r[p],shift=mod(o[p]+k[j]-o[x]),mm=rot(m[rc],shift);if(mm&m[rp])continue;
    const old=m[rp],changed=[];for(let z=0;z<N;z++)if(r[z]===rc){r[z]=rp;o[z]=mod(o[z]+shift);changed.push(z);}m[rp]|=mm;
    const ok=rec(next,i+1,(j+1)%Q);for(const z of changed){r[z]=rc;o[z]=mod(o[z]-shift);}m[rp]=old;if(ok)return true;
   }return false;
  }for(let j=0;j<Q;j++)if(rec(t,0,j))return true;return false;
 }
 const ds=train.map(c=>domains(c,by[c.length])),carryOpts=domains(carry,prefixes,true),seeds=carryOpts.map(e=>extend(initial(),e)).filter(Boolean);
 const order=train.map((w,i)=>i).sort((i,j)=>train[j].length-train[i].length||i-j);
 const original=[];
 for(const s of raw.original.filter(s=>s.keys>0&&s.keys<=8192)){
  let g=seeds[s.detail.si];for(const [q,id] of s.detail.chosen){g=extend(g,ds[q][id]);check(g,"branch");}
  const keys=keysFromSlice(g),stats={trieNodes:0,wordTests:0,keys:keys.length},t=Date.now(),survivors=[];
  for(const v of keys){let miss=0;for(const q of order){stats.wordTests++;if(!wordTrie(g,v,train[q],tries[train[q].length],stats)&&++miss>3)break;}if(miss<=3)survivors.push(v.id);}
  const trieMs=Date.now()-t;
  let scalarTests=0;const start=Date.now();for(const v of keys.slice(0,Math.min(16,keys.length))){const cache=new Int8Array(N*N*Q);for(const q of order){const a=wordTrie(g,v,train[q],tries[train[q].length],{trieNodes:0});const b=ds[q].some(es=>support(g,v,es,cache)&&whole(g,v,es));check(a===b,"trie support mismatch "+q);scalarTests++;}}
  original.push({detail:s.detail,d:s.d,...stats,survivors:survivors.length,trieMs,scalarTests,scalarMs:Date.now()-start});
 }
 function perm(){let p=Array.from({length:N},(_,i)=>i);for(let i=N-1;i>1;i--){let j=1+rnd(i);[p[i],p[j]]=[p[j],p[i]];}return p;}
 function enc(w,p,k,j){let s="";for(const ch of w){let x=SYM.indexOf(ch);if(!x){s+="0";continue;}s+=SYM[p.indexOf(mod(p[x]+k[j]))];j=(j+1)%Q;}return s;}
 const plants=[];
 for(let t=0;t<4;t++){const p=perm(),k=[1,...Array.from({length:7},()=>rnd(N))];if(k.slice(0,4).every((x,j)=>x===k[j+4]))k[4]=mod(k[4]+1);const w=by[11].find(w=>w[0]!=="0"),cp=enc(w,p,k,0).slice(0,10);let g=extend(initial(),option(cp,w.slice(0,10),0));check(g,"plant carry");let plain=train.map(c=>by[c.length][rnd(by[c.length].length)]),starts=plain.map(()=>rnd(Q)),cipher=plain.map((w,i)=>enc(w,p,k,starts[i]));let joins=0;
  for(const q of order){if(dim(g)<=3)break;g=extend(g,option(cipher[q],plain[q],starts[q]));check(g,"plant join");joins++;}
  const keys=keysFromSlice(g),trueKey=keys.find(v=>v.k.every((x,j)=>x===k[j]));check(trueKey,"true key lost");const stats={trieNodes:0,wordTests:0},start=Date.now();let survivors=0;for(const v of keys){let miss=0;for(const q of order){stats.wordTests++;if(!wordTrie(g,v,cipher[q],tries[cipher[q].length],stats)&&++miss>3)break;}if(miss<=3)survivors++;}
  for(const q of order)check(wordTrie(g,trueKey,cipher[q],tries[cipher[q].length],stats),"true word unsupported");
  plants.push({d:dim(g),keys:keys.length,survivors,joins,ms:Date.now()-start,...stats,trueKeyRetained:true});
 }
 return {schema:"gp29-numeric-trie-gate-v1",original,plants,scope:"Exact same-key local word compatibility, <=3 OOV. Sparse original graph states from prior fixed sample, no p55. Not global permutation consistency."};
}

const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
console.log(JSON.stringify(experiment(JSON.parse(read('resources/liber-primus/lp2-page-groups-54-55-derived.json')),read('resources/control/english_wordfreq_textblob.txt'),JSON.parse(read('im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json')),JSON.parse(read('im-results/lp2-gp29-affine-hyperplane-slice-output.json'))),null,2));
