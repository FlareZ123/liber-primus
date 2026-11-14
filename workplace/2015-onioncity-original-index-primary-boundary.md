# 2015 OnionCity original-index route: what survives and what would yield plaintext

**Status (14 November 2026):** A contemporaneous, authenticated *index endpoint* is identified, but no dated original 2015 sitemap, full Cicada-linked URL, response entity or p56 digest preimage has been recovered. A live archival-CDX probe is **inconclusive because every positive control failed**. This is an actionable source-acquisition boundary, not a negative historical coverage claim.

## Source-selected human path

The solved LP2 p56 names a deep-web page by its 128-character hex digest without identifying the onion host (see `results/README.md`). An authentic, dated OnionCity result naming an additional Cicada deep-web page, ideally with outbound URLs or raw original HTTP body, could supply the missing author instruction/key. The previously known `ky2khlqdf7qdznac.onion` is the *JPEG distributor* and serves only as a coverage control; its bytes have never been demonstrated to match p56's target.

On **24 March 2015** Griffith explained that OnionCity had launched **11 February 2015**, used a Tor2web back end and a **Google Custom Search Engine based on Google's index** for its front end. The service cached pages unless the source prohibited caching, and said content of an offline onion service gradually disappeared from the cache within a few days. The project therefore **postdates LP2's 2014 release** and might have missed a vanished 2014 continuation altogether. [Contemporaneous interview](https://www.digitalnewsasia.com/digital-economy/unpeeling-the-dark-web-with-onioncity).

On **15 July 2015**, an answer signed **Virgil** on Tor Stack Exchange explicitly advertised `http://onion.city/sitemap.xml` as a **daily updated** list of available HTTP onion services. This is the earliest specific retrieval path for a public 2015 URL witness discovered in this bounded issue, and it is the exact original path an archive would need to preserve. [Contemporaneous pointer](https://tor.stackexchange.com/questions/3896/where-i-can-find-export-or-download-the-biggest-list-of-all-onion-addresses/3897).

Crucial limitation from the operator's **13 May 2016 first-party correspondence:** Griffith described having *previously appended accessed domains to the sitemap*, stopping because of privacy complaints, and disclaimed obtaining domains from Tor hidden-service directories. An attached follow-up explicitly promised not to append accessed domains to `/sitemap.xml`. Thus a genuine sitemap entry would at most establish a publicly listed domain accessed through the gateway; **neither successful capture of a specific page nor its historical HTTP response bytes follows from sitemap presence**. Conversely omission from such an opportunistic service directory would not exclude the p56 target. This is a stronger interpretive constraint than treating the sitemap as an exhaustive Tor crawl. [Period-original email attachment preserved by Tor](https://archive.torproject.org/websites/lists.torproject.org/pipermail/tor-project/attachments/20160513/09be4edf/attachment.html).

## One exact original-era public-capture probe

Executable read-only Node22/CommonJS probe: [`sims/lp2_onioncity_2015_sitemap_cdx_sft.cjs`](../sims/lp2_onioncity_2015_sitemap_cdx_sft.cjs). Manual-only Windows [GitHub Actions run 43531016879](https://github.com/FlareZ123/liber-primus/actions/runs/43531016879) passed as a process at **2026-11-13 23:59 UTC**, querying the *2015-11, -14, -18, -22, -27, -32, -35, -40, -48* Common Crawl CDX indexes via `https://index.commoncrawl.org/CC-MAIN-{period}-index`, `output=json`:

- Two original 2015 sitemap URL forms, the OnionCity root, the known Cicada distributor gateway and a deliberately common **`example.com/` positive control** were each queried in every index, a total of **45 exact targets**.
- All **45/45 responded HTTP 503**, an nginx “Service Temporarily Unavailable” gateway page. This includes the nine common-site positive controls. No index coverage query succeeded.
- Therefore **zero historical negatives were established**. Counts of zero output entries are purely a consequence of the failing endpoint. Do not rerun the same indexes from the same inaccessible gateway while controls remain 503, and do not mark this as proof the 2015 source was absent.

The new probe and its results are distinct from the already closed 2014 IA OnionCity WARC collection (#794 issue context), 2014 Common Crawl (#786), March/late-2014 Ahmia (#792), and the 2015 Moore–Rid text-sanitized crawl (#768).

## Decision and remaining unknown

**Best supported next opportunity:** locate a publicly preserved, individually time-stamped **2015 `onion.city/sitemap.xml` XML snapshot, or archived Google Custom Search result page** retaining original full URLs. The host `ky2khlqdf7qdznac.onion` is a *coverage probe only*, not a prerequisite for a distinct target to exist. A real source-linked URL would justify checking *public original 2014/2015 response bytes* for the precise p56 digest. Do not infer original response bytes from Google snippets, normalized HTML, a sitemap-domain listing, or today's re-used onion addresses. No direct onion crawling, private logs, owner contacts or inaccessible custody requests are licensed by this work.

**Current verdict:** historical source route clarified; no authentic unknown-page plaintext, key, new continuation URL, or final destination. Keep the index hypothesis explicitly conditional until an original dated witness is recovered or a working positive-controlled public index conclusively excludes the specified captures.
