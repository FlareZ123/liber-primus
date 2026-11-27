"use strict";
const fs=require("node:fs");
function run(raw){
 const Q=29,mod=x=>(x%Q+Q)%Q,names="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" "),tok=names.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);
 function gp(t){t=t.split(/\*\*\* END OF/i)[0].replace(/^.*?\*\*\* START OF[^\n]*\n/is,"");return (t.toUpperCase().match(/[A-Z]+(?:'[A-Z]+)*/g)||[]).flatMap(w=>{w=w.replace(/'/g,"").replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];while(w){const x=tok.find(x=>w.startsWith(x[0]));if(!x)throw Error(w);a.push(x[1]);w=w.slice(x[0].length)}return a})}
 const corpus=JSON.parse(raw[0]),native=JSON.parse(raw[4]);if(corpus.runes.join("")!==native.runes.join(""))throw Error("alphabet mismatch");
 const ds=[...raw.slice(1,4).map((s,i)=>({name:["Shakespeare","Emerson","Gibran"][i],a:gp(s)})),...native.sections.map(s=>({name:s.name,a:[...s.source_text].filter(x=>native.runes.includes(x)).map(x=>native.runes.indexOf(x))}))];
 const freq=new Array(Q).fill(0);for(const S of ds.slice(0,2))for(const x of S.a)freq[x]++;
 const rank=Array.from({length:Q-1},(_,i)=>i+1).sort((a,b)=>freq[b]-freq[a]);
 function runs(a,min=1){const out=[];let s=0;for(let i=0;i<=a.length;i++)if(i===a.length||a[i]===0){if(i-s>=min)out.push({start:s,a:a.slice(s,i),prev:s?0:null});s=i+1}return out}
 const donorRuns=ds.flatMap(({name,a})=>runs(a).map(x=>({...x,name})));
 function floor(T,w,lo,hi,retain=false){let f=Infinity,count=0,windows=[];for(const {name,start,a} of donorRuns){if(a.length<lo)continue;const p=[0];for(const x of a)p.push(p.at(-1)+(T.has(x)?100:0)-w);for(let i=0;i+lo<=a.length;i++)for(let j=i+lo;j<=Math.min(a.length,i+hi);j++){const x=p[j]-p[i];count++;if(x<f){f=x;windows=[]}if(retain&&x===f)windows.push({name,start:start+i,end:start+j,P:a.slice(i,j)});}}return {f,count,windows}}
 // The real option is forbidden when its inverse is F. The null option
 // grants any continuation outside the interval and relaxes its internal
 // successor to either a real or a null with the same pending plaintext.
 function options(a,prev,i,x,y,T,w){const p=i?a[i-1]:prev,c=a[i],v=a[i+1],real=mod(c-x)!==0?(T.has(mod(c-x))?100:0):-Infinity,nullable=p===null||(c!==p&&mod(p-x)!==0&&(i===a.length-1||mod(y-x)===mod(c-p)||mod(y-x)===mod(v-p)));return [real,nullable?w:-Infinity]}
 function factors2(a,prev,q,T,w){const F=Array.from({length:q},()=>new Float64Array(Q*Q));for(let i=0;i<a.length;i++){const f=F[i%q];for(let x=0;x<Q;x++)for(let y=0;y<Q;y++)f[x*Q+y]+=Math.max(...options(a,prev,i,x,y,T,w));}return F}
 function cycle2(F){const q=F.length;let best=-Infinity;for(let s=0;s<Q;s++){let d=new Float64Array(Q).fill(-Infinity);d[s]=0;for(let j=0;j<q-1;j++){const e=new Float64Array(Q).fill(-Infinity),f=F[j];for(let x=0;x<Q;x++)if(d[x]>-Infinity)for(let y=0;y<Q;y++)e[y]=Math.max(e[y],d[x]+f[x*Q+y]);d=e}for(let x=0;x<Q;x++)best=Math.max(best,d[x]+F[q-1][x*Q+s]);}return best}
 function factors3(a,prev,q,T,w,offset){const F=Array.from({length:q},()=>new Float64Array(Q**3)),n=a.length;
  function single(i){const f=F[i%q];for(let x=0;x<Q;x++)for(let y=0;y<Q;y++){const v=Math.max(...options(a,prev,i,x,y,T,w));for(let z=0;z<Q;z++)f[(x*Q+y)*Q+z]+=v}}
  if(offset)single(0);let i=offset;
  for(;i+1<n;i+=2){const p=i?a[i-1]:prev,c=a[i],v=a[i+1],f=F[i%q];for(let x=0;x<Q;x++)for(let y=0;y<Q;y++){const [r0,n0]=options(a,prev,i,x,y,T,w),delta=mod(y-x),nr=p===null||delta===mod(v-p),nn=p===null||delta===mod(c-p);for(let z=0;z<Q;z++){const [r1,n1]=options(a,prev,i+1,y,z,T,w);f[(x*Q+y)*Q+z]+=Math.max(r0+Math.max(r1,n1),n0+Math.max(nr?r1:-Infinity,nn?n1:-Infinity))}}}if(i<n)single(i);return F;
 }
 function combined3(a,prev,q,T,w){const f=factors3(a,prev,q,T,w,0),g=factors3(a,prev,q,T,w,1);return f.map((x,i)=>x.map((v,j)=>v+g[i][j]))}
 function cycle3(F){const q=F.length;if(q<3)throw Error("q>=3");const B=Q*Q;let best=-Infinity;const d0=new Float64Array(B),d1=new Float64Array(B);
  for(let s=0;s<Q;s++)for(let t=0;t<Q;t++){let d=d0,e=d1;d.fill(-Infinity);d[s*Q+t]=0;for(let j=0;j<q-2;j++){e.fill(-Infinity);const f=F[j];for(let x=0;x<Q;x++)for(let y=0;y<Q;y++){const dv=d[x*Q+y];if(dv===-Infinity)continue;const at=(x*Q+y)*Q,ey=y*Q;for(let z=0;z<Q;z++){const v=dv+f[at+z];if(v>e[ey+z])e[ey+z]=v}}[d,e]=[e,d]}for(let x=0;x<Q;x++)for(let y=0;y<Q;y++)best=Math.max(best,d[x*Q+y]+F[q-2][(x*Q+y)*Q+s]+F[q-1][(y*Q+s)*Q+t]);}return best;
 }
 function checkInterval(a,prev,q,t,w,tight=false){if(a.includes(0))throw Error("not F-free");const T=new Set(rank.slice(0,t)),D=cycle2(factors2(a,prev,q,new Set(),1)),lo=a.length-D;if(!Number.isFinite(D)||lo<1)throw Error("unexpected null length bound");const f=floor(T,w,lo,a.length),cap=tight?cycle3(combined3(a,prev,q,T,w))/2:cycle2(factors2(a,prev,q,T,w));return {q,t,w,D,lo,cap,floor:f.f,referenceWindows:f.count,gap:w*a.length+f.f-cap,tight}}
 // Exact crib receiver for a known nonzero predecessor and F-free plaintext
 // emissions in the interval. Any pending rune after the final emission is
 // freely supplied if trailing nulls occur. The initial phase is absorbed in K.
 function cribKeys(C,P,q,prev){if(C.includes(0)||P.includes(0)||prev===null)throw Error("crib input");const key=new Int8Array(q).fill(-1),found=new Map(),events=[];let nodes=0;
  function dfs(i,j,trail){nodes++;if(C.length-i<P.length-j)return;if(i===C.length){if(j===P.length){const k=Array.from(key);if(k.includes(-1))throw Error("short crib");const tag=k.join(",");if(!found.has(tag))found.set(tag,{key:k,events:events.slice(),trail})}return}
   const p0=i?C[i-1]:prev,x=C[i],phase=i%q,old=key[phase];
   function visit(p,isNull,nextTrail){if(isNull&&x===p0)return;const k=mod((isNull?p0:x)-p);if(old!==-1&&old!==k)return;key[phase]=k;events.push(isNull?1:0);dfs(i+1,j+(isNull?0:1),nextTrail);events.pop();key[phase]=old}
   if(j<P.length){visit(P[j],false,trail);visit(P[j],true,trail)}else if(trail!==null)visit(trail,true,trail);else for(let p=1;p<Q;p++)visit(p,true,p);
  }dfs(0,0,null);
  for(const z of found.values()){let j=0;for(let i=0;i<C.length;i++){const p=j<P.length?P[j]:z.trail,proposal=mod(p+z.key[i%q]);if(z.events[i]){if(proposal!==(i?C[i-1]:prev)||proposal===C[i])throw Error("null replay")}else{if(proposal!==C[i]||j>=P.length)throw Error("real replay");j++}}if(j!==P.length)throw Error("crib replay")}
  return {nodes,keys:[...found.values()]}
 }
 const p7=corpus.pages[7].indices.slice(25,208);if(corpus.pages[7].indices.length!==208||corpus.pages[7].indices[24]!==0||p7.length!==183)throw Error("p7 source boundary");
 const whole=corpus.pages.slice(0,56).flatMap(p=>p.indices),g=whole.slice(1691,1908);if(g.length!==217||whole[1690]!==0||whole[1908]!==0||g.slice(0,183).some((x,i)=>x!==p7[i]))throw Error("global source boundary");
 const original={p7:Array.from({length:13},(_,i)=>checkInterval(p7,0,i+1,15,88)),p7q12:checkInterval(p7,0,12,19,100),p7q13:checkInterval(p7,0,13,19,100,true),globalq13:checkInterval(g,0,13,15,88),p8q8:checkInterval(corpus.pages[8].indices.slice(35,161),0,8,19,100),p54q8:checkInterval(corpus.pages[54].indices.slice(66,195),0,8,21,100)};
 const q13=original.p7q13,T19=new Set(rank.slice(0,19)),f=floor(T19,100,q13.lo,p7.length,true);if(q13.gap!==0||f.f!==-1600)throw Error("expected equality");original.cribs=f.windows.map(({P,...w})=>({ ...w,n:P.length,rare:P.filter(x=>!T19.has(x)).length,...cribKeys(p7,P,13,0)}));
 // Positive controls: exact F-free substrings of authentic native/donor text,
 // freshly generated hidden periodic keys; include trailing nulls.
 let seed=0x47f713a1;function rng(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return Math.floor((seed>>>0)/4294967296*n)}
 const pool=donorRuns.filter(s=>s.a.length>=85&&s.name!=="Shakespeare"&&s.name!=="Emerson");
 function plant(P,K,tail){const C=[],events=[],q=K.length;let j=0,prev=0;for(const p of P){for(;;){const x=mod(p+K[j++%q]);if(x===prev&&rng(10000)<8074){let z=rng(28);if(z>=x)z++;C.push(z);events.push(1);prev=z}else{C.push(x);events.push(0);prev=x;break}}}if(tail){const p=mod(prev-K[j%q]);if(!p)return null;let z=rng(27)+1;if(z>=prev)z++;if(z>=29||z===prev)return null;C.push(z);events.push(1)}return {C,events}}
 const controls=[];for(let k=0;k<24;k++){const s=pool[rng(pool.length)],L=55+rng(31),at=rng(s.a.length-L+1),P=s.a.slice(at,at+L),q=k<8?3:13,tail=k%3===0;let K,e,attempt=0;do{K=Array.from({length:q},()=>rng(Q));e=plant(P,K,tail);if(++attempt>10000)throw Error("control generation")}while(!e||e.C.includes(0));
  const result=cribKeys(e.C,P,q,0),T=new Set(rank.slice(0,19)),w=100,d=e.C.length-P.length,score=100*P.filter(x=>T.has(x)).length+w*d,FD=factors2(e.C,0,q,new Set(),1),F=combined3(e.C,0,q,T,w),kval=K.reduce((s,x,i)=>s+F[i][(x*Q+K[(i+1)%q])*Q+K[(i+2)%q]],0)/2,D=cycle2(FD);let cap=null,brute=null;
  if(q===3){cap=cycle3(F)/2;brute=-Infinity;for(let x=0;x<Q;x++)for(let y=0;y<Q;y++)for(let z=0;z<Q;z++)brute=Math.max(brute,(F[0][(x*Q+y)*Q+z]+F[1][(y*Q+z)*Q+x]+F[2][(z*Q+x)*Q+y])/2);if(cap!==brute)throw Error("triplet DP vs brute force")}
  if(!result.keys.some(x=>x.key.join(",")===K.join(","))||d>D||score>kval||cap!==null&&score>cap)throw Error("positive control failed");
  controls.push({q,L,n:e.C.length,d,tail,attempt,score,kval,D,cap,brute,keys:result.keys.length,nodes:result.nodes,correct:true})
 }
 return {rank,seed:"0x47f713a1",donorLengths:ds.map(s=>({name:s.name,n:s.a.length})),original,controls};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/external/relikd-solved-gp29-native-v1.json"];
if(require.main===module)console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
module.exports={run,paths};
