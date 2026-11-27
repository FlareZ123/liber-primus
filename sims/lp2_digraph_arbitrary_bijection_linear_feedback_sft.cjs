"use strict";
/** Exact all-matrix search via projective collision incidence. */
function experiment(corpus, texts){
 const M=29,Q=841, mod=x=>(x%M+M)%M, assert=(x,m)=>{if(!x)throw Error(m)};
 const original=corpus.pages.slice(0,56).flatMap(p=>p.indices);
 assert(original.length===12956,"source");
 const dirs=30;
 const projection=Array.from({length:Q},(_,r)=>Uint8Array.from({length:dirs},(_,t)=>t===29?r%29:(Math.floor(r/29)+(r%29)*t)%29));
 const diff=Array.from({length:29},(_,x)=>Uint8Array.from({length:29},(_,y)=>mod(x-y)));
 const scale=Array.from({length:29},(_,x)=>{let inv=0;for(let i=1;i<29;i++)if(x*i%29===1)inv=i;return Uint8Array.from({length:29},(_,y)=>inv*y%29)});
 /** @param {number[]} tape @param {number} phase */
 function blocks(tape,phase){let b=[];for(let i=phase;i+1<tape.length;i+=2)b.push(29*tape[i]+tape[i+1]);return b}
 /** @param {number[]} b @param {number} a @param {number} c */
 function direct(b,a,c){const hist=new Uint32Array(Q);let score=0,n=b.length-1;for(let i=1;i<b.length;i++){let x=Math.floor(b[i-1]/29),y=b[i-1]%29;let z=29*mod(Math.floor(b[i]/29)-Math.floor(a/29)*x-(a%29)*y)+mod(b[i]%29-Math.floor(c/29)*x-(c%29)*y);score+=hist[z]++}return {score,n,rate:2*score/(n*(n-1)),support:hist.filter(x=>x).length}}
 /** @param {number[]} b */
 function search(b){
  const n=b.length-1, x=Uint8Array.from(b,v=>Math.floor(v/29)),y=Uint8Array.from(b,v=>v%29);
  const w=Array.from({length:dirs},()=>new Uint32Array(Q));let constant=0;
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
   const dx=diff[x[i]][x[j]],dy=diff[y[i]][y[j]],ex=diff[x[i+1]][x[j+1]],ey=diff[y[i+1]][y[j+1]];
   if(dx===0&&dy===0){if(ex===0&&ey===0)constant++;continue}
   const s=scale[dx||dy],dir=dx?s[dy]:29;
   w[dir][29*s[ex]+s[ey]]++;
  }
  let best=-1, ties=0, key=null;
  for(let a=0;a<Q;a++){const p=projection[a];for(let c=0;c<Q;c++){const q=projection[c];let score=constant;for(let t=0;t<dirs;t++)score+=w[t][29*p[t]+q[t]];if(score>best){best=score;ties=1;key=[a,c]}else if(score===best)ties++;}}
  const d=direct(b,...key);
  assert(d.score===best,"direct winner");
  for(const [a,c] of [[0,0],[1,501],[839,840],[29,1],[335,777]]){let s=constant;for(let t=0;t<dirs;t++)s+=w[t][29*projection[a][t]+projection[c][t]];assert(s===direct(b,a,c).score,"direct cross-check")}
  return {n,score:best,key,ties,rate:d.rate,supportAtBest:d.support,minSupportBound:Math.ceil(n*n/(2*best+n))};
 }
 const gp=corpus.translit.map((token,i)=>({token,i})).sort((a,b)=>b.token.length-a.token.length);
 function encode(source){let a=[];for(let word of source.toUpperCase().match(/[A-Z]+/g)||[]){word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");for(let i=0;i<word.length;){const t=gp.find(o=>word.startsWith(o.token,i));assert(t,"GP encoding");a.push(t.i);i+=t.token.length}}return a}
 const donors=texts.map(encode);
 const spans=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 const chapter=spans.map(([a,b])=>corpus.pages.slice(a,b+1).flatMap(p=>p.indices).length);
 const offsets=[0];for(const n of chapter)offsets.push(offsets.at(-1)+n);
 const full=[0,1].map(phase=>({phase,...search(blocks(original,phase))}));
 const chapters=spans.map((span,i)=>({span,phases:[0,1].map(phase=>({phase,...search(blocks(original.slice(offsets[i],offsets[i+1]),phase))}))}));
 function nativeRate(b){return direct(b,0,0).rate}
 const native=donors.map((d,k)=>{let full=[1,1],chapterMin=spans.map(()=>[1,1]),windows=0;for(let s=0;s+original.length<=d.length;s+=6400){windows++;let tape=d.slice(s,s+original.length);for(let phase=0;phase<2;phase++){full[phase]=Math.min(full[phase],nativeRate(blocks(tape,phase)));for(let i=0;i<chapter.length;i++)chapterMin[i][phase]=Math.min(chapterMin[i][phase],nativeRate(blocks(tape.slice(offsets[i],offsets[i+1]),phase)));}}return {name:k?"Gibran":"Shakespeare",length:d.length,windows,full,chapterMin}});
 const fit=blocks(original.slice(0,6478),0),held=blocks(original.slice(6478),0);
 const train=search(fit),frozen=direct(held,...train.key);
 let seed=0x361127;function random(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function plant(d,key){const plain=blocks(d.slice(0,12956),0),pi=Array.from({length:Q},(_,i)=>i);for(let i=Q-1;i>0;i--){let j=random()%(i+1);[pi[i],pi[j]]=[pi[j],pi[i]]}
 const inv=new Uint16Array(Q);pi.forEach((x,i)=>inv[x]=i);
 const c=[pi[plain[0]]];for(let i=1;i<plain.length;i++){const p=pi[plain[i]],x=Math.floor(c[i-1]/29),y=c[i-1]%29;c.push(29*mod(Math.floor(p/29)+Math.floor(key[0]/29)*x+(key[0]%29)*y)+mod(p%29+Math.floor(key[1]/29)*x+(key[1]%29)*y))}
 const first=c.slice(0,3239),result=search(first),held=c.slice(3238);let decoded=0;
 for(let i=3239;i<c.length;i++){const [a,b]=result.key,x=Math.floor(c[i-1]/29),y=c[i-1]%29,r=29*mod(Math.floor(c[i]/29)-Math.floor(a/29)*x-(a%29)*y)+mod(c[i]%29-Math.floor(b/29)*x-(b%29)*y);if(inv[r]===plain[i])decoded++}
 assert(direct(first,...key).rate===nativeRate(plain.slice(0,3239))||direct(first,...key).score===direct([0,...plain.slice(1,3239)],0,0).score,"plant invariant");
 return {key,result,heldRate:direct(held,...result.key).rate,heldDecodedWithOraclePi:decoded,heldBlocks:c.length-3239,truthHeldRate:direct(held,...key).rate}
 }
 const plants=[plant(donors[0],[137,722]),plant(donors[1],[612,48])];
 return {full,chapters,native,train,frozen,plants};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.join(__dirname,"..");const read=p=>fs.readFileSync(path.join(root,p),"utf8");console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),[read("resources/control/shakespeare_first300k.txt"),read("resources/control/gibran_prophet_58585.txt")]),null,2));}
module.exports=experiment;
