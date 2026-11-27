"use strict";
const fs=require("node:fs");
function run(raw,mode="p7"){
 const Q=29,mod=x=>(x%Q+Q)%Q,names="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" "),tok=names.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);
 function gp(t){t=t.split(/\*\*\* END OF/i)[0].replace(/^.*?\*\*\* START OF[^\n]*\n/is,"");return (t.toUpperCase().match(/[A-Z]+(?:'[A-Z]+)*/g)||[]).flatMap(w=>{w=w.replace(/'/g,"").replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];while(w){const x=tok.find(x=>w.startsWith(x[0]));if(!x)throw Error(w);a.push(x[1]);w=w.slice(x[0].length)}return a})}
 const corpus=JSON.parse(raw[0]),native=JSON.parse(raw[4]),ink=JSON.parse(raw[5]);if(corpus.runes.join("")!==native.runes.join(""))throw Error("alphabet");
 if(!ink.pages.find(p=>p.page===7).red_spans.some(s=>s.start===194&&s.length===14))throw Error("ink");
 const ds=[...raw.slice(1,4).map((s,i)=>({name:["Shakespeare","Emerson","Gibran"][i],a:gp(s)})),...native.sections.map(s=>({name:s.name,a:[...s.source_text].filter(x=>native.runes.includes(x)).map(x=>native.runes.indexOf(x))}))];
 const freq=new Array(Q).fill(0);for(const S of ds.slice(0,2))for(const x of S.a)freq[x]++;
 const rank=Array.from({length:Q-1},(_,i)=>i+1).sort((a,b)=>freq[b]-freq[a]);
 function runs(a){const out=[];let s=0;for(let i=0;i<=a.length;i++)if(i===a.length||a[i]===0){if(i>s)out.push({start:s,a:a.slice(s,i)});s=i+1}return out}
 const dr=ds.flatMap(({name,a})=>runs(a).map(x=>({...x,name})));
 function bound(C,q,T=new Set(),w=1){const F=Array.from({length:q},()=>new Float64Array(Q*Q)),n=C.length;for(let i=0;i<n;i++){const p=i?C[i-1]:0,c=C[i],v=C[i+1],f=F[i%q];for(let x=0;x<Q;x++)for(let y=0;y<Q;y++){const real=c!==x?(T.has(mod(c-x))?100:0):-Infinity,nullable=c!==p&&p!==x&&(i===n-1||mod(y-x)===mod(c-p)||mod(y-x)===mod(v-p));f[x*Q+y]+=Math.max(real,nullable?w:-Infinity)}}let best=-Infinity;for(let s=0;s<Q;s++){let d=new Float64Array(Q).fill(-Infinity);d[s]=0;for(let j=0;j<q-1;j++){const e=new Float64Array(Q).fill(-Infinity),f=F[j];for(let x=0;x<Q;x++)if(d[x]>-Infinity)for(let y=0;y<Q;y++)e[y]=Math.max(e[y],d[x]+f[x*Q+y]);d=e}for(let x=0;x<Q;x++)best=Math.max(best,d[x]+F[q-1][x*Q+s]);}return best}
 function floor(T,w,lo,hi){let f=Infinity,count=0;for(const {a} of dr){if(a.length<lo)continue;const p=[0];for(const x of a)p.push(p.at(-1)+(T.has(x)?100:0)-w);for(let i=0;i+lo<=a.length;i++)for(let j=i+lo;j<=Math.min(a.length,i+hi);j++){f=Math.min(f,p[j]-p[i]);count++;}}return {f,count}}
 function masks(C,q){const out=[];for(let m=0;m<2**q;m++){const a=new Int8Array(q),b=new Int8Array(q);let j=0,ok=true;for(let i=0;i<q;i++){const nul=(m>>i)&1,p=i?C[i-1]:0;if(nul&&p===C[i]){ok=false;break}a[i]=j;b[i]=nul?p:C[i];if(!nul)j++}if(ok)out.push({a,b,j,m})}return out}
 function replay(C,P,K){let j=0,pending=null;const events=[];for(let i=0;i<C.length;i++){const prev=i?C[i-1]:0,x=K[i%K.length];if(j===P.length&&pending===null)pending=mod(prev-x);const p=j<P.length?P[j]:pending;if(!p)return null;const z=mod(p+x);if(j<P.length&&z===C[i]){j++;events.push(0)}else if(z===prev&&z!==C[i])events.push(1);else return null}return j===P.length?{events,pending}:null}
 function search(C,q,donors,D){const n=C.length,lo=n-D,ms=masks(C,q);if(lo<=q||C.includes(0))throw Error("bad interval");let starts=0,windows=0,tested=0,passedQ1=0,furthest=q,success=[];const prev=[0,...C.slice(0,-1)],ph=Array.from({length:n},(_,i)=>i%q),before=new Uint8Array(n);for(let i=0;i<n;i++)before[i]=C[i]!==prev[i]?1:0;
  for(const {name,start,a} of donors){if(a.length<lo)continue;for(let s=0;s+lo<=a.length;s++){starts++;windows+=Math.min(n,a.length-s)-lo+1;for(const m of ms){tested++;const p0=a[s+m.j],x0=p0+m.b[0]-a[s+m.a[0]],z0=x0<0?x0+29:x0>=29?x0-29:x0;if(z0!==C[q]&&!(z0===prev[q]&&before[q]))continue;passedQ1++;let j=m.j+(z0===C[q]?1:0),i=q+1;
    function key(t){return mod(m.b[t]-a[s+m.a[t]])}
    function witness(tail){const K=Array.from({length:q},(_,t)=>key(t)),P=a.slice(s,s+j),e=replay(C,P,K);if(!e)throw Error("witness replay");success.push({name,start:start+s,length:j,key:K,tail,events:e.events,pending:e.pending})}
    for(;i<n;i++){if(j>=lo){const pending=mod(prev[i]-key(ph[i]));if(pending!==0){let k=i;for(;k<n;k++)if(!before[k]||mod(pending+key(ph[k]))!==prev[k])break;if(k===n){witness(n-i);break}}}
     if(s+j>=a.length||j>=n)break;const z=mod(a[s+j]+key(ph[i]));if(z===C[i])j++;else if(!(z===prev[i]&&before[i]))break;
    }furthest=Math.max(furthest,i);if(i===n&&j>=lo)witness(0);
  }}}
  return {q,n,D,lo,masks:ms.length,starts,windows,tested,passedQ1,furthest,success};
 }
 const spec=mode==="p7"?[7,25,194]:mode==="p8"?[8,35,161]:mode==="p54"?[54,66,195]:null;
 if(mode!=="controls"&&!spec)throw Error("mode");
 if(spec){const [p,start,end]=spec,page=corpus.pages[p].indices,C=page.slice(start,end);if(page[start-1]!==0||C.includes(0)||ink.pages.find(x=>x.page===p).red_spans.some(s=>Math.max(s.start,start)<Math.min(s.start+s.length,end)))throw Error("source boundary");
  const rows=[];for(const q of mode==="p7"?Array.from({length:13},(_,i)=>i+1):[13]){const D=bound(C,q),lo=C.length-D,tests=[[15,88],[19,100],[21,100]].map(([t,w])=>{const T=new Set(rank.slice(0,t)),f=floor(T,w,lo,C.length),cap=bound(C,q,T,w);return {t,w,cap,floor:f.f,windows:f.count,gap:w*C.length+f.f-cap}}),best=tests.reduce((a,b)=>a.gap>b.gap?a:b);const row={q,D,lo,best};if(best.gap<=0)row.search=search(C,q,dr,D);rows.push(row)}return {mode,p,start,end,rows};
 }
 let seed=0x4707b1a9;function rng(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return Math.floor((seed>>>0)/4294967296*n)}
 const pool=dr.filter(s=>s.a.length>=120&&s.name!=="Shakespeare"&&s.name!=="Emerson");
 function plant(P,K,tail){const C=[];let j=0,prev=0;for(const p of P){for(;;){const x=mod(p+K[j++%K.length]);if(x===prev&&rng(10000)<8074){let z=rng(28);if(z>=x)z++;C.push(z);prev=z}else{C.push(x);prev=x;break}}}if(tail){const p=mod(prev-K[j%K.length]);if(!p)return null;let z=rng(28);if(z>=prev)z++;C.push(z)}return C}
 const controls=[];for(let t=0;t<16;t++){const s=pool[rng(pool.length)],at=rng(s.a.length-100),P=s.a.slice(at,at+55+rng(20)),q=t<8?8:13,tail=t%2===0;let C,K,attempt=0;do{K=Array.from({length:q},()=>rng(Q));C=plant(P,K,tail);if(++attempt>10000)throw Error("plant")}while(!C||C.includes(0));
  const D=bound(C,q),result=search(C,q,[{name:s.name,start:s.start,a:s.a}],D),match=result.success.find(x=>x.start===s.start+at&&x.key.join(",")===K.join(","));if(!match||D<C.length-P.length)throw Error("positive control");controls.push({q,n:C.length,L:P.length,d:C.length-P.length,tail,D,attempt,keys:result.success.length,matchLength:match.length,correct:true})
 }return {mode,seed:"0x4707b1a9",controls};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/liber-primus/lp2-ink-annotations.json"];
if(require.main===module)console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,"utf8")),process.argv[2]||"p7"),null,2));
module.exports={run,paths};
