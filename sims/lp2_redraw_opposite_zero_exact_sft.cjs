"use strict";
// Exhaustive q8 strict collision-redraw inverse, conditional on opposite equal-key edges.
// Enumerates every modularly closed difference ring, modulo the half-turn preserving Z.
function run(co,gibran,target="original"){
const q=8,A=29,Z=(1<<3)|(1<<7),m=x=>((x%29)+29)%29;
const R1=Uint8Array.from({length:256},(_,x)=>((x<<1)|(x>>7))&255),R2=Uint8Array.from({length:256},(_,x)=>((x<<2)|(x>>6))&255);
let seed=0x3fe2876b;
function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return ((seed>>>0)+.5)/4294967296}
function rand(n){return Math.floor(rng()*n)}
function eng(s){let a=s.toUpperCase().replace(/[^A-Z]+/g," ").replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");let out=[];for(let i=0;i<a.length;){if(a[i]===" "){i++;continue}let v=co.translit.indexOf(a.slice(i,i+2));if(v>=0){out.push(v);i+=2}else{v=co.translit.indexOf(a[i++]);if(v>=0)out.push(v)}}return out}
function keyOf(D){let k=[0];for(let j=0;j<7;j++)k.push(m(k[j]+D[j]));if(m(k[7]+D[7])!==0)throw Error("nonclosed");return k}
function emit(p,D){let k=keyOf(D).map(x=>m(x+11)),j=rand(q),prev=-1,c=[],skips=0;for(let x of p){let y=m(x+k[j]);j=(j+1)%q;if(y===prev){y=m(x+k[j]);j=(j+1)%q;skips++}c.push(y);prev=y}return {c,skips}}
function canon(D){return D.slice(0,4).join(",")<D.slice(4).join(",")?D:D.slice(4).concat(D.slice(0,4))}
function pack(D){return [D[0],D[1],D[2],D[4],D[5],D[6]].reduce((a,b)=>29*a+b,0)}
function unpack(n){let D=Array(8).fill(0);for(let j of [6,5,4,2,1,0]){D[j]=n%29;n=Math.floor(n/29)}return D}
function diff(c){return Uint8Array.from(c.slice(1),(x,i)=>m(x-c[i]))}
function intervals(d){let r=[];for(let i=0;i<d.length;i++)if(!d[i])r.push(i);return r.slice(1).map((b,i)=>({a:r[i],b,gap:b-r[i],v:d.slice(r[i]+1,b)}))}
function hard(d,D,initial){let a=initial?Float64Array.from(initial):new Float64Array(q).fill(1/q),b=new Float64Array(q),ll=0;for(let i=0;i<d.length;i++){let x=d[i];b.fill(0);for(let j=0;j<q;j++){if(x)b[(j+1)%q]+=a[j];if(x===D[j])b[(j+2)%q]+=a[j]}if(!x||i===d.length-1||(i&127)===127){let z=b.reduce((s,v)=>s+v,0);if(!z)return {ll:-Infinity,phase:null};ll+=Math.log(z);for(let j=0;j<q;j++)b[j]/=z}[a,b]=[b,a]}return {ll,phase:Array.from(a)}}
function search(d){let iv=intervals(d),filters=iv.filter(x=>x.gap%4!==3).sort((a,b)=>a.v.length/((3-a.gap%4+4)%4)-b.v.length/((3-b.gap%4+4)%4));
let masks=new Uint8Array(29),stage=new Uint32Array(filters.length+1),eligible=0,full=0,survivors=[],truthSeen=false;
const start=R2[Z];
function advance(S,v){for(let i=0;i<v.length;i++){S=R1[S]|R2[S&masks[v[i]]];if(S===255)break}return S}
function examine(a,b,c,e,f,g){
 // lexicographic half-turn representative (numeric, not string).
 if(a>e||(a===e&&(b>f||(b===f&&c>g))))return;
 eligible++;
 masks[a]|=1;masks[b]|=2;masks[c]|=4;masks[e]|=16;masks[f]|=32;masks[g]|=64;
 let ok=true;
 for(let i=0;i<filters.length;i++){if(!(advance(start,filters[i].v)&Z)){ok=false;break}stage[i]++}
 if(ok){stage[filters.length]++;let S=start;for(let x of iv){S=R2[advance(S,x.v)&Z];if(!S){ok=false;break}}
 if(ok){full++;if(survivors.length<200000)survivors.push([a,b,c,0,e,f,g,0])}}
 masks[a]=masks[b]=masks[c]=masks[e]=masks[f]=masks[g]=0;
}
for(let a=1;a<29;a++)for(let b=1;b<29;b++)for(let c=1;c<29;c++)for(let e=a;e<29;e++)for(let f=1;f<29;f++){let g=m(-a-b-c-e-f);if(g)examine(a,b,c,e,f,g)}
const expected=((28**6+28)/29+(28**3-28)/29)/2;if(eligible!==expected)throw Error("enumeration count mismatch "+eligible+" != "+expected);
return {eligible,filters:filters.map((x,i)=>({gap:x.gap,a:x.a+1,b:x.b+1,passing:stage[i]})),independentAll:stage[filters.length],full,survivors,truncated:full>survivors.length}}
let truth=null,skips=null,p=null,c;
if(target==="gibran"){
 // Exactly the Gibran plant that defeated the previous EM method.
 seed=(0x3f910aaa+0x517cc1)>>>0;let D;do{D=[1+rand(28),1+rand(28),1+rand(28),0,1+rand(28),1+rand(28),1+rand(28),0];D[6]=m(-D.reduce((a,b)=>a+b,0)+D[6])}while(!D[6]);truth=D;p=eng(gibran).slice(19000,19000+12956);let plant=emit(p,D);c=plant.c;skips=plant.skips;
}else c=co.pages.slice(0,56).flatMap(p=>p.indices);
if(c.length!==12956)throw Error("bad corpus length");
let d=diff(c),cut=9640,tr=d.slice(0,cut-1),ho=d.slice(cut-1),s=search(tr),ranked=null;
let truePresent=truth?s.survivors.some(D=>D.every((x,i)=>x===truth[i])||D.every((x,i)=>x===truth[(i+4)%8])):null;
if(truth&&!truePresent&&!s.truncated)throw Error("true key excluded");
if(s.full<=20000){ranked=s.survivors.map(D=>({D,...hard(tr,D)})).sort((a,b)=>b.ll-a.ll);for(let x of ranked.slice(0,10)){let h=hard(ho,x.D,x.phase);x.heldLL=h.ll}ranked=ranked.slice(0,10)}
return {target,cut,n:c.length,skips,truth,truePresent,trueLL:truth?hard(tr,truth).ll:null,eligible:s.eligible,filters:s.filters,independentAll:s.independentAll,full:s.full,truncated:s.truncated,ranked,allSurvivors:s.full<=10000?s.survivors:null}
}
if(typeof module!=="undefined"){module.exports=run;if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/control/gibran_prophet_58585.txt"),process.argv[2]||"original"),null,2))}}
