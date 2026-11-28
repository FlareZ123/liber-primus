"use strict";
/**
 * P6 *source-side* two-difference selector for 2016 authenticated 13-word
 * tail, and its link to the original mirrored p30↔p42, p31↔p41 addresses.
 *
 * node sims/lp2_p6_13source_initials_outer_h_gate_sft.cjs
 * Uses original physical p6 word segmentation and the signed first-party
 * 2016 message; no unknown LP2 plaintext guesses or fitted cipher keys.
 */
const fs=require("node:fs"),path=require("node:path");
const assert=require("node:assert/strict");
const read=p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8").replace(/\r/g,"");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const trans=read("resources/liber-primus/lp2-transcription.txt");
const parts=trans.split(/^\s*%\s*$/m);
const original=read("resources/historical/cicada2016-4gq25-outguess.asc");
const G=new Map(corpus.runes.map((r,i)=>[r,i]));
const T=new Map(corpus.translit.map((r,i)=>[r,i]));
const mod=x=>((x%29)+29)%29;
const H4=x=>[mod(x[0]-x[3]),mod(x[1]-x[2]),
             mod(x[1]+x[2]),mod(x[0]+x[3])];
function p6Words(){
  const words=[]; let start=0,at=0,vals=[];
  function flush(){
    if(vals.length){words.push({start,values:vals});vals=[];}
  }
  for(const char of parts[6]){
    const n=G.get(char);
    if(n!==undefined){
      if(!vals.length)start=at;
      vals.push(n);at++;
    } else if(!/[\s/]/u.test(char))flush();
  }
  flush();
  assert.equal(at,corpus.pages[6].indices.length);
  return words;
}
const p6=p6Words();
const W=[71,75,76,80].map(at=>p6.find(w=>w.start===at).values);
assert.deepEqual(W,[
  [24,16,14,17],[19],[6,27,15,17],[14,12]
]);
const L=W.map(w=>w.length),state=H4(L);
const K=state[0],e=mod(-state[1]),g=state[2],a=state[3],
      u=W[3][1],q=L[0];
assert.deepEqual({L,state,K,e,g,a,u,q},
  {L:[4,1,4,2],state:[2,26,5,6],
   K:2,e:3,g:5,a:6,u:12,q:4});
const residuePacket=[u,mod(-a)];
assert.deepEqual(residuePacket,[12,23]);

const signedText=original.slice(original.indexOf("Hello."))
                         .split("-----BEGIN PGP SIGNATURE-----")[0];
const signedWords=signedText.split(/[^A-Za-z0-9]+/u)
                            .filter(w=>/^[A-Za-z]+$/u.test(w));
assert.equal(signedWords.length,43);
function firstRune(word){
  const s=word.toUpperCase().replace(/QU/g,"CW")
               .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const tokens=corpus.translit.filter(token=>s.startsWith(token))
                  .sort((a,b)=>b.length-a.length);
  assert.ok(tokens.length);
  return T.get(tokens[0]);
}
const initials=signedWords.map(firstRune);
const candidates=[];
for(let start=0;start+13<=signedWords.length;start++){
  const pack=initials.slice(start,start+13);
  // Outside-in differences: first/last, second/penultimate.
  const diff=[mod(pack[0]-pack[12]),mod(pack[1]-pack[11])];
  const sum =[mod(pack[0]+pack[12]),mod(pack[1]+pack[11])];
  candidates.push({start,diff,sum});
}
assert.equal(candidates.length,31);
const hits=candidates.filter(x=>x.diff.join(",")===residuePacket.join(","));
assert.deepEqual(hits,[{start:30,diff:[12,23],sum:[18,25]}]);
const named=signedWords.slice(30,43).map(w=>w.toUpperCase());
assert.deepEqual(named,[
  "SEEK","AND","YOU","WILL","BE","FOUND","GOOD",
  "LUCK","BEWARE","FALSE","PATHS","VERIFY","OPENPGP"
]);
assert.deepEqual(initials.slice(30,43),[
  15,24,26,7,17,0,6,20,17,0,13,1,3
]);
const h4outer=H4([initials[30],initials[31],
                   initials[41],initials[42]]);
assert.deepEqual(h4outer,[12,23,25,18]);
assert.deepEqual(h4outer.slice(0,2),residuePacket);

// Opposing first-party source and original p6 numbers now independently
// compute exactly the same outer-K mirror-address residue differences.
const balanced=x=>{const z=mod(x);return z>14?z-29:z;};
const Qouter=[e,K],balancedResidual=residuePacket.map(balanced);
assert.deepEqual(balancedResidual,[12,-6]);
const delta=Qouter.map((q,i)=>29*q+balancedResidual[i]);
assert.deepEqual(delta,[99,52]);
const originalReceiverPairs=[[112,211],[126,178]];
assert.deepEqual(originalReceiverPairs.map(pair=>pair[1]-pair[0]),delta);
// Independently signed 2016 initials BE and BEWARE (mirror pages 34/38)
// have equal GP initial B=17, Hpair(17,17)=[F,g]=[0,5].
const tail=initials.slice(30,43);
const centralMirror=[mod(tail[4]-tail[8]),mod(tail[4]+tail[8])];
assert.deepEqual(centralMirror,[0,5]);
const projected=[residuePacket[0],residuePacket[1],residuePacket[0],
                 centralMirror[0],mod(-centralMirror[1]),centralMirror[1]];
const signedProjected=projected.map(balanced);
assert.deepEqual(signedProjected,[u,-a,u,0,-g,g]);
const sixQuotient=[e,K,1,0,K,q];
const sixDelta=sixQuotient.map((v,i)=>29*v+signedProjected[i]);
assert.deepEqual(sixDelta,[99,52,41,0,53,121]);

// Charge obvious p6 field choices: either W4 rune, either sign,
// any signed H4(width) coordinate, and either pair order, deduped.
const charged=new Map();
for(const redRune of W[3])for(const redSign of [1,-1])
for(const z of state)for(const hSign of [1,-1])
for(const flip of [false,true]){
  const values=flip?[mod(hSign*z),mod(redSign*redRune)]
                   :[mod(redSign*redRune),mod(hSign*z)];
  charged.set(values.join(","),values);
}
assert.equal(charged.size,64);
let matches=[],numericalIds=new Set();
for(const c of candidates){
  if(charged.has(c.diff.join(","))){
    matches.push({start:c.start,diff:c.diff});
    numericalIds.add(c.diff.join(","));
  }
}
assert.deepEqual(matches,[
  {start:13,diff:[5,15]},
  {start:22,diff:[14,26]},
  {start:27,diff:[24,14]},
  {start:30,diff:[12,23]}
]);
assert.equal(numericalIds.size,4);
console.log(JSON.stringify({
  status:"PASS",
  p6:{lengths:L,state,W4:W[3],u,negativeA:mod(-a),
      selectedResidual:residuePacket},
  source:{numberOfSignedWords:signedWords.length,
    windows:candidates.length,selectedStart:hits[0].start,
    selectedWords:named,initials:initials.slice(30,43),
    outerH4:h4outer},
  link:{Qouter,sourceOnlyResidual:residuePacket,balancedResidual,
    delta,centralMirror,signedProjected,sixQuotient,sixDelta,
    mirroredOriginalAddressPairs:originalReceiverPairs},
  conditionalFieldCharge:{distinctVectors:charged.size,
    windowsSelected:matches.length,matches},
  caveat:"The p6 field-order recipe was recognized after signed tail identified; no unknown LP2 plaintext or rune-by-rune key recovered"
},null,2));
