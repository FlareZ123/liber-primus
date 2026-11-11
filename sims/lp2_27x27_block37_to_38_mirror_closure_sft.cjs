"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const grid=corpus.pages.filter(p=>p.page<=2).flatMap(p=>p.indices);
const english=fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
assert.equal(grid.length,729);
const mod29=x=>((x%29)+29)%29,mod2=x=>((x%2)+2)%2,mod3=x=>((x%3)+3)%3;
function gcd(a,b){while(b)[a,b]=[b,a%b];return a}
function phi(n){let v=n,x=n;for(let p=2;p*p<=x;p++)if(x%p===0){while(x%p===0)x/=p;v-=v/p}if(x>1)v-=v/x;return v}
function mu(n){let x=n,s=1;for(let p=2;p*p<=x;p++)if(x%p===0){x/=p;s=-s;if(x%p===0)return 0;while(x%p===0)x/=p}return x>1?-s:s}
const n0=([r,c])=>27*(r-1)+c;
const n1=([r,c])=>27*(c-1)+28-r;
const n2=p=>730-n0(p);
const n3=p=>730-n1(p);
const glyph=p=>grid[n0(p)-1];
const cheb=(a,b)=>Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]));
const d8=(a,b)=>{const dr=Math.abs(a[0]-b[0]),dc=Math.abs(a[1]-b[1]);return Math.min(dr,dc,Math.abs(dr-dc))};

// Frozen upstream candidate: block 37, AS, from the published 27x27 route.
const prev={
  source:[[4,14],[6,16],[8,18]],
  sourceRunes:[11,17,14],
  cipher:[[22,2],[22,1]],
  B:[22,2],E:[22,1],L:[22,1],M:[6,16],Z:[8,18],
  phase:2,outer:1,S:32,mirrorBit:0
};
assert.deepEqual(prev.source.map(glyph),prev.sourceRunes);
const nextPhase=mod3(1+prev.cipher.reduce((s,p)=>s+mu(n0(p)),0));
const nextOuter=mod2(prev.outer+mu(n1(prev.L)));
const signatures=[
  [[0,0,0],[1,1,1]],
  [[0,1,0],[1,-1,1]],
  [[0,-1,0],[1,0,1]]
];
const signature=signatures[nextPhase][nextOuter];
const boundary=mod2(mu(n3(prev.E))+phi(prev.sourceRunes[1]));
const axisValue=mu(n2(prev.B)+n0(prev.M))+mu(gcd(n1(prev.E),n2(prev.E)));
const cipherAxis=axisValue===0?"horizontal":axisValue>0?"vertical":"diagonal";
const centerParity=[
  mod2(1+prev.B[1]+prev.E[0]+prev.M[0]+mu(n2(prev.B))),
  mod2(1+prev.B[0]+prev.E[0]+prev.M[0])
];
const endpointRow=mod2(1+prev.phase+mu(n2(prev.M)));
const leftmostParity=[
  mod2(centerParity[0]+1+prev.phase+mu(prev.M[0])),
  mod2(prev.B[0]+prev.cipher.reduce((s,p)=>s+mu(n1(p)),0)+prev.mirrorBit+mu(n2(prev.M)))
];
const qRay=+(mu(n0(prev.E))===0&&mu(n3(prev.E))===0);
const zRay=+(mu(n0(prev.B))===0&&mu(n1(prev.B))===0);
const rayOffset=qRay*(1-zRay);
const nextMirror=cheb(prev.Z,prev.L)%3!==2;
const sourceGroup=+((mu(n1(prev.M)+n2(prev.Z))<0)===(mu(n1(prev.L)+n2(prev.Z))<0));
const sourcePrimeSum=prev.sourceRunes.reduce((s,r)=>s+corpus.prime[r],0);
const sourceDiagonal=
  (+(mu(gcd(n1(prev.M),n3(prev.Z)))<0)) ^
  (+(mu(sourcePrimeSum)>0)) ^
  (+(mu(n0(prev.M)+n3(prev.Z))!==0));
const sourceAxis=2*sourceGroup+sourceDiagonal;
const radiusParity=
  mod2(prev.M[0]+prev.M[1]+prev.B[0]+prev.B[1]) ^
  (+(mu(gcd(n2(prev.Z),n2(prev.L)))<0)) ^
  (+(mu(n1(prev.B)+n1(prev.E))>0));
const forecast={phase:nextPhase,outer:nextOuter,signature,boundary,cipherAxis,centerParity,endpointRow,leftmostParity,rayOffset,sourceType:nextMirror?"mirror":"non-mirror",sourceAxis,radiusParity};
const expected={phase:0,outer:0,signature:[0,0,0],boundary:0,cipherAxis:"vertical",centerParity:[0,1],endpointRow:0,leftmostParity:[0,1],rayOffset:1,sourceType:"non-mirror",sourceAxis:2,radiusParity:1};
assert.deepEqual(forecast,expected);

