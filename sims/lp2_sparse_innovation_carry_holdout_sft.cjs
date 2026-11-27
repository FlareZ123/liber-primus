#!/usr/bin/env node
'use strict';

// #3251: exact prefix-only carry-state test for the calibrated #3231
// piecewise-constant first-difference GP29 keystream.
// At each source-confirmed page-spanning group, hide the first suffix rune and
// every later constraint.  From the prefix minimum-cost states only, enumerate
// the plaintext value(s) possible for that next ciphertext rune.
//
// A held Gibran native plant uses the exact LP2 83 singleton-anchor positions,
// but reveals the TRUE rune at every anchor (strictly stronger than original
// A/I/O ambiguity).  Compare a genuine continuous sparse-key plant against a
// page-reset rival on the exact physical page/carry geometry.

const fs=require('fs');
const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const src=fs.readFileSync('resources/liber-primus/lp2-transcription.txt','utf8');
const gibran=fs.readFileSync('resources/control/gibran_prophet_58585.txt','utf8');
const q=29,S=q*q,INF=30000,mod=x=>(x%q+q)%q;
const lookup=new Map(corpus.runes.map((x,i)=>[x,i]));

// Unknown tape, true complete printed groups, singleton positions.
const tape=[],words=[];let word=[];
for(const ch of [...src]){
  if(tape.length>=12956)break;
  if(lookup.has(ch)){word.push({i:tape.length,c:lookup.get(ch)});tape.push(lookup.get(ch));}
  else if(ch!=='%'&&ch!=='/'&&!/\s/u.test(ch)&&word.length){words.push(word);word=[];}
}
if(word.length)words.push(word);
const singleton=words.filter(x=>x.length===1).map(x=>x[0].i);
if(tape.length!==12956||words.length!==2896||singleton.length!==83)throw Error('geometry mismatch');

// Exact physical carry suffix positions: rune on both sides of a page break.
const chars=[...src];let rp=0;const carry=[];
for(let i=0;i<chars.length;i++){
  if(lookup.has(chars[i]))rp++;
  if(rp>=12956)break;
  if(chars[i]==='%'){
    let a=i-1,b=i+1;
    while(a>=0&&(/\s/u.test(chars[a])||chars[a]==='/'))a--;
    while(b<chars.length&&(/\s/u.test(chars[b])||chars[b]==='/'))b++;
    if(lookup.has(chars[a])&&lookup.has(chars[b]))carry.push(rp);
  }
}
if(carry.length!==32)throw Error('expected 32 carry groups');

const ALL=(1<<29)-1;
const mask=xs=>xs.reduce((a,x)=>a|(1<<x),0);
function originalMask(allowed){
  const A=new Int32Array(tape.length).fill(ALL),m=mask(allowed);
  for(const i of singleton)A[i]=m;
  return A;
}

// Prefix-only minimum-cost options. State = [key for next consuming rune,
// previous slope].  The target is inspected BEFORE consuming it, so no future
// ciphertext/anchor can influence its prediction.
function prefixOptions(C,A,F,targets,truth=null){
  let D=new Int16Array(S),E=new Int16Array(S);
  const wanted=new Set(targets),rows=[];
  for(let i=0;i<C.length;i++){
    if(wanted.has(i)){
      const best=Math.min(...D),keys=new Set(),opts=new Set();
      for(let st=0;st<S;st++)if(D[st]===best){
        const k=Math.floor(st/q);keys.add(k);
        const p=mod(C[i]-k);
        if(A[i]&(1<<p))opts.add(p);
        if(F&&C[i]===0&&(A[i]&1))opts.add(0);
      }
      rows.push({i,prefixCost:best,keyCount:keys.size,options:[...opts].sort((a,b)=>a-b),truth:truth?truth[i]:undefined});
    }
    E.fill(INF);const c=C[i],a=A[i];
    if(F&&c===0&&(a&1))E.set(D);
    for(let k=0;k<q;k++){
      const p=mod(c-k);
      if(!(a&(1<<p))||(F&&p===0))continue;
      let best=INF;
      for(let d=0;d<q;d++)best=Math.min(best,D[k*q+d]);
      for(let e=0;e<q;e++){
        const j=mod(k+e)*q+e;
        E[j]=Math.min(E[j],D[k*q+e],best+1);
      }
    }
    [D,E]=[E,D];
  }
  return rows;
}

// Original conditional predictions, deliberately NOT promoted to plaintext.
const original={};
for(const F of [false,true]){
  const rows=prefixOptions(tape,originalMask([24,10,3]),F,carry);
  original[F?'transparent_F':'ordinary']={
    forced:rows.filter(x=>x.options.length===1),
    optionCounts:rows.map(x=>x.options.length)
  };
}

// Native GP conversion.
const value=new Map(corpus.translit.map((x,i)=>[x,i]));
const compounds=['ING','TH','NG','EO','OE','AE','IA','EA'];
function gpText(txt){
  const out=[];
  for(const ww of (txt.match(/[A-Za-z]+/g)||[])){
    const s=ww.toUpperCase();let a=[],ok=true;
    for(let p=0;p<s.length;){
      const t=compounds.find(v=>s.startsWith(v,p))||s[p];
      const v=value.get(t==='ING'?'NG':t);
      if(v===undefined){ok=false;break;}
      a.push(v);p+=t.length;
    }
    if(ok)out.push(...a);
  }
  return out;
}
const P=gpText(gibran).slice(5000,17956);
if(P.length!==12956)throw Error('short native control');
const A=new Int32Array(P.length).fill(ALL);
for(const i of singleton)A[i]=1<<P[i]; // stronger than original grammar

// Genuine continuous plant with 30 deterministic innovations.
let k=7,d=4;const continuous=[],changes=new Map();
for(let j=0;j<30;j++){let nd=(5+7*j)%29;if(nd===0)nd=1;changes.set(300+j*400,nd);}
for(let i=0;i<P.length;i++){
  continuous.push(mod(P[i]+k));
  if(changes.has(i))d=changes.get(i);
  k=mod(k+d);
}
const cr=prefixOptions(continuous,A,false,carry,P);

// Independent page-reset rival.
const pageStarts=[];let off=0;
for(const pg of corpus.pages.slice(0,56)){pageStarts.push(off);off+=pg.runic_count;}
const resetSet=new Set(pageStarts);k=7;d=4;const reset=[];
for(let i=0;i<P.length;i++){
  if(resetSet.has(i)){k=7;d=4;}
  reset.push(mod(P[i]+k));k=mod(k+d);
}
const rr=prefixOptions(reset,A,false,carry,P);

function score(rows){
  const forced=rows.filter(x=>x.options.length===1);
  return {
    carryCount:rows.length,
    forcedCount:forced.length,
    forcedCorrect:forced.filter(x=>x.options[0]===x.truth).length,
    truthInMinimum:rows.filter(x=>x.options.includes(x.truth)).length,
    optionCounts:rows.map(x=>x.options.length),
    forced:forced.map(x=>({i:x.i,pred:x.options[0],truth:x.truth,correct:x.options[0]===x.truth}))
  };
}

console.log(JSON.stringify({
  geometry:{singletonAnchors:singleton.length,carrySuffixPositions:carry},
  originalConditional:original,
  continuousNativeControl:score(cr),
  pageResetNativeControl:score(rr),
  decision:'The #3231 minimum-innovation state is not suffix-predictive under strict prefix holdout: even the true continuous plant makes 7/21 forced calls wrong and excludes truth at 7/32 carries despite 83 exact anchors. Do not promote original forced carry values.'
},null,2));
