"use strict";

/**
 * Original LP2 consecutive-word-pair, segmentation-independent all-secret
 * GP29 occupancy theorem. Windows 11 Node22 standalone read-only SFT.
 *
 * Keep every source pair's total rune length and original rune sequence,
 * allowing the internal word boundary to shift to ANY positive split.
 * For each fixed (sum, offset[, source p50 class]) grant an arbitrary
 * independent secret permutation of all 29 GP symbols. Exact sharp
 * top-k capacity bounds hold for every such key, with no key search.
 *
 * The signed 2016 "words"/"numbers" and physical 32x8 p50 grid motivate
 * the operands, but do NOT authenticate an LP2 opcode or word-pair clock.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(root,p),"utf8").replace(/\r\n/g,"\n");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const printed=grid.rows.flat(),bytes=grid.byte_rows.flat();
assert.equal(printed.length,256);
assert.equal(bytes.length,256);
assert.equal(printed.filter(x=>x.startsWith("0")).length,60);
const glyphs=new Map(corpus.runes.map((s,i)=>[s,i]));
const parts=read("resources/liber-primus/lp2-transcription.txt").split("%");
assert.equal(parts.length,57);

/**
 * Source original full typed word inventory, joining page-carry words and
 * ignoring literal numeral heading dashes (1-,2-,3-,4-,5-,7-).
 */
function parse() {
  const rune=[],lengths=[],marks=[];
  let count=0;
  for(let p=0;p<=55;p++){
    if(p===50)continue;
    const section=parts[p<50?p:p-1].replace(/[1-7]-/g,"");
    for(const ch of section){
      if(glyphs.has(ch)){
        rune.push(glyphs.get(ch));
        count++;
      }else if((ch==="-"||ch===".")&&count){
        lengths.push(count);
        marks.push(ch);
        count=0;
      }
    }
  }
  assert.equal(count,0);
  assert.deepEqual(rune,corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices));
  assert.equal(rune.length,12956);
  assert.equal(lengths.length,2896);
  assert.equal(marks.length,2896);
  assert.equal(lengths.reduce((s,n)=>s+n,0),12956);
  return {rune,lengths,marks};
}
const source=parse();

/**
 * The original printed two-word sum and rune's absolute position within
 * the *combined* pair are invariant under arbitrary internal resegmentation.
 * The source p50 class depends on the original global pair ordinal only.
 * @param {"base"|"firstZero"|"byteParity"} variant
 */
function stateLabels(variant){
  const states=[];
  for(let k=0;k<source.lengths.length;k+=2){
    const S=source.lengths[k]+source.lengths[k+1];
    const byte=bytes[(k/2)%256],zero=Number(printed[(k/2)%256].startsWith("0"));
    const classTag=variant==="base"?"":variant==="firstZero"?":"+zero:":"+(byte&1);
    for(let j=0;j<S;j++)states.push(S+":"+j+classTag);
  }
  assert.equal(states.length,12956);
  return states;
}
/**
 * Sharp all-key maximum total count in any set of k plaintext runes.
 * Each independent secret GP29 bijection can map at most its k most
 * common observed ciphertext symbols into that chosen target set.
 * @param {number[]} ciphertext
 * @param {string[]} states
 * @param {number} k
 */
function occupancy(ciphertext,states,k){
  assert.equal(ciphertext.length,states.length);
  const counts=new Map();
  for(let i=0;i<ciphertext.length;i++){
    const state=states[i];
    if(!counts.has(state))counts.set(state,new Uint16Array(29));
    counts.get(state)[ciphertext[i]]++;
  }
  let upper=0;
  for(const h of counts.values())upper+=Array.from(h).sort((a,b)=>b-a)
    .slice(0,k).reduce((a,b)=>a+b,0);
  return {states:counts.size,upper};
}
/** @param {number[]} sequence @param {number} k */
function topK(sequence,k){
  const f=new Uint16Array(29);
  for(const c of sequence)f[c]++;
  return Array.from(f).sort((a,b)=>b-a).slice(0,k).reduce((a,b)=>a+b,0);
}
const families=["base","firstZero","byteParity"];
const labels=Object.fromEntries(families.map(x=>[x,stateLabels(x)]));
const bounds=Object.fromEntries(families.map(x=>[x,{
  U1:occupancy(source.rune,labels[x],1),
  U4:occupancy(source.rune,labels[x],4)
}]));
assert.deepEqual(families.map(x=>[bounds[x].U1.states,bounds[x].U1.upper,bounds[x].U4.upper]),[
  [274,1112,3570],
  [461,1364,4234],
  [461,1400,4350]
]);
/**
 * Exact source-native GP29 lexical projection from historical solved GP:
 * ING=>NG(21), IO=>IA(27), QU=>CW, V=>U, K/Q=>C, Z=>S.
 * @param {string} raw
 */
