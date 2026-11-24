'use strict';
// Node.js single-file test: original LP2 prime-clock boundary identifiability.
const fs=require('node:fs');
const path=require('node:path');
function experiment(corpus) {
  const check=(b,m)=>{if(!b)throw Error(m)};
  const mod=x=>((x%29)+29)%29;
  const pages=Object.fromEntries(corpus.pages.map(p=>[p.page,p.indices]));
  const alphabet=corpus.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
  const spell=s=>s.split(" ").flatMap(word=>{const a=[];while(word.length){const t=alphabet.find(x=>word.startsWith(x.t));check(t,"invalid GP spelling");a.push(t.i);word=word.slice(t.t.length)}return a});
  const plain=spell("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
  const primes=[];for(let p=2;primes.length<700;p++)if(primes.every(q=>q*q>p||p%q!==0))primes.push(p);
  check(primes[9]===29,"prime anchor");
  // Known plaintext-F is literal and does not advance the clock.
  const observations=(C,P)=>{check(C.length===P.length,"length");return C.flatMap((c,i)=>{if(P[i]===0){check(c===0,"literal F");return []}return [{i,shift:mod(c-P[i])}]})};
  // Every fixed residue lookup emitting all 29 shifts must be bijective.
  // The one occurrence of p=29 requires a shift with count one.
  // The smaller-prime side cannot consume more than the nine primes below 29.
  const anchors=obs=>{
    const hist=Array(29).fill(0);for(const x of obs)hist[x.shift]++;
    check(hist.every(n=>n>0),"full residue coverage required");
    return {hist,candidates:obs.flatMap((x,j)=>hist[x.shift]===1?[{...x,consumedBefore:j,consumedAfter:obs.length-1-j,maxEarlierIncreasing:9-j,maxLaterDecreasing:9-(obs.length-1-j)}]:[])};
  };
  const obs=observations(pages[56],plain);check(obs.length===84,"84 consuming runes");
  let k=0;const replay=plain.map(p=>p===0?0:mod(p+primes[k++]-1));check(replay.every((c,i)=>c===pages[56][i]),"85/85 authentic replay");
  const original=anchors(obs);check(JSON.stringify(original.candidates.map(x=>[x.shift,x.consumedBefore,x.consumedAfter]))===JSON.stringify([[28,9,74],[3,34,49]]),"original singleton anchors");
  const beforeMin=pages[55].filter(x=>x!==0).length;check(beforeMin===73,"p55 73 non-F");
  const inc=original.candidates.filter(x=>x.maxEarlierIncreasing>=0),dec=original.candidates.filter(x=>x.maxLaterDecreasing>=0);
  check(inc.length===1&&inc[0].maxEarlierIncreasing===0&&dec.length===0,"original continuity impossible");
  // Native clear p57 repeated, with a four-consuming-rune hidden prefix.
  // Hide the initial prime counter from the inverse; a fixed noncanonical map
  // and known suffix determine the exact anchor and preceding prime slots.
  const native=pages[57], map=r=>mod(7*r+4);
  const plantedP=native.slice(0,4).concat(Array.from({length:5},()=>native).flat());
  check(plantedP.slice(0,4).every(x=>x!==0),"plant prefix consumes four");
  let cursor=0;const plantedC=plantedP.map(p=>p===0?0:mod(p+map(primes[cursor++]%29)));
  check(cursor<=700,"plant prime supply");
  const plantedObs=observations(plantedC.slice(4),plantedP.slice(4));
  const plant=anchors(plantedObs);
  const feasible=plant.candidates.filter(x=>x.maxEarlierIncreasing>=4);
  check(feasible.length===1&&feasible[0].maxEarlierIncreasing===4&&feasible[0].consumedBefore===5,"blind plant anchor");
  const recovered=plantedC.slice(0,4).map((c,i)=>mod(c-map(primes[i]%29)));
  check(recovered.every((p,i)=>p===plantedP[i]),"reverse recovery with known map");
  return {authenticReplay:85,consumed:obs.length,hist:original.hist,anchors:original.candidates,p55MinimumConsumption:beforeMin,validIncreasingAnchor:inc,validDecreasingAnchors:dec,plant:{knownSuffixLength:plantedP.length-4,consuming:plantedObs.length,anchor:feasible[0],hiddenPrefixRecovered:recovered.length},status:"PASS"};
}
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'))),null,2));
