"use strict";
/**
 * Exact finite-lexicon word-preserving mod36 receiver under literal terminal red8.
 * Complete words, including p54->p55 carry, remain separate after hidden emissions.
 * Free arbitrary silent-only input between words relaxes the OOV count.
 * No beam, key fitting, guessed hidden cap, or source key selection claim.
 * Run: node sims/lp2_red8_silent_preserved_word_inverse.cjs
 */
function experiment(gp,transcription,raw){
  const key=gp.pages[54].indices.slice(1,9),q=key.length,M=36,NS=q*37,
    enc=x=>String.fromCharCode(65+x),tokens=[...gp.translit].sort((a,b)=>b.length-a.length);
  if(key.join(",")!=="19,21,23,27,2,14,10,19")throw Error("red8 drift");
  function norm(w){
    w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
    const a=[];
    for(let i=0;i<w.length;){
      const x=w.startsWith("ING",i)?"ING":w.startsWith("IO",i)?"IO":tokens.find(x=>w.startsWith(x,i));
      if(!x)throw Error("unmapped word "+w);
      a.push(x==="ING"?21:x==="IO"?27:gp.translit.indexOf(x));i+=x.length;
    }
    return a;
  }
  const donors=Object.values(raw).map(x=>(x.toUpperCase().match(/[A-Z]+/g)||[]).map(norm));
  const lex=new Set();
  for(const D of donors)for(const w of D)lex.add(w.map(enc).join(""));
  const words=[...lex].map(s=>[...s].map(c=>c.charCodeAt(0)-65));
  // State is (next key phase, previous accepted mod36 output or initial -1).
  const step=Array.from({length:NS},(_,s)=>Array.from({length:29},(_,p)=>{
    let j=Math.floor(s/37),prev=s%37-1;
    for(let z=0;z<=q;z++){
      const c=(p+key[j])%M;j=(j+1)%q;
      if(c!==prev)return {s:j*37+c+1,c};
    }
    throw Error("no accept in key period");
  }));
  function forward(P,s){
    let out="";
    for(const p of P){const z=step[s][p];s=z.s;if(z.c<29)out+=enc(z.c);}
    return [out,s];
  }
  const set=new Set(gp.runes);let n=0,str="";
  for(const c of transcription){
    if(set.has(c)){if(n===12956)break;n++;str+=c;}
    else if(!"/%\r\n \t".includes(c))str+="-";
  }
  let pos=0;const original=[];
  for(const w of str.split(/-+/).filter(Boolean)){
    if(pos>=12657)original.push([...w].map(c=>enc(gp.runes.indexOf(c))).join(""));
    pos+=w.length;
  }
  if(n!==12956||original.length!==64||original.reduce((s,w)=>s+w.length,0)!==299)throw Error("terminal source drift");
  // Positive calibration: entire Gibran passage in this finite donor lexicon.
  let s=0;const plant=[];
  for(const p of donors[1].slice(5000,5064)){
    const [v,e]=forward(p,s);s=e;if(v)plant.push(v);
  }
  const targets=new Set([...original,...plant,""]),by=Array.from({length:NS},()=>new Map());
  for(let s=0;s<NS;s++)for(const w of words){
    const [out,e]=forward(w,s);if(!targets.has(out))continue;
    let a=by[s].get(out);if(!a){a=new Set();by[s].set(out,a);}a.add(e);
  }
  const inf=1e6;
  // Allow arbitrary hidden-only source strings for free, a relaxation.
  function close(cost){
    cost=cost.slice();let changed=true;
    while(changed){
      changed=false;
      for(let s=0;s<NS;s++)if(cost[s]<inf)for(const z of step[s])
        if(z.c>=29&&cost[z.s]>cost[s]){cost[z.s]=cost[s];changed=true;}
    }
    return cost;
  }
  // Reach all endpoints of an arbitrary nonempty source word, exactly
  // matching its nonempty observed word; no source-length cap.
  function arbitrary(cost,v){
    let a=close(cost);
    for(const c of v){
      const r=c.charCodeAt(0)-65,b=Array(NS).fill(inf);
      for(let s=0;s<NS;s++)if(a[s]<inf)for(const z of step[s])
        if(z.c===r&&b[z.s]>a[s])b[z.s]=a[s];
      a=close(b);
    }
    return a;
  }
  function solve(tape){
    let a=Array(NS).fill(inf);a[0]=0;
    const trace=[],support=[];
    for(const v of tape){
      a=close(a);
      const b=arbitrary(a,v).map(x=>Math.min(x+1,inf));
      let count=0;
      for(let s=0;s<NS;s++){
        const matches=by[s].get(v);
        if(matches){
          count+=matches.size;
          for(const e of matches)if(b[e]>a[s])b[e]=a[s];
        }
      }
      a=b;trace.push(Math.min(...a));support.push(count);
    }
    return {minOOV:Math.min(...a),trace,support,
      unsupported:support.map((v,i)=>v===0?i+1:0).filter(Boolean)};
  }
  return {key,lex:words.length,originalGroups:original.length,plantGroups:plant.length,
    original:solve(original),plant:solve(plant)};
}
module.exports={experiment};
if(require.main===module){
  const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
  console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/transcriptions/lp2-image-corrected.txt"),{
    Shakespeare:read("resources/control/shakespeare_first300k.txt"),
    Gibran:read("resources/control/gibran_prophet_58585.txt"),
    Emerson:read("resources/control/emerson_essays_2944.txt")}),null,2));
}
