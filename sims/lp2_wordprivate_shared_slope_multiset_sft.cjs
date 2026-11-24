"use strict";
/** Original source exact five-slope multiset inverse. Node22/CommonJS. */
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
function experiment(input) {
  "use strict";
  const [corpusJSON,transcript,lexicon,...texts]=input;
  const corpus=JSON.parse(corpusJSON);
  const mod=x=>((x%29)+29)%29;
  const inv=Array.from({length:29},(_,a)=>a===0?0:Array.from({length:28},(_,i)=>i+1).find(x=>mod(x*a)===1));
  const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const check=(cond,msg)=>{if(!cond)throw new Error(msg);};
  const index=new Map(corpus.runes.map((x,i)=>[x,i]));
  const tokens=corpus.translit.map((token,i)=>({token,i})).sort((a,b)=>b.token.length-a.token.length);
  /** @param {string} s @returns {number[][]} */
  function words(s){
    const out=[];let cur=[];
    for(const c of s){
      if(index.has(c))cur.push(index.get(c));
      else if("-.$&§".includes(c)&&cur.length){out.push(cur);cur=[];}
    }
    if(cur.length)out.push(cur);
    return out;
  }
  /** @param {string} text @returns {number[]|null} */
  function gp(text){
    const s=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
    const out=[];
    for(let j=0;j<s.length;){
      if(s.startsWith("ING",j)){out.push(21);j+=3;continue;}
      if(s.startsWith("IO",j)){out.push(27);j+=2;continue;}
      const t=tokens.find(t=>s.startsWith(t.token,j));
      if(!t)return null;
      out.push(t.i);j+=t.token.length;
    }
    return out;
  }
  const chunks=transcript.split("%");
  check(chunks.length===57,"page chunk count");
  const original=words(chunks.slice(0,55).join("%"));
  check(original.length===2896&&original.flat().length===12956,"word/rune counts");
  check(eq(original.flat(),corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices)),"original alignment");
  const dictionary=new Map();
  for(const row of lexicon.split(/\r?\n/)){
    const m=/^([a-z]+)\s+\d+$/.exec(row);
    if(!m)continue;
    const p=gp(m[1]);if(!p||p.length<10||p.length>14)continue;
    if(!dictionary.has(p.length))dictionary.set(p.length,new Map());
    dictionary.get(p.length).set(p.join(","),p);
  }
  const byLen=new Map([...dictionary].map(([l,m])=>[l,[...m.values()]]));
  /** @param {number[]} c @param {number[]} p @param {boolean} hold
   * @returns {number[]|null} sorted necessary slope requirements, zero slots omitted */
  function relation(c,p,hold){
    if(c.length!==p.length)return null;
    const x=Array(5).fill(-1),y=Array(5).fill(-1),a=Array(5).fill(0);
    let t=0;
    for(let i=0;i<c.length;i++){
      if(hold&&p[i]===0){if(c[i]!==0)return null;continue;}
      const j=t++%5;
      if(x[j]<0){x[j]=p[i];y[j]=c[i];continue;}
      const dp=mod(p[i]-x[j]),dc=mod(c[i]-y[j]);
      if(dp===0){if(dc!==0)return null;continue;}
      if(dc===0)return null;
      const slope=mod(dc*inv[dp]);
      if(a[j]&&a[j]!==slope)return null;
      a[j]=slope;
    }
    return a.filter(Boolean).sort((a,b)=>a-b);
  }
  const encode=a=>a.reduce((n,x)=>n*29+x,0);
  function decode(n){const a=Array(5);for(let j=4;j>=0;j--){a[j]=n%29;n=Math.floor(n/29);}return a;}
  function contains(k,r){
    let j=0;for(const a of k)if(a===r[j])j++;
    return j===r.length;
  }
  function domain(c,hold){
    const rows=[],map=new Map();
    for(const p of byLen.get(c.length)||[]){
      const req=relation(c,p,hold);if(req===null)continue;
      rows.push({p,req});map.set(req.join(","),req);
    }
    return {rows,reqs:[...map.values()]};
  }
  function extensions(reqs){
    const out=new Set();
    for(const req of reqs){
      const missing=5-req.length;
      function go(extra,start){
        if(extra.length===missing){out.add(encode([...req,...extra].sort((a,b)=>a-b)));return;}
        for(let a=start;a<=28;a++)go([...extra,a],a);
      }
      go([],1);
    }
    return out;
  }
  // Verify multiset extension and duplicate counting for arbitrary slope arrangements.
  check(extensions([[2,2,9,18,27]]).size===1,"full multiset");
  check(extensions([[2,2,9,18]]).size===28,"one free slope");
  check(extensions([[2,2,9]]).size===406,"two free slopes");
  check(extensions([[]]).size===201376,"full key space");
  check(contains([2,2,9,18,27],[2,2,27])&&!contains([2,2,9,18,27],[2,2,2]),"multiplicity");
  function fit(rows,hold){
    if(!rows.length)return {keys:null,trace:[]};
    const domains=rows.map(w=>({id:w.id,d:domain(w.c,hold)}));
    const cost=[1,28,406,4060,31465,201376];
    domains.sort((a,b)=>a.d.reqs.reduce((n,q)=>n+cost[5-q.length],0)-b.d.reqs.reduce((n,q)=>n+cost[5-q.length],0));
    let keys=null;const trace=[];
    for(const {id,d} of domains){
      if(keys===null)keys=extensions(d.reqs);
      else{
        for(const k of keys){
          const a=decode(k);
          if(!d.reqs.some(q=>contains(a,q)))keys.delete(k);
        }
      }
      trace.push({id,lexicalCandidates:d.rows.length,partialRelations:d.reqs.length,keys:keys.size});
      if(keys.size===0)break;
    }
    return {keys,trace};
  }
  function predict(fitKeys,rows,hold,truth=null){
    if(!fitKeys||!fitKeys.size)return null;
    const keys=new Set(fitKeys),counts=[],decoded=[];
    for(let i=0;i<rows.length;i++){
      const d=domain(rows[i].c,hold),valid=[];
      for(const k of keys){
        const a=decode(k);
        if(!d.reqs.some(q=>contains(a,q)))keys.delete(k);
      }
      if(fitKeys.size===1){
        const a=decode([...fitKeys][0]);
        for(const row of d.rows)if(contains(a,row.req))valid.push(row.p);
      }
      counts.push({id:rows[i].id,remainingKeys:keys.size,lexicalCandidates:d.rows.length,uniqueKeyCandidateCount:fitKeys.size===1?valid.length:null,truthAdmitted:truth?valid.some(x=>eq(x,truth[i])):null,uniquePlaintext:valid.length===1?valid[0]:null});
      if(valid.length===1)decoded.push(valid[0]);
    }
    return {initialKeys:fitKeys.size,allWithheldCompatible:keys.size,trace:counts};
  }
  let rng=0x35c1f917;
  function draw(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n;}
  function shuffle(a){a=a.slice();for(let j=a.length-1;j>0;j--){const i=draw(j+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
  function plant(p,key,hold){
    const a=shuffle(key),b=Array.from({length:5},()=>draw(29));
    let t=0;
    const c=p.map(x=>{if(hold&&x===0)return 0;const j=t++%5;return mod(a[j]*x+b[j]);});
    t=0;
    const dec=c.map((x,i)=>{if(hold&&p[i]===0){check(x===0,"hold emit");return 0;}const j=t++%5;return mod(inv[a[j]]*(x-b[j]));});
    check(eq(p,dec),"planted exact inverse");
    const req=relation(c,p,hold);
    check(req!==null&&contains(key,req),"planted relation");
    return c;
  }
  const controls=[];
  const secretKeys=[[3,8,11,17,25],[2,2,9,18,27],[1,7,13,19,28]];
  for(let n=0;n<texts.length;n++){
    const selected=[],seen=new Set();
    for(const token of texts[n].match(/[A-Za-z]+/g)||[]){
      const p=gp(token);if(!p||!dictionary.get(p.length)?.has(p.join(","))||seen.has(p.join(",")))continue;
      selected.push(p);seen.add(p.join(","));if(selected.length===24)break;
    }
    check(selected.length===24,"control source needs 24 eligible distinct long words");
    for(const hold of [false,true]){
      const key=secretKeys[n],rows=selected.map((p,id)=>({id,c:plant(p,key,hold)}));
      const f=fit(rows.slice(0,12),hold);
      check(f.keys.has(encode(key)),"true key must survive fitting");
      const pred=predict(f.keys,rows.slice(12),hold,selected.slice(12));
      check(pred.allWithheldCompatible>=1,"true key must survive heldout");
      controls.push({source:n,hold,key,fitKeys:f.keys.size,exactKey:f.keys.size===1,fitTrace:f.trace,heldout:pred,heldoutTruthAdmitted:pred.trace.filter(x=>x.truthAdmitted).length,heldoutUniqueTruth:pred.trace.filter(x=>x.truthAdmitted&&x.uniqueKeyCandidateCount===1).length});
    }
  }
  // Authentic clear p57 as an independent native rune control, including literal F.
  const p57=words(chunks[56]);check(eq(p57.flat(),corpus.pages.find(p=>p.page===57).indices),"clear p57 alignment");
  for(const hold of [false,true])for(const p of p57)plant(p,secretKeys[0],hold);
  const pageStart=new Map();let pos=0;
  for(const p of corpus.pages){pageStart.set(p.page,pos);pos+=p.indices.length;}
  const chapterPages=[0,3,8,15,23,27,33,40,54,56];
  const chapterBounds=chapterPages.map(p=>pageStart.get(p));
  const records=[];pos=0;
  for(let id=0;id<original.length;id++){
    const c=original[id];if(c.length>=10&&c.length<=14)records.push({id,c,pos});
    pos+=c.length;
  }
  check(records.length===109,"long source words");
  const scopes=[{name:"book",lo:0,hi:12956},...chapterPages.slice(0,-1).map((p,i)=>({name:`p${p}-${chapterPages[i+1]-1}`,lo:chapterBounds[i],hi:chapterBounds[i+1]}))];
  const result=[];
  for(const hold of [false,true]){
    const individual=records.map(w=>({id:w.id,length:w.c.length,zeroFree:!w.c.includes(0),candidates:domain(w.c,hold).rows.length}));
    const scopesResult=[];
    for(const s of scopes){
      const mid=Math.floor((s.lo+s.hi)/2);
      const rows=records.filter(w=>w.pos>=s.lo&&w.pos<s.hi);
      const train=rows.filter(w=>w.pos<mid),test=rows.filter(w=>w.pos>=mid);
      const f=fit(train,hold);
      const pred=predict(f.keys,test,hold);
      scopesResult.push({scope:s.name,train:train.length,test:test.length,fitKeys:f.keys?.size??null,fitTrace:f.trace,heldout:pred,privateEmpty:rows.filter(w=>individual.find(x=>x.id===w.id).candidates===0).map(w=>w.id)});
    }
    result.push({hold,privateEmpty:individual.filter(w=>!w.candidates).length,privateEmptyZeroFree:individual.filter(w=>w.zeroFree&&!w.candidates).length,individual,scopes:scopesResult});
  }
  return {dictionary:Object.fromEntries([...byLen].map(([l,p])=>[l,p.length])),controlP57Runes:p57.flat().length,controls,result};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
const input=paths.map(p=>fs.readFileSync(path.join(root,p),"utf8"));
console.log(JSON.stringify(experiment(input),null,2));
