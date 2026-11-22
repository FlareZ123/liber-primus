"use strict";

/**
 * Issue #1492: all-secret single-word necessary condition for the known
 * Cicada p56 prime-totient / transparent F cipher under ONE global unknown
 * GP29 conjugating alphabet permutation.
 *
 * Each original printed word may start at ANY one of prime indices 0..463
 * independently (strict superset of one global clock), both arithmetic signs,
 * and either literal printed F bypass or a relabeled GP0 bypass. Every possible
 * transparent-glyph consumption decision inside the word is enumerated.
 * The unknown alphabet is entirely free, but any hypothesized plaintext word
 * must satisfy ALL modular differences α(C)-α(P)=±φ(prime) (mod29) under ONE
 * injective α. Relations are checked exactly with a weighted potential graph,
 * followed by full 29-residue component-translation exact covering.
 *
 * A ZERO original word preimage would rule out the much smaller authentic
 * global π family on that word under the historically pinned English lexicon.
 * A positive only means "not contradicted" and does not recover a global π.
 *
 * Windows 11 / Node 22 CommonJS, read-only SFT. No dependencies.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const words=parseSharedCorpus().words;
const runeIndex=new Map(gp.runes.map((r,i)=>[r,i]));
assert.equal(words.length,2896);
const wordNumbers=words.map(w=>Array.from(w.runes,r=>runeIndex.get(r)));
const textblob=read("resources/control/english_wordfreq_textblob.txt");
const vocab=textblob.split(/\r?\n/).filter(s=>/^[a-z]+\s+\d+$/i.test(s)).map(s=>s.split(/\s+/)[0].toUpperCase());
const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** Source-native GP spelling confirmed against 181 solved LP1 words and p57. */
function encode(word){
  const clean=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const out=[];
  for(let i=0;i<clean.length;){
    if(clean.startsWith("ING",i)){out.push(21);i+=3;}
    else if(clean.startsWith("IO",i)){out.push(27);i+=2;}
    else{
      const t=tokens.find(x=>clean.startsWith(x.s,i));
      if(!t)return null;
      out.push(t.i);i+=t.s.length;
    }
  }
  return out;
}
const dictionary=Array.from({length:15},()=>[]);
for(const str of new Set(vocab)){
  const numbers=encode(str);
  if(numbers&&numbers.length<dictionary.length)
    dictionary[numbers.length].push({word:str,nums:numbers});
}
function primes(count) {
  const r=[];
  for(let n=2;r.length<count;n++){
    let isPrime=true;
    for(let d=2;d*d<=n;d++)if(n%d===0){isPrime=false;break;}
    if(isPrime)r.push(n);
  }
  return r;
}
const PRIME=primes(540);
const shift=PRIME.map(p=>(p-1)%29);
const mod29=n=>(n%29+29)%29;
function checkRelations(edges, pin){
  const adjacent=Array.from({length:29},()=>[]);
  for(const [c,p,k] of edges){
    // α(C)-α(P)=k
    adjacent[c].push([p,mod29(-k)]);
    adjacent[p].push([c,mod29(k)]);
  }
  const component=new Int16Array(29).fill(-1);
  const potential=new Int16Array(29);
  const masks=[];
  for(let i=0;i<29;i++)if(component[i]===-1){
    const id=masks.length;
    component[i]=id;
    const stack=[i];
    let mask=0;
    for(let j=0;j<stack.length;j++){
      const x=stack[j], bit=(1<<potential[x]);
      if(mask&bit)return false; // two distinct GP symbols collapse under α
      mask|=bit;
      for(const [y,delta] of adjacent[x]){
        const wanted=mod29(potential[x]+delta);
        if(component[y]===-1){
          component[y]=id;potential[y]=wanted;stack.push(y);
        }else if(component[y]!==id||potential[y]!==wanted)return false;
      }
    }
    masks.push(mask);
  }
  // A global α is a permutation. Each congruence component can be translated
  // on GF29, but no two translated occupied residues may overlap. Singletons
  // can fill all remaining residues, so only non-singletons require backtrack.
  const all=0x1fffffff;
  const restrictions=[];
  for(let k=0;k<masks.length;k++){
    const mask=masks[k], count=popcount(mask);
    if(count>1)restrictions.push({id:k,count,mask});
  }
  const pinnedComponent=pin>=0?component[pin]:-1;
  let reserved=0;
  let fixed=-1;
  if(pin>=0){
    fixed=mod29(-potential[pin]);
    if(popcount(masks[pinnedComponent])===1)reserved=1;
  }
  restrictions.sort((a,b)=>b.count-a.count);
  const rotate=(mask,offset)=>((mask<<offset)|(mask>>>(29-offset)))&all;
  // Exact cover of <29 positions, with singleton variables left free.
  function cover(index,used){
    if(index===restrictions.length)return true;
    const r=restrictions[index];
    const start=r.id===pinnedComponent?fixed:0;
    const stop=r.id===pinnedComponent?fixed+1:29;
    for(let j=start;j<stop;j++){
      const moved=rotate(r.mask,j);
      if(!(moved&used)&&cover(index+1,used|moved))return true;
    }
    return false;
  }
  return cover(0,reserved);
}
function popcount(mask){let n=0;while(mask){mask&=mask-1;n++;}return n;}
/** Enumerates exact fixed-marker bypass paths for one candidate word. */
function compatible(cipher,plain,start,sign,marker,relabeled){
  let edges=[];
  function visit(pos,t){
    if(pos===cipher.length)return checkRelations(edges,relabeled?marker:-1);
    const C=cipher[pos],P=plain[pos];
    if(C===marker&&P===marker&&visit(pos+1,t))return true;
    if(P===marker)return false;
    edges.push([C,P,mod29(sign*shift[t])]);
    const ok=visit(pos+1,t+1);
    edges.pop();
    return ok;
  }
  return visit(0,start);
}
const actualP56=gp.pages[56].indices;
const p56Expected="AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const p56Plain=p56Expected.split(" ").flatMap(w=>encode(w));
assert.equal(p56Plain.length,85);
let k=0;
const skips=[];
for(let i=0;i<85;i++){
  const C=actualP56[i],P=p56Plain[i];
  if(C===0&&P===0){skips.push(i);continue;}
  assert.equal(C,mod29(P+shift[k]),"authentic p56 source at offset "+i);k++;
}
assert.deepEqual(skips,[56]);
console.log("AUTHENTIC_P56_PASS 85/85, sole plaintext-F skip at index 56; total prime emissions "+k);
const sample=dictionary[14].find(x=>!x.nums.includes(0))||dictionary[14][0];
assert(sample,"source lexicon must have a fourteen-rune English word");
const secret=Array.from({length:29},(_,i)=>i);
let s=0x14553e;const random=()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};
for(let j=28;j>0;j--){const m=Math.floor(random()*(j+1));[secret[j],secret[m]]=[secret[m],secret[j]];}
const inverse=new Uint8Array(29);secret.forEach((x,i)=>{inverse[x]=i;});
function encrypt(P,start=17){
  const out=[];
  for(let i=0;i<P.length;i++)
    out.push(secret[(inverse[P[i]]+shift[start+i])%29]);
  return out;
}
const planted=encrypt(sample.nums,17);
assert(compatible(planted,sample.nums,17,1,0,false),"globally relabeled English plant algebraic check");
console.log("POSITIVE_RANDOM_PERM_WORD",sample.word,"14/14 with seeded unknown π at start17");

