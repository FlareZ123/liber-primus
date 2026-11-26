"use strict";
/** Agent10: exact necessary-condition filter for independent input/output GP29 alphabets,
 * arbitrary q8/q13 periodic shifts and authentic F holds. Nonempty results are unresolved,
 * not proven keys. Uses the frozen quotation register and all within-word rune spellings.
 * node sims/lp2_quote_dual_cycle_ambiguous_filter_sft.cjs
 */
const fs=require("node:fs");
const A=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
const raw=["resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"].map(p=>fs.readFileSync(p,"utf8"));
function main(A,raw){
const mod=x=>((x%29)+29)%29;
const inv=Array.from({length:29},(_,v)=>{for(let x=1;x<29;x++)if(v*x%29===1)return x;return 0});
function assert(x,msg){if(!x)throw Error(msg)}
function compatible(P,j,C,i,q){
 const fw=new Int8Array(q*29).fill(-1),rv=new Int8Array(q*29).fill(-1),m=new Int8Array(q);let r=0,t=0,L=Math.min(P.length-j,C.length-i);
 for(;t<L;t++){
  const p=P[j+t],c=C[i+t];if(!p){if(c)break;continue}
  const x=r*29+p,y=r*29+c;
  if((fw[x]>=0&&fw[x]!==c)||(rv[y]>=0&&rv[y]!==p))break;
  fw[x]=c;rv[y]=p;if(++r===q)r=0;
 }
 return t;
}
function solve(P,j,C,i,L,q,limit=2e6){
 const n=56+q,rows=[];let phase=0;
 for(let t=0;t<L;t++){
  const p=P[j+t],c=C[i+t];if(!p){if(c)return {status:"F"};continue}
  const row=new Int32Array(n+1);if(c)row[28+c-1]++;if(p)row[p-1]--;row[56+phase]--;
  rows.push(Array.from(row,mod));if(++phase===q)phase=0;
 }
 // All solutions equivalent by nonzero scaling. pi(0)=0, pi(1)=1.
 const gauge=new Array(n+1).fill(0);gauge[0]=1;gauge[n]=1;rows.push(gauge);
 let piv=[],r=0;
 for(let k=0;k<n;k++){
  let s=r;while(s<rows.length&&!rows[s][k])s++;if(s===rows.length)continue;
  [rows[r],rows[s]]=[rows[s],rows[r]];
  const iv=inv[rows[r][k]];for(let l=k;l<=n;l++)rows[r][l]=mod(rows[r][l]*iv);
  for(let t=0;t<rows.length;t++)if(t!==r&&rows[t][k]){const m=rows[t][k];for(let l=k;l<=n;l++)rows[t][l]=mod(rows[t][l]-m*rows[r][l])}
  piv.push(k);r++;
 }
 if(rows.slice(r).some(x=>x[n]))return {status:"inconsistent",rank:r};
 const free=Array.from({length:n},(_,k)=>k).filter(k=>!piv.includes(k)),d=free.length;
 const forms=Array.from({length:n+1},()=>new Int8Array(d+1));
 for(let j=0;j<d;j++)forms[free[j]+1][j+1]=1;
 for(let t=0;t<r;t++){const x=forms[piv[t]+1];x[0]=rows[t][n];for(let j=0;j<d;j++)x[j+1]=mod(-rows[t][free[j]])}
 for(const off of [0,28]){const seen=new Set([forms[0].join(",")]);for(let k=1;k<=28;k++){const s=forms[off+k].join(",");if(seen.has(s))return {status:"forced_equal_labels",rank:r,nullity:d};seen.add(s)}}
 return {status:"unresolved",rank:r,nullity:d};
}
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

 const perm=()=>{const a=Array.from({length:29},(_,i)=>i);for(let i=28;i>1;i--){const j=1+rng(i);[a[i],a[j]]=[a[j],a[i]]}return a};
 const alpha=perm(),beta=perm(),K=Array.from({length:q},()=>rng(29)),rev=new Int8Array(29);
 beta.forEach((v,i)=>rev[v]=i);
 let phase=0;const C=P.map(p=>{if(!p)return 0;const c=rev[mod(alpha[p]+K[phase])];phase=(phase+1)%q;return c});
 const r=scan(C.slice(0,80),q);
 const matching=r.out.filter(o=>o.source===pair.source&&o.stop===pair.stop&&o.plain.join()===P.slice(0,80).join());
 const rank=matching[0]?.rank,nullity=matching[0]?.nullity;
 const unseenPlain=Array.from({length:28},(_,i)=>i+1).filter(x=>!P.slice(0,80).includes(x));
 const unseenCipher=Array.from({length:28},(_,i)=>i+1).filter(x=>!P.slice(0,80).some((p,i)=>p&&C[i]===x));
 delete r.out;
 return {q,seed,source:pair.source,stop:pair.stop,...r,matching:matching.length,rank,nullity,unseenPlain,unseenCipher};
}

const controls=[control(8,0xa3103912,"Shakespeare"),control(13,0xb812ed31,"Gibran")];
if(!controls.every(c=>c.matching===1&&c.paths80===1))throw Error("true source not uniquely retained");
const C=A.pages.filter(x=>x.page<56).flatMap(x=>x.indices).slice(10279,10359);
const original=[scan(C,8),scan(C,13)];
return {pairs:pairs.length,controls,original};

}
console.log(JSON.stringify(main(A,raw),null,2));
