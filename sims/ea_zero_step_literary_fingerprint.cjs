"use strict";
/**
 * Source-grounded original LP2 zero-step source-fingerprint attack.
 * Conditional model: C[i] == C[i-1] iff original continuous GP P[i] == EA.
 * Every known literary passage offset is screened exactly for source EA
 * marker positions. Neither the model nor quoted source is presumed true.
 * Run manually via existing padded-wordlength-corpus workflow.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {selectBooks}=require("./padded_wordlength_corpus.cjs");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const byRune=new Map(gp.runes.map((r,i)=>[r,i]));
const tokens=gp.translit.map((name,index)=>({name,index}))
  .sort((a,b)=>b.name.length-a.name.length);
const LENGTHS=[729,1145,1738,1894,1021,1433,1680,3316];
const MAX_BOOKS=Number(process.env.MAX_BOOKS??92);

/** @param {string} text @param {boolean} alias */
function encode(text,alias=false){
  const result=[];
  for(const sourceWord of text.match(/[A-Za-z]+/g)||[]){
    let w=sourceWord.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S").replace(/Q/g,"C");
    if(alias)w=w.replace(/ING/g,"NG");
    for(let j=0;j<w.length;){
      const t=tokens.find(t=>w.startsWith(t.name,j));
      assert(t,"Missing normalized GP symbol "+w.slice(j));
      result.push(t.index);j+=t.name.length;
    }
  }
  return result;
}
/** @returns {number[][]} */
function sections(){
  const raw=read("resources/lp2-transcription.txt").split("%")
    .slice(0,55).join("%");
  const out=raw.split("$").map(s=>[...s].filter(c=>byRune.has(c))
    .map(c=>byRune.get(c))).filter(s=>s.length);
  assert.deepEqual(out.map(x=>x.length),LENGTHS);
  assert.equal(out.flat().length,12956);
  return out;
}
/** @param {number[]} a */
function markers(a){
  const out=[];
  for(let i=1;i<a.length;i++)if(a[i]===a[i-1])out.push(i);
  return out;
}
/**
 * Exhaustively align all sparse EA positions to a section's observed
 * within-section adjacent ciphertext repeats. Count every overlap and
 * source-EA absence/presence mismatch at each possible source offset.
 * @param {number[]} src
 * @param {number} L
 * @param {number[]} sites
 */
