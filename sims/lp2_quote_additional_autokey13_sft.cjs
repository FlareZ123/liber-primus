'use strict';
// #2618. Reuse the exact #2605 fixed source manifest, body parser and placement geometry.
const {MANIFEST,parse}=require("./lp2_quote_joint_additional_sources_sft.cjs");
const N=160,Q=13,SPLIT=80;
const mod=x=>(x%29+29)%29;
const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
/** @param {number[]} P @param {number[]} K */
function encrypt(P,K){
  const queue=K.slice();
  let j=0;
  return P.map(p=>{if(p===0)return 0;const c=mod(p+queue[j]);queue[j]=p;j=(j+1)%Q;return c;});
}
/** @param {number[]} C @param {{name:string,start:number,P:number[]}[]} all */
function scan(C,all){
  const out=[];let fCompatible=0,firstQueueMismatch=0;
  for(const c of all){
    if(c.P.slice(0,SPLIT).some((p,i)=>p===0&&C[i]!==0))continue;
    fCompatible++;
    const active=[],K=[];
    let ok=true;
    for(let i=0;i<SPLIT;i++){
      const p=c.P[i];if(p===0)continue;
      const j=active.length;
      if(j<Q)K.push(mod(C[i]-p));
      else if(C[i]!==mod(p+active[j-Q])){ok=false;firstQueueMismatch++;break;}
      active.push(p);
    }
    if(!ok||K.length!==Q)continue;
    out.push({name:c.name,start:c.start,K,full:encrypt(c.P,K)});
  }
  const distinct=[...new Map(out.map(o=>[o.name+":"+o.start+":"+o.full.join(","),o])).values()];
  return {fCompatible,firstQueueMismatch,prefixCandidates:out.length,distinctPredictions:distinct.length,selected:distinct.length===1?distinct[0]:null};
}
function rng(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;}}
/** Generate disjoint new donor windows, avoiding previous #2605 control starts. */
function plants(sources,previous){
  const names=["The Time Machine","The Book of Tea","Beowulf Old English"],r=rng(0x2618a005),out=[];
  for(const name of names){
    const s=sources.find(x=>x.name===name);assert(s,name);
    for(let h=0;h<2;h++){
      const opt=s.candidates.filter(c=>c.start>=Math.floor(h*s.runes/2)+N&&c.start+N<Math.floor((h+1)*s.runes/2)&&previous.filter(x=>x.name===name).every(x=>Math.abs(c.start-x.start)>=N));
      assert(opt.length,"fresh disjoint control "+name);
      const c=opt[r()%opt.length],K=Array.from({length:Q},()=>r()%29),C=encrypt(c.P,K);
      const pad=c.P.map(p=>p===0?0:mod(p+r()%29));
      out.push({name,start:c.start,K,C,pad});
    }
  }
  return out;
}
function evaluate(sources,cases){
  const all=sources.flatMap(s=>s.candidates);
  return {total:all.length,controls:cases.map(c=>scan(c.C.slice(0,SPLIT),all)),nulls:cases.map(c=>scan(c.pad.slice(0,SPLIT),all))};
}
function gate(results,cases){
  return cases.map((c,i)=>{
    const hits=results.flatMap(x=>x.controls[i].selected?[x.controls[i].selected]:[]);
    const n=results.reduce((s,x)=>s+x.controls[i].prefixCandidates,0);
    const nulls=results.reduce((s,x)=>s+x.nulls[i].prefixCandidates,0);
    const h=hits[0];
    return {name:c.name,start:c.start,prefixCandidates:n,nullCandidates:nulls,correct:n===1&&hits.length===1&&h.name===c.name&&h.start===c.start&&h.K.join()===c.K.join()&&h.full.slice(SPLIT).join()===c.C.slice(SPLIT).join()};
  });
}
function original(sources,gp){
  const U=gp.pages.filter(p=>p.page<=55).sort((a,b)=>a.page-b.page).flatMap(p=>p.indices);
  assert(U.length===12956,"source rune count");
  const C=U.slice(10279,10439),res=scan(C.slice(0,SPLIT),sources.flatMap(s=>s.candidates));
  return {...res,continuationExact:!!res.selected&&res.selected.full.slice(SPLIT).join()===C.slice(SPLIT).join()};
}
module.exports={encrypt,scan,plants,evaluate,gate,original};
if(require.main===module){
 const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),root=path.resolve(__dirname,"..");
 const folder=process.argv[2];assert(folder,"supply pinned source folder");
 const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
 const gp=read("resources/liber-primus/lp2-corpus.json"),oe=read("resources/control/beowulf_oe_gp_profile_corrected.json");
 const previous=read("im-results/lp2-quote-joint-additional-controls.json");
 const sources=MANIFEST.map(m=>{const raw=fs.readFileSync(path.join(folder,path.basename(m.file)));assert(crypto.createHash("sha1").update("blob "+raw.length+"\0").update(raw).digest("hex")===m.sha,m.name+" source drift");return parse(raw.toString("utf8"),m,gp,oe)});
 const cases=plants(sources,previous),results=[evaluate(sources,cases)],calibration=gate(results,cases);
 assert(calibration.every(x=>x.correct&&x.nullCandidates===0),"control gate failed");
 console.log(JSON.stringify({calibration,original:process.argv.includes("--original")?original(sources,gp):null},null,2));
}
