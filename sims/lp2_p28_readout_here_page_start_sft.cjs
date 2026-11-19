"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8").replace(/\r/g,"");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const parts=read("resources/liber-primus/lp2-transcription.txt").split(/^\s*%\s*$/m);
const ri=new Map(corpus.runes.map((r,i)=>[r,i]));
const mod=(x)=>((x%29)+29)%29;
const H=(a,b)=>[mod(a-b),mod(a+b)];
const spell=(a)=>a.map(v=>corpus.translit[v]).join("");
const pow=(b,e,m)=>{let o=1%m,x=((b%m)+m)%m;while(e>0){if(e&1)o=o*x%m;x=x*x%m;e=Math.floor(e/2)}return o};
const inv=(x,m)=>{for(let i=1;i<m;i++)if(x*i%m===1)return i;return null};
const part=(p)=>parts[p<=49?p:p-1];
const lines=(p)=>part(p).split("/").filter(x=>/[\u16A0-\u16FF]/u.test(x));
const frags=(line)=>(line.match(/[\u16A0-\u16FF]+/gu)||[]).map(s=>[...s].map(c=>ri.get(c)));
const outer=(f)=>{assert.ok(f.length>=2);return H(f[0],f[f.length-1])};

// Reconstruct the p28 literal-DH state from source-visible line6.
const p28=lines(28);
assert.equal(p28.length,12);
const dhf=frags(p28[5]);
assert.equal(spell(dhf[0]),"DH");
assert.equal(dhf.length,5);
assert.equal(dhf.flat().length,23);
const first=outer(dhf[0]),last=outer(dhf.at(-1));
assert.deepEqual(first,[15,2]);
assert.deepEqual(last,[8,19]);
const state={p:23,g:5,a:6,b:first[0],A:last[0],B:last[1],K:first[1]};
assert.deepEqual(state,{p:23,g:5,a:6,b:15,A:8,B:19,K:2});
assert.equal(pow(state.g,state.a,state.p),state.A);
assert.equal(pow(state.g,state.b,state.p),state.B);
assert.equal(pow(state.A,state.b,state.p),state.K);
assert.equal(pow(state.B,state.a,state.p),state.K);
const e=inv(state.b,state.p-1);
assert.equal(e,3);
assert.equal(pow(state.B,e,state.p),state.g);

// Reproduce READ OUT without p50 output coercion.
const p28Runes=[...part(28)].map(c=>ri.get(c)).filter(v=>v!==undefined);
assert.equal(p28Runes.length,269);
const center=(p28Runes.length-1)/2;
assert.equal(center,134);
const word=dhf.at(-1);
assert.deepEqual(word,[28,24,10,1,20]);
assert.deepEqual([p28Runes[center],...word],[9,28,24,10,1,20]);
const we=pow(e,3,28);
assert.equal(we,27);
const readout=[pow(p28Runes[center],e,29),...word.map(v=>pow(v,we,29))];
assert.deepEqual(readout,[4,28,23,3,1,16]);
assert.equal(spell(readout),"READOUT");

// READ OUT -> fixed outer-H at natural page start.
const HERE=[8,18,4,18];
const starts=[],kg=[],here=[];
let runeLines=0,adjacent=0;
for(let page=0;page<=55;page++){
  if(page===50)continue;
  const ls=lines(page);
  runeLines+=ls.length;
  const f0=frags(ls[0]);
  if(f0.length>=2&&f0[0].length>=2&&f0[1].length>=2){
    const output=[...outer(f0[0]),...outer(f0[1])];
    const row={page,lengths:[f0[0].length,f0[1].length],source:[spell(f0[0]),spell(f0[1])],output,text:spell(output)};
    starts.push(row);
    if(row.lengths[0]===state.K&&row.lengths[1]===state.g)kg.push(row);
  }
  for(let li=0;li<ls.length;li++){
    const f=frags(ls[li]);
    for(let i=0;i+1<f.length;i++){
      if(f[i].length<2||f[i+1].length<2)continue;
      adjacent++;
      const output=[...outer(f[i]),...outer(f[i+1])];
      if(output.every((v,j)=>v===HERE[j]))here.push({page,line:li+1,fragments:[i+1,i+2],lengths:[f[i].length,f[i+1].length],source:[spell(f[i]),spell(f[i+1])],output,text:spell(output)});
    }
  }
}
assert.equal(runeLines,594);
assert.equal(starts.length,41);
assert.equal(adjacent,2347);
const selected={page:28,lengths:[2,5],source:["PC","JTHBIW"],output:HERE,text:"HERE"};
assert.deepEqual(kg,[selected]);
assert.deepEqual(here,[{page:28,line:1,fragments:[1,2],...selected}]);

