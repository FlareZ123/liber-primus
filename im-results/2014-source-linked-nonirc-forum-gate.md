# May–August 2014 source-linked non-IRC forum operator gate

**Current status (18 November 2026, Agent43):** A second bounded retrieval pass for the four original 2014 /x/ threads listed below recovered **no original bytes or post-faithful captures**. Direct 4plebs pages returned HTTP 403; its JSON/API endpoint and Archived.Moe exact-thread/API routes were not accessible through the available retrieval path; Wayback CDX and Archive.org lookup endpoints were inaccessible; Common Crawl's collection index was readable but its per-URL CDX endpoint was not. Exact-ID searches in public web/repository indexes produced no valid /x/ capture; a numeric hit for 14547165 was a later /biz/ item and was rejected. A surfaced January 2026 4plebs dump is referenced in a /pol/ research workflow and does not establish /x/ coverage. This is an **acquisition-limited negative**, not evidence that the missing posts contained no operator.

**Prior decision (14 November 2026, Agent 3):** A fixed five-thread inspection based on links present in the original `#cicadasolvers` IRC export and the recovered 3 May Unfiction post produced **no recoverable runnable unknown-LP2 operator, externally selected key, or >40-rune source-claimed plaintext**. This was likewise a source-access-limited negative. No original LP2 cipher test was justified, since no historical key and complete transform were supplied.

## Independently dated starting evidence

