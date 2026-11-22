'use strict';
/**
 * Exact native-word PRNG inversion of the 256 bytes printed on LP2 pp49–51.
 * Tests 32-bit affine LCGs (all a,b modulo 2^32), 59,582 variants of
 * xorshift32 (all shift triples 1..31 in both shift directions), and full
 * 64-bit SplitMix64 (even permitting unknown additive increment).
 * Source paths, 12 views, original data and planted exact inverses are fixed.
 * Node.js 22 CommonJS, built-in modules, no CLI args or mutable files.
 */
const fs=require('node:fs');
const path=require('node:path');
const source=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../resources/liber-primus/lp2-grid-256.json'),'utf8'));
const bytes=source.pages.flatMap(p=>p.bytes);
if(bytes.length!==256||source.pages.length!==3||
  source.pages.some((p,i)=>p.bytes.length!==[80,104,72][i]))throw Error('Original grid source mismatch');
const rows=Array.from({length:32},(_,i)=>bytes.slice(i*8,i*8+8));
const chunks=[rows.slice(0,10),rows.slice(10,23),rows.slice(23)];
const views={
 printedPageMajor:bytes,
 continuousColumn:Array.from({length:8},(_,c)=>rows.map(r=>r[c])).flat(),
 printedPageColumn:chunks.flatMap(p=>Array.from({length:8},(_,c)=>p.map(r=>r[c])).flat())
};
for(const [name,arr] of Object.entries({...views}))views[name+'Reverse']=arr.slice().reverse();
const M=1n<<32n,MASK32=M-1n,MASK64=(1n<<64n)-1n;
const A=0xbf58476d1ce4e5b9n,B=0x94d049bb133111ebn,GAMMA=0x9e3779b97f4a7c15n;
/** @param {bigint} a @param {bigint} m @returns {bigint} */
const mod=(a,m)=>((a%m)+m)%m;
/** Modular inverse, null if a is not a unit. */
function inverse(a,m){
 let t=0n,nt=1n,r=m,nr=mod(a,m);
 while(nr!==0n){const q=r/nr;[t,nt]=[nt,t-q*nt];[r,nr]=[nr,r-q*nr];}
 return r===1n?mod(t,m):null;
}
/** Recover all affine 32-bit LCG parameters from first 3 full words, then validate all 64. */
function fitLCG32(w){
 const [x0,x1,x2]=w.slice(0,3).map(BigInt);
 const u=mod(x1-x0,M),v=mod(x2-x1,M);
 let g=1n;while(g<M&&u%(g*2n)===0n)g*=2n;
 if(v%g!==0n)return {matchingPrefix:0,parameterCount:0};
 const modulus=M/g,inv=inverse(u/g,modulus);
 if(inv===null)return {matchingPrefix:0,parameterCount:0};
 const a0=mod((v/g)*inv,modulus);
 if(g>8192n)throw Error('Unexpected high-multiplicity full-word source');
 let longest=0,recovered=null;
 for(let k=0n;k<g;k++){
  const a=a0+k*modulus,b=mod(x1-a*x0,M);
  let state=x0,n=1;
  for(let i=1;i<w.length;i++){
   state=(a*state+b)&MASK32;
   if(state!==BigInt(w[i]))break;
   n++;
  }
  if(n>longest){longest=n;recovered=n>=4?{a:String(a),b:String(b)}:null;}
 }
 return {matchingPrefix:longest,parameterCount:Number(g),recovered};
}
/** @param {number} x @param {number} a @param {number} b @param {number} c @param {boolean} reverse */
function xs(x,a,b,c,reverse){
 let s=x>>>0;
 if(!reverse){s^=s<<a;s^=s>>>b;s^=s<<c;}
 else{s^=s>>>a;s^=s<<b;s^=s>>>c;}
 return s>>>0;
}
/** Enumerate every LRL and RLR 32-bit xorshift triple, requiring exact next output. */
function fitXorshift32(w){
 let best=1,oneStep=0,recovered=null;
 for(const reverse of [false,true])for(let a=1;a<=31;a++)for(let b=1;b<=31;b++)for(let c=1;c<=31;c++){
  let x=xs(w[0],a,b,c,reverse);
  if(x!==w[1])continue;
  oneStep++;
  let n=2;
  while(n<w.length){x=xs(x,a,b,c,reverse);if(x!==w[n])break;n++;}
  if(n>best){best=n;recovered={a,b,c,reverse};}
 }
 return {matchingPrefix:best,oneStepMatches:oneStep,recovered};
}
function invertOdd(v){let x=v;for(let i=0;i<7;i++)x=x*(2n-v*x)&MASK64;return x;}
const AI=invertOdd(A),BI=invertOdd(B);
function undoR(y,k){let x=y;for(let s=k;s<64;s*=2)x^=x>>BigInt(s);return x&MASK64;}
function mix64(s){
 let z=s;z=(z^(z>>30n))*A&MASK64;z=(z^(z>>27n))*B&MASK64;
 return (z^(z>>31n))&MASK64;
}
function unmix64(y){
 let z=undoR(y,31);z=z*BI&MASK64;z=undoR(z,27);
 z=z*AI&MASK64;return undoR(z,30);
}
/** Invert full outputs, then infer ANY additive state increment from first two. */
function fitSplitmix64(w){
 const s=w.map(unmix64),increment=(s[1]-s[0])&MASK64;
 let n=2;
 while(n<s.length&&((s[n]-s[n-1])&MASK64)===increment)n++;
 return {matchingPrefix:n,inferredIncrementHex:'0x'+increment.toString(16),canonicalIncrement:increment===GAMMA};
}
/** @param {number[]} arr @param {number} width @param {boolean} little */
function words(arr,width,little){
 const out=[];
 for(let i=0;i<arr.length;i+=width){
  let x=0n;
  for(let j=0;j<width;j++)x=(x<<8n)|BigInt(arr[i+(little?width-1-j:j)]);
  out.push(width===4?Number(x):x);
 }
 return out;
}
function plant(){
 const seed=3301n,a=1664525n,b=1013904223n;
 let s=seed;const lc=[Number(s)];
 for(let i=1;i<64;i++){s=(a*s+b)&MASK32;lc.push(Number(s));}
 const v=fitLCG32(lc);
 if(v.matchingPrefix!==64||v.recovered.a!==String(a)||v.recovered.b!==String(b))throw Error('Planted 32-bit LCG recovery failed');
 const xor=[3301];
 for(let i=1;i<64;i++)xor.push(xs(xor.at(-1),13,17,5,false));
 const x=fitXorshift32(xor);
 if(x.matchingPrefix!==64||x.recovered.a!==13||x.recovered.b!==17||x.recovered.c!==5||x.recovered.reverse)throw Error('Planted xorshift32 recovery failed');
 let st=0x20143301n;const split=[];
 for(let i=0;i<32;i++){st=(st+GAMMA)&MASK64;split.push(mix64(st));}
 const t=fitSplitmix64(split);
 if(t.matchingPrefix!==32||!t.canonicalIncrement)throw Error('Planted SplitMix64 recovery failed');
 return {LCG32:true,xorshift32:true,SplitMix64:true};
}
const controls=plant();
const results=[];
for(const [reading,v] of Object.entries(views))for(const endian of ['big','little']){
 results.push({
  reading,endian,
  LCG32:fitLCG32(words(v,4,endian==='little')),
  xorshift32:fitXorshift32(words(v,4,endian==='little')),
  SplitMix64:fitSplitmix64(words(v,8,endian==='little'))
 });
}
const maxima={
 LCG32:Math.max(...results.map(v=>v.LCG32.matchingPrefix)),
 xorshift32:Math.max(...results.map(v=>v.xorshift32.matchingPrefix)),
 SplitMix64:Math.max(...results.map(v=>v.SplitMix64.matchingPrefix))
};
const allSourceModelsExcluded=maxima.LCG32<4&&maxima.xorshift32<2&&maxima.SplitMix64<3;
if(!allSourceModelsExcluded)throw Error('A candidate full-word PRNG unexpectedly matches original source; analyze before reporting');
console.log(JSON.stringify({
 inputBytes:bytes.length,readingAndEndiannessVariants:results.length,
 xorshift32ShiftTriplesPerView:2*31*31*31,
 longestExactOriginalPrefixes:maxima,
 allSourceModelsExcluded,plantedExactInverses:controls,
 perView:results
},null,2));
