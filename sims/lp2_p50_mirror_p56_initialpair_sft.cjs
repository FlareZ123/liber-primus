'use strict';
// Mirror-pair source lead and exact conditional random-placement control.
// Original p50 data + solved p56 input. No unknown LP2 plaintext is recovered.
const assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const G=read('resources/liber-primus/lp2-grid-256.json');
const C=read('resources/liber-primus/lp2-corpus.json');
const tokens=G.pages.flatMap(p=>p.tokens);
assert.deepEqual(G.pages.map(p=>p.rows),[10,13,9]);
assert.equal(tokens.length,256);
assert.equal(G.alphabet,'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
assert(tokens.every(t=>t.length===2&&!t.includes('f')));
function value(t,base=60) {
  const a=base===59?G.alphabet.replace('f',''):G.alphabet;
  const x=base*a.indexOf(t[0])+a.indexOf(t[1]);
  assert(x>=0&&x<=255);return x;
}
for(let i=0;i<256;i++)assert.equal(value(tokens[i]),G.bytes[i]);
const edges=[];
for(let r=0;r<32;r++)for(let c=0;c<4;c++)edges.push({
 row:r,col:c,left:tokens[8*r+c],right:tokens[8*r+7-c]
});
function key(e){return [e.left,e.right].sort().join('|');}
const group=new Map();
for(const e of edges){const k=key(e);if(!group.has(k))group.set(k,[]);group.get(k).push(e);}
const repeats=[...group.entries()].filter(([k,es])=>es.length>1);
assert.equal(repeats.length,1);
assert.equal(repeats[0][0],'2L|3I');
assert.deepEqual(repeats[0][1],[
 {row:3,col:1,left:'3I',right:'2L'},
 {row:30,col:1,left:'2L',right:'3I'}
]);
const p56=C.pages.find(p=>p.page===56).indices;
assert.equal(p56.length,85);
const primes=[];
for(let n=2;primes.length<85;n++){let yes=true;
 for(let d=2;d*d<=n;d++)if(n%d===0){yes=false;break;}
 if(yes)primes.push(n);
}
let k=0;
const clear=p56.map((c,i)=>{if(i===56){assert.equal(c,0);return 0;}
 const p=((c-(primes[k++]-1))%29+29)%29;assert.notEqual(p,0);return p;
});
assert.equal(k,84);
assert.deepEqual(clear.slice(0,5),[24,9,18,9,23]); // AN END
assert.deepEqual([p56[0],clear[0]],[25,24]); // AE encrypted, A clear
const receiver={};
for(const base of [60,59]){
 const a=repeats[0][1].map(e=>[value(e.left,base)%29,value(e.right,base)%29]);
 const match=[];
 for(let i=0;i<85;i++)if(a.some(([x,y])=>
  (x===p56[i]&&y===clear[i])||(y===p56[i]&&x===clear[i])))match.push(i);
 receiver[base]={pairResidues:a,matchingP56Offsets:match};
}
assert.deepEqual(receiver[60],{pairResidues:[[24,25],[25,24]],matchingP56Offsets:[0]});
assert.deepEqual(receiver[59],{pairResidues:[[21,23],[23,21]],matchingP56Offsets:[]});
// The natural source-ordered successor to either occurrence does not encode
// even the second authenticated (cipher,plaintext) p56 pair.
for(const i of [13,121]){
 const e=edges[i+1],a=value(e.left)%29,b=value(e.right)%29;
 assert(!((a===p56[1]&&b===clear[1])||(b===p56[1]&&a===clear[1])));
}
// Exact expected number of repeated *literal-token* mirror-pair collisions
// with residues {24,25} when the same 256 tokens are randomly allocated.
// Any two selected disjoint pairings occur with probability 1/(255*253).
const freq=new Map();for(const t of tokens)freq.set(t,(freq.get(t)||0)+1);
const choose2=n=>n*(n-1)/2;
let choose24=0,choose25=0;
for(const [t,n] of freq){if(value(t)%29===24)choose24+=choose2(n);
 if(value(t)%29===25)choose25+=choose2(n);}
assert.deepEqual([choose24,choose25],[5,11]);
const expected=2*choose24*choose25/(255*253);
const outerProb=2*(10*4)*(9*4)/(128*127);
const bound=expected*outerProb/2; // left/right orientation opposite
assert(Math.abs(bound-0.00015103610769881385)<1e-14);
// A deterministic multiset-preserving simulation checks the exact bound.
let seed=0x33012016;
function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
function classify(a){
 const m=new Map();for(let r=0;r<32;r++)for(let c=0;c<4;c++){
 const left=a[8*r+c],right=a[8*r+7-c],kk=[left,right].sort().join('|');
 if(!m.has(kk))m.set(kk,[]);m.get(kk).push({r,c,left,right});
 }
 const doubles=[...m.values()].filter(es=>es.length>1);
 let target=0,reverse=0,outer=0;
 for(const es of doubles){
 const x=es[0],y=es[1];if(x.left===x.right)continue;
 const residues=[value(x.left)%29,value(x.right)%29].sort((a,b)=>a-b);
 if(residues[0]!==24||residues[1]!==25)continue;
 target++;
 if(x.left===y.right&&x.right===y.left){reverse++;
 if((x.r<10&&y.r>=23)||(y.r<10&&x.r>=23))outer++;}
 }
 return{count:doubles.length,target,reverse,outer};
}
assert.deepEqual(classify(tokens),{count:1,target:1,reverse:1,outer:1});
const tests=100000,shuffled=tokens.slice(),stats={repeat:0,single:0,target:0,reverse:0,outer:0,outerSole:0};
for(let trial=0;trial<tests;trial++){
 for(let i=255;i>0;i--){const j=rng()%(i+1);
 [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 const x=classify(shuffled);
 if(x.count>0)stats.repeat++;if(x.count===1)stats.single++;
 if(x.target)stats.target++;if(x.reverse)stats.reverse++;
 if(x.outer)stats.outer++;if(x.outer&&x.count===1)stats.outerSole++;
}
assert.deepEqual(stats,{repeat:21750,single:19237,target:169,reverse:97,outer:14,outerSole:8});
console.log(JSON.stringify({
 sourcePair:repeats[0][1],p56First:{C:p56[0],P:clear[0]},
 radix60:receiver[60],radix59:receiver[59],
 fixedMultisetNull:{targetCollisionExpectation:expected,outerOppositeExpectationAndMarkovBound:bound},
 permutationControl:{seed:'0x33012016',tests,stats},
 conclusion:'An unusual provisional first-glyph match, no continuation and no unknown plaintext'
},null,2));
