'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(corpus,transcription,lexicon){
 const data=JSON.parse(corpus), rmap=new Map(data.runes.map((r,i)=>[r,i])),mod=x=>((x%29)+29)%29,assert=(x,m)=>{if(!x)throw Error(m)};
 const blocks=transcription.split("%");blocks.splice(50,0,"");
 const runeValues=s=>[...s].filter(c=>rmap.has(c)).map(c=>rmap.get(c));
 const canonical=blocks.map(s=>s.replace(/[\/\r\n]/g,"").split(new RegExp("[^"+data.runes.join("")+"]+","u")).map(runeValues).filter(w=>w.length));
 const external=blocks.map(s=>s.split("-").map(runeValues).filter(w=>w.length));
 assert(canonical.length===58,"page count");
 for(let p=0;p<58;p++)assert(canonical[p].flat().join(",")===data.pages[p].indices.join(","),"page "+p);
 const patterns=[[6,7,6,3,6,4,3,3],[5,4,7,3,6,3,7,4]];
 const match=(pages,pattern)=>pages.slice(0,56).flatMap((ws,p)=>ws.flatMap((w,i)=>pattern.every((n,j)=>ws[i+j]?.length===n)?[{p,word:i,offset:ws.slice(0,i).flat().length,length:pattern.reduce((a,b)=>a+b,0)}]:[]));
 const source=patterns.map(pattern=>({pattern,external:match(external,pattern),canonical:match(canonical,pattern)}));
 function span(h){let off=0;const ws=canonical[h.p].filter(w=>{let start=off;off+=w.length;return start>=h.offset&&off<=h.offset+h.length});assert(ws.flat().length===h.length,"span");return {...h,actualLengths:ws.map(w=>w.length),c:ws.flat()}}
 const pairs=source.map(s=>s.external.map(span));
 const letters=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
 function gp(w){w=w.toUpperCase().replace(/ING/g,"NG").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let a=[];for(let i=0;i<w.length;){let n=letters.indexOf(w.slice(i,i+2));if(n>=0){a.push(n);i+=2;continue}n=letters.indexOf(w[i++]);if(n<0)return null;a.push(n)}return a}
 const dict=Array.from({length:30},()=>new Map());
 for(const line of lexicon.trim().split(/\r?\n/)){const [w,f]=line.trim().split(/\s+/),a=gp(w);if(!a||!a.length||a.length>=30||!Number.isFinite(+f)||+f<=0)continue;let k=a.join(","),old=dict[a.length].get(k);if(old){old.f+=+f;if(+f>old.best){old.best=+f;old.w=w}}else dict[a.length].set(k,{a,w,f:+f,best:+f})}
 const nodes=[{ch:new Map()}],roots=Array(30).fill(0);
 const add=()=>{nodes.push({ch:new Map()});return nodes.length-1};
 for(let l=1;l<30;l++){roots[l]=add();for(const {a,w,f} of dict[l].values()){let n=roots[l];for(const p of a){if(!nodes[n].ch.has(p))nodes[n].ch.set(p,add());n=nodes[n].ch.get(p)}Object.assign(nodes[n],{w,score:Math.log(f)})}}
 const N=nodes.length;
 function frame(c,lengths){let off=0;const end=new Map();for(let i=0;i<lengths.length;i++){off+=lengths[i];end.set(off,roots[lengths[i+1]]??0)}assert(off===c.length,"frame");return {c,lengths,end,root:roots[lengths[0]]}}
 function masks(c,hold){if(!hold)return [[]];const z=c.flatMap((x,i)=>x===0?[i]:[]);return Array.from({length:2**z.length},(_,m)=>z.filter((_,i)=>Math.floor(m/2**i)%2))}
 function solve(a,b,sign,hold){
  const A=frame(a.c,a.actualLengths),B=frame(b.c,b.actualLengths),cases=[];
  function advance(n,p,pos,F){const child=nodes[n].ch.get(p);if(child===undefined)return null;if(F.end.has(pos+1)){if(nodes[child].w===undefined)return null;return {n:F.end.get(pos+1),w:nodes[child].w,s: nodes[child].score}}return {n:child,s:0}}
  for(const ma of masks(A.c,hold))for(const mb of masks(B.c,hold)){
   const ha=new Set(ma),hb=new Set(mb);let i=0,j=0,peak=1;
   let dp=new Map([[A.root*N+B.root,{count:1n,score:0,wa:[],wb:[],pa:[],pb:[]}]]);
   while((i<A.c.length||j<B.c.length)&&dp.size){
    const ah=i<A.c.length&&ha.has(i),bh=j<B.c.length&&hb.has(j),sa=ah||(!bh&&i<A.c.length),sb=!ah&&(bh||j<B.c.length),next=new Map();
    for(const [key,v] of dp){const na=Math.floor(key/N),nb=key%N;
     function emit(pa,pb){const xa=sa?advance(na,pa,i,A):{n:na,s:0},xb=sb?advance(nb,pb,j,B):{n:nb,s:0};if(!xa||!xb)return;const nk=xa.n*N+xb.n,score=v.score+xa.s+xb.s,old=next.get(nk),count=(old?.count??0n)+v.count;if(!old||score>old.score)next.set(nk,{count,score,wa:xa.w?[...v.wa,xa.w]:v.wa,wb:xb.w?[...v.wb,xb.w]:v.wb,pa:sa?[...v.pa,pa]:v.pa,pb:sb?[...v.pb,pb]:v.pb});else old.count=count}
     if(sa&&sb){for(const p of nodes[na].ch.keys()){const q=mod(B.c[j]-sign*(A.c[i]-p));if(hold&&(p===0||q===0))continue;emit(p,q)}}
     else if(sa){for(const p of nodes[na].ch.keys())if(ah?p===0:!hold||p!==0)emit(p,null)}
     else if(sb){for(const q of nodes[nb].ch.keys())if(bh?q===0:!hold||q!==0)emit(null,q)}
    }
    if(sa)i++;if(sb)j++;dp=next;peak=Math.max(peak,dp.size);
   }
   const s=dp.get(0),out={ma,mb,stopped:[i,j],peak,count:s?s.count.toString():"0"};
   if(s){const ka=A.c.flatMap((c,i)=>ha.has(i)?[]:[mod(c-s.pa[i])]),kb=B.c.flatMap((c,i)=>hb.has(i)?[]:[mod(sign*(c-s.pb[i]))]);assert(ka.slice(0,Math.min(ka.length,kb.length)).join(",")===kb.slice(0,Math.min(ka.length,kb.length)).join(","),"pad");out.best={...s,count:s.count.toString(),ka,kb}}
   cases.push(out);
  }
  const total=cases.reduce((n,c)=>n+BigInt(c.count),0n),best=cases.filter(c=>c.best).sort((a,b)=>b.best.score-a.best.score)[0]?.best;
  return {sign,hold,total:total.toString(),cases,best};
 }
 const leftText="BELIEVE NOTHING FROM THIS BOOK EXCEPT WHAT YOU KNOW TO BE TRUE TEST THE KNOWLEDGE FIND YOUR TRUTH EXPERIENCE YOUR DEATH DO NOT EDIT OR CHANGE THIS BOOK OR THE MESSAGE CONTAINED WITHIN EITHER THE WORDS OR THEIR NUMBERS FOR ALL IS SACRED";
 const rightText="WE FOLLOW DOGMA SO THAT WE CAN BELONG AND BE RIGHT OR WE FOLLOW REASON SO WE CAN BELONG AND BE RIGHT THERE IS NOTHING TO BE RIGHT ABOUT TO BELONG IS DEATH IT IS THE BEHAVIORS OF CONSUMPTION PRESERVATION AND ADHERENCE THAT HAVE US LOSE OUR PRIMALITY AND THUS OUR DIVINITY";
 function windows(t,n){const ws=t.split(" ").map(gp),out=[];for(let i=0;i<ws.length;i++){let group=[];for(let j=i;j<ws.length;j++){group.push(ws[j]);const flat=group.flat();if(flat.length>n)break;if(flat.length===n&&flat.includes(0)&&group.every(w=>dict[w.length].has(w.join(","))))out.push(group)}}return out}
 const primes=[];for(let n=2;primes.length<100;n++)if(primes.every(p=>p*p>n||n%p!==0))primes.push(n);
 function enc(ws,sign,hold){let k=0;return ws.flat().map(p=>hold&&p===0?0:mod(p+sign*(primes[k++]-1)))}
 const controls=[];
 for(const n of [38,39]){const a=windows(leftText,n)[0],b=windows(rightText,n).find(w=>w.map(x=>x.length).join(",")!==a.map(x=>x.length).join(","));for(const hold of [false,true])for(const sign of [1,-1]){const x={c:enc(a,1,hold),actualLengths:a.map(w=>w.length)},y={c:enc(b,sign,hold),actualLengths:b.map(w=>w.length)},result=solve(x,y,sign,hold),ma=hold?a.flat().flatMap((v,i)=>v===0?[i]:[]):[],mb=hold?b.flat().flatMap((v,i)=>v===0?[i]:[]):[];assert(result.cases.some(c=>c.ma.join(",")===ma.join(",")&&c.mb.join(",")===mb.join(",")&&c.count!=="0"),"control");controls.push({n,ma,mb,plainA:a.flat(),plainB:b.flat(),matchA:result.best.pa.filter((p,i)=>p===a.flat()[i]).length,matchB:result.best.pb.filter((p,i)=>p===b.flat()[i]).length,result})}}
 const original=pairs.map(pair=>({pair,results:[false,true].flatMap(hold=>[1,-1].map(sign=>solve(pair[0],pair[1],sign,hold)))}));
 return {source,lexiconCounts:dict.map(d=>d.size),nodes:N,controls,original};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/control/english_wordfreq_textblob.txt"];
console.log(JSON.stringify(experiment(...paths.map(p=>fs.readFileSync(path.join(__dirname,'..','..',p),'utf8'))),null,2));
