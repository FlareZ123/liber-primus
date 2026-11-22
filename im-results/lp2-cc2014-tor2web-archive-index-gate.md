# Original July–August 2014 Common Crawl Tor2web index gate

**Decision, 14 November 2026:** The two post-release public Common Crawl collections CC-MAIN-2014-23 (9 July–2 August) and CC-MAIN-2014-35 (20 August–3 September) have working original archive indexes and period-matched positive controls. Their full sorted secondary URL indexes contain **zero captured URLs** for the 2014 Liber Primus distributor ky2khlqdf7qdznac through the tested Tor2web gateways, and zero under all tested gateway domains except **16 unrelated Tor2web project wiki** captures in July. No p56 continuation URL, original matching HTTP body, unknown-page key or plaintext was recovered. This is a URL-index-scoped result, not a negative for the missing deep-web page generally.

## Source and test

Solved physical p56 describes an unknown deep-web page identified by a 128-hex digest. The historical distributor ky2khlqdf7qdznac.onion delivered LP2 images; it is not established as the p56 hash target. A period WARC response body could have supplied the missing page bytes and instructions. The [independent 20 August 2014 Tor Stack Exchange answer](https://tor.stackexchange.com/a/3899) documented the gateway families tor2web.org, tor2web.fi, tor2web.blutmagie.de and onion.sh. This investigation also checked onion.to and onion.link.

First, the official public CDX API returned three original Wikipedia-homepage records for each 2014 collection; several narrow Tor2web queries returned 404, while some broader queries returned 504 and were therefore inconclusive. To resolve timeouts, we read the **complete original S3 ZipNum cluster.idx** for each collection and retrieved by HTTP Range only the compressed index blocks intersecting each source-selected SURT prefix. A corrected independent Wikipedia control proves the block selection, decoding and SURT normalization worked.

| Collection | cluster.idx bytes | SHA-256 of full secondary index | ZipNum blocks | Positive original index control |
|---|---:|---|---:|---|
| CC-MAIN-2014-23 | 153,902,243 | 7d50200a20c1799b8d8a8cc9bdaf8c78832a880d261ee206add28e2d39d75010 | 1,203,050 | 1,683 Wikipedia root URL records, first 20140710014759 UTC |
| CC-MAIN-2014-35 | 121,277,056 | 2c445602baf6999f0ca1800a28dbe8b3877851b903f8cd7ce761ed91f6d0dc50 | 957,042 | 1,415 Wikipedia root URL records, first 20140820044909 UTC |

The correct SURT control is org,wikipedia)/, reflecting canonical stripping of www. Two ZipNum blocks per collection were read for the control; each zero-hit Tor2web prefix required at most one predecessor block. **All searched prefix selections completed**, with no partial or truncated scans.

## Precise dated original-index outcomes

| Exact original SURT URL-key prefix | 2014-23 rows | 2014-35 rows |
|---|---:|---:|
| to,onion,ky2khlqdf7qdznac)/ | 0 | 0 |
| link,onion,ky2khlqdf7qdznac)/ | 0 | 0 |
| org,tor2web,ky2khlqdf7qdznac)/ | 0 | 0 |
| to,onion, (all *.onion.to subdomains) | 0 | 0 |
| link,onion, (all *.onion.link subdomains) | 0 | 0 |
| org,tor2web, (all *.tor2web.org subdomains) | **16** | 0 |
| fi,tor2web, (all *.tor2web.fi subdomains) | 0 | 0 |
| de,blutmagie,tor2web, (all *.tor2web.blutmagie.de subdomains) | 0 | 0 |
| sh,onion, (all *.onion.sh subdomains) | 0 | 0 |

All 16 July rows under org,tor2web, are wiki.tor2web.org project wiki articles/history/special pages dated 22–29 July 2014, not proxied Cicada onion pages. Representative original **index-level** WARC locator: HTTP 200 text/html, http://wiki.tor2web.org/index.php/Main_Page at 20140725111718 UTC; file crawl-data/CC-MAIN-2014-23/segments/1405997894250.40/warc/CC-MAIN-20140722025814-00097-ip-10-33-131-23.ec2.internal.warc.gz, offset 421799030, compressed length 7038. Representative original Wikipedia positive: http://www.wikipedia.org/ at 20140710014759, WARC file crawl-data/CC-MAIN-2014-23/segments/1404776400583.60/warc/CC-MAIN-20140707234000-00042-ip-10-180-212-248.ec2.internal.warc.gz, offset 706418032, length 11898. These are indexed locators; their WARC HTTP bodies were not downloaded or analyzed.

## Reproduction and limitations

- [Controlled original CDX program](../sims/lp2_cc2014_tor2web_warc_probe.py), [direct S3 ZipNum block program](../sims/lp2_cc2014_s3_zipnum_source_probe.py), and [manual-only workflow](../.github/workflows/lp2-cc2014-tor2web-source-manual.yml). Both programs include bounded tests and original archive URLs. There is no automatic CI trigger.
- [CDX positive-control and gateway test, run 43537804183](https://github.com/FlareZ123/liber-primus/actions/runs/43537804183). [Final original S3 secondary-index run 43538929308](https://github.com/FlareZ123/liber-primus/actions/runs/43538929308) contains full logs of each source URL-key, number of blocks, completeness, matches and example WARC metadata. Earlier S3 runs had an overly small index cap and a wrongly specified Wikipedia control; the final run supersedes them.
- The documented absence concerns only **these two archives and nine URL-key prefixes**. It does not exclude a missing 2014 service, an unknown gateway, links inside other archived public pages, access through root-domain paths, another month or private custody. No p56 hash preimage, original candidate body or original decryption key was recovered; no hash match can be claimed.

**Next research decision:** Do not repeat these exact two dated archive indexes and gateway prefixes. Pursue only a newly source-supported alternative domain/period or authentic outgoing link that could recover original bytes, with exact-byte verification if such material is found. Unknown LP2 plaintext remains unsolved.
