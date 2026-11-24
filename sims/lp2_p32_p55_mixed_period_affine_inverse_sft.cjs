"use strict";
// Exact shared-text mixed q8/q13 affine phase inverse; read-only.
// Corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; native donor blob 1b064ef6d85819b7d96adaff31a82d1ec551598f.
function run(corpus,gold){
const mod=x=>(x%29+29)%29, inv=Array.from({length:29},(_,x)=>x?Array.from({length:28},(_,i)=>i+1).find(y=>mod(x*y)===1):0);
const assert=(x,m)=>{if(!x)throw Error(m)};
const page=n=>corpus.pages.find(x=>x.page===n).indices,A=page(32),B=page(55);
assert(A.length===121&&B.length===76,"source lengths");
function masks(a,b){const z=a.map((v,i)=>v===0&&b[i]===0?i:-1).filter(x=>x>=0);return Array.from({length:2**z.length},(_,m)=>new Set(z.filter((_,j)=>m&(1<<j))));}
function rows(a,b,qa,qb,h){let t=0;return a.flatMap((x,i)=>h.has(i)?[]:[{i,x,y:b[i],u:t%qa,v:qa+t++%qb}]);}
function rref(rows,n){const mat=rows.map(r=>r.slice()),piv=[];let rank=0;for(let c=0;c<n&&rank<mat.length;c++){let k=rank;while(k<mat.length&&!mat[k][c])k++;if(k===mat.length)continue;[mat[k],mat[rank]]=[mat[rank],mat[k]];const v=inv[mat[rank][c]];for(let j=c;j<=n;j++)mat[rank][j]=mod(mat[rank][j]*v);for(let i=0;i<mat.length;i++)if(i!==rank&&mat[i][c]){const s=mat[i][c];for(let j=c;j<=n;j++)mat[i][j]=mod(mat[i][j]-s*mat[rank][j]);}piv.push(c);rank++;}return {rank,piv,mat,inconsistent:mat.slice(rank).some(r=>r[n]!==0)};}
function solve(a,b,qa,qb,h){
const obs=rows(a,b,qa,qb,h),n=2*(qa+qb),eq=obs.map(({x,y,u,v})=>{const r=Array(n+1).fill(0);r[2*u]=x;r[2*u+1]=1;r[2*v]=mod(-y);r[2*v+1]=28;return r;});
const z=rref(eq,n),nullity=n-z.rank;
const fixed=[];for(let u=0;u<qa+qb;u++){const k=z.piv.indexOf(2*u);if(k>=0&&z.mat[k].slice(0,n).every((x,j)=>j===2*u||x===0))fixed.push(u);}
if(fixed.length)return {status:"reject",reason:"zero slope forced",rank:z.rank,nullity,fixed};
const e0=Array(n+1).fill(0),e1=e0.slice();e0[0]=1;e0[n]=1;e1[1]=1;
const norm=rref([...eq,e0,e1],n);if(norm.inconsistent)return {status:"reject",reason:"normalization impossible",rank:z.rank,nullity};
const free=Array.from({length:n},(_,i)=>i).filter(i=>!norm.piv.includes(i));if(free.length>3)return {status:"unresolved",rank:z.rank,nullity,free:free.length};
let count=0,normalized=[],checked=0;const v=Array(n).fill(0);
function dfs(j){if(j<free.length){for(let x=0;x<29;x++){v[free[j]]=x;dfs(j+1);}return;}checked++;for(let i=0;i<norm.rank;i++){const r=norm.mat[i];v[norm.piv[i]]=mod(r[n]-free.reduce((s,c)=>s+r[c]*v[c],0));}if(v.some((x,i)=>i%2===0&&x===0))return;const p=Array(a.length).fill(null);for(const {i,x,y,u,v:w} of obs){const p1=mod(v[2*u]*x+v[2*u+1]),p2=mod(v[2*w]*y+v[2*w+1]);assert(p1===p2,"phase replay");p[i]=p1;}const labels=new Set(p.filter(x=>x!==null));if(labels.size===29)return;count+=28*(29-labels.size);normalized.push({p,coefficients:v.slice(),labels:labels.size});}
dfs(0);return {status:count?"accept":"reject",reason:count?"feasible":"nonzero constraints",rank:z.rank,nullity,count,checked,normalized};
}
function scan(A,B,qa,qb){const counts={},ranks={},survivors=[];let tested=0;for(let off=0;off<=A.length-B.length;off++){const a=A.slice(off,off+B.length);for(const h of masks(a,B)){tested++;const s=solve(a,B,qa,qb,h);const k=s.reason??s.status;counts[k]=(counts[k]??0)+1;ranks[s.rank]=(ranks[s.rank]??0)+1;if(s.status!=="reject")survivors.push({off,holds:[...h],...s});}}return {qa,qb,tested,counts,ranks,survivors};}
let seed=0x1419affe;const rnd=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n;};
const keys=q=>Array.from({length:q},()=>[1+rnd(28),rnd(29)]),enc=(p,K,t)=>p.map(x=>{if(x===0)return 0;const [a,b]=K[t++%K.length];return mod(a*x+b);});
const controls=[];
for(const [qa,qb] of [[8,13],[13,8]])for(const [j,name] of ["0_welcome","0_wisdom","0_koan_1","0_loss_of_divinity"].entries()){
const P=[...gold.sections.find(s=>s.name===name).source_text].filter(x=>corpus.runes.includes(x)).map(x=>corpus.runes.indexOf(x)).slice(0,121),off=5+11*j,p=P.slice(off,off+76),K=keys(qa),J=keys(qb),u=rnd(qa),v=rnd(qb),phase=(u+P.slice(0,off).filter(x=>x!==0).length)%qa,first=p.find(x=>x!==0);
K[phase][1]=mod(-K[phase][0]*first);J[v][1]=mod(-J[v][0]*first);
const a=enc(P,K,u),b=enc(p,J,v),holds=p.map((x,i)=>x===0?i:-1).filter(x=>x>=0),s=scan(a,b,qa,qb);
const hit=s.survivors.find(x=>x.status==="accept"&&x.off===off&&x.holds.join(",")===holds.join(","));
assert(hit,"missing planted solution");let truth=false;
for(const c of hit.normalized)for(let alpha=1;alpha<29;alpha++)for(let beta=0;beta<29;beta++)if(c.p.every((x,i)=>x===null?p[i]===0:mod(alpha*x+beta)===p[i]))truth=true;
assert(truth,"true text missing");
controls.push({qa,qb,name,off,rank:hit.rank,nullity:hit.nullity,count:hit.count,acceptedOffsets:[...new Set(s.survivors.filter(x=>x.status==="accept").map(x=>x.off))],unresolved:s.survivors.filter(x=>x.status==="unresolved").length,trueInOrbit:truth});
}
const original=[[8,13],[13,8]].map(([a,b])=>scan(A,B,a,b));return {controls,original};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,"..");const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));console.log(JSON.stringify(run(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));}
module.exports={run};
