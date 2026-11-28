'use strict';

/**
 * Agent46 — p7 source-orbit state v, p8 printed-fragment matrix M:
 * autonomous GP29 keystream producer at the already source-selected K=2.
 *
 * Tests ONLY:
 * 2 source-native clocks (per-rune and per-printed-p8-fragment),
 * 2 unfitted origins (state v and one M step), both additive signs.
 * No free key, phase, coordinate, plaintext target, language optimization.
 *
 * node sims/lp2_p7_p8_sourcevector_matrix_stream_original_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r/g,'');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const native=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const transcription=read('resources/liber-primus/lp2-transcription.txt').split('%');
const index=new Map(corpus.runes.map((r,i)=>[r,i]));
const M29=n=>((n%29)+29)%29;
const product=a=>a.reduce((v,x)=>M29(v*x),1);
const ioc=a=>{
 const h=Array(29).fill(0);a.forEach(v=>{assert.ok(v>=0&&v<29);h[v]++});
 return h.reduce((z,n)=>z+n*(n-1),0)/(a.length*(a.length-1));
};
function fragments(page){
 const expected=corpus.pages.find(p=>p.page===page).indices;
 const pageText=transcription[page>=51?page-1:page];
 assert.ok(pageText);
 const words=[];let word=[],start=0,cursor=0;
 const flush=()=>{if(word.length)words.push({start,values:word.slice(),length:word.length});word=[];};
 for(const ch of pageText){
  if(index.has(ch)){if(!word.length)start=cursor;word.push(index.get(ch));assert.equal(index.get(ch),expected[cursor++]);}
  else if(ch==='/'||/\s/u.test(ch))continue;
  else flush();
 }
 flush();assert.equal(cursor,expected.length);
 return words;
}
const r7=fragments(7),red7=r7.filter(w=>w.start>=194);
assert.equal(ink.pages.find(p=>p.page===7).red_spans[0].start,194);
assert.equal(red7.length,5);
const pCoeffs=red7.map(w=>product(w.values));
assert.deepEqual(pCoeffs,[11,26,8,15,2]);
const P=x=>pCoeffs.reduce((out,c,i)=>M29(out+c*x**i),0);
let state=0;
const warm=[0];
for(let i=0;i<5;i++){state=P(state);warm.push(state);}
assert.deepEqual(warm,[0,11,23,17,18,5]);
const v=[];
for(let i=0;i<7;i++){v.push(state);state=P(state);}
assert.deepEqual(v,[5,15,28,9,10,24,7]);

const f8=fragments(8);
assert.equal(f8.length,51);
assert.deepEqual(f8.slice(0,2).map(w=>w.length),[4,8]);
const red8=ink.pages.find(p=>p.page===8).red_spans[0];
assert.equal(red8.length,12);
const bodyFragments=f8.slice(2);
assert.equal(bodyFragments.length,49);
const body=bodyFragments.flatMap(w=>w.values);
assert.equal(body.length,243);
assert.deepEqual(body,corpus.pages.find(p=>p.page===8).indices.slice(12));
const M=Array.from({length:7},(_,i)=>bodyFragments.slice(7*i,7*i+7).map(w=>w.length));
assert.deepEqual(M,[
 [3,2,3,9,4,3,4],
 [2,2,6,3,7,3,4],
 [3,8,4,3,4,5,5],
 [2,3,4,4,7,5,10],
 [6,12,4,5,3,2,6],
 [10,4,9,6,5,6,8],
 [8,3,2,9,6,6,1]
]);
const mv=s=>M.map(row=>M29(row.reduce((out,x,j)=>out+x*s[j],0)));
assert.deepEqual(mv(v),[2,28,5,28,23,28,27]);
const K=product(bodyFragments[0].values);
assert.equal(K,2); // original first post-red word has GP0 product K=2

const period=24388;
let orbit=v.slice();
for(let j=1;j<=period;j++){
 orbit=mv(orbit);
 if(j<period)assert.notDeepEqual(orbit,v);
}
assert.deepEqual(orbit,v);

const chapter=corpus.pages.filter(p=>p.page>=8&&p.page<=14).flatMap(p=>p.indices);
assert.equal(chapter.length,1729);
const chapterBody=chapter.slice(12);
assert.equal(chapterBody.length,1717);

function keyRune(length,origin){
 let s=origin?mv(v):v.slice();
 const keys=[];
 for(let j=0;j<length;j++){keys.push(s[K]);s=mv(s);}
 return keys;
}
function keyFragment(fragmentLengths,origin){
 let s=origin?mv(v):v.slice();
 const keys=[];
 for(const len of fragmentLengths){
  assert.ok(len>=1);
  keys.push(...Array(len).fill(s[K]));
  s=mv(s);
 }
 return keys;
}
const nativeTape=native.sections.flatMap(sec=>
 [...sec.source_text].map(ch=>index.get(ch)).filter(x=>x!==undefined)
);
assert.equal(nativeTape.length,2979);
const nativeWindows=[];
for(let at=0;at+body.length<=nativeTape.length;at+=31)
 nativeWindows.push(ioc(nativeTape.slice(at,at+body.length)));
assert.equal(nativeWindows.length,89);
const nativeMin=Math.min(...nativeWindows);
assert.ok(nativeMin>0.05445&&nativeMin<0.05446);

const cases=[];
for(const clock of ['rune','fragment']){
 for(const origin of [0,1]){
  for(const sign of [-1,+1]){
   for(const receiver of clock==='rune'?['p8-black','p8-14-continuous']:['p8-black']){
    const ciphertext=receiver==='p8-black'?body:chapterBody;
    const key=clock==='rune'?keyRune(ciphertext.length,origin):
      keyFragment(bodyFragments.map(w=>w.length),origin);
    assert.equal(key.length,ciphertext.length);
    const out=ciphertext.map((x,i)=>M29(x+sign*key[i]));
    assert.deepEqual(out.map((x,i)=>M29(x-sign*key[i])),ciphertext);

    // Plant a native GP29 control encrypted with this EXACT key:
    const plant=nativeTape.slice(500,500+body.length);
    const plantK=key.slice(0,body.length);
    const enc=plant.map((x,i)=>M29(x-sign*plantK[i]));
    const recovered=enc.map((x,i)=>M29(x+sign*plantK[i]));
    assert.deepEqual(recovered,plant);

    cases.push({
     clock,origin,sign,receiver,N:out.length,
     ioc:ioc(out),keyFirst16:key.slice(0,16),
     transcriptPreview:out.slice(0,32).map(x=>corpus.translit[x]).join(' ')
    });
   }
  }
 }
}
assert.equal(cases.length,12);
assert.ok(cases.every(x=>x.ioc<nativeMin));
const max=Math.max(...cases.map(x=>x.ioc));
assert.ok(max<0.037);

console.log(JSON.stringify({
 status:'PASS: 12 source-frozen direct source-orbit/matrix stream inverses fail GP29 native gate',
 verdict:'NO PLAINTEXT; no free phase/coordinate/f-skip/feedback fitted',
 source:{p7RedProducts:pCoeffs,p7Warmup:warm,v,M,outputCoordinate:K,
   firstMv:mv(v),stateOrbitLength:period,
   p8BlackRunes:body.length,p8Through14AfterRed:chapterBody.length,
   chapterFull:chapter.length},
 native:{n:nativeTape.length,length:body.length,windows:nativeWindows.length,
   minimumIoc:nativeMin,maximumIoc:Math.max(...nativeWindows)},
 cases
},null,2));