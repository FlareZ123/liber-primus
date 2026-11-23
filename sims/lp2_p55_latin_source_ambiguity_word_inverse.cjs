"use strict";
/**
 * Original LP2 p55 source-key inversion with *all valid* GP29 spellings of
 * authenticated LATIN-letter source phrases, not just the conventional
 * longest-token transliteration. A finite exact word-DP.
 *
 * This is an original-plaintext recovery attempt, not a decrypted claim.
 * Run from repository root:
 *   node sims/lp2_p55_latin_source_ambiguity_word_inverse.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription=read("resources/liber-primus/lp2-transcription.txt");
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const lexicon=read("resources/control/english_wordfreq_textblob.txt");
const source2013="Like the instar, tunneling to the surface\n"+
"We must shed our own circumferences;\n"+
"Find the divinity within and emerge.";
const source2013Witness=read("im-results/audio761-original-id3-frame-inventory.md");
assert(source2013Witness.includes("Like the instar, tunneling to the surface"));
assert(source2013Witness.includes("Find the divinity within and emerge"));
const source2016=signed.split("-----BEGIN PGP SIGNATURE-----")[0]
  .split("\n\n").slice(1).join("\n");
assert(source2016.includes("epiphany seeks the devoted"));
const N=29,alphabet=corpus.translit;
const tokens=alphabet.map((symbol,index)=>({symbol,index}))
  .sort((a,b)=>b.symbol.length-a.symbol.length);
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const normalize=s=>s.toUpperCase().replace(/QU/g,"CW")
  .replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U")
  .replace(/K/g,"C").replace(/Q/g,"C").replace(/Z/g,"S")
  .replace(/[^A-Z]/g,"");
const encodeLatin=latin=>{
  const s=normalize(latin),out=[];
  for(let i=0;i<s.length;){
    const hit=tokens.find(t=>s.startsWith(t.symbol,i));
    assert(hit,"Untransliterable letter at "+i+" in "+s);
    out.push(hit.index);i+=hit.symbol.length;
  }
  return out;
};
const p55transcript=transcription.split("%")[54];
const original=[];let current=[];
for(const rune of p55transcript){
  if(runeIndex.has(rune)){current.push(runeIndex.get(rune));continue;}
  if("-.$&§".includes(rune)&&current.length){
    original.push(current);current=[];
  }
}
if(current.length)original.push(current);
assert.equal(original.length,17);
assert.equal(original.flat().length,76);
assert.deepEqual(original.flat(),corpus.pages[55].indices);
const dict=new Map(),byLength=new Map();
for(const line of lexicon.split(/\r?\n/)){
  const m=line.match(/^([a-z]+) (\d+)$/);
  if(!m)continue;
  const word=encodeLatin(m[1]),key=word.join(","),frequency=Number(m[2]);
  dict.set(key,(dict.get(key)||0)+frequency);
  const prior=byLength.get(word.length);
  if(!prior||prior.frequency<frequency)byLength.set(word.length,{word,frequency});
}
assert.equal(dict.size,29060);
assert(original.every(w=>byLength.has(w.length)));
const decodeWord=(cipher,key,sign)=>
  cipher.map((c,i)=>key[i]===-1?0:(c+sign*key[i]+N)%N);
function invert(words,source,sign,skipF,start=0){
  // A state is the cursor into the unspaced Latin source, not a pre-imposed GP
  // runeization; every legal TH/EA/NG/IA decomposition remains available.
  const S=normalize(source);
  function extend(cursor,cipher,index,key,emit){
    if(index===cipher.length){emit(cursor,key);return;}
    if(skipF&&cipher[index]===0){
      extend(cursor,cipher,index+1,key.concat(-1),emit);return;
    }
    for(const {symbol,value,index:gp} of tokens){
      if(S.startsWith(symbol,cursor))
        extend(cursor+symbol.length,cipher,index+1,key.concat(gp),emit);
    }
  }
  let states=new Map([[start,{hits:0,score:0,plaintext:[],end:start}]]);
  for(const ciphertext of words){
    const next=new Map();
    for(const [cursor,state] of states){
      extend(cursor,ciphertext,0,[],(end,key)=>{
        const p=decodeWord(ciphertext,key,sign),count=dict.get(p.join(","))||0;
        const hits=state.hits+(count>0?1:0);
        const score=state.score+(count>0?Math.log(count+1):-7);
        const old=next.get(end);
        if(!old||hits>old.hits||(hits===old.hits&&score>old.score)){
          next.set(end,{hits,score,plaintext:state.plaintext.concat([p]),end});
        }
      });
    }
    states=next;
    if(states.size===0)return null;
  }
  const winners=[...states.values()].sort((a,b)=>b.hits-a.hits||b.score-a.score);
  return {...winners[0],start,sign,skipF};
}
const render=result=>result&&({
  start:result.start,end:result.end,sign:result.sign,
  skipCipherF:result.skipF,wordHits:result.hits,wordCount:original.length,
  plaintext:result.plaintext.map(w=>w.map(i=>alphabet[i]).join("")).join(" "),
});
const sources=[
  {id:"2013-original-ID3-TXXX-PARABLE-value",text:source2013},
  {id:"2016-authenticated-OutGuess-signed-body",text:source2016}
];
const results=[];
for(const {id,text} of sources){
  const direct=[],allStarts=[];
  for(const sign of [-1,1])for(const skipF of [false,true]){
    const basic=invert(original,text,sign,skipF,0);
    assert(basic);
    direct.push(render(basic));
    for(let start=0;start<=normalize(text).length-70;start++){
      const extended=invert(original,text,sign,skipF,start);
      if(extended)allStarts.push(render(extended));
    }
  }
  const sort=(a,b)=>b.wordHits-a.wordHits||a.start-b.start;
  direct.sort(sort);allStarts.sort(sort);
  results.push({id,latinCount:normalize(text).length,
    fixedStart:direct,allStartControl:{
      tested:allStarts.length,top:allStarts.slice(0,3)}});
}
// Positive: genuine GP lexicon words with *exact original 17 word lengths*,
// encrypted with the first (greedily encoded) source key stream and decoded
// from the same Latin text allowing both greedy and non-greedy tokenizations.
const native=original.map(w=>byLength.get(w.length).word);
const nativeRunes=native.flat();
const plantPad=encodeLatin(source2016);
assert(plantPad.length>=76);
const plantCipher=nativeRunes.map((p,i)=>(p+plantPad[i])%N);
let offset=0;
const plantWords=original.map(w=>{
  const fragment=plantCipher.slice(offset,offset+w.length);offset+=w.length;
  return fragment;
});
const plant=invert(plantWords,source2016,-1,false,0);
assert(plant);
assert.equal(plant.hits,17);
const nativeRecovered=plant.plaintext.flat();
assert.equal(nativeRecovered.length,76);
const report={
  original:"physical LP2 p55, exactly 17 words, 76 ciphertext runes",
  latinSourceTokenization:"all valid 29-rune decompositions in source order",
  positivePlant:{words:17,runes:76,lexiconHits:plant.hits,
    exactSymbolMatches:nativeRecovered.filter((v,i)=>v===nativeRunes[i]).length},
  originalTests:results,
  conclusion:"Neither historically fixed source yields 17 coherent printed words; even all Latin source starts fail. No unknown LP2 plaintext."
};
assert.equal(results[0].allStartControl.top[0].wordHits,5);
assert.equal(results[1].allStartControl.top[0].wordHits,7);
assert(results.every(r=>r.fixedStart.every(x=>x.wordHits<=5)));
console.log(JSON.stringify(report,null,2));
