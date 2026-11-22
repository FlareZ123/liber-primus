"use strict";

/**
 * Exact-ID archival recovery of the 2015 thomasandfriends LP2 solver Gist.
 * No guessing of filenames, decipherment keys, or unlisted Gist identities.
 * Native Node 22 CommonJS, runnable on Windows 11 or GitHub Actions.
 */
const https = require("node:https");
const crypto = require("node:crypto");
const fs = require("node:fs");
const cp = require("node:child_process");

const GIST_ID = "07b0d26589b807c1daa3";
const OWNER = "thomasandfriends";
const CONTROL_ID = "8a564d1e8027294df15d";
const sha256 = (body) => crypto.createHash("sha256").update(body).digest("hex");

/** @param {string} url @param {number} left @returns {Promise<{url:string,status:number,body:Buffer,location:string}>} */
function fetch(url, left = 2) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {"User-Agent": "LP2-Original-Source-Research/2026-11-15",
                "Accept": "application/vnd.github+json, application/json, text/html;q=0.8"},
      timeout: 12000
    }, (res) => {
      const chunks = [];
      let size = 0;
      res.on("data", (part) => {
        size += part.length;
        if (size <= 1000000) chunks.push(part);
        else req.destroy(new Error("Source response exceeded bounded 1 MB"));
      });
      res.on("end", async () => {
        const location = String(res.headers.location || "");
        if ([301,302,303,307,308].includes(res.statusCode) && location && left) {
          try { resolve(await fetch(new URL(location, url).href, left-1)); }
          catch (e) { reject(e); }
          return;
        }
        resolve({url, status: res.statusCode || 0, body: Buffer.concat(chunks),location});
      });
    });
    req.on("timeout", () => req.destroy(new Error("12-second request timeout")));
    req.on("error", reject);
  });
}

/** @param {string} label @param {string} url @returns {Promise<void>} */
async function probe(label, url) {
  try {
    const response = await fetch(url);
    const result = {
      label, url, status: response.status, bytes: response.body.length,
      sha256: sha256(response.body),
      location: response.location || undefined
    };
    if (label === "source-gist-api" && response.status === 200) {
      const gist = JSON.parse(response.body.toString("utf8"));
      result.files = Object.entries(gist.files || {}).map(([filename, file])=>({
        filename,
        bytes: Buffer.byteLength(file.content || "", "utf8"),
        sha256: sha256(Buffer.from(file.content || "", "utf8")),
        truncated: file.truncated,
        raw_url: file.raw_url
      }));
      result.history = Array.isArray(gist.history) ?
        gist.history.map(item => ({version: item.version, committed_at: item.committed_at})) : [];
      const temp = "thomas-2015-gist-source.json.tmp";
      fs.writeFileSync(temp, response.body, {flag: "wx"});
      fs.renameSync(temp, "thomas-2015-gist-source.json");
    }
    if (label === "control-huw-api" && response.status === 200) {
      const gist = JSON.parse(response.body.toString("utf8"));
      result.filenameCount = Object.keys(gist.files || {}).length;
    }
    if (/archive/.test(label) && response.status === 200) {
      result.responseHead = response.body.toString("utf8").slice(0,450);
    }
    console.log(JSON.stringify(result));
  } catch (error) {
    console.log(JSON.stringify({label,url,error:String(error.message||error)}));
  }
}

function remote(label, url) {
  try {
    const out = cp.execFileSync("git", ["ls-remote", url], {timeout:15000, encoding:"utf8"});
    console.log(JSON.stringify({label, status:"ok", refs:out.trim().split(/\r?\n/).slice(0,5)}));
  } catch(error) {
    console.log(JSON.stringify({label,status:"error",code:error.status,
      stderr:String(error.stderr||error.message).slice(0,400)}));
  }
}

async function main() {
  const root = "https://gist.github.com/" + OWNER + "/" + GIST_ID;
  const urls = [
    ["control-huw-api", "https://api.github.com/gists/" + CONTROL_ID],
    ["source-gist-api", "https://api.github.com/gists/" + GIST_ID],
    ["source-gist-commits", "https://api.github.com/gists/" + GIST_ID + "/commits"],
    ["source-html", root],
    ["source-raw", "https://gist.githubusercontent.com/" + OWNER + "/" + GIST_ID + "/raw/"],
    ["source-oldraw", "https://raw.github.com/gist/" + GIST_ID],
    ["archive-wayback-cdx", "https://web.archive.org/cdx/search/cdx?url=gist.github.com%2F" + OWNER + "%2F" + GIST_ID + "&output=json&filter=statuscode%3A200&collapse=digest"],
    ["archive-arquivo-cdx", "https://arquivo.pt/wayback/cdx?url=gist.github.com%2F" + OWNER + "%2F" + GIST_ID + "&output=json"]
  ];
  await Promise.all(urls.map(([label,url]) => probe(label, url)));
  remote("control-huw-git", "https://gist.github.com/" + CONTROL_ID + ".git");
  remote("source-gist-git", "https://gist.github.com/" + GIST_ID + ".git");
}
main().catch(e => { console.error(e); process.exitCode=1; });
