"use strict";
// #3144: exact conditional uniqueness, no ciphertext scoring or permutation sweep.
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
function experiment(transcription,carryCsv) {
  const sections=transcription.split("%").slice(0,55);
  const pages=Array.from({length:56},(_,i)=>i===50?"":sections[i<50?i:i-1].replace(/[\/\s]/gu,""));
  const rune=c=>/[\u16a0-\u16ff]/u.test(c||"");
  const joins=(order)=>order.slice(0,-1).flatMap((a,i)=>rune(pages[a].at(-1))&&rune(pages[order[i+1]][0])?[[a,order[i+1]]]:[]);
  const original=pages.map((_,i)=>i);
  const carried=carryCsv.trim().split(/\r?\n/).slice(1).map(row=>row.split(",").slice(0,2).map(Number));
  assert.equal(carried.length,32);
  assert.deepEqual(joins(original),carried);
  assert.equal(pages.reduce((n,s)=>n+[...s].filter(rune).length,0),12956);
  const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
  const chains=chapters.map(([a,b])=>{
    let blocks=[[a]];
    for(let i=a+1;i<=b;i++){
      if(carried.some(([u,v])=>u===i-1&&v===i))blocks.at(-1).push(i);
      else blocks.push([i]);
    }
    return blocks.map(p=>({pages:p,start:rune(pages[p[0]][0]),end:rune(pages[p.at(-1)].at(-1))}));
  });
  const shape=i=>chains[i].map(x=>x.pages);
  assert.deepEqual(shape(0),[[0,1,2]]);
  assert.deepEqual(shape(1),[[3,4,5,6,7]]);
  assert.deepEqual(shape(2),[[8,9,10],[11],[12],[13],[14]]);
  assert.deepEqual(shape(3),[[15],[16,17],[18,19,20],[21,22]]);
  assert.deepEqual(shape(4),[[23,24,25,26]]);
  assert.deepEqual(shape(5),[[27,28],[29,30],[31,32]]);
  assert.deepEqual(shape(6),[[33,34],[35,36],[37],[38],[39]]);
  assert.deepEqual(shape(7),[[40,41,42,43,44,45,46,47,48,49],[50],[51,52,53]]);
  assert.deepEqual(shape(8),[[54,55]]);
  // Chapter 3: p13 ends in a rune, only p14 begins with delimiter.
  assert.deepEqual(chains[2].map(x=>[x.start,x.end]),[[true,false],[true,false],[true,false],[true,true],[false,false]]);
  // Thus p13 must immediately precede p14; tree sides fix p11 right, p12 left.
  // Chapter 4: chain 16..17 ends in a rune, only 18..20 begins with delimiter.
  assert.deepEqual(chains[3].map(x=>[x.start,x.end]),[[true,false],[true,true],[false,false],[true,false]]);
  // Chapter 7: printed numbered units force the middle chains in ascending order.
  const numbers=sections.slice(36,39).map(s=>s.match(/[1-5]/g));
  assert.deepEqual(numbers,[["1"],["2","3","4"],["5"]]);
  // Without the alternating-tree side constraint one local counterexample remains.
  const counterexample=original.slice();[counterexample[11],counterexample[12]]=[counterexample[12],counterexample[11]];
  assert.deepEqual(joins(counterexample),carried);
  const imposition=Array.from({length:14},(_,i)=>[55-2*i,2*i,2*i+1,54-2*i]).flat();
  const inverse=imposition.map((_,i)=>imposition.indexOf(i));
  const report=o=>{
    assert.equal(new Set(o).size,56);
    const actual=joins(o),set=new Set(actual.map(String));
    return {joins:actual.length,retained:carried.filter(e=>set.has(String(e))).length,new:actual.filter(e=>!carried.some(x=>String(x)===String(e))).length,
      gridPositions:[49,50,51].map(x=>o.indexOf(x))};
  };
  const a=report(imposition),b=report(inverse);
  assert.deepEqual([a.joins,a.retained,a.new,b.joins,b.retained,b.new],[32,8,24,31,10,21]);
  return {chains,numbers,parityFreeCounterexample:counterexample.slice(8,15),imposition:a,inverse:b};
}
if(require.main===module){
  const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
  console.log(JSON.stringify(experiment(read("resources/liber-primus/lp2-transcription.txt"),read("im-results/lp2-all-32-cross-page-word-boundaries.csv")),null,2));
}
module.exports=experiment;
