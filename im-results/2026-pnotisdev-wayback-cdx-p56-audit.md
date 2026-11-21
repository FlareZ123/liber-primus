# 2026 pnotisdev Wayback CDX audit of the LP2 p56 target

**Decision:** negative for an authenticated Cicada target capture. The index is a Wayback CDX metadata export, not a new Tor-v2 WARC corpus. It records repeated requests for the exact p56 hash as a path on an unverified domain, but every such request is 404 or 522.

## Source identity and actual coverage

Pinned source: [pnotisdev/cicada3301 commit 15200c67](https://github.com/pnotisdev/cicada3301/commit/15200c67abee106913ba01ff504c5b6e88d16cc7), authored 2026-10-24 19:42:11 UTC.

- [CDX results](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/phase52/cdx_results.json), blob SHA d7cb7122b06d55dcd83a0793879284b9aa43acc1.
- [Query script](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/phase52/cdx_query.py).
- [Raw-body fetcher](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/phase52/wb_fetch.py).
- [Phase52 archive report](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/log/phase52_an_end_archives.md).

The index has **862 query keys**, **366 with results**, **15,289 CDX rows**, and **71 distinct URL hosts**. Its overall capture range is **2008-02-13 14:05:38 UTC through 2026-10-11 19:39:32 UTC**. The source URL list contains 34 candidate 16-character onion labels; these are mixed community references, not 34 authenticated Cicada hosts. The query script additionally hard-codes candidate clearnet domains including cicada3301.org, cicada3301.com and 3301.org.

This is specifically the Internet Archive Wayback CDX endpoint, not Common Crawl or a separate WARC corpus. The exported fields are timestamp, original URL, MIME type, status code, CDX digest and payload length. The digest is the CDX SHA-1-style Base32 payload digest; it is not the p56 SHA-512 hex target. The export contains no WARC filename/offset or WARC record identifier, and no original response headers.

The raw replay convention used by the fetcher is Wayback's https://web.archive.org/web/<timestamp>id_/<original-URL>. The fetcher stores body bytes and a SHA-256 manifest in its local git-ignored work area. The committed index itself is metadata, not replay bytes.

## Exact p56 hash-path records

The target is:

36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4

It occurs exactly five times as a URL path under the exploratory domain cicada3301.org:

| CDX timestamp (UTC) | Original URL | Status | CDX digest | Length |
| --- | --- | ---: | --- | ---: |
| 2016-04-12 06:55:33 | http://cicada3301.org/[hash] | 404 | N5EFKTWT42B3XGTV65H5KYIHDSMMPH7V | 1,668 |
| 2016-07-27 08:09:57 | http://cicada3301.org:80/[hash] | 522 | 66UPRB6W6JXQQJHCC2ZGXWOFEOTIQEXD | 2,206 |
| 2016-08-29 06:49:14 | http://cicada3301.org:80/[hash] | 404 | UT3E4RPSQ5CQDYJ5FNORC3SNOO5JXP4P | 1,444 |
| 2016-09-30 14:14:08 | http://cicada3301.org:80/[hash] | 404 | UT3E4RPSQ5CQDYJ5FNORC3SNOO5JXP4P | 1,444 |
| 2017-05-09 13:45:34 | http://cicada3301.org:80/[hash] | 404 | FFC2HNEMJHL6U6LKKVVUSB7IQVZ3CBBN | 522 |

Additional truncated or split hash-fragment paths on the same domain are also 404. The exact target string is present in the URL path, not in the CDX digest field. These rows document repeated requests/probes for the hash as a URL; they do not document a successful page response.

## Host coverage and authentication boundary

The candidate onion list mixes source-backed 2013/2014 services with community-referenced or otherwise unverified labels. For the known 2014 chain addresses, the CDX records are gateway URLs (.onion.to or Tor2Web), not direct .onion server captures:

| Known service label | CDX rows | Capture span | Status counts |
| --- | ---: | --- | --- |
| auqgnxjtvdbll3pv | 75 | 2014-01-07–2018-11-23 | 200:18, 302:28, 401:5, 500:22, missing:2 |
| cu343l33nqaekrnw | 66 | 2014-01-07–2018-11-02 | 200:27, 302:18, 404:1, 500:20 |
| fv7lyucmeozzd5j4 | 73 | 2016-04-11–2022-12-09 | 200:18, 302:9, 500:45, missing:1 |
| avowyfgl5lkzfj3n | 16 | 2016-04-11–2018-11-23 | 200:13, 500:3 |
| ky2khlqdf7qdznac | 14 | 2015-05-25–2018-11-02 | 200:7, 302:7 |
| ut3qtzbrvs7dtvzp | 26 | 2016-03-05–2023-12-02 | 200:9, 302:7, 401:5, missing:5 |
| q4utgdi2n4m4uim5 | 0 | no captures | — |

The 200 statuses above are responses from gateway URLs, not direct .onion origin captures. The three direct .onion hosts in this export are not a recovered 2016 Cicada endpoint: jhiwjjlqpyawmpjx.onion is the Archive.org mirror (its captures include petabox-header.png and archive CSS); www.sms4tor3vcr2geip.onion has only 2013 captures; and lw4ipk5choakk5ze.onion has a single 2023 warc/revisit record with no status/body. No authenticated 2016 Cicada onion hostname is supplied by the signed message.

## 2016 signed message and the candidate clearnet domain

The [PGP-signed 2016 message](https://github.com/Dukotah/cicada3301/blob/7a264cb643c7e6a3076a318e82734472da37ee5d/corpus/A-primary-artifacts/pgp/messages/2016-01-liber-primus.asc) says “Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.” It gives no URL, onion hostname, domain, or service path. The exact signed text therefore supplies no host to add to the CDX query set.

The query script hard-codes cicada3301.org as one exploratory candidate domain; it is not selected by the signed message. The index also has 2016 root-page captures for that domain with HTTP 200, but the Phase52 fetcher's explicit exclusion list skips cicada3301.org/, so those root bodies were not included in the 124,017-digest body scan. Their content remains uninspected in the committed record and their association with Cicada is unverified. Do not treat them as official without an independent Cicada-signed link or other source-authenticated bridge.

## Existing body-hash result and duplication check

The Phase52 report already ran a p56 full-512 comparison over **124,017 digests from 3,739 candidate files**, with zero matches. It reports 2,009 fetched captures and 16 unique unavailable captures; the fetcher's blocked list is confined to the unrelated 845145127.com candidate, not the exact p56 hash-path requests. The 404/522 hash-path rows themselves are metadata-only failure captures and were not fetched by the status-filtered raw-body fetcher.

This means the proposed “new corpus” is not a new WARC source outside the earlier p56 lanes: it is the already committed Phase52 Wayback CDX run. The exact target hash was already tested against the fetched body corpus. The only new discriminating observation here is that the exact hash was repeatedly requested as a path on the unverified cicada3301.org domain and never returned a successful response.

## Decision

**Negative completion criterion met for authenticated Cicada sources.** No authenticated 2016 hostname, Cicada service response, or p56 page was recovered. The exact hash-path requests are 404/522; the 2016 signed message supplies no domain; the known 2014 Cicada hosts have gateway-only records; and the only direct 2013 Cicada-associated host does not establish a 2016 continuation. The unverified cicada3301.org root captures remain a possible non-authenticated lead, not a Cicada result.

The 2014 Stage1/Stage2 page recovery in task #2004 came from the contemporaneous micheloosterhof Git archive, not this CDX corpus. No new LP2 key, plaintext, cipher operation, or authenticated destination follows from this index.
