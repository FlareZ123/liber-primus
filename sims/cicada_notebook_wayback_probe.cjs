const fs = require("fs");
const path = require("path");
const os = require("os");

const target = "https://cicadanotebook.com/publication-provenance.json";
const requestedDate = "20261124";
const headers = { "user-agent": "LiberPrimus-research/1.0 (public archive snapshot check)" };

async function get(url) {
  try {
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(20000), redirect: "follow" });
    const body = await response.text();
    return { url, status: response.status, ok: response.ok, final_url: response.url, body };
  } catch (error) {
    return { url, error: String(error) };
  }
}

(async () => {
  const availabilityUrl =
    "https://archive.org/wayback/available?url=" + encodeURIComponent(target) +
    "&timestamp=" + requestedDate;
  const cdxUrl =
    "https://web.archive.org/cdx/search/cdx?url=" +
    encodeURIComponent("cicadanotebook.com/publication-provenance.json") +
    "&output=json&filter=statuscode:200&from=20261124&to=20261125" +
    "&fl=timestamp,original,statuscode,digest,length&collapse=digest";

  const [availability, cdx] = await Promise.all([get(availabilityUrl), get(cdxUrl)]);
  let rows = [];
  if (cdx.ok && cdx.status === 200) {
    try {
      const parsed = JSON.parse(cdx.body);
      rows = Array.isArray(parsed) ? parsed.slice(1).map(row => ({
        timestamp: row[0], original: row[1], statuscode: row[2], digest: row[3], length: row[4]
      })) : [];
    } catch (_) {}
  }

  let availableSnapshot = null;
  if (availability.ok && availability.status === 200) {
    try {
      const parsed = JSON.parse(availability.body);
      availableSnapshot = parsed.archived_snapshots && parsed.archived_snapshots.closest
        ? parsed.archived_snapshots.closest : null;
    } catch (_) {}
  }

  const exactCapture = rows.find(row => row.timestamp && row.timestamp.startsWith(requestedDate)) || null;
  const selected = exactCapture || (
    availableSnapshot && String(availableSnapshot.timestamp || "").startsWith(requestedDate)
      ? { timestamp: availableSnapshot.timestamp, original: target, statuscode: availableSnapshot.status, digest: null, length: null }
      : null
  );

  let snapshot = null;
  if (selected && selected.timestamp) {
    const rawUrl = "https://web.archive.org/web/" + selected.timestamp + "id_/" + target;
    snapshot = await get(rawUrl);
    if (snapshot.ok && snapshot.status === 200) {
      try { snapshot.json = JSON.parse(snapshot.body); } catch (_) { snapshot.json = null; }
    }
  }

  const exact = Boolean(selected && selected.timestamp && String(selected.timestamp).startsWith(requestedDate) &&
    snapshot && snapshot.ok && snapshot.status === 200);
  const result = {
    target,
    requested_date: "2026-11-24",
    availability,
    cdx,
    captures_on_requested_date: rows,
    selected_capture: selected,
    snapshot,
    exact_manifest_recovered: exact,
    conclusion: exact
      ? "Exact 2026-11-24 archived manifest bytes recovered; inspect snapshot.json and source fields."
      : "No exact 2026-11-24 manifest bytes recovered by the availability/CDX probe."
  };

  const outDir = process.env.RUNNER_TEMP || os.tmpdir();
  const outPath = path.join(outDir, "source-test-output.json");
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");
  console.log(JSON.stringify({
    output: outPath,
    availability_status: availability.status || null,
    cdx_status: cdx.status || null,
    captures_on_requested_date: rows.length,
    selected_timestamp: selected && selected.timestamp || null,
    snapshot_status: snapshot && snapshot.status || null,
    exact_manifest_recovered: exact,
    conclusion: result.conclusion
  }, null, 2));
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
