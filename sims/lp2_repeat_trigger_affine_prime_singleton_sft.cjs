'use strict';
// All affine prime clocks with deterministic next-state reset at equal consecutive ciphertext glyphs.
const fs=require('node:fs');const path=require('node:path');
function experiment(corpus,raw,ref){
 const mod=x=>(x%29+29)%29,alphabet=corpus.translit;
 const cipher=corpus.pages.slice(0,56).flatMap(p=>p.indices), idx=new Map(corpus.runes.map((r,i)=>[r,i]));
 const tape=[],singletons=[];let start=0;
 function finish(){if(tape.length-start===1)singletons.push(start);start=tape.length;}
 const seg=raw.split('%').slice(0,55).join('%');
 for(const c of seg){if(idx.has(c))tape.push(idx.get(c));else if(c!=='%'&&c!=='/'&&!/\s/u.test(c))finish();}
 finish();const mismatch=tape.reduce((n,v,i)=>n+(v!==cipher[i]),0);if(tape.length!==cipher.length||mismatch)throw Error('source mismatch '+tape.length+'/'+cipher.length+' '+mismatch);
 const ps=[];for(let p=2;ps.length<20000;p++){let ok=true;for(let d=2;d*d<=p;d++)if(p%d===0){ok=false;break;}if(ok)ps.push((p-1)%29);}
 function ages(c){let a=0,prev=-1;return c.map(v=>{let old=a;a=v===prev?0:a+1;prev=v;return old;});}
 function encode(p,k,a,b){let age=0,prev=-1;return p.map(v=>{let c=mod(v+a*ps[k+age]+b);age=c===prev?0:age+1;prev=c;return c;});}
 function decode(c,key){const [k,a,b]=key,age=ages(c);return c.map((v,i)=>mod(v-a*ps[k+age[i]]-b));}
 function solve(c,s,allowed){const age=ages(c);const hits=[];const counts=Array(s.length).fill(0);if(!s.length)return {s:0,survivors:null,hits};
  for(let k=0;k<=3300;k++)for(let a=0;a<29;a++)for(const q of allowed){
   const b=mod(c[s[0]]-a*ps[k+age[s[0]]]-q);let j=0;
   for(;j<s.length;j++){const p=mod(c[s[j]]-a*ps[k+age[s[j]]]-b);if(!allowed.includes(p))break;counts[j]++;}
   if(j===s.length)hits.push([k,a,b]);
  }
  return {s:s.length,survivors:hits.length,firstZero:counts.includes(0)?counts.indexOf(0)+1:null,counts,examples:hits.slice(0,5),hits};
 }
 const rawParts=ref.split(/^### (\d+)\s*$/m),parts={};for(let i=1;i<rawParts.length;i+=2)parts[Number(rawParts[i])]=rawParts[i+1];
 function donor(t){const words=t.replace(/^\[.*\]$/gm,'').replace(/^\(.*\)$/gm,'').replace(/\bWISDOM \(continued\)/gi,'').toUpperCase().replace(/[^A-Z]/g,' ').replace(/V/g,'U').replace(/K/g,'C').replace(/Q/g,'C').replace(/Z/g,'S').split(/\s+/).filter(Boolean);let p=[],s=[];for(const w of words){const z=[];for(let i=0;i<w.length;){let token=w.startsWith('ING',i)?'NG':w.startsWith('IO',i)?'IA':alphabet.filter(x=>w.startsWith(x,i)).sort((a,b)=>b.length-a.length)[0];if(!token)throw Error('unrecognized');z.push(alphabet.indexOf(token));i+=w.startsWith('ING',i)?3:token==='IA'&&w.startsWith('IO',i)?2:token.length;}if(z.length===1)s.push(p.length);p.push(...z);}return {p,s};}
 const train=[1,3,5,9,10,11,12,13,15].flatMap(p=>donor(parts[p]).p);
 const counts=new Float64Array(29**3),ctx=new Float64Array(29**2);for(let i=2;i<train.length;i++){const j=train[i-2]*29+train[i-1];counts[j*29+train[i]]++;ctx[j]++;}
 const logp=Float64Array.from(counts,(v,i)=>Math.log((v+.25)/(ctx[Math.floor(i/29)]+.25*29)));
 function score(p,from=2,to=p.length){let q=0;for(let i=Math.max(2,from);i<to;i++)q+=logp[(p[i-2]*29+p[i-1])*29+p[i]];return q/(to-Math.max(2,from));}
 function best(c,hits,split){if(!hits.length)return null;let r=null;for(const key of hits){const p=decode(c,key),q=score(p,2,split);if(!r||q>r.prefix)r={key,prefix:q,hold:score(p,split),preview:p.slice(0,120).map(v=>alphabet[v]).join(''),plain:p};}
 const enc=encode(r.plain,...r.key);if(enc.some((x,i)=>x!==c[i]))throw Error('replay');return r;}
 const bounds=[0];for(const p of corpus.pages.slice(0,56))bounds.push(bounds.at(-1)+p.indices.length);
 const intervals=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55],[0,55]],allowed=[24,10,3];
 const original=intervals.map(([l,r])=>{const x=bounds[l],y=bounds[r+1],c=cipher.slice(x,y),s=singletons.filter(i=>i>=x&&i<y).map(i=>i-x),split=Math.floor(c.length*.6);const {hits,...res}=solve(c,s,allowed);
 // Full singleton census is an exact necessary-condition gate, not the independent holdout.
 // Separately freeze from prefix constraints plus prefix score; evaluate unseen singleton words and suffix.
 let candidate=null;if(hits.length){const prefixS=s.filter(i=>i<split);if(prefixS.length){const prefixHits=solve(c.slice(0,split),prefixS,allowed).hits;const b=best(c,prefixHits,split);candidate={key:b.key,prefix:b.prefix,hold:b.hold,preview:b.preview,holdSingletons:s.filter(i=>i>=split).map(i=>({i,p:b.plain[i],legal:allowed.includes(b.plain[i])})),prefixSurvivors:prefixHits.length};}}
 let fullBest=null;if(hits.length){let highest=-Infinity;for(const key of hits){const p=decode(c,key),q=score(p);if(q>highest){highest=q;fullBest={key,score:q,preview:p.slice(0,150).map(v=>alphabet[v]).join('')};}}}
 return {pages:[l,r],n:c.length,...res,candidate,fullBest};
 });
 const control=donor(parts[6]);const controls=[];for(const key of [[1033,17,11],[2029,3,23]]){const c=encode(control.p,...key),res=solve(c,control.s,allowed),actual=res.hits.find(v=>v.every((x,i)=>x===key[i]));if(!actual)throw Error('lost true key');const p=decode(c,actual);controls.push({expected:key,n:control.p.length,s:control.s.length,exact:p.filter((x,i)=>x===control.p[i]).length,survivors:res.survivors,score:score(p)});}
 return {totalRunes:tape.length,singletons:singletons.length,trainLength:train.length,original,controls};
}
const dir=path.resolve(__dirname,'../resources/liber-primus');
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync(path.join(dir,'lp2-corpus.json'),'utf8')),fs.readFileSync(path.join(dir,'lp2-transcription.txt'),'utf8'),fs.readFileSync(path.join(dir,'lp1-plaintext-reference.txt'),'utf8')),null,2));
