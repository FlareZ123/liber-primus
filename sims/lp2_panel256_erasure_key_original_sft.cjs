"use strict";
/** Source-local original test: printed p49–51 panel as a repeated
 *  radix59/60 key, starting at the first post-panel rune on p51.
 *  Reuses the exact, unbounded-hidden periodic MAP solver.
 */
const fs=require("node:fs"),path=require("node:path");
const {model,decode,sender,lcs,rng}=require("./lp2_alt_periodic_exact_map_sft.cjs");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const raw={gp:read("resources/liber-primus/lp2-corpus.json"),grid:read("resources/liber-primus/lp2-grid-256.json"),gibran:read("resources/control/gibran_prophet_58585.txt"),emerson:read("resources/control/emerson_essays_2944.txt"),shakespeare:read("resources/control/shakespeare_first300k.txt")};
const grid=JSON.parse(raw.grid),tokens=grid.pages.flatMap(p=>p.tokens);
if(tokens.length!==256)throw Error("expected complete panel");
const modes=process.argv.slice(2);
for(const mode of modes.length?modes:["silent","delete"]){
 if(!["silent","delete"].includes(mode))throw Error("unknown mode "+mode);
 const m=model(raw,mode),C=m.gp.pages.slice(51,54).flatMap(p=>p.indices);
 if(C.length!==534||m.gp.pages[51].indices.length!==92)throw Error("recipient changed");
 const keys=Object.fromEntries([60,59].map(radix=>{
  const a=radix===60?grid.alphabet:grid.alphabet.replace("f","");
  return [radix,tokens.map(t=>{const hi=a.indexOf(t[0]),lo=a.indexOf(t[1]);if(hi<0||lo<0)throw Error("invalid token");return (radix*hi+lo)%m.mod;})];
 }));
 const r=rng(771921),wrong=Array.from({length:256},()=>r(m.mod));
 const out={mode,keys,wrong,originalCipher:C,split:[92,263,179]};
 for(const [radix,source,offset] of [[60,"gibran",5000],[59,"emerson",5000]]){
  const K=keys[radix],plant=sender(m.tests[source].slice(offset),K,m,C.length,19033);
  out[radix]={source,plant};
  for(const [label,c,key] of [["right",plant.C,K],["wrong",plant.C,wrong],["original",C,K]]){
   const z=decode(c,key,m);let kept=0,suffix=0;
   for(let i=0;i<z.events.length;i++){
    const e=z.events[i];if(kept>=92&&kept<534){suffix+=Math.log(i===0?m.pi[e.p]:m.B[z.events[i-1].p][e.p]);if(mode==="delete")suffix+=Math.log(e.keep?.813:.187);}
    if(e.keep)kept++;
   }
   if(!z.replay||kept!==534)throw Error("replay");
   out[radix][label]={...z,suffixScore:suffix/442,hidden:z.events.filter(e=>!e.keep).length,plaintext:z.full.map(x=>x===29?" ":m.gp.translit[x]).join(""),...(label!=="original"?{fullLCS:lcs(z.full,plant.full),retainedLCS:lcs(z.retained,plant.retained)}:{})};
  }
 }
 console.log(JSON.stringify(out));
}
