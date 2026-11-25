'use strict';
// Known-crib 29-adic multiplier inference; zero initial carry, all symbols consume.
function experiment(corpus,native){
 const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),ok=(v,m)=>{if(!v)throw Error(m)};
 const mod=(x,m)=>(x%m+m)%m,pow=n=>29n**BigInt(n),num=a=>a.reduceRight((x,y)=>x*29n+BigInt(y),0n);
 function inv(a,m){let [r,s,t,u]=[m,mod(a,m),0n,1n];while(s){const q=r/s;[r,s,t,u]=[s,r-q*s,u,t-q*u]}ok(r===1n,"nonunit");return mod(t,m)}
 function digits(x,n){const d=[];for(let i=0;i<n;i++){d.push(Number(x%29n));x/=29n}ok(x===0n,"width");return d}
 const render=a=>a.map(x=>corpus.translit[x]).join(" ");
 const spell=s=>s.split(" ").map(x=>corpus.translit.indexOf(x));
 const title=spell("E P I P H A N Y S E E C S"),quote=spell("TH E T O T I E N T F U N C T IA N I S S A C R E D A L L TH NG S");
 ok(title.length===13&&quote.length===30&&[...title,...quote].every(x=>x>=0),"crib");
 const opening=corpus.pages.slice(0,3).flatMap(p=>p.indices),terminal=corpus.pages[55].indices.slice().reverse();
 ok(opening.length===729&&terminal.length===76,"physical lengths");
 const refs=native.sections.map(s=>({name:s.name,a:[...s.source_text].map(c=>corpus.runes.indexOf(c)).filter(i=>i>=0)})),donors=refs.filter(s=>["0_koan_1","0_loss_of_divinity"].includes(s.name));
 const wisdom=refs.find(s=>s.name==="0_wisdom").a;ok(wisdom.some((_,i)=>eq(wisdom.slice(i,i+30),quote)),"actual LP1 source quote");
 const uni=Array(29).fill(.5),bi=Array(841).fill(.1),tri=Array(24389).fill(.05);
 for(const {a} of refs.filter(s=>!donors.includes(s)))for(let i=0;i<a.length;i++){uni[a[i]]++;if(i)bi[29*a[i-1]+a[i]]++;if(i>1)tri[(29*a[i-2]+a[i-1])*29+a[i]]++}
 const un=uni.reduce((a,b)=>a+b);for(let i=0;i<29;i++)uni[i]/=un;
 for(let i=0;i<29;i++){let n=0;for(let j=0;j<29;j++)n+=bi[29*i+j];for(let j=0;j<29;j++)bi[29*i+j]=.8*bi[29*i+j]/n+.2*uni[j]}
 for(let i=0;i<841;i++){let n=0;for(let j=0;j<29;j++)n+=tri[29*i+j];for(let j=0;j<29;j++)tri[29*i+j]=Math.log(.7*tri[29*i+j]/n+.3*bi[29*(i%29)+j])}
 const score=a=>a.slice(2).reduce((s,x,i)=>s+tri[(29*a[i]+a[i+1])*29+x],0)/(a.length-2),matches=(a,b)=>a.filter((x,i)=>x===b[i]).length;
 function solve(c,p,k,mode){
  const m=pow(k),M=pow(c.length),cp=num(c.slice(0,k)),pp=num(p.slice(0,k));
  ok(cp%29n!==0n&&pp%29n!==0n,"unit low digits");
  const key=mode==="encrypt"?mod(cp*inv(pp,m),m):mod(pp*inv(cp,m),m);
  const d=digits(mod(num(c)*(mode==="encrypt"?inv(key,M):key),M),c.length);
  ok(eq(d.slice(0,k),p.slice(0,k)),"fit");ok(mod(num(d)*(mode==="encrypt"?key:inv(key,M)),M)===num(c),"replay");
  return {key,d}
 }
 const report={opening:[],terminal:[],controls:[],nullScores:{opening:score(opening.slice(13)),terminal:score(terminal.slice(30).reverse())}};
 let seed=0x13315576;
 function random(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function plantKey(k){const d=Array.from({length:k},()=>random()%29);d[0]=1+random()%28;d[k-1]=1+random()%28;return num(d)}
 for(const mode of ["encrypt","decrypt"]){
  const a=solve(opening,title,13,mode);report.opening.push({mode,key:String(a.key),keyDigits:digits(a.key,13),holdScore:score(a.d.slice(13)),p1p2Score:score(a.d.slice(262)),firstBody:render(a.d.slice(13,63)),p2Start:render(a.d.slice(528,558)),candidate:a.d});
  const rev=quote.slice().reverse(),b=solve(terminal,rev,13,mode),full=solve(terminal,rev,30,mode);
  report.terminal.push({mode,key:String(b.key),heldCribMatches:matches(b.d.slice(13,30),rev.slice(13)),heldCrib:render(b.d.slice(13,30).reverse()),fullCribKey:String(full.key),fullCribKeyFits13:full.key<pow(13),untouchedPrefixScore:score(full.d.slice(30).reverse()),untouchedPrefix:render(full.d.slice(30).reverse()),candidate:full.d.slice().reverse()});
  for(const {name,a:ref} of donors){for(const [len,k] of [[729,13],[76,13],[76,30]]){
   let g=ref.slice(0,len);if(len===76)g=g.reverse();
   if(g[0]===0){g=ref.slice(1,len+1);if(len===76)g=g.reverse()}
   ok(g.length===len&&g[0]!==0,"native donor unit");
   const M=pow(len),key=plantKey(k),enc=digits(mod(num(g)*(mode==="encrypt"?key:inv(key,M)),M),len);
   const recovered=solve(enc,g,k,mode);ok(recovered.key===key&&eq(recovered.d,g),"key and withheld runes");
   report.controls.push({name,len,k,mode,key:String(key),heldout:len-k,score:score(len===76?g.slice(k).reverse():g.slice(k))})
  }}
 }
 return report
}
const fs=require('node:fs'),path=require('node:path');
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