// Same finite lexical register used by the p28 phrase-family audit.
let dictionary=read("resources/control/english_wordfreq_textblob.txt").toLowerCase().split(/\s+/u).filter(Boolean);
for(const p of ["resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/liber-primus/lp1-plaintext-reference.txt"]){
  dictionary.push(...(read(p).toLowerCase().match(/[a-z]+/gu)||[]));
}
const lex=new Set(dictionary.filter(w=>/^[a-z]+$/u.test(w)&&w.length>=3));
assert.deepEqual(starts.filter(r=>lex.has(r.text.toLowerCase())),[selected]);

// Charge every ordered pair of distinct DH fields rather than privileging K,g.
const pairs=[];
for(const [an,av] of Object.entries(state))for(const [bn,bv] of Object.entries(state))if(an!==bn)pairs.push({labels:[an,bn],values:[av,bv]});
assert.equal(pairs.length,42);
const stateStarts=[];
for(const row of starts){
  const matches=pairs.filter(p=>p.values[0]===row.lengths[0]&&p.values[1]===row.lengths[1]);
  if(matches.length)stateStarts.push({...row,statePairs:matches.map(m=>m.labels),lexical:lex.has(row.text.toLowerCase())});
}
assert.equal(stateStarts.length,8);
assert.deepEqual(stateStarts.filter(r=>r.lexical),[{...selected,statePairs:[["K","g"]],lexical:true}]);

// Strengthen the selector without using plaintext. At each physical line, take
// [total rune count, fragment count, first-fragment length, second-fragment
// length]. Charge every assignment whose four values belong to the recovered
// DH-state value set before lexical scoring.
const valueToLabel=new Map(Object.entries(state).map(([label,value])=>[value,label]));
const dhGeometryLines=[];
for(let page=0;page<=55;page++){
  if(page===50)continue;
  const ls=lines(page);
  for(let li=0;li<ls.length;li++){
    const f=frags(ls[li]);
    if(f.length<2)continue;
    const geometry=[f.flat().length,f.length,f[0].length,f[1].length];
    if(!geometry.every(value=>valueToLabel.has(value)))continue;
    const output=[...outer(f[0]),...outer(f[1])];
    dhGeometryLines.push({
      page,
      line:li+1,
      geometry,
      stateLabels:geometry.map(value=>valueToLabel.get(value)),
      source:[spell(f[0]),spell(f[1])],
      output,
      text:spell(output),
      lexical:lex.has(spell(output).toLowerCase()),
    });
  }
}
assert.equal(dhGeometryLines.length,22);
assert.deepEqual(
  dhGeometryLines.filter(row=>row.lexical),
  [{
    page:28,
    line:1,
    geometry:[23,5,2,5],
    stateLabels:["p","g","K","g"],
    source:["PC","JTHBIW"],
    output:HERE,
    text:"HERE",
    lexical:true,
  }],
);
const dhGeometryPageStarts=dhGeometryLines.filter(row=>row.line===1);
assert.equal(dhGeometryPageStarts.length,4);
assert.deepEqual(dhGeometryPageStarts.filter(row=>row.lexical),[dhGeometryLines.find(row=>row.page===28&&row.line===1)]);
assert.deepEqual(
  dhGeometryLines
    .filter(row=>JSON.stringify(row.geometry)===JSON.stringify([state.p,state.g,state.K,state.g]))
    .map(row=>[row.page,row.line,row.text]),
  [[28,1,"HERE"],[44,10,"IDGY"]],
);
assert.deepEqual(
  dhGeometryPageStarts
    .filter(row=>JSON.stringify(row.geometry)===JSON.stringify([state.p,state.g,state.K,state.g]))
    .map(row=>[row.page,row.line,row.text]),
  [[28,1,"HERE"]],
);

