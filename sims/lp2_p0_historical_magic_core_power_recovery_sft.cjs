'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
function experiment(corpus,solved,squareText,lexiconText,bodyOnly=false){
  const q=29,n=27,mod=x=>((x%q)+q)%q;
  const identity=n=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>+(i===j)));
  const tr=a=>a[0].map((_,j)=>a.map(r=>r[j]));
  const mul=(a,b)=>{const bt=tr(b);return a.map(r=>bt.map(c=>mod(r.reduce((s,x,i)=>s+x*c[i],0))));};
  const kron=(a,b)=>a.flatMap(r=>b.map(s=>r.flatMap(x=>s.map(y=>mod(x*y)))));
  const nums=squareText.match(/\d+/g).map(Number);let i=0;
  assert.equal(nums.length,99);
  const cores=[5,7,5].map(n=>Array.from({length:n},()=>nums.slice(i,i+=n))).map(a=>{const k=(a.length-3)/2;return a.slice(k,k+3).map(r=>r.slice(k,k+3));});
  const K=cores.reduce(kron),I=identity(n), powers=[I];
  for(let k=1;k<=840;k++){const x=mul(powers.at(-1),K);if(JSON.stringify(x)===JSON.stringify(I))break;powers.push(x);}
  assert.equal(powers.length,840);
  assert.deepEqual(mul(powers.at(-1),K),I);
  const lengths=bodyOnly?[11,11,9]:[8,5], offsets=bodyOnly?[23,62,245]:[0,8], words=lengths.map(()=>new Set());
  const code=a=>a.map(x=>String.fromCharCode(65+x)).join('');
  const normalize=w=>w.toUpperCase().replace(/QU/g,'CW').replace(/[VKZQ]/g,x=>({V:'U',K:'C',Z:'S',Q:'C'})[x]);
  const tokens=corpus.translit.map((x,i)=>[x,i]);tokens.push(['ING',21]);
  // Permit every segmentation into genuine GP graphemes, including NG/ING and literal N+G.
  const visit=(w,pos,len,key,target,set)=>{
    if(len>target||w.length-pos>3*(target-len)||w.length-pos<target-len)return;
    if(pos===w.length){if(len===target)set.add(key);return;}
    for(const [s,id] of tokens)if(w.startsWith(s,pos))visit(w,pos+s.length,len+1,key+String.fromCharCode(65+id),target,set);
  };
  for(const line of lexiconText.split(/\r?\n/)){const hit=line.match(/^([a-z]+)\s+\d+$/i);if(!hit)continue;const w=normalize(hit[1]);for(let j=0;j<lengths.length;j++)visit(w,0,0,'',lengths[j],words[j]);}
  const sections=solved.sections.map(s=>({name:s.name,a:[...s.source_text].map(x=>solved.runes.indexOf(x)).filter(x=>x>=0)}));
  const donor=sections.find(s=>s.name==='0_koan_1');
  const parable=solved.sections.find(s=>s.name==='p57_parable');
  const pWords=parable.source_text.split(/[^ᚠ-ᛠ]+/u).filter(Boolean);
  const at=pWords.findIndex((w,i)=>w.length===8&&pWords[i+1]?.length===5);
  assert.ok(at>=0);
  const head=[...pWords[at]+pWords[at+1]].map(x=>solved.runes.indexOf(x));
  if(!bodyOnly)assert.ok(words[0].has(code(head.slice(0,8)))&&words[1].has(code(head.slice(8))));
  const plant=bodyOnly?donor.a.slice(0,729):[...head,...donor.a.slice(0,716)];
  assert.equal(plant.length,729);
  if(bodyOnly){
    // Authentic native anchor words deliberately planted at the original long-group offsets.
    const anchors=['ᚢᚾᚱᛠᛋᚩᚾᚪᛒᛚᛖ','ᛖᚾᛚᛁᚷᚻᛏᛖᚾᛖᛞ','ᚳᚾᚩᚹᛚᛖᛞᚷᛖ'];
    for(let j=0;j<anchors.length;j++){
      assert.ok(solved.sections.some(s=>s.source_text.includes(anchors[j])));
      const a=[...anchors[j]].map(x=>solved.runes.indexOf(x));
      assert.equal(a.length,lengths[j]);
      assert.ok(words[j].has(code(a)));
      plant.splice(offsets[j],a.length,...a);
    }
  }
  const counts=Array.from({length:q},()=>Array(q).fill(.25));
  for(const s of sections.filter(s=>s.name!==donor.name&&s.name!=='p57_parable'))for(let i=1;i<s.a.length;i++)counts[s.a[i-1]][s.a[i]]++;
  const log=counts.map(r=>{const z=r.reduce((a,b)=>a+b);return r.map(x=>Math.log(x/z));});
  const score=a=>a.slice(1).reduce((s,x,i)=>s+log[a[i]][x],0)/(a.length-1);
  const pack=a=>Array.from({length:n},(_,i)=>a.slice(i*n,i*n+n));
  const render=a=>a.map(x=>corpus.translit[x]).join(' ');
  const source=corpus.pages.slice(0,3).flatMap(p=>p.indices);
  assert.equal(source.length,729);
  const orientations=[powers,powers.map(tr)];
  function search(C,matrices){
    const slots=offsets.map((offset,j)=>Array.from({length:lengths[j]},(_,k)=>[Math.floor((offset+k)/n),(offset+k)%n]));
    const active=[...new Set(slots.flat().map(s=>s[0]))];
    const first=matrices.map(M=>Object.fromEntries(active.map(r=>[r,Array.from({length:n},(_,j)=>mod(M[r].reduce((s,x,k)=>s+x*C[k][j],0)))])));
    const calc=(v,M,positions)=>{let key='';for(const [r,c] of positions){let sum=0;const p=v[r],w=M[c];for(let k=0;k<n;k++)sum+=p[k]*w[k];key+=String.fromCharCode(65+(sum%q));}return key;};
    const candidates=[],counts=lengths.map(()=>0);let all=0;
    for(let a=0;a<840;a++)for(let b=0;b<840;b++){
      const matches=slots.map((s,j)=>words[j].has(calc(first[a],matrices[b],s)));
      for(let j=0;j<matches.length;j++)counts[j]+=+matches[j];
      all+=+matches.every(Boolean);
      if(!matches.some(Boolean))continue;
      const plain=mul(mul(matrices[a],C),tr(matrices[b])).flat();
      assert.deepEqual(mul(mul(matrices[(840-a)%840],pack(plain)),tr(matrices[(840-b)%840])),C);
      candidates.push({a,b,anchors:matches,fit:score(plain.slice(13,262)),hold:score(plain.slice(262)),prefix:render(plain.slice(0,32)),plain});
    }
    candidates.sort((a,b)=>b.fit-a.fit);
    return {counts,all,union:candidates.length,best:candidates[0]??null,allKeys:candidates.filter(c=>c.anchors.every(Boolean)).map(({a,b,fit,hold})=>({a,b,fit,hold}))};
  }
  const originals=[],controls=[];
  for(let t=0;t<2;t++){
    const m=orientations[t],a=t?329:17,b=t?731:113;
    const o=search(pack(source),m);
    if(o.best)delete o.best.plain;
    originals.push(o);
    const C=mul(mul(m[(840-a)%840],pack(plant)),tr(m[(840-b)%840]));
    const p=search(C,m);
    assert.ok(p.allKeys.some(x=>x.a===a&&x.b===b));
    const matches=p.best.plain.reduce((s,x,i)=>s+(x===plant[i]),0);
    const holdMatches=p.best.plain.slice(262).reduce((s,x,i)=>s+(x===plant[262+i]),0);
    delete p.best.plain;
    controls.push({planted:[a,b],matches,holdMatches,...p});
  }
  return {order:powers.length,offsets,lengths,register:words.map(x=>x.size),sourceScore:score(source),nativeFit:score(plant.slice(13,262)),nativeHold:score(plant.slice(262)),originals,controls};
}
if(require.main===module)console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8')),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8')),fs.readFileSync('resources/cicada2014-openpuff-magic-squares.txt','utf8'),fs.readFileSync('resources/control/english_wordfreq_textblob.txt','utf8'),process.argv.includes('--body')),null,2));
module.exports={experiment};
