"use strict";
/** Agent10: common cyclic alphabet + arbitrary q8/q13, exact ambiguity-complete
 * marked quote source inverse. Parser follows lp2_quote_ambiguous_spelling_reverse_stop_sft.cjs.
 * node sims/lp2_quote_common_cycle_ambiguous_sft.cjs
 */
const fs=require("node:fs");
const {compatible,solve,encrypt,inversePaths}=require("./lp2_shared_cycle_native_crib_sft.cjs");
const A=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
const raw=["resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"].map(p=>fs.readFileSync(p,"utf8"));
const idx=new Map(A.translit.map((s,i)=>[s,i]));
const norm=w=>w.toUpperCase().replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
function body(s,start){const a=s.indexOf(start),b=s.search(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG/i);if(a<0||b<=a)throw Error("body markers");return s.slice(a,b)}
function chunks(s){
 const out=[];let words=[],prev=0;
 for(const m of s.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)){
  if(/[.!?]/.test(s.slice(prev,m.index))&&words.length){out.push(words.join(" "));words=[]}
  words.push(norm(m[0]));prev=m.index+m[0].length;
 }
 if(words.length)out.push(words.join(" "));return out;
}
function graph(s){
 const L=s.length,f=Array.from({length:L+1},()=>[]),b=Array.from({length:L+1},()=>[]);
 for(let i=0;i<L;i++){let p=i;while(s[p]===" ")p++;
  for(let d=1;d<=2&&p+d<=L;d++){const v=idx.get(s.slice(p,p+d));if(v!==undefined)f[i].push([v,p+d])}
 }
 for(let i=1;i<=L;i++){let p=i;while(s[p-1]===" ")p--;
  for(let d=1;d<=2&&p-d>=0;d++){const v=idx.get(s.slice(p-d,p));if(v!==undefined)b[i].push([v,p-d])}
 }
 const rem=Array(L+1).fill(0);for(let i=L-1;i>=0;i--)rem[i]=rem[i+1]+(s[i]!==" ");
 return {s,L,f,b,rem};
}
const names=["Shakespeare","Emerson","Gibran"],texts=[raw[0],body(raw[1],"There is no great and no small"),body(raw[2],"Almustafa,")];
const pairs=[];
for(let j=0;j<texts.length;j++){
 const a=chunks(texts[j]);
 for(let i=0;i+1<a.length;i++){
  const l=a[i],r=a[i+1];if(l.replace(/ /g,"").length<41||r.replace(/ /g,"").length<119)continue;
  pairs.push({source:names[j],stop:i+1,left:graph(l),right:graph(r)});
 }
}
if(pairs.length!==1161)throw Error("source pair profile");
function scan(C,q){
 if(C.length!==80)throw Error("fit prefix only");
 let left=0,compatible41=0,linear41=0,right48=0,compatible48=0,linear48=0,paths80=0;const out=[],H={};
 for(const pair of pairs){
  const R=[];
  function back(i,p){
   if(i<0){
    left++;const L=R.slice().reverse();
    if(compatible(L,0,C,0,q)<41)return;compatible41++;
    const t=solve(L,0,C,0,41,q,0);if(t.status!=="unresolved"&&t.status!=="feasible")return;linear41++;
    function forward(j,pos){
     if(j===48){right48++;if(compatible(L,0,C,0,q)<48)return;compatible48++;const z=solve(L,0,C,0,48,q,0);if(z.status!=="unresolved"&&z.status!=="feasible")return;linear48++}
     if(j===80){paths80++;const z=solve(L,0,C,0,80,q);H[z.status]=(H[z.status]||0)+1;if(z.status==="feasible"||z.status==="unresolved")out.push({source:pair.source,stop:pair.stop,plain:L.slice(),pos,...z});return}
     for(const [v,n] of pair.right.f[pos]){
      if(v===0&&C[j]!==0)continue;L.push(v);
      if(j<47||compatible(L,0,C,0,q)===L.length){
       if(j>=48&&((j+1)%4===0)&&j+1<80){const a=solve(L,0,C,0,L.length,q,0);if(a.status==="unresolved"||a.status==="feasible")forward(j+1,n)}
       else forward(j+1,n);
      }
      L.pop();
     }
    }
    forward(41,0);return;
   }
   for(const [v,n] of pair.left.b[p]){if(v===0&&C[i]!==0)continue;R.push(v);back(i-1,n);R.pop()}
  }
  back(40,pair.left.L)
 }
 return {q,left,compatible41,linear41,right48,compatible48,linear48,paths80,H,out};
}
function control(q,seed,sourceName){
 let state=seed>>>0;const rng=n=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)%n};
 const pool=pairs.filter(x=>x.source===sourceName);
 function spelling(g){let p=0,out=[],split=[];while(g.rem[p]){const a=g.f[p];if(!a.length)throw Error("invalid source");const [v,n]=a[rng(a.length)];if(a.length>1&&A.translit[v].length===1)split.push(out.length);out.push(v);p=n}return {out,split}}
 let pair,L,R,P;
 for(let t=0;t<500;t++){
  pair=pool[rng(pool.length)];L=spelling(pair.left);R=spelling(pair.right);
  if(L.out.length>=41&&R.out.length>=119&&(L.split.some(x=>x>=L.out.length-41)||R.split.some(x=>x<119))){P=L.out.slice(-41).concat(R.out.slice(0,119));break}
 }
 if(!P)throw Error("no plant");
 const pi=Array.from({length:29},(_,i)=>i);for(let i=28;i>1;i--){const j=1+rng(i);[pi[i],pi[j]]=[pi[j],pi[i]]}
 const K=Array.from({length:q},()=>rng(29)),C=encrypt(P,pi,K),r=scan(C.slice(0,80),q);
 let scale=1;while(scale*pi[1]%29!==1)scale++;
 const matching=r.out.filter(o=>o.source===pair.source&&o.stop===pair.stop&&o.plain.join()===P.slice(0,80).join());
 const exact=matching.filter(o=>o.status==="feasible"&&o.count===1&&o.one.pi.every((x,i)=>x===pi[i]*scale%29)&&o.one.K.every((x,i)=>x===K[i]*scale%29));
 const heldout=[];
 for(const o of exact){const phase=o.plain.filter(x=>x!==0).length%q,pp=inversePaths(C.slice(80),o.one.pi,o.one.K,phase);heldout.push({paths:pp.length,truth:pp.some(x=>x.join()===P.slice(80).join())})}
 delete r.out;return {q,seed,source:pair.source,stop:pair.stop,nonGreedy:true,...r,matching:matching.length,exact:exact.length,heldout};
}
const controls=[control(8,0x60319a,"Shakespeare"),control(13,0x83079b,"Emerson")];
if(!controls.every(x=>x.matching===1&&x.exact===1&&x.heldout.length===1&&x.heldout[0].truth))throw Error("control gate");
const C=A.pages.filter(x=>x.page<56).flatMap(x=>x.indices).slice(10279,10439);
if(C.length!==160)throw Error("original quote profile");
const original=[scan(C.slice(0,80),8),scan(C.slice(0,80),13)];
console.log(JSON.stringify({pairs:pairs.length,controls,original},null,2));
