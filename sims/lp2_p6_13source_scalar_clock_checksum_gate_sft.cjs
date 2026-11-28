'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r/g,'');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const signed=read('resources/historical/cicada2016-4gq25-outguess.asc');
const mod=x=>((x%29)+29)%29,half=15;
const H4inv=v=>[mod((v[0]+v[3])*half),mod((v[1]+v[2])*half),mod((v[2]-v[1])*half),mod((v[3]-v[0])*half)];
const H2inv=v=>[mod((v[0]+v[1])*half),mod((v[1]-v[0])*half)];
const tokens=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
function firstRune(word){const s=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/[^A-Z]/g,'');const t=tokens.find(x=>s.startsWith(x.symbol));assert.ok(t);return t.value;}
const clear=signed.split('-----BEGIN PGP SIGNATURE-----')[0];
const words=clear.slice(clear.indexOf('Hello.')).split(/[^A-Za-z0-9]+/u).filter(w=>/^[A-Za-z]+$/u.test(w));
assert.equal(words.length,43);
const selected=words.slice(30,43).map(w=>w.toUpperCase());
assert.deepEqual(selected,['SEEK','AND','YOU','WILL','BE','FOUND','GOOD','LUCK','BEWARE','FALSE','PATHS','VERIFY','OPENPGP']);
const initials=words.slice(30,43).map(firstRune);
assert.deepEqual(initials,[15,24,26,7,17,0,6,20,17,0,13,1,3]);
const hFlat=[];for(let i=0;i<6;i++){const a=initials[i],b=initials[12-i];hFlat.push(mod(a-b),mod(a+b));}hFlat.push(initials[6]);
assert.deepEqual(hFlat,[12,18,23,25,13,10,7,7,0,5,9,20,6]);
const pairs=Array.from({length:6},(_,i)=>hFlat.slice(2*i,2*i+2));
const hPageDS=[...pairs.map(p=>p[0]),hFlat[12],...pairs.slice().reverse().map(p=>p[1])];
const hPageSD=[...pairs.map(p=>p[1]),hFlat[12],...pairs.slice().reverse().map(p=>p[0])];
assert.deepEqual(hPageDS,[12,23,13,7,0,9,6,20,5,7,10,25,18]);
assert.deepEqual(hPageSD,[18,25,10,7,5,20,6,9,0,7,13,23,12]);
const W1=[24,16,14,17],W2=[19],W3=[6,27,15,17],W4=[14,12],F=0;
const q1=H4inv([W1.length+W3.length,F,F,F]),edge=mod(W1[0]-W1[3]);
const q3=H4inv([edge,W2.length,-W2.length,edge]);
const terminal=H2inv([W1[1],mod(W3[0]+W3[3])]);
const keySums=[mod(terminal[1]+W4.length),mod(terminal[0]+W1.length),...q1,mod(-W2[0]),...q3,...terminal];
assert.deepEqual(keySums,[20,9,4,0,0,25,10,7,0,28,0,5,18]);
const specs=[{page:30,start:112,length:4},{page:31,start:126,length:3},{page:32,start:30,length:3},{page:33,start:132,length:4},{page:34,start:4,length:2},{page:35,start:25,length:5},{page:36,start:169,length:5,remove:2},{page:37,start:146,length:4},{page:38,start:57,length:6},{page:39,start:132,length:5},{page:40,start:71,length:4},{page:41,start:178,length:7,remove:3},{page:42,start:211,length:8,remove:1}];
const sums=[],arity=[];for(const s of specs){const p=corpus.pages.find(x=>x.page===s.page);assert.ok(p);let v=p.indices.slice(s.start,s.start+s.length);if(s.remove!==undefined)v=v.filter((_,i)=>i!==s.remove);arity.push(v.length);sums.push(v.reduce((a,b)=>mod(a+b),0));}
assert.deepEqual(arity,[4,3,3,4,2,5,4,4,6,5,4,6,7]);
assert.deepEqual(sums,[18,7,5,28,6,3,16,9,1,18,25,6,6]);
const base={initials,hFlat,hPageDS,hPageSD},clocks=new Map();
for(const [name,t] of Object.entries(base))for(const [dir,v] of [['forward',t],['reverse',t.slice().reverse()]]){const k=v.join(',');if(!clocks.has(k))clocks.set(k,{name:name+':'+dir,v});}
assert.equal(clocks.size,6);
const predictions=new Map();
for(const c of clocks.values())for(const sign of [1,-1]){const candidates={repeatedKey:c.v.map((s,i)=>mod(sign*s*arity[i])),receiverScaledKey:c.v.map((s,i)=>mod(sign*s*sums[i])),receiverScaledPlaintext:c.v.map((s,i)=>mod((1-sign*s)*sums[i]))};for(const [action,pred] of Object.entries(candidates)){const id=pred.join(',');if(!predictions.has(id)){const matched=pred.map((x,i)=>x===keySums[i]?i+30:-1).filter(x=>x>=0);predictions.set(id,{clock:c.name,sign,action,predicted:pred,matchedPages:matched,matches:matched.length});}}}
assert.equal(predictions.size,36);
const rows=[...predictions.values()],hist={};for(const r of rows)hist[r.matches]=(hist[r.matches]||0)+1;
assert.deepEqual(hist,{0:9,1:21,2:6});assert.equal(Math.max(...rows.map(r=>r.matches)),2);assert.equal(rows.filter(r=>r.matches===13).length,0);
for(const t of Object.values(base))assert.ok(t.includes(0));
console.log(JSON.stringify({status:'PASS',classification:'target-rune-blind checksum rejection of simple page-synchronous first-party 13-scalar clocks',sourceWords:selected,sourceInitials:initials,outsideInHFlat:hFlat,pageMappedClocks:{differenceLeftSumRight:hPageDS,sumLeftDifferenceRight:hPageSD},receiverSums:sums,arities:arity,requiredKeySums:keySums,distinctClockOrientations:clocks.size,distinctPredictions:predictions.size,actions:['repeated additive key K_j=+/-s_i','receiver-scaled key K_j=+/-s_i*C_j','receiver-scaled plaintext P_j=+/-s_i*C_j'],checksumHitHistogram:hist,bestMatches:2,exactThirteenPageMatches:0,inverseClockNote:'Every base clock contains zero, so a complete per-page multiplicative inverse clock is undefined.',consequence:'The authenticated source-initial/H13 tape is not the missing corridor serializer under the natural page-synchronous scalar actions or orientations; a successful use requires a genuinely vector/stateful authored clock.'},null,2));
