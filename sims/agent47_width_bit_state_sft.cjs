"use strict";
const fs=require("node:fs");const path=require("node:path");
function experiment(C,src,N){
 const q=29,mod=x=>(x%q+q)%q,cls=C.translit.map(x=>x.length===2?1:0),width=cls.reduce((a,b)=>a+b,0),S=2*q;
 if(width!==7||C.runes.join()!==N.runes.join())throw Error("chart");
 const forward=(s,u,p)=>{const k=mod(s+width*u);return {c:mod(p+k),s:k,u:u^cls[p]}};
 const backward=(s,u,c)=>{const p=mod(c-s),prevU=u^cls[p];return {p,s:mod(s-width*prevU),u:prevU}};
 const transition=(s,u,c)=>{const k=mod(s+width*u),p=mod(c-k);return {p,s:k,u:u^cls[p]}};
 const domain=new Set(),perC=Array.from({length:q},()=>new Set());let checked=0;
 for(let s=0;s<q;s++)for(let u=0;u<2;u++)for(let p=0;p<q;p++){
   const y=forward(s,u,p),z=backward(y.s,y.u,y.c),d=transition(s,u,y.c);
   if(z.p!==p||z.s!==s||z.u!==u||d.p!==p||d.s!==y.s||d.u!==y.u)throw Error("inverse");
   domain.add(y.c*S+y.s*2+y.u);perC[y.c].add(y.s*2+y.u);checked++;
 }
 if(domain.size!==checked||perC.some(x=>x.size!==S))throw Error("bijection");
 let twoSymbolDistinct=0;for(let a=0;a<q;a++)for(let b=0;b<q;b++){const seen=new Set();for(let s=0;s<q;s++)for(let u=0;u<2;u++){const x=transition(s,u,a),y=transition(x.s,x.u,b);seen.add(x.p*q+y.p)}if(seen.size!==S)throw Error("two-symbol ambiguity");twoSymbolDistinct++}
 function encode(P,seed){let s=seed>>1,u=seed&1;return P.map(p=>{const x=forward(s,u,p);s=x.s;u=x.u;return x.c})}
 function decode(c,seed){let s=seed>>1,u=seed&1;return c.map(v=>{const x=transition(s,u,v);s=x.s;u=x.u;return x.p})}
 const lookup=new Map(C.runes.map((r,i)=>[r,i]));
 function parse(text,wrap){
   const words=[];let w=[];let pos=0;
   for(const ch of text){if(lookup.has(ch)){w.push({i:pos++,v:lookup.get(ch)});}else if((!wrap||ch!=="%"&&ch!=="/"&&!/\s/u.test(ch))&&w.length){words.push(w);w=[]}}
   if(w.length)words.push(w);
   return {v:words.flat().map(x=>x.v),singles:words.filter(w=>w.length===1).map(w=>w[0].i)};
 }
 function solve(c,sites,allowed){const survivors=[];for(let seed=0;seed<S;seed++){const p=decode(c,seed);if(sites.every(i=>allowed.includes(p[i])))survivors.push(seed)}return survivors}
 const native=N.sections.map(s=>({name:s.name,...parse(s.source_text,false)}));
 const allowed=[24,10,3],control=[];
 for(const n of native){
   const nativeSingletons=n.singles.map(i=>n.v[i]);
   if(nativeSingletons.some(x=>!allowed.includes(x))){control.push({name:n.name,n:n.v.length,singletons:nativeSingletons,excluded:"non-A/I/O singleton"});continue}
   let unique=0,actualSurvived=0,exactTwoAnchors=0,wrongLawFeasible=0;
   for(let seed=0;seed<S;seed++){const c=encode(n.v,seed),p=decode(c,seed);if(p.join()!==n.v.join())throw Error("native roundtrip");
     const hit=solve(c,n.singles,allowed);if(hit.includes(seed))actualSurvived++;if(hit.length===1&&hit[0]===seed)unique++;
     const a=Array.from({length:S},(_,i)=>i).filter(i=>{const z=decode(c.slice(0,2),i);return z.join()===n.v.slice(0,2).join()});if(a.length===1&&a[0]===seed)exactTwoAnchors++;
     const wrong=n.v.map((p,i)=>mod(p+seed+3*i+i*i));if(solve(wrong,n.singles,allowed).length)wrongLawFeasible++;
   }
   control.push({name:n.name,n:n.v.length,singletons:nativeSingletons.length,plants:S,unique,actualSurvived,exactTwoAnchors,wrongLawFeasible});
 }
 const original=parse(src.split("%").slice(0,55).join("%"),true),pages=C.pages.filter(p=>p.page<=55);
 if(original.v.join()!==pages.flatMap(p=>p.indices).join()||original.singles.length!==83)throw Error("source");
 const starts=[0,3,8,15,23,27,33,40,54,56].map(p=>pages.filter(x=>x.page<p).reduce((a,x)=>a+x.indices.length,0)),result=[];
 for(const allow of [[24,10],[24,10,3]]){
   const all=solve(original.v,original.singles,allow),chapters=[];
   for(let i=0;i<starts.length-1;i++){const l=starts[i],h=starts[i+1],s=original.singles.filter(x=>x>=l&&x<h).map(x=>x-l);chapters.push({n:h-l,sites:s.length,seeds:solve(original.v.slice(l,h),s,allow)})}
   result.push({allow,all,chapters});
 }
 const terminal=original.v.slice(starts[8],starts[9]),seed=result[0].chapters[8].seeds[0],p=decode(terminal,seed);const frame=src.split('%').slice(53,55).join('%');let z=0;const decoded=Array.from(frame,ch=>lookup.has(ch)?C.runes[p[z++]]:ch).join('');if(z!==terminal.length)throw Error('terminal frame');const lex=new Set(N.sections.flatMap(n=>n.source_text.split(/[^\u16A0-\u16FF]+/u).filter(w=>w.length>=3)));const terminalWords=decoded.replace(/[%/\s]/gu,'').split(/[^\u16A0-\u16FF]+/u).filter(x=>x.length>=3),matched=terminalWords.filter(w=>lex.has(w));const terminalHoldout={seed,eligibleWords:terminalWords.length,matchedWords:matched.length,matchedRunes:matched.reduce((a,w)=>a+w.length,0),eligibleRunes:terminalWords.reduce((a,w)=>a+w.length,0),prefix:p.slice(0,60).map(x=>C.translit[x]).join('')};return {terminalHoldout,width,states:S,domain:checked,distinctJointOutputs:domain.size,perCipherSymbolStates:perC[0].size,twoSymbolInputs:twoSymbolDistinct,distinctPlaintextsPerTwoCipherSymbols:S,control,original:result};
}
if(require.main===module){const root=path.join(__dirname,"../resources");console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync(path.join(root,"liber-primus/lp2-corpus.json"),"utf8")),fs.readFileSync(path.join(root,"liber-primus/lp2-transcription.txt"),"utf8"),JSON.parse(fs.readFileSync(path.join(root,"external/relikd-solved-gp29-native-v1.json"),"utf8"))),null,2));}
module.exports=experiment;
