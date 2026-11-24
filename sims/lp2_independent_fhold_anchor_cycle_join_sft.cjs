'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=process.argv[2]||path.join(__dirname,'..');
const files=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const experiment=function experiment(inputs){
 const mod=x=>((x%29)+29)%29;
 const gp=JSON.parse(inputs[0]), native=JSON.parse(inputs[3]), sym=new Map(gp.runes.map((c,i)=>[c,i]));
 function parse(s){let words=[],w=[];for(const c of s){if(sym.has(c))w.push(sym.get(c));else if(c!=="/"&&c!=="%"&&!/\s/u.test(c)&&w.length){words.push(w);w=[]}}if(w.length)words.push(w);return words}
 const lex=Array.from({length:15},()=>new Map()),spell=gp.translit.map((x,i)=>[x,i]);spell.push(["ING",21],["IO",27]);
 const add=a=>{if(a.length&&a.length<=14)lex[a.length].set(a.join(","),a)};
 for(const l of inputs[2].split("\n")){const m=l.match(/^([a-z]+)\s+\d+\s*$/);if(!m)continue;const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");function walk(i,a){if(i===s.length){add(a);return}if(a.length===14)return;for(const [t,n]of spell)if(s.startsWith(t,i))walk(i+t.length,[...a,n])}walk(0,[])}
 const donors=native.sections.map(s=>parse(s.source_text.replace(/[^\u16A0-\u16FF]+/gu," " ).trim().split(" ").join(".")));
 for(const ws of donors)for(const a of ws)add(a);
 const base=lex.reduce((n,m)=>n+m.size,0);
 for(const m of lex)for(const a of [...m.values()])if(a.length>=5)for(let i=1;i<a.length-2;i++)if(a[i]&&a[i+1]&&a[i]!==a[i+1]){let b=a.slice();[b[i],b[i+1]]=[b[i+1],b[i]];add(b)}
 const D=lex.map(m=>[...m.values()]);
 const words=parse(inputs[1].split("%").slice(53,55).join("%"));
 const full=words.flat();
 if(full.length!==308||full.some((x,i)=>x!==[...gp.pages[54].indices,...gp.pages[55].indices][i]))throw Error("source");
 const train=[];let count=0;for(const w of words){if(count+w.length>232)break;train.push(w);count+=w.length}
 if(count!==222||train.length!==49)throw Error("cut "+count);
 function schedule(ws,inner,outer,mask){let a=0,b=0,z=0;return ws.map(w=>w.map(c=>{const t=c===0?Math.floor(mask/3**(z++))%3:2;const e=t===0?{c,t}:t===1?{c,t,u:a,v:inner+outer}:{c,t,u:a,v:inner+b};if(t!==0)a=(a+1)%inner;if(t===2)b=(b+1)%outer;return e}))}
 function cycles(es,n){const adj=Array.from({length:n},()=>[]),out=[];for(let i=0;i<es.length;i++){const {u,v,t}=es[i];if(!t)continue;const seen=new Set([u]);function dfs(x){if(x===v)return [];for(const [y,j,sg]of adj[x])if(!seen.has(y)){seen.add(y);const p=dfs(y);if(p)return [[j,sg],...p]}return null}const p=dfs(u);if(p)out.push([[i,1],...p.map(([j,s])=>[j,-s])]);else{adj[u].push([v,i,1]);adj[v].push([u,i,-1])}}return out}
 function candidates(es){return (D[es.length]||[]).filter(w=>w.every((p,i)=>(p===0)===(es[i].t===0)))}
 function signature(cy,es,word,start,end,sign){let s="";for(const cyc of cy){let v=0;for(const [i,k] of cyc)if(i>=start&&i<end){const e=es[i],p=word[i-start];v+=k*((e.t===2?e.c:0)-p)}s+=String.fromCharCode(65+mod(v*sign))}return s}
 function pairInfo(sch){let pairs=[];for(let i=0;i<sch.length;i++)if(sch[i].length>=4)for(let j=i+1;j<sch.length;j++)if(sch[j].length>=4){let es=[...sch[i],...sch[j]],cy=cycles(es,22);if(cy.length>=3)pairs.push({i,j,es,cy})}return pairs.sort((a,b)=>b.cy.length-a.cy.length||b.es.length-a.es.length)}
 function testPair(pair,ca,cb,limit=1000){const {es,cy,i,j}=pair,l=ca[0]?.length??0,m=new Map();for(const w of ca){const k=signature(cy,es,w,0,l,1);let x=m.get(k);if(!x)m.set(k,x=[]);x.push(w)}let n=0,hits=[];for(const w of cb){const k=signature(cy,es,w,l,es.length,-1),a=m.get(k);if(a){n+=a.length;if(hits.length<limit)for(const v of a){if(hits.length>=limit)break;hits.push([v,w])}}}return {n,hits,i,j,cycles:cy.length}}
 function gate(ws,inner,outer,mask,maxPairs=8){const sch=schedule(ws,inner,outer,mask),cand=sch.map(candidates);if(cand.some(c=>!c.length))return {mask,empty:cand.findIndex(c=>!c.length),pairs:[]};let out=[];for(const p of pairInfo(sch).slice(0,maxPairs)){const h=testPair(p,cand[p.i],cand[p.j],0);out.push({i:h.i,j:h.j,cycles:h.cycles,n:h.n});if(!h.n)return {mask,zero:true,pairs:out}}return {mask,zero:false,pairs:out}}
 function encrypt(ws,keys){let a=0,b=0,mask=0,z=0;const [k,h]=keys;return {ws:ws.map(w=>w.map(p=>{let c,t;if(!p){c=0;t=0}else{const m=mod(p+k[a]);a=(a+1)%k.length;if(!m){c=0;t=1}else{c=mod(m+h[b]);b=(b+1)%h.length;t=2}}if(!c)mask+=t*3**(z++);return c})),get mask(){return mask},get z(){return z}}}
 const checks=[];
 for(const [di,inner,outer] of [[1,8,13],[4,13,8]]){let ws=[],n=0;for(const w of donors[di]){if(n+w.length>222)break;ws.push(w);n+=w.length}if(!ws.length)throw Error("donor");let keys=[Array.from({length:inner},(_,i)=>mod(7*i*i+3*i+4)),Array.from({length:outer},(_,i)=>mod(11*i*i+5*i+3))];let e=encrypt(ws,keys),sch=schedule(e.ws,inner,outer,e.mask),p=pairInfo(sch)[0];if(!p)throw Error("no pair");let ca=candidates(sch[p.i]),cb=candidates(sch[p.j]),j=testPair(p,ca,cb,2000),trueA=signature(p.cy,p.es,ws[p.i],0,ws[p.i].length,1),trueB=signature(p.cy,p.es,ws[p.j],ws[p.i].length,p.es.length,-1);if(trueA!==trueB||!j.n)throw Error("positive");checks.push({donor:di,length:n,words:ws.length,inner,outer,zeros:e.z,mask:e.mask,pair:[p.i,p.j],cycles:p.cy.length,matches:j.n,trueSignature:true})}
 const result=[];for(const [i,o]of [[8,13],[13,8]]){let masks=[];for(let m=0;m<27;m++)masks.push(gate(train,i,o,m));result.push({inner:i,outer:o,rejected:masks.filter(m=>m.zero||m.empty!==undefined).length,masks})}
 return {base,expanded:D.reduce((n,a)=>n+a.length,0),sizes:D.map(a=>a.length),checks,original:result};
};
console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.join(root,p),'utf8'))),null,2));
