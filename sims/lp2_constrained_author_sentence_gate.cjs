'use strict';
function main(c,raw,native,gibran,emerson){
const assert=(x,m)=>{if(!x)throw Error(m)};const mod=x=>(x%29+29)%29;
const parseRune=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(x=>c.runes.indexOf(x)));
const idx=new Map(c.translit.map((x,i)=>[x,i]));
function parseLatin(s){return (s.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{w=w.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const out=[];for(let i=0;i<w.length;){const x=idx.get(w.slice(i,i+2));if(x!==undefined){out.push(x);i+=2}else{const y=idx.get(w[i++]);if(y!==undefined)out.push(y)}}return out}).filter(w=>w.length)}
const gptext=s=>s.split(/\r?\n/).join(" ").split(/[.!?]+/).map(parseLatin).filter(w=>w.length);
const nativeS=native.sections.flatMap(z=>z.source_text.split(/[⁘⁜]+/u).map(parseRune)).filter(w=>w.length);
const cut=s=>{const a=s.indexOf("*** START OF"),b=s.indexOf("*** END OF");assert(a>=0&&b>a,"PG markers");return s.slice(s.indexOf("\n",a),b)};
const sources=[["native",nativeS],["gibran",gptext(cut(gibran))],["emerson",gptext(cut(emerson))]];
const reps=p=>p.reduce((s,x,i)=>s+(i>0&&x===p[i-1]),0);
function build(ss,b){return ss.map(words=>({words,flat:words.flat()})).filter(x=>x.flat.length>=10&&reps(x.flat)<=b)}
const words=[];let cur=[];function finish(){if(cur.length){words.push(cur);cur=[]}}
for(const ch of raw.split("%").slice(0,55).join("%")){const x=c.runes.indexOf(ch);if(x>=0)cur.push(x);else if(ch!=="%"&&ch!=="/"&&!/\s/u.test(ch))finish()}finish();
const target=words.flat(),canonical=c.pages.slice(0,56).flatMap(p=>p.indices);assert(words.length===2896&&target.length===12956&&target.every((x,i)=>x===canonical[i]),"canonical");
const periods=[2,3,5,7,8,13,14,29,60];const lags=[2,3,5,7,13];
function metrics(w){const p=w.flat(),n=p.length,h=Array(29).fill(0),counts=new Map();let within=0,seam=0;for(let i=0;i<w.length;i++){const a=w[i];within+=reps(a);if(i&&w[i-1].at(-1)===a[0])seam++;const k=a.join(",");counts.set(k,1+(counts.get(k)||0));for(const x of a)h[x]++}
const pc=periods.map(q=>{const a=Array.from({length:q},()=>Array(29).fill(0));for(let i=0;i<n;i++)a[i%q][p[i]]++;let z=0,d=0;for(const b of a){const m=b.reduce((s,x)=>s+x,0);d+=m*(m-1);z+=b.reduce((s,x)=>s+x*(x-1),0)}return z/d});
return [reps(p)/(n-1),within/(n-w.length),seam/(w.length-1),h.filter(x=>x===0).length,Math.min(...h)/n,h.reduce((s,x)=>s+x*(x-1),0)/(n*(n-1)),counts.size/w.length,Math.max(...counts.values()),...pc,...lags.map(l=>p.slice(l).reduce((s,x,i)=>s+(x===p[i]),0)/(n-l))]}
const names=["repeat","within","seam","missing","minfreq","ioc","wordUnique","maxWordCount",...periods.map(q=>"phase"+q),...lags.map(q=>"lag"+q)];
const N=target.length,orig=metrics(words);
let state=3125;const rand=n=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state%n};
function sample(pool,N,constrainSeam){const out=[];let n=0,last=-1;while(n<N){let s=pool[rand(pool.length)];if(constrainSeam&&s.flat[0]===last)continue;for(const w of s.words){if(n===N)break;const a=w.slice(0,N-n);out.push(a);n+=a.length;last=a.at(-1)}}return out}
const primes=[];for(let x=2;primes.length<N;x++){let p=true;for(let y=2;y*y<=x;y++)if(x%y===0){p=false;break}if(p)primes.push(x)}
const K=[23,10,1,10,9,10,16,26];
function enc(w,mode){let j=0;return w.map(a=>a.map(x=>{if(mode==="atbash")return 28-x;if(x===0)return 0;const k=mode==="q8"?K[j%8]:primes[j]-1;j++;return mod(x+k)}))}
function summary(arr){return Object.fromEntries(names.map((name,i)=>{const a=arr.map(x=>x[i]).sort((x,y)=>x-y);return [name,{min:a[0],q025:a[Math.floor(a.length*.025)],median:a[Math.floor(a.length*.5)],q975:a[Math.floor(a.length*.975)],max:a.at(-1),le:a.filter(x=>x<=orig[i]).length,ge:a.filter(x=>x>=orig[i]).length}]}))}
const samples=[];
for(const [name,ss] of sources){for(const [grammar,b] of [["ordinary",Infinity],["strict",0],["near",1]]){const pool=build(ss,b);assert(pool.length>0,"empty pool");const a=Object.fromEntries(["atbash","q8","prime"].map(m=>[m,[]]));for(let r=0;r<50;r++){const p=sample(pool,N,grammar!=="ordinary");if(grammar==="strict")assert(reps(p.flat())===0,"strict");for(const m of Object.keys(a))a[m].push(metrics(enc(p,m)))}
samples.push({source:name,grammar,available:pool.length,poolRunes:pool.reduce((s,x)=>s+x.flat.length,0),minSentence:Math.min(...pool.map(x=>x.flat.length)),maxSentence:Math.max(...pool.map(x=>x.flat.length)),poolSymbols:new Set(pool.flatMap(x=>x.flat)).size,results:Object.fromEntries(Object.entries(a).map(([m,x])=>[m,summary(x)]))})}}
return {names,original:Object.fromEntries(names.map((x,i)=>[x,orig[i]])),originalN:N,originalWords:words.length,sourceSentenceCounts:sources.map(([n,s])=>[n,s.length]),samples,notes:"50 draws per grammar/source/receiver. Exact target length; last sentence truncated at rune boundary. Whole sentences independently sampled with replacement; no cross-sentence equal rune in constrained variants. Minimum length10. No target-dependent grammar. Native and historical text sentence segmentation is mechanical, not linguistic analysis. Atbash direct. q8 and prime use positive additive cipher, literal-F bypass with no clock advance. No heldout search unless joint compatibility."};
}
const fs=require('node:fs');
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
const s=files.map(p=>fs.readFileSync(p,'utf8'));
console.log(JSON.stringify(main(JSON.parse(s[0]),s[1],JSON.parse(s[2]),s[3],s[4]),null,2));
