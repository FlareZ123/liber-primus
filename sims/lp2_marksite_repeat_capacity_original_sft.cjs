"use strict";
/**
 * Original-source count bound for LP2 repeat-limited GP29 codes whose only
 * auxiliary channel is the visible position of the 31 page-local large marks.
 * Read-only, Windows Node.js 22 / CommonJS, no third-party packages.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

/** @param {number} n */
function logFact(n){
  /** @type {number[]} */
  const f=[0];
  for(let i=1;i<=n;i++)f[i]=f[i-1]+Math.log2(i);
  return f;
}
/** @param {number[]} f @param {number} n @param {number} k */
function chooseLog(f,n,k){return f[n]-f[k]-f[n-k];}
/** @param {number[]} x */
function logSum2(x){const m=Math.max(...x);return m+Math.log2(x.reduce((s,v)=>s+2**(v-m),0));}
function smallExhaustivePositive(){
  let actual=0;
  for(let v=0;v<243;v++){
    let x=v;const a=[];
    for(let i=0;i<5;i++){a.push(x%3);x=Math.floor(x/3);}
    const e=Number(a[1]===a[0])+Number(a[3]===a[2])+Number(a[4]===a[3]);
    if(e<=1)actual++;
  }
  // Two independent page initials, three predecessor transitions.
  assert.equal(actual,3**2*(2**3+3*2**2));
  assert.equal(actual,180);
}

