'use strict';
/**
 * Direct, source-constrained test of the exact 79 red runes on LP2 pages
 * 15/40/53 as a 256-bit AES/ChaCha key source. SHA256 uses either UTF8 rune
 * glyph bytes or the identical 79 canonical GP index bytes. AES-CTR and
 * ChaCha20 use the explicit zero IV and previously tested collision-skip
 * Viterbi; no hidden free key bits or fitted nonce.
 *
 * The 79-symbol red subset is postselected, not a known authentic LP2 key.
 * Node.js 22 CommonJS, manual-only and no external npm dependencies.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {originalBodies,streamKey,viterbi}=require('./grid_stream_collision_viterbi.cjs');
const {train,encode}=require('./grid_keyskip_viterbi.cjs');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const MOD=29;
const R=16;
const PAGES=[15,40,53];
const MODE=[];
for(const algo of ['aes-256-ctr','chacha20'])
for(const reverseKey of [false,true])
for(const reducer of ['mod29','scaled29'])
for(const sign of [-1,1])
MODE.push({algo,reverseKey,reducer,sign});
const mod=x=>(x%MOD+MOD)%MOD;

/** @returns {number[]} Original ciphertext runes, only original red ink on three pages. */
function redKeyIndices(){
  const spans=PAGES.map(page=>{
    const a=ink.pages.find(p=>p.page===page);
    const b=corpus.pages.find(p=>p.page===page);
    assert.ok(a&&b);
    return a.red_spans.flatMap(s=>b.indices.slice(s.start,s.start+s.length));
  });
  assert.deepEqual(spans.map(x=>x.length),[20,8,51]);
  const vals=spans.flat();
  assert.equal(vals.length,79);
  assert.equal(spans[0].slice(0,9).reduce((n,x)=>n+corpus.prime[x],0),638);
  assert.equal(spans[1].reduce((n,x)=>n+corpus.prime[x],0),435);
  assert.equal(spans[2].reduce((n,x)=>n+corpus.prime[x],0),2262);
  return vals;
}

/** @param {number[]} source @returns {{source:string,key:Buffer}[]} */
function digests(source){
  return [
    {source:'utf8-original-runes',
      key:crypto.createHash('sha256').update(source.map(i=>corpus.runes[i]).join(''),'utf8').digest()},
    {source:'gp-index-bytes',
      key:crypto.createHash('sha256').update(Buffer.from(source)).digest()}
  ];
}

/** @param {number[][]} texts @param {Buffer} key @param {ReturnType<typeof train>} lm */
function decodeKey(texts,key,lm){
  const out=[];
  for(const setting of MODE){
    const stream=streamKey(key,setting);
    const inferred=texts.map(text=>viterbi(text,stream,setting.sign,lm));
    const log=inferred.reduce((s,x)=>s+x.score,0)/
      texts.reduce((s,x)=>s+x.length,0);
    out.push({...setting,log,
      skips:inferred.map(x=>x.skips),
      examples:inferred.slice(0,2).map(x=>x.plaintext.slice(0,40).map(i=>corpus.translit[i]).join(' '))});
  }
  return out.sort((a,b)=>b.log-a.log);
}

/** @param {number} seed @returns {() => number} */
function random32(seed){
  let s=seed>>>0;
  return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};
}

/** Exact positive with the literal red-derived digest and unknown skipped draws. */
function positive(key,lm){
  const plain=encode(read('resources/control/shakespeare_first300k.txt').slice(205000));
  assert.ok(plain.length>=2400);
  const originals=Array.from({length:8},(_,i)=>plain.slice(i*300,(i+1)*300));
  const model={algo:'aes-256-ctr',reverseKey:false,reducer:'mod29',sign:1};
  const stream=streamKey(key,model);
  const rnd=random32(0x79211279);
  let originalSkips=0;
  const texts=originals.map(p=>{
    let consumed=0,last=-1;
    return p.map(v=>{
      let next=mod(v+stream[consumed++]);
      if(next===last&&(rnd()%100)<81){
        next=mod(v+stream[consumed++]);
        originalSkips++;
      }
      last=next;
      return next;
    });
  });
  let correct=0,inferredSkips=0;
  for(let i=0;i<8;i++){
    const recovered=viterbi(texts[i],stream,model.sign,lm);
    correct+=recovered.plaintext.filter((v,j)=>v===originals[i][j]).length;
    inferredSkips+=recovered.skips;
  }
  assert.ok(correct>=2040);
  return{runes:2400,correct,accuracy:correct/2400,originalSkips,inferredSkips};
}

function main(){
  const red=redKeyIndices(),keys=digests(red);
  const texts=originalBodies();
  assert.equal(texts.length,8);
  assert.ok(texts.every(x=>x.length===300));
  const lm=train(read('resources/control/shakespeare_first300k.txt').slice(0,200000));
  const original=keys.map(k=>({
    source:k.source,
    keySha256:k.key.toString('hex'),
    best:decodeKey(texts,k.key,lm).slice(0,4)
  }));
  const observed=Math.max(...original.map(x=>x.best[0].log));
  const rand=random32(0x79d1cfa1);
  const nulls=[];
  for(let i=0;i<R;i++){
    const perm=red.slice();
    for(let j=perm.length-1;j>0;j--){
      const k=rand()%(j+1);
      [perm[j],perm[k]]=[perm[k],perm[j]];
    }
    const shuffled=digests(perm);
    const best=Math.max(...shuffled.map(k=>decodeKey(texts,k.key,lm)[0].log));
    nulls.push(best);
  }
  const positiveTests=keys.map(k=>({source:k.source,...positive(k.key,lm)}));
  const result={
    source:'original p15/p40/p53 red 20+8+51 runes, original LP2 8 bodies',
    shaKeyVariants:keys.length,searchModesPerVariant:MODE.length,
    original,positiveTests,
    matchedDigestPermutationNull:{
      replicates:R,seed:0x79d1cfa1,
      originalBest:observed,
      nullMean:nulls.reduce((x,y)=>x+y,0)/R,
      nullMaximum:Math.max(...nulls),
      exceedances:nulls.filter(x=>x>=observed).length,
      upperP:(1+nulls.filter(x=>x>=observed).length)/(R+1)
    },
    conclusion:'Source-derived hashed red-79 candidate tested; no independently recovered original LP2 plaintext.'
  };
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  return result;
}
if(require.main===module)main();
module.exports={redKeyIndices,digests,decodeKey,positive,main};
