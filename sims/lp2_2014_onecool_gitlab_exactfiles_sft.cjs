"use strict";

/**
 * Bounded 2014 participant-file custody probe.
 * Inspect one independent, participant-named public GitLab mirror; preserve
 * exact names, contents' SHA256 and public timestamps if found. No writes.
 * Node 22, CommonJS, no external packages.
 */
const assert = require("node:assert/strict");
const {createHash} = require("node:crypto");

const gitlab = "https://gitlab.com/api/v4";
const target = "onecool/liber_primus";
const filenames = new Set(["runes_by_page.txt", "unstructured_runes.txt"]);

/** @param {string} url @returns {Promise<Response>} */
async function request(url) {
  const response = await fetch(url, {
    headers: {"User-Agent":"liber-primus-public-source-gate/1.0"},
    signal: AbortSignal.timeout(20000),
  });
  console.log("HTTP", response.status, url);
  return response;
}

/**
 * @param {string | null} header
 * @returns {string | null}
 */
function nextLink(header) {
  const match = header?.match(/<([^>]+)>;\s*rel="next"/);
  return match ? match[1] : null;
}

async function main() {
  const control = await request(gitlab + "/projects/gitlab-org%2Fcli");
  if (!control.ok) {
    console.log(JSON.stringify({status:"control-inaccessible",http:control.status}));
    return;
  }
  const metaReq = await request(gitlab + "/projects/" + encodeURIComponent(target));
  if (!metaReq.ok) {
    console.log(JSON.stringify({status:"target-inaccessible-or-absent",
      project:target,http:metaReq.status}));
    return;
  }
  const project = await metaReq.json();
  assert.equal(typeof project.id,"number");
  const info = {status:"public-project-found",project:target,
    id:project.id,created_at:project.created_at,
    last_activity_at:project.last_activity_at,default_branch:project.default_branch,
    web_url:project.web_url};
  console.log(JSON.stringify(info));
  let url = gitlab+"/projects/"+project.id+"/repository/tree?"+
    "recursive=true&pagination=keyset&per_page=100";
  const matches = [];
  let n=0;
  while(url && n++<60) {
    const response = await request(url);
    assert.equal(response.ok,true,"GitLab public tree request failed");
    const entries = await response.json();
    assert.equal(Array.isArray(entries),true);
    for(const entry of entries) {
      if(entry.type==="blob"&&filenames.has(entry.name)) {
        matches.push({name:entry.name,path:entry.path,blob_id:entry.id});
      }
    }
    url = nextLink(response.headers.get("link"));
  }
  assert.equal(url,null,"Repository tree exceeds exact-file bounded traversal");
  console.log(JSON.stringify({status:"tree-complete",pages:n,matches}));
  // Search original participant's bounded public commit history as well:
  // the target names might have been deleted after repository creation.
  const commitsReq=await request(gitlab+"/projects/"+project.id+
    "/repository/commits?per_page=100");
  assert.equal(commitsReq.ok,true,"Could not retrieve public commit history");
  const commits=await commitsReq.json();
  assert.equal(Array.isArray(commits),true);
  const historicalMatches=[];
  for(const commit of commits) {
    const diffReq=await request(gitlab+"/projects/"+project.id+
      "/repository/commits/"+commit.id+"/diff?per_page=100");
    assert.equal(diffReq.ok,true,"Could not retrieve public commit diff");
    const files=await diffReq.json();
    assert.equal(Array.isArray(files),true);
    for(const changed of files) {
      const candidates=[changed.old_path,changed.new_path];
      if(candidates.some((name)=>filenames.has(name?.split("/").at(-1)))) {
        historicalMatches.push({commit:commit.id,date:commit.committed_date,
          old_path:changed.old_path,new_path:changed.new_path,
          deleted:changed.deleted_file,created:changed.new_file});
      }
    }
  }
  console.log(JSON.stringify({status:"bounded-public-history",
    inspectedCommits:commits.length,
    incompletePagination:commits.length===100,
    oldestChecked:commits.at(-1)?.committed_date,
    newestChecked:commits.at(0)?.committed_date,
    historicalMatches}));

  for(const match of matches) {
    const fileURL=gitlab+"/projects/"+project.id+"/repository/files/"+
      encodeURIComponent(match.path)+"/raw?ref="+
      encodeURIComponent(project.default_branch);
    const result=await request(fileURL);
    assert.equal(result.ok,true);
    const bytes=Buffer.from(await result.arrayBuffer());
    const digest=createHash("sha256").update(bytes).digest("hex");
    console.log(JSON.stringify({status:"public-file-recovered",source:match.path,
      bytes:bytes.length,sha256:digest,blob_id:match.blob_id,
      utf8_prefix:bytes.toString("utf8",0,Math.min(bytes.length,300))}));
  }
}
main().catch((error)=>{console.error(error);process.exitCode=1;});
