"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
/** @param {string} relative @returns {string} */
function read(relative){return fs.readFileSync(path.join(root,relative),"utf8").replace(/\r/g,"");}

const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed2016=read("resources/historical/cicada2016-4gq25-outguess.asc");
const source2014=JSON.parse(read("resources/cicada2014-sexagesimal-source.json"));
const sourceAudit=read("im-results/lp2-p50-author-era-alphabet-source-audit.md");

const ri=new Map(corpus.runes.map((r,i)=>[r,i]));
const cells=grid.pages.flatMap(p=>p.tokens);
const alphabet60=grid.alphabet;
const alphabet59=alphabet60.replace("f","");
const gpTokens=corpus.translit.map((symbol,value)=>({symbol,value}))
  .sort((a,b)=>b.symbol.length-a.symbol.length);

assert.equal(cells.length,256);
assert.equal(alphabet60.length,60);
assert.equal(alphabet59.length,59);

/** @param {string} token @param {string} alphabet @returns {number} */
function decode(token,alphabet){
  const hi=alphabet.indexOf(token[0]),lo=alphabet.indexOf(token[1]);
  assert.ok(hi>=0&&lo>=0);
  return hi*alphabet.length+lo;
}

/** @param {string} word @returns {number[]} */
function gp(word){
  const n=word.toUpperCase()
    .replace(/QU/g,"CW").replace(/K/g,"C").replace(/Q/g,"C")
    .replace(/V/g,"U").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
  const out=[];
  for(let i=0;i<n.length;){
    if(n.startsWith("ING",i)){out.push(21);i+=3;continue;}
    if(n.startsWith("IO",i)){out.push(27);i+=2;continue;}
    const token=gpTokens.find(item=>n.startsWith(item.symbol,i));
    assert.ok(token,"unmapped "+word+" at "+i);
    out.push(token.value);i+=token.symbol.length;
  }
  return out;
}

/**
 * @param {string} sectionName
 * @returns {{runeCount:number,words:Array<{n:number,start:number,end:number,values:number[],gp0:number}>}}
 */
function parseSolved(sectionName){
  const section=solved.sections.find(item=>item.name===sectionName);
  assert.ok(section);
  const words=[];let current=[],start=0,offset=0;
  function flush(){
    if(!current.length)return;
    words.push({n:words.length+1,start,end:offset-1,values:current.slice(),
      gp0:current.reduce((a,b)=>a+b,0)});
    current=[];
  }
  for(const ch of [...section.source_text]){
    const value=ri.get(ch);
    if(value!==undefined){if(!current.length)start=offset;current.push(value);offset+=1;}
    else flush();
  }
  flush();
  return {runeCount:offset,words};
}

/** @param {number} n @param {number} k @returns {number} */
function choose(n,k){
  if(k<0||k>n)return 0;
  const m=Math.min(k,n-k);let out=1;
  for(let i=1;i<=m;i+=1)out*=((n-m+i)/i);
  return out;
}
/** @param {number} N @param {number} K @param {number} n @param {number} observed @returns {number} */
function hypergeomTail(N,K,n,observed){
  const den=choose(N,n);let num=0;
  for(let k=observed;k<=Math.min(K,n);k+=1)num+=choose(K,k)*choose(N-K,n-k);
  return num/den;
}
/** @param {number[]} a @param {number[]} b @returns {boolean} */
function sameValues(a,b){return a.length===b.length&&a.every((v,i)=>v===b[i]);}

const pages={p56:parseSolved("p56_an_end"),p57:parseSolved("p57_parable")};
assert.deepEqual(Object.fromEntries(Object.entries(pages).map(([k,p])=>[k,[p.runeCount,p.words.length]])),
  {p56:[85,25],p57:[95,20]});

/**
 * Strict transfer family: no generic "boundary" success. A source solved word
 * addresses p50; the numeric value must equal the exact start/end of the same
 * ordinal or immediate-next ordinal word on a fixed solved receiver page.
 */
const strict=[];
for(const sourcePage of ["p56","p57"]){
  const source=pages[sourcePage];
  for(const radix of [60,59])for(const origin of [0,1])
    for(const receiverPage of ["p56","p57"])
      for(const relation of ["selfStart","selfEnd","nextStart","nextEnd"]){
        const alphabet=radix===60?alphabet60:alphabet59;
        const hits=[];let attempts=0;
        for(let i=0;i<source.words.length;i+=1){
          const word=source.words[i];
          if(word.gp0>255)continue;
          const targetIndex=relation.startsWith("next")?i+1:i;
          const target=pages[receiverPage].words[targetIndex];
          if(!target)continue;
          attempts+=1;
          const value=decode(cells[word.gp0],alphabet)-origin;
          const expected=relation.endsWith("Start")?target.start:target.end;
          if(value===expected)hits.push({sourceWord:word.n,sourceGp0:word.gp0,value,targetWord:target.n});
        }
        strict.push({sourcePage,radix,origin,receiverPage,relation,attempts,hits});
      }
}
assert.equal(strict.length,64);
assert.equal(Math.max(...strict.filter(x=>x.sourcePage==="p57").map(x=>x.hits.length)),0);
assert.equal(Math.max(...strict.filter(x=>x.sourcePage==="p56").map(x=>x.hits.length)),1);
assert.equal(strict.filter(x=>x.hits.length===1).length,8);
assert.ok(strict.filter(x=>x.hits.length===1).every(x=>x.hits[0].sourceGp0===42));