/** The pin-invariant and exact matching certificate use every word of lengths 13 and 14. */
let globalCount=0;
for(const [len,sameLengthWords] of [[14,wordNumbers],[13,wordNumbers]]){
  for(let index=0;index<sameLengthWords.length;index++){
    const C=sameLengthWords[index];
    if(C.length!==len)continue;
    const candidateWords=dictionary[len];
    let compatibleCount=0,examples=[];
    let tested=0;
    // Strongest per-word relaxation: any phase 0..463, ±, either fixed printed
    // F bypass or any candidate relabeled zero bypass, and independent π per word.
    // The whole-book model is a strict subset of this per-word relaxation.
    outer:for(const candidate of candidateWords){
      const P=candidate.nums;
      for(let sign of [1,-1]){
        for(let start=0;start<464;start++){
          // Literal F interpretation, then every relabeled-marker alternative.
          if(compatible(C,P,start,sign,0,false)){
            compatibleCount++;
            if(examples.length<3)examples.push({word:candidate.word,sign,start,marker:"literal F"});
            continue outer;
          }
          for(let marker=0;marker<29;marker++){
            if(compatible(C,P,start,sign,marker,true)){
              compatibleCount++;
              if(examples.length<3)examples.push({word:candidate.word,sign,start,marker});
              continue outer;
            }
          }
          tested++;
        }
      }
    }
    console.log("ORIGINAL_WORD",JSON.stringify({
      index,len,lexiconWords:candidateWords.length,compatibleWords:compatibleCount,
      examples,unitsOfPhaseSearch:tested
    }));
    globalCount++;
  }
}
assert.equal(globalCount,7,"expected 3 original 14-rune and 4 original 13-rune words");
console.log("STATUS all-secret wordwise source-lexicon feasibility complete; evidence is necessary only.");


