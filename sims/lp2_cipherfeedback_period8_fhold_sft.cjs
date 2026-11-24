"use strict";
// Director #2550: exact public difference, original F flag, independent lexical anchors.
function experiment(inputs){
 const [ct,tx,lex,native,gibran,shakespeare]=inputs,gp=JSON.parse(ct),sources=JSON.parse(native).sections,rm=new Map(gp.runes.map((r,i)=>[r,i])),am=new Map(gp.translit.map((r,i)=>[r,i]));
 const mod=x=>(x%29+29)%29,phase=x=>(x%8+8)%8,full=(1<<29)-1,one=[24,10,3];
 const parse=s=>(s.replace(/[\s/%'’]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,r=>rm.get(r)));
 const words=parse(tx).slice(0,2896),all=words.flat();if(String(all)!==String(gp.pages.slice(0,56).flatMap(p=>p.indices)))throw Error("source mismatch");
 const solved=sources.map(s=>parse(s.source_text));
 function dictFor(excluded){const d=Array.from({length:32},()=>new Map());const add=w=>{if(w.length&&w.length<32)d[w.length].set(String(w),w)};
 function variants(w){const s=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/['’]/g,"");function walk(i,a){if(i===s.length){add(a);return}for(const n of [1,2,3]){const t=s.slice(i,i+n);if(t.length!==n)continue;const v=n===3?(t==="ING"?am.get("NG"):undefined):t==="IO"?am.get("IA"):am.get(t);if(v!==undefined)walk(i+n,[...a,v])}}walk(0,[])}
 for(const l of lex.split(/\r?\n/)){const m=l.match(/^([a-z']+)\s+\d+$/);if(m&&m[1].length>=2)variants(m[1])}for(const w of ["A","I","O"])variants(w);
 for(const [i,sec] of solved.entries())if(i!==excluded)for(const w of sec)add(w);
 for(const w of (gibran+"\n"+shakespeare).match(/[a-zA-Z]+(?:['’][a-zA-Z]+)*/g)||[])variants(w);
 return d}
 /** @param {number[][]} ws @param {number[]} key @param {number} prev */
 function encode(ws,key,prev=0){let j=0;return ws.map(w=>w.map(p=>{const c=p===0?0:mod(p+key[j++%8]+prev);prev=c;return c}))}
 function pack(ws,prev=0){return ws.map(w=>w.map(c=>{const v={c,d:mod(c-prev)};prev=c;return v}))}
 function gate(ws,prev){const packed=pack(ws,prev).flatMap(w=>w.map(x=>({...x,single:w.length===1})));let s=0,fail=[];while(s<packed.length){if(packed[s].c===0){s++;continue}let e=s;const k=Array(8).fill(full);while(e<packed.length&&packed[e].c!==0){const {d,single}=packed[e];k[(e-s)%8]&=single?one.reduce((a,p)=>a|(1<<mod(d-p)),0):full^(1<<d);if(!k[(e-s)%8]){const slot=(e-s)%8;fail.push({from:s,to:e,slot,constraints:packed.slice(s,e+1).flatMap((x,i)=>i%8===slot?[{i:s+i,...x}]:[])});break}e++}while(e<packed.length&&packed[e].c!==0)e++;s=e+1}return fail}
 function cut(ws){let i=0,n=0,target=Math.ceil(ws.flat().length/2);while(n<target)n+=ws[i++].length;return {i,n}}
 function anchorsFor(ws,dict,prev){const packed=pack(ws,prev),anchors=[];let offset=0,zeros=0;
 for(let i=0;i<ws.length;i++){const c=packed[i];if(c.length>=8){const maps=new Map;for(const p of (dict[c.length]||new Map).values()){let j=0,legal=true;const k=Array(8).fill(-1);for(let t=0;t<c.length;t++){if(p[t]===0){if(c[t].c!==0){legal=false;break}}else{const d=mod(c[t].d-p[t]),slot=j++%8;if(k[slot]>=0&&k[slot]!==d){legal=false;break}k[slot]=d}}if(!legal)continue;
 for(let h=0;h<=Math.min(zeros,7);h++){const start=phase(offset-h),r=Array(8).fill(-1);for(let z=0;z<8;z++)r[(start+z)%8]=k[z];maps.set(String(r),r)}}
 const groups=new Map;for(const r of maps.values()){const m=r.reduce((m,v,j)=>v>=0?m|(1<<j):m,0);if(!groups.has(m))groups.set(m,[]);groups.get(m).push(r)}
 anchors.push({i,len:c.length,maps:[...maps.values()],groups})}offset+=c.length;zeros+=c.filter(x=>x.c===0).length}
 return anchors.sort((a,b)=>a.maps.length-b.maps.length||a.i-b.i)}
 function graph(anchors){const mandatory=anchors.flatMap((a,i)=>a.maps.length?[]:[i]),edges=[];
 function compatible(a,b){for(const [ma,as] of a.groups)for(const [mb,bs] of b.groups){const m=ma&mb;if(!m)return true;const sig=r=>r.filter((_,i)=>(m>>i)&1).join(",");const set=new Set(as.map(sig));if(bs.some(r=>set.has(sig(r))))return true}return false}
 for(let i=0;i<anchors.length;i++)for(let j=i+1;j<anchors.length;j++)if(anchors[i].maps.length&&anchors[j].maps.length&&!compatible(anchors[i],anchors[j]))edges.push([i,j]);
 let best=anchors.length,covers=[];function dfs(es,chosen){if(chosen.size>best)return;if(!es.length){if(chosen.size<best){best=chosen.size;covers=[]}covers.push([...chosen].sort((a,b)=>a-b));return}const [u,v]=es[0];for(const x of [u,v])dfs(es.filter(e=>!e.includes(x)),new Set([...chosen,x]))}dfs(edges,new Set(mandatory));const unique=[...new Map(covers.map(x=>[String(x),x])).values()];
 return {mandatory:mandatory.map(i=>anchors[i].i),edges:edges.map(e=>e.map(i=>anchors[i].i)),minimumOOV:best,covers:unique}}
 function join(anchors,skip,cap=150000){let active=[Array(8).fill(-1)],history=[];for(let i=0;i<anchors.length;i++){if(skip.includes(i))continue;const a=anchors[i],next=new Map();for(const x of active)for(const y of a.maps){if(x.some((v,j)=>v>=0&&y[j]>=0&&v!==y[j]))continue;const k=x.map((v,j)=>v>=0?v:y[j]);next.set(String(k),k);if(next.size>cap)return {overflow:true,keys:[],history}}
 active=[...next.values()];history.push({word:a.i,maps:a.maps.length,surviving:active.length});if(!active.length)break}return {overflow:false,keys:active,history}}
 /** Exact fixed-key DP; preserve every possible end phase, maximize lexical rune count within phase. */
 function decode(ws,key,dict,initial,prev){let states=new Map([[initial,{score:0,paths:1,history:[]}]]);for(const c of pack(ws,prev)){const next=new Map;for(const [ph,h] of states){const p=[];function walk(i,j){if(i===c.length){const known=dict[p.length]?.has(String(p)),score=h.score+(known?p.length:0),old=next.get(j);if(!old||score>old.score)next.set(j,{score,paths:h.paths,history:h.history.concat([p.slice()])});else if(score===old.score)old.paths=Math.min(2,old.paths+h.paths);return}if(c[i].c===0){p.push(0);walk(i+1,j);p.pop()}const v=mod(c[i].d-key[j]);if(v!==0){p.push(v);walk(i+1,(j+1)%8);p.pop()}}walk(0,ph)}states=next;if(!states.size)return []}return [...states].map(([end,s])=>({end,...s}))}
 function test(ws,dict,prev,truth=null,keyTruth=null){const {i,n}=cut(ws),prefix=ws.slice(0,i),held=ws.slice(i),anchors=anchorsFor(prefix,dict,prev),g=graph(anchors),strict=join(anchors,[]);let candidates=[],recovered=new Map,searches=[];
 // Minimum graph-cover omissions are a calibrated relaxation; do not search extra omissions.
 if(g.minimumOOV<=2)for(const cover of g.covers){const r=join(anchors,cover);searches.push({omit:cover.map(i=>anchors[i].i),history:r.history,overflow:r.overflow,keys:r.keys.length,partial:r.keys.filter(k=>k.includes(-1)).length});if(!r.overflow)for(const k of r.keys)if(!k.includes(-1))recovered.set(String(k),k)}
 let train=[];for(const key of recovered.values())for(const d of decode(prefix,key,dict,0,prev))train.push({key,d});
 const bestTrain=train.length?Math.max(...train.map(x=>x.d.score)):null;
 for(const {key,d} of train.filter(x=>x.d.score===bestTrain)){const tail=decode(held,key,dict,d.end,prefix.at(-1).at(-1));if(!tail.length){candidates.push({key,phase:d.end,trainScore:d.score,holdImpossible:true});continue}const best=Math.max(...tail.map(t=>t.score));for(const t of tail.filter(t=>t.score===best)){const replay=String(encode(d.history.concat(t.history),key,prev).flat())===String(ws.flat());if(!replay)throw Error("replay");candidates.push({key,phase:d.end,trainScore:d.score,trainPaths:d.paths,holdScore:t.score,holdPaths:t.paths,replay,exactKey:truth?String(key)===String(keyTruth):null,holdExact:truth?String(t.history.flat())===String(truth.slice(i).flat()):null,holdMatches:truth?t.history.flat().filter((v,k)=>v===truth.slice(i).flat()[k]).length:null,text:t.history.map(w=>w.map(v=>gp.translit[v]).join("")).join(" ").slice(0,200)})}}
 return {runes:ws.flat().length,trainWords:i,trainRunes:n,heldRunes:held.flat().length,vocab:dict.reduce((a,b)=>a+b.size,0),truthTrainOOV:truth?truth.slice(0,i).flatMap((w,k)=>dict[w.length].has(String(w))?[]:[{k,len:w.length}]):null,anchors:anchors.map(a=>({word:a.i,len:a.len,maps:a.maps.length})),strict:{keys:strict.keys.length,history:strict.history,overflow:strict.overflow},graph:{...g,covers:g.covers.map(c=>c.map(i=>anchors[i].i))},searches,recoveredKeys:recovered.size,trainFeasible:train.length,bestTrain,candidates}}
 const edges=[0,3,8,15,23,27,33,40,54,56],offs=[0];for(const p of gp.pages)offs.push(offs.at(-1)+p.indices.length);
 const sections=edges.slice(0,-1).map((p,z)=>{let o=0;const a=offs[p],b=offs[edges[z+1]],ws=words.filter(w=>{const q=o;o+=w.length;return q>=a&&o<=b});return {pages:[p,edges[z+1]-1],ws,prev:a?all[a-1]:0}});
 const gates=sections.map(s=>({pages:s.pages,runes:s.ws.flat().length,contradictions:gate(s.ws,s.prev)}));
 const controls=[];for(const [sec,key] of [[1,[23,10,1,10,9,10,16,26]],[3,[7,18,2,24,10,9,16,5]],[4,[28,3,14,0,23,11,8,19]]]){const d=dictFor(sec),truth=solved[sec],c=encode(truth,key);controls.push({name:sources[sec].name,keyTruth:key,gate:gate(c,0),...test(c,d,0,truth,key)})}
 const first=gates.findIndex(g=>!g.contradictions.length),s=sections[first];const target={pages:s.pages,prev:s.prev,...test(s.ws,dictFor(-1),s.prev)};return {gates,controls,target}
}
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
