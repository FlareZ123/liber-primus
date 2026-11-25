'use strict';
const fs=require('node:fs');
const experiment=function(corpus,native,literary){
const assert=(x,m)=>{if(!x)throw Error(m)};
const mod=(x,m)=>((x%m)+m)%m, primes=[];for(let n=2;primes.length<15000;n++){let ok=true;for(let d of primes){if(d*d>n)break;if(n%d===0){ok=false;break}}if(ok)primes.push(n)}
const origins=primes.filter(p=>p<=3301).length;assert(origins===464,"prime origin");
const A0=Array.from({length:29},(_,i)=>i), sym=new Map(corpus.runes.map((r,i)=>[r,i]));
const sections=native.sections.map(s=>({name:s.name,P:[...s.source_text].filter(x=>sym.has(x)).map(x=>sym.get(x))}));assert(sections.reduce((s,x)=>s+x.P.length,0)===2979,"native size");
const C=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);assert(C.length===12956,"original size");
const trainN=corpus.pages.filter(p=>p.page<3).reduce((s,p)=>s+p.indices.length,0),holdStart=corpus.pages.filter(p=>p.page<40).reduce((s,p)=>s+p.indices.length,0),holdEnd=corpus.pages.filter(p=>p.page<54).reduce((s,p)=>s+p.indices.length,0);
const rs=(C)=>{let a=A0.slice();return C.map(c=>{let j=a.indexOf(c);a.splice(j,1);a.unshift(c);return j})};
const labels=(ranks,origin)=>{let t=origin;return ranks.map(j=>j===0?-1:mod(j-1-(primes[t++]-1),28))};
const inverse=(z,iv,S=A0.slice(0,28))=>{let q=iv;return z.map(x=>{let e=28-q;if(x<0)q=e;else{let r=S[x];q=r+(r>=e?1:0)}return q})};
const encode=(P,origin,iv,S=A0.slice(0,28))=>{let t=origin,q=iv,a=A0.slice(),out=[];for(let p of P){let e=28-q,j=0;if(p!==e){let r=p-(p>e?1:0);j=1+mod(S.indexOf(r)+primes[t++]-1,28)}let c=a[j];out.push(c);a.splice(j,1);a.unshift(c);q=p}return out};
const eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
const makeModel=(sets)=>{let u=Array(29).fill(1),b=Array.from({length:29},()=>Array(29).fill(0)),t=Array.from({length:841},()=>Array(29).fill(0));for(let P of sets)for(let i=0;i<P.length;i++){u[P[i]]++;if(i)b[P[i-1]][P[i]]++;if(i>1)t[29*P[i-2]+P[i-1]][P[i]]++}let us=u.reduce((a,b)=>a+b),p1=u.map(v=>v/us);let p2=b.map(row=>{let n=row.reduce((a,b)=>a+b);return row.map((v,k)=>(v+10*p1[k])/(n+10))});let p3=t.map((row,j)=>{let n=row.reduce((a,b)=>a+b);return row.map((v,k)=>Math.log((v+10*p2[j%29][k])/(n+10)))});return {p1:p1.map(Math.log),p2:p2.map(row=>row.map(Math.log)),p3}};
const score=(P,m,a=0,b=P.length)=>{let z=0;for(let i=a;i<b;i++)z+=i>1?m.p3[29*P[i-2]+P[i-1]][P[i]]:i?m.p2[P[i-1]][P[i]]:m.p1[P[i]];return z/(b-a)};
const recover=(ranks,train,m)=>{let best={score:-Infinity},short=ranks.slice(0,train);for(let o=0;o<origins;o++){let z=labels(short,o);for(let iv=0;iv<29;iv++){let P=inverse(z,iv),s=score(P,m);if(s>best.score)best={origin:o,iv,score:s}}}return best};
const stats=(P)=>{let h=Array(29).fill(0);for(let x of P)h[x]++;return {n:P.length,max:Math.max(...h),E:h[18],ioc:h.reduce((s,x)=>s+x*(x-1),0)/(P.length*(P.length-1)),hist:h}};
const bounds=(ranks,a,b)=>{let best={cap:0};let repeats=ranks.slice(a,b).filter(x=>x===0).length;for(let o=0;o<origins;o++){let h=Array(28).fill(0);for(let z of labels(ranks,o).slice(a,b))if(z>=0)h[z]++;let top=h.slice().sort((a,b)=>b-a);let cap=top[0]+top[1]+repeats;if(cap>best.cap)best={origin:o,cap,top:top.slice(0,2),repeats,hist:h}}return best};
const rr=rs(C);let regionBounds={whole:bounds(rr,0,C.length),development:bounds(rr,0,trainN),holdout:bounds(rr,holdStart,holdEnd)};
let lit=literary.toUpperCase();let start=lit.indexOf("ALMUSTAFA, THE CHOSEN");if(start>=0)lit=lit.slice(start);let end=lit.indexOf("END OF THE PROJECT GUTENBERG");if(end>=0)lit=lit.slice(0,end);
let gMap=new Map(corpus.translit.map((x,i)=>[x,i]));let gp=[];for(let w of lit.match(/[A-Z]+/g)){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");for(let i=0;i<w.length;){let d=w.slice(i,i+2);if(gMap.has(d)){gp.push(gMap.get(d));i+=2}else{assert(gMap.has(w[i]),"unmapped "+w[i]);gp.push(gMap.get(w[i++]));}}}
assert(gp.length>3*C.length,"literary length");
const minWindow=(n)=>{let h=Array(29).fill(0);for(let i=0;i<n;i++)h[gp[i]]++;let minE=h[18],minMax=Math.max(...h),count=1;for(let i=n;i<gp.length;i++){h[gp[i-n]]--;h[gp[i]]++;minE=Math.min(minE,h[18]);minMax=Math.min(minMax,Math.max(...h));count++}return {n,count,minE,minMax}};
const windows={whole:minWindow(C.length),development:minWindow(trainN),holdout:minWindow(holdEnd-holdStart)};
const model=makeModel(sections.map(x=>x.P)),winner=recover(rr,trainN,model),P=inverse(labels(rr,winner.origin),winner.iv);assert(eq(encode(P,winner.origin,winner.iv),C),"original replay");
let controls=[];for(let [k,sec] of sections.filter(s=>s.P.length>=300).slice(0,4).entries()){let o=[37,101,229,401][k],iv=[24,11,18,2][k],cp=encode(sec.P,o,iv),r=rs(cp),z=labels(r,o);assert(eq(inverse(z,iv),sec.P),"control inverse");let m=makeModel(sections.filter(s=>s!==sec).map(s=>s.P));let n=Math.floor(sec.P.length*.6);let win=recover(r,n,m);let pp=inverse(labels(r,win.origin),win.iv);let correct=pp.reduce((s,v,i)=>s+(v===sec.P[i]),0),held=pp.slice(n).reduce((s,v,i)=>s+(v===sec.P[n+i]),0);let arbitrary=S=>{let ct=encode(sec.P,o,iv,S),r=rs(ct);assert(eq(inverse(labels(r,o),iv,S),sec.P),"arbitrary permutation replay");return true};let S=Array.from({length:28},(_,i)=>(9*i+5)%28);[S[0],S[13]]=[S[13],S[0]];controls.push({name:sec.name,n:sec.P.length,train:n,planted:{o,iv},winner:win,correct,held,holdN:sec.P.length-n,heldScore:score(pp,m,n),nativeScore:score(sec.P,m,n),arbitraryPermutationReplay:arbitrary(S)})}
const render=P=>P.map(x=>corpus.translit[x]).join("");
return {source:{n:C.length,trainN,holdStart,holdEnd,primeOrigins:origins,literaryLength:gp.length,native:sections.map(s=>({name:s.name,...stats(s.P)}))},regionBounds,windows,controls,original:{winner,trainStats:stats(P.slice(0,trainN)),holdStats:stats(P.slice(holdStart,holdEnd)),wholeStats:stats(P),heldScore:score(P,model,holdStart,holdEnd),trainPreview:render(P.slice(0,180)),holdPreview:render(P.slice(holdStart,holdStart+180)),decoded:P,replay:true}};
};
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt"];
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync(paths[0],'utf8')),JSON.parse(fs.readFileSync(paths[1],'utf8')),fs.readFileSync(paths[2],'utf8')),null,2));
