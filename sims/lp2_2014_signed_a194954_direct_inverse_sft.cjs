"use strict";

/**
 * Historic Cicada 2014 stage11 whitespace prime schedule, OEIS A194954:
 * a(1)=2; a(n) is the first prime > a(n-1) with the difference a
 * positive multiple of popcount(n-1).
 *
 * Fixed direct GP29 first-layer gate on original LP2 pages p0..p55.
 * Read-only Windows/Node22 CommonJS SFT with known-plaintext plants.
 *
 * Scope: only direct additive use of prime, its totient, recurrence gap,
 * normalized recurrence step and recurrence operand (bitcount).
 * The original signed message does not specify any of these GP consumers.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const historical=read("resources/historical/cicada2014-stage11-message.asc");
const pages=corpus.pages.filter(p=>p.page>=0&&p.page<=55&&p.indices.length);
const N=pages.reduce((s,p)=>s+p.indices.length,0);
assert.equal(N,12956);
assert.equal(pages.length,55);
assert.equal(corpus.runes.length,29);
const source=pages.flatMap(p=>p.indices);
const solvedSource=solved.sections.flatMap(s=>[...s.source_text])
 .map(ch=>corpus.runes.indexOf(ch)).filter(i=>i>=0);
assert.equal(solvedSource.length,2979);

// Source-visible sequence: 5-space leading indent is between 3 and 7.
// PGP SHA1 clearsign does not authenticate trailing whitespace.
const visual=[2,3,5,7,11,13,17,23,29,31,37];
const actualTrailing=historical.split("-----BEGIN PGP SIGNATURE-----")[0]
 .split(/\r?\n/).slice(3).map(s=>(s.match(/ *$/)||[""])[0].length)
 .filter(n=>n>0);
assert.deepEqual(actualTrailing,[2,3,7,11,13,17,23,29,31,37]);
assert.equal(historical.includes("     ky2khlqdf7qdznac.onion"),true);
/** @param {number} n @returns {number} */
function popcount(n){let x=n,ones=0;while(x){ones+=x%2;x=Math.floor(x/2);}return ones;}
/** @param {number} n @returns {boolean} */
function isPrime(n){if(n<2)return false;for(let k=2;k*k<=n;k++){if(n%k===0)return false;}return true;}
const a=[null,2];
for(let n=2;n<=N;n++){
 const gapBase=popcount(n-1);
 let next=a[n-1]+gapBase;
 while(!isPrime(next))next+=gapBase;
 a[n]=next;
}
assert.deepEqual(a.slice(1,12),visual);
assert.equal(a[12],43);
assert.equal(a[N],641057);
/** @param {number[]} symbols @returns {number} */
function ioc(symbols){
 const f=new Uint32Array(29);
 for(const x of symbols){assert(Number.isInteger(x)&&x>=0&&x<29);f[x]++;}
 return f.reduce((s,v)=>s+v*(v-1),0)/(symbols.length*(symbols.length-1));
}
/** @param {number} n @returns {number} */
const mod29=n=>((n%29)+29)%29;
/** @param {number} i @param {string} key @returns {number} */
function keystep(i,key){
 if(key==="prime")return a[i];
 if(key==="totient")return a[i]-1;
 if(key==="gap")return i===1?2:a[i]-a[i-1];
 if(key==="normalized-gap")return i===1?2:(a[i]-a[i-1])/popcount(i-1);
 if(key==="bitcount")return popcount(i);
 throw Error("unknown source-derived key");
}
const keys=["prime","totient","gap","normalized-gap","bitcount"];
// These divisions are source-page visual chapter scopes; no private key fit.
const chapterStarts=new Set([0,3,8,15,23,27,33,40,54]);
/**
 * @param {Array<{page:number,indices:number[]}>} sourcePages
 * @param {string} key
 * @param {"global"|"chapter"|"page"} clockMode
 * @param {-1|1} sign
 * @returns {number[]}
 */
function transform(sourcePages,key,clockMode,sign){
 let clock=0;
 const out=[];
 for(const p of sourcePages){
  if(clockMode==="page"||(clockMode==="chapter"&&chapterStarts.has(p.page)))clock=0;
  for(const c of p.indices){clock++;out.push(mod29(c+sign*keystep(clock,key)));}
 }
 return out;
}
const chapters=[
 {name:"p0-p2",start:0,end:2,n:729},
 {name:"p8-p14",start:8,end:14,n:1729},
 {name:"p16-p22",start:16,end:22,n:1744},
 {name:"p40-p55",start:40,end:55,n:3316}
];
const results=[],originalIoc=ioc(source),plainIoc=ioc(solvedSource);
assert.ok(plainIoc>0.05);
for(const k of keys)for(const clock of ["global","chapter","page"])
 for(const sign of [-1,1]){
  const got=transform(pages,k,clock,/** @type {-1|1} */(sign));
  const back=transform(pages.map((p,i)=>{
   const offset=pages.slice(0,i).reduce((sum,v)=>sum+v.indices.length,0);
   return {page:p.page,indices:got.slice(offset,offset+p.indices.length)};
  }),k,clock,/** @type {-1|1} */(-sign));
  assert.deepEqual(back,source);
  const details=chapters.map(c=>{
   const offset=pages.filter(p=>p.page<c.start).reduce((s,p)=>s+p.indices.length,0);
   const text=got.slice(offset,offset+c.n);
   assert.equal(text.length,c.n);
   return {name:c.name,n:c.n,ioc:ioc(text)};
  });
  const max=Math.max(...details.map(d=>d.ioc));
  const gpPlant=[{page:0,indices:solvedSource}];
  const enc=transform(gpPlant,k,"page",1),dec=
   transform([{page:0,indices:enc}],k,"page",-1);
  assert.deepEqual(dec,solvedSource);
  results.push({k,clock,sign,wholeIoc:ioc(got),maxChapterIoc:max,details});
 }
assert.equal(results.length,30);
assert.ok(results.every(r=>r.maxChapterIoc<0.045),
 "An original chapter exceeded the frozen native-GP decision gate");
const strongest=results.toSorted((x,y)=>y.maxChapterIoc-x.maxChapterIoc)
 .slice(0,6);
console.log(JSON.stringify({
  source:"2014 signed stage11 original trailing-blank sequence, 19 omitted",
  sourceKey:"OEIS A194954, recurrence independently published by 2011",
  signedWhitespaceCaveat:"PGP authenticates visible text; trailing blanks can be altered without invalidating signature",
  first11:visual,nextTerm:a[12],lastTerm:a[N],originalRunes:N,
  controls:{solvedNativeRunes:solvedSource.length,solvedNativeIoc:plainIoc,
   originalCipherIoc:originalIoc,plantedRoundTrips:30},
  all30Models:{maximumChapterIoc:Math.max(...results.map(r=>r.maxChapterIoc)),
   maximumWholeIoc:Math.max(...results.map(r=>r.wholeIoc)),
   largestSix:strongest},
  verdict:"No source-selected direct A194954-derived additive inverse yields native-GP-like chapter frequency; no unknown original plaintext recovered."
},null,2));
