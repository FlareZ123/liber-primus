'use strict';
const fs=require('node:fs'),path=require('node:path');
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/liber-primus/lp2-ink-annotations.json","resources/liber-primus/lp2-punctuation-identity.json","resources/external/relikd-solved-gp29-native-v1.json"];
function gate(raw){
 const gp=JSON.parse(raw[0]),ink=JSON.parse(raw[2]),identity=JSON.parse(raw[3]),gold=JSON.parse(raw[4]),ix=new Map(gp.runes.map((r,i)=>[r,i])),C=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),mod=x=>(x%29+29)%29;
 const assert=(v,m)=>{if(!v)throw Error(m)},stream=[],cuts=[0];
 for(const ch of raw[1].split("%").slice(0,55).join("%")){if(ix.has(ch))stream.push(ix.get(ch));else if(ch==="."&&cuts.at(-1)!==stream.length)cuts.push(stream.length)}
 assert(C.length===12956&&cuts.length===174&&cuts.at(-1)===C.length&&stream.join()===C.join(),"corrected source");
 let off=0,offsets=[];for(const p of gp.pages){offsets[p.page]=off;off+=p.indices.length}
 const large=new Set(ink.pages.filter(p=>p.page<=55).flatMap(p=>(p.large_punctuation||[]).map(x=>offsets[p.page]+x[0])));
 const excluded=new Set([57,58,59,60,91,125,127]),small=new Set(identity.events.filter(e=>e.symbol==="⁘"&&!excluded.has(e.index)).map(e=>e.rune_offset));
 const type=x=>x===0?"book-start":large.has(x)?"large":small.has(x)?"audited-four-dot":"other";
 const chapPages=[0,3,8,15,23,27,33,40,54,56],bound=3301+12956,maxLen=Math.max(...cuts.slice(1).map((x,i)=>x-cuts[i])),cap=bound+maxLen+2;
 const isPrime=new Uint8Array(300000);isPrime.fill(1,2);for(let n=2;n*n<isPrime.length;n++)if(isPrime[n])for(let k=n*n;k<isPrime.length;k+=n)isPrime[k]=0;
 const primes=[];for(let n=2;n<isPrime.length&&primes.length<cap;n++)if(isPrime[n])primes.push(n);assert(primes.length===cap,"prime count");
 const all=(1n<<BigInt(cap))-1n,startMask=(1n<<BigInt(bound+1))-1n;
 function masks(s){const forbidden=Array(29).fill(0n);for(let j=0;j<cap;j++)forbidden[mod(s*(primes[j]-1))]|=1n<<BigInt(j);return forbidden.map(b=>all^b)}
 const mask=[masks(1),masks(-1)];function validStarts(c,k){let b=all;for(let i=c.length-1;i>=0;i--){b=((b>>1n)&mask[k][c[i]])|(c[i]===0?b:0n);if(!b)return 0n}return b&startMask}
 function count(b){let n=0;while(b){b&=b-1n;n++}return n}
 // Exact direct single-origin forward oracle for native and sampled checks.
 function endpoints(c,s,start){let cur=new Set([start]);for(const x of c){const next=new Set();for(const j of cur){if(x===0)next.add(j);if(mod(x-s*(primes[j]-1))!==0)next.add(j+1)}cur=next;if(!cur.size)break}return [...cur]}
 const rows=[];for(let i=0;i+1<cuts.length;i++){const st=cuts[i],en=cuts[i+1];if(type(st)!=="audited-four-dot"||type(en)!=="audited-four-dot")continue;const chapter=chapPages.slice(0,-1).findIndex((p,k)=>st>=offsets[p]&&en<=offsets[chapPages[k+1]]);if(chapter<0)continue;const c=C.slice(st,en);const results=[1,-1].map((s,k)=>{const b=validStarts(c,k);for(const j of [0,1,29,3301,bound])assert(Boolean((b>>BigInt(j))&1n)===Boolean(endpoints(c,s,j).length),"oracle comparison");return {sign:s,starts:count(b),first:b?((b&(-b)).toString(2).length-1):null}});rows.push({start:st,end:en,length:c.length,chapter:chapPages[chapter],F:c.filter(x=>x===0).length,results})}
 const p56=gold.sections.find(s=>/end/i.test(s.name));assert(p56,"p56 source");const p=[...p56.source_text].filter(c=>ix.has(c)).map(c=>ix.get(c));const c56=gp.pages[56].indices;let j=0;const encrypted=p.map(x=>x===0?0:mod(x+primes[j++]-1));assert(p.length===85&&encrypted.join()===c56.join(),"authentic p56 replay");assert(validStarts(c56,0)&1n,"authentic p56 origin");assert(endpoints(c56,1,0).includes(j),"authentic p56 endpoint");
 const summary=[1,-1].map((s,k)=>({sign:s,total:rows.length,impossible:rows.filter(x=>!x.results[k].starts),minimum:rows.slice().sort((a,b)=>a.results[k].starts-b.results[k].starts).slice(0,8)}));
 return {scope:{bound,cap,maxLen,chapPages,small:cuts.filter(x=>type(x)==="audited-four-dot").length,large:large.size,rows:rows.length},p56:{runes:p.length,consumed:j,starts:count(validStarts(c56,0)),exact:true},summary,rows};
}
console.log(JSON.stringify(gate(paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'))),null,2));
