"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const source = JSON.parse(fs.readFileSync(path.join(ROOT,"resources","liber-primus","lp2-corpus.json"),"utf8"));
const lexiconText = fs.readFileSync(path.join(ROOT,"resources","control","english_wordfreq_textblob.txt"),"utf8");
const grid = source.pages.filter(p => p.page <= 2).flatMap(p => p.indices);
const alphabet = source.translit, prime = source.prime;
assert.equal(grid.length,729); assert.equal(alphabet.length,29); assert.equal(prime.length,29);
const mod=(n,m)=>((n%m)+m)%m;
function phi(n){assert.ok(Number.isInteger(n)&&n>0);let r=n,x=n;for(let p=2;p*p<=x;p++){if(x%p)continue;while(x%p===0)x/=p;r-=r/p;}if(x>1)r-=r/x;return Math.round(r);}
function mu(n){assert.ok(Number.isInteger(n)&&n>0);let r=1,x=n;for(let p=2;p*p<=x;p++){if(x%p)continue;x/=p;r=-r;if(x%p===0)return 0;while(x%p===0)x/=p;}return x>1?-r:r;}
function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}
const n0=([r,c])=>27*(r-1)+c, n1=([r,c])=>27*(c-1)+28-r;
const n2=c=>730-n0(c), n3=c=>730-n1(c);
const coord=i=>[Math.floor(i/27)+1,i%27+1];
const glyph=c=>grid[n0(c)-1], symbols=a=>a.map(i=>alphabet[i]).join("-");
const leftmost=cells=>cells.reduce((a,b)=>b[1]<a[1]||(b[1]===a[1]&&b[0]>a[0])?b:a);
const rayOffset=(a,b)=>{const dr=Math.abs(b[0]-a[0]),dc=Math.abs(b[1]-a[1]);return Math.min(dr,dc,Math.abs(dr-dc));};

/* Frozen provisional p0 opening state, independently checked against corpus. */
const node1Positions=[334,335,336], node1=node1Positions.map(i=>grid[i]);
assert.equal(symbols(node1),"AE-J-EA");
const key1=[node1[0],phi(node1[1]),node1[2]];
assert.equal(symbols(key1),"AE-I-EA");
const sig1=key1.map(k=>mu(phi(k)));
assert.deepEqual(sig1,[0,0,0]);
const block1Positions=[348,349,350,351,352,353,354], C=block1Positions.map(coord);
assert.deepEqual(C,[[13,25],[13,26],[13,27],[14,1],[14,2],[14,3],[14,4]]);
const cipher1=block1Positions.map(i=>grid[i]), plain1=cipher1.map((v,j)=>mod(v-key1[j%3],29));
assert.equal(symbols(cipher1),"L-AE-N-TH-P-U-X");
assert.equal(symbols(plain1),"A-S-I-G-O-TH-E");

/* Freeze S=0, a=0 and derive Reports 01-15 from block01 only. */
const B=C[0],E=C[C.length-1],L=leftmost(C),M=[13,12],Z=[13,13],h=node1[1];
const phase=0,S=0,mirror=Number(node1[0]===node1[2]);
const mobiusSum=C.reduce((s,c)=>s+mu(n0(c)),0);
const nextPhase=mod(1+mobiusSum,3),nextOuter=mod(mu(n1(L)),2),nextSignature=[nextOuter,0,nextOuter];
assert.deepEqual([mobiusSum,nextPhase,nextOuter,nextSignature],[-2,2,1,[1,0,1]]);

/* Reports 02-03: next ciphertext axis and reading boundary. */
const A3=n2(B)+n0(M),G3=gcd(n1(E),n2(E)),q3=mu(A3)+mu(G3);
const nextCipherAxis=q3===0?"horizontal":q3>0?"vertical":"diagonal";
const leftmostFirst=mod(mu(n3(E))+phi(h),2)===1;
assert.deepEqual([A3,G3,q3,n3(E),Number(leftmostFirst)],[717,5,0,635,1]);
assert.equal(nextCipherAxis,"horizontal");

/* Report 04: next key-center parity. */
const centerRowParity=mod(1+B[1]+E[0]+M[0]+mu(n2(B)),2);
const centerColParity=mod(1+B[0]+E[0]+M[0],2);
assert.deepEqual([centerRowParity,centerColParity],[0,1]);

