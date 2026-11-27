"use strict";
const fs=require("node:fs"),path=require("node:path");const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
function core(derived,corpus,solved){
 const mod=x=>(x%29+29)%29,key=(q,d)=>{let a=derived.affine[q];return a===null?null:mod(a[0]+a[1]*d);};
 const C=corpus.pages.slice(0,3).flatMap(p=>p.indices),rk=new Map(corpus.runes.map((x,i)=>[x,i])),plants=["0_koan_1","0_loss_of_divinity"],title=[18,13,10,13,8,24,9,26,15,18,18,5,15],sources=solved.sections.map(s=>({name:s.name,p:[...s.source_text].filter(x=>rk.has(x)).map(x=>rk.get(x))}));
 const count=Array.from({length:29},()=>Array(29).fill(0.2));for(const s of sources.filter(x=>!plants.includes(x.name)))for(let i=1;i<s.p.length;i++)count[s.p[i-1]][s.p[i]]++;
 const logp=count.map(row=>{let n=row.reduce((a,b)=>a+b,0);return row.map(v=>Math.log(v/n));});
 function optimum(c,d,lambda){
   let states=new Map([[13*30+29,{v:0,sum:0,n:0}]]);
   for(let i=13;i<c.length;i++){let next=new Map();
     function add(q,p,s,prev){let z=prev!==29&&p!==29?logp[prev][p]:0,n=prev!==29&&p!==29?1:0,id=q*30+p,v=s.v+z-lambda*n;let existing=next.get(id);if(!existing||v>existing.v)next.set(id,{v,sum:s.sum+z,n:s.n+n});}
     for(let [id,s] of states){let q=Math.floor(id/30),prev=id%30,k=key(q,d);if(c[i]===0)add(q,0,s,prev);if(k===null||c[i]!==k)add((q+1)%172,k===null?29:mod(c[i]-k),s,prev);}
     if(!next.size)return null;states=next;
   }
   let best=null;for(let s of states.values())if(best===null||s.v>best.v)best=s;return best;
 }
 function optimize(c,d){let lambda=-Math.log(29),h=null,iter=0;for(;iter<40;iter++){h=optimum(c,d,lambda);if(!h)return null;if(!h.n)throw Error("no score");let m=h.sum/h.n;if(Math.abs(m-lambda)<1e-12){lambda=m;break;}lambda=m;}let v=optimum(c,d,lambda);if(Math.abs(v.v)>1e-8)throw Error("fractional optimum failed");return {delta:d,mean:v.sum/v.n,n:v.n,iterations:iter+1};}
 function rank(c){let a=[];for(let d=0;d<29;d++){let z=optimize(c,d);if(z)a.push(z);}return a.sort((x,y)=>y.mean-x.mean||x.delta-y.delta);}
 const controls=plants.map((name,j)=>{let lookup={...derived.lookup};for(let [i,w] of derived.unknownWords.entries())lookup[w]=mod([...w].reduce((a,c)=>a+c.charCodeAt(0),0)+j*(i+1));let k=4,stream=[];for(let i=0;i<729;i++){k=mod(17*k+lookup[derived.rotatedWords[i%43]]);stream.push(k);}let d=mod(stream[43]-stream[0]),p=title.concat(sources.find(s=>s.name===name).p.slice(0,716)),clock=0,truthProj=[];let c=p.map((v,i)=>{let q=clock%172;if(v===0){if(i>=13)truthProj.push(0);return 0;}let w=mod(v+stream[clock++]);if(i>=13)truthProj.push(key(q,d)===null?29:v);return w;});let ranks=rank(c),truth=ranks.find(x=>x.delta===d),n=0,sum=0;for(let i=1;i<truthProj.length;i++)if(truthProj[i]!==29&&truthProj[i-1]!==29){n++;sum+=logp[truthProj[i-1]][truthProj[i]];}if(!truth||truth.mean+1e-10<sum/n)throw Error("truth bound");return {name,truthDelta:d,truthPath:{mean:sum/n,n},rank:ranks.findIndex(x=>x.delta===d)+1,truthOptimum:truth,winner:ranks[0],survivors:ranks.length};});
 let a=rank(C);return {original:{survivors:a.length,ranks:a},controls};
}
console.log(JSON.stringify(core(read("im-results/lp2-p0-signedword-affine-forcing-output.json"),read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
