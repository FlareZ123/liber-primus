"use strict";
// Exact all-nonzero-coefficient mixed-delay shared-text GP29 autokey inverse. Read-only.
// Corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; native control blob 1b064ef6d85819b7d96adaff31a82d1ec551598f.
function run(corpus,gold){
const mod=x=>(x%29+29)%29;
const inv=Array.from({length:29},(_,x)=>x?Array.from({length:28},(_,i)=>i+1).find(y=>mod(x*y)===1):0);
const assert=(v,m)=>{if(!v)throw Error(m)};
const page=n=>corpus.pages.find(x=>x.page===n).indices;
const A=page(32),B=page(55);assert(A.length===121&&B.length===76,"source lengths");
const masks=(a,b)=>{const z=a.flatMap((x,i)=>x===0&&b[i]===0?[i]:[]);return Array.from({length:2**z.length},(_,m)=>new Set(z.filter((_,j)=>m&(1<<j))));};
const modes=["plain","cipher"];
// Weighted disjoint set: P_i = mul[i]*P_parent + add[i].
function solve(x,y,qa,qb,ma,mb,ka,kb,details=false){
 const n=x.length,par=Array.from({length:n},(_,i)=>i),mul=Array(n).fill(1),add=Array(n).fill(0),fixed=Array(n).fill(-1);
 function root(i){if(par[i]!==i){const j=par[i],r=root(j);add[i]=mod(mul[i]*add[j]+add[i]);mul[i]=mod(mul[i]*mul[j]);par[i]=r;}return par[i];}
 function set(i,v){const r=root(i),w=mod((v-add[i])*inv[mul[i]]);if(fixed[r]>=0)return fixed[r]===w;fixed[r]=w;return true;}
 // impose P_i = s P_j + t, s != 0
 function join(i,j,s,t){const r=root(i),u=root(j);const alpha=mod(s*mul[j]*inv[mul[i]]),beta=mod((s*add[j]+t-add[i])*inv[mul[i]]);
  if(r===u){const v=mod(1-alpha);if(!v)return beta===0;const w=mod(beta*inv[v]);if(fixed[r]>=0)return fixed[r]===w;fixed[r]=w;return true;}
  if(fixed[r]>=0){const w=mod((fixed[r]-beta)*inv[alpha]);if(fixed[u]>=0&&fixed[u]!==w)return false;fixed[u]=w;}
  par[r]=u;mul[r]=alpha;add[r]=beta;return true;
 }
 for(const [c,q,mode,k] of [[x,qa,ma,ka],[y,qb,mb,kb]])for(let t=q;t<n;t++){
  const ok=mode==="plain"?join(t,t-q,mod(-k),c[t]):set(t,mod(c[t]-k*c[t-q]));
  if(!ok)return null;
 }
 const ban=Array(n).fill(0);
 for(let i=0;i<n;i++){const r=root(i),zero=mod(-add[i]*inv[mul[i]]);ban[r]|=1<<zero;}
 let count=1n;const domains={};
 for(let i=0;i<n;i++)if(par[i]===i){const d=Array.from({length:29},(_,v)=>v).filter(v=>!(ban[i]&(1<<v))&&(fixed[i]===-1||fixed[i]===v));if(!d.length)return null;count*=BigInt(d.length);if(details)domains[i]=d;}
 if(!details)return {count:count.toString()};
 const example=par.map((r,i)=>mod(mul[i]*domains[r][0]+add[i]));
 return {count:count.toString(),example,par,mul,add,domains};
}
function scan(a,b,qa,qb,ma,mb){let masksTested=0,tested=0;const hits=[];for(let off=0;off<=a.length-b.length;off++){const ax=a.slice(off,off+b.length);for(const h of masks(ax,b)){masksTested++;const x=ax.filter((_,i)=>!h.has(i)),y=b.filter((_,i)=>!h.has(i));for(let ka=1;ka<29;ka++)for(let kb=1;kb<29;kb++){tested++;const z=solve(x,y,qa,qb,ma,mb,ka,kb);if(z)hits.push({off,holds:[...h],ka,kb,count:z.count});}}}return {qa,qb,ma,mb,masksTested,tested,hits};}
let seed=0x14a8301;const rnd=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n;};
const enc=(p,q,mode,k,seedKey=Array.from({length:q},()=>rnd(29)))=>{const pp=[],cc=[];return p.map(x=>{if(!x)return 0;let i=pp.length;const shift=i<q?seedKey[i]:k*(mode==="plain"?pp[i-q]:cc[i-q]);let c=mod(x+shift);pp.push(x);cc.push(c);return c;});};
// A partial overlap starts with arbitrary seed; verify its true active plaintext against the exact constraints.
const original=[],controls=[];
for(const [qa,qb] of [[8,13],[13,8]])for(const ma of modes)for(const mb of modes){
 const out=scan(A,B,qa,qb,ma,mb);original.push(out);
 for(let rep=0;rep<2;rep++){
 const name=["0_welcome","0_koan_1","0_wisdom","0_loss_of_divinity"][controls.length%4];
 const P=[...gold.sections.find(x=>x.name===name).source_text].filter(x=>corpus.runes.includes(x)).map(x=>corpus.runes.indexOf(x)).slice(0,121);
 const off=5+(controls.length*7)%40,p=P.slice(off,off+76),ka=1+rnd(28),kb=1+rnd(28),a=enc(P,qa,ma,ka),b=enc(p,qb,mb,kb),z=scan(a,b,qa,qb,ma,mb);
 const h=p.flatMap((v,i)=>v===0?[i]:[]),hit=z.hits.find(t=>t.off===off&&t.holds.join(",")===h.join(",")&&t.ka===ka&&t.kb===kb);
 assert(hit,"missing true mask/key "+[qa,qb,ma,mb]);
 const ax=a.slice(off,off+76),x=ax.filter((_,i)=>!h.includes(i)),y=b.filter((_,i)=>!h.includes(i)),active=p.filter(Boolean),d=solve(x,y,qa,qb,ma,mb,ka,kb,true);
 assert(active.every((v,i)=>d.domains[d.par[i]].includes(active[d.par[i]])&&v===mod(d.mul[i]*active[d.par[i]]+d.add[i])),"true plaintext missing");
 for(const [c,q,m,k] of [[ax,qa,ma,ka],[b,qb,mb,kb]]){const cAct=c.filter((_,i)=>!h.includes(i)),key=cAct.slice(0,q).map((v,i)=>mod(v-d.example[i])),qplain=p.map((v,i)=>v?d.example[p.slice(0,i).filter(Boolean).length]:0);assert(enc(qplain,q,m,k,key).every((v,i)=>v===c[i]),"example replay");}
 controls.push({qa,qb,ma,mb,name,off,ka,kb,active:active.length,exactPlaintextCount:hit.count,acceptedOffsets:[...new Set(z.hits.map(x=>x.off))],acceptedKeyMaskTuples:z.hits.length});
 }
}
return {original,controls};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,"..");const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));console.log(JSON.stringify(run(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));}
module.exports={run};
