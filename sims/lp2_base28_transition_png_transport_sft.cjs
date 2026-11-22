'use strict';
/** 
 * Source-framed base28 GP29 transition ranks → 2013-PNG byte transport.
 * One fixed high-to-low base28 integer, minimal big-endian bytes, no offsets.
 * Framing fixes chapter start rune, chapter size, and zero-transition bitmap.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const d=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const chapters=ranges.map(([a,b])=>d.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices));
const signature=[137,80,78,71,13,10,26,10]; // 2013 PNG carrier's fixed file magic
assert.equal(chapters.reduce((a,c)=>a+c.length,0),12956);

/** @param {number[]} cipher */
function frame(cipher){
  const flags=[],rank=[];
  for(let i=1;i<cipher.length;i++){
    const v=(cipher[i]-cipher[i-1]+29)%29;
    flags.push(v===0);
    if(v!==0)rank.push(v-1);
  }
  return {first:cipher[0],flags,rank};
}
/** @param {number[]} rank */
function toBytes(rank){
  let value=0n;
  for(const digit of rank){assert.ok(digit>=0&&digit<28);value=value*28n+BigInt(digit);}
  let hex=value.toString(16);if(hex.length%2)hex='0'+hex;
  return Buffer.from(hex,'hex');
}
/** @param {Buffer} bytes @param {number} count */
function fromBytes(bytes,count){
  let value=BigInt('0x'+bytes.toString('hex'));
  const out=Array(count).fill(0);
  for(let i=count-1;i>=0;i--){out[i]=Number(value%28n);value/=28n;}
  assert.equal(value,0n,'Transport bytes must fit the source 28-ary rank count');
  return out;
}
/** @param {number} first @param {boolean[]} flags @param {number[]} rank */
function rebuild(first,flags,rank){
  const out=[first];let j=0;
  for(const isZero of flags){
    const step=isZero?0:1+rank[j++];
    out.push((out.at(-1)+step)%29);
  }
  assert.equal(j,rank.length);
  return out;
}
const output=[];
for(let k=0;k<chapters.length;k++){
  const source=chapters[k],framed=frame(source),bytes=toBytes(framed.rank);
  const recovered=fromBytes(bytes,framed.rank.length);
  assert.deepEqual(recovered,framed.rank);
  assert.deepEqual(rebuild(framed.first,framed.flags,recovered),source);
  const declaredPayloadByteLength=Math.floor(framed.rank.length*Math.log2(28)/8)-1;
  assert.ok(declaredPayloadByteLength>=signature.length);
  const plantedBuffer=Buffer.from(signature.concat(Array(declaredPayloadByteLength-signature.length).fill(0)));
  const plantRanks=fromBytes(plantedBuffer,framed.rank.length);
  const plantCipher=rebuild(framed.first,framed.flags,plantRanks);
  const plantedRecovered=toBytes(frame(plantCipher).rank);
  assert.deepEqual(plantedRecovered,plantedBuffer,'Source-shaped genuine PNG-signature payload must be found');
  output.push({
    visualChapter:k+1,physicalPages:ranges[k],originalRunes:source.length,
    observedZeroTransitions:framed.flags.filter(Boolean).length,
    payloadBytes:bytes.length,payloadPrefixHex:bytes.subarray(0,8).toString('hex'),
    sourcePNGSignature:bytes.subarray(0,signature.length).equals(Buffer.from(signature)),
    sourceReencodedIdentically:true,
    positivePNGSignaturePlantedAndRecovered:true,
  });
}
assert.deepEqual(output.map(x=>x.observedZeroTransitions),[4,6,9,10,11,13,12,18,3]);
assert.equal(output.filter(x=>x.sourcePNGSignature).length,0);
console.log(JSON.stringify({classification:'bounded native 2013 PNG signature negative under one reversible base28 transport; no recovered file or plaintext',frame:'9 visual chapters, first rune as state, complete zero-transition flags, all nonzero successor digits as base28 bigint, minimal big-endian bytes',output},null,2));
