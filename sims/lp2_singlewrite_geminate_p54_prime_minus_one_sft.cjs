"use strict";
// Standalone Node 22 reproduction; no dependencies.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = p => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const lp2 = read("resources/liber-primus/lp2-transcription.txt").split("%");
const lp1 = read("resources/transcriptions/lp1_wulfic_canonical.txt").split("%");
const donorText = [
  read("resources/control/gibran_prophet_58585.txt"),
  read("resources/control/shakespeare_first300k.txt"),
  read("resources/control/emerson_essays_2944.txt")
];
const wordfreq = read("resources/control/english_wordfreq_textblob.txt");
const T = corpus.translit, runeIndex = new Map(corpus.runes.map((r,i)=>[r,i]));
const V = new Set(["U","O","I","EO","E","OE","A","AE","Y","IA","EA"]);
const consonant = T.map(x=>!V.has(x)), Q=29, mod=x=>(x%Q+Q)%Q;
const toks = T.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
const key = a=>a.map(x=>String.fromCharCode(65+x)).join("");
const fromKey = s=>Array.from(s,c=>c.charCodeAt(0)-65);
const spell = a=>a.map(x=>T[x]).join(" ");
function gpWord(s,alt=true){
  s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const out=[];
  for(let j=0;j<s.length;){
    const t=alt&&s.startsWith("ING",j)?{t:"ING",i:21}:alt&&s.startsWith("IO",j)?{t:"IO",i:27}:toks.find(x=>s.startsWith(x.t,j));
    if(!t)throw Error("Unencodable word "+s);
    out.push(t.i);j+=t.t.length;
  }
  return out;
}
function norm(w){const o=[];for(let i=0;i<w.length;i++)if(!(i&&w[i]===w[i-1]&&consonant[w[i]]))o.push(w[i]);return o;}
function body(s){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(s),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(s);return s.slice(a?a.index+a[0].length:0,b?b.index:s.length);}
function donorWords(s){return (body(s).toUpperCase().match(/[A-Z]+/g)||[]).map(source=>({source,gp:gpWord(source)}));}
function runicWords(s,close=true){
  const words=[];let w=[];
  const finish=()=>{if(w.length)words.push(w);w=[];};
  for(const ch of s){const ix=runeIndex.get(ch);if(ix!==undefined)w.push(ix);else if(ch==="/"||ch==="%"||/\s/u.test(ch)){}else finish();}
  if(close)finish();return {words,partial:w};
}
function removeFirstRunes(s,n){let seen=0,out="";for(const ch of s){if(runeIndex.has(ch)&&seen<n){seen++;continue;}out+=ch;}assert.equal(seen,n);return out;}
function measure(words){
  let runes=0,pairs=0,repeats=0,cons=0,vowels=0,removed=0,affected=0;
  const before=new Set(),after=new Set(),byRune=Array(Q).fill(0);
  for(const w of words){
    runes+=w.length;let hit=false;w.forEach(x=>before.add(x));const nw=norm(w);nw.forEach(x=>after.add(x));
    assert.equal(new Set(w).size,new Set(nw).size);
    for(let i=1;i<w.length;i++)if(w[i]===w[i-1]){pairs++;repeats++;if(consonant[w[i]]){cons++;removed++;byRune[w[i]]++;hit=true;}else vowels++;}
    if(hit)affected++;
  }
  assert.deepEqual([...before].sort((a,b)=>a-b),[...after].sort((a,b)=>a-b));
  return {words:words.length,runes,wordInternalPairs:words.reduce((n,w)=>n+Math.max(0,w.length-1),0),
    repeatedPairs:repeats,consonantDoublets:cons,vowelDoublets:vowels,removedRunes:removed,
    wordsAffected:affected,wordsAffectedPct:100*affected/words.length,lengthReductionPct:100*removed/runes,
    symbolSupportBefore:before.size,symbolSupportAfter:after.size,perWordSupportInvariant:true,
    removedByRune:byRune.map((n,i)=>n?{rune:T[i],count:n}:null).filter(Boolean)};
}
const donors=donorText.map(donorWords);
const training=new Set(),external=new Set(),rawEnglish=new Map();
for(const donor of donors)for(const x of donor.slice(0,Math.floor(donor.length*.8)))if(x.gp.length<=24)training.add(key(x.gp));
for(const section of solved.sections)if(!["0_welcome","jpg107-167"].includes(section.name))
  for(const w of (section.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(s=>Array.from(s,ch=>runeIndex.get(ch))).filter(w=>w.length&&w.length<=24&&w.every(Number.isInteger)))training.add(key(w));
for(const line of wordfreq.split(/\r?\n/)){
  const m=line.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;
  const spelling=m[1].toLowerCase();
  for(const k of new Set([key(gpWord(spelling,true)),key(gpWord(spelling,false))])){
    if(k.length>24)continue;external.add(k);if(!rawEnglish.has(k))rawEnglish.set(k,new Set());rawEnglish.get(k).add(spelling);
  }
}
const rawLex=new Set([...training,...external,...Array.from({length:Q},(_,i)=>key([i]))]);
const normLex=new Set([...rawLex].map(k=>key(norm(fromKey(k)))));
const n2r=new Map(),n2e=new Map();
for(const k of rawLex){const nk=key(norm(fromKey(k)));if(!n2r.has(nk))n2r.set(nk,new Set());n2r.get(nk).add(k);if(rawEnglish.has(k)){if(!n2e.has(nk))n2e.set(nk,new Set());for(const s of rawEnglish.get(k))n2e.get(nk).add(s);}}
const groups=[...n2r.entries()].filter(([,r])=>r.size>1);
const lexical={
 trainingTypes:training.size,externalTypes:external.size,rawForms:rawLex.size,normalizedForms:normLex.size,
 normalizedFormsWithMultipleRawGPSpellings:groups.length,
 rawGPFormsInCollisionGroups:groups.reduce((n,x)=>n+x[1].size,0),
 rawGPFormsWithMultipleEnglishSpellings:[...rawEnglish.values()].filter(s=>s.size>1).length,
 normalizedFormsWithMultipleEnglishSpellings:[...n2e.values()].filter(s=>s.size>1).length,
 geminateGroupsWithMultipleEnglishSpellings:groups.filter(([k,r])=>new Set([...r].flatMap(x=>[...(rawEnglish.get(x)||[])])).size>1).length,
 examples:groups.map(([k,r])=>({normalized:spell(fromKey(k)),raw:[...r].map(x=>spell(fromKey(x))),english:[...new Set([...r].flatMap(x=>[...(rawEnglish.get(x)||[])]))].sort()})).filter(x=>x.english.length>1).slice(0,25)
};
assert.deepEqual([lexical.trainingTypes,lexical.externalTypes,lexical.rawForms,lexical.normalizedForms],[10842,33369,35944,35654]);
assert.deepEqual([lexical.normalizedFormsWithMultipleRawGPSpellings,lexical.rawGPFormsInCollisionGroups,lexical.rawGPFormsWithMultipleEnglishSpellings,lexical.normalizedFormsWithMultipleEnglishSpellings,lexical.geminateGroupsWithMultipleEnglishSpellings],[279,569,107,354,247]);

const lp1Words=[3,8,9,10,11,14].flatMap(i=>runicWords(lp1[i]).words);
const p57Words=runicWords(lp2[56]).words;
const lp1Stats=measure(lp1Words),p57Stats=measure(p57Words);
assert.deepEqual([lp1Stats.words,lp1Stats.runes,lp1Stats.repeatedPairs,lp1Stats.consonantDoublets,lp1Stats.vowelDoublets],[231,1001,19,16,3]);
assert.deepEqual([p57Stats.words,p57Stats.runes,p57Stats.repeatedPairs,p57Stats.consonantDoublets],[20,95,1,1]);
assert(p57Words.some(w=>spell(w)==="U N N E L NG"));

const donorStats=donors.map((d,i)=>measure(d.slice(Math.floor(d.length*.8))));
assert.deepEqual(donorStats.map(x=>[x.words,x.runes,x.consonantDoublets]),[[2515,9496,144],[11082,43571,794],[14974,61788,1040]]);

function primes(n){const out=[];for(let x=2;out.length<n;x++){let ok=true;for(let d=2;d*d<=x;d++)if(x%d===0){ok=false;break;}if(ok)out.push(x);}return out;}
const P=primes(1000),shift=k=>mod(P[k]-1);
function encode(words){let k=0;return words.map(w=>w.map(x=>x===0?0:mod(x+shift(k++))));}
function options(c,start){
  const out=[];function walk(i,k,p){if(i===c.length){out.push({end:k,plain:p});return;}const x=c[i],s=shift(k);
    if(x===0){walk(i+1,k,p.concat(0));const q=mod(x-s);if(q!==0)walk(i+1,k+1,p.concat(q));}
    else{const q=mod(x-s);if(q!==0)walk(i+1,k+1,p.concat(q));}}
  walk(0,start,[]);return out;
}
function paths(states){return [...states.values()].reduce((n,x)=>n+x.count,0n).toString();}
function add(dst,k,oov,count,sample){const id=k+"|"+oov,old=dst.get(id);if(old)old.count+=count;else dst.set(id,{cursor:k,oov,count,sample});}
function decode(words,lex,maxOov=0){
  let states=new Map([["0|0",{cursor:0,oov:0,count:1n,sample:[]}]]);const history=[];
  for(let i=0;i<words.length;i++){const next=new Map();let tried=0,known=0,unknown=0;
    for(const s of states.values())for(const o of options(words[i],s.cursor)){tried++;const k=key(o.plain);
      if(lex.has(k)){known++;add(next,o.end,s.oov,s.count,s.sample.concat([k]));}
      else if(s.oov<maxOov){unknown++;add(next,o.end,s.oov+1,s.count,s.sample.concat([k]));}}
    history.push({wordIndex:i,optionsTried:tried,knownMatches:known,oovBranches:unknown,statesOut:next.size,pathCount:paths(next)});
    states=next;if(!states.size)return {failedAt:i,states,history,pathCount:"0"};
  }
  return {failedAt:null,states,history,pathCount:paths(states)};
}
function plant(words,collapse){
  const plain=collapse?words.map(norm):words.map(w=>w.slice()),cipher=encode(plain),r=decode(cipher,normLex,0);
  const gem=words.flatMap((w,i)=>w.some((x,j)=>j&&x===w[j-1]&&consonant[x])?[i]:[]);
  const coverage=plain.filter(w=>normLex.has(key(w))).length;
  const sample=r.states.size?[...r.states.values()][0].sample:[];
  if(collapse){assert.equal(r.pathCount,"1");assert.deepEqual(sample,plain.map(key));}
  else if(gem.length){assert.equal(r.failedAt,gem[0]);assert.equal(r.pathCount,"0");}
  return {words:words.length,runes:words.reduce((n,w)=>n+w.length,0),geminateWords:gem.length,
    firstGeminateWordIndex:gem.length?gem[0]:null,firstGeminateWord:gem.length?spell(words[gem[0]]):null,
    normalizedDictionaryCoverage:coverage+"/"+words.length,failedAt:r.failedAt,pathCount:r.pathCount};
}
function chooseWindow(held){
  for(let start=0;start<held.length-40;start++){let runes=0,gem=0,selected=[];
    for(let end=start;end<held.length;end++){const x=held[end];selected.push(x);runes+=x.gp.length;
      if(x.gp.some((v,i)=>i&&v===x.gp[i-1]&&consonant[v]))gem++;
      if(runes>=285&&runes<=315&&gem>=2&&selected.every(y=>normLex.has(key(norm(y.gp)))))return {start,endExclusive:end+1,selected};
      if(runes>315)break;}}
  return null;
}

// p54 black body: image-verified nine-rune red title removed; p55 first rune
// is joined to p54's open final word before any word-level scoring.
assert.equal(corpus.pages.find(p=>p.page===54).indices.length,232);
assert.equal(corpus.pages.find(p=>p.page===55).indices.length,76);
assert.deepEqual(ink.pages.find(p=>p.page===54).red_spans.map(x=>({start:x.start,length:x.length})),[{start:0,length:9}]);
const p54=runicWords(removeFirstRunes(lp2[53],9),false),p55=runicWords(lp2[54],true);
const target=p54.words.concat([p54.partial.concat(p55.words[0])],p55.words.slice(1));
const targetInfo={p54BlackRunes:223,p55Runes:76,totalRunes:target.reduce((n,w)=>n+w.length,0),totalWords:target.length,
  p54CompleteWords:p54.words.length,p54OpenSeamWordRunes:p54.partial.length,p55CarriedFirstRune:p55.words[0].length,
  p55RemainingWords:p55.words.length-1,ciphertextFCount:target.flat().filter(x=>x===0).length};
assert.deepEqual(targetInfo,{p54BlackRunes:223,p55Runes:76,totalRunes:299,totalWords:64,p54CompleteWords:47,p54OpenSeamWordRunes:10,p55CarriedFirstRune:1,p55RemainingWords:16,ciphertextFCount:6});
let cursor=0;const firstFour=[];
for(let i=0;i<4;i++){const os=options(p54.words[i],cursor);assert.equal(os.length,1);const o=os[0];
  firstFour.push({index:i,startCursor:cursor,endCursor:o.end,cipher:spell(p54.words[i]),plain:spell(o.plain),
    inRaw:rawLex.has(key(o.plain)),inNormalized:normLex.has(key(o.plain))});cursor=o.end;}
assert.deepEqual(firstFour.map(x=>x.plain),["Y NG N S L A H U","D AE L","X L X M NG H","H Y"]);
const rawZero=decode(p54.words,rawLex,0),normZero=decode(p54.words,normLex,0);
const normOne=decode(p54.words,normLex,1),normThree=decode(p54.words,normLex,3);
assert.equal(rawZero.failedAt,0);assert.equal(normZero.failedAt,0);
assert.equal(normOne.failedAt,1);assert.equal(normThree.failedAt,3);

// Authentic p56 positive control: fixed plaintext forward-replays all 85 runes,
// then the normalized word-preserving inverse recovers one unique path.
const p56Plain="AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE".split(" ").map(w=>gpWord(w,false));
const p56CipherWords=runicWords(lp2[55]).words,p56Cipher=encode(p56Plain).flat();
assert.deepEqual(p56Cipher,corpus.pages.find(p=>p.page===56).indices);
const p56Recovered=decode(p56CipherWords,normLex,0);
assert.equal(p56Recovered.failedAt,null);assert.equal(p56Recovered.pathCount,"1");
assert.deepEqual([...p56Recovered.states.values()][0].sample,p56Plain.map(key));

// Clear p57 and three fresh held-out literary windows: collapsed plants recover
// uniquely; matched uncollapsed negatives fail at the first consonant geminate.
const p57Collapsed=plant(p57Words,true),p57Uncollapsed=plant(p57Words,false);
assert.equal(p57Collapsed.pathCount,"1");assert.equal(p57Uncollapsed.failedAt,4);
const fresh=donors.map((d,i)=>{
  const held=d.slice(Math.floor(d.length*.8)),w=chooseWindow(held);assert(w);
  const source=w.selected.map(x=>x.gp),pos=plant(source,true),neg=plant(source,false);
  assert.equal(pos.pathCount,"1");assert.equal(neg.pathCount,"0");assert.equal(neg.failedAt,neg.firstGeminateWordIndex);
  return {donor:["Gibran","Shakespeare","Emerson"][i],heldoutStart:w.start,heldoutEndExclusive:w.endExclusive,collapsed:pos,uncollapsed:neg};
});
assert.deepEqual(fresh.map(x=>[x.collapsed.runes,x.collapsed.words,x.collapsed.geminateWords,x.uncollapsed.failedAt]),
  [[286,78,4,10],[285,70,4,2],[291,82,5,26]]);

console.log(JSON.stringify({
  classification:{vowels:[...V],consonants:T.filter((x,i)=>consonant[i]),rule:"collapse adjacent identical consonantal GP glyphs within each true word; retain vowel doubles and all boundaries"},
  lexicon:lexical,
  firstParty:{lp1ClearPages:{physicalPages:[3,8,9,10,11,14],...lp1Stats},lp2ClearP57:p57Stats},
  untouchedLiteraryHeldout:donorStats,
  originalTarget:{...targetInfo,firstFour,rawNoOov:{failedAt:rawZero.failedAt,pathCount:rawZero.pathCount},
    normalizedOov0:{failedAt:normZero.failedAt,pathCount:normZero.pathCount},
    normalizedOov1:{failedAt:normOne.failedAt,pathCount:normOne.pathCount},
    normalizedOov3:{failedAt:normThree.failedAt,pathCount:normThree.pathCount},
    p55Prediction:"not run: no p54 candidate path"},
  authenticP56:{cipherRunes:85,forwardReplay:true,plaintextWords:p56Plain.length,uniquePaths:p56Recovered.pathCount},
  p57Plants:{collapsed:p57Collapsed,uncollapsed:p57Uncollapsed},
  freshHeldoutPlants:fresh
},null,2));
