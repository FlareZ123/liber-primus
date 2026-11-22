'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n');
const c=JSON.parse(read('resources/liber-primus/lp2-corpus.json')),ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const pages=read('resources/liber-primus/lp2-transcription.txt').split(/\n%\s*\n/),{encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
const mod=(x,m)=>((x%m)+m)%m,page=n=>c.pages.find(p=>p.page===n).indices,p7=page(7),p8=page(8),p57=page(57);
assert.equal(p7.length,208);assert.equal(p8.length,255);assert.equal(p57.length,95);
const ri=new Map(c.runes.map((r,i)=>[r,i]));
function redWords(n){const a=ink.pages.find(p=>p.page===n),out=[];let off=0,start=0,run=[];function flush(){if(!run.length)return;const s=(a.red_spans||[]).find(x=>start>=x.start&&start+run.length<=x.start+x.length);if(s)out.push({start,indices:run});run=[];}for(const ch of pages[n]){const i=ri.get(ch);if(i!==undefined){if(!run.length)start=off;run.push(i);off++;}else if(ch==='-'||ch==='.')flush();}flush();return out;}
const words=redWords(7);assert.deepEqual(words.map(w=>w.indices),[[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]]);
assert.deepEqual(ink.pages.find(p=>p.page===7).red_spans,[{start:194,length:14}]);assert.deepEqual(ink.pages.find(p=>p.page===8).red_spans,[{start:0,length:12}]);
const products=words.map(w=>w.indices.reduce((v,x)=>mod(v*x,29),1));assert.deepEqual(products,[11,26,8,15,2]);
const p=words[0].indices[0],g=words[2].indices[0],K=products[4];assert.deepEqual([p,g,K],[23,5,2]);
const body=p8.slice(12),cycles=products[0];assert.equal(body.length,243);assert.equal(cycles,11);assert.equal(body.length,cycles*(p-1)+1);
function powmod(a,n,m){let v=1;while(n){if(n&1)v=mod(v*a,m);a=mod(a*a,m);n>>=1;}return v;}
let order=1;while(powmod(g,order,p)!==1)order++;assert.equal(order,22);assert.equal(powmod(g,11,p),22);
const keyAt=j=>mod(K*powmod(g,j,p),p),stream=Array.from({length:body.length},(_,i)=>keyAt(i));assert.equal(stream[22],stream[0]);
const dec=(ct,s)=>ct.map((x,i)=>mod(x+s*stream[i],29)),enc=(pt,s)=>pt.map((x,i)=>mod(x-s*stream[i],29));
function dp(ct,s){let states=[{j:0,p:[]}];for(const x of ct){const next=[];for(const st of states){const k=keyAt(st.j);if(x!==0){const v=mod(x+s*k,29);if(v!==0)next.push({j:st.j+1,p:st.p.concat(v)});}else{next.push({j:st.j,p:st.p.concat(0)});const v=mod(s*k,29);if(v!==0)next.push({j:st.j+1,p:st.p.concat(v)});}}states=next;}return states;}
function encF(pt,s){let j=0;return pt.map(x=>x===0?0:mod(x-s*keyAt(j++),29));}
const ref=read('resources/liber-primus/lp1-plaintext-reference.txt'),training=[];
for(const para of ref.split(/\n\s*\n/)){const seq=[];for(const w of para.split('\n').filter(x=>!x.trim().startsWith('#')&&!x.trim().startsWith('[')).join(' ').match(/[A-Za-z]+/g)||[]){const a=encodeSourceNativeGP(w);if(a.length)seq.push(...a);}if(seq.length>=3)training.push(seq);}
const tri=new Map();let total=0;for(const a of training)for(let i=2;i<a.length;i++){const k=a.slice(i-2,i+1).join(',');tri.set(k,(tri.get(k)||0)+1);total++;}
const den=total+0.1*29**3,score=a=>{let v=0;for(let i=2;i<a.length;i++)v+=Math.log(((tri.get(a.slice(i-2,i+1).join(','))||0)+0.1)/den);return v/(a.length-2);};
const native=[];for(const a of training)for(let i=0;i+243<=a.length;i++)native.push(score(a.slice(i,i+243)));native.sort((a,b)=>a-b);assert.equal(native.length,710);
const ordinary=[],transparent=[];for(const s of [-1,1]){const plain=dec(body,s);assert.deepEqual(enc(plain,s),body);ordinary.push({direction:s<0?'C-K':'C+K',score:score(plain),first100:plain.slice(0,100).map(x=>c.translit[x]).join('')});const states=dp(body,s),ranked=states.map(x=>({j:x.j,score:score(x.p),first100:x.p.slice(0,100).map(v=>c.translit[v]).join('')})).sort((a,b)=>b.score-a.score);transparent.push({direction:s<0?'C-K':'C+K',valid_paths:states.length,best:ranked[0]||null});}
const planted=Array.from({length:243},(_,i)=>p57[i%p57.length]),positive=[];for(const s of [-1,1]){const states=dp(encF(planted,s),s),found=states.some(x=>x.p.every((v,i)=>v===planted[i]));assert(found);positive.push({direction:s<0?'C-K':'C+K',candidate_count:states.length,planted_recovered:found});}
console.log(JSON.stringify({p,g,K,products,order,period:22,key_first22:stream.slice(0,22),body_length:243,cycles_from_first_red_word_product:cycles,body_relation:'243=11*(23-1)+1',F:body.filter(x=>x===0).length,native_windows:native.length,native_min_median_max:[native[0],native[355],native[709]],ordinary,exact_p56_transparent_DP:transparent,positive},null,2));
