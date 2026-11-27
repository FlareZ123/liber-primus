"use strict";
const fs=require("node:fs");
function run(corpus,native){
 const check=(v,m)=>{if(!v)throw Error(m)},eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 check(eq(corpus.runes,native.runes),"alphabet");
 const names=["0_warning","0_welcome","0_wisdom","0_koan_1"];
 const records=native.sections.map(s=>({name:s.name,a:[...s.source_text].map(x=>native.runes.indexOf(x)).filter(i=>i>=0)}));
 const training=records.filter(r=>names.includes(r.name)),held=records.filter(r=>!names.includes(r.name));check(training.length===4&&held.length===5,"split");
 const w=Array(29).fill(1),bi=Array.from({length:29},()=>Array(29).fill(1));
 for(const {a} of training)for(let i=0;i<a.length;i++){w[a[i]]++;if(i)bi[a[i-1]][a[i]]++;}
 const sum=a=>a.reduce((s,x)=>s+x,0),norm=a=>a.map(x=>x/sum(a)),u=norm(w),b=bi.map(norm);
 const score=a=>a.length?(Math.log(29*u[a[0]])+a.slice(1).reduce((s,x,i)=>s+Math.log(29*b[a[i]][x]),0))/a.length:null;
 const lex=(a,b)=>{for(let i=0;i<Math.min(a.length,b.length);i++)if(a[i]!==b[i])return a[i]-b[i];return a.length-b.length;};
 function dictionary(weights){
  const total=BigInt(sum(weights)),pw=[1n];for(let i=1;i<=30;i++)pw.push(pw[i-1]*total);
  const leaves=[{a:[],n:1n}];
  function probOrder(x,y){const d=x.n*pw[y.a.length]-y.n*pw[x.a.length];return d>0n?-1:d<0n?1:lex(x.a,y.a);}
  for(let i=0;i<30;i++){leaves.sort(probOrder);const t=leaves.shift();for(let j=0;j<29;j++)leaves.push({a:t.a.concat(j),n:t.n*BigInt(weights[j])});}
  leaves.sort((x,y)=>lex(x.a,y.a));check(leaves.length===841,"capacity");
  const phrases=leaves.map(x=>x.a),trie={};for(let i=0;i<phrases.length;i++){let t=trie;for(const x of phrases[i]){check(t.id===undefined,"prefix");t[x]??={};t=t[x];}check(Object.keys(t).length===0,"leaf");t.id=i;}
  const max=Math.max(...phrases.map(a=>a.length));
  check(max<=29,"one-digit footer capacity");
  const probability=leaves.map(x=>Number(x.n)/Number(pw[x.a.length]));check(Math.abs(sum(probability)-1)<1e-10,"mass");
  const first=Array(29).fill(0),last=Array(29).fill(0);for(let i=0;i<841;i++){first[Math.floor(i/29)]+=probability[i];last[i%29]+=probability[i];}
  return {phrases,trie,max,expectedLength:sum(probability.map((p,i)=>p*phrases[i].length)),iidWithin:sum(probability.filter((_,i)=>Math.floor(i/29)===i%29)),iidAcross:sum(first.map((v,i)=>v*last[i]))};
 }
 function encode(a,d){
  if(!a.length)return [0];
  let i=0,used=0;const out=[];
  while(i<a.length){let t=d.trie;used=0;while(t.id===undefined){if(i<a.length){t=t[a[i++]];used++;}else t=t[0];}out.push(Math.floor(t.id/29),t.id%29);}
  out.push(used-1);return out;
 }
 function decode(c,d){
  if(c.length===1&&c[0]===0)return {status:"legal",out:[]};
  if(c.length<3||c.length%2===0)return {status:"invalid-length"};
  const a=[];for(let i=0;i<c.length-1;i+=2){const p=d.phrases[c[i]*29+c[i+1]];if(i===c.length-3){const k=c.at(-1)+1;if(k>p.length)return {status:"tail-length"};if(p.slice(k).some(x=>x!==0))return {status:"nonzero-tail-padding"};a.push(...p.slice(0,k));}else a.push(...p);}
  check(eq(encode(a,d),c),"canonical replay");return {status:"legal",out:a};
 }
 function geometry(c){if(c.length<3||c.length%2===0)return null;let within=0,across=0;const pairs=(c.length-1)/2;for(let i=0;i<c.length-1;i+=2){within+=+(c[i]===c[i+1]);if(i+2<c.length-1)across+=+(c[i+1]===c[i+2]);}return {pairs,within,across,acrossN:pairs-1,footerEqual:+(c.at(-2)===c.at(-1))};}
 let state=0x3130babe;function rnd(){state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296;}const ri=n=>Math.floor(rnd()*n);
 function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=ri(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
 const d=dictionary(w),wrong=Array.from({length:16},()=>dictionary(shuffle(w)));
 const controls=held.map(({name,a})=>{const c=encode(a,d),z=decode(c,d);check(z.status==="legal"&&eq(z.out,a),"native plant");
  const badLength=decode(c.slice(0,-1),d).status,badFooter=decode(c.slice(0,-1).concat(28),d).status;
  check(badLength==="invalid-length"&&badFooter==="tail-length","malformed");
  const wrongResults=wrong.map(v=>{const x=decode(c,v);return x.status==="legal"?{status:x.status,score:score(x.out),exact:eq(x.out,a)}:{status:x.status};});
  // Independently reset continuation, withheld from dictionary training and other half.
  const cut=Math.floor(a.length/2),suffix=a.slice(cut),sc=encode(suffix,d),sd=decode(sc,d);check(sd.status==="legal"&&eq(sd.out,suffix),"continuation");
  return {name,n:a.length,cipherRunes:c.length,score:score(a),geometry:geometry(c),badLength,badFooter,continuation:{n:suffix.length,cipherRunes:sc.length,score:score(suffix),geometry:geometry(sc)},wrongResults};
 });
 // Every single rune and every ordered pair is exactly representable, including partial phrase.
 let pairs=0;for(let x=0;x<29;x++)for(let y=0;y<29;y++){const a=[x,y];const c=encode(a,d),z=decode(c,d);check(z.status==="legal"&&eq(z.out,a),"all ordered pairs");pairs++;}
 const book=corpus.pages.slice(0,56).flatMap(p=>p.indices),lengths=[729,1145,1729,1903,1021,1433,1680,3008,308];
 check(book.length===12956&&sum(lengths)===book.length,"source lengths");
 const frames=corpus.pages.slice(0,56).filter(p=>p.indices.length).map(p=>({id:"p"+p.page,scope:"page",a:p.indices}));let off=0;
 for(let i=0;i<lengths.length;i++){frames.push({id:"chapter"+(i+1),scope:"chapter",a:book.slice(off,off+lengths[i])});off+=lengths[i];}frames.push({id:"book",scope:"book",a:book});
 const original=frames.map(({id,scope,a})=>{const z=decode(a,d),o={id,scope,n:a.length,status:z.status,geometry:geometry(a)};if(z.status==="legal"){o.plainRunes=z.out.length;o.score=score(z.out);o.decoded=z.out.map(x=>corpus.runes[x]).join("");o.translit=z.out.map(x=>corpus.translit[x]).join("");}return o;});
 function randomTape(n,low){const a=[ri(29)];while(a.length<n){if(!low){a.push(ri(29));continue;}const prev=a.at(-1);if(rnd()<86/12945)a.push(prev);else{const j=ri(28);a.push(j>=prev?j+1:j);}}return a;}
 const nulls=[];for(const {id,scope,a} of frames)if(a.length%2===1)for(const low of [false,true]){const counts={},legal=[];for(let k=0;k<128;k++){const x=randomTape(a.length,low),z=decode(x,d);counts[z.status]=(counts[z.status]||0)+1;if(z.status==="legal")legal.push({score:score(z.out),geometry:geometry(x),n:z.out.length});}nulls.push({id,scope,model:low?"low-repeat":"uniform",counts,legal});}
 return {schema:1,seed:"0x3130babe",training:training.map(r=>({name:r.name,n:r.a.length})),weights:w,dictionary:{phrases:d.phrases,max:d.max,expectedLength:d.expectedLength,iidWithin:d.iidWithin,iidAcross:d.iidAcross},allOrderedPairs:pairs,controls,original,nulls};
}
console.log(JSON.stringify(run(JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8")),JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8"))),null,2));
