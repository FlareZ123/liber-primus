#!/usr/bin/env node
'use strict';

// #3239: source-marked alphabet-change gate.
// Model under test: one shared GP29 substitution chart, updated only at the
// original '$' chapter markers by a small permutation such as one adjacent
// chart swap.  Between markers the chart is fixed.  Any such substitution
// preserves the coincidence index exactly inside each chapter, regardless of
// the unknown chart or swaps.  We therefore test this all-key invariant before
// key recovery against every matched-length contiguous native-GP window in
// three pinned prose sources.

const fs=require('fs');
const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const transcript=fs.readFileSync('resources/liber-primus/lp2-transcription.txt','utf8');
const sources=[
  ['gibran',fs.readFileSync('resources/control/gibran_prophet_58585.txt','utf8')],
  ['emerson',fs.readFileSync('resources/control/emerson_essays_2944.txt','utf8')],
  ['shakespeare',fs.readFileSync('resources/control/shakespeare_first300k.txt','utf8')]
];
const value=new Map(corpus.translit.map((x,i)=>[x,i]));
const compounds=['ING','TH','NG','EO','OE','AE','IA','EA'];
function gpText(txt){
  const out=[];
  for(const w of (txt.match(/[A-Za-z]+/g)||[])){
    const s=w.toUpperCase();let a=[],ok=true;
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
function ioc(a){
  const c=Array(29).fill(0);for(const x of a)c[x]++;
  let s=0;for(const n of c)s+=n*(n-1);
  return s/(a.length*(a.length-1));
}
function scan(seq,L,target){
  const c=Array(29).fill(0);let S=0;
  for(let i=0;i<L;i++){const x=seq[i];S+=2*c[x];c[x]++;}
  let min=S/(L*(L-1)),max=min,le=min<=target?1:0,minAt=0,windows=1;
  for(let st=1;st+L<=seq.length;st++){
    const old=seq[st-1];c[old]--;S-=2*c[old];
    const neu=seq[st+L-1];S+=2*c[neu];c[neu]++;
    const x=S/(L*(L-1));windows++;
    if(x<min){min=x;minAt=st;}if(x>max)max=x;if(x<=target)le++;
  }
  return {windows,min,max,le_target:le,minAt};
}

// Exact source-visible '$' endpoints on the unknown p0..p55 tape.
const R=new Set(corpus.runes);let rp=0,ends=[];
for(const ch of [...transcript]){
  if(R.has(ch))rp++;
  if(ch==='$' && rp<=12956)ends.push(rp);
}
if(JSON.stringify(ends)!==JSON.stringify([729,1874,3612,5506,6527,7960,9640,12956]))
  throw Error('chapter endpoints changed');
const starts=[0,...ends.slice(0,-1)];
const tape=corpus.pages.slice(0,56).flatMap(p=>p.indices);
if(tape.length!==12956)throw Error('unexpected unknown tape length');
const native=sources.map(([n,t])=>[n,gpText(t)]);

const rows=[];
for(let q=0;q<ends.length;q++){
  const a=tape.slice(starts[q],ends[q]),target=ioc(a),scans={};
  for(const [name,seq] of native)scans[name]=scan(seq,a.length,target);
  rows.push({chapter:q,start:starts[q],end:ends[q],length:a.length,ioc:target,scans});
}

// Plant: take contiguous native pieces of the eight target lengths and apply
// an arbitrary initial substitution, then exactly one adjacent swap to the
// output chart at every chapter marker.  IoC must remain identical chapterwise.
let chart=Array.from({length:29},(_,i)=>(7*i+3)%29); // permutation because gcd(7,29)=1
const plant=[];
for(let q=0,off=0;q<rows.length;q++){
  const P=native[q%native.length][1].slice(1000+q*4000,1000+q*4000+rows[q].length);
  if(P.length!==rows[q].length)throw Error('short plant');
  const C=P.map(x=>chart[x]);
  if(Math.abs(ioc(P)-ioc(C))>1e-15)throw Error('IoC invariance failure');
  plant.push({chapter:q,length:P.length,plain_ioc:ioc(P),cipher_ioc:ioc(C)});
  const a=(3*q+5)%28; [chart[a],chart[a+1]]=[chart[a+1],chart[a]];
}

const totalWindows=rows.reduce((s,r)=>s+Object.values(r.scans).reduce((a,x)=>a+x.windows,0),0);
const totalLe=rows.reduce((s,r)=>s+Object.values(r.scans).reduce((a,x)=>a+x.le_target,0),0);
const minNative=Math.min(...rows.flatMap(r=>Object.values(r.scans).map(x=>x.min)));
console.log(JSON.stringify({
  model:'shared GP29 substitution chart; exactly one adjacent chart swap at each source-visible $ boundary; no within-chapter changes',
  invariant:'chapter IoC is preserved under every possible substitution key and every boundary swap',
  chapter_end_offsets:ends,
  native_lengths:Object.fromEntries(native.map(([n,s])=>[n,s.length])),
  rows,
  aggregate:{matched_native_windows:totalWindows,windows_at_or_below_original:totalLe,minimum_native_window_ioc:minNative,original_ioc_range:[Math.min(...rows.map(x=>x.ioc)),Math.max(...rows.map(x=>x.ioc))]},
  planted_adjacent_swap_control:plant,
  decision:'Reject this source-marked alphabet-change family for ordinary native-GP prose. The all-key invariant fails before any transition/key recovery.'
},null,2));
