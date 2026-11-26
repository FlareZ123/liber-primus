"use strict";
// Agent10: spacing-free pinned signed-prose crib receiver. Run from repo root, Node 22.
// Remote donor retrieval only on explicit execution. Source IDs and profile checked.
const fs=require("node:fs"),crypto=require("node:crypto");
const common=require("./lp2_shared_cycle_native_crib_sft.cjs");
const gp="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" "),idx=new Map(gp.map((x,i)=>[x,i]));
const mod=x=>((x%29)+29)%29,inv=Array.from({length:29},(_,v)=>{for(let x=1;x<29;x++)if(v*x%29===1)return x;return 0});
function assert(ok,msg){if(!ok)throw Error(msg)}
function manifest(meta){
 const a=meta.sources.filter(x=>x.source_type.startsWith("Original")).map(x=>[x.source_repo,x.source_commit,x.source_path,x.original_git_blob_sha1]);
 const repo="iBotPeaches/cicada_3301",ref="a0a616d85717af59f8b806875b43d51e06e1e874";
 for(const [path,sha] of [["messages/2014/the-work-of-a-private-man.asc","1f9a61b97d5de9c4ca57402c064365a503d956a9"],["messages/2014/liber_primus/10.jpg.asc","0f24ac3146f6c91df23e211e8588f6e9b67b6dce"],["messages/2014/hello-you-have-done-well.asc","14470df9fd76f4d1599ab12e63b77d1a143d46af"]])a.push([repo,ref,path,sha]);
 for(const [name,sha] of [["cicada2012-countdown-message.asc","7229104f48f4a0eeeae69c901eb74cb21baed956"],["cicada2012-message-only-displayed.asc","672184615cf25d19e5eb177875be83b4d83c1128"],["cicada2013-forest-clue.asc","78d4eaf01df3e13e8d3aba0a113cee7c76523ce0"],["cicada2014-stage11-message.asc","e2b7382ac2cfb0adfe028cc063fc6048e0ad718e"]])a.push(["FlareZ123/liber-primus","45b303f517c4540abba838ff9edae4e88e9a9b2c","resources/historical/"+name,sha]);
 return a;
}
function norm(s){return s.toUpperCase().match(/[A-Z]+/g)?.flatMap(w=>{w=w.replaceAll("QU","CW").replaceAll("ING","NG").replaceAll("IO","IA").replaceAll("V","U").replaceAll("K","C").replaceAll("Q","C").replaceAll("Z","S");const out=[];for(let i=0;i<w.length;){const d=w.slice(i,i+2);if(d.length===2&&idx.has(d)){out.push(idx.get(d));i+=2}else out.push(idx.get(w[i++]));}return out})??[]}
function segments(raw){const body=raw.replace(/\r/g,"").split(/\n\n/).slice(1).join("\n\n").split("\n-----BEGIN PGP SIGNATURE-----")[0];const seg=[];let p=[];const flush=()=>{if(p.length)seg.push(p);p=[]};for(const l of body.split("\n")){const s=l.trim();if(!s)continue;if(/-----BEGIN/.test(s))break;if(/https?:\/\/|\.onion\b|[A-Fa-f0-9]{32,}|^[\d\s:.,;+\-/]+$|^[A-Za-z0-9+/=]{40,}$/.test(s)){flush();continue}p.push(...norm(s))}flush();return seg}
function register(items,raw){
 const D=[],seen=new Set(),profile=[];
 for(let j=0;j<items.length;j++){const parts=segments(raw[j]);profile.push(parts.map(p=>p.length).join(","));for(let k=0;k<parts.length;k++){const P=parts[k],key=P.join(",");if(seen.has(key))continue;seen.add(key);D.push({name:items[j][2]+":"+k,P})}}
 assert(profile.join(";")==="997;185,16,9;130;107;35,8;27;22,8;21;1693;1693;73,13;159,8;340;73;107;49;31,34","source profile mismatch "+profile.join(";"));
 assert(D.length===21,"unique segment count");
 return D;
}
function independentIndex(C,D,q,L,fixedStart=null){
 const masks=new Map();let windows=0;
 for(let donor=0;donor<D.length;donor++){const P=D[donor].P;for(let j=0;j+L<=P.length;j++){const h=[];for(let t=0;t<L;t++)if(!P[j+t])h.push(t);const mk=h.join(","),s=common.signature(P,j,L,q,h);if(!masks.has(mk))masks.set(mk,new Map());const mm=masks.get(mk);if(!mm.has(s))mm.set(s,[]);mm.get(s).push([donor,j]);windows++}}
 const rows=[];let lookups=0,maxF=0;
 for(let i=fixedStart??0;i+L<=C.length&&(fixedStart===null||i===fixedStart);i++){const z=[];for(let t=0;t<L;t++)if(!C[i+t])z.push(t);maxF=Math.max(maxF,z.length);assert(z.length<31,"mask overflow");for(let k=0;k<(1<<z.length);k++){const h=[];for(let b=0;b<z.length;b++)if(k&(1<<b))h.push(z[b]);const mm=masks.get(h.join(","));if(!mm)continue;lookups++;const a=mm.get(common.signature(C,i,L,q,h));if(a)for(const [donor,j] of a)rows.push({donor,j,i})}}
 return {q,L,windows,maskTypes:masks.size,lookups,maxF,count:rows.length,rows}
}
function separateSolve(P,j,C,i,L,q,limit=2e6){
 const pa=[...new Set(P.slice(j,j+L).filter(x=>x))].sort((a,b)=>a-b),cb=[...new Set(C.slice(i,i+L).filter(x=>x))].sort((a,b)=>a-b);
 const ia=new Map(pa.map((x,k)=>[x,k])),ib=new Map(cb.map((x,k)=>[x,k+pa.length])),off=pa.length+cb.length,n=off+q,rows=[];let phase=0;
 for(let t=0;t<L;t++){const p=P[j+t],c=C[i+t];if(!p){if(c)return {status:"F"};continue}const row=new Int32Array(n+1);row[ia.get(p)]--;if(c)row[ib.get(c)]++;row[off+phase]--;rows.push(Array.from(row,mod));phase=(phase+1)%q}
 if(!cb.length)return {status:"unresolved"};
 const gauge=new Array(n+1).fill(0);gauge[ib.get(cb[0])]=1;gauge[n]=1;rows.push(gauge);
 let piv=[],r=0;for(let k=0;k<n;k++){let s=r;while(s<rows.length&&!rows[s][k])s++;if(s===rows.length)continue;[rows[r],rows[s]]=[rows[s],rows[r]];const iv=inv[rows[r][k]];for(let t=k;t<=n;t++)rows[r][t]=mod(rows[r][t]*iv);for(let u=0;u<rows.length;u++)if(u!==r&&rows[u][k]){const m=rows[u][k];for(let t=k;t<=n;t++)rows[u][t]=mod(rows[u][t]-m*rows[r][t])}piv.push(k);r++}
 if(rows.slice(r).some(x=>x[n]))return {status:"inconsistent",rank:r};
 const free=Array.from({length:n},(_,k)=>k).filter(k=>!piv.includes(k)),d=free.length,forms=Array.from({length:n},()=>new Int8Array(d+1));
 for(let k=0;k<d;k++)forms[free[k]][k+1]=1;
 for(let t=0;t<r;t++){const x=forms[piv[t]];x[0]=rows[t][n];for(let k=0;k<d;k++)x[k+1]=mod(-rows[t][free[k]])}
 for(const list of [forms.slice(0,pa.length),forms.slice(pa.length,off)]){const seen=new Set([new Int8Array(d+1).join(",")]);for(const x of list){const k=x.join(",");if(seen.has(k))return {status:"forced_equal_labels",rank:r};seen.add(k)}}
 const num=29**d;if(num>limit)return {status:"unresolved",rank:r,nullity:d,num};
 const actions=[];for(let a=0;a<num;a++){let z=a;const xs=[];for(let k=0;k<d;k++){xs.push(z%29);z=Math.floor(z/29)}const v=forms.map(f=>mod(f[0]+xs.reduce((s,x,k)=>s+x*f[k+1],0)));const av=v.slice(0,pa.length),bv=v.slice(pa.length,off);if(av.includes(0)||bv.includes(0)||new Set(av).size!==av.length||new Set(bv).size!==bv.length)continue;const alpha=new Array(29).fill(null),beta=new Array(29).fill(null);alpha[0]=beta[0]=0;pa.forEach((x,k)=>alpha[x]=av[k]);cb.forEach((x,k)=>beta[x]=bv[k]);actions.push({alpha,beta,K:v.slice(off)})}
 return {status:actions.length?"feasible":"enumerated_no_permutation",rank:r,nullity:d,observed:[pa.length+1,cb.length+1],actions,gauge:cb[0]}
}
function makeKey(q,seed,separate){let s=seed>>>0;const rng=n=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)%n};const perm=()=>{const a=Array.from({length:29},(_,i)=>i);for(let i=28;i>=2;i--){const j=1+rng(i);[a[i],a[j]]=[a[j],a[i]]}return a};const alpha=perm(),beta=separate?perm():alpha;return {alpha,beta,K:Array.from({length:q},()=>rng(29))}}
function encode(P,{alpha,beta,K},phase=0){return P.map(p=>{if(!p)return 0;const v=mod(alpha[p]+K[phase]);phase=(phase+1)%K.length;return beta.indexOf(v)})}
function predict(P,{alpha,beta,K},phase){return P.map(p=>{if(!p)return 0;const v=alpha[p]===null?null:mod(alpha[p]+K[phase]);phase=(phase+1)%K.length;return v===null||!beta.includes(v)?null:beta.indexOf(v)})}
function control(D,q,donor,j,seed,separate){
 const fit=separate?96:160,hold=64,P=D[donor].P.slice(j,j+fit+hold),key=makeKey(q,seed,separate),C=encode(P,key),phase=P.slice(0,fit).filter(Boolean).length%q;
 const z=separate?independentIndex(C.slice(0,fit),D,q,fit,0):common.indexed(C.slice(0,fit),D,q,fit,0);const hits=[];let unresolved=0;
 for(const row of z.rows){const s=(separate?separateSolve:common.solve)(D[row.donor].P,row.j,C,0,fit,q);if(s.status==="feasible")hits.push({...row,...s});if(s.status==="unresolved")unresolved++}
 assert(!unresolved&&hits.length===1&&hits[0].donor===donor&&hits[0].j===j,"control alignment");const h=hits[0];
 if(!separate){const scale=inv[key.alpha[1]],a=h.one;assert(h.count===1&&a.pi.every((x,k)=>x===mod(scale*key.alpha[k]))&&a.K.every((x,k)=>x===mod(scale*key.K[k])),"common key");const paths=common.inversePaths(C.slice(fit),a.pi,a.K,phase);assert(paths.some(x=>x.join(",")===P.slice(fit).join(",")),"common holdout");return {q,rank:h.rank,paths:paths.length,exactKey:true}}
 const scale=inv[key.beta[h.gauge]];assert(h.actions.some(a=>a.alpha.every((v,k)=>v===null||v===mod(key.alpha[k]*scale))&&a.beta.every((v,k)=>v===null||v===mod(key.beta[k]*scale))&&a.K.every((v,k)=>v===mod(key.K[k]*scale))),"planted partial action");
 const pp=h.actions.map(a=>predict(P.slice(fit),a,phase));let unanimous=0;for(let t=0;t<hold;t++)if(pp.every(p=>p[t]!==null&&p[t]===C[fit+t]))unanimous++;
 return {q,rank:h.rank,observed:h.observed,actions:h.actions.length,unanimous,patterns:new Set(pp.map(p=>p.join(","))).size};
}
function scan(C,D){const out=[];for(const q of [8,13]){const z=common.indexed(C,D,q,48),hist={};for(const x of z.rows){const a=common.solve(D[x.donor].P,x.j,C,x.i,48,q);hist[a.status]=(hist[a.status]??0)+1}delete z.rows;out.push({model:"common",...z,hist,alignments:(C.length-47)*z.windows})}for(const q of [8,13]){const z=independentIndex(C,D,q,96);delete z.rows;out.push({model:"independent",...z,alignments:(C.length-95)*z.windows})}return out}
async function main(){const meta=JSON.parse(fs.readFileSync("resources/derived/cicada2012-2013-prose-gp-wordlengths.json","utf8")),items=manifest(meta),raw=[];for(const [repo,ref,path,sha] of items){const url="https://raw.githubusercontent.com/"+repo+"/"+ref+"/"+path;const b=repo==="FlareZ123/liber-primus"?fs.readFileSync(path):Buffer.from(await (await fetch(url)).arrayBuffer());assert(crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex")===sha,"blob mismatch "+path);raw.push(b.toString("utf8"))}const D=register(items,raw),C=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8")).pages.filter(p=>p.page<56).flatMap(p=>p.indices);assert(C.length===12956,"canonical length");const a=D.findIndex(x=>x.name.includes("welcome-and-congratulations")),b=D.findIndex(x=>x.name.includes("do-not-share-this-information.asc"));const controls=[control(D,8,a,37,0x5c90ad,false),control(D,13,b,43,0x924c71,false),control(D,8,a,200,0x91d6e2,true),control(D,13,b,280,0x352a61,true)];console.log(JSON.stringify({controls,outputs:scan(C,D)},null,2))}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1});
module.exports={manifest,register,independentIndex,separateSolve,control,scan,encode};
