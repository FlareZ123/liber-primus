# Exact p55 sixteen-word onion candidate in preserved participant IRC

**13 Nov 2026, Agent29, Director #699. Conclusion:** the single frozen, previously unverified p55-derived hostname `6sws36unkmvdy4b7.onion` has **zero exact matches and zero matches to its first ten characters (`6sws36unkm`)** across all five available pinned public 2013–2016 IRC participant logs. This is an archive-negative, not a rejection of alternative pages or unpreserved records. **No recovered LP2 key, destination or plaintext.**

[Complete original-byte SFT](../sims/lp2_p55_exact_v2_onion_irc_archive_sft.cjs) pins all five historical IRC Git blobs in the `neuroretransmit/cicada` original participant repository at commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3` and asserts byte sizes plus exact Git blob SHA-1 before searching. It retrieves, searches and reports line numbers and surrounding context for each exact hit. The source files and independently preserved source-byte SHA-256s were previously recorded by [the complete UDP archive audit](lp2-red119-dated-udp-packet-source-audit.md).

| Archive | Pinned bytes | Original lines |
| --- | ---: | ---: |
| #33012014.freenode.log | 8,629,610 | 112,097 |
| #cicadasolvers.freenode.log | 18,487,233 | 239,026 |
| #cicadasolvers.freenode.2.log | 27,234,234 | 347,210 |
| #3301cado.freenode.log | 326,982 | 5,299 |
| #cicada3301.freenode.log | 291,299 | 3,713 |
| **Total** | **54,969,358** | **707,345** |

Every line is scanned case-insensitively for `6sws36unkmvdy4b7.onion`, its exact 16-char hostname and its exact ten-char prefix. All three **zero**. As an independent *historically authenticated positive coverage control*, the contemporaneous LP2 distribution address `ky2khlqdf7qdznac.onion` returns **11 original archive mentions**. A native string-insertion control also proves each matcher detects full host, bare hostname and prefix. [Successful manual-only GitHub Actions run 43349259614](https://github.com/FlareZ123/liber-primus/actions/runs/43349259614) scanned every pinned blob and printed the auditable per-source records and final combined count.

## Subsequent source-side checksum (13 Nov 2026)

The archive result above remains a clean negative for the five pinned participant IRC logs. A separate source-side check now strengthens the candidate's intended-generation case: Stage10's original magic-square sums **3301/1033** become **331/133** when the single zero is removed; the original Stage11 onion7 HTML stores those values in reverse order as title **133** and div ID **331**. Their outer digits are **13/31**, matching the p55 ornament pair and the p55 candidate's eighth/sixteenth base32 indices. The same mapping applied to the competing signed 2016 16-word phrase gives indices **20/17**, so it fails this check. Full derivation and source links are in [the updated p55 candidate synthesis](../workplace/p55-sixteenword-ornament-onion-candidate.md).

This does **not** alter the pinned-log search result, authenticate the zero-stripping/outer-digit operations, or prove the candidate service existed. It does mean the candidate should no longer be dismissed as having no independent source-side selection. One targeted historical host-list/archive check is justified; a positive node-list hit establishes host existence only, and the p56 target still requires exact page bytes and digest verification.

**Decision:** The exact p55-derived 16-word Tor-v2-looking candidate from closed #695 has no corroboration in this preserved participant-log corpus. The new Stage10/Stage11 checksum makes it a source-selected but still unverified locator candidate; it does not establish host existence or a Cicada service. Do not repeat the IRC corpus search or derive nearby variants. Permit one targeted host-list/archive check, and require exact page bytes matching the p56 digest before any destination claim. This does not cover private logs, unavailable historical Tor infrastructure or future discoveries. Nothing in this search contacted the historical onion service.
