'use strict';
/**
 * SFT: all-secret additive whole-word checksum obstruction under the
 * source-registered p7 GF(4), p50 radix59, p3–p8 255 alignment.
 * Windows Node 22, CommonJS, read-only, exact GF(29) elimination.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.join(__dirname,'..','resources','liber-primus');
const C = JSON.parse(fs.readFileSync(path.join(base,'lp2-corpus.json'),'utf8'));
const G = JSON.parse(fs.readFileSync(path.join(base,'lp2-grid-256.json'),'utf8'));
const parts = fs.readFileSync(path.join(base,'lp2-transcription.txt'),'utf8').split('%');
const runes = new Map(C.runes.map((v,i)=>[v,i]));
const words = [];
let current = [];
for(let page=3;page<=7;page++)for(const ch of parts[page]){
  if(runes.has(ch))current.push(runes.get(ch));
  else if((ch==='-'||ch==='.')&&current.length){words.push(current);current=[];}
}
if(current.length)words.push(current);
assert.equal(words.length,255);
const Y=C.pages.find(p=>p.page===8).indices;
assert.equal(Y.length,255);
const alpha=G.alphabet.replace('f','');
assert.equal(alpha.length,59);
const tokens=G.pages.flatMap(p=>p.tokens);
const grid=tokens.map(t=>59*alpha.indexOf(t[0])+alpha.indexOf(t[1]));
assert(grid.every(x=>x>=0&&x<=251));
const mod=n=>(n%29+29)%29;
function gf4(a,b){
  let v=0;
  for(let k=0;k<2;k++){if((b>>>k)&1)v^=a;a<<=1;if(a&4)a^=7;}
  return v;
}
let state=[2,0,0,0];
const addresses=[];
for(let i=0;i<255;i++){
  addresses.push(state.reduce((n,v)=>4*n+v,0));
  let feedback=0;
  for(let j=0;j<4;j++)feedback^=gf4(state[j],[3,2,0,3][j]);
  state=[state[1],state[2],state[3],feedback];
}
assert.equal(new Set(addresses).size,255);
const H=Y.map((v,i)=>mod(v+grid[addresses[i]]));
assert.deepEqual([words[47],words[177],words[59],words[190]],
                 [[8],[19],[8,24],[19,24]]);
assert.deepEqual([H[47],H[177],H[59],H[190]],[20,4,19,13]);
const effectShort=mod(H[47]-H[177]);
const effectLong=mod(H[59]-H[190]);
assert.deepEqual([effectShort,effectLong],[16,6]);
console.log('FOUR_WORD_SOURCE_OBSTRUCTION '+JSON.stringify({
  words:[47,177,59,190],
  GP29:[[8],[19],[8,24],[19,24]],
  H:[20,4,19,13],
  expectedEqualRuneChangeAcrossLengths:true,
  observedChanges:[effectShort,effectLong]
}));

/** Exact GF(29) augmented row-reduction; the output column is not a key. */
function certificate(rows,output,columns){
  const a=rows.map((row,i)=>Uint8Array.from([...row,output[i]]));
  const inv=Array.from({length:29},(_,i)=>{
    if(!i)return 0;
    for(let j=1;j<29;j++)if(i*j%29===1)return j;
    throw Error('no inverse');
  });
  let rank=0;
  for(let col=0;col<columns;col++){
    let pivot=rank;
    while(pivot<a.length&&a[pivot][col]===0)pivot++;
    if(pivot===a.length)continue;
    [a[rank],a[pivot]]=[a[pivot],a[rank]];
    const inverse=inv[a[rank][col]];
    for(let j=col;j<=columns;j++)a[rank][j]=a[rank][j]*inverse%29;
    for(let i=rank+1;i<a.length;i++){
      const factor=a[i][col];
      if(!factor)continue;
      for(let j=col;j<=columns;j++)a[i][j]=mod(a[i][j]-factor*a[rank][j]);
    }
    rank++;
  }
  const contradictions=a.slice(rank).filter(row=>row[columns]!==0).length;
  return {rank,contradictions};
}
for(const [phases,expected] of Object.entries({
  1:[40,214],2:[68,177],3:[96,152],4:[124,124],
  5:[152,97],6:[177,72],12:[200,52]
})){
  const k=Number(phases), columns=29*k+12;
  const rows=words.map(word=>{
    const row=Array(columns).fill(0);
    word.forEach((rune,pos)=>row[29*(pos%k)+rune]++);
    row[29*k+word.length-1]=1;
    return row;
  });
  const actual=certificate(rows,H,columns);
  assert.deepEqual([actual.rank,actual.contradictions],expected);
  assert(actual.contradictions>0);
  const secret=Array.from({length:columns},(_,i)=>(i*17+4)%29);
  const planted=rows.map(row=>mod(row.reduce((n,x,i)=>n+x*secret[i],0)));
  const control=certificate(rows,planted,columns);
  assert.deepEqual(control,{rank:actual.rank,contradictions:0});
  console.log('ALL_SECRET_GF29_WORD_HASH '+JSON.stringify({
    independentPositionalAlphabets:k,secretCoefficients:columns,
    rank:actual.rank,originalContradictions:actual.contradictions,
    plantedContradictions:control.contradictions
  }));
}
console.log('PASS original source and all-secret positive control');
