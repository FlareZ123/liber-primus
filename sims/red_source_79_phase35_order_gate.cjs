'use strict';
/**
 * Independently red-source-derived cyclic 29-rune alphabet challenge.
 * Tested against all 95 original repeat-free LP2 79-cipher-rune packets at
 * the sole surviving global phase35, without language fitting.
 *
 * Four source-only keys are formed from annotated red rune order/frequency.
 * The exact mathematical test requires each source-order packet to encode
 * an unsigned integer smaller than 29^78; failures cannot be fixed by
 * plaintext choices. A native-GP-English positive control round-trips full
 * 79-output packets under the source first-occurrence order.
 *
 * Run: node sims/red_source_79_phase35_order_gate.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {cleanStarts}=require('./prime79_radix29_28_exact_gate.cjs');
const {encode}=require('./grid_keyskip_viterbi.cjs');

const ROOT=path.join(__dirname,'..');
const load=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const GP=[...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const N=29,PERIOD=79,PLAIN=78,MAX=29n**78n;

/** @returns {{name:string,order:number[]}[]} */
function sourceOrders() {
  const j=load('resources/liber-primus/lp2-ink-annotations.json');
  const spans=j.pages.filter(p=>p.page<56).flatMap(
    p=>(p.red_spans??[]).map(s=>({page:p.page,content:[...s.runes]})));
  const total=spans.reduce((n,s)=>n+s.content.length,0);
  assert.equal(total,213);
  const red=spans.flatMap(x=>x.content);
  const longest=spans.reduce((a,b)=>
    !a||b.content.length>a.content.length?b:a,null);
  assert.equal(longest.page,53);
  assert.equal(longest.content.length,51);
  const make=seq=>[...new Set([...seq,...GP])].map(c=>GP.indexOf(c));
  const counts=GP.map((r,i)=>({i,count:red.filter(c=>c===r).length}));
  const list=[
    {name:'source-first-red-appearance',order:make(red)},
    {name:'source-last-red-appearance',order:make(red.slice().reverse())},
    {name:'source-longest-red51-first',order:make([...longest.content,...red])},
    {name:'source-red-frequency-rank',order:counts.sort(
      (a,b)=>b.count-a.count||a.i-b.i).map(x=>x.i)}
  ];
  for(const {order} of list){
    assert.equal(order.length,N);
    assert.equal(new Set(order).size,N);
  }
  return list;
}

/** @param {number[]} order 0..28 canonical rune ids sorted by cyclic key rank */
function inverseOrder(order){
  const rank=Array(N);
  for(let i=0;i<N;i++)rank[order[i]]=i;
  return rank;
}

/** @param {number[]} cipher @param {number} start @param {number[]} ranks */
function packetValue(cipher,start,ranks){
  let number=0n;
  for(let i=start;i<start+PERIOD;i++){
    const before=cipher[i-1],after=cipher[i];
    assert.notEqual(before,after);
    const digit=(ranks[after]-ranks[before]+N-1)%N;
    assert(digit>=0&&digit<28);
    number=number*28n+BigInt(digit);
  }
  return number;
}

/** @param {number[]} plain @param {number} predecessor @param {number[]} order */
function pack(plain,predecessor,order){
  assert.equal(plain.length,PLAIN);
  const rank=inverseOrder(order);
  let value=0n;
  for(const rune of plain) value=value*29n+BigInt(rune);
  assert(value<MAX);
  const digits=Array(PERIOD).fill(0);
  for(let i=PERIOD-1;i>=0;i--){
    digits[i]=Number(value%28n);
    value/=28n;
  }
  assert.equal(value,0n);
  let prev=predecessor;
  return digits.map(digit=>{
    const cur=order[(rank[prev]+digit+1)%N];
    assert.notEqual(cur,prev);
    prev=cur;
    return cur;
  });
}

/** @param {bigint} value */
function unpack(value){
  assert(value>=0n&&value<MAX);
  const plain=Array(PLAIN).fill(0);
  for(let i=PLAIN-1;i>=0;i--){
    plain[i]=Number(value%29n);
    value/=29n;
  }
  assert.equal(value,0n);
  return plain;
}

function main(){
  const c=load('resources/liber-primus/lp2-corpus.json').pages
    .filter(p=>p.page<56).flatMap(p=>p.indices);
  const starts=cleanStarts(c,35);
  assert.equal(c.length,12956);
  assert.equal(starts.length,95);
  const orders=sourceOrders();
  const src=encode(fs.readFileSync(path.join(ROOT,
    'resources/control/shakespeare_first300k.txt'),'utf8'));
  const trueOrder=orders[0].order;
  let prev=0,roundTripped=0;
  for(let j=0;j<12;j++){
    const plain=src.slice(j*PLAIN,(j+1)*PLAIN);
    assert.equal(plain.length,PLAIN);
    const encoded=pack(plain,prev,trueOrder);
    const recovered=packetValue([prev,...encoded],1,inverseOrder(trueOrder));
    assert.deepEqual(unpack(recovered),plain);
    roundTripped+=encoded.length;
    prev=encoded.at(-1);
  }
  const records=orders.map(({name,order})=>{
    const rank=inverseOrder(order);
    let valid=0,invalid=0,leadingValid=0;
    for(const st of starts){
      const v=packetValue(c,st,rank);
      if(v<MAX)valid++;else invalid++;
      const d=(rank[c[st]]-rank[c[st-1]]+28)%29;
      if(d<=15)leadingValid++;
    }
    return {name,valid,invalid,leadingValid,
      keyCanonicalOrdinalSequence:order};
  });
  assert(records.every(r=>r.invalid>0),'All source orders must face original falsifier');
  const page53=load('resources/liber-primus/lp2-corpus.json').pages;
  let position=0;
  for(const p of page53){if(p.page===53)break;if(p.page<56)position+=p.indices.length;}
  assert.equal(position,12469);
  const redBegin=position+128;
  assert.equal(redBegin,12597);
  assert.equal((redBegin-1)%PERIOD,35);
  const repeatedPositions=[];
  for(let i=redBegin-1;i<redBegin-1+PERIOD;i++)
    if(c[i]===c[i-1])repeatedPositions.push(i);
  assert.deepEqual(repeatedPositions,[12668]);
  console.log(JSON.stringify({
    source:'original 55 rune-bearing LP2 physical pages, red ink originals',
    model:'78x base29 to 79x base28, predecessor-excluding 29 cyclic order',
    sourcePhaseAnchor:{redSpanPhysicalPage:53,redStartLocal:128,
      globalStart:redBegin,impliedPhase:(redBegin-1)%PERIOD,
      redLength:51,repeatedPositionsInAnchorPacket:repeatedPositions},
    actual:{phase:35,cleanPackets:starts.length,
      allRedSourceOnlyKeyOrders:records},
    planted:{nativeGpRunes:12*PLAIN,outputRunes:roundTripped,
      exactDecodedRuneAccuracy:1,originalOrderCorrect:true},
    inference:'None of the four deterministic red-source orders inverts all 95 clean packets; no original plaintext or secret key recovered.'
  },null,2));
}

if(require.main===module)main();
module.exports={sourceOrders,pack,unpack,packetValue,main};
