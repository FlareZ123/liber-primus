"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(root,f),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-p0-physical-ink-override.json"));
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
function phi(n){let v=n,x=n;for(let p=2;p*p<=x;p++){if(x%p)continue;while(x%p===0)x/=p;v-=v/p}if(x>1)v-=v/x;return v}
const mod=n=>(n%29+29)%29,tr=n=>corpus.translit[n];
const grid=corpus.pages.filter(p=>p.page<=2).flatMap(p=>p.indices);assert.equal(grid.length,729);
const words=ink.physical_zero_based.red_words;assert.deepEqual(words.map(w=>w.length),[8,5]);
assert.deepEqual(words.flatMap(w=>w.gp_indices),grid.slice(0,13));
const mark=ink.physical_zero_based.large_punctuation[0];assert.deepEqual([mark.after_runes,mark.dots],[13,13]);
const at=([r,c])=>grid[(r-1)*27+c-1],anchor=[13,phi(13)];assert.deepEqual(anchor,[13,12]);assert.equal(tr(at(anchor)),"J");

// Source-only final-five derivation.
const chains=[];for(const rs of[-1,1])for(const cs of[-1,1]){const m=[13+5*rs,12+5*cs],e=[13+10*rs,12+10*cs];if([...m,...e].every(x=>x>=1&&x<=27)&&at(m)>0&&phi(at(m))===at(e))chains.push({m,e})}
assert.deepEqual(chains,[{m:[18,17],e:[23,22]}]);
const secondKey=[at(anchor),phi(at(chains[0].m)),at(chains[0].e)];
assert.deepEqual(secondKey.map(tr),["J","TH","TH"]);
const secondPlain=words[1].gp_indices.map((v,i)=>mod(v-secondKey[i%3]));
assert.equal(secondPlain.map(tr).join(""),"RATIO");
assert.deepEqual(secondPlain.map((v,i)=>mod(v+secondKey[i%3])),words[1].gp_indices);

// Original-JPEG census independently fixes the 13-dot mark as 4-5-4.
const markerColumns=[4,5,4],markerLadder=[markerColumns.length,markerColumns[0],markerColumns[1],markerColumns[0]+markerColumns[2],markerColumns.reduce((a,b)=>a+b,0)];
assert.deepEqual(markerLadder,[3,4,5,8,13]);
assert.deepEqual([secondKey.length,words[1].length,words[0].length,words[0].length+words[1].length],[3,5,8,13]);

// The symmetric mark plus source anchor motivates a bounded symmetry family:
// equal-rune diagonal endpoints at equal squared distance from J. Each pair
// defines one axis-aligned rectangle and therefore a 4-rune corner key.
const d2=([r,c])=>(r-anchor[0])**2+(c-anchor[1])**2,rects=[];
for(let t=1;t<=27;t++)for(let b=t+1;b<=27;b++)for(let l=1;l<=27;l++)for(let r=l+1;r<=27;r++){
 const pts=[[t,l],[t,r],[b,r],[b,l]],vals=pts.map(at),ds=pts.map(d2);
 for(const diag of[[0,2],[1,3]]){const[a,z]=diag;if(vals[a]===vals[z]&&ds[a]===ds[z])rects.push({t,b,l,r,vals,diag})}
}
assert.equal(rects.length,72);
const ratio3Rects=rects.filter(x=>{const h=x.b-x.t,w=x.r-x.l;return h===3*w||w===3*h});
assert.equal(ratio3Rects.length,9);

// Test the title-visible additive rule backward through key/plain sums.
// K2 sum15 and P2 sum57 are already fixed by the source-only final-five
// derivation, so a Fibonacci-style recurrence requires K1 sum42.
const sum=a=>a.reduce((x,y)=>x+y,0),sumK2=sum(secondKey),sumP2=sum(secondPlain),targetK1=sumP2-sumK2;
assert.deepEqual([sumK2,sumP2,targetK1],[15,57,42]);
const keyCandidates=rects.filter(x=>sum(x.vals)===targetK1);
assert.equal(keyCandidates.length,2);
assert.deepEqual(keyCandidates.map(x=>[x.t,x.b,x.l,x.r,...x.vals.map(tr)]),[
 [6,24,3,9,"X","N","X","C"],
 [9,14,5,20,"G","H","G","OE"]
]);
assert.ok(keyCandidates.every(x=>{const h=x.b-x.t,w=x.r-x.l;return h===3*w||w===3*h}));

// The next recurrence term requires P1 sum = K1 + P2 = 99.
// Exhaust all traversal starts/directions, ciphertext direction and sign.
const targetP1=targetK1+sumP2;assert.equal(targetP1,99);
const orders=[[0,1,2,3],[0,3,2,1],[1,2,3,0],[1,0,3,2],[2,3,0,1],[2,1,0,3],[3,0,1,2],[3,2,1,0]],hits=[];
for(let ki=0;ki<keyCandidates.length;ki++)for(const order of orders)for(const reverse of[false,true])for(const sign of[-1,1]){
 const key=order.map(i=>keyCandidates[ki].vals[i]),ct=reverse?[...words[0].gp_indices].reverse():words[0].gp_indices;
 const plain=ct.map((v,i)=>mod(v+sign*key[i%4]));
 if(sum(plain)===targetP1)hits.push({ki,key,reverse,sign,plain,text:plain.map(tr).join("")});
}
assert.equal(hits.length,8);
assert.deepEqual([...new Set(hits.map(x=>x.ki))],[0]);
assert.ok(hits.every(x=>x.sign===-1));
const distinct=[...new Set(hits.map(x=>x.text))].sort();assert.deepEqual(distinct,["IDNEUCES","LPXNGDROU","SECUENDI","UORDNGXPL"].sort());
const wordHits=hits.filter(x=>x.text==="SECUENDI");assert.equal(wordHits.length,2);
assert.ok(wordHits.every(x=>x.reverse&&x.key.map(tr).join("-")==="X-N-X-C"));

