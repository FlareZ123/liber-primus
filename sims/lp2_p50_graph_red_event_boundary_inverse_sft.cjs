// Boundary-anchor variant. Run from repository root.
"use strict";
const fs=require("node:fs");
function attack(grid,ink,corpus,transcription,...texts){
 const q=29,mod=x=>((x%q)+q)%q,inv=x=>{for(let i=1;i<q;i++)if(mod(x*i)===1)return i;throw Error("singular")},check=(x,m)=>{if(!x)throw Error(m)};
 const tokens=grid.pages.flatMap(p=>p.tokens);
 const ev=ink.pages.flatMap(p=>[...(p.red_spans??[]).flatMap(s=>Array.from(s.runes,(r,j)=>({page:p.page,pos:s.start+j,c:corpus.runes.indexOf(r),marker:false}))),...(p.large_punctuation??[]).filter(x=>x[1]===13).map(x=>({page:p.page,pos:x[0],marker:true}))].sort((a,b)=>a.pos-b.pos||(a.marker?-1:1)));
 check(tokens.length===256&&ev.length===256,"source length");
 for(const e of ev)if(!e.marker)check(e.c===corpus.pages.find(p=>p.page===e.page).indices[e.pos],"source identity");
 const anchors=new Map(ev.flatMap((e,i)=>!e.marker&&e.page>=56?[[i,e.page===56?[24,9,18,9,23][e.pos]:e.c]]:[]));
 const marks=ev.flatMap((e,i)=>e.marker?[i]:[]);
 const native=corpus.pages.find(p=>p.page===57).indices;
 const key=w=>w.map(i=>String.fromCharCode(65+i)).join("");
 const render=w=>w.map(i=>corpus.translit[i]).join("");
 const chart=new Map(corpus.translit.map((s,i)=>[s.toUpperCase(),i]));
 for(const [s,t] of [["C","K"],["K","C"],["V","U"],["Z","S"],["Q","C"],["ING","NG"],["IO","IA"]])if(chart.has(t)&&!chart.has(s))chart.set(s,chart.get(t));
 const spell=w=>{w=w.toUpperCase();const out=[];for(let i=0;i<w.length;){let found=false;for(let n=Math.min(3,w.length-i);n>=1;n--){const t=w.slice(i,i+n);if(chart.has(t)){out.push(chart.get(t));i+=n;found=true;break}}if(!found)return null}return out};
 const lex=new Set();for(const txt of texts)for(const w of txt.match(/[A-Za-z]+/g)??[]){const p=spell(w);if(p)lex.add(key(p))}
 const slices=transcription.split("%"), runePages=corpus.pages.filter(p=>p.runic_count>0);
 check(slices.length===runePages.length,"page count");
 const at=new Map(ev.flatMap((e,i)=>!e.marker?[[`${e.page}:${e.pos}`,i]]:[]));
 const words=[];
 for(let j=0;j<slices.length;j++){
  const page=runePages[j].page;let pos=0;
  const raw=slices[j].replace(/[\/\s]/g,"");
  for(const m of raw.matchAll(new RegExp(`[${corpus.runes.join("")}]+`,"g"))){
   const rune=Array.from(m[0]);const old=pos;pos+=rune.length;
   if(page>=56||j>0&&m.index===0||m.index+m[0].length===raw.length)continue;
   const ids=rune.map((_,i)=>at.get(`${page}:${old+i}`));
   if(ids.every(x=>x!==undefined))words.push({page,start:old,ids});
  }
  check(pos===runePages[j].runic_count,`page length ${page}: ${pos} != ${runePages[j].runic_count}`);
 }
 check(words[0].page===0&&words[0].ids.length===8&&words[1].page===0&&words[1].ids.length===5,"p0 8+5");
 const fitWord=words[0],testWords=words.slice(1);
 function gauss(rows,k){
  const A=rows.map(x=>x.map(mod));let rank=0;const piv=[];
  for(let j=0;j<k;j++){let i=rank;while(i<A.length&&A[i][j]===0)i++;if(i===A.length)continue;[A[i],A[rank]]=[A[rank],A[i]];const s=inv(A[rank][j]);A[rank]=A[rank].map(x=>mod(x*s));for(i=0;i<A.length;i++)if(i!==rank&&A[i][j]){const t=A[i][j];A[i]=A[i].map((x,l)=>mod(x-t*A[rank][l]))}piv.push(j);rank++}
  for(let i=rank;i<A.length;i++)if(A[i][k])return null;
  const particular=Array(k).fill(0);for(let i=0;i<rank;i++)particular[piv[i]]=A[i][k];
  const free=Array.from({length:k},(_,i)=>i).filter(j=>!piv.includes(j));
  const basis=free.map(j=>{const v=Array(k).fill(0);v[j]=1;for(let i=0;i<rank;i++)v[piv[i]]=mod(-A[i][j]);return v});return {particular,basis};
 }
 function model(radix){
  const abc=radix===60?grid.alphabet:grid.alphabet.replace("f",""),f=tokens.map(t=>radix*abc.indexOf(t[0])+abc.indexOf(t[1])),pred=Array.from({length:256},()=>[]);
  f.forEach((j,i)=>pred[j].push(i));
  const boundary=i=>ev[i].marker||anchors.has(i),roots=[],seen=new Set();
  for(let i=0;i<256;i++){if(seen.has(i))continue;const path=[],local=new Map();let v=i;while(!seen.has(v)&&!local.has(v)&&!boundary(v)){local.set(v,path.length);path.push(v);v=f[v]}if(local.has(v))roots.push(Math.min(...path.slice(local.get(v))));path.forEach(j=>seen.add(j))}
  const k=2+roots.length,unit=j=>Array.from({length:k+1},(_,i)=>+(i===j));
  const evalExpr=(e,v)=>{let s=e[k];for(let j=0;j<k;j++)s+=v[j]*e[j];return mod(s)};
  function build(C,a,b){
   const ai=inv(a),expr=Array(256),queue=[];
   for(const m of marks){expr[m]=unit(0);queue.push(m)}
   for(const [i,p] of anchors){expr[i]=unit(k).map(x=>x*p);queue.push(i)}
   roots.forEach((m,j)=>{expr[m]=unit(j+2);queue.push(m)});
   for(let h=0;h<queue.length;h++){const v=queue[h];for(const i of pred[v])if(!expr[i]){const e=expr[v].map(x=>mod(-b*ai*x));e[1]=mod(e[1]-ai);e[k]=mod(e[k]+ai*C[i]);expr[i]=e;queue.push(i)}}
   check(queue.length===256,"inverse");
   const closure=roots.map(i=>{const e=expr[i].map((x,j)=>mod(a*x+b*expr[f[i]][j]));e[1]=mod(e[1]+1);return [...e.slice(0,k),mod(C[i]-e[k])]});
   return {expr,closure};
  }
  function solve(C,truth){
   let feasiblePairs=0,states=0,fitStates=0,bothStates=0,trueRetained=false,trueBoth=false;
   const fits=[],both=[];
   for(let a=1;a<q;a++)for(let b=1;b<q;b++){
    const {expr,closure}=build(C,a,b),S=gauss(closure,k);if(!S)continue;
    feasiblePairs++;const v=S.particular.slice();
    const walk=j=>{
     if(j===S.basis.length){
      states++;const title=fitWord.ids.map(i=>evalExpr(expr[i],v));if(!lex.has(key(title)))return;
      fitStates++;
      const P=expr.map(e=>evalExpr(e,v));
      check(ev.every((e,i)=>boundary(i)||C[i]===mod(a*P[i]+b*P[f[i]]+v[1])),"replay");
      const hits=testWords.map(w=>lex.has(key(w.ids.map(i=>P[i]))));const exact=truth&&a===truth.a&&b===truth.b&&P.every((x,i)=>x===truth.P[i]);if(exact)trueRetained=true;
      const rec={a,b,v:v.slice(),title:render(title),second:render(testWords[0].ids.map(i=>P[i])),holdoutHits:hits.filter(Boolean).length,holdoutWords:testWords.length,redWords:testWords.map((w,j)=>({page:w.page,start:w.start,word:render(w.ids.map(i=>P[i])),hit:hits[j]}))};
      fits.push(rec);if(hits[0]){bothStates++;both.push(rec);if(exact)trueBoth=true}return;
     }
     const B=S.basis[j];for(let u=0;u<q;u++){walk(j+1);for(let t=0;t<k;t++)v[t]=mod(v[t]+B[t])}
    };
    walk(0);
   }
   fits.sort((a,b)=>b.holdoutHits-a.holdoutHits);both.sort((a,b)=>b.holdoutHits-a.holdoutHits);
   return {feasiblePairs,states,fitStates,bothStates,trueRetained,trueBoth,topFits:fits.slice(0,5),topBoth:both.slice(0,5)};
  }
  const C=ev.map(e=>e.marker?null:e.c);
  const controls=[];
  const choose=(len,offset)=>Array.from(lex).filter(w=>w.length===len).sort()[offset].split("").map(c=>c.charCodeAt(0)-65);
  for(let j=0;j<2;j++){
   const a=[7,19][j],b=[13,28][j],M=[21,4][j],d=[17,5][j];let pos=0;
   const P=ev.map(e=>e.marker?M:native[(pos+++j*23)%native.length]);
   for(const [i,p] of anchors)P[i]=p;
   for(const [wi,w] of words.entries()){const p=choose(w.ids.length,0);for(let l=0;l<w.ids.length;l++)P[w.ids[l]]=p[l]}
   const synth=P.map((p,i)=>boundary(i)?null:mod(a*p+b*P[f[i]]+d));
   const out=solve(synth,{a,b,P});check(out.trueBoth,"true native-register key lost");
   controls.push({a,b,M,d,fitStates:out.fitStates,bothStates:out.bothStates,trueRetained:out.trueRetained,trueBoth:out.trueBoth,top:out.topBoth[0]});
  }
  return {radix,roots,original:solve(C),controls};
 }
 return {lexicon:lex.size,words:words.map(w=>({page:w.page,start:w.start,length:w.ids.length})),models:[model(59),model(60)]};
}
const p=["resources/liber-primus/lp2-grid-256.json","resources/liber-primus/lp2-ink-annotations.json","resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/liber-primus/lp1-plaintext-reference.txt"];
const x=p.map(f=>fs.readFileSync(f,"utf8"));
console.log(JSON.stringify(attack(...x.slice(0,3).map(JSON.parse),...x.slice(3)),null,2));
