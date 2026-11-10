'use strict';
/**
 * Five-dot stencil route + authentic LP2 p56 prime-totient inversion.
 * Fixed diagram source: im-results/black-dot-template-reflections.md
 * Run on Node 22: node sims/dot_stencil_totient_inversion.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const c=JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'));
const M=29, gp=c.translit;
const expected='AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const tokens=gp.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} text */
function encode(text){
 const out=[];
 for(const word of text.split(' '))for(let i=0;i<word.length;){
  const t=tokens.find(x=>word.startsWith(x.s,i));
  assert.ok(t,word.slice(i));out.push(t.i);i+=t.s.length;
 }
 return out;
}
const plain56=encode(expected);assert.equal(plain56.length,85);
const points=[[796.941,3105.773],[992.500,3166.637],[1296.931,2866.789],[1479.265,3127.500],[1527.153,2936.153]];
/** @param {number} page */
function dotPermutation(page){
 const a=points.map(([x,y],i)=>({x:page===56?-x:x,y:page===23?-y:y,i}));
 const byX=a.slice().sort((x,y)=>x.x-y.x),byY=a.slice().sort((x,y)=>x.y-y.y);
 return byX.map(p=>byY.findIndex(q=>q.i===p.i));
}
const keys={7:[2,4,0,3,1],23:[2,0,4,1,3],56:[1,3,0,4,2]};
for(const [page,p] of Object.entries(keys))assert.deepEqual(dotPermutation(Number(page)),p);
const inverse=p=>p.map((_,i)=>p.indexOf(i));
/** @param {number[]} a @param {number[]} p */
function block(a,p){
 const b=a.slice();
 for(let i=0;i+5<=a.length;i+=5)for(let j=0;j<5;j++)b[i+j]=a[i+p[j]];
 return b;
}
/** @param {number[]} a @param {number[]} p */
function pack(a,p){
 const b=[];
 for(const col of p)for(let j=col;j<a.length;j+=5)b.push(a[j]);
 return b;
}
/** @param {number[]} a @param {number[]} p */
function unpack(a,p){
 const lens=Array.from({length:5},(_,j)=>Math.floor((a.length+4-j)/5));
 const cols=Array(5);let at=0;
 for(const k of p){cols[k]=a.slice(at,at+lens[k]);at+=lens[k];}
 assert.equal(at,a.length);
 const out=[];
 for(let i=0;i<Math.max(...lens);i++)for(let j=0;j<5;j++)if(i<cols[j].length)out.push(cols[j][i]);
 return out;
}
for(const page of [7,23,56]){
 const p=keys[page],v=Array.from({length:229},(_,i)=>i%29);
 assert.deepEqual(block(block(v,p),inverse(p)),v);
 assert.deepEqual(unpack(pack(v,p),p),v);
}
/** @param {number[]} a @param {number} page */
function variants(a,page){
 const p=keys[page],ip=inverse(p),mirror=p.map(x=>4-x);
 return [{name:'identity',a},{name:'block-xy',a:block(a,p)},
 {name:'block-inverse',a:block(a,ip)},{name:'block-reflect-y',a:block(a,mirror)},
 {name:'column-xy',a:unpack(a,p)},{name:'column-inverse',a:unpack(a,ip)},
 {name:'column-reflect-y',a:unpack(a,mirror)}];
}
function totient(n){
 const out=[];
 for(let x=2;out.length<n;x++){let ok=true;
 for(let d=2;d*d<=x;d++)if(x%d===0){ok=false;break;}
 if(ok)out.push((x-1)%29);}
 return out;
}
const key=totient(300);
/** @param {number[]} a @param {-1|1} sign @param {number} fMask */
function decrypt(a,sign,fMask=0){
 let k=0,f=0;
 return a.map(x=>{
  if(x===0){const literal=(fMask>>f)&1;f++;if(literal)return 0;}
  return ((x+sign*key[k++])%29+29)%29;
 });
}
const cipher56=c.pages[56].indices;
assert.deepEqual(decrypt(cipher56,-1,8),plain56,'Exact known LP2 An End ciphertext regression');
const q=Array(29).fill(0.5);
for(const p of plain56)q[p]++;
const total=q.reduce((a,b)=>a+b,0),logq=q.map(p=>Math.log(p/total));
/** @param {number[]} a */
function score(a){
 const counts=Array(29).fill(0);let log=0;
 for(const x of a){counts[x]++;log+=logq[x];}
 const n=a.length;
 return {logPerRune:log/n,ioc:counts.reduce((s,v)=>s+v*(v-1),0)/(n*(n-1))};
}
/** @param {number[]} a @param {number} page */
function scan(a,page){
 const all=[];
 for(const v of variants(a,page))for(const sign of [-1,1]){
  const p=decrypt(v.a,sign);
  all.push({route:v.name,sign,...score(p),preview:p.slice(0,90).map(i=>gp[i]).join('')});
 }
 all.sort((a,b)=>b.logPerRune-a.logPerRune);
 return {best:all[0],top3:all.slice(0,3),bestIoC:Math.max(...all.map(x=>x.ioc))};
}
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};}
function rotate(a,random){const k=Math.floor(random()*a.length);return a.slice(k).concat(a.slice(0,k));}
/** @param {number} page @param {number} seed */
function nullTest(page,seed){
 const a=c.pages[page].indices,observed=scan(a,page),next=rng(seed),nulls=[];let exceeds=0;
 for(let i=0;i<500;i++){
  const z=scan(rotate(a,next),page).best.logPerRune;
  nulls.push(z);if(z>=observed.best.logPerRune)exceeds++;
 }
 nulls.sort((x,y)=>x-y);
 return {page,n:a.length,observed,rotationNull:{trials:500,seed,median:nulls[249],q95:nulls[474],
  exceedances:exceeds,p:(exceeds+1)/501}};
}
function positive(){
 const p=keys[7],plain=Array.from({length:208},(_,i)=>plain56[i%85]);
 const masked=plain.map((x,i)=>(x+key[i])%29),cipher=pack(masked,p);
 const result=scan(cipher,7),decoded=decrypt(unpack(cipher,p),-1);
 assert.deepEqual(decoded,plain);
 assert.equal(result.best.route,'column-xy');
 assert.equal(result.best.sign,-1);
 return {source:'authentic LP2 p56 plaintext cycled to p7 length',
  hiddenRoute:'column-xy',hiddenSign:-1,matchedPlainRunes:208,
  selectedRoute:result.best.route,selectedSign:result.best.sign,
  bestLogPerRune:result.best.logPerRune,bestIoC:result.best.ioc};
}
function main(){
 const r={
  hypothesis:'Five-dot diagram gives a five-column route, undone before authentic p56 prime-totient cipher',
  inputs:'Original LP2 24.jpg/40.jpg/73.jpg black-dot centers and canonical corpus',
  permutations:keys,
  model:'phi(prime_n) mod29 from index 1; key reset at page; both signs; 7 image-selected routes; no fitted key',
  genuineRegression:{page:56,runes:85,plaintextMatch:decrypt(cipher56,-1,8).every((p,i)=>p===plain56[i]),
   literalFMask:8,unmaskedIoC:score(decrypt(cipher56,-1)).ioc,plaintextIoC:score(plain56).ioc},
  planted:positive(),real:[nullTest(7,0x33015330),nullTest(23,0x33015330+951)],
  conclusion:'Conditional source-derived transposition/totient family; success requires coherent original plaintext plus exact reencryption'
 };
 console.log(JSON.stringify(r,null,2));
}
if(require.main===module)main();
module.exports={dotPermutation,block,pack,unpack,variants,decrypt,score,scan,positive,nullTest,main};
