'use strict';

// Agent11 post-freeze grader for the q-block sum-projection experiments.
// The two pretarget output files were committed before this grader.

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r/g,'');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const signed=read('resources/historical/cicada2016-4gq25-outguess.asc');
const base=JSON.parse(read('im-results/lp2-p6-qblocks-pretarget-output.json'));
const uniform=JSON.parse(read('im-results/lp2-p6-qblocks-sum-projected-pretarget-output.json'));
const outer=JSON.parse(read('im-results/lp2-p6-qblocks-outerH-sum-projected-pretarget-output.json'));
const mod29=x=>((x%29)+29)%29;

const gpTokens=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
function gp(word){
 const n=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/[^A-Z]/g,'');
 const out=[];
 for(let i=0;i<n.length;){
  if(n.startsWith('ING',i)){out.push(21);i+=3;continue;}
  if(n.startsWith('IO',i)){out.push(27);i+=2;continue;}
  const t=gpTokens.find(x=>n.startsWith(x.symbol,i));assert.ok(t,'unmapped '+n.slice(i));out.push(t.value);i+=t.symbol.length;
 }
 return out;
}

const clear=signed.split('-----BEGIN PGP SIGNATURE-----')[0].slice(signed.indexOf('Hello.'));
const words=clear.split(/[^A-Za-z0-9]+/u).filter(x=>/^[A-Za-z]+$/u.test(x));
assert.equal(words.length,43);
assert.deepEqual(words.slice(32,43).map(x=>x.toUpperCase()),['YOU','WILL','BE','FOUND','GOOD','LUCK','BEWARE','FALSE','PATHS','VERIFY','OPENPGP']);
const targets={q1:words.slice(32,36).map(gp),q3:words.slice(37,41).map(gp)};
const sigma={q1:[4,0,0,25],q3:[7,0,28,0]};

function baseSumCompatibility(data){
 return data.candidates.map(c=>{
  let lanes=0; const sums={};
  for(const b of c.blocks){
   sums[b.name]=b.receivers.map((r,slot)=>{const z=r.key.reduce((a,x)=>mod29(a+x),0);if(z===sigma[b.name][slot])lanes++;return z;});
  }
  return {encoding:c.encoding,sign:c.sign,clock:c.clock,lanes,sums};
 }).sort((a,b)=>b.lanes-a.lanes);
}

function grade(data){
 const rows=data.candidates.map(c=>{
  let runeHits=0,wordHits=0,total=0;
  for(const b of c.blocks)for(let slot=0;slot<4;slot++){
   const P=targets[b.name][slot],got=b.receivers[slot].decoded;
   assert.equal(got.length,P.length);
   const hits=got.reduce((n,x,j)=>n+(x===P[j]),0);
   runeHits+=hits; total+=P.length; wordHits+=Number(hits===P.length);
   assert.equal(b.receivers[slot].keySum,sigma[b.name][slot]);
  }
  return {encoding:c.encoding,sign:c.sign,clock:c.clock,runeHits,wordHits,total};
 }).sort((a,b)=>b.runeHits-a.runeHits||b.wordHits-a.wordHits);
 const hist={};for(const r of rows)hist[r.runeHits]=(hist[r.runeHits]||0)+1;
 return {rows,hist,maxRuneHits:rows[0].runeHits,maxWordHits:Math.max(...rows.map(r=>r.wordHits)),totalRunes:rows[0].total};
}

const raw=baseSumCompatibility(base);
assert.equal(raw[0].lanes,1);
assert.equal(raw.filter(x=>x.lanes===1).length,4);
assert.equal(raw.filter(x=>x.lanes===0).length,14);

const u=grade(uniform),o=grade(outer);
assert.equal(uniform.distinctCompleteKeys,13);
assert.equal(outer.distinctCompleteKeys,18);
assert.deepEqual({maxRuneHits:u.maxRuneHits,maxWordHits:u.maxWordHits,totalRunes:u.totalRunes},{maxRuneHits:3,maxWordHits:0,totalRunes:33});
assert.deepEqual({maxRuneHits:o.maxRuneHits,maxWordHits:o.maxWordHits,totalRunes:o.totalRunes},{maxRuneHits:3,maxWordHits:0,totalRunes:33});

console.log(JSON.stringify({
 status:'PASS',
 rawBaseFamily:{candidates:18,maxMatchingSumLanes:raw[0].lanes,candidatesAtMax:raw.filter(x=>x.lanes===raw[0].lanes).length,top:raw.slice(0,6)},
 uniformProjection:{distinctCompleteKeys:uniform.distinctCompleteKeys,maxRuneHits:u.maxRuneHits,maxWordHits:u.maxWordHits,hist:u.hist,best:u.rows.slice(0,5)},
 outerHSumProjection:{distinctCompleteKeys:outer.distinctCompleteKeys,maxRuneHits:o.maxRuneHits,maxWordHits:o.maxWordHits,hist:o.hist,best:o.rows.slice(0,5)},
 decision:'Reject the 18-member p6 q-block base family and its two canonical scalar sum repairs as complete ordered decoders for the frozen q-block corridor.'
},null,2));
