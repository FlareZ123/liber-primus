"use strict";

const assert = require("node:assert/strict");
const {execFileSync} = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const pathMod = require("node:path");

const PROJECT_ID = 7976598;
const TARGET = "onecool/liber_primus";
const GITLAB = "https://gitlab.com/api/v4";
const REPO_URL = "https://gitlab.com/onecool/liber_primus.git";

/** @param {string} url @param {number} [timeoutMs] */
async function request(url, timeoutMs = 15000) {
  try {
    const response = await fetch(url, {
      headers: {"User-Agent": "liber-primus-provenance-sft/1.0"},
      signal: AbortSignal.timeout(timeoutMs),
    });
    const text = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      url,
      text,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error) {
    return {ok:false,status:0,url,text:"",error:String(error)};
  }
}

/** @param {string} url */
async function json(url) {
  const r = await request(url);
  let data = null;
  try { data = r.text ? JSON.parse(r.text) : null; } catch {}
  return {...r, data};
}

/** @param {string} url */
async function paginated(url) {
  const rows = [];
  let page = 1;
  for (;;) {
    const sep = url.includes("?") ? "&" : "?";
    const r = await json(url + sep + "per_page=100&page=" + page);
    assert.equal(r.ok, true, "GitLab pagination failed: " + r.url + " HTTP " + r.status);
    assert.ok(Array.isArray(r.data), "Expected array: " + r.url);
    rows.push(...r.data);
    const next = r.headers["x-next-page"];
    if (!next) break;
    page = Number(next);
    assert.ok(Number.isInteger(page) && page > 0);
  }
  return rows;
}

/** @param {string} text */
function jsonLines(text) {
  return text.split(/\r?\n/).filter(Boolean).flatMap(line => {
    try { return [JSON.parse(line)]; } catch { return []; }
  });
}

