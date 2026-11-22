"use strict";

/**
 * Original LP2 eight-column whole-word reading-order gate.
 * Premise: p50 visibly prints eight columns, while the 2,896 authentic
 * LP2 words are divisible by eight. Test only this source-motivated width.
 * Controls: unchanged original ciphertext, chapter-wise shuffled original,
 * and reversible GP-English word-order plants.
 *
 * Node 22, CommonJS, self-contained from repository resources.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname,"..");
const read = p => fs.readFileSync(path.join(root,p),"utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original = read("resources/liber-primus/lp2-transcription.txt");
const gibran = read("resources/control/gibran_prophet_58585.txt");
const chapterEnds=[729,1874,3603,5506,6527,7960,9640,12648,12956];
const chapterWordCounts=[158,255,383,437,224,326,378,669,66];
const runeSet = new Set(gp.runes);
const WIDTH=8, CLASSES=12, TOTAL=12956, NWORDS=2896;

/** @param {string} text @param {number} stop @returns {{start:number,len:number}[]} */
function printedWords(text,stop=TOTAL){
  const words=[];let total=0,len=0,start=0;
  for(const ch of text){
    if(runeSet.has(ch)){
      if(!len)start=total;
      ++total;++len;
      if(total===stop){words.push({start,len});break;}
    }else if(ch==="-"||ch==="."||ch==="&"){
      if(len)words.push({start,len});
      len=0;
    }
  }
  assert.equal(total,stop);
  return words;
}
const words=printedWords(original);
assert.equal(words.length,NWORDS);
const chapters=chapterEnds.map((end,j)=>words
  .filter(w=>w.start>=(chapterEnds[j-1]||0)&&w.start<end).map(w=>w.len));
assert.deepEqual(chapters.map(x=>x.length),chapterWordCounts);

/** @param {number[][]} groups @returns {number} */
function mi(groups){
  const a=new Float64Array(CLASSES),b=new Float64Array(CLASSES);
  const joint=new Float64Array(CLASSES*CLASSES);let total=0;
  for(const group of groups)for(let i=1;i<group.length;i++){
    const x=Math.min(CLASSES-1,group[i-1]-1),y=Math.min(CLASSES-1,group[i]-1);
    assert.ok(x>=0&&y>=0);
    a[x]++;b[y]++;joint[x*CLASSES+y]++;total++;
  }
  let val=0;
  for(let x=0;x<CLASSES;x++)for(let y=0;y<CLASSES;y++){
    const cnt=joint[x*CLASSES+y];
    if(cnt)val+=cnt/total*Math.log(cnt*total/(a[x]*b[y]));
  }
  return val;
}

/**
 * The two reversible rectangular routes, optionally reversing column
 * order or alternating row/column traversal direction ("snake").
 * @param {number[]} array @param {"column"|"row"} kind
 * @param {boolean} reverse @param {boolean} snake
 * @returns {number[]}
 */
function trans(array,kind,reverse,snake){
  const N=array.length,rows=Math.ceil(N/WIDTH),g=[];
  for(let r=0;r<rows;r++)g.push(Array(WIDTH).fill(null));
  let i=0;
  if(kind==="column"){
    for(let cc=0;cc<WIDTH;cc++){
      const c=reverse?WIDTH-1-cc:cc;
      const rs=Array.from({length:rows},(_,j)=>j).filter(r=>r*WIDTH+c<N);
      if(snake&&cc%2)rs.reverse();
      for(const r of rs)g[r][c]=array[i++];
    }
    return g.flat().filter(x=>x!==null);
  }
  for(let r=0;r<rows;r++){
    const cs=Array.from({length:WIDTH},(_,j)=>j).filter(c=>r*WIDTH+c<N);
    if(snake&&r%2)cs.reverse();
    for(const c of cs)g[r][c]=array[i++];
  }
  const result=[];
  for(let cc=0;cc<WIDTH;cc++){
    const c=reverse?WIDTH-1-cc:cc;
    for(let r=0;r<rows;r++)if(g[r][c]!==null)result.push(g[r][c]);
  }
  return result;
}
const modes=[];
for(const scope of ["global","chapter"])
  for(const kind of ["column","row"])
    for(const reverse of [false,true])
      for(const snake of [false,true])
        modes.push({scope,kind,reverse,snake});

