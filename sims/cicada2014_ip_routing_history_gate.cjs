import { mkdir, writeFile } from "node:fs/promises";
const PERIOD = { starttime: "2014-01-01T00:00:00", endtime: "2015-01-01T00:00:00" };
const TARGETS = [
  { label: "primary-candidate", resource: "31.184.172.36" },
  { label: "orientation-control", resource: "31.172.184.36" },
  { label: "prefix-control", resource: "31.184.172.0/24" },
  { label: "positive-control-google-dns", resource: "8.8.8.8" },
];
const ENDPOINT = "https://stat.ripe.net/data/routing-history/data.json";
async function query(target) {
  const params = new URLSearchParams({
    resource: target.resource, starttime: PERIOD.starttime, endtime: PERIOD.endtime,
    min_peers: "1", include_first_hop: "true", normalise_visibility: "true",
    sourceapp: "liber-primus-research",
  });
  const url = `${ENDPOINT}?${params.toString()}`;
  const response = await fetch(url, {
    headers: { accept: "application/json", "user-agent": "liber-primus-research/1.0" },
    signal: AbortSignal.timeout(45000),
  });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); }
  catch { body = { parse_error: true, raw_prefix: text.slice(0, 2000) }; }
  const origins = (body?.data?.by_origin ?? []).map(entry => ({
    origin: entry.origin,
    prefixes: (entry.prefixes ?? []).map(prefix => ({
      prefix: prefix.prefix,
      timelines: (prefix.timelines ?? []).map(timeline => ({
        starttime: timeline.starttime, endtime: timeline.endtime,
        full_peers_seeing: timeline.full_peers_seeing, visibility: timeline.visibility,
      })),
    })),
  }));
  return {
    label: target.label, resource: target.resource, url, http_status: response.status,
    status: body?.status, status_code: body?.status_code, data_call_status: body?.data_call_status,
    version: body?.version, cached: body?.cached, query_starttime: body?.data?.query_starttime,
    query_endtime: body?.data?.query_endtime, origins, raw: body,
  };
}
const results = [];
for (const target of TARGETS) {
  try { results.push(await query(target)); }
  catch (error) { results.push({ label: target.label, resource: target.resource, error: String(error) }); }
}
const output = {
  generated_at: new Date().toISOString(), endpoint: ENDPOINT, period: PERIOD,
  method: "RIPEstat routing-history; min_peers=1; include_first_hop=true; normalise_visibility=true",
  targets: results,
};
await mkdir("im-results", { recursive: true });
await writeFile("im-results/cicada2014-ip-routing-history-gate.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(results.map(item => ({
  label: item.label, resource: item.resource, http_status: item.http_status,
  status: item.status, status_code: item.status_code, query_starttime: item.query_starttime,
  query_endtime: item.query_endtime,
  routes: (item.origins ?? []).flatMap(origin => origin.prefixes.map(prefix => ({
    origin: origin.origin, prefix: prefix.prefix, timelines: prefix.timelines,
  }))), error: item.error,
})), null, 2));
