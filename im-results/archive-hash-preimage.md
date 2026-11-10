# Historical onion-page hash preimage: independently executed bounded regression

**Current assessment (2026-11-10):** three independently executed **bounded source-native test groups** report zero matches: **246** comparisons of 2014 stage captures and URL representations, **232** comparisons of the 58 original archived LP2 JPEG page-byte streams, and **340** comparisons of frozen 32×8 original numeric-grid byte serializations. Counts are finite operations, **not** independent preimage discoveries; historical-corpus overlap with external audits is unquantified. An early-May-2014 historical `56.bin` was demonstrated to be a derived conversion of the same printed target hex, not a captured missing page or independent hash witness. No original unknown LP2 text, key, algorithm, missing target-page bytes, or final destination recovered.

## Why this test exists

The authenticated solved LP2 page 56, AN END, specifies a 128-hex-character digest and refers to an unknown deep-web page. The reference does not identify an onion hostname, digest algorithm, or the canonical byte serialization of the page. Its 64-byte length does not identify a unique hash algorithm.

**2014 archival transcription provenance, with dependency corrected.** The source JPEG of physical LP2 p56 (combined corpus `73.jpg`) visually prints the 128-hex-character target in five lines of respective lengths **26, 25, 25, 27, 25**. Michel Oosterhof's [2014-05-11 Git commit `06f57643821f1cadf597471c2b9c813bd08d2e37`](https://github.com/micheloosterhof/cicada-2014/commit/06f57643821f1cadf597471c2b9c813bd08d2e37), metadata timestamp **21:56:12Z**, message **“page 56”**, adds **both** `stage11/ky2khlqdf7qdznac.onion/56.txt` (exactly those five literal-hex lines) **and** `56.bin` (exactly the 64 bytes `bytes.fromhex(targetHex)`) **in the same commit**. It also adds a README explaining the `xxd -r -p` conversion pattern for another numbered file; the direct relation is manifest in these two identical representations. The preceding parent commit `a9201dd469a1a514eb0d8ff8f3449dbe2e7f7462` lacks the binary Git blob. Subsequent commit `1e3e842b460848d8e9342ae47efe453e20443aee` (metadata 2014-05-11 22:09:23Z) relocates this same blob to `stage11/56.bin`. **The binary is best understood as a derivative rendering of the printed hex, not an independent retrieval of the unknown deep-web page, independent corroboration of its digest, or proof of a digest algorithm.** The SHA-1 Git blob object ID `cfd4a08cd8ffa31c8e40c5c7a544d2774ca764a4` and content SHA-256 `0911bf3c8cc3a73bbb346f82ba65daff3eb81914c4826060ac168bd0f55e267e` verify its exact byte representation; compute `b=bytes.fromhex(targetHex)`, `sha1(b'blob 64\0'+b)`, `sha256(b)`. This is historical evidence that a researcher transcribed the page by May 2014, subject to unverified Git metadata; it contributes **no independent input to a target-preimage test**. Full source lineage and cautions are recorded in [the pinned witness metadata](../resources/cicada2014-anend-binary-witness.json). Do not count `56.txt` and `56.bin` as distinct hash candidates.

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

## Direct original Onion7 page-image preimage test (executed 2026-11-10)

The independently preserved 2014 Onion7 delivery index lists exactly **58 numbered JPEG pages** (`0.jpg`–`57.jpg`), served within the historical deep web. They are a finite **source-selected** set of candidate *page bytes*, unlike guessed onion addresses. The original combined 75-image repository corpus [`resources/liber-primus/`](../resources/liber-primus/) maps these page numbers to `17.jpg`–`74.jpg`. The source images' raw original JPEG streams, **without** OCR, normalization, URL guessing or recompression, were tested against the exact full p56 target.

Executed local [reproducer](../sims/anend_original_jpeg_gate.py) on the maintainer-supplied original JPEG ZIP (SHA-256 `094f3f8bc508159bda033482706a2d9bf516c8b8a324d87d41c5ee3696c075ea`), using Python `hashlib` SHA-512, SHA3-512, BLAKE2b-512 and SHAKE256 with 64 output bytes. All four are independently distinguished on an `abc` test, and SHA-512 has its published `abc` known-answer assertion. **58 × 4 = 232 byte-exact comparisons, zero hits.** The source's LP2 page56 JPEG `73.jpg` is **389,813 bytes**, Git blob SHA-1 `afa3428764199ddf590baf0c055c8caedc079cb1`, SHA-256 `a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc`; page57 `74.jpg` is **318,076 bytes**, Git blob SHA-1 `4397143b4df5ad729b00cfd740a74994052f46d2`, SHA-256 `1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b`. The script now pins **all 58 original JPEG Git blob SHA-1 IDs** from the source's historical `06f57643821f1cadf597471c2b9c813bd08d2e37` tree and asserts a byte-exact match for each physical page, not merely dimensions or names. Independent local execution covered all 58 source ZIP byte streams and the two specifically asserted p56/p57 historical objects; the extended all-58 Git-object assertion is preserved for a repository-local rerun. The p56 and p57 Git IDs match the archived source exactly. The GitHub repository's checked-in `resources/liber-primus` source is the intended path for the reproducible script.

**Interpretation:** none of the 58 published **raw** page JPEG objects is the source of the AN END digest under these four algorithms. This **does not** exclude another file/page, arbitrary HTTP headers or rendered HTML, alternative hash functions or formats, or the lost target page. Existing external archival hash scans may overlap the image family; this is a narrowly scoped source-native regression, not 232 independently novel hypotheses. In particular the p56 JPEG contains the hash text itself; an exact self-hash match would be circular and is not expected. The correction above also establishes that `56.bin` is merely the known target digest in binary, not one of the unknown page objects.

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
