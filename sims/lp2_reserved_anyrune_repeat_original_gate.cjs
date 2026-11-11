'use strict';
/** Original-LP2 fixed reserved-repeat symbol test. Node 22, CommonJS. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} p */
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const tr=new Map(corpus.translit.map((s,i)=>[s,i]));
const paths=['resources/liber-primus/lp1-plaintext-reference.txt','resources/control/shakespeare_first300k.txt','resources/control/gibran_prophet_58585.txt','resources/control/emerson_essays_2944.txt'];
/** @param {string} token @returns {number[]} */
function encodeWord(token){
 const s=token.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S'),out=[];
 for(let i=0;i<s.length;){const pair=s.slice(i,i+2);if(tr.has(pair)){out.push(tr.get(pair));i+=2;}else{if(tr.has(s[i]))out.push(tr.get(s[i]));i++;}}
 return out;
}
/** @returns {number[][]} */
function originalWords(){
 const input=read('resources/lp2-transcription.txt').split('%').slice(0,55).join('%'),out=[];
 let w=[],previous=null;
 function finish(){if(w.length){out.push(w);w=[];}}
 for(const c of input){if(/[\u16A0-\u16FF]/u.test(c)){w.push(Number(previous===c));previous=c;}
 else if(c==='%'||c==='/'||/\s/u.test(c)){}else finish();}
 finish();return out;
}
/** @param {string} filename */
function pools(filename){
 const bins=Array.from({length:15},()=>[]);
 for(const token of read(filename).replace(/^#.*$/gm,'').match(/[A-Za-z]+/g)||[]){
 const w=encodeWord(token);if(w.length&&w.length<=14)bins[w.length].push(w);}
 return bins;
}
/** @param {number[][]} words */
function counts(words){let c=[0,0,0];for(const w of words)for(let j=0;j<w.length;j++)if(w[j]){c[0]++;c[1]+=Number(j===0);c[2]+=Number(j===w.length-1);}return c;}
/** @param {number[]} hist @param {number[][][]} bins @param {number} symbol */
function moments(hist,bins,symbol){
 const mean=[0,0,0],variance=[0,0,0];
 for(let L=1;L<=14;L++)if(hist[L]){
 const pool=bins[L];assert(pool.length);
 let sums=[0,0,0],squares=[0,0,0];
 for(const w of pool){const x=[w.filter(t=>t===symbol).length,Number(w[0]===symbol),Number(w.at(-1)===symbol)];
 for(let k=0;k<3;k++){sums[k]+=x[k];squares[k]+=x[k]*x[k];}}
 for(let k=0;k<3;k++){const m=sums[k]/pool.length;mean[k]+=hist[L]*m;variance[k]+=hist[L]*Math.max(0,squares[k]/pool.length-m*m);}}
 return {mean,sd:variance.map(Math.sqrt)};
}
/** @param {number[]} observed @param {{mean:number[],sd:number[]}} m */
function score(observed,m){
 return Math.min(...[observed,[observed[0]+1,observed[1]+1,observed[2]]].map(v=>
 Math.max(...v.map((x,k)=>m.sd[k]?Math.abs((x-m.mean[k])/m.sd[k]):(x===m.mean[k]?0:Infinity)))));
}
/** @param {number[][]} words @param {number[][][][]} all */
function misses(words,all){
 const unique=Array.from({length:15},()=>new Set());
 for(const bins of all)for(let L=1;L<=14;L++)for(const w of bins[L])unique[L].add(w.join(','));
 return corpus.translit.map((symbol,s)=>{
 const valid=Array.from({length:15},()=>new Set());
 for(let L=1;L<=14;L++)for(const w of unique[L])
 valid[L].add(w.split(',').map(v=>Number(Number(v)===s)).join(''));
 let missing=0;
 for(let j=0;j<words.length;j++){const p=words[j].join(''),set=valid[words[j].length];
 if(!set.has(p)&&(j!==0||!set.has('1'+p.slice(1))))missing++;}
 return {symbol,missing};
 });
}
/** @param {number} n */
const mod28=n=>((n%28)+28)%28;
/** @param {number[]} plain @param {number} s */
function forward(plain,s){let prev=0;return plain.map(p=>{
 const allowed=Array.from({length:29},(_,i)=>i).filter(x=>x!==prev);
 const c=p===s?prev:allowed[(5*(p<s?p:p-1)+11)%28];prev=c;return c;});}
/** @param {number[]} cipher @param {number} s */
function inverse(cipher,s){let prev=0;return cipher.map(c=>{
 const allowed=Array.from({length:29},(_,i)=>i).filter(x=>x!==prev);
 let p;if(c===prev)p=s;else{const k=mod28(17*(allowed.indexOf(c)-11));p=k>=s?k+1:k;}
 prev=c;return p;});}
const words=originalWords(),obs=counts(words),hist=Array(15).fill(0);
for(const w of words)hist[w.length]++;
assert.deepEqual([words.length,words.reduce((a,b)=>a+b.length,0),...obs],[2896,12956,86,23,19]);
const all=paths.map(pools);
const referenceResults=all.map((bins,i)=>{
 const candidates=corpus.translit.map((symbol,s)=>({symbol,...moments(hist,bins,s)}))
 .map(x=>({symbol:x.symbol,score:score(obs,x),means:x.mean.map(v=>+v.toFixed(3)),
 sd:x.sd.map(v=>+v.toFixed(3))})).sort((a,b)=>a.score-b.score);
 assert(candidates[0].score>6.0);
 return {source:paths[i],best:candidates.slice(0,4)};
});
const unmatched=misses(words,all);
assert.equal(unmatched.find(x=>x.symbol==='EA').missing,14);
assert.equal(unmatched.find(x=>x.symbol==='NG').missing,28);
let seed=0x390012;
/** @returns {number} */
function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
for(const bins of all){
 const plain=[];for(const w of words)plain.push(...bins[w.length][rng()%bins[w.length].length]);
 assert.equal(plain.length,12956);
 for(let s=0;s<29;s++){const cipher=forward(plain,s),recovered=inverse(cipher,s);
 assert.deepEqual(recovered,plain);
 for(let i=1;i<cipher.length;i++)assert.equal(cipher[i]===cipher[i-1],plain[i]===s);}
}
console.log(JSON.stringify({original:{words:words.length,runes:12956,repeatVector:obs},
 referenceResults,finiteDictionaryMissing:unmatched,positiveControlStreams:116},null,2));
