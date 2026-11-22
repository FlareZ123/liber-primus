"use strict";
/**
 * Original-LP2 key-independent exclusion of marker-delimited, maximally
 * packed byte-to-base28 transport under arbitrary stationary predecessor
 * substitution rows. Each physical page may have its own unknown 29x28
 * successor table. Exactly repeated ciphertext runes are separators and
 * consume no digit; the first rune of each page initializes the state.
 *
 * Each L-rune nonrepeat packet represents m=floor(log_256(28^L)) wholly
 * unrestricted bytes as a left-zero-padded L-digit base28 integer.
 * Every valid packet must begin with digit at most
 * floor((256^m-1)/28^(L-1)); if this is zero, its first digit is forced.
 *
 * Original p33 contains a two-packet all-keys contradiction even when
 * page-specific alphabets are allowed. The source-native synthetic plant exercises forward and reversed digit order
 * under a secretly permuted 29-rune cyclic alphabet with all 86 markers and
 * exact original page shapes.
 *
 * Run: node sims/repeat_marker_variable_byte_gate.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const gp=JSON.parse(fs.readFileSync(
  path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const pages=gp.pages.filter(p=>p.status==="unsolved"&&p.indices.length);
assert.equal(pages.length,55);
assert.equal(pages.reduce((n,p)=>n+p.indices.length,0),12956);
const N=29;

/**
 * Largest number of *unrestricted* whole bytes that fit L base28 digits.
 * BigInt adjustment rules out floating boundary ambiguity.
 * @param {number} length
 * @returns {number}
 */
function byteWidth(length){
  assert.ok(Number.isSafeInteger(length)&&length>=0);
  const capacity=28n**BigInt(length);
  let m=Math.floor(length*Math.log(28)/Math.log(256));
  while(256n**BigInt(m+1)<=capacity)m++;
  while(256n**BigInt(m)>capacity)m--;
  return m;
}
/**
 * Page-local source packetization. Page breaks and repeated-glyph markers
 * end packets. For final repeated symbols retain the possibly empty packet.
 * @param {number[]} runes
 * @returns {Array<{start:number,length:number,m:number,limit:number|null,
 *   before:number,leader:number|null,marker:number|null}>}
 */
function packets(runes){
  const out=[];
  let start=1;
  for(let i=1;i<=runes.length;i++){
    if(i===runes.length||runes[i]===runes[i-1]){
      const length=i-start,m=byteWidth(length);
      const limit=length===0?null:
        Number((256n**BigInt(m)-1n)/(28n**BigInt(length-1)));
      out.push({start,length,m,limit,before:runes[start-1],
        leader:length? runes[start]:null,marker:i<runes.length?i:null});
      start=i+1;
    }
  }
  return out;
}
/**
 * Proof holds even when every page chooses a different, arbitrary,
 * unknown permutation from base28 digits to successor ciphertext runes
 * separately for each predecessor rune.
 */
function originalGate(){
  let markerCount=0,packetCount=0,byteCount=0,zeroLeaders=0;
  const contradictions=[];
  let global=0;
  for(const p of pages){
    const observed=new Map();
    for(const packet of packets(p.indices)){
      packetCount++;byteCount+=packet.m;
      markerCount+=Number(packet.marker!==null);
      if(packet.length&&packet.limit===0){
        zeroLeaders++;
        const old=observed.get(packet.before);
        if(old&&old.packet.leader!==packet.leader){
          contradictions.push({
            page:p.page,
            predecessorRune:gp.runes[packet.before],
            forcedRank:0,
            left:{globalOffset:global+old.packet.start,
              localOffset:old.packet.start,
              packetLength:old.packet.length,
              payloadBytes:old.packet.m,
              leadingRune:gp.runes[old.packet.leader]},
            right:{globalOffset:global+packet.start,
              localOffset:packet.start,
              packetLength:packet.length,
              payloadBytes:packet.m,
              leadingRune:gp.runes[packet.leader]}
          });
        }
        if(!old)observed.set(packet.before,{packet});
      }
    }
    global+=p.indices.length;
  }
  assert.equal(global,12956);
  assert.equal(markerCount,86);
  assert.equal(packetCount,141);
  assert.equal(byteCount,7637);
  assert.equal(zeroLeaders,53);
  assert.deepEqual(contradictions,[{
    page:33,predecessorRune:"ᛞ",forcedRank:0,
    left:{globalOffset:7961,localOffset:1,packetLength:151,
      payloadBytes:90,leadingRune:"ᛇ"},
    right:{globalOffset:8143,localOffset:183,packetLength:31,
      payloadBytes:18,leadingRune:"ᛋ"}
  }]);
  return {pages:pages.length,sourceRunes:global,packetCount,
    nonemptyPackets:139,emptyPackets:2,markerCount,
    payloadBytes:byteCount,forcedZeroPacketLeaders:zeroLeaders,
    independentWithinPageContradictions:contradictions};
}

