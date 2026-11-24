'use strict';
// Agent5: key-independent XOR cycle-walk feedback graph gate.
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus,tr,solved){
 const check=(x,m)=>{if(!x)throw Error(m)},same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const idx=new Map(corpus.runes.map((r,i)=>[r,i]));
 const words=[];let w=[];for(const c of tr.split("%").slice(0,55).join("%")){if(idx.has(c))w.push(idx.get(c));else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){words.push(w);w=[];}}if(w.length)words.push(w);
 check(words.length===2896&&same(words.flat(),corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices)),"original parse");
 function edges(ws){let prev=0,out=[];for(const w of ws){if(w.length===1)out.push([prev,w[0]]);prev=w.at(-1);}return out;}
 function pop(x){let n=0;while(x){x&=x-1;n++;}return n;}
 function graph(es,mask){const adj=Array(29).fill(0);for(const [u,v] of es)if(!(mask&(1<<v))&&u!==v){adj[u]|=1<<v;adj[v]|=1<<u;}
  const degree=Math.max(...adj.map(pop));let seen=0,big=0;for(let i=0;i<29;i++)if(!(seen&(1<<i))){let q=1<<i,comp=0;while(q){const bit=q&-q;q^=bit;if(comp&bit)continue;comp|=bit;q|=adj[31-Math.clz32(bit)]&~comp;}seen|=comp;big=Math.max(big,pop(comp));}return {degree,big};}
 function bound(ws,k=4){const es=edges(ws);let checked=0,degreePass=0,componentPass=0,combined=0,minDegree=29,minComponent=29,witness=null;
  function visit(mask,start,left){if(left){for(let x=start;x<=29-left;x++)visit(mask|(1<<x),x+1,left-1);return;}checked++;const {degree,big}=graph(es,mask);minDegree=Math.min(minDegree,degree);minComponent=Math.min(minComponent,big);if(degree<=k)degreePass++;if(big<=2**k)componentPass++;if(degree<=k&&big<=2**k){combined++;witness??=mask;}}
  visit(0,0,k);return {singletons:es.length,checked,degreePass,componentPass,combined,minDegree,minComponent,witness};
 }
 const donor=solved.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>idx.get(c))));
 function plant(seed){
  let x=seed>>>0;function rng(){x=(Math.imul(x,1664525)+1013904223)>>>0;return x;}
  const labels=Array.from({length:32},(_,i)=>i);for(let i=31;i>0;i--){const j=rng()%(i+1);[labels[i],labels[j]]=[labels[j],labels[i]];}
  const C=labels.slice(0,29),S=C.slice();for(let i=28;i>0;i--){const j=rng()%(i+1);[S[i],S[j]]=[S[j],S[i]];}
  const A=new Set(C),backC=new Map(C.map((v,i)=>[v,i])),backS=new Map(S.map((v,i)=>[v,i])),K=rng()%32;
  const T=(v,q)=>A.has(v^q)?v^q:v;let prev=0;
  const cipher=donor.map(w=>w.map(p=>{const c=backC.get(T(S[p],C[prev]^K));prev=c;return c;}));
  prev=0;const plain=cipher.map(w=>w.map(c=>{const p=backS.get(T(C[c],C[prev]^K));prev=c;return p;}));check(same(plain,donor),"native replay");
  const singletonLabels=new Set(donor.filter(w=>w.length===1).map(w=>S[w[0]])),mask=[...singletonLabels].reduce((n,v)=>n|(1<<backC.get(v)),0),g=graph(edges(cipher),mask);
  check(g.degree<=singletonLabels.size&&g.big<=2**singletonLabels.size,"true graph");
  const a=bound(cipher);check(a.combined>0,"native bound");
  return {seed,runes:plain.flat().length,actualTypes:singletonLabels.size,actualDegree:g.degree,actualLargest:g.big,admissibleSets:a.combined};
 }
 const original=bound(words),plants=[plant(5320),plant(5321),plant(5322)];
 return {original,plants,five:bound(words,5),six:bound(words,6)};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
console.log(JSON.stringify(experiment(JSON.parse(read(paths[0])),read(paths[1]),JSON.parse(read(paths[2]))),null,2));
