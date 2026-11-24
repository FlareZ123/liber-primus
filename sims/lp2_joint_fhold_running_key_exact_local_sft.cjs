'use strict';
// Exact joint lexical running-key F-hold local support; native controls and original ciphertext.
function experiment(inputs){
 const [gp,trans,lex,native]=[JSON.parse(inputs[0]),inputs[1],inputs[2],JSON.parse(inputs[3])];
 const assert=(b,m)=>{if(!b)throw Error(m)},ch=n=>String.fromCharCode(65+n),num=c=>c.charCodeAt(0)-65,mod=x=>(x+29)%29;
 const runeMap=new Map(gp.runes.map((r,i)=>[r,ch(i)])),alpha=new Map(gp.translit.map((s,i)=>[s,ch(i)]));alpha.set("ING",ch(21));
 const parse=s=>(s.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>runeMap.get(x)).join(""));
 const original=parse(trans).slice(0,2896);
 assert(original.join("")===gp.pages.slice(0,56).flatMap(p=>p.indices).map(ch).join(""),"original source");
 const dict=Array.from({length:40},()=>new Set());
 const add=w=>{if(w.length&&w.length<40)dict[w.length].add(w)};
 const norm=s=>s.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");
 function variants(s){s=norm(s);function rec(i,w){if(i===s.length){add(w);return}for(let n=1;n<=3&&i+n<=s.length;n++){const c=alpha.get(s.slice(i,i+n));if(c!==undefined)rec(i+n,w+c)}}rec(0,"")}
 for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variants(m[1])}
 for(const s of ["A","I","O"])variants(s);
 const nativeWords=native.sections.flatMap(s=>parse(s.source_text));for(const w of nativeWords)add(w);
 function donor(s){const w=[];for(let t of s.match(/[A-Za-z]+/g)||[]){t=norm(t);let p="";while(t.length){let c=null;for(let n=Math.min(t.length,3);n>=1;n--){const x=alpha.get(t.slice(0,n));if(x!==undefined){c=x;t=t.slice(n);break}}if(c===null)throw Error("token");p+=c}w.push(p)}return w}
 const donors=inputs.slice(4).map(donor);for(const d of donors)for(const w of d)add(w);
 const words=new Set(dict.flatMap(s=>[...s])),prefix=new Set([""]),suffix=new Set([""]),substr=new Set([""]);
 for(const w of words){for(let i=0;i<w.length;i++){prefix.add(w.slice(0,i+1));suffix.add(w.slice(i));for(let j=i+1;j<=w.length;j++)substr.add(w.slice(i,j));}}
 // Exact substring language of D*: a fragment lies inside one word, or is a suffix, zero or more whole words, and a prefix.
 function supported(k){if(substr.has(k))return true;const n=k.length;let reach=1;for(let i=1;i<=n;i++)if(suffix.has(k.slice(0,i)))reach|=1<<i;
  for(let i=0;i<n;i++)if((reach>>i)&1){if(prefix.has(k.slice(i)))return true;for(let j=i+1;j<=n;j++)if(words.has(k.slice(i,j)))reach|=1<<j}
  return Boolean((reach>>n)&1);
 }
 function candidates(c){const a=[];for(const p of dict[c.length]){let k="",ok=true;for(let i=0;i<c.length;i++){const pi=num(p[i]),ci=num(c[i]);if(pi===0){if(ci!==0){ok=false;break}}else k+=ch(mod(ci-pi))}
  if(ok&&supported(k))a.push([p,k]);}return a;}
 function encode(p,k){let i=0;return Array.from(p,v=>num(v)===0?ch(0):ch(mod(num(v)+num(k[i++])))).join("")}
 const render=s=>Array.from(s,v=>gp.translit[num(v)]).join("");
 let seed=0x33010824;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}
 const bylen=donors.map(d=>{let a=Array.from({length:40},()=>[]);for(const w of d.slice(Math.floor(d.length*.7)))if(w.length<40)a[w.length].push(w);return a});
 const keyStreams=donors.map(d=>d.slice(Math.floor(d.length*.7)).join(""));
 const out=[],controls=[{name:"Gibran plaintext / Shakespeare key",n:0,counts:[],true:0,unique:0,uniqueCorrect:0,zero:0,uniformCounts:[],uniformZero:0},{name:"Emerson plaintext / Gibran key",n:0,counts:[],true:0,unique:0,uniqueCorrect:0,zero:0,uniformCounts:[],uniformZero:0}];
 let offset=0;for(let wi=0;wi<original.length;wi++){const c=original[wi],L=c.length;if(L>=9){const cand=candidates(c);out.push({wi,offset,L,c:render(c),n:cand.length,candidates:cand.length<=12?cand.map(([p,k])=>[render(p),render(k)]):undefined});
  for(let t=0;t<2;t++){const ctl=controls[t],source=t===0?0:2,keysource=t===0?1:0,arr=bylen[source][L];if(!arr.length)continue;const p=arr[rand(arr.length)],ks=keyStreams[keysource],k=ks.slice(rand(ks.length-L),).slice(0,L),cp=encode(p,k),ca=candidates(cp);const truth=ca.some(([x])=>x===p);assert(truth,"true native pair missing");ctl.n++;ctl.true+=Number(truth);ctl.counts.push(ca.length);ctl.zero+=Number(ca.length===0);ctl.unique+=Number(ca.length===1);ctl.uniqueCorrect+=Number(ca.length===1&&truth);
   const u=Array.from({length:L},()=>ch(rand(29))).join(""),nu=candidates(encode(p,u)).length;ctl.uniformCounts.push(nu);ctl.uniformZero+=Number(nu===0);
  }
 }offset+=L}
 const stats=a=>{const s=[...a].sort((a,b)=>a-b);return {n:s.length,min:s[0],median:s[Math.floor(s.length/2)],max:s.at(-1),mean:s.reduce((a,b)=>a+b,0)/s.length}};
 const summary={dict:words.size,prefix:prefix.size,suffix:suffix.size,substr:substr.size,original:stats(out.map(x=>x.n)),zeros:out.filter(x=>x.n===0).length,unique:out.filter(x=>x.n===1).length,byLength:Array.from({length:6},(_,i)=>{const a=out.filter(x=>x.L===i+9);return {L:i+9,...stats(a.map(x=>x.n)),zero:a.filter(x=>x.n===0).length,unique:a.filter(x=>x.n===1).length}}),controls:controls.map(({counts,uniformCounts,...x})=>({...x,counts:stats(counts),uniformCounts:stats(uniformCounts)}))};
 return {summary,anchors:out};
}
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'))),null,2));
