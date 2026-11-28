const { mkdir, writeFile } = require("node:fs/promises");

const ENDPOINT = "https://metrics.torproject.org/exonerator.html";
const TARGETS = [
  { label: "primary-2014-jan-mid", ip: "31.184.172.36", date: "2014-01-15" },
  { label: "primary-2014-feb-edge", ip: "31.184.172.36", date: "2014-02-01" },
  { label: "primary-2014-aug-route", ip: "31.184.172.36", date: "2014-08-24" },
  { label: "orientation-2014-jan-mid", ip: "31.172.184.36", date: "2014-01-15" },
  { label: "orientation-2014-aug-route", ip: "31.172.184.36", date: "2014-08-24" },
  { label: "positive-control-known-relay", ip: "185.36.75.108", date: "2018-12-10" },
];

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}
async function query(target) {
  const params = new URLSearchParams({ ip: target.ip, lang: "en", timestamp: target.date });
  const url = `${ENDPOINT}?${params.toString()}`;
  const response = await fetch(url, {
    headers: { accept: "text/html", "user-agent": "liber-primus-research/1.0" },
    signal: AbortSignal.timeout(45000),
  });
  const html = await response.text();
  const visible = stripHtml(html);
  const result = visible.includes("Result is positive") ? "positive"
    : visible.includes("Result is negative") ? "negative"
    : visible.includes("Date parameter out of range") ? "date-out-of-range"
    : "unparsed";
  return {
    label: target.label, ip: target.ip, date: target.date, url,
    http_status: response.status, result,
    positive: result === "positive",
    visible_excerpt: visible.slice(0, 6000),
    raw_html: html,
  };
}
async function main() {
  const results = [];
  for (const target of TARGETS) {
    try { results.push(await query(target)); }
    catch (error) { results.push({ ...target, result: "error", error: String(error) }); }
  }
  const output = {
    generated_at: new Date().toISOString(),
    source: "Tor Project ExoneraTor",
    source_description: "Historical database query for whether an IP was used as a Tor relay on or within one day of the requested date.",
    targets: results,
  };
  await mkdir("im-results", { recursive: true });
  await writeFile("im-results/cicada2014-ip-exonerator-gate.json", JSON.stringify(output, null, 2) + "\n");
  console.log(JSON.stringify(results.map(({ label, ip, date, http_status, result, error, visible_excerpt }) => ({
    label, ip, date, http_status, result, error,
    excerpt: visible_excerpt?.slice(0, 1000),
  })), null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
