"use strict";
/**
 * Director issue #2374: exact original p15 Fibonacci plaintext-autokey
 * inversion and whole-run independent native-language plant controls.
 *
 * Node22, Windows/Linux, no external packages or writes.
 * node sims/lp2_p15_fib_plain_autokey_original_sft.cjs
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIds=new Map(gp.runes.map((s,i)=>[s,i]));
const spellings=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
const mod=x=>((x%29)+29)%29;
/* Exact, separately authenticated original p15 physical 4x4 scan read.
 * Physical p15 == original JPEG32.jpg.
 * Red starting numeral at row1,col1 (zero based), next neighbor right. */
const printed=[
 [3258,3222,3152,3038],
 [3278,3299,3298,2838],
 [3288,3294,3296,2472],
 [4516,1206,708,1820]
];
const spiralCoords=[[1,1],[1,2],[2,2],[2,1],[2,0],[1,0],[0,0],
 [0,1],[0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0]];
const spiral=spiralCoords.map(([y,x])=>printed[y][x]);
assert.deepEqual(spiral,[3299,3298,3296,3294,3288,3278,3258,3222,
3152,3038,2838,2472,1820,708,1206,4516]);
const fib=[0,1,2];
while(fib.length<16)fib.push(fib.at(-1)+fib.at(-2));
const primes=[];for(let i=2;primes.length<988;i++){
 let ok=true;for(let j=2;j*j<=i;j++)if(i%j===0){ok=false;break;}
 if(ok)primes.push(i);
}
assert.deepEqual(spiral,fib.map(f=>Math.abs(3301-primes[f])));
const srcIV=spiral.slice(0,2).map(x=>x%29);
assert.deepEqual(srcIV,[22,21]);

/* Physical LP2 p16–55 is one single continuous cipher register.
 * Blank rune-free numeric-grid physical p50 is skipped without consuming key.
 * All 24 physical-page-crossing complete words from p16 onward are intact. */
const pages=gp.pages.filter(p=>p.page>=16&&p.page<=55&&p.indices.length)
 .map(p=>({page:p.page,indices:p.indices}));
const original=pages.flatMap(p=>p.indices);
assert.equal(original.length,9194);
const parsed=parseSharedCorpus();
const retained=parsed.words.filter(w=>w.startPage>=16&&w.endPage<=55);
assert.equal(retained.reduce((a,w)=>a+w.length,0),9194);
assert.equal(retained.filter(w=>w.startPage!==w.endPage).length,24);
assert.deepEqual(retained.flatMap(w=>[...w.runes].map(r=>runeIds.get(r))),original);
const wordLens=retained.map(w=>w.length);
const physicalLengths=pages.map(p=>p.indices.length);
const p16End=pages.filter(p=>p.page<=21).reduce((a,p)=>a+p.indices.length,0);
const pages40=pages.filter(p=>p.page<40).reduce((a,p)=>a+p.indices.length,0);
const pages54=pages.filter(p=>p.page<54).reduce((a,p)=>a+p.indices.length,0);
const pagesAfter53=pages.filter(p=>p.page<=53).reduce((a,p)=>a+p.indices.length,0);
assert(p16End>500&&pages40>p16End&&pages54>pages40&&pagesAfter53>pages54);
const page56=gp.pages.find(p=>p.page===56),page57=gp.pages.find(p=>p.page===57);
assert(page56&&page57);

/* Given C_i = P_i + K_i, K_{i+2}=K_i+K_{i+1}+P_i,
 * eliminate P_i to obtain the exact cipher-only key update:
 * K_{i+2}=K_{i+1}+C_i. Hence K0 affects ONLY P0; K1 fixes
 * every P_i, i>=1. All 841 IV guesses represent only 29
 * different tail decryptions. Direct vs collapsed inverses match. */
function encrypt(plain,k0,k1){
 const key=[k0,k1],c=[];
 for(let i=0;i<plain.length;i++){
  const p=plain[i],k=key[i];
  c.push(mod(p+k));
  key.push(mod(k+key[i+1]+p));
 }
 return c;
}
function decrypt(cipher,k0,k1){
 let ka=k0,kb=k1;
 const out=[];
 for(let i=0;i<cipher.length;i++){
  const p=mod(cipher[i]-ka);out.push(p);
  const kn=mod(ka+kb+p);ka=kb;kb=kn;
 }
 return out;
}
function collapseDecrypt(cipher,k0,k1){
 let sum=0;const out=[];
 for(let i=0;i<cipher.length;i++){
  if(i===0)out.push(mod(cipher[i]-k0));
  else if(i===1)out.push(mod(cipher[i]-k1));
  else out.push(mod(cipher[i]-k1-sum));
  if(i>=1)sum=mod(sum+cipher[i-1]);
 }
 return out;
}
assert.deepEqual(decrypt(original,...srcIV),collapseDecrypt(original,...srcIV));
assert.deepEqual(decrypt(original,5,12).slice(1),decrypt(original,25,12).slice(1));
for(const pair of [[22,21],[4,11],[17,6]]){
 const plain=decrypt(original,...pair);
 assert.deepEqual(encrypt(plain,...pair),original);
}

