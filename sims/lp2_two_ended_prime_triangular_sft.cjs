'use strict';
// Director #3131: exact two-ended triangular inverse; distinct from unclocked three-tap collision bound.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json')),solved=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const page=n=>gp.pages.find(p=>p.page===n).indices,mod=x=>(x%29+29)%29;
const primes=[];for(let n=2;primes.length<3008;n++){let ok=true;for(let d=2;d*d<=n;d++)if(n%d===0){ok=false;break}if(ok)primes.push((n-1)%29)}
const plainOf=s=>Array.from(s.source_text).filter(x=>gp.runes.includes(x)).map(x=>gp.runes.indexOf(x));
const p56=plainOf(solved.sections.find(s=>s.name==='p56_an_end'));
const native=solved.sections.filter(s=>!s.name.startsWith('p56')&&!s.name.startsWith('p57')).map(plainOf);
function clockEncode(p,F){let j=0;return p.map(x=>F&&x===0?0:mod(x+primes[j++]))}
function mix(x,a,b){const u=[],c=Array(x.length);for(let i=0;i<x.length;i++)u.push(mod(x[i]+a*(u[i-1]??0)));for(let i=x.length-1;i>=0;i--)c[i]=mod(u[i]+b*(c[i+1]??0));return c}
function unmix(c,a,b){const u=c.map((x,i)=>mod(x-b*(c[i+1]??0)));return u.map((x,i)=>mod(x-a*(u[i-1]??0)))}
function enc(p,a,b,F=false){return mix(clockEncode(p,F),a,b)}
function dec(c,a,b){return unmix(c,a,b).map((x,i)=>mod(x-primes[i]))}
function reach(x,p){let js=new Set([0]),trueJ=0;for(let i=0;i<x.length;i++){const next=new Set();for(const j of js){if(x[i]===0)next.add(j);if(mod(x[i]-primes[j])!==0)next.add(j+1)}js=next;if(p){trueJ+=+(p[i]!==0);assert.ok(js.has(trueJ),'true F path lost')}if(!js.size)return {possible:false,dead:i}}return {possible:true,states:js.size}}
assert.deepEqual(enc(p56,0,0,true),page(56));assert.ok(reach(page(56),p56).possible);
const tri=new Uint32Array(29**3),bi=new Uint32Array(29**2);
for(const s of native)for(let i=2;i<s.length;i++){const j=29*s[i-2]+s[i-1];tri[29*j+s[i]]++;bi[j]++}
const log=Float64Array.from(tri,(v,i)=>Math.log((v+0.5)/(bi[Math.floor(i/29)]+14.5)));
function score(p,start=0,end=p.length){let n=0,s=0;for(let i=Math.max(start+2,2);i<end;i++){s+=log[(29*p[i-2]+p[i-1])*29+p[i]];n++}return s/n}
function fit(c,cut){const rows=[];for(let a=0;a<29;a++)for(let b=0;b<29;b++){const p=dec(c,a,b);rows.push({a,b,train:score(p,0,cut)})}rows.sort((x,y)=>y.train-x.train);const best=rows[0],p=dec(c,best.a,best.b);assert.deepEqual(enc(p,best.a,best.b),c);return {best,runnerUp:rows[1],hold:score(p,cut),p,rows}}
const repeat=c=>c.reduce((s,x,i)=>s+Number(i>0&&x===c[i-1]),0);
const ioc=c=>{const h=new Uint32Array(29);for(const x of c)h[x]++;return h.reduce((s,n)=>s+n*(n-1),0)/(c.length*(c.length-1))};
const donors=[['Shakespeare','resources/control/shakespeare_first300k.txt'],['Gibran','resources/control/gibran_prophet_58585.txt'],['Emerson','resources/control/emerson_essays_2944.txt']].map(([name,f])=>({name,p:encodeSourceNativeGP(read(f))}));
const all54=page(54).concat(page(55)),long=gp.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
assert.equal(all54.length,308);assert.equal(long.length,3008);assert.equal(page(55)[0],21);
const source=[{name:'p54–55 continuous',c:all54,cut:page(54).length},{name:'p40–53 continuous',c:long,cut:1500}];
let rng=0x33013131;function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n}
function stats(values){const m=values.reduce((s,x)=>s+x,0)/values.length;return {min:Math.min(...values),max:Math.max(...values),mean:m,sd:Math.sqrt(values.reduce((s,x)=>s+(x-m)**2,0)/(values.length-1))}}
const results=[];
for(const {name,c,cut} of source){
 const n=c.length,plants=[],wins=[];
 for(let d=0;d<donors.length;d++)for(let w=0;w<8;w++){const start=2000+10000*w+d*71;assert.ok(start+n<=donors[d].p.length);wins.push({donor:donors[d].name,p:donors[d].p.slice(start,start+n)});}
 // Use fixed independently selected donor windows. Blind fit receives ciphertext and boundary only.
 for(let d=0;d<donors.length;d++){
  const p=donors[d].p.slice(113+d*71,113+d*71+n),a=[7,13,19][d],b=[11,5,8][d],ct=enc(p,a,b),f=fit(ct,cut);
  const rank=1+f.rows.filter(r=>r.train>f.rows.find(r=>r.a===a&&r.b===b).train).length;
  const recovered=f.p.reduce((s,x,i)=>s+Number(x===p[i]),0);assert.deepEqual(dec(ct,a,b),p);
  const x=unmix(enc(p,a,b,true),a,b);assert.deepEqual(x,clockEncode(p,true));assert.ok(reach(x,p).possible);
  plants.push({donor:donors[d].name,a,b,rank,recovered,n,hold:f.hold,train:f.best.train,unique:f.rows[0].train>f.rows[1].train,FTruePath:true});
 }
 const repeatObs=repeat(c),iocObs=ioc(c),feature={ordinary:[],F:[]};
 // Every coefficient, same 24 independent donor windows; no fitted repeat parameter.
 for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(const [type,F] of [['ordinary',false],['F',true]]){
  const counts=[],ic=[];for(const w of wins){const ct=enc(w.p,a,b,F);counts.push(repeat(ct));ic.push(ioc(ct))}
  const r=stats(counts),z=stats(ic);feature[type].push({a,b,repeat:r,ioc:z,withinRepeatRange:repeatObs>=r.min&&repeatObs<=r.max,withinIoCRange:iocObs>=z.min&&iocObs<=z.max});
 }
 const nulls=[],lowRepeat=[];
 for(let j=0;j<24;j++){
  const u=Array.from({length:n},()=>rand(29));nulls.push({repeat:repeat(u),ioc:ioc(u)});
  const equalPositions=new Set();while(equalPositions.size<repeatObs)equalPositions.add(1+rand(n-1));
  const v=[rand(29)];for(let i=1;i<n;i++)v.push(equalPositions.has(i)?v[i-1]:mod(v[i-1]+1+rand(28)));
  assert.equal(repeat(v),repeatObs);lowRepeat.push({ioc:ioc(v)});
 }
 const original=fit(c,cut),p=original.p;
 const nativeHold=wins.map(w=>score(w.p,cut)),nativeTrain=wins.map(w=>score(w.p,0,cut));
 // Exact F inverse for all 841 coefficients; no candidate path-score tuning.
 const Frows=[];for(let a=0;a<29;a++)for(let b=0;b<29;b++){const x=unmix(c,a,b);assert.deepEqual(mix(x,a,b),c);Frows.push({a,b,...reach(x)})}
 const fitNulls=[];for(let j=0;j<8;j++){
  const u=Array.from({length:n},()=>rand(29)),f=fit(u,cut);fitNulls.push({train:f.best.train,hold:f.hold});
 }
 const summarize=rs=>({minRepeatAcrossAll:Math.min(...rs.map(x=>x.repeat.min)),maxRepeatAcrossAll:Math.max(...rs.map(x=>x.repeat.max)),repeatRangePass:rs.filter(x=>x.withinRepeatRange).length,jointRangePass:rs.filter(x=>x.withinRepeatRange&&x.withinIoCRange).length,closestRepeat:rs.slice().sort((x,y)=>Math.abs(x.repeat.mean-repeatObs)-Math.abs(y.repeat.mean-repeatObs))[0]});
 results.push({name,n,cut,repeatObs,iocObs,plants,nativeTrain:stats(nativeTrain),nativeHold:stats(nativeHold),original:{best:original.best,runnerUp:original.runnerUp,hold:original.hold,preview:p.slice(0,90).map(x=>gp.translit[x]).join(''),heldPreview:p.slice(cut,cut+90).map(x=>gp.translit[x]).join('')},Fsurvivors:Frows.filter(r=>r.possible),FlatestDead:Frows.filter(r=>!r.possible).sort((x,y)=>y.dead-x.dead)[0],feature:{ordinary:summarize(feature.ordinary),F:summarize(feature.F)},uniformNull:{repeat:stats(nulls.map(x=>x.repeat)),ioc:stats(nulls.map(x=>x.ioc))},matchedLowRepeatNullIoC:stats(lowRepeat.map(x=>x.ioc)),uniformFit:fitNulls,Frows});
}
const output={model:'X=P+prime, U=X+a*previous U, C=U+b*next C; F variant historical bypass at X only',authenticP56:p56.length,results};
fs.writeFileSync(path.join(process.env.RUNNER_TEMP||'.','source-test-output.json'),JSON.stringify(output,null,2));
console.log(JSON.stringify(results.map(({Frows,...r})=>r),null,2));
