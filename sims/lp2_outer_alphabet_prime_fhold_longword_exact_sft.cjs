"use strict";
const fs=require("node:fs");
function experiment(c,raw,dict,extras){
 const assert=(v,msg)=>{if(!v)throw Error(msg)};
 const idx=new Map(c.runes.map((x,i)=>[x,i])), full=c.pages.slice(0,56).flatMap(x=>x.indices);
 const words=raw.split("%").slice(0,55).join("%").replace(/[/\s%]/gu,"").split(/[^\u16a0-\u16ff]+/u).filter(Boolean).map(s=>[...s].map(x=>idx.get(x)));
 const total=words.flat();assert(words.length===2896&&total.length===12956&&total.every((x,i)=>x===full[i]),"word parse");
 const anchors=[];let g=0;for(let i=0;i<words.length;i++){if(words[i].length===14)anchors.push({wi:i,g,ct:words[i]});g+=words[i].length;}
 const pstarts=[];let n=0;for(const p of c.pages){pstarts.push(n);n+=p.indices.length;}
 const chapterPages=[0,3,8,15,23,27,33,40,54], chapterStarts=chapterPages.map(i=>pstarts[i]);
 for(const a of anchors){a.page=pstarts.findLastIndex(x=>x<=a.g);a.pageStart=pstarts[a.page];a.chapterStart=chapterStarts.filter(x=>x<=a.g).at(-1);}
 assert(anchors.length===3,"three anchors");
 const tokens=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(word){const text=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const out=[];for(let i=0;i<text.length;){if(text.startsWith("ING",i)){out.push(21);i+=3;}else if(text.startsWith("IO",i)){out.push(27);i+=2;}else {const t=tokens.find(x=>text.startsWith(x.s,i));if(!t)return null;out.push(t.i);i+=t.s.length;}}return out;}
 const native=extras.flatMap(s=>s.toUpperCase().match(/[A-Z]+/g)||[]);
 const dictionary=Array.from(new Set([...dict.split(/\r?\n/).filter(s=>/^[a-z]+\s+\d+$/i.test(s)).map(s=>s.split(/\s+/)[0].toUpperCase()),...native])).map(w=>({w,p:encode(w)})).filter(x=>x.p?.length===14);
 const primes=[];for(let n=2;primes.length<full.length+100;n++){let ok=true;for(const p of primes){if(p*p>n)break;if(n%p===0){ok=false;break;}}if(ok)primes.push(n);}
 const shift=primes.map(x=>(x-1)%29),mod=x=>(x%29+29)%29;
 function relation(ct,p,start,sign,marker,pin){const m=new Int8Array(29).fill(-1),rev=new Int8Array(29).fill(-1);if(pin){m[marker]=0;rev[0]=marker;}let j=start;for(let i=0;i<p.length;i++){const x=p[i],y=ct[i];if(x===0){if(y!==marker)return null;continue;}const z=mod(x+sign*shift[j++]);if((m[y]!==-1&&m[y]!==z)||(rev[z]!==-1&&rev[z]!==y))return null;m[y]=z;rev[z]=y;}return {m,rev,j};}
 function merge(a,b){if(!a||!b)return null;const m=a.m.slice(),rev=a.rev.slice();for(let i=0;i<29;i++){const x=b.m[i];if(x<0)continue;if((m[i]>=0&&m[i]!==x)||(rev[x]>=0&&rev[x]!==i))return null;m[i]=x;rev[x]=i;}return {m,rev};}
 function traces(ct,prefix,sign,marker,pin){const low=prefix.length-prefix.filter(x=>x===marker).length,high=prefix.length;const a=[];for(const d of dictionary)for(let t=low;t<=high;t++){const q=relation(ct,d.p,t,sign,marker,pin);if(q)a.push({...q,w:d.w,start:t});}return a;}
 const rows=[];for(const mode of ["page","chapter","continuous"]){for(const sign of [1,-1])for(const [marker,pin] of [[0,false],...Array.from({length:29},(_,i)=>[i,true])]){const lists=anchors.map(a=>traces(a.ct,full.slice(mode==="page"?a.pageStart:mode==="chapter"?a.chapterStart:0,a.g),sign,marker,pin));let pair=0,triple=0,witness=null;for(const a of lists[0])for(const b of lists[1]){const ab=merge(a,b);if(!ab)continue;pair++;for(const d of lists[2]){const abc=merge(ab,d);if(abc){triple++;witness??={words:[a.w,b.w,d.w],phases:[a.start,b.start,d.start],assigned:[...abc.m].filter(x=>x>=0).length};}}}rows.push({mode,sign,marker,pin,local:lists.map(x=>x.length),pair,triple,witness});}}
 const sigma=Array.from({length:29},(_,i)=>i);let seed=0x330129;for(let i=28;i>0;i--){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;const j=(seed>>>0)%(i+1);[sigma[i],sigma[j]]=[sigma[j],sigma[i]];}
 const donor=native.flatMap(x=>encode(x)||[]);const controls=[];for(const [marker,pin] of [[0,false],[sigma[0],true]]){for(const sign of [1,-1]){const arr=anchors.map((a,i)=>{const p=donor.slice(i*100,a.g-a.chapterStart+i*100).concat(dictionary[i].p);let j=0;const ct=p.map(x=>x===0?marker:sigma[mod(x+sign*shift[j++])]);const t=p.slice(0,-14).filter(x=>x!==0).length;const q=relation(ct.slice(-14),dictionary[i].p,t,sign,marker,pin);assert(q,"true plant trace");const list=traces(ct.slice(-14),ct.slice(0,-14),sign,marker,pin);assert(list.some(x=>x.w===dictionary[i].w&&x.start===t),"blind dictionary contains true trace");return q;});const merged=merge(merge(arr[0],arr[1]),arr[2]);assert(merged,"true key satisfies all anchors");assert([...merged.m].every((x,i)=>x<0||sigma[x]===i),"true inverse consistent");controls.push({marker,pin,sign,assigned:[...merged.m].filter(x=>x>=0).length});}}
 return {anchors,dictionary:dictionary.length,rows,controls};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt","resources/liber-primus/lp1-plaintext-reference.txt"];
const d=paths.map(p=>fs.readFileSync(p,'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(d[0]),d[1],d[2],d.slice(3)),null,2));
