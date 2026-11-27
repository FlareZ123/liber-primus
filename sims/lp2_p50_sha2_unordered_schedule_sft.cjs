'use strict';
// Unordered intact-word SHA-2 necessary condition; no key search.
function run(grid){
const tokens=grid.pages.flatMap(p=>p.tokens), alphabet=grid.alphabet;
if(tokens.length!==256||grid.bytes.length!==256)throw Error("source shape");
function bytes(radix){let a=radix===59?alphabet.replace("f",""):alphabet;return tokens.map(t=>{let x=a.indexOf(t[0]),y=a.indexOf(t[1]);if(x<0||y<0||x*radix+y>255)throw Error("invalid token "+t);return x*radix+y;});}
if(bytes(60).some((v,i)=>v!==grid.bytes[i]))throw Error("source mismatch");
function spec(bits){let M=(1n<<BigInt(bits))-1n, rr=(x,n)=>((x>>BigInt(n))|(x<<BigInt(bits-n)))&M;
return {M,s0:bits===32?x=>rr(x,7)^rr(x,18)^(x>>3n):x=>rr(x,1)^rr(x,8)^(x>>7n),s1:bits===32?x=>rr(x,17)^rr(x,19)^(x>>10n):x=>rr(x,19)^rr(x,61)^(x>>6n)};}
function word(b){return b.reduce((a,v)=>(a<<8n)|BigInt(v),0n);}
function slots(b,bits){let n=bits/8;return Array.from({length:b.length/n},(_,i)=>b.slice(i*n,(i+1)*n));}
function inspect(blocks,bits){
let {M,s0,s1}=spec(bits), W=blocks.flatMap((b,i)=>[{i,v:word(b)},{i,v:word([...b].reverse())}]);W=W.filter((x,j)=>j%2===0||x.v!==W[j-1].v);
let rows=W.map(x=>({...x,a:s0(x.v),b:s1(x.v)})), pairs=new Map();
for(let x of rows)for(let y of rows)if(x.i!==y.i){let k=(x.b+y.v)&M;let p=pairs.get(k)||[];p.push([x.i,y.i]);pairs.set(k,p);}
let out=new Set(), edges=0, examples=[];
for(let z of rows)for(let u of rows)if(z.i!==u.i)for(let v of rows)if(v.i!==z.i&&v.i!==u.i){
let matches=pairs.get((z.v-u.v-v.a)&M);if(!matches)continue;
for(let [x,y] of matches)if(x!==z.i&&x!==u.i&&x!==v.i&&y!==z.i&&y!==u.i&&y!==v.i){out.add(z.i);edges++;if(examples.length<12)examples.push([z.i,x,u.i,v.i,y]);}
}
return {wordSlots:blocks.length,orientations:W.length,requiredOutputSlots:blocks.length-16,possibleOutputSlots:out.size,localEquations:edges,outputIndices:[...out].sort((a,b)=>a-b),examples};
}
let results=[];
for(let radix of [60,59]){let b=bytes(radix);for(let layout of ["row","column"]){let v=layout==="row"?b:Array.from({length:256},(_,i)=>b[(i%32)*8+Math.floor(i/32)]);for(let bits of [32,64])results.push({radix,layout,bits,...inspect(slots(v,bits),bits)});}}
let controls=[];
for(let bits of [32,64]){let {M,s0,s1}=spec(bits),n=256/(bits/8), x=Array.from({length:16},(_,i)=>BigInt(i+1)*0x9e3779b97f4a7c15n&M);for(let t=16;t<n;t++)x.push((s1(x[t-2])+x[t-7]+s0(x[t-15])+x[t-16])&M);
let b=x.map(w=>Array.from({length:bits/8},(_,i)=>Number((w>>BigInt(bits-8-8*i))&255n)));let perm=Array.from({length:n},(_,i)=>(i*13+7)%n);let shuffled=perm.map((p,i)=>i%2?[...b[p]].reverse():b[p]);
let r=inspect(shuffled,bits);let allTruth=perm.every((p,i)=>p<16||r.outputIndices.includes(i));if(!allTruth)throw Error("positive control failed");controls.push({bits,allTruth,...r});}
return {results,controls};
}
module.exports={run};
if(require.main===module){const fs=require('node:fs'),path=require('node:path');const grid=JSON.parse(fs.readFileSync(process.argv[2]||path.join(__dirname,'../resources/liber-primus/lp2-grid-256.json'),'utf8'));console.log(JSON.stringify(run(grid),null,2));}
