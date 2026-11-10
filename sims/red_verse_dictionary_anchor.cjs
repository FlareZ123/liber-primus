'use strict';

/**
 * Exact-key inversion of the isolated fifty-rune red stanza on LP2 page 53.
 *
 * The fourth word contains eleven runes. If this word is an English lexicon
 * word and the cipher is repeating additive mod29 with period <= 11, the
 * whole proposed key is fixed by that word. Enumerate *all* such lexicon
 * anchors and retain only keys consistent with repeated positions.
 * Decode every other word without any additional fitting and compare with
 * matched shuffled-ciphertext searches.
 *
 * node sims/red_verse_dictionary_anchor.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=require('./relative_key_english_probe.cjs');

const ROOT=path.join(__dirname,'..');
/** @param {string} name */
const read=name=>fs.readFileSync(path.join(ROOT,name),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const span=JSON.parse(read('resources/liber-primus/lp2-page53-red-span.json'));
const runeMap=new Map(gp.runes.map((x,i)=>[x,i]));
const anchorIndex=span.red_text.first_11_rune_crib_anchor_word_index_zero_based;
const mod=x=>(x%29+29)%29;

/** Extract the verse by the independently observed physical red-line boundary. */
function sourceWords(){
  const manuscript=read('resources/lp2-transcription.txt').split('%');
  const current=manuscript[52]; // Physical LP2 page 53; rune-only page 50 omitted in master.
  const lines=current.split('/').filter(s=>[...s].some(x=>runeMap.has(x)));
  assert.equal(lines.length,9);
  const raw=lines.slice(-3).join('');
  const words=[];
  let word=[];
  for(const ch of raw){
    const x=runeMap.get(ch);
    if(x!==undefined){word.push(x);continue;}
    if('-.$&§'.includes(ch)){
      if(word.length)words.push(word);
      word=[];
    }
  }
  if(word.length)words.push(word);
  assert.deepEqual(words.map(w=>w.length),span.red_text.word_lengths);
  const flat=words.flat();
  const actual=gp.pages.find(p=>p.page===53);
  assert.equal(actual.indices.length,179);
  assert.deepEqual(flat,actual.indices.slice(129));
  assert.deepEqual(flat,[...span.red_text.runes].map(c=>runeMap.get(c)));
  return words;
}

/** Build an anchored dictionary in GP-runic spelling from a fixed word-frequency corpus. */
function lexicon(){
  const words=new Map();
  for(const line of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/u)){
    const m=/^([a-z]+)\s+(\d+)$/u.exec(line);
    if(!m)continue;
    // The GP orthography has no standalone Q rune; QU is normalized to CW.
    if(/q(?!u)/u.test(m[1]))continue;
    const indices=base.encode(m[1]);
    const key=indices.join(',');
    const old=words.get(key);
    const freq=Number(m[2]);
    if(!old||freq>old.freq)words.set(key,{indices,freq,english:m[1]});
  }
  const anchors=[...words.values()].filter(w=>w.indices.length===11);
  assert.ok(words.size>28000&&anchors.length>1400);
  return {words,anchors};
}

/** @param {number[][]} words */
function wordPositions(words){
  const starts=[];let n=0;
  for(const word of words){starts.push(n);n+=word.length;}
  return starts;
}

/** @param {number[]} cipher @param {boolean} skipF */
function phases(cipher,skipF){
  let phase=0;
  return cipher.map(c=>{
    const before=phase;
    if(!(skipF&&c===0))phase++;
    return before;
  });
}

/**
 * Freeze the key using ONLY the word-3 dictionary anchor, then decode all
 * other words. Sign is redundant for an unrestricted key (negating the key
 * gives the same hypothesis); 28-C covers the atbash carrier.
 * @param {number[][]} cipherWords
 * @param {ReturnType<typeof lexicon>} dict
 * @param {number} keep
 */
