"use strict";
// Exact shared-cycle q8/q13 repeated-message receiver; read-only.
// Original corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; native donor 1b064ef6d85819b7d96adaff31a82d1ec551598f.
function run(corpus,gold){
"use strict";
const mod=x=>(x%29+29)%29;
const assert=(x,m)=>{if(!x)throw Error(m)};
const inv=Array.from({length:29},(_,x)=>x?Array.from({length:28},(_,i)=>i+1).find(y=>mod(x*y)===1):0);
const page=n=>corpus.pages.find(p=>p.page===n).indices;
const A=page(32),B=page(55);assert(A.length===121&&B.length===76,"original page lengths");
function masks(a,b){const z=a.map((v,i)=>v===0&&b[i]===0?i:-1).filter(x=>x>=0);return Array.from({length:2**z.length},(_,m)=>new Set(z.filter((_,j)=>m&(1<<j))));}
function rref(rows,n){
const M=rows.map(x=>x.slice());const piv=[];let rank=0;
for(let c=0;c<n&&rank<M.length;c++){let k=rank;while(k<M.length&&!M[k][c])k++;if(k===M.length)continue;[M[rank],M[k]]=[M[k],M[rank]];const w=inv[M[rank][c]];for(let j=c;j<=n;j++)M[rank][j]=mod(M[rank][j]*w);for(let i=0;i<M.length;i++)if(i!==rank&&M[i][c]){const v=M[i][c];for(let j=c;j<=n;j++)M[i][j]=mod(M[i][j]-v*M[rank][j]);}piv.push(c);rank++;}
return {M,piv,rank,inconsistent:M.slice(rank).some(r=>r[n]!==0)};
}
function solve(a,b,qa,qb,h){
const n=29+qa+qb,obs=[];let t=0;
for(let i=0;i<a.length;i++)if(!h.has(i)){obs.push({i,x:a[i],y:b[i],u:29+t%qa,v:29+qa+t%qb});t++;}
const eq=obs.map(({x,y,u,v})=>{let r=Array(n+1).fill(0);r[y]++;r[x]--;r[u]++;r[v]--;return r.map(mod);});
const raw=rref(eq,n);
function fix(i,x){let r=Array(n+1).fill(0);r[i]=1;r[n]=x;return r;}
const z=rref([...eq,fix(0,0),fix(29,0),fix(1,1)],n);
if(z.inconsistent)return {status:"reject",reason:"nonzero alphabet normalization impossible",rank:raw.rank};
const free=Array.from({length:n},(_,i)=>i).filter(i=>!z.piv.includes(i));
const expr=Array.from({length:n},(_,i)=>{const k=z.piv.indexOf(i);return k<0?[0,...free.map(j=>+(i===j))]:[z.M[k][n],...free.map(j=>mod(-z.M[k][j]))];});
for(let i=0;i<29;i++)for(let j=i+1;j<29;j++)if(expr[i].every((x,k)=>x===expr[j][k]))return {status:"reject",reason:"alphabet coordinate collision forced",rank:raw.rank,collision:[i,j],free:free.length};
if(free.length>2)return {status:"unresolved",rank:raw.rank,free:free.length};
const v=Array(n).fill(0),witnesses=[];let bijections=0,checked=0;
function dfs(k){if(k<free.length){for(let x=0;x<29;x++){v[free[k]]=x;dfs(k+1);}return;}checked++;
for(let i=0;i<z.rank;i++)v[z.piv[i]]=mod(z.M[i][n]-free.reduce((s,c)=>s+z.M[i][c]*v[c],0));
const pi=v.slice(0,29);if(new Set(pi).size!==29)return;bijections++;
const unshift=obs.map(o=>mod(pi[o.x]-v[o.u]));
for(let g=0;g<29;g++){if(unshift.includes(g))continue;const p=Array(a.length).fill(0);for(let j=0;j<obs.length;j++)p[obs[j].i]=pi.indexOf(mod(unshift[j]-g));for(const o of obs){assert(pi.indexOf(mod(pi[p[o.i]]+v[o.u]+g))===o.x,"first replay");assert(pi.indexOf(mod(pi[p[o.i]]+v[o.v]+g))===o.y,"second replay");}witnesses.push({p,pi,K:v.slice(29,29+qa).map(x=>mod(x+g)),J:v.slice(29+qa).map(x=>mod(x+g))});}}
dfs(0);return {status:witnesses.length?"accept":"reject",reason:witnesses.length?"bijective inverse":"no bijective inverse with nonzero consuming plaintext",rank:raw.rank,free:free.length,checked,bijections,witnesses};
}
function scan(a,b,qa,qb){const ranks={},counts={},survivors=[],rejections=[];let tested=0;for(let off=0;off<=a.length-b.length;off++){const w=a.slice(off,off+b.length);for(const h of masks(w,b)){const s=solve(w,b,qa,qb,h);tested++;ranks[s.rank]=(ranks[s.rank]??0)+1;const r=s.reason??s.status;counts[r]=(counts[r]??0)+1;const row={off,holds:[...h],...s};if(s.status!=="reject")survivors.push(row);else rejections.push(row);}}return {qa,qb,tested,ranks,counts,survivors,rejections};}
let seed=0x11a823d5;const rnd=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n;};
function permutation(){const a=Array.from({length:29},(_,i)=>i);for(let i=28;i>1;i--){const j=1+rnd(i);[a[i],a[j]]=[a[j],a[i]];}return a;}
const controls=[];
for(const [qa,qb] of [[8,13],[13,8]])for(const [j,name] of ["0_welcome","0_wisdom","0_koan_1","0_loss_of_divinity"].entries()){
const P=[...gold.sections.find(s=>s.name===name).source_text].filter(x=>corpus.runes.includes(x)).map(x=>corpus.runes.indexOf(x)).slice(0,121);
assert(P.length===121,"donor length");const off=5+11*j,p=P.slice(off,off+76),pi=permutation(),K=Array.from({length:qa},()=>rnd(29)),J=Array.from({length:qb},()=>rnd(29)),u=rnd(qa),v=rnd(qb),phase=(u+P.slice(0,off).filter(x=>x!==0).length)%qa,first=p.find(x=>x!==0);
K[phase]=mod(-pi[first]);J[v]=mod(-pi[first]);
const enc=(a,k,t)=>a.map(x=>x===0?0:pi.indexOf(mod(pi[x]+k[t++%k.length])));
const ca=enc(P,K,u),cb=enc(p,J,v),holds=p.map((x,i)=>x===0?i:-1).filter(x=>x>=0),s=scan(ca,cb,qa,qb);
const hit=s.survivors.find(x=>x.status==="accept"&&x.off===off&&x.holds.join(",")===holds.join(","));
assert(hit,"control true path missing: "+name+" "+qa+" "+JSON.stringify(s.survivors.map(x=>[x.off,x.holds,x.status,x.free])));
const truth=hit.witnesses.find(w=>w.p.every((x,i)=>x===p[i]));assert(truth,"control plaintext missing");
const expected=pi.map(x=>mod(x*inv[pi[1]]));
assert(truth.pi.every((x,i)=>x===expected[i]),"control shared cycle not recovered");
controls.push({qa,qb,name,off,holds,rank:hit.rank,free:hit.free,plaintextCandidates:hit.witnesses.length,acceptedOffsets:[...new Set(s.survivors.filter(x=>x.status==="accept").map(x=>x.off))],unresolved:s.survivors.filter(x=>x.status==="unresolved").length,truePlaintext:true,trueCycle:true});
}
const original=[[8,13],[13,8]].map(([qa,qb])=>scan(A,B,qa,qb));return {seed:"0x11a823d5",controls,original};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,"..");const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));console.log(JSON.stringify(run(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));}
module.exports={run};