/**
 * STRICTER ORIGINAL PAGE-RESET CLOCK NECESSITY: a word at physical-page-local
 * offset j can have consumed between j - (# preceding marker occurrences)
 * and j primes. This bound holds for EVERY prior bypass history and every
 * shared pi. It is a smaller set than an arbitrary start0..463.
 */
const runePages=gp.pages.filter(p=>p.page<=55&&p.indices.length);
let global=0;
const offsets=[];
for(const p of runePages){offsets.push(global);global+=p.indices.length;}
assert.equal(global,12956);
let wordStart=0;
let constrained=0;
for(let w=0;w<words.length;w++){
  const cipherWord=wordNumbers[w], len=cipherWord.length;
  const currentGlobalStart=wordStart;wordStart+=len;
  if(len<12)continue;
  const section=words[w].startPage;
  if(words[w].endPage!==section)continue;
  const page=runePages[section];
  assert(page,"word local physical page mismatch");
  const start=currentGlobalStart-offsets[section];
  assert(start>=0&&start+len<=page.indices.length);
  const prefix=page.indices.slice(0,start);
  let positives=0;
  let witnesses=[];
  const possibilities=dictionary[len];
  candidateLoop:for(const candidate of possibilities){
    const P=candidate.nums;
    for(const sign of [1,-1]){
      // Original physically printed F is always a candidate bypass marker.
      let count=prefix.filter(x=>x===0).length;
      for(let phase=start-count;phase<=start;phase++){
        if(compatible(cipherWord,P,phase,sign,0,false)){
          positives++;
          if(witnesses.length<3)witnesses.push({word:candidate.word,marker:"literal F",phase,sign});
          continue candidateLoop;
        }
      }
      // Alternatively transparent F in the hidden alphabet pi(0) can be
      // any one source rune; pi^-1(marker)=0 is enforced by the graph checker.
      for(let marker=0;marker<29;marker++){
        count=prefix.filter(x=>x===marker).length;
        for(let phase=start-count;phase<=start;phase++){
          if(compatible(cipherWord,P,phase,sign,marker,true)){
            positives++;
            if(witnesses.length<3)witnesses.push({word:candidate.word,marker,phase,sign});
            continue candidateLoop;
          }
        }
      }
    }
  }
  console.log("ORIGINAL_PAGE_RESET_WORD",JSON.stringify({
    index:w,physicalPage:page.page,offset:start,len,
    lexiconWords:possibilities.length,compatibleWords:positives,
    witnesses
  }));
  constrained++;
}
assert.ok(constrained>=20,"expected ≥20 intact original words length≥12");
console.log("SOURCE_PAGE_RESET_WORD_COUNT",constrained);
