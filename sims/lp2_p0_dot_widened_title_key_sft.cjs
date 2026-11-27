'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

/**
 * Test the observed 13->23 center-column duplication as a literal p0 title-key
 * expansion, not a source-proven cryptographic instruction. No phase tuning.
 * @param {{pages: {page: number, indices: number[]}[],translit:string[]}} corpus
 */
function experiment(corpus) {
  const head = corpus.pages[0].indices.slice(0,13);
  const body = corpus.pages.slice(0,3).flatMap(x=>x.indices).slice(13);
  const control = corpus.pages.find(x=>x.page===57).indices;
  const keys = {
    columnMajor: [...head.slice(0,4),...head.slice(4,9),...head.slice(4,9),...head.slice(4,9),...head.slice(9)],
    rowMajor: head.flatMap((x,i)=>i%3===0?[x,x,x]:[x])
  };
  const mod = n=>(n%29+29)%29;
  // Exact DP counts every legal inverse; keep only an example path per phase.
  function inverse(cipher,key,sign) {
    let states = new Map([[0,{count:1n,example:[]}]]);
    for (let i=0;i<cipher.length;i++) {
      const c=cipher[i],next=new Map();
      function add(j,p,state) {
        const old=next.get(j);
        if(old)old.count+=state.count;
        else next.set(j,{count:state.count,example:[...state.example,p]});
      }
      for(const [j,state] of states) {
        if(c===0)add(j,0,state);
        const p=mod(c+sign*key[j]);
        if(p!==0)add((j+1)%key.length,p,state);
      }
      if(!next.size)return {firstDeadOffset:i,paths:'0'};
      states=next;
    }
    const example=states.values().next().value.example;
    return {firstDeadOffset:null,paths:[...states.values()].reduce((s,x)=>s+x.count,0n).toString(),example};
  }
  function forward(plain,key,sign) {
    let j=0;
    return plain.map(p=>p===0?0:mod(p-sign*key[j++%key.length]));
  }
  if(head.length!==13||body.length!==716||control.length!==95)throw Error('Unexpected source shape');
  const results=[];
  for(const [order,key] of Object.entries(keys))for(const sign of [-1,1]) {
    if(key.length!==23)throw Error('Bad expansion');
    const enc=forward(control,key,sign), ctl=inverse(enc,key,sign);
    if(ctl.paths==='0'||JSON.stringify(forward(ctl.example,key,sign))!==JSON.stringify(enc))throw Error('Control failed');
    const result=inverse(body,key,sign);
    if(result.example&&JSON.stringify(forward(result.example,key,sign))!==JSON.stringify(body))throw Error('Replay failed');
    results.push({order,sign,key,controlPaths:ctl.paths,...result});
  }
  return {head,bodyLength:body.length,results};
}
if(require.main===module){
  console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'))),null,2));
}
module.exports={experiment};
