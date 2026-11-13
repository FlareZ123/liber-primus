'use strict';
/**
 * Independent original-era LP2 clear-signed Pastebin witness recovery.
 * On 2014-05-02 14:46 UTC the original #cicadasolvers IRC log L163729
 * directly posted http://pastebin.com/5w5VC696 as the May release message.
 * If an original 2014 HTML/raw capture survives, inspect it for the alleged
 * prime-gap 19 whitespace; do not equate format-truncated HTML with an
 * original signed whitespace stream.
 *
 * node sims/lp2_2014_pastebin_release_whitespace_probe.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const path=require('node:path');
const originals=[
  'http://pastebin.com/5w5VC696',
  'https://pastebin.com/5w5VC696',
  // 2014 Uncovering Cicada wiki links this second archived Pastebin witness.
  'http://pastebin.com/6M3s1FtC',
  'https://pastebin.com/6M3s1FtC',
  'http://pastebin.com/raw.php?i=6M3s1FtC',
  'https://pastebin.com/raw.php?i=6M3s1FtC',
];
function hash(b){return crypto.createHash('sha256').update(b).digest('hex');}
function atomic(file,data){
  const lock=file+'.lock',fd=fs.openSync(lock,'wx');
  try{const t=file+'.'+process.pid+'.tmp';fs.writeFileSync(t,data,{flag:'wx'});fs.renameSync(t,file);}
  finally{fs.closeSync(fd);fs.unlinkSync(lock);}
}
async function get(url){
  try {
    const response=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(18000)});
    const data=Buffer.from(await response.arrayBuffer());
    const result={status:response.status,finalUrl:response.url,bytes:data.length,
      sha256:hash(data),contentType:response.headers.get('content-type')};
    if(data.length<=1500000)result.body=data.toString('utf8');
    return result;
  } catch(error){return {error:String(error)};}
}
async function main(){
  assert.equal(originals[0],'http://pastebin.com/5w5VC696');
  assert.equal(hash(Buffer.from('ABC')),
    'b5d4045c3f466fa91fe2cc6abe79232a1a57cdf104f7a26e716e0a1e2789df78');
  console.log('Original 2014 URL and SHA256 control: PASS');
  if(process.argv.includes('--selftest'))return;
  const out='paste-2014-original-witness';
  fs.mkdirSync(out,{recursive:true});
  const queries=[],replays=[];
  const controls=[];
  for(const arc of ['wayback','arquivo']){
    for(const u of ['http://www.sapo.pt/',...originals]){
      const control=u.includes('sapo.pt');
      const q=arc==='wayback'?
        new URL('https://web.archive.org/cdx/search/cdx'):
        new URL('https://arquivo.pt/wayback/cdx');
      q.searchParams.set('url',u);
      q.searchParams.set('output','json');
      q.searchParams.set('from','2014');
      q.searchParams.set('to','2020');
      q.searchParams.set('limit','150');
      const index=await get(q.toString()),entry={archive:arc,control,u,
        request:q.toString(),status:index.status,error:index.error};
      try{
        const src=index.body||'';
        const rows=arc==='wayback'?
          JSON.parse(src):src.split(/\r?\n/).filter(Boolean).map(JSON.parse);
        const normalized=arc==='wayback'&&rows.length?
          rows.slice(1).map(row=>Object.fromEntries(row.map((v,i)=>[rows[0][i],v]))):rows;
        entry.count=normalized.length;
        const exact=normalized.filter(x=>x.timestamp&&String(x.statuscode||x.status)==='200');
        entry.earliest=exact.slice(0,5);
        if(!control)for(const cap of exact.slice(0,3)){
          const replay=arc==='wayback'?
            'https://web.archive.org/web/'+cap.timestamp+'id_/'+(cap.original||u):
            'https://arquivo.pt/wayback/'+cap.timestamp+'id_/'+(cap.url||u);
          const body=await get(replay);
          const text=body.body||'';
          const sourceId=u.includes('6M3s1FtC')?'6M3s1FtC':'5w5VC696';
          const fn=arc+'-'+sourceId+'-'+cap.timestamp+'.txt';
          const candidate=body.status===200&&text.includes('-----BEGIN PGP SIGNED MESSAGE-----');
          if(candidate)atomic(path.join(out,fn),text);
          if(candidate){
            const start=text.indexOf('-----BEGIN PGP SIGNED MESSAGE-----');
            body.signedBlockExcerpt=text.slice(start, start+2100);
          }
          delete body.body;
          replays.push({arc,timestamp:cap.timestamp,replay,
            signedTextRecognized:candidate,local: candidate?fn:null,...body});
        }
      }catch(err){entry.parseError=String(err);entry.indexBytes=index.bytes;}
      (control?controls:queries).push(entry);
    }
  }
  const result={date:new Date().toISOString(),source:'IRC 2014-05-02 14:46 L163729',
    originalLogSha1:'bdd277c14f94c34b5ae714cd00c238065beeed4e',
    provenanceLimit:'A dated third-party Pastebin copy establishes a contemporaneous witness, not Cicada signature authentication of trailing whitespace.',
    controls,queries,replays};
  atomic(path.join(out,'report.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
