"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),assert=require("node:assert/strict");
const read=p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8");
const transcript=read("resources/lp2-transcription.txt"),corpusRaw=read("resources/liber-primus/lp2-corpus.json");
const shake=read("resources/control/shakespeare_first300k.txt"),lp1=read("resources/liber-primus/lp1-plaintext-reference.txt");
const corpus=JSON.parse(corpusRaw),runeMap=new Map(corpus.runes.map((r,i)=>[r,i])),MOD=29,ANCHOR="ᛞᛄᚢ-ᛒᛖᛁ";
const sha=s=>crypto.createHash("sha256").update(s,"utf8").digest("hex");
function ioc(a){if(a.length<2)return null;const f=new Uint32Array(MOD);for(const x of a)f[x]++;let n=0;for(const x of f)n+=x*(x-1);return n/(a.length*(a.length-1));}
const segs=transcript.split("%").slice(0,55),sourcePages=new Map(corpus.pages.map(p=>[p.page,p])),pages=[];
assert.equal(segs.length,55);
for(let si=0;si<segs.length;si++){
 const physical=si<50?si:si+1,lines=[];let pageClock=0;
 const rawLines=segs[si].split(/\r?\n/u);
 for(let lineNumber=0;lineNumber<rawLines.length;lineNumber++){
  const raw=rawLines[lineNumber],symbols=[],pagePos=[],linePos=[],charPos=[],pageStart=pageClock;
  let lineClock=0,charClock=0;
  for(const ch of Array.from(raw)){
   if(runeMap.has(ch)){symbols.push(runeMap.get(ch));pagePos.push(pageClock);linePos.push(lineClock);charPos.push(charClock);pageClock++;lineClock++;charClock++;}
   else if(ch==="/")break;
   else if(/\s/u.test(ch))continue;
   else charClock++;
  }
  if(symbols.length)lines.push({raw,lineNumber,pageStart,symbols,pagePos,linePos,charPos});
 }
 const indices=lines.flatMap(x=>x.symbols);
 assert.deepEqual(indices,sourcePages.get(physical).indices,"transcription mismatch p"+physical);
 pages.push({physical,lines,indices,pagePos:lines.flatMap(x=>x.pagePos),linePos:lines.flatMap(x=>x.linePos),charPos:lines.flatMap(x=>x.charPos)});
}
assert.equal(pages.reduce((n,p)=>n+p.indices.length,0),12956);
const anchors=[];
for(const p of pages)for(const line of p.lines){let at=line.raw.indexOf(ANCHOR);while(at>=0){
 const chars=Array.from(line.raw),before=chars.slice(0,at).filter(ch=>runeMap.has(ch)).length,positions=[];
 for(let i=at;i<chars.length&&positions.length<6;i++)if(runeMap.has(chars[i]))positions.push(i);
 anchors.push({page:p.physical,line:line.lineNumber,char:at,pageRune:line.pageStart+before,lineRune:before,
  pagePhase6:positions.map((_,j)=>(line.pageStart+before+j)%6),
  lineRunePhase6:positions.map((_,j)=>(before+j)%6),lineCharPhase7:positions.map(x=>x%7)});
 at=line.raw.indexOf(ANCHOR,at+1);
}}
assert.equal(anchors.length,2);
assert.deepEqual(anchors.map(x=>[x.page,x.line,x.char,x.pageRune,x.lineRune]),[[27,2,10,28,8],[55,4,3,70,2]]);
assert.deepEqual(anchors[0].pagePhase6,anchors[1].pagePhase6);
assert.deepEqual(anchors[0].lineRunePhase6,anchors[1].lineRunePhase6);
assert.deepEqual(anchors[0].lineCharPhase7,anchors[1].lineCharPhase7);
function phaseStats(field,period){
 const bins=Array.from({length:period},()=>[]);
 for(const p of pages)for(let i=0;i<p.indices.length;i++)bins[p[field][i]%period].push(p.indices[i]);
 const vals=bins.map(ioc).filter(x=>x!==null);
 return {clock:field,period,mean:vals.reduce((a,b)=>a+b,0)/vals.length,min:Math.min(...vals),max:Math.max(...vals),nonempty:vals.length};
}
const phaseIoC=[];
for(const n of [2,3,6,7,14,21,42])phaseIoC.push(phaseStats("pagePos",n));
for(const n of [2,3,6,7,14,21])phaseIoC.push(phaseStats("linePos",n));
for(const n of [2,3,6,7,14,21])phaseIoC.push(phaseStats("charPos",n));
const DG={TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:28};
const L={A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};
function encode(t){const s=t.toUpperCase().replace(/[^A-Z]/gu,""),o=[];for(let i=0;i<s.length;i++){const d=DG[s.slice(i,i+2)];if(d!==undefined){o.push(d);i++;}else o.push(L[s[i]]);}return o;}
function trainLM(t){
 const s=encode(t),u=new Uint32Array(29),b=new Uint32Array(841),tc=new Uint32Array(24389);
 for(let i=0;i<s.length;i++){u[s[i]]++;if(i)b[s[i-1]*29+s[i]]++;if(i>1)tc[(s[i-2]*29+s[i-1])*29+s[i]]++;}
 const uni=new Float64Array(29),bi=new Float64Array(841),tri=new Float64Array(24389);
 for(let c=0;c<29;c++)uni[c]=Math.log((u[c]+1)/(s.length+29));
 for(let a=0;a<29;a++)for(let c=0;c<29;c++)bi[a*29+c]=Math.log((b[a*29+c]+12*Math.exp(uni[c]))/(u[a]+12));
 for(let a=0;a<29;a++)for(let v=0;v<29;v++)for(let c=0;c<29;c++){const ix=(a*29+v)*29+c;tri[ix]=Math.log((tc[ix]+9*Math.exp(bi[v*29+c]))/(b[a*29+v]+9));}
 return {tri,n:s.length};
}
const lm=trainLM(shake.slice(0,240000)),tri=lm.tri,trainPages=pages.filter(p=>p.physical<=27),holdPages=pages.filter(p=>p.physical>=28);
const trainN=trainPages.reduce((n,p)=>n+Math.max(0,p.indices.length-2),0),holdN=holdPages.reduce((n,p)=>n+Math.max(0,p.indices.length-2),0);
function decTable(op){const d=new Uint8Array(841);for(let c=0;c<29;c++)for(let k=0;k<29;k++)d[c*29+k]=op==="vig"?(c-k+29)%29:(k-c+29)%29;return d;}
function scoreRaw(ps){let s=0,n=0;for(const p of ps)for(let i=2;i<p.indices.length;i++){s+=tri[(p.indices[i-2]*29+p.indices[i-1])*29+p.indices[i]];n++;}return s/n;}
function exactPeriod6(op){
 const dec=decTable(op),F=Array.from({length:6},()=>new Float64Array(29**3));
 for(const p of trainPages)for(let i=2;i<p.indices.length;i++){
  const r=(i-2)%6,c0=p.indices[i-2],c1=p.indices[i-1],c2=p.indices[i],f=F[r];
  for(let k0=0;k0<29;k0++){const p0=dec[c0*29+k0];for(let k1=0;k1<29;k1++){const p1=dec[c1*29+k1],base=(p0*29+p1)*29,kb=(k0*29+k1)*29;for(let k2=0;k2<29;k2++)f[kb+k2]+=tri[base+dec[c2*29+k2]];}}
 }
 // Exact factor elimination for F0(k0,k1,k2)+...+F5(k5,k0,k1).
 const G=new Float64Array(29**4),A4=new Uint8Array(29**4),ix4=(a,b,c,d)=>(((a*29+b)*29+c)*29+d);
 for(let k0=0;k0<29;k0++)for(let k2=0;k2<29;k2++)for(let k3=0;k3<29;k3++)for(let k5=0;k5<29;k5++){
  let best=-Infinity,bk4=0;for(let k4=0;k4<29;k4++){const s=F[2][(k2*29+k3)*29+k4]+F[3][(k3*29+k4)*29+k5]+F[4][(k4*29+k5)*29+k0];if(s>best){best=s;bk4=k4;}}
  const ix=ix4(k0,k2,k3,k5);G[ix]=best;A4[ix]=bk4;
 }
 let best=-Infinity,key=null;
 for(let k0=0;k0<29;k0++)for(let k1=0;k1<29;k1++)for(let k2=0;k2<29;k2++)for(let k3=0;k3<29;k3++){
  const base=F[0][(k0*29+k1)*29+k2]+F[1][(k1*29+k2)*29+k3];
  for(let k5=0;k5<29;k5++){const ix=ix4(k0,k2,k3,k5),s=base+G[ix]+F[5][(k5*29+k0)*29+k1];if(s>best){best=s;key=[k0,k1,k2,k3,A4[ix],k5];}}
 }
 function score(ps){let s=0,n=0;for(const p of ps){let a=0,b=0;for(let i=0;i<p.indices.length;i++){const x=dec[p.indices[i]*29+key[i%6]];if(i>=2){s+=tri[(a*29+b)*29+x];n++;}a=b;b=x;}}return s/n;}
 function phrase(p,off){return Array.from({length:6},(_,j)=>corpus.translit[dec[p.indices[off+j]*29+key[(off+j)%6]]]).join(" ");}
 function sample(p,n){return p.indices.slice(0,n).map((x,i)=>corpus.translit[dec[x*29+key[i%6]]]).join(" ");}
 const p27=pages.find(p=>p.physical===27),p55=pages.find(p=>p.physical===55);
 return {operation:op==="vig"?"Vigenere P=C-K":"Beaufort P=K-C",key,keyNames:key.map(x=>corpus.translit[x]),
  exactTrainingMaximum:best/trainN,holdoutScore:score(holdPages),trainingTrigrams:trainN,holdoutTrigrams:holdN,
  p27AnchorPlain:phrase(p27,28),p55AnchorPlain:phrase(p55,70),
  p28Sample:sample(pages.find(p=>p.physical===28),90),p55Sample:sample(p55,76)};
}
function scorePlain(a){let s=0;for(let i=2;i<a.length;i++)s+=tri[(a[i-2]*29+a[i-1])*29+a[i]];return s/(a.length-2);}
const p57=sourcePages.get(57).indices,lp1Symbols=encode(lp1),all=pages.flatMap(p=>p.indices);
const output={
 sourceHashes:{transcript:sha(transcript),corpus:sha(corpusRaw),shakespeare:sha(shake)},
 source:{pages:pages.length,runes:all.length,printedLines:pages.reduce((n,p)=>n+p.lines.length,0),trainingPages:trainPages.length,holdoutPages:holdPages.length,trainingTrigrams:trainN,holdoutTrigrams:holdN},
 repeatedAnchor:{text:ANCHOR,occurrences:anchors},fullCiphertextIoc:ioc(all),phaseIoC,
 languageControls:{modelTrainingSymbols:lm.n,rawTrainingScore:scoreRaw(trainPages),rawHoldoutScore:scoreRaw(holdPages),
  p57:{runes:p57.length,ioc:ioc(p57),trigramScore:scorePlain(p57)},lp1:{runes:lp1Symbols.length,ioc:ioc(lp1Symbols),trigramScore:scorePlain(lp1Symbols)}},
 exactPeriod6PageReset:[exactPeriod6("vig"),exactPeriod6("beaufort")]
};
console.log(JSON.stringify(output,null,2));
