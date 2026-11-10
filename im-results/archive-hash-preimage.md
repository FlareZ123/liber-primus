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

## Direct original-grid-to-AN-END digest challenge

The source itself offers a finite missing-input candidate absent from
the historical website archives: the **256-byte base-60 number table**
on LP2 physical pages 49–51 appears shortly before the authenticated
**128-hex-digit/64-byte deep-web hash target** on solved p56. A direct,
independently testable equation would be that the hash refers to the
literal table bytes, a particular printed table layout, or a natural
32-/64-byte block extracted from that printed source.

The [original-source digest bridge](../sims/grid_anend_hash_bridge.cjs)
takes the corrected **32×8 source tokens**, reconstructs all 256
byte values and asserts the exact base-60 roundtrip. It evaluates
**85** concrete raw-grid, reversed, column-major, page-column-major,
byte-complement, 64-byte chunk, 32-byte chunk, column-pair and
printed-base60 textual presentations against the full exact
original p56 target
`36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`.
Each candidate is hashed with SHA-512, SHA3-512, BLAKE2b-512 and
SHAKE256 producing 64 bytes, **340 exact digest comparisons total**.
A published SHA-512('abc') digest validates the digest implementation.

**Executed result: zero byte-exact matches** in [successful manual
CI 42792207600](https://github.com/FlareZ123/liber-primus/actions/runs/42792207600).
This is a precise negative on the printed grid as a *literal* direct
preimage, without speculatively guessing onion links or resetting the
historical archive search. A keyed or salted hash, image data, more
elaborate source transformation, missing external file or plaintext
unknown to this project remains unconstrained. No destination, key
or unknown LP2 plaintext was recovered. The test reuses the existing
[grid manual runner](../.github/workflows/grid-256-tests.yml).

## Execution, bounded conclusion, and decision

[Windows GitHub Actions run 42762660445](https://github.com/FlareZ123/liber-primus/actions/runs/42762660445) completed successfully at 05:32 UTC on 2026-11-10. The script fetched and fingerprinted **all 22** files. Final log line: `sources=22 blobVariants=40 urlVariants=42 hashEvaluations=246 hits=0`. The report JSON remains in the run artifact `archive-hash-scan-output` (ID 13738128148). The manual [workflow](../.github/workflows/archive-hash-preimage.yml) is `workflow_dispatch` only.

The scan excludes precisely these frozen file representations and URL forms under the three named digests. Since the larger previous audit already substantially spans this axis, **do not repeat or expand archival guessing without a newly evidenced missing source, independent destination candidate, or genuinely different key-derivation constraint**. Reallocate compute to inversion of original LP2 ciphertext. Keep the missing target as unresolved, with no claimed decryption or preimage recovery.
