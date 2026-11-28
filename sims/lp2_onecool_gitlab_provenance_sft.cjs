"use strict";
const assert = require("node:assert/strict");

const API = "https://gitlab.com/api/v4";
const TARGET = "onecool/liber_primus";

/** @param {string} url @returns {Promise<{response:Response, body:any}>} */
async function get(url) {
  const response = await fetch(url, {
    headers: {"User-Agent":"liber-primus-onecool-provenance/1.0"},
    signal: AbortSignal.timeout(30000),
  });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  console.log("HTTP", response.status, url);
  assert.equal(response.ok, true, JSON.stringify(body).slice(0, 500));
  return {response, body};
}

/** @param {string} base @returns {Promise<any[]>} */
async function allPages(base) {
  const out = [];
  for (let page = 1; page <= 50; page++) {
    const sep = base.includes("?") ? "&" : "?";
    const {response, body} = await get(base + sep + "per_page=100&page=" + page);
    assert.equal(Array.isArray(body), true);
    out.push(...body);
    const next = response.headers.get("x-next-page");
    if (!next) break;
  }
  return out;
}

async function main() {
  const control = await get(API + "/projects/gitlab-org%2Fcli");
  assert.equal(typeof control.body.id, "number");

  const {body: project} = await get(API + "/projects/" + encodeURIComponent(TARGET) + "?statistics=true");
  assert.equal(project.path_with_namespace, TARGET);
  const id = project.id;

  const [branches, tags, releases, forks, commits, events] = await Promise.all([
    allPages(API + "/projects/" + id + "/repository/branches"),
    allPages(API + "/projects/" + id + "/repository/tags"),
    allPages(API + "/projects/" + id + "/releases"),
    allPages(API + "/projects/" + id + "/forks"),
    allPages(API + "/projects/" + id + "/repository/commits?all=true"),
    allPages(API + "/projects/" + id + "/events?action=pushed"),
  ]);

  assert.equal(commits.length, 7);
  const ordered = [...commits].sort((a,b) => new Date(a.committed_date) - new Date(b.committed_date));
  const oldestSummary = ordered[0];
  const {body: oldest} = await get(API + "/projects/" + id + "/repository/commits/" + oldestSummary.id);
  assert.deepEqual(oldest.parent_ids, [], "Oldest reachable commit is not a root");

  const commitDetails = [];
  for (const c of ordered) {
    const {body: d} = await get(API + "/projects/" + id + "/repository/commits/" + c.id);
    commitDetails.push({
      id:d.id,
      authored_date:d.authored_date,
      committed_date:d.committed_date,
      author_name:d.author_name,
      author_email:d.author_email,
      committer_name:d.committer_name,
      committer_email:d.committer_email,
      parent_ids:d.parent_ids,
      title:d.title,
    });
  }

  const refs = {
    branches: branches.map(b => ({name:b.name,sha:b.commit?.id,merged:b.merged,protected:b.protected,default:b.default})),
    tags: tags.map(t => ({name:t.name,sha:t.commit?.id,created_at:t.created_at})),
    releases: releases.map(r => ({name:r.name,tag_name:r.tag_name,released_at:r.released_at,assets:r.assets})),
    forks: forks.map(f => ({id:f.id,path_with_namespace:f.path_with_namespace,created_at:f.created_at,last_activity_at:f.last_activity_at})),
  };

  const provenance = {
    project: {
      id:project.id,
      created_at:project.created_at,
      last_activity_at:project.last_activity_at,
      default_branch:project.default_branch,
      forked_from_project:project.forked_from_project ?? null,
      import_status:project.import_status ?? null,
      import_url:project.import_url ?? null,
      empty_repo:project.empty_repo,
      repository_size:project.statistics?.repository_size ?? null,
      storage_size:project.statistics?.storage_size ?? null,
      web_url:project.web_url,
    },
    refs,
    pushedEvents: events.map(e => ({
      id:e.id,created_at:e.created_at,author_username:e.author?.username,
      action_name:e.action_name,push_data:e.push_data,
    })),
    commits:commitDetails,
    oldestReachableIsRoot: oldest.parent_ids.length === 0,
    earliestAuthoredDate: commitDetails.map(c=>c.authored_date).sort()[0],
    earliestCommittedDate: commitDetails.map(c=>c.committed_date).sort()[0],
  };

  console.log("PROVENANCE_JSON");
  console.log(JSON.stringify(provenance, null, 2));

  assert.equal(branches.length, 1);
  assert.equal(branches[0].name, "master");
  assert.equal(tags.length, 0);
  assert.equal(releases.length, 0);
  assert.equal(forks.length, 0);
  assert.ok(provenance.earliestAuthoredDate.startsWith("2018-08-20"));
  assert.ok(provenance.earliestCommittedDate.startsWith("2018-08-20"));

  console.log(JSON.stringify({
    decision: "Visible GitLab provenance is a seven-commit 2018 root history with one master branch and no tags/releases/forks. No reachable ref or parent supplies pre-2018 Git custody.",
  }));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
