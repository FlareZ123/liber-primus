#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const load=p=>fs.readFileSync(path.join(root,p),'utf8');
const c=JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const q=JSON.parse(load('resources/liber-primus/lp2-quote-punctuation-spans.json'));
const g=JSON.parse(load('resources/liber-primus/lp2-p55-source-glyph-coordinates.json'));
const master=load('resources/transcriptions/liber_primus_master.txt');
const html=load('resources/cicada2014-onion7-index.html');
const ri=new Map(c.runes.map((r,i)=>[r,i]));
const mod=n=>((n%29)+29)%29;
const compact=a=>a.map(i=>c.translit[i]).join('');
const tokens=a=>a.map(i=>c.translit[i]).join(' ');
const sub=(a,k)=>a.map((x,i)=>mod(x-k[i%k.length]));
const add=(a,k)=>a.map((x,i)=>mod(x+k[i%k.length]));
assert.equal(Number(html.match(/<title>(\d+)<\/title>/)?.[1]),133);
assert.deepEqual([...html.matchAll(/<img src="(\d+)\.jpg"/g)].map(m=>+m[1]),Array.from({length:58},(_,i)=>i));
const unknown=c.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(unknown.length,12956);
const prefix=[0];for(const x of unknown)prefix.push(prefix[prefix.length-1]+c.prime[x]);
const sums=q.quotes.map(x=>prefix[x.end]-prefix[x.start]);
assert.deepEqual(sums,[948,1105,738,2684,3335,8042,3388]);
const addresses=sums.map(s=>({scan:s%133,ordinal:Math.floor(s/133)}));
assert.deepEqual(addresses.map(a=>[a.scan,a.ordinal]),[[17,7],[41,8],[73,5],[24,20],[10,25],[62,60],[63,25]]);

// Parse combined archive scans. The leading metadata segment is scan slot zero;
// '%' advances scan; slash and whitespace are layout, not word boundaries.
const scanCount=master.split('%').length;assert.equal(scanCount,75);
const byScan=Array.from({length:scanCount},()=>[]),all=[],pageRunes=Array.from({length:scanCount},()=>[]);
let scan=0,cur=[],start=0,parts=[];
function finish(){
 if(!cur.length)return;
 const w={indices:cur,startScan:start,endScan:parts.at(-1).scan,parts};
 byScan[start].push(w);all.push(w);cur=[];parts=[];
}
for(const ch of master){
 if(ri.has(ch)){
  if(!cur.length)start=scan;
  const x=ri.get(ch),off=pageRunes[scan].length;cur.push(x);pageRunes[scan].push(x);
  let p=parts.at(-1);if(!p||p.scan!==scan){p={scan,offsets:[]};parts.push(p);}p.offsets.push(off);
 }else if(ch==='%')scan++;
 else if(ch==='/'||/\s/u.test(ch)){}
 else finish();
}
finish();
assert.equal(byScan[9].length,40);assert.equal(compact(byScan[9][25].indices),'TWO');
assert.equal(byScan[72].length,25);assert.equal(compact(byScan[72][5].indices),'WLAE');
const selected=addresses.map(a=>{const w=byScan[a.scan-1][a.ordinal];assert(w);return{scan:a.scan,word:a.ordinal+1,indices:w.indices,text:compact(w.indices)};});
const key=selected.flatMap(x=>x.indices);assert.equal(key.length,33);
assert.deepEqual(key,[8,17,9,27,6,20,0,15,8,7,20,25,5,8,22,28,9,13,5,2,16,7,3,5,11,18,16,1,8,13,5,2,15]);

// Combined scan 72 is physical LP2 p55. Confirm every rune against both
// the canonical corpus and the original-image coordinate transcription.
const pageIndex=71,p55=c.pages.find(p=>p.page===55);
assert.equal(p55.indices.length,76);
assert.deepEqual(pageRunes[pageIndex],p55.indices);
assert.deepEqual(g.glyphs.map(x=>x.gp29_index),p55.indices);
const touching=all.filter(w=>w.parts.some(p=>p.scan===pageIndex));
assert.equal(touching.length,17);
assert.equal(touching.filter(w=>w.startScan===pageIndex).length,16);
const edge=[],inner=[],edgePos=[],innerPos=[];
for(const w of touching){
 const p=w.parts.find(x=>x.scan===pageIndex),v=p.offsets.map(i=>pageRunes[pageIndex][i]);
 if(w.startScan<pageIndex){assert.equal(v.length,1);edge.push(v[0]);edgePos.push(p.offsets[0]);}
 else{
  assert.equal(w.startScan,pageIndex);assert(v.length>=2);
  edge.push(v[0],v.at(-1));edgePos.push(p.offsets[0],p.offsets.at(-1));
  inner.push(...v.slice(1,-1));innerPos.push(...p.offsets.slice(1,-1));
 }
}
assert.equal(edge.length,33);assert.equal(inner.length,43);
assert.deepEqual(edgePos.concat(innerPos).sort((a,b)=>a-b),Array.from({length:76},(_,i)=>i));
assert.deepEqual(edge,[21,25,7,15,17,14,19,15,25,0,1,7,4,17,12,19,0,17,5,12,18,28,15,18,15,2,22,5,14,23,1,17,10]);

const planted=Array.from({length:43},(_,i)=>(i*7+11)%29);
assert.deepEqual(sub(add(planted,key),key),planted);
const edgeMinus=sub(edge,key),quoteMinus=sub(key,edge),edgePlus=add(edge,key);
const innerMinus=sub(inner,key),quoteMinusInner=sub(key,inner),innerPlus=add(inner,key);
const primeKey=key.map(i=>mod(c.prime[i])),phiKey=key.map(i=>mod(c.prime[i]-1));
const edgePrime=sub(edge,primeKey),edgePhi=sub(edge,phiKey);
const innerPrime=sub(inner,primeKey),innerPhi=sub(inner,phiKey);
const xor=edge.map((x,i)=>x^key[i]);
const xorInvalid=xor.map((x,i)=>x>=29?{position:i,value:x}:null).filter(Boolean);
assert.deepEqual(xorInvalid,[{position:0,value:29},{position:11,value:30}]);
console.log(JSON.stringify({
 addresses:selected.map(x=>({scan:x.scan,word:x.word,text:x.text,indices:x.indices})),
 quote_key:tokens(key),quote_key_indices:key,
 p55:{runes:76,exterior:tokens(edge),exterior_indices:edge,exterior_positions:edgePos,
      interior:tokens(inner),interior_indices:inner,interior_positions:innerPos},
 tests:{
  exterior_minus_quote:tokens(edgeMinus),quote_minus_exterior:tokens(quoteMinus),exterior_plus_quote:tokens(edgePlus),
  interior_minus_repeating_quote:tokens(innerMinus),quote_minus_repeating_interior:tokens(quoteMinusInner),
  interior_plus_repeating_quote:tokens(innerPlus),exterior_minus_prime_key:tokens(edgePrime),
  exterior_minus_totient_key:tokens(edgePhi),interior_minus_repeating_prime_key:tokens(innerPrime),
  interior_minus_repeating_totient_key:tokens(innerPhi),five_bit_xor:xor,invalid_xor_values:xorInvalid
 },
 checks:{title133:true,all_addresses:true,p55_corpus_coordinate_match:true,edge_inner_partition:true,planted_roundtrip:true}
},null,2));
