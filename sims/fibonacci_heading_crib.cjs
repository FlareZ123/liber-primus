'use strict';
/**
 * Conditional nine-rune crib attack on the red title above LP2 page-15
 * Fibonacci-indexed prime square (32.jpg): hypothesize "FIBONACCI".
 * This title identification is not established plaintext.
 * Reuse clue-derived 32-byte keys and 256-byte table to test candidate pads.
 * Node.js 22 CommonJS, on-demand only.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {allKeys,layouts}=require('./fibonacci_square_grid_payload.cjs');
const {stream,tableBytes,keyList}=require('./base60_seeded_stream.cjs');
const gp=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources/liber-primus/lp2-corpus.json'),'utf8'));
const cipher=gp.pages.find(p=>p.page===15).indices.slice(0,9);
const plain=[0,10,17,3,9,24,5,5,10];
assert.deepEqual(cipher,[0,1,20,19,24,28,26,22,24]);
assert.equal(plain.map(x=>gp.translit[x]).join(''),'FIBONACCI');
const mod=n=>((n%29)+29)%29;
const mappings=['mod29','scaled','reject232'];
/** @param {number[]|Buffer} bytes @param {string} map @param {number} count */
function symbols(bytes,map,count){
  const out=[];
  for(const b of bytes){
    if(map==='reject232'&&b>=232)continue;
    out.push(map==='scaled'?Math.floor(29*b/256):b%29);
    if(out.length===count)break;
  }
  assert.equal(out.length,count);
  return out;
}
/** @param {number[]} k @param {number} sign @param {string} carrier */
function score(k,sign,carrier){
  return k.reduce((s,x,i)=>s+Number(x===mod((carrier==='atbash'?28-cipher[i]:cipher[i])-sign*plain[i])),0);
}
/** @param {object} result @param {number} value @param {string} label */
function record(result,value,label){
  result.tested++;
  result.histogram[value]++;
  if(value>=6){
    result.top.push({matches:value,configuration:label});
    result.top.sort((a,b)=>b.matches-a.matches);
    if(result.top.length>15)result.top.length=15;
  }
}
/** @param {Array<{name:string,key:Buffer}>} keys */
function scanDerived(keys){
  const result={tested:0,histogram:Array(10).fill(0),top:[]};
  for(const {name,key} of keys)
  for(const alg of ['aes-256-ctr','chacha20','rc4'])
  for(const iv of alg==='rc4'?['zero']:['zero','last-be','last-le','first-le'])
  for(const drop of alg==='rc4'?[0,256,3072]:[0,9,16,32,256]){
    const bytes=stream(alg,key,iv,15,96,drop);
    for(const mapping of mappings){
      const symbols64=symbols(bytes,mapping,64);
      for(let offset=0;offset<=16;offset++){
        const k=symbols64.slice(offset,offset+9);
        for(const sign of [-1,1])for(const carrier of ['direct','atbash']){
          record(result,score(k,sign,carrier),
            [name,alg,iv,drop,mapping,offset,sign,carrier].join(':'));
        }
      }
    }
  }
  result.maxMatches=result.histogram.findLastIndex(x=>x>0);
  return result;
}
function scanLiteral(){
  const result={tested:0,histogram:Array(10).fill(0),top:[]};
  for(const [name,buf] of Object.entries(layouts(tableBytes()))){
    const bytes=Array.from(buf);
    for(const direction of [-1,1])for(let phase=0;phase<256;phase++){
      const seq=Array.from({length:320},(_,i)=>bytes[((phase+direction*i)%256+256)%256]);
      for(const map of mappings){
        const k=symbols(seq,map,9);
        for(const sign of [-1,1])for(const carrier of ['direct','atbash'])
          record(result,score(k,sign,carrier),
            [name,direction,phase,map,sign,carrier].join(':'));
      }
    }
  }
  result.maxMatches=result.histogram.findLastIndex(x=>x>0);
  return result;
}

/**
 * GP ᚠ in the known solved pages is sometimes a literal interrupter that
 * does not consume the modular key. In the proposed FIBONACCI heading
 * the first plaintext rune is ᚠ (0). Test both consume and no-consume
 * conventions with eight scored, genuinely encrypted, subsequent runes.
 * @param {number[]} k Eight proposed keystream symbols.
 * @param {number} sign
 * @param {string} carrier
 */
