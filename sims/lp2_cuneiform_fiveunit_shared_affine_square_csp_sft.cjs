'use strict';
// Source-fixed five-unit shared affine constraint solver; Node 22 CommonJS.
const fs=require('node:fs');
const path=require('node:path');
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/lp2-transcription.txt",
  "resources/control/english_wordfreq_textblob.txt",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/cicada2014-openpuff-magic-squares.txt"
];
const experiment=function experiment(inputs) {
  const [corp,trans,lex,native,squareText]=inputs;
  const corpus=JSON.parse(corp), known=JSON.parse(native), pageText=trans.split('%');
  const map=new Map(corpus.runes.map((r,i)=>[r,i])), alpha=new Map(corpus.translit.map((s,i)=>[s,i]));
  const N=29,W=91,ALL=(1<<N)-1, mod=x=>(x%N+N)%N;
  const assert=(v,m)=>{if(!v)throw Error(m)};
  const inv=Array.from({length:29},(_,a)=>{for(let b=1;b<29;b++)if(a*b%29===1)return b;return 0});
  const dict=Array.from({length:32},()=>new Map());
  const add=(w,f=1)=>{if(w.length&&w.length<dict.length){const k=w.join(',');const old=dict[w.length].get(k);if(!old||old.f<f)dict[w.length].set(k,{w,f})}};
  function variants(word){
    const s=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
    const out=[];
    function visit(i,w){if(i===s.length){out.push(w);return}for(const n of [1,2,3]){
      const sub=s.slice(i,i+n);if(sub.length!==n)continue;
      const v=n===3?(sub==='ING'?alpha.get('NG'):undefined):alpha.get(sub);
      if(v!==undefined)visit(i+n,w.concat(v));
    }}
    visit(0,[]);return out;
  }
  for(const line of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m)for(const w of variants(m[1]))add(w,+m[2]);}
  for(const w of ['A','I','O'])for(const v of variants(w))add(v);
  function runeWords(s){const out=[];let w=[];for(const c of s){if(map.has(c))w.push(map.get(c));else if(w.length){out.push(w);w=[]}}if(w.length)out.push(w);return out}
  const nativeWords=known.sections.map(x=>runeWords(x.source_text));
  for(const ws of nativeWords)for(const w of ws)add(w);
  const vocabulary=dict.map(x=>[...x.values()]);
  function span(p,lo,hi){let count=0,started=false,s='';for(const ch of pageText[p]){
    const is=map.has(ch);if(is&&count===lo)started=true;if(is&&count===hi)break;if(started)s+=ch;if(is)count++;
  }assert(count===hi,'source span');return s}
  const definitions=[[[36,99,238]],[[37,0,91]],[[37,91,189]],[[37,189,228],[38,0,57]],[[38,57,186]]];
  function sourceWords(s){const words=[];let w=[];for(const c of s){if(map.has(c))w.push(map.get(c));else if('- .&•'.replace(' ','').includes(c)&&w.length){words.push(w);w=[]}}if(w.length)words.push(w);return words}
  const origWords=definitions.map(parts=>{const w=sourceWords(parts.map(([p,a,b])=>span(p,a,b)).join(''));const expected=parts.flatMap(([p,a,b])=>corpus.pages.find(x=>x.page===p).indices.slice(a,b));assert(w.flat().join(',')===expected.join(','),'original source');return w});
  assert(origWords.map(w=>w.flat().length).join(',')==='139,91,98,96,129','source lengths');
  assert(origWords.reduce((s,w)=>s+w.length,0)===122,'source words');
  function tracks(words){return words.map(ws=>{let t=0;const groups=[];for(const w of ws){if(t>=W)break;groups.push({start:t,len:w.length,used:Math.min(w.length,W-t)});t+=w.length}return {groups,tape:ws.flat().slice(0,W)}})}
  const original=tracks(origWords);
  function invert(M){let a=M.map((row,i)=>row.map(mod).concat(Array.from({length:5},(_,j)=>+(i===j))));for(let k=0;k<5;k++){let i=a.findIndex((x,j)=>j>=k&&x[k]);assert(i>=0,'singular');[a[k],a[i]]=[a[i],a[k]];let u=inv[a[k][k]];a[k]=a[k].map(x=>mod(x*u));for(let j=0;j<5;j++)if(j!==k){let v=a[j][k];a[j]=a[j].map((x,l)=>mod(x-v*a[k][l]))}}return a.map(x=>x.slice(5))}
  const I=Array.from({length:5},(_,i)=>Array.from({length:5},(_,j)=>+(i===j)));
  const sq=squareText.trim().split(/\r?\n\s*\r?\n/).map(s=>s.trim().split(/\r?\n/).map(l=>l.trim().split(/\s+/).map(Number)));
  const matrices=[I,sq[0],sq[2]];
  assert(matrices.slice(1).map(m=>m[0].reduce((a,b)=>a+b,0)).join(',')==='3301,1033','source squares');
  function apply(T,M){return T.map((track,j)=>({...track,tape:track.tape.map((_,t)=>mod(M[j].reduce((s,m,k)=>s+m*T[k].tape[t],0)))}))}
  function solve(T){
    // Each column's exact possible plaintext tuples under all 812 inverse affine maps.
    const domains=Array.from({length:W},(_,t)=>{
      const c=T.map(x=>x.tape[t]), d=new Map();
      for(let a=1;a<N;a++)for(let b=0;b<N;b++){const p=c.map(x=>mod(a*x+b));d.set(p.join(','),p)}return [...d.values()]
    });
    const groups=T.map(track=>track.groups.map(g=>({...g,words:vocabulary[g.len].map(x=>x.w)})));
    const log=[];
    function result(failure,round){const counts=domains.map(d=>d.length);return {failure,round,log,counts,uniqueColumns:counts.filter(x=>x===1).length,decoded:T.map((_,l)=>domains.map(d=>d.length===1?d[0][l]:-1))}}
    for(let round=1;round<=100;round++){
      let change=false;
      const masks=T.map((_,l)=>domains.map(d=>d.reduce((s,p)=>s|(1<<p[l]),0)));
      for(let l=0;l<5;l++)for(const g of groups[l]){
        const w=g.words.filter(w=>{for(let j=0;j<g.used;j++)if(!(masks[l][g.start+j]&(1<<w[j])))return false;return true});
        if(!w.length)return result({kind:'word',lane:l+1,start:g.start,len:g.len},round);
        if(w.length!==g.words.length)change=true;g.words=w;
        for(let j=0;j<g.used;j++)masks[l][g.start+j]&=w.reduce((s,v)=>s|(1<<v[j]),0);
      }
      for(let t=0;t<W;t++){const d=domains[t].filter(p=>p.every((v,l)=>masks[l][t]&(1<<v)));if(d.length!==domains[t].length)change=true;domains[t]=d;if(!d.length)return result({kind:'column',t},round)}
      log.push({round,tupleTotal:domains.reduce((s,d)=>s+d.length,0),wordTotal:groups.flat().reduce((s,g)=>s+g.words.length,0)});
      if(!change)return result(null,round);
    }throw Error('iteration cap');
  }
  let seed=20261124;const rnd=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n};
  const matched=tracks(origWords.map(ws=>ws.map(w=>{const top=vocabulary[w.length].slice().sort((a,b)=>b.f-a.f).slice(0,30);assert(top.length,'dictionary coverage');return top[rnd(top.length)].w})));
  const actual=tracks(nativeWords.filter(ws=>ws.flat().length>=W).slice(0,5));
  assert(actual.length===5,'five native controls');
  function encrypt(T,M){const a=Array.from({length:W},()=>1+rnd(28)),b=Array.from({length:W},()=>rnd(29));const shifted=T.map(track=>({...track,tape:track.tape.map((v,t)=>mod(a[t]*v+b[t]))}));return apply(shifted,M)}
  const compact=x=>({failure:x.failure,round:x.round,log:x.log,uniqueColumns:x.uniqueColumns,domainRange:[Math.min(...x.counts),Math.max(...x.counts)]});
  const results=matrices.map((M,k)=>{
    const Mi=invert(M), orig=solve(apply(original,Mi));
    const controls=[matched,actual].map(P=>{const Q=solve(apply(encrypt(P,M),Mi));assert(!Q.failure,'positive eliminated');let exact=0,wrong=0;for(let l=0;l<5;l++)for(let t=0;t<W;t++){if(Q.decoded[l][t]===P[l].tape[t])exact++;else if(Q.decoded[l][t]>=0)wrong++}assert(!wrong,'positive wrong forced rune');return {...compact(Q),forcedExact:exact,wrong}});
    return {matrix:['identity','3301','1033'][k],original:compact(orig),controls}
  });
  return {sourceWords:origWords.map(w=>w.length),vocabulary:vocabulary.reduce((s,d)=>s+d.length,0),singleton:vocabulary[1].map(x=>corpus.translit[x.w[0]]),results};
};
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'))),null,2));
