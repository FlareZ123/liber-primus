"use strict";
/**
 * Exhaustive every-byte-offset search of the 72,700-byte LP1 05.jpg
 * mirrored prefix as a candidate LP2 pad. Four orientations/reducers
 * and both additive signs, exact finite-state skip-aware head scoring,
 * followed by a 220-rune Viterbi decode of the strongest head matches.
 *
 * A synthetic known-key plant measures whether the head screen would
 * retain the true offset. A null result is bounded to this key family.
 * Reproduce: node sims/mirror_jpeg_offsets.cjs
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const {train,encode}=require("./grid_keyskip_viterbi.cjs");
const {decode,encrypt,imageStreams,candidateKeys}=require("./mirror_jpeg_pad.cjs");
const ROOT=path.join(__dirname,".."), M=29, A=3, PENALTY=3.5;
const HEAD=24, WINDOW=220, TOP=140, TEST_SEED=0x51bca033;
const mod=n=>(n%M+M)%M;

/**
 * A no-allocation/low-GC profile score for a fixed key offset.
 * It computes the same Viterbi optimum as decode() restricted to HEAD
 * positions, without constructing explicit plaintext backpointers.
 * @param {number[]} cipher
 * @param {Uint8Array} key
 * @param {number} offset
 * @param {1|-1} sign
 * @param {ReturnType<typeof train>} lm
 * @returns {number}
 */
function headScore(cipher,key,offset,sign,lm){
  const n=cipher.length,width=3*(3*n+1),NEG=-1e30;
  let prev=new Float64Array(width),next=new Float64Array(width);
  prev.fill(NEG);
  const p0=mod(cipher[0]-sign*key[offset]);
  for(let d=1;d<=A;d++){
    const pn=mod(cipher[1]-sign*key[offset+d]);
    let okay=true;
    for(let h=1;h<d;h++) if(mod(pn+sign*key[offset+h])!==cipher[0]){okay=false;break;}
    if(okay)prev[d*3+d-1]=lm.unigram[p0]+lm.bigram[p0*M+pn]-PENALTY*(d-1);
  }
  for(let i=2;i<n;i++){
    next.fill(NEG);
    const prevLo=i-1,prevHi=A*(i-1);
    for(let rel=prevLo;rel<=prevHi;rel++){
      const j=offset+rel,pp=mod(cipher[i-1]-sign*key[j]);
      const row=(rel*3);
      for(let dp=1;dp<=A;dp++){
        const val=prev[row+dp-1];
        if(val<=NEG/2 || rel<dp)continue;
        const ppp=mod(cipher[i-2]-sign*key[j-dp]);
        const base=(ppp*M+pp)*M;
        for(let d=1;d<=A;d++){
          const idx=j+d,p=mod(cipher[i]-sign*key[idx]);
          let okay=true;
          for(let h=1;h<d;h++) if(mod(p+sign*key[j+h])!==cipher[i-1]){
            okay=false;break;
          }
          if(!okay)continue;
          const newScore=val+lm.trigram[base+p]-PENALTY*(d-1);
          const dest=(rel+d)*3+d-1;
          if(newScore>next[dest]) next[dest]=newScore;
        }
      }
    }
    const tmp=prev;prev=next;next=tmp;
  }
  let best=NEG;
  for(let i=0;i<prev.length;i++)if(prev[i]>best)best=prev[i];
  return best/n;
}

/** 
 * @param {number[]} cipher
 * @param {{name:string,key:Uint8Array}[]} keys
 * @param {ReturnType<typeof train>} lm
 * @param {number} topN
 */
function exhaustive(cipher,keys,lm,topN=TOP){
  const best=[];
  let checked=0;
  for(const source of keys) for(const sign of [-1,1]){
    const key=source.key;
    // 3 pad draws per cipher rune is an absolute safe bound.
    const last=key.length-A*WINDOW;
    for(let offset=0;offset<=last;offset++){
      const score=headScore(cipher,key,offset,sign,lm);
      checked++;
      if(best.length<topN) {
        best.push({name:source.name,sign,offset,score});
        if(best.length===topN)best.sort((a,b)=>a.score-b.score);
      } else if(score>best[0].score){
        best[0]={name:source.name,sign,offset,score};
        best.sort((a,b)=>a.score-b.score);
      }
    }
    console.log("SEARCHED",JSON.stringify({
      name:source.name,sign,offsets:last+1,checked,
      strongest:best.at(-1)
    }));
  }
  return {checked,best:best.reverse()};
}

function main(){
  const jpeg=fs.readFileSync(path.join(ROOT,"resources","liber-primus","05.jpg"));
  const keys=candidateKeys(imageStreams(jpeg)).filter(item=>
    item.name.startsWith("trailing-mirror:")||
    item.name.startsWith("unmirrored-prefix:"));
  assert.equal(keys.length,4);
  assert.ok(keys.every(item=>item.key.length===72700));
  const lm=train(fs.readFileSync(path.join(
    ROOT,"resources","control","shakespeare_first300k.txt"),"utf8"));
  const data=JSON.parse(fs.readFileSync(path.join(
    ROOT,"resources","liber-primus","lp2-corpus.json"),"utf8"));
  const cipher=data.pages.find(p=>p.page===0).indices.slice(0,WINDOW);
  assert.equal(cipher.length,WINDOW);

  const known=fs.readFileSync(path.join(
    ROOT,"resources","liber-primus","lp1-plaintext-reference.txt"),"utf8");
  const plain=encode(known.split("### 3")[1].split("### 4")[0]).slice(0,WINDOW);
  assert.equal(plain.length,WINDOW);
  const trueOffset=12345;
  const control=encrypt(plain,keys[0].key,trueOffset,1,TEST_SEED);
  const trueScore=headScore(control.cipher.slice(0,HEAD),keys[0].key,trueOffset,1,lm);
  const trueDecoded=decode(control.cipher,keys[0].key,trueOffset,1,lm);
  const exact=trueDecoded.plain.filter((c,i)=>c===plain[i]).length;
  let rank=1;
  for(let offset=0;offset<=keys[0].key.length-A*WINDOW;offset++){
    if(offset===trueOffset)continue;
    if(headScore(control.cipher.slice(0,HEAD),keys[0].key,offset,1,lm)>trueScore)rank++;
  }
  console.log("CONTROL",JSON.stringify({
    trueOffset,trueScore,rank,offsets:keys[0].key.length-A*WINDOW+1,
    plantSkips:control.skips,recovered:exact,total:WINDOW,
    decodedSkips:trueDecoded.skips
  }));
  assert.ok(exact>=Math.ceil(0.90*WINDOW));
  assert.ok(rank<=TOP,"True key offset missed the head shortlist");

  const searched=exhaustive(cipher.slice(0,HEAD),keys,lm,TOP);
  const detailed=searched.best.map(x=>{
    const key=keys.find(s=>s.name===x.name).key;
    const d=decode(cipher,key,x.offset,x.sign,lm);
    return {...x,fullScore:d.perRune,skips:d.skips,
      first40:d.plain.slice(0,40)};
  }).sort((a,b)=>b.fullScore-a.fullScore);
  console.log("FINAL",JSON.stringify({
    page:0,head:HEAD,full:WINDOW,checked:searched.checked,
    distinctShortlisted:searched.best.length, 
    topFull:detailed.slice(0,20),
    headTop:searched.best.slice(0,20)
  }));
}
if(require.main===module)main();
module.exports={headScore,exhaustive};
