// Consuming-F counterpart of cumulative ciphertext-word prime clock. Run from repository root.
const fs=require("node:fs");
function experiment(j,trans,native){
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const parse=s=>(s.replace(/[\/\r\n]/g,"").match(new RegExp("["+j.runes.join("")+"]+","gu"))||[]).map(w=>[...w].map(x=>j.runes.indexOf(x)));
 const raw=trans.split("%").slice(0,55).join("");
 const sections=raw.split("$").map(parse).filter(w=>w.length);
 const words=sections.flat();
 assert(words.length===2896&&eq(words.flat(),j.pages.slice(0,56).flatMap(p=>p.indices)),"source mismatch");
 const controls=[1,3,5], maxSeed=12956;
 const training=native.sections.filter((_,i)=>!controls.includes(i)).flatMap(s=>parse(s.source_text));
 const sum=w=>w.reduce((a,x)=>a+j.prime[x],0);
 const ctl=controls.map(i=>parse(native.sections[i].source_text));
 const needed=maxSeed+Math.max(...sections.map(ws=>ws.reduce((a,w)=>a+sum(w),0)),...ctl.map(ws=>ws.flat().length*109))+100;
 const lim=Math.ceil(needed*(Math.log(needed)+Math.log(Math.log(needed)))+100);
 const composite=new Uint8Array(lim+1),k=new Uint8Array(needed+1);let n=0;
 for(let p=2;p<=lim&&n<k.length;p++)if(!composite[p]){k[n++]=(p-1)%29;if(p*p<=lim)for(let m=p*p;m<=lim;m+=p)composite[m]=1;}
 assert(n===k.length,"prime sieve short");
 const mod=x=>(x+29)%29;
 function encode(ws,seed){return ws.map(w=>{let i=0;const c=w.map(x=>(x+k[seed+i++])%29);seed+=sum(c);return c})}
 const cnt=new Float64Array(30*30*29),tot=new Float64Array(900),bi=new Float64Array(30*29),bt=new Float64Array(30),uni=new Float64Array(29);let un=0;
 for(const w of training){let a=29,b=29;for(const x of w){cnt[(a*30+b)*29+x]++;tot[a*30+b]++;bi[b*29+x]++;bt[b]++;uni[x]++;un++;a=b;b=x}}
 const score=new Float64Array(cnt.length);
 for(let a=0;a<30;a++)for(let b=0;b<30;b++)for(let x=0;x<29;x++){let p=(uni[x]+.5)/(un+14.5);p=(bi[b*29+x]+8*p)/(bt[b]+8);p=(cnt[(a*30+b)*29+x]+8*p)/(tot[a*30+b]+8);score[(a*30+b)*29+x]=Math.log(p)}
 function feasible(w,seed){return true}
 function best(w,seed){let s=0,a=29,b=29,p=[];for(let i=0;i<w.length;i++){const x=mod(w[i]-k[seed+i]);p.push(x);s+=score[(a*30+b)*29+x];a=b;b=x}return {s,p}}
 function attack(ws,split,truth=null,origin=null){let candidates=Array.from({length:maxSeed+1},(_,i)=>i),off=0,deadAt=null,curves=[],fit=null;for(let t=0;t<ws.length;t++){const w=ws[t];candidates=candidates.filter(s=>feasible(w,s+off));off+=sum(w);if(t===split-1){fit=[...candidates]}if(t===0||t===split-1||!candidates.length||t===ws.length-1)curves.push([t+1,candidates.length]);if(!candidates.length){deadAt=t+1;break}}
 const ret={words:ws.length,runes:ws.flat().length,split,curves,deadAt,fullSurvivors:candidates.length,prefixSurvivors:fit?.length??0};
 if(!fit?.length)return ret;
 let ranks=fit.map(seed=>{let s=0,off=0;for(let t=0;t<split;t++){const b=best(ws[t],seed+off);assert(b,"feasible score mismatch");s+=b.s;off+=sum(ws[t]);}return{seed,s,off}}).sort((a,b)=>b.s-a.s||a.seed-b.seed);
 const chosen=ranks[0],decoded=[];let s=0,offset=0,stop=null;
 for(let t=0;t<ws.length;t++){const b=best(ws[t],chosen.seed+offset);if(!b){stop=t;break}decoded.push(b.p);if(t>=split)s+=b.s;offset+=sum(ws[t]);}
 assert(eq(encode(decoded,chosen.seed).flat(),ws.slice(0,decoded.length).flat()),"replay mismatch");
 Object.assign(ret,{seed:chosen.seed,devScore:chosen.s/ws.slice(0,split).flat().length,holdoutScore:stop===null?s/ws.slice(split).flat().length:null,stop,excerpt:decoded.slice(0,14).map(w=>w.map(x=>j.translit[x]).join("")).join(" "),rankMargin:ranks[1]?chosen.s-ranks[1].s:null});
 if(truth){const actual=truth.slice(split).flat(),pred=decoded.slice(split).flat();ret.trueSeed=origin;ret.trueRank=ranks.findIndex(x=>x.seed===origin)+1;ret.heldoutExact=actual.filter((x,i)=>pred[i]===x).length;ret.heldoutTotal=actual.length;ret.fullExact=eq(decoded.flat(),truth.flat());}
 return ret;
 }
 assert(sections.flat().every(w=>w.length<30)&&ctl.flat().every(w=>w.length<30),"bitmask bound");
 const seeds=[73,168,3301];
 const positive=ctl.map((ws,i)=>({name:native.sections[controls[i]].name,...attack(encode(ws,seeds[i]),Math.floor(ws.length*.6),ws,seeds[i])}));
 const original=sections.map((ws,i)=>({section:i+1,...attack(ws,Math.floor(ws.length*.6))}));
 return{model:"Cumulative previous ciphertext GP-prime word sums; p56 prime-minus-one within word, ordinary consuming F",maxSeed,needed,positive,original};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const s=paths.map(p=>fs.readFileSync(p,"utf8"));console.log(JSON.stringify(experiment(JSON.parse(s[0]),s[1],JSON.parse(s[2])),null,2));
