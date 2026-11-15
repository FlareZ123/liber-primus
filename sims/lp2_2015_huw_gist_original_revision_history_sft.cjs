'use strict';
/**
 * Original 2015 Fandom-linked Gist revision/source-key recovery, read-only.
 * Dateable original wiki pageID9003 revision26139 cites git.io/xQrlUg
 * resolving to this Gist. Inspect the oldest available API revisions for
 * original, possibly superseded GP29 key/decoder rules. Never executes source.
 * Node22 Windows via opt-in manual Actions.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const GIST='8a564d1e8027294df15d';
const BASE='https://api.github.com/gists/'+GIST;
async function getJson(url) {
  const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(30000),
    headers:{'accept':'application/vnd.github+json',
      'user-agent':'LP2-2015-period-gist-revision-key-forensics/1.0',
      'x-github-api-version':'2022-11-28'}});
  const body=await r.text();
  if(r.status!==200)throw Error('API '+r.status+' url '+url+' response '+body.slice(0,300));
  return JSON.parse(body);
}
/** @param {string} s */
function sha256(s){return crypto.createHash('sha256').update(s).digest('hex')}
/** @param {string} body */
function staticKeys(body) {
  const lines=body.split(/\r?\n/),selected=[];
  for(let i=0;i<lines.length;i++){
    const line=lines[i].trim();
    if(/(?:^def forge_offsets|offsets\s*=\s*forge_offsets|^#\s*offsets\s*=|^#\s*sequence\s*=|^sequence\s*=|if.*rune|off_num|def find_position|^import|output\s*\+?=|find_position\(|direction|advance|skip)/.test(line))
      selected.push({line:i+1,chars:line.length,sha256:sha256(line),code:line.length>350?line.slice(0,165)+' ... '+line.slice(-165):line});
  }
  return {lineCount:lines.length,selected};
}
async function main(){
  assert.equal(GIST,'8a564d1e8027294df15d');
  assert(staticKeys('offsets = forge_offsets([2,3],1,-3301)').selected.length===1);
  console.log('SELFTEST revision code-only scanner PASS');
  if(!process.argv.includes('--network'))return;
  const versions=await getJson(BASE+'/commits?per_page=100');
  assert(Array.isArray(versions)&&versions.length>0,'No revision history');
  assert(versions.length<=100);
  const output=[];
  let earliestProgram='';
  for(const item of versions){
    const sha=item.version;
    assert(/^[0-9a-f]{40}$/.test(sha),'Git history hash');
    const g=await getJson(BASE+'/'+sha);
    const file=Object.values(g.files||{}).find(f=>f.filename==='runes.py');
    assert(file,'Missing exact original runes.py at '+sha);
    const body=file.content;
    assert(typeof body==='string'&&body.length>1000,'Truncated or absent source');
    const meta=staticKeys(body);
    if(item===versions.at(-1))earliestProgram=body;
    output.push({version:sha,committedAt:item.committed_at,
      historicalUpdatedAt:g.updated_at,rawFile:file.raw_url,
      byteLength:Buffer.byteLength(body),sha256:sha256(body),
      ...meta});
  }
  console.log('REVISIONS',JSON.stringify(output));
  for(const version of output){
    console.log('KEY_MECHANISM',JSON.stringify({revision:version.version,date:version.committedAt,
      methods:version.selected.filter(x=>/forge_offsets|offsets\s*=|output|find_position|off_num/.test(x.code))}));
  }
  const oldLines=earliestProgram.split(/\r?\n/);
  console.log('EARLIEST_EXECUTABLE_WINDOW',JSON.stringify({version:output.at(-1).version,
    lines:oldLines.map((x,i)=>({line:i+1,code:x.length>260?x.slice(0,105)+' ... '+x.slice(-105):x}))
      .filter(x=>x.line>=108&&x.line<=oldLines.length)}));
  const distinct=[...new Set(output.map(x=>x.sha256))];
  console.log('DECISION',JSON.stringify({revisions:versions.length,
    distinctCodeBodies:distinct.length,
    oldest:output.at(-1).committedAt,newest:output[0].committedAt,
    oldSourceKeyRules:output.at(-1).selected.filter(x=>/offsets|sequence/.test(x.code)),
    sourceChanged:distinct.length>1}));
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
