'use strict';
/**
 * Original 2014 Onion2 final 256-byte artifact as RC4 key for GP29
 * and p50 exact original 256-byte base60 table as data/key.
 * Independent historical-key hypothesis beyond previously tested repeating
 * 256-byte additive keys. Read-only, deterministic Windows Node22 CJS SFT.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const text=file=>fs.readFileSync(path.join(root,file),'utf8');
const corpus=JSON.parse(text('resources/liber-primus/lp2-corpus.json'));
const table=JSON.parse(text('resources/liber-primus/lp2-grid-256.json')).pages.flatMap(p=>p.bytes);
const onion=text('resources/2014-onion2-final-256byte-hex.txt').trim().match(/../g).map(x=>parseInt(x,16));
assert.equal(onion.length,256);
assert.equal(table.length,256);
assert.deepEqual(onion.slice(0,4),[99,66,146,186]);
assert.deepEqual(table.slice(0,4),[203,231,167,186]);
assert.equal(corpus.pages.slice(0,56).reduce((s,p)=>s+p.indices.length,0),12956);
const xor=table.map((v,i)=>v^onion[i]);
/** @param {number[]} key @param {number} n @param {number} skip @returns {number[]} */
function rc4(key,n,skip=0){
  const S=Array.from({length:256},(_,i)=>i);
  let j=0;
  for(let i=0;i<256;i++){j=(j+S[i]+key[i%key.length])&255;[S[i],S[j]]=[S[j],S[i]];}
  let i=0; j=0; const out=[];
  for(let t=0;t<n+skip;t++){
    i=(i+1)&255;j=(j+S[i])&255;
    [S[i],S[j]]=[S[j],S[i]];
    if(t>=skip)out.push(S[(S[i]+S[j])&255]);
  }
  return out;
}
assert.equal(rc4([75,101,121],10).map(x=>x.toString(16).padStart(2,'0')).join(''),'eb9f7781b734ca72a719');
/** @param {number[]} rs */
function ioc(rs){
  const count=Array(29).fill(0);
  for(const i of rs){assert(i>=0&&i<29);count[i]++;}
  return count.reduce((s,c)=>s+c*(c-1),0)/(rs.length*(rs.length-1));
}
const norm=v=>(v%29+29)%29;
const starts=new Set([0,3,8,15,23,27,33,40,54]);
/**
 * @param {number[]} key @param {'book'|'page'|'chapter'} scope
 * @param {number} sign @param {number} skip
 */
function invert(key,scope,sign,skip){
  const pages=corpus.pages.slice(0,56);
  const all=[],blocks=[[],[],[]];
  const full=scope==='book'?rc4(key,12956,skip):null;
  let offset=0,period=0;
  for(const [p,page] of pages.entries()){
    const cs=page.indices;
    if(scope==='page'||(scope==='chapter'&&starts.has(p)))period=0;
    const ks=scope==='book'?full.slice(offset,offset+cs.length):rc4(key,period+cs.length,skip).slice(period);
    const ps=cs.map((v,i)=>norm(v+sign*(ks[i]%29)));
    all.push(...ps);blocks[p<8?0:p<24?1:2].push(...ps);
    period+=cs.length;offset+=cs.length;
  }
  return {all,blockIoC:blocks.map(ioc)};
}

/**
 * Exact p56-authentic transparent-plaintext-F feasibility:
 * P=F emits C=F without consuming key. P!=F consumes one RC4 byte
 * and emits GP29(P+/-key). An encrypted non-F is allowed to emit F.
 * All possible hidden key cursors are enumerated; no lexical scoring,
 * guessed skip decisions, or secret parameters are needed.
 *
 * @param {number[]} ciphertext
 * @param {number[]} stream
 * @param {number} sign
 * @returns {{survivors:number,deadAt:number,maxStates:number}}
 */