Original channel [`#cicadasolvers.freenode.log`](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/irc-logs/%23cicadasolvers.freenode.log), original Git blob `bdd277c14f94c34b5ae714cd00c238065beeed4e` (18,487,233 bytes), and the [restored Unfiction 2014 thread](https://forums.unfiction.com/forums/viewtopic.php%40p%3D1038407.html). The already established `resources/external/2014-cicadasolvers-freenode-log-corpus.md` verifies the IRC blob. The five loci selected **before looking for possible decoding outputs**:

| Distinct original thread | Contemporary link / source lines | Original-context status |
| --- | --- | --- |
| [Unfiction: CICADA 3301 2014 IS BACK](https://forums.unfiction.com/forums/viewtopic.php%40p%3D1038407.html) | Forum post **3 May 2014 05:54** by `bambusar`; follow-up **18 May 01:34**, as preserved by the restored 2017-static forum snapshot | The May 3 post names the 58 new pages, imgur gallery, exact `vFCy7T5p0O` workpad and IRC channel. The May 18 post reports **57 still encrypted**. Neither gives an unknown-page key, complete cipher operation or 40-rune plaintext. Source quote appears in search-indexed original page; full HTML direct fetch was unavailable. |
| [4chan /x/ #14547165](https://archive.4plebs.org/x/thread/14547165/) | IRC L166867, **4 May 17:20**, and L176955–56, **13 May 19:34** | Discussed whether original LP2 imagery and dots might yield a QR/matrix barcode, with mayfly/visual speculation. The [historical-symbol wiki mirror](https://uncovering-cicada.fandom.com/wiki/Symbols/Drawing/Art_of_Liber_Primus) explicitly cites this thread and gives only tentative symbolic readings. Original 4plebs page currently yields HTTP **403** to available browser; the alleged barcode has no fixed source layout, bit clock, or decoded key in the recovered discussion. |
| [4chan /x/ #14610275](https://boards.4chan.org/x/thread/14610275) | IRC L185069–70, **21 May 18:31–33** | A contemporaneous participant quotes a `holistic approach` claim and criticizes it as unsupported relative to earlier concrete ciphers. No runnable original-LP2 operation is reproduced in the quoted exchange. Original thread bytes inaccessible. |
| [4chan /x/ #14663367](https://boards.4chan.org/x/thread/14663367) | IRC L192819–34, **1 June 00:12–20** | A purported “latest” new step; IRC participants explicitly find no signature or corroborating wiki entry. `cluosh` says there is nothing signed. The original forum content is inaccessible; source context does not furnish a verified cipher key or page plaintext. |
| [4chan /x/ #14748542](https://boards.4chan.org/x/thread/14748542) | IRC L205206, **19 June 02:33** | Link itself has text “hello-again-our-search-for-intelligent”; original source inaccessible and **no contemporaneous rule/decoded runes** in the provided link. Cannot infer authenticity from the title. |


## 18 November bounded retrieval outcome

All four /x/ IDs remain **unrecovered**:

| Thread ID | Original reference | Retrieval result |
| --- | --- | --- |
| 14547165 | [4plebs /x/ thread](https://archive.4plebs.org/x/thread/14547165/) | Direct page 403; no original post bytes. The Uncovering Cicada wiki page only links the thread and offers speculative symbol readings. |
| 14610275 | [4chan /x/ thread](https://boards.4chan.org/x/thread/14610275) | Official page and archive/API routes unavailable; no post-faithful mirror found. |
| 14663367 | [4chan /x/ thread](https://boards.4chan.org/x/thread/14663367) | Official page and archive/API routes unavailable; no post-faithful mirror found. |
| 14748542 | [4chan /x/ thread](https://boards.4chan.org/x/thread/14748542) | Official page and archive/API routes unavailable; no post-faithful mirror found. |

Bounded loci checked:

- **4plebs:** exact HTML pages and documented FoolFuuka JSON route `/_/api/chan/thread/?board=x&num=<id>`; the page/API host was not accessible (403 / tool-level access failure).
- **4chan / Archived.Moe:** original thread URLs, Archived.Moe exact-thread pages and its `/_/api/chan/thread?board=x&num=<id>` route; no content returned.
- **Wayback / Archive.org:** exact-URL CDX and availability/metadata lookups could not be queried through the available browser retrieval. **No absence-of-capture claim is made.**
- **Common Crawl:** [collection index](https://index.commoncrawl.org/collinfo.json) is accessible and identifies the October 2026 collection `CC-MAIN-2026-43`; its per-URL CDX request for the exact 14547165 URL was inaccessible, so no WARC pointer or negative capture result was obtained.
- **Public repository/search indexes:** exact-ID GitHub and web searches returned no valid /x/ post mirror. The apparent `14547165` hit was a different 2019 /biz/ item and was discarded. The independent 4chansearch index returned no exact-ID content.
- **Dataset lead:** a January 2026 4plebs CSV dump is cited by a /pol/-focused research repository; it is not evidence of /x/ coverage and was not used to infer anything about these threads.

No original post text, timestamp/post-number metadata, attachments, or source hashes were recovered. No operator, key, or plaintext was available for the issue's decisive content gate. Under #1523's explicit completion fork, the bounded acquisition attempt ends here; **do not expand into generic 2014 forum trawling**. Reopen only if a new /x/-inclusive dump, source-provided export, or accessible original archive endpoint becomes available.

The original May–August 2014 IRC corpus was retrieved as a complete GitHub contents response, split into its **239,026 physical lines**, and the 70 original date-stamped forum/4chan URLs indexed. The five selections above were bounded by explicit original-period LP2 relevance. Other linked Unfiction threads (`t=40163` L205303 “huge .png”, `t=40267` L225847 “MacArthur Tunnel”, `t=38838` L209347 and `t=36953` L232465 unrelated ARGs) are visibly off-topic in adjacent IRC lines and were not promoted to candidates. The `#33012014` log and later `#cicadasolvers.freenode.2.log` contain no additional May–August forum URLs under the same source-date filter.

## Reproducible bounded decision

There is **no frozen decipherment candidate** to run against p0–55: no concrete key, inverse and original source-native orthography were provided. Testing free keys or brute-force barcode formats against the original would manufacture a mechanism absent from the sources and duplicate completed searches. The one directly readable dated May 2014 forum post supplies a **collaboration locator**, already known in `im-results/lp2-2014-may-unfiction-workpad-source-gate.md`, rather than a second live decode. The four /x/ threads remain **retrieval gaps**, not cipher negatives. A future attempt is justified only by a new /x/-inclusive dump, source-provided export, or accessible original archive endpoint; repeating the same blocked endpoints or broadening into generic forum searches is not.

**Result classification:** bounded failure to acquire a new executable original unknown-page decoder. **No authenticated unknown plaintext, creator key or hidden destination recovered.** This does not alter `results/README.md`.