/**
 * Reverse-significance packet order. The last printed digit becomes the
 * most-significant base28 position. A zero bound therefore fixes the
 * *last* transition in each packet under the same arbitrary row key.
 */
function reverseOriginalGate(){
  const contradictions=[];
  let global=0,forcedZeroLastDigits=0;
  for(const p of pages){
    const seen=new Map();
    for(const packet of packets(p.indices)){
      if(packet.length&&packet.limit===0){
        forcedZeroLastDigits++;
        const end=packet.start+packet.length-1;
        const predecessor=p.indices[end-1];
        const successor=p.indices[end];
        const old=seen.get(predecessor);
        const witness={start:packet.start,end,globalEnd:global+end,
          length:packet.length,m:packet.m,successor};
        if(old&&old.successor!==successor){
          contradictions.push({
            page:p.page,predecessorRune:gp.runes[predecessor],
            forcedRank:0,
            left:{globalOffset:old.globalEnd,localOffset:old.end,
              packetLength:old.length,payloadBytes:old.m,
              finalRune:gp.runes[old.successor]},
            right:{globalOffset:witness.globalEnd,localOffset:end,
              packetLength:packet.length,payloadBytes:packet.m,
              finalRune:gp.runes[successor]}
          });
        }
        if(!old)seen.set(predecessor,witness);
      }
    }
    global+=p.indices.length;
  }
  assert.equal(forcedZeroLastDigits,53);
  assert.deepEqual(contradictions,[{
    page:42,predecessorRune:"ᛖ",forcedRank:0,
    left:{globalOffset:10165,localOffset:21,packetLength:21,
      payloadBytes:12,finalRune:"ᚹ"},
    right:{globalOffset:10415,localOffset:271,packetLength:249,
      payloadBytes:149,finalRune:"ᚫ"}
  }]);
  return {forcedZeroLastDigits,independentWithinPageContradictions:contradictions};
}

/** @param {number} seed @returns {()=>number} */
function random(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}
/** @param {()=>number} next */
function secretOrder(next){
  const order=Array.from({length:N},(_,i)=>i);
  for(let i=N-1;i>0;i--){
    const j=next()%(i+1);
    [order[i],order[j]]=[order[j],order[i]];
  }
  return order;
}
/**
 * Encode a full page from byte packets and the prescribed original-layout
 * marker mask, under an arbitrary secret cyclic order.
 * @param {number[]} template
 * @param {number[][]} bytesByPacket
 * @param {number[]} order
 * @param {number[]} positions
 * @returns {number[]}
 */