// On p28 itself, charge all adjacent fragment pairs whose ordered lengths are
// any distinct ordered DH-field pair. HERE remains the only lexical output.
const p28StatePairs=[];
for(let li=0;li<p28.length;li++){
  const f=frags(p28[li]);
  for(let i=0;i+1<f.length;i++){
    if(f[i].length<2||f[i+1].length<2)continue;
    const lengths=[f[i].length,f[i+1].length];
    const matches=pairs.filter(pair=>pair.values[0]===lengths[0]&&pair.values[1]===lengths[1]);
    if(!matches.length)continue;
    const output=[...outer(f[i]),...outer(f[i+1])];
    p28StatePairs.push({
      line:li+1,
      fragments:[i+1,i+2],
      lengths,
      statePairs:matches.map(match=>match.labels),
      source:[spell(f[i]),spell(f[i+1])],
      output,
      text:spell(output),
      lexical:lex.has(spell(output).toLowerCase()),
    });
  }
}
assert.equal(p28StatePairs.length,4);
assert.deepEqual(
  p28StatePairs.filter(row=>row.lexical),
  [{
    line:1,
    fragments:[1,2],
    lengths:[2,5],
    statePairs:[["K","g"]],
    source:["PC","JTHBIW"],
    output:HERE,
    text:"HERE",
    lexical:true,
  }],
);


// Expanded p28 HERE family: charge H/Hinv, endpoint direction, coordinate
// order, and fragment-pair order over the complete source-selected family.
const HinvFamily=(u,v)=>[mod(15*(u+v)),mod(15*(v-u))];
const dhValueSet=new Set(Object.values(state));
const allSourceRows=[];
for(let page=0;page<=55;page++){
  if(page===50)continue;
  const pageLines=lines(page);
  for(let lineIndex=0;lineIndex<pageLines.length;lineIndex++){
    const fragments=frags(pageLines[lineIndex]);
    if(!fragments.length)continue;
    const geometry=[fragments.flat().length,fragments.length,fragments[0].length,fragments[1]?.length??null];
    allSourceRows.push({page,line:lineIndex+1,fragments,geometry});
  }
}
const dhTypedRows=allSourceRows.filter(row=>row.fragments.length>=2&&row.geometry.every(value=>dhValueSet.has(value)));
const p28EligibleRows=allSourceRows.filter(row=>row.page===28&&row.fragments.filter(fragment=>fragment.length>=2).length>=2);
const selectedRows=new Map();
for(const row of [...dhTypedRows,...p28EligibleRows])selectedRows.set(row.page+":"+row.line,row);
const expandedRows=[...selectedRows.values()];
function makeAdjacentPairs(rows){
  const out=[];
  for(const row of rows){
    for(let i=0;i+1<row.fragments.length;i++){
      if(row.fragments[i].length<2||row.fragments[i+1].length<2)continue;
      out.push({page:row.page,line:row.line,index:i,fragments:[row.fragments[i],row.fragments[i+1]]});
    }
  }
  return out;
}
const globalAdjacentPairs=makeAdjacentPairs(allSourceRows);
const expandedAdjacentPairs=makeAdjacentPairs(expandedRows);
const dhAdjacentPairs=makeAdjacentPairs(dhTypedRows);
const p28AdjacentPairs=makeAdjacentPairs(p28EligibleRows);
const orientationConfigs=[];
for(const transform of ["H","Hinv"])
for(const endpointDirection of ["forward","reverse"])
for(const coordinateOrder of ["normal","swapped"])
for(const fragmentOrder of ["forward","reverse"])
  orientationConfigs.push({transform,endpointDirection,coordinateOrder,fragmentOrder});
