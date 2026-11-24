'use strict';
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function experiment(corpus,ink,transcript,shakespeare,gibran){
  const assert=(v,m)=>{if(!v)throw Error(m)};
  const eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
  const mod=x=>(x%29+29)%29;
  const map=new Map(corpus.runes.map((r,i)=>[r,i]));
  const pages=transcript.split("%");
  const words=[];let word=[];
  for(const ch of pages.slice(3,8).join("").replace(/[\/\r\n]/g,"")){
    if(map.has(ch))word.push(map.get(ch));else if(word.length){words.push(word);word=[];}
  }
  if(word.length)words.push(word);
  const source=corpus.pages.slice(3,8).flatMap(p=>p.indices);
  assert(eq(words.flat(),source),"source transcript");
  const cuts=[0,119,217+261+263+71,217+261+263+196+194];
  assert(cuts[2]===812&&cuts[3]===1131,"cut totals");
  assert(ink.pages.find(p=>p.page===3).red_spans.some(s=>s.start===119),"p3 ruby");
  assert(ink.pages.find(p=>p.page===6).red_spans.some(s=>s.start===71),"p6 ruby");
  assert(ink.pages.find(p=>p.page===7).red_spans.some(s=>s.start===194),"p7 end ruby");
  const sections=cuts.slice(0,-1).map((lo,i)=>{
    const hi=cuts[i+1];let at=0;const selected=[];
    for(const w of words){if(at>=lo&&at+w.length<=hi)selected.push(w);at+=w.length;}
    assert(eq(selected.flat(),source.slice(lo,hi)),"complete source words "+i);
    return {c:source.slice(lo,hi),lengths:selected.map(w=>w.length)};
  });
  assert(eq(sections.map(x=>x.c.length),[119,693,319]),"block sizes");
  const alphabet=corpus.translit.map((token,id)=>({token,id})).sort((a,b)=>b.token.length-a.token.length);
  /** @param {string} w */
  function native(w){const s=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let i=0;i<s.length;){if(s.startsWith("ING",i)){o.push(21);i+=3;continue;}if(s.startsWith("IO",i)){o.push(27);i+=2;continue;}const h=alphabet.find(x=>s.startsWith(x.token,i));assert(h,"GP "+s);o.push(h.id);i+=h.token.length;}return o;}
  const nativeWords=s=>(s.match(/[A-Za-z]+/g)||[]).map(native);
  const dict=new Set(),uni=Array(29).fill(1),bi=Array.from({length:29},()=>Array(29).fill(1));
  for(const w of nativeWords(shakespeare)){dict.add(w.join(","));for(let i=0;i<w.length;i++){uni[w[i]]++;if(i)bi[w[i-1]][w[i]]++;}}
  const logs=r=>{const z=r.reduce((a,b)=>a+b,0);return r.map(x=>Math.log(x/z));};
  const u=logs(uni),bigrams=bi.map(logs),pools=new Map();
  for(const w of nativeWords(gibran)){if(!pools.has(w.length))pools.set(w.length,[]);pools.get(w.length).push(w);}
  /** @param {number[]} x @param {number[]} lengths */
  function score(x,lengths){let ll=0,hits=0,k=0;for(const n of lengths){if(dict.has(x.slice(k,k+n).join(",")))hits+=n;for(let j=0;j<n;j++)ll+=j?bigrams[x[k+j-1]][x[k+j]]:u[x[k+j]];k+=n;}return {value:(ll+4*hits)/x.length,coverage:hits/x.length};}
  const inv=Array.from({length:29},(_,a)=>Array.from({length:29},(_,i)=>i).find(i=>a*i%29===1));
  const keys=[];
  for(let a=0;a<29;a++)for(let b=0;b<29;b++)if(mod(a*a-b*b))keys.push({a,b});
  assert(keys.length===784,"invertible key count");
  /** @param {number[]} x @param {{a:number,b:number}} key */
  function decode(x,key){return x.map((c,i)=>mod(key.a*c+key.b*x[x.length-1-i]));}
  /** @param {number[]} x @param {{a:number,b:number}} key */
  function encode(x,key){const det=inv[mod(key.a*key.a-key.b*key.b)];return decode(x,{a:mod(key.a*det),b:mod(-key.b*det)});}
  function fit(x){let best=null;for(const key of keys){const q=score(decode(x,key),sections[1].lengths);if(!best||q.value>best.score.value)best={...key,score:q};}return best;}
  const ioc=x=>{const h=Array(29).fill(0);for(const v of x)h[v]++;return h.reduce((a,n)=>a+n*(n-1),0)/(x.length*(x.length-1));};
  function assess(x,section,key){const p=decode(x,key);assert(eq(encode(p,key),x),"replay");let k=0;return {score:score(p,section.lengths),ioc:ioc(p),prefix:section.lengths.slice(0,18).map(n=>{const w=p.slice(k,k+n).map(i=>corpus.translit[i]).join("");k+=n;return w;}).join(" ")};}
  let state=0x24503301;const rand=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
  const plant=sec=>sec.lengths.flatMap(n=>{const pool=pools.get(n);assert(pool?.length,"plant length "+n);return pool[rand()%pool.length]});
  const p57=corpus.pages.find(p=>p.page===57).indices;
  const plants=[];
  for(let t=0;t<6;t++){const key=keys[rand()%keys.length],plain=sections.map(plant),c=plain.map(p=>encode(p,key));const found=fit(c[1]);const exact=c.map((x,i)=>eq(decode(x,found),plain[i]));const solvedControl=eq(decode(encode(p57,key),found),p57);plants.push({key,found,exact,solvedControl,assess:c.map((x,i)=>assess(x,sections[i],found))});}
  const nulls=[];
  for(let t=0;t<32;t++){const c=sections.map(s=>s.c.map(()=>rand()%29));const found=fit(c[1]);nulls.push(c.map((x,i)=>assess(x,sections[i],found).score));}
  const key=fit(sections[1].c),original=sections.map(s=>assess(s.c,s,key));
  const maxIoc=sections.map(s=>Math.max(...keys.map(k=>ioc(decode(s.c,k)))));
  return {cuts,scope:sections.map(s=>({runes:s.c.length,words:s.lengths.length})),key,original,maxIoc,plants,nullTrials:nulls.length,nullTrainAtLeastOriginal:nulls.filter(x=>x[1].value>=key.score.value).length,maxNull:sections.map((_,i)=>({value:Math.max(...nulls.map(n=>n[i].value)),coverage:Math.max(...nulls.map(n=>n[i].coverage))})),allOriginalReplays:true};
}
const input=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-ink-annotations.json","resources/liber-primus/lp2-transcription.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt"].map(read);
console.log(JSON.stringify(experiment(JSON.parse(input[0]),JSON.parse(input[1]),...input.slice(2)),null,2));
