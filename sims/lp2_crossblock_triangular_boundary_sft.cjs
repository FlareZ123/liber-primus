// Agent7 #3199: bidirectionally reversible carried-register triangular block decoder.
"use strict";
function run(corpus,punct,solved,txt){
 const A=29,R=n=>Array.from({length:n},(_,i)=>i),mod=x=>(x%29+29)%29,sum=a=>a.reduce((x,y)=>x+y,0),assert=(x,m)=>{if(!x)throw Error(m)};
 const inv=R(A).map(x=>x?R(A).find(y=>mod(x*y)===1):0);
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const gp=(txt.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]).flatMap(w=>{let a=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3;}else if(w.startsWith("IO",i)){a.push(27);i+=2;}else{let t=tokens.find(t=>w.startsWith(t.s,i));assert(t,w);a.push(t.i);i+=t.s.length;}}return a;});
 const cnt=R(A).map(()=>R(A).map(()=>1));for(let i=1;i<18000;i++)cnt[gp[i-1]][gp[i]]++;
 const logT=cnt.map(r=>r.map(x=>Math.log(x/sum(r))));
 const C=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
 const ends=[0,...new Set(punct.events.filter(e=>e.rune_offset>0&&e.rune_offset<=1860).map(e=>e.rune_offset))];
 assert(ends.includes(394)&&ends.includes(729)&&ends.at(-1)===1860,"framing");const f=ends.filter(x=>x<=729),fit=394;
 const blocks=(a,e)=>e.slice(1).map((x,i)=>a.slice(e[i],x));
 function encode(P,e,k,privateStates=null){const C=[],states=[k.s],us=[];let s=k.s;for(let b=0;b<e.length-1;b++){if(privateStates)s=privateStates[b];let p=P.slice(e[b],e[b+1]),u=mod(s+k.a*p[0]),c=[mod(p[0]+u)];for(let i=1;i<p.length;i++)c.push(mod(p[i]+u*p[i-1]));C.push(...c);us.push(u);s=mod(u+k.g*sum(c));states.push(s);}return {C,states,us};}
 function decodeBlock(c,u){let p=[mod(c[0]-u)];for(let i=1;i<c.length;i++)p.push(mod(c[i]-u*p[i-1]));return p;}
 function decode(C,e,k){let s=k.s,P=[],us=[],states=[s];for(let c of blocks(C,e)){let u=mod((s+k.a*c[0])*inv[k.a+1]);P.push(...decodeBlock(c,u));us.push(u);s=mod(u+k.g*sum(c));states.push(s);}return {P,us,states};}
 function backwards(C,e,a,g,t){let s=t,P=[];const bs=blocks(C,e);for(let i=bs.length-1;i>=0;i--){let c=bs[i],u=mod(s-g*sum(c)),p=decodeBlock(c,u);P.unshift(...p);s=mod(u-a*p[0]);}return {P,s};}
 function logscore(p,lo=1,hi=p.length){let l=0;for(let i=Math.max(1,lo);i<hi;i++)l+=logT[p[i-1]][p[i]];return l;}
 function cache(C,e){return blocks(C,e).map(c=>({c0:c[0],sum:mod(sum(c)),rows:R(A).map(u=>{const p=decodeBlock(c,u);return {first:p[0],last:p.at(-1),score:logscore(p)};})}));}
 function search(C,e,fit,trueKey=null){let fe=e.filter(x=>x<=fit);assert(fe.at(-1)===fit,"fit boundary");let b=cache(C,fe),best=null,second=null,truth=null,keys=0;
 for(let a=1;a<=27;a++)for(let g=1;g<=28;g++)for(let s0=0;s0<A;s0++){let s=s0,prev=-1,v=0,us=[];for(let x of b){let u=mod((s+a*x.c0)*inv[a+1]),r=x.rows[u];v+=r.score+(prev<0?0:logT[prev][r.first]);prev=r.last;s=mod(u+g*x.sum);us.push(u);}let k={a,g,s:s0},row={k,v,us};keys++;if(trueKey&&a===trueKey.a&&g===trueKey.g&&s0===trueKey.s)truth=row;if(!best||v>best.v){second=best;best=row;}else if(!second||v>second.v)second=row;}
 let d=decode(C,e,best.k);assert(encode(d.P,e,best.k).C.every((x,i)=>x===C[i]),"replay");let trueRank=null;if(truth){let better=0,equal=0;for(let a=1;a<=27;a++)for(let g=1;g<=28;g++)for(let s0=0;s0<A;s0++){let s=s0,prev=-1,v=0;for(let x of b){let u=mod((s+a*x.c0)*inv[a+1]),r=x.rows[u];v+=r.score+(prev<0?0:logT[prev][r.first]);prev=r.last;s=mod(u+g*x.sum);}if(v>truth.v+1e-8)better++;if(Math.abs(v-truth.v)<1e-8)equal++;}trueRank={better,equal};}
 return {key:best.k,keys,fitScore:best.v/(fit-1),margin:best.v-second.v,heldScore:logscore(d.P,fit,e.at(-1))/(e.at(-1)-fit),P:d.P,us:d.us,trueRank};}
 function anchors(P,C,e,k){let p=e.slice(0,-1).map(i=>P[i]),u=e.slice(0,-1).map((i,j)=>mod(C[i]-p[j])),sums=blocks(C,e).map(c=>mod(sum(c))),eq=[];for(let j=0;j+1<u.length;j++)eq.push([p[j+1],sums[j],mod(u[j+1]-u[j])]);let triples=0;for(let j=0;j+1<eq.length;j++){let [x,y,z]=eq[j],[X,Y,Z]=eq[j+1],det=mod(x*Y-X*y);if(!det)continue;let a=mod((z*Y-Z*y)*inv[det]),g=mod((x*Z-X*z)*inv[det]);assert(a===k.a&&g===k.g,"anchor recovery");triples++;}return {consecutiveTriples:Math.max(0,eq.length-1),nondegenerate:triples};}
 function verify(P,e,k){const v=encode(P,e,k),x=decode(v.C,e,k);assert(x.P.every((p,i)=>p===P[i]),"forward");const b=backwards(v.C,e,k.a,k.g,v.states.at(-1));assert(b.s===k.s&&b.P.every((p,i)=>p===P[i]),"reverse");let initial=new Set(),messages=new Set();for(let t=0;t<A;t++){let z=backwards(v.C,e,k.a,k.g,t);initial.add(z.s);messages.add(z.P.join(","));assert(encode(z.P,e,{a:k.a,g:k.g,s:z.s}).C.every((x,i)=>x===v.C[i]),"terminal candidates");}assert(initial.size===A&&messages.size===A,"terminal bijection");return v;}
 function repeat(p){return p.slice(1).reduce((n,x,i)=>n+(x===p[i]),0);}
 function arbitraryBlockMinRepeats(P,e){let n=0;for(let p of blocks(P,e)){let m=Infinity;for(let u=0;u<A;u++){let c=[mod(p[0]+u)];for(let i=1;i<p.length;i++)c.push(mod(p[i]+u*p[i-1]));m=Math.min(m,repeat(c));}n+=m;}return n;}
 function compact(r,p=null){let o={key:r.key,keys:r.keys,fitScore:r.fitScore,margin:r.margin,heldScore:r.heldScore,trueRank:r.trueRank};if(p)o.heldHits=r.P.slice(fit).reduce((n,x,i)=>n+(x===p[fit+i]),0);return o;}
 const native=solved.sections.map(s=>({name:s.name,p:[...s.source_text].map(c=>corpus.runes.indexOf(c)).filter(x=>x>=0)})).filter(s=>s.p.length>=729);
 assert(native.length===2,"native records");const controls=[];const keys=[{a:7,g:13,s:19},{a:22,g:8,s:11}];const wrong=f.map((x,i)=>i&&i<f.length-1&&x!==fit?x+1:x);assert(wrong.every((x,i)=>!i||x>wrong[i-1]),"wrong framing");
 for(let i=0;i<native.length;i++){let p=native[i].p.slice(0,729),k=keys[i],v=verify(p,f,k),good=search(v.C,f,fit,k),bad=search(v.C,wrong,fit),priv=encode(p,f,k,R(f.length-1).map(j=>mod(11+7*j+3*j*j+i))),rival=search(priv.C,f,fit);controls.push({name:native[i].name,truth:k,repeats:repeat(v.C),arbitraryBlockMinRepeats:arbitraryBlockMinRepeats(p,f),anchors:anchors(p,v.C,f,k),good:compact(good,p),wrongBoundary:compact(bad,p),privateState:compact(rival,p)});}
 const calibrated=controls.every(x=>x.good.trueRank.better===0&&x.good.trueRank.equal===1&&x.good.heldHits===729-fit&&x.good.heldScore>x.wrongBoundary.heldScore+.4&&x.good.heldScore>x.privateState.heldScore+.4);
 let original={run:false,repeats:repeat(C.slice(0,729)),frame:ends,fit,hold:729-fit,continuation:1860-729};
 if(calibrated){let r=search(C.slice(0,1860),ends,fit),d=r.P;original={...original,run:true,key:r.key,keys:r.keys,fitScore:r.fitScore,fitMargin:r.margin,heldScore:logscore(d,fit,729)/(729-fit),continuationScore:logscore(d,729,1860)/(1860-729),candidateFirst120:d.slice(0,120).map(x=>corpus.translit[x]).join(" "),candidateHeldFirst120:d.slice(fit,fit+120).map(x=>corpus.translit[x]).join(" "),terminalStateCandidates:29};}
 return {framing:f,wrongFraming:wrong,fit,held:729-fit,keyCount:27*28*29,controls,calibrated,original};
}
module.exports={run};
if(require.main===module){const fs=require("node:fs");const read=p=>fs.readFileSync(p,"utf8");console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/liber-primus/lp2-punctuation-identity.json")),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/control/gibran_prophet_58585.txt")),null,2));}
