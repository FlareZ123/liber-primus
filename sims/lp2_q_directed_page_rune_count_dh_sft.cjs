'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const M=29,ri=new Map(corpus.runes.map((r,i)=>[r,i]));
const mod=x=>((x%M)+M)%M;
const mul=(x,y)=>[mod(x[0]*y[0]+8*x[1]*y[1]),mod(x[0]*y[1]+x[1]*y[0]+3*x[1]*y[1])];
function fpow(x,n){let a=[1,0],b=x;while(n){if(n&1)a=mul(a,b);b=mul(b,b);n=Math.floor(n/2)}return a}
function evalp(cs){let a=[0,0],p=[1,0];for(const z of cs){a=[mod(a[0]+z*p[0]),mod(a[1]+z*p[1])];p=mul(p,[0,1])}return a}
function span(page,start){const p=ink.pages.find(x=>x.page===page);assert(p);const s=(p.red_spans||[]).find(x=>x.start===start);assert(s);return s}
function res(s){return evalp([...s.runes].map(r=>{const v=ri.get(r);assert.notEqual(v,undefined);return v}))}
function inv(x){x=mod(x);if(!x)return null;let a=1,b=x,n=27;while(n){if(n&1)a=mod(a*b);b=mod(b*b);n=Math.floor(n/2)}return a}
function ipow(b,n,m){let a=1,x=b%m;while(n){if(n&1)a=a*x%m;x=x*x%m;n=Math.floor(n/2)}return a}
const Q=evalp([5,5,14,9,10,4,27,17,25]);assert.deepEqual(Q,[17,24]);assert.deepEqual(fpow(Q,840),[1,0]);
const p8=res(span(8,0)),p23=res(span(23,0)),cr=corpus.pages.slice(0,29).map(p=>p.runic_count%29);
const o8=mul(Q,p8),o23=mul(Q,p23),c8=o8.map(p=>cr[p]),c23=o23.map(p=>cr[p]);
assert.deepEqual(o8,[10,16]);assert.deepEqual(c8,[2,6]);assert.deepEqual(o23,[17,19]);assert.deepEqual(c23,[12,10]);
assert.deepEqual(o8.map(p=>corpus.pages[p].runic_count),[263,267]);assert.deepEqual(o23.map(p=>corpus.pages[p].runic_count),[273,271]);
const K8=c8[0],a8=c8[1],ik=inv(K8),g8=mod(o8[0]*ik),A8=mod(o8[1]*ik);
const B=o23[1],K23=mod(B-o23[0]),ik23=inv(K23),a23=mod(c23[0]*ik23),g23=mod(c23[1]*ik23);
assert.deepEqual([K8,a8,g8,A8,K23,a23,g23,B],[2,6,5,8,2,6,5,19]);
const p=23,b=15;assert.equal(ipow(g8,a8,p),A8);assert.equal(ipow(g8,b,p),B);assert.equal(ipow(B,a8,p),K8);
const hits=[];
for(let e=0;e<840;e++){const s=fpow(Q,e),u8=mul(s,p8),u23=mul(s,p23),d8=u8.map(x=>cr[x]),d23=u23.map(x=>cr[x]);
 for(const ki of [0,1]){const K=d8[ki],a=d8[1-ki],iK=inv(K);if(iK===null)continue;
  for(const gi of [0,1]){const g=mod(u8[gi]*iK),A=mod(u8[1-gi]*iK);if(A!==8)continue;
   for(const bi of [0,1]){const BB=u23[bi],KK=mod(BB-u23[1-bi]),iKK=inv(KK);if(iKK===null||KK!==K)continue;
    for(const ai of [0,1]){const aa=mod(d23[ai]*iKK),gg=mod(d23[1-ai]*iKK);
     if(aa===a&&gg===g&&ipow(g,a,p)===8&&ipow(BB,a,p)===K)hits.push({e,s,ki,gi,bi,ai,K,a,g,A,BB,u8,d8,u23,d23});
}}}}}
assert.equal(hits.length,1);assert.equal(hits[0].e,1);assert.deepEqual([hits[0].ki,hits[0].gi,hits[0].bi,hits[0].ai],[0,0,1,0]);
assert.deepEqual([mod(o8[0]-c8[0]),mod(o8[1]-c8[1])],[8,o8[0]]);
let rec=0;for(let e=0;e<840;e++){const u=mul(fpow(Q,e),p8),c=u.map(x=>cr[x]);if(mod(u[0]-c[0])===8&&mod(u[1]-c[1])===u[0])rec++}assert.equal(rec,1);
const out={status:'PASS',classification:'post-discovery source-only directed-page rune-count DH reconstruction; no unknown plaintext',q:Q,p8Branch:{output:o8,counts:[263,267],residues:c8,derived:{K:K8,a:a8,g:g8,A:A8}},p23Branch:{output:o23,counts:[273,271],residues:c23,derived:{K:K23,a:a23,g:g23,B}},dh:{p,b,ga:ipow(g8,a8,p),gb:ipow(g8,b,p),Ba:ipow(B,a8,p)},charge:{scalars:840,rivals:16,presentations:13440,survivors:hits.length,survivor:hits[0]},labelFreeP8RecurrenceHits:rec,boundary:'post-discovery state receiver; no body plaintext'};
console.log(JSON.stringify(out,null,2));if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),JSON.stringify(out,null,2));
