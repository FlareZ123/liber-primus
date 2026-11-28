'use strict';
/**
 * Agent47: source-conditional base59 p50 full-tree whole-word transposition.
 * The 256 original p49–51 tokens make a rooted tree when the absent f is
 * removed from the original alphanumeric digit alphabet. Its BFS/DFS orders
 * are 256-entry permutations, conditionally allowing 11*256 + 112 source-accurate printed words.
 * This test is a finite original-input gate, NOT an attributed Cicada cipher.
 * Reproduce: node sims/agent47_p50_base59_tree_256word_transposition_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const load=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const corpus=JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const numeric=JSON.parse(load('resources/liber-primus/base60-grid.json'));
const transcription=load('resources/lp2-transcription.txt');
const nativeSource=load('resources/control/gibran_prophet_58585.txt');
const runeSet=new Set(corpus.runes);
// Correct source parser: the '%' page boundary MUST end a printed word.
 // Earlier raw-tape processing silently joined 32 word pairs across pages,
 // fabricating 2,896 tokens (11*256+80). The true source has 2,928.
const pageSegments=transcription.split('%').map(raw=>({
  raw,indices:[...raw].filter(x=>runeSet.has(x)).map(x=>corpus.runes.indexOf(x))
}));
const wordLengths=[];
let nRunes=0;
for(const page of corpus.pages.filter(p=>p.page<=55&&p.indices.length>0)){
  const matches=pageSegments.filter(s=>s.indices.length===page.indices.length
    &&s.indices.every((v,i)=>v===page.indices[i]));
  assert.equal(matches.length,1,'physical original page not recovered exactly: '+page.page);
  const words=matches[0].raw.replace(/\s|\//g,'').split(/[-.$&§]+/g)
    .map(s=>[...s].filter(x=>runeSet.has(x))).filter(w=>w.length>0);
  assert.deepEqual(words.flat().map(x=>corpus.runes.indexOf(x)),page.indices);
  wordLengths.push(...words.map(w=>w.length));
  nRunes+=page.indices.length;
}
assert.equal(wordLengths.length,2928);
assert.equal(nRunes,12956);
assert.equal(wordLengths.reduce((a,b)=>a+b,0),nRunes);
const digitAlphabet=numeric.alphabet.replace('f','');
assert.equal(digitAlphabet.length,59);
const tokens=numeric.rows.flat();
assert.equal(tokens.length,256);
const parents=tokens.map(token=>{
  assert.equal(token.length,2);
  const hi=digitAlphabet.indexOf(token[0]),lo=digitAlphabet.indexOf(token[1]);
  assert.ok(hi>=0&&lo>=0);
  const p=59*hi+lo;
  assert.ok(p>=0&&p<=255);
  return p;
});
const children=Array.from({length:256},()=>[]);
parents.forEach((p,i)=>{if(p!==i)children[p].push(i);});
assert.deepEqual(parents.flatMap((p,i)=>p===i?[i]:[]),[189]);
function traversal(method,descending){
  const order=[];
  const kids=i=>descending?children[i].slice().reverse():children[i];
  function visit(i){
    if(method==='pre')order.push(i);
    for(const c of kids(i))visit(c);
    if(method==='post')order.push(i);
  }
  if(method==='bfs'){
    const q=[189];
    for(let i=0;i<q.length;i++){order.push(q[i]);q.push(...kids(q[i]));}
  } else visit(189);
  assert.equal(order.length,256);
  assert.equal(new Set(order).size,256);
  return order;
}
function mapping(order,direction,tail){
  // dest[position]=source[position]; 'read' follows traversal from source.
  const dest=Array.from({length:2928},(_,i)=>i);
  for(let block=0;block<11;block++){
    const base=block*256;
    for(let i=0;i<256;i++){
      if(direction==='read')dest[base+i]=base+order[i];
      else dest[base+order[i]]=base+i;
    }
  }
  if(tail){
    const local=order.filter(x=>x<112),base=11*256;
    assert.equal(local.length,112);
    for(let i=0;i<112;i++){
      if(direction==='read')dest[base+i]=base+local[i];
      else dest[base+local[i]]=base+i;
    }
  }
  assert.equal(new Set(dest).size,2928);
  return dest;
}
const permute=(xs,dest)=>dest.map(i=>xs[i]);
function chi9(values){
  const pair=Array.from({length:81},()=>0);
  const row=new Array(9).fill(0),col=new Array(9).fill(0),n=values.length-1;
  for(let i=1;i<values.length;i++){
    const a=Math.min(values[i-1],9)-1,b=Math.min(values[i],9)-1;
    pair[a*9+b]++;row[a]++;col[b]++;
  }
  let chi=0;
  for(let i=0;i<9;i++)for(let j=0;j<9;j++){
    const ex=row[i]*col[j]/n;
    if(ex>0)chi+=(pair[i*9+j]-ex)**2/ex;
  }
  return chi;
}
const modes=[];
for(const method of ['bfs','pre','post'])
for(const descending of [false,true]){
  const order=traversal(method,descending);
  for(const direction of ['read','inverse'])
  for(const tail of [false,true]){
    const dest=mapping(order,direction,tail);
    modes.push({method,descending,direction,tail,dest});
  }
}
assert.equal(modes.length,24);
const observed=modes.map(m=>({
  key:[m.method,m.descending?'desc':'asc',m.direction,m.tail?'tail112':'tail-id'].join('/'),
  chi:chi9(permute(wordLengths,m.dest))
})).sort((a,b)=>b.chi-a.chi);
const originalChi=chi9(wordLengths);
assert.ok(Math.abs(originalChi-68.81832162540141)<1e-10);
assert.equal(observed[0].key,'post/desc/inverse/tail112');
assert.ok(Math.abs(observed[0].chi-89.57563275686461)<1e-9);
// Familywise conditional null: exact original 2928-element length inventory,
// 800 independently seeded full Fisher-Yates permutations, same 24 test keys.
let randomState=0x31C1DADA>>>0;
function random32(){
  randomState^=randomState<<13;
  randomState^=randomState>>>17;
  randomState^=randomState<<5;
  return randomState>>>0;
}
const B=800;
let nullGreaterEqual=0;
const nullFirstEight=[];
for(let trial=0;trial<B;trial++){
  const shuffled=wordLengths.slice();
  for(let i=shuffled.length-1;i>0;i--){
    const j=random32()%(i+1);
    [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
  }
  let best=-Infinity;
  for(const mode of modes){
    const value=chi9(permute(shuffled,mode.dest));
    if(value>best)best=value;
  }
  if(best>=observed[0].chi)nullGreaterEqual++;
  if(trial<8)nullFirstEight.push(best);
}
assert.equal(nullGreaterEqual,164);
// Positive receiver: prose grammar is destroyed by the actual source-derived
// traversal and restored EXACTLY by the inverse. No source cipher labels fitted.
const DIGRAPHS=['ING','TH','EO','NG','OE','AE','IA','EA'];
function gpWordLength(s){
  s=s.toUpperCase();
  let count=0;
  for(let i=0;i<s.length;){
    const dg=DIGRAPHS.find(x=>s.startsWith(x,i));
    i+=dg?dg.length:1;
    count++;
  }
  return count;
}
const nativeWords=(nativeSource.match(/[A-Za-z]+/g)||[])
  .slice(0,2928).map(gpWordLength);
assert.equal(nativeWords.length,2928);
const best=modes.find(m=>[m.method,m.descending?'desc':'asc',m.direction,m.tail?'tail80':'tail-id'].join('/')===observed[0].key);
const opposite=modes.find(m=>m.method===best.method&&m.descending===best.descending
  &&m.direction!==(best.direction)&&m.tail===best.tail);
assert.ok(best&&opposite);
const scrambled=permute(nativeWords,best.dest);
const restored=permute(scrambled,opposite.dest);
assert.deepEqual(restored,nativeWords);
const nativeResult={unchangedChi:chi9(nativeWords),
  sourceScrambledChi:chi9(scrambled),inverseRecoveredExactly:true};
assert.ok(nativeResult.unchangedChi>observed[0].chi);
assert.ok(nativeResult.sourceScrambledChi<nativeResult.unchangedChi);
const result={
  classification:'source-motivated but conditional whole-word transposition; no plaintext/key',
  source:{unknownRunes:nRunes,printedWords:wordLengths.length,
    fullBlocks:11,blockWidth:256,remainingWords:112,
    tableShape:'32x8 256 signed-value tokens',base59Root:189,
    treeOrderFamilies:'BFS, preorder, postorder, each ascending or descending children',
    directionFamilies:['read','inverse'],tailHandling:['unchanged','first112 subtree order']},
  original:{unchangedChi:originalChi,modes:modes.length,
    best:observed.slice(0,12)},
  shuffleNull:{seed:'0x31C1DADA',draws:B,exceedances:nullGreaterEqual,
    familywiseTail:(nullGreaterEqual+1)/(B+1),firstEightMaxima:nullFirstEight},
  heldNative:nativeResult,
  decision:'Retire exact base59 rooted-tree BFS/DFS 256-word block transpositions. Earlier 2896/80-tail fit was an artefact of accidentally joining 32 whole words across physical page boundaries; correct 2928/112-tail source test yields best chi-square 89.576 versus original 68.818, but 164/800 matched shuffles exceed best-of-24 (p=0.206). Native controls recover exact source grammar. No independent instruction selects 112-word tail.'
};
console.log(JSON.stringify(result,null,2));
if(process.env.RUNNER_TEMP)fs.writeFileSync(
  path.join(process.env.RUNNER_TEMP,'source-test-output.json'),
  JSON.stringify(result,null,2));
