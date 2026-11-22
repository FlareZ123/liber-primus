'use strict';
/**
 * LP2 pages 53 and 55 uniquely comprise 255 ciphertext runes, matching
 * 256-byte image-grid size minus one. This script examines a finite direct
 * hypothesis: the original byte-grid elements mask these two source pages
 * in their original rune order by GP29 addition, with unknown circular
 * starting byte, direction, additive sign and three natural byte maps.
 *
 * A source-layout synthetic plaintext/control must recover its true
 * offset. Negative results exclude only these direct mappings.
 *
 * Run: node sims/grid255_alternating_pages_inverse.cjs
 * Node.js 22, CommonJS, built-ins only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(ROOT,name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const annot = JSON.parse(read('resources/liber-primus/lp2-page53-red-span.json'));
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json')).byte_rows.flat();
const transcription = read('resources/lp2-transcription.txt');
const source = read('resources/control/shakespeare_first300k.txt');
const gp = new Map(corpus.translit.map((x,i) => [x,i]));
const runeID = new Map(corpus.runes.map((x,i) => [x,i]));
const byteMaps = [
  (v) => v % 29,
  (v) => Math.floor(29*v/256),
  (v) => v % 28
];

/** @param {string} value @returns {number[] | null} */
function encode(value) {
  const s = value.toUpperCase().replace(/QU/g,'CW')
    .replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S');
  const out = [];
  for(let i=0;i<s.length;){
    const dg = gp.get(s.slice(i,i+2));
    if(dg!==undefined){out.push(dg);i+=2;}
    else{const n=gp.get(s[i]);if(n===undefined)return null;out.push(n);i++;}
  }
  return out;
}

/** @param {number[][]} reference */
function makeLanguage(reference) {
  const pri = new Uint32Array(29).fill(1);
  const counts = Array.from({length:900},()=>new Uint32Array(29));
  const den = new Uint32Array(900);
  for(const word of reference){
    let a=29,b=29;
    for(const x of word){
      pri[x]++;counts[a*30+b][x]++;den[a*30+b]++;a=b;b=x;
    }
  }
  const total=pri.reduce((a,b)=>a+b,0);
  return counts.map((row,i)=>Array.from(row,(n,x)=>
    Math.log((n+10*pri[x]/total)/(den[i]+10))));
}

/**
 * @param {number[]} plaintext
 * @param {number[]} lengths
 * @param {number[][]} language
 */
function score(plaintext,lengths,language){
  let sum=0,pos=0;
  for(const len of lengths){
    let a=29,b=29;
    for(let j=0;j<len;j++){
      const v=plaintext[pos++];
      sum+=language[a*30+b][v];a=b;b=v;
    }
  }
  assert.equal(pos,plaintext.length);
  return sum;
}

/** @param {number} seed @returns {()=>number} */
function rng(seed){
  let x=seed>>>0;
  return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}

/**
 * @param {number[]} c
 * @param {number[]} lengths
 * @param {number[][]} language
 * @returns {object[]}
 */
function search(c,lengths,language){
  const bestPerFamily=[];
  for(let transform=0;transform<3;transform++)
    for(let reverse=0;reverse<2;reverse++)
      for(const sign of [-1,1]){
        let best={score:-Infinity};
        for(let offset=0;offset<256;offset++){
          const p=c.map((v,i)=>(v+29+sign*byteMaps[transform](
            grid[(offset+(reverse?255-i:i))%256]))%29);
          const value=score(p,lengths,language);
          if(value>best.score)best={
            transform,reverse:!!reverse,sign,offset,score:value,
            preview:p.slice(0,34).map(x=>corpus.translit[x]).join('')
          };
        }
        bestPerFamily.push(best);
      }
  return bestPerFamily.sort((a,b)=>b.score-a.score);
}

function main(){
  const p53=corpus.pages.find(p=>p.page===53).indices;
  const p55=corpus.pages.find(p=>p.page===55).indices;
  const black=annot.red_text.start_rune_inclusive;
  const red=annot.red_text.rune_count;
  assert.equal(black,128);assert.equal(red,51);
  assert.equal(p53.length,black+red);assert.equal(p55.length,76);
  assert.equal(black+red+p55.length,255);
  assert.equal(grid.length,256);
  const all=corpus.pages.filter(p=>p.status==='unsolved'&&p.indices.length);
  const exactPairs=[];
  for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++)
    if(all[i].indices.length+all[j].indices.length===255)
      exactPairs.push([all[i].page,all[j].page]);
  assert.deepEqual(exactPairs,[[53,55]]);
  const seg=transcription.split('%');
  const tokens=[seg[52],seg[54]].flatMap(s=>s.split(/[-./\s$&§]+/u))
    .map(s=>[...s].filter(ch=>runeID.has(ch))
      .map(ch=>runeID.get(ch))).filter(w=>w.length);
  const plainShape=tokens.map(w=>w.length);
  const target=[...p53,...p55];
  assert.deepEqual(tokens.flat(),target);
  assert.equal(tokens.length,65);
  const ref=(source.match(/[A-Za-z]+/g)||[]).map(encode)
    .filter(w=>w!==null&&w.length);
  assert.equal(ref.length,55407);
  assert.equal(ref.reduce((a,b)=>a+b.length,0),218800);
  const lang=makeLanguage(ref), actual=search(target,plainShape,lang);
  const bins=new Map();
  for(const w of ref){
    if(!bins.has(w.length))bins.set(w.length,[]);
    bins.get(w.length).push(w);
  }
  const next=rng(0x533055);
  const known=plainShape.flatMap(n=>{
    const bin=bins.get(n);assert.ok(bin.length);return bin[next()%bin.length];
  });
  const plant=known.map((x,i)=>(x+byteMaps[1](grid[(27+i)%256]))%29);
  const control=search(plant,plainShape,lang);
  const winner=control[0];
  assert.deepEqual([winner.transform,winner.reverse,winner.sign,winner.offset],
    [1,false,-1,27]);
  assert.ok(Math.abs(winner.score-score(known,plainShape,lang))<1e-8);
  return{
    structural:{
      firstPage:53,secondPage:55,black,red,lastPage:p55.length,
      combined:target.length,gridBytes:grid.length,
      unique255PagePairs:exactPairs,totalPossiblePagePairs:1485
    },
    candidateFamily:{
      byteTransforms:['byte %29','floor(29*byte/256)','byte %28'],
      sourceOffsets:256,signs:2,directions:2,total:3072,
      wordCount:tokens.length,referenceGpRunes:218800
    },
    real:{top:actual.slice(0,8),
      interpretation:'No readable original GP-English plaintext; the model is unconfirmed'},
    planted:{seed:'0x533055',trueOffset:27,
      trueScore:score(known,plainShape,lang),winner,
      exactSourceLanguageRestored:true}
  };
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={encode,makeLanguage,score,search,main};