function applyOrientation(pair,config){
  const fragments=config.fragmentOrder==="forward"?pair.fragments:pair.fragments.slice().reverse();
  return fragments.flatMap(fragment=>{
    const endpoints=config.endpointDirection==="forward"
      ?[fragment[0],fragment[fragment.length-1]]
      :[fragment[fragment.length-1],fragment[0]];
    const mapped=config.transform==="H"?H(...endpoints):HinvFamily(...endpoints);
    return config.coordinateOrder==="normal"?mapped:[mapped[1],mapped[0]];
  });
}
function scoreAdjacentPairs(pairsToScore){
  const hits=[];
  for(const pair of pairsToScore){
    for(const config of orientationConfigs){
      const output=applyOrientation(pair,config);
      const word=spell(output);
      if(lex.has(word.toLowerCase())){
        hits.push({
          page:pair.page,
          line:pair.line,
          pair:[pair.index+1,pair.index+2],
          source:pair.fragments.map(fragment=>spell(fragment)),
          config,
          output,
          word
        });
      }
    }
  }
  return hits;
}
const expandedLexicalHits=scoreAdjacentPairs(expandedAdjacentPairs);
const globalLexicalHits=scoreAdjacentPairs(globalAdjacentPairs);
const expandedHereHits=expandedLexicalHits.filter(hit=>hit.word.toLowerCase()==="here");
const globalHereHits=globalLexicalHits.filter(hit=>hit.word.toLowerCase()==="here");
const expectedHereHit={
  page:28,
  line:1,
  pair:[1,2],
  source:["PC","JTHBIW"],
  config:{transform:"H",endpointDirection:"forward",coordinateOrder:"normal",fragmentOrder:"forward"},
  output:HERE,
  word:"HERE"
};
assert.equal(lex.size,32033);
assert.equal(allSourceRows.length,594);
assert.equal(dhTypedRows.length,22);
assert.equal(p28EligibleRows.length,12);
assert.equal(expandedRows.length,33);
assert.equal(dhAdjacentPairs.length,87);
assert.equal(p28AdjacentPairs.length,41);
assert.equal(expandedAdjacentPairs.length,124);
assert.equal(globalAdjacentPairs.length,2347);
assert.equal(orientationConfigs.length,16);
assert.equal(expandedLexicalHits.length,11);
assert.equal(new Set(expandedLexicalHits.map(hit=>hit.word.toLowerCase())).size,11);
assert.equal(new Set(expandedLexicalHits.map(hit=>hit.page)).size,4);
assert.equal(globalLexicalHits.length,105);
assert.equal(new Set(globalLexicalHits.map(hit=>hit.word.toLowerCase())).size,103);
assert.equal(new Set(globalLexicalHits.map(hit=>hit.page)).size,49);
assert.deepEqual(expandedHereHits,[expectedHereHit]);
assert.deepEqual(globalHereHits,[expectedHereHit]);

