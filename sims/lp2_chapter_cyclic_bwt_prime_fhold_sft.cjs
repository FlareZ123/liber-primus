'use strict';
// Director #2680; run from repository root with Node.
const fs=require('node:fs');
function experiment(A,B){
 const assert=(v,m)=>{if(!v)throw Error(m)},same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const mod=x=>(x%29+29)%29;
 const K=[];for(let n=2;K.length<13000;n++){let p=true;for(let d=2;d*d<=n;d++)if(n%d===0){p=false;break}if(p)K.push((n-1)%29)}
 const native=s=>[...s.source_text].map(c=>A.runes.indexOf(c)).filter(x=>x>=0);
 const enc=p=>{let j=0;return p.map(x=>x===0?0:mod(x+K[j++]))};
 function bwt(x){let n=x.length;const rows=Array.from({length:n},(_,i)=>i).sort((a,b)=>{for(let k=0;k<n;k++){let d=x[(a+k)%n]-x[(b+k)%n];if(d)return d;}return a-b});return {L:rows.map(i=>x[(i+n-1)%n]),primary:rows.indexOf(0)}}
 function lf(L){const count=new Array(29).fill(0),start=new Array(29).fill(0);for(const x of L)count[x]++;for(let i=1;i<29;i++)start[i]=start[i-1]+count[i-1];return L.map(x=>start[x]++)}
 function inverse(L,T,row){const x=new Array(L.length);for(let i=L.length-1;i>=0;i--){x[i]=L[row];row=T[row]}return x}
 function gate(L){const T=lf(L),seen=new Uint8Array(L.length),lens=[];for(let i=0;i<L.length;i++)if(!seen[i]){let j=i,n=0;do{seen[j]=1;j=T[j];n++}while(j!==i);lens.push(n)}lens.sort((a,b)=>a-b);const equal=lens[0]===lens[lens.length-1];const legal=equal&&same(bwt(inverse(L,T,0)).L,L);return {lens,legal,T}}
 function paths(c){let row=new Uint8Array(c.length+2),z=0;row[0]=1;for(let i=0;i<c.length;i++){let any=0,v=c[i];if(v===0){for(let h=z+1;h>=0;h--){row[h]=((h<=z&&row[h]&&K[i-h]!==0)||(h>0&&row[h-1]))?1:0;any|=row[h]}z++}else{for(let h=0;h<=z;h++){if(row[h]&&K[i-h]===v)row[h]=0;any|=row[h]}}if(!any)return i}return c.length}
 const controls=[];for(const s of B.sections){const p=native(s);if(p.length<30)continue;const c=enc(p),w=bwt(c),g=gate(w.L);assert(g.legal&&same(inverse(w.L,g.T,w.primary),c),"plant BWT inverse");assert(paths(c)===c.length,"plant F reachability");controls.push({name:s.name,n:p.length,primary:w.primary,lens:g.lens})}
 const p56=native(B.sections.find(s=>s.name==="p56_an_end"));assert(same(enc(p56),A.pages[56].indices),"authentic p56");
 for(const p of [[0,1,0,1],[2,2,2],[0,1,2,0,1,2],[2,1,0,1,0,2]]){let w=bwt(p),g=gate(w.L);assert(g.legal&&same(inverse(w.L,g.T,w.primary),p),"periodic/tie control")}
 assert(!gate([0,1]).legal,"invalid BWT identity with different cycle labels");
 let seed=2680;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
 const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 let orig=chapters.map(([lo,hi])=>{const L=A.pages.slice(lo,hi+1).flatMap(p=>p.indices),g=gate(L);let nullLegal=0;for(let k=0;k<200;k++){let z=L.slice();for(let i=z.length-1;i>0;i--){let j=Math.floor(rand()*(i+1));[z[i],z[j]]=[z[j],z[i]]}if(gate(z).legal)nullLegal++}let legalRows=[],max=0;if(g.legal){for(let i=0;i<L.length;i++){let c=inverse(L,g.T,i),n=paths(c);if(n>max)max=n;if(n===L.length)legalRows.push(i)}}return {lo,hi,n:L.length,lens:g.lens,legal:g.legal,nullLegal,rowsTested:g.legal?L.length:0,legalRows,max}});
 return {p56:p56.length,controls,orig};
}
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
console.log(JSON.stringify(experiment(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
