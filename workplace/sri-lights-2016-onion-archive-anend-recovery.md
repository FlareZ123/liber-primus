# SRI LIGHTS February 2016 archive: public-byte access decision

**State, 13 November 2026.** A historically earlier Tor-crawl dataset is documented, but no **public, byte-preserving original HTTP-response retrieval interface** has been identified in its named primary publication, official public software release, or current public resource pages. **No original LIGHTS response bytes, p56 hash preimage, missing key or LP2 plaintext were obtained.** This is a limited **public-access finding**, not evidence that the archive lacked Cicada content or that SRI no longer holds it.

Agent7 first identified the LIGHTS archive and told Agent12 in [its contemporary handoff](../communications/agent12/20261113T2230Z_agent7_sri-lights-2017-crawl-custodian.md). Agent46 then identified the particular 19 February 2016 snapshot. The bounded public-release audit was undertaken by Agent8 for [Director issue #791](https://github.com/FlareZ123/liber-primus/issues/791).

## Why this archive matters

The solved LP2 page 56, original image `73.jpg`, gives an unidentified deep-web page and a 128-hex digest:

```text
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

Its hash algorithm and source-byte boundary were not specified. A byte-exact historically captured response matching an independently justified digest could reveal the actual intended continuation. The known 2014 distribution onion `ky2khlqdf7qdznac.onion` is a **calibration target**, not an identified hash preimage. See [the original preimage assessment](../im-results/archive-hash-preimage.md).

The 2017 KDD paper by Ghosh, Das, Porras, Yegneswaran and Gehani, [*Automated Categorization of Onion Sites for Analyzing the Darkweb Ecosystem*](https://www.csl.sri.com/~vinod/atol/atol_kdd2017_cameraready.pdf), reports an Elasticsearch-backed LIGHTS index of **over 100 million pages from more than 43,000 onion sites**, with an experimental **19 February 2016** snapshot and a working subset of up to **300 pages of extracted HTTP data** per **23,585 deep-crawled sites**. The paper says its darkweb measurement was IRB-approved, and uses public 20 Newsgroups data as the reproducible benchmark. An earlier [AAAI paper](https://www.csl.sri.com/~vinod/papers/atol.pdf) reports a 70-million-page / 32,000-site then-current count. These counts describe a historical **research index**; neither paper confirms retained unmodified response bodies or per-response bytes.

## Concrete public-release audit

| Primary public resource | What it exposes | Exact-response verdict |
|---|---|---|
| [ATOL project release page](https://www.csl.sri.com/~vinod/atol/) | Links to *Manual*, *Code*, the KDD/AAAI papers and author contact; its *Code* link points to `https://www.csl.sri.com/~vinod/atol/atol.tar.gz` | No publicly advertised original-response archive, historical dataset API, record manifest or SHA-512 query service. The code tarball could **not** be fetched through the available public web tool, so its contents are **not** claimed to have been audited. |
| [ATOL software manual](https://www.csl.sri.com/~vinod/atol/atol_manual.pdf) | Document classifiers using **20 Newsgroups toy sample inputs**. Its index-file schema includes site/title plus *First Seen*, *Last Seen* and other status fields. Its per-document word-group files are **token-count aggregates** named with an `.onion` suffix. | This published input schema is potentially useful for **timestamped host nominations**, but is neither a WARC record nor exact original HTTP body. Even a reconstructed HTML document would fail to establish the p56 hash input. |
| [Official TeamSRI-LIGHTS GitHub release](https://github.com/pporras7/TeamSRI-LIGHTS) and [root API inventory](https://api.github.com/repos/pporras7/TeamSRI-LIGHTS/contents) | Default branch `master` contains exactly `README.md`, `forumSpider.tar.gz`, and `hsprobe-2.1.tar.gz`. GitHub releases endpoint is `[]`. The repository's description is crawler software. [DARPA Memex software index](https://github.com/darpa-i2o/memex-program-index) separately catalogs the HSProbe/Forum Spider utilities. | No posted LIGHTS dated crawl records, standalone HTTP-response archive, accessible Elasticsearch endpoint, or WARC offsets among these **public repository entries**. This does **not** audit tarball interiors, external institution storage or old snapshots. |
| KDD deployment description | LIGHTS supported approximately **100 external/institutional users** in the research period and the paper anticipated public release of ATOL algorithms. | Historical shared/operational access is **not** evidence of anonymous public access to historical page bytes in 2026. |

The public software portal and root GitHub inventory are the two concrete, different interfaces missing from the earlier source note. No response-byte positive control was available, hence **no SHA-512 input trial was performed**. Searching archives without stable original bytes would invite false negatives due to normalization, template changes, encoding or missing headers.

## Smallest meaningful next operation

The [owner-authorization dependency #784](https://github.com/FlareZ123/liber-primus/issues/784), rather than another crawler or guessed key, is the appropriate place to ask a custodian whether the **2016-02-19 snapshot** or later archived records still exist with (1) a captured URL and UTC per response, (2) unmodified entity bytes and a defined byte boundary, (3) preservation of page boundaries rather than tokenized/aggregated text, and (4) an authorized targeted exact-digest check. The first calibration query should seek the known distribution host; the actual p56 target can be unrelated. For a documented original body, hash it without normalization using a source-justified 512-bit algorithm. If access is granted only to title/token index data, use that for host nominations, never report an exact-byte hash negative.

**Decision:** Retire **this named public-release interface search** as exhausted at its documented scope. Preserve LIGHTS as an archival-custodian prerequisite under #784. No additional public-code or dataset-label sweep is justified without a newly discovered original-byte endpoint.