async function main() {
  const out = {
    generated_at: new Date().toISOString(),
    target: TARGET,
    project_id: PROJECT_ID,
    gitlab: {},
    git_transport: {},
    software_heritage: {},
    internet_archive: {},
    common_crawl: {},
  };

  const meta = await json(GITLAB + "/projects/" + PROJECT_ID);
  assert.equal(meta.ok, true, "Target GitLab project unavailable");
  out.gitlab.project = {
    id: meta.data.id,
    path_with_namespace: meta.data.path_with_namespace,
    created_at: meta.data.created_at,
    last_activity_at: meta.data.last_activity_at,
    default_branch: meta.data.default_branch,
    import_status: meta.data.import_status,
    import_url: meta.data.import_url,
    forked_from_project: meta.data.forked_from_project,
    mirror: meta.data.mirror,
    archived: meta.data.archived,
    http_url_to_repo: meta.data.http_url_to_repo,
    ssh_url_to_repo: meta.data.ssh_url_to_repo,
    web_url: meta.data.web_url,
  };

  const users = await json(GITLAB + "/users?username=onecool");
  out.gitlab.user_lookup = users.ok ? users.data : {http: users.status, error: users.error};
  const user = Array.isArray(users.data) ? users.data.find(x => x.username === "onecool") : null;
  if (user) {
    const projects = await paginated(GITLAB + "/users/" + user.id + "/projects?simple=true");
    out.gitlab.user_projects = projects.map(p => ({
      id:p.id, path_with_namespace:p.path_with_namespace, created_at:p.created_at,
      last_activity_at:p.last_activity_at, default_branch:p.default_branch,
      forked_from_project:p.forked_from_project, web_url:p.web_url
    }));
  }

  const [branches,tags,commits,forks,releases,packages,snippets] = await Promise.all([
    paginated(GITLAB + "/projects/" + PROJECT_ID + "/repository/branches"),
    paginated(GITLAB + "/projects/" + PROJECT_ID + "/repository/tags"),
    paginated(GITLAB + "/projects/" + PROJECT_ID + "/repository/commits?all=true"),
    paginated(GITLAB + "/projects/" + PROJECT_ID + "/forks"),
    paginated(GITLAB + "/projects/" + PROJECT_ID + "/releases"),
    paginated(GITLAB + "/projects/" + PROJECT_ID + "/packages"),
    paginated(GITLAB + "/projects/" + PROJECT_ID + "/snippets"),
  ]);
  out.gitlab.branches = branches.map(b => ({name:b.name,merged:b.merged,protected:b.protected,commit:b.commit?.id}));
  out.gitlab.tags = tags.map(t => ({name:t.name,target:t.target,commit:t.commit?.id,release:t.release?.tag_name}));
  out.gitlab.commits = commits.map(c => ({
    id:c.id,parent_ids:c.parent_ids,created_at:c.created_at,authored_date:c.authored_date,
    committed_date:c.committed_date,title:c.title,author_name:c.author_name,author_email:c.author_email,
    committer_name:c.committer_name,committer_email:c.committer_email,web_url:c.web_url
  }));
  out.gitlab.forks = forks.map(f => ({id:f.id,path_with_namespace:f.path_with_namespace,created_at:f.created_at,web_url:f.web_url}));
  out.gitlab.releases = releases.map(r => ({tag_name:r.tag_name,name:r.name,released_at:r.released_at,assets:r.assets}));
  out.gitlab.packages = packages.map(p => ({id:p.id,name:p.name,version:p.version,created_at:p.created_at,package_type:p.package_type}));
  out.gitlab.snippets = snippets.map(s => ({id:s.id,title:s.title,created_at:s.created_at,updated_at:s.updated_at,web_url:s.web_url}));

  const search = await paginated(GITLAB + "/projects?search=liber_primus&simple=true&order_by=created_at&sort=asc");
  out.gitlab.similar_projects = search.slice(0,300).map(p => ({
    id:p.id,path_with_namespace:p.path_with_namespace,created_at:p.created_at,
    last_activity_at:p.last_activity_at,web_url:p.web_url
  }));

  const tmp = fs.mkdtempSync(pathMod.join(os.tmpdir(), "onecool-lp-"));
  const mirror = pathMod.join(tmp, "mirror.git");
  try {
    out.git_transport.ls_remote = execFileSync("git", ["ls-remote", REPO_URL], {encoding:"utf8", timeout:60000}).trim().split(/\r?\n/).filter(Boolean);
    execFileSync("git", ["clone","--mirror",REPO_URL,mirror], {encoding:"utf8", stdio:["ignore","pipe","pipe"], timeout:120000});
    out.git_transport.show_ref = execFileSync("git", ["-C",mirror,"show-ref"], {encoding:"utf8", timeout:30000}).trim().split(/\r?\n/).filter(Boolean);
    out.git_transport.all_objects = execFileSync("git", ["-C",mirror,"rev-list","--objects","--all"], {encoding:"utf8", timeout:30000}).trim().split(/\r?\n/).filter(Boolean);
    out.git_transport.graph = execFileSync("git", ["-C",mirror,"rev-list","--all","--parents","--timestamp"], {encoding:"utf8", timeout:30000}).trim().split(/\r?\n/).filter(Boolean);
    const fsck = execFileSync("git", ["-C",mirror,"fsck","--full","--unreachable","--no-reflogs"], {encoding:"utf8", stderr:"pipe", timeout:30000});
    out.git_transport.fsck_unreachable = fsck.trim().split(/\r?\n/).filter(Boolean);
  } catch (error) {
    out.git_transport.error = String(error);
    out.git_transport.stderr = error?.stderr?.toString?.() || null;
  }

  const swhQueries = [
    "https://archive.softwareheritage.org/api/1/origin/search/" + encodeURIComponent("gitlab.com/onecool/liber_primus") + "/?limit=100",
    "https://archive.softwareheritage.org/api/1/origin/search/" + encodeURIComponent("onecool/liber_primus") + "/?limit=100",
    "https://archive.softwareheritage.org/api/1/origin/search/" + encodeURIComponent(REPO_URL) + "/?limit=100",
  ];
  out.software_heritage.queries = [];
  for (const url of swhQueries) {
    const r = await request(url, 20000);
    out.software_heritage.queries.push({url,status:r.status,ok:r.ok,body:r.text.slice(0,200000)});
  }

  const iaUrl = "https://web.archive.org/cdx/search/cdx?url=" +
    encodeURIComponent("gitlab.com/onecool/liber_primus*") +
    "&output=json&fl=timestamp,original,statuscode,mimetype,digest&filter=statuscode:200&collapse=digest&limit=5000";
  const ia = await request(iaUrl, 30000);
  out.internet_archive = {url:iaUrl,status:ia.status,ok:ia.ok,body:ia.text.slice(0,1000000)};

  const collinfo = await json("https://index.commoncrawl.org/collinfo.json");
  if (collinfo.ok && Array.isArray(collinfo.data)) {
    const ids = collinfo.data.map(x => x.id).filter(id => /^CC-MAIN-(2014|2015|2016|2017|2018)-/.test(id));
    out.common_crawl.indexes_tested = ids;
    out.common_crawl.hits = [];
    const target = encodeURIComponent("gitlab.com/onecool/liber_primus*");
    for (const id of ids) {
      const url = "https://index.commoncrawl.org/" + id + "-index?url=" + target + "&output=json";
      const r = await request(url, 12000);
      if (r.ok && r.text.trim()) {
        out.common_crawl.hits.push({id,url,rows:jsonLines(r.text)});
      } else if (![200,404].includes(r.status)) {
        out.common_crawl.hits.push({id,url,http:r.status,error:r.error || null,body:r.text.slice(0,1000)});
      }
    }
  } else {
    out.common_crawl.error = {http:collinfo.status,error:collinfo.error || null};
  }

  fs.writeFileSync(pathMod.join(process.env.RUNNER_TEMP || os.tmpdir(), "source-test-output.json"), JSON.stringify(out,null,2));

  const summary = {
    project: out.gitlab.project,
    user_projects: out.gitlab.user_projects,
    branches: out.gitlab.branches,
    tags: out.gitlab.tags,
    commits: out.gitlab.commits,
    forks: out.gitlab.forks,
    releases: out.gitlab.releases,
    packages: out.gitlab.packages,
    snippets: out.gitlab.snippets,
    similar_projects: out.gitlab.similar_projects,
    git_transport: {
      ls_remote: out.git_transport.ls_remote,
      show_ref: out.git_transport.show_ref,
      graph: out.git_transport.graph,
      fsck_unreachable: out.git_transport.fsck_unreachable,
      object_count: out.git_transport.all_objects?.length ?? null,
      error: out.git_transport.error || null,
    },
    software_heritage: out.software_heritage.queries.map(q => ({url:q.url,status:q.status,ok:q.ok,body:q.body.slice(0,4000)})),
    internet_archive: {status:out.internet_archive.status,ok:out.internet_archive.ok,body:out.internet_archive.body.slice(0,20000)},
    common_crawl: {indexes_tested:out.common_crawl.indexes_tested?.length || 0,hits:out.common_crawl.hits},
  };
  console.log(JSON.stringify(summary,null,2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
