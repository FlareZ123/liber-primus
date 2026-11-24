"use strict";
/** All-secret active-F Hill4: exact projective row/scale mask-score bound;
 * fit top four directions/scales on 1200 signs, score all 24 row orders.
 * node sims/lp2_p15_allsecret_active_fhold_hill4_sft.cjs
 */
const fs=require("node:fs"),path=require("node:path");
const {inverse,transform}=require("./lp2_p15_grid_outer_fhold_gate_sft.cjs");
const {support,decode,language}=require("./lp2_p15_grid_active_fhold_sft.cjs");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
const ok=(v,m)=>{if(!v)throw Error(m)},eq=(a,b)=>String(a)===String(b);
/** @param {string} s @param {string[]} alphabet */
function native(s,alphabet){
 const tok=alphabet.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),out=[];
 for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));ok(t,w);out.push(t.i);w=w.slice(t.s.length);}}
 return out;
}
/** @param {number[]} P @param {number[][]} M */
function encode(P,M){const a=P.filter(x=>x!==0),cut=a.length-a.length%4,U=transform(M,a.slice(0,cut)).concat(a.slice(cut));let j=0;return P.map(x=>x===0?0:U[j++]);}
/** @param {number[]} C */
function maskGraph(C){
 const n=C.length,G=Array.from({length:n},()=>[]),tail=new Uint16Array(n+1);
 for(let i=n-1;i>=0;i--)tail[i]=tail[i+1]+(C[i]!==0);
 for(let s=0;s<n;s++){const a=[];function rec(i){if(a.length===4){G[s].push([i,...a]);return;}if(i===n)return;if(C[i]===0)rec(i+1);a.push(C[i]);rec(i+1);a.pop();}rec(s);}
 return {G,tail};
}
function projectiveRows(){const R=[];for(let p=0;p<4;p++)for(let k=0;k<29**(3-p);k++){const a=[...Array(p).fill(0),1];let t=k;while(a.length<4){a.push(t%29);t=Math.floor(t/29);}R.push(a);}ok(R.length===25260,"projective cardinality");return R;}
/** Exact max LLR over legal independent single-row masks, all scales.
 * @param {number[]} C @param {number[]} L
 */
function rankRows(C,L){
 const n=C.length,{G,tail}=maskGraph(C),weights=Array.from({length:29},(_,v)=>Array.from({length:28},(_,j)=>L[v*(j+1)%29]));
 const reach=new Uint8Array(n+1),back=new Uint8Array(n+1),scores=new Float64Array((n+1)*28),out=[];
 for(const row of projectiveRows()){
  reach.fill(0);reach[0]=1;const E=[];
  for(let i=0;i<n;i++)if(reach[i]){
   if(tail[i]<4){reach[n]=1;E.push([i,n,0]);}
   for(const [j,x,y,z,w] of G[i]){const v=(row[0]*x+row[1]*y+row[2]*z+row[3]*w)%29;if(v){reach[j]=1;E.push([i,j,v]);}}
  }
  if(!reach[n])continue;
  back.fill(0);back[n]=1;for(let k=E.length-1;k>=0;k--){const [i,j]=E[k];if(back[j])back[i]=1;}
  scores.fill(-Infinity);scores.fill(0,0,28);
  for(const [i,j,v] of E){if(!back[j])continue;const a=i*28,b=j*28,w=weights[v];for(let k=0;k<28;k++){const x=scores[a+k]+(v?w[k]:0);if(x>scores[b+k])scores[b+k]=x;}}
  let b=-Infinity,scale=0;for(let k=0;k<28;k++)if(scores[n*28+k]>b){b=scores[n*28+k];scale=k+1;}
  out.push({row,scale,score:b});
 }
 return out.sort((a,b)=>b.score-a.score);
}
/** @param {number[]} C @param {number[]} L @param {Function} LM */
function fit(C,L,LM){
 const R=rankRows(C,L),top=R.slice(0,4),rows=top.map(x=>x.row.map(v=>v*x.scale%29));
 let key=null,best=null,orders=0;
 if(rows.length===4){
  function rec(left,I){if(!left.length){
   const s=support(C,I);if(!s.legal)return;const d=decode(C,s.graph,LM);orders++;if(!best||d.score>best.score){key=I;best=d;}return;
  }for(let i=0;i<left.length;i++)rec(left.filter((_,j)=>i!==j),I.concat([left[i]]));}
  try{inverse(rows);rec(rows,[]);}catch(e){if(e.code!=="ERR_ASSERTION")throw e;}
 }
 return {R,top,key,best,orders};
}
function truthScore(P,L){const a=P.filter(v=>v!==0);return a.slice(0,a.length-a.length%4).reduce((s,v)=>s+L[v],0);}
function run(data){
 const gp=JSON.parse(data[0]),nativeRef=JSON.parse(data[1]),map=new Map(gp.runes.map((v,i)=>[v,i])),secs=nativeRef.sections.map(s=>[...s.source_text].filter(v=>map.has(v)).map(v=>map.get(v)));
 const counts=Array(29).fill(.5);for(const a of secs)for(const x of a)counts[x]++;
 const norm=counts.slice(1).reduce((s,x)=>s+x,0),L=counts.map(c=>Math.log(c*28/norm)),LM=language(secs,-1),n=1744,cut=1200,controls=[];
 const matrices=[[[3,1,7,11],[12,4,6,23],[2,19,8,16],[9,17,22,5]],[[13,3,21,7],[8,19,4,27],[11,5,17,2],[23,9,6,14]]];
 for(let k=0;k<2;k++){
  const P=native(data[2+k],gp.translit).slice(1000,1000+n),M=matrices[k],I=inverse(M),C=encode(P,M),s=fit(C.slice(0,cut),L,LM);
  const keyExact=s.key&&eq(s.key,I);let full=null;
  if(s.key){const supportFull=support(C,s.key);if(supportFull.legal){full=decode(C,supportFull.graph,LM);ok(eq(encode(full.P,inverse(s.key)),C),"plant full replay");}}
  controls.push({donor:k,n:P.length,cut,visibleF:C.filter(x=>!x).length,legalRowClasses:s.R.length,top:s.top,orders:s.orders,keyExact:!!keyExact,trueInverse:I,recoveredInverse:s.key,fitScore:s.best?.score??null,fullReplay:!!full,exactFull:full?.P.filter((v,i)=>v===P[i]).length??null,exactHeldout:full?.P.slice(cut).filter((v,i)=>v===P[cut+i]).length??null,heldout:n-cut,truthLLR:truthScore(P,L)});
 }
 const C=gp.pages.slice(16,23).flatMap(p=>p.indices);ok(C.length===n,"receiver length");
 const fitResult=fit(C.slice(0,cut),L,LM),R=rankRows(C,L),top=R.slice(0,4),ceiling=top.reduce((s,v)=>s+v.score,0);
 let full=null;if(fitResult.key){const s=support(C,fitResult.key);if(s.legal){full=decode(C,s.graph,LM);ok(eq(encode(full.P,inverse(fitResult.key)),C),"original replay");}}
 return {controls,original:{n,cut,visibleF:C.filter(x=>!x).length,prefixRows:fitResult.R.length,prefixTop:fitResult.top,legalOrders:fitResult.orders,selectedInverse:fitResult.key,fitScore:fitResult.best?.score??null,fullContinuation:!!full,fullRowClasses:R.length,fullTop:top,allKeyCompleteActiveLLRCeiling:ceiling,fullPrediction:full?.P.map(x=>gp.translit[x]).join(" ")??null}};
}
if(require.main===module)console.log(JSON.stringify(run(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
module.exports={run,files,rankRows,fit,encode};
