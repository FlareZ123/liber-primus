"use strict";
/** Exact integer GP-prime word-sum capacity, original LP2 p33.
 * Run: node sims/lp2_p33_square_exact_word_sum_capacity_sft.cjs
 */
const assert=require("node:assert/strict"), fs=require("node:fs"), path=require("node:path");
const read=p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const matrices=read("resources/cicada2014-openpuff-magic-squares.txt").trim().split(/\r?\n\s*\r?\n/).map(s=>s.trim().split(/\s+/).map(Number));
const sq=matrices[1], prime=gp.prime;
assert.equal(sq.length,49); assert.equal(Math.max(...prime),109);
for(let i=0;i<7;i++){
  assert.equal(sq.slice(i*7,i*7+7).reduce((a,b)=>a+b,0),1033);
  assert.equal(Array.from({length:7},(_,j)=>sq[j*7+i]).reduce((a,b)=>a+b,0),1033);
}
const page=read("resources/liber-primus/lp2-transcription.txt").replace(/\r/g,"").split("\n%\n");
const groups=page[33].replace(/[\s/]/g,"").split("&").map(s=>s.slice(s.indexOf(".")+1).split(/[-.]/).filter(Boolean));
assert.deepEqual(groups.map(g=>g.length),[21,28]);
const words=groups.flat();
assert.equal(words[48],"ᛒ"); assert.ok(page[34].replace(/[\s/]/g,"").startsWith("ᛗᛒ-"));
words[48]+="ᛗᛒ";
const lengths=words.map(w=>[...w].length);
assert.equal(lengths.reduce((a,b)=>a+b,0),198);
assert.equal(words[24],"ᛉᛒᚻ"); assert.equal(sq[24],331);
const runePrime=new Map(gp.runes.map((r,i)=>[r,prime[i]]));
const sumWord=w=>[...w].reduce((a,r)=>a+runePrime.get(r),0);
// Positive control: original LP1 Wisdom grid, historical third matrix.
const printed=read("resources/external/2013-0-wisdom.txt").split(/\r?\n/);
const marker=printed.findIndex(s=>s.includes("ᚳᚾᚩᚹ•ᚦᛁᛋ")); assert.ok(marker>=0);
const cells=printed.slice(marker+1).filter(s=>s.trim()).slice(0,5).flatMap(s=>s.trim().split(/\s{2,}/).map(t=>t.replace(/[⁘⁜]/gu,"").trim()));
assert.equal(cells.filter(s=>!/^\d+$/.test(s)).length,13);
assert.deepEqual(cells.map(s=>/^\d+$/.test(s)?Number(s):sumWord(s)),matrices[2]);
const dp=[new Set([0])];
for(let n=1;n<=Math.max(...lengths,...cells.map(s=>[...s].length));n++) {
  dp.push(new Set([...dp[n-1]].flatMap(v=>prime.map(p=>v+p))));
}
const direct=(v,n)=>dp[n]?.has(v)??false;
assert.ok(cells.filter(s=>!/^\d+$/.test(s)).every(s=>direct(sumWord(s),[...s].length)));
const d4=[];
for(let t=0;t<8;t++){
  const bad=[];
  for(let i=0;i<49;i++){
    const r=Math.floor(i/7),c=i%7;
    let [a,b]=(t&4)?[c,r]:[r,c];
    if(t&1) a=6-a;
    if(t&2) b=6-b;
    const v=sq[a*7+b];
    if(!direct(v,lengths[i])) bad.push(i+1);
  }
  d4.push(bad);
}
assert.ok(d4.every(b=>b.includes(25)));
assert.deepEqual(d4.map(b=>b.length).sort((a,b)=>a-b),[14,14,17,17,17,17,18,18]);
/** Maximum matching of value cells to length slots, allowing repeated words. */
function maxMatch(values,lens,allowed){
  const owner=Array(lens.length).fill(-1);
  function augment(i,seen){
    for(let j=0;j<lens.length;j++){
      if(seen.has(j)||!allowed(values[i],lens[j])) continue;
      seen.add(j);
      if(owner[j]===-1||augment(owner[j],seen)){owner[j]=i;return true;}
    }
    return false;
  }
  return values.reduce((n,_,i)=>n+Number(augment(i,new Set())),0);
}
const arbitrary=maxMatch(sq,lengths,direct);assert.equal(arbitrary,49);
const paths=["resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/liber-primus/lp1-plaintext-reference.txt","resources/control/blake_song_of_liberty_train.txt"];
// Source-native convention from lp2_native_gp_source_orthography_sft.cjs.
const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function encode(w){
  w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const out=[];
  for(let i=0;i<w.length;){
    if(w.startsWith("ING",i)){out.push(21);i+=3;}
    else if(w.startsWith("IO",i)){out.push(27);i+=2;}
    else {const t=tokens.find(t=>w.startsWith(t.s,i));assert.ok(t);out.push(t.i);i+=t.s.length;}
  }
  return out;
}
const vocab=new Set(paths.flatMap(p=>read(p).toUpperCase().match(/[A-Z]+/g)||[]));
const pairs=new Set(), sum7=[];
for(const w of vocab){
  const a=encode(w), v=a.reduce((s,i)=>s+prime[i],0);
  pairs.add(a.length+":"+v);
  if(v===7)sum7.push(w);
}
const lexical=maxMatch(sq,lengths,(v,n)=>pairs.has(n+":"+v));
console.log(JSON.stringify({lengths,d4Failures:d4.map(a=>a.length),d4BadSlots:d4,arbitrary,vocab:vocab.size,signatures:pairs.size,sum7,lexical},null,2));
assert.equal(vocab.size,32256);assert.equal(pairs.size,3784);assert.deepEqual(sum7,["O"]);assert.equal(lexical,46);
