'use strict';
/**
 * Source-constrained public web-archive lookup for the 3 May 2014
 * #cicadasolvers Titanpad document vFCy7T5p0O.
 * No password, account, guessed onion addresses, hash inputs, or scraping.
 * Windows 11 + Node 22: node sims/lp2_2014_titanpad_cdx_source_sft.cjs
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const pad='vFCy7T5p0O';
assert.match(pad,/^[A-Za-z0-9]{12}$/);
const target='titanpad.com/'+pad;
const expectedSource='https://forums.unfiction.com/forums/viewtopic.php%40p%3D1038407.html';
const editions=['CC-MAIN-2014-23','CC-MAIN-2014-35','CC-MAIN-2014-41','CC-MAIN-2015-06'];
const params=new URLSearchParams({url:target,output:'json'});
const checks=[
  {name:'Arquivo.pt original locator 2014-16',url:'https://arquivo.pt/wayback/cdx?'+new URLSearchParams({url:target,from:'2014',to:'2016',output:'json',limit:'100'})},
  {name:'Arquivo.pt dated positive host',url:'https://arquivo.pt/wayback/cdx?'+new URLSearchParams({url:'www.publico.pt',from:'2014',to:'2014',output:'json',limit:'1'})},
  {name:'Internet Archive original locator 2014-16',url:'https://web.archive.org/cdx/search/cdx?'+new URLSearchParams({url:target,from:'2014',to:'2016',output:'json',filter:'statuscode:200'})},
  ...editions.map(e=>({name:e+' exact original locator',url:'https://index.commoncrawl.org/'+e+'-index?'+params.toString()}))
];
/** @param {string} s */
function summarize(s) {
  const lines=s.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  let n=lines.length;
  let rows=[];
  try {
    const parsed=JSON.parse(s);
    if(Array.isArray(parsed)){
      n=parsed.length;
      rows=parsed.slice(0,6);
    }else if(parsed!==null&&typeof parsed==='object'){
      n=Number(parsed.count??n);
      rows=[parsed];
    }
  }catch{
    rows=lines.slice(0,6).map(line=>{try{return JSON.parse(line)}catch{return line}});
  }
  return {items:n,sample:rows,sha256:crypto.createHash('sha256').update(s).digest('hex')};
}
async function run(){
 const out=[];
 for(const {name,url} of checks) {
  const record={name,url};
  try {
   const response=await fetch(url,{signal:AbortSignal.timeout(18000),headers:{'user-agent':'LP2-2014-original-workpad-source-gate/1.0'}});
   record.http=response.status;
   const body=(await response.text()).slice(0,200000);
   record.bytesSeen=Buffer.byteLength(body);
   record.summary=summarize(body);
  }catch(e){record.error=String(e.message??e);}
  out.push(record);
  console.log(JSON.stringify(record));
 }
 console.log(JSON.stringify({source:expectedSource,target,checks:out.length,
  successful:out.filter(x=>x.http===200).length,
  captureCandidates:out.filter(x=>x.http===200&&x.name!=='Arquivo.pt dated positive host'&&
    x.summary&&x.summary.items>0).map(x=>({name:x.name,items:x.summary.items})),
  claim:'Only an actual dated indexed record, followed by original response-byte recovery, can establish a workpad archival witness.'}));
}
run().catch(e=>{console.error(e);process.exitCode=1;});
