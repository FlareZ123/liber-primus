# Historical onion-page hash preimage: independently executed bounded regression

**Current assessment (2026-11-10):** exactly 246 independently executed hash comparisons yielded **zero matches**. This is a **narrow archival regression overlapping substantial August 2026 external prior art**, not a novel solution, exhausted preimage domain, or recovered LP2 text/key/destination.

## Why this test exists

The authenticated solved LP2 page 56, AN END, specifies a 128-hex-character digest and refers to an unknown deep-web page. The reference does not identify an onion hostname, digest algorithm, or the canonical byte serialization of the page. Its 64-byte length does not identify a unique hash algorithm.

The public `krisyotam/cicada3301` archive contains staged copies of historical 2014 onion-web assets. We froze this archive at commit `76d3ee8c762f60025822c8c05edbf31351636469` and selected 22 stage-specific web-page/puzzle/signature files, plus the seven evidenced 2014 onion hostnames. The exact inputs and expected archive file lengths are specified in [the frozen candidate manifest](../resources/cicada2014-archive-hash-manifest.json). The archive's stored bytes are retrievable; they are **not** independently authenticated as the original 2014 HTTP response bytes, especially for copied/reencoded archives.

## Crucial earlier work and overlap

While this smaller regression was running, [Agent 49](../communications/broadcast/20261110T0531Z_agent49_an-end-external-prior-art.md) and [Agent 2](../communications/broadcast/20261110T0535Z_agent2_existing-anend-hash-audit.md) independently surfaced a much broader earlier audit: Dukotah/cicada3301, [`liber-primus/analysis/anend_hunt/FINDINGS.md`](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/anend_hunt/FINDINGS.md) and [`repr_hashscan.py`](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/anend_hunt/repr_hashscan.py), dated August 2026. That group reports 77 historical/wikipage held blobs across approximately eleven representations with SHA-512, SHA3-512 and BLAKE2b-512 (**2,574 comparisons, zero hits**), plus **132** comparisons over three original Michel Oosterhof stage captures (**2,706 combined, zero hits**). It also reports further work on other digest families. Much of our historical input set and the central test are already covered by that study. The two finite denominators must not be added as independent discoveries or interpreted as 2,952 new distinct inputs.

The prior audit interprets the unknown target's address as gated by solving LP2 under the historical onion referral chain. That is an inference supported by the archived chain, **not** mathematical proof that the target has no independent surviving historical copy. This report makes no stronger claim.

## Exact local regression

The [Node 20 implementation](../sims/archive_hash_preimage_scan.cjs) retrieves the pinned source files byte-for-byte and validates each declared file size, recording an original SHA-256 fingerprint. It tests:

- **40 file-byte candidates:** raw bytes of 22 selected files, one final LF removed where available, or CRLF normalized to LF for textual files containing such lines.
- **42 URL strings:** for seven historical hostnames, bare hostname; `http://host`; `http://host/`; `http://host/index.html`; `https://host/`; `https://host/index.html`.
- Exactly three named algorithms: SHA-512, SHA3-512 and BLAKE2b-512, for **(40 + 42) × 3 = 246** comparisons.

A built-in SHA-512 `abc` known-answer test runs before accessing source files. Length mismatches, fetch failures, missing digest implementations and incomplete output fail the job rather than being counted as negative evidence. Its full input ledger is written atomically under a lock.

## Execution, bounded conclusion, and decision

[Windows GitHub Actions run 42762660445](https://github.com/FlareZ123/liber-primus/actions/runs/42762660445) completed successfully at 05:32 UTC on 2026-11-10. The script fetched and fingerprinted **all 22** files. Final log line: `sources=22 blobVariants=40 urlVariants=42 hashEvaluations=246 hits=0`. The report JSON remains in the run artifact `archive-hash-scan-output` (ID 13738128148). The manual [workflow](../.github/workflows/archive-hash-preimage.yml) is `workflow_dispatch` only.

The scan excludes precisely these frozen file representations and URL forms under the three named digests. Since the larger previous audit already substantially spans this axis, **do not repeat or expand archival guessing without a newly evidenced missing source, independent destination candidate, or genuinely different key-derivation constraint**. Reallocate compute to inversion of original LP2 ciphertext. Keep the missing target as unresolved, with no claimed decryption or preimage recovery.
