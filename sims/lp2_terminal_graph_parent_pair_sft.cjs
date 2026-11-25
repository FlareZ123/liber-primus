'use strict';
// Run from repository root: node sims/lp2_terminal_graph_parent_pair_sft.cjs
const fs=require('node:fs');const crypto=require('node:crypto');
const inputs=[["resources/liber-primus/lp2-grid-256.json","2550eae357442912220e05dc51147523a61dd75a"],["resources/liber-primus/lp2-corpus.json","054f2a0f780b7d46901acbe3d9bf4f0ac1801165"],["resources/external/relikd-solved-gp29-native-v1.json","1b064ef6d85819b7d96adaff31a82d1ec551598f"]];
const data=inputs.map(([p,sha])=>{const b=fs.readFileSync(p);const h=crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');if(h!==sha)throw Error('source pin mismatch: '+p);return JSON.parse(b)});
function experiment(grid,corpus,solved){
 const nat=n=>[...solved.sections.find(x=>x.name===n).source_text].map(x=>corpus.runes.indexOf(x)).filter(x=>x>=0);
 const C=corpus.pages[55].indices.concat(corpus.pages[56].indices,corpus.pages[57].indices),P=nat("p56_an_end").concat(nat("p57_parable"));
 const check=(b,m)=>{if(!b)throw Error(m)};
 check(C.length===256&&P.length===180,"length");
 function ring(d,corner,rev){const r0=d,r1=31-d,c0=d,c1=7-d,a=[];for(let c=c0;c<=c1;c++)a.push(8*r0+c);for(let r=r0+1;r<=r1;r++)a.push(8*r+c1);for(let c=c1-1;c>=c0;c--)a.push(8*r1+c);for(let r=r1-1;r>r0;r--)a.push(8*r+c0);const k=a.indexOf([8*r0+c0,8*r0+c1,8*r1+c1,8*r1+c0][corner]);return a.map((_,i)=>a[(k+(rev?-i:i)+a.length)%a.length])}
 const layouts=[];for(const axis of ["row","column"])for(const a of [0,1])for(const b of [0,1])for(const snake of [0,1]){const s=[],o=axis==="row"?30:6,inn=axis==="row"?6:30;for(let i=0;i<o;i++)for(let j=0;j<inn;j++){const x=a?o-i:i+1,y=(b^(snake&&i%2))?inn-j:j+1;s.push(axis==="row"?8*x+y:8*y+x)}layouts.push({name:[axis,a,b,snake].join("-"),s})}for(let k=0;k<4;k++)for(const v of [false,true])layouts.push({name:`ring-${k}-${+v}`,s:[1,2,3].flatMap(d=>ring(d,k,v))});
 function scan(T,order,cs,ps){const f=new Map(),b=new Map();let pairs=0,forward=0,reverse=0,either=0,witnessF=null,witnessR=null;for(const v of order){const p=T[v];if(ps[v]<0||ps[p]<0)continue;pairs++;const x=`${cs[p]},${ps[p]},${cs[v]}`,y=`${cs[p]},${ps[p]},${ps[v]}`,fc=f.has(x)&&ps[f.get(x)]!==ps[v],bc=b.has(y)&&cs[b.get(y)]!==cs[v];const show=u=>[u,v].map(i=>({child:i,parent:T[i],C:cs[i],P:ps[i],parentC:cs[T[i]],parentP:ps[T[i]]}));if(fc){forward++;witnessF??=show(f.get(x))}if(bc){reverse++;witnessR??=show(b.get(y))}if(fc||bc)either++;f.set(x,v);b.set(y,v)}return {pairs,forward,reverse,either,witnessF,witnessR}}
 const result=[],controls=[];
 let state=0x951a;
 const rand=n=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state%n};
 for(const radix of [59,60]){const alpha=radix===59?grid.alphabet.replace("f",""):grid.alphabet,T=grid.pages.flatMap(p=>p.tokens).map(t=>alpha.indexOf(t[0])*radix+alpha.indexOf(t[1]));check(T.length===256&&T.every(v=>v>=0&&v<256),"graph");const deg=Array(256).fill(0);T.forEach(v=>deg[v]++);const order=deg.flatMap((d,i)=>d?[]:[i]);for(let k=0;k<order.length;k++)if(--deg[T[order[k]]]===0)order.push(T[order[k]]);
 for(const l of layouts){check(new Set(l.s).size===180,"layout");const cs=Array(256).fill(-1),ps=Array(256).fill(-1);l.s.forEach((v,i)=>{cs[v]=C[i+76];ps[v]=P[i]});result.push({radix,layout:l.name,...scan(T,order,cs,ps)})}
 for(let trial=0;trial<3;trial++){const p=Array(256),c=Array(256),rec=Array(256),rows=Array.from({length:841},()=>{const a=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a});const donor=nat("p56_an_end").slice(trial,trial+76);check(donor.length===76,"donor");ring(0,0,false).forEach((v,i)=>p[v]=donor[i]);layouts[trial].s.forEach((v,i)=>p[v]=P[i]);for(let v=0;v<256;v++)if(deg[v]>0)c[v]=rec[v]=p[v];for(const v of order.slice().reverse()){const u=T[v];c[v]=rows[c[u]*29+p[u]].indexOf(p[v]);rec[v]=rows[c[u]*29+rec[u]][c[v]]}check(rec.every((v,i)=>v===p[i]),"roundtrip");const masked=p.slice();ring(0,0,false).forEach(v=>masked[v]=-1);const s=scan(T,order,c,masked);check(s.either===0,"positive control");controls.push({radix,trial,roundtrip:256,knownPairs:s.pairs,contradictions:s.either})}
 }
 return {result,controls};
}
console.log(JSON.stringify(experiment(...data),null,2));
