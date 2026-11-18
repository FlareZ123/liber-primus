'use strict';
/**
 * Reproduce the 225-red-rune / 31-thirteen-dot 256-event constant-weight
 * tape, its zero-based lexicographic 31-of-256 rank, and the signed-2013
 * BASE29 conversion. No alternate event classes, clocks, complements,
 * rank conventions, or downstream cipher interpretations are searched.
 *
 * Run: node sims/lp2_red225_dot13_constant_weight_rank_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=(name)=>fs.readFileSync(path.join(root,name),'utf8');

const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const events=[];
let serial=0;
for(const page of [...ink.pages].sort((a,b)=>a.page-b.page)){
  for(const span of (page.red_spans||[])){
    const runes=Array.from(span.runes);
    for(let i=0;i<runes.length;i++){
      // A mark at offset i is after rune i-1 and before rune i.
      events.push({page:page.page,offset:span.start+i+0.5,kind:'red',
        bit:0,rune:runes[i],serial:serial++});
    }
  }
  for(const [offset,dots,color] of (page.large_punctuation||[])){
    if(dots===13){
      // Preserve the annotation's same-offset order, including p7 black then red.
      events.push({page:page.page,offset,kind:'dot13',bit:1,color,serial:serial++});
    }
  }
}
events.sort((a,b)=>a.page-b.page||a.offset-b.offset||
  (a.kind==='dot13'?0:1)-(b.kind==='dot13'?0:1)||a.serial-b.serial);

const redEvents=events.filter((e)=>e.kind==='red');
const dotEvents=events.filter((e)=>e.kind==='dot13');
assert.equal(redEvents.length,225);
assert.equal(dotEvents.length,31);
assert.equal(events.length,256);
assert.equal(ink.counts.red,225);
assert.equal(ink.counts.red13,30);
assert.equal(ink.counts.black13,1);
assert.equal(ink.counts.red10,4);
assert.equal(ink.counts.red23,1);

const bits=events.map((e)=>String(e.bit)).join('');
const markerPositions=events.map((e,i)=>e.bit===1?i:null).filter((x)=>x!==null);
assert.equal(bits.length,256);
assert.equal(markerPositions.length,31);
assert.equal(markerPositions[0],13); // p0 corrected physical placement
const p7Marks=events.map((e,eventIndex)=>({...e,eventIndex}))
  .filter((e)=>e.page===7&&e.kind==='dot13');
assert.deepEqual(p7Marks.map((e)=>[e.eventIndex,e.offset,e.color]),[
  [50,194,'black'],[51,194,'red'],[66,208,'red'],
]);

function choose(n,k){
  if(k<0||k>n)return 0n;
  k=Math.min(k,n-k);
  let value=1n;
  for(let i=1;i<=k;i++) value=value*BigInt(n-k+i)/BigInt(i);
  return value;
}

// Zero-based lexicographic rank of the increasing tuple of 1-positions.
function lexRank(n,k,positions){
  assert.equal(positions.length,k);
  let rank=0n,previous=-1;
  for(let i=0;i<k;i++){
    for(let candidate=previous+1;candidate<positions[i];candidate++){
      rank+=choose(n-candidate-1,k-i-1);
    }
    previous=positions[i];
  }
  return rank;
}
function lexUnrank(n,k,rank){
  let remainder=rank,previous=-1;
  const positions=[];
  for(let i=0;i<k;i++){
    for(let candidate=previous+1;candidate<n;candidate++){
      const count=choose(n-candidate-1,k-i-1);
      if(remainder<count){
        positions.push(candidate);
        previous=candidate;
        break;
      }
      remainder-=count;
    }
  }
  assert.equal(remainder,0n);
  return positions;
}
assert.equal(lexRank(5,2,[0,1]),0n);
assert.equal(lexRank(5,2,[0,2]),1n);
assert.equal(lexRank(5,2,[0,3]),2n);
assert.equal(lexRank(5,2,[0,4]),3n);
assert.equal(lexRank(5,2,[1,2]),4n);

const total=choose(256,31);
const rank=lexRank(256,31,markerPositions);
assert.ok(rank>=0n&&rank<total);
assert.deepEqual(lexUnrank(256,31,rank),markerPositions);
const capacityBits=Math.ceil(Math.log2(Number(total)));
assert.equal(capacityBits,133);
const rankBits=rank.toString(2).padStart(133,'0');
assert.equal(rankBits.length,133);
const rankHex17=rank.toString(16).padStart(34,'0');
assert.equal(rankHex17.length,34);
const rankBytes=Array.from({length:17},(_,i)=>
  Number((rank>>BigInt((16-i)*8))&255n));
const rankBytesHex=rankBytes.map((b)=>b.toString(16).padStart(2,'0')).join('');
assert.equal(rankBytesHex,rankHex17);

const base29Alphabet='0123456789ABCDEFGHIJKLMNOPQRS';
function base29(value){
  if(value===0n)return '0';
  let n=value,out='';
  while(n>0n){
    out=base29Alphabet[Number(n%29n)]+out;
    n/=29n;
  }
  return out;
}
assert.equal(base29(1033n),'16I');
assert.equal(base29(3301n),'3QO');
const protocol=read('resources/external/2013-tcp-server-signed-source.md');
const vectors=JSON.parse(read('resources/external/2013-tcp-live-test-vectors.json'));
assert.ok(protocol.includes('BASE29 3301'));
assert.ok(protocol.includes('0123456789ABCDEFGHIJKLMNOPQRS'));
assert.equal(vectors.stableOrganizerTestVector.base29Response,'16I');
const base29Output=base29(rank);

const html=read('resources/historical/stage11-2014-index.html');
const manifest=JSON.parse(read('resources/historical/stage11-2014-index-manifest.json'));
const signedHandoff=read('resources/historical/cicada2014-stage11-message.asc');
assert.equal(html.length,1640);
assert.equal(manifest.provenance.sourceCommit,'6c3421a4d245596e403c88e037509d162a2afd17');
assert.equal(manifest.provenance.sourceCommitTimestampUTC,'2014-05-11T18:33:43Z');
assert.equal(manifest.provenance.indexGitBlobSHA1,'303db130705f0ef9be2a738f4336d5cfcebde80c');
assert.equal((html.match(/<title>133<\/title>/g)||[]).length,1);
assert.equal((html.match(/<div id="331">/g)||[]).length,1);
assert.equal((html.match(/<img src="/g)||[]).length,58);
assert.equal((html.match(/<script\b/gi)||[]).length,0);
assert.equal((html.match(/<form\b/gi)||[]).length,0);
assert.equal((html.match(/<a\b/gi)||[]).length,0);
assert.equal((html.match(/<input\b/gi)||[]).length,0);
assert.ok(signedHandoff.includes('ky2khlqdf7qdznac.onion'));
assert.ok(signedHandoff.includes('3301'));

const tapeHex=bits.match(/.{8}/g)
  .map((byte)=>parseInt(byte,2).toString(16).padStart(2,'0')).join('');
const result={
  inventory:{redRunes:redEvents.length,dot13Marks:dotEvents.length,
    redDot13:ink.counts.red13,blackDot13:ink.counts.black13,
    excludedRedDot10:ink.counts.red10,excludedRedDot23:ink.counts.red23,
    totalEvents:events.length},
  markerPositions,
  p7SameOffsetOrder:p7Marks.map((e)=>({eventIndex:e.eventIndex,offset:e.offset,color:e.color})),
  tape:{bits,hex:tapeHex},
  combinadic:{
    convention:'zero-based lexicographic order of increasing 31-position tuples',
    totalCombinations:total.toString(),
    log2Capacity:Math.log2(Number(total)),
    rank:rank.toString(),
    rankBitLength:rank.toString(2).length,
    rank133Bits:rankBits,
    minimal17ByteBigEndianHex:rankBytesHex,
    rankUnrankRoundTrip:true,
  },
  signed2013Base29:{
    alphabet:base29Alphabet,
    rankNumeral:base29Output,
    numeralLength:base29Output.length,
    controls:{'1033':'16I','3301':'3QO'},
  },
  original2014Index:{
    sourceCommit:manifest.provenance.sourceCommit,
    sourceCommitTimestampUTC:manifest.provenance.sourceCommitTimestampUTC,
    historicalAuthentication:manifest.provenance.historicalAuthentication,
    title133:true,divId331:true,imageRefs:58,
    scripts:0,forms:0,anchors:0,inputs:0,
  },
};
console.log(JSON.stringify(result,null,2));
