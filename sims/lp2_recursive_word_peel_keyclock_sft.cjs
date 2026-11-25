'use strict';
const fs=require('node:fs'),crypto=require('node:crypto');
const inputs=[
  {
    "path": "resources/liber-primus/lp2-corpus.json",
    "sha": "054f2a0f780b7d46901acbe3d9bf4f0ac1801165"
  },
  {
    "path": "resources/liber-primus/lp2-transcription.txt",
    "sha": "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7"
  },
  {
    "path": "resources/external/relikd-solved-gp29-native-v1.json",
    "sha": "1b064ef6d85819b7d96adaff31a82d1ec551598f"
  }
];
function experiment(gp,trans,nat){
 const g=JSON.parse(gp),native=JSON.parse(nat),q=8,key=[23,10,1,10,9,10,16,26],M=x=>(x%29+29)%29;
 const assert=(b,m)=>{if(!b)throw Error(m)};
 const raw=(s)=>Array.from(s).filter(c=>g.runes.includes(c)).map(c=>g.runes.indexOf(c));
 const words=s=>(s.match(/[\u16a0-\u16ff]+/g)||[]).map(raw);
 const groups=words(trans.replace(/[\s/%]/g,"")).slice(0,2896),flat=groups.flat();
 assert(groups.length===2896&&flat.length===12956&&flat.join()===g.pages.slice(0,56).flatMap(p=>p.indices).join(),"physical source mismatch");
 const cuts=[0,729,1874,3612,5506,6527,7960,9640,12648,12956],chapters=[];let at=0,j=0;
 for(let k=1;k<cuts.length;k++){const start=j;while(at<cuts[k])at+=groups[j++].length;assert(at===cuts[k],"chapter crosses group");chapters.push(groups.slice(start,j))}
 const prose=native.sections.filter(s=>s.name!=="0_wisdom").map(s=>({name:s.name,words:words(s.source_text)}));
 const controlNames=["0_welcome","0_koan_1","0_loss_of_divinity"];
 const training=prose.filter(s=>!controlNames.includes(s.name)).flatMap(s=>s.words);
 const u=Array(29).fill(0.5),b=Array.from({length:29},()=>Array(29).fill(0.25));
 for(const w of training){for(const p of w)u[p]++;for(let j=1;j<w.length;j++)b[w[j-1]][w[j]]++}
 const sum=a=>a.reduce((s,x)=>s+x,0),lu=u.map(x=>Math.log(x/sum(u))),lb=b.map(r=>r.map(x=>Math.log(x/sum(r))));
 function order(ws,inside){const layers=[];let pos=0;for(const w of ws){for(let d=0;d<Math.ceil(w.length/2);d++){if(!layers[d])layers[d]=[];layers[d].push(pos+d);if(d!==w.length-1-d)layers[d].push(pos+w.length-1-d)}pos+=w.length}const o=(inside?layers.reverse():layers).flat();assert(o.length===pos&&new Set(o).size===pos,"not permutation");return o}
 function encode(p,o,k,hold,sign=1){const c=Array(p.length);let j=0;for(const i of o){if(hold&&p[i]===0)c[i]=0;else{c[i]=M(p[i]+sign*k[j]);j=(j+1)%k.length}}return c}
 function decode(c,o,k,hold,sign=1){let score=Array(k.length).fill(-Infinity);score[0]=0;const prev=[],symbol=[];for(const i of o){const next=Array(k.length).fill(-Infinity),a=Array(k.length).fill(-1),b=Array(k.length).fill(-1);function put(j,s,p,v){if(v>next[j]){next[j]=v;a[j]=s;b[j]=p}}for(let j=0;j<k.length;j++){if(!Number.isFinite(score[j]))continue;if(hold&&c[i]===0)put(j,j,0,score[j]+lu[0]);const p=M(c[i]-sign*k[j]);if(!hold||p!==0)put((j+1)%k.length,j,p,score[j]+lu[p])}if(next.every(x=>!Number.isFinite(x)))return null;prev.push(a);symbol.push(b);score=next}let j=score.indexOf(Math.max(...score)),p=Array(c.length);for(let i=o.length-1;i>=0;i--){p[o[i]]=symbol[i][j];j=prev[i][j]}assert(j===0&&encode(p,o,k,hold,sign).join()===c.join(),"forward replay");return p}
 function metric(p,ws){if(!p)return null;let s=0,n=0,pos=0;for(const w of ws){for(let j=1;j<w.length;j++){s+=lb[p[pos+j-1]][p[pos+j]];n++}pos+=w.length}const counts=Array(29).fill(0);p.forEach(x=>counts[x]++);return {nll:-s/n,maxNonF:Math.max(...counts.slice(1)),runes:p.length,preview:p.slice(0,90).map(x=>g.translit[x]).join(" ")}}
 // For an arbitrary bijection at each phase, independently maximize one
 // non-F plaintext-symbol's count over all legal clock paths and preimages.
 // The independent paths give a rigorous upper bound (not a joint maximum).
 function bound(c,o,hold){let cap=0;for(let phase=0;phase<q;phase++){let best=0;for(let target=0;target<29;target++){let s=Array(q).fill(-1e9);s[0]=0;for(const i of o){const t=Array(q).fill(-1e9);for(let j=0;j<q;j++){if(hold&&c[i]===0)t[j]=Math.max(t[j],s[j]);const v=s[j]+Number(j===phase&&c[i]===target),k=(j+1)%q;t[k]=Math.max(t[k],v)}s=t}best=Math.max(best,...s)}cap+=best}return cap}
 function fit(c,o){const counts=Array.from({length:q},()=>Array(29).fill(0));o.forEach((i,j)=>counts[j%q][c[i]]++);return counts.map(row=>{const s=Array.from({length:29},(_,k)=>row.reduce((v,n,c)=>v+n*lu[M(c-k)],0));return s.indexOf(Math.max(...s))})}
 // Compare native prose windows without merging cells, including section-spanning
 // windows only for a clearly labelled concatenated-reference baseline.
 const ref=prose.flatMap(s=>s.words.flat());
 function floor(n){if(n>ref.length)return null;const counts=Array(29).fill(0);for(let i=0;i<n;i++)counts[ref[i]]++;let m=Math.max(...counts.slice(1));for(let i=n;i<ref.length;i++){counts[ref[i-n]]--;counts[ref[i]]++;m=Math.min(m,Math.max(...counts.slice(1)))}return m}
 const controls=[];for(const name of controlNames){const ws=prose.find(s=>s.name===name).words,p=ws.flat();for(const inside of [false,true])for(const hold of [false,true]){const o=order(ws,inside),c=encode(p,o,key,hold),d=decode(c,o,key,hold),r=metric(d,ws),cap=bound(c,o,hold);assert(cap>=metric(p,ws).maxNonF,"capacity violated on plant");controls.push({name,inside,hold,correct:d?.filter((x,i)=>x===p[i]).length??0,truth:metric(p,ws),decoded:r,cap,fitKey:hold?null:fit(c,o)})}}
 const rows=[];for(const inside of [false,true]){const o0=order(chapters[0],inside),fitted=fit(chapters[0].flat(),o0);for(let k=0;k<chapters.length;k++){const ws=chapters[k],c=ws.flat(),o=order(ws,inside);const fixed=[];for(const hold of [false,true])for(const sign of [1,-1])fixed.push({hold,sign,metric:metric(decode(c,o,key,hold,sign),ws)});rows.push({inside,chapter:k,span:cuts.slice(k,k+2),floor:floor(c.length),boundOrdinary:bound(c,o,false),boundHold:bound(c,o,true),fixed,fittedKey:fitted,fit:metric(decode(c,o,fitted,false),ws)})}}
 return {trainingRunes:training.flat().length,refRunes:ref.length,key,controls,rows};
}
const data=inputs.map(({path,sha})=>{const b=fs.readFileSync(path);if(crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex')!==sha)throw Error('input changed: '+path);return b.toString('utf8')});
console.log(JSON.stringify({inputs,...experiment(...data)},null,2));
