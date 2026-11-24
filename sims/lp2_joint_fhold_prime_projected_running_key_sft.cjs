'use strict';
// Source-fixed Gematria-prime projected running key, exact local marginal.
function experiment(inputs){
 const [gp,trans,lex,native]=[JSON.parse(inputs[0]),inputs[1],inputs[2],JSON.parse(inputs[3])];
 const assert=(b,m)=>{if(!b)throw Error(m)},ch=n=>String.fromCharCode(65+n),num=c=>c.charCodeAt(0)-65,mod=x=>(x+29)%29;
 const runeMap=new Map(gp.runes.map((r,i)=>[r,ch(i)])),alpha=new Map(gp.translit.map((s,i)=>[s,ch(i)]));alpha.set("ING",ch(21));
 const parse=s=>(s.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>runeMap.get(x)).join(""));
 const original=parse(trans).slice(0,2896);
 assert(original.join("")===gp.pages.slice(0,56).flatMap(p=>p.indices).map(ch).join(""),"original source");
 const dict=Array.from({length:40},()=>new Set()),lexCounts=new Map(),trainCounts=new Map();
 const add=w=>{if(w.length&&w.length<40)dict[w.length].add(w)};
 const incr=(m,k,v)=>m.set(k,(m.get(k)||0)+v);
 const norm=s=>s.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");
 function variants(s){s=norm(s);const out=new Set();function rec(i,w){if(i===s.length){out.add(w);return}for(let n=1;n<=3&&i+n<=s.length;n++){const c=alpha.get(s.slice(i,i+n));if(c!==undefined)rec(i+n,w+c)}}rec(0,"");return [...out].filter(w=>w.length<40)}
 for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(l);if(m&&(m[1].length>=2||["a","i","o"].includes(m[1]))){const a=variants(m[1]);for(const w of a){add(w);incr(lexCounts,w,+m[2]/a.length)}}}
 for(const w of native.sections.flatMap(s=>parse(s.source_text)))add(w);
 function body(s){const a=/\*\*\* START OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[^\r\n]*\*\*\*/i.exec(s);if(a)s=s.slice(a.index+a[0].length);const b=/\*\*\* END OF (?:THIS|THE) PROJECT GUTENBERG EBOOK/i.exec(s);return b?s.slice(0,b.index):s}
 function donor(s){const w=[];for(let t of body(s).match(/[A-Za-z]+/g)||[]){t=norm(t);let p="";while(t.length){let c=null;for(let n=Math.min(t.length,3);n>=1;n--){const x=alpha.get(t.slice(0,n));if(x!==undefined){c=x;t=t.slice(n);break}}if(c===null)throw Error("token");p+=c}w.push(p)}return w}
 const donors=inputs.slice(4,7).map(donor),cuts=donors.map(d=>Math.floor(d.length*.7));for(let t=0;t<donors.length;t++){const d=donors[t];for(const w of d)add(w);for(const w of d.slice(0,cuts[t]))if(w.length<40)incr(trainCounts,w,1)}
 const vocab=dict.flatMap(s=>[...s]),sum=m=>[...m.values()].reduce((a,b)=>a+b,0),lt=sum(lexCounts),tt=sum(trainCounts);

 // Prime-value projection is frozen: the published Gematria prime for each
 // key rune, reduced modulo 29. This is many-to-one; sum all preimages.
 const project=s=>Array.from(s,c=>ch(gp.prime[num(c)]%29)).join("");
 const projectedAlphabet=new Set(gp.prime.map(p=>p%29));
 const weight=new Map(),keyWeight=new Map(),prefix=new Map(),suffix=new Map(),within=new Map(),lengthWeight=new Float64Array(40);
 let meanLen=0;
 for(const w of vocab){const a=.49*(lexCounts.get(w)||0)/lt+.49*(trainCounts.get(w)||0)/tt+.02/vocab.length;weight.set(w,a);meanLen+=a*w.length;lengthWeight[w.length]+=a;incr(keyWeight,project(w),a)}
 for(const [w,a] of keyWeight){for(let i=0;i<w.length;i++){incr(prefix,w.slice(0,i+1),a);incr(suffix,w.slice(i),a);for(let j=i+1;j<=w.length;j++)incr(within,w.slice(i,j),a)}}
 assert(Math.abs(sum(weight)-1)<1e-9 && Math.abs(sum(keyWeight)-1)<1e-9,"weight normalization");
 function stationary(k){if(!k.length)return 1;const n=k.length,b=new Float64Array(n+1);b[n]=1;
  for(let i=n-1;i>=1;i--){let s=prefix.get(k.slice(i))||0;for(let j=i+1;j<n;j++)s+=(keyWeight.get(k.slice(i,j))||0)*b[j];b[i]=s}
  let p=within.get(k)||0;for(let j=1;j<n;j++)p+=(suffix.get(k.slice(0,j))||0)*b[j];return p/meanLen;
 }
 const marginal=Array.from({length:29},(_,i)=>stationary(ch(i)));
 assert(Math.abs(marginal.reduce((a,b)=>a+b,0)-1)<1e-9,"marginal normalization");
 for(let i=0;i<29;i++){assert((marginal[i]>0)===projectedAlphabet.has(i),"projected support");assert(Math.abs(Array.from({length:29},(_,j)=>stationary(ch(i)+ch(j))).reduce((a,b)=>a+b,0)-marginal[i])<1e-9,"two-symbol marginal")}
 const iid=k=>Array.from(k,c=>marginal[num(c)]).reduce((a,b)=>a*b,1);
 function analyze(c,truth){const a=[];let uniform=0,independent=0,total=0;for(const p of dict[c.length]){let k="",ok=true;for(let i=0;i<c.length;i++){const pi=num(p[i]),ci=num(c[i]);if(pi===0){if(ci!==0){ok=false;break}}else k+=ch(mod(ci-pi))}
  if(!ok)continue;const pw=weight.get(p)/lengthWeight[c.length];uniform+=pw*Math.pow(29,-k.length);
  const q=iid(k);if(!q)continue;independent+=pw*q;
  const prob=pw*stationary(k);if(prob){total+=prob;a.push({p,k,prob})}}
  a.sort((x,y)=>y.prob-x.prob);const rank=truth===undefined?null:a.findIndex(x=>x.p===truth)+1;
  if(a.length)assert(encode(a[0].p,a[0].k)===c,"top candidate replay");
  return {n:a.length,rank,logBFUniform:total&&uniform?Math.log(total/uniform):null,logBFIid:total&&independent?Math.log(total/independent):null,projectedSupport:independent>0,languageSupport:total>0,confidence:total?a[0].prob/total:null,top:a[0]?{p:render(a[0].p),k:Array.from(a[0].k,num)}:null};
 }
 function encode(p,k){let i=0;return Array.from(p,v=>num(v)===0?ch(0):ch(mod(num(v)+num(k[i++])))).join("")}
 const render=s=>Array.from(s,v=>gp.translit[num(v)]).join("");
 let seed=0x33010825;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}
 function sampleIid(){let x=rand(2**24)/2**24;for(let i=0;i<29;i++){x-=marginal[i];if(x<0)return ch(i)}return ch(marginal.findLastIndex(v=>v>0))}
 const bylen=donors.map((d,t)=>{let a=Array.from({length:40},()=>[]);for(const w of d.slice(cuts[t]))if(w.length<40)a[w.length].push(w);return a});
 const streams=donors.map((d,t)=>project(d.slice(cuts[t]).join("")));
 const out=[],controls=[[],[]];
 let off=0;for(let wi=0;wi<original.length;wi++){const c=original[wi],L=c.length;if(L>=9){
  out.push({wi,offset:off,L,c:render(c),...analyze(c)});
  for(let t=0;t<2;t++){const source=t===0?0:2,keysource=t===0?1:0,arr=bylen[source][L];if(!arr.length)continue;const p=arr[rand(arr.length)],ks=streams[keysource],k=ks.slice(rand(ks.length-L)).slice(0,L),cp=encode(p,k),res=analyze(cp,p);assert(res.rank>0,"projected native truth support");
   const iidKey=Array.from({length:L},sampleIid).join(""),uniformKey=Array.from({length:L},()=>ch(rand(29))).join("");
   controls[t].push({wi,L,native:res,iid:analyze(encode(p,iidKey),p),uniform:analyze(encode(p,uniformKey),p)});
  }
 }off+=L}
 const stats=a=>{const s=a.filter(x=>x!==null).sort((a,b)=>a-b);return {n:s.length,missing:a.length-s.length,min:s[0]??null,median:s[Math.floor(s.length/2)]??null,max:s.at(-1)??null,mean:s.length?s.reduce((a,b)=>a+b,0)/s.length:null}};
 const summarize=a=>({n:a.length,projectedSupport:a.filter(x=>x.projectedSupport).length,languageSupport:a.filter(x=>x.languageSupport).length,rank1:a.filter(x=>x.rank===1).length,rank5:a.filter(x=>x.rank!==null&&x.rank>0&&x.rank<=5).length,uniformBF:stats(a.map(x=>x.logBFUniform)),iidBF:stats(a.map(x=>x.logBFIid)),positiveIidBF:a.filter(x=>x.logBFIid>0).length,highConfidence:a.filter(x=>x.confidence>=.9).length});
 const summary={projection:gp.prime.map(p=>p%29),projectedAlphabet:[...projectedAlphabet].sort((a,b)=>a-b),vocab:vocab.length,projectedVocabulary:keyWeight.size,meanLen,original:summarize(out),controls:controls.map(a=>({native:summarize(a.map(x=>x.native)),iid:summarize(a.map(x=>x.iid)),uniform:summarize(a.map(x=>x.uniform))})),byLength:Array.from({length:6},(_,i)=>({L:i+9,original:summarize(out.filter(x=>x.L===i+9))}))};
 return {summary,anchors:out,controls};
}
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
if(require.main===module)console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
module.exports={experiment,files};