/**
 * Weaker transfer family: decoded value may land on any printed word boundary
 * in the fixed receiver page. This checks whether the strict negative is only
 * an identity/ordinal artifact.
 */
const broad=[];
for(const sourcePage of ["p56","p57"])for(const receiverPage of ["p56","p57"])
  for(const radix of [60,59])for(const origin of [0,1]){
    const alphabet=radix===60?alphabet60:alphabet59;
    const receiverBoundaries=new Set(pages[receiverPage].words.flatMap(w=>[w.start,w.end]));
    const unique=[...new Map(pages[sourcePage].words.filter(w=>w.gp0<=255).map(w=>[w.gp0,w])).values()];
    const hits=unique.map(word=>({sourceWord:word.n,sourceGp0:word.gp0,
      value:decode(cells[word.gp0],alphabet)-origin}))
      .filter(row=>receiverBoundaries.has(row.value));
    const tableSuccesses=cells.filter(token=>receiverBoundaries.has(decode(token,alphabet)-origin)).length;
    const p=hypergeomTail(256,tableSuccesses,unique.length,hits.length);
    broad.push({sourcePage,receiverPage,radix,origin,n:unique.length,K:tableSuccesses,hits,p});
  }
assert.equal(broad.length,16);
const broadBest=broad.reduce((a,b)=>b.p<a.p?b:a);
assert.deepEqual(
  [broadBest.sourcePage,broadBest.receiverPage,broadBest.radix,broadBest.origin,broadBest.hits.length],
  ["p57","p56",59,0,5]
);
assert.ok(Math.abs(broadBest.p-0.15801159315122607)<1e-12);
const base60Peer=broad.find(x=>x.sourcePage==="p57"&&x.receiverPage==="p56"&&x.radix===60&&x.origin===0);
assert.equal(base60Peer.hits.length,5);
assert.ok(Math.abs(base60Peer.p-0.20693089979482865)<1e-12);
assert.equal(Math.min(1,broadBest.p*broad.length),1);

// Authenticated-2016 source control: under every radix/origin/solved page/start-end
// choice, no signed natural word points to an exact solved occurrence of itself.
const clear=signed2016.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clear);
const signedWords=[...new Set(clear[1].match(/\b[A-Za-z]+\b/gu)||[])];
let signedCharged=0;const signedIdentityHits=[];
for(const radix of [60,59])for(const origin of [0,1])
  for(const receiverPage of ["p56","p57"])for(const boundary of ["start","end"]){
    const alphabet=radix===60?alphabet60:alphabet59;
    for(const sourceWord of signedWords){
      const values=gp(sourceWord);
      const address=values.reduce((a,b)=>a+b,0);
      if(address>255)continue;
      signedCharged+=1;
      const value=decode(cells[address],alphabet)-origin;
      const target=pages[receiverPage].words.find(w=>w[boundary]===value);
      if(target&&sameValues(target.values,values)){
        signedIdentityHits.push({radix,origin,receiverPage,boundary,sourceWord,address,value,targetWord:target.n});
      }
    }
  }
assert.equal(signedCharged,560);
assert.deepEqual(signedIdentityHits,[]);

// Historical type boundary. Preserved 2014 participant tooling converts the
// decimal stream to bytes only. The bounded historical audit records no
// creator-authored p49-51 codec, and no text/rune/book-offset instruction.
assert.match(source2014.conversion,/pack 'C'/u);
assert.doesNotMatch(source2014.converter_source,/offset|position|index|rune|word|book/iu);
assert.match(sourceAudit,/No creator-authored p49–51 codec/u);
assert.match(sourceAudit,/number or byte/u);

console.log(JSON.stringify({
  status:"PASS",
  issue:1725,
  strict:{
    configurations:strict.length,
    p56TrainingMax:Math.max(...strict.filter(x=>x.sourcePage==="p56").map(x=>x.hits.length)),
    p57HoldoutMax:Math.max(...strict.filter(x=>x.sourcePage==="p57").map(x=>x.hits.length)),
    oneHitConfigurations:strict.filter(x=>x.hits.length===1)
  },
  broad:{
    configurations:broad.length,
    best:broadBest,
    base60ZeroPeer,
    familywiseBonferroni:Math.min(1,broadBest.p*broad.length)
  },
  signed2016:{charged:signedCharged,exactSolvedIdentityHits:signedIdentityHits},
  history:{
    participant2014Conversion:source2014.conversion,
    creatorAuthoredRuneOffsetInstruction:false
  },
  decision:"FAIL OUTPUT-TYPE AUTHENTICATION: base60 zero-origin rune offsets do not transfer on solved exact landmarks, are not enriched over the charged family, do not reproduce authenticated-2016 words on solved pages, and have no creator-authored historical offset semantics. Keep #1706 as exceptional geometry under an unauthenticated receiver type."
},null,2));
