"use strict";
/** Exact arbitrary phase rank-bijection relaxation for the predecessor escape law. Source-native finite windows only; no word assumptions. */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
function run(gp,sources,shas){
 const M=29,ALL=(1<<29)-1,RANKS=(1<<28)-1,assert=(x,m)=>{if(!x)throw Error(m)};
 const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(raw){let s=raw.toUpperCase();let j=s.search(/\*\*\* START OF (?:THIS|THE) PROJECT GUTENBERG/);if(j>=0)s=s.slice(s.indexOf("\n",j)+1);j=s.search(/\*\*\* END OF (?:THIS|THE) PROJECT GUTENBERG/);if(j>=0)s=s.slice(0,j);
 s=s.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(const w of s.match(/[A-Z]+/g)||[])for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3;continue}if(w.startsWith("IO",i)){a.push(27);i+=2;continue}const t=tokens.find(t=>w.startsWith(t.s,i));assert(t,"native mapping");a.push(t.i);i+=t.s.length}return Uint8Array.from(a)}
 const pages=gp.pages.filter(p=>p.page<56&&p.indices.length),donors=sources.map(native);
 const variants=[];for(const q of [8,13])for(const reset of ["page","scope"])for(const clock of ["all","nonrepeat"])for(const rank of ["circular","linear"])variants.push({q,reset,clock,rank,name:`${q}/${reset}/${clock}/${rank}`});
 function frame(ps){const a=[],rep=[],omit=[],non=[];for(const pg of ps){const start=a.length;if(start)omit.push(start);for(let j=0;j<pg.length;j++){a.push(pg[j]);if(j){if(pg[j]===pg[j-1])rep.push(start+j);else non.push(start+j)}}}return {a,n:a.length,rep,omit,non}}
 const book=frame(pages.map(p=>p.indices)),open=frame(pages.filter(p=>p.page<=2).map(p=>p.indices)),term=frame(pages.filter(p=>p.page>=54).map(p=>p.indices));
 assert(book.n===12956&&book.rep.length===86&&open.rep.length===4&&term.rep.length===3,"profile");
 function schedule(fr,v){const r=new Int16Array(fr.n).fill(-1),omit=new Set([0,...fr.omit]);let t=0;for(let i=0;i<fr.n;i++){if(omit.has(i)){if(v.reset==="page")t=0;continue}let p=fr.a[i-1],c=fr.a[i];if(p===c){if(v.clock==="all")t++;continue}const y=v.rank==="circular"?(c-p+M)%M-1:c-(c>p?1:0);r[i]=(t%v.q)*28+y;t++}return r}
 function domain(p,off,fr){const d=new Uint32Array(M).fill(ALL),f=new Int8Array(M).fill(-1);
 for(const j of fr.rep){const a=p[off+j-1],b=p[off+j];if(f[a]>=0&&f[a]!==b)return null;f[a]=b;d[a]=1<<b}
 for(const j of fr.non){const a=p[off+j-1],b=p[off+j];if(f[a]===b)return null;d[a]&=~(1<<b);if(!d[a])return null}
 return d}
 function match(rows){const own=new Int8Array(28).fill(-1);let seen=0;
 function dfs(y){let s=rows[y]&~seen;while(s){const bit=s&-s;s^=bit;const x=31-Math.clz32(bit);seen|=bit;if(own[x]<0||dfs(own[x])){own[x]=y;return true}s&=~seen}return false}
 const order=Array.from({length:28},(_,i)=>i).sort((a,b)=>pop(rows[a])-pop(rows[b]));
 for(const y of order){seen=0;if(!dfs(y))return false}return true
 }
 function pop(x){let n=0;while(x){x&=x-1;n++}return n}
 function gate(p,off,fr,v,d,sched){const rows=new Uint32Array(v.q*28).fill(RANKS);let tested=0;
 for(const j of fr.non){const a=p[off+j-1],b=p[off+j],low=(1<<b)-1;let allowed=0;
 if(b>0&&(d[a]&low))allowed|=1<<(b-1);
 if(b<28&&(d[a]&~((1<<(b+1))-1)))allowed|=1<<b;
 const idx=sched[j];rows[idx]&=allowed;tested++;if(!rows[idx])return {pass:false,reason:"empty",tested}}
 for(let h=0;h<v.q;h++)if(!match(rows.subarray(h*28,h*28+28)))return {pass:false,reason:"matching",tested};
 return {pass:true,tested,rows}
 }
 /** Capacity for a plaintext subset whose adjacent-rank neighborhood has m elements. */
 function caps(fr,v){const s=schedule(fr,v),h=Array.from({length:v.q},()=>new Int32Array(28));for(const j of fr.non){let z=s[j];h[Math.floor(z/28)][z%28]++}
 const out=new Int32Array(29).fill(fr.rep.length+fr.omit.length+1);for(const row of h){row.sort((a,b)=>b-a);let t=0;for(let m=1;m<=28;m++){t+=row[m-1];out[m]+=t}}return Array.from(out)}
 /** All 2^29 subsets via path edge-neighborhood DP; each selected vertex touches its adjacent edges. */
 function maxByNeighborhood(counts){let d=[new Int32Array(29).fill(-1),new Int32Array(29).fill(-1)];d[0][0]=0;d[1][0]=counts[0];
 for(let i=1;i<29;i++){let e=[new Int32Array(29).fill(-1),new Int32Array(29).fill(-1)];for(let prev=0;prev<2;prev++)for(let k=0;k<=i-1;k++)if(d[prev][k]>=0)for(let b=0;b<2;b++){let z=k+(prev||b?1:0);e[b][z]=Math.max(e[b][z],d[prev][k]+b*counts[i])}d=e}return Array.from(d[0],(x,i)=>Math.max(x,d[1][i]))}
 // Verify exact DP on small nonzero-support counts against all subsets of those supported vertices.
 let cc=new Int32Array(29);for(let i of [0,3,4,15,16,27,28])cc[i]=i+1;let dp=maxByNeighborhood(cc),nz=[0,3,4,15,16,27,28];
 for(let mask=0;mask<128;mask++){let edges=0,sum=0;for(let i=0;i<nz.length;i++)if(mask&(1<<i)){let x=nz[i];sum+=cc[x];if(x>0)edges|=1<<(x-1);if(x<28)edges|=1<<x}assert(dp[pop(edges)]>=sum,"DP subset underbound")}
 const results=[];for(const [name,fr] of [["opening",open],["terminal",term]]){
 const sched=variants.map(v=>schedule(fr,v)),stats=variants.map(v=>({...v,empty:0,matching:0,pass:0,maxTested:0,examples:[]}));
 const counts=[];for(let k=0;k<donors.length;k++){let p=donors[k],n=0;for(let off=0;off+fr.n<=p.length;off++){let d=domain(p,off,fr);if(!d)continue;n++;
 for(let z=0;z<variants.length;z++){let g=gate(p,off,fr,variants[z],d,sched[z]),s=stats[z];s.maxTested=Math.max(s.maxTested,g.tested);if(g.pass){s.pass++;if(s.examples.length<5)s.examples.push({source:k,off})}else s[g.reason]++}}
 counts.push(n)}
 results.push({name,counts,stats});
 }
 // Full-book frequency gate. First exact singleton constraints, then all subsets for any survivor.
 const capacity=variants.map(v=>({name:v.name,caps:caps(book,v),sources:[]}));
 for(let k=0;k<donors.length;k++){const p=donors[k],n=book.n,counts=new Int32Array(29);for(let i=0;i<n;i++)counts[p[i]]++;
 const a=capacity.map(()=>({windows:p.length-n+1,singletonPass:0,allSubsetPass:0,minMaxInterior:Infinity,maxSingletonMargin:-Infinity,maxFullMargin:-Infinity}));
 for(let off=0;off+n<=p.length;off++){if(off){counts[p[off-1]]--;counts[p[off+n-1]]++}let mx=0;for(let j=1;j<28;j++)mx=Math.max(mx,counts[j]);let dp=null;
 for(let z=0;z<capacity.length;z++){let c=capacity[z].caps,s=a[z],margin=Math.min(c[1]-counts[0],c[1]-counts[28],c[2]-mx);
 s.minMaxInterior=Math.min(s.minMaxInterior,mx);s.maxSingletonMargin=Math.max(s.maxSingletonMargin,margin);
 if(margin>=0){s.singletonPass++;if(!dp)dp=maxByNeighborhood(counts);let m=Infinity;for(let j=1;j<28;j++)m=Math.min(m,c[j]-dp[j]);s.maxFullMargin=Math.max(s.maxFullMargin,m);if(m>=0)s.allSubsetPass++}}
 }
 for(let z=0;z<capacity.length;z++){if(!Number.isFinite(a[z].maxFullMargin))a[z].maxFullMargin=null;capacity[z].sources.push(a[z])}
 }
 // Three hidden evolving rank permutation controls, matched actual book page profile.
 let seed=0x14ad33c;function rng(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n}
 function perm(){const x=Array.from({length:28},(_,i)=>i);for(let j=27;j>0;j--){let k=rng(j+1);[x[j],x[k]]=[x[k],x[j]]}return x}
 const controls=[];for(let k=0;k<3;k++){let v=variants[[0,11,15][k]],p=donors[k].slice(5000,5000+book.n),f=Array.from({length:29},()=>[11,12,21,22,27,28][rng(6)]),key=Array.from({length:v.q},perm),ct=[],omit=new Set([0,...book.omit]),t=0;
 for(let i=0;i<p.length;i++){if(omit.has(i)){if(v.reset==="page")t=0;ct.push(p[i]);continue}let prev=ct[i-1],e=f[p[i-1]],x=p[i];if(x===e){ct.push(prev);if(v.clock==="all")t++;continue}let z=key[t%v.q][x-(x>e?1:0)];ct.push(v.rank==="circular"?(prev+1+z)%29:z+(z>=prev?1:0));t++}
 let offset=0,ps=[];for(let pg of pages){ps.push(ct.slice(offset,offset+pg.indices.length));offset+=pg.indices.length}
 let fr=frame(ps),d=domain(p,0,fr),s=schedule(fr,v),g=gate(p,0,fr,v,d,s);
 assert(g.pass,"true phase map rejected");let forced=0;for(let h=0;h<v.q;h++)for(let x=0;x<28;x++){let y=key[h][x],b=g.rows[h*28+y];assert(b&(1<<x),"true rank removed");if(b===(1<<x))forced++}
 let counts=new Int32Array(29);for(const x of p)counts[x]++;const c=caps(fr,v),dp=maxByNeighborhood(counts);assert(dp.every((x,i)=>x<=c[i]),"true subset capacity excluded");
 // Exact forward/inverse under hidden key/f.
 let dec=[],time=0;for(let i=0;i<ct.length;i++){if(omit.has(i)){if(v.reset==="page")time=0;dec.push(ct[i]);continue}let e=f[dec[i-1]];if(ct[i]===ct[i-1]){dec.push(e);if(v.clock==="all")time++;continue}let y=v.rank==="circular"?(ct[i]-ct[i-1]+29)%29-1:ct[i]-(ct[i]>ct[i-1]?1:0),rank=key[time%v.q].indexOf(y);dec.push(rank+(rank>=e?1:0));time++}
 assert(dec.every((x,i)=>x===p[i]),"native rank-map replay");
 controls.push({source:k,variant:v.name,repeats:fr.rep.length,forcedRankEntries:forced,totalRankEntries:v.q*28,replay:dec.length})
 }
 return {shas,results,capacity,controls};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const raw=files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
const shas=raw.map(x=>crypto.createHash("sha1").update("blob "+Buffer.byteLength(x)+"\0").update(x).digest("hex"));
console.log(JSON.stringify(run(JSON.parse(raw[0]),raw.slice(1),shas),null,2));
