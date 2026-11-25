"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8");
function run(gp,refs){
 const M=29,Q=8,E=12,F=0,SPACE=29,mod=x=>(x%M+M)%M;
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function native(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");if(out.length)out.push(SPACE);while(w){const t=tokens.find(t=>w.startsWith(t.t));if(!t)throw Error("unsupported "+w);out.push(t.i);w=w.slice(t.t.length)}}return out}
 function encode(p){const c=[],boundary=[true],spaces=[];for(const x of p){if(x===SPACE||x===E){if(x===SPACE)spaces.push(c.length);c.push(E,x===SPACE?F:E);boundary.push(false,true)}else{c.push(x);boundary.push(true)}}return {c,boundary,spaces}}
 function decode(c,allowPending=false){const p=[],spaces=[],invalid=[];let pending=false;for(let i=0;i<c.length;i++){const x=c[i];if(!pending){if(x===E)pending=true;else p.push(x)}else{if(x===E)p.push(E);else if(x===F){p.push(SPACE);spaces.push(i-1)}else invalid.push(i);pending=false}}if(pending&&!allowPending)invalid.push(c.length);return {p,spaces,invalid,pending}}
 const encrypt=(p,k)=>p.map((x,i)=>mod(x+k[i%Q]));const decrypt=(c,k)=>c.map((x,i)=>mod(x-k[i%Q]));
 function capacity(C,q=Q,m=M,e=E,f=F){
  const A=Array.from({length:q},()=>new Int32Array(m*m));
  for(let i=0;i<C.length-1;i++)A[i%q][((C[i]-e+m)%m)*m+((C[i+1]-f+m)%m)]++;
  let best=-1,keys=0,bestKey=null;
  for(let a=0;a<m;a++){
   let d=new Int32Array(m).fill(-1000000),n=new Float64Array(m),codes=new Float64Array(m);d[a]=0;n[a]=1;codes[a]=a;
   for(let j=1;j<q;j++){const nd=new Int32Array(m).fill(-1000000),nn=new Float64Array(m),nc=new Float64Array(m);for(let x=0;x<m;x++)if(n[x])for(let y=0;y<m;y++){const val=d[x]+A[j-1][x*m+y];if(val>nd[y]){nd[y]=val;nn[y]=n[x];nc[y]=codes[x]*m+y}else if(val===nd[y])nn[y]+=n[x]}d=nd;n=nn;codes=nc}
   for(let x=0;x<m;x++)if(n[x]){const val=d[x]+A[q-1][x*m+a];if(val>best){best=val;keys=n[x];let code=codes[x];bestKey=Array(q);for(let i=q-1;i>=0;i--){bestKey[i]=code%m;code=Math.floor(code/m)}}else if(val===best)keys+=n[x]}
  }
  return {maxPairs:best,maximizers:keys,key:bestKey,independentEdgeBound:A.reduce((s,t)=>s+t.reduce((a,b)=>Math.max(a,b),0),0)}
 }
 let seed=0x27313301;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 // Verify complete cycle max and tie count against exhaustive small alphabets.
 for(let t=0;t<30;t++){const m=3,q=4,e=1,f=0,C=Array.from({length:23},()=>rng()%m);const got=capacity(C,q,m,e,f);let b=-1,n=0;for(let z=0;z<m**q;z++){let k=Array.from({length:q},(_,i)=>Math.floor(z/m**i)%m);let v=0;for(let i=0;i<C.length-1;i++)if((C[i]-k[i%q]+m)%m===e&&(C[i+1]-k[(i+1)%q]+m)%m===f)v++;if(v>b){b=v;n=1}else if(v===b)n++}if(b!==got.maxPairs||n!==got.maximizers)throw Error("toy mismatch")}
 const lp1=refs[0].split(/\r?\n/).filter(l=>l.trim()&&!/^\s*(#|\[|\(continued)/.test(l)&&!/^[0-9a-f]{25,}$/i.test(l.trim())).join(" ");
 const names=["LP1 solved normalized","Emerson Essays","Gibran Prophet","Shakespeare"];
 const donor=[lp1,...refs.slice(1)].map(s=>encode(native(s)));
 const a=gp.pages.find(p=>p.page===54).indices,b=gp.pages.find(p=>p.page===55).indices,fit=a.length,hold=b.length,total=fit+hold;
 function bounds(d,L){const pre=new Int32Array(d.c.length+1);for(const i of d.spaces)pre[i+1]=1;for(let i=1;i<pre.length;i++)pre[i]+=pre[i-1];let min=Infinity,max=-Infinity,n=0,at=-1;for(let i=0;i+L<=d.c.length;i++){if(!d.boundary[i]||!d.boundary[i+L])continue;const v=pre[i+L]-pre[i];n++;if(v<min){min=v;at=i}max=Math.max(max,v)}return {windows:n,min:Number.isFinite(min)?min:null,max:Number.isFinite(max)?max:null,minStart:at}}
 function inspect(C,truth=null,k=null){const x=capacity(C.slice(0,fit)),p=decrypt(C,x.key),g=decode(p),prefix=decode(p.slice(0,fit),true);const reen=encrypt(p,x.key).every((v,i)=>v===C[i]);const trueDecoded=truth?decode(truth):null;return {fit:x,exactKey:k?String(k)===String(x.key):null,trueKey:k,fitSpacePairs:prefix.spaces.length,wholeSpaces:g.spaces.length,wholeGrammarErrors:g.invalid,heldoutCorrect:truth?p.slice(fit).filter((v,i)=>v===truth[fit+i]).length:null,heldoutBoundariesCorrect:truth?String(g.spaces.filter(i=>i>=fit-1))===String(trueDecoded.spaces.filter(i=>i>=fit-1)):null,replay:reen,display:g.p.map(v=>v===SPACE?" ":gp.translit[v]).join("")}}
 const plants=[],pads=[];
 for(let i=0;i<8;i++){const d=donor[i%4];let j=[100,2000,700,8000,850,10000,2000,19000][i];while(j+total<=d.c.length&&(!d.boundary[j]||!d.boundary[j+total]))j++;if(j+total>d.c.length)throw Error("short donor "+i);const p=d.c.slice(j,j+total),k=Array.from({length:Q},()=>rng()%M);plants.push({donor:names[i%4],start:j,trueSpaces:decode(p).spaces.length,...inspect(encrypt(p,k),p,k)});const c=Array.from({length:total},()=>rng()%M);pads.push({i,...inspect(c)})}
 const original=inspect(a.concat(b)),full=capacity(a.concat(b));
 const nativeBounds=donor.map((d,i)=>({name:names[i],encodedLength:d.c.length,fit:bounds(d,fit),full:bounds(d,total)}));
 // Bound each art chapter independently, allowing its own arbitrary q8 key.
 const ranges=[[0,5],[6,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 // Chapter ranges above are not asserted to be canonical; whole-manuscript and terminal only are used.
 return {fit,hold,total,alphabet:gp.translit,controlSeed:"0x27313301",toyExactChecks:30,nativeBounds,plants,pads,original,fullCapacity:full,wholeBookCapacity:capacity(gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices)),wholeBookLength:gp.pages.filter(p=>p.page<=55).reduce((s,p)=>s+p.indices.length,0)}
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp1-plaintext-reference.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
console.log(JSON.stringify(run(JSON.parse(read(paths[0])),paths.slice(1).map(read)),null,2));
