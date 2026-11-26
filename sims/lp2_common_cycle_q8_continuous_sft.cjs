"use strict";
/**
 * Continuous q8 conjugated-cycle receiver, corrected p54 black body.
 * Unknown common 29-cycle and primitive shift vector; all source C=0 hold masks.
 * No arbitrary word starts, no p55 glyph in training. Reuses the exact GF29
 * difference-graph idea from the arbitrary-start receiver with fixed clock.
 */
const fs=require("node:fs"),path=require("node:path");
const files=["resources/control/english_wordfreq_textblob.txt","im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json","resources/liber-primus/lp2-page-groups-54-55-derived.json"];
const N=29,Q=8,L=7,SYM="0123456789abcdefghijklmnopqrs",ALL=(1<<29)-1;
const A=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"],idx=new Map(A.map((x,i)=>[x,i]));
const assert=(b,s)=>{if(!b)throw Error(s)};
const mod=x=>(x%29+29)%29, val=x=>SYM.indexOf(x);
const sub=new Uint8Array(N*N),mul=new Uint8Array(N*N),inv=new Uint8Array(N);
for(let a=0;a<N;a++)for(let b=0;b<N;b++){sub[a*N+b]=mod(a-b);mul[a*N+b]=a*b%N;if(a*b%N===1)inv[a]=b;}
function dictionary(raw){
 const D=new Set();
 for(const line of raw[0].split(/\r?\n/)){const m=line.match(/^([a-z]+)\s+\d+$/);if(!m)continue;const w=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  function rec(i,s){if(i===w.length){D.add(s);return;}for(let k=1;k<=3&&i+k<=w.length;k++){const t=w.slice(i,i+k),v=k===3?(t==="ING"?21:undefined):idx.get(t);if(v!==undefined)rec(i+k,s+SYM[v]);}}rec(0,"");
 }
 assert(D.size===38910,"base dictionary "+D.size);
 const fixture=JSON.parse(raw[1]),profile=JSON.parse(raw[2]);
 for(const w of fixture.added.split(/\s+/))if(w)D.add(w);
 assert(D.size===38938,"dictionary "+D.size);
 const by=Array.from({length:60},()=>[]),pref=new Set();
 for(const w of D){by[w.length].push(w);if(w.length===11)pref.add(w.slice(0,10));}
 for(const x of by)x.sort();
 assert(profile.p54.body_groups.length===48&&profile.p54.body_groups.join("").length===223&&profile.p54.body_groups.at(-1)==="63g2eis46q","corrected source");
 return {D,by,pref:[...pref].sort(),prefixSet:pref,fixture,profile};
}
const code=(v,d)=>{let x=0;for(let i=0;i<d;i++)x=x*N+v[i];return x*N+v[L];};
function norm(v,d){
 let j=0;while(j<d&&!v[j])j++;if(j===d)return v[L]?-1:0;
 const m=inv[v[j]];let x=1;for(let i=0;i<d;i++)x=x*N+mul[v[i]*N+m];return x*N+mul[v[L]*N+m];
}
function diff(a,b){const v=new Uint8Array(Q);for(let i=0;i<Q;i++)v[i]=sub[a[i]*N+b[i]];return v;}
function edgeId(c,p,j){return (c*N+p)*Q+j;}
const edgeC=new Uint8Array(N*N*Q),edgeP=new Uint8Array(N*N*Q),edgeJ=new Uint8Array(N*N*Q);
for(let c=0;c<N;c++)for(let p=0;p<N;p++)for(let j=0;j<Q;j++){const z=edgeId(c,p,j);edgeC[z]=c;edgeP[z]=p;edgeJ[z]=j;}
class Graph{
 constructor(gauge){this.d=7;this.comps=N;this.r=Uint8Array.from({length:N},(_,i)=>i);this.sz=new Uint8Array(N).fill(1);this.off=new Uint8Array(N*Q);this.k=new Uint8Array(Q*Q);this.vars=new Uint8Array(Q);let a=0;for(let j=0;j<Q;j++){if(j===gauge)this.k[j*Q+L]=1;else{this.k[j*Q+a]=1;this.vars[a++]=j;}}}
 copy(){const g=Object.create(Graph.prototype);g.d=this.d;g.comps=this.comps;g.r=this.r.slice();g.sz=this.sz.slice();g.off=this.off.slice();g.k=this.k.slice();g.vars=this.vars.slice();return g;}
 project(v){const z=new Uint8Array(Q);for(let j=0;j<Q;j++){const f=v[j];if(!f)continue;const at=j*Q;for(let i=0;i<this.d;i++)z[i]=(z[i]+mul[f*N+this.k[at+i]])%N;z[L]=(z[L]+mul[f*N+this.k[at+L]])%N;}return z;}
 impose(v){const eq=this.project(v);let p=this.d-1;while(p>=0&&!eq[p])p--;if(p<0)return eq[L]===0;const last=this.d-1,rec=inv[eq[p]];
  for(let r=0;r<Q;r++){const at=r*Q,f=mul[this.k[at+p]*N+rec];if(f){for(let j=0;j<this.d;j++)if(j!==p)this.k[at+j]=sub[this.k[at+j]*N+mul[f*N+eq[j]]];this.k[at+L]=sub[this.k[at+L]*N+mul[f*N+eq[L]]];}if(p!==last)this.k[at+p]=this.k[at+last];this.k[at+last]=0;}
  this.vars[p]=this.vars[last];this.vars[last]=0;this.d--;return true;}
 edge(z){const c=edgeC[z],p=edgeP[z],j=edgeJ[z],rc=this.r[c],rp=this.r[p],v=new Uint8Array(Q);for(let i=0;i<Q;i++)v[i]=mod(this.off[p*Q+i]+(j===i?1:0)-this.off[c*Q+i]);
  if(rc===rp)return this.impose(v);
  if(this.sz[rc]<=this.sz[rp]){for(let x=0;x<N;x++)if(this.r[x]===rc){this.r[x]=rp;for(let i=0;i<Q;i++)this.off[x*Q+i]=(this.off[x*Q+i]+v[i])%N;}this.sz[rp]+=this.sz[rc];this.sz[rc]=0;}
  else{for(let x=0;x<N;x++)if(this.r[x]===rp){this.r[x]=rc;for(let i=0;i<Q;i++)this.off[x*Q+i]=sub[this.off[x*Q+i]*N+v[i]];}this.sz[rc]+=this.sz[rp];this.sz[rp]=0;}
  if(--this.comps===1){const s=new Uint8Array(Q);for(let x=0;x<N;x++)for(let i=0;i<Q;i++)s[i]=(s[i]+this.off[x*Q+i])%N;if(!this.impose(s))return false;}return true;
 }
 primitive(){for(let j=0;j<4;j++)for(let i=0;i<Q;i++)if(this.k[j*Q+i]!==this.k[(j+4)*Q+i])return true;return false;}
 valid(){if(!this.primitive())return false;const seen=new Set();for(let x=0;x<N;x++){const a=this.project(this.off.subarray(x*Q,(x+1)*Q)),z=this.r[x]*600000000000+code(a,this.d);if(seen.has(z))return false;seen.add(z);}return true;}
 extend(o){const g=this.copy();for(const z of o.e)if(!g.edge(z))return null;return g.valid()?g:null;}
 dim(){return this.d+this.comps-1;}
 sig(){const out=[this.d,...this.vars,...this.k],roots=new Int8Array(N).fill(-1);for(let x=0;x<N;x++){const r=this.r[x];if(roots[r]<0)roots[r]=x;out.push(roots[r],...this.project(diff(this.off.subarray(x*Q,(x+1)*Q),this.off.subarray(roots[r]*Q,(roots[r]+1)*Q))));}return String.fromCharCode(...out);}
 evaluate(param){const k=new Uint8Array(Q);for(let j=0;j<Q;j++){let s=this.k[j*Q+L];for(let i=0;i<this.d;i++)s+=param[i]*this.k[j*Q+i];k[j]=s%N;}return k;}
}
class Filter{
 constructor(g){this.g=g;this.a=Array.from({length:N},(_,x)=>g.project(g.off.subarray(x*Q,(x+1)*Q)));this.cache=new Int8Array(N*N*Q).fill(-1);this.forbidden=new Set();this.diffs=new Map();this.saturated=false;
  const dirs=new Map();
  for(let i=0;i<N;i++)for(let j=0;j<i;j++)if(g.r[i]===g.r[j]){const z=norm(diff(this.a[i],this.a[j]),g.d);if(z===0){this.saturated=true;return;}if(z<0)continue;this.forbidden.add(z);const dir=Math.floor(z/N),v=(dirs.get(dir)||0)|(1<<(z%N));dirs.set(dir,v);if(v===ALL){this.saturated=true;return;}}
 }
 allowed(z){let v=this.cache[z];if(v>=0)return !!v;const g=this.g,c=edgeC[z],p=edgeP[z],j=edgeJ[z],rc=g.r[c],rp=g.r[p],s=new Uint8Array(Q);
  for(let i=0;i<Q;i++)s[i]=mod(this.a[p][i]+g.k[j*Q+i]-this.a[c][i]);
  let ok;
  if(rc===rp){const h=norm(s,g.d);ok=h!==-1&&!this.forbidden.has(h);}
  else{const id=rp*N+rc;let set=this.diffs.get(id);if(!set){set=new Set();for(let x=0;x<N;x++)if(g.r[x]===rp)for(let y=0;y<N;y++)if(g.r[y]===rc)set.add(code(diff(this.a[x],this.a[y]),g.d));this.diffs.set(id,set);}ok=!set.has(code(s,g.d));}
  this.cache[z]=ok?1:0;return ok;
 }
 option(o){for(const z of o.e)if(!this.allowed(z))return false;return true;}
}
function scenario(groups,mask,start=0){
 let phase=start,z=0;return groups.map(w=>{const C=Array.from(w,val),J=[],H=[];for(const c of C){const hold=c===0&&!!(mask&(1<<z));if(c===0)z++;H.push(hold);J.push(hold?-1:phase);if(!hold)phase=(phase+1)&7;}return {C,J,H};});
}
function makeDomain(row,words){
 const opts=[],maps=Array.from({length:row.C.length},()=>new Map());
 for(const w of words){const e=[];let ok=true;for(let i=0;i<w.length;i++){const p=val(w[i]),c=row.C[i],j=row.J[i];if(row.H[i]){if(p!==0){ok=false;break;}continue;}if(p===0){ok=false;break;}const z=edgeId(c,p,j);
   for(const old of e)if(edgeJ[old]===j&&(((edgeC[old]===c)!==(edgeP[old]===p))||((edgeC[old]===edgeP[old])!==(c===p)))){ok=false;break;}
   if(!ok)break;e.push(z);
  }
  if(!ok)continue;const n=opts.length;opts.push({w,e});let j=0;for(let i=0;i<w.length;i++)if(!row.H[i]){const z=e[j++],m=maps[i];if(!m.has(z))m.set(z,[]);m.get(z).push(n);}
 }
 const nwords=Math.ceil(opts.length/32),post=maps.filter(m=>m.size).map(m=>[...m].map(([z,ids])=>{let bits=null;if(ids.length>=32){bits=new Uint32Array(nwords);for(const id of ids)bits[id>>>5]|=1<<(id&31);}return {z,ids,bits};}));
 return {opts,post,nwords};
}
function chooseDomain(d,f,cap,stats){
 const choices=[];for(const pos of d.post){let count=0,lists=[];for(const p of pos){stats.features++;if(!f.allowed(p.z))continue;count+=p.ids.length;lists.push(p);}if(!count)return [];choices.push({count,lists});}
 if(!choices.length)return d.opts.map((_,i)=>i).slice(0,cap);
 choices.sort((a,b)=>a.count-b.count);const out=[];
 const test=id=>{stats.options++;if(f.option(d.opts[id]))out.push(id);return out.length>=cap;};
 if(choices[0].count<=64||choices.length===1){for(const p of choices[0].lists)for(const id of p.ids)if(test(id))return out;return out;}
 function union(x,q){for(const p of q.lists){if(p.bits){for(let i=0;i<x.length;i++)x[i]|=p.bits[i];}else for(const id of p.ids)x[id>>>5]|=1<<(id&31);}}
 const bits=new Uint32Array(d.nwords),tmp=new Uint32Array(d.nwords);union(bits,choices[0]);
 for(let i=1;i<Math.min(4,choices.length);i++){if(choices[i].count===d.opts.length)continue;tmp.fill(0);union(tmp,choices[i]);let any=false;for(let j=0;j<bits.length;j++){bits[j]&=tmp[j];if(bits[j])any=true;}if(!any)return [];}
 for(let i=0;i<bits.length;i++){let b=bits[i];while(b){const l=b&-b,bit=31-Math.clz32(l);b=(b^l)>>>0;if(test(i*32+bit))return out;}}
 return out;
}
function rng(seed){let x=seed>>>0;return n=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)%n;};}
function plant(db,seed){
 const R=rng(seed),pi=Array.from({length:N},(_,i)=>i);for(let i=28;i>1;i--){const j=1+R(i);[pi[i],pi[j]]=[pi[j],pi[i]];}const ip=[];pi.forEach((v,i)=>ip[v]=i);
 const k=Array.from({length:Q},()=>R(N));k[0]=1;k[4]=2;if(seed%2===0)k[3]=0;
 const p=db.fixture.plants[seed%2].truth.split(/\s+/),groups=p.slice(0,47).concat(db.by[11][R(db.by[11].length)],p.slice(49));
 assert(groups.length===64&&groups.every(x=>db.D.has(x)),"control dictionary");
 let j=0,mask=0,z=0;const C=groups.map(w=>{let c="";for(const a of w){const p=val(a);if(p===0){if(z>=30)throw Error("too many control zeros");mask|=1<<z;z++;c+="0";}else{const v=ip[(pi[p]+k[j])%N];if(v===0)z++;c+=SYM[v];j=(j+1)&7;}}return c;});
 assert(z<30,"control zero count");
 return {pi,k,groups,C,mask,zeros:z,training:C.slice(0,47).concat(C[47].slice(0,10))};
}
function decode(row,pi,k){const ip=[];pi.forEach((v,i)=>ip[v]=i);let w="";for(let i=0;i<row.C.length;i++){if(row.H[i]){w+="0";continue;}const p=ip[mod(pi[row.C[i]]-k[row.J[i]])];if(!p)return null;w+=SYM[p];}return w;}
function makeSearch(db,groups,mask,budget=3){
 const rows=scenario(groups,mask),ds=rows.map((r,i)=>makeDomain(r,i===47?db.pref:db.by[r.C.length]));
 const order=Array.from({length:47},(_,i)=>i).sort((a,b)=>Math.log2(Math.max(1,ds[a].opts.length))/rows[a].C.length-Math.log2(Math.max(1,ds[b].opts.length))/rows[b].C.length||a-b);
 const seeds=[],seen=new Set();
 for(const o of ds[47].opts){const first=o.e.find(z=>edgeC[z]!==edgeP[z]);const gauges=first===undefined?Array.from({length:Q},(_,i)=>i).filter(j=>!o.e.some(z=>edgeJ[z]===j)):[edgeJ[first]];
  for(const j of gauges){const g=new Graph(j).extend(o);if(!g)continue;const sig=g.sig();if(!seen.has(sig)){seen.add(sig);seeds.push({g,word:o.w,gauge:j});}}
 }
 seeds.sort((a,b)=>a.g.dim()-b.g.dim()||a.g.sig().localeCompare(b.g.sig()));
 return {rows,ds,order,seeds,budget};
}
function solve(db,groups,mask,budget=3,from=0,to=Infinity,ms=15000){
 const start=Date.now(),s=makeSearch(db,groups,mask,budget),deadline=Date.now()+ms;
 const stats={nodes:0,joins:0,features:0,options:0,keyTests:0,packNodes:0,perms:0},completed=[],perSeed=[];
 let answer=null,timed=false,active=-1;
 function stop(){if(answer||timed)return true;if(Date.now()>=deadline){timed=true;return true;}return false;}
 function check(pi,k){stats.perms++;const words=s.rows.map(r=>decode(r,pi,k));if(!words[47]||!db.prefixSet.has(words[47]))return;
  const missing=words.slice(0,47).filter(w=>!w||!db.D.has(w)).length;if(missing<=budget)answer={pi:[...pi],k:[...k],words,missing};
 }
 function pack(g,k){stats.keyTests++;if(!k.slice(0,4).some((v,i)=>v!==k[i+4]))return;
  const val=new Uint8Array(N),tr=new Uint8Array(N),masks=new Uint32Array(N);
  for(let x=0;x<N;x++){let v=0;for(let j=0;j<Q;j++)v+=g.off[x*Q+j]*k[j];v%=N;val[x]=v;const b=1<<v;if(masks[g.r[x]]&b)return;masks[g.r[x]]|=b;}
  const root=g.r[0],rot=(x,d)=>d?((x<<d)|(x>>>(N-d)))&ALL:x;
  tr[root]=mod(-val[0]);const used=rot(masks[root],tr[root]),rem=[];for(let i=0;i<N;i++)if(i!==root&&masks[i])rem.push(i);
  function dfs(mask,left){if(stop())return;stats.packNodes++;if(!left.length){check(Array.from({length:N},(_,i)=>(val[i]+tr[g.r[i]])%N),k);return;}
   let pick=-1,opts=null;for(let i=0;i<left.length;i++){const r=left[i],v=[];for(let t=0;t<N;t++)if(!(mask&rot(masks[r],t)))v.push(t);if(!v.length)return;if(!opts||v.length<opts.length){pick=i;opts=v;if(v.length===1)break;}}
   const r=left[pick],next=left.filter((_,i)=>i!==pick);for(const t of opts){tr[r]=t;dfs(mask|rot(masks[r],t),next);if(stop())return;}
  }dfs(used,rem);
 }
 function enumerate(g){const param=new Uint8Array(Q);function rec(i){if(stop())return;if(i===g.d){pack(g,g.evaluate(param));return;}for(let v=0;v<N;v++){param[i]=v;rec(i+1);if(stop())return;}}rec(0);}
 function dfs(g,rem,b){if(stop())return;stats.nodes++;if(g.dim()<=3||rem.length<=b){enumerate(g);return;}
  const f=new Filter(g);if(f.saturated)return;
  let pick=-1,best=null,ntry=Math.min(rem.length,g.dim()>20?5:g.dim()>12?8:16);
  for(let i=0;i<ntry;){const d=chooseDomain(s.ds[rem[i]],f,best?best.length:Infinity,stats);
   if(!d.length){if(!b)return;b--;rem=rem.filter((_,j)=>j!==i);ntry--;if(pick>i)pick--;continue;}
   if(!best||d.length<best.length){pick=i;best=d;}i++;
  }
  if(pick<0){enumerate(g);return;}
  const id=rem[pick],next=rem.filter((_,i)=>i!==pick),seen=new Set();
  for(const i of best){if(stop())return;stats.joins++;const x=g.extend(s.ds[id].opts[i]);if(!x)continue;const sig=x.sig();if(seen.has(sig))continue;seen.add(sig);dfs(x,next,b);}
  if(b)dfs(g,next,b-1);
 }
 const end=Math.min(to,s.seeds.length);for(let i=from;i<end;i++){active=i;const before=stats.nodes;dfs(s.seeds[i].g,s.order,budget);perSeed.push({i,word:s.seeds[i].word,gauge:s.seeds[i].gauge,nodes:stats.nodes-before,completed:!timed&&!answer});if(timed||answer)break;completed.push(i);}
 return {mask,budget,from,to:end,seedCount:s.seeds.length,domains:s.ds.map(x=>x.opts.length),completed,active,timed,answer,stats,perSeed,elapsedMs:Date.now()-start};
}
function equivalent(pi,k,pj,l){for(let p=0;p<N;p++){const a=pi[p],b=pj[p];if(a*pj[1]%N!==b*pi[1]%N)return false;}for(let j=0;j<Q;j++)if(k[j]*pj[1]%N!==l[j]*pi[1]%N)return false;return true;}
function run(raw,which="original",mask=0,from=0,to=Infinity,ms=15000){
 const db=dictionary(raw);
 if(which==="original")return solve(db,db.profile.p54.body_groups,mask,3,from,to,ms);
 const p=plant(db,Number(which)),res=solve(db,p.training,p.mask,0,from,to,ms);
 if(res.answer){const a=res.answer,rows=scenario(p.C,p.mask),decoded=rows.map(r=>decode(r,a.pi,a.k));res.control={seed:Number(which),zeros:p.zeros,mask:p.mask,exactAction:equivalent(a.pi,a.k,p.pi,p.k),fitCorrect:decoded.slice(0,47).filter((w,i)=>w===p.groups[i]).length,heldCorrect:decoded.slice(47).filter((w,i)=>w===p.groups[i+47]).length,heldRunes:decoded.slice(47).reduce((n,w,i)=>n+(w===p.groups[i+47]?w.length:0),0)};}
 return res;
}
function inspect(raw,which="original",mask=0){const db=dictionary(raw),p=which==="original"?null:plant(db,Number(which)),s=makeSearch(db,p?p.training:db.profile.p54.body_groups,p?p.mask:mask,p?0:3);return {mask:p?p.mask:mask,seeds:s.seeds.length,domains:s.ds.map(x=>x.opts.length),seedWords:s.seeds.map(x=>x.word),truthIndex:p?s.seeds.findIndex(x=>x.word===p.groups[47].slice(0,10)):-1,plant:p?{zeros:p.zeros}:null};}
if(require.main===module){const a=process.argv.slice(2),raw=files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));console.log(JSON.stringify(run(raw,a[0]||"original",Number(a[1]||0),Number(a[2]||0),a[3]===undefined?Infinity:Number(a[3]),Number(a[4]||15000)),null,2));}
module.exports={files,run,inspect,dictionary,Graph,Filter,scenario,plant,makeSearch,decode};
