'use strict';
// Run from repo root: node sims/lp2_latin_alias_witness_sft.cjs
const fs=require('node:fs');
const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const c=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const q=read('resources/transcriptions/lp2-image-corrected.txt').trim().split('%');
const p=read('resources/transcriptions/lp1_wulfic_canonical.txt').trim().split('%');
const ref=read('resources/liber-primus/lp1-plaintext-reference.txt');
const source=read('resources/external/2013-instar-xor-source.md');
const a=c.runes,t=c.translit,aliases=t.map(s=>[s]);
// The 2013 chart itself prints C/K, S/Z, NG/ING, IA/IO.
// V->U is independently selected by the aligned DIVINITY in the 2013 MP3 metadata.
for(const [x,y] of [['C','K'],['S','Z'],['NG','ING'],['IA','IO'],['U','V']]) aliases[t.indexOf(x)].push(y);
const lookup=new Map(aliases.flatMap((ss,i)=>ss.map(s=>[s,a[i]])));
function tok(s){
  for(let k=Math.min(3,s.length);k>=1;k--) if(lookup.has(s.slice(0,k))) return [lookup.get(s.slice(0,k)),k];
  throw Error('unknown '+s);
}
function render(s){
  let w='';
  for(let i=0;i<s.length;){const [x,k]=tok(s.slice(i));w+=x;i+=k;}
  return w;
}
const groups=s=>s.replace(/[\/\s]/gu,'').match(new RegExp('['+a.join('')+']+','gu'))||[];
const lat=s=>[...s].map(x=>t[a.indexOf(x)]).join('');
const witness=source.match(/metadata value \x60([^\x60]+)\x60/)[1];
const words=witness.toUpperCase().replace(/\\N/g,' ').match(/[A-Z]+/g);
const p57=groups(q[56]).slice(1); // exclude the added PARABLE rubric
assert.equal(words.length,19);
assert.equal(p57.join('').length,88);
assert.deepEqual(words.map(render),p57);
const warning=ref.split('### 1\n')[1].split('### 3\n')[0].match(/[A-Z]+/g);
const sourceWarning=groups(p[0]).map(w=>[...w].map(x=>a[28-a.indexOf(x)]).join(''));
assert.equal(warning.length,45);
assert.equal(sourceWarning.join('').length,184);
assert.deepEqual(warning.map(render),sourceWarning);
// Exact finite inverse of greedy longest-token rendering over independently allowed
// per-rune aliases. Future choices can inspect at most two characters beyond the
// current alias; retaining one valid suffix per two-character prefix is sufficient.
function represent(w){
  let states=new Map([['','']]);
  for(let i=w.length-1;i>=0;i--){
    const next=new Map();
    for(const s of aliases[a.indexOf(w[i])]) for(const suffix of states.values()){
      const full=s+suffix;
      const [r,k]=tok(full);
      if(r===w[i] && k===s.length && !next.has(full.slice(0,2))) next.set(full.slice(0,2),full);
    }
    states=next;
    if(!states.size) return null;
  }
  return states.values().next().value;
}
const orig=groups(q.slice(0,55).join(''));
assert.equal(orig.length,2896);
const impossible=[];
orig.forEach((w,i)=>{
  const rep=represent(w);
  if(rep===null) impossible.push({i,w,lat:lat(w)});
  else assert.equal(render(rep),w);
});
assert.equal(impossible.length,192);
assert.equal(new Set(impossible.map(x=>x.w)).size,185);
// Independent of greedy priority, allow any legal per-rune alias string, with
// arbitrary stationary word-local output. The four forced collision classes
// consist entirely of runes without alternative spellings.
const byLatin=new Map();
for(const w of orig){
  const s=lat(w);
  if(!byLatin.has(s)) byLatin.set(s,new Map());
  const d=byLatin.get(s);d.set(w,(d.get(w)||0)+1);
}
const forced=[...byLatin].filter(([,d])=>d.size>1 && [...d.keys()].every(w=>[...w].every(x=>aliases[a.indexOf(x)].length===1)));
const loss=d=>[...d.values()].reduce((x,y)=>x+y,0)-Math.max(...d.values());
assert.deepEqual(forced.map(([s])=>s),['EA','AET','EOE','EO']);
assert.equal(forced.reduce((n,[,d])=>n+loss(d),0),4);
// Constructive upper bound: each selected spelling is in the Cartesian
// product of the actual rune's aliases, and no extra collisions are introduced.
const replacements=new Map([['ᛝ','ING'],['ᛝᛡ','INGIA'],['ᛡᛇ','IOEO']]);
assert.deepEqual([...replacements].map(([w,s])=>[w,s]),[['ᛝ','ING'],['ᛝᛡ','INGIA'],['ᛡᛇ','IOEO']]);
const assigned=new Map();
for(const w of orig){
  const s=replacements.get(w)||lat(w);
  let states=new Set(['']);
  for(const x of w){
    const next=new Set();
    for(const prefix of states) for(const alias of aliases[a.indexOf(x)]){
      const candidate=prefix+alias;
      if(s.startsWith(candidate)) next.add(candidate);
    }
    states=next;
  }
  assert(states.has(s));
  if(!assigned.has(s)) assigned.set(s,new Map());
  const d=assigned.get(s);d.set(w,(d.get(w)||0)+1);
}
const remaining=[...assigned].filter(([,d])=>d.size>1);
assert.deepEqual(remaining.map(([s])=>s),forced.map(([s])=>s));
assert.equal(remaining.reduce((n,[,d])=>n+loss(d),0),4);
console.log(JSON.stringify({witness:{words:words.length,runes:p57.join('').length,alignment:words.map((w,i)=>[w,p57[i]])},warning:{words:warning.length,runes:sourceWarning.join('').length,errors:0,independentLatin:false},unknown:{groups:orig.length,greedyImpossible:impossible.length,distinctImpossible:new Set(impossible.map(x=>x.w)).size,impossible,forced:forced.map(([s,d])=>({s,variants:[...d],loss:loss(d)})),minimumStationaryErrors:4}},null,2));
