'use strict';
/**
 * Exhaustive 28-symbol predecessor-exclusion rank cipher attack on LP2
 * using original CicadaOS DATA/560.13. Each source symbol is a residue
 * modulo 28; the forward map avoids the previous published ciphertext
 * rune. Two exact rank conventions are screened: sorted and cyclic.
 *
 * node sims/iso56013_rank28_full_offset.cjs DATA_560.13 mod|reject[-rev] output.json
 * Node.js 22 CommonJS. Page0 first96 contains zero adjacent doubles;
 * other original doublets are explicitly scored as erasures.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname,'..');
const EXPECTED_SIZE=118818811;
const EXPECTED_SHA='db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f';
const GP=['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
const TOKEN=GP.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
const letterAliases={K:'C',V:'U',Z:'S',Q:'C'};
const read=rel=>fs.readFileSync(path.join(ROOT,rel),'utf8');
const mod=(x,n)=>((x%n)+n)%n;
/** @param {string} raw @returns {number[]} */
function encode(raw){
  const words=raw.toUpperCase().match(/[A-Z]+/g)||[],out=[];
  for(const rawWord of words){
    const word=rawWord.replace(/QU/g,'CW').replace(/[KVZQ]/g,c=>letterAliases[c]);
    for(let i=0;i<word.length;){
      const t=TOKEN.find(x=>word.startsWith(x.s,i));
      assert.ok(t,'Invalid GP source spelling');
      out.push(t.i%28); i+=t.s.length;
    }
  }
  return out;
}
function byteKey(input,mode){
  assert.ok(mode==='mod'||mode==='reject');
  if(mode==='mod'){
    const k=new Uint8Array(input.length);
    for(let i=0;i<input.length;i++)k[i]=input[i]%28;
    return k;
  }
  const k=new Uint8Array(input.length);let count=0;
  for(let i=0;i<input.length;i++)if(input[i]<224)k[count++]=input[i]%28;
  return k.subarray(0,count);
}
function rankSequence(cipher,predecessor,scheme){
  const out=new Int8Array(cipher.length);
  let prev=predecessor;
  for(let i=0;i<cipher.length;i++){
    const c=cipher[i];
    out[i]=c===prev?-1:scheme==='sorted'?
      c-Number(c>prev):mod(c-prev-1,29);
    prev=c;
  }
  return out;
}
function forward(q,previous,scheme){
  return scheme==='sorted'?q+Number(q>=previous):(previous+q+1)%29;
}
function unigram(source){
  const freq=new Float64Array(28).fill(0.8),enc=encode(source);
  for(const x of enc)freq[x]++;
  const z=freq.reduce((a,b)=>a+b,0);
  return Float64Array.from(freq,f=>Math.log(f/z));
}
function heapPush(heap,row,k){
  if(heap.length<k){heap.push(row);heap.sort((a,b)=>a.score-b.score);return;}
  if(row.score<=heap[0].score)return;
  heap[0]=row;heap.sort((a,b)=>a.score-b.score);
}
function candidateScore(ranks,key,logp,start,sign,count){
  let score=0;
  for(let i=0;i<count;i++){
    if(ranks[i]<0)continue;
    const p=mod(ranks[i]+sign*key[start+i],28);
    score+=logp[p];
  }
  return score;
}
function scan(ranks,key,logp,sign,limit,n,topN,tag){
  const tops=[];let best=-Infinity,mean=0,m2=0;
  for(let offset=0;offset<limit;offset++){
    let score=0;
    for(let i=0;i<n;i++){
      const p=mod(ranks[i]+sign*key[offset+i],28);
      score+=logp[p];
    }
    if(score>best)best=score;
    const d=score-mean;mean+=d/(offset+1);m2+=d*(score-mean);
    if(tops.length<topN||score>tops[0].score)
      heapPush(tops,{offset,sign,scheme:tag,score},topN);
    if(offset && offset%20000000===0)console.log(JSON.stringify({kind:'progress',tag,sign,offset,limit,best}));
  }
  return {tag,sign,offsets:limit,prefix:n,best,mean,sd:Math.sqrt(m2/(limit-1)),tops:tops.sort((a,b)=>b.score-a.score)};
}
function seedRandom(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};
}
function positivePlant(P,key,offset,sign,scheme,prev){
  const out=[];let cprev=prev;
  for(let i=0;i<P.length;i++){
    const residue=mod(P[i]-sign*key[offset+i],28);
    const c=forward(residue,cprev,scheme);
    assert.notEqual(c,cprev);out.push(c);cprev=c;
  }
  return out;
}
function saveAtomic(file,result){
  const lock=file+'.lock',fd=fs.openSync(lock,'wx'),tmp=file+'.'+process.pid+'.tmp';
  try{
    fs.writeFileSync(tmp,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
    fs.renameSync(tmp,file);
  }finally{
    fs.closeSync(fd);fs.rmSync(lock,{force:true});fs.rmSync(tmp,{force:true});
  }
}
function run(inputFile,mode,output){
  const raw=fs.readFileSync(inputFile);
  assert.equal(raw.length,EXPECTED_SIZE);
  const sha=crypto.createHash('sha256').update(raw).digest('hex');
  assert.equal(sha,EXPECTED_SHA);
  const parts=mode.split('-'),direction=parts.includes('rev'),mapping=parts[0];
  assert.ok(['mod','reject'].includes(mapping));
  const key=byteKey(raw,mapping);
  if(direction)key.reverse();
  const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
  const page=corpus.pages.find(p=>p.page===0).indices;
  assert.equal(page.length,262);
  const body=page.slice(13),prev=page[12],prefix=96;
  const ranked=Object.fromEntries(['sorted','cyclic'].map(s=>[s,rankSequence(body,prev,s)]));
  for(const v of Object.values(ranked))
    assert.deepEqual([...v.slice(0,prefix)].filter(x=>x<0),[]);
  const logp=unigram(read('resources/control/shakespeare_first300k.txt'));
  const fullLimit=key.length-body.length-1;
  const limit=process.env.LP2_TEST_OFFSETS?
    Math.min(Number(process.env.LP2_TEST_OFFSETS),fullLimit):fullLimit;
  assert.ok(Number.isSafeInteger(limit)&&limit>1000);
  const rows=[];
  for(const scheme of ['sorted','cyclic']){
    for(const sign of [-1,1]){
      console.log(JSON.stringify({kind:'begin',scheme,sign,mode,offsets:limit}));
      rows.push(scan(ranked[scheme],key,logp,sign,limit,prefix,48,scheme));
    }
  }
  const finalists=rows.flatMap(x=>x.tops).map(r=>{
    const ranks=ranked[r.scheme];
    const plaintext=Array.from(ranks, (x,i)=>x<0?-1:mod(x+r.sign*key[r.offset+i],28));
    return {...r,bodyScore:candidateScore(ranks,key,logp,r.offset,r.sign,body.length),
      erasurePositions:plaintext.map((p,i)=>p<0?i:-1).filter(i=>i>=0),
      possiblePlaintext:plaintext.map(p=>p<0?'?':GP[p]).join('')};
  }).sort((a,b)=>b.bodyScore-a.bodyScore);
  const gibran=encode(read('resources/control/gibran_prophet_58585.txt'));
  const rng=seedRandom(0x5601328),maxOriginal=Math.max(...rows.map(x=>x.best));
  const positives=[];
  for(const scheme of ['sorted','cyclic'])for(const sign of [-1,1]){
    for(let t=0;t<20;t++){
      const offset=1000+122003*t+Math.floor(rng()*500);
      const p=gibran.slice(1000+29*t,1000+29*t+prefix);
      const c=positivePlant(p,key,offset,sign,scheme,prev);
      const inverse=rankSequence(c,prev,scheme);
      const got=Array.from(inverse,(v,i)=>mod(v+sign*key[offset+i],28));
      const score=candidateScore(inverse,key,logp,offset,sign,prefix);
      positives.push({scheme,sign,offset,correct:got.filter((v,i)=>v===p[i]).length,
        original:p.length,score,aboveOriginalMaximum:score>maxOriginal});
    }
  }
  const result={source:'CicadaOS original DATA/560.13',sha256:sha,bytes:raw.length,
    mode,keyLength:key.length,
    target:'LP2 page0 black body, previous rune taken from red heading at index12; positions 13..261',
    discovery:{runes:prefix,observedAdjacentDuplicates:0},
    full:{runes:body.length,erasurePositions:finalists[0].erasurePositions},
    hypothesis:'source bytes mod28/rejection as an additive pad on sorted/cyclic 28-symbol predecessor-exclusion ranks; key advances per rune; original doublet positions erased',
    model:'29-rune Shakespeare GP transcription folded EA to F as 28th-bin handling',
    rows:rows.map(({tops,...row})=>({...row,top:tops.slice(0,8)})),
    originalMaxPrefixScore:maxOriginal,finalists:finalists.slice(0,24),
    controls:{count:positives.length,perfect:positives.filter(p=>p.correct===p.original).length,
      aboveOriginalMax:positives.filter(p=>p.aboveOriginalMaximum).length,
      lowestScore:Math.min(...positives.map(p=>p.score)),examples:positives.slice(0,8)},
    conclusion:'Only matching real English with independently verified key and reversible heldout prediction would constitute LP2 plaintext recovery; rank model is conditional.'};
  saveAtomic(output,result);
  console.log(JSON.stringify({kind:'complete',mode,offsetsPerCell:limit,cells:rows.length,
    maxPrefix:maxOriginal,maxFull:finalists[0].bodyScore,top:finalists[0].possiblePlaintext.slice(0,110),
    controls:result.controls,results:output}));
  return result;
}
if(require.main===module){
  assert.equal(process.argv.length,5,
    'Usage: node sims/iso56013_rank28_full_offset.cjs DATA_560.13 mod|reject[-rev] output.json');
  run(process.argv[2],process.argv[3],process.argv[4]);
}
module.exports={encode,byteKey,rankSequence,forward,unigram,scan,positivePlant,run};
