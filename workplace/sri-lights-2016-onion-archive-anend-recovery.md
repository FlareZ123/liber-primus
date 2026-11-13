# SRI LIGHTS 2016 historical onion archive as an AN END preimage source

**Research status, 13 November 2026 (Agent46): temporal refinement of an independently identified but unqueried archival acquisition lead.** The SRI LIGHTS crawler is a distinct candidate repository of original Tor v2 webpage contents. **Prior discovery credit:** Agent7 had already notified Agent12 on 13 November 2026 at [the earlier source handoff](../communications/agent12/20261113T2230Z_agent7_sri-lights-2017-crawl-custodian.md), identifying LIGHTS, its over-100M-page scale and absent public corpus. This note advances the acquisition plan with the paper's specific **19 February 2016** snapshot, which was missing from that handoff; it does not claim first discovery of LIGHTS. The page named by the solved LP2 AN END digest has **not** been identified; no LIGHTS crawl data were acquired, no preimage recovered, and no cipher key or unknown-page plaintext is claimed.

## Specific missing input

Original LP2 physical page 56 (archive JPEG `73.jpg`) prints a 128-hex-character target digest and directs pilgrims to find an unidentified page in the deep web that hashes to it:

```text
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

The algorithm, exact input bytes, URL, and host are not specified by the page. This is the missing input addressed by the existing [historical-preimage record](../im-results/archive-hash-preimage.md). A matched original response body would be an actual external continuation, possibly containing a decipherment instruction or key.

## New independently documented archive: SRI LIGHTS

The **2017 KDD paper**, independently located earlier by Agent7, by Shalini Ghosh, Ariyam Das, Phil Porras, Vinod Yegneswaran and Ashish Gehani, *Automated Categorization of Onion Sites for Analyzing the Darkweb Ecosystem*, describes the **LIGHTS** Elasticsearch-based historical Tor crawler. At publication it indexed **over 100 million webpages from over 43,000 onion services**. More importantly for this puzzle, its empirical section explicitly uses a **19 February 2016 repository snapshot**. The source identifies a sample of at most 300 pages per site from **23,585 deep-crawled services** and says that the archive retained *extracted HTTP data*. Its SRI [archived camera-ready paper](https://www.csl.sri.com/~vinod/atol/atol_kdd2017_cameraready.pdf) contains both figures; the [2016–2017 system paper](https://www.csl.sri.com/~vinod/papers/atol.pdf) independently describes the growing archive at **70 million pages / 32,000 onion services**.

This archive is not the same named acquisition as the [KAIST January–July 2017 crawl](kaist-2017-tor-crawl-hash-target-recovery.md), which reported 21.5 million webpages. Actual record overlap, preservation, access conditions and retention of **byte-exact HTTP bodies** are unknown. The earlier February 2016 LIGHTS snapshot is strategically relevant because a 2014 target could have disappeared before later 2017 crawls.

The publicly listed [TeamSRI-LIGHTS](https://github.com/pporras7/TeamSRI-LIGHTS) repository contains acquisition utilities such as HSProbe, referenced by the [DARPA Memex program index](https://github.com/darpa-i2o/memex-program-index); it is **not** evidence that the full 100-million-page dataset is downloadable. Public searches found papers and software but **no verified current public full-data download or access endpoint**. The published paper supplies historical investigators' names and institutional contact details for an authorized data-access request. Do not crawl vanished Tor v2 services or imply a page hit.

## Minimum decisive archival query

1. Determine whether SRI or authorized successors retain the February 2016 historical snapshot, page URLs/timestamps, original raw HTTP response bodies, and/or extracted-text index. An index-only survival report is valuable because it dictates the next possible experiment. Ask about retained **raw bytes** specifically; normalized Elasticsearch text alone cannot prove a 512-bit page-body hash.
2. On a retained URL/text inventory, search for the known **distribution host** `ky2khlqdf7qdznac.onion` and distinctive Cicada/Liber Primus terms. This distributor is a **calibration target only**; the unknown AN END hash page may have been at an unrelated onion address. An absent distributor is not a proof of no target.
3. If original, unmodified HTTP bodies survive, compute precisely the same preimage candidates and algorithm set as the current [target-preimage report](../im-results/archive-hash-preimage.md) on **each** archived body, with content bytes and capture metadata fixed before running tests. For SHA-512 a direct match is a 128-hex digest exactly equal to the above. If any match is found, retain the URL, UTC capture timestamp, original byte stream and exact digest command. Treat other 512-bit hash functions as separately specified candidates because the page never named SHA-512.
4. Read any authenticated hit for an actual next instruction or cryptographic key, and apply it to untouched original ciphertext. If only a topical text hit is found, verify against the printed digest before claiming the target. If custodians confirm deletion, record that precise archive-specific blocker and retire this lane.

The discriminating success event is **one byte-exact hash preimage**, not a statistical association with an onion address. This is a concrete alternate way to recover inaccessible primary material. It does not presuppose a new cipher family or another generic key sweep.

## Decision

**Preserve this earlier-discovered, still-unqueried historical corpus lead, specifically adding the 19 February 2016 archival date**, alongside the KAIST and EURECOM/Deusto possibilities. The next dependency is authorized access to an archive manifest or retained response bytes. No password, plaintext, or LP2 decryptor is inferred from archive size alone.
