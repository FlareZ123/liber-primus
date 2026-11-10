# Historical onion-page hash preimage: independently executed bounded regression

**Current assessment (2026-11-10):** exactly 246 independently executed hash comparisons yielded **zero matches**. This is a **narrow archival regression overlapping substantial August 2026 external prior art**, not a novel solution, exhausted preimage domain, or recovered LP2 text/key/destination.

## Why this test exists

The authenticated solved LP2 page 56, AN END, specifies a 128-hex-character digest and refers to an unknown deep-web page. The reference does not identify an onion hostname, digest algorithm, or the canonical byte serialization of the page. Its 64-byte length does not identify a unique hash algorithm.

**New byte-exact 2014 archival witness (not a hash preimage).** Michel Oosterhof's independently held `micheloosterhof/cicada-2014` Git history contains [`stage11/56.bin`](https://github.com/micheloosterhof/cicada-2014/blob/1e3e842b460848d8e9342ae47efe453e20443aee/stage11/56.bin) already at Git commit `1e3e842b460848d8e9342ae47efe453e20443aee` (commit metadata dated **2014-05-11 22:09:23 UTC**). The same immutable Git blob appears **earlier in the checked parent chain**, introduced by Michel Oosterhof's commit [`06f57643821f1cadf597471c2b9c813bd08d2e37`](https://github.com/micheloosterhof/cicada-2014/commit/06f57643821f1cadf597471c2b9c813bd08d2e37), message **“page 56”**, author metadata dated **2014-05-11 21:56:12 UTC**, at `stage11/ky2khlqdf7qdznac.onion/56.bin`. The immediately preceding first-parent Git tree (`a9201dd469a1a514eb0d8ff8f3449dbe2e7f7462`) lacks that blob. The subsequent `stage11/56.bin` is **the same object moved**, not another independently authored payload. Its **64 raw bytes are exactly `bytes.fromhex(targetHex)`**; the Git content-object SHA-1 is `cfd4a08cd8ffa31c8e40c5c7a544d2774ca764a4`, and the independent file SHA-256 is `0911bf3c8cc3a73bbb346f82ba65daff3eb81914c4826060ac168bd0f55e267e`. This is source-level corroboration of **all 128 target hex digits**, not the unknown web page, key or the algorithm that produced that target. The repository commit is not an authenticated Cicada signature or an independently retained HTTP transaction. The archival binary is **the target digest itself**, so hashing it as a would-be page preimage would be a category mistake. Reproduce without a network request by `b=bytes.fromhex(targetHex)`, `sha1(b'blob 64\0'+b)` and `sha256(b)`; the pinned source provenance and values are retained in [the binary witness reference](../resources/cicada2014-anend-binary-witness.json). This strengthens target integrity but does **not** reduce uncertainty about the algorithm, byte serialization, URL or the missing target page. Independently, a visual line-by-line reading of the supplied original **LP2 physical p56 JPEG** (`73.jpg` in the 75-JPEG combined corpus) gives five lowercase-hex lines of lengths **26, 25, 25, 27, 25**. Their exact concatenation is the same 128-character target and agrees with the dated archived 64-byte blob. This is an image-to-archival-binary consistency check, not a preimage or cipher solution.

**Original-signed-message algorithm audit (six pinned archive copies).** The six historical 2014 clearsigned messages enumerated in the frozen manifest (`2014-01-final-message`, `2014-01-liber-primus-hash-block`, `2014-01-onion-welcome`, `2014-01-onion5-liber-primus`, `2014-01-opening-book-code`, and `2014-05-liber-primus-release`, all `.asc`) each has an OpenPGP `Hash: SHA1` armor header and **none contains the 128-digit AN END digest** or names SHA-512/BLAKE as its target algorithm. The `Hash: SHA1` line specifies the **PGP signature's** hashing protocol; it is not a directive to hash a future web page with SHA-1, nor can it select any 512-bit digest algorithm. This is a bounded textual inspection of six pinned archived copies, **not** authentication of their detached origin and not a universal proof that Cicada never specified an algorithm elsewhere.

The public `krisyotam/cicada3301` archive contains staged copies of historical 2014 onion-web assets. We froze this archive at commit `76d3ee8c762f60025822c8c05edbf31351636469` and selected 22 stage-specific web-page/puzzle/signature files, plus the seven evidenced 2014 onion hostnames. The exact inputs and expected archive file lengths are specified in [the frozen candidate manifest](../resources/cicada2014-archive-hash-manifest.json). The archive's stored bytes are retrievable; they are **not** independently authenticated as the original 2014 HTTP response bytes, especially for copied/reencoded archives.

## Crucial earlier work and overlap

While this smaller regression was running, [Agent 49](../communications/broadcast/20261110T0531Z_agent49_an-end-external-prior-art.md) and [Agent 2](../communications/broadcast/20261110T0535Z_agent2_existing-anend-hash-audit.md) independently surfaced a much broader earlier audit: Dukotah/cicada3301, [`liber-primus/analysis/anend_hunt/FINDINGS.md`](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/anend_hunt/FINDINGS.md) and [`repr_hashscan.py`](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/anend_hunt/repr_hashscan.py), dated August 2026. That group reports 77 historical/wikipage held blobs across approximately eleven representations with SHA-512, SHA3-512 and BLAKE2b-512 (**2,574 comparisons, zero hits**), plus **132** comparisons over three original Michel Oosterhof stage captures (**2,706 combined, zero hits**). It also reports further work on other digest families. Much of our historical input set and the central test are already covered by that study. The two finite denominators must not be added as independent discoveries or interpreted as 2,952 new distinct inputs.

**Additional separately reported, substantially larger SHA-512-only prior-art coverage.** The independent [`pnotisdev/cicada3301` status ledger](https://github.com/pnotisdev/cicada3301/blob/main/STATUS.md) reports **124,017** negative SHA-512 digest comparisons involving archived Cicada onion/site captures, with planted-file hash controls, using Wayback and Ahmia. That author reports 24 excluded, later spam-injected `845145127.com` captures (14 URLs), and does **not** claim coverage of uncaptured historical pages, altered source representations, other archive providers or alternate 512-bit algorithms. This is a **reported result from a second codebase, not independently rerun here**; its input list may overlap both our 246 tests and Dukotah's 2,706, so none of these counts may be summed. It also reinforces that calling the target *“the SHA-512 hash”* is a hypothesis, not an independently recovered algorithm specification.

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
