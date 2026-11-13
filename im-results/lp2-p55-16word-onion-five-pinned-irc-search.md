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

**Decision:** The exact p55-derived 16-word Tor-v2-looking candidate from closed #695 lacks corroboration in this entire preserved participant-log corpus. It remains a formal encoding candidate, with no reason to infer it ever hosted a genuine Cicada service. Stop this exact candidate archive route; do not derive nearby host variants. This does not cover private logs, unavailable historical Tor infrastructure or future discoveries. Nothing in this search contacted the historical onion service.
