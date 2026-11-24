"use strict";
// Run: node sims/lp2_latin23_spacingfree_lattice_sft.cjs
const fs=require("node:fs"), path=require("node:path");
const paths={
  "corpus": "resources/liber-primus/lp2-corpus.json",
  "solved": "resources/liber-primus/lp1-plaintext-reference.txt",
  "gibran": "resources/control/gibran_prophet_58585.txt",
  "emerson": "resources/control/emerson_essays_2944.txt"
};
const inputs=Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")]));
function experiment(input) {
 const gp=JSON.parse(input.corpus),key=Array.from("a2e7j6ic78h0j7eiejd0120",c=>parseInt(c,36)),q=key.length;
 const opts=gp.translit.map(s=>[s]);opts[1]=["U","V"];opts[5]=["C","K","Q"];opts[15]=["S","Z"];opts[21]=["NG","ING"];opts[27]=["IA","IO"];
 const arcs=opts.flatMap((ss,r)=>ss.map(s=>({s,rs:[r]})));arcs.push({s:"QU",rs:[5,7]});
 const byChar={};for(const a of arcs)(byChar[a.s[0]]??=[]).push(a);
 for(const a of Object.values(byChar))a.sort((x,y)=>y.s.length-x.s.length);
 const encrypt=(s,p)=>Array.from(s,(c,i)=>String.fromCharCode(65+(c.charCodeAt(0)-65+key[(p+i)%q])%26)).join("");
 const decrypt=(s,p)=>Array.from(s,(c,i)=>String.fromCharCode(65+(c.charCodeAt(0)-65-key[(p+i)%q]+26)%26)).join("");
 const norm=s=>s.toUpperCase().replace(/[^A-Z]/g,"");
 const order=3, counts=Array.from({length:order+2},()=>new Map());
 for(const doc of [input.gibran,input.emerson]){const s=norm(doc);for(let i=0;i<s.length;i++)for(let k=1;k<=Math.min(order+1,i+1);k++){const t=s.slice(i-k+1,i+1);counts[k].set(t,(counts[k].get(t)||0)+1)}}
 const total=[...counts[1].values()].reduce((a,b)=>a+b,0);if(total<250000)throw Error("training data incomplete");
 const scoreCache=new Map();
 function emission(ctx,letter){const s=ctx+letter;let v=scoreCache.get(s);if(v!==undefined)return v;let prob=((counts[1].get(letter)||0)+.5)/(total+13);for(let j=1;j<=ctx.length;j++){const c=ctx.slice(-j),n=counts[j].get(c)||0,m=counts[j+1].get(c+letter)||0;prob=(m+20*prob)/(n+20)}v=Math.log(prob);scoreCache.set(s,v);return v}
 function advance(ctx,text){let score=0;for(const c of text){score+=emission(ctx,c);ctx=(ctx+c).slice(-order)}return {ctx,score}}
 function greedy(s){const a=[];let offsets=[0];for(let i=0;i<s.length;){const e=byChar[s[i]].find(a=>s.startsWith(a.s,i));a.push(...e.rs);i+=e.s.length;for(let j=0;j<e.rs.length;j++)offsets.push(i-e.s.length+j+1);offsets[offsets.length-1]=i}return {rs:a,offsets}}
 const phases=Array.from({length:q},(_,i)=>i);
 function solve(rs,initial){
  // Viterbi per original-rune position, Latin phase, and three-character context.
  const dp=Array.from({length:rs.length+1},()=>new Map());
  for(const z of initial)dp[0].set(z.phase+"|"+z.ctx,{score:0,phase:z.phase,ctx:z.ctx,start:z.phase,prev:null,word:"",cipher:""});
  let maxStates=0;
  for(let i=0;i<rs.length;i++){
   maxStates=Math.max(maxStates,dp[i].size);
   const emissions=opts[rs[i]].map(s=>({s,step:1}));
   if(rs[i]===5&&rs[i+1]===7)emissions.push({s:"QU",step:2});
   for(const z of dp[i].values())for(const a of emissions){const p=decrypt(a.s,z.phase),v=advance(z.ctx,p),phase=(z.phase+p.length)%q,score=z.score+v.score,k=phase+"|"+v.ctx;const dest=dp[i+a.step],old=dest.get(k);
    if(!old||score>old.score)dest.set(k,{score,phase,ctx:v.ctx,start:z.start,prev:z,word:p,cipher:a.s});
   }
  }
  let best;for(const z of dp.at(-1).values())if(!best||z.score>best.score)best=z;
  const plain=[],cipher=[];for(let z=best;z.prev;z=z.prev){plain.push(z.word);cipher.push(z.cipher)}
  plain.reverse();cipher.reverse();const out=plain.join(""),c=cipher.join("");
  if(encrypt(out,best.start)!==c)throw Error("cipher replay mismatch");
  // Verify exact allowed rune segmentation (including QU -> C,W).
  let i=0;for(const a of cipher){if(opts[rs[i]]?.includes(a))i++;else if(a==="QU"&&rs[i]===5&&rs[i+1]===7)i+=2;else throw Error("rune relation replay mismatch")}if(i!==rs.length)throw Error("rune count mismatch");
  return {start:best.start,end:best.phase,ctx:best.ctx,score:best.score,scorePerRune:best.score/rs.length,scorePerLatin:best.score/out.length,plain:out,latinLength:out.length,runes:rs.length,maxStates};
 }
 function edit(a,b){let x=Array.from({length:b.length+1},(_,i)=>i);for(let i=0;i<a.length;i++){const y=[i+1];for(let j=0;j<b.length;j++)y.push(Math.min(y[j]+1,x[j+1]+1,x[j]+(a[i]!==b[j])));x=y}return x.at(-1)}
 const native=norm(input.solved.split("### 6\n")[1].split("### 7")[0]),welcome=norm(input.solved.split("### 3\n")[1].split("WISDOM")[0]);
 // Separate continuous native passages, with source-selected known key; phase and language context concealed.
 const plants=[[native.slice(0,360),3],[native.slice(360,720),11],[welcome.slice(0,360),19]];
 const control=plants.map(([plain,p])=>{
  if(plain.length!==360)throw Error("short control");
  const enc=encrypt(plain,p),obs=greedy(enc);
  // Keep cut outside a two-rune QU emission: select by a safe original glyph boundary.
  let split=Math.floor(obs.rs.length*2/3);if(obs.rs[split-1]===5&&obs.rs[split]===7)split++;
  const cut=obs.offsets[split],a=solve(obs.rs.slice(0,split),phases.map(phase=>({phase,ctx:""})));
  const b=solve(obs.rs.slice(split),[{phase:a.end,ctx:a.ctx}]);
  return {expectedInitial:p,expectedEnd:(p+cut)%q,fit:a,test:b,trueFit:plain.slice(0,cut),trueTest:plain.slice(cut),fitEdit:edit(a.plain,plain.slice(0,cut)),testEdit:edit(b.plain,plain.slice(cut)),testTrueLength:plain.length-cut};
 });
 const a=solve(gp.pages[54].indices,phases.map(phase=>({phase,ctx:""}))), b=solve(gp.pages[55].indices,[{phase:a.end,ctx:a.ctx}]);
 return {trainingLetters:total,ngramOrder:4,control,original:{fit:a,test:b}};
}
console.log(JSON.stringify(experiment(inputs),null,2));
