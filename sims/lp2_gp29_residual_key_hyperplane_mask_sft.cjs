'use strict';
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

 function keyMask(g,cap=Infinity){
  const free=[];for(let j=1;j<Q;j++)if(!g.rows[j])free.push(j);
  const v=g.off.map(a=>reduce(a,g.rows)),rs=Array.from({length:free.length},()=>[]),seen=new Set();
  for(let x=0;x<N;x++)for(let y=0;y<x;y++)if(g.r[x]===g.r[y]){
   const a=sub(v[x],v[y]),last=free.findLastIndex(j=>a[j]!==0);
   if(last<0){if(!a[0])return {keys:[],nodes:0,cap:false};continue;}
   const row=[mod(a[0]*inv[a[free[last]]]),...free.slice(0,last).map(j=>mod(a[j]*inv[a[free[last]]]))];
   const id=last+":"+row.join(",");if(!seen.has(id)){seen.add(id);rs[last].push(row)}
  }
  let nodes=0,clipped=false;const k=Array(Q).fill(0);k[0]=1;const keys=[];
  function visit(p){if(clipped)return;nodes++;if(p===free.length){for(let j=1;j<Q;j++)if(g.rows[j])k[j]=mod(-g.rows[j].reduce((s,a,z)=>s+(z===j?0:a*k[z]),0));if(k.slice(0,4).every((x,j)=>x===k[j+4]))return;keys.push(k.slice());if(keys.length>cap)clipped=true;return;}
   let banned=0;for(const row of rs[p]){let n=row[0];for(let j=0;j<p;j++)n+=row[j+1]*k[free[j]];banned|=1<<mod(-n);if(banned===ALL)return;}
   for(let x=0;x<N;x++)if(!(banned&(1<<x))){k[free[p]]=x;visit(p+1);if(clipped)return;}}
  visit(0);return {keys,nodes,cap:clipped};
 }
 function numericKeys(g){const free=[];for(let j=1;j<Q;j++)if(!g.rows[j])free.push(j);let out=[],k=Array(Q).fill(0);k[0]=1;function visit(i){if(i<free.length){for(let v=0;v<N;v++){k[free[i]]=v;visit(i+1);}return;}for(let j=1;j<Q;j++)if(g.rows[j])k[j]=mod(-g.rows[j].reduce((s,a,z)=>s+(z===j?0:a*k[z]),0));if(k.slice(0,4).every((x,j)=>x===k[j+4]))return;const o=g.off.map(a=>mod(a.reduce((s,v,j)=>s+v*k[j],0))),m=Array(N).fill(0);for(let x=0;x<N;x++){let b=1<<o[x];if(m[g.r[x]]&b)return;m[g.r[x]]|=b;}out.push(k.slice());}visit(0);return out;}
 function support(g,v,es,cache){for(const id of es){let t=cache[id];if(!t){const j=id%Q,p=Math.floor(id/Q)%N,c=Math.floor(id/(Q*N)),s=mod(v.o[p]+v.k[j]-v.o[c]),a=g.r[c],b=g.r[p];t=(a===b?s===0:!(rot(v.m[a],s)&v.m[b]))?1:-1;cache[id]=t;}if(t<0)return false;}return true;}
 function whole(g,v,es){let r=g.r.slice(),o=v.o.slice(),m=v.m.slice();for(const id of es){const j=id%Q,p=Math.floor(id/Q)%N,c=Math.floor(id/(Q*N)),s=mod(o[p]+v.k[j]-o[c]),a=r[c],b=r[p];if(a===b){if(s)return false;continue;}const mm=rot(m[a],s);if(mm&m[b])return false;for(let x=0;x<N;x++)if(r[x]===a){r[x]=b;o[x]=mod(o[x]+s);}m[b]|=mm;m[a]=0;}return true;}
 // DP[j] is exact "at most j omissions" over the groups processed so far.
 function aggregate(supports,n,budget){const nb=Math.ceil(n/32),full=new Uint32Array(nb);full.fill(0xffffffff);if(n%32)full[nb-1]=2**(n%32)-1;let dp=Array.from({length:budget+1},()=>full.slice());for(const m of supports){for(let j=budget;j>=0;j--)for(let i=0;i<nb;i++)dp[j][i]=((dp[j][i]&m[i])|(j?dp[j-1][i]:0))>>>0;}return dp;}
 function analyze(g,ds,trueKey){const keys=numericKeys(g),n=keys.length;if(!n)return {d:dim(g),n:0};const nb=Math.ceil(n/32),rel=ds.map(()=>new Uint32Array(nb)),joint=ds.map(()=>new Uint32Array(nb)),miss=Array(n).fill(0),missJoint=Array(n).fill(0);let trueId=-1;
 for(let i=0;i<n;i++){let v=keys[i];if(trueKey&&v.k.every((x,j)=>x===trueKey[j]))trueId=i;const cache=new Int8Array(N*N*Q);for(let q=0;q<ds.length;q++){let a=false,b=false;for(const e of ds[q])if(support(g,v,e,cache)){a=true;if(whole(g,v,e)){b=true;break;}}if(a)rel[q][i>>>5]|=1<<(i&31);else miss[i]++;if(b)joint[q][i>>>5]|=1<<(i&31);else missJoint[i]++;}}
 const dr=aggregate(rel,n,3),dj=aggregate(joint,n,3);for(let i=0;i<n;i++)for(let b=0;b<=3;b++){check(!!(dr[b][i>>>5]&(1<<(i&31)))===(miss[i]<=b),"relaxed budget DP");check(!!(dj[b][i>>>5]&(1<<(i&31)))===(missJoint[i]<=b),"joint budget DP");}
 if(trueKey)check(trueId>=0&&missJoint[trueId]===0,"true key lost");
 return {d:dim(g),n,empty:rel.filter(m=>!m.some(Boolean)).length,emptyJoint:joint.filter(m=>!m.some(Boolean)).length,min:Math.min(...miss),minJoint:Math.min(...missJoint),survive:miss.filter(x=>x<=3).length,surviveJoint:missJoint.filter(x=>x<=3).length,trueKeyRetained:trueKey?true:trueKey};}
 const ds=train.map(c=>domains(c,by[c.length])),carryOpts=domains(carry,prefixes,true),seeds=carryOpts.map(e=>extend(initial(),e)).filter(Boolean);
 const long=train.map((w,i)=>({i,n:w.length})).sort((a,b)=>b.n-a.n||a.i-b.i).slice(0,12).map(x=>x.i);

 const sampled=[],seen=new Set(),max=32;let attempts=0;
 for(let t=0;t<120&&sampled.length<max;t++){
  attempts++;let g=seeds[rnd(seeds.length)],chosen=[],used=new Set();const target=t%2?3:4;
  for(let step=0;step<6&&dim(g)>target;step++){let choices=long.filter(i=>!used.has(i));if(!choices.length)break;let q=choices[rnd(choices.length)];used.add(q);let best=null,which=-1;for(let z=0;z<150;z++){const id=rnd(ds[q].length),h=extend(g,ds[q][id]);if(h&&dim(h)>=target&&(!best||dim(h)<dim(best))){best=h;which=id;if(dim(h)===target)break;}}if(best){g=best;chosen.push([q,which]);}else break;}
  if(dim(g)!==target)continue;const sig=JSON.stringify([g.r,g.off,g.rows]);if(seen.has(sig))continue;seen.add(sig);
  const sizes=Array(N).fill(0);for(const x of g.r)sizes[x]++;const largest=Math.max(...sizes);
  const a=keyMask(g,64);let exact=null;
  // Full naive cross-check for d=3 and the first two d=4 cases only.
  if(target===3||sampled.filter(x=>x.d===4&&x.exact!==null).length<2){const b=numericKeys(g);const c=keyMask(g);check(JSON.stringify(b)===JSON.stringify(c.keys),"mask versus brute force");exact=b.length;}
  sampled.push({d:target,largest,components:sizes.filter(Boolean).length,enumerationNodes:a.nodes,keys:a.cap?null:a.keys.length,clipped:a.cap,exact,chosen});
 }
 const summary=Object.fromEntries([3,4].map(d=>{const a=sampled.filter(x=>x.d===d);return [d,{n:a.length,zero:a.filter(x=>x.keys===0).length,under64:a.filter(x=>!x.clipped).length,clipped:a.filter(x=>x.clipped).length,medianLargest:a.map(x=>x.largest).sort((a,b)=>a-b)[Math.floor(a.length/2)]}]}));
 return {schema:"lp2-residual-key-hyperplane-mask-v1",attempts,summary,sampled,scope:"Deterministic original branch samples; no original whole-family exclusion. Only primitive key assignments with no forced intra-component coordinate collisions; residual packing and lexical support not included."};

}
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
console.log(JSON.stringify(experiment(JSON.parse(read('resources/liber-primus/lp2-page-groups-54-55-derived.json')),read('resources/control/english_wordfreq_textblob.txt'),JSON.parse(read('im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json'))),null,2));
