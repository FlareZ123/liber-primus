'use strict';
const fs=require('node:fs'),path=require('node:path');
function run(d,trans,native,lex){
  const eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
  const check=(v,m)=>{if(!v)throw Error(m)};
  const mp=new Map(d.runes.map((v,i)=>[v,i])),alpha=new Map(d.translit.map((v,i)=>[v,i]));
  const parse=s=>[...s].filter(c=>mp.has(c)).map(c=>mp.get(c));
  const words=s=>(s.replace(/[\/%\r\n'’]/g,"").match(new RegExp("["+d.runes.join("")+"]+","gu"))||[]).map(parse);
  const ws=words(trans.split("%").slice(0,55).join("")),C=d.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
  check(C.length===12956&&ws.length===2896&&eq(C,ws.flat()),"source alignment");
  const cuts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];
  const canonical=Array.from({length:29},(_,i)=>i), secret=canonical.map(i=>(7*i+9)%29);
  const models=[{step:-1,wrap:false},{step:1,wrap:false},{step:-1,wrap:true},{step:1,wrap:true}];
  /** Decode rank inputs or encode symbol inputs with the adjacent-swap list. */
  function transform(x,m,encode,init=canonical){
    const a=init.slice(),out=[];
    for(const v of x){const rank=encode?a.indexOf(v):v;check(rank>=0&&rank<29,"rank range");out.push(encode?rank:a[rank]);
      const j=m.wrap?(rank+m.step+29)%29:Math.max(0,Math.min(28,rank+m.step));[a[rank],a[j]]=[a[j],a[rank]];}
    return out;
  }
  function stat(x){const f=Array(29).fill(0);for(const v of x)f[v]++;
    return {n:x.length,ioc:f.reduce((s,v)=>s+v*(v-1),0)/(x.length*(x.length-1)),max:Math.max(...f),adj:x.slice(1).filter((v,i)=>v===x[i]).length};}
  function locate(wds){let p=0;return wds.map(w=>{const a=p;p+=w.length;return {a,b:p,w};});}
  const locations=locate(ws), nativeWords=native.sections.map(s=>({name:s.name,w:words(s.source_text)}));
  const byPattern=new Map(),dict=new Set();
  function pattern(w){const m=new Map();return w.map(v=>{if(!m.has(v))m.set(v,m.size);return m.get(v);}).join(",");}
  function add(w){if(!w.length)return;const k=w.join(",");if(dict.has(k))return;dict.add(k);
    const p=pattern(w);if(!byPattern.has(p))byPattern.set(p,[]);byPattern.get(p).push(w);}
  function variants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
    function walk(i,w){if(i===s.length){add(w);return;}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;
      const v=n===3?(a==="ING"?alpha.get("NG"):undefined):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v]);}}walk(0,[]);}
  for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variants(m[1]);}
  for(const s of ["A","I","O"])variants(s);
  for(const s of nativeWords)for(const w of s.w)add(w);
  const fullMask=(1<<29)-1,bit=i=>1<<i,pop=x=>{let n=0;while(x){x&=x-1;n++;}return n;};
  /** Exact domain propagation; a failed constraint or matching proves infeasibility. */
  function propagate(wds,dom,rows){
    let changed=true;
    while(changed){changed=false;
      for(let j=0;j<wds.length;j++){const w=wds[j],r=rows[j].filter(p=>p.every((v,i)=>dom[w[i]]&bit(v)));
        if(!r.length)return false;if(r.length!==rows[j].length){rows[j]=r;changed=true;}
        const support=Array(29).fill(0);for(const p of r)for(let i=0;i<w.length;i++)support[w[i]]|=bit(p[i]);
        for(const x of new Set(w)){const v=dom[x]&support[x];if(!v)return false;if(v!==dom[x]){dom[x]=v;changed=true;}}}
      for(let x=0;x<29;x++)if(pop(dom[x])===1)for(let y=0;y<29;y++)if(x!==y&&(dom[y]&dom[x])){dom[y]&=~dom[x];if(!dom[y])return false;changed=true;}}
    const match=Array(29).fill(-1);
    function aug(x,seen){for(let v=0;v<29;v++)if((dom[x]&bit(v))&&!seen[v]){seen[v]=true;if(match[v]===-1||aug(match[v],seen)){match[v]=x;return true;}}return false;}
    return dom.every((_,x)=>aug(x,Array(29).fill(false)));
  }
  function solve(wds){
    const rows=wds.map(w=>byPattern.get(pattern(w))||[]),missing=rows.flatMap((r,i)=>r.length?[]:[i]);
    if(missing.length)return {status:"impossible-pattern",missing:missing.length,examples:missing.slice(0,5).map(i=>({i,w:wds[i]}))};
    let nodes=0,capped=false;
    const used=new Set(wds.flat());
    function dfs(dom,rs){
      if(++nodes>50000){capped=true;return null;}
      if(!propagate(wds,dom,rs))return null;
      let best=-1,n=30;for(const x of used){const k=pop(dom[x]);if(k>1&&k<n){best=x;n=k;}}
      if(best<0){
        const result=dom.map((m,i)=>used.has(i)?31-Math.clz32(m):null);
        const free=canonical.filter(v=>!result.includes(v));
        return result.map(v=>v===null?free.shift():v);
      }
      for(let v=0;v<29;v++)if(dom[best]&bit(v)){const dd=dom.slice();dd[best]=bit(v);const res=dfs(dd,rs.slice());if(res)return res;if(capped)return null;}
      return null;
    }
    const key=dfs(Array(29).fill(fullMask),rows);
    return {status:key?"key-found":capped?"capped":"impossible-CSP",nodes,key};
  }
  const out={lexicon:dict.size,original:[],controls:[]};
  for(const m of models){
    const p=transform(C,m,false),privateP=transform(C,m,false,secret);
    check(eq(privateP,p.map(v=>secret[v])),"all-secret relabel invariant");
    check(eq(transform(privateP,m,true,secret),C),"original replay");
    const chapters=cuts.slice(0,-1).map((a,i)=>{const b=cuts[i+1],q=transform(C.slice(a,b),m,false);
      const ss=locations.filter(x=>x.a>=a&&x.b<=b&&x.w.length===1).map(x=>q[x.a-a]);
      return {...stat(q),singletonTypes:new Set(ss).size};});
    const target=C.slice(12648),decoded=transform(target,m,false),boundary=12648+d.pages[54].indices.length;
    const training=locations.filter(w=>w.a>=12648&&w.b<=boundary&&(w.w.length>=3||w.w.length===1)).map(w=>decoded.slice(w.a-12648,w.b-12648));
    const holdout=locations.filter(w=>w.a>=boundary&&w.b<=12956&&(w.w.length>=3||w.w.length===1)).map(w=>decoded.slice(w.a-12648,w.b-12648));
    const s=solve(training);
    let holdoutMatches=null;if(s.key)holdoutMatches=holdout.filter(w=>dict.has(w.map(v=>s.key[v]).join(","))).length;
    out.original.push({model:m,full:stat(p),singletonTypes:new Set(locations.filter(w=>w.w.length===1).map(w=>p[w.a])).size,chapters,
      maxPageIoC:Math.max(...d.pages.filter(p=>p.page<56&&p.indices.length).map(p=>stat(transform(p.indices,m,false)).ioc)),
      trainCount:training.length,holdoutCount:holdout.length,attack:s,holdoutMatches});
    for(const control of nativeWords.filter(s=>["0_welcome","jpg107-167"].includes(s.name))){
      const w=control.w,plain=w.flat(),cipher=transform(plain,m,true,secret),labels=transform(cipher,m,false);
      check(eq(transform(cipher,m,false,secret),plain),"native plant replay");
      const loc=locate(w),b=loc[Math.floor(loc.length*2/3)-1].b;
      const train=loc.filter(x=>x.b<=b&&(x.w.length>=3||x.w.length===1)).map(x=>labels.slice(x.a,x.b));
      const sol=solve(train);check(sol.key,"plant key recovery");
      const pred=labels.map(v=>sol.key[v]),tail=pred.slice(b),truth=plain.slice(b);
      out.controls.push({model:m,name:control.name,training:train.length,keyMatches:sol.key.filter((v,i)=>v===secret[i]).length,holdout:truth.length,holdoutMatches:tail.filter((v,i)=>v===truth[i]).length,nodes:sol.nodes});
    }
  }
  return out;
}
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const result=run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/control/english_wordfreq_textblob.txt"));
console.log(JSON.stringify(result,null,2));
