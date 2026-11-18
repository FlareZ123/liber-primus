"use strict";

/**
 * SFT: source-only mirror-incidence topology immediately after the conditional
 * p0-p2 IDEA candidate.
 *
 * This does not select OF/THE plaintext. It proves two narrower facts:
 * 1. the IDEA ciphertext endpoint D(17,18) belongs to exactly one equal-outer
 *    mirror node, J-D-J, and only its lower-left J is itself the center of
 *    another mirror, OE-J-OE;
 * 2. treating the locked post-IDEA five-word checksum residual as one straight
 *    12-rune block fails across a widened prior-path mirror-center family.
 *
 * Run: node sims/lp2_p0_postidea_mirror_incidence_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const T=corpus.translit;
const grid=corpus.pages.filter(p=>p.page<=2).flatMap(p=>p.indices);
assert.equal(grid.length,729);

const mod=x=>(x%29+29)%29;
const at=(r,c)=>grid[(r-1)*27+c-1];

/** @param {number} n */
function phi(n){
  let value=n,rest=n;
  for(let p=2;p*p<=rest;p++){
    if(rest%p!==0)continue;
    while(rest%p===0)rest/=p;
    value-=value/p;
  }
  if(rest>1)value-=value/rest;
  return value;
}

/** @param {number} n */
function mu(n){
  let rest=n,sign=1;
  for(let p=2;p*p<=rest;p++){
    if(rest%p!==0)continue;
    rest/=p;
    sign=-sign;
    if(rest%p===0)return 0;
  }
  return rest>1?-sign:sign;
}

/** @param {number} count */
function firstPrimes(count){
  const out=[];
  for(let n=2;out.length<count;n++){
    let prime=true;
    for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}
    if(prime)out.push(n);
  }
  return out;
}

const gp=firstPrimes(29);
const axes=[[1,0],[0,1],[1,1],[1,-1]];
const readDirections=[];
for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(dr||dc)readDirections.push([dr,dc]);

const mirrors=[];
for(let r=1;r<=27;r++)for(let c=1;c<=27;c++){
  for(const [dr,dc] of axes){
    for(let radius=1;radius<=13;radius++){
      const p1=[r-dr*radius,c-dc*radius];
      const p2=[r+dr*radius,c+dc*radius];
      if([...p1,...p2].some(v=>v<1||v>27))break;
      const outer1=at(...p1),center=at(r,c),outer2=at(...p2);
      if(outer1===outer2&&center!==0){
        mirrors.push({center:[r,c],p1,p2,radius,axis:[dr,dc],raw:[outer1,center,outer2]});
      }
    }
  }
}
assert.equal(mirrors.length,479);

const coordKey=q=>q.join(",");
const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const byCenter=new Map();
const byTouch=new Map();
for(const node of mirrors){
  const ck=coordKey(node.center);
  if(!byCenter.has(ck))byCenter.set(ck,[]);
  byCenter.get(ck).push(node);
  for(const q of [node.center,node.p1,node.p2]){
    const qk=coordKey(q);
    if(!byTouch.has(qk))byTouch.set(qk,[]);
    byTouch.get(qk).push(node);
  }
}
const centered=q=>byCenter.get(coordKey(q))||[];
const touching=q=>byTouch.get(coordKey(q))||[];

const ideaCells=[[15,20],[16,19],[17,18]];
const ideaKey=["U","A","A"].map(x=>T.indexOf(x));
assert.deepEqual(
  ideaCells.map((q,i)=>T[mod(at(...q)-ideaKey[i%3])]),
  ["I","D","EA"]
);

const ideaEndpoint=[17,18];
assert.equal(T[at(...ideaEndpoint)],"D");
assert.equal(touching(ideaEndpoint).length,1);
assert.equal(centered(ideaEndpoint).length,1);

const jdj=centered(ideaEndpoint)[0];
assert.deepEqual(jdj.raw.map(i=>T[i]),["J","D","J"]);
assert.deepEqual(jdj.p1,[15,20]);
assert.deepEqual(jdj.p2,[19,16]);
assert.equal(jdj.radius,2);
assert.deepEqual(jdj.axis,[1,-1]);

const upperJ=jdj.p1;
const lowerJ=jdj.p2;
assert.equal(centered(upperJ).length,0);
assert.equal(centered(lowerJ).length,1);

const oejoe=centered(lowerJ)[0];
assert.deepEqual(oejoe.raw.map(i=>T[i]),["OE","J","OE"]);
assert.deepEqual(oejoe.p1,[18,16]);
assert.deepEqual(oejoe.p2,[20,16]);
assert.equal(oejoe.radius,1);
assert.deepEqual(oejoe.axis,[1,0]);