function search(cipherWords,dict,keep=5){
  const starts=wordPositions(cipherWords),cipher=cipherWords.flat();
  const targetAnchor=cipherWords.findIndex(w=>w.length===11);
  assert.ok(targetAnchor>=0);
  const baseStart=starts[targetAnchor],lengths=cipherWords.map(w=>w.length);
  assert.equal(cipher.length,50);
  const best=[];let accepted=0;
  const seedAnchor=cipherWords[targetAnchor];
  /** @param {object} obj */
  function save(obj){
    best.push(obj);best.sort((a,b)=>b.score-a.score||b.longMatched-a.longMatched);
    if(best.length>keep)best.pop();
  }
  for(const flip of [false,true])for(const skipF of [false,true]){
    const ph=phases(cipher,skipF);
    const observed=cipher.map(c=>flip?28-c:c);
    for(let period=1;period<=11;period++)for(const anchored of dict.anchors){
      const key=new Int16Array(period).fill(-1);
      let valid=true;
      for(let j=0;j<seedAnchor.length;j++){
        const index=baseStart+j;
        const plain=anchored.indices[j];
        if(skipF&&cipher[index]===0){
          if(plain!==0){valid=false;break;}
          continue;
        }
        const phase=ph[index]%period;
        const k=mod(observed[index]-plain);
        if(key[phase]!==-1&&key[phase]!==k){valid=false;break;}
        key[phase]=k;
      }
      if(!valid||key.includes(-1))continue;
      accepted++;
      let score=0,matched=0,longMatched=0;
      const wordTexts=[],decoded=[];
      for(let j=0;j<lengths.length;j++){
        const w=Array.from({length:lengths[j]},(_,z)=>{
          const i=starts[j]+z;
          return skipF&&cipher[i]===0 ? 0 : mod(observed[i]-key[ph[i]%period]);
        });
        decoded.push(...w);
        const hit=dict.words.get(w.join(','));
        wordTexts.push(hit?hit.english: w.map(x=>gp.translit[x]).join('').toLowerCase());
        if(j===targetAnchor)continue; // Never score the forced English anchor.
        if(hit){
          matched++;
          if(w.length>=3)longMatched++;
          score+=Math.log1p(hit.freq)+0.45*w.length;
        }else if(w.length>=3)score-=5;
      }
      save({score,matched,longMatched,period,flip,skipF,
        key:Array.from(key),anchor:anchored.english,
        text:wordTexts.join(' '),decoded});
    }
  }
  return {evaluatedKeys:accepted,best};
}

/** @param {number} seed */
function rng(seed){
  let x=seed>>>0;
  return ()=>{
    x^=x<<13;x^=x>>>17;x^=x<<5;
    return (x>>>0)/4294967296;
  };
}