function nativeGP(raw){
  const token=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  const out=[];
  for(const word of raw.match(/[A-Za-z]+/g)||[]){
    const text=word.toUpperCase().replace(/QU/g,"CW")
      .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
    for(let i=0;i<text.length;){
      if(text.startsWith("ING",i)){out.push(21);i+=3;continue;}
      if(text.startsWith("IO",i)){out.push(27);i+=2;continue;}
      const t=token.find(x=>text.startsWith(x.s,i));
      assert(t,"unknown source GP grapheme "+word+" at "+i);
      out.push(t.i);i+=t.s.length;
    }
  }
  return out;
}
const donors=[
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
];
const reference=[];
let planted;
for(const [name,file] of donors){
  const stream=nativeGP(read(file)),samples=[];
  for(let start=0;start+12956<=stream.length;start+=12956){
    const sample=stream.slice(start,start+12956);
    if(!planted)planted=sample;
    samples.push({top1:topK(sample,1),top4:topK(sample,4)});
  }
  reference.push({name,runicLength:stream.length,windows:samples.length,
    minTop1:Math.min(...samples.map(x=>x.top1)),
    minTop4:Math.min(...samples.map(x=>x.top4))});
}
assert.deepEqual(reference.map(x=>[x.windows,x.minTop1,x.minTop4]),[
  [4,1474,4372],[16,1465,4331],[24,1510,4461]
]);
assert(reference.every(x=>x.minTop1>bounds.firstZero.U1.upper
  && x.minTop4>bounds.firstZero.U4.upper));
assert(reference.every(x=>x.minTop1>bounds.byteParity.U1.upper));
/** @param {string} s @returns {number} */
function hash(s){
  let h=2166136261>>>0;
  for(const c of s){h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;}
  return h;
}
/** @param {number} x @returns {number} */
function inv(x){
  for(let y=1;y<=28;y++)if((x*y)%29===1)return y;
  throw Error("not unit");
}
/**
 * Exact GP29 source-state bijection, one secret affine permutation per
 * state, unknown to the capacity test (which grants all 29! bijections).
 * @param {number[]} p
 * @param {string[]} states
 * @param {boolean} reverse
 */
function mapSecret(p,states,reverse=false){
  return p.map((x,i)=>{
    const h=hash(states[i]),a=1+(h%28),b=(h>>>6)%29;
    return reverse?(((x-b+29)*inv(a))%29):((a*x+b)%29);
  });
}
const nativePositive=planted;
const originalNativeTop4=topK(nativePositive,4);
const plantCipher=mapSecret(nativePositive,labels.firstZero,false);
assert.deepEqual(mapSecret(plantCipher,labels.firstZero,true),nativePositive);
assert(topK(nativePositive,1)<=occupancy(plantCipher,labels.firstZero,1).upper);
assert(originalNativeTop4<=occupancy(plantCipher,labels.firstZero,4).upper);
// The actual solved p57 text is an additional genuine plaintext positive.
const p57=corpus.pages.find(p=>p.page===57).indices;
assert.equal(p57.length,95);
assert.deepEqual(mapSecret(mapSecret(p57,labels.firstZero.slice(0,95)),labels.firstZero.slice(0,95),true),p57);
// The same bound applies to ALL internal pair boundary shifts, without
// relying on an explicit shift-key or recomputing state from decoded words.
const shifted=source.lengths.slice();
for(let i=0;i<shifted.length;i+=2){
  const sum=source.lengths[i]+source.lengths[i+1];
  shifted[i]=1+((source.lengths[i]-1+bytes[(i/2)%256])%(sum-1));
  shifted[i+1]=sum-shifted[i];
}
assert.equal(shifted.reduce((a,b)=>a+b,0),12956);
assert(shifted.every(x=>x>0));
const unchangedStates=[];
for(let i=0;i<shifted.length;i+=2){
  const sum=shifted[i]+shifted[i+1];
  const z=Number(printed[(i/2)%256].startsWith("0"));
  for(let j=0;j<sum;j++)unchangedStates.push(sum+":"+j+":"+z);
}
assert.deepEqual(unchangedStates,labels.firstZero);
console.log(JSON.stringify({
  original:{runes:source.rune.length,words:source.lengths.length,
    pairs:source.lengths.length/2,p50Cells:bytes.length,printedZeroCells:60},
  allSecretBounds:bounds,
  independentNativeOriginalLengthWindows:reference,
  typedPlantedNative: {GP29Length:nativePositive.length,top4:originalNativeTop4,
    encodedTop4Bound:occupancy(plantCipher,labels.firstZero,4).upper,
    exactRecovered:true,authenticP57RunesRecovered:p57.length},
  verdict:"Key-independent exclusion for globally shared pair-sum/offset "+
    "state substitutions with or without original p50 zero-bit, "+
    "for tested native-GP plaintext; source-visible pair clock is hypothetical."
},null,2));
