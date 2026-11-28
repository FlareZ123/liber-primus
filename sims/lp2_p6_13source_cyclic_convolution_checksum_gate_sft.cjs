'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),mod=x=>((x%29)+29)%29,half=15;
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const signed=fs.readFileSync(path.join(root,'resources/historical/cicada2016-4gq25-outguess.asc'),'utf8');
const tokens=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
function firstRune(word){const s=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/[^A-Z]/g,'');const t=tokens.find(x=>s.startsWith(x.symbol));assert.ok(t);return t.value;}
const clear=signed.split('-----BEGIN PGP SIGNATURE-----')[0],words=clear.slice(clear.indexOf('Hello.')).split(/[^A-Za-z0-9]+/u).filter(w=>/^[A-Za-z]+$/u.test(w));
const initials=words.slice(30,43).map(firstRune);assert.deepEqual(initials,[15,24,26,7,17,0,6,20,17,0,13,1,3]);
const hFlat=[];for(let i=0;i<6;i++){hFlat.push(mod(initials[i]-initials[12-i]),mod(initials[i]+initials[12-i]));}hFlat.push(initials[6]);
const pairs=Array.from({length:6},(_,i)=>hFlat.slice(2*i,2*i+2));
const hPageDS=[...pairs.map(p=>p[0]),hFlat[12],...pairs.slice().reverse().map(p=>p[1])],hPageSD=[...pairs.map(p=>p[1]),hFlat[12],...pairs.slice().reverse().map(p=>p[0])];
const base={initials,hFlat,hPageDS,hPageSD},clocks=new Map();for(const [name,t] of Object.entries(base))for(const [dir,v] of [['forward',t],['reverse',t.slice().reverse()]]){const id=v.join(',');if(!clocks.has(id))clocks.set(id,{name:name+':'+dir,v});}assert.equal(clocks.size,6);
const W1=[24,16,14,17],W2=[19],W3=[6,27,15,17],W4=[14,12],F=0;
const H4inv=v=>[mod((v[0]+v[3])*half),mod((v[1]+v[2])*half),mod((v[2]-v[1])*half),mod((v[3]-v[0])*half)],H2inv=v=>[mod((v[0]+v[1])*half),mod((v[1]-v[0])*half)];
const q1=H4inv([W1.length+W3.length,F,F,F]),edge=mod(W1[0]-W1[3]),q3=H4inv([edge,W2.length,-W2.length,edge]),terminal=H2inv([W1[1],mod(W3[0]+W3[3])]);
const keySums=[mod(terminal[1]+W4.length),mod(terminal[0]+W1.length),...q1,mod(-W2[0]),...q3,...terminal];assert.deepEqual(keySums,[20,9,4,0,0,25,10,7,0,28,0,5,18]);
const specs=[{p:30,s:112,n:4},{p:31,s:126,n:3},{p:32,s:30,n:3},{p:33,s:132,n:4},{p:34,s:4,n:2},{p:35,s:25,n:5},{p:36,s:169,n:5,r:2},{p:37,s:146,n:4},{p:38,s:57,n:6},{p:39,s:132,n:5},{p:40,s:71,n:4},{p:41,s:178,n:7,r:3},{p:42,s:211,n:8,r:1}];
const receiverSums=specs.map(s=>{let v=corpus.pages.find(x=>x.page===s.p).indices.slice(s.s,s.s+s.n);if(s.r!==undefined)v=v.filter((_,i)=>i!==s.r);return v.reduce((a,b)=>mod(a+b),0);});assert.deepEqual(receiverSums,[18,7,5,28,6,3,16,9,1,18,25,6,6]);
const conv=(k,x)=>x.map((_,i)=>k.reduce((sum,a,j)=>mod(sum+a*x[mod(i-j)]),0));
function solve(A,b){const n=A.length,m=A.map((r,i)=>r.map(mod).concat([mod(b[i])]));for(let c=0;c<n;c++){let p=-1;for(let r=c;r<n;r++)if(m[r][c]){p=r;break;}if(p<0)return null;[m[c],m[p]]=[m[p],m[c]];let iv=1;while(mod(m[c][c]*iv)!==1)iv++;m[c]=m[c].map(x=>mod(x*iv));for(let r=0;r<n;r++)if(r!==c){const f=m[r][c];m[r]=m[r].map((x,j)=>mod(x-f*m[c][j]));}}return m.map(r=>r[n]);}
const invConv=(k,x)=>solve(Array.from({length:x.length},(_,i)=>Array.from({length:x.length},(_,j)=>k[mod(i-j)])),x);
const predictions=new Map(),invertible=[];for(const c of clocks.values()){const forward=conv(c.v,receiverSums),inverse=invConv(c.v,receiverSums);invertible.push([c.name,inverse!==null]);assert.ok(inverse);for(const [inv,y] of [[false,forward],[true,inverse]])for(const sign of [1,-1])for(const action of ['key','plaintext']){const z=y.map(v=>mod(sign*v)),pred=action==='key'?z:receiverSums.map((v,i)=>mod(v-z[i])),id=pred.join(',');if(!predictions.has(id)){const hit=pred.map((v,i)=>v===keySums[i]?i+30:-1).filter(v=>v>=0);predictions.set(id,{clock:c.name,inverse:inv,sign,action,predicted:pred,matchedPages:hit,matches:hit.length});}}}
assert.equal(predictions.size,48);const rows=[...predictions.values()],hist={};for(const r of rows)hist[r.matches]=(hist[r.matches]||0)+1;assert.deepEqual(hist,{0:28,1:14,2:6});assert.equal(Math.max(...rows.map(r=>r.matches)),2);
console.log(JSON.stringify({status:'PASS',classification:'target-rune-blind whole-corridor cyclic source-tape convolution rejection',distinctClockOrientations:clocks.size,allCirculantsInvertible:invertible.every(x=>x[1]),distinctPredictions:predictions.size,checksumHitHistogram:hist,bestMatches:2,exactThirteenPageMatches:0,decision:'Neither forward nor inverse whole-corridor cyclic convolution by any natural source-initial/H13 tape orientation supplies the frozen page-key-sum tape. The source tape needs a different authored vector/state transition.'},null,2));
