"use strict";

const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");

const ORIGIN="https://gitlab.com/onecool/liber_primus.git";
const API="https://archive.softwareheritage.org/api/1";
const CURRENT=new Set([
  "d76752848f236a736c37ed18a9c51f7a2ec9bcdd",
  "3617c5c57e02bea55633a869ac6058db1463e3d5",
  "96f1bbaea8d192a8711261b58a5485631220d510",
  "ce3ca8ade50cf3a750b9bd3fdd27f18aae4f83d8",
  "098b724054c981e922d6dc8b20b43fd42d90f4b4",
  "4906207572ea7ed4e46e501886508e408ffb2fdb",
  "d81c4a3901a38a4dc097366ff3b58ad369b2bdee"
]);

/** @param {string} url */
async function get(url){
  try{
    const r=await fetch(url,{
      headers:{"User-Agent":"liber-primus-swh-history/1.0"},
      signal:AbortSignal.timeout(30000)
    });
    const text=await r.text();
    let data=null;
    try{data=JSON.parse(text);}catch{}
    return {url,status:r.status,ok:r.ok,data,text:text.slice(0,500000)};
  }catch(e){return {url,status:0,ok:false,error:String(e),data:null,text:""};}
}

/** @param {any} branches */
function normalizeBranches(branches){
  const out=[];
  if(!branches||typeof branches!=="object") return out;
  for(const [name,b] of Object.entries(branches)){
    if(!b) continue;
    out.push({
      name,
      target_type:b.target_type||null,
      target:b.target||null,
    });
  }
  return out;
}

async function main(){
  const out={generated_at:new Date().toISOString(),origin:ORIGIN,visits:null,snapshots:[],revisions:[],new_revision_targets:[]};
  const visitsUrl=API+"/origin/"+encodeURIComponent(ORIGIN)+"/visits/";
  const visits=await get(visitsUrl);
  out.visits={status:visits.status,ok:visits.ok,data:visits.data,error:visits.error||null};
  const rows=Array.isArray(visits.data)?visits.data:(Array.isArray(visits.data?.results)?visits.data.results:[]);
  const snapshotIds=[...new Set(rows.map(v=>v.snapshot).filter(x=>typeof x==="string"&&x.length))];

  // Include the snapshot exposed by the origin search even if visit pagination omits it.
  snapshotIds.push("09d2e23005bd2a58c208ed26be7711b37afd2380");

  const uniqueSnapshots=[...new Set(snapshotIds)];
  const revisionTargets=new Set();
  for(const id of uniqueSnapshots){
    const s=await get(API+"/snapshot/"+id+"/");
    const branches=normalizeBranches(s.data?.branches);
    for(const b of branches){
      if(b.target_type==="revision" && typeof b.target==="string") revisionTargets.add(b.target);
    }
    out.snapshots.push({
      id,status:s.status,ok:s.ok,
      branches,
      next_branch:s.data?.next_branch||null,
      error:s.error||null
    });
  }

  for(const rev of revisionTargets){
    const r=await get(API+"/revision/"+rev+"/");
    out.revisions.push({
      id:rev,
      in_current_visible_history:CURRENT.has(rev),
      status:r.status,ok:r.ok,
      date:r.data?.date||null,
      committer_date:r.data?.committer_date||null,
      author:r.data?.author||null,
      committer:r.data?.committer||null,
      message:r.data?.message||null,
      parents:r.data?.parents||null,
      directory:r.data?.directory||null,
      metadata:r.data?.metadata||null,
      error:r.error||null
    });
  }
  out.new_revision_targets=out.revisions.filter(r=>!r.in_current_visible_history).map(r=>r.id);

  fs.writeFileSync(path.join(process.env.RUNNER_TEMP||os.tmpdir(),"swh-history-output.json"),JSON.stringify(out,null,2));
  console.log(JSON.stringify(out,null,2));
}

main().catch(e=>{console.error(e);process.exitCode=1;});
