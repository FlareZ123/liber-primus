"use strict";
const fs=require("node:fs");
function run(corpus,native){
  const assert=(ok,m)=>{if(!ok)throw Error(m)},eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
  const trainNames=["0_warning","0_welcome","0_wisdom","0_koan_1"];
  const records=native.sections.map(s=>({name:s.name,a:[...s.source_text].map(x=>native.runes.indexOf(x)).filter(i=>i>=0)}));
  assert(eq(corpus.runes,native.runes),"alphabet");
  const training=records.filter(r=>trainNames.includes(r.name)),held=records.filter(r=>!trainNames.includes(r.name));
  assert(training.length===4&&held.length===5,"split");
  const EOF=29,weights=Array(30).fill(1),bigrams=Array.from({length:29},()=>Array(29).fill(1)),unigrams=Array(29).fill(1);
  for(const {a} of training){weights[EOF]++;for(let i=0;i<a.length;i++){weights[a[i]]++;unigrams[a[i]]++;if(i)bigrams[a[i-1]][a[i]]++;}}
  let queue=weights.map((weight,s)=>({weight,min:s,s})),lengths=Array(30).fill(0);
  while(queue.length>1){queue.sort((a,b)=>a.weight-b.weight||a.min-b.min);const [l,r]=queue.splice(0,2);queue.push({weight:l.weight+r.weight,min:Math.min(l.min,r.min),l,r});}
  function depths(t,d){if(t.s!==undefined)lengths[t.s]=d;else{depths(t.l,d+1);depths(t.r,d+1);}}depths(queue[0],0);
  const order=lengths.map((l,s)=>({l,s})).sort((a,b)=>a.l-b.l||a.s-b.s),codes=Array(30);
  let code=0,prev=0;for(const {l,s} of order){code<<=l-prev;codes[s]=code.toString(2).padStart(l,"0");code++;prev=l;}
  assert(code===2**prev,"complete tree");
  const trie={};for(let s=0;s<30;s++){let t=trie;for(const bit of codes[s]){t[bit]??={};t=t[bit];}assert(t.s===undefined,"duplicate");t.s=s;}
  function to29(n){assert(n>0n,"positive");const a=[];while(n){a.push(Number(n%29n));n/=29n;}return a.reverse();}
  function from29(a){let n=0n;for(let i=0;i<a.length;){const k=Math.min(10,a.length-i);let v=0;for(let j=0;j<k;j++)v=v*29+a[i+j];n=n*29n**BigInt(k)+BigInt(v);i+=k;}return n;}
  function encode(a){return to29(BigInt("0b1"+a.map(s=>codes[s]).join("")+codes[EOF]));}
  function decode(a){
    if(!a.length||a[0]===0)return {status:"noncanonical-leading-zero"};
    const bits=from29(a).toString(2).slice(1),out=[];let t=trie;
    for(let i=0;i<bits.length;i++){t=t[bits[i]];assert(t,"complete trie");if(t.s===undefined)continue;
      if(t.s===EOF){if(i!==bits.length-1)return {status:"early-EOF",bits:bits.length,used:i+1};return {status:"legal",bits:bits.length,out};}
      out.push(t.s);t=trie;
    }return {status:t===trie?"missing-EOF":"partial-codeword",bits:bits.length};
  }
  const norm=a=>a.map(v=>v/a.reduce((s,t)=>s+t,0)),pu=norm(unigrams),pb=bigrams.map(norm);
  const score=a=>a.length?(Math.log(pu[a[0]]*29)+a.slice(1).reduce((sum,v,i)=>sum+Math.log(pb[a[i]][v]*29),0))/a.length:null;
  const controls=held.map(({name,a})=>{const c=encode(a),d=decode(c);assert(d.status==="legal"&&eq(d.out,a),"plant "+name);assert(eq(encode(d.out),c),"plant replay");
    const n=from29(c),mutations=[["leading-zero",[0,...c]],["append-0",to29(n*2n)],["append-1",to29(n*2n+1n)],["remove-last-bit",to29(n/2n)]];
    const rejects=mutations.map(([name,z])=>({name,status:decode(z).status}));assert(rejects.every(x=>x.status!=="legal"),"mutations");
    return{name,plainRunes:a.length,cipherRunes:c.length,score:score(a),rejects};});
  const p=corpus.pages.slice(0,56),book=p.flatMap(x=>x.indices),chapterLengths=[729,1145,1729,1903,1021,1433,1680,3008,308];
  assert(book.length===12956&&chapterLengths.reduce((s,v)=>s+v,0)===book.length,"source");
  const frames=p.filter(x=>x.indices.length).map(x=>({id:"p"+x.page,a:x.indices,scope:"page"}));
  let off=0;for(let i=0;i<chapterLengths.length;i++){const n=chapterLengths[i];frames.push({id:"chapter"+(i+1),scope:"chapter",a:book.slice(off,off+n)});off+=n;}frames.push({id:"book",scope:"book",a:book});
  // Fixed matched null: uniform GP29 or Markov repeat rate 86/12945.
  let state=0x3133c0de;function random(){state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296;}
  const ri=n=>Math.floor(random()*n);
  function nullTape(n,low){const a=[ri(29)];while(a.length<n){if(!low){a.push(ri(29));continue;}const prev=a.at(-1);if(random()<86/12945)a.push(prev);else{const v=ri(28);a.push(v>=prev?v+1:v);}}return a;}
  const detail=(f,d)=>{const z={id:f.id,scope:f.scope,cipherRunes:f.a.length,status:d.status,bits:d.bits??null,used:d.used??null};if(d.status==="legal"){assert(eq(encode(d.out),f.a),"original replay");z.plainRunes=d.out.length;z.score=score(d.out);z.decoded=d.out.map(v=>corpus.runes[v]).join("");z.translit=d.out.map(v=>corpus.translit[v]).join("");}return z;};
  const original=frames.map(f=>detail(f,decode(f.a))),nulls=[];
  for(const f of frames)for(const low of [false,true]){const counts={},legal=[];for(let i=0;i<128;i++){const c=nullTape(f.a.length,low),d=decode(c);counts[d.status]=(counts[d.status]||0)+1;if(d.status==="legal"){assert(eq(encode(d.out),c),"null replay");legal.push({runes:d.out.length,score:score(d.out)});}}nulls.push({id:f.id,scope:f.scope,model:low?"low-repeat":"uniform",counts,legal});}
  return {schema:1,training:training.map(r=>({name:r.name,n:r.a.length})),weights,lengths,codes,controls,chapterLengths,seed:"0x3133c0de",drawsPerFramePerModel:128,original,nulls};
}
console.log(JSON.stringify(run(JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8")),JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8"))),null,2));
