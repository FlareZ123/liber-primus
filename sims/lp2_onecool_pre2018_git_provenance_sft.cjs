"use strict";

const {execFileSync} = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const pathMod = require("node:path");

const TARGET = "onecool/liber_primus";
const GITLAB = "https://gitlab.com/api/v4";
const REPO_URL = "https://gitlab.com/onecool/liber_primus.git";

/** @param {string} url @param {number} [timeoutMs] */
async function request(url, timeoutMs = 15000) {
  try {
    const response = await fetch(url, {
      headers: {"User-Agent": "liber-primus-pre2018-provenance/2.0"},
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

/** @param {string} url @param {number} [maxPages] */
async function paginatedOptional(url, maxPages = 20) {
  const rows = [];
  let page = 1;
  while (page <= maxPages) {
    const sep = url.includes("?") ? "&" : "?";
    const r = await json(url + sep + "per_page=100&page=" + page);
    if (!r.ok || !Array.isArray(r.data)) {
      return {ok:false,status:r.status,url:r.url,error:r.error || null,body:r.text.slice(0,2000),rows};
    }
    rows.push(...r.data);
    const next = r.headers["x-next-page"];
    if (!next) return {ok:true,status:r.status,rows};
    page = Number(next);
    if (!Number.isInteger(page) || page < 1) break;
  }
  return {ok:true,status:200,rows,truncated:true};
}

/** @param {string} text */
function lines(text) {
  return text.split(/\r?\n/).filter(Boolean);
}

/** @param {string} text */
function jsonLines(text) {
  return lines(text).flatMap(line => {
    try { return [JSON.parse(line)]; } catch { return []; }
  });
}

/** @param {string[]} items @param {number} width @param {(item:string)=>Promise<any>} fn */
async function batches(items, width, fn) {
  const out = [];
  for (let i = 0; i < items.length; i += width) {
    out.push(...await Promise.all(items.slice(i, i + width).map(fn)));
  }
  return out;
}

async function main() {
  const out = {
    generated_at: new Date().toISOString(),
    target: TARGET,
    prior_visible_history_fact: {
      source: "CI run 46122217207 / Agent16",
      statement: "GitLab visible history is a seven-commit 2018 root-created master branch with no tags/releases/forks and no import metadata.",
    },
    git_transport: {},
    gitlab_discovery: {},
    software_heritage: {},
    internet_archive: {},
    common_crawl: {},
  };

  // New Git transport surface: all advertised refs plus any extra objects actually
  // delivered in a mirror pack. This does not re-enumerate the visible tree.
  const tmp = fs.mkdtempSync(pathMod.join(os.tmpdir(), "onecool-lp-"));
  const mirror = pathMod.join(tmp, "mirror.git");
  try {
    out.git_transport.ls_remote = lines(execFileSync(
      "git", ["ls-remote", "--symref", REPO_URL],
      {encoding:"utf8", timeout:60000}
    ));
    execFileSync(
      "git", ["clone", "--mirror", REPO_URL, mirror],
      {encoding:"utf8", stdio:["ignore","pipe","pipe"], timeout:120000}
    );
    out.git_transport.refs = lines(execFileSync(
      "git", ["-C",mirror,"for-each-ref","--format=%(refname) %(objectname)"],
      {encoding:"utf8", timeout:30000}
    ));
    out.git_transport.graph = lines(execFileSync(
      "git", ["-C",mirror,"rev-list","--all","--parents","--timestamp"],
      {encoding:"utf8", timeout:30000}
    ));
    out.git_transport.objects = lines(execFileSync(
      "git", ["-C",mirror,"rev-list","--objects","--all"],
      {encoding:"utf8", timeout:30000}
    ));
    out.git_transport.fsck_unreachable = lines(execFileSync(
      "git", ["-C",mirror,"fsck","--full","--unreachable","--no-reflogs"],
      {encoding:"utf8", stderr:"pipe", timeout:30000}
    ));
  } catch (error) {
    out.git_transport.error = String(error);
    out.git_transport.stderr = error?.stderr?.toString?.() || null;
  }

  // New GitLab discovery surface: other projects under the historical username
  // and similarly named projects that might be an older clone/import.
  const users = await json(GITLAB + "/users?username=onecool");
  out.gitlab_discovery.user_lookup = users.ok ? users.data : {
    http:users.status,error:users.error || null,body:users.text.slice(0,2000)
  };
  const user = Array.isArray(users.data) ? users.data.find(x => x.username === "onecool") : null;
  if (user) {
    const projects = await paginatedOptional(GITLAB + "/users/" + user.id + "/projects?simple=true&order_by=created_at&sort=asc");
    out.gitlab_discovery.user_projects = {
      ok:projects.ok,status:projects.status,
      rows:projects.rows.map(p => ({
        id:p.id,path_with_namespace:p.path_with_namespace,created_at:p.created_at,
        last_activity_at:p.last_activity_at,default_branch:p.default_branch,
        forked_from_project:p.forked_from_project ?? null,web_url:p.web_url
      }))
    };
  }

  const similar = await paginatedOptional(
    GITLAB + "/projects?search=liber_primus&simple=true&order_by=created_at&sort=asc",
    5
  );
  out.gitlab_discovery.similar_projects = {
    ok:similar.ok,status:similar.status,
    rows:similar.rows.map(p => ({
      id:p.id,path_with_namespace:p.path_with_namespace,created_at:p.created_at,
      last_activity_at:p.last_activity_at,default_branch:p.default_branch,
      forked_from_project:p.forked_from_project ?? null,web_url:p.web_url
    }))
  };

  const earlyCandidates = similar.rows.filter(p => {
    const t = Date.parse(p.created_at || "");
    return Number.isFinite(t) && t < Date.parse("2019-01-01T00:00:00Z") && p.path_with_namespace !== TARGET;
  }).slice(0,30);

  out.gitlab_discovery.early_candidate_histories = [];
  for (const p of earlyCandidates) {
    const commits = await paginatedOptional(
      GITLAB + "/projects/" + p.id + "/repository/commits?all=true",
      3
    );
    out.gitlab_discovery.early_candidate_histories.push({
      id:p.id,path_with_namespace:p.path_with_namespace,created_at:p.created_at,
      ok:commits.ok,status:commits.status,
      commits:commits.rows.map(c => ({
        id:c.id,parent_ids:c.parent_ids,authored_date:c.authored_date,
        committed_date:c.committed_date,title:c.title
      }))
    });
  }

  // Software Heritage: search and exact-origin forms, all tolerant of absence.
  const swhUrls = [
    "https://archive.softwareheritage.org/api/1/origin/search/" + encodeURIComponent("gitlab.com/onecool/liber_primus") + "/?limit=100",
    "https://archive.softwareheritage.org/api/1/origin/search/" + encodeURIComponent("onecool/liber_primus") + "/?limit=100",
    "https://archive.softwareheritage.org/api/1/origin/search/" + encodeURIComponent(REPO_URL) + "/?limit=100",
    "https://archive.softwareheritage.org/api/1/origin/" + encodeURIComponent(REPO_URL) + "/get/",
    "https://archive.softwareheritage.org/api/1/origin/" + encodeURIComponent("https://gitlab.com/onecool/liber_primus") + "/get/",
  ];
  out.software_heritage.queries = [];
  for (const url of swhUrls) {
    const r = await request(url, 20000);
    out.software_heritage.queries.push({
      url,status:r.status,ok:r.ok,body:r.text.slice(0,200000)
    });
  }

  // Internet Archive CDX: capture any historical project/clone/archive URLs.
  const iaTargets = [
    "gitlab.com/onecool/liber_primus*",
    "https://gitlab.com/onecool/liber_primus*",
    "http://gitlab.com/onecool/liber_primus*",
  ];
  out.internet_archive.queries = [];
  for (const target of iaTargets) {
    const url = "https://web.archive.org/cdx/search/cdx?url=" +
      encodeURIComponent(target) +
      "&output=json&fl=timestamp,original,statuscode,mimetype,digest&filter=statuscode:200&collapse=digest&limit=5000";
    const r = await request(url, 30000);
    out.internet_archive.queries.push({
      target,url,status:r.status,ok:r.ok,body:r.text.slice(0,1000000)
    });
  }

  // Common Crawl: query every 2014-2018 index. Hits are evidence that a dated
  // pre-2018 URL existed even when its WARC payload needs a follow-up fetch.
  const collinfo = await json("https://index.commoncrawl.org/collinfo.json");
  if (collinfo.ok && Array.isArray(collinfo.data)) {
    const ids = collinfo.data
      .map(x => x.id)
      .filter(id => /^CC-MAIN-(2014|2015|2016|2017|2018)-/.test(id));
    out.common_crawl.indexes_tested = ids;
    const target = encodeURIComponent("gitlab.com/onecool/liber_primus*");
    const queryResults = await batches(ids, 6, async id => {
      const url = "https://index.commoncrawl.org/" + id + "-index?url=" + target + "&output=json";
      const r = await request(url, 10000);
      return {
        id,url,status:r.status,ok:r.ok,
        rows:r.ok ? jsonLines(r.text) : [],
        error:r.error || null,
        body:(!r.ok && r.status !== 404) ? r.text.slice(0,2000) : ""
      };
    });
    out.common_crawl.hits = queryResults.filter(r => r.rows.length > 0);
    out.common_crawl.errors = queryResults.filter(r => !r.ok && r.status !== 404);
  } else {
    out.common_crawl.error = {
      http:collinfo.status,error:collinfo.error || null,body:collinfo.text.slice(0,2000)
    };
  }

  const outputPath = pathMod.join(process.env.RUNNER_TEMP || os.tmpdir(), "source-test-output.json");
  fs.writeFileSync(outputPath, JSON.stringify(out,null,2));

  console.log(JSON.stringify({
    generated_at:out.generated_at,
    git_transport:{
      ls_remote:out.git_transport.ls_remote,
      refs:out.git_transport.refs,
      graph:out.git_transport.graph,
      fsck_unreachable:out.git_transport.fsck_unreachable,
      object_count:out.git_transport.objects?.length ?? null,
      error:out.git_transport.error || null,
    },
    gitlab_discovery:out.gitlab_discovery,
    software_heritage:out.software_heritage.queries.map(q => ({
      url:q.url,status:q.status,ok:q.ok,body:q.body.slice(0,5000)
    })),
    internet_archive:out.internet_archive.queries.map(q => ({
      target:q.target,status:q.status,ok:q.ok,body:q.body.slice(0,20000)
    })),
    common_crawl:{
      indexes_tested:out.common_crawl.indexes_tested?.length || 0,
      hits:out.common_crawl.hits,
      errors:out.common_crawl.errors?.slice(0,20) || [],
      error:out.common_crawl.error || null,
    }
  },null,2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
