/** GP29 red polynomial Q -> signed 2016 word-length cross-lock.
 * Exact original source inputs, all 841 field multipliers, solved controls.
 * Node22 CommonJS; no unknown plaintext claimed.
 */
'use strict';
const A=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const load=p=>JSON.parse(read(p));
const corpus=load('resources/liber-primus/lp2-corpus.json');
const ink=load('resources/liber-primus/lp2-ink-annotations.json');
const signed=read('resources/historical/cicada2016-4gq25-outguess.asc');
const {encodeSourceNativeGP:gp}=require('./lp2_native_gp_source_orthography_sft.cjs');
const mod=x=>(x%29+29)%29;
const mul=(u,v)=>[mod(u[0]*v[0]+8*u[1]*v[1]),mod(u[0]*v[1]+u[1]*v[0]+3*u[1]*v[1])];
const page=n=>corpus.pages[n];
const span=(n,start)=>{
  const item=ink.pages.find(p=>p.page===n)?.red_spans?.find(s=>s.start===start);
  A.ok(item);const ix=page(n).indices.slice(start,start+item.length);
  A.equal(ix.length,item.length);A.equal(ix.map(i=>corpus.runes[i]).join(''),item.runes);
  return {n,start,len:item.length,ix};
};
const f=span(3,119).ix;A.deepEqual(f,[13,23,2]);A.deepEqual([mod(-23*15),mod(-13*15)],[3,8]);
const p15=span(15,9).ix,p57=span(57,0).ix;
const rem=Array.from({length:11},(_,i)=>mod(p15[i]-(p57[i]||0)));
const key=Array(9).fill(0);
for(let i=8;i>=0;i--){const v=mod(15*rem[i+2]);key[i]=v;for(let j=0;j<3;j++)rem[i+j]=mod(rem[i+j]-v*f[j]);}
A.ok(rem.every(x=>x===0));A.deepEqual(key,[5,5,14,9,10,4,27,17,25]);
const evalPoly=ix=>{let pow=[1,0],sum=[0,0];for(const x of ix){sum=[mod(sum[0]+x*pow[0]),mod(sum[1]+x*pow[1])];pow=mul(pow,[0,1]);}return sum;};
const Q=evalPoly(key);A.deepEqual(Q,[17,24]);
const start=signed.indexOf('\n\nHello.'),end=signed.indexOf('\n-----BEGIN PGP SIGNATURE-----');
A.ok(start>0&&end>start);
const words=signed.slice(start,end).replace(/\b3301\b/g,'').replace(/\b7A35090F\b/g,'').match(/[A-Za-z]+/g)||[];
A.equal(words.length,43);A.deepEqual([words[0],words[1],words[2],words[17],words[18],words[20],words[23],words[24]],['Hello','The','path','the','map','meaning','road','and']);
const lengths=words.slice(0,29).map(x=>gp(x).length);
A.deepEqual(lengths,[5,2,3,4,5,8,5,2,7,5,6,2,2,3,3,5,3,2,3,4,4,2,2,4,3,4,7,3,2]);
const records=ink.pages.flatMap(p=>(p.red_spans||[]).map(s=>{
  const obj=span(p.page,s.start);return {tag:`p${p.page}@${s.start}`,len:obj.len,E:evalPoly(obj.ix)};
}));
A.equal(records.length,18);
const by=tag=>{const x=records.find(r=>r.tag===tag);A.ok(x);return x;};
const readout=(k,rec)=>{const z=mul(k,rec.E);return {pair:z,labels:z.map(i=>words[i]),word_rune_len:lengths[z[0]]+lengths[z[1]]};};
const typed=[
  ['p40@0',8,['the','Primus']],
  ['p54@0',9,['Hello','meaning']],
  ['p56@0',5,['The','path']],
  ['p57@0',7,['is','Liber']]
];
for(const [tag,n,w] of typed){const z=readout(Q,by(tag));A.equal(by(tag).len,n);A.equal(z.word_rune_len,n);A.deepEqual(z.labels,w);}
const chain=[['p15@0','p15@9',11,['road','devoted']],['p15@9','p57@0',7,['is','Liber']]];
for(const [a,b,n,w] of chain){const z=readout(Q,by(a));A.equal(z.word_rune_len,n);A.equal(by(b).len,n);A.deepEqual(z.labels,w);}
A.deepEqual(by('p15@9').E,by('p57@0').E);
A.deepEqual(gp('AN END'),[24,9,18,9,23]);
A.deepEqual(gp('PARABLE'),span(57,0).ix);
A.notDeepEqual(gp('THE PATH'),gp('AN END'));
A.notDeepEqual(gp('IS LIBER'),gp('PARABLE'));
const hist=Array(19).fill(0),survivors=[];
for(let a=0;a<29;a++)for(let b=0;b<29;b++){
  const k=[a,b];let n=0;
  for(const rec of records)if(readout(k,rec).word_rune_len===rec.len)n++;
  hist[n]++;
  if(typed.every(([tag,len])=>readout(k,by(tag)).word_rune_len===len))survivors.push(k);
}
A.deepEqual(hist.slice(0,7),[256,352,173,45,12,3,0]);
A.ok(hist.slice(7).every(x=>x===0));
A.deepEqual(survivors,[[17,24]]);
A.deepEqual(records.filter(x=>readout(Q,x).word_rune_len===x.len).map(x=>x.tag),typed.map(x=>x[0]));
// Exact counterfactual signed-word rearrangement control, retaining the
// FOUR independently read matrix-word slots THE MAP AND PATH at their
// authenticated indices 17,18,24,2 and the 25 other original word lengths.
// This conditions the prior Q-matrix observation, NOT a discovery p-value.
// For uniformly random permutations of 25 remaining distinguishable words,
// count the exact constraints on eight distinct other signed-word slots:
//   self p40: L10=6;  p56: L1=2;  p54: L0+L20=9;
//   self p57: L21+L9=7;  p15 first->second: L23+L8=11.
const pinned=new Set([17,18,24,2]);
const available=Array(9).fill(0);
for(let j=0;j<29;j++)if(!pinned.has(j))available[lengths[j]]++;
A.equal(available.reduce((a,b)=>a+b,0),25);
A.deepEqual(available,[0,0,7,4,5,5,1,2,1]);
const falling=n=>{
  let z=1n;for(let j=0;j<n;j++)z*=BigInt(25-j);return z;
};
function favorable(conditions,counts=available){
  if(!conditions.length)return 1n;
  const [first,...rest]=conditions, n=counts.reduce((a,b)=>a+b,0);
  if(typeof first==='number'){
    const possible=counts[first]||0;
    if(!possible)return 0n;
    const next=counts.slice();next[first]--;
    return BigInt(possible)*favorable(rest,next);
  }
  let total=0n;
  for(let a=0;a<counts.length;a++){
    const b=first.sum-a;
    if(b<0||b>=counts.length)continue;
    const m=counts[a],v=counts[b]-(a===b?1:0);
    if(m<=0||v<=0)continue;
    const next=counts.slice();next[a]--;next[b]--;
    total+=BigInt(m*v)*favorable(rest,next);
  }
  return total;
}
const fourPattern=[6,2,{sum:9},{sum:7}];
const linkedPattern=[...fourPattern,{sum:11}];
const numeratorFour=favorable(fourPattern);
const numeratorLinked=favorable(linkedPattern);
const denominatorFour=falling(6),denominatorLinked=falling(8);
A.equal(numeratorFour*20700n,denominatorFour*7n);
A.equal(numeratorLinked*51300n,denominatorLinked);

// Q is a primitive element. However, its natural 840-state recurrence
// fails to continue the independently authenticated p56 prime clock.
let x=[1,0],order=0;for(let i=1;i<=840;i++){x=mul(x,Q);if(x[0]===1&&x[1]===0){order=i;break;}}
A.equal(order,840);A.deepEqual(mul(Q,[1,2]),[24,28]);A.notDeepEqual(mul(Q,[1,2]),[4,6]);
console.log(JSON.stringify({
 classification:'signed-word GP29 length pointer cross-lock, not plaintext recovery',
 triad:f,quotient:key,Q,order,sourceRedSpans:records.length,sourceSignedWords:words.length,
 selected:typed.map(([tag,n])=>({tag,original_len:n,...readout(Q,by(tag))})),
 chain:chain.map(([a,b,n])=>({from:a,to:b,receiver_len:n,...readout(Q,by(a))})),
 exhaustive841:{survivors,all18_self_histogram:hist,any_four_or_more:hist.slice(4).reduce((s,x)=>s+x,0)},
 knownPlaintextCounterexamples:{p56:'AN END',p57:'PARABLE',mappedWordsAreNotPlaintext:true},
 p56_Qrotor_second_pair:[24,28],p56_real_prime_second_pair:[4,6]
},null,2));