function scoreLiteralF(k,sign,carrier){
  assert.equal(k.length,8);
  return k.reduce((s,x,j)=>{
    const i=j+1;
    return s+Number(x===mod((carrier==='atbash'?28-cipher[i]:cipher[i])-sign*plain[i]));
  },0);
}
/** @param {Array<{name:string,key:Buffer}>} keys */
function scanLiteralFDerived(keys){
  const result={tested:0,histogram:Array(9).fill(0),top:[]};
  for(const {name,key} of keys)
  for(const alg of ['aes-256-ctr','chacha20','rc4'])
  for(const iv of alg==='rc4'?['zero']:['zero','last-be','last-le','first-le'])
  for(const drop of alg==='rc4'?[0,256,3072]:[0,9,16,32,256]){
    const bytes=stream(alg,key,iv,15,96,drop);
    for(const mapping of mappings){
      const digits=symbols(bytes,mapping,64);
      for(let offset=0;offset<=16;offset++)
      for(const consumeF of [false,true]){
        const k=digits.slice(offset+Number(consumeF),offset+Number(consumeF)+8);
        for(const sign of [-1,1])for(const carrier of ['direct','atbash']){
          const matches=scoreLiteralF(k,sign,carrier);
          result.tested++;result.histogram[matches]++;
          if(matches>=6){
            result.top.push({matches,configuration:
              [name,alg,iv,drop,mapping,offset,consumeF,sign,carrier].join(':')});
            result.top.sort((a,b)=>b.matches-a.matches);
            if(result.top.length>20)result.top.length=20;
          }
        }
      }
    }
  }
  result.maxMatches=result.histogram.findLastIndex(x=>x>0);
  return result;
}
function scanLiteralFGrid(){
  const result={tested:0,histogram:Array(9).fill(0),top:[]};
  for(const [name,buf]of Object.entries(layouts(tableBytes()))){
    const bytes=Array.from(buf);
    for(const direction of [-1,1])for(let phase=0;phase<256;phase++){
      const seq=Array.from({length:320},(_,i)=>bytes[((phase+direction*i)%256+256)%256]);
      for(const mapping of mappings){
        const digits=symbols(seq,mapping,9);
        for(const consumeF of [false,true]){
          const k=digits.slice(Number(consumeF),Number(consumeF)+8);
          for(const sign of [-1,1])for(const carrier of ['direct','atbash']){
            const matches=scoreLiteralF(k,sign,carrier);
            result.tested++;result.histogram[matches]++;
            if(matches>=6)result.top.push({matches,configuration:
              [name,direction,phase,mapping,consumeF,sign,carrier].join(':')});
          }
        }
      }
    }
  }
  result.top.sort((a,b)=>b.matches-a.matches);
  result.top=result.top.slice(0,20);
  result.maxMatches=result.histogram.findLastIndex(x=>x>0);
  return result;
}

function run(){
  const rawKeys=[...allKeys(),...keyList(tableBytes())];
  const keys=Array.from(new Map(rawKeys.map(k=>[k.key.toString('hex'),k])).values());
  const plantKey=keys.find(k=>k.name==='absolute-spiral:BE');
  assert.ok(plantKey);
  const seed=symbols(stream('aes-256-ctr',plantKey.key,'zero',15,96,0),'mod29',9);
  const planted=plain.map((p,i)=>mod(p+seed[i]));
  assert.equal(seed.filter((x,i)=>x===mod(planted[i]-plain[i])).length,9);
  planted[4]=mod(planted[4]+1);
  assert.equal(seed.filter((x,i)=>x===mod(planted[i]-plain[i])).length,8);
  const result={
    hypothesis:'Nine-rune red heading spells FIBONACCI, unproven',
    cipher,wordLengths:[4,5],assumedPlain:plain,
    impliedPlainSpellingWithSourceWordBreak:'FIBO NACCI',
    impliedAdditiveNine:cipher.map((x,i)=>mod(x-plain[i])),
    uniqueKeys:keys.length,
    positive:{exactRecovery:true,oneCorruptionDetected:true},
    derived:scanDerived(keys),grid:scanLiteral(),
    FpassThrough:{derived:scanLiteralFDerived(keys),grid:scanLiteralFGrid()},
    conclusion:'Hypothesis fails to preserve the observed 4|5 word break under ordinary GP plaintext; finite conditional test only.'
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={symbols,score,scoreLiteralF,scanDerived,scanLiteral,scanLiteralFDerived,scanLiteralFGrid,run};