// Source-motivated fixed orientation, checked without a language scorer:
// p0's original artwork independently demonstrates 180-degree reversal;
// retain the same subtraction sign as the source-only second word;
// use the ordinary UL->UR->LR->LL clockwise rectangle convention.
const naturalKey=keyCandidates[0].vals;
assert.deepEqual(naturalKey.map(tr),["X","N","X","C"]);
const naturalCipher=[...words[0].gp_indices].reverse();
const naturalPlain=naturalCipher.map((v,i)=>mod(v-naturalKey[i%4]));
assert.equal(sum(naturalPlain),targetP1);
assert.equal(naturalPlain.map(tr).join(""),"SECUENDI");
const firstPlain=naturalPlain;
assert.deepEqual(firstPlain.map((v,i)=>mod(v+wordHits[0].key[i%4])),[...words[0].gp_indices].reverse());

// Held-out closure: selection above did not use the full-title target.
const raw=[...firstPlain,...secondPlain],sumP1=sum(firstPlain),sumAll=sum(raw);
assert.deepEqual([sumK2,targetK1,sumP2,sumP1,sumAll],[15,42,57,99,156]);
assert.equal(sumP2,sumK2+targetK1);assert.equal(sumP1,targetK1+sumP2);assert.equal(sumAll,sumP2+sumP1);
assert.equal(sumAll,13*phi(13));
assert.deepEqual([secondKey.length,wordHits[0].key.length,secondPlain.length,firstPlain.length,raw.length],markerLadder);
assert.equal(raw.map(tr).join(" "),"S E C U E N D I R A T I O");

// Register gate.
const sourceNative=encodeSourceNativeGP("SEQUENDI RATIO");assert.equal(sourceNative.length,12);
assert.equal(sourceNative.map(tr).join(" "),"S E C W E N D I R A T IA");assert.notDeepEqual(sourceNative,raw);
const sourceNativeFirst=encodeSourceNativeGP("SEQUENDI"),sourceNativeSecond=encodeSourceNativeGP("RATIO");
assert.deepEqual([sourceNativeFirst.length,sourceNativeSecond.length,sourceNative.length],[8,4,12]);
assert.deepEqual([sum(sourceNativeFirst),sum(sourceNativeSecond),sum(sourceNative)],[105,71,176]);
assert.notDeepEqual([secondKey.length,naturalKey.length,sourceNativeSecond.length,sourceNativeFirst.length,sourceNative.length],markerLadder);
assert.notDeepEqual([sumK2,targetK1,sum(sourceNativeSecond),sum(sourceNativeFirst),sum(sourceNative)],[15,42,57,99,156]);
const aliases=new Map([["Q","C"],["K","C"],["V","U"],["Z","S"]]);
const directLatin="SEQUENDI RATIO".replace(/[^A-Z]/g,"").split("").map(ch=>{const i=corpus.translit.indexOf(aliases.get(ch)||ch);assert.ok(i>=0);return i});
assert.deepEqual(directLatin,raw);

console.log(JSON.stringify({
 status:"intermediate raw-title symmetry, additive-chain, and Latin-register hypothesis",
 markerLadder,
 objectLengths:[secondKey.length,wordHits[0].key.length,secondPlain.length,firstPlain.length,raw.length],
 symmetricRectangles:rects.length,
 ratio3SymmetricRectangles:ratio3Rects.length,
 keySumTarget:targetK1,
 keySumCandidatesAllRatio3:keyCandidates.every(x=>{const h=x.b-x.t,w=x.r-x.l;return h===3*w||w===3*h}),
 keySumCandidates:keyCandidates.map(x=>x.vals.map(tr)),
 firstPlainSumTarget:targetP1,
 recurrenceHits:hits.length,
 recurrenceRectangle:keyCandidates[0].vals.map(tr),
 recurrenceOutputs:distinct,
 sourceConvention:{ciphertext:"reverse",sign:"subtract",cornerOrder:"UL-UR-LR-LL",plaintext:naturalPlain.map(tr)},
 rawTitle:raw.map(tr),
 sumChain:[sumK2,targetK1,sumP2,sumP1,sumAll],
 heldOutClosure:"156 = 13*phi(13)",
 sourceNativePhrase:sourceNative.map(tr),
 sourceNativeLengths:[sourceNativeFirst.length,sourceNativeSecond.length,sourceNative.length],
 sourceNativeSums:[sum(sourceNativeFirst),sum(sourceNativeSecond),sum(sourceNative)],
 directLatinPhrase:directLatin.map(tr),
 directLatinPreservesMarkerAndRecurrence:true,
 caveat:"equal-rune/equidistant rectangle symmetry and direct-Latin register remain hypotheses"
},null,2));
