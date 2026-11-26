"use strict";
/** Exact native-F-hold terminal affine action inverse, both composition orders and all pairs/IVs. */
const fs=require("node:fs"),path=require("node:path");const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function study(g,native,lex,terminal,sources){
 const mod=x=>((x%29)+29)%29, cls=Uint8Array.from({length:29},(_,i)=>[1,3,10,12,18,22,24,25,26,27,28].includes(i)?0:1);
 const alphabet=new Map(g.translit.map((s,i)=>[s,i])),ids=new Map(g.runes.map((s,i)=>[s,i])),tokens=g.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),normalize=w=>w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
 const sig=p=>String.fromCharCode(...p), compact=p=>p.map(x=>"0123456789abcdefghijklmnopqrs"[x]).join("");
 function encode(w){w=normalize(w);const p=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){p.push(21);i+=3}else if(w.startsWith("IO",i)){p.push(27);i+=2}else{const t=tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error(w);p.push(t.i);i+=t.s.length}}return p}
 const dict=new Map();
 function add(p,label,freq){const k=sig(p),prev=dict.get(k);if(!prev||freq>prev.freq)dict.set(k,{p,label,freq})}
 function addLatin(w,freq){const s=normalize(w);function walk(i,p){if(i===s.length){add(p,w,freq);return}for(const n of [1,2,3]){const part=s.slice(i,i+n);if(part.length!==n)continue;const v=n===3?(part==="ING"?alphabet.get("NG"):undefined):alphabet.get(part);if(v!==undefined)walk(i+n,p.concat(v))}}walk(0,[]);add(encode(w),w,freq)}
 for(const line of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m)addLatin(m[1],Number(m[2]))}
 for(const w of ["A","I","O"])addLatin(w,1);
 for(const sec of native.sections)for(const w of sec.source_text.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g)||[]){const p=Array.from(w,x=>ids.get(x));if(p.some(x=>x===undefined))throw Error("unknown");add(p,"[native]",1)}
 const anchors=[...dict.values()].filter(w=>w.p.length===8);
 const A=[],B=[];for(let a=1;a<29;a++)for(let b=0;b<29;b++){A.push(a);B.push(b)}const M=A.length,ind=(a,b)=>(a-1)*29+b,ivA=A.map(a=>{for(let i=1;i<29;i++)if(mod(i*a)===1)return i});
 const dec=new Uint8Array(M*29),enc=new Uint8Array(M*29),right=new Uint16Array(M*M),left=new Uint16Array(M*M);
 for(let s=0;s<M;s++){for(let x=0;x<29;x++){dec[s*29+x]=mod(ivA[s]*(x-B[s]));enc[s*29+x]=mod(A[s]*x+B[s])}for(let k=0;k<M;k++){right[s*M+k]=ind(mod(A[s]*A[k]),mod(A[s]*B[k]+B[s]));left[s*M+k]=ind(mod(A[s]*A[k]),mod(A[k]*B[s]+B[k]))}}
 const coeff=k=>k.map(i=>[A[i],B[i]]);
 const text=sources.map(([name,s])=>({name,words:(s.match(/[A-Za-z]+/g)||[]).map(w=>({w,p:encode(w)}))}));
 const ref=text[1].words.flatMap(w=>w.p),uni=new Uint32Array(29),bi=new Uint32Array(841),tri=new Uint32Array(24389);
 for(let i=0;i<ref.length;i++){uni[ref[i]]++;if(i)bi[ref[i-1]*29+ref[i]]++;if(i>1)tri[(ref[i-2]*29+ref[i-1])*29+ref[i]]++}
 const score=new Float64Array(24389);for(let x=0;x<29;x++)for(let y=0;y<29;y++)for(let z=0;z<29;z++){const pu=(uni[z]+1)/(ref.length+29),pb=(bi[y*29+z]+20*pu)/(uni[y]+20);score[(x*29+y)*29+z]=Math.log((tri[(x*29+y)*29+z]+20*pb)/(bi[x*29+y]+20))}
 const trig=p=>{let v=0;for(let i=2;i<p.length;i++)v+=score[(p[i-2]*29+p[i-1])*29+p[i]];return v};
 function encrypt(p,k,next,state=k[2]){const c=[];for(const x of p){if(x===0)c.push(0);else{c.push(enc[state*29+x]);state=next[state*M+k[cls[x]]]}}return {c,state}}
 function infer(c,side){
   const next=side==="right"?right:left,found=new Map();let nodes=0,compatible=0,leaves=0,firstUse=0,known=0;
   for(const w of anchors){
    const P=w.p;if(P.some((p,i)=>p===0&&c[i]!==0))continue;compatible++;
    const p=[],C=[];for(let i=0;i<P.length;i++)if(P[i]!==0){p.push(P[i]);C.push(c[i])}
    if(!p.length)throw Error("all-F anchor not supported");
    function add(u,v,iv){const id=(u*M+v)*M+iv;if(found.has(id))return;const key=[u,v,iv];if(sig(encrypt(P,key,next).c)!==sig(c))throw Error("bad inferred key");found.set(id,{key,first:w.label})}
    function dfs(i,s,u,v,iv){nodes++;if(i===p.length-1){leaves++;if(u>=0&&v>=0)add(u,v,iv);else if(u<0&&v<0){for(let a=0;a<M;a++)for(let b=0;b<M;b++)add(a,b,iv)}else for(let k=0;k<M;k++)if(u<0)add(k,v,iv);else add(u,k,iv);return}
      const j=cls[p[i]],k=j?v:u,y=p[i+1],c=C[i+1];
      if(k>=0){known++;const ns=next[s*M+k];if(enc[ns*29+y]===c)dfs(i+1,ns,u,v,iv);return}
      const target=side==="right"?dec[s*29+c]:c,operand=side==="right"?y:enc[s*29+y];
      for(let a=1;a<29;a++){firstUse++;const k=ind(a,mod(target-a*operand)),ns=next[s*M+k];if(j)dfs(i+1,ns,u,k,iv);else dfs(i+1,ns,k,v,iv)}
    }
    for(let a=1;a<29;a++){const iv=ind(a,mod(C[0]-a*p[0]));dfs(0,iv,-1,-1,iv)}
   }
   return {keys:[...found.values()],nodes,compatible,leaves,firstUse,known}
 }
 // Exact enumeration of both F interpretations; no limit on valid paths. OOV pruning is monotone.
 function decodeGroups(groups,key,next,start,maxOov){
   let paths=[{state:start,p:[],words:[],oov:0,holds:0}],branches=0;
   for(const c of groups){
     const out=[];
     for(const base of paths){
       function walk(i,state,p,holds){
         if(i===c.length){const hit=dict.get(sig(p)),oov=base.oov+Number(!hit);if(oov<=maxOov)out.push({state,p:base.p.concat(p),words:base.words.concat(hit?hit.label:"?"+compact(p)),oov,holds:base.holds+holds});return}
         const x=c[i],z=dec[state*29+x];
         if(x===0){branches++;walk(i+1,state,p.concat(0),holds+1)}
         if(z!==0)walk(i+1,next[state*M+key[cls[z]]],p.concat(z),holds)
       }
       walk(0,base.state,[],0)
     }
     paths=out;if(!paths.length)break;
   }
   return {paths,branches}
 }
 function solve(groups,trainN,side,truth){
   const next=side==="right"?right:left,inf=infer(groups[0],side),train=groups.slice(0,trainN),hold=groups.slice(trainN),trainCipher=train.flat(),holdCipher=hold.flat(),out=[];let pathsCount=0,branches=0;
   for(const row of inf.keys){const q=decodeGroups(train,row.key,next,row.key[2],3);branches+=q.branches;pathsCount+=q.paths.length;for(const p of q.paths)out.push({key:row.key,...p,score:trig(p.p)})}
   out.sort((a,b)=>a.oov-b.oov||b.score-a.score||a.key.join(",").localeCompare(b.key.join(",")));
   const summarize=p=>({key:coeff(p.key),oov:p.oov,holds:p.holds,trainMean:p.score/(p.p.length-2),trainWords:p.words,trainCompact:compact(p.p)});
   let best=null;
   if(out.length){const p=out[0];if(sig(encrypt(p.p,p.key,next).c)!==sig(trainCipher))throw Error("train replay");
     const q=decodeGroups(hold,p.key,next,p.state,hold.length);q.paths.sort((a,b)=>a.oov-b.oov||trig(b.p)-trig(a.p));
     const h=q.paths[0];best={...summarize(p),holdPaths:q.paths.length,hold:h?{oov:h.oov,holds:h.holds,mean:trig(h.p)/(h.p.length-2),words:h.words,compact:compact(h.p)}:null};
     if(h&&sig(encrypt(h.p,p.key,next,p.state).c)!==sig(holdCipher))throw Error("hold replay");
     if(truth){const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);best.correctKey=eq(p.key,truth.key);best.trainExact=eq(p.p,truth.p.slice(0,trainCipher.length));best.holdExact=!!h&&eq(h.p,truth.p.slice(trainCipher.length));best.truthRetained=out.some(a=>eq(a.key,truth.key)&&eq(a.p,truth.p.slice(0,trainCipher.length)));best.correctRunes=p.p.concat(h?.p||[]).filter((x,i)=>x===truth.p[i]).length}
   }
   return {side,trainWords:trainN,trainRunes:trainCipher.length,holdWords:hold.length,holdRunes:holdCipher.length,anchorKeys:inf.keys.length,anchorNodes:inf.nodes,anchorCompatible:inf.compatible,anchorLeaves:inf.leaves,firstUse:inf.firstUse,known:inf.known,trainPaths:pathsCount,trainKeys:new Set(out.map(x=>x.key.join(","))).size,branches,best,otherCandidates:out.slice(1,11).map(summarize)}
 }
 const alphabetCompact="0123456789abcdefghijklmnopqrs",parse=s=>Array.from(s,x=>alphabetCompact.indexOf(x)),p54=terminal.p54.body_groups.slice(),p55=terminal.p55.groups.slice(),groups=p54.slice(0,-1).concat(p54.at(-1)+p55[0],p55.slice(1)).map(parse),orig=groups.flat(),expected=g.pages[54].indices.slice(9).concat(g.pages[55].indices);
 if(groups.length!==64||groups.slice(0,47).flat().length!==213||orig.length!==299||sig(orig)!==sig(expected))throw Error("terminal carry mismatch");
 const plants=[];
 for(const [n,side,off,key] of [[0,"right",10000,[ind(3,5),ind(7,11),ind(13,8)]],[2,"left",15000,[ind(2,8),ind(11,3),ind(23,14)]]]){
   const t=text[n];let pos=-1;
   for(let i=off;i+64<t.words.length;i++){const w=t.words.slice(i,i+64);if(w[0].p.length===8&&dict.has(sig(w[0].p))&&w.slice(0,47).filter(x=>!dict.has(sig(x.p))).length<=3&&w.slice(0,47).flatMap(x=>x.p).includes(0)){pos=i;break}}
   if(pos<0)throw Error("no plant");const words=t.words.slice(pos,pos+64),p=words.flatMap(x=>x.p),e=encrypt(p,key,side==="right"?right:left).c;
   let at=0;const cg=words.map(w=>{const c=e.slice(at,at+w.p.length);at+=w.p.length;return c});
   const result=solve(cg,47,side,{key,p});
   if(!result.best?.truthRetained||!result.best.correctKey||!result.best.trainExact||!result.best.holdExact)throw Error("blind plant failed "+JSON.stringify(result));
   plants.push({source:t.name,wordOffset:pos,actual:coeff(key),plainF:p.filter(x=>x===0).length,cipherF:e.filter(x=>x===0).length, ...result});
 }
 const original=["right","left"].map(side=>solve(groups,47,side,null));
 return {dictionary:dict.size,anchorForms:anchors.length,nominalKeys:M**3,originalCipher:compact(orig),originalCipherF:orig.filter(x=>x===0).length,plants,original};
}
const g=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),native=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),lex=read("resources/control/english_wordfreq_textblob.txt"),terminal=JSON.parse(read("resources/liber-primus/lp2-page-groups-54-55-derived.json"));const sources=[["Shakespeare","resources/control/shakespeare_first300k.txt"],["Gibran","resources/control/gibran_prophet_58585.txt"],["Emerson","resources/control/emerson_essays_2944.txt"]].map(([n,p])=>[n,read(p)]);console.log(JSON.stringify(study(g,native,lex,terminal,sources),null,2));
