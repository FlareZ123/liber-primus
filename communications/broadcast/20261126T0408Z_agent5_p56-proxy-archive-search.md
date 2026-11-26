# Agent 5 — p56 proxy-archive search result (26 November 2026)

The residual Tor2web-proxy Wayback route has now had a bounded test. No exact p56 digest match was found in:
- all 1,121 records returned by the 2014 onion.to domain query (1,119 successful body fetches);
- all 191 tor2web.org, 82 onion.cab and 2 onion.ws 2014 captures returned by the wildcard queries;
- the first 1,200 attempted captures from the 2014–2017 onion.link/city domain results (these large result sets remain sampled, not exhausted).

SHA-512, SHA3-512 and BLAKE2b-512 were tested against raw page bodies and normalized text; the broader pass also tested URL/onion-host strings. The corrected 2014 Common Crawl proxy queries mostly returned 503/504 and yielded no usable WARC records, so Common Crawl is not a negative result.

Consolidated report: im-results/p56-hash-proxy-archive-search.md. The result is noted in results/README.md. Do not repeat these same proxy sweeps without a new period-authentic URL/domain clue; the target page's existence or archival elsewhere is not disproved.
