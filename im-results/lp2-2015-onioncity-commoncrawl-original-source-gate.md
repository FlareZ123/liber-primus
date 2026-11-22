# Original 2015 Onion.City Common Crawl archive: bounded partial source-acquisition result

**Agent47, 15 November 2026. Evidence class: executed original public-archive URL-index query with successful per-collection controls and transport failures. No recovered historical page bytes, authorial key, unknown LP2 plaintext or deep-web destination.** The result is explicitly **partial**, because one of five monthly controls failed and seven target requests produced server/transport errors. The reported zero successful-query captures is a narrow observation, not a clean five-collection absence claim.

## An independently dated alternative to previous gateway checks

Onion.City exposed Tor hidden-service v2 names through public `.onion.city` hostnames starting **11 February 2015** (contemporary launch coverage: [Digital News Asia](https://www.digitalnewsasia.com/digital-economy/unpeeling-the-dark-web-with-onioncity)). The repository had earlier tested 2014 Common Crawl `.onion.to`, `.onion.link` and historical Tor2web prefixes, and separate 2014–2016 `.onion.nu` / `.onion.rip` hosts ([prior original-index result](lp2-cc2014-tor2web-archive-index-gate.md)); it had not performed the **2015 `.onion.city` source-host screen**. The actual 2014 Cicada stage11 distributor `ky2khlqdf7qdznac.onion` is known from a signed historical handoff; whether it or any earlier Cicada host led to the p56 hash-target page is unproved.

The new query fixes the **seven original 2014 Cicada v2 host IDs** before consulting the archive: `auqgnxjtvdbll3pv`, `cu343l33nqaekrnw`, `fv7lyucmeozzd5j4`, `avowyfgl5lkzfj3n`, `q4utgdi2n4m4uim5`, `ut3qtzbrvs7dtvzp`, `ky2khlqdf7qdznac`. Each is queried as `<id>.onion.city` with **`matchType=host`**, JSON URL-record output and source timestamps. Five original 2015 Common Crawl collections are explicitly fixed: `CC-MAIN-2015-11`, `-14`, `-18`, `-22`, `-27`. Each collection first requires a positive `wikipedia.org` domain control, and the public gateway `onion.city` is queried separately as a contextual calibration. Successful 404 “No captures found” responses are distinct from server/transport failures. The source script stores the original response status and exact returned records with atomically locked JSON output.

## Executed original-source result

[GitHub Actions source run 43730950543](https://github.com/FlareZ123/liber-primus/actions/runs/43730950543) executed the frozen Node22 program; the machine-readable full response list is [artifact 14169230898](https://github.com/FlareZ123/liber-primus/actions/runs/43730950543/artifacts/14169230898). **The job is marked failed by design when any index is inconclusive**, despite completing and uploading its results.

| Source collection | Wikipedia positive control | `onion.city` domain query | Target-host status |
| --- | --- | --- | --- |
| CC-MAIN-2015-11 | HTTP 200, one record | HTTP 404, zero | Seven target requests issued |
| CC-MAIN-2015-14 | **HTTP 504, zero** | HTTP 404, zero | **All seven skipped**: no positive control |
| CC-MAIN-2015-18 | HTTP 200, one | HTTP 404, zero | Seven issued |
| CC-MAIN-2015-22 | HTTP 200, one | HTTP 404, zero | Seven issued |
| CC-MAIN-2015-27 | HTTP 200, one | **HTTP 400, zero**, not a valid no-capture response | Seven issued |

The original job logged **five controls, four successful controls, 28 target-host requests, zero returned host captures and seven failed target requests**. Common Crawl's documented **`matchType=domain` matches the root and all subdomains** ([official toolkit specification](https://github.com/commoncrawl/cdx_toolkit/blob/main/README.md)). Therefore the three clean 404 gateway-domain queries in independently working collections **2015-11, 2015-18 and 2015-22** also provide a *bounded entire `.onion.city` domain-zero result* in those three index snapshots. This is stronger than seven exact host lookups and requires no assumption about the service's address, although it still says nothing about uncrawled pages or services. It ended at 15:48:58Z with exit code1 because of uncalibrated/failed requests; the JSON artifact preserves the host-specific status and error body. Thus no actual matching URL record or WARC locator was recovered from the successful requests. The seven failures and the skipped 2015-14 collection prevent a complete 35-host-comparison negative across all five collections. The clean three-domain 404 results independently cover their own three collections only. An HTTP400 for the gateway root does not adjudicate any subdomain, and a 404 does not establish historical absence beyond that index's exact lookup.

The direct reproducer is [`sims/lp2_2015_onioncity_source_cdx_sft.cjs`](../sims/lp2_2015_onioncity_source_cdx_sft.cjs) and it is a selectable, **manual-only** branch `source=2015-onioncity` of [the existing historical proxy workflow](../.github/workflows/anend-surface-proxy-commoncrawl.yml). It does not retrieve content, hash hypothetical page bytes or infer plaintext from empty indexes.

## Cryptanalytic decision

The executed gate produces **no actual continuation-page bytes or new key material**, so it does not advance a decryption. Do not repeat already successful zero-result requests simply to increase run counts. Any retry should address only the seven failed host/index lookups or uncalibrated 2015-14 collection with a demonstrably available original index, and obtain **actual exact WARC response bytes** before comparing the printed p56 hash. More promising is the separate [January–March 2015 Moore/Rid private-custody text crawl](../workplace/lp2-2015-moore-rid-tor-text-corpus-original-target-lane.md), whose original 2016 methodological annex documents a large normalized-text collection but has no public searchable corpus. A targeted custodian query or authentic new source URL could change the route. Neither archive's coverage implies that the creator's later hash target existed under the original 2014 distributor host.

**Status:** finite partial archive-index screen, no recovered original missing page, no plaintext, no authenticated cryptographic mechanism, no solved final destination.
