'use strict';
/**
 * Candidate source-derived original LP2 book-code: shed p57 word boundaries,
 * use fifty black and five red interior GP0 runes as cyclic word addresses for
 * the fifty/five unsolved rune-bearing physical pages, and test the 256-rune
 * extract against the original 256-byte p50 table and the p56 hash.
 *
 * All tests are original-input, source-exact, no plaintext fitted. The 256
 * match is provisional and postselected. Windows Node.js 22 CommonJS SFT.
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const tbl=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const raw=read('resources/external/Liber Primus 57.txt');
const trans=read('resources/liber-primus/lp2-transcription.txt');
const B=tbl.pages.flatMap(p=>p.bytes);
assert.equal(B.length,256);
const p57=(trans.split('%').at(-1).replace(/\/\r?\n/g,'')
  .match(/[\u16A0-\u16FF]+/gu)||[])
  .map(w=>[...w].map(c=>gp.runes.indexOf(c)));
assert.equal(p57.length,20);
assert.deepEqual(p57.flat(),gp.pages[57].indices);
const body=p57.slice(1).flatMap(w=>w.slice(1,-1));
const red=p57[0].slice(1,-1);
assert.deepEqual([body.length,red.length],[50,5]);
const keys=body.concat(red);
const pp=Array.from({length:55},(_,i)=>i<50?i:i+1);
const byStart=Array.from({length:58},()=>[]);
const byTouch=Array.from({length:58},()=>[]);
let page=-1,word='',wordStart=-1;
const touched=new Set();
function flush(){
 if(!word)return;
 byStart[wordStart].push(word);
 for(const p of touched)byTouch[p].push(word);
 word='';touched.clear();
}
for(const line of raw.split(/\r?\n/)){
 const m=line.match(/^%(\d+)$/);
 if(m){page=Number(m[1]);continue;}
 if(page<0||page>=58)continue;
 for(const c of line){
  if(gp.runes.includes(c)){
    if(!word)wordStart=page;
    word+=c;touched.add(page);
  } else if("᛫.⁘⁖⁕ '\"".includes(c))flush();
 }
}
flush();
assert.equal(byStart.slice(0,56).reduce((s,x)=>s+x.length,0),2896);
const origCounts=pp.map(p=>byStart[p].length);
const wraps=[];
const selected=pp.map((p,i)=>{
 const ix=keys[i],n=byStart[p].length;
 if(ix>=n)wraps.push({page:p,gp0:ix,words:n,wrapped:ix%n});
 return byStart[p][ix%n];
});
assert.deepEqual(wraps,[
 {page:51,gp0:24,words:20,wrapped:4},
 {page:55,gp0:20,words:16,wrapped:4}
]);
const runeText=selected.join('');
const src=[...runeText].map(c=>gp.runes.indexOf(c));
assert.equal(selected.length,55);
assert.equal(src.length,256);
assert.equal(crypto.createHash('sha256').update(runeText,'utf8').digest('hex'),
 'ec9047f3f9d4ca9466dcc35ff804e318427b077f46a0aa6933aed0e702ae76e3');
assert.equal(crypto.createHash('sha256').update(Buffer.from(src)).digest('hex'),
 '989cecadf5fbae676d144c332a77461b48fd6ba779e431747260735c92deb3e7');
const len=selected.map(w=>w.length);
assert.deepEqual(len,[4,2,7,8,5,1,3,5,2,3,5,2,3,6,8,4,8,5,2,3,3,2,
 7,8,3,5,6,3,10,3,2,5,3,2,9,8,10,4,6,5,3,1,5,8,7,7,3,3,2,4,3,
 6,3,5,6]);
/** @param {number[]} a @returns {number} */
const ioc=a=>{const c=Array(29).fill(0);for(const v of a)c[v]++;return c
 .reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));};
const mod=n=>(n%29+29)%29;
const tableRem=B.map(b=>b%29);
const subtraction=src.map((v,i)=>mod(v-tableRem[i]));
const addition=src.map((v,i)=>mod(v+tableRem[i]));
const directMatches=src.filter((v,i)=>v===tableRem[i]).length;
assert.equal(directMatches,8);
assert.ok(ioc(subtraction)<0.04&&ioc(addition)<0.04);
const positive=Array.from({length:256},(_,i)=>gp.pages[57].indices[i%95]);
const planted=positive.map((v,i)=>mod(v+tableRem[i]));
assert.deepEqual(planted.map((v,i)=>mod(v-tableRem[i])),positive);
assert.ok(ioc(positive)>0.06);
const main=[0,3,8,15,23,27,33,40,54].map(p=>{
 const all=ink.pages.find(x=>x.page===p).red_spans;
 return [...(p===15?all[1]:all[0]).runes].map(c=>gp.runes.indexOf(c));
});
const headings={
 gp0:main.map(a=>a.reduce((s,x)=>s+x,0)%29),
 gpPrime:main.map(a=>a.reduce((s,x)=>s+gp.prime[x],0)%29),
 first:main.map(a=>a[0]),
 last:main.map(a=>a.at(-1))
};
const q=B.map(b=>Math.floor(b/29));
assert.deepEqual(q.reduce((a,v)=>(a[v]++,a),Array(9).fill(0)),
 [22,33,38,22,29,32,34,21,25]);
