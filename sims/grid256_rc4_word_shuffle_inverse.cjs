'use strict';
/**
 * Original p49-51 256-byte table as a historical-style 256-byte RC4 KSA key
 * for an entire-printed-word Fisher-Yates permutation. Tests exact original
 * sequence, source-key-orientation variants, and independently planted GP
 * Shakespeare length sequences. This tests a specific keyed reorder rather
 * than arbitrary letter-level one-time pads.
 *
 * Source direction variants: table row-major/col-major, each forward/reverse.
 * Separate whole-book / eight-text-section key clocks, with both encryption
 * permutation conventions. 4 * 2 * 2 = 16 mode inverses, 40 wrong-key refits.
 *
 * Node 22 CommonJS. Run: node sims/grid256_rc4_word_shuffle_inverse.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {parseSharedCorpus}=require('./lp2_word_pages.cjs');
const {encode}=require('./dual_marker_wordrole_gate.cjs');

const ROOT=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(ROOT,name),'utf8');
const GRID=JSON.parse(read('resources/liber-primus/base60-grid.json'));
const LEN=parseSharedCorpus().words.map(w=>w.length);
assert.equal(LEN.length,2896);
assert.equal(LEN.reduce((a,b)=>a+b,0),12956);
const SECTION_WORD_COUNTS=[158,255,385,435,224,326,378,735];
assert.equal(SECTION_WORD_COUNTS.reduce((a,b)=>a+b,0),LEN.length);
const FLAT=GRID.byte_rows.flat();
assert.equal(FLAT.length,256);
assert.ok(FLAT.every(b=>Number.isInteger(b)&&b>=0&&b<=255));
const keyOptions=[
  {name:'grid-row',key:Buffer.from(FLAT)},
  {name:'grid-column',key:Buffer.from(Array.from({length:256},(_,i)=>
    GRID.byte_rows[i%32][Math.floor(i/32)]))},
];
keyOptions.push(...keyOptions.map(x=>({name:x.name+'-reversed',
  key:Buffer.from(x.key).reverse()})));
assert.equal(keyOptions.length,4);
function swap(array,i,j){
  const temp=array[i];array[i]=array[j];array[j]=temp;
}
/** @param {Buffer|Uint8Array} key */
function rc4(key){
  const S=Uint8Array.from({length:256},(_,i)=>i);
  let j=0;
  for(let i=0;i<256;i++){
    j=(j+S[i]+key[i%key.length])&255;
    swap(S,i,j);
  }
  let i=0;
  j=0;
  return ()=>{
    i=(i+1)&255;j=(j+S[i])&255;
    swap(S,i,j);
    return S[(S[i]+S[j])&255];
  };
}
/** Fisher-Yates with 32-bit RC4 integers; slight modulo bias is shared by controls. */
function permutation(size,next){
  const out=Array.from({length:size},(_,i)=>i);
  for(let i=size-1;i>0;i--){
    const q=((((next()*256+next())*256+next())*256+next())>>>0)%(i+1);
    swap(out,i,q);
  }
  return out;
}
function transform(source,mode){
  const key=mode.key,output=[];
  const scopes=mode.section?SECTION_WORD_COUNTS:[source.length];
  let offset=0;
  const stream=rc4(key);
  for(const n of scopes){
    const p=permutation(n,mode.section?rc4(key):stream);
    if(!mode.inverse){
      for(let i=0;i<n;i++)output.push(source[offset+p[i]]);
    }else{
      const next=new Array(n);
      for(let i=0;i<n;i++)next[p[i]]=source[offset+i];
      output.push(...next);
    }
    offset+=n;
  }
  assert.equal(offset,source.length);
  return output;
}
/** Native language-text adjacency signal; exact in expected 3x3 GP word-length bins. */
function chi2(lengths){
  const t=Array.from({length:3},()=>new Uint32Array(3));
  const cat=l=>l<=2?0:l<=5?1:2;
  for(let i=1;i<lengths.length;i++)t[cat(lengths[i-1])][cat(lengths[i])]++;
  const row=t.map(v=>[...v].reduce((a,b)=>a+b,0));
  const col=[0,1,2].map(j=>t.reduce((s,v)=>s+v[j],0));
  let stat=0;
  for(let i=0;i<3;i++)for(let j=0;j<3;j++){
    const expected=row[i]*col[j]/(lengths.length-1);
    stat+=(t[i][j]-expected)**2/expected;
  }
  return stat;
}
function candidateModes(options){
  return options.flatMap(x=>[false,true].flatMap(section=>
    [false,true].map(inverse=>({...x,section,inverse}))));
}
function rank(source,options){
  return candidateModes(options).map(mode=>({
    ...mode,value:chi2(transform(source,mode))
  })).sort((a,b)=>b.value-a.value);
}
function seeded(seed){
  let s=seed>>>0;
  return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};
}
function wrongKeys(trials){
  const random=seeded(0x33014769),scores=[];
  for(let t=0;t<trials;t++){
    const bytes=Buffer.from(FLAT);
    for(let i=bytes.length-1;i>0;i--)swap(bytes,i,
      Math.floor(random()*(i+1)));
    const altered=[
      {name:'wrong-row',key:bytes},
      {name:'wrong-column',key:Buffer.from(Array.from(
        {length:256},(_,i)=>bytes[(i%32)*8+Math.floor(i/32)]))}
    ];
    altered.push(...altered.map(x=>({name:x.name+'-reversed',
      key:Buffer.from(x.key).reverse()})));
    scores.push(rank(LEN,altered)[0].value);
  }
  return scores;
}
function plant(){
  const source=(read('resources/control/shakespeare_first300k.txt')
    .match(/[A-Za-z]+/g)||[]).map(w=>encode(w,false)).filter(Boolean);
  const native=source.slice(4000,4000+LEN.length).map(w=>w.length);
  assert.equal(native.length,LEN.length);
  const trueMode=candidateModes(keyOptions).find(m=>m.name==='grid-row'&&
    !m.section&&!m.inverse);
  assert.ok(trueMode);
  const encrypted=transform(native,trueMode);
  const known=transform(encrypted,{...trueMode,inverse:true});
  assert.deepEqual(known,native);
  const rankings=rank(encrypted,keyOptions);
  return {wordCount:native.length,
    trueModeRank:rankings.findIndex(m=>m.name===trueMode.name&&
      m.section===trueMode.section&&m.inverse!==trueMode.inverse)+1,
    encryptedScore:chi2(encrypted),
    exactNativeScore:chi2(native),
    strongestRecoveredScore:rankings[0].value,
    trueKeyScore:chi2(known),
    fullyRecovers:true};
}
function main(){
  const ranks=rank(LEN,keyOptions),wrong=wrongKeys(40),positive=plant();
  const report={
    classification:'Grid-source RC4 whole-word Fisher-Yates original inverse; hypothesis only',
    trueSource:{tableCells:256,layout:'32x8',sourceOptions:4,
      scopes:['whole-book','eight textual sections'],
      inverseConventions:2,modelCount:16},
    original:{words:LEN.length,runes:12956,
      originalAdjacentLengthChi2:chi2(LEN),
      bestModes:ranks.slice(0,8).map(x=>({
        key:x.name,section:x.section,inverse:x.inverse,chi2:x.value})),
      wrongKeySourcePermutations:wrong.length,
      wrongKeyChi2Range:[Math.min(...wrong),Math.max(...wrong)],
      wrongBeatingOriginal:wrong.filter(v=>v>=ranks[0].value).length},
    plant:positive,
    interpretation:'Original and true-source plant compared using the same GP-word length signal. A score fit cannot authenticate source order or decrypt rune content.'
  };
  console.log(JSON.stringify(report,null,2));
  return report;
}
if(require.main===module)main();
module.exports={rc4,permutation,transform,chi2,rank,main};
