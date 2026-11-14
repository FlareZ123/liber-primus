"use strict";
/**
 * All 841 shared two-plaintext-lag GF29 coefficient pairs with 55 arbitrary
 * independent physical-page output alphabets. Every 29! output bijection per
 * page is granted exactly through sorted per-page rune-frequency profiles.
 *
 * Original printed word counts, rune inventory and page carry are held fixed.
 * Source-native GP English controls are independently drawn from real prose
 * at the complete original word lengths, with 55 page seams unchanged.
 *
 * Node 22 single-file SFT:
 * node sims/lp2_two_plain_lag_pagepi_allkey_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} =
  require("./lp2_native_gp_source_orthography_sft.cjs");
const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const read = (file) => fs.readFileSync(path.join(root, file), "utf8")
  .replace(/\r\n/g, "\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = gp.pages.filter((p) => p.page <= 55 && p.indices.length);
assert.equal(pages.length, 55);
const lens = pages.map((p) => p.indices.length);
assert.equal(lens.reduce((s,n)=>s+n,0), 12956);
const N = lens.reduce((s,n)=>s+n-2,0);
assert.equal(N, 12846);
const mod = (n) => (n%29+29)%29;
const runeIds = new Map(gp.runes.map((r,i)=>[r,i]));
const regex = new RegExp("["+gp.runes.join("")+"]+","gu");
const originalText = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0,55).join("%")
  .replace(/\/\n/g, "").replace(/[\r\n%]/g, "");
const words = (originalText.match(regex)||[]).map((w) =>
  Array.from(w,(r)=>runeIds.get(r)));
assert.equal(words.length,2896);
assert.deepEqual(words.flat(),pages.flatMap((p)=>p.indices));

/**
 * All 55 original physical pages each have two independent ciphertext headers
 * and a separate unconstrained secret permutation of all 29 symbols.
 * @param {number[][]} streams
 * @param {number} a
 * @param {number} b
 * @param {boolean} isCipher
 * @returns {number[][]} Per-page 29-bin histogram sorted ascending.
 */
function profile(streams,a,b,isCipher=false){
  assert.equal(streams.length,pages.length);
  return streams.map((x)=>{
    const histogram=new Uint16Array(29);
    for(let i=2;i<x.length;i++){
      const symbol=isCipher?mod(x[i]-x[i-1]):
        (x[i]+a*x[i-1]+b*x[i-2])%29;
      histogram[symbol]++;
    }
    return [...histogram].sort((u,v)=>u-v);
  });
}
const fixedOriginal=profile(pages.map((p)=>p.indices),0,0,true);
const originalRarest=fixedOriginal.map((h)=>h[0]);
assert.equal(fixedOriginal.reduce((sum,h)=>sum+h.reduce((a,b)=>a+b,0),0),N);
/** @param {string} raw @returns {Map<number,number[][]>} */
function pools(raw){
  const answer=new Map();
  for(const w of raw.match(/[A-Za-z]+/g)||[]){
    const runes=encodeSourceNativeGP(w);
    if(!answer.has(runes.length))answer.set(runes.length,[]);
    answer.get(runes.length).push(runes);
  }
  for(const w of words)assert.ok(answer.get(w.length)?.length,
    "Native source lacks GP word length "+w.length);
  return answer;
}
/** @param {number} seed @returns {()=>number} */
function randomGenerator(seed){
  let s=seed>>>0;
  return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296;};
}
/**
 * Independent native GP source words with ORIGINAL exact word lengths, same
 * 12956 rune count, same 55 page seams, same cross-page word continuity.
 * @param {Map<number,number[][]>} pool
 * @param {()=>number} rand
 * @returns {number[][]}
 */
function matchedNative(pool,rand){
  const tape=words.flatMap((w)=>{
    const options=pool.get(w.length);
    return options[Math.floor(rand()*options.length)];
  });
  assert.equal(tape.length,12956);
  let cursor=0;
  const split=lens.map((n)=>{
    const part=tape.slice(cursor,cursor+n);
    cursor+=n;
    return part;
  });
  assert.equal(cursor,12956);
  return split;
}
/**
 * Minimize exact necessary per-page sorted-bin difference over ALL GF29 pairs.
 * Secret page alphabets do not appear in this score because sorted bin counts
 * are invariant under every symbol bijection.
 * @param {number[][]} plain
 * @returns {{best:{a:number,b:number,tv:number,difference:number},smallestNontrivialRareCount:number,exactMatches:number,zeroPairTV:number}}
 */
