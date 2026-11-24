'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
// Source: 2013 761.MP3 TXXX tag, normalized to uppercase Latin letters only.
// Search receives no LP2 p57 rune count, rune values, phrase or word boundaries.
function recover(text,checksum,alphabet,weights){
  const factors=[]; let remainder=checksum;
  for(let p=2;p*p<=remainder;p++)while(remainder%p===0){factors.push(p);remainder/=p}
  if(remainder>1)factors.push(remainder);
  if(factors.length!==3||new Set(factors).size!==3)throw Error("Expected three distinct prime factors");
  const orders=factors.flatMap(a=>factors.filter(b=>b!==a).map(b=>[a,b,factors.find(c=>c!==a&&c!==b)]));
  const results=[];
  for(let v=0;v<29;v++){
    const names=[...alphabet.map((s,g)=>[s,g]),["K",5],["Z",15],["ING",21],["IO",27],["V",v]];
    const options=Array.from(text,(_,i)=>names.filter(([s])=>text.startsWith(s,i)).map(([s,g])=>[i+s.length,g]));
    for(const order of orders){
      const memo=new Map();
      /** @param {number} i @param {number} k @param {number} s */
      function visit(i,k,s){
        const id=`${i},${k},${s}`;if(memo.has(id))return memo.get(id);
        let out=[];
        if(i===text.length){if(k===2&&s===order[k])out=[[]]}
        else if(s===order[k]){if(k<2)out=visit(i,k+1,0).map(path=>[[-1,i],...path])}
        else for(const [j,g] of options[i])if(s+weights[g]<=order[k])for(const path of visit(j,k,s+weights[g]))out.push([[g,j],...path]);
        memo.set(id,out);return out;
      }
      for(const path of visit(0,0,0)){
        const runes=[],latinCuts=[],runeCuts=[];
        for(const [g,j] of path){if(g===-1){latinCuts.push(j);runeCuts.push(runes.length)}else runes.push(g)}
        results.push({v,order,latinCuts,runeCuts,runes});
      }
    }
  }
  return {factors,results};
}
const text="LIKETHEINSTARTUNNELINGTOTHESURFACEWEMUSTSHEDOUROWNCIRCUMFERENCESFINDTHEDIVINITYWITHINANDEMERGE";
const checksum=1595277641;
const alphabet=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
const weights=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const output=recover(text,checksum,alphabet,weights);
assert.equal(output.results.length,1);
const r=output.results[0];
assert.deepEqual(r.order,[1259,1031,1229]);
assert.deepEqual(r.latinCuts,[34,64]);
assert.deepEqual(r.runeCuts,[30,60]);
assert.equal(r.v,1);
// Only now consult the original-derived corpus, excluding the 7-rune PARABLE rubric.
const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
assert.deepEqual(r.runes,corpus.pages.find(p=>p.page===57).indices.slice(7));
console.log(JSON.stringify(output,null,2));
module.exports={recover};