/* Report 05: next ciphertext row parities. */
const endpointRowParity=mod(1+phase+mu(n2(M)),2);
const leftRowParity=mod(centerRowParity+1+phase+mu(M[0]),2);
assert.deepEqual([endpointRowParity,leftRowParity],[0,0]);

/* Reports 06 and 12: exact ray offset. */
const allowance=Number(mu(n0(E))===0&&mu(n3(E))===0);
const beginBit=Number(mu(n0(B))===0&&mu(n1(B))===0);
const exactDeviation=allowance*(1-beginBit);
assert.deepEqual([allowance,beginBit,exactDeviation],[0,0,0]);

/* Report 07: next source node is mirror. */
const mirrorDistance=Math.max(Math.abs(Z[0]-L[0]),Math.abs(Z[1]-L[1]));
const nextMirror=mirrorDistance%3!==2;
assert.deepEqual([mirrorDistance,Number(nextMirror)],[12,1]);

/* Report 09: next ciphertext leftmost-column parity. */
const sum90=C.reduce((s,c)=>s+mu(n1(c)),0),centerTerm=mu(n2(M));
const leftColParity=mod(B[0]+sum90+mirror+centerTerm,2);
assert.deepEqual([sum90,centerTerm,leftColParity],[2,1,0]);

/* Report 11: no multiple-of-seven threshold is skipped. */
const skipsSeven=nextPhase===2&&S%7===6;
assert.equal(skipsSeven,false);

/* Report 13: next key-node axis group. */
const X13=n1(M)+n2(Z),Y13=n1(L)+n2(Z);
const axisGroup=Number((mu(X13)<0)===(mu(Y13)<0));
assert.deepEqual([X13,Y13,mu(X13),mu(Y13),axisGroup],[705,407,-1,1,0]);

/* Report 14: exact next key-node axis. */
const G14=gcd(n1(M),n3(Z)),T14=node1.reduce((s,k)=>s+prime[k],0),A14=n0(M)+n3(Z);
const diagonalBit=Number(mu(G14)<0)^Number(mu(T14)>0)^Number(mu(A14)!==0);
const axisNumber=2*axisGroup+diagonalBit,nextKeyAxis=["horizontal","NW-SE","vertical","NE-SW"][axisNumber];
assert.deepEqual([G14,T14,A14,mu(G14),mu(T14),mu(A14),axisNumber,nextKeyAxis],[1,247,727,1,1,-1,0,"horizontal"]);

/* Report 15: next key-node radius parity. */
const radiusA=(Math.abs(M[0]-B[0])+Math.abs(M[1]-B[1]))%2;
const radiusG=gcd(n2(Z),n2(L)),radiusB=Number(mu(radiusG)<0);
const radiusS=n1(B)+n1(E),radiusC=Number(mu(radiusS)>0);
const radiusParity=radiusA^radiusB^radiusC;
assert.deepEqual([radiusA,radiusG,mu(radiusG),radiusS,mu(radiusS),radiusParity],[1,3,-1,758,1,1]);

/* Published block02 is a comparison fixture, not a selector input. */
const publishedNodePositions=[354,355,356],publishedNode=publishedNodePositions.map(i=>grid[i]);
assert.equal(symbols(publishedNode),"X-OE-X");
const publishedKey=[publishedNode[0],phi(publishedNode[1]),publishedNode[2]];
const publishedSig=publishedKey.map(k=>mu(phi(k)));
assert.deepEqual(publishedSig,nextSignature);
const publishedAligned=[publishedKey[2],publishedKey[0],publishedKey[1]];
assert.equal(symbols(publishedAligned),"X-X-I");
const publishedPathPositions=[364,365,366,367,368],publishedPath=publishedPathPositions.map(coord);
assert.deepEqual(publishedPath,[[14,14],[14,15],[14,16],[14,17],[14,18]]);
const publishedCipher=publishedPathPositions.map(i=>grid[i]);
const publishedPlain=publishedCipher.map((v,j)=>mod(v-publishedAligned[j%3],29));
assert.equal(publishedPlain.map(i=>alphabet[i]).join(""),"WEATHER");

