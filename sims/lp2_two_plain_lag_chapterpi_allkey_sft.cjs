"use strict";

/**
 * LP2 original two-plaintext-lag feedback with NINE independent secret
 * chapter output alphabets. All 841 common (a,b) choices in GF(29) are
 * covered; each chapter alphabet is granted all 29! bijections via its
 * exact sorted-frequency invariant.
 *
 * Native-GP English references preserve all 2,896 authentic full printed
 * word lengths and 55 physical page boundaries, including 32 carried words.
 * The nine chapter starts are fixed by original red heading + red13 ending
 * marks. This test does not claim that the creator used this cipher.
 *
 * Windows/Node 22 CommonJS; single runnable test file:
 * node sims/lp2_two_plain_lag_chapterpi_allkey_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} =
  require("./lp2_native_gp_source_orthography_sft.cjs");

const root=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8")
  .replace(/\r\n/g,"\n");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=gp.pages.filter(p=>p.page<=55&&p.indices.length);
const starts=[0,3,8,15,23,27,33,40,54];
const chapterOf=pages.map(p=>{
  let chapter=0;
  for(let j=0;j<starts.length;j++)if(p.page>=starts[j])chapter=j;
  return chapter;
});
const L=pages.map(p=>p.indices.length);
const N=pages.reduce((s,p)=>s+p.indices.length-2,0);
const mod=x=>((x%29)+29)%29;
assert.equal(pages.length,55);
assert.equal(L.reduce((s,x)=>s+x,0),12956);
assert.equal(N,12846);
assert.deepEqual(pages.filter(p=>starts.includes(p.page)).map(p=>p.page),
  starts);

const runeToId=new Map(gp.runes.map((r,i)=>[r,i]));
const regex=new RegExp("["+gp.runes.join("")+"]+","gu");
const text=read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0,55).join("%")
  .replace(/\/\n/g,"").replace(/[\r\n%]/g,"");
const words=(text.match(regex)||[]).map(w=>
  Array.from(w,g=>runeToId.get(g)));
assert.equal(words.length,2896);
assert.equal(words.flat().length,12956);
assert.deepEqual(words.flat(),pages.flatMap(p=>p.indices));

/** @param {number[][]} streams @param {number} a
 * @param {number} b @param {boolean} isCipher
 * @returns {number[][]} Exact per-chapter sorted histograms. */
function profile(streams,a,b,isCipher=false){
  const counts=Array.from({length:9},()=>new Uint16Array(29));
  for(let k=0;k<streams.length;k++){
    const x=streams[k],h=counts[chapterOf[k]];
    for(let i=2;i<x.length;i++){
      const v=isCipher?mod(x[i]-x[i-1]):
        (x[i]+a*x[i-1]+b*x[i-2])%29;
      h[v]++;
    }
  }
  return counts.map(h=>Array.from(h).sort((x,y)=>x-y));
}
const actual=profile(pages.map(p=>p.indices),0,0,true);
const originalMins=actual.map(row=>row[0]);
assert.deepEqual(originalMins,[4,6,9,10,11,13,12,17,3]);
assert.equal(originalMins.reduce((a,b)=>a+b,0),85);
assert.equal(actual.reduce((s,row)=>s+row.reduce((x,y)=>x+y,0),0),N);

/** @param {string} src @returns {Map<number,number[][]>} */
function wordPools(src){
  const pools=new Map();
  for(const token of src.match(/[A-Za-z]+/g)||[]){
    const x=encodeSourceNativeGP(token),n=x.length;
    if(!pools.has(n))pools.set(n,[]);
    pools.get(n).push(x);
  }
  for(const w of words)assert(pools.get(w.length)?.length,
    "No control word of native-GP length "+w.length);
  return pools;
}
/** @param {number} seed */
function randomGenerator(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;
    return (x>>>0)/4294967296;};
}
/** @param {Map<number,number[][]>} pools @param {()=>number} random
 * @returns {number[][]} */
function drawMatched(pools,random){
  const tape=words.flatMap(w=>{
    const p=pools.get(w.length);
    return p[Math.floor(random()*p.length)];
  });
  assert.equal(tape.length,12956);
  let at=0;
  const streams=L.map(n=>{
    const x=tape.slice(at,at+n);
    at+=n;
    return x;
  });
  assert.equal(at,12956);
  return streams;
}
/** @param {number[][]} plain
 * @returns {{best:{a:number,b:number,tv:number,difference:number,chapterDifferences:number[]},smallestNontrivialRareCount:number,unmodifiedPlainRareCount:number,exactMatches:number}} */
