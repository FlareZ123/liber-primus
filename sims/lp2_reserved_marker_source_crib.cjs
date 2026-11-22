"use strict";
/**
 * Exact conditional masked-plaintext crib search for the published LP2
 * three-reserved-symbol successor hypothesis. This does not decode the
 * manuscript or assume its model is authentic.
 *
 * For every GP-encoded source candidate, enumerate ALL contiguous positions
 * that may match an entire LP2 section's model-fixed markers (EA, S, U, E).
 * Rare-marker indexed exact search is sound: a full match must place the
 * rarest required literal marker at one of its source occurrences.
 *
 * Positive: source-true ciphertext encrypted from a disjoint contiguous
 * Shakespeare GP stretch by the exact same lossless cipher. The search
 * must recover every section's known contiguous offset with full coverage.
 * Negative: repeat the identical full search on original ciphertext.
 *
 * Run: node sims/lp2_reserved_marker_source_crib.cjs; Node >=22.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {decrypt,encrypt}=require("./lp2_lossless_three_reserve_forward.cjs");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const source=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const glyph=new Map(source.runes.map((c,i)=>[c,i]));
const numeric=source.pages.filter(p=>p.page<=55&&p.indices.length)
  .flatMap(p=>p.indices);
const raw=read("resources/lp2-transcription.txt").split("%").slice(0,55).join("%");
const sections=raw.split("$").map(section=>[...section]
  .filter(c=>glyph.has(c)).length).filter(n=>n);
const total=sections.reduce((a,b)=>a+b,0);
assert.equal(total,12956);
assert.deepEqual(sections,[729,1145,1738,1894,1021,1433,1680,3316]);
const words=source.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} text @param {boolean} ingAlias */
function encode(text,ingAlias){
  const output=[];
  for(const rawWord of text.match(/[A-Za-z]+/g)||[]){
    let word=rawWord.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S");
    if(ingAlias)word=word.replace(/ING/g,"NG");
    for(let i=0;i<word.length;){
      const hit=words.find(e=>word.startsWith(e.s,i));
      assert(hit,"Unrecognized GP source glyph "+word.slice(i));
      output.push(hit.i);i+=hit.s.length;
    }
  }
  return output;
}
/** Strip source-reference editor headings, comments, and displayed hashes. */
function nativeBody(text){
  return text.split(/\r?\n/).filter(line=>{
    const s=line.trim();
    return !s.startsWith("#")&&!s.startsWith("[")&&!/^[0-9a-f]{25,}$/iu.test(s);
  }).join(" ");
}
const sourceTexts=[
  {name:"solved-Cicada",text:nativeBody(read("resources/liber-primus/lp1-plaintext-reference.txt"))},
  {name:"Shakespeare",text:read("resources/control/shakespeare_first300k.txt")},
  {name:"Gibran",text:read("resources/control/gibran_prophet_58585.txt")},
  {name:"Emerson",text:read("resources/control/emerson_essays_2944.txt")}
];
/** @param {Array<number|null>} markers */
function sectionMasks(markers){
  const masks=[];let first=0;
  for(const length of sections){
    const required=[];
    for(let j=0;j<length;j++){
      const symbol=markers[first+j];
      if(symbol!==null)required.push({index:j,symbol});
    }
    masks.push({first,length,required});first+=length;
  }
  return masks;
}
/**
 * Exhaustively search all contiguous placements consistent with every one of
 * the fixed plaintext symbols. Also report best partial anchored matches.
 * @param {ReturnType<typeof sectionMasks>[number]} mask
 * @param {number[]} sourceRunes
 */
function scan(mask,sourceRunes){
  const {length,required}=mask;
  if(!required.length)return {totalMarkers:0,full:sourceRunes.length-length+1};
  const positions=Array.from({length:29},()=>[]);
  for(let i=0;i<sourceRunes.length;i++)positions[sourceRunes[i]].push(i);
  const anchor=required.slice().sort((a,b)=>
    positions[a.symbol].length-positions[b.symbol].length)[0];
  let full=0,best=0,bestOffset=-1,checked=0;
  for(const loc of positions[anchor.symbol]){
    const offset=loc-anchor.index;
    if(offset<0||offset+length>sourceRunes.length)continue;
    checked++;
    let matches=0;
    for(const c of required)if(sourceRunes[offset+c.index]===c.symbol)matches++;
    if(matches>best){best=matches;bestOffset=offset;}
    if(matches===required.length)full++;
  }
  return {totalMarkers:required.length,anchor:source.translit[anchor.symbol],
    anchoredCandidateWindows:checked,full,best,bestOffset};
}
function xorshift(seed){
  let s=seed>>>0;
  return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};
}
function study(){
  const masks=sectionMasks(decrypt(numeric));
  assert.deepEqual(masks.map(m=>m.required.length),
    [17,18,37,38,22,34,34,65]);
  const results=[];
  const encoded=sourceTexts.map(({name,text})=>({
    name,readings:[false,true].map(alias=>({
      alias,data:encode(text,alias)
    }))
  }));
  const positives=encoded.find(t=>t.name==="Shakespeare").readings[0].data;
  const plantedFirst=40000;
  const truePlain=positives.slice(plantedFirst,plantedFirst+total);
  assert.equal(truePlain.length,total);
  const {ciphertext,keys}=encrypt(truePlain,xorshift(0x37703102));
  const recovered=decrypt(ciphertext,keys);
  const partial=decrypt(ciphertext);
  for(let i=0;i<total;i++)if(partial[i]!==null)
    assert.equal(partial[i],truePlain[i]);
  const positiveMasks=sectionMasks(partial);
  let offset=0;
  const positivesBySection=positiveMasks.map(mask=>{
    const trial=scan(mask,positives);
    assert(trial.totalMarkers>0);
    assert(trial.full>0);
    const exactOffset=plantedFirst+offset;
    for(const constraint of mask.required)
      assert.equal(positives[exactOffset+constraint.index],constraint.symbol);
    offset+=mask.length;
    return {section:positiveMasks.indexOf(mask)+1,
      markers:trial.totalMarkers,exactSourceOffset:exactOffset,
      entireSectionMatches:trial.full};
  });
  for(const book of encoded){
    for(const reading of book.readings){
      const scans=masks.map(mask=>scan(mask,reading.data));
      results.push({source:book.name,ingAlias:reading.alias,
        sourceRunes:reading.data.length,sections:scans.map((s,i)=>({
          section:i+1,markers:s.totalMarkers,exactWholeSection:s.full,
          bestAnchoredHitCount:s.best,anchoredCandidateWindows:s.anchoredCandidateWindows
        })),
        completeSectionMatches:scans.reduce((a,s)=>a+s.full,0)
      });
    }
  }
  assert(results.every(r=>r.completeSectionMatches===0));
  return {hypothesis:"three-reserve lossless marker GP cipher; unproven original",
    unknownLP2Runes:total,sections:sections.length,
    originalFullMasks:masks.map(m=>m.required.length),
    conditionalMarkerCount:masks.reduce((a,m)=>a+m.required.length,0),
    planted:{source:"Shakespeare heldout contiguous original-layout passage",
      recoveredAllTrueOffsets:positivesBySection},
    originalSearch:results};
}
if(require.main===module)console.log(JSON.stringify(study(),null,2));
module.exports={encode,scan,sectionMasks,study};