function encodePage(template,bytesByPacket,order,positions,direction="forward"){
  assert.ok(direction==="forward"||direction==="reverse");
  const descriptors=packets(template);
  assert.equal(bytesByPacket.length,descriptors.length);
  const out=[template[0]];
  for(let k=0;k<descriptors.length;k++){
    const d=descriptors[k],bytes=bytesByPacket[k];
    assert.equal(bytes.length,d.m);
    let v=0n;
    for(const byte of bytes){assert.ok(byte>=0&&byte<=255);v=v*256n+BigInt(byte);}
    const digits=Array(d.length).fill(0);
    for(let j=d.length-1;j>=0;j--){digits[j]=Number(v%28n);v/=28n;}
    assert.equal(v,0n,"byte payload overflow");
    for(const digit of (direction==="reverse"?digits.reverse():digits)){
      const prev=out[out.length-1];
      const glyph=order[(positions[prev]+digit+1)%N];
      assert.notEqual(glyph,prev);
      out.push(glyph);
    }
    if(d.marker!==null)out.push(out[out.length-1]);
  }
  assert.equal(out.length,template.length);
  return out;
}
/**
 * Source-only decoder: read the same repeat markers from ciphertext and
 * recover exact bytes from the rank difference in the secret order.
 * @param {number[]} ciphertext
 * @param {number[]} positions
 * @returns {number[][]}
 */
function decodePage(ciphertext,positions,direction="forward"){
  assert.ok(direction==="forward"||direction==="reverse");
  return packets(ciphertext).map(packet=>{
    let v=0n,prev=ciphertext[packet.start-1],digits=[];
    for(let i=packet.start;i<packet.start+packet.length;i++){
      const current=ciphertext[i];
      digits.push((positions[current]-positions[prev]-1+N)%N);
      prev=current;
    }
    if(direction==="reverse")digits.reverse();
    for(const rank of digits)v=v*28n+BigInt(rank);
    assert.ok(v<256n**BigInt(packet.m),"decoded byte capacity");
    const bytes=Array(packet.m);
    for(let k=packet.m-1;k>=0;k--){bytes[k]=Number(v%256n);v/=256n;}
    assert.equal(v,0n);
    return bytes;
  });
}
function plantDirection(direction,seed){
  const next=random(seed);
  const order=secretOrder(next);
  const positions=Array(N);
  order.forEach((r,i)=>positions[r]=i);
  let total=0,emitted=0,markers=0,allBytes=[];
  for(const p of pages){
    const desc=packets(p.indices);
    const bytes=desc.map(d=>Array.from({length:d.m},()=>next()%256));
    const cipher=encodePage(p.indices,bytes,order,positions,direction);
    const decoded=decodePage(cipher,positions,direction);
    assert.deepEqual(decoded,bytes,"synthetic source-native byte inverse");
    assert.deepEqual(encodePage(cipher,decoded,order,positions,direction),cipher,
      "exact ciphertext re-encryption");
    assert.deepEqual(packets(cipher).map(d=>d.marker),
      desc.map(d=>d.marker),"marker masks preserved");
    total+=bytes.reduce((s,b)=>s+b.length,0);
    emitted+=cipher.length;
    markers+=desc.filter(d=>d.marker!==null).length;
    allBytes.push(...bytes.flat());
  }
  assert.equal(total,7637);assert.equal(emitted,12956);
  assert.equal(markers,86);assert.equal(allBytes.length,total);
  return {direction,originalLayoutRuneCount:emitted,
    originalMarkerCount:markers,distinctSecretOrderValues:new Set(order).size,
    syntheticPlaintextBytes:total,exactlyRecoveredBytes:total,
    exactReencryption:true,seed:"0x"+seed.toString(16)};
}
function plant(){
  return {
    forward:plantDirection("forward",0x12003301),
    reverse:plantDirection("reverse",0x12003302)
  };
}

function main(){
  return {
    status:"key-independent bounded exclusion; no unknown plaintext or historical key",
    hypothesis:"86 original adjacent-rune repeats delimit maximal-width unrestricted base28-to-byte packets, with stationary predecessor permutations per page",
    original:{forward:originalGate(),reverse:reverseOriginalGate()},
    syntheticPositive:plant(),
    limitation:"Changing predecessor substitution within a page, different packet boundaries, restricted byte codebooks, nonmaximal or variable byte framing, and extra encryption are outside this finite theorem."
  };
}
module.exports={byteWidth,packets,originalGate,reverseOriginalGate,encodePage,decodePage,plantDirection,plant,main};
if(require.main===module)console.log(JSON.stringify(main(),null,2));