// Frozen cross-line holdout: after the within-line family is fully scored,
// take the last multi-rune fragment of p28 line1 and first of p28 line2.
// Apply only the surviving H map, forward endpoints, and source order.
const p28MultiRuneLines=p28.map(line=>frags(line).filter(fragment=>fragment.length>=2));
assert.equal(p28MultiRuneLines.length,12);
const holdoutFragments=[p28MultiRuneLines[0].at(-1),p28MultiRuneLines[1][0]];
const holdoutOutputs=holdoutFragments.map(fragment=>H(fragment[0],fragment[fragment.length-1]));
const holdoutRunes=holdoutOutputs.flat();
const holdoutText=spell(holdoutRunes);
assert.deepEqual(holdoutFragments.map(fragment=>spell(fragment)),["TDXY","ERD"]);
assert.deepEqual(holdoutFragments.map(fragment=>[fragment[0],fragment[fragment.length-1]]),[[16,26],[18,23]]);
assert.deepEqual(holdoutOutputs,[[19,13],[24,12]]);
assert.deepEqual(holdoutRunes,[19,13,24,12]);
assert.equal(holdoutText,"MPAEO");
assert.equal(lex.has(holdoutText.toLowerCase()),false);

console.log(JSON.stringify({
  status:"PASS",
  classification:"HERE is unique in the expanded 16-orientation family, but the frozen cross-line holdout yields MPAEO; retain HERE as post-discovery corroboration, not an authored checkpoint.",
  dh23:state,
  readOut:{center,source:[p28Runes[center],...word],exponents:[e,we],output:readout,text:spell(readout)},
  here:selected,
  controls:{runeLines,eligiblePageStarts:starts.length,adjacentFragmentPairs:adjacent,exactHereAcrossAllAdjacentPairs:here.length,orderedDhFieldPairs:pairs.length,pageStartsMatchingAnyOrderedDhPair:stateStarts.length,lexicalAmongStatePairStarts:stateStarts.filter(r=>r.lexical),dhGeometryLines:dhGeometryLines.length,dhGeometryPageStarts:dhGeometryPageStarts.length,exactPgKgAllLines:dhGeometryLines.filter(row=>JSON.stringify(row.geometry)===JSON.stringify([state.p,state.g,state.K,state.g])).map(row=>[row.page,row.line,row.text]),p28AdjacentStatePairs:p28StatePairs.length,lexicalP28StatePairs:p28StatePairs.filter(row=>row.lexical)},
  expandedFamily:{
    lexiconSize:lex.size,
    dhTypedLines:dhTypedRows.length,
    p28EligibleLines:p28EligibleRows.length,
    unionLines:expandedRows.length,
    adjacentPairs:{dhTyped:dhAdjacentPairs.length,p28:p28AdjacentPairs.length,union:expandedAdjacentPairs.length},
    orientations:orientationConfigs,
    trials:expandedAdjacentPairs.length*orientationConfigs.length,
    lexicalHits:expandedLexicalHits.length,
    uniqueLexicalWords:new Set(expandedLexicalHits.map(hit=>hit.word.toLowerCase())).size,
    hitPages:new Set(expandedLexicalHits.map(hit=>hit.page)).size,
    lexicalHitsDetail:expandedLexicalHits,
    hereHits:expandedHereHits
  },
  globalFamily:{
    lines:allSourceRows.length,
    adjacentPairs:globalAdjacentPairs.length,
    orientations:orientationConfigs.length,
    trials:globalAdjacentPairs.length*orientationConfigs.length,
    lexicalHits:globalLexicalHits.length,
    uniqueLexicalWords:new Set(globalLexicalHits.map(hit=>hit.word.toLowerCase())).size,
    hitPages:new Set(globalLexicalHits.map(hit=>hit.page)).size,
    hereHits:globalHereHits
  },
  frozenCrossLineHoldout:{
    selection:"p28 line1 final multi-rune fragment -> p28 line2 first multi-rune fragment",
    source:holdoutFragments.map(fragment=>spell(fragment)),
    endpoints:holdoutFragments.map(fragment=>[fragment[0],fragment[fragment.length-1]]),
    HOutputs:holdoutOutputs,
    outputRunes:holdoutRunes,
    output:holdoutText,
    lexical:lex.has(holdoutText.toLowerCase()),
    promotionGate:"FAIL"
  }
},null,2));