function fReachable(ciphertext,stream,sign){
  let active=new Set([0]),maxStates=1;
  for(let i=0;i<ciphertext.length;i++){
    const out=new Set(),c=ciphertext[i];
    for(const k of active){
      if(c===0)out.add(k);
      if(k<stream.length && norm(c-sign*(stream[k]%29))!==0)
        out.add(k+1);
    }
    if(out.size===0)return {survivors:0,deadAt:i,maxStates};
    active=out;
    maxStates=Math.max(maxStates,active.size);
  }
  return {survivors:active.size,deadAt:-1,maxStates};
}
/** @param {number[]} plaintext @param {number[]} stream @param {number} sign */
function fForward(plaintext,stream,sign){
  const cipher=[];let keypos=0;
  for(const p of plaintext){
    if(p===0)cipher.push(0);
    else cipher.push(norm(p+sign*(stream[keypos++]%29)));
  }
  return {cipher,keypos};
}
const chapterBreaks=[0,3,8,15,23,27,33,40,54,56];
/** @param {'book'|'page'|'chapter'} scope */
function originalSegments(scope){
  const pages=corpus.pages.slice(0,56).map(p=>p.indices);
  if(scope==='book')return [{head:0,runes:pages.flat()}];
  if(scope==='page')return pages.map((runes,head)=>({head,runes})).filter(x=>x.runes.length>0);
  return chapterBreaks.slice(0,-1).map((head,i)=>({
    head,runes:pages.slice(head,chapterBreaks[i+1]).flat()
  }));
}
function fSkipGate(){
  const controls=[];
  const plain=corpus.pages[57].indices;
  for(const [name,key] of [['onion',onion],['grid',table],['onionXorGrid',xor]]){
    const stream=rc4(key,plain.length);
    for(const sign of [-1,1]){
      const planted=fForward(plain,stream,sign);
      assert(planted.keypos<=plain.length);
      const res=fReachable(planted.cipher,stream,sign);
      assert(res.survivors>0);
      controls.push({name,sign,plainLength:plain.length,consumed:planted.keypos,possible:true});
    }
  }
  const candidates=[];
  for(const [name,key] of [['onion',onion],['grid',table],['onionXorGrid',xor]])
    for(const skip of [0,256,512])
      for(const sign of [-1,1]){
        const scoped={name,skip,sign};
        for(const scope of ['book','chapter','page']){
          const result=originalSegments(scope).map(s=>{
            const stream=rc4(key,s.runes.length+16,skip);
            return {head:s.head,n:s.runes.length,...fReachable(s.runes,stream,sign)};
          });
          scoped[scope]={
            total:result.length,
            possible:result.filter(x=>x.survivors>0).length,
            maxOriginalPrefix:Math.max(...result.map(x=>x.deadAt<0?x.n:x.deadAt)),
            firstRejected:result.find(x=>x.deadAt>=0)||null,
            p55:scope==='page'?result.find(x=>x.head===55):null
          };
        }
        candidates.push(scoped);
      }
  assert.equal(candidates.length,18);
  assert(candidates.every(x=>x.book.possible===0 && x.chapter.possible===0));
  assert(candidates.every(x=>x.page.possible<55));
  return {model:'Known solved p56 plaintext F emits literal F and skips RC4 key; encrypted non-F may also emit F',
    method:'Exact all-cursor DP; no language model or inferred F placements',
    controls,candidates};
}

function main(){
  const keys={onion,grid:table,onionXorGrid:xor};
  const controls=[];
  for(const [name,key] of Object.entries(keys)){
    const plant=corpus.pages[56].indices;
    const stream=rc4(key,plant.length,0);
    const cipher=plant.map((v,i)=>norm(v+stream[i]%29));
    const plain=cipher.map((v,i)=>norm(v-stream[i]%29));
    assert.deepEqual(plain,plant);
    controls.push({name,recovered:plant.length});
  }
  const rank=[];
  for(const [name,key] of Object.entries(keys))
    for(const scope of ['book','page','chapter'])
      for(const skip of [0,256,512])
        for(const sign of [-1,1]){
          const {all,blockIoC}=invert(key,scope,sign,skip);
          rank.push({name,scope,skip,sign,wholeIoC:ioc(all),blockIoC,
            first30:all.slice(0,30).map(x=>corpus.translit[x]).join('')});
        }
  const direct=[];
  for(const [name,key,msg] of [['onion-key-grid-data',onion,table],['grid-key-onion-data',table,onion]])
    for(const skip of [0,256,512]){
      const stream=rc4(key,256,skip);
      const output=msg.map((b,i)=>b^stream[i]);
      direct.push({name,skip,first16:output.slice(0,16).map(v=>v.toString(16).padStart(2,'0')).join(''),
        printable:output.filter(v=>v>=32&&v<127).length});
    }
  assert.equal(rank.length,54);
  const maxIoc=Math.max(...rank.flatMap(x=>[x.wholeIoC,...x.blockIoC]));
  assert(maxIoc<0.045,'An original source-derived key unexpectedly has GP plaintext concentration!');
  console.log(JSON.stringify({
    hypothesis:'2014 Onion2 256 bytes and original LP2 printed grid as 256-byte standard RC4 keys',
    source:'Original-era published January 2014 Onion2 string plus native 2014 LP2 base60 grid',
    noAuthenticatedConsumer:true,
    rawIoC:ioc(corpus.pages.slice(0,56).flatMap(x=>x.indices)),
    solvedClear57IoC:ioc(corpus.pages[57].indices),
    positiveControls:controls,
    direct256ByteXor:direct,
    attemptedSourceKeyConsumers:54,
    highestWholeIoC:Math.max(...rank.map(x=>x.wholeIoC)),
    highestBlockIoCs:[0,1,2].map(i=>Math.max(...rank.map(x=>x.blockIoC[i]))),
    highestByKey:Object.keys(keys).map(name=>({name,best:rank.filter(x=>x.name===name).sort((a,b)=>b.wholeIoC-a.wholeIoC)[0]})),
    fTransparentExactGate:fSkipGate(),
    outcome:'No source-key mode yields actual LP2 GP-native plaintext under the tested clock, reducer and no-skip rule'
  },null,2));
}
if(require.main===module) main();
