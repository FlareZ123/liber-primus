# An independent 2014–2015 Tor crawl route to original p56 continuation evidence

**Agent40 · 13 November 2026 · conditional original-byte route; no recovered page, digest preimage or plaintext.**

Two documented public-web-indexing pipelines are additional candidates beyond the TNO/Portsmouth/DUTA/KAIST/CNR/Archive Team custody lines already assessed. They offer a *possible URL/content witness*, not an assumption that Cicada was crawled.

## 2014 Ahmia: contemporary source confirms a live index

Juha Nurmi's firsthand 8 September 2014 Tor Project report, [*Ahmia search after GSoC development*](https://blog.torproject.org/ahmia-search-after-gsoc-development/), explicitly identifies a production **OnionBot crawler → Apache Solr crawled-content index** plus a **PostgreSQL OnionDir** recording service metadata; Solr handled full-text search via Django-Haystack. This architecture was in use in summer 2014 after the May release. The original historical implementation is [juhanurmi/ahmia](https://github.com/juhanurmi/ahmia), which documents OnionBot and the Solr endpoint. The modern [ahmia/ahmia-index](https://github.com/ahmia/ahmia-index) is Elasticsearch, so it must not be mistaken for an archival 2014 Solr snapshot.

**Actionable fork:** seek an independently accessible historical Solr/index backup or pre-2015 archived result for a *specific* Cicada URL/host. Query first for the known distributor `ky2khlqdf7qdznac.onion` as a **coverage control**, not as the presumed p56 target. A recorded 2014 link to a *different* onion page would identify an exact original page candidate. Mere OnionDir hostname metadata cannot satisfy a 128-hex digest, and full-text indexing may not retain HTTP entity bytes. No public original 2014 Solr dump or documented Cicada hit was found in this research. This is an access/coverage lead only.

## January–March 2015 Moore–Rid crawl: URL discovery possible, byte fidelity unlikely

Daniel Moore and Thomas Rid's [2016 primary study](https://doi.org/10.1080/00396338.2016.1142085) reports a January–March 2015 Tor-v2 crawl seeded with 5,615 onion addresses from Ahmia and onion.city, fetching up to 100 pages per site and around 205,000 unique page texts. More decisive is Daniel Moore's [first-person 2016 technical annex](https://ridt.co/d/moore-rid-technical-annex.pdf), §§ Data-Scraping Process: crawler results were stored in **MongoDB**, but the processing **stripped HTML, comments, JavaScript and embedded media**, translated some non-English text, and hashed the **normalized text**, deduplicating it. Thus the described *stored text* cannot serve as a p56 **original exact-byte** SHA-512-style preimage even if a host match appeared. Only a separately retained raw-response cache, or original URL/title metadata yielding an actionable target, would justify a next step.

**Decision:** neither pipeline currently authenticates LP2 plaintext, a key or digest algorithm. Do not request restricted bulk crawl data, claim a hash negative from normalization, or repeat Agent50's 2014 Common Crawl issue #786. If an independently public index/archive exposes a dated Cicada original response **or a concrete outbound URL**, preserve the capture identifier and exact raw body before any hash test. Owner-mediated external custodian contacts should be coordinated through #784 rather than initiated by agents.

Relevant current shared synthesis: [results/README.md](../../results/README.md), [p56 archival assessment](../../im-results/archive-hash-preimage.md), and [owner custody gate #784](https://github.com/FlareZ123/liber-primus/issues/784).