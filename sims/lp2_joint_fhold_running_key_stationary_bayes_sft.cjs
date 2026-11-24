'use strict';
// Exact stationary iid-word joint GP29 F-hold posterior and native-vs-uniform Bayes factor.
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
 const donors=inputs.slice(4).map(donor),cuts=donors.map(d=>Math.floor(d.length*.7));for(let t=0;t<donors.length;t++){const d=donors[t];for(const w of d)add(w);for(const w of d.slice(0,cuts[t]))if(w.length<40)incr(trainCounts,w,1)}
 const vocab=dict.flatMap(s=>[...s]),sum=m=>[...m.values()].reduce((a,b)=>a+b,0),lt=sum(lexCounts),tt=sum(trainCounts);
 const weight=new Map(),prefix=new Map(),suffix=new Map(),within=new Map(),lengthWeight=new Float64Array(40);let meanLen=0;
 for(const w of vocab){const a=.49*(lexCounts.get(w)||0)/lt+.49*(trainCounts.get(w)||0)/tt+.02/vocab.length;weight.set(w,a);meanLen+=a*w.length;lengthWeight[w.length]+=a;
  for(let i=0;i<w.length;i++){incr(prefix,w.slice(0,i+1),a);incr(suffix,w.slice(i),a);for(let j=i+1;j<=w.length;j++)incr(within,w.slice(i,j),a)}}
 assert(Math.abs(sum(weight)-1)<1e-9,"word probability normalization");
 // Exact marginal over arbitrary word-internal key alignment and all key word boundaries under a stationary iid-word process.
 function stationary(k){if(!k.length)return 1;const n=k.length,b=new Float64Array(n+1);b[n]=1;
  for(let i=n-1;i>=1;i--){let s=prefix.get(k.slice(i))||0;for(let j=i+1;j<n;j++)s+=(weight.get(k.slice(i,j))||0)*b[j];b[i]=s}
  let p=within.get(k)||0;for(let j=1;j<n;j++)p+=(suffix.get(k.slice(0,j))||0)*b[j];return p/meanLen;
 }
 for(let i=0;i<29;i++){assert(stationary(ch(i))>=0,"nonnegative");}assert(Math.abs(Array.from({length:29},(_,i)=>stationary(ch(i))).reduce((a,b)=>a+b,0)-1)<1e-9,"stationary one-symbol mass");
 const first="A";assert(Math.abs(Array.from({length:29},(_,i)=>stationary(first+ch(i))).reduce((a,b)=>a+b,0)-stationary(first))<1e-9,"stationary two-symbol mass");
 function analyze(c,truth){const a=[];let uniform=0,total=0;for(const p of dict[c.length]){let k="",ok=true;for(let i=0;i<c.length;i++){const pi=num(p[i]),ci=num(c[i]);if(pi===0){if(ci!==0){ok=false;break}}else k+=ch(mod(ci-pi))}
  if(!ok)continue;const pw=weight.get(p)/lengthWeight[c.length];uniform+=pw*Math.pow(29,-k.length);const prob=pw*stationary(k);if(prob){total+=prob;a.push({p,k,prob})}}
  a.sort((x,y)=>y.prob-x.prob);const rank=truth===undefined?null:a.findIndex(x=>x.p===truth)+1;return {n:a.length,logBF:Math.log(total/uniform),top:a[0]?.p,confidence:(a[0]?.prob||0)/total,rank,top5:a.slice(0,5).map(x=>({...x,post:x.prob/total}))};
 }
 function encode(p,k){let i=0;return Array.from(p,v=>num(v)===0?ch(0):ch(mod(num(v)+num(k[i++])))).join("")}
 const render=s=>s===undefined?null:Array.from(s,v=>gp.translit[num(v)]).join("");
 let seed=0x33010825;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}
 const bylen=donors.map((d,t)=>{let a=Array.from({length:40},()=>[]);for(const w of d.slice(cuts[t]))if(w.length<40)a[w.length].push(w);return a});
 const keyStreams=donors.map((d,t)=>d.slice(cuts[t]).join(""));
 const out=[],controls=[[],[]];
 let offset=0;for(let wi=0;wi<original.length;wi++){const c=original[wi],L=c.length;if(L>=9){const ca=analyze(c);out.push({wi,offset,L,c:render(c),n:ca.n,logBF:ca.logBF,confidence:ca.confidence,top5:ca.top5.map(x=>({p:render(x.p),k:render(x.k),posterior:x.post}))});
  for(let t=0;t<2;t++){const source=t===0?0:2,keysource=t===0?1:0,arr=bylen[source][L];if(!arr.length)continue;const p=arr[rand(arr.length)],ks=keyStreams[keysource],k=ks.slice(rand(ks.length-L)).slice(0,L),cp=encode(p,k),r=analyze(cp,p);assert(r.rank>0,"native truth support");
   const u=Array.from({length:L},()=>ch(rand(29))).join(""),ru=analyze(encode(p,u),p);controls[t].push({wi,L,rank:r.rank,n:r.n,logBF:r.logBF,confidence:r.confidence,uniformBF:ru.logBF,uniformConfidence:ru.confidence,uniformRank:ru.rank});
  }
 }offset+=L}
 const stats=a=>{const s=[...a].sort((a,b)=>a-b);return {n:s.length,min:s[0],median:s[Math.floor(s.length/2)],max:s.at(-1),mean:s.reduce((a,b)=>a+b,0)/s.length}};
 const summary={vocab:vocab.length,meanLen,trainWords:cuts,donorWords:donors.map(x=>x.length),original:{BF:stats(out.map(x=>x.logBF)),confidence:stats(out.map(x=>x.confidence)),positiveBF:out.filter(x=>x.logBF>0).length,highConfidence:out.filter(x=>x.confidence>=.9).length},controls:controls.map((a,i)=>({name:["Gibran/Shakespeare","Emerson/Gibran"][i],n:a.length,rank1:a.filter(x=>x.rank===1).length,rank5:a.filter(x=>x.rank<=5).length,confidence:stats(a.map(x=>x.confidence)),BF:stats(a.map(x=>x.logBF)),uniformBF:stats(a.map(x=>x.uniformBF)),nativePositiveBF:a.filter(x=>x.logBF>0).length,uniformPositiveBF:a.filter(x=>x.uniformBF>0).length,highConfidence:a.filter(x=>x.confidence>=.9).length,highConfidenceCorrect:a.filter(x=>x.confidence>=.9&&x.rank===1).length})),byLength:Array.from({length:6},(_,i)=>{const a=out.filter(x=>x.L===i+9);return {L:i+9,original:stats(a.map(x=>x.logBF)),controls:controls.map(z=>{const s=z.filter(x=>x.L===i+9);return {native:stats(s.map(x=>x.logBF)),uniform:stats(s.map(x=>x.uniformBF)),rank1:s.filter(x=>x.rank===1).length,rank5:s.filter(x=>x.rank<=5).length}})}})};
 return {summary,anchors:out,controls};
}
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'))),null,2));
