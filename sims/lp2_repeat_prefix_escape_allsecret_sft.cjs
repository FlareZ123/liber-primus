"use strict";
const fs = require("node:fs");
const path = require("node:path");
function experiment(data,raw,native){
  const check=(ok,msg)=>{if(!ok)throw Error(msg)};
  const pages=data.pages.filter(p=>p.page<56&&p.indices.length),all=pages.flatMap(p=>p.indices);
  const words=[];let word=[];
  for(const ch of raw.split("%").slice(0,55).join("%")){
    const v=data.runes.indexOf(ch);
    if(v>=0)word.push(v);
    else if(ch!=="%"&&ch!=="/"&&!/\s/u.test(ch)){if(word.length)words.push(word);word=[];}
  }
  if(word.length)words.push(word);
  const flat=words.flat();
  check(all.length===12956&&words.length===2896&&flat.length===all.length&&flat.every((x,i)=>x===all[i]),"source agreement");
  const flags=words.flatMap(w=>w.map((_,i)=>(i===0?1:0)+(i===w.length-1?2:0)));
  const physical=pages.flatMap(p=>p.indices.map((_,i)=>[p.page,i]));
  const repeats=all.map((x,i)=>i>0&&x===all[i-1]?i:-1).filter(i=>i>=0);
  check(repeats.length===86,"repeat census");
  function gate(a,L,clock=()=>0){
    const rows=new Map();let prev=-Infinity;
    for(let i=1;i<a.length;i++){
      const s=a[i-1],c=a[i],k=29*clock(i)+s;
      if(i-prev>=L){
        if(!rows.has(k))rows.set(k,{ordinary:new Set(),escape:new Set(),loc:[]});
        const row=rows.get(k);
        if(c!==s)row.ordinary.add(c);
        else if(i+1<a.length){row.escape.add(a[i+1]);row.loc.push(i);}
      }
      if(c===s)prev=i;
    }
    return [...rows].map(([k,r])=>({state:k%29,role:Math.floor(k/29),ordinary:r.ordinary.size,escape:r.escape.size,total:r.ordinary.size+r.escape.size,terminators:[...r.escape].sort((a,b)=>a-b),offsets:r.loc})).sort((a,b)=>b.total-a.total||a.role-b.role||a.state-b.state);
  }
  function threshold(a,clock){
    let lo=1,hi=a.length+1;
    while(lo+1<hi){const m=(lo+hi)>>1;if(gate(a,m,clock)[0].total>29)lo=m;else hi=m;}
    return {maxExcluded:lo===1?null:lo,length2:gate(a,2,clock)[0],last:lo===1?null:gate(a,lo,clock)[0],next:gate(a,lo+1,clock)[0].total};
  }
  const clocks={none:()=>0,start:i=>flags[i]&1,end:i=>(flags[i]>>1)&1,both:i=>flags[i]};
  const global=Object.fromEntries(Object.entries(clocks).map(([k,v])=>[k,threshold(all,v)]));
  const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
  let offset=0;
  const chapters=ranges.map(([p,q])=>{const n=pages.filter(x=>x.page>=p&&x.page<=q).reduce((s,x)=>s+x.indices.length,0),a=all.slice(offset,offset+n),base=offset;offset+=n;return {p,q,n,...Object.fromEntries(Object.entries(clocks).map(([k,v])=>[k,threshold(a,i=>v(base+i))]))};});
  const terminal=[];offset=0;
  for(const [wi,w] of words.entries()){
    let first=-1;
    for(let j=0;j<w.length;j++,offset++)if(offset&&all[offset]===all[offset-1]){
      if(first<0)first=j;
      if(first===j&&j===w.length-1)terminal.push({word:wi,offset,physical:physical[offset]});
    }
  }
  const forcedSingle=new Set(gate(all,2).filter(x=>x.total>29).map(x=>x.state));
  const mixed={states:forcedSingle.size,possibleMultiPrefixSites:repeats.filter(i=>!forcedSingle.has(all[i])).length};
  const code=(s,p)=>p<27?[(s+p+1)%29]:p===27?[s,(s+1)%29]:[s,(s+2)%29,(s+2)%29,(s+3)%29];
  const encode=(p,seed)=>{const out=[seed];for(const x of p)out.push(...code(out[out.length-1],x));return out;};
  const decode=a=>{const p=[];for(let i=1;i<a.length;){const s=a[i-1],options=Array.from({length:29},(_,k)=>({k,c:code(s,k)})).filter(({c})=>i+c.length<=a.length&&c.every((x,j)=>x===a[i+j]));check(options.length===1,"unique prefix");p.push(options[0].k);i+=options[0].c.length;}return p;};
  const donor=native.sections.flatMap(x=>[...x.source_text].map(c=>data.runes.indexOf(c)).filter(x=>x>=0));
  const plants=[0,13,28].map(seed=>{const p=donor.concat(Array.from({length:29},(_,i)=>i)),c=encode(p,seed),z=decode(c),r=encode(z,seed),bound=gate(c,4)[0].total;check(z.length===p.length&&z.every((x,i)=>x===p[i])&&r.length===c.length&&r.every((x,i)=>x===c[i])&&bound<=29,"plant");return {seed,donor:donor.length,decoded:p.length,cipher:c.length,bound};});
  check(global.none.length2.total===35&&global.none.maxExcluded===226&&global.start.maxExcluded===226&&global.end.maxExcluded===197&&global.both.maxExcluded===161,"global bounds");
  check(chapters[7].none.maxExcluded===53&&chapters[7].start.maxExcluded===52&&chapters[7].end.maxExcluded===43&&chapters[7].both.maxExcluded===null,"chapter bounds");
  check(terminal.length===18&&mixed.states===25&&mixed.possibleMultiPrefixSites===3,"escape limits");
  return {global,chapters,terminal,mixed,plants};
}
const read = p => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")), read("resources/liber-primus/lp2-transcription.txt"), JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"))), null, 2));
