"use strict";
// General exact q8 mandatory collision-redraw receiver, all zero-edge necklaces.
// Original full-tape search is retrospective. No language or printed spacing in key enumeration.
function run(co,gibran,target="original",selector="all"){
const q=8,A=29,m=x=>((x%29)+29)%29;
const rol=(x,k)=>((x<<k)|(x>>(8-k)))&255;
const R1=Uint8Array.from({length:256},(_,x)=>rol(x,1)),R2=Uint8Array.from({length:256},(_,x)=>rol(x,2));
const pop=x=>{let n=0;while(x){x&=x-1;n++}return n};
const gcd=(a,b)=>b?gcd(b,a%b):a;
const rotate=(D,k)=>D.slice(k).concat(D.slice(0,k));
const minrot=Z=>Math.min(...Array.from({length:8},(_,k)=>rol(Z,k)));
function canonical(D,stabilizer){for(let k of stabilizer)if(k){for(let j=0;j<8;j++){if(D[j]<D[(j+k)%8])break;if(D[j]>D[(j+k)%8])return false}}return true}
const pack=D=>D.reduce((a,b)=>a*29+b,0);
function keyOf(D){let k=[0];for(let j=0;j<7;j++)k.push(m(k[j]+D[j]));if(m(k[7]+D[7])!==0)throw Error("nonclosed");return k}
function intervals(d){let r=[];for(let i=0;i<d.length;i++)if(!d[i])r.push(i);return r.slice(1).map((b,i)=>({a:r[i],b,gap:b-r[i],v:d.slice(r[i]+1,b)}))}
function partials(Z,iv){let D=Array.from({length:8},(_,j)=>Z&(1<<j)?0:-1),res=new Map();
function go(i,j){if(i===iv.v.length){if(Z&(1<<j)){let p=D.slice(),id=p.join(",");res.set(id,p)}return}
go(i+1,(j+1)%8);let x=iv.v[i];if(D[j]===x)go(i+1,(j+2)%8);else if(D[j]===-1){D[j]=x;go(i+1,(j+2)%8);D[j]=-1}}
for(let j=0;j<8;j++)if(Z&(1<<j))go(0,(j+2)%8);
let ps=[...res.values()].sort((a,b)=>a.filter(x=>x!==-1).length-b.filter(x=>x!==-1).length),minimal=[];
for(let p of ps)if(!minimal.some(s=>s.every((x,j)=>x===-1||x===p[j])))minimal.push(p);
return minimal}
function bound(p){let u=p.filter(x=>x===-1).length;return u?28**(u-1):+(m(p.reduce((a,b)=>a+b,0))===0)}
function minSkips(Z,g){let s=R2[Z];for(let h=0;h<=g-1&&h<8;h++)if(rol(s,(g-1+h)%8)&Z)return h;return Infinity}
function theoretical(Z){let f=8-pop(Z),stab=Array.from({length:8},(_,i)=>i).filter(k=>rol(Z,k)===Z);let count=0;for(let k of stab){let L=8/gcd(8,k),v=f/L;count+=(28**v+28*(-1)**v)/29}return {count:count/stab.length,stab}}
function search(d,Z){let iv=intervals(d),th=theoretical(Z),free=Array.from({length:8},(_,i)=>i).filter(j=>!(Z&(1<<j))),start=R2[Z];
let filters=iv.map(x=>({...x,h:minSkips(Z,x.gap)})).filter(x=>x.h>0).sort((a,b)=>a.v.length/a.h-b.v.length/b.h);
if(filters.some(x=>!Number.isFinite(x.h)))return {Z,z:pop(Z),theoretical:th.count,seedGap:null,generated:0,canonicalGenerated:0,independentRaw:0,fullRaw:0,full:0,keys:[],impossibleGap:true};
let base=Array.from({length:8},(_,j)=>Z&(1<<j)?0:-1),chosen=[base],bnd=bound(base),seedGap=null;
for(let x of filters.filter(x=>x.gap<=16)){let p=partials(Z,x),b=p.reduce((s,x)=>s+bound(x),0);if(b<bnd){chosen=p;bnd=b;seedGap={a:x.a+1,b:x.b+1,gap:x.gap,partials:p.length};if(!b)break}}
let M=new Uint8Array(29),generated=0,canonicalGenerated=0,independentRaw=0,fullRaw=0,unique=new Map(),stage=new Uint32Array(filters.length);
function adv(S,v){for(let i=0;i<v.length;i++){S=R1[S]|R2[S&M[v[i]]];if(S===255)break}return S}
function examine(D){generated++;if(!canonical(D,th.stab))return;canonicalGenerated++;
for(let j of free)M[D[j]]|=1<<j;
let ok=true;for(let i=0;i<filters.length;i++){if(!(adv(start,filters[i].v)&Z)){ok=false;break}stage[i]++}
if(ok){independentRaw++;let S=start;for(let x of iv){S=R2[adv(S,x.v)&Z];if(!S){ok=false;break}}if(ok){fullRaw++;let id=pack(D);if(!unique.has(id))unique.set(id,D.slice())}}
for(let j of free)M[D[j]]=0}
function complete(D){let u=[];let s=0;for(let j=0;j<8;j++){if(D[j]===-1)u.push(j);else s+=D[j]}function go(i,sum){if(i===u.length){if(m(sum)===0)examine(D);return}let j=u[i];if(i===u.length-1){let x=m(-sum);if(x){D[j]=x;examine(D);D[j]=-1}return}for(let x=1;x<29;x++){D[j]=x;go(i+1,sum+x)}D[j]=-1}go(0,s)}
for(let p of chosen)complete(p.slice());
return {Z,z:pop(Z),theoretical:th.count,seedGap,seedUpperBound:bnd,generated,canonicalGenerated,independentRaw,fullRaw,full:unique.size,keys:[...unique.values()],filters:filters.map((x,i)=>({gap:x.gap,a:x.a+1,b:x.b+1,passingRaw:stage[i]}))}}
function eng(s){let a=s.toUpperCase().replace(/[^A-Z]+/g," ").replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");let out=[];for(let i=0;i<a.length;){if(a[i]===" "){i++;continue}let v=co.translit.indexOf(a.slice(i,i+2));if(v>=0){out.push(v);i+=2}else{v=co.translit.indexOf(a[i++]);if(v>=0)out.push(v)}}return out}
let seed=0x6273beaf;
function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return ((seed>>>0)+.5)/4294967296}
function rand(n){return Math.floor(rng()*n)}
function randomD(Z){let u=Array.from({length:8},(_,j)=>j).filter(j=>!(Z&(1<<j))),D;do{D=Array.from({length:8},(_,j)=>Z&(1<<j)?0:1+rand(28));D[u.at(-1)]=m(-D.reduce((a,b)=>a+b,0)+D[u.at(-1)])}while(!D[u.at(-1)]);return D}
function emit(p,D){let k=keyOf(D).map(x=>m(x+11)),j=rand(q),prev=-1,c=[],skips=0;for(let x of p){let y=m(x+k[j]);j=(j+1)%q;if(y===prev){y=m(x+k[j]);j=(j+1)%q;skips++}c.push(y);prev=y}return {c,skips}}
let truth=null,c,skips=null,Zs;
if(target==="original"){c=co.pages.slice(0,56).flatMap(p=>p.indices);Zs=Array.from({length:255},(_,i)=>i+1).filter(Z=>minrot(Z)===Z&&pop(Z)!==7&&Z!==17);if(selector!=="all")Zs=Zs.filter(Z=>pop(Z)===Number(selector))}
else{let Z=Number(selector);if(!Z||Z>=255||pop(Z)===7)throw Error("invalid plant pattern");Z=minrot(Z);Zs=[Z];truth=randomD(Z);let p=eng(gibran).slice(19000,19000+12956),plant=emit(p,truth);c=plant.c.slice(0,9640);skips=plant.skips}
let d=Uint8Array.from(c.slice(1),(x,i)=>m(x-c[i])),results=Zs.map(Z=>search(d,Z));
let truePresent=truth?results[0].keys.some(D=>Array.from({length:8},(_,k)=>rotate(truth,k)).some(t=>D.every((x,j)=>x===t[j]))):null;
if(truth&&!truePresent)throw Error("true ring excluded");
return {target,selector,n:c.length,repeats:d.filter(x=>x===0).length,truth,truePresent,skips,results}
}
if(typeof module!=="undefined"){module.exports=run;if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/control/gibran_prophet_58585.txt"),process.argv[2]||"original",process.argv[3]||"all"),null,2))}}
