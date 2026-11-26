"use strict";
const fs=require("node:fs");
const paths=["resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/orthodox_daily_prayers_pg34981.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function makeDecoder(raw,encoding="native"){
 const Q=29,S="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" "),tok=S.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length),mod=x=>(x%Q+Q)%Q, id=p=>String.fromCharCode(...p.map(x=>65+x)), supp=1-.664/3.448,lnN=Math.log(supp/28),lnR=Math.log(1-supp),maxWord=20;
 function words(t){t=t.split(/\*\*\* END OF/i)[0].replace(/^.*?\*\*\* START OF[^\n]*\n/is,"");return (t.toUpperCase().match(/[A-Z]+(?:'[A-Z]+)*/g)||[]).map(w=>{w=w.replace(/'/g,"");if(encoding==="native")w=w.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA");w=w.replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let a=[];while(w){let t=tok.find(x=>w.startsWith(x[0]));if(!t)throw Error(w);a.push(t[1]);w=w.slice(t[0].length)}return a})}
 const a=new Map(),b=new Map(),add=(m,k,v)=>m.set(k,(m.get(k)||0)+v),train=raw.slice(0,2).flatMap(words),cnt=Array.from({length:4},()=>new Map()),ctx=Array.from({length:4},()=>new Map());
 for(const p of train){if(p.length<=maxWord)add(a,id(p),1)}
 for(const l of raw[2].split(/\r?\n/)){let m=l.match(/^([a-z]+)\s+(\d+)$/i);if(m){const p=words(m[1])[0];if(p.length<=maxWord)add(b,id(p),+m[2])}}
 const total=m=>[...m.values()].reduce((a,b)=>a+b,0),A=total(a),B=total(b),lex=new Map(),prefix=new Map(),suffix=new Map();
 for(const k of new Set([...a.keys(),...b.keys()])){let q=.97*(.65*(a.get(k)||0)/A+.35*(b.get(k)||0)/B);lex.set(k,q);for(let j=1;j<=k.length;j++){add(prefix,k.slice(0,j),q);add(suffix,k.slice(-j),q)}}
 const suffTot=total(suffix);for(const [k,v] of suffix)suffix.set(k,v/suffTot*.97);
 for(const p of train)for(let i=0;i<p.length;i++){let w=id(p.slice(Math.max(0,i-3),i+1));for(let d=0;d<w.length;d++){let k=w.slice(-(d+1));add(cnt[d],k,1);add(ctx[d],k.slice(0,-1),1)}}
 function lp(w){let p=( (cnt[0].get(w.slice(-1))||0)+.5)/( (ctx[0].get("")||0)+14.5);for(let d=1;d<Math.min(4,w.length);d++){let k=w.slice(-(d+1));p=((cnt[d].get(k)||0)+8*p)/((ctx[d].get(k.slice(0,-1))||0)+8)}return Math.log(p)}
 function wordProb(w,first,last,cl){let len=w.length,unknown=.03*.20*.80**(len-1)*Math.exp(cl),q=(first?suffix:last?prefix:lex).get(w)||0;return Math.log(q+unknown)}
 function edges(C,K){return C.map((c,i)=>{let prev=C[i-1],e=[{j:i+1,p:mod(c-K[i]),w:i&&c===prev?lnR:0}];if(i&&c!==prev){let p=mod(prev-K[i]),w=0;for(let j=i;j<C.length;j++){let x=mod(p+K[j]);if(x===C[j]){e.push({j:j+1,p,w:w+(x===C[j-1]?lnR:0)});break}if(x!==C[j-1]||C[j]===C[j-1])break;w+=lnN}}return e})}
 const la=(a,b)=>a===-Infinity?b:b===-Infinity?a:Math.max(a,b)+Math.log1p(Math.exp(-Math.abs(a-b)));
 function decode(C,K,L=null,sign=-1){
  if(sign!==-1) K=K.map(k=>mod(-k));
  const E=edges(C,K),n=C.length,W=Array.from({length:n},()=>[]);
  for(let i=0;i<n;i++){
   function visit(j,w,p,s,cl){if(w.length){W[i].push({j,p,w:s+wordProb(w,i===0,j===n,cl)});if(w.length===maxWord)return}if(j===n)return;for(const e of E[j]){let k=w+String.fromCharCode(65+e.p);visit(e.j,k,[...p,e.p],s+e.w,cl+lp(k))}}
   visit(i,"",[],0,0);
  }
  const D=Array.from({length:n+1},()=>new Map());D[0].set(0,{a:0,b:-Infinity});
  for(let i=0;i<n;i++)for(const [t,s] of D[i])for(const e of W[i]){const nt=t+e.p.length;if(L!==null&&(nt>L||nt+n-e.j<L))continue;let v=D[e.j].get(nt);if(!v){v={a:-Infinity,b:-Infinity};D[e.j].set(nt,v)}v.a=la(v.a,s.a+e.w)}
  let Z=-Infinity;for(const [t,s] of D[n])if(L===null||t===L){s.b=0;Z=la(Z,s.a)}if(!Number.isFinite(Z))return null;
  const M=Array.from({length:n},()=>new Float64Array(Q));
  for(let i=n-1;i>=0;i--)for(const [t,s] of D[i])for(const e of W[i]){const v=D[e.j].get(t+e.p.length);if(!v||v.b===-Infinity)continue;s.b=la(s.b,e.w+v.b);let post=Math.exp(s.a+e.w+v.b-Z);for(let k=0;k<e.p.length;k++)M[t+k][e.p[k]]+=post}
  if(Math.abs(D[0].get(0).b-Z)>1e-7)throw Error("posterior");
  const T=Array.from({length:n+1},()=>new Map());T[0].set(0,{v:0});for(let i=0;i<n;i++)for(const [t,s] of T[i])for(const e of E[i]){const nt=t+1;if(L!==null&&(nt>L||nt+n-e.j<L))continue;let v=s.v+M[t][e.p],o=T[e.j].get(nt);if(!o||v>o.v)T[e.j].set(nt,{v,s,e,i})}
  let best=null;for(const [t,s] of T[n])if((L===null||t===L)&&(!best||s.v>best.v))best=s;
  let P=[],ev=[];while(best.s){P.push(best.e.p);ev.push(best);best=best.s}P.reverse();ev.reverse();for(const {i,e} of ev){for(let j=i;j<e.j-1;j++)if(j===0||mod(e.p+K[j])!==C[j-1]||C[j]===C[j-1])throw Error("null replay");if(mod(e.p+K[e.j-1])!==C[e.j-1])throw Error("real replay")}
  return {P,ll:Z/n};
 }
 return {decode,encodeWords:words,lexicon:lex.size,supp};
}

function experiment(raw){
 const {decode,encodeWords:words,lexicon,supp}=makeDecoder(raw),Q=29,mod=x=>(x%Q+Q)%Q;
 let seed=0x296947c9;function ri(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return Math.floor((seed>>>0)/4294967296*n)}
 function enc(P,K){let C=[];for(const p of P)while(true){let i=C.length,c=mod(p+K[i]);if(i&&c===C[i-1]&&ri(1e6)/1e6<supp){let z=ri(28);if(z>=c)z++;C.push(z)}else{C.push(c);break}}return C}
 function edit(a,b){let d=Array.from({length:b.length+1},(_,i)=>i);for(let i=0;i<a.length;i++){let q=[i+1];for(let j=0;j<b.length;j++)q.push(Math.min(d[j+1]+1,q[j]+1,d[j]+(a[i]!==b[j])));d=q}return d.at(-1)}
 function row(d,P){return d?{pos:d.P.reduce((n,x,i)=>n+(x===P[i]),0)/P.length,edit:edit(d.P,P),len:d.P.length,ll:d.ll}:null}
 const native=JSON.parse(raw[5]),rmap=new Map(native.runes.map((r,i)=>[r,i])),seqs=native.sections.map(s=>[...s.source_text].filter(r=>rmap.has(r)).map(r=>rmap.get(r))).filter(s=>s.length>=240);
 const groups=[["Gibran",[words(raw[3]).flat()]],["Orthodox",[words(raw[4]).flat()]],["native",seqs]],out=[];
 for(const [name,ss] of groups)for(let i=0;i<40;i++){let s=ss[ri(ss.length)],at=ri(s.length-239),P=s.slice(at,at+240),K=Array.from({length:600},()=>ri(29)),C=enc(P,K),WK=Array.from({length:600},()=>ri(29));let blind=decode(C,K),fixed=decode(C,K,240),wrong=decode(C,WK);out.push({name,at,n:C.length,blind:row(blind,P),fixed:row(fixed,P),wrong:wrong.ll,raw:row({P:C.map((c,i)=>mod(c-K[i])),ll:0},P)})}
 const summary={};for(const [name] of groups){const rs=out.filter(x=>x.name===name);summary[name]={n:rs.length,wrongMax:Math.max(...rs.map(x=>x.wrong))};for(const k of ["blind","fixed","raw"]){let a=rs.map(x=>x[k]);summary[name][k]={pass:a.filter(x=>x.pos>=.85).length,exact:a.filter(x=>x.edit===0).length,meanPos:a.reduce((n,x)=>n+x.pos,0)/a.length,meanEdit:a.reduce((n,x)=>n+x.edit,0)/a.length,minLL:Math.min(...a.map(x=>x.ll))}}}
 return {summary,rows:out,lexicon,supp,seed:"0x296947c9",method:"semi-Markov word lattice with unknown word mixture, latent word boundaries, exact posterior and legal-path positional MBR; fixed length separately labelled"}; 
}

if(require.main===module) console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
module.exports={makeDecoder,experiment,paths};
