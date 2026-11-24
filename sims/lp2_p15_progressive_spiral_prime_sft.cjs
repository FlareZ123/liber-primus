'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(A,B){
 const assert=(x,m)=>{if(!x)throw Error(m)},same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]),mod=x=>(x%29+29)%29;
 const grid=[3258,3222,3152,3038,3278,3299,3298,2838,3288,3294,3296,2472,4516,1206,708,1820],route=[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12],prime=[];
 for(let n=2;prime.length<6000;n++){let yes=true;for(let d=2;d*d<=n;d++)if(n%d===0){yes=false;break;}if(yes)prime.push(n);}
 const fib=[0,1,2];while(fib.length<16)fib.push(fib.at(-1)+fib.at(-2));assert(route.every((p,i)=>grid[p]===Math.abs(3301-prime[fib[i]])),"source grid");
 const K=prime.map(p=>(p-1)%29),native=s=>[...s.source_text].map(c=>A.runes.indexOf(c)).filter(x=>x>=0);
 const enc=(p,o)=>{let j=o;return p.map(x=>x===0?0:mod(x+K[j++]));};
 function geometry(x,inverse=false,progressive=true){const y=Array(x.length);for(let at=0,b=0;at<x.length;at+=16,b++){const n=Math.min(16,x.length-at),shift=progressive?b%16:0,order=Array.from({length:16},(_,j)=>route[(shift+j)%16]).filter(j=>j<n);assert(order.length===n,"permutation");for(let j=0;j<n;j++){if(inverse)y[at+j]=x[at+order[j]];else y[at+order[j]]=x[at+j];}}return y;}
 const p56=native(B.sections.find(s=>s.name==="p56_an_end"));assert(same(enc(p56,0),A.pages[56].indices),"authentic p56");
 const raw=A.pages.slice(16,23).flatMap(p=>p.indices),c=geometry(raw,true);assert(raw.length===1744&&same(geometry(c),raw),"original outer replay");
 const cut=Math.floor(raw.length/32)*16;
 function reach(c,o){let row=new Uint8Array(c.length+2),z=0;row[0]=1;for(let i=0;i<c.length;i++){let any=0;const v=c[i];if(v===0){for(let h=z+1;h>=0;h--){const consume=h<=z&&row[h]&&K[o+i-h]!==0,hold=h>0&&row[h-1];row[h]=consume||hold?1:0;any|=row[h];}z++;}else{for(let h=0;h<=z;h++){if(row[h]&&K[o+i-h]===v)row[h]=0;any|=row[h];}}if(!any)return {n:i,states:0};}return {n:c.length,states:row.reduce((s,x)=>s+x,0)};}
 function sweep(c){let train=[],full=[],max=0,best=[];const hist={};for(let o=0;o<=3301;o++){const r=reach(c,o);hist[r.n]=(hist[r.n]||0)+1;if(r.n>=cut)train.push(o);if(r.n===c.length)full.push({origin:o,states:r.states});if(r.n>max){max=r.n;best=[o];}else if(r.n===max)best.push(o);}return {train,full,max,best,hist};}
 const donorNames=["0_koan_1","0_loss_of_divinity","jpg107-167","jpg229"];const donor=B.sections.filter(s=>donorNames.includes(s.name)).flatMap(native);assert(donor.length>=raw.length,"native length");
 const u=new Float64Array(29).fill(.5),b=Array.from({length:30},()=>new Float64Array(29)),n=new Float64Array(30);for(const s of B.sections.filter(s=>!donorNames.includes(s.name))){let last=29;for(const p of native(s)){u[p]++;b[last][p]++;n[last]++;last=p;}}
 const total=u.reduce((a,v)=>a+v,0),logp=b.map((row,l)=>Array.from(row,(v,p)=>Math.log((v+5*u[p]/total)/(n[l]+5))));
 function decode(c,o){let states=new Map([[29,{h:0,last:29,score:0,prev:null,p:null}]]);for(let i=0;i<c.length;i++){const out=new Map();const add=(s,p,h)=>{const score=s.score+logp[s.last][p],id=h*30+p,old=out.get(id);if(!old||score>old.score)out.set(id,{h,last:p,score,prev:s,p});};for(const s of states.values()){if(c[i]===0)add(s,0,s.h+1);const p=mod(c[i]-K[o+i-s.h]);if(p!==0)add(s,p,s.h);}if(!out.size)return null;states=out;}let best=null;for(const s of states.values())if(!best||s.score>best.score)best=s;const score=best.score,p=[];while(best.prev){p.push(best.p);best=best.prev;}p.reverse();assert(same(enc(p,o),c),"inner replay");return {p,score};}
 function freeze(c,s){const ranked=s.train.map(o=>({o,score:decode(c.slice(0,cut),o).score})).sort((a,b)=>b.score-a.score||a.o-b.o);if(!ranked.length)return null;const chosen=ranked[0].o,d=decode(c,chosen);return {chosen,prefixScore:ranked[0].score,full:d};}
 const orig=sweep(c),fit=freeze(c,orig),origOut=fit?{chosen:fit.chosen,prefixScore:fit.prefixScore,full:fit.full?{score:fit.full.score,text:fit.full.p.map(x=>A.translit[x]).join("")}:null}:null;
 const controls=[89,761,2909].map((o,i)=>{const start=Math.floor((donor.length-raw.length)*i/2),p=donor.slice(start,start+raw.length),outer=geometry(enc(p,o)),q=geometry(outer,true);assert(same(q,enc(p,o)),"control inverse geometry");const s=sweep(q),fit=freeze(q,s),d=fit?.full;assert(reach(q,o).n===q.length,"true origin");if(d)assert(same(geometry(enc(d.p,fit.chosen)),outer),"full plant replay");const wrong=sweep(geometry(outer,true,false));return {origin:o,donorStart:start,trainSurvivors:s.train.length,fullSurvivors:s.full.length,chosen:fit?.chosen,exact:d?d.p.filter((v,j)=>v===p[j]).length:0,withheld:d?d.p.slice(cut).filter((v,j)=>v===p[cut+j]).length:0,withheldLength:p.length-cut,wrongStaticTrain:wrong.train.length,wrongStaticFull:wrong.full.length,wrongStaticMax:wrong.max};});
 const short=Array.from({length:53},(_,j)=>j%29);assert(same(geometry(geometry(short),true),short),"partial block inverse");
 return {target:{pages:[16,22],length:raw.length,zeros:raw.filter(x=>x===0).length,cut,route,forward:"C[block*16 + route[(b+j)%16]]=inner[block*16+j], filter absent slots",firstThreeRoutes:[0,1,2].map(b=>Array.from({length:16},(_,j)=>route[(b+j)%16]))},p56:p56.length,original:orig,originalFit:origOut,controls};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
const a=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(a[0]),JSON.parse(a[1])),null,2));