const lowerJTouch=touching(lowerJ);
assert.equal(lowerJTouch.length,3);
const other=lowerJTouch.filter(n=>n!==jdj&&n!==oejoe);
assert.equal(other.length,1);
const jbj=other[0];
assert.deepEqual(jbj.raw.map(i=>T[i]),["J","B","J"]);
assert.deepEqual(jbj.center,[23,12]);
assert.deepEqual(jbj.p1,[19,16]);
assert.deepEqual(jbj.p2,[27,8]);
assert.equal(jbj.radius,4);
assert.deepEqual(jbj.axis,[1,-1]);
assert.equal(touching(jbj.center).length,1);

function deriveKey(node){
  const derived=[node.raw[0],phi(node.raw[1]),node.raw[2]];
  const rotation=((derived.reduce((s,v)=>s+mu(phi(v)),0)%3)+3)%3;
  return {
    derived,
    rotation,
    key:derived.slice(rotation).concat(derived.slice(0,rotation))
  };
}

const jdjKey=deriveKey(jdj);
assert.deepEqual(jdjKey.key.map(i=>T[i]),["J","OE","J"]);
assert.equal(jdjKey.rotation,0);
const oejoeKey=deriveKey(oejoe);
assert.deepEqual(oejoeKey.key.map(i=>T[i]),["OE","OE","I"]);
assert.equal(oejoeKey.rotation,2);

// Widened direct 12-rune continuation control.
// Use every unique ciphertext cell already selected through IDEA as a possible
// mirror center, every equal-outer mirror through that center, and all eight
// straight read directions from the IDEA source endpoint. This intentionally
// grants far more key choices than the local topology above.
const previousPath=[
  [13,25],[13,26],[13,27],[14,1],[14,2],[14,3],[14,4],
  [14,14],[14,15],[14,16],[14,17],[14,18],
  [14,19],[13,19],[12,19],[11,19],[10,19],
  [14,7],[13,7],[12,7],[11,7],
  [26,19],[26,18],[26,17],[26,16],
  [19,16],[18,16],[17,16],
  [11,16],[12,17],[13,18],[14,19],[15,20],
  [16,19],[17,18]
];
const uniqueCenters=[...new Map(previousPath.map(q=>[coordKey(q),q])).values()];
assert.equal(uniqueCenters.length,34);

const candidateNodes=[];
for(const center of uniqueCenters){
  for(const node of centered(center))candidateNodes.push(node);
}
assert.equal(candidateNodes.length,35);

const residual={runes:12,indexSum:151,gpSum:553};
let full12=0;
const checksumHits=[];
for(const node of candidateNodes){
  const {key}=deriveKey(node);
  for(const [dr,dc] of readDirections){
    const stream=[];
    let r=ideaEndpoint[0],c=ideaEndpoint[1];
    for(let i=0;i<residual.runes;i++){
      if(r<1||r>27||c<1||c>27)break;
      stream.push(mod(at(r,c)-key[i%3]));
      r+=dr;c+=dc;
    }
    if(stream.length!==residual.runes)continue;
    full12++;
    const indexSum=stream.reduce((s,v)=>s+v,0);
    const gpSum=stream.reduce((s,v)=>s+gp[v],0);
    if(indexSum===residual.indexSum&&gpSum===residual.gpSum){
      checksumHits.push({node,key,readDirection:[dr,dc],stream});
    }
  }
}
assert.equal(full12,105);
assert.equal(checksumHits.length,0);

console.log(JSON.stringify({
  status:"post-IDEA source-only mirror topology fixes the next key-source chain but not ciphertext reading",
  mirrorNodeCount:mirrors.length,
  idea:{
    cells:ideaCells,
    plaintext:["I","D","EA"],
    sourceEndpoint:{coord:ideaEndpoint,rune:T[at(...ideaEndpoint)]}
  },
  forcedTopology:{
    endpointIncidentMirrors:touching(ideaEndpoint).length,
    firstNode:{raw:jdj.raw.map(i=>T[i]),center:jdj.center,radius:jdj.radius,axis:jdj.axis,key:jdjKey.key.map(i=>T[i])},
    upperOuterCenteredMirrors:centered(upperJ).length,
    lowerOuterCenteredMirrors:centered(lowerJ).length,
    secondNode:{raw:oejoe.raw.map(i=>T[i]),center:oejoe.center,radius:oejoe.radius,axis:oejoe.axis,key:oejoeKey.key.map(i=>T[i])},
    remainingMirrorAtSharedJ:{raw:jbj.raw.map(i=>T[i]),center:jbj.center,radius:jbj.radius,axis:jbj.axis}
  },
  direct12RuneResidualControl:{
    residual,
    priorPathCenters:uniqueCenters.length,
    mirrorNodes:centered.length===undefined?candidateNodes.length:candidateNodes.length,
    fullLengthCandidates:full12,
    exactChecksumHits:checksumHits.length
  },
  caveat:"This selects source key-node topology only. It does not select the OF/THE ciphertext starts, directions, block lengths, or plaintext."
},null,2));
