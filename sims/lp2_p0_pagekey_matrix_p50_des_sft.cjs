const crypto = require('node:crypto');
const assert = require('node:assert/strict');
/** @param {Buffer} key @param {Buffer} data @param {boolean} cbc @param {boolean} decrypt */
function des(key, data, cbc, decrypt=true) {
  const k = Buffer.concat([key,key,key]);
  const mode = cbc ? 'des-ede3-cbc' : 'des-ede3';
  const iv = cbc ? Buffer.alloc(8) : null;
  const c = decrypt ? crypto.createDecipheriv(mode,k,iv) : crypto.createCipheriv(mode,k,iv);
  c.setAutoPadding(false);
  return Buffer.concat([c.update(data),c.final()]);
}
/** @param {number[]} digits */
function pack(digits) {
  const b=Buffer.alloc(8);
  b.writeBigUInt64BE(digits.reduce((n,x)=>n*29n+BigInt(x),0n));
  return b;
}
/** @param {Buffer[]} keys @param {Buffer} table @param {number[]} p57 */
function experiment(keys,table,p57) {
  assert.equal(des(Buffer.from('133457799BBCDFF1','hex'),Buffer.from('85E813540F0AB405','hex'),false).toString('hex'),'0123456789abcdef');
  assert.equal(table.length,256); assert.equal(p57.length,95);
  const results=[];
  for(const framing of ['panel-p50','physical-portions']) for(const endian of ['BE','LE']) for(const cbc of [false,true]) {
    const segments=framing==='panel-p50'?[[50,0,256]]:[[49,0,80],[50,80,184],[51,184,256]];
    const outputs=segments.map(([page,start,end])=>{
      const key=Buffer.from(keys[page]); if(endian==='LE')key.reverse();
      const src=table.subarray(start,end),out=des(key,src,cbc);
      assert.deepEqual(des(key,out,cbc,false),src);
      return out;
    });
    const out=Buffer.concat(outputs);const inner=[];
    for(let r=1;r<31;r++)for(let c=1;c<7;c++)inner.push(out[8*r+c]);
    const suffix=inner.slice(-95);
    const freq=Array(256).fill(0);for(const b of out)freq[b]++;
    const entropy=-freq.filter(Boolean).reduce((s,n)=>s+(n/256)*Math.log2(n/256),0);
    results.push({framing,endian,mode:cbc?'CBC-zero-IV':'ECB',printable:[...out].filter(b=>b>=32&&b<=126).length,gp29:inner.filter(b=>b<29).length,p57exact:suffix.filter((b,i)=>b===p57[i]).length,p57mod29:suffix.filter((b,i)=>b%29===p57[i]).length,entropy:Number(entropy.toFixed(6)),head:out.subarray(0,24).toString('hex'),sha256:crypto.createHash('sha256').update(out).digest('hex')});
  }
  return results;
}
if(require.main===module){
  const fs=require('node:fs'); const path=require('node:path'); const root=process.argv[2]??path.resolve(__dirname,'..');
  const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
  const grid=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/base60-grid.json'),'utf8'));
  const s=corpus.pages.slice(0,3).flatMap(p=>p.indices);
  assert.equal(s.length,729);assert.equal(s[13],2);
  const keys=[pack(s.slice(0,13)),...Array.from({length:55},(_,i)=>pack(s.slice(14+13*i,27+13*i)))];
  assert.equal(keys[0].toString('hex'),'4b1cde6f9c9af1e1');
  const table=Buffer.from(grid.byte_rows.flat());
  assert.equal(crypto.createHash('sha256').update(table).digest('hex'),'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
  console.log(JSON.stringify({keys:keys.slice(49,52).map(b=>b.toString('hex')),results:experiment(keys,table,corpus.pages[57].indices)},null,2));
}
module.exports={experiment,pack};