function scan(plain){
  let best={a:-1,b:-1,tv:Infinity,difference:Infinity};
  let smallestNontrivialRareCount=Infinity,exactMatches=0,zeroPairTV=Infinity;
  for(let a=0;a<29;a++){
    for(let b=0;b<29;b++){
      const predicted=profile(plain,a,b);
      let sum=0,rare=0;
      for(let page=0;page<predicted.length;page++){
        const h=predicted[page];
        rare+=h[0];
        for(let k=0;k<29;k++)sum+=Math.abs(h[k]-fixedOriginal[page][k]);
      }
      if(a===0 && b===0)zeroPairTV=sum/(2*N);
      else if(rare<smallestNontrivialRareCount)
        smallestNontrivialRareCount=rare;
      if(sum===0)exactMatches++;
      if(sum<best.difference)best={
        a,b,difference:sum,tv:sum/(2*N)};
    }
  }
  return {best,smallestNontrivialRareCount,exactMatches,zeroPairTV};
}
/**
 * Independent genuinely native source planted with one shared (a,b) and
 * 55 unrelated secret, generally nonaffine output permutations. Verify full
 * exact ciphertext recovery, genuine decryption and key-free invariant.
 * @param {number[][]} plain
 * @param {number} seed
 * @param {number} a
 * @param {number} b
 * @returns {object}
 */
function positivePlant(plain,seed,a,b){
  const random=randomGenerator(seed);
  const permutations=pages.map(()=>{
    const p=Array.from({length:29},(_,i)=>i);
    for(let k=p.length-1;k>0;k--){
      const j=Math.floor(random()*(k+1));
      [p[k],p[j]]=[p[j],p[k]];
    }
    return p;
  });
  assert.equal(new Set(permutations.map((p)=>p.join(","))).size,55);
  const inverses=permutations.map((p)=>{
    const inverse=Array(29);
    p.forEach((v,i)=>{inverse[v]=i;});
    assert.deepEqual([...p].sort((x,y)=>x-y),
      Array.from({length:29},(_,i)=>i));
    return inverse;
  });
  const encryptPage=(p,k)=>{
    const originalPage=pages[k].page;
    const cipher=[mod(11*p[0]+2*originalPage),
      mod(13*p[1]+3*originalPage)];
    for(let i=2;i<p.length;i++){
      const q=mod(p[i]+a*p[i-1]+b*p[i-2]);
      cipher.push(mod(cipher[i-1]+permutations[k][q]));
    }
    return cipher;
  };
  const decryptPage=(c,k,wrong=false)=>{
    const originalPage=pages[k].page;
    const plain=[mod(8*(c[0]-2*originalPage)),
      mod(9*(c[1]-3*originalPage))];
    const inverse=inverses[wrong?(k+1)%55:k];
    for(let i=2;i<c.length;i++){
      const q=inverse[mod(c[i]-c[i-1])];
      plain.push(mod(q-a*plain[i-1]-b*plain[i-2]));
    }
    return plain;
  };
  const cipher=plain.map(encryptPage);
  assert.deepEqual(cipher.map((c,k)=>decryptPage(c,k)),plain);
  assert.deepEqual(cipher.map((c,k)=>encryptPage(decryptPage(c,k),k)),cipher);
  assert.notDeepEqual(cipher.map((c,k)=>decryptPage(c,k,true)),plain);
  assert.deepEqual(profile(cipher,0,0,true),profile(plain,a,b));
  return {runes:plain.flat().length,pages:55,secretPageAlphabets:55,
    sharedCoefficients:[a,b],exactInverse:true,exactReencryption:true,
    allSecretPageProfilesMatch:true,wrongPageKeyRejected:true};
}

const sources=[
  ["Shakespeare","resources/control/shakespeare_first300k.txt",0x33015637],
  ["Gibran","resources/control/gibran_prophet_58585.txt",0x33015638],
  ["Emerson","resources/control/emerson_essays_2944.txt",0x33015639]
];
const controls=[],plants=[];
for(const [name,file,seed] of sources){
  const pool=pools(read(file));
  const rand=randomGenerator(seed);
  for(let rep=0;rep<3;rep++){
    const native=matchedNative(pool,rand);
    if(rep===0)plants.push(positivePlant(native,seed^0x501505,
      [10,8,13][plants.length],[20,7,11][plants.length]));
    const result=scan(native);
    controls.push({source:name,rep,...result});
  }
}
assert.equal(plants.length,3);
assert.equal(controls.length,9);
console.log(JSON.stringify({source:{totalRunes:12956,printedWords:2896,
  pageCount:55,testedTransitions:N,originalRarestBinPerPage:originalRarest,
  originalRarestBinSum:originalRarest.reduce((s,v)=>s+v,0)},
  architecture:"DeltaC=pi_page(P[i]+aP[i-1]+bP[i-2]); shared a,b; "+
    "arbitrary and independent 29! output alphabets on every source page",
  exactAllKeys:841,controls,
  globalMinTV:Math.min(...controls.map((c)=>c.best.tv)),
  globalMinRarest:Math.min(...controls.map((c)=>
    c.smallestNontrivialRareCount)),
  nativePlants:plants,
  decision:"Page-local output permutations granted without fitting their values; "+
    "finite controls only, no unknown plaintext recovered"},null,2));
