'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const gold=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const lp1=read('resources/transcriptions/lp1_wulfic_canonical.txt');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const lp2=read('resources/transcriptions/lp2-image-corrected.txt');
const wordfreq=read('resources/control/english_wordfreq_textblob.txt');
const ri=new Map(corpus.runes.map((r,i)=>[r,i]));
/** @param {string} s @param {boolean} native */
function parse(s,native=false){let c=[],g=[2],seams=[];for(const ch of s){if(ri.has(ch)){c.push(ri.get(ch));g.push(0)}else if(!native&&['/','%'].includes(ch)){seams.push(c.length)}else if(ch==='-'||ch==='•'){g[c.length]=Math.max(1,g[c.length])}else if(!/\s/u.test(ch)){g[c.length]=2}}g[c.length]=2;return{c,g,seams}}
/** @param {number[]} g @param {number[]} seams */
function swap(g,seams){const a=g.slice(),set=new Set(seams),moves=[];for(const b of [...set].sort((a,b)=>a-b)){if(b<2||b>g.length-3||g[b]!==0||g[b-1]===2||g[b+1]===2||[b-2,b-1,b+1,b+2].some(z=>set.has(z)))continue;const v=a[b-1];a[b-1]=a[b+1];a[b+1]=v;if(a[b-1]!==v)moves.push(b)}return{g:a,moves}}
/** @param {number[]} g */
function groups(g){let l=0,a=[];for(let r=1;r<g.length;r++)if(g[r]){a.push([l,r]);l=r}return a}
const d=(a,b)=>{assert.equal(a.length,b.length);return a.filter((x,i)=>x!==b[i]).length};
const norm=w=>w.toUpperCase().replaceAll('QU','CW').replaceAll('V','U').replace(/[KQ]/g,'C').replaceAll('Z','S');
const t=corpus.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
/** @param {string} w @param {boolean} special */
function spell(w,special){w=norm(w);let a=[];for(let i=0;i<w.length;){const v=special&&w.slice(i,i+3)==='ING'?['ING',21]:special&&w.slice(i,i+2)==='IO'?['IO',27]:t.find(([s])=>w.startsWith(s,i));if(!v)return null;a.push(v[1]);i+=v[0].length}return a}
const lex=new Set();
for(const line of wordfreq.split('\n')){const w=line.match(/^([a-z]+) \d+/)?.[1];if(w)for(const f of [false,true]){const a=spell(w,f);if(a)lex.add(a.join(','))}}
for(const sec of gold.sections)if(!['0_welcome','p56_an_end'].includes(sec.name)){const p=parse(sec.source_text,true);for(const [l,r] of groups(p.g))lex.add(p.c.slice(l,r).join(','))}
for(let i=0;i<29;i++)lex.add(String(i));
/** @param {number[]} p @param {(j:number)=>number} k */
function enc(p,k){let j=0;return p.map(x=>x===0?0:(x+k(j++))%29)}
/** @param {number[]} c @param {number[]} g @param {(j:number)=>number} k */
function solve(c,g,k){let states=new Map([[0,0]]);for(const [l,r] of groups(g)){let next=new Map();for(const [start,cost] of states){let paths=[[start,[]]];for(let i=l;i<r;i++){const out=[];for(const [j,p] of paths){if(c[i]===0)out.push([j,[...p,0]]);const a=(c[i]-k(j)+29)%29;if(a)out.push([j+1,[...p,a]])}paths=out}for(const [j,p] of paths){const v=cost+(lex.has(p.join(','))?0:1);if(v<(next.get(j)??Infinity))next.set(j,v)}}states=next;if(!states.size)return Infinity}return Math.min(...states.values())}
const primes=[];for(let n=2;primes.length<100;n++)if(primes.every(p=>p*p>n||n%p))primes.push(n);
const tests=[['0_welcome',lp1.split('%').slice(1,3).join('%'),j=>[23,10,1,10,9,10,16,26][j%8]],['p56_an_end',lp2.split('%')[55],j=>(primes[j]-1)%29]];
const out=[];
for(const [name,ct,k] of tests){const truth=parse(gold.sections.find(s=>s.name===name).source_text,true),printed=parse(ct),c=enc(truth.c,k),seams=printed.seams;
const nativeG=truth.g,realG=printed.g;const nativeBreaks=nativeG.map(Boolean),realBreaks=realG.map(Boolean);
const moved=swap(nativeG,seams);const lens=groups(nativeG).map(([l,r])=>r-l).reverse();let decoy=Array(nativeG.length).fill(0);decoy[0]=2;let pos=0;for(const l of lens){pos+=l;decoy[pos]=1}decoy[pos]=2;
const score=g=>solve(c,g,k);
const variants=[['intact',nativeG],['partial',moved.g],['decoy',decoy]].map(([v,g])=>({v,identity:score(g),carry:score(swap(g,seams).g),truthGapDiff:d(g,nativeG),afterGapDiff:d(swap(g,seams).g,nativeG)}));
const replayErrors=d(c,printed.c),printedNativeBreakDifferences=d(nativeBreaks,realBreaks),involution=d(swap(moved.g,seams).g,nativeG);
assert.equal(replayErrors,0);assert.equal(printedNativeBreakDifferences,0);assert.equal(involution,0);
out.push({name,runes:c.length,replayErrors,printedNativeBreakDifferences,moves:moved.moves.length,involution,variants});
}
assert.equal(lex.size,33389);
assert.deepEqual(out.map(x=>x.variants.map(y=>[y.identity,y.carry])),[[[2,14],[14,2],[100,98]],[[1,1],[1,1],[16,15]]]);
console.log(JSON.stringify({lex:lex.size,out},null,2));
