'use strict';
// Read-only SFT: p8 raw rune i as deleted rune of scroll printed group i.
const fs=require('node:fs'),path=require('node:path');
function experiment(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[2]),ix=new Map(gp.runes.map((x,i)=>[x,i]));
 const check=(x,m)=>{if(!x)throw Error(m)},same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),id=w=>String.fromCharCode(...w);
 const words=[];let pending=[];for(const part of raw[1].split('%').slice(3,8))for(const ch of part){if(ix.has(ch))pending.push(ix.get(ch));else if('-.'.includes(ch)&&pending.length){words.push(pending);pending=[]}}if(pending.length)words.push(pending);
 const side=gp.pages[8].indices;check(words.length===255&&side.length===255&&same(words.flat(),gp.pages.slice(3,8).flatMap(p=>p.indices)),'physical alignment');
 const alphabet=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const normalize=w=>w.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
 const greedy=w=>{const s=normalize(w),a=[];for(let i=0;i<s.length;){const x=s.startsWith('ING',i)?{t:'ING',i:21}:s.startsWith('IO',i)?{t:'IO',i:27}:alphabet.find(x=>s.startsWith(x.t,i));if(!x)throw Error(s);a.push(x.i);i+=x.t.length}return a};
 const maxLen=Math.max(...words.map(w=>w.length))+1,lex=new Map();
 function add(a){if(a.length>=2&&a.length<=maxLen)lex.set(id(a),a)}
 function allSpell(w){const s=normalize(w);function rec(i,a){if(i===s.length){add(a);return}if(a.length===maxLen)return;if(s.startsWith('ING',i))rec(i+3,[...a,21]);if(s.startsWith('IO',i))rec(i+2,[...a,27]);for(const t of alphabet)if(s.startsWith(t.t,i))rec(i+t.t.length,[...a,t.i]);}rec(0,[])}
 for(const line of raw[3].split(/\r?\n/)){let m=/^([a-z]+) (\d+)$/.exec(line);if(m)allSpell(m[1])}
 for(const g of gold.sections)for(const m of g.source_text.matchAll(/[\u16a0-\u16ff]+/gu))add([...m[0]].map(x=>ix.get(x)));
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]).map(greedy)}
 const donors=raw.slice(4).map(native);for(const d of donors)for(const w of d.slice(0,Math.floor(d.length*.8)))add(w);
 const pattern=w=>{const m=new Map;return id(w.map(x=>{if(!m.has(x))m.set(x,m.size);return m.get(x)}))};
 const full=new Map,deleted=new Map,insert=(w,i,x)=>[...w.slice(0,i),x,...w.slice(i)],remove=(w,i)=>[...w.slice(0,i),...w.slice(i+1)];
 function push(m,k,v){if(!m.has(k))m.set(k,[]);m.get(k).push(v)}
 for(const w of lex.values()){push(full,pattern(w),w);for(let i=0;i<w.length;i++)push(deleted,pattern(remove(w,i)),{w,i})}
 function assignment(count){const n=count.length,a=count.map(r=>r.map(v=>-v)),u=Array(n+1).fill(0),v=Array(n+1).fill(0),p=Array(n+1).fill(0),way=Array(n+1).fill(0);for(let i=1;i<=n;i++){p[0]=i;let j0=0,minv=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);do{used[j0]=true;let i0=p[j0],delta=Infinity,j1=0;for(let j=1;j<=n;j++)if(!used[j]){let cur=a[i0-1][j-1]-u[i0]-v[j];if(cur<minv[j]){minv[j]=cur;way[j]=j0}if(minv[j]<delta){delta=minv[j];j1=j}}for(let j=0;j<=n;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta}else minv[j]-=delta;j0=j1}while(p[j0]);do{let j1=way[j0];p[j0]=p[j1];j0=j1}while(j0)}const map=Array(n);for(let j=1;j<=n;j++)map[p[j]-1]=j-1;check(new Set(map).size===n&&a.every((r,i)=>r.every((x,j)=>u[i+1]+v[j+1]<=x))&&map.every((j,i)=>u[i+1]+v[j+1]===a[i][j]),'assignment dual');return {map,score:map.reduce((s,j,i)=>s+count[i][j],0)}}
 function repeatGate(ws,y){const counts=Array.from({length:29},()=>Array(29).fill(0));for(let i=0;i<ws.length;i++)for(const x of new Set(ws[i]))counts[y[i]][x]++;return {same:ws.filter((w,i)=>w.includes(y[i])).length,arbitraryBijection:assignment(counts),arbitraryFunction:counts.reduce((s,r)=>s+Math.max(...r),0)}}
 function mapping(c,p){const m=Array(29).fill(-1),inv=Array(29).fill(-1);for(let j=0;j<c.length;j++){check((m[c[j]]<0||m[c[j]]===p[j])&&(inv[p[j]]<0||inv[p[j]]===c[j]),'pattern invariant');m[c[j]]=p[j];inv[p[j]]=c[j]}return {m,inv}}
 function domains(w,y,separate){const out=new Map;function add(c,p,removed){const z=mapping(c,p),k=id(z.m.map(x=>x+1))+(separate?id([removed]):'');if(!out.has(k))out.set(k,{...z,removed})}if(separate){for(const {w:p,i} of deleted.get(pattern(w))||[])add(w,remove(p,i),p[i])}else for(let pos=0;pos<=w.length;pos++){const q=insert(w,pos,y);for(const p of full.get(pattern(q))||[])add(q,p,-1)}return [...out.values()]}
 function compatible(a,b){for(let i=0;i<29;i++)if(b.m[i]>=0&&((a.m[i]>=0&&a.m[i]!==b.m[i])||(a.inv[b.m[i]]>=0&&a.inv[b.m[i]]!==i)))return false;return true}
 function gate(ws,ys,separate,pairTest){const rows=ws.map((w,i)=>({i,L:w.length,domain:domains(w,ys[i],separate)}));const unsupported=rows.filter(r=>!r.domain.length).map(r=>r.i),byLength={};for(const r of rows){let a=byLength[r.L]??={n:0,supported:0};a.n++;a.supported+=Number(r.domain.length>0)}
 const anchors=rows.filter(r=>r.L>=8&&r.domain.length).sort((a,b)=>a.domain.length-b.domain.length),pairs=[],incompatible=[];if(pairTest){for(let i=0;i<anchors.length;i++)for(let j=i+1;j<anchors.length;j++){const a=anchors[i],b=anchors[j];let found=false;outer:for(const x of a.domain)for(const z of b.domain){if(separate&&((ys[a.i]===ys[b.i])!==(x.removed===z.removed)))continue;if(compatible(x,z)){found=true;break outer}}if(!found)incompatible.push([a.i,b.i])}
 const taken=new Set;for(const p of incompatible)if(p.every(i=>!taken.has(i))){pairs.push(p);for(const i of p)taken.add(i)}}
 return {supported:ws.length-unsupported.length,unsupported,byLength,anchors:anchors.map(r=>({i:r.i,domain:r.domain.length})),incompatible,pairs,minOOV:unsupported.length+pairs.length}}
 const original=[gate(words,side,false,true),gate(words,side,true,true)];
 let seed=0x3301255;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}function perm(){let a=Array.from({length:29},(_,i)=>i);for(let j=28;j>0;j--){let k=rng()%(j+1);[a[j],a[k]]=[a[k],a[j]]}return a}
 const controls=[];for(let d=0;d<donors.length;d++){const pool=Array.from({length:maxLen+1},()=>[]);for(const p of donors[d].slice(Math.floor(donors[d].length*.8)))if(p.length<=maxLen&&lex.has(id(p)))pool[p.length].push(p);
 const p=words.flatMap(w=>{const a=pool[w.length+1];return a.length?[a[rng()%a.length]]:[]});const enc=perm(),encSide=perm(),ws=[],ys=[],ys2=[];let shared=0,separate=0;for(const q of p){const j=rng()%q.length,w=remove(q,j).map(x=>enc[x]),y=enc[q[j]],z=encSide[q[j]];ws.push(w);ys.push(y);ys2.push(z);if(domains(w,y,false).some(r=>r.m.every((v,k)=>v<0||enc[v]===k)))shared++;if(domains(w,z,true).some(r=>r.removed===q[j]&&r.m.every((v,k)=>v<0||enc[v]===k)))separate++}check(shared===p.length&&separate===p.length,'plant true key retained');const repWords=[],repY=[],repY2=[];for(const q of p){const j=rng()%q.length;repWords.push(q.map(x=>enc[x]));repY.push(enc[q[j]]);repY2.push(encSide[q[j]])}const r1=repeatGate(repWords,repY),r2=repeatGate(repWords,repY2);check(r1.same===p.length&&r2.arbitraryBijection.score===p.length,'repeat control');controls.push({d,n:p.length,shared,separate,repeatShared:r1.same,repeatSeparate:r2.arbitraryBijection.score})}
 return {lex:lex.size,words:words.length,side:side.length,maxLen,repeat:repeatGate(words,side),original,controls};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
if(require.main===module)console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
module.exports={experiment};
