#!/usr/bin/env node
'use strict';
/*
 * Director #3460 — finite source-licensed Q-presentation charge.
 * P3/p15/p57 source quotient is recomputed. No unknown LP2 ciphertext is graded.
 * A native solved title's LENGTH is a typed control; mapped words are not plaintext.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const signed=read('resources/historical/cicada2016-4gq25-outguess.asc');
const before=signed.indexOf('\n\nHello.'),after=signed.indexOf('\n-----BEGIN PGP SIGNATURE-----');
assert(before>=0&&after>before);
const words=signed.slice(before,after).replace(/\b3301\b/g,'')
 .replace(/\b7A35090F\b/g,'').match(/[A-Za-z]+/g);
assert.equal(words.length,43);
assert.deepEqual([0,1,2,17,18,23,24,29].map(i=>words[i].toUpperCase()),
 ['HELLO','THE','PATH','THE','MAP','ROAD','AND','DIRECTION']);
const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function gpWord(word){
 const s=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
  .replace(/[KQ]/g,'C').replace(/Z/g,'S');
 const out=[];
 for(let i=0;i<s.length;){
  if(s.startsWith('ING',i)){out.push(21);i+=3;continue;}
  if(s.startsWith('IO',i)){out.push(27);i+=2;continue;}
  const t=tokens.find(t=>s.startsWith(t.s,i));
  assert(t,'unmapped GP source spelling '+s.slice(i));
  out.push(t.i);i+=t.s.length;
 }
 return out;
}
const lengths=words.map(w=>gpWord(w).length);
assert.deepEqual(lengths.slice(0,29),
 [5,2,3,4,5,8,5,2,7,5,6,2,2,3,3,5,3,2,3,4,4,2,2,4,3,4,7,3,2]);
const P=29,mod=x=>(x%P+P)%P;
const mul=(a,b)=>[mod(a[0]*b[0]+8*a[1]*b[1]),
 mod(a[0]*b[1]+a[1]*b[0]+3*a[1]*b[1])];
const red=ink.pages.flatMap(page=>(page.red_spans||[]).map(span=>{
 const original=corpus.pages.find(p=>p.page===page.page).indices.slice(span.start,span.start+span.length);
 assert.equal(original.length,span.length);
 assert.equal(original.map(i=>corpus.runes[i]).join(''),span.runes);
 return {tag:'p'+page.page+'@'+span.start,length:span.length,indices:original};
}));
assert.equal(red.length,18);
const by=tag=>{const r=red.find(x=>x.tag===tag);assert(r,'red span not found '+tag);return r;};
function evalPoly(arr){
 let p=[1,0],sum=[0,0];
 for(const coeff of arr){sum=[mod(sum[0]+coeff*p[0]),mod(sum[1]+coeff*p[1])];p=mul(p,[0,1]);}
 return sum;
}
const triad=by('p3@119').indices;
assert.deepEqual(triad,[13,23,2]);
const arr15=by('p15@9').indices,arr57=by('p57@0').indices;
assert.deepEqual([arr15.length,arr57.length],[11,7]);
const diff=Array.from({length:11},(_,i)=>mod(arr15[i]-(arr57[i]||0)));
const rest=diff.slice(),quotient=Array(9).fill(0);
for(let i=8;i>=0;i--){
 const v=mod(15*rest[i+2]);quotient[i]=v;
 for(let j=0;j<3;j++)rest[i+j]=mod(rest[i+j]-v*triad[j]);
}
assert(rest.every(x=>x===0));
assert.deepEqual(quotient,[5,5,14,9,10,4,27,17,25]);
const Q=evalPoly(quotient);
assert.deepEqual(Q,[17,24]);
const conj=x=>[mod(x[0]+3*x[1]),mod(-x[1])];
const inv=x=>conj(x).map(z=>mod(11*z)); // N(Q)=8, inv(8)=11 mod 29
assert.deepEqual(mul(Q,inv(Q)),[1,0]);
const variants=[
 ['Q',Q],['FQ',conj(Q)],['Qinv',inv(Q)],['FQinv',conj(inv(Q))]
];
const mat=x=>[[x[0],mod(8*x[1])],[x[1],mod(x[0]+3*x[1])]];
const convertIndex=(v,origin,reverse)=>{
 const k=origin===0?v:v-1;
 if(k<0||k>=words.length)return null;
 return reverse?(words.length-1-k):k;
};
const matrixValues=(x,reading)=>{
 const m=mat(x);
 return reading==='row'?m.flat():[m[0][0],m[1][0],m[0][1],m[1][1]];
};
const controls=[
 ['p54@0',9,'unresolved red heading, length only'],
 ['p56@0',5,'solved AN END, only length'],
 ['p57@0',7,'solved PARABLE, used in Q construction'],
 ['p15@0',11,'p15 second-red length']
];
const withheld=[
 ['p40@0',8,'p40 heading, later source-typed length']
];
function typeMatch(k,tag,target,origin,reverse){
 const position=mul(k,evalPoly(by(tag).indices))
  .map(v=>convertIndex(v,origin,reverse));
 return position.every(i=>i!==null) && position.reduce((s,i)=>s+lengths[i],0)===target;
}
const table=[];
for(const [variant,k] of variants)
 for(const reading of ['row','column'])
  for(const origin of [0,1])
   for(const reverse of [false,true]){
    const cols=matrixValues(k,reading);
    const ix=cols.map(v=>convertIndex(v,origin,reverse));
    const phrase=ix.map(i=>i===null?'[UNDEFINED]':words[i].toUpperCase()).join(' ');
    const locked=controls.map(([tag,n])=>typeMatch(k,tag,n,origin,reverse));
    const held=withheld.map(([tag,n])=>typeMatch(k,tag,n,origin,reverse));
    table.push({variant,reading,origin,reverse,source_word_indices:cols,
     phrase,locked_pass:locked,locked_count:locked.filter(Boolean).length,
     withheld_pass:held});
   }
assert.equal(table.length,32);
const phraseHit=table.filter(p=>p.phrase==='THE MAP AND PATH');
assert.deepEqual(phraseHit.map(p=>[p.variant,p.reading,p.origin,p.reverse]),
 [['Q','row',0,false]]);
const strong=table.filter(p=>p.locked_count===4);
assert.deepEqual(strong.map(p=>[p.variant,p.reading,p.origin,p.reverse]),
 [['Q','row',0,false],['Q','column',0,false]]);
assert(strong.every(x=>x.withheld_pass[0]));
const sourceQReadout=[['p54@0',[0,20]],['p56@0',[1,2]],
 ['p57@0',[21,9]],['p40@0',[17,10]],['p15@0',[23,8]]];
for(const [tag,v] of sourceQReadout)
 assert.deepEqual(mul(Q,evalPoly(by(tag).indices)),v);
const solvedReadout={
 p56:{printed:'AN END',mapped:'THE PATH',
    exact_plaintext_match:gpWord('AN').concat(gpWord('END')).join(',')===
      gpWord('THE').concat(gpWord('PATH')).join(',')},
 p57:{printed:'PARABLE',mapped:'IS LIBER',
    exact_plaintext_match:gpWord('PARABLE').join(',')===
      gpWord('IS').concat(gpWord('LIBER')).join(',')}
};
assert.equal(solvedReadout.p56.exact_plaintext_match,false);
assert.equal(solvedReadout.p57.exact_plaintext_match,false);
// The Q walk / p50 ROAD / DH K edges below are withheld from Q presentation selection.
// Their original target values were published before this test; they are retrospective
// structural consistency checks, NOT genuinely blinded decryption positives.
const exponents={p7:603,p23:155,p39:516,p40:153,p56:121};
const powerFactors={Q:1,FQ:29,Qinv:-1,FQinv:-29};
const stage7Value=87,dhK=2;
const page57ToWord=val=>[Math.floor(val/29),val%29];
const navigation=variants.map(([variant])=>{
 const fac=powerFactors[variant];
 const logs=Object.fromEntries(Object.entries(exponents).map(([name,k])=>
  [name,mod840(k*fac)]));
 const forwardRoad=mod840(logs.p7-logs.p39)===stage7Value;
 const reverseRoad=mod840(logs.p39-logs.p7)===stage7Value;
 const forwardK=mod840(logs.p23-logs.p40)===dhK;
 const reverseK=mod840(logs.p40-logs.p23)===dhK;
 return {variant,exponent_lanes:{p39:page57ToWord(logs.p39),
  p7:page57ToWord(logs.p7),p40:page57ToWord(logs.p40),
  p23:page57ToWord(logs.p23),p56:page57ToWord(logs.p56)},
  ROAD87:{forward:forwardRoad,reverse:reverseRoad},
  DH_K2:{forward:forwardK,reverse:reverseK}};
});
function mod840(x){return (x%840+840)%840;}
assert(navigation.find(n=>n.variant==='Q').ROAD87.forward);
assert(navigation.find(n=>n.variant==='Q').DH_K2.forward);
assert(navigation.find(n=>n.variant==='Qinv').ROAD87.reverse);
assert(navigation.find(n=>n.variant==='Qinv').DH_K2.reverse);
assert(!navigation.find(n=>n.variant==='FQ').ROAD87.forward);
assert(!navigation.find(n=>n.variant==='FQ').DH_K2.forward);
const result={
 conclusion:'Q row-major, forward signed index0 isolates exact THE MAP AND PATH among 32; source-selected 2016-words receiver and LP2 key remain unproved',
 original_inputs:{triad,quotient,Q,word_count:words.length,red_span_count:red.length,
  p54_p56_p57_p15_controls:controls,withheld},
 model_family:{conjugation_and_direction:variants.map(([n,v])=>[n,v]),
  index_origin:[0,1],signed_word_readout:['forward','reversed'],
  matrix_read:['row','column'],size:table.length},
 all_presentations:table,
 control_summary:{exact_phrase_hits:phraseHit.length,
  locked_four_of_four:strong.length,unique_exact_phrase:phraseHit[0],
  source_native_p56_p57_contradiction:solvedReadout},
 withheld_navigation:navigation
};
console.log(JSON.stringify(result,null,2));
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),
 JSON.stringify(result,null,2)+'\n');
