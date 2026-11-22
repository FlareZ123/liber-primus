'use strict';

/**
 * Source-locked search for a period-original LP2 PDF/PostScript/vector/layout
 * master pointer. Reads only the three SHA-pinned 2014 IRC logs and the
 * preserved Stage11 index/signed message. It does not enumerate archive paths,
 * download third-party attachments, or synthesize replacement documents.
 *
 * Node.js 22. Usage:
 *   node sims/lp2_2014_period_master_pointer_sft.cjs --selftest
 *   node sims/lp2_2014_period_master_pointer_sft.cjs --network
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');

const SOURCES = [
  {name:'#cicadasolvers.freenode.log', bytes:18487233, sha1:'bdd277c14f94c34b5ae714cd00c238065beeed4e'},
  {name:'#cicadasolvers.freenode.2.log', bytes:27234234, sha1:'72634a9d071d32af767edbffc0493d810e88cd0d'},
  {name:'#33012014.freenode.log', bytes:8629610, sha1:'a2880b1db31ce523599ef30ca2e55291bf295900'}
];
const STAGE11 = {
  index:{
    url:'https://raw.githubusercontent.com/micheloosterhof/cicada-2014/master/stage11/ky2khlqdf7qdznac.onion/index.html',
    bytes:1640,
    sha1:'303db130705f0ef9be2a738f4336d5cfcebde80c'
  },
  message:{
    url:'https://raw.githubusercontent.com/micheloosterhof/cicada-2014/master/stage11/message.txt.asc',
    bytes:1183,
    sha1:'e2b7382ac2cfb0adfe028cc063fc6048e0ad718e'
  }
};
const EXTENSIONS = 'pdf|ps|eps|svg|tex|lyx|dvi|ai|indd|xcf|psd|odt|docx?|pptx?|rtf|pages|idml|sla|pub|qxd';
const EXT_RE = new RegExp('(?:[A-Za-z0-9_./%~:+-]+)\\.(?:' + EXTENSIONS + ')(?:[?#][^\\s<>"\\x27]*)?', 'ig');
const URL_RE = /https?:\/\/[^\s<>"'()]+/ig;
const PUZZLE_RE = /\b(?:liber[ -]?primus|lp2|cicada|3301|stage\s*11|onion7|onion|runes?|runic|gematria|page\s*(?:[0-5]?\d))\b/i;
const TERMS = [
  ['pdf', /\bpdf\b/i, 'specific'],
  ['postscript', /\bpostscript\b/i, 'specific'],
  ['ghostscript', /\bghostscript\b/i, 'specific'],
  ['latex', /\blatex\b/i, 'specific'],
  ['tex', /\btex\b/i, 'specific'],
  ['fontforge', /\bfontforge\b/i, 'specific'],
  ['typeface', /\btypeface\b/i, 'specific'],
  ['basefont', /\/basefont\b/i, 'specific'],
  ['font-subset', /\bfont\s+subset\b/i, 'specific'],
  ['inkscape', /\binkscape\b/i, 'specific'],
  ['illustrator', /\billustrator\b/i, 'specific'],
  ['indesign', /\bindesign\b/i, 'specific'],
  ['acrobat', /\bacrobat\b/i, 'specific'],
  ['imagemagick', /\bimagemagick\b/i, 'specific'],
  ['font', /\bfonts?\b/i, 'contextual'],
  ['vector', /\bvector(?:s|ial)?\b/i, 'contextual'],
  ['raster', /\braster(?:s|ized|ised)?\b/i, 'contextual'],
  ['render', /\brender(?:ed|ing)?\b/i, 'contextual'],
  ['typeset', /\btypeset(?:ting)?\b/i, 'contextual'],
  ['export', /\bexport(?:ed|ing)?\b/i, 'contextual'],
  ['layout', /\blayout\b/i, 'contextual'],
  ['master', /\bmaster\b/i, 'contextual'],
  ['dpi', /\b\d{2,4}\s*dpi\b/i, 'contextual']
];

function gitBlobSha1(bytes) {
  return crypto.createHash('sha1')
    .update('blob ' + bytes.length + '\0', 'ascii')
    .update(bytes)
    .digest('hex');
}
function parse2014Line(raw, lineNo) {
  const m = raw.match(/^(2014 [A-Z][a-z]{2} \d{2} \d{2}:\d{2})\s+(?:<([^>]{1,80})>\s*)?(.*)$/);
  if (!m) return null;
  return {lineNo, date:m[1], day:m[1].slice(0,11), nick:m[2] || null, body:m[3] || '', raw};
}
function extractUrls(text) {
  return (text.match(URL_RE) || []).map(x=>x.replace(/[\],;:.!?}]+$/g,''));
}
function analyzeLines(lines, source) {
  const parsed = new Array(lines.length);
  let dated2014 = 0;
  for (let i=0;i<lines.length;i++) {
    parsed[i] = parse2014Line(lines[i], i+1);
    if (parsed[i]) dated2014++;
  }
  const hits = [];
  let explicitFormatLines = 0;
  let specificTermLines = 0;
  let contextualTermLines = 0;
  for (let i=0;i<parsed.length;i++) {
    const row=parsed[i];
    if (!row) continue;
    const lo=Math.max(0,i-4), hi=Math.min(parsed.length,i+5);
    const context=[];
    for(let j=lo;j<hi;j++) {
      const p=parsed[j];
      if(p && p.day===row.day) context.push(p);
    }
    const contextText=context.map(x=>x.body).join(' ');
    const puzzleContext=PUZZLE_RE.test(contextText);
    const formats=[...row.body.matchAll(EXT_RE)].map(x=>x[0]);
    const termHits=TERMS.filter(t=>t[1].test(row.body)).map(t=>({name:t[0],kind:t[2]}));
    const hasSpecific=termHits.some(x=>x.kind==='specific');
    const hasContextual=termHits.some(x=>x.kind==='contextual');
    if(formats.length) explicitFormatLines++;
    if(hasSpecific) specificTermLines++;
    if(hasContextual && puzzleContext) contextualTermLines++;
    if(!formats.length && !hasSpecific && !(hasContextual && puzzleContext)) continue;
    const contextUrls=[...new Set(context.flatMap(x=>extractUrls(x.body)))];
    const score=20*Number(formats.length>0)+12*Number(hasSpecific)+8*Number(puzzleContext)+
      3*Number(termHits.some(x=>['font','typeface','basefont','font-subset'].includes(x.name)));
    hits.push({
      source,
      line:row.lineNo,
      date:row.date,
      nick:row.nick,
      score,
      explicitFileFormats:formats,
      documentTerms:termHits.map(x=>x.name),
      puzzleContext,
      urls:contextUrls,
      text:row.body.slice(0,900),
      context:context.map(x=>({line:x.lineNo,date:x.date,nick:x.nick,text:x.body.slice(0,650)}))
    });
  }
  hits.sort((a,b)=>b.score-a.score||a.line-b.line);
  return {
    source,
    totalLines:lines.length,
    dated2014Lines:dated2014,
    explicitFormatLines,
    specificTermLines,
    contextualTermLines,
    hitCount:hits.length,
    hits
  };
}
async function download(url, expected) {
  const response=await fetch(url,{signal:AbortSignal.timeout(120000),headers:{'user-agent':'LP2-period-master-pointer-source-gate/1.0'}});
  assert.equal(response.status,200,url+' HTTP status');
  const bytes=Buffer.from(await response.arrayBuffer());
  assert.equal(bytes.length,expected.bytes,url+' byte length');
  assert.equal(gitBlobSha1(bytes),expected.sha1,url+' Git blob SHA-1');
  return bytes;
}
async function runNetwork() {
  const reports=[];
  for(const meta of SOURCES) {
    const url='https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/%23'+meta.name.slice(1);
    const bytes=await download(url,meta);
    const report=analyzeLines(bytes.toString('latin1').split(/\r?\n/),meta.name);
    reports.push({...report,bytes:meta.bytes,gitBlobSha1:meta.sha1});
    console.log('IRC_SOURCE '+JSON.stringify({
      source:meta.name,bytes:meta.bytes,gitBlobSha1:meta.sha1,
      totalLines:report.totalLines,dated2014Lines:report.dated2014Lines,
      explicitFormatLines:report.explicitFormatLines,
      specificTermLines:report.specificTermLines,
      contextualTermLines:report.contextualTermLines,
      hitCount:report.hitCount
    }));
  }
  const indexBytes=await download(STAGE11.index.url,STAGE11.index);
  const index=indexBytes.toString('utf8');
  const images=[...index.matchAll(/<img\s+src="(\d+\.jpg)"\s*\/?\s*>/gi)].map(x=>x[1]);
  assert.equal(images.length,58,'Stage11 index image count');
  assert.deepEqual(images,Array.from({length:58},(_,i)=>i+'.jpg'),'Stage11 image order');
  const hrefCount=[...index.matchAll(/\bhref\s*=/gi)].length;
  assert.equal(hrefCount,0,'Stage11 index unexpectedly has an href');
  const messageBytes=await download(STAGE11.message.url,STAGE11.message);
  const message=messageBytes.toString('utf8');
  const onions=[...message.matchAll(/[a-z2-7]{16}\.onion/gi)].map(x=>x[0]);
  assert.deepEqual(onions,['ky2khlqdf7qdznac.onion'],'Stage11 signed-message onion target');
  const stage11={
    index:{url:STAGE11.index.url,bytes:STAGE11.index.bytes,gitBlobSha1:STAGE11.index.sha1,
      title:(index.match(/<title>([^<]+)<\/title>/i)||[])[1]||null,
      containerId:(index.match(/<div\s+id="([^"]+)"/i)||[])[1]||null,
      imageCount:images.length,firstImage:images[0],lastImage:images[images.length-1],
      hrefCount,nonJpegAssetReferences:[...index.matchAll(/(?:src|href)="([^"]+)"/gi)].map(x=>x[1]).filter(x=>! /^\d+\.jpg$/i.test(x))},
    signedMessage:{url:STAGE11.message.url,bytes:STAGE11.message.bytes,gitBlobSha1:STAGE11.message.sha1,
      onionReferences:onions,hasPdfOrPostscript:/\b(?:pdf|postscript|ghostscript|latex|fontforge)\b/i.test(message),
      documentFileReferences:[...message.matchAll(new RegExp('\\b[^\\s]+\\.(?:'+EXTENSIONS+')\\b','ig'))].map(x=>x[0])}
  };
  assert.equal(stage11.index.nonJpegAssetReferences.length,0,'Unexpected Stage11 non-JPEG asset reference');
  assert.equal(stage11.signedMessage.hasPdfOrPostscript,false,'Unexpected PDF/PostScript reference in signed message');
  const allHits=reports.flatMap(x=>x.hits).sort((a,b)=>b.score-a.score||a.source.localeCompare(b.source)||a.line-b.line);
  const report={
    title:'2014 period-original PDF/PostScript/vector/layout master pointer search',
    scope:'Only the three SHA-pinned 2014 IRC logs and the preserved Stage11 HTML/signed message. No arbitrary archive crawl, host/path brute force, third-party attachment execution, or synthetic document rendering.',
    sources:reports.map(({hits,...summary})=>summary),
    stage11,
    totalDated2014Lines:reports.reduce((n,x)=>n+x.dated2014Lines,0),
    totalExplicitFormatLines:reports.reduce((n,x)=>n+x.explicitFormatLines,0),
    totalSpecificTermLines:reports.reduce((n,x)=>n+x.specificTermLines,0),
    totalContextualTermLines:reports.reduce((n,x)=>n+x.contextualTermLines,0),
    totalHits:allHits.length,
    hits:allHits
  };
  fs.mkdirSync('im-results',{recursive:true});
  fs.writeFileSync('im-results/lp2-2014-period-master-pointer-report.json',JSON.stringify(report,null,2)+'\n');
  const md=[
    '# 2014 period-original LP2 PDF/PostScript master-pointer search',
    '',
    '**Scope:** the three SHA-pinned 2014 IRC transcripts plus the preserved Stage11 HTML and signed message. This is a bounded text/source-pointer search, not a general archive crawl. No third-party attachment was executed and no replacement document was rendered.',
    '',
    '## Verified IRC inputs',
    '',
    ...reports.map(x=>'- '+x.source+': '+x.bytes+' bytes; Git blob SHA-1 '+x.gitBlobSha1+'; '+x.dated2014Lines+' dated 2014 lines; '+x.explicitFormatLines+' explicit document-format lines; '+x.specificTermLines+' specific document/toolchain lines; '+x.contextualTermLines+' contextual layout/rendering lines; '+x.hitCount+' retained hits.'),
    '',
    '## Stage11 distribution source',
    '',
    '- Preserved index: '+stage11.index.url+'; '+stage11.index.bytes+' bytes; Git blob SHA-1 '+stage11.index.gitBlobSha1+'; title '+stage11.index.title+'; container '+stage11.index.containerId+'.',
    '- The index contains exactly '+stage11.index.imageCount+' ordered image references ('+stage11.index.firstImage+' through '+stage11.index.lastImage+'), '+stage11.index.hrefCount+' href attributes, and '+stage11.index.nonJpegAssetReferences.length+' non-JPEG asset references.',
    '- Signed message: '+stage11.signedMessage.bytes+' bytes; Git blob SHA-1 '+stage11.signedMessage.gitBlobSha1+'; onion reference(s): '+stage11.signedMessage.onionReferences.join(', ')+'. PDF/PostScript/toolchain terms present: '+stage11.signedMessage.hasPdfOrPostscript+'.',
    '',
    '## Candidate transcript lines',
    ''
  ];
  if(!allHits.length) md.push('No lines matched the bounded document-format/toolchain selectors.');
  for(const hit of allHits.slice(0,15)){
    md.push('### '+hit.source+' L'+hit.line+' — '+hit.date+' ('+(hit.nick||'system')+')');
    md.push('Formats: '+(hit.explicitFileFormats.join(', ')||'none')+'; terms: '+(hit.documentTerms.join(', ')||'none')+'; LP2 context: '+hit.puzzleContext+'.');
    md.push('~~~text');
    for(const c of hit.context.slice(0,7)) md.push('L'+c.line+' '+(c.nick?'<'+c.nick+'> ':'')+c.text.slice(0,360));
    md.push('~~~','');
  }
  if(allHits.length>15) md.push('The full '+allHits.length+'-hit inventory is preserved in the accompanying JSON artifact.');
  md.push(
    '## Related prior work (complementary scope)',
    '',
    '- The repository research note im-results/lp2-2014-irc-nonpaste-file-source-gate.md records the six historically selected non-Git/non-paste downloadable attachments (two UnRuneIt JARs, one ODS sheet, and three text transcriptions); the two JARs were statically inspected and do not provide an LP2 key tape or unknown-page plaintext.',
    '- The independent Dukotah/cicada3301 Round-20 N1 hunt searched 195 distinct local PDFs plus four named mirrors and found no surviving LP PDF/PostScript with a runic text layer or embedded runic font subset: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round20/N1/RESULTS.md . That corpus/mirror search is not a substitute for this period-transcript search.',
    '',
    '## Interpretation boundary',
    '',
    'A negative result excludes only an explicit filename, URL, or document/toolchain pointer in these authenticated public 2014 transcript and Stage11 text sources. It cannot exclude a privately held source master, an unindexed host, or an undocumented euphemistic reference. The JSON file preserves every matched line and its source context.'
  );
  fs.writeFileSync('im-results/lp2-2014-period-master-pointer-report.md',md.join('\n')+'\n');
  console.log('MASTER_POINTER_SUMMARY '+JSON.stringify({
    totalDated2014Lines:report.totalDated2014Lines,
    totalExplicitFormatLines:report.totalExplicitFormatLines,
    totalSpecificTermLines:report.totalSpecificTermLines,
    totalContextualTermLines:report.totalContextualTermLines,
    totalHits:report.totalHits,
    stage11:stage11
  }));
  for(const hit of allHits.slice(0,160)) console.log('MASTER_POINTER_HIT '+JSON.stringify(hit));
}
function selftest() {
  const sample=[
    '2014 May 03 10:00 <a> Liber Primus page 0 was distributed',
    '2014 May 03 10:01 <a> original source PDF: https://files.example.test/lp-master.pdf',
    '2014 May 03 10:02 <b> Ghostscript rendered the rune font',
    '2014 May 03 10:03 <c> unrelated attachment https://files.example.test/notes.pdf',
    '2014 May 04 10:04 <d> LP2 was mentioned on another day',
    '2015 May 04 10:05 <d> PostScript is outside the 2014 corpus'
  ];
  const result=analyzeLines(sample,'synthetic');
  assert.equal(result.dated2014Lines,5);
  assert.equal(result.explicitFormatLines,2);
  assert.equal(result.specificTermLines,3);
  assert.equal(result.hitCount,3);
  assert(result.hits.some(x=>x.line===2&&x.explicitFileFormats.some(y=>/\.pdf/i.test(y))));
  assert(result.hits.some(x=>x.line===3&&x.documentTerms.includes('ghostscript')&&x.puzzleContext));
  assert(!result.hits.some(x=>x.line===6));
  assert.equal(gitBlobSha1(Buffer.from('test')),'30d74d258442c7c65512eafab474568dd706c430');
  console.log('SELFTEST PASS: period gate, file-format extraction, renderer terms, source context, Git blob');
}
async function main() {
  if(process.argv.includes('--selftest')) {selftest();return;}
  assert(process.argv.includes('--network'),'Choose --selftest or --network');
  await runNetwork();
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
