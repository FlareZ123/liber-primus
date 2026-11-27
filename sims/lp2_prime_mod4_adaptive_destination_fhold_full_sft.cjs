'use strict';
const fs=require('node:fs');
/** Literal-F-hold all-initial-list singleton gate for GP-prime residue classes modulo four. */
function run(g,trans,native,batch=0){
const N=29,ALL=(1<<N)-1,cat=g.prime.map(p=>p%4===2?0:p%4===1?1:2),bits=Array.from({length:N+1},(_,i)=>(1<<i)-1);
const glyph=new Map(g.runes.map((x,i)=>[x,i])),parse=t=>(t.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>Array.from(w,x=>glyph.get(x)));
const ws=parse(trans.replace(/[\s/%]/g,"")).slice(0,2896),C=ws.flat();if(String(C)!==String(g.pages.slice(0,56).flatMap(p=>p.indices))||C.length!==12956)throw Error("source mismatch");
function marker(ws){let mark=new Uint8Array(ws.flat().length),offset=0;for(let w of ws){if(w.length===1)mark[offset]=1;offset+=w.length}return mark}
const markers=marker(ws);
function propagate(D){let fixed=0,prev;do{prev=fixed;fixed=0;for(let y=0;y<N;y++){let V=D[y];if(!V)return false;if((V&(V-1))===0){if(fixed&V)return false;fixed|=V}}for(let y=0;y<N;y++){let V=D[y];if((V&(V-1))!==0){D[y]=V&~fixed;if(!D[y])return false}}}while(prev!==fixed);return true}
function masks(B,d){let lo=31-Math.clz32(B&-B),hi=31-Math.clz32(B),down=bits[d+1]&~bits[lo+1],up=bits[hi]&~bits[d],same=(bits[Math.min(hi,d)]|(ALL&~bits[Math.max(lo,d)+1]))&ALL;return[down,up,same]}
function step(D,c,d){let [down,up,same]=masks(D[c],d);for(let y=0;y<N;y++)if(y!==c){let V=D[y];D[y]=((V&down)>>>1)|((V&up)<<1)|(V&same)}D[c]=1<<d;return propagate(D)}
function bound(C,markers,R,pair=0,f=-1){let D=new Int32Array(N).fill(ALL),P=new Int32Array(N).fill(ALL);
for(let i=0;i<C.length;i++){let c=C[i],d=R[c],B=D[c];if(markers[i]){if(pair){D[c]=B&pair;if(!propagate(D))return{dead:i};}else{let any=0;for(let a=0;a<N;a++){if(!(B&(1<<a)))P[a]&=B;any|=P[a]&~(1<<a)}if(!any)return{dead:i}}}
if(c===0&&!markers[i]){let E=D.slice();if(f>=0)E[c]&=~(1<<f);if(E[c]&&propagate(E)&&step(E,c,d))for(let y=0;y<N;y++)D[y]|=E[y];}
else{if(f>=0){D[c]&=~(1<<f);if(!propagate(D))return{dead:i}}if(!step(D,c,d))return{dead:i};}
}
let pairs=[];if(!pair)for(let a=0;a<N;a++)for(let b=a+1;b<N;b++)if(P[a]&(1<<b))pairs.push([a,b]);return{dead:null,pairs}}
function splitBound(C,markers,R,pair,f=-1){
let states=Array.from({length:N},(_,z)=>{let D=new Int32Array(N).fill(ALL);D[0]=1<<z;propagate(D);return D}),maxStates=N,transitions=0;
for(let i=0;i<C.length;i++){let c=C[i],d=R[c],next=Array(N).fill(null);
function merge(z,D){if(!next[z])next[z]=D;else for(let y=0;y<N;y++)next[z][y]|=D[y]}
for(let z=0;z<N;z++){let D=states[z];if(!D)continue;
if(c===0&&!markers[i])merge(z,D.slice());
let B=D[c]&(markers[i]?pair:ALL)&(f>=0?~(1<<f):ALL);if(!B)continue;
if(c===0){let E=D.slice();E[c]=B;if(propagate(E)&&step(E,c,d)){merge(d,E);transitions++}}
else for(let k=-1;k<=1;k++){let zz=z+k;if(zz<0||zz>=N)continue;let J=k===-1?(z<=d?B&bits[z]:0):k===1?(d<=z?B&~bits[z+1]:0):B&~((z<=d?bits[z]:0)|(d<=z?ALL&~bits[z+1]:0));if(!J)continue;let E=D.slice();E[c]=J;if(!propagate(E)||!step(E,c,d))continue;E[0]&=1<<zz;if(!propagate(E))continue;merge(zz,E);transitions++}
}
states=next;let count=states.filter(Boolean).length;if(!count)return{dead:i,maxStates,transitions};maxStates=Math.max(maxStates,count);
}return{dead:null,maxStates,transitions}}
let controls=null;
if(batch===0){
// Verify all individual removal/insertion rank cases against the mask formula.
let checks=0;for(let j=0;j<N;j++)for(let d=0;d<N;d++)for(let r=0;r<N;r++)if(r!==j){let q=r-(r>j);q+=q>=d;let [down,up,same]=masks(1<<j,d),b=1<<r,z=((b&down)>>>1)|((b&up)<<1)|(b&same);if(z!==(1<<q))throw Error("mask formula");checks++}
const nw=native.sections.flatMap(s=>parse(s.source_text.replace(/['’]/g,""))),single=[...new Set(nw.filter(w=>w.length===1).flat())].sort((a,b)=>a-b);if(String(single)!=="10,24")throw Error("native singleton");
let seed=318311;function rnd(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}function perm(){let a=Array.from({length:N},(_,i)=>i);for(let i=N-1;i;i--){let j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
let plants=[];for(let d of [[2,15,25],[13,13,23],[4,19,8],[0,28,14],[28,0,0],[18,18,18]]){let R=cat.map(c=>d[c]),P=nw.flat(),S=perm(),A=perm(),ct=[];for(let p of P){if(p===0){ct.push(0);continue}let j=S[p],c=A[j];ct.push(c);A.splice(j,1);A.splice(R[c],0,c)}let m=marker(nw),p=[S[10],S[24]].sort((a,b)=>a-b),pair=(1<<p[0])|(1<<p[1]),u=bound(ct,m,R),v=bound(ct,m,R,pair),w=splitBound(ct,m,R,pair,S[0]);if(u.dead!==null||!u.pairs.some(x=>String(x)===String(p))||v.dead!==null||w.dead!==null)throw Error("plant truth lost");plants.push({d,n:ct.length,singletons:m.reduce((a,b)=>a+b,0),p,unconstrainedPairs:u.pairs.length,forbiddenRank:w, f:S[0]})}
controls={checks,plants};
}
let totals={maps:0,stage1Dead:0,stage1Pairs:0,stage2Dead:0,stage2Pairs:0,splitDead:0,splitPairs:0},surv=[],splitRows=[],deadHistogram={};
// One batch per first target rank, with reflection quotient.
for(let b=0;b<N;b++)for(let c=0;c<N;c++){
let a=batch,d=[a,b,c],reverse=d.map(x=>N-1-x);if(d.join(",")===reverse.join(",")){}else if(a>reverse[0]||(a===reverse[0]&&(b>reverse[1]||(b===reverse[1]&&c>reverse[2]))))continue;
// Constant targets included.
totals.maps++;let R=cat.map(x=>d[x]),u=bound(C,markers,R);if(u.dead!==null){totals.stage1Dead++;deadHistogram[u.dead]=(deadHistogram[u.dead]||0)+1;continue}
totals.stage1Pairs+=u.pairs.length;let stage2=0,stage3=0;
for(let [x,y] of u.pairs){let mask=(1<<x)|(1<<y),v=bound(C,markers,R,mask);if(v.dead!==null)continue;stage2++;totals.stage2Pairs++;let split=splitBound(C,markers,R,mask);splitRows.push({d,pair:[x,y],...split});if(split.dead!==null)continue;stage3++;totals.splitPairs++;surv.push({d,pair:[x,y],split})}
if(!stage2)totals.stage2Dead++;else if(!stage3)totals.splitDead++;
}
return{batch,totals,surv,splitRows,deadHistogram,controls}
}
const files=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const x=files.map(p=>fs.readFileSync(p,'utf8'));
console.log(JSON.stringify(run(JSON.parse(x[0]),x[1],JSON.parse(x[2]),Number(process.argv[2]||0)),null,2));
