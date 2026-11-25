"use strict";
// Director #2787: exact alternating self-key from complete punctuation-span endpoints.
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/liber-primus/lp2-ink-annotations.json","resources/liber-primus/lp2-punctuation-identity.json","resources/external/relikd-solved-gp29-native-v1.json"];
function experiment(raw){
 const gp=JSON.parse(raw[0]),ink=JSON.parse(raw[2]),identity=JSON.parse(raw[3]),gold=JSON.parse(raw[4]),ix=new Map(gp.runes.map((r,i)=>[r,i])),C=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),mod=x=>(x%29+29)%29;
 const assert=(v,m)=>{if(!v)throw Error(m)},stream=[],cuts=[0],gaps=[];let between="";
 for(const ch of raw[1].split("%").slice(0,55).join("%")){if(ix.has(ch)){gaps.push(between);between="";stream.push(ix.get(ch))}else{between+=ch;if(ch==="."&&cuts.at(-1)!==stream.length)cuts.push(stream.length)}}
 assert(C.length===12956&&cuts.length===174&&cuts.at(-1)===C.length&&stream.join()===C.join(),"corrected source");
 let off=0,offsets=[];for(const p of gp.pages){offsets[p.page]=off;off+=p.indices.length}
 const large=new Set(ink.pages.filter(p=>p.page<=55).flatMap(p=>(p.large_punctuation||[]).map(x=>offsets[p.page]+x[0])));
 assert(large.size===29&&[...large].every(x=>cuts.includes(x)),"large-mark alignment");
 const excluded=new Set([57,58,59,60,91,125,127]),small=new Set(identity.events.filter(e=>e.symbol==="⁘"&&!excluded.has(e.index)).map(e=>e.rune_offset));
 const type=x=>x===0?"book-start":large.has(x)?"large":small.has(x)?"audited-four-dot":"other-transcribed-stop";
 const native=gold.sections.map(s=>({name:s.name,clauses:s.source_text.split(/[⁜⁘]/u).map(t=>[...t].filter(c=>ix.has(c)).map(c=>ix.get(c))).filter(p=>p.length>2)}));
 function model(exclude){const counts=Array.from({length:30},()=>Array(29).fill(.5));for(const s of native)if(s.name!==exclude)for(const p of s.clauses){let prev=29;for(const x of p){counts[prev][x]++;prev=x}}return counts.map(r=>{let z=r.reduce((s,x)=>s+x,0);return r.map(x=>Math.log(x/z))})}
 function enc(p,s){let key=[p[0],p.at(-1)],j=0;return [p[0],...p.slice(1,-1).map(x=>x===0?0:mod(x+s*key[j++%2])),p.at(-1)]}
 function edges(c,k,s,j){let e=[];if(c===0)e.push([0,j]);let p=mod(c-s*k[j]);if(p!==0)e.push([p,1-j]);return e}
 function exact(c,s,enumerate=true){let k=[c[0],c.at(-1)],m=c.length-2,front=[1n,0n],failure=null;
  for(let i=0;i<m;i++){let next=[0n,0n];for(let j=0;j<2;j++)for(const [,j2] of edges(c[i+1],k,s,j))next[j2]+=front[j];front=next;if(front[0]+front[1]===0n){failure=i+1;break}}
  let count=front[0]+front[1];if(!enumerate||count===0n)return {count:count.toString(),failure,outputs:[]};
  let ways=Array.from({length:m+1},()=>[0n,0n]);ways[m]=[1n,1n];for(let i=m-1;i>=0;i--)for(let j=0;j<2;j++)for(const [,j2] of edges(c[i+1],k,s,j))ways[i][j]+=ways[i+1][j2];
  assert(ways[0][0]===count,"forward/backward count");let outputs=[],p=[c[0]];
  function dfs(i,j){if(i===m){outputs.push(p.concat(c.at(-1)));return}for(const [x,j2] of edges(c[i+1],k,s,j))if(ways[i+1][j2]){p.push(x);dfs(i+1,j2);p.pop()}}
  dfs(0,0);assert(BigInt(outputs.length)===count&&outputs.every(p=>enc(p,s).join()===c.join()),"exact original enumeration/replay");return {count:count.toString(),failure,outputs}
 }
 function score(p,m){let prev=29,z=0;for(const x of p){z+=m[prev][x];prev=x}return z/p.length}
 function best(c,s,m){let k=[c[0],c.at(-1)],states=new Map([[c[0],{j:0,last:c[0],p:[c[0]],score:m[29][c[0]]}]]);for(let i=1;i<c.length-1;i++){let next=new Map();for(const v of states.values())for(const [x,j] of edges(c[i],k,s,v.j)){let z=v.score+m[v.last][x],id=j*29+x;if(!next.has(id)||next.get(id).score<z)next.set(id,{j,last:x,p:v.p.concat(x),score:z})}states=next;if(!states.size)return null}
 let b=null;for(const v of states.values()){let z=v.score+m[v.last][c.at(-1)];if(!b||z>b.score)b={p:v.p.concat(c.at(-1)),score:z}}return b}
 function reachable(c,s){let k=[c[0],c.at(-1)],mask=1;for(let i=1;i<c.length-1;i++){let next=c[i]===0?mask:0;for(let j=0;j<2;j++)if((mask&(1<<j))&&mod(c[i]-s*k[j])!==0)next|=1<<(1-j);mask=next;if(!mask)return false}return true}
 function fmt(p,start){return p.map((x,i)=>(i&&/[-&]/u.test(gaps[start+i])?" ":"")+gp.translit[x]).join("")}
 let seed=0x2787ab;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296}
 function shuffled(c){let a=c.slice();for(let i=a.length-2;i>1;i--){let j=1+Math.floor(rng()*i);[a[i],a[j]]=[a[j],a[i]]}return a}
 let m=model(null),rows=[],controls=[];
 for(let i=0;i+1<cuts.length;i++){let start=cuts[i],end=cuts[i+1],c=C.slice(start,end);if(c.length<=2)continue;
  let row={start,end,firstMark:type(start),lastMark:type(end),partition:end<=offsets[40]?"development":start>=offsets[40]?"holdout":"crossing",cipher:c,shell:[c[0],c.at(-1)],results:[]};
  for(let s of [1,-1]){let d=exact(c,s),out=d.outputs.map(p=>({p,text:fmt(p,start),score:score(p,m)})).sort((a,b)=>b.score-a.score);let nullReachable=0;for(let j=0;j<128;j++)nullReachable+=reachable(shuffled(c),s);row.results.push({sign:s,count:d.count,failure:d.failure,outputs:out,nullReachable,nullTotal:128})}
  rows.push(row)
 }
 for(const section of native){let m=model(section.name);for(let i=0;i<section.clauses.length;i++)for(let s of [1,-1]){let p=section.clauses[i],c=enc(p,s),d=exact(c,s,false),b=best(c,s,m);assert(d.count!=="0"&&b&&enc(b.p,s).join()===c.join(),"native path/replay");controls.push({name:section.name,clause:i,sign:s,p,c,count:d.count,best:b.p,correct:b.p.filter((x,j)=>x===p[j]).length,exact:b.p.join()===p.join()})}}
 function summary(rs,s){let ds=rs.map(x=>({row:x,d:x.results.find(v=>v.sign===s)})),ok=ds.filter(x=>x.d.count!=="0");let total=ds.reduce((n,x)=>n+x.row.cipher.length-2,0),runes=ok.reduce((n,x)=>n+x.row.cipher.length-2,0);return {clauses:ds.length,reachable:ok.length,interiorRunes:total,reachableInteriorRunes:runes,paths:ok.reduce((n,x)=>n+BigInt(x.d.count),0n).toString(),nullReachable:ds.reduce((n,x)=>n+x.d.nullReachable,0),nullTotal:ds.length*128,top:ok.filter(x=>x.row.cipher.length>=20).sort((a,b)=>b.d.outputs[0].score-a.d.outputs[0].score).slice(0,4).map(x=>({start:x.row.start,end:x.row.end,text:x.d.outputs[0].text,score:x.d.outputs[0].score})),firstFailure:ds.filter(x=>x.d.count==="0").slice(0,3).map(x=>[x.row.start,x.d.failure])}}
 const summaries=[];for(const s of [1,-1])for(const [label,rs] of [["all",rows],["development",rows.filter(x=>x.partition==="development")],["holdout",rows.filter(x=>x.partition==="holdout")],["crossing",rows.filter(x=>x.partition==="crossing")],["audited-small-to-small",rows.filter(x=>x.firstMark==="audited-four-dot"&&x.lastMark==="audited-four-dot")]])summaries.push({sign:s,label,...summary(rs,s)});
 const controlSummary=[1,-1].map(s=>{let a=controls.filter(x=>x.sign===s);return {sign:s,clauses:a.length,exact:a.filter(x=>x.exact).length,runes:a.reduce((n,x)=>n+x.p.length,0),correct:a.reduce((n,x)=>n+x.correct,0),allReachable:a.every(x=>x.count!=="0")}});
 return {rule:"Each complete corrected punctuation span; preserve endpoints; phase-zero alternating GP29 key; C=P+sign*K mod29, F transparent/holds; no reset at page turns",source:{runes:C.length,correctedDelimiters:cuts.length-1,largeUnique:large.size,auditedFourDotOffsets:small.size,correctedAuditedFourDotOffsets:cuts.filter(x=>small.has(x)).length,holdoutOffset:offsets[40]},seed:"0x2787ab",summaries,controlSummary,rows,controls};
}
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
module.exports={experiment};
