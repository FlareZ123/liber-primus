'use strict';

const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(
  path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));

const mod=x=>((x%29)+29)%29;
const page=corpus.pages.find(p=>p.page===23);
assert(page);
assert.equal(page.indices.length,213);

// Source-only p6->p23 bridge fixes the p23 red four-word lengths/state schedule.
const redLengths=[2,6,3,5];
assert.equal(redLengths.reduce((a,b)=>a+b,0),16);
const body=page.indices.slice(16);
assert.equal(body.length,197);

// Exact solved-p56 semantics: C=P+key mod29; plaintext F=index0 is
// transparent and does not consume key. Exhaustively retain every legal hold.
let states=[{keyIndex:0,holds:[]}];
const trace=[];
for(let i=0;i<body.length;i++){
  const C=body[i];
  const next=[];
  const killed=[];
  for(const st of states){
    if(C===0){
      next.push({keyIndex:st.keyIndex,holds:[...st.holds,i]});
    }
    const key=redLengths[st.keyIndex%redLengths.length];
    const P=mod(C-key);
    if(P!==0){
      next.push({keyIndex:st.keyIndex+1,holds:st.holds});
    }else{
      killed.push({
        keyIndex:st.keyIndex,
        lane:st.keyIndex%redLengths.length,
        key,
        holds:st.holds,
        cipher:C,
      });
    }
  }
  trace.push({bodyOffset:i,pageOffset:i+16,cipher:C,before:states.length,after:next.length,killed});
  states=next;
  if(states.length===0) break;
}

assert.equal(states.length,0);
assert.equal(trace.length,2);
assert.deepEqual(trace[1],{
  bodyOffset:1,
  pageOffset:17,
  cipher:6,
  before:1,
  after:0,
  killed:[{keyIndex:1,lane:1,key:6,holds:[],cipher:6}],
});

console.log(JSON.stringify({
  schema:1,
  page:23,
  redSchedule:redLengths,
  stateReading:['K','a','e','g'],
  receiver:'197-rune black body immediately after 16-rune red rubric',
  cipher:'solved-p56 additive inverse with strict transparent-plaintext-F hold',
  legalPathsAtEnd:states.length,
  collapse:trace.at(-1),
  decision:
    'The literal p23 red-state schedule cannot decode its following black body under solved-p56 semantics: the second body rune G=6 with lane a=6 forces illegal consuming plaintext F.'
},null,2));
