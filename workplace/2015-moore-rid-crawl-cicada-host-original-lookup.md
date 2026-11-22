# 2015 Moore–Rid Tor-v2 crawl: separate historical-address retrieval route for LP2 AN END

**13 November 2026; Agent4; exploratory source acquisition hypothesis.** This is a *distinct* 2015 capture cohort, separate from the already catalogued 2014 Owen/Savage, 2014 Spitters, 2016 DUTA, and May–June 2016 EURECOM collections. **No Cicada host hit, recovered page, raw preimage, cipher key, or manuscript plaintext has been found.** Its documented sanitization makes it a weak candidate for byte-exact p56 hash recovery, but its address index could still contain relevant historical pointers.

## Original dated witness and scope

Daniel Moore and Thomas Rid, “Cryptopolitik and the Darknet,” *Survival* 58(1) (2016), pp.7–38, DOI [10.1080/00396338.2016.1142085](https://doi.org/10.1080/00396338.2016.1142085), describes their onion-site harvest in **January–March 2015**. The contemporaneous technical annex is [Moore, “Indexing Tor Hidden Services,” originally hosted at the authors' Tor service, now mirrored as a PDF](https://ridt.co/d/moore-rid-technical-annex.pdf). Its date imprint is 2 February 2016. The source specifically states:

- Seeds were compiled from **ahmia.fi** and **onion.city**, with **5,615** unique starting onion hosts stated in the parent paper.
- The crawler visited up to **100 pages per site**, followed links to other onion domains, and ran **five weeks** using Python, Tor SOCKS, Privoxy and a persistent **MongoDB** instance.
- The annex describes **239,000 unique harvested pages across 5,205 sites**, of which 50,000 were classified. The parent paper's different page totals refer to its filtering/analysis stage; avoid treating them as directly equivalent.
- HTML was **sanitized to rendered text**: HTML tags, comments, embedded media, JavaScript and invisible text were stripped. Nontext formats, including JPEG, archives and binary, were excluded from capture. Normalized text and separately collected page titles were hashed/deduplicated. The annex does **not assert** that unmodified raw HTTP response bodies were preserved in the MongoDB store.

Exact methodological anchor: the annex's “Data-Scraping Process” and “Classiﬁcation” sections, pages 2–8, especially text around page 3, describe persisted metadata and normalization. The seed URLs include third-party proxies; their participation does not authenticate any particular original Cicada host or page.

## What would constitute an actionable original continuation

The solved p56 AN END page prints a 128-hex-character digest after its instruction that an unknown deep-web page hashes to it. The historical, signed May 2014 Stage11 host is **`ky2khlqdf7qdznac.onion`**; that is the correct *initial host lookup*, not a claim that the unknown digest-preimage page must reside at that host. A useful custodian query is therefore deliberately bounded:

1. Does the **original 2015 host/URL crawl inventory** include the exact host `ky2khlqdf7qdznac.onion`, or another URL explicitly linked from its retrieved pages? If so, request only these related historic URLs, dates, literal visible words and page title, subject to custodial restrictions.
2. **Were untouched HTTP body bytes or raw response headers archived outside the sanitized MongoDB records?** If yes, local custodian-side exact hashing could test the printed target against each actual original HTTP page body, with canonicalization variants only if historically justified. If not, no byte-exact p56 preimage test is possible on *normalized text alone*.
3. Even a source host hit is an **address lead**, not preimage validation or a solution. An absent host excludes only the indexed 2015 captured scope. No unsupported generalization to hidden/unindexed target pages.

The documented text-only sanitizer is a major negative against attributing a raw-byte preimage to this corpus. Its potential value is the historical URL/link graph, possibly allowing later archived original copies to be identified. Public searches made on 13 November 2026 did not uncover a downloadable MongoDB snapshot or public per-page URL index; the custodian remains the necessary path. Do not conflate this with **EURECOM 2016** PhantomJS full-response snapshots, which separately *did* claim to retain raw HTML/HTTP metadata and are the stronger pending source route [Agent12 broadcast](../communications/broadcast/20261113T222700Z_agent12_new-2016-raw-html-crawl-p56-source.md).

## Director decision

**Low-to-moderate conditional priority: one specific custodian query if feasible**, rather than running a speculative cipher or preimage brute force. Ask whether the raw collection still exists and whether it can be queried locally for the single literal authenticated Stage11 host or its outgoing links. If raw original response bytes survive, a genuine p56 hash-preimage test becomes possible. Otherwise retire this archive branch after its fixed URL-index check, preserving the source as a distinct 2015 coverage witness. No other dependent cryptanalysis is justified by the crawl's existence alone.
