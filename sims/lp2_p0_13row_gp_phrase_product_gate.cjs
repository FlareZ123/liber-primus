const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=process.argv[2]??path.resolve(__dirname,'..');
const c=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const s=c.pages.slice(0,3).flatMap(p=>p.indices);
assert.equal(s.length,729);assert.equal(s[13],2);
const rp=c.pages.slice(0,56).filter(p=>p.indices.length).map(p=>p.page);
/** @param {number[]} a */
const pack=a=>a.reduce((n,x)=>n*29n+BigInt(x),0n);
const frames=[['full-last',0,56,false],['full-first',1,56,false],['black-last',13,55,true],['black-first',14,55,true],['title-TH-sentinel',14,55,false]];
const maxPrime=Math.max(...c.prime);assert.equal(maxPrime,109);
const bound=maxPrime*Math.max(...c.pages.slice(0,56).map(p=>p.indices.length));
assert.equal(bound,30193);
const sieve=new Uint8Array(bound+1),primes=[];
for(let p=2;p<=bound;p++)if(!sieve[p]){primes.push(p);for(let j=p*p;j<=bound;j+=p)sieve[j]=1}
/** @param {bigint} n @param {number} cap */
function assess(n,cap){
  if(n===0n)return {ok:false,reason:'zero'};
  let x=n,sum=0;
  for(const p of primes){if(p>cap||x===1n)break;const b=BigInt(p);while(x%b===0n){x/=b;sum+=p;}}
  return {ok:x===1n&&sum<=cap,reason:x>1n?'large-prime-factor':sum>cap?'factor-sum':'passes',remaining:x.toString(),sum};
}
const controlSums=[30,30,28].map((len,i)=>{const start=[7,37,67][i];return c.pages[57].indices.slice(start,start+len).reduce((n,x)=>n+c.prime[x],0)});
assert.deepEqual(controlSums,[1259,1031,1229]);
const controlProduct=controlSums.reduce((n,v)=>n*BigInt(v),1n);
assert.equal(controlProduct,1595277641n);
const control=assess(controlProduct,88*maxPrime);assert.equal(control.ok,true);
assert.equal(control.sum,3519);
const unique=new Map(),output=[];
for(const [name,start,count,skip] of frames){
  const rows=Array.from({length:count},(_,i)=>s.slice(start+13*i,start+13*(i+1)));
  if(name==='title-TH-sentinel')rows.unshift(s.slice(0,13));
  const byOrder=[];
  for(const orientation of ['printed','reverse']){
    const nums=rows.map(a=>pack(orientation==='printed'?a:a.slice().reverse()));
    const assigned=c.pages.filter(p=>p.page>=3&&p.page<=55&&p.indices.length).map(p=>{
      const i=skip?rp.indexOf(p.page):p.page;
      return {page:p.page,row:i,number:nums[i].toString(),cap:maxPrime*p.indices.length,...assess(nums[i],maxPrime*p.indices.length)};
    });
    assert.equal(assigned.length,52);
    const arbitrary=nums.map((n,i)=>{const a=assess(n,bound);unique.set(n.toString(),a);return {i,...a}});
    byOrder.push({orientation,assignedPass:assigned.filter(x=>x.ok).length,assignedLarge:assigned.filter(x=>x.reason==='large-prime-factor').length,anyPagePass:arbitrary.filter(x=>x.ok).map(x=>x.i),anyPageLarge:arbitrary.filter(x=>x.reason==='large-prime-factor').length,first:assigned[0]});
  }
  output.push({name,rows:rows.length,byOrder});
}
console.log(JSON.stringify({bound,controlSums,controlProduct:controlProduct.toString(),control,distinctReadouts:unique.size,distinctPass:[...unique.values()].filter(x=>x.ok).length,output},null,2));
