'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),MOD=29;
const mod=x=>((x%MOD)+MOD)%MOD;
const gp0=a=>mod(a.reduce((s,x)=>s+x,0));
const H4=v=>[mod(v[0]-v[3]),mod(v[1]-v[2]),mod(v[1]+v[2]),mod(v[0]+v[3])];

const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const transcription=fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8').replace(/\r/g,'');
const signed=fs.readFileSync(path.join(root,'resources/historical/cicada2016-4gq25-outguess.asc'),'utf8');
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const parts=transcription.split(/^\s*%\s*$/m).slice(0,55);
const pages=new Map();
for(let block=0;block<parts.length;block++){
  const page=block>=50?block+1:block,src=corpus.pages[page].indices,words=[];
  let cur=[],start=0,off=0;
  const flush=()=>{if(cur.length){words.push({start,values:cur.slice()});cur=[];}};
  for(const ch of parts[block]){
    const value=runeIndex.get(ch);
    if(value!==undefined){
      if(!cur.length)start=off;
      assert.equal(src[off],value);
      cur.push(value);off++;
    }else if(ch==='/'||/\s/u.test(ch)) continue;
    else flush();
  }
  flush(); pages.set(page,words);
}
const tokens=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
function gp(word){
  const text=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/[^A-Z]/g,'');
  const out=[];
  for(let i=0;i<text.length;){
    if(text.startsWith('ING',i)){out.push(21);i+=3;continue;}
    if(text.startsWith('IO',i)){out.push(27);i+=2;continue;}
    const token=tokens.find(t=>text.startsWith(t.symbol,i));
    assert.ok(token,'unmapped '+text.slice(i));
    out.push(token.value);i+=token.symbol.length;
  }
  return out;
}
const clear=signed.split('-----BEGIN PGP SIGNATURE-----')[0];
const source=clear.slice(clear.indexOf('Hello.')).split(/[^A-Za-z0-9]+/u)
  .filter(w=>/^[A-Za-z]+$/u.test(w)).map((word,index)=>({index,label:word.toUpperCase(),gp:gp(word)}));
const selected=new Map([[33,132],[37,146],[40,71]]);
const expectedKeys=new Map([[33,[25,5,26,2]],[37,[12,1,1,22]],[40,[20,20,12,6]]]);
const g=5,K=2;
const rows=[];
for(const page of [33,37,40]){
  const start=selected.get(page);
  const word=(pages.get(page)||[]).find(w=>w.start===start);
  assert.ok(word);
  const target=source[page].gp;
  const key=word.values.map((x,i)=>mod(x-target[i]));
  assert.deepEqual(key,expectedKeys.get(page));
  const h=H4(word.values),x=word.values[0];
  const predicted=[mod(x*g),mod(x*g),h[0],mod(x+K)];
  rows.push({page,label:source[page].label,start,receiver:word.values,h4:h,key,predicted,match:JSON.stringify(key)===JSON.stringify(predicted)});
}
assert.deepEqual(rows.map(r=>r.match),[false,false,true]);
assert.deepEqual(rows[2].receiver,[4,15,14,21]);
assert.deepEqual(rows[2].h4,[12,1,0,25]);
assert.equal(gp0(rows[2].receiver),25);
console.log(JSON.stringify({
  classification:'negative transfer of p40-derived receiver-vector key serializer',
  frozenRule:'S(R)=[R0*g,R0*g,H4(R)[0],R0+K], g=5, K=2',
  rows,
  decision:'exact p40 fit fails held-out p33 and p37; retire as shared q-block serializer'
},null,2));