/* Report 10 squarefree-GCD conditions. */
function report10(center,cells){
 const Bp=cells[0],Ep=cells[cells.length-1],Lp=leftmost(cells);
 const gcds=[gcd(n0(center),n0(Bp)),gcd(n0(center),n0(Lp)),gcd(n1(center),n3(Ep)),gcd(n0(center),n2(Ep))];
 return {gcds,mobius:gcds.map(mu),passes:gcds.every(g=>mu(g)!==0)};
}

/* Fixed TextBlob word-frequency lexicon; only A/I are 1-rune words. */
const tokens=alphabet.map((token,index)=>({token,index})).sort((a,b)=>b.token.length-a.token.length);
function encodeWord(word){
 const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S"),out=[];
 for(let i=0;i<s.length;){const t=tokens.find(x=>s.startsWith(x.token,i));if(!t)return null;out.push(t.index);i+=t.token.length;}
 return out;
}
const dictionary=new Map();
for(const line of lexiconText.split(/\r?\n/)){
 if(!line||line.startsWith(";;;"))continue;
 const fields=line.trim().split(/\s+/);
 if(fields.length<2||!/^[A-Za-z]+$/.test(fields[0]))continue;
 const word=fields[0].toUpperCase(),frequency=Number(fields[1]);
 if(!Number.isFinite(frequency)||frequency<10)continue;
 const encoded=encodeWord(word);
 if(!encoded||encoded.length===0)continue;
 if(encoded.length===1&&word!=="A"&&word!=="I")continue;
 dictionary.set(encoded.join(","),{word,frequency});
}
function segment(runes){
 const dp=Array(runes.length+1).fill(null);dp[0]=[];
 for(let i=0;i<runes.length;i++){if(dp[i]===null)continue;for(let j=i+1;j<=runes.length;j++){
  const entry=dictionary.get(runes.slice(i,j).join(","));
  if(entry&&dp[j]===null)dp[j]=dp[i].concat(entry.word);
 }}
 return dp[runes.length];
}

/* Enumerate all nodes satisfying Reports 01, 04, 07 and 13-15. */
const nodes=[];
for(let r=1;r<=27;r++)for(let c=1;c<=27;c++){
 if(r%2!==centerRowParity||c%2!==centerColParity)continue;
 for(let radius=1;radius<=13;radius++){
  if(radius%2!==radiusParity||c-radius<1||c+radius>27)continue;
  const coords=[[r,c-radius],[r,c],[r,c+radius]],original=coords.map(glyph);
  if(original.some(k=>k===0)||original[0]!==original[2])continue;
  for(const transformCenter of [false,true]){
   const key=[original[0],transformCenter?phi(original[1]):original[1],original[2]];
   if(key.some(k=>k===0)||key.map(k=>mu(phi(k))).join(",")!==nextSignature.join(","))continue;
   nodes.push({coords,original,key,aligned:[key[2],key[0],key[1]],row:r,column:c,radius,transformCenter});
  }
 }
}

/* Enumerate beginnings satisfying Reports 03, 05, 06, 09 and 12. */
const starts=[];
for(let r=1;r<=27;r++)for(let c=1;c<=27;c++){
 const p=[r,c];
 if(r%2!==leftRowParity||c%2!==leftColParity)continue;
 if(rayOffset(L,p)!==exactDeviation)continue;
 starts.push(p);
}
assert.equal(starts.length,13);
const paths=[];
for(const start of starts)for(let length=2;start[1]+length-1<=27;length++){
 paths.push({coords:Array.from({length},(_,j)=>[start[0],start[1]+j]),start,length});
}
assert.equal(nodes.length,6);
assert.equal(paths.length,169);

