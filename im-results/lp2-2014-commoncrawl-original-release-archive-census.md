# Original May 2014 Liber Primus release mirrors: direct Common Crawl CDXJ archive census

**13 November 2026, Agent19. Source recovery decision, not a decipherment.** The contemporaneous [Freenode original-release witness](lp2-2014-release-participant-irc-original-evidence.md) names two original May-2014 public ZIP mirrors and one Pastebin signed-text mirror, all useful potential paths to authentically different original bytes. Independent archive recovery through Common Crawl's 2014–2015 indexed WARC collections was attempted because earlier Wayback/Arquivo searches did not return those bytes.

## Exact historical targets and archive scope

Original May-2014 URLs were selected *before* any archive query:

| Original address | Historical witness | CDXJ key |
| --- | --- | --- |
| `https://shadow-code.org/onion7.zip` | 2 May 2014, 14:53 UTC, participant `cluosh` | `org,shadow-code)/onion7.zip` |
| `http://terrafant.asia/cicada/onion7.zip` | 9 May 2014, 00:56 UTC, `Nessun0` | `asia,terrafant)/cicada/onion7.zip` |
| `http://pastebin.com/5w5VC696` | 2 May 2014, 14:46 UTC, participant Pastebin original-release witness | `com,pastebin)/5w5vc696` |

Seven published collections were queried in full for these *exact three URL keys*: `CC-MAIN-2014-23`, `2014-35`, `2014-41`, `2014-49`, `2014-52`, `2015-06`, `2015-22`. No wildcarded names, guessed ZIP path variants, or retrospective target substitutions were admitted.

## Direct-source results

Common Crawl's public URL query service was intermittently unavailable in the first attempt: 0/7 positive controls returned captures and 27/28 queries failed or returned 404/503. **That first attempt is inconclusive** and must never be counted as an absence result.

A second experiment bypassed the query service entirely. It accessed the Foundation's published binary-object index through `https://data.commoncrawl.org/cc-index/collections/<collection>/indexes/cluster.idx`, performed binary search over sorted SURT keys, and retrieved each winning `cdx-xxxxx.gz` block by exact HTTP byte range. All **seven** collection index objects returned HTTP 200 and a nonzero index size. For each of the **21** source × collection combinations, the source key fell strictly between the reported neighboring sorted-cluster keys, and the corresponding 3,000-record compressed block was retrieved and decompressed successfully. The exact source URL key was absent from each. A raw-record parser correction was necessary because the raw CDXJ `urlkey` appears in the line's prefix rather than necessarily inside its JSON; the final run has correct external-key parsing and synthetic tests for that case.

**Evidence:** [passing raw-source Actions run 43382526637](https://github.com/FlareZ123/liber-primus/actions/runs/43382526637), with complete JSON artifact `original-2014-commoncrawl-raw-index` (artifact ID `14017087514`), and [self-contained runnable source](../sims/lp2_2014_commoncrawl_raw_s3_sft.cjs). Each of the 21 artifact entries provides `floor.key`, `next_key`, `certified`, source-block first and last keys, byte range and the zero exact matching-record count. Parsing and gzip positive controls pass. The initial failed API attempt is retained as [run 43380966360](https://github.com/FlareZ123/liber-primus/actions/runs/43380966360), and the independent raw transport first pass is [run 43382311168](https://github.com/FlareZ123/liber-primus/actions/runs/43382311168); only the **corrected final raw-source run** supports the exact absence assertion.

## Decision and remaining unknowns

**No capture of the three exact May-2014 URLs appears in the seven queried Common Crawl collections.** That is an accurately scoped source-archive exclusion. It does **not** establish that the URLs were never served, that no preserved ZIP/Pastebin copy survives elsewhere, that all May-2014 recipients had identical files, or that a missing key never existed. Common Crawl often excludes archives and binary downloads; the seven monthly crawls do not cover all times or years. It recovered **zero new LP2 image bytes, unknown plaintext, keys or continuation destinations**.

The intended solve path remains undocumented. Repeating the same raw-index scan without an independent new URL or actual surviving archive will not help. A future historical lead is useful if it yields byte-preserving original material with a checkable divergence from the canonical 58 Onion7 page images or signed release text. Pending that, prefer original-cipher operations with independently selected keys over further transport searches.

## How to reproduce

Run the CommonJS SFT `sims/lp2_2014_commoncrawl_raw_s3_sft.cjs --selftest` for offline parsing tests, then `sims/lp2_2014_commoncrawl_raw_s3_sft.cjs --full` to reproduce all 21 queries in Node 22. The repo's **manual-only** `.github/workflows/lp2-2014-zip-mirror-source-manual.yml` exposes the `commoncrawl-raw` source option; no per-commit workflow is enabled. The runner writes atomically to `mirror-2014-original-recovery/commoncrawl-raw-index.json` and archives it. Exact S3 source index ranges and CDX gzip block metadata are in the run artifact.

Source format: [Common Crawl Foundation CDXJ Index](https://commoncrawl.org/cdxj-index); original historical witness: [May-2014 IRC source report](lp2-2014-release-participant-irc-original-evidence.md).
