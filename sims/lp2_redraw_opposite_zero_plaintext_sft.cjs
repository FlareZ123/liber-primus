"use strict";
// All-path, all-offset language and symbol-concentration decision for the exact opposite-zero survivors.
function run(co,native,gibran,shakespeare,orig,plantResult){
const Q=8,A=29,m=x=>((x%29)+29)%29,cut=9640;
const gpMap=new Map(co.runes.map((r,i)=>[r,i]));
const gp=s=>[...s].filter(x=>gpMap.has(x)).map(x=>gpMap.get(x));
function eng(s){let a=s.toUpperCase().replace(/[^A-Z]+/g," ").replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");let out=[];for(let i=0;i<a.length;){if(a[i]===" "){i++;continue}let v=co.translit.indexOf(a.slice(i,i+2));if(v>=0){out.push(v);i+=2}else{v=co.translit.indexOf(a[i++]);if(v>=0)out.push(v)}}return out}
function keyOf(D){let k=[0];for(let j=0;j<7;j++)k.push(m(k[j]+D[j]));if(m(k[7]+D[7])!==0)throw Error("nonclosed");return k}
let seed=(0x3f910aaa+0x517cc1)>>>0;
function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return ((seed>>>0)+.5)/4294967296}
function rand(n){return Math.floor(rng()*n)}
let trueD;do{trueD=[1+rand(28),1+rand(28),1+rand(28),0,1+rand(28),1+rand(28),1+rand(28),0];trueD[6]=m(-trueD.reduce((a,b)=>a+b,0)+trueD[6])}while(!trueD[6]);
if(trueD.join(",")!==plantResult.truth.join(","))throw Error("plant key drift");
const donor=eng(gibran),other=eng(shakespeare),P=donor.slice(19000,19000+12956),trueK=keyOf(trueD).map(x=>m(x+11));
function emit(p,K,j){let prev=-1,c=[];for(let x of p){let y=m(x+K[j]);j=(j+1)%Q;if(y===prev){y=m(x+K[j]);j=(j+1)%Q}c.push(y);prev=y}return c}
const Cp=emit(P,trueK,rand(Q)),C=co.pages.slice(0,56).flatMap(p=>p.indices);
const counts=Array.from({length:A},()=>new Float64Array(A).fill(.3));
for(let s of native.sections){let p=gp(s.source_text);for(let i=1;i<p.length;i++)counts[p[i-1]][p[i]]++}
const lm=counts.map(row=>{let s=row.reduce((a,b)=>a+b,0);return Array.from(row,x=>Math.log(A*x/s))});
function decode(c,K,previous=null,startPhase=null){let n=c.length,prev=c[0],a=new Float64Array(Q).fill(-Infinity),back=new Int8Array(n*Q).fill(-1);if(previous===null){for(let j=0;j<Q;j++)a[(j+1)%Q]=0}else{a[startPhase]=0;prev=previous.c}
let first=previous===null?1:0;
for(let i=first;i<n;i++){let b=new Float64Array(Q).fill(-Infinity),x=c[i];for(let j=0;j<Q;j++){if(!Number.isFinite(a[j]))continue;let p0=i===0?previous.p:m(prev-K[(j+Q-1)%Q]);if(x!==prev){let p=m(x-K[j]),k=(j+1)%Q,s=a[j]+lm[p0][p];if(s>b[k]){b[k]=s;back[i*Q+k]=j}}let p=m(prev-K[j]);if(m(p+K[(j+1)%Q])===x){let k=(j+2)%Q,s=a[j]+lm[p0][p];if(s>b[k]){b[k]=s;back[i*Q+k]=j}}}a=b;prev=x}
let end=0;for(let j=1;j<Q;j++)if(a[j]>a[end])end=j;if(!Number.isFinite(a[end]))return {score:-Infinity,p:[],end:null};let p=Array(n),j=end;for(let i=n-1;i>=first;i--){p[i]=m(c[i]-K[(j+Q-1)%Q]);j=back[i*Q+j];if(j<0)throw Error("bad backpointer")}if(previous===null)p[0]=m(c[0]-K[(j+Q-1)%Q]);let initial=previous===null?(j+Q-1)%Q:j;let ph=initial,prior=previous===null?-1:previous.c;for(let i=0;i<n;i++){let y=m(p[i]+K[ph]);ph=(ph+1)%Q;if(y===prior){y=m(p[i]+K[ph]);ph=(ph+1)%Q}if(y!==c[i])throw Error("replay mismatch");prior=y}if(ph!==end)throw Error("phase replay mismatch");return {score:a[end],p,end,initial}}
function fit(c,D){let K0=keyOf(D),best=null;for(let s=0;s<A;s++){let K=K0.map(x=>m(x+s)),d=decode(c,K);if(best===null||d.score>best.score)best={K,...d}}return best}
function frozen(c,D,P){let p=fit(c.slice(0,cut),D),h=decode(c.slice(cut),p.K,{c:c[cut-1],p:p.p.at(-1)},p.end);return {D,K:p.K,fitScore:p.score/(cut-1),heldScore:h.score/(c.length-cut),fitCorrect:P?p.p.filter((x,i)=>x===P[i]).length:null,heldCorrect:P?h.p.filter((x,i)=>x===P[cut+i]).length:null,fitEnd:p.end,heldN:h.p.length,heldPreview:h.p.slice(0,100).map(x=>co.translit[x]).join(" ")}}
function countAndTop2(c,D){
let n=c.length,K=keyOf(D),p=new Uint8Array(n*Q),flags=new Uint8Array(n*Q),pc=Array(Q).fill(1n);
for(let i=0;i<n;i++)for(let j=0;j<Q;j++){p[i*Q+j]=m(c[i]-K[(j+7)%Q]);if(i){let d=m(c[i]-c[i-1]);flags[i*Q+j]=(d!==0?1:0)|(d===D[(j+6)%Q]?2:0)}}
for(let i=1;i<n;i++){let next=Array(Q).fill(0n);for(let j=0;j<Q;j++){let f=flags[i*Q+j];if(f&1)next[j]+=pc[(j+7)%Q];if(f&2)next[j]+=pc[(j+6)%Q]}pc=next}
let paths=pc.reduce((a,b)=>a+b,0n);if(paths===0n)throw Error("no paths");
let best=-1,bestPair=null,a=new Int32Array(Q),b=new Int32Array(Q);
for(let x=0;x<A;x++)for(let y=x+1;y<A;y++){
for(let j=0;j<Q;j++)a[j]=+(p[j]===x||p[j]===y);
for(let i=1;i<n;i++){for(let j=0;j<Q;j++){let f=flags[i*Q+j],v=-1000000000;if(f&1)v=a[(j+7)%Q];if(f&2)v=Math.max(v,a[(j+6)%Q]);let z=p[i*Q+j];b[j]=v+ +(z===x||z===y)}[a,b]=[b,a]}
let val=Math.max(...a);if(val>best){best=val;bestPair=[x,y]}}
return {pathCount:paths.toString(),pathLog2:paths.toString(2).length-1,top2Count:best,top2Rate:best/n,pair:bestPair};
}
function top2(p){let n=Array(A).fill(0);for(let x of p)n[x]++;n.sort((a,b)=>b-a);return (n[0]+n[1])/p.length}
function lms(p){let v=0;for(let i=1;i<p.length;i++)v+=lm[p[i-1]][p[i]];return v/(p.length-1)}
let all=orig.allSurvivors.map(D=>frozen(C,D,null)).sort((a,b)=>b.fitScore-a.fitScore);
let legal=orig.ranked.filter(x=>x.heldLL!==null);if(legal.length!==1)throw Error("expected single full candidate");let D=legal[0].D;
let complete=fit(C,D),control=fit(Cp,trueD);
return {fitOnlyRanking:all,original:{D,fullK:complete.K,fullScore:complete.score/(C.length-1),fullPreview:complete.p.slice(0,120).map(x=>co.translit[x]).join(" "),top2Selected:top2(complete.p),exact:countAndTop2(C,D)},control:{frozen:frozen(Cp,trueD,P),fullK:control.K,fullCorrect:control.p.filter((x,i)=>x===P[i]).length,fullScore:control.score/(Cp.length-1),plainTop2:top2(P),exact:countAndTop2(Cp,trueD)},native:native.sections.map(s=>({name:s.name,n:gp(s.source_text).length,top2:top2(gp(s.source_text)),score:lms(gp(s.source_text))})),lengthMatched:[["gibran",donor],["shakespeare",other]].flatMap(([name,a])=>[0,5000,10000,19000,30000].map(start=>({name,start,top2:top2(a.slice(start,start+C.length)),score:lms(a.slice(start,start+C.length))})))}
}
if(typeof module!=="undefined"){module.exports=run;if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8"),json=p=>JSON.parse(read(p));console.log(JSON.stringify(run(json("resources/liber-primus/lp2-corpus.json"),json("resources/external/relikd-solved-gp29-native-v1.json"),read("resources/control/gibran_prophet_58585.txt"),read("resources/control/shakespeare_first300k.txt"),json("im-results/lp2-redraw-opposite-zero-exact-original.json"),json("im-results/lp2-redraw-opposite-zero-exact-gibran.json")),null,2))}}
