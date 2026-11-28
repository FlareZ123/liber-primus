'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r/g,'');
const mod29=n=>((n%29)+29)%29;
const gp0=a=>mod29(a.reduce((s,x)=>s+x,0));
const H=(a,b)=>[mod29(a-b),mod29(a+b)];

const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const transcription=read('resources/liber-primus/lp2-transcription.txt');
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const parts=transcription.split(/^\s*%\s*$/m).slice(0,55);

function parsePages(){
  const pages=Array.from({length:parts.length},(_,segment)=>({page:segment>=50?segment+1:segment,words:[]}));
  const offsets=pages.map(()=>0);
  let values=[],startSegment=0,endSegment=0,start=0;
  const flush=()=>{
    if(!values.length)return;
    if(startSegment===endSegment){
      const page=pages[startSegment];
      page.words.push({page:page.page,start,end:start+values.length-1,values:values.slice(),length:values.length,gp0:gp0(values)});
    }
    values=[];
  };
  for(let segment=0;segment<parts.length;segment++){
    for(const char of parts[segment]){
      const value=runeIndex.get(char);
      if(value!==undefined){
        if(!values.length){startSegment=segment;start=offsets[segment];}
        endSegment=segment;values.push(value);offsets[segment]++;
      }else if(char==='/'||/\s/u.test(char)) continue;
      else flush();
    }
  }
  flush();
  return new Map(pages.map(p=>[p.page,p.words]));
}
const pages=parsePages();
const wordAt=(page,start)=>{
  const word=(pages.get(page)||[]).find(w=>w.start===start);
  assert.ok(word,'missing p'+page+' word at '+start);
  return word;
};
const residueArity=(page,length,residue)=>(pages.get(page)||[]).filter(w=>w.length===length&&mod29(w.start)===residue);

// Frozen p6 receiver grammar, committed before the chapter route existed.
const p6Title=[71,75,76,80].map(start=>wordAt(6,start));
assert.deepEqual(p6Title.map(w=>w.values),[[24,16,14,17],[19],[6,27,15,17],[14,12]]);
const W1=p6Title[0].values,W4=p6Title[3].values,F=0;
const p6Packet=[...H(F,W1[1]),W1[0],W4[1]];
assert.deepEqual(p6Packet,[13,16,24,12]);

const p37=residueArity(37,4,1),p38=residueArity(38,6,28),p39=residueArity(39,5,16);
const p40Candidates=residueArity(40,4,13);
assert.deepEqual(p37.map(w=>[w.start,w.gp0]),[[146,9]]);
assert.deepEqual(p38.map(w=>[w.start,w.gp0]),[[57,1]]);
assert.deepEqual(p39.map(w=>[w.start,w.gp0]),[[132,18]]);
assert.deepEqual(p40Candidates.map(w=>[w.start,w.gp0]),[[13,3],[71,25],[216,27]]);
const prefixGp0=mod29(p37[0].gp0+p38[0].gp0+p39[0].gp0);
assert.equal(prefixGp0,28);
const block3Totals=p40Candidates.map(w=>mod29(prefixGp0+w.gp0));
assert.deepEqual(block3Totals,[2,24,26]);
const selectedIndex=block3Totals.findIndex(x=>x===p6Packet[2]);
assert.equal(selectedIndex,1);
const selected=p40Candidates[selectedIndex];
assert.deepEqual([selected.start,selected.gp0],[71,25]);
const rejectedResidues=p40Candidates.filter((_,i)=>i!==selectedIndex).map(w=>w.gp0).sort((a,b)=>a-b);
assert.deepEqual(rejectedResidues,[3,27]);

// Later chapter-route operand on original p40.
const p40Source=corpus.pages[40].indices;
const ann=ink.pages.find(x=>x.page===40);
assert.ok(ann&&ann.red_spans&&ann.red_spans.length);
const rubrics=ann.red_spans.slice().sort((a,b)=>a.start-b.start);
assert.equal(rubrics[0].start,0);
let redEnd=rubrics[0].length;
for(let i=1;i<rubrics.length&&rubrics[i].start===redEnd;i++)redEnd+=rubrics[i].length;
assert.equal(redEnd,8);
const blackWords=(pages.get(40)||[]).filter(w=>w.start>=redEnd);
assert.equal(blackWords.length,53);
const firstBlack=blackWords.find(w=>w.start===redEnd);
assert.ok(firstBlack);
assert.deepEqual(firstBlack.values,[24,13,14,26,8]);
const routePair=[gp0(firstBlack.values),firstBlack.values.reduce((p,x)=>mod29(p*x),1)];
assert.deepEqual(routePair,[27,3]);
assert.deepEqual(routePair.slice().sort((a,b)=>a-b),rejectedResidues);

const summarize=w=>{
  const sum=gp0(w.values),product=w.values.reduce((p,x)=>mod29(p*x),1);
  return {start:w.start,length:w.length,sum,product,pair:[sum,product].slice().sort((a,b)=>a-b)};
};
const allBlack=blackWords.map(summarize);
const complementHits=allBlack.filter(x=>x.pair[0]===rejectedResidues[0]&&x.pair[1]===rejectedResidues[1]);
assert.deepEqual(complementHits,[{start:8,length:5,sum:27,product:3,pair:[3,27]}]);
assert.equal(allBlack.filter(x=>x.length===firstBlack.length).length,8);

const unorderedDistinctPairs=29*28/2;
assert.equal(unorderedDistinctPairs,406);

console.log(JSON.stringify({
 classification:'chronological cross-holdout: later p40 route terminal pair equals the two residues rejected by earlier p6 receiver tie-break',
 p6:{packet:p6Packet,p40Candidates:p40Candidates.map(w=>({start:w.start,gp0:w.gp0})),block3Totals,selected:{start:selected.start,gp0:selected.gp0},rejectedResidues},
 route:{firstBlackStart:firstBlack.start,runes:firstBlack.values,sum:routePair[0],product:routePair[1],allBlackWords:allBlack.length,sameLengthBlackWords:allBlack.filter(x=>x.length===firstBlack.length).length,complementHits},
 conditionalCharges:{unorderedDistinctGp29PairSpace:unorderedDistinctPairs,exactComplementPair:1/unorderedDistinctPairs,allP40BlackWords:allBlack.length,exactBlackWordHits:complementHits.length},
 warning:'p6 target was frozen earlier, but the cross-connection was noticed after both analyses; charges are conditional diagnostics, not an authorship probability or plaintext authentication'
},null,2));