function scanControl(plain){
  let best={a:-1,b:-1,tv:Infinity,difference:Infinity,
    chapterDifferences:[]};
  let smallestNontrivialRareCount=Infinity,unmodifiedPlainRareCount=-1;
  let exactMatches=0;
  for(let a=0;a<29;a++)for(let b=0;b<29;b++){
    const expected=profile(plain,a,b);
    const chapterDifferences=expected.map((h,j)=>h.reduce((s,v,i)=>
      s+Math.abs(v-actual[j][i]),0));
    const difference=chapterDifferences.reduce((s,v)=>s+v,0);
    const rare=expected.reduce((s,h)=>s+h[0],0);
    if(a===0&&b===0)unmodifiedPlainRareCount=rare;
    else smallestNontrivialRareCount=Math.min(
      smallestNontrivialRareCount,rare);
    if(difference===0)exactMatches++;
    if(difference<best.difference)best={a,b,
      tv:difference/(2*N),difference,chapterDifferences};
  }
  return {best,smallestNontrivialRareCount,
    unmodifiedPlainRareCount,exactMatches};
}

/** Exact complete original-layout encrypted positive, with nine
 * independently secret arbitrary (generally nonaffine) permutations.
 * All 110 physical page header runes are included. */
function positivePlant(plain){
  const permutations=starts.map((_,j)=>{
    const r=randomGenerator(0x33015700+j*977);
    const p=Array.from({length:29},(_,i)=>i);
    for(let k=28;k>0;k--){
      const m=Math.floor(r()*(k+1));
      [p[k],p[m]]=[p[m],p[k]];
    }
    return p;
  });
  assert.equal(new Set(permutations.map(p=>p.join(","))).size,9);
  const inverse=permutations.map(p=>{
    const inv=new Array(29);
    p.forEach((x,i)=>{inv[x]=i;});
    assert.deepEqual([...p].sort((a,b)=>a-b),
      Array.from({length:29},(_,i)=>i));
    return inv;
  });
  const a=10,b=20;
  const enc=(plain,k)=>{
    const page=pages[k].page, pi=permutations[chapterOf[k]];
    const c=[mod(11*plain[0]+2*page),mod(13*plain[1]+3*page)];
    for(let i=2;i<plain.length;i++){
      const q=(plain[i]+a*plain[i-1]+b*plain[i-2])%29;
      c.push(mod(c[i-1]+pi[q]));
    }
    return c;
  };
  const dec=(cipher,k,wrong=false)=>{
    const page=pages[k].page;
    const j=(chapterOf[k]+Number(wrong))%9;
    const inv=inverse[j],p=[
      mod(8*(cipher[0]-2*page)),
      mod(9*(cipher[1]-3*page))
    ];
    for(let i=2;i<cipher.length;i++){
      const q=inv[mod(cipher[i]-cipher[i-1])];
      p.push(mod(q-a*p[i-1]-b*p[i-2]));
    }
    return p;
  };
  const cipher=plain.map(enc);
  const recovered=cipher.map((c,i)=>dec(c,i));
  const wrong=cipher.map((c,i)=>dec(c,i,true));
  assert.deepEqual(recovered,plain);
  assert.deepEqual(recovered.map(enc),cipher);
  assert.notDeepEqual(wrong,plain);
  assert.deepEqual(profile(cipher,0,0,true),profile(plain,a,b));
  return {runes:recovered.flat().length,words:words.length,
    pages:pages.length,chapters:permutations.length,
    originalShape:true,sharedCoefficients:[a,b],
    recoveredExactly:true,reencryptedExactly:true,
    secretChapterAlphabetInvariantExact:true,
    wrongChapterKeyRejected:true};
}

const sources=[
  ["Shakespeare","resources/control/shakespeare_first300k.txt",0x33015637],
  ["Gibran","resources/control/gibran_prophet_58585.txt",0x33015638],
  ["Emerson","resources/control/emerson_essays_2944.txt",0x33015639]
];
const runs=[];
let plant=null;
for(const [name,file,seed] of sources){
  const pools=wordPools(read(file)),random=randomGenerator(seed);
  for(let rep=0;rep<3;rep++){
    const plain=drawMatched(pools,random);
    if(plant===null)plant=positivePlant(plain);
    const result=scanControl(plain);
    assert(result.best.tv>0.022,
      "At least one source-native original-profile candidate survives");
    assert(result.smallestNontrivialRareCount>=141,
      "Changed source-native reference rare-bin floor");
    assert.equal(result.exactMatches,0);
    runs.push({source:name,rep,...result});
  }
}
assert.equal(runs.length,9);
assert.equal(Math.min(...runs.map(x=>x.smallestNontrivialRareCount)),141);
assert.equal(plant.runes,12956);
if(require.main===module)console.log(JSON.stringify({
  status:"Chapter-independent secret GP29 alphabets fail nine finite "+
    "matched-native-English controls; no recovered LP2 plaintext",
  model:"Delta C=chapterPi(P[i]+a P[i-1]+b P[i-2]) mod29; "+
    "page-local two-rune headers",
  source:{runes:12956,words:2896,pages:55,chapters:9,
    originalChapterRarestBins:originalMins,rareBinSum:85},
  allKeys:"841 shared (a,b) pairs, each of nine unknown chapter "+
    "alphabets granted all 29! bijections",
  controls:runs,positivePlant:plant,
  limitation:"Finite source-native English references; no source-selected "+
    "original cipher, no exclusion of per-page pi or unusual plaintext"
},null,2));
