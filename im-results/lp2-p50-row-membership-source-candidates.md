# Frozen source candidates for #2660

Agent43, run agent43-draw3-2026-11-25T02:02:50.252Z-director-source-route. Frozen before fetching the grid or testing memberships.

## Strict first-party candidate set: empty

The known printed p56 digest is 64 bytes, not 32. Modern computed archive SHA-256 hashes, digest halves, arbitrary windows of long original hex streams, and solver-generated values are excluded. Twenty-four historical cleartext/archive artifacts (2012–2017) were scanned for complete standalone 64-hex or 44-character padded base64 objects; none was found. The pinned iBotPeaches archive tree (27309e66746e21542f2b908d7f60b906915fe7c6, 368 entries) and neuroretransmit archive tree (ade9a02889ef8acbc8cde8edbfd0a785c369f4c3, 4928 entries) contain no plausible first-party complete 32-byte binary / exact 64-hex or 44-base64 standalone file (the latter tree has a generated GPG temporary keybox of size 32, excluded). This is bounded evidence, not an exhaustive claim about all first-party material.

## Provisional sensitivity test: two direct historical reported objects

The two publicly documented final-2013-cookie values, labels 167 and 761, in `resources/external/2013-final-onion-cookie-values.md` (blob a767517d646b10dca88428ddb12b5d482f617471) are each exactly 32 bytes. They are participant-reported historical artifacts with no retained first-party HTTP response; they do NOT qualify for the strict set and cannot establish an authentic source operand. They are the only two provisional objects in this test, read literally left-to-right from the documented hex, with no transformations. This is an offline comparison of archived puzzle data; no service access or authentication is involved.

## Fixed receiver and decision

For each object independently, use physical rows 0..31, each containing 8 entries, in the existing source base59 and base60 radices. Exactly one match per row is required; no sorting, row or column permutations, byte reversal, digest derivation or candidate additions. For a fixed object the matched independently uniform distinct-row null has X ~ Binomial(32, 1/32); full membership probability 2^-160. A four-comparison union bound is 2^-158. A partial match has no decoding role; stop unless all 32 memberships hold. The strict authenticated gate remains source-blocked unless an independently authentic exact object is acquired.

## Execution (after freeze commit 4d84657f77b640380d9931559b41dc472bac7fb8)

The source grid blob 2550eae357442912220e05dc51147523a61dd75a was read only after freezing the candidate list. Each radix has 32 rows of 8 distinct byte values. All tests preserve published byte order and physical row order.

| Radix | Reported object | Matches / 32 | Matched physical row indices (zero-based) | Fixed-comparison null tail |
|---|---|---:|---|---:|
| 59 | 167 | 0 | none | 1 |
| 59 | 761 | 0 | none | 1 |
| 60 | 167 | 4 | 8,18,26,31 | 0.0170632157443 |
| 60 | 761 | 1 | 14 | 0.637944710744 |

Best partial-match four-test Bonferroni bound: 0.0682528629772. The all-32 exact threshold is not approached. No selector sequence or downstream read is authorized. The result excludes these two literal reported values under the two fixed radix interpretations, not any as-yet-unidentified authentic operand. Strict first-party set remains empty. The test was executed using the repository blobs via a JavaScript tool; an equivalent standalone Node reproduction is `tools/lp2-p50-row-membership-source-gate.mjs` (commit 7a6191fb7b3faa11dbba0a6ac476b8ce7171fe59). No arbitrary digest search.

**Decision:** retire this branch under the frozen available-source test; reopen only for a specific independently sourced complete 32-byte object, without using the grid to choose it. No recovered plaintext or key.