function scan(src,L,sites){
  const offsets=src.length-L+1;
  if(offsets<=0)return null;
  const ea=[],prefix=new Uint32Array(src.length+1);
  for(let i=0;i<src.length;i++){
    const hit=Number(src[i]===28);
    prefix[i+1]=prefix[i]+hit;
    if(hit)ea.push(i);
  }
  const matched=new Uint16Array(offsets);
  for(const t of sites)for(const s of ea){
    const start=s-t;
    if(start>=0&&start<offsets)matched[start]++;
  }
  let most=-1,mostStart=-1,minErrors=Infinity,minStart=-1,
    minMatched=-1,perfect=0;
  for(let start=0;start<offsets;start++){
    const hits=matched[start];
    const sourceEA=prefix[start+L]-prefix[start];
    const error=sites.length+sourceEA-2*hits;
    if(hits>most){most=hits;mostStart=start;}
    if(error<minErrors||(error===minErrors&&hits>minMatched)){
      minErrors=error;minStart=start;minMatched=hits;
    }
    if(error===0)perfect++;
  }
  return {sourceRunes:src.length,sourceEA:ea.length,
    sourceOffsets:offsets,markerCount:sites.length,
    maximumMatched:most,maximumMatchedOffset:mostStart,
    minimumHamming:minErrors,minimumHammingOffset:minStart,
    matchedAtMinimum:minMatched,sourceEAAtMinimum:
      prefix[minStart+L]-prefix[minStart],perfectOffsets:perfect};
}
/** @param {number[]} P @param {number} initial */
function encryptZero(P,initial){
  const C=[initial];
  for(let i=1;i<P.length;i++)C.push((C[i-1]+
    (P[i]===28?0:1+P[i]%28))%29);
  return C;
}
/** @param {number[][]} parts @param {number[]} source */
function positive(parts,source){
  let offset=45000, recovered=0;
  assert(source.length>=offset+12956);
  const bySection=[];
  for(let i=0;i<parts.length;i++){
    const L=parts[i].length, p=source.slice(offset,offset+L);
    const cipher=encryptZero(p,(i*7+11)%29);
    const site=markers(cipher);
    const s=scan(source,L,site);
    assert.equal(s.minimumHamming,0);
    const trueMatched=site.filter(j=>p[j]===28).length;
    assert.equal(trueMatched,site.length);
    const trueSourceEA=p.slice(1).filter(x=>x===28).length;
    assert.equal(trueSourceEA,site.length);
    assert(s.perfectOffsets>0);
    recovered+=L;
    bySection.push({section:i,offset,markers:site.length,
      matched:site.length,perfectOffsets:s.perfectOffsets});
    offset+=L;
  }
  return {recovered,bysSection:bySection};
}
/** @param {string} src */
function clean(src){
  const a=src.search(/\*\*\*\s*START OF (THE|THIS) PROJECT GUTENBERG/i);
  const b=src.search(/\*\*\*\s*END OF (THE|THIS) PROJECT GUTENBERG/i);
  return src.slice(a>=0?src.indexOf("\n",a)+1:0,b>=0?b:undefined);
}
/** @param {{url:string}} book */
async function fetchEdition(book){
  for(const uri of [book.url,book.url.replace(/(\d+)\.txt$/,"$1-0.txt")]){
    try{
      const r=await fetch(uri,{signal:AbortSignal.timeout(18000),
        headers:{"User-Agent":"LiberPrimusAcademicCryptanalysis/1.0"}});
      if(r.ok){
        const body=await r.text();
        if(body.length<=12000000)return clean(body);
      }
    }catch(e){/* Historical mirrors may be missing. */}
  }
  return null;
}
/** @param {number[][]} input @param {number[]} reference @param {string} source @param {boolean} alias */
function evaluate(input,reference,source,alias){
  return input.map((section,i)=>{
    const record=scan(reference,section.length,markers(section));
    return {...record,section:i,source,alias};
  }).filter(x=>x.minimumHamming!==undefined);
}
async function run(){
  assert(Number.isInteger(MAX_BOOKS)&&MAX_BOOKS>=0&&MAX_BOOKS<=92);
  const input=sections();
  const originals=markers(input.flat());
  assert.equal(originals.length>=86,true);
  const shakespeare=encode(read("resources/control/shakespeare_first300k.txt"));
  const control=positive(input,shakespeare);
  const local=[
    ["solved-LP1","resources/liber-primus/lp1-plaintext-reference.txt"],
    ["Shakespeare","resources/control/shakespeare_first300k.txt"],
    ["Gibran","resources/control/gibran_prophet_58585.txt"],
    ["Emerson","resources/control/emerson_essays_2944.txt"]
  ];
  const summaries=[],top=[];
  function ingest(name,text){
    for(const alias of [false,true]){
      const E=encode(text,alias);
      const results=evaluate(input,E,name,alias);
      results.sort((a,b)=>a.minimumHamming-b.minimumHamming||
        b.maximumMatched-a.maximumMatched);
      summaries.push({source:name,alias,n:E.length,
        minimumHamming:results[0]?.minimumHamming,
        maximumMatched:Math.max(...results.map(x=>x.maximumMatched)),
        completeSections:results.filter(x=>x.perfectOffsets>0)
          .map(x=>x.section)});
      top.push(...results.slice(0,2));
      if(results[0]?.minimumHamming<=1||
        results[0]?.maximumMatched>=6)
        console.log("EA_CANDIDATE "+JSON.stringify(results.slice(0,2)));
    }
  }
  for(const [name,p] of local)ingest(name,clean(read(p)));
  const books=await selectBooks();
  let checked=0,missing=0;
  for(const book of books.slice(0,MAX_BOOKS)){
    const content=await fetchEdition(book);
    if(content){ingest("GITenberg_"+book.id,content);checked++;}
    else missing++;
    if((checked+missing)%20===0)console.log("EA_PROGRESS "+
      JSON.stringify({checked,missing}));
  }
  top.sort((a,b)=>a.minimumHamming-b.minimumHamming||
    b.maximumMatched-a.maximumMatched);
  const report={
    status:"Conditional exact cipher-marker original-LP2 literary source inverse",
    hypothesis:"Within each LP2 section zero ciphertext difference iff native GP plaintext EA rune",
    sourceRunes:12956,sections:LENGTHS,
    zeroMarkers:input.map(p=>markers(p).length),
    sources:summaries.length,checked,missing,
    sourceReadings:"usual GP digraph, optional ING contraction",
    positive:control,
    top:top.slice(0,20),
    perfect:summaries.filter(x=>x.completeSections.length),
    caveat:"A nonmatching source may still be related by edits, spelling, transposition, nonnative GP text, or a different mapping for zero ciphertext differences."
  };
  console.log("EA_FINGERPRINT_SUMMARY "+JSON.stringify(report));
  return report;
}
if(require.main===module)run().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={encode,sections,markers,scan,encryptZero,positive,run};
