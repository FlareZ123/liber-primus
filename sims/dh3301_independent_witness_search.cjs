#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {gunzipSync,inflateRawSync,constants}=require('node:zlib');

const SOURCES=[
 {label:'2013 #33012013 IRC log',repo:'neuroretransmit/cicada',commit:'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3',path:'irc-logs/#33012013.freenode.log',sha:'f81e20129fb6dff69e0f614746089b8c6cbc8130',kind:'text'},
 {label:'2013 winners-leak IRC log',repo:'Dukotah/cicada3301',commit:'6b945291ed298c14ccf8c73603f695a28f6a7e35',path:'corpus/C-community/irc/2013_winners-leak_irc-log.txt',sha:'87484321fd82e492963bce9353e85ed8452bc503',kind:'text'},
 {label:'Cypherpunks legacy 2013 mbox',repo:'Dukotah/cicada3301',commit:'6b945291ed298c14ccf8c73603f695a28f6a7e35',path:'corpus/C-community/mailinglists/cypherpunks/cypherpunks-legacy_2013.mbox.gz',sha:'2904f62eafad2de1b35135f7ef8394025a4c4965',kind:'mbox'},
 {label:'Cypherpunks 2013 mbox',repo:'Dukotah/cicada3301',commit:'6b945291ed298c14ccf8c73603f695a28f6a7e35',path:'corpus/C-community/mailinglists/cypherpunks/cypherpunks_2013.mbox.gz',sha:'b1372c4ac3c7dc50d98b5d362c49418a60f6d3fe',kind:'mbox'},
 {label:'2013 narrative part 1 DOCX (archive, possibly derivative)',repo:'cijhho123/cicada3301',commit:'d360ad97d39c4719e42dc88b0cbbb81ed54aa02c',path:'2013/2013 - what happend part 1.docx',sha:'5500f4217657d32e9add1d3452a29aa36a6f2569',kind:'docx'},
 {label:'2013 narrative part 2 DOCX (archive, possibly derivative)',repo:'cijhho123/cicada3301',commit:'d360ad97d39c4719e42dc88b0cbbb81ed54aa02c',path:'2013/2013 - what happend part 2.docx',sha:'b6c8572471314d4db88c191e2ca369378d74f46a',kind:'docx'},
 {label:'2013 leaked-email DOCX (archive, possibly derivative)',repo:'cijhho123/cicada3301',commit:'d360ad97d39c4719e42dc88b0cbbb81ed54aa02c',path:'2013/additional docs/The Leaked Email/WE GOT EMAILS.docx',sha:'e57c7c2ec6fc0232bb4421d09edc59a6306758e0',kind:'docx'},
 {label:'2013 leaked-email server response text',repo:'cijhho123/cicada3301',commit:'d360ad97d39c4719e42dc88b0cbbb81ed54aa02c',path:'2013/additional docs/The Leaked Email/Server response - include leaker email with pgp.txt',sha:'e1ded7fd4cb0e17b6f62a17d23a48276763c78b7',kind:'text'}
];
const fields=['2800','1067','2757','1264','331','3301'];
const re=t=>new RegExp('(?<![0-9])'+t+'(?![0-9])','g');
function blobSha(b){return crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');}
function url(s){return 'https://raw.githubusercontent.com/'+s.repo+'/'+s.commit+'/'+s.path.split('/').map(encodeURIComponent).join('/');}
async function download(s){const res=await fetch(url(s));assert.equal(res.status,200,'download '+s.label);const b=Buffer.from(await res.arrayBuffer());assert.equal(blobSha(b),s.sha,'pinned blob SHA '+s.label);return b;}
function zipEntry(z,target){
 let end=-1;for(let i=z.length-22;i>=Math.max(0,z.length-65557);i--)if(z.readUInt32LE(i)===0x06054b50){end=i;break;}
 assert.notEqual(end,-1,'ZIP EOCD');const count=z.readUInt16LE(end+10);let p=z.readUInt32LE(end+16);
 for(let i=0;i<count;i++){
  assert.equal(z.readUInt32LE(p),0x02014b50);const method=z.readUInt16LE(p+10),size=z.readUInt32LE(p+20),nl=z.readUInt16LE(p+28),el=z.readUInt16LE(p+30),cl=z.readUInt16LE(p+32),lo=z.readUInt32LE(p+42);
  const name=z.toString('utf8',p+46,p+46+nl);
  if(name===target){const start=lo+30+z.readUInt16LE(lo+26)+z.readUInt16LE(lo+28),data=z.subarray(start,start+size);if(method===0)return Buffer.from(data);if(method===8)return inflateRawSync(data);throw Error('ZIP method '+method);}
  p+=46+nl+el+cl;
 }throw Error('missing ZIP entry '+target);
}
function xmlText(x){return x.replace(/<w:tab[^>]*\/>/g,' ').replace(/<\/w:p>/g,'\n').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/\s+/g,' ');}
function hits(text,token,limit=12){const out=[];let m;const q=re(token);while((m=q.exec(text))&&out.length<limit)out.push({offset:m.index,context:text.slice(Math.max(0,m.index-160),Math.min(text.length,m.index+240))});return out;}
function mboxReport(text){
 const msgs=text.split(/^From /m).slice(1).map(s=>'From '+s),all=[];
 for(const msg of msgs){const h=hits(msg,'2800',1);if(!h.length)continue;const end=msg.indexOf('\n\n');const header=msg.slice(0,end<0?700:end);const found=fields.filter(f=>re(f).test(msg));const other=found.some(f=>['1067','2757','1264','331'].includes(f));const protocol=/\b(DH|Diffie[- ]Hellman)\b/i.test(msg)&&re('3301').test(msg);all.push({header:header.slice(0,500),fields:found,possibleSameSession:other||protocol,context:h[0].context});}
 return {messages:msgs.length,withExact2800:all.length,possibleSameSession:all.filter(x=>x.possibleSameSession),samples:all.slice(0,12)};
}
(async()=>{
 const output=[];
 for(const s of SOURCES){
  const b=await download(s);let text,extra={bytes:b.length,gitBlobSha:s.sha};
  if(s.kind==='mbox'){let inflated,mode='full',fullError=null;try{inflated=gunzipSync(b);}catch(e){fullError=e.message;try{inflated=gunzipSync(b,{finishFlush:constants.Z_SYNC_FLUSH});mode='partial-Z_SYNC_FLUSH';}catch(e2){extra.gzipError=e2.message;output.push({label:s.label,repo:s.repo,commit:s.commit,path:s.path,...extra});continue;}}text=inflated.toString('utf8');extra.inflatedBytes=inflated.length;extra.decompressionMode=mode;if(fullError)extra.fullGzipError=fullError;extra.mbox=mboxReport(text);}
  else if(s.kind==='docx'){text=xmlText(zipEntry(b,'word/document.xml').toString('utf8'));const core=zipEntry(b,'docProps/core.xml').toString('utf8');extra.created=(core.match(/<dcterms:created[^>]*>(.*?)<\/dcterms:created>/)||[])[1]||null;extra.modified=(core.match(/<dcterms:modified[^>]*>(.*?)<\/dcterms:modified>/)||[])[1]||null;}
  else text=b.toString('utf8');
  extra.textLength=text.length;extra.exactFieldHits=Object.fromEntries(fields.map(f=>[f,hits(text,f)]));
  if(!extra.mbox)extra.possibleSameSessionContexts=extra.exactFieldHits['2800'].filter(h=>['1067','2757','1264','331'].some(f=>re(f).test(h.context))||(/\b(DH|Diffie[- ]Hellman)\b/i.test(h.context)&&re('3301').test(h.context)));
  output.push({label:s.label,repo:s.repo,commit:s.commit,path:s.path,...extra});
 }
 console.log(JSON.stringify({purpose:'bounded independent-witness search only; no exponent/key search',requirement:'exact standalone client share 2800 plus another session field or session-specific context',sources:output},null,2));
})().catch(e=>{console.error(e.stack||String(e));process.exitCode=1;});
