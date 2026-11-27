'use strict';
const fs = require('node:fs');
const path = require('node:path');
function run(a,t) {
 const check=(v,m)=>{if(!v)throw Error(m)};
 const mod=x=>(x%29+29)%29;
 const pages=a.pages.slice(0,56).filter(p=>p.indices.length);
 const cribs=[["p2 GOOD",2,36,[6,3,3,23]],["p16 SEEK",16,99,[15,18,18,5]],["p27 GOOD",27,200,[6,3,3,23]],["p35 FOUND",35,25,[0,3,1,9,23]],["p33 WILL",33,132,[7,10,20,20]],["p40 ROAD",40,71,[4,3,24,23]]];
 function constraints(P,C){
  const rows={},rev={},errors=[];
  for(let i=0;i<P.length;i++){
   if(P[i]===0&&C[i]!==0) errors.push({type:"literal_F",i,C:C[i]});
   if(i===0||P[i]===0)continue;
   let j=i-1;while(j>=0&&P[j]===0)j--;if(j<0)continue;
   const q=P[j],k=mod(P[i]-C[i]+C[i-1]);
   if(q in rows&&rows[q]!==k)errors.push({type:"row",i,q,first:rows[q],second:k});
   if(k in rev&&rev[k]!==q)errors.push({type:"injectivity",i,k,first:rev[k],second:q});
   rows[q]=k;rev[k]=q;
  }
  return {rows,errors};
 }
 // Full sender control: a literal F, and a nonliteral zero.
 const key=Array.from({length:29},(_,i)=>mod(7*i+4));
 const P=[6,0,3,3,23,2,0,4,7,1,8];
 const C=[];let q=0,cp=17;
 for(const p of P){let x=p===0?0:mod(cp+p-key[q]);C.push(x);if(p!==0)q=p;cp=x}
 const control=constraints(P,C);
 check(!control.errors.length&&Object.entries(control.rows).every(([q,k])=>key[q]===k),"control");
 // Force a nonliteral zero at the second position using a chosen IV.
 const P2=[3,4,0,6], K2=Array.from({length:29},(_,i)=>i), C2=[];q=0;cp=25;
 for(const p of P2){let x=p===0?0:mod(cp+p-K2[q]);C2.push(x);if(p!==0)q=p;cp=x}
 check(C2[1]===0&&P2[1]!==0,"nonliteral zero control");
 const control2=constraints(P2,C2);check(!control2.errors.length&&Object.entries(control2.rows).every(([q,k])=>K2[q]===k),"control2");
 const tests=cribs.map(([name,page,offset,P])=>{const C=a.pages[page].indices.slice(offset,offset+P.length);return {name,page,offset,P,C,...constraints(P,C)}});
 check(tests.slice(0,4).every(x=>x.errors.length)&&tests.slice(4).every(x=>!x.errors.length),"local decisions");
 const K={...tests[4].rows,...tests[5].rows};
 check(new Set(Object.values(K)).size===6,"six distinct key rows");
 const init=Array.from({length:29},(_,i)=>i).filter(k=>pages.every(p=>p.indices[1]===0||mod(p.indices[1]-p.indices[0]+k)!==0));
 function prefix(K){for(const p of pages){const C=p.indices;let q=0;for(let i=1;i<C.length&&C[i]!==0;i++){if(!(q in K))break;const old=q;q=mod(C[i]-C[i-1]+K[q]);if(q===0)return {page:p.page,i,previous:old,delta:mod(C[i]-C[i-1]),C:C.slice(0,i+1)}}}return null}
 const gates=init.map(k=>({k,injective:!Object.values(K).includes(k),failure:prefix({...K,0:k})}));
 check(JSON.stringify(gates.filter(x=>x.injective&&!x.failure).map(x=>x.k))==="[10,23]","prefix gate");
 function extend(K,test){const {page,offset,P}=test,C=a.pages[page].indices,inv=Object.fromEntries(Object.entries(K).map(([q,k])=>[k,+q]));let q=P.at(-1),i=offset+P.length;const forward=[],backward=[];
  while(i<C.length&&C[i]!==0&&q in K){q=mod(C[i]-C[i-1]+K[q]);forward.push([i,q]);if(q===0)break;i++}
  q=P[0];i=offset;
  while(i>1&&C[i]!==0&&C[i-1]!==0){const k=mod(q-C[i]+C[i-1]);if(!(k in inv))break;q=inv[k];backward.push([i-1,q]);if(q===0)break;i--}
  return {page,forward,backward};
 }
 const extensions=[10,23].map(k0=>({k0,segments:tests.slice(4).map(x=>extend({...K,0:k0},x))}));
 const pg=t.split("%")[40];let i=0,w=[],start=0,groups=[];
 for(const c of Array.from(pg)){if(a.runes.includes(c)){if(!w.length)start=i;w.push(c);i++}else if("- .&$".includes(c)&&w.length){groups.push({start,end:i,raw:w.join("")});w=[]}}
 check(i===a.pages[40].indices.length,"page alignment");
 const preceding=groups.find(x=>x.end===71);check(preceding.start===68,"preceding group");
 return {tests,K,init,gates,extensions,preceding,controls:[{P,C,rows:control.rows},{P:P2,C:C2,rows:control2.rows}]};
}
const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8');
console.log(JSON.stringify(run(corpus, transcription), null, 2));
