# p56 deep-web hash: Tor2web proxy archive search

**Result:** no exact digest match was recovered. This is a bounded, partial archive search, not evidence that the target page never existed.

## Target and method

The p56 page prints a 128-hex-character digest and instructs the reader to seek a page in the deep web. The exact target used here is:

36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4

The archive candidate was tested with SHA-512, SHA3-512 and BLAKE2b-512. Depending on the run, candidate representations included raw archived response bytes, normalized HTML/text, original proxy URL, and reconstructed onion-host URL. This search follows the direct-host Wayback work in issue #2010 and tests the residual Tor2web-proxy archive class; it does not assume the page was necessarily hosted through Tor2web.

## Results

### Wayback, 2014 wildcard proxy queries

The first search queried nine proxy domains. Three returned a bounded set of records:

| Proxy domain | CDX captures | Body checks | Exact matches |
| --- | ---: | ---: | ---: |
| tor2web.org | 191 | 191 | 0 |
| onion.cab | 82 | 82 | 0 |
| onion.ws | 2 | 2 | 0 |
| **Total** | **275** | **275** | **0** |

The onion.to wildcard query timed out; onion.link returned HTTP 503; several other domain queries timed out. The 275 successfully returned captures produced no exact match.

Reproducer and run:
- sims/p56_hash_tor2web_archive_search.cjs
- [GitHub Actions run 45749010348](https://github.com/FlareZ123/liber-primus/actions/runs/45749010348)

The combined script initially used the wrong Common Crawl cdx-api property name. That implementation defect was corrected in the repository before the separate Common Crawl retry; the corrected query is recorded below.

### Wayback, 2014–2017 domain queries

A second query used domain matching over 2014–2017:

- onion.link: 5,000 records (query limit reached)
- onion.city: 5,000 records (query limit reached)
- onion.so: 0 records
- onion.nu: HTTP 503
- onion.to: timed out

The two 5,000-record results yielded 9,992 unique records and 9,027 records with plausible text/document MIME types. The first 1,200 candidate captures were attempted; no exact match was found. This is a sample, not an exhaustive search of onion.link or onion.city, and some fetches failed.

Reproducer and run:
- sims/p56_hash_wayback_proxy_domain_retry.cjs
- [GitHub Actions run 45750104106](https://github.com/FlareZ123/liber-primus/actions/runs/45750104106)

### Wayback, targeted onion.to 2014 search

A domain-match query for onion.to returned 1,121 unique 2014 captures. The first 1,000 were checked; two fetches failed and no exact match was found. The remaining 121 were then fetched and checked separately; all 121 completed with no fetch errors and no exact match.

Together, this checks all 1,121 CDX records returned for the 2014 onion.to domain query, with 1,119 successful body fetches and no digest match.

Reproducers and runs:
- sims/p56_hash_wayback_onion_to_targeted.cjs — [run 45751932331](https://github.com/FlareZ123/liber-primus/actions/runs/45751932331)
- sims/p56_hash_wayback_onion_to_remainder.cjs — [run 45752839131](https://github.com/FlareZ123/liber-primus/actions/runs/45752839131)

### Common Crawl, 2014 indexes

The corrected query covered the nine proxy domains across the 2014 Common Crawl indexes. The index API returned HTTP 503/504 for most domain-index requests; one request returned 404. No usable WARC records were retrieved and no page bodies were hashed. This is an archive-service failure, not a negative result about the contents of Common Crawl.

Reproducer and run:
- sims/p56_hash_commoncrawl_proxy_search.cjs
- [GitHub Actions run 45749836444](https://github.com/FlareZ123/liber-primus/actions/runs/45749836444)

## Conclusion and limits

No exact match was found among the successfully checked 2014 captures from onion.to, tor2web.org, onion.cab and onion.ws, nor in the first 1,200 attempted records from the much larger 2014–2017 onion.link/city results. This materially narrows those specific proxy archives but does **not** identify the preimage, destination, hosting platform, or hash algorithm.

Coverage remains incomplete: onion.link/city were sampled; Common Crawl's index service was unavailable; some Wayback queries timed out or returned 503; other proxy domains, later capture dates, non-Tor networks, and alternative page serializations were not exhausted. Do not describe this as proof that the target page was never archived.

A future search should require a new period-authentic URL/domain clue or a more targeted capture selector. Repeating broad proxy-domain crawls without a selector is unlikely to be a productive next step.
