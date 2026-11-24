"use strict";
// Exact word-dictionary maximization for surviving GEB shifted-boundary candidates.
const run=require("./lp2_geb_shifted_boundary_periodic_anchor_sft.cjs");
function score(run,c,raw,ink,lex,wide){
 const z=run(c,raw,ink,lex,wide),map=new Map(c.runes.map((x,i)=>[x,i])),all=[],gaps=new Set([0]);let lo=0;
 for(const ch of raw){if(all.length===12956)break;if(map.has(ch))all.push(map.get(ch));else if(ch!=="/"&&ch!=="%"&&!/\s/.test(ch)&&all.length>lo){gaps.add(all.length);lo=all.length;}}
 gaps.add(all.length);
 const tokens=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),dict=new Set();
 function gp(s){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");const a=[];while(s.length){const t=tokens.find(t=>s.startsWith(t.s));if(!t)return null;a.push(t.i);s=s.slice(t.s.length);}return a;}
 for(const line of lex.split(/\r?\n/)){const m=line.match(/^([a-z]+)\s+\d+$/);if(m){const p=gp(m[1]);if(p)dict.add(p.join(","));}}
 const mod=x=>(x%29+29)%29,show=p=>p.map(v=>c.translit[v]).join("");
 const rows=[];
 for(const r of z.results){if(!r.survivors.length)continue;const [a,b]=r.shifted,[start,end]=r.interval;
  const inner=[...gaps].map(v=>v+1).filter(v=>v>start&&v<end),bounds=[start,...inner,end],chunks=bounds.slice(0,-1).map((v,i)=>[v,bounds[i+1]]);if(!chunks.some(x=>x[0]===a&&x[1]===b))throw Error("anchor shape");
  for(const w of r.survivors){
   const q=w.key.length,starts=Array.from({length:q},(_,i)=>i).filter(i=>(w.L>>i)&1);
   let dp=new Map(starts.map(s=>[s,{score:0,pt:[],labels:[],start:s}]));
   for(const [u,v] of chunks){const next=new Map(),anchor=u===a&&v===b,scored=!anchor&&u!==start&&v!==end;
    for(const [phase,old] of dp){
     if(anchor&&phase!==0)continue;
     function walk(i,s,p){if(i===v){if(anchor&&p.join(",")!==w.p.join(","))return;const hit=scored&&dict.has(p.join(","));const score=old.score+(hit?1:0),cur=next.get(s);
      if(!cur||score>cur.score)next.set(s,{score,pt:old.pt.concat(p),labels:old.labels.concat({word:show(p),hit,anchor,scored}),start:old.start});return;}
      const C=all[i];if(C===0)walk(i+1,s,p.concat(0));const x=mod(C-w.key[s]);if(x!==0)walk(i+1,(s+1)%q,p.concat(x));}
     walk(u,phase,[]);
    }dp=next;
   }
   const best=[...dp.values()].sort((a,b)=>b.score-a.score)[0];if(!best)throw Error("survivor no path");let j=best.start;
   const replay=best.pt.map(x=>x===0?0:mod(x+w.key[(j++)%q]));if(replay.join(",")!==all.slice(start,end).join(","))throw Error("replay");
   rows.push({anchor:w.w,key:w.key,eligible:chunks.length-3,score:best.score,matches:best.labels.filter(x=>x.hit).map(x=>x.word),plaintext:best.labels.map(x=>x.word).join(" "),replay:true});
  }
 }
 return {rows};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path");const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");const [a,b,c,d,e]=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/liber-primus/lp2-ink-annotations.json","resources/control/english_wordfreq_textblob.txt","resources/control/dwyl-english-alpha-gp13-14-only.txt"].map(read);console.log(JSON.stringify(score(run,JSON.parse(a),b,JSON.parse(c),d,e),null,2));}
module.exports=score;