const family=[];
for(const [key,K] of Object.entries(headings))
 for(const sign of [-1,1])
  for(const rem of [false,true]){
    const out=src.map((v,i)=>mod(v+sign*K[q[i]]-(rem?tableRem[i]:0)));
    family.push({key,sign,useTableRemainder:rem,ioc:ioc(out)});
  }
assert.equal(family.length,16);
const top=family.toSorted((a,b)=>b.ioc-a.ioc)[0];
assert.equal(top.key,'first');
assert.equal(top.sign,1);
assert.equal(top.useTableRemainder,false);
assert.ok(top.ioc<0.04);

const endHash='36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const reps={
 runeUTF8:Buffer.from(runeText,'utf8'),
 runeUTF16LE:Buffer.from(runeText,'utf16le'),
 gpIndices:Buffer.from(src),
 gpIndicesHex:Buffer.from(src).toString('hex'),
 gpPrimeBytes:Buffer.from(src.map(x=>gp.prime[x])),
 paddedDecimal:src.map(x=>String(x).padStart(2,'0')).join(''),
 runeBE16:Buffer.concat([...runeText].map(c=>{
  const b=Buffer.alloc(2);b.writeUInt16BE(c.charCodeAt(0));return b;
 }))
};
let hashMatches=0;
for(const data of Object.values(reps))
 for(const algorithm of ['sha512','sha3-512','blake2b512'])
  hashMatches+=Number(crypto.createHash(algorithm).update(data).digest('hex')===endHash);
assert.equal(hashMatches,0);

function totalFor(words,shift=0,reverse=false){
 return pp.reduce((sum,p,i)=>{
  const w=words[p],n=w.length,j=(keys[i]+shift+n)%n;
  return sum+w[reverse?n-1-j:j].length;
 },0);
}
const alternatives={
 sourceStartWordOrdinal:totalFor(byStart),
 sourceStartReverse:totalFor(byStart,0,true),
 sourceStartNextOrdinal:totalFor(byStart,1),
 sourceStartPreviousOrdinal:totalFor(byStart,-1),
 physicallyTouchingWordOrdinal:totalFor(byTouch),
 physicallyTouchingReverse:totalFor(byTouch,0,true)
};
assert.deepEqual(alternatives,{
 sourceStartWordOrdinal:256,sourceStartReverse:248,
 sourceStartNextOrdinal:234,sourceStartPreviousOrdinal:254,
 physicallyTouchingWordOrdinal:242,physicallyTouchingReverse:243
});
const matrix=pp.map(p=>Array.from({length:29},(_,v)=>
 byStart[p][v%byStart[p].length].length));
const a=body.slice(),b=red.slice();
let seed=0x33012014;
function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
const trials=200000;
let hits256=0,hitAndTwoWrap=0,hitExactWrapPages=0,sum=0,sq=0,twos=0;
for(let run=0;run<trials;run++){
 for(let i=a.length-1;i>0;i--){const j=rand()%(i+1);[a[i],a[j]]=[a[j],a[i]];}
 for(let i=b.length-1;i>0;i--){const j=rand()%(i+1);[b[i],b[j]]=[b[j],b[i]];}
 let length=0,nwrap=0,first=-1,second=-1;
 for(let i=0;i<55;i++){
  const k=i<50?a[i]:b[i-50];
  length+=matrix[i][k];
  if(k>=origCounts[i]){
   nwrap++;
   if(first<0)first=pp[i];else second=pp[i];
  }
 }
 sum+=length;sq+=length*length;
 if(nwrap===2)twos++;
 if(length===256){
  hits256++;
  if(nwrap===2){
    hitAndTwoWrap++;
    if(first===51&&second===55)hitExactWrapPages++;
  }
 }
}
assert.deepEqual([hits256,hitAndTwoWrap,hitExactWrapPages,twos],
 [4777,2245,1629,91894]);
const mean=sum/trials,sd=Math.sqrt(sq/trials-mean*mean);
console.log(JSON.stringify({
 status:'PASS',
 actualOriginal:{p57WordInteriors:[body.length,red.length],
  numberedWordPages:55,selectedRunes:256,originalTableCells:256,
  originalGPIndicesSHA256:crypto.createHash('sha256').update(Buffer.from(src)).digest('hex'),
  selectedWordLengths:len,cyclicWraps:wraps},
 receiver:{tableRemainderDirectMatches:directMatches,
  sourceIoC:ioc(src),simpleTableMinusIoC:ioc(subtraction),
  simpleTablePlusIoC:ioc(addition),solvedPlainPlantIoC:ioc(positive),
  sourceNineChapterKeyed16TopIoC:top,hashedRepresentations:Object.keys(reps),
  hashAlgorithms:['sha512','sha3-512','blake2b512'],
  nativeP56HashPreimageMatches:hashMatches},
 wordIndexConventionControls:alternatives,
 originalLabelOrderPermutationNull:{trials,withinInkColor:true,
  exact256:hits256,frequency:hits256/trials,
  exact256AndTwoWraps:hitAndTwoWrap,
  exact256AndOriginalWrapPages:hitExactWrapPages,
  sampleMean:mean,sampleSD:sd},
 decisive:'Length 256 is real but ordinary in source-label order permutations. All direct original-table/native-GP recipients are nonlinguistic; no unknown plaintext or key.'
},null,2));
