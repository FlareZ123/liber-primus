# Historical witness screens for the p55 sixteen-word onion candidate

**14 Nov 2026 consolidated scope.** The unverified final-page hostname `6sws36unkmvdy4b7.onion` is absent from five source-pinned public participant IRC archives (Agent29) and from both preserved original-period Ahmia 2014 onion-host inventories (Agent44). The known 2014 Cicada distributor is also absent from the Ahmia inventories, limiting their negative coverage. **No original plaintext, historical host confirmation, key or destination recovered.**

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

## Original-period Ahmia host inventories (14 Nov 2026, Agent44)

The Ahmia maintainer's [10 June 2014 directory database fixture](https://github.com/juhanurmi/ahmia/blob/7db4e805c072ff3e133aaab174815aaa1abb86d6/ahmia/fixtures/initial_data.json) is an immutable 2,759,554-byte Git blob SHA-1 `08102c19f74df5d47771dfae8f85ddd8b8b7173d` with **1,410** original-period onion hosts. The separately preserved [July-committed static host list](https://github.com/juhanurmi/ahmia/blob/2ac6896159dedb07db3c463bd43e5aa09093c777/ahmia/tests/example_addresses.html) is Git blob SHA-1 `548f8970a89ae780eb504852993261c655a9cb31`, size 1,142,829 bytes, containing **1,336** distinct hosts. That list already existed with the same host set in June; its July commit date does not imply a fresh July crawl. [Ahmia original-era source synthesis](../workplace/ahmia-2014-onion-index-original-era-recovery.md).

Agent44 fetched both complete original pinned Git blobs through the GitHub repository API and checked these exact strings by case-insensitive literal substring matching:

| Host substring | 10 June fixture | Static host list | Selection |
| --- | ---: | ---: | --- |
| `6sws36unkmvdy4b7` | **0** | **0** | Frozen p55 sixteen-word candidate |
| `3nmvm46nsg6e5lf7` | **0** | **0** | Complete-word-window control p31–32 |
| `6bjupjsnnheadah7` | **0** | **0** | Complete-word-window control p51–52 |
| `ky2khlqdf7qdznac` | **0** | **0** | Authenticated 2014 Cicada distributor; negative coverage |
| `3g2upl4pq6kufc4m` | **present** | **present** | Original-era DuckDuckGo service; positive coverage |

The three p55/window-derived strings were **not part of the prior Agent28 scan of this June fixture**. They were fixed in the original sixteen-word window report before this check. A directory absence is weak historical evidence here because both inventories also omit Cicada's authenticated distributor. The two competing full-book strings are mathematical controls, with no claimed historical provenance. A new original attributable service link or exact original HTTP response bytes would provide useful independent evidence. No Tor service, private index, or p56 hash preimage was accessed.
## Subsequent source-side checksum (13 Nov 2026)

The archive result above remains a clean negative for the five pinned participant IRC logs. A separate source-side check now strengthens the candidate's intended-generation case: Stage10's original magic-square sums **3301/1033** become **331/133** when the single zero is removed; the original Stage11 onion7 HTML stores those values in reverse order as title **133** and div ID **331**. Their outer digits are **13/31**, matching the p55 ornament pair and the p55 candidate's eighth/sixteenth base32 indices. The same mapping applied to the competing signed 2016 16-word phrase gives indices **20/17**, so it fails this check. Full derivation and source links are in [the updated p55 candidate synthesis](../workplace/p55-sixteenword-ornament-onion-candidate.md).

This does **not** alter the pinned-log search result, authenticate the zero-stripping/outer-digit operations, or prove the candidate service existed. It does mean the candidate should no longer be dismissed as having no independent source-side selection. The original-period public Ahmia directory check above found no witness; any later source-attributable positive host record would establish host existence only. The p56 target still requires exact page bytes and digest verification.

**Decision:** The frozen p55-derived Tor-v2-looking candidate from closed #695 has no witness in the checked participant IRC logs or two original-period public Ahmia directories. The Stage10/Stage11 arithmetic is still a post-selected checksum hypothesis without confirmed service existence. Retire these exact source screens and avoid tuning address variants. Require a new independently attributable contemporary service link or exact HTTP body, and exact p56 hash verification before any destination claim. These finite tests do not cover private logs, unindexed hosts, or undiscovered records.
