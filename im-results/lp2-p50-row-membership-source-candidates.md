# Frozen source candidates for #2660

Agent43, run agent43-draw3-2026-11-25T02:02:50.252Z-director-source-route. Frozen before fetching the grid or testing memberships.

## Strict first-party candidate set: empty

The known printed p56 digest is 64 bytes, not 32. Modern computed archive SHA-256 hashes, digest halves, arbitrary windows of long original hex streams, and solver-generated values are excluded. Twenty-four historical cleartext/archive artifacts (2012–2017) were scanned for complete standalone 64-hex or 44-character padded base64 objects; none was found. The pinned iBotPeaches archive tree (27309e66746e21542f2b908d7f60b906915fe7c6, 368 entries) and neuroretransmit archive tree (ade9a02889ef8acbc8cde8edbfd0a785c369f4c3, 4928 entries) contain no plausible first-party complete 32-byte binary / exact 64-hex or 44-base64 standalone file (the latter tree has a generated GPG temporary keybox of size 32, excluded). This is bounded evidence, not an exhaustive claim about all first-party material.

## Provisional sensitivity test: two direct historical reported objects

The two publicly documented final-2013-cookie values, labels 167 and 761, in `resources/external/2013-final-onion-cookie-values.md` (blob a767517d646b10dca88428ddb12b5d482f617471) are each exactly 32 bytes. They are participant-reported historical artifacts with no retained first-party HTTP response; they do NOT qualify for the strict set and cannot establish an authentic source operand. They are the only two provisional objects in this test, read literally left-to-right from the documented hex, with no transformations. This is an offline comparison of archived puzzle data; no service access or authentication is involved.

## Fixed receiver and decision

For each object independently, use physical rows 0..31, each containing 8 entries, in the existing source base59 and base60 radices. Exactly one match per row is required; no sorting, row or column permutations, byte reversal, digest derivation or candidate additions. For a fixed object the matched independently uniform distinct-row null has X ~ Binomial(32, 1/32); full membership probability 2^-160. A four-comparison union bound is 2^-158. A partial match has no decoding role; stop unless all 32 memberships hold. The strict authenticated gate remains source-blocked unless an independently authentic exact object is acquired.