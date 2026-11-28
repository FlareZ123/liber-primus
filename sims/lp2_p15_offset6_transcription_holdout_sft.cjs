'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));

const mod=x=>((x%29)+29)%29;
const sum=xs=>mod(xs.reduce((a,b)=>a+b,0));
const product=xs=>xs.reduce((a,b)=>mod(a*b),1);
const inv=x=>{for(let y=1;y<29;y++)if(mod(x*y)===1)return y;throw new Error('noninvertible');};
const pow=(base,exp,m)=>{let b=base%m,e=exp,r=1;while(e){if(e&1)r=r*b%m;b=b*b%m;e=Math.floor(e/2);}return r;};
const H4=([a,b,c,d])=>[mod(a-d),mod(b-c),mod(b+c),mod(a+d)];
const describe=xs=>({L:xs.length,S:sum(xs),P:product(xs)});
function words(vals){const lens=[4,5,4,2,5];let at=0;return lens.map(L=>{const d=describe(vals.slice(at,at+L));at+=L;return d;});}

const p15=corpus.pages.find(p=>p.page===15).indices.slice(0,20);
assert.equal(p15[6],26);
const [, ,l1,l2,l3]=words(p15);
const q=l1.L,K=l2.L,a=l2.S,g=l2.P,F=l3.P,p=l1.S+1;
assert.deepEqual({p,g,a,K,q,F},{p:23,g:5,a:6,K:2,q:4,F:0});
assert.equal(l1.P,mod(K*g));assert.equal(l3.L,g);assert.equal(l3.S,g);
const A=pow(g,a,p);assert.equal(A,8);

const grid=[[3258,3222,3152,3038],[3278,3299,3298,2838],[3288,3294,3296,2472],[4516,1206,708,1820]];
const r=grid.map(row=>row.map(x=>x%29));
const cols=Array.from({length:4},(_,c)=>H4(r.map(row=>row[c])));
const tail=[g,mod(K*g),mod(q*g)];
const hits=cols.map((v,i)=>({v,i})).filter(({v})=>v.slice(1).every((x,j)=>x===tail[j]));
assert.equal(hits.length,1);
const b=hits[0].v[0];assert.equal(b,15);
const B=pow(g,b,p);assert.equal(B,19);
const Binv=inv(B);assert.equal(Binv,26);
const predicted=[{L:q,S:inv(A),P:F},{L:g,S:A,P:Binv}];
assert.deepEqual(predicted,[{L:4,S:11,P:0},{L:5,S:8,P:26}]);

const variants=[];
for(let candidate=0;candidate<29;candidate++){
  const vals=p15.slice();vals[6]=candidate;
  const upper=words(vals).slice(0,2);
  variants.push({candidate,glyph:corpus.runes[candidate],translit:corpus.translit[candidate],upper,
    matches:JSON.stringify(upper)===JSON.stringify(predicted)});
}
const survivors=variants.filter(x=>x.matches);
assert.deepEqual(survivors.map(x=>x.candidate),[26]);
const onecoolD=variants.find(x=>x.candidate===23);
assert.deepEqual(onecoolD.upper[1],{L:5,S:5,P:23});
assert.equal(onecoolD.matches,false);

console.log(JSON.stringify({
  schema:1,heldOut:{page:15,offset:6},
  derivedWithoutUpper:{p,g,a,b,A,B,K,q,F,Binv},
  predictedUpper:predicted,testedGlyphs:29,
  survivor:survivors[0],onecoolD,
  decision:'Only scan-correct Y satisfies the held-out upper descriptor predicted from lower red11 plus the p15 number square.'
},null,2));
