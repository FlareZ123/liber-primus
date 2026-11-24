"use strict";
// Run: node sims/lp2_latin23_unknown_key_lattice_sft.cjs
const fs=require("node:fs"),path=require("node:path");
const paths={
  "corpus": "resources/liber-primus/lp2-corpus.json",
  "solved": "resources/liber-primus/lp1-plaintext-reference.txt",
  "gibran": "resources/control/gibran_prophet_58585.txt",
  "emerson": "resources/control/emerson_essays_2944.txt"
};
const inputs=Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")]));
function experiment(input) {
 const gp=JSON.parse(input.corpus),q=23, A=26;
 const opt=gp.translit.map(x=>[x]);opt[1]=["U","V"];opt[5]=["C","K","Q"];opt[15]=["S","Z"];opt[21]=["NG","ING"];opt[27]=["IA","IO"];
 const arcs=opt.flatMap((ss,r)=>ss.map(s=>({s,rs:[r]})));arcs.push({s:"QU",rs:[5,7]});
 const byChar={};for(const a of arcs)(byChar[a.s[0]]??=[]).push(a);for(const a of Object.values(byChar))a.sort((a,b)=>b.s.length-a.s.length);
 const norm=s=>s.toUpperCase().replace(/[^A-Z]/g,""), nums=s=>Array.from(s,c=>c.charCodeAt(0)-65), letters=a=>Array.from(a,v=>String.fromCharCode(65+v)).join("");
 const enc=(s,k,off=0)=>letters(nums(s).map((v,i)=>(v+k[(off+i)%q])%26));
 const dec=(s,k,off=0)=>letters(nums(s).map((v,i)=>(v-k[(off+i)%q]+26)%26));
 const rng=(seed)=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const powers=[1,26,676,17576,456976],counts=powers.map(n=>new Uint32Array(n)),log=powers.map(n=>new Float64Array(n));let total=0;
 for(const d of [input.gibran,input.emerson]){const a=nums(norm(d));total+=a.length;for(let i=0;i<a.length;i++){let idx=0;for(let k=1;k<=Math.min(4,i+1);k++){idx+=a[i-k+1]*powers[k-1];counts[k][idx]++}}}
 for(let j=0;j<26;j++)log[1][j]=Math.log((counts[1][j]+.5)/(total+13));
 for(let k=2;k<=4;k++)for(let i=0;i<powers[k];i++)log[k][i]=Math.log((counts[k][i]+20*Math.exp(log[k-1][i%powers[k-1]]))/(counts[k-1][Math.floor(i/26)]+20));
 function at(a,i){const k=Math.min(4,i+1);let n=0;for(let j=i-k+1;j<=i;j++)n=26*n+a[j];return log[k][n]}
 function encode(s){const rs=[],offset=[0],lengths=[];for(let i=0;i<s.length;){const e=byChar[s[i]].find(a=>s.startsWith(a.s,i));rs.push(...e.rs);if(e.rs[0]===21)lengths.push(e.s.length===3?1:0);if(e.rs.length===2)offset.push(i+1);i+=e.s.length;offset.push(i)}return {rs,offset,lengths}}
 function groups(rs,mask){let j=0,pos=0;const g=[];for(let i=0;i<rs.length;i++){let a;if(rs[i]===21)a=[opt[21][(mask>>j++)&1]];else if(rs[i]===5&&rs[i+1]===7){a=["CW","KW","QW","QU"];i++}else a=opt[rs[i]];const choices=a.map(nums);g.push({pos,choices});pos+=choices[0].length}return {g,n:pos}}
 function initialize(rs,mask){const {g,n}=groups(rs,mask);const cols=Array.from({length:q},()=>[]);for(const z of g)for(let j=0;j<z.choices[0].length;j++)cols[(z.pos+j)%q].push([...new Set(z.choices.map(x=>x[j]))]);
  const key=[],ranking=[];let score=0;for(const col of cols){let a=Array.from({length:26},(_,k)=>{let s=0;for(const choices of col){let v=-Infinity;for(const c of choices)v=Math.max(v,log[1][(c-k+26)%26]);s+=v}return {k,s}}).sort((a,b)=>b.s-a.s);ranking.push(a.map(x=>x.k));key.push(a[0].k);score+=a[0].s}return {mask,g,n,key,ranking,score}}
 function optimize(init,seed,perturb){const {g,n}=init,rand=rng(seed),key=init.key.slice(),c=new Int16Array(n),p=new Int16Array(n);
  if(perturb)for(let j=0;j<q;j++)if(rand()<.45)key[j]=init.ranking[j][Math.floor(rand()*6)];
  for(const z of g){let b,best=-Infinity;for(const x of z.choices){let s=0;for(let j=0;j<x.length;j++)s+=log[1][(x[j]-key[(z.pos+j)%q]+26)%26];if(s>best){best=s;b=x}}for(let j=0;j<b.length;j++){c[z.pos+j]=b[j];p[z.pos+j]=(b[j]-key[(z.pos+j)%q]+26)%26}}
  const positions=Array.from({length:q},(_,k)=>Array.from({length:Math.ceil(n/q)},(_,i)=>k+i*q).filter(i=>i<n));
  const effects=positions.map(a=>[...new Set(a.flatMap(i=>[i,i+1,i+2,i+3]).filter(j=>j<n))]);
  const sum=inds=>{let s=0;for(const j of inds)s+=at(p,j);return s};
  const shuffled=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  const phaseOrder=Array.from({length:q},(_,i)=>i);
  for(let pass=0;pass<15;pass++){let changes=0;
   for(const k of shuffled(phaseOrder)){let bestKey=key[k],best=sum(effects[k]);for(let t=0;t<26;t++){if(t===key[k])continue;for(const i of positions[k])p[i]=(c[i]-t+26)%26;const s=sum(effects[k]);if(s>best+1e-10){best=s;bestKey=t}}
    if(bestKey!==key[k])changes++;key[k]=bestKey;for(const i of positions[k])p[i]=(c[i]-bestKey+26)%26;
   }
   for(const z of shuffled(g)){if(z.choices.length===1)continue;const pos=z.pos,len=z.choices[0].length,inds=Array.from({length:Math.min(len+3,n-pos)},(_,i)=>pos+i);let best=sum(inds),choice=Array.from(c.slice(pos,pos+len));for(const a of z.choices){for(let j=0;j<len;j++)p[pos+j]=(a[j]-key[(pos+j)%q]+26)%26;const s=sum(inds);if(s>best+1e-10){best=s;choice=a}}
    if(choice.some((v,j)=>v!==c[pos+j]))changes++;for(let j=0;j<len;j++){c[pos+j]=choice[j];p[pos+j]=(choice[j]-key[(pos+j)%q]+26)%26}
   }
   if(!changes)break;
  }
  let score=0;for(let i=0;i<n;i++)score+=at(p,i);return {mask:init.mask,key,plain:letters(p),cipher:letters(c),score,latinLength:n};
 }
 function fit(rs,trueMask=null){const n=rs.filter(v=>v===21).length;if(n>12)throw Error("length-mask cap");
  const all=Array.from({length:1<<n},(_,m)=>initialize(rs,m)).sort((a,b)=>b.score-a.score),selected=all.slice(0,24);
  let best=null;for(const z of selected)for(let j=0;j<3;j++){const a=optimize(z,0x2345+z.mask*137+j*719,j>0);if(!best||a.score>best.score)best=a}
  if(enc(best.plain,best.key)!==best.cipher)throw Error("fit replay failed");
  let p=0;for(const z of groups(rs,best.mask).g){const l=z.choices[0].length;if(!z.choices.some(a=>letters(a)===best.cipher.slice(p,p+l)))throw Error("fit relation replay");p+=l}
  return {...best,scorePerRune:best.score/rs.length,maskCount:all.length,optimizedMasks:selected.length,trueMaskRank:trueMask===null?null:all.findIndex(x=>x.mask===trueMask)+1,runes:rs.length};
 }
 // Exact Viterbi with the fitted key and last three fit letters; no key changes in heldout.
 function hold(rs,k,start,context){const dp=Array.from({length:rs.length+1},()=>new Map());dp[0].set(start+"|"+context,{score:0,phase:start,ctx:context,prev:null});
  for(let i=0;i<rs.length;i++){const a=opt[rs[i]].map(s=>({s,step:1}));if(rs[i]===5&&rs[i+1]===7)a.push({s:"QU",step:2});
   for(const z of dp[i].values())for(const t of a){const s=dec(t.s,k,z.phase);let v=0,ctx=z.ctx;for(const c of s){const a=nums(ctx+c);v+=at(a,a.length-1);ctx=(ctx+c).slice(-3)}const phase=(z.phase+s.length)%q,score=z.score+v,id=phase+"|"+ctx,old=dp[i+t.step].get(id);if(!old||score>old.score)dp[i+t.step].set(id,{score,phase,ctx,prev:z,plain:s,cipher:t.s,step:t.step})}
  }let best;for(const z of dp.at(-1).values())if(!best||z.score>best.score)best=z;
  const plain=[],cipher=[],steps=[];for(let z=best;z.prev;z=z.prev){plain.push(z.plain);cipher.push(z.cipher);steps.push(z.step)}plain.reverse();cipher.reverse();steps.reverse();let i=0;for(let j=0;j<cipher.length;j++){if(steps[j]===1&&!opt[rs[i]].includes(cipher[j]))throw Error("hold relation replay");if(steps[j]===2&&!(rs[i]===5&&rs[i+1]===7&&cipher[j]==="QU"))throw Error("hold QU replay");i+=steps[j]}if(i!==rs.length||enc(plain.join(""),k,start)!==cipher.join(""))throw Error("hold replay failed");
  return {plain:plain.join(""),score:best.score,scorePerRune:best.score/rs.length,runes:rs.length,end:best.phase};
 }
 function edit(a,b){let x=Array.from({length:b.length+1},(_,i)=>i);for(let i=0;i<a.length;i++){const y=[i+1];for(let j=0;j<b.length;j++)y.push(Math.min(y[j]+1,x[j+1]+1,x[j]+(a[i]!==b[j])));x=y}return x.at(-1)}
 const native=norm(input.solved.split("### 6\n")[1].split("### 7")[0]),welcome=norm(input.solved.split("### 3\n")[1].split("WISDOM")[0]);
 const plants=[native.slice(0,360),native.slice(360,720),welcome.slice(0,360)];const control=plants.map((plain,j)=>{
  const rand=rng(0x1209+j*913),key=Array.from({length:q},()=>Math.floor(rand()*26)),obs=encode(enc(plain,key));
  let split=Math.floor(obs.rs.length*2/3);if(obs.rs[split-1]===5&&obs.rs[split]===7)split++;const cut=obs.offset[split];const count=obs.rs.slice(0,split).filter(v=>v===21).length;
  const mask=obs.lengths.slice(0,count).reduce((n,v,i)=>n+(v<<i),0),a=fit(obs.rs.slice(0,split),mask),b=hold(obs.rs.slice(split),a.key,a.latinLength%q,a.plain.slice(-3));
  return {actualKey:key,actualMask:mask,keyExact:a.key.filter((k,i)=>k===key[i]).length,fit:a,test:b,fitEdit:edit(a.plain,plain.slice(0,cut)),testEdit:edit(b.plain,plain.slice(cut)),trueTestLength:plain.length-cut};
 });
 const a=fit(gp.pages[54].indices),b=hold(gp.pages[55].indices,a.key,a.latinLength%q,a.plain.slice(-3));
 return {trainingLetters:total,period:q,control,original:{fit:a,test:b}};
}
console.log(JSON.stringify(experiment(inputs),null,2));