// Four vertical D4 images of the opening AE-J-EA source node, normalized top-to-bottom.
const opening=[[13,11],[13,12],[13,13]];
const d4=[
  ["main-diagonal",([r,c])=>[c,r]],
  ["anti-diagonal",([r,c])=>[28-c,28-r]],
  ["rotate-90",([r,c])=>[c,28-r]],
  ["rotate-270",([r,c])=>[28-c,r]]
];
const images=d4.map(([name,fn])=>{
  const coords=opening.map(fn).sort((a,b)=>a[0]-b[0]);
  const indices=coords.map(glyph),sig=indices.map(i=>mu(phi(i)));
  return {
    name,coords,indices,runes:indices.map(i=>corpus.translit[i]),
    signature:sig,phase:mod3(sig.reduce((a,b)=>a+b,0)),
    centerParity:[mod2(coords[1][0]),mod2(coords[1][1])],
    radius:coords[2][0]-coords[1][0],
    mirror:indices[0]===indices[2]
  };
});
const selected=images.filter(x=>
  x.signature.every((v,i)=>v===forecast.signature[i]) &&
  x.phase===forecast.phase &&
  x.centerParity[0]===forecast.centerParity[0] &&
  x.centerParity[1]===forecast.centerParity[1] &&
  mod2(x.radius)===forecast.radiusParity &&
  x.mirror===(forecast.sourceType==="mirror")
);
assert.equal(selected.length,1);
assert.equal(selected[0].name,"main-diagonal");
assert.deepEqual(selected[0].runes,["T","M","EA"]);
const source=selected[0],M=source.coords[1],key=source.indices;
const aligned=key.slice(forecast.phase).concat(key.slice(0,forecast.phase));
assert.deepEqual(aligned,[16,19,28]);

// Fixed independent GP-encoded Shakespeare reference; require frequency >= 10.
const tokens=corpus.translit.map((t,i)=>[t,i]).sort((a,b)=>b[0].length-a[0].length);
function encodeWord(w){
  const s=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
  const out=[];
  for(let p=0;p<s.length;){
    const t=tokens.find(x=>s.startsWith(x[0],p));
    if(!t)return null;
    out.push(t[1]);p+=t[0].length;
  }
  return out;
}
const frequencies=new Map(),labels=new Map();
for(const word of english.toUpperCase().match(/[A-Z]+/g)||[]){
  const encoded=encodeWord(word);
  if(!encoded)continue;
  const k=encoded.join(",");
  frequencies.set(k,(frequencies.get(k)||0)+1);
  if(!labels.has(k))labels.set(k,new Map());
  const lm=labels.get(k);lm.set(word,(lm.get(word)||0)+1);
}
function segmentations(sequence,minFrequency=10){
  const dp=Array.from({length:sequence.length+1},()=>[]);
  dp[0]=[[]];
  for(let i=0;i<sequence.length;i++){
    for(const path of dp[i]){
      for(let j=i+1;j<=sequence.length;j++){
        const k=sequence.slice(i,j).join(","),f=frequencies.get(k)||0;
        if(f<minFrequency||dp[j].length>=20)continue;
        const variants=[...(labels.get(k)||new Map()).entries()].sort((a,b)=>b[1]-a[1]);
        dp[j].push([...path,{word:variants[0]?.[0]||k,frequency:f}]);
      }
    }
  }
  return dp[sequence.length];
}

// Frozen block-37 forecast: vertical/downward ciphertext, END boundary,
// exact ray offset 1, even endpoint/leftmost row, odd leftmost column.
const paths=[];
for(let c=1;c<=27;c+=2){
  for(let r=1;r<=27;r++){
    for(let length=2;length<=27;length++){
      const er=r+length-1;
      if(er>27||mod2(er)!==forecast.endpointRow)continue;
      const B=[r,c],E=[er,c],L=E;
      if(d8(prev.L,B)!==forecast.rayOffset)continue;
      if(mod2(L[0])!==forecast.leftmostParity[0]||mod2(L[1])!==forecast.leftmostParity[1])continue;
      if(mu(n1(L))<0)continue; // Direct mode allows 0 or +1.
      const gcds=[
        gcd(n0(M),n0(B)),
        gcd(n0(M),n0(L)),
        gcd(n1(M),n3(E)),
        gcd(n0(M),n2(E))
      ];
      if(gcds.some(g=>mu(g)===0))continue;
      const cipher=Array.from({length},(_,i)=>glyph([r+i,c]));
      const plain=cipher.map((v,i)=>mod29(v-aligned[i%3]));
      const segment=segmentations(plain);
      if(!segment.length)continue;
      paths.push({
        B,E,length,
        cipher:cipher.map(i=>corpus.translit[i]).join("-"),
        plainGP:plain.map(i=>corpus.translit[i]).join("-"),
        gcds,gcdMobius:gcds.map(mu),
        localModeMu:mu(n1(L)),
        rayOffset:d8(prev.L,B),
        segmentations:segment
      });
    }
  }
}
assert.equal(paths.length,2);
assert.ok(paths.some(p=>p.B[0]===5&&p.B[1]===17&&p.length===4&&p.plainGP==="I-A-S-C"));
assert.ok(paths.some(p=>p.B[0]===21&&p.B[1]===23&&p.length===2&&p.plainGP==="D-O"));
const summary={
  upstreamPremise:"block37 AS candidate and Reports 01-15 forecasts; conditional, not authenticated",
  forecast,
  openingNode:{coords:opening,runes:opening.map(glyph).map(i=>corpus.translit[i])},
  verticalD4Images:images,
  selectedSource:{name:source.name,coords:source.coords,indices:source.indices,runes:source.runes,signature:source.signature,phase:source.phase},
  lexicon:{source:"shakespeare_first300k.txt",minimumFrequency:10,distinctEncodedWords:frequencies.size},
  survivingPaths:paths,
  decision:"The main-diagonal reflection is the only vertical D4 image matching the locked signature/phase forecast. With that source fixed, two complete-word paths remain: I ASK (GP I-A-S-C, C/K alias) and DO. Context favors I ASK, but the reflection rule is unverified and the gate is not unique."
};
console.log(JSON.stringify(summary,null,2));
