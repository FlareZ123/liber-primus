"use strict";

/**
 * Source-only DATA/560.13 to LP2 bridge audit, Director Issue #1229.
 * Searches original pre-existing May–Aug 2014 IRC records for an authored
 * instruction pointing from 2013 CicadaOS pad material to LP2. Node 22 CJS.
 * Exact-source SHA1 checks prevent quietly treating changing mirrors as 2014.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

/** @typedef {{name:string, bytes:number, blob:string}} Archive */
/** @type {Archive[]} */
const archives = [
  {name:"#cicadasolvers.freenode.log",bytes:18487233,blob:"bdd277c14f94c34b5ae714cd00c238065beeed4e"},
  {name:"#33012014.freenode.log",bytes:8629610,blob:"a2880b1db31ce523599ef30ca2e55291bf295900"},
  {name:"#cicadasolvers.freenode.2.log",bytes:27234234,blob:"72634a9d071d32af767edbffc0493d810e88cd0d"},
];
const ref="ade9a02889ef8acbc8cde8edbfd0a785c369f4c3";
const exact=/(?:560[.\/_-]?13\b|DATA[\/_-]?560|118818811|118[,. ]818[,. ]811|db79072c|gbyh7znm6c7ezsmr|12821\b)/i;
const related=/(?:cicada\s?os|cicados|cicada\s?os|\b2013\b.{0,100}\b(?:xor|pad|key|bytes?|data|file|random|cipher)\b|\b(?:xor|pad|key|bytes?|data|file|random|cipher)\b.{0,100}\b2013\b)/i;
const date=/^2014 (?:May|Jun|Jul|Aug) \d\d \d\d:\d\d /;
const lp2=/(?:liber\s?primus|page\s?(?:0?\d|[1-4]\d|5[0-7])\b|\blp2\b|\b2014\b.*\brunes?\b|\bprimus\b|\bbook\b.*\brunes?\b)/i;

/** @param {Buffer} b @returns {string} */
function gitBlob(b){return crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");}
/** @param {string} x @returns {boolean} */
function period(x){return date.test(x);}
/** @param {string[]} rows @param {number} i @returns {string[]} */
function context(rows,i){
  return rows.slice(Math.max(0,i-2),Math.min(rows.length,i+3))
    .map((x,j)=>"L"+(Math.max(0,i-2)+j+1)+": "+x.slice(0,340));
}
async function run(){
  assert(exact.test("2014 Jun 01 DATA/560.13"));
  assert(exact.test("DATA_56013"));
  assert(!exact.test("2014 Jun 01 560 2013"));
  assert(related.test("in 2013 did we xor that file?"));
  let count=0, exactTotal=0, relatedTotal=0, concurrentTotal=0, control=0;
  for(const arc of archives){
    const url="https://raw.githubusercontent.com/neuroretransmit/cicada/"+ref+
      "/irc-logs/"+encodeURIComponent(arc.name);
    const response=await fetch(url);
    assert.equal(response.status,200,"HTTP "+arc.name);
    const b=Buffer.from(await response.arrayBuffer());
    assert.equal(b.length,arc.bytes,"length "+arc.name);
    assert.equal(gitBlob(b),arc.blob,"original Git blob "+arc.name);
    const rows=b.toString("latin1").split(/\r?\n/);
    let periodCount=0, e=0, r=0, both=0;
    const allDateCases=[], focusContexts=[];
    const laterContext=[];
    const seventeenContexts=[];
    let seventeenPeriod=0, seventeenAll=0;
    const exactCases=[], relatedCases=[];
    for(let i=0;i<rows.length;i++){
      const line=rows[i];
      if(exact.test(line))allDateCases.push({line:i+1,text:line.slice(0,420)});
      if(/\b560[.]17\b/.test(line)){
        seventeenAll++;
        if(period(line))seventeenPeriod++;
        seventeenContexts.push({line:i+1,text:line.slice(0,520),dateScope:period(line)?"May-Aug 2014":"other"});
      }
      if(arc.name==="#cicadasolvers.freenode.2.log" && [101552,246982,311210].includes(i+1))
        laterContext.push(...rows.slice(Math.max(0,i-10),Math.min(rows.length,i+11)).map((v,j)=>"L"+(Math.max(0,i-10)+j+1)+": "+v.slice(0,400)));
      if(arc.name==="#cicadasolvers.freenode.log" && [37281,37283,43215,69052].includes(i+1))
        laterContext.push(...context(rows,i));
      if(arc.name==="#cicadasolvers.freenode.log" &&
         line.startsWith("2014 May 19 ") && /AN END|prime.*page\s?56/i.test(line))control++;
      if(!period(line))continue;
      periodCount++;
      if(exact.test(line)){e++; exactCases.push(...context(rows,i));}
      if(related.test(line)){
        r++;
        const originalDay=line.slice(0,11);
        const surrounding=rows.slice(Math.max(0,i-12),Math.min(rows.length,i+13))
          .filter(x=>x.slice(0,11)===originalDay);
        const lp=surrounding.some(x=>lp2.test(x));
        if(lp) both++;
        relatedCases.push({line:i+1,hasNearbyLP2:lp,text:line.slice(0,380)});
        if(arc.name==="#cicadasolvers.freenode.log" && [166643,169246,178178,205055,205108].includes(i+1))
          focusContexts.push(...context(rows,i));
      }
    }
    count+=periodCount; exactTotal+=e;relatedTotal+=r;concurrentTotal+=both;
    console.log("SOURCE "+JSON.stringify({file:arc.name,bytes:arc.bytes,gitBlob:arc.blob,periodLines:periodCount,exactHits:e,relatedHits:r,relatedNearLP2:both}));
    if(exactCases.length)console.log("EXACT_CONTEXTS "+JSON.stringify(exactCases.slice(0,150)));
    console.log("RELATED_CONTEXTS "+JSON.stringify(relatedCases.slice(0,90)));
    console.log("EXACT_ALL_DATES "+JSON.stringify(allDateCases.slice(0,150)));
    console.log("FOCUS_2014_CONTEXTS "+JSON.stringify(focusContexts));
    console.log("HISTORICAL_BROAD_DATE_CONTEXT "+JSON.stringify(laterContext));
    console.log("DATA56017_SOURCE "+JSON.stringify({total:seventeenAll,period2014MayAug:seventeenPeriod,contexts:seventeenContexts.slice(0,100)}));
  }
  assert(control>0,"original-source 19 May p56 positive control");
  console.log("TOTAL "+JSON.stringify({original2014MayAugLines:count,exactHits:exactTotal,relatedHits:relatedTotal,relatedNearLP2:concurrentTotal,positiveHistoricalP56Witnesses:control}));
}
run().catch(e=>{console.error(e);process.exitCode=1;});