/** @param {number[][]} words @param {()=>number} next */
function randomize(words,next){
  const all=words.flat(),shuffled=all.slice();
  for(let trial=0;trial<1000;trial++){
    for(let i=shuffled.length-1;i>0;i--){
      const j=Math.floor(next()*(i+1));
      [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
    }
    if(shuffled.every((x,i)=>i===0||x!==shuffled[i-1]))break;
    assert.ok(trial!==999,'No zero-doublet permutation after 1000 trials');
  }
  let at=0;
  return words.map(w=>{
    const piece=shuffled.slice(at,at+w.length);
    at+=w.length;
    return piece;
  });
}

/** Exact positive: a length-matched lexicon passage masked with one hidden 7-rune key. */
function plant(words,dict){
  const lengthToWords=new Map();
  for(const w of dict.words.values()){
    if(w.freq<20)continue;
    if(!lengthToWords.has(w.indices.length))lengthToWords.set(w.indices.length,[]);
    lengthToWords.get(w.indices.length).push(w);
  }
  for(const a of lengthToWords.values())a.sort((x,y)=>y.freq-x.freq);
  const source=words.map((w,i)=>{
    const options=lengthToWords.get(w.length);
    assert.ok(options.length>10);
    return options[(3+7*i)%Math.min(20,options.length)].indices;
  });
  const plain=source.flat(),next=rng(0x326f9a11);
  let cipher=null,key=null;
  for(let attempt=0;attempt<1000;attempt++){
    const k=Array.from({length:7},()=>Math.floor(next()*29));
    const out=plain.map((p,i)=>mod(p+k[i%7]));
    if(out.slice(1).some((x,i)=>x===out[i]))continue;
    cipher=out;key=k;break;
  }
  assert.ok(cipher&&key);
  let at=0;
  const cipherWords=words.map(w=>{
    const s=cipher.slice(at,at+w.length);
    at+=w.length;
    return s;
  });
  const output=search(cipherWords,dict,5);
  assert.deepEqual(output.best[0].decoded,plain);
  assert.equal(output.best[0].period,7);
  assert.deepEqual(output.best[0].key,key);
  return {sourceWords:source.map(w=>w.map(x=>gp.translit[x]).join('')),
    hiddenPeriod:7,trueKey:key,selected:output.best[0].text,
    recoveredExact:true,matchedLongWords:output.best[0].longMatched,
    totalMatchedWords:output.best[0].matched};
}

/** The red arrow motivates a deliberately small, predeclared reading-order family. */
function readingOrders(words){
  return [
    {name:'printed-order',words},
    {name:'reverse-glyph-and-word-order',words:words.slice().reverse().map(w=>w.slice().reverse())},
    {name:'reverse-word-order',words:words.slice().reverse().map(w=>w.slice())},
    {name:'mirror-each-word',words:words.map(w=>w.slice().reverse())}
  ];
}

function main(){
  const words=sourceWords(),dict=lexicon();
  const orientations=readingOrders(words);
  const selected=orientations.map(o=>({name:o.name,output:search(o.words,dict)}));
  const strongest=selected.slice().sort((a,b)=>b.output.best[0].score-a.output.best[0].score)[0];
  const observed=strongest.output;
  const positive=plant(words,dict);
  const next=rng(0x32719e20);
  const count=40,nullScores=[];
  for(let t=0;t<count;t++){
    const shuffled=randomize(words,next);
    const controls=readingOrders(shuffled).map(o=>search(o.words,dict,1).best[0].score);
    nullScores.push(Math.max(...controls));
  }
  const actual=observed.best[0].score;
  nullScores.sort((a,b)=>a-b);
  const out={source:'LP2 page 53 / 70.jpg, final three red lines',
    redRunes:words.flat().length,sourceWordLengths:words.map(x=>x.length),
    lexiconRunes:dict.words.size,anchorOptions:dict.anchors.length,
    hypothesis:'A GP additive/atbash repeating key of period 1..11 with a lexicon word at the unique 11-rune anchor, optional literal-F skip',
    real:{bestOrientation:strongest.name,perOrientation:selected.map(o=>({name:o.name,score:o.output.best[0].score,longWords:o.output.best[0].longMatched,matched:o.output.best[0].matched})),
      evaluatedKeys:observed.evaluatedKeys,best:observed.best.map(x=>({...x,decoded:undefined}))},
    positive,
    matchedNull:{replicates:count,wordLengths:'fixed',runeHistogram:'fixed',
      adjacentDoublets:0,readingOrders:'four fixed variants selected as a family',meanBest:nullScores.reduce((a,b)=>a+b,0)/count,
      medianBest:nullScores[Math.floor(count/2)],maxBest:nullScores[count-1],
      empiricalUpperTail:(1+nullScores.filter(x=>x>=actual).length)/(count+1)},
    status:'A candidate must decrypt held-out non-anchor words into sustained readable language to qualify as recovered text'
  };
  console.log(JSON.stringify(out,null,2));
}
if(require.main===module)main();
module.exports={sourceWords,lexicon,search,plant};
