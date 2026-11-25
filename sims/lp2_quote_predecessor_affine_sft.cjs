'use strict';
const fs=require('node:fs'),path=require('node:path');
function attack(gp,raw,original=false){
 const A=41,N=160,S=80,q=29,mod=x=>((x%29)+29)%29,check=(v,m)=>{if(!v)throw Error(m)},eq=(a,b)=>a[0]===b[0]&&a[1]===b[1],sub=(a,b)=>[mod(a[0]-b[0]),mod(a[1]-b[1])],det=(a,b)=>mod(a[0]*b[1]-a[1]*b[0]),inv=x=>{for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error("inverse")};
 const idx=new Map(gp.translit.map((s,i)=>[s,i])),names=["Shakespeare","Emerson","Gibran"];
 const norm=w=>w.toUpperCase().replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
 function body(s,start){const a=s.indexOf(start),b=s.search(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG/i);check(a>=0&&b>a,"body");return s.slice(a,b)}
 function chunks(s){let out=[],words=[],prev=0;for(const m of s.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)){if(/[.!?]/.test(s.slice(prev,m.index))&&words.length){out.push(words.join(" "));words=[]}words.push(norm(m[0]));prev=m.index+m[0].length}if(words.length)out.push(words.join(" "));return out}
 function graph(s){const L=s.length,f=Array.from({length:L+1},()=>[]),b=Array.from({length:L+1},()=>[]),rem=Array(L+1).fill(0);for(let i=0;i<L;i++){let p=i;while(s[p]===" ")p++;for(let d=1;d<=2&&p+d<=L;d++){const v=idx.get(s.slice(p,p+d));if(v!==undefined)f[i].push([v,p+d])}}for(let i=1;i<=L;i++){let p=i;while(s[p-1]===" ")p--;for(let d=1;d<=2&&p-d>=0;d++){const v=idx.get(s.slice(p-d,p));if(v!==undefined)b[i].push([v,p-d])}}for(let i=L-1;i>=0;i--)rem[i]=rem[i+1]+(s[i]!==" ");return {L,f,b,rem}}
 const texts=[raw[0],body(raw[1],"There is no great and no small"),body(raw[2],"Almustafa,")],pairs=[];
 for(let j=0;j<3;j++){const c=chunks(texts[j]);for(let i=0;i+1<c.length;i++){if(c[i].replace(/ /g,"").length>=A&&c[i+1].replace(/ /g,"").length>=N-A)pairs.push({source:names[j],stop:i+1,left:graph(c[i]),right:graph(c[i+1])})}}
 check(pairs.length===1161,"frozen pair count");


 function add(row,p,c){
  if(!row)return [p,c];
  if(row.length===4)return mod(row[2]*p+row[3])===c?row:null;
  if(row[0]===p)return row[1]===c?row:null;
  if(row[1]===c)return null;
  const a=mod((c-row[1])*inv(mod(p-row[0])));return [row[0],row[1],a,mod(c-a*p)];
 }
 const count=rows=>rows.reduce((v,r)=>v*BigInt(!r?812:r.length===2?28:1),1n).toString();
 const identified=rows=>rows.filter(r=>r?.length===4).length;
 function key(rows){return rows.map(r=>!r?[1,0]:r.length===2?[1,mod(r[1]-r[0])]:r.slice(2))}
 function enc(P,K,prev){let C=[];for(const p of P){let [a,b]=K[prev];prev=mod(a*p+b);C.push(prev)}return C}
 function dec(C,K,prev){let P=[];for(const c of C){let [a,b]=K[prev];P.push(mod(inv(a)*(c-b)));prev=c}return P}
 function scan(C,prev){
  const states=C.map((c,i)=>i?C[i-1]:prev),out=[];let nodes=0,leftPass=0;
  for(const pair of pairs){
   const rows=Array(29).fill(null),R=[],P=[];
   function forward(i,pos){
    nodes++;if(pair.right.rem[pos]<N-i)return;
    if(i===S){out.push({pair,pos,rows:rows.slice(),plain:R.slice().reverse().concat(P)});return}
    const j=states[i],old=rows[j];
    for(const [v,np] of pair.right.f[pos]){const t=add(old,v,C[i]);if(!t)continue;rows[j]=t;P.push(v);forward(i+1,np);P.pop();rows[j]=old}
   }
   function reverse(i,pos){
    nodes++;if(i<0){leftPass++;forward(A,0);return}
    const j=states[i],old=rows[j];
    for(const [v,np] of pair.left.b[pos]){const t=add(old,v,C[i]);if(!t)continue;rows[j]=t;R.push(v);reverse(i-1,np);R.pop();rows[j]=old}
   }
   reverse(A-1,pair.left.L);
  }
  return {out,leftPass,nodes};
 }
 function run(C,prev,truth=null){
  const {out,leftPass,nodes}=scan(C.slice(0,S),prev),full=[],states=C.map((c,i)=>i?C[i-1]:prev);
  const correctPrefix=truth?out.filter(o=>o.pair.source===truth.source&&o.pair.stop===truth.stop&&o.plain.join()===truth.plain.slice(0,S).join()&&o.rows.every((row,i)=>!row||(mod(truth.K[i][0]*row[0]+truth.K[i][1])===row[1]&&(row.length===2||row[2]===truth.K[i][0]&&row[3]===truth.K[i][1])))):[];
  let forced=null,allowed=null,prefixKeyCount=null;
  if(truth&&correctPrefix.length){
   forced=0;allowed=0;const rows=correctPrefix[0].rows;prefixKeyCount=count(rows);
   for(let i=S;i<N;i++){const row=rows[states[i]],p=truth.plain[i];if(add(row,p,C[i]))allowed++;if(row&&(row.length===4||row[0]===p))forced++}
  }
  for(const o of out){
   const rows=o.rows.slice(),P=[];
   function forward(i,pos){
    if(o.pair.right.rem[pos]<N-i)return;
    if(i===N){
     const plain=o.plain.concat(P),K=key(rows);
     check(enc(plain,K,prev).join()===C.join()&&dec(C,K,prev).join()===plain.join(),"replay");
     let n=0;for(let j=S;j<N;j++){const row=o.rows[states[j]];if(row&&(row.length===4||row[0]===plain[j]))n++}
     full.push({source:o.pair.source,stop:o.pair.stop,plain,prefixKeyCount:count(o.rows),fullKeyCount:count(rows),prefixIdentified:identified(o.rows),fullIdentified:identified(rows),forced:n,rows:rows.slice(),witness:K});return
    }
    const j=states[i],old=rows[j];
    for(const [v,np] of o.pair.right.f[pos]){const t=add(old,v,C[i]);if(!t)continue;rows[j]=t;P.push(v);forward(i+1,np);P.pop();rows[j]=old}
   }
   forward(S,o.pos);
  }
  const correct=truth?full.some(f=>f.source===truth.source&&f.stop===truth.stop&&f.plain.join()===truth.plain.join()&&f.rows.every((row,i)=>!row||(mod(truth.K[i][0]*row[0]+truth.K[i][1])===row[1]&&(row.length===2||row[2]===truth.K[i][0]&&row[3]===truth.K[i][1])))):null;
  return {leftPass,nodes,prefixPaths:out.length,prefixSources:new Set(out.map(o=>o.pair.source+":"+o.pair.stop)).size,fullPaths:full.length,fullSources:new Set(full.map(o=>o.source+":"+o.stop)).size,correctPrefix:correctPrefix.length,correct,forced,allowed,prefixKeyCount,full};
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
 function spelling(g,r){let o=[],p=0;while(g.rem[p]){const t=g.f[p];if(!t.length)return [];const [v,n]=t[Math.floor(r()*t.length)];o.push(v);p=n}return o}
 const controls=[],nulls=[];
 for(let j=0;j<3;j++)for(let n=0;n<2;n++){
  const r=rng((0x270618^Math.imul(j*2+n+1,0x9e3779b9))>>>0),pool=pairs.filter(p=>p.source===names[j]),half=Math.floor(pool.length/2),subpool=n?pool.slice(half):pool.slice(0,half);
  let pair,L,R;do{pair=subpool[Math.floor(r()*subpool.length)];L=spelling(pair.left,r);R=spelling(pair.right,r)}while(L.length<A||R.length<N-A);
  const plain=L.slice(-A).concat(R.slice(0,N-A)),K=Array.from({length:29},()=>[1+Math.floor(r()*28),Math.floor(r()*29)]),prev=Math.floor(r()*29),truth={source:pair.source,stop:pair.stop,plain,K},C=enc(plain,K,prev);
  check(dec(C,K,prev).join()===plain.join(),"native inverse");
  controls.push({truth,prev,...run(C,prev,truth)});
  nulls.push(run(Array.from({length:N},()=>Math.floor(r()*29)),Math.floor(r()*29)));
 }
 // Exhaustive individual row domain oracle for repeated, independent and conflicting points.
 for(let p=0;p<29;p++)for(let c=0;c<29;c++){
  const row=add(null,p,c);
  for(const [x,y] of [[p,c],[p,mod(c+1)],[mod(p+1),c],[mod(p+1),mod(c+1)]]){
   const n=Array.from({length:28},(_,i)=>i+1).filter(a=>mod(a*(x-p)+c)===y).length,t=add(row,x,y);
   check(n===(t?t.length===2?28:1:0),"row domain oracle")
  }
 }
 const gate=controls.every(c=>c.correct&&c.correctPrefix&&c.allowed===80);
 let result=null;
 if(original&&gate){const U=gp.pages.filter(p=>p.page<=55).sort((a,b)=>a.page-b.page).flatMap(p=>p.indices);check(U.length===12956,"corpus");result=run(U.slice(10279,10439),U[10278]);if(result.full.length){result.adjacent=result.full.map(f=>{const tail=U.slice(10439,10479);return tail.map((c,i)=>{const s=f.rows[i?tail[i-1]:U[10438]];return s?.length===4?mod(inv(s[2])*(c-s[3])):s&&s[1]===c?s[0]:null})})}}
 return {pairs:pairs.length,gate,controls,nulls,original:result};

}

module.exports=attack;
if(require.main===module){const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];const data=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));console.log(JSON.stringify(attack(JSON.parse(data[0]),data.slice(1),process.argv.includes('--original')),null,2));}
