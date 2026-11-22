"use strict";
/**
 * Clue-derived reversible Hill-cipher test on original LP2 ciphertext.
 * The literal 5x5 LP1 JPEG05 magic square and LP2 page15 4x4 prime square
 * are reduced modulo29 and inverted. Exhaustive matrix-direction, transpose,
 * phase and reset scan, including words that cross page boundaries.
 * Run: node sims/clue_matrix_hill.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {encode}=require("./grid_keyskip_viterbi.cjs");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const ROOT=path.join(__dirname,".."),MOD=29;
const MAGIC5=[
  [272,138,341,131,151],
  [366,199,130,320,18],
  [226,245,91,245,226],
  [18,320,130,199,366],
  [151,131,341,138,272]
];
const FIBO4=[
  [3258,3222,3152,3038],
  [3278,3299,3298,2838],
  [3288,3294,3296,2472],
  [4516,1206,708,1820]
];
const mod=x=>(x%MOD+MOD)%MOD;

/** @param {number[][]} A @returns {number[][]} */
function invert(A){
  const n=A.length,B=A.map((row,i)=>row.map(mod).concat(
    Array.from({length:n},(_,j)=>Number(i===j))));
  for(let j=0;j<n;j++){
    const p=B.findIndex((row,i)=>i>=j&&row[j]!==0);
    assert.ok(p>=j,"The printed matrix must be invertible modulo29");
    [B[j],B[p]]=[B[p],B[j]];
    let inv=1;while(mod(inv*B[j][j])!==1)inv++;
    B[j]=B[j].map(x=>mod(x*inv));
    for(let i=0;i<n;i++)if(i!==j){
      const k=B[i][j];B[i]=B[i].map((x,t)=>mod(x-k*B[j][t]));
    }
  }
  return B.map(row=>row.slice(n));
}
/** @param {number[][]} M @returns {number[][]} */
const transpose=M=>M[0].map((_,i)=>M.map(row=>row[i]));
/** @param {number[]} input @param {number[][]} matrix @param {number} phase @returns {number[]} */
function transform(input,matrix,phase=0){
  const n=matrix.length,out=[];
  for(let at=phase;at+n<=input.length;at+=n)
    for(let i=0;i<n;i++){
      let sum=0;
      for(let j=0;j<n;j++)sum+=matrix[i][j]*input[at+j];
      out.push(mod(sum));
    }
  return out;
}
/** @param {number[]} xs @returns {number} */
function ioc(xs){
  const hist=Array(MOD).fill(0);
  for(const x of xs)hist[x]++;
  return hist.reduce((s,v)=>s+v*(v-1),0)/(xs.length*(xs.length-1));
}
function run(){
  const data=JSON.parse(fs.readFileSync(
    path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
  const pages=data.pages.filter(p=>p.status==="unsolved"&&p.indices.length).map(p=>p.indices);
  assert.equal(pages.length,55);
  assert.equal(pages.flat().length,12956);
  const alphabet=new Map(data.runes.map((r,i)=>[r,i]));
  const runes=s=>Array.from(s).filter(c=>alphabet.has(c)).map(c=>alphabet.get(c));
  const words=parseSharedCorpus().words.map(w=>runes(w.runes));
  assert.equal(words.length,2896);
  assert.equal(words.flat().length,12956);
  const markup=fs.readFileSync(path.join(ROOT,"resources/lp2-transcription.txt"),"utf8");
  const lines=markup.split("%").slice(0,55).join("%").split(/[/%]/u)
    .map(runes).filter(x=>x.length);
  assert.equal(lines.reduce((s,x)=>s+x.length,0),12956);
  const groups={global:[pages.flat()],page:pages,line:lines,word:words};
  const known=encode(fs.readFileSync(
    path.join(ROOT,"resources/liber-primus/lp1-plaintext-reference.txt"),"utf8"));
  const results=[],plants=[];
  for(const [name,square] of [["jpeg05_magic5",MAGIC5],["lp2_p15_fibonacci4",FIBO4]]){
    const M=square.map(row=>row.map(mod)),n=M.length,inv=invert(M);
    const fixture=known.slice(0,Math.floor(known.length/n)*n);
    assert.deepEqual(transform(transform(fixture,M),inv),fixture);
    plants.push({name,recovered:fixture.length,total:fixture.length});
    const variants=[
      ["matrix",M],["inverse",inv],
      ["transpose",transpose(M)],["inverse-transpose",transpose(inv)]
    ];
    for(const [orientation,A] of variants)
      for(const [reset,batches] of Object.entries(groups))
        for(let phase=0;phase<n;phase++){
          const decoded=batches.flatMap(batch=>transform(batch,A,phase));
          if(decoded.length<1000)continue;
          results.push({name,orientation,reset,phase,runes:decoded.length,ioc:ioc(decoded)});
        }
  }
  results.sort((a,b)=>b.ioc-a.ioc);
  assert.ok(results.length>100);
  const output={
    input:{pages:55,runes:12956,words:2896,printedLines:lines.length},
    mod29Determinants:{magic5:3,fibonacci4:17},
    originalIoC:ioc(pages.flat()),solvedReferenceIoC:ioc(known),
    tested:results.length,positiveControls:plants,top:results.slice(0,12),
    bestByReset:Object.fromEntries(
      Object.keys(groups).map(reset=>[reset,results.find(x=>x.reset===reset)]))
  };
  console.log(JSON.stringify(output,null,2));
  return output;
}
if(require.main===module)run();
module.exports={invert,transpose,transform,ioc,run};
