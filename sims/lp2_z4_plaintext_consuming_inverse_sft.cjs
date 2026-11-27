'use strict';
const fs=require('node:fs');
function experiment(corpus,native) {
 const alphabet=corpus.runes, encode=s=>Array.from(s).map(x=>alphabet.indexOf(x)).filter(x=>x>=0);
 const data=native.sections.map(s=>encode(s.source_text));
 const counts=Array.from({length:30},()=>Array(29).fill(.5));
 for(const row of data.slice(0,5)){let last=29;for(const p of row){counts[last][p]++;last=p;}}
 const lm=counts.map(row=>{const n=row.reduce((a,b)=>a+b,0);return row.map(v=>Math.log(v/n))});
 const keys=[[23,10,1,10,9,10,16,26],[0,10,4,0,1,19,0,18,4,18,9,0,18]];
 const edit=(a,b)=>{let d=Array.from({length:b.length+1},(_,i)=>i);for(let i=0;i<a.length;i++){let e=[i+1];for(let j=0;j<b.length;j++)e.push(Math.min(e[j]+1,d[j+1]+1,d[j]+(a[i]!==b[j])));d=e;}return d[b.length];};
 function make(K,m=36){
  const q=K.length, T=Array.from({length:q},(_,t)=>Array.from({length:m+1},(_,prev)=>Array.from({length:29},(_,p)=>{let z=t,c=(p+K[z])%m;while(c===prev){z=(z+1)%q;c=(p+K[z])%m;if(z===t)throw Error("cycle");}return [c,(z+1)%q];})));
  function enc(P,phase){let prev=m, C=[],n=0,trim=0;for(let i=0;i<P.length;i++){const [c,t]=T[phase][prev][P[i]];phase=t;prev=c;if(c<29){C.push(c);trim=i+1;}else n++;}return {C,trim,hidden:n};}
  function decode(C){
   // State includes clock, previous latent symbol, previous plaintext; max-heap Dijkstra over silent edges.
   const id=(t,c,p)=>(t*(m+1)+c)*30+p, N=q*(m+1)*30;
   let active=Array.from({length:q},(_,t)=>({id:id(t,m,29),s:0,link:null,phase:t}));
   for(const target of C){
    let best=new Float64Array(N).fill(-Infinity), heap=[], next=new Map();
    function push(a){let i=heap.length;heap.push(a);while(i){let j=(i-1)>>1;if(heap[j].s>=a.s)break;heap[i]=heap[j];i=j;}heap[i]=a;}
    function pop(){let a=heap[0],x=heap.pop();if(heap.length){let i=0;while(2*i+1<heap.length){let j=2*i+1;if(j+1<heap.length&&heap[j+1].s>heap[j].s)j++;if(heap[j].s<=x.s)break;heap[i]=heap[j];i=j;}heap[i]=x;}return a;}
    for(const a of active){if(a.s>best[a.id]){best[a.id]=a.s;push(a);}}
    while(heap.length){const a=pop();if(a.s!==best[a.id])continue;const p0=a.id%30, v=(a.id-p0)/30,c0=v%(m+1),t=(v-c0)/(m+1);
     for(let p=0;p<29;p++){const [c,t1]=T[t][c0][p];if(c!==target&&c<29)continue;const j=id(t1,c,p),s=a.s+lm[p0][p];if(c===target){if(!next.has(j)||s>next.get(j).s)next.set(j,{id:j,s,link:{p,prev:a.link},phase:a.phase});}else if(s>best[j]){best[j]=s;push({id:j,s,link:{p,prev:a.link},phase:a.phase});}}
    }
    active=Array.from(next.values());if(!active.length)return null;
   }
   const a=active.reduce((x,y)=>x.s>y.s?x:y);let P=[];for(let l=a.link;l;l=l.prev)P.push(l.p);P.reverse();const replay=enc(P,a.phase);if(replay.C.join(",")!==C.join(",")||replay.trim!==P.length)throw Error("roundtrip");return {P,score:a.s,phase:a.phase};
  }
  return {enc,decode};
 }
 const out=[];
 for(let k=0;k<2;k++){const {enc,decode}=make(keys[k]);for(let j=5;j<9;j++){let phase=(j*3+k)%keys[k].length;let plant=enc(data[j],phase),truth=data[j].slice(0,plant.trim),a=decode(plant.C);if(!a)throw Error("plant failed");out.push({key:k,scope:native.sections[j].name,kind:"plant",visible:plant.C.length,truePlain:truth.length,decoded:a.P.length,phase,truePhase:phase,recoveredPhase:a.phase,edit:edit(truth,a.P),score:a.score/plant.C.length,repeat:plant.C.filter((v,i)=>i&&v===plant.C[i-1]).length});}
 for(const [name,C] of [["p0-black–p2",corpus.pages[0].indices.slice(13).concat(corpus.pages[1].indices,corpus.pages[2].indices)],["p54-black–p55",corpus.pages[54].indices.slice(9).concat(corpus.pages[55].indices)]]){const a=decode(C);out.push(a?{key:k,scope:name,kind:"original",visible:C.length,decoded:a.P.length,score:a.score/C.length,phase:a.phase,preview:a.P.slice(0,120).map(p=>corpus.translit[p]).join("")}:{key:k,scope:name,kind:"original",unreachable:true});}}
 return out;
}
const c=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8')); const n=JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8')); console.log(JSON.stringify(experiment(c,n),null,2));
