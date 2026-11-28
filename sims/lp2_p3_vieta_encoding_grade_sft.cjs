'use strict';
// POST-PRETARGET original-cipher test of Director #3418 Vieta family.
// The finite variants and raw predicted next pair were committed in
// im-results/lp2-p3-vieta-encoding-pretarget-output.json before this grader.
// The p33 receiver was public before this investigation: this is a rigorous
// bounded after-discovery multiplicity audit, NOT a historical blind solve.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),child=require('node:child_process');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r/g,'');
const f=JSON.parse(read('im-results/lp2-p3-vieta-encoding-pretarget-output.json'));
const pretarget=JSON.parse(child.execFileSync(process.execPath,[path.join(__dirname,'lp2_p3_vieta_encoding_charge_pretarget_sft.cjs')],{encoding:'utf8'}));
assert.deepEqual(f,pretarget,'pretarget source-output divergence');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json')),ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const text=read('resources/liber-primus/lp2-transcription.txt'),parts=text.split('%'),runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const mod=x=>((x%29)+29)%29,sum=x=>mod(x.reduce((a,b)=>a+b,0)),product=x=>x.reduce((a,b)=>mod(a*b),1);
function words(page){
 assert.notEqual(page,50);const part=parts[page<50?page:page-1],indices=corpus.pages[page].indices;
 const out=[];let offset=0,start=0,current=[];
 const flush=()=>{if(current.length){out.push({page,start,end:start+current.length,values:current,descriptor:[current.length,sum(current),product(current)]});current=[];}};
 for(const ch of part){
  if(runeIndex.has(ch)){if(!current.length)start=offset;assert.equal(indices[offset],runeIndex.get(ch));current.push(indices[offset++]);}
  else if('-.&$§'.includes(ch))flush();
 }
 flush();assert.equal(offset,indices.length);return out;
}
assert.deepEqual(corpus.pages[3].indices.slice(119,122),f.p3Marker);
const redByPage=new Map(ink.pages.map(p=>[p.page,p.red_spans||[]]));
const hits=[],redHits=[];let redWords=0,allWords=0;
for(let page=0;page<=55;page++){if(page===50)continue;
 const spans=redByPage.get(page)||[];
 for(const w of words(page)){
  allWords++;
  const red=spans.some(s=>w.start>=s.start&&w.end<=s.start+s.length);
  if(red)redWords++;
  if(w.descriptor[1]===6&&w.descriptor[2]===11){
   const hit={page:w.page,start:w.start,descriptor:w.descriptor,values:w.values};
   hits.push(hit);if(red)redHits.push(hit);
  }
 }
}
assert.deepEqual(hits.map(x=>[x.page,x.start]),[[23,200],[33,91]]);
assert.deepEqual(redHits.map(x=>[x.page,x.start]),[[33,91]]);
assert.deepEqual(redHits[0].values,[21,2,12]);
assert.equal(redWords,50);
assert.deepEqual(f.variants.filter(x=>x.equalDiscriminant).map(x=>x.nextRawSumProduct),[[6,11],[6,11]]);
const labelRows=f.variants.map(x=>({swap:x.swap,sumSign:x.sumSign,productSign:x.productSign,
 discriminator:x.discriminants.join(','),shift:x.sourceStateShift,predicted:x.nextRawSumProduct}));
console.log(JSON.stringify({
 classification:'BOUNDED POSTDISCOVERY Vieta family and matched original red-receiver test; no unknown plaintext',
 pretargetFile:'im-results/lp2-p3-vieta-encoding-pretarget-output.json',
 source:'original p3 marker, p54/p40 route and canonical p33 red words',
 count:{chargedQuadraticEncodings:8,equalDiscriminant:2,chargedWithFrobenius:16,survivingWithFrobenius:4,
  uniquePredictedRawPairs:1,allCompletePageWords:allWords,completeRedWords:redWords,rawPairHits:hits.length,redPairHits:redHits.length},
 sourceSelector:'unswapped +P survives; both ±S signs remain equivalent under x→-x, and both field-Frobenius orientations are equivalent on unordered roots',
 labelRows,found:redHits[0],
 conclusion:'The p54→p40→p33 arithmetic exists, but its quadratic sign/basis presentation is non-identifiable from the original p3 marker and route. The marked p33 hit is conditional structure, not an independently authenticated Vieta key opcode.'
},null,2));