/** @param {number[]} input @returns {number[][]} */
function split(input){
  let at=0;
  return chapterWordCounts.map(length=>{const slice=input.slice(at,at+length);at+=length;return slice;});
}
/** @param {number[][]} groups @param {{scope:string,kind:string,reverse:boolean,snake:boolean}} mode */
function transform(groups,mode){
  const source=mode.scope==="global"?[groups.flat()]:groups;
  const changed=source.map(a=>trans(a,mode.kind,mode.reverse,mode.snake));
  return mode.scope==="global"?split(changed[0]):changed;
}

/** Build exact inverse permutation to test recovery, without fitting data. */
function plant(plaintext,mode){
  const sources=mode.scope==="global"?[plaintext.flat()]:plaintext;
  const encoded=sources.map(a=>{
    const perm=trans(Array.from({length:a.length},(_,i)=>i),
      mode.kind,mode.reverse,mode.snake);
    const cipher=new Array(a.length);
    for(let i=0;i<a.length;i++)cipher[perm[i]]=a[i];
    assert.deepEqual(trans(cipher,mode.kind,mode.reverse,mode.snake),a);
    return cipher;
  });
  return mode.scope==="global"?split(encoded[0]):encoded;
}

/** @param {string} word @returns {number} */
function gpLength(word){
  const w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const tokens=gp.translit.slice().sort((a,b)=>b.length-a.length);
  let n=0;
  for(let i=0;i<w.length;){
    const k=w.startsWith("ING",i)?3:w.startsWith("IO",i)?2:
      (tokens.find(s=>w.startsWith(s,i))||"").length;
    assert.ok(k>0,"unmapped source word "+word);
    i+=k;n++;
  }
  return n;
}
const native=(gibran.match(/[A-Za-z]+/g)||[]).map(gpLength);
assert.ok(native.length>=NWORDS+8800);
let seed=0x3301c1ca;
/** @returns {number} */
function random(){
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return (seed>>>0)/4294967296;
}
/** @param {number[]} a @returns {number[]} */
function shuffle(a){
  a=a.slice();
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
const baseline=mi(chapters);
assert.ok(Math.abs(baseline-0.020310443614568477)<1e-10);
const originals=modes.map(mode=>({...mode,mi:mi(transform(chapters,mode))}))
  .sort((a,b)=>b.mi-a.mi);
const best=originals[0].mi;
const NULLS=600;
const nullMax=[];
for(let i=0;i<NULLS;i++){
  const shuffled=chapters.map(shuffle);
  nullMax.push(Math.max(...modes.map(mode=>mi(transform(shuffled,mode)))));
}
nullMax.sort((a,b)=>a-b);
const upperP=(1+nullMax.filter(x=>x>=best).length)/(NULLS+1);
assert.ok(best<nullMax[Math.floor(.95*NULLS)],"unexpected 8-column original positive");

// Two separately sourced, invertible original-length GP-native word plants.
const plants=[];
for(const start of [0,1200,3200,5800,8200]){
  const plain=split(native.slice(start,start+NWORDS));
  for(const mode of [modes[7],modes[10]]){
    const encrypted=plant(plain,mode);
    const recovered=transform(encrypted,mode);
    assert.deepEqual(recovered,plain);
    const truth=mi(plain),raw=mi(encrypted);
    plants.push({start,mode,plaintextMI:truth,encryptedMI:raw,
      recoveryMI:mi(recovered),bestRecoveredMI:Math.max(...modes
        .map(m=>mi(transform(encrypted,m))))});
    assert.ok(truth>.03,"GP-native prose word adjacency positive control weak");
  }
}
const result={
  scope:"exact 8-column original whole-word transposition family only",
  original:{runes:TOTAL,words:NWORDS,chapterWordCounts,baselineMI:baseline,
    bestModes:originals.slice(0,8),maxMI:best},
  matchedNull:{shuffles:NULLS,meanMax:nullMax.reduce((a,b)=>a+b,0)/NULLS,
    p95Max:nullMax[Math.floor(.95*NULLS)],
    p99Max:nullMax[Math.floor(.99*NULLS)],
    maximum:nullMax.at(-1),familywiseUpperP:upperP},
  nativePlants:plants,
  verdict:"No eight-column inverse restoring GP-native adjacent word-length syntax; no plaintext or key recovered."
};
console.log(JSON.stringify(result,null,2));
