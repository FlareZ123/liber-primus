'use strict';
const fs=require('node:fs');
function experiment(corpus,native){
 const A=29,B=3301,K=512,L=48,T=144,H=144;
 const texts=native.sections.map(s=>[...s.source_text].map(c=>corpus.runes.indexOf(c)).filter(x=>x>=0));
 const mod=x=>(x%29+29)%29;
 const inv=a=>{for(let i=1;i<29;i++)if(a*i%29===1)return i;throw Error("nonunit");};
 function encrypt(p,a,s){if(a%29===0||s<0||s>=a)throw Error("nonunit or invalid carry");return p.map(x=>{const v=a*x+s;s=Math.floor(v/29);return v%29})}
 function decrypt(c,a,s){const m=inv(a);return c.map(y=>{const x=mod(m*(y-s));s=(a*x+s-y)/29;return x})}
 function lm(exclude,rev){
   const u=new Float64Array(29).fill(.5),b=new Float64Array(841).fill(.1),t=new Float64Array(24389).fill(.05);
   for(let k=0;k<texts.length;k++)if(k!==exclude){let p=rev?[...texts[k]].reverse():texts[k];for(let i=0;i<p.length;i++){u[p[i]]++;if(i)b[p[i-1]*29+p[i]]++;if(i>1)t[(p[i-2]*29+p[i-1])*29+p[i]]++;}}
   let total=u.reduce((a,b)=>a+b,0);for(let j=0;j<29;j++)u[j]/=total;
   for(let i=0;i<29;i++){let z=0;for(let j=0;j<29;j++)z+=b[29*i+j];for(let j=0;j<29;j++)b[29*i+j]=.8*b[29*i+j]/z+.2*u[j];}
   for(let i=0;i<841;i++){let z=0;for(let j=0;j<29;j++)z+=t[29*i+j];for(let j=0;j<29;j++)t[29*i+j]=Math.log(.7*t[29*i+j]/z+.3*b[(i%29)*29+j]);}
   return t
 }
 const score=(p,table,start=2,end=p.length)=>{let z=0;for(let i=Math.max(2,start);i<end;i++)z+=table[(p[i-2]*29+p[i-1])*29+p[i]];return z/(end-Math.max(2,start))};
 function search(c,table){
   if(c.length<T+H)throw Error("short");
   let heap=[],n=0;
   const less=(a,b)=>a.score<b.score||(a.score===b.score&&(a.a>b.a||(a.a===b.a&&a.s>b.s)));
   function push(x){if(heap.length<K){let i=heap.length;heap.push(x);while(i){let j=(i-1)>>1;if(!less(heap[i],heap[j]))break;[heap[i],heap[j]]=[heap[j],heap[i]];i=j}}else if(less(heap[0],x)){heap[0]=x;let i=0;for(;;){let j=2*i+1;if(j>=heap.length)break;if(j+1<heap.length&&less(heap[j+1],heap[j]))j++;if(!less(heap[j],heap[i]))break;[heap[i],heap[j]]=[heap[j],heap[i]];i=j}}}
   for(let a=1;a<=B;a++)if(a%29){
     const m=inv(a),lookup=Array.from({length:57},(_,j)=>mod(m*(j-28)));
     for(let s=0;s<a;s++){
       let carry=s,z=0,p1=0,p2=0;
       for(let i=0;i<L;i++){const y=c[i];const p=lookup[y-carry%29+28];carry=(a*p+carry-y)/29;if(i>=2)z+=table[(p2*29+p1)*29+p];p2=p1;p1=p;}
       n++;
       if(heap.length<K||z>=heap[0].score)push({a,s,score:z});
     }
   }
   const ranked=heap.map(({a,s,score:screen})=>{const p=decrypt(c.slice(0,T),a,s);return {a,s,screen:screen/(L-2),train:score(p,table)}}).sort((a,b)=>b.train-a.train||a.a-b.a||a.s-b.s);
   const win=ranked[0],p=decrypt(c,win.a,win.s);
   const replay=encrypt(p,win.a,win.s).every((v,i)=>v===c[i]);
   return {n,win,runner:ranked[1],test:score(p,table,T,T+H),preview:p.slice(0,80).map(i=>corpus.translit[i]).join(" "),replay,adjacent:p.reduce((n,x,i)=>n+ +(i>0&&x===p[i-1]),0),p,shortlist:ranked.map(({a,s})=>[a,s])}
 }
 const results=[];
 for(const [section,a,s,rev] of [[1,1033,761,false],[3,3299,1764,true],[4,463,255,false],[5,3301,123,true]]){
   const gold=rev?[...texts[section]].reverse():texts[section],c=encrypt(gold,a,s),table=lm(section,rev),r=search(c,table);
   const {p,shortlist,...summary}=r;
   results.push({name:native.sections[section].name,rev,planted:{a,s},...summary,plantedShortlisted:shortlist.some(v=>v[0]===a&&v[1]===s),exact:p.reduce((n,x,i)=>n+ +(x===gold[i]),0),holdoutExact:p.slice(T,T+H).reduce((n,x,i)=>n+ +(x===gold[T+i]),0),total:p.length,goldTest:score(gold,table,T,T+H)});
 }
 const c=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
 for(const rev of [false,true]){
   const ct=rev?[...c].reverse():c,table=lm(-1,rev),r=search(ct,table);
   const {p,shortlist,...summary}=r;
   results.push({name:"LP2 p0–55",rev,...summary,testPreview:p.slice(T,T+72).map(i=>corpus.translit[i]).join(" "),fullScore:score(p,table),cipherTest:score(ct,table,T,T+H),fullCount:p.length});
 }
 return {bound:B,shortlist:K,screen:L,fit:T,holdout:H,results};
}
const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const native=JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8'));
console.log(JSON.stringify(experiment(corpus,native),null,2));