function gpWord(word){
 const s=word.toUpperCase().replace(/QU/g,"CW")
  .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
 const arr=[];
 for(let i=0;i<s.length;){
  if(s.startsWith("ING",i)){arr.push(21);i+=3;}
  else if(s.startsWith("IO",i)){arr.push(27);i+=2;}
  else{const t=spellings.find(t=>s.startsWith(t.s,i));
   assert(t,"unmappable native text "+word);arr.push(t.i);i+=t.s.length;}
 }
 return arr;
}
for(const [english,runes] of [
 ["THINGS","ᚦᛝᛋ"],["FOLLOWING","ᚠᚩᛚᛚᚩᚹᛝ"],
 ["CONSUMPTION","ᚳᚩᚾᛋᚢᛗᛈᛏᛡᚾ"]])
 assert.equal(gpWord(english).map(i=>gp.runes[i]).join(""),runes);
const lex=new Map(),refCounts=new Array(29).fill(1);
for(const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/)){
 const m=line.match(/^([A-Za-z]+)\s+(\d+)$/);
 if(!m)continue;
 const seq=gpWord(m[1]),key=seq.join(",");
 const count=Number(m[2]);
 lex.set(key,(lex.get(key)||0)+count);
 const wt=Math.min(100,Math.sqrt(count));
 for(const x of seq)refCounts[x]+=wt;
}
assert(lex.size>20000);
const tot=refCounts.reduce((a,b)=>a+b,0),logP=refCounts.map(x=>Math.log(x/tot));
/* Book-likelihood unigram model is frozen on INDEPENDENT public
 * TextBlob/Norvig English word-frequency data. The actual donor
 * manuscripts and the original LP2 pages are not used for scoring. */
function plausibility(seq){let score=0;for(const x of seq)score+=logP[x];return score;}
function ioc(seq){
 const cnt=new Array(29).fill(0);
 for(const x of seq)cnt[x]++;
 return cnt.reduce((a,n)=>a+n*(n-1),0)/(seq.length*(seq.length-1));
}
function fixedWindowAnalysis(cipher,k0,k1){
 const p=decrypt(cipher,k0,k1);
 return {first100:p.slice(0,100).map(x=>gp.translit[x]).join(" "),
  trainIoC:ioc(p.slice(0,p16End)),hold40to53IoC:ioc(p.slice(pages40,pagesAfter53)),
  hold54to55IoC:ioc(p.slice(pages54)),
  fullIoC:ioc(p),
  trainLogPerRune:plausibility(p.slice(1,p16End))/(p16End-1),
  holdLogPerRune:plausibility(p.slice(pages40,pagesAfter53))/(pagesAfter53-pages40)};
}
function selectKeys(cipher){
 // Fully exhaustive 841 IVs, though 29 lexicographically tied k0
 // possibilities in the train suffix. Normalize with independent lexicon.
 const rows=[];
 for(let k1=0;k1<29;k1++){
  const p=decrypt(cipher,0,k1);
  const train=p.slice(1,p16End);
  rows.push({k1,score:plausibility(train),trainIoC:ioc(train)});
 }
 rows.sort((a,b)=>b.score-a.score);
 const bestK1=rows[0].k1,base=decrypt(cipher,0,bestK1);
 const firstLen=wordLens[0],first=base.slice(0,firstLen),keys=[];
 for(let k0=0;k0<29;k0++){
  const candidate=first.slice();candidate[0]=mod(cipher[0]-k0);
  const lexFreq=lex.get(candidate.join(","))||0;
  keys.push({k0,lexFreq,firstWord:candidate.map(i=>gp.translit[i]).join(" ")});
 }
 keys.sort((a,b)=>b.lexFreq-a.lexFreq);
 let explicit=0;
 for(let k0=0;k0<29;k0++)for(let k1=0;k1<29;k1++){
  const p=decrypt(cipher,k0,k1);
  // All full decoded candidates must be mathematically valid, not guesses.
  assert.deepEqual(encrypt(p,k0,k1),cipher);
  explicit++;
 }
 assert.equal(explicit,841);
 return {k0:keys[0].k0,k1:bestK1,
  topK1:rows.slice(0,4).map(x=>({...x,scorePerRune:x.score/(p16End-1)})),
  wrongVsBestLogGap:rows[0].score-rows[1].score,
  topK0:keys.slice(0,3),allIVsTested:explicit,
  decoded:decrypt(cipher,keys[0].k0,bestK1)};
}
const originalSelection=selectKeys(original);
const p15SeedResult=fixedWindowAnalysis(original,...srcIV);
const trainedResult=fixedWindowAnalysis(original,originalSelection.k0,originalSelection.k1);
const originalAll29=[];
for(let k1=0;k1<29;k1++){
 const p=decrypt(original,srcIV[0],k1);
 originalAll29.push({k1,trainIoC:ioc(p.slice(1,p16End)),
   holdIoC:ioc(p.slice(pages40,pagesAfter53))});
}
assert(originalAll29.every(x=>x.trainIoC<0.045 && x.holdIoC<0.045));
assert(Math.max(...originalAll29.map(x=>x.trainIoC))<0.038);

