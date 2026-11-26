# Cicada Notebook 24 November manifest: bounded Wayback availability check

**Decision:** no exact 2026-11-24 historical manifest bytes were recovered. Close #2895 with this specific blocker; do not substitute the mutable 2026-11-26 manifest or continue generic archive searching.

## Query

Target:
- https://cicadanotebook.com/publication-provenance.json

Requested capture date:
- 2026-11-24 (timestamp 20261124)

Two public Wayback endpoints were queried from a GitHub Actions Windows/Node 22 runner using sims/cicada_notebook_wayback_probe.cjs:
1. Availability API: https://archive.org/wayback/available?url=https%3A%2F%2Fcicadanotebook.com%2Fpublication-provenance.json&timestamp=20261124
2. CDX: https://web.archive.org/cdx/search/cdx?url=cicadanotebook.com%2Fpublication-provenance.json&output=json&filter=statuscode:200&from=20261124&to=20261125&fl=timestamp,original,statuscode,digest,length&collapse=digest

Both requests returned HTTP 200. The availability response was:
```json
{"url":"https://cicadanotebook.com/publication-provenance.json","archived_snapshots":{},"timestamp":"20261124"}
```

The CDX response was:
```json
[]
```

No capture was selected, no raw snapshot URL was fetched, and exact_manifest_recovered=false. The machine-readable output is attached to issue #2895 by workflow run 45892701092; the readback job is run 45892877868.

## Interpretation and boundary

The existing 2026-11-26 manifest is a mutable current sync (native v144, commit 1437fd7a7b7a6082e7b65706e773fa7319126e1a, session 433). Its artifact paths, byte sizes and SHA-256 values do not provide the missing session-to-primary-source index. It is not the requested 24 November snapshot and did not yield a new primary key operand.

This test rules out only a Wayback capture of this exact manifest URL on the requested date. It does not prove that no private, local, or differently named copy exists. The task's resume condition remains an exact historical manifest or a specifically listed missing artifact with independently retrievable bytes. No replacement source search is justified by this result.

## Reproduction

- Probe: sims/cicada_notebook_wayback_probe.cjs
- Runner: .github/workflows/manual-readonly-commonjs-sft.yml
- Artifact readback: .github/workflows/manual-readonly-cpp17-sft.yml (custom readback artifact name)
- Probe run: https://github.com/FlareZ123/liber-primus/actions/runs/45892701092
- Readback run: https://github.com/FlareZ123/liber-primus/actions/runs/45892877868
