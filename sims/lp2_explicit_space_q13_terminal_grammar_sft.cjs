"use strict";
const fs=require("node:fs"),path=require("node:path");
function grammarResearch(gp){
 const A=29,q=13;
 // Under a fixed hold mask, the ciphertext rune assigned to plaintext SPACE
 // at each consuming phase is a single unknown label. Adjacent physical
 // non-hold symbols give forbidden pairs of such labels.
 function solve(C,q,mask,A=29){
  const h=Array.from({length:q},()=>new Int32Array(A)),bad=Array.from({length:q},()=>new Uint8Array(A*A));
  let p=0,z=0,prev=-1,prevPhase=-1,held=0;
  const tape=[];
  for(const c of C){
   if(c===0&&((mask>>z++)&1)){prev=-1;held++;tape.push(null);continue}
   h[p][c]++;if(prev>=0){if((prevPhase+1)%q!==p)throw Error("phase adjacency");bad[prevPhase][prev*A+c]=1}
   tape.push([p,c]);prev=c;prevPhase=p;p=(p+1)%q;
  }
  let best=-1,bestKey=null;
  for(let first=0;first<A;first++){
   let dp=new Int32Array(A).fill(-1000000),back=[];dp[first]=h[0][first];
   for(let r=1;r<q;r++){
    const next=new Int32Array(A).fill(-1000000),par=new Int16Array(A).fill(-1);
    for(let a=0;a<A;a++)for(let b=0;b<A;b++)if(!bad[r-1][a*A+b]){
     const v=dp[a]+h[r][b];if(v>next[b]){next[b]=v;par[b]=a}
    }
    dp=next;back.push(par);
   }
   for(let last=0;last<A;last++)if(!bad[q-1][last*A+first]&&dp[last]>best){
    best=dp[last];const k=Array(q);k[q-1]=last;for(let r=q-1;r>0;r--)k[r-1]=back[r-1][k[r]];if(k[0]!==first)throw Error("trace");bestKey=k;
   }
  }
  const pos=tape.flatMap((v,i)=>v&&v[1]===bestKey[v[0]]?[i]:[]);
  if(pos.length!==best||pos.some((x,i)=>i>0&&x===pos[i-1]+1))throw Error("bad witness");
  return {mask,best,held,key:bestKey,positions:pos};
 }
 // Compare the cyclic optimum with full label enumeration for small alphabets.
 let seed=0x132615;const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};let toy=0;
 for(let j=0;j<24;j++){
  const C=Array.from({length:10},()=>rng()%3);
  for(const q of [2,3,4]){
   const mask=rng()%(2**C.filter(x=>x===0).length);
   let best=0;
   for(let n=0;n<3**q;n++){
    let k=Array(q),a=n;for(let r=0;r<q;r++){k[r]=a%3;a=Math.floor(a/3)}
    let p=0,z=0,spacePrev=false,count=0,valid=true;
    for(const c of C){if(c===0&&((mask>>z++)&1)){spacePrev=false;continue}const isSpace=c===k[p];p=(p+1)%q;if(spacePrev&&isSpace){valid=false;break}count+=isSpace;spacePrev=isSpace}
    if(valid)best=Math.max(best,count);
   }
   if(solve(C,q,mask,3).best!==best)throw Error("toy mismatch");toy++;
  }
 }
 // Native-like control with guaranteed no consecutive designated spaces.
 const P=Array.from({length:308},(_,i)=>i%5===4?26:(i*7)%25);
 const maps=Array.from({length:q},()=>{const a=Array.from({length:A},(_,i)=>i);for(let i=A-1;i>0;i--){const j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a});
 let phase=0,mask=0,z=0;
 // For the toy control hold at most six F symbols and never hold space.
 const C=P.map(x=>{if(x===5&&z<6){mask|=1<<z;z++;return 0}const c=maps[phase][x];phase=(phase+1)%q;if(c===0)z++;return c});
 if(z>=31)throw Error("control mask too large");
 const plant=solve(C,q,mask);if(plant.best<P.filter(x=>x===26).length)throw Error("plant count");
 const original=gp.pages.filter(x=>x.page>=54&&x.page<=55).flatMap(x=>x.indices),zero=original.filter(x=>x===0).length,rows=[];
 for(let mask=0;mask<2**zero;mask++)rows.push(solve(original,q,mask));
 rows.sort((a,b)=>b.best-a.best);return {toy,plant:{truth:P.filter(x=>x===26).length,cap:plant.best},original:{n:original.length,zeros:zero,cap:rows[0].best,rows}};
}
console.log(JSON.stringify(grammarResearch(JSON.parse(fs.readFileSync(path.join(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"))),null,2));