const outputs=new Map();let pairCount=0,gcdPassing=0,wordAssignments=0;
for(const node of nodes)for(const path of paths){
 pairCount++;
 const compatibility=report10(node.coords[1],path.coords);
 if(!compatibility.passes)continue;
 gcdPassing++;
 const plaintext=path.coords.map((cell,j)=>mod(glyph(cell)-node.aligned[j%3],29));
 const words=segment(plaintext);
 if(words===null)continue;
 wordAssignments++;
 const k=plaintext.join(",");
 let out=outputs.get(k);
 if(!out){out={runes:symbols(plaintext),words,assignments:[]};outputs.set(k,out);}
 out.assignments.push({center:[node.row,node.column],radius:node.radius,sourceNode:symbols(node.original),key:symbols(node.key),transformCenter:node.transformCenter,start:path.start,length:path.length,gcds:compatibility.gcds});
}
const wordSummary=[...outputs.values()].map(x=>({words:x.words.join(" "),assignments:x.assignments.length})).sort((a,b)=>a.words.localeCompare(b.words));
const assignmentTotal=[...outputs.values()].reduce((s,x)=>s+x.assignments.length,0);
assert.deepEqual([pairCount,gcdPassing,assignmentTotal,outputs.size],[1014,730,9,6]);
assert.deepEqual(wordSummary,[
 {words:"BE",assignments:1},{words:"GO",assignments:2},{words:"IV",assignments:2},
 {words:"OF",assignments:1},{words:"RD",assignments:2},{words:"WEATHER",assignments:1}
]);
const actualNode=nodes.find(x=>x.row===14&&x.column===5&&x.radius===1&&x.transformCenter);
const actualPath=paths.find(x=>x.start[0]===14&&x.start[1]===14&&x.length===5);
assert.ok(actualNode&&actualPath);
const actualPlain=actualPath.coords.map((cell,j)=>mod(glyph(cell)-actualNode.aligned[j%3],29));
assert.equal(actualPlain.map(i=>alphabet[i]).join(""),"WEATHER");
assert.deepEqual(report10(actualNode.coords[1],actualPath.coords).gcds,[1,1,1,1]);

console.log(JSON.stringify({
 status:"conditional successor ambiguity; not an authenticated LP2 decryption",
 opening:{node:symbols(node1),key:symbols(key1),signature:sig1,cipherPositions:block1Positions,cipher:symbols(cipher1),plain:symbols(plain1)},
 predictions:{
  report01:{mobiusSum,phase:nextPhase,outer:nextOuter,signature:nextSignature},
  report03:{A:A3,G:G3,score:q3,axis:nextCipherAxis,leftmostFirst},
  report04:{centerRowParity,centerColParity},
  report05:{endpointRowParity,leftRowParity},
  report06and12:{allowance,beginBit,exactDeviation},
  report07:{distance:mirrorDistance,nextMirror},
  report09:{mobiusSum:sum90,centerTerm,leftColParity},
  report11:{SBefore:S,nextPhase,skipsSeven},
  report13:{X:X13,Y:Y13,muX:mu(X13),muY:mu(Y13),group:axisGroup},
  report14:{G:G14,T:T14,A:A14,muG:mu(G14),muT:mu(T14),muA:mu(A14),axis:nextKeyAxis},
  report15:{a:radiusA,g:radiusG,muG:mu(radiusG),s:radiusS,muS:mu(radiusS),radiusParity}
 },
 publishedBlock02:{node:symbols(publishedNode),key:symbols(publishedKey),signature:publishedSig,aligned:symbols(publishedAligned),path:publishedPath,plain:"WEATHER",report10:report10([14,5],publishedPath)},
 enumeration:{
  dictionary:"TextBlob frequency >=10; QU->CW, V->U, K->C, Z->S; one-rune words A/I only",
  dictionaryEntries:dictionary.size,
  candidateKeyVariants:nodes.map(x=>({center:[x.row,x.column],radius:x.radius,source:symbols(x.original),key:symbols(x.key),transformCenter:x.transformCenter})),
  candidateStarts:starts,candidatePaths:paths.length,candidatePairs:pairCount,gcdPassingPairs:gcdPassing,
  completeWordAssignments:assignmentTotal,distinctWordOutputs:outputs.size,wordOutputs:wordSummary,
  weatherIsUnique:false,
  note:"WEATHER is the only five-rune single-word output, but no published report selects a five-rune block. IV/RD are weak lexical hits; BE/GO/OF remain ordinary alternatives."
 },
 decision:"The p0 opening remains provisional. Reports 01-15 do not uniquely select block02's exact key-node location or ciphertext length. Do not add a global phi(center)/2 rule; it fails at block03."
},null,2));
