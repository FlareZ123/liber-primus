"use strict";
/** SFT, Windows Node22: source 2016 43-word p50 graph pointer,
 * candidate page-key inverse and authentic prime-clock gate. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=(p)=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8");
const c=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const T=JSON.parse(read("resources/liber-primus/lp2-grid-256.json")).bytes;
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const s=signed.split("Hash: SHA1")[1].split("-----BEGIN PGP SIGNATURE-----")[0];
const words=s.replace(/7A35090F/gi,"").replace(/\b3301\b/g,"").match(/[A-Za-z]+/g);
assert.equal(words.length,43);
const glyphs=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} input @returns {number[]} */
function gp(input){const w=input.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");let r=[];for(let i=0;i<w.length;){const x=glyphs.find(x=>w.startsWith(x.s,i));assert.ok(x);r.push(x.i);i+=x.s.length;}return r;}
const keys=words.map(gp),sum=keys.map(x=>x.reduce((a,b)=>a+b,0));
assert.deepEqual([words[0],words[9],words[29]],["Hello","Liber","direction"]);
assert.deepEqual([sum[0],sum[9],sum[29]],[69,69,112]);
assert.deepEqual([T[43],T[69],T[112]],[73,73,73]);
const rev=Array.from({length:256},()=>[]);T.forEach((v,i)=>rev[v].push(i));
/** @param {number} root @returns {Set<number>} */
function subtree(root){const seen=new Set([root]),q=[root];for(let i=0;i<q.length;i++)for(const x of rev[q[i]])if(!seen.has(x)){seen.add(x);q.push(x);}return seen;}
assert.equal(subtree(73).size,43);assert.equal(subtree(201).size,56);
const self=[];for(let i=1;i<256;i++)if(subtree(T[i]).size===i)self.push(i);
assert.deepEqual(self,[43]);
const child=new Map(),sizes=new Map();
function visit(v){if(child.has(v))return;let a=rev[v].filter(x=>x!==v);child.set(v,a);a.forEach(visit);}
function size(v){if(sizes.has(v))return sizes.get(v);let s=1+child.get(v).reduce((a,x)=>a+size(x),0);sizes.set(v,s);return s;}
function inorder(v){const a=child.get(v).slice().sort((x,y)=>size(y)-size(x)||x-y);return a.length?[...inorder(a[0]),v,...a.slice(1).flatMap(inorder)]:[v];}
visit(201);const nodes=inorder(201),set43=subtree(73);
assert.deepEqual([nodes[32],nodes[43],nodes[44],nodes[50]],[73,79,82,201]);
assert.ok(nodes.slice(0,43).every(x=>set43.has(x)));
const mod=x=>((x%29)+29)%29;
/** @param {number[]} x */
function ioc(x){const hist=Array(29).fill(0);x.forEach(v=>hist[v]++);return hist.reduce((z,v)=>z+v*(v-1),0)/(x.length*(x.length-1));}
/** @param {number[]} C @param {number[]} K @param {number} sign @param {boolean} feedback */
function decode(C,K,sign,feedback){const P=[];for(let i=0;i<C.length;i++)P.push(mod(C[i]+sign*(feedback&&i>=K.length?P[i-K.length]:K[i%K.length])));return P;}
const outcomes=[];for(const feedback of [false,true])for(const sign of [-1,1]){
const P=[],per=[];for(let p=0;p<43;p++){let a=decode(c.pages[p].indices,keys[p],sign,feedback);P.push(...a);per.push(ioc(a));}
assert.equal(P.length,10416);assert.ok(per.every(x=>x<0.048));
outcomes.push({mode:feedback?"plaintext autokey":"periodic",sign,ioc:ioc(P),
  firstPage:decode(c.pages[0].indices,keys[0],sign,feedback).slice(0,30).map(x=>c.translit[x]).join("")});}
const clear=c.pages[57].indices,plant=clear.map((v,i)=>mod(v+keys[0][i%keys[0].length]));
assert.deepEqual(decode(plant,keys[0],-1,false),clear);
const primes=[];for(let n=2;primes.length<700;n++){let ok=true;for(let d=2;d*d<=n;d++)if(n%d===0)ok=false;if(ok)primes.push(n);}
/** @param {number[]} C @param {number} start */
function possible(C,start){let seen=new Set([0]);for(const v of C){let next=new Set();for(const k of seen){if(v===0)next.add(k);if(mod(v-(primes[start+k]-1))!==0)next.add(k+1);}seen=next;if(!seen.size)return false;}return true;}
const direct=[],pointer=[];for(let p=0;p<43;p++){
if(possible(c.pages[p].indices,sum[p]))direct.push(p);
if(possible(c.pages[p].indices,T[sum[p]]))pointer.push(p);}
assert.deepEqual(direct,[13]);assert.deepEqual(pointer,[]);

// Alternate literal reading of 2016 "their numbers": use each word's GP-prime
// sum (not its GP0 ordinal sum) as a modulo-256 address into the p50 byte table,
// then use the returned byte as the p56 zero-based prime-stream start for p0..42.
const primeSum=keys.map(x=>x.reduce((a,i)=>a+c.prime[i],0));
const primeAddress=primeSum.map(x=>x%256);
const primeStart=primeAddress.map(x=>T[x]);
/** @param {number[]} C @param {number} start @returns {string} */
function pathCount(C,start){
  let ways=new Map([[0,1n]]);
  for(const v of C){
    const next=new Map();
    const add=(k,n)=>next.set(k,(next.get(k)||0n)+n);
    for(const [k,n] of ways){
      const shift=mod(primes[start+k]-1);
      if(v===0)add(k,n); // plaintext F is transparent
      if(mod(v-shift)!==0)add(k+1,n); // ordinary branch must not decode to F
    }
    ways=next;
    if(!ways.size)return "0";
  }
  return [...ways.values()].reduce((a,b)=>a+b,0n).toString();
}
const primeSumTable=[];
for(let p=0;p<43;p++){
  const paths=pathCount(c.pages[p].indices,primeStart[p]);
  if(paths!=="0")primeSumTable.push({
    page:p,word:words[p],gpPrimeSum:primeSum[p],address:primeAddress[p],
    p50ByteStart:primeStart[p],legalPaths:paths
  });
}
const count=Array(256).fill(0);T.forEach(v=>count[v]++);
console.log(JSON.stringify({sourceWords:words.length,sourceP50:[T[43],T[69],T[112]],
  onlySelfPointer:self,rootNode:73,rootPage:32,candidatePages:"0..42",
  sourceNativePageKeyReadouts:outcomes,primeFclockSurvivors:{GP0:direct,tableGP0:pointer,GPPrimeSumMod256ThenTable:primeSumTable},
  clearP57SyntheticPlant:clear.length,
  originalByteMultisetTripleCollisionRate:count.reduce((s,n)=>s+n*(n-1)*(n-2),0)/(256*255*254)
},null,2));