function main(){
  smallExhaustivePositive();
  const base=path.join(__dirname,"..","resources","liber-primus");
  const raw=fs.readFileSync(path.join(base,"lp2-transcription.txt"),"utf8");
  const ink=JSON.parse(fs.readFileSync(path.join(base,"lp2-ink-annotations.json"),"utf8"));
  const isRune=(x)=>/[\u16a0-\u16ff]/u.test(x);
  const parts=raw.split("%").slice(0,55);
  assert.equal(parts.length,55);
  const pages=parts.map(p=>[...p].filter(isRune));
  const sizes=Array.from({length:56},(_,i)=>i===50?0:pages[i<50?i:i-1].length);
  const n=sizes.reduce((a,b)=>a+b,0);
  const nPages=sizes.filter(x=>x>0).length;
  assert.equal(n,12956);assert.equal(nPages,55);
  const words=parts.join("%").split(/[-.]/).map(x=>[...x].filter(isRune).length).filter(Boolean).length;
  assert.equal(words,2896);

  let transitions=0,repeats=0;
  /** @type {{m:number,r:number}[]} */
  const observations=[];
  for(const chars of pages){
    const m=chars.length-1;
    let r=0;
    for(let i=1;i<chars.length;i++)r+=Number(chars[i]===chars[i-1]);
    transitions+=m;repeats+=r;
    observations.push({m,r});
  }
  assert.equal(transitions,12901);assert.equal(repeats,86);
  /** @type {{page:number,offset:number,type:string,slots:number}[]} */
  const marks=[];
  for(const p of ink.pages){
    if(p.page>55)continue;
    assert.equal(p.rune_count,sizes[p.page]);
    for(const m of p.large_punctuation||[]){
      assert(m[0]>=0&&m[0]<=sizes[p.page]);
      marks.push({page:p.page,offset:m[0],type:String(m[1])+"_"+m[2],slots:p.rune_count+1});
    }
  }
  assert.equal(marks.length,31);
  const types=marks.reduce((o,m)=>{o[m.type]=(o[m.type]||0)+1;return o;},{});
  assert.deepEqual(types,{"13_red":27,"13_black":1,"10_red":3});
  const physicalSites=new Set(marks.map(x=>String(x.page)+":"+x.offset));
  assert.equal(physicalSites.size,30); // Two marks flank a single p7 source-rune seam.
  // Under the source-visible red-span grammar, all red/black boundaries
  // except three attach to a page edge or one of the counted large marks.
  // Generously grant each unanchored endpoint any page-local glyph seam.
  let redRuneCount=0,redSpanCount=0;
  /** @type {{page:number,offset:number,kind:string,slots:number}[]} */
  const extraRedEndpoints=[];
  for(const p of ink.pages){
    if(p.page>55)continue;
    const markOffsets=new Set((p.large_punctuation||[]).map(m=>m[0]));
    for(const span of p.red_spans||[]){
      redSpanCount++;redRuneCount+=span.length;
      const end=span.start+span.length;
      assert(span.length>0&&span.start>=0&&end<=p.rune_count);
      if(span.start!==0&&!markOffsets.has(span.start)){
        extraRedEndpoints.push({page:p.page,offset:span.start,kind:"start",slots:p.rune_count+1});
      }
      if(end!==p.rune_count&&!markOffsets.has(end)){
        extraRedEndpoints.push({page:p.page,offset:end,kind:"end",slots:p.rune_count+1});
      }
    }
  }
  assert.equal(redSpanCount,16);assert.equal(redRuneCount,213);
  assert.deepEqual(extraRedEndpoints.map(x=>[x.page,x.kind,x.offset]),[
    [8,"end",12],[40,"end",8],[53,"start",128]
  ]);
  const extraRedBits=extraRedEndpoints.reduce((s,x)=>s+Math.log2(x.slots),0);
  assert(Math.abs(extraRedBits-23.3498340915)<0.000001);
  // A stricter page-isolated corollary: these original pages have zero repeats
  // and no source-large mark or red span to carry per-page exception metadata.
  const annotationByPage=new Map(ink.pages.map(p=>[p.page,p]));
  const zeroRepeatUnmarked=[];
  for(const p of ink.pages){
    if(p.page>55||p.rune_count===0)continue;
    const a=annotationByPage.get(p.page);
    const runeList=pages[p.page<50?p.page:p.page-1];
    const r=runeList.slice(1).reduce((q,c,i)=>q+Number(c===runeList[i]),0);
    if(r===0&&(a.large_punctuation||[]).length===0&&(a.red_spans||[]).length===0){
      zeroRepeatUnmarked.push({
        page:p.page,runes:runeList.length,
        universalGP29DeficitBits:-(runeList.length-1)*Math.log2(28/29)
      });
    }
  }
  assert.deepEqual(zeroRepeatUnmarked.map(x=>x.page),[5,13,17,28,31,37]);
  const f=logFact(n+nPages+2);
  const logP=(m,r)=>chooseLog(f,m,r)+r*Math.log2(1/29)+(m-r)*Math.log2(28/29);
  const exact=logP(transitions,repeats);
  const capped=logSum2(Array.from({length:repeats+1},(_,r)=>logP(transitions,r)));
  const pageFixed=observations.reduce((s,o)=>s+logP(o.m,o.r),0);
  // Grant each individual mark its own independently movable page-local seam.
  // This overcounts collisions and ignores that most marks share a printed type.
  const local=marks.reduce((s,m)=>s+Math.log2(m.slots),0);
  const localTwoSides=local+marks.length;
  const localFourSides=local+2*marks.length;
  const localEightSides=local+3*marks.length;
  // Global relocation is a distinct, far less restricted receiver hypothesis.
  const globalSlots=n+nPages;
  const globalTyped31=chooseLog(f,globalSlots,31)+f[31]-f[27]-f[3]-f[1];
  const gapBits=chooseLog(f,n-1,words-1);
  assert(Math.abs(exact+325.749609732)<0.00001);
  assert(Math.abs(capped+325.450254184)<0.00001);
  assert(Math.abs(pageFixed+445.73156)<0.0001);
  assert(Math.abs(local-234.502803174)<0.00001);
  assert(localFourSides < -capped - 28);
  assert(localFourSides+extraRedBits < -capped);
  assert(localEightSides+extraRedBits > -capped);
  assert(localEightSides > -capped);
  assert(globalTyped31 > -capped);
  console.log(JSON.stringify({
    source:{runes:n,pages:nPages,words,transitions,repeats,largeMarks:marks.length,markTypes:types,uniquePageRuneSites:physicalSites.size},
    repeatCapDeficitBits:{exact86:-exact,atMost86:-capped,perPageObservedCounts:-pageFixed},
    pageLocalMarkUpperBoundBits:{oneSitePerSeam:local,twoSitesPerSeam:localTwoSides,fourSitesPerSeam:localFourSides,eightSitesPerSeam:localEightSides},
    redInk:{runeCount:redRuneCount,spanCount:redSpanCount,freeEndpoints:extraRedEndpoints,additionalEndpointCapacityBits:extraRedBits},
    zeroRepeatNoMarkNoRedPages:zeroRepeatUnmarked,
    pageLocalMarkPlusRedUpperBoundBits:{oneSitePerSeam:local+extraRedBits,fourSitesPerSeam:localFourSides+extraRedBits},
    deficitWithFourSlotMarksAndAllFreeRedEndpoints:-capped-localFourSides-extraRedBits,
    globallyMovable31TypedMarksBits:globalTyped31,
    originalWordGapArrangementBits:gapBits,
    extraBitsNeededWithFourPageLocalSlots:-capped-localFourSides,
    claim:"Conditional pigeonhole obstruction for universal GP29 plaintext with arbitrary but preserved word-gap placements and an output repeat cap of 86; not a claim of an LP2 decipherment."
  },null,2));
  console.log("PASS original-source bounded capacity and exhaustive small-alphabet control");
}
main();
