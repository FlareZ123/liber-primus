"use strict";
// Exact shared additive pad recovery under two independently observed word partitions.
// The overlap graph is a forest. Tree message passing counts and prunes all assignments.
function experiment(raw){
 const gp=JSON.parse(raw[0]),ix=new Map(gp.runes.map((x,i)=>[x,i])),mod=x=>(x%29+29)%29;
 const id=w=>String.fromCharCode(...w.map(x=>65+x)),nums=s=>[...s].map(x=>x.charCodeAt(0)-65);
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const assert=(v,m)=>{if(!v)throw Error(m)};
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);t=t.slice(a?a.index+a[0].length:0,b?b.index:t.length);return (t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]).map(w=>{let p=[];for(let j=0;j<w.length;){const q=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(q,"unmapped "+w);p.push(q.i);j+=q.t.length}return p})}
 function words(t,sep){let out=[],w=[];for(const x of t){if(ix.has(x))w.push(ix.get(x));else if(sep(x)&&w.length){out.push(w);w=[]}}if(w.length)out.push(w);return out}
 const donors=raw.slice(3).map(native),gold=JSON.parse(raw[2]),dict=new Set();
 for(const d of donors)for(const w of d.slice(0,Math.floor(d.length*.8)))if(w.length<=30)dict.add(id(w));
 for(const s of gold.sections)for(const w of words(s.source_text,()=>true))dict.add(id(w));
 const byLen=Array.from({length:31},()=>[]);for(const w of dict)byLen[w.length]?.push(w);
 function solve(A,B){
  const N=A.flat().length;assert(B.flat().length===N,"length");
  const vs=[],edges=[],sides=[];for(const [side,W] of [A,B].entries()){let t=0;const list=[];for(const w of W){const v={i:vs.length,side,s:t,e:t+w.length,c:w,dom:(byLen[w.length]||[]).slice(),adj:[]};vs.push(v);list.push(v);t=v.e}sides.push(list)}
  let i=0,j=0;while(i<A.length&&j<B.length){const a=sides[0][i],b=sides[1][j],s=Math.max(a.s,b.s),e=Math.min(a.e,b.e);assert(s<e,"overlap");const edge={a:a.i,b:b.i,s,e};edges.push(edge);a.adj.push(edge);b.adj.push(edge);if(a.e<=b.e)i++;if(b.e<=a.e)j++}
  const seen=new Set(),components=[],forced=[Array(N).fill(null),Array(N).fill(null)],key=Array(N).fill(null);
  function other(e,v){return vs[e.a===v.i?e.b:e.a]}
  function sig(v,e,w){let h="";for(let j=e.s;j<e.e;j++)h+=String.fromCharCode(65+mod(v.c[j-v.s]-(w.charCodeAt(j-v.s)-65)));return h}
  for(const root of vs){if(seen.has(root.i))continue;const order=[],parent=new Map(),queue=[root];seen.add(root.i);
   for(let k=0;k<queue.length;k++){const v=queue[k];order.push(v);for(const e of v.adj){const u=other(e,v);if(parent.get(v.i)===e)continue;assert(!seen.has(u.i),"cycle");seen.add(u.i);parent.set(u.i,e);queue.push(u)}}
   // Exact bottom-up count messages indexed by the common pad substring.
   const messages=new Map(),weights=new Map();
   for(const v of order.slice().reverse()){const child=v.adj.filter(e=>e!==parent.get(v.i)),wts=new Map();
    for(const w of v.dom){let count=1n;for(const e of child){const m=messages.get(other(e,v).i);count*=m.get(sig(v,e,w))||0n;if(!count)break}if(count)wts.set(w,count)}
    weights.set(v.i,wts);v.dom=[...wts.keys()];
    const ep=parent.get(v.i);if(ep){const m=new Map();for(const [w,c] of wts){const k=sig(v,ep,w);m.set(k,(m.get(k)||0n)+c)}messages.set(v.i,m)}
   }
   const count=[...weights.get(root.i).values()].reduce((s,c)=>s+c,0n);
   const start=Math.min(...order.map(v=>v.s)),end=Math.max(...order.map(v=>v.e));
   if(count){for(const v of order){const e=parent.get(v.i);if(e){const u=other(e,v),allowed=new Set(u.dom.map(w=>sig(u,e,w)));v.dom=v.dom.filter(w=>allowed.has(sig(v,e,w)))}
    for(let k=0;k<v.c.length;k++){const p=v.dom[0].charCodeAt(k)-65;if(v.dom.every(w=>w.charCodeAt(k)-65===p)){forced[v.side][v.s+k]=p;key[v.s+k]=mod(v.c[k]-p)}}}}
   components.push({start,end,words:order.length,assignments:count.toString(),domains:order.map(v=>({side:v.side,s:v.s,e:v.e,remaining:v.dom.length}))})
  }
  const possible=components.every(c=>c.assignments!=="0");
  return {possible,components,feasibleRunes:components.filter(c=>c.assignments!=="0").reduce((s,c)=>s+c.end-c.start,0),forced:forced.map(a=>a.filter(x=>x!==null).length),plain:forced,key};
 }
 function rng(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
 function window(d,N,skip){for(let i=Math.floor(d.length*.8)+skip;i<d.length;i++){let j=i,n=0;while(j<d.length&&n<N&&dict.has(id(d[j]))){n+=d[j++].length}if(n===N)return d.slice(i,j)}throw Error("no held window")}
 function encode(W,K){let t=0;return W.map(w=>w.map(p=>mod(p+K[t++])))}
 const controls=[],nulls=[];
 for(let k=0;k<3;k++){const P=window(donors[k],308,k*100),Q=window(donors[(k+1)%3],308,k*200+500),R=rng(330100+k),K=Array.from({length:308},()=>R()%29),L=Array.from({length:308},()=>R()%29),A=encode(P,K),B=encode(Q,K),s=solve(A,B);
  assert(s.possible,"positive rejected");const actual=[P.flat(),Q.flat()];for(let j=0;j<2;j++)assert(s.plain[j].every((p,i)=>p===null||p===actual[j][i]),"wrong forced");assert(s.key.every((v,i)=>v===null||v===K[i]),"wrong key");
  controls.push({k,forced:s.forced,key:s.key.filter(x=>x!==null).length,components:s.components.map(c=>({start:c.start,end:c.end,assignments:c.assignments})),unique:s.components.every(c=>c.assignments==="1")});const n=solve(A,encode(Q,L));assert(!n.possible,"negative accepted");nulls.push({k,feasibleRunes:n.feasibleRunes,components:n.components.map(c=>({start:c.start,end:c.end,assignments:c.assignments}))});
 }
 const original=words(raw[1].split("%").slice(0,55).join("%"),x=>x!=="%"&&x!=="/"&&!/\s/u.test(x)),tape=gp.pages.filter(x=>x.page<56).flatMap(x=>x.indices);
 assert(original.length===2896&&id(original.flat())===id(tape),"canonical mismatch");
 const slice=(s,e)=>{let n=0,W=[];for(const w of original){const a=n,b=n+w.length;if(a>=s&&b<=e)W.push(w);n=b}assert(W.flat().length===e-s,"partial word");return W};
 const A=slice(11976,12284),B=slice(12648,12956);assert(A.length===73&&B.length===66,"word count");
 const s=solve(A,B);
 // Separate exact repeated-plaintext test: shared literal F hold mask; different periodic pads.
 // Across ordinary consuming positions C_A-C_B=K_A[t%a]-K_B[t%b].
 const C=A.flat(),D=B.flat(),common=C.flatMap((c,i)=>c===0&&D[i]===0?[i]:[]);
 function phase(a,b,hold){const set=new Set(hold),adj=Array.from({length:a+b},()=>[]);let t=0;for(let i=0;i<C.length;i++){if(set.has(i))continue;const u=t%a,v=a+t%b,d=mod(C[i]-D[i]);adj[u].push([v,-d]);adj[v].push([u,d]);t++}
 const vals=Array(a+b).fill(null);for(let i=0;i<vals.length;i++){if(vals[i]!==null)continue;vals[i]=0;const q=[i];for(let j=0;j<q.length;j++){const u=q[j];for(const [v,d] of adj[u]){const x=mod(vals[u]+d);if(vals[v]===null){vals[v]=x;q.push(v)}else if(vals[v]!==x)return false}}}return true}
 const repeated=[];for(const a of [8,13])for(const b of [8,13]){let survivors=0;for(let m=0;m<2**common.length;m++){const hold=common.filter((_,i)=>m&(2**i));if(phase(a,b,hold))survivors++}repeated.push({a,b,masks:2**common.length,survivors})}
 return {dictionaryTypes:dict.size,controls,nulls,original:{A:[11976,12284],B:[12648,12956],words:[A.length,B.length],possible:s.possible,feasibleRunes:s.feasibleRunes,components:s.components.map(c=>({start:c.start,end:c.end,words:c.words,assignments:c.assignments})),commonZero:common,repeated}};
}
if(typeof module!=="undefined")module.exports=experiment;
if(typeof require!=="undefined"&&require.main===module){const fs=require("node:fs"),path=require("node:path");const inputs=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];console.log(JSON.stringify(experiment(inputs.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2))}