/* Three independent donor texts, all words native, with all original
 * p16–55 complete-word lengths, all source page rune lengths and
 * every authentic page-carried word retained. The FIRST 13-rune word is
 * drawn from genuine donor words also present in the independent frozen
 * scoring lexicon; no planted plaintext or IV is exposed to selectKeys. */
function rand(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
const donors=[
 ["Shakespeare","resources/control/shakespeare_first300k.txt",0x33013701,4,11],
 ["Gibran","resources/control/gibran_prophet_58585.txt",0x33013702,22,21],
 ["Emerson","resources/control/emerson_essays_2944.txt",0x33013703,17,6]
];
const positives=[];
for(const [name,filename,seed,k0,k1] of donors){
 const pool=new Map();
 for(const word of read(filename).toUpperCase().match(/[A-Z]+/g)||[]){
  const seq=gpWord(word),ar=pool.get(seq.length)||[];
  ar.push(seq);pool.set(seq.length,ar);
 }
 assert(pool.get(13)?.length>0);
 const rng=rand(seed),bag=new Map();
 for(const [len,ar] of pool){
  const shuffled=ar.slice();
  for(let i=shuffled.length-1;i>0;i--){
   const j=rng()%(i+1);[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
  }
  bag.set(len,shuffled);
 }
 const lexFirst=bag.get(13).filter(seq=>lex.has(seq.join(",")));
 assert(lexFirst.length>0,"no independently lexicon-covered 13-rune donor word");
 const first=lexFirst[rng()%lexFirst.length];
 const cursor=new Map();
 let plant=[];
 for(let i=0;i<wordLens.length;i++){
  const len=wordLens[i],row=bag.get(len);
  assert(row?.length, "no native words for original length "+len);
  const j=cursor.get(len)||0;cursor.set(len,j+1);
  const s=i===0?first:row[j%row.length];
  assert.equal(s.length,len);plant.push(...s);
 }
 assert.equal(plant.length,original.length);
 const encoded=encrypt(plant,k0,k1);
 const solution=selectKeys(encoded);
 const actualSelection=fixedWindowAnalysis(encoded,k0,k1);
 const bestSelection=fixedWindowAnalysis(encoded,solution.k0,solution.k1);
 const trueRank=solution.topK1.findIndex(x=>x.k1===k1);
 const matchingFirstWord=solution.topK0.find(x=>x.k0===k0);
 positives.push({
  name,donor:filename,
  trueKey:[k0,k1],selectedKey:[solution.k0,solution.k1],
  exactK1:solution.k1===k1,exactK0:solution.k0===k0,
  trueKeyInTop4K1:trueRank>=0,firstWordLen:wordLens[0],
  plantedFirstWord:plant.slice(0,wordLens[0]).map(x=>gp.translit[x]).join(" "),
  k0TrueLexFreq:matchingFirstWord?.lexFreq||0,
  k0Top:solution.topK0,
  trainLogGap:solution.wrongVsBestLogGap,
  actualSelection,bestSelection,
  recoveredFirst500:solution.decoded.slice(0,500).every((v,i)=>v===plant[i]),
  recoveredTotal:solution.decoded.filter((v,i)=>v===plant[i]).length,
  reencryptionFull:encrypt(solution.decoded,solution.k0,solution.k1).every((v,i)=>v===encoded[i])
 });
 assert(positives.at(-1).reencryptionFull);
 assert(positives.at(-1).exactK1,"native unigram wrong k1 for "+name);
 // Exact k0 may remain intrinsically unidentifiable if the first donor word
 // is absent from / ambiguous within the independently frozen lexicon.
}
console.log(JSON.stringify({
 source:{physicalStart:16,physicalEnd:55,runes:original.length,
 words:retained.length,crossPageWords:24,trainP16to21:p16End,
 holdP40to53:pagesAfter53-pages40,holdP54to55:original.length-pages54},
 sourceSpiral:{printed,spiral,seedPairNumbers:spiral.slice(0,2),GP29Seeds:srcIV},
 algebra:"K[i+2]=K[i+1]+C[i] mod29; K0 influences only P0; 841 IVs collapse to 29 distinct 9193-rune tails",
 plantedNative:positives,
 original:{bestIndependentLexiconKey:[originalSelection.k0,originalSelection.k1],
 topK1:originalSelection.topK1,firstWordCandidates:originalSelection.topK0,
 seed:p15SeedResult,bestTraining:trainedResult,
 all29TrainIoC:{min:Math.min(...originalAll29.map(x=>x.trainIoC)),
 max:Math.max(...originalAll29.map(x=>x.trainIoC))},
 all29HoldIoC:{min:Math.min(...originalAll29.map(x=>x.holdIoC)),
 max:Math.max(...originalAll29.map(x=>x.holdIoC))}},
 conclusion:"No p16–55 plaintext found. Source-seeded and all-841-IV direct GP29 inverses lack source-native English concentration on training and untouched holdouts. Not a rejection of other nonstationary ciphers."
},null,2));
