# Ahmia's 2014 original-era Tor search index as a possible missing URL witness

**Agent 3, 13 November 2026. Classification:** a new, specifically dated archival custody avenue with one original public index and one bounded public web-archive query inspected. **No Liber Primus plaintext, author key, unknown deep-web target, original 2014 response body, or matching hash was recovered.**

## Why this differs from already reviewed crawls

The solved original LP2 p56 says a page in the deep web hashes to a 128-character hexadecimal value. Its **host, page URL, original byte representation and hash algorithm are not supplied**. The seventh original Cicada onion, `ky2khlqdf7qdznac.onion`, only distributed the known Liber Primus JPEGs. A period search engine's archived URL graph could disclose this distributor or a historically linked URL, while an archived exact response body could potentially resolve p56. This is a different custodian and acquisition mechanism from academic TNO/CFLW, Portsmouth, SRI LIGHTS and KAIST crawls, and from Common Crawl's Tor2web pathway.

Ahmia's maintainer [Juha Nurmi reported on 8 September 2014](https://blog.torproject.org/ahmia-search-after-gsoc-development/) that the project had been under development since 2010 and was running during summer 2014. The 2014 implementation included a live Tor OnionBot crawler indexing fetched onion content in Apache Solr, a PostgreSQL-backed onion directory, and a scraper of site titles, descriptions and metadata. This directly supports a plausible original-period **URL/title index**. It does **not** prove that any unmodified historical HTML response bytes were retained. The crawler honored `robots.txt` and excluded some services, so absence in the index would be a limited negative.

A [20 June 2014 first-person Tor Project development report](https://archive.torproject.org/websites/lists.torproject.org/pipermail/tor-reports/2014-June/000564.html) states: *"I will look from the backups if I could show a number of hidden service websites online over time."* This independently attests to **some backups existing at the time**, without specifying their date coverage, contents, survival in 2026, or page-byte fidelity. It also notes a then-visible last-successful-HTTP-GET date per hidden service and a history statistics page.

## Public original-era file inspected

The maintainer's original [`juhanurmi/ahmia` GitHub source tree](https://github.com/juhanurmi/ahmia) includes [`ahmia/static/visuals/oniondomains.xml`](https://github.com/juhanurmi/ahmia/blob/8d8382d5a4a5214824ca8b8174461baab7912b50/ahmia/static/visuals/oniondomains.xml), last committed with the repository's 13 March 2014 first import (commit `8d8382d5a4a5214824ca8b8174461baab7912b50`). Direct original GitHub blob read on 13 November 2026 returned a **489,538-character XML file**, blob SHA-1 `23787e24310110625afdb54c346871882ec1c306`, containing **135 RDF description elements**, **6,908 `ahmia:hasExtLink` elements** and **439 distinct v2 onion host strings** extracted from host references and backlink text. These counts are descriptive of this small file, not 2014 crawl coverage.

A literal case-insensitive host search of that complete source file found none of the seven historical Cicada chain hosts: `auqgnxjtvdbll3pv`, `cu343l33nqaekrnw`, `fv7lyucmeozzd5j4`, `avowyfgl5lkzfj3n`, `q4utgdi2n4m4uim5`, `ut3qtzbrvs7dtvzp`, `ky2khlqdf7qdznac`, nor the previously discussed `eq6emgv2ehsrix6t`. **This March import predates May 2014 Stage11 distribution, so its negative cannot test the relevant later period.** The project source also contains `ahmia/static/log/onion_site_history/.gitignore`, which ignores the per-site history JSON, and `onionbot/inject.py`, which writes extracted `text`, `title` and `url` fields to Solr. These source fields do not establish HTTP-byte retention.

## Independent public 2014–2015 archive check

To avoid relying on speculation about a missing snapshot, a small and frozen external original-era archive query was executed against the [documented Arquivo.pt CDX endpoint](https://github-wiki-see.page/m/arquivo/pwa-technologies/wiki/URL-search%3A-CDX-server-API) on [Windows-independent Node 22 CI run 43529866419](https://github.com/FlareZ123/liber-primus/actions/runs/43529866419). The exact queries requested `matchType=host`, `from=2014`, `to=2015`, `output=json`, `limit=5000` for both `ahmia.fi` and `www.ahmia.fi`. An independent same-dates `www.sapo.pt` positive control used `limit=3`. The complete response status, SHA-256, byte length and selected original 2014–2015 record metadata are preserved by [the executable probe](../sims/ahmia_2014_original_index_archive_probe.cjs) and the CI artifact.

| Original-era public index query | HTTP status | Indexed responses | Response bytes |
| --- | ---: | ---: | ---: |
| `ahmia.fi` all URL paths, 2014–2015 | 200 | **0** | 0 |
| `www.ahmia.fi` all URL paths, 2014–2015 | 200 | **0** | 0 |
| Control `www.sapo.pt`, 2014–2015 | 200 | **3** (limit 3) | 1,082 |

The two empty Ahmia index responses have SHA-256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`, while the positive index responded with three records. No Ahmia URL, original HTML replay, or known Cicada-host occurrence was retrieved. This is an **archive-specific coverage null**, not proof that Ahmia lacks backups elsewhere or that the 2014 site was never live.

### Internet Archive Wayback source query is inconclusive

A separate [Wayback CDX probe](https://github.com/FlareZ123/liber-primus/actions/runs/43530382386) used the [Internet Archive's published CDX API](https://github.com/internetarchive/wayback/blob/master/wayback-cdx-server/README.md), with three 2014–2015 exact-time URL-prefix queries: a historical `example.com` positive control and `ahmia.fi/*` plus `www.ahmia.fi/*` candidates. **All three requests terminated in `TimeoutError: The operation was aborted due to timeout` after the bounded 20-second per-request limit.** The JSON result was preserved by the same source probe's `ARCHIVE_MODE=wayback` setting. Its observed zero records cannot be interpreted as an archive absence because the control also failed. This is a hard access blocker for that query endpoint in this runtime; no further retries or unrelated serialization guesses are justified.

## Discriminating next acquisition, subject to maintainer authorization

The first useful object is a **May to autumn 2014** Ahmia URL/title/date backup, indexed document export, or historical directory snapshot, if any was lawfully and publicly preserved. Query by the exact seven known host strings to calibrate period coverage, especially the known distributor. Then search any historic link/URL records for contemporaneous references to the original LP2 title, p56 hash, and Cicada signed-source identifiers. The unknown p56 target may have used an unrelated host and is not excluded by a distributor miss.

If a dated source manifest identifies candidate target URLs, recover **original HTTP response entity bytes** only from an authorized public archive; compare the exact original bytes to p56's 128-hex target under the separately stated candidate digest algorithms. Plain normalized Solr text cannot establish a 512-bit preimage, and URL-only evidence must remain an intermediate lead. Do not enumerate unsafe live services or contact the search operator without the repository maintainer's authorization.

**Decision:** establish Ahmia as an *original-period historical URL-index custodian*, distinct from previously inventoried academic datasets. The publicly inspected March 2014 XML is insufficient by date and content for the p56 search, and Arquivo.pt contains no indexed 2014–2015 Ahmia captures under the two canonical hostnames. The independent Wayback query remains unclassified because even its control timed out. Public release of later snapshots or an authorized narrow custodian metadata query is the missing input. No generic repeat crawling, hash guessing or follow-on cipher search is warranted solely from this archival fact.